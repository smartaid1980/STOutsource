package com.servtech.servcloud.app.controller.storage;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.app.controller.storage.util.*;
import com.servtech.servcloud.app.model.storage.*;
import com.servtech.servcloud.app.model.strongLED.BillStockOutDetail;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Cookie;
import com.servtech.servcloud.core.util.Language;
import com.servtech.servcloud.core.util.Util;
import org.javalite.activejdbc.Base;
import org.javalite.activejdbc.Model;
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

@RestController
@RequestMapping("/storage/storeposition")
public class StorePositionController {

    private static final Logger LOG = LoggerFactory.getLogger(StorePositionController.class);

    private static final RuleEnum RULE = RuleEnum.STORE_POSITION;
    private static final RuleEnum THINGRULE = RuleEnum.MATERIALTHING;
    private static final String LOCK = new String();

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                String last = "";
                StorePosition storePosition = StorePosition.findFirst("ORDER BY position_id Desc");
                if (storePosition == null) {
                    last = RuleEnum.getSeq(RULE, 0);
                } else {
                    int seq = Integer.parseInt(storePosition.getString("position_id").substring(1));
                    last = RuleEnum.getSeq(RULE, seq);
                }
                data.put("position_id", last);
                RecordAfter.putCreateAndModify(data, login_user, System.currentTimeMillis());
                storePosition = new StorePosition().fromMap(data);
                if (storePosition.insert()) {
                    return RequestResult.success(last);
                } else {
                    return RequestResult.fail(last);
                }
            });
        }
    }


    @RequestMapping(value = "/qrcode", method = RequestMethod.GET)
    public void genQRCodeDoc(@RequestParam("position_id[]") String[] ids, @RequestParam(required = false) String[] org_ids, @RequestParam(required = false) String[] paths, @RequestParam("size") String size, @RequestParam("showPath") String showPath) {

        ActiveJdbc.operTx(() -> {

            String langTag = Cookie.get(request, "lang");
            StringJoiner stringJoiner = new StringJoiner(",");
            for (String id : ids) {
                stringJoiner.add("?");
            }
            List<StorePosition> storePositionUnSortList = StorePosition.find("position_id IN (" + stringJoiner.toString() + ")", ids);

            List<StorePosition> storePositionList = sortStorePositionList(storePositionUnSortList, ids);
            //step
            QRCodeImpl QRCode = null;
            switch (size) {
                case "S":
                    QRCode = new SQRCode();
                    break;
                case "Std":
                    QRCode = new QRCodeImpl();
                    break;
                case "XL":
                    QRCode = new XLQRCode();
                    break;
                default:
                    QRCode = new QRCodeImpl();
            }

            QRCode.genDoc(storePositionList.size());
            for (int i = 0; i < storePositionList.size(); i++) {

                StorePosition storePosition = storePositionList.get(i);
                Map<String, String> jsonObj = new HashMap<>();
                jsonObj.put("id", storePosition.getString("position_id"));
                jsonObj.put("name", storePosition.getString("position_name"));
                jsonObj.put("store_id", storePosition.getString("store_id"));
                jsonObj.put("grid_index", storePosition.getString("store_grid_index"));
                jsonObj.put("cell_index", storePosition.getString("store_cell_index"));
                QRCode.addImg(i, new Gson().toJson(jsonObj));
                if (paths != null && paths.length > 0 && org_ids != null && org_ids.length > 0) {
//                    QRCode.addTexts("储位：");
                    QRCode.addDiffSizeTexts("big", org_ids[i]);
                    if (showPath.equals("true")) {
                        QRCode.addDiffSizeTexts("small", Language.get(langTag, "i18n_ServCloud_Hierarchical_Structure") + ": ");
                        QRCode.addDiffSizeTexts("small", paths[i]);
//                        QRCode.addDiffSizeTexts("small",paths[i].substring(paths[i].indexOf("z")));
                    }
                } else {
                    QRCode.addDiffSizeTexts("big", storePosition.getString("position_name"));
                }
                QRCode.next();
            }
            QRCode.write(response);
            QRCode.delete();
            return null;
        });

    }

    private List<StorePosition> sortStorePositionList(List<StorePosition> storePositionUnSortList, String[] ids) {
        List<StorePosition> result = new ArrayList<>();
        for (String id : ids) {
            for (StorePosition storePosition : storePositionUnSortList) {
                if (storePosition.getString("position_id").equals(id)) {
                    result.add(storePosition);
                }
            }
        }
        return result;
    }

    @RequestMapping(value = "/autoinsert", method = RequestMethod.POST)
    public RequestResult<?> autoInsert(@RequestBody final Map data) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                String suffixName = "%s_%s_%s";
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                java.sql.Timestamp timestamp = new java.sql.Timestamp(System.currentTimeMillis());
                int seq = 0;
                String last = "";
                List<String> storeIds = (List) data.get("store_id");
                StorePosition.delete("store_id IN (" + Util.strSplitBy("?", ",", storeIds.size()) + ")", storeIds.toArray(new String[0]));
                StorePosition storePosition = StorePosition.findFirst("ORDER BY position_id Desc");
                if (storePosition == null) {
                    last = RuleEnum.getSeq(RULE, 0);
                } else {
                    seq = Integer.parseInt(storePosition.getString("position_id").substring(1));
                }

                for (String storeId : storeIds) {
                    Store store = Store.findFirst("store_id=?", storeId);
                    if (store == null) {
                        return RequestResult.fail("The Store store_id: " + storeId + "is not found..");
                    }
                    String storeName = store.getString("store_name");
                    String storeTypeId = store.getString("store_type_id");
                    int storeGridCount = store.getInteger("store_grid_count");
                    StoreType storeType = StoreType.findFirst("store_type_id=?", storeTypeId);
                    if (storeType == null) {
                        return RequestResult.fail("The StoreType store_type_id: " + storeTypeId + "is not found..");
                    }
                    int storeCellCount = storeType.getInteger("store_type_cell");
                    try {
                        PreparedStatement ps = Base.startBatch("INSERT INTO a_storage_store_position (" +
                                "position_id, " +
                                "position_name, " +
                                "store_id, " +
                                "store_grid_index, " +
                                "store_cell_index, " +
                                "position_desc, " +
                                "create_by, " +
                                "create_time, " +
                                "modify_by, " +
                                "modify_time" +
                                ") " +
                                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? )");

                        for (int gridIndex = 0; gridIndex < storeGridCount; gridIndex++) {


                            for (int cellIndex = 0; cellIndex < storeCellCount; cellIndex++) {

                                last = RuleEnum.getSeq(RULE, seq);

                                ps.setString(1, last);
                                ps.setString(2, String.format(suffixName, storeName, gridIndex + 1, cellIndex + 1));
                                ps.setString(3, storeId);
                                ps.setInt(4, gridIndex);
                                ps.setInt(5, cellIndex);
                                ps.setString(6, "");
                                ps.setString(7, login_user);
                                ps.setTimestamp(8, timestamp);
                                ps.setString(9, login_user);
                                ps.setTimestamp(10, timestamp);
                                ps.addBatch();
                                seq++;
                            }
                        }
                        ps.executeBatch();
                    } catch (SQLException e) {
                        e.printStackTrace();
                    }
                }
                return RequestResult.success();
            });
        }
    }

    //大峽谷快速指引_推薦領料儲位API
    @RequestMapping(value = "/recommend", method = RequestMethod.GET)
    public RequestResult<?> recommend(@RequestParam("bill_no") String bill_no) {
        try {
            return ActiveJdbc.operTx(() -> {
                List<Map<String, Object>> resultList = new ArrayList<>();
//                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
//                String bill_no = data.get("bill_no").toString();
//            String stock_out_date = data.get("stock_out_date").toString();
                List<BillStockOutDetail> bsis = BillStockOutDetail.find("status = 0 and bill_no = ?", bill_no);
                if (bsis != null && bsis.size() != 0) {
                    for (BillStockOutDetail bsi : bsis) {
                        Map<String, Object> map = new HashMap<>();
                        String material_id = bsi.getString("material_id");
                        String material_sub = bsi.getString("material_sub") == null ? "0000" : bsi.getString("material_sub");
                        //需求數量
                        Double quantity = bsi.getDouble("quantity") == null ? 0.00 : bsi.getDouble("quantity");
                        String bill_detail = bsi.getString("bill_detail");
                        Double out_qty = 0.0;

                        //已出數量
                        String sql = String.format("select sum(t.thing_pcs) as total_thing_pcs from a_storage_thing as t LEFT JOIN a_storage_material_thing as mt ON t.thing_id = mt.thing_id WHERE t.thing_reversed = '%s' and mt.material_id = '%s' and mt.material_sub = '%s' group by t.thing_reversed", bill_no, material_id, material_sub);
                        LOG.info("sql : " + sql);

                        List<Map> thingList = Base.findAll(sql);
                        if (thingList != null && thingList.size() != 0) {

                            out_qty = thingList.get(0) == null ? 0.0 : Double.valueOf(thingList.get(0).get("total_thing_pcs").toString());
                            if (out_qty == null) {
                                out_qty = 0.0;
                            }
                        }
//                        out_qty = bsi.getDouble("out_qty") == null ? 0.00 : bsi.getDouble("out_qty");

                        material_sub = bsi.getString("material_sub") == null ? "0000" : bsi.getString("material_sub");

                        Double need_qty = quantity - out_qty;
                        boolean isEnough = false;

                        map.put("material_id", material_id);
                        map.put("material_sub", material_sub);
                        map.put("quantity", quantity);
                        map.put("out_qty", out_qty);

                        List<MaterialThing> mts = MaterialThing.find("material_id = ? and material_sub = ?", material_id, material_sub);
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

                            sql = "SELECT a.* " +
                                    "FROM (SELECT * FROM a_storage_store_thing_map WHERE thing_id IN " + sb.toString() + " order by store_id ,grid_index , cell_start_index) as a " +
                                    "GROUP BY a.store_id ,a.grid_index , a.cell_start_index , a.thing_id";
                            System.out.println("sql : " + sql);

//                            List<StoreThingMap> stms = StoreThingMap.findBySQL(sql);
                            List<Map> stms = Base.findAll(sql);

                            if (stms != null && stms.size() != 0) {
                                double qty = 0;
                                List<String> positionList = new ArrayList<>();

                                for (Map stm : stms) {

                                    String store_id = stm.get("store_id").toString();
                                    String grid_index = stm.get("grid_index").toString();
                                    String cell_start_index = stm.get("cell_start_index").toString();
                                    String position_id = StorePosition.findFirst("store_id = ? and store_grid_index = ? and store_cell_index = ?", store_id, grid_index, cell_start_index).getString("position_id");
                                    String position = getPositionName(position_id);


                                    double total_pcs = Thing.findFirst("thing_id = ?", stm.get("thing_id").toString()).getInteger("thing_pcs");
//                                    double total_pcs = Double.valueOf(stm.get("total_pcs").toString());
                                    if (total_pcs >= need_qty) {
                                        map.put("position_id", position);
                                        isEnough = true;
                                        break;
                                    } else {
                                        if (qty < need_qty && total_pcs != 0) {
                                            qty += total_pcs;
                                            positionList.add(position);
                                        }
                                    }
                                }
                                if (isEnough) {
                                    resultList.add(map);
                                } else {
                                    if (qty < need_qty) {
                                        map.put("position_id", positionList.toString() + "(数量不足，总数量: " + qty + ")");
                                    } else {
                                        map.put("position_id", positionList.toString());
                                    }
                                    map.put("position_id", positionList.toString() + "(数量不足，总数量: " + qty + ")");
                                    resultList.add(map);
//                                    if (qty >= need_qty) {
//                                        map.put("position_id", positionList.toString());
//                                        resultList.add(map);
//                                    } else {
//                                        return RequestResult.success("物料總數量不足..");
//                                    }
                                }
                            } else {
//                                return RequestResult.fail("StoreThingMap 没有 相对资料 原因待查..");
                                map.put("position_id", "目前无库存");
                                resultList.add(map);
                            }
                        } else {
//                            return RequestResult.fail("MaterialThing 没有 相对资料 原因待查..");
                            map.put("position_id", "目前无库存");
                            resultList.add(map);
                        }
                    }
                } else {
                    return RequestResult.fail("BillStockOutDetail 没有 status 为 0 的资料 原因待查..");
                }

                return RequestResult.success(resultList);
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return RequestResult.fail(e.getMessage());
        }
    }

    private String getPositionName(String position_id) {
        String position = "";
        File storageJson = new File("C:\\Servtech\\Servolution\\Platform\\cust_param\\storage\\storage.json");
        if (storageJson.exists()) {
            try {
                Gson gson = new Gson();
                List<StorageConfig> storageList = new ArrayList<>();
                Type listType = new TypeToken<List<StorageConfig>>() {

                }.getType();
                storageList = gson.fromJson(new FileReader(storageJson), listType);
                label:
                for (StorageConfig storage : storageList) {
                    List<StorageConfig.ChildXXXXXXXX> childs1 = storage.getChild();
                    for (StorageConfig.ChildXXXXXXXX child1 : childs1) {
                        List<StorageConfig.ChildXXXXXXXX.ChildXXXXXXX> childs2 = child1.getChild();
                        for (StorageConfig.ChildXXXXXXXX.ChildXXXXXXX child2 : childs2) {
                            List<StorageConfig.ChildXXXXXXXX.ChildXXXXXXX.ChildXXXXXX> childs3 = child2.getChild();
                            for (StorageConfig.ChildXXXXXXXX.ChildXXXXXXX.ChildXXXXXX child3 : childs3) {
                                List<StorageConfig.ChildXXXXXXXX.ChildXXXXXXX.ChildXXXXXX.ChildXXXXX> childs4 = child3.getChild();
                                for (StorageConfig.ChildXXXXXXXX.ChildXXXXXXX.ChildXXXXXX.ChildXXXXX child4 : childs4) {
                                    List<StorageConfig.ChildXXXXXXXX.ChildXXXXXXX.ChildXXXXXX.ChildXXXXX.ChildXXXX> childs5 = child4.getChild();
                                    for (StorageConfig.ChildXXXXXXXX.ChildXXXXXXX.ChildXXXXXX.ChildXXXXX.ChildXXXX child5 : childs5) {
                                        List<StorageConfig.ChildXXXXXXXX.ChildXXXXXXX.ChildXXXXXX.ChildXXXXX.ChildXXXX.ChildXXX> childs6 = child5.getChild();
                                        for (StorageConfig.ChildXXXXXXXX.ChildXXXXXXX.ChildXXXXXX.ChildXXXXX.ChildXXXX.ChildXXX child6 : childs6) {
                                            List<StorageConfig.ChildXXXXXXXX.ChildXXXXXXX.ChildXXXXXX.ChildXXXXX.ChildXXXX.ChildXXX.ChildXX> childs7 = child6.getChild();
                                            for (StorageConfig.ChildXXXXXXXX.ChildXXXXXXX.ChildXXXXXX.ChildXXXXX.ChildXXXX.ChildXXX.ChildXX child7 : childs7) {
                                                List<StorageConfig.ChildXXXXXXXX.ChildXXXXXXX.ChildXXXXXX.ChildXXXXX.ChildXXXX.ChildXXX.ChildXX.ChildX> childs8 = child7.getChild();
                                                for (StorageConfig.ChildXXXXXXXX.ChildXXXXXXX.ChildXXXXXX.ChildXXXXX.ChildXXXX.ChildXXX.ChildXX.ChildX child8 : childs8) {
                                                    List<StorageConfig.ChildXXXXXXXX.ChildXXXXXXX.ChildXXXXXX.ChildXXXXX.ChildXXXX.ChildXXX.ChildXX.ChildX.Child> childs9 = child8.getChild();
                                                    for (StorageConfig.ChildXXXXXXXX.ChildXXXXXXX.ChildXXXXXX.ChildXXXXX.ChildXXXX.ChildXXX.ChildXX.ChildX.Child child9 : childs9) {
                                                        if (child9.getDb_id().equals(position_id)) {
                                                            position = child6.getId() + child7.getId() + child8.getId() + child9.getId();
                                                            System.out.println("position = " + position);
                                                            break label;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            }
        }
        return position;
    }

    //大峽谷快速指引_領料API_更新DB
    @RequestMapping(value = "/pickUpThingUpdateDB", method = RequestMethod.PUT)
    public RequestResult<?> pickUpThing(@RequestBody final Map data) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                try {
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
//                        StoreThingMap storeThingMap = StoreThingMap.findFirst("store_id = ? and grid_index = ? and cell_start_index = ? and thing_id = ?",storePosition.getString("store_id")
//                                , storePosition.getString("store_grid_index")
//                                , storePosition.getString("store_cell_index")
//                                , thing_id);

                        double new_thing_pcs = (stm.getInteger("thing_pcs") - thing_pcs) < 0 ? 0 : (stm.getInteger("thing_pcs") - thing_pcs);
//                        storeThingMap.set("thing_pcs", new_thing_pcs);
//                        storeThingMap.set("modify_time", new Date());
                        String sql = String.format("update a_storage_store_thing_map set thing_pcs = '%s' , modify_time = '%s' where store_id = '%s' and grid_index = '%s' and cell_start_index = '%s' and thing_id = '%s'",
                                new_thing_pcs,
                                new Date(),
                                storePosition.getString("store_id"),
                                storePosition.getString("store_grid_index"),
                                storePosition.getString("store_cell_index"),
                                thing_id);
                        System.out.println(sql);
                        int count = StoreThingMap.update("thing_pcs = ? , modify_time = ?","store_id = ? and grid_index = ? and cell_start_index = ? and thing_id = ?",
                                new_thing_pcs,
                                new Date(),
                                storePosition.getString("store_id"),
                                storePosition.getString("store_grid_index"),
                                storePosition.getString("store_cell_index"),
                                thing_id);
//                        if (storeThingMap.saveIt()) {
                        if (count == 1) {
                            LOG.info("Success : " + "更新 StoreThingMap thing_pcs 成功..");

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

//                                    int code_no = Integer.valueOf(new_thing_id.substring(new_thing_id.length()-4,new_thing_id.length()));
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
//                                    createMaterialThing.setId(new_thing_id);
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
                            try {
                                // insert log
                                String logId = request.getHeader("tablet");
                                Sender sender = Sender.findFirst("sender_key=? AND sender_enabled=? ORDER BY modify_time", logId, "Y");
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
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    System.out.println("Error : " + sw.toString());
                    throw new RuntimeException();
//                    return RequestResult.fail(e.getMessage());
                }
            });
        }
    }

    //大峽谷快速指引_領料API_取得新的thing_id
    @RequestMapping(value = "/pickUpThingGetNewThingId", method = RequestMethod.POST)
    public RequestResult<?> pickUpThingGetNewThingId(@RequestBody final Map data) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                try {
                    Map<String, String> result = new HashMap<>();
                    String material_id = data.get("material_id").toString();

                    // 最後一筆流水號 預設為0
                    int last = 0;
                    String prefix = material_id + LocalDate.now().toString().replaceAll("-", "").substring(2, 8);
                    Thing thing_forPrefix = Thing.findFirst("thing_id like ? order by thing_id desc", prefix + "%");
                    // 找 Thing 該 Material 的 最後一筆資料的流水號
                    if (thing_forPrefix != null) {
                        String lastThingId = thing_forPrefix.getString("thing_id");
                        int index = lastThingId.indexOf(prefix);
                        last = Integer.parseInt(lastThingId.substring(index + prefix.length()));
                    }
                    //thing_id=(material_id+年月日+流水號4碼)
                    String new_thing_id = String.format(RuleEnum.getSeq(THINGRULE, last), prefix);

                    result.put("new_thing_id", new_thing_id);
                    return RequestResult.success(result);
                } catch (Exception e) {
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    System.out.println("Error : " + sw.toString());
                    throw new RuntimeException();
                }
            });
        }
    }
}

