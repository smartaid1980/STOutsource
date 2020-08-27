package com.servtech.servcloud.app.controller.comoss;

import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.app.controller.storage.util.*;
import com.servtech.servcloud.app.model.comoss.BillNoPickUp;
import com.servtech.servcloud.app.model.storage.*;
import com.servtech.servcloud.app.model.strongLED.BillStockOutDetail;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.core.util.Util;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.lang.reflect.Type;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/comoss/storeposition")
public class ComossPositionController {
    private static final Logger LOG = LoggerFactory.getLogger(ComossPositionController.class);
    private static final String LOCK = new String();
    private static final List<String> PICKUP_LINGHT;

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    //昕鈺快速指引_推薦領料儲位API
    @RequestMapping(value = "/recommend", method = RequestMethod.GET)
    public RequestResult<?> recommend(@RequestParam("bill_no") String bill_no
            , @RequestParam("stock_out_bill_type") String stock_out_bill_type
            , @RequestParam("user_id") String user_id) {
        try {
            return ActiveJdbc.operTx(() -> {
                List<Map<String, Object>> resultList = new ArrayList<>();
                List<BillStockOutDetail> bsis = BillStockOutDetail.find("bill_no = ? and column_1 = ?", bill_no, stock_out_bill_type);
                if (bsis == null || bsis.size() == 0)
                    return RequestResult.fail("BillStockOutDetail 没有 status 为 0 的资料 原因待查..");

                bsis = BillStockOutDetail.find("status != 9 and bill_no = ? and column_1 = ?", bill_no, stock_out_bill_type);
                if (bsis != null && bsis.size() != 0) {
                    for (BillStockOutDetail bsi : bsis) {
                        Map<String, Object> map = new HashMap<>();
                        String material_id = bsi.getString("material_id");
                        String material_sub = bsi.getString("material_sub") == null ? "0000" : bsi.getString("material_sub");
                        //需求數量
                        Double quantity = bsi.get("quantity") == null ? 0.00 : bsi.getDouble("quantity");
                        //已出數量
                        Double out_qty = bsi.get("out_qty") == null ? 0.00 : bsi.getDouble("out_qty");
                        String bill_detail = bsi.getString("bill_detail");
                        String stock_out_detail_bill_type = bsi.getString("column_2");

//                        String column_1 = bsi.get("column_1") == null || bsi.getString("column_1").equals("")? "" : "|" + bsi.getString("column_1");
//                        String column_2 = bsi.get("column_2") == null || bsi.getString("column_2").equals("") ? "" : "|" + bsi.getString("column_2");
//                        String thing_reversed = bill_no + column_1 + column_2;
//                        //已出數量
//                        String sql = String.format("select sum(t.thing_pcs) as total_thing_pcs from a_storage_thing as t LEFT JOIN a_storage_material_thing as mt ON t.thing_id = mt.thing_id WHERE t.thing_reversed = '%s' and mt.material_id = '%s' group by t.thing_reversed", thing_reversed, material_id);
//                        LOG.info("sql : " + sql);
//
//                        List<Map> thingList = Base.findAll(sql);
//                        if (thingList != null && thingList.size() != 0) {
//
//                            out_qty = thingList.get(0) == null ? 0.0 : Double.valueOf(thingList.get(0).get("total_thing_pcs").toString());
//                            if (out_qty == null) {
//                                out_qty = 0.0;
//                            }
//                        }

                        if (out_qty >= quantity)
                            continue;

                        material_sub = bsi.getString("material_sub") == null ? "0000" : bsi.getString("material_sub");

                        Double need_qty = quantity - out_qty;
                        boolean isEnough = false;

                        map.put("bill_detail", bill_detail);
                        map.put("stock_out_detail_bill_type", stock_out_detail_bill_type);
                        map.put("material_id", material_id);
                        map.put("material_sub", material_sub);
                        map.put("quantity", quantity);
                        map.put("out_qty", out_qty);

                        List<MaterialThing> mts = MaterialThing.find("material_id = ? order by create_time", material_id);
                        if (mts != null && mts.size() != 0) {
                            StringBuffer sb = new StringBuffer();
                            sb.append("(");
                            for (int i = 0; i < mts.size(); i++) {
                                String thing_id = mts.get(i).getString("thing_id");
                                sb.append("\'" + thing_id + "\'");
                                if (i != mts.size() - 1)
                                    sb.append(",");
                            }
                            sb.append(")");

                            String sql = "SELECT a.* FROM \n" +
                                    "(SELECT s.* FROM \n" +
                                    "(SELECT stm.*,mt.create_time as mt_create_time FROM a_storage_store_thing_map stm LEFT JOIN a_storage_material_thing mt on stm.thing_id = mt.thing_id) as s\n" +
                                    " WHERE s.thing_id IN " + sb.toString() + " order by s.store_id ,s.grid_index , s.cell_start_index) as a  \n" +
                                    "order by a.mt_create_time , a.thing_pcs";
                            System.out.println("sql : " + sql);

                            List<Map> stms = Base.findAll(sql);

                            List<Map> position_info_list = new ArrayList<>();

                            if (stms != null && stms.size() != 0) {
                                Set<String> positionList = new HashSet<>();
                                Map position_info;
                                List<Map<String, Object>> thing_ids;
//                                String prePositionId = null;
                                double qty = 0;
                                for (Map stm : stms) {
                                    position_info = null;
                                    thing_ids = null;
                                    String thing_id = stm.get("thing_id").toString();
                                    String store_id = stm.get("store_id").toString();
                                    String grid_index = stm.get("grid_index").toString();
                                    String cell_start_index = stm.get("cell_start_index").toString();
                                    String position_id = StorePosition.findFirst("store_id = ? and store_grid_index = ? and store_cell_index = ?", store_id, grid_index, cell_start_index).getString("position_id");
                                    System.out.println("thing_id: " + thing_id + "| position_id:" + position_id);
                                    for (int i = 0; i < position_info_list.size(); i++) {
                                        if (!position_info_list.get(i).get("position_id").toString().equals(position_id)) {
                                            continue;
                                        }
                                        position_info = position_info_list.get(i);
                                        thing_ids = (List<Map<String, Object>>) position_info.get("thing_ids");
                                        position_info_list.remove(i);
                                        break;
                                    }

                                    if (position_info == null)
                                        position_info = new HashMap();
                                    if (thing_ids == null)
                                        thing_ids = new ArrayList<>();

                                    double total_pcs = Double.valueOf(stm.get("thing_pcs").toString());
                                    if (total_pcs == 0)
                                        continue;
                                    Map<String, Object> thing_info = new HashMap<>();
                                    thing_info.put("thing_id", thing_id);
                                    thing_info.put("quantity", qty + total_pcs >= need_qty ? need_qty - qty : total_pcs);
                                    thing_ids.add(thing_info);

                                    position_info.put("position_id", position_id);
                                    position_info.put("thing_ids", thing_ids);
                                    position_info_list.add(position_info);
                                    System.out.println("qty : " + qty + "| need_qty : " + need_qty);
                                    qty += total_pcs;
                                    if (qty >= need_qty) {
                                        isEnough = true;
                                        break;
                                    } else {
                                        if (qty < need_qty && total_pcs != 0) {
                                            positionList.add(position_id);
                                        }
                                    }
                                }

                                map.put("position_info", position_info_list);

                                if (!isEnough) {
                                    if (qty < need_qty) {
                                        map.put("recommend_fail", positionList.toString() + "(数量不足，总数量: " + qty + ")");
                                    } else {
                                        map.put("recommend_fail", positionList.toString());
                                    }
                                    map.put("recommend_fail", positionList.toString() + "(数量不足，总数量: " + qty + ")");
                                }
                            } else {
                                map.put("recommend_fail", "目前无库存");
                            }
                        } else {
                            map.put("recommend_fail", "目前无库存");
                        }
                        if (map.get("recommend_fail") == null)
                            map.put("recommend_fail", "");
                        if (map.get("position_info") == null)
                            map.put("position_info", new ArrayList<>());
                        resultList.add(map);
                    }
                }
                insertBillNoPickUp(resultList, user_id, bill_no, stock_out_bill_type);
                return RequestResult.success(resultList);
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return RequestResult.fail(e.getMessage());
        }
    }

    private void insertBillNoPickUp(List<Map<String, Object>> mapList, String user_id, String bill_no, String stock_out_bill_type) throws RuntimeException {
        String bill_detail_no = bill_no + stock_out_bill_type;
//        BillNoPickUp billNoPickUp = BillNoPickUp.findFirst("bill_detail_no = ? and sender_key = ?", bill_detail_no , user_id);
        //取得閒置燈號 如果沒有代表目前滿線 不能撿料
        Optional<String> pickupLight = getPickupLight(bill_detail_no, user_id);
        if (!pickupLight.isPresent()) throw new RuntimeException("捡料线程已满...请稍后再试");
        //拿可以用的燈號
        String lightCode = pickupLight.get();

        BillNoPickUp.delete("bill_detail_no = ? and sender_key = ?", bill_detail_no, user_id);
        Date now = new Date();
        for (Map<String, Object> map : mapList) {
            List<Map> position_info_list = (List<Map>) map.get("position_info");
            if (position_info_list == null || position_info_list.size() == 0)
                continue;
            Set<String> checkPosition = new HashSet<>();
            for (Map positionInfo : position_info_list) {
                String position_id = positionInfo.get("position_id").toString();
                if (checkPosition.contains(position_id))
                    continue;
                checkPosition.add(position_id);
                BillNoPickUp newBillNoPickUp = new BillNoPickUp();
                newBillNoPickUp.set("bill_detail_no", bill_detail_no);
                newBillNoPickUp.set("sender_key", user_id);
                newBillNoPickUp.set("position_id", position_id);
                newBillNoPickUp.set("pickup_color", lightCode);
                newBillNoPickUp.set("create_by", user_id);
                newBillNoPickUp.set("create_time", now);
                newBillNoPickUp.set("modify_by", user_id);
                newBillNoPickUp.set("modify_time", now);
                if(!newBillNoPickUp.insert())
                    throw new RuntimeException("燈號綁定失敗..");
            }
        }
    }

    public Optional<String> getPickupLight(String bill_detail_no, String senderKey) {
        StringJoiner stringJoiner = new StringJoiner(",", "(", ")");
        PICKUP_LINGHT.forEach(color -> {
            stringJoiner.add("'" + color + "'");
        });
        //因為有可能裝置 重新撿料， 所以再查一次 如果有的話直接回傳 那個燈號代碼
        BillNoPickUp pickupWork = BillNoPickUp.findFirst("bill_detail_no = ? and sender_key = ?", bill_detail_no, senderKey);
        if (pickupWork != null) return Optional.of(pickupWork.getString("pickup_color"));

        //沒有的話 取得閒置燈號
        List<BillNoPickUp> pickups = BillNoPickUp.find("pickup_color IN " + stringJoiner.toString());
        if (pickups.size() == 0) {
            return Optional.of(PICKUP_LINGHT.get(0));
        } else if (pickups.size() == PICKUP_LINGHT.size()) {
            return Optional.empty();
        } else {
            Optional<String> idleColor = null;
            List<String> usageColor = pickups.stream()
                    .map(pickup -> pickup.getString("pickup_color"))
                    .collect(Collectors.toList());
            for (String color : PICKUP_LINGHT) {
                if (!usageColor.contains(color)) {
                    idleColor = Optional.of(color);
                    break;
                }
            }
            return idleColor;
        }
    }

    //昕鈺快速指引_領料API_更新DB
    @RequestMapping(value = "/pickUpThingUpdateDB", method = RequestMethod.PUT)
    public RequestResult<?> pickUpThing(@RequestBody final Map data) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                try {
                    Base.openTransaction();
                    boolean isAllSuccess = false;
                    String errorMsg = "";
                    String thing_id = data.get("thing_id").toString();
                    String bill_no = data.get("bill_no").toString();
                    String stock_out_bill_type = data.get("stock_out_bill_type") == null ? "" : "|" + data.get("stock_out_bill_type").toString(); //昕鈺才有製令單別(stock_out_bill_type)
                    String stock_out_detail_bill_type = data.get("stock_out_detail_bill_type") == null ? "" : "|" + data.get("stock_out_detail_bill_type").toString(); //昕鈺才有領料單別(stock_out_detail_bill_type)
                    double thing_pcs = Double.valueOf(data.get("thing_pcs").toString());
                    String new_thing_id = data.get("new_thing_id").toString();

                    //原條碼(thing_profile)+ '|' +原條碼id(thing_id)
                    Thing thing = Thing.findFirst("thing_id = ? ", thing_id);
                    String old_thing_profile = "";
                    if (thing != null) {
                        old_thing_profile = thing.getString("thing_profile");
                    }

                    String new_thing_profile;
                    if (old_thing_profile == null || old_thing_profile.equals("")) {
                        new_thing_profile = thing_id;
                    } else {
                        new_thing_profile = old_thing_profile + "|" + thing_id;
                    }

                    LOG.info("Create new thing_id : " + new_thing_id);
                    LOG.info("Create new thing_profile : " + new_thing_profile);

                    StoreThingMap stm = StoreThingMap.findFirst("thing_id = ?", thing_id);
                    if (stm != null) {
                        String store_id = stm.getString("store_id");
                        String grid_index = stm.getString("grid_index");
                        String cell_start_index = stm.getString("cell_start_index");

                        //利用position_id 更新儲位物料數量
                        String position_id = StorePosition.findFirst("store_id = ? and store_grid_index = ? and store_cell_index = ?", store_id, grid_index, cell_start_index).getString("position_id");
                        StorePosition storePosition = StorePosition.findFirst("position_id = ? ", position_id);

                        double new_thing_pcs = (stm.getInteger("thing_pcs") - thing_pcs) < 0 ? 0 : (stm.getInteger("thing_pcs") - thing_pcs);
                        int count;
                        if (new_thing_pcs == 0) {
                            count = StoreThingMap.delete("store_id = ? and grid_index = ? and cell_start_index = ? and thing_id = ?",
                                    storePosition.getString("store_id"),
                                    storePosition.getString("store_grid_index"),
                                    storePosition.getString("store_cell_index"),
                                    thing_id);
                        } else {
                            count = StoreThingMap.update("thing_pcs = ? , modify_time = ?", "store_id = ? and grid_index = ? and cell_start_index = ? and thing_id = ?",
                                    new_thing_pcs,
                                    new Date(),
                                    storePosition.getString("store_id"),
                                    storePosition.getString("store_grid_index"),
                                    storePosition.getString("store_cell_index"),
                                    thing_id);
                        }

                        if (count == 1) {
                            LOG.info("Success : " + "更新 或 刪除 StoreThingMap thing_pcs 成功..");

                            //利用thing_id 更新物料數量 ，與新增 新thing_id , thing_pcs , thing_profile
                            Thing createThing = new Thing();
                            createThing.setId(new_thing_id);
                            createThing.set("thing_profile", new_thing_profile);
                            createThing.set("thing_pcs", thing_pcs);
                            createThing.set("thing_reversed", bill_no + stock_out_bill_type + stock_out_detail_bill_type);   //昕鈺才有製令單別(stock_out_bill_type)與領料單別(stock_out_detail_bill_type)
                            createThing.set("thing_cell", thing.get("thing_cell"));
                            createThing.set("thing_unit", thing.get("thing_unit"));
                            createThing.set("create_by", thing.get("create_by"));
                            createThing.set("create_time", thing.get("create_time"));
                            createThing.set("modify_by", thing.get("modify_by"));
                            createThing.set("modify_time", thing.get("modify_time"));

                            if (createThing.insert()) {
                                LOG.info("Success : " + "新增 Thing 成功..");

                                double last_thing_pcs = (thing.getInteger("thing_pcs") - thing_pcs) < 0 ? 0 : (thing.getInteger("thing_pcs") - thing_pcs);
                                thing.set("thing_pcs", last_thing_pcs);
                                if (thing.saveIt()) {
                                    LOG.info("Success : " + "更新 Thing thing_pcs 成功..");

                                    //code_no=Auto Increment , is_new=0 , In_stock=20 ,其他欄位與原條碼相同
                                    MaterialThing materialThing = MaterialThing.findFirst("thing_id = ? ", thing_id);
                                    List<MaterialThing> code_no_list = MaterialThing.findBySQL("select code_no from a_storage_material_thing where material_id = ? and material_sub = ? and bill_from = ? order by code_no desc"
                                            , materialThing.get("material_id"), materialThing.get("material_sub"), materialThing.get("bill_from"));
                                    int code_no = 0;
                                    if (code_no_list != null && code_no_list.size() != 0) {
                                        code_no = code_no_list.get(0).getInteger("code_no") == null ? 0 : code_no_list.get(0).getInteger("code_no");
                                        code_no = code_no + 1;
                                    }
                                    MaterialThing createMaterialThing = new MaterialThing();
                                    createMaterialThing.setId(new_thing_id);
                                    createMaterialThing.set("material_id", materialThing.get("material_id"));
                                    createMaterialThing.set("material_sub", materialThing.get("material_sub"));
                                    createMaterialThing.set("remark", materialThing.get("remark"));
                                    createMaterialThing.set("bill_from", materialThing.get("bill_from"));
                                    createMaterialThing.set("bill_detail", materialThing.get("bill_detail"));
                                    createMaterialThing.set("column1", materialThing.get("column1"));
                                    createMaterialThing.set("column2", materialThing.get("column2"));
                                    createMaterialThing.set("column3", materialThing.get("column3"));
                                    createMaterialThing.set("delivery_date", materialThing.get("delivery_date"));
                                    createMaterialThing.set("exp_date", materialThing.get("exp_date"));
                                    createMaterialThing.set("status", materialThing.get("status"));
                                    createMaterialThing.set("create_by", materialThing.get("create_by"));
                                    createMaterialThing.set("create_time", materialThing.get("create_time"));
                                    createMaterialThing.set("modify_by", materialThing.get("modify_by"));
                                    createMaterialThing.set("modify_time", materialThing.get("modify_time"));
                                    createMaterialThing.set("is_new", "0");
                                    createMaterialThing.set("in_stock", "20");
                                    createMaterialThing.set("code_no", code_no);

                                    if (createMaterialThing.insert()) {
                                        LOG.info("Success : " + "新增 MaterialThing 成功..");
                                        System.out.println("last_thing_pcs_0 : " + last_thing_pcs);
                                        // 如果 (thing_pcs - 出庫數量 <= 0) thing_pcs = 0; 若 thing_pcs = 0 ,則a_material_thing.in_stock =99
                                        if (last_thing_pcs == 0) {
                                            System.out.println("last_thing_pcs_1 : " + last_thing_pcs);
                                            MaterialThing mt = MaterialThing.findFirst("thing_id = ?", thing_id);
                                            mt.set("in_stock", "99");
                                            if (mt.saveIt()) {
                                                isAllSuccess = true;
                                                LOG.info("Success : " + "更新 MaterialThing in_stock = 99 成功..");
                                            } else {
                                                errorMsg = "Error : " + "更新 MaterialThing in_stock = 99 失败，原因待查..";
                                                LOG.info(errorMsg);
                                            }
                                        } else {
                                            isAllSuccess = true;
                                            LOG.info("Success : " + "MaterialThing 庫存不為0..不需更新狀態");
                                        }
                                    } else {
                                        errorMsg = "Error : " + "新增 MaterialThing 失败，原因待查..";
                                        LOG.info(errorMsg);
                                    }
                                } else {
                                    errorMsg = "Error : " + "更新 Thing thing_pcs 失败，原因待查..";
                                    LOG.info(errorMsg);
                                }
                            } else {
                                errorMsg = "Error : " + "新增 Thing 失败，原因待查..";
                                LOG.info(errorMsg);
                            }
                        } else {
                            errorMsg = "Error : " + "更新 StoreThingMap thing_pcs失败，原因待查..";
                            LOG.info(errorMsg);
                        }

                        if (isAllSuccess) {
                            checkAndUpdateDetailAndMainStatus(data);

                            try {
                                // insert log
                                String logId = request.getHeader("tablet");
                                String uuid = request.getHeader("authKey");
                                String token = Hashing.md5().hashString(logId + uuid, Charsets.UTF_8).toString();
                                System.out.println("token : " + token);
                                Sender sender = Sender.findFirst("sender_key=? AND sender_token = ? AND sender_enabled=? ORDER BY modify_time",
                                        logId, token, "Y");
                                if (sender == null) {
                                    return RequestResult.fail("找不到 sender_enabled=Y 且匹配 " + logId + " 的 sender_id.");
                                }

                                long timeMillis = Calendar.getInstance().getTimeInMillis();
                                java.sql.Timestamp timestamp = new java.sql.Timestamp(timeMillis);
                                Map<String, Object> logObj = new HashMap<>();
                                logObj.put("log_id", logId);
                                logObj.put("log_time", timestamp);
                                logObj.put("store_id", stm.get("store_id"));
                                logObj.put("store_grid_index", stm.get("grid_index"));
                                logObj.put("store_cell_index", stm.get("cell_start_index"));
                                logObj.put("user_id", "");
                                logObj.put("thing_id", thing_id);
                                logObj.put("sender_id", sender.getString("sender_id"));
                                logObj.put("log_type", 2); // 1 進 2 出
                                logObj.put("log_count", data.get("thing_pcs"));
                                RecordAfter.putCreateAndModify(logObj, logId, timeMillis);

                                if (new Log().fromMap(logObj).insert()) {
                                    Base.commitTransaction();
                                    return RequestResult.success();
                                } else {
                                    return RequestResult.fail("新增 a_storage_log 失敗，原因待查...");
                                }
                            } catch (Exception e) {
                                e.printStackTrace();
                                return RequestResult.fail("新增 a_storage_log 失敗，原因待查...");
                            }
                        } else {
                            throw new RuntimeException();
                        }
                    } else {
                        return RequestResult.fail("StoreThingMap 中找不到此 thing_id: " + thing_id);
                    }

                } catch (Exception e) {
                    Base.rollbackTransaction();
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    System.out.println("Error : " + sw.toString());
                    throw new RuntimeException();
//                    return RequestResult.fail(e.getMessage());
                }
            });
        }
    }

    private void checkAndUpdateDetailAndMainStatus(Map data) {
        String bill_no = data.get("bill_no").toString();
        String bill_detail = data.get("bill_detail") == null ? "" : data.get("bill_detail").toString();
        String material_id = data.get("material_id") == null ? "" : data.get("material_id").toString();
        String stock_out_bill_type = data.get("stock_out_bill_type") == null ? "" : data.get("stock_out_bill_type").toString(); //昕鈺才有製令單別(stock_out_bill_type)
        String stock_out_detail_bill_type = data.get("stock_out_detail_bill_type") == null ? "" : data.get("stock_out_detail_bill_type").toString(); //昕鈺才有領料單別(stock_out_detail_bill_type)
        double thing_pcs = Double.valueOf(data.get("thing_pcs").toString());
        BillStockOutDetail billStockOutDetail = BillStockOutDetail.findFirst("bill_no = ? and bill_detail = ? and material_id = ? and column_1 = ? and column_2 = ?", bill_no, bill_detail, material_id, stock_out_bill_type, stock_out_detail_bill_type);
        Double quantity = billStockOutDetail.get("quantity") == null ? 0.0 : billStockOutDetail.getDouble("quantity");
        Double out_qty = billStockOutDetail.get("out_qty") == null ? 0.0 : billStockOutDetail.getDouble("out_qty");
        double new_out_qty = out_qty + thing_pcs;

        if (new_out_qty < quantity) {
            int updateCount = BillStockOutDetail.update("out_qty = ?, status = 1"
                    , "bill_no = ? and bill_detail = ? and material_id = ? and column_1 = ? and column_2 = ?"
                    , new_out_qty, bill_no, bill_detail, material_id, stock_out_bill_type, stock_out_detail_bill_type);
            if (updateCount != 1)
                throw new RuntimeException("update BillStockOutDetail.out_qty fail..");
            return;
        }
        int updateCount = BillStockOutDetail.update("out_qty = ?, status = 9"
                , "bill_no = ? and bill_detail = ? and material_id = ? and column_1 = ? and column_2 = ?"
                , new_out_qty, bill_no, bill_detail, material_id, stock_out_bill_type, stock_out_detail_bill_type);
        if (updateCount != 1)
            throw new RuntimeException("update BillStockOutDetail.out_qty.status fail..");
//        String ware_id = data.get("ware_id").toString();
//        List<BillStockOutDetail> billStockOutDetailList = BillStockOutDetail.find("bill_no = ? and ware_id = ? and column_1 = ? and status != 9",bill_no, ware_id, stock_out_bill_type);
        List<BillStockOutDetail> billStockOutDetailList = BillStockOutDetail.find("bill_no = ? and column_1 = ? and status != 9", bill_no, stock_out_bill_type);

        if (billStockOutDetailList == null || billStockOutDetailList.size() == 0) {
            updateCount = BillStockOutMain.update("status = 9", "bill_no = ? and column_1 = ?", bill_no, stock_out_bill_type);
            if (updateCount != 1)
                throw new RuntimeException("update BillStockOutMain.status fail..");
        }
    }

    static {
        Set<String> pickSet = new HashSet<>();
        String custParamPath = System.getProperty(SysPropKey.CUST_PARAM_PATH);
        File pickupJsonFile = new File(custParamPath, "pickup_light.json");
        if (!pickupJsonFile.exists()) {
            pickSet.add("R");
            PICKUP_LINGHT = new ArrayList<>(pickSet);
        } else {
            try {
                List<Map> listMap = new Gson().fromJson(new FileReader(pickupJsonFile), List.class);
                listMap.forEach(map -> pickSet.add(map.get("color").toString()));
            } catch (FileNotFoundException e) {
                pickSet.add("R");
            }
            PICKUP_LINGHT = new ArrayList<>(pickSet);
        }
    }
}

