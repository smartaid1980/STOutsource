package com.servtech.servcloud.app.controller.ennoconn;

import com.google.gson.Gson;
import com.servtech.servcloud.app.model.cosmos.MailServer;
import com.servtech.servcloud.app.model.ennoconn.*;
import com.servtech.servcloud.app.model.ennoconn.view.EnnoconnBillStockInMaterialThingView;
import com.servtech.servcloud.app.model.ennoconn.view.PickupErrorLogThingView;
import com.servtech.servcloud.app.model.ennoconn.view.PickupLightPositionMapView;
import com.servtech.servcloud.app.model.ennoconn.view.PositionThingBillStockOutSMTStationView;
import com.servtech.servcloud.app.model.ennoconn.EmailRecord;
import com.servtech.servcloud.app.model.storage.*;
import com.servtech.servcloud.app.model.strongLED.BillStockOutDetail;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.mail.MailManager;
import com.servtech.servcloud.core.mail.modules.ConfigData;
import com.servtech.servcloud.core.mail.modules.DataTemplate;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.log4j.Logger;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.Util.getTimeLongFormat;

@RestController
@RequestMapping("/ennoconn/warehouse")
public class WarehouseController {

    public static final Logger LOG = Logger.getLogger(WarehouseController.class);
    private static final String SERVER_IP = "http://61.220.78.195:58080";  //K11
    static SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    static SimpleDateFormat yyyyMMdd = new SimpleDateFormat("yyyyMMdd");
    SimpleDateFormat sdfDay = new SimpleDateFormat("yyyy-MM-dd");
    private MailManager mailManager = new MailManager();
    private Gson gson = new Gson();

//    private static final String LOCK = new String();

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    final String EMPTY = "";

    @RequestMapping(value = "/check-smt-info", method = RequestMethod.POST)
    public RequestResult<?> checkSMTInfo(@RequestBody final Map data) {

        return ActiveJdbc.operTx(() -> {
            try {
                String thing_id = data.get("thing_id").toString();
                MaterialThing materialThing = MaterialThing.findFirst("thing_id = ?", thing_id);
                Object PKObj = materialThing.get("column1");
                if (PKObj == null || PKObj.toString().equals("")) {
                    String errorMsg = "該原料" + thing_id + "沒有綁定任何單據";
                    writeErrorLog(data, errorMsg);
                    return RequestResult.fail(errorMsg);
                }
                String[] PKs = PKObj.toString().split("\\|");
                if (PKs.length <= 3)
                    PKs = (PKObj.toString() + " ").split("\\|");
                String bill_no = PKs[0];
                String ware_id = PKs[3].trim();
                BillStockOutDetail billStockOutDetail = BillStockOutDetail.findFirst("bill_no = ? and bill_detail = ? and material_id = ? and ware_id = ?", bill_no, PKs[1], PKs[2], ware_id);
                BillStockOutMain billStockOutMain = BillStockOutMain.findFirst("bill_no = ? and ware_id = ?", bill_no, ware_id);
                if (billStockOutMain == null) {
                    String errorMsg = "該原料" + thing_id + "找不到相對應的發料單";
                    writeErrorLog(data, errorMsg);
                    return RequestResult.fail(errorMsg);
                }
                String smt_stn_id = billStockOutMain.getString("smt_stn_id");
                if (data.get("smt_stn_id") != null && !smt_stn_id.equals(data.get("smt_stn_id").toString())) {
                    String errorMsg = "該原料" + thing_id + "綁定單據為" + smt_stn_id + "，與選擇單據" + data.get("smt_stn_id") + "不同";
                    writeErrorLog(data, errorMsg);
                    return RequestResult.fail(errorMsg);
                }
                List<SMTStationDetail> smtStationDetailList = SMTStationDetail.find("smt_stn_id = ? and material_id = ? and machine = ? and track = ? and sub_track = ? and feeder_type = ?"
                        , smt_stn_id, billStockOutDetail.get("material_id"), data.get("machine"), data.get("track"), data.get("sub_track"), data.get("feeder_type"));
                if (smtStationDetailList == null || smtStationDetailList.size() == 0) {
                    String errorMsg = "該原料" + thing_id + "找不到與掃描條件相符合的料站表明細..";
                    writeErrorLog(data, errorMsg);
                    return RequestResult.fail(errorMsg);
                }

                return RequestResult.success();
            } catch (Exception e) {
                e.printStackTrace();
                return RequestResult.fail(e.getMessage());
            }
        });

    }

    private void writeErrorLog(Map data, String errorMsg) {
        SMTMappingErrorLog log = new SMTMappingErrorLog();
        log.fromMap(data);
        log.set("warning_message", errorMsg);
        log.set("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
        log.set("create_time", new Date());
        log.insert();
    }

    @RequestMapping(value = "/smt-outbound", method = RequestMethod.POST)
    public RequestResult<?> smtOutbound(@RequestBody final Map data) {
//        synchronized (LOCK) {
        String store_id = data.get("store_id").toString();
        String smt_stn_id = data.get("smt_stn_id").toString();
        Map result = new HashMap();
        Date now = new Date();
        return ActiveJdbc.operTx(() -> {
            try {
                List<PositionThingBillStockOutSMTStationView> viewList = PositionThingBillStockOutSMTStationView.find("store_id = ? and smt_stn_id = ? and machine = ? and line = ? and track = ? and sub_track = ? and feeder_type = ? and status = 0 and in_stock = 98",
                        store_id,
                        smt_stn_id,
                        data.get("machine"),
                        data.get("line"),
                        data.get("track"),
                        data.get("sub_track"),
                        data.get("feeder_type"));
                Base.openTransaction();
                if (viewList == null || viewList.size() == 0)
                    return RequestResult.success("移動料架上沒有符合該條件的原料");

                //woody說只要亮一個燈
                PositionThingBillStockOutSMTStationView view = viewList.get(0);
                if (MaterialThing.update("status = 1", "thing_id = ?", view.getString("thing_id")) != 1)
                    throw new RuntimeException("綁定亮燈原料失敗");

//                viewList.forEach((view) -> {
//                    if (MaterialThing.update("status = 1", "thing_id = ?", view.getString("thing_id")) != 1)
//                        throw new RuntimeException("綁定亮燈原料失敗");
//                });

                String PKStr = viewList.get(0).getString("column1");
                String[] PKs = PKStr.split("\\|");
                if (PKs.length <= 3)
                    PKs = (PKStr + " ").split("\\|");
                String bill_no = PKs[0];
                String ware_id = PKs[3].trim();
                List<Map> pickupLightPositionMapViewMaps = PickupLightPositionMapView.find("bill_no = ?", viewList.get(0).getString("column1")).toMaps();
                System.out.println(pickupLightPositionMapViewMaps.size());

                insertThingLogWithSituation(pickupLightPositionMapViewMaps, bill_no, ware_id, "27", now);

                result.put("pickInfo", pickupLightPositionMapViewMaps);
                Base.commitTransaction();
                return RequestResult.success(result);
            } catch (Exception e) {
                Base.rollbackTransaction();
                e.printStackTrace();
                return RequestResult.fail(e.getMessage());
            }
        });
//        }
    }

    @RequestMapping(value = "/end-transfer", method = RequestMethod.POST)
    public RequestResult<?> endTransfer(@RequestBody final Map data) {
        String billNo = data.get("bill_no") == null ? "" : data.get("bill_no").toString();
        String wareId = data.get("ware_id") == null ? "" : data.get("ware_id").toString();
        String likeSql = billNo + "%" + wareId;
        System.out.println(likeSql);
        return ActiveJdbc.operTx(() -> {
            try {
                Base.openTransaction();
                updateAndDeleteThingLog("end-outbound", billNo);
                updateAndDeleteThingLog("end-inbound", billNo);
                List<PickupLightPositionMapView> pickupLightPositionMapViewMaps = PickupLightPositionMapView.find("bill_no like ?", likeSql);
                if (pickupLightPositionMapViewMaps == null || pickupLightPositionMapViewMaps.size() == 0) {
                    updateBillStockOutDetailTransferQty(billNo, wareId);
                    Base.commitTransaction();
                    return RequestResult.success();
                }
                for (PickupLightPositionMapView pickupLightPositionMapViewMap : pickupLightPositionMapViewMaps) {
                    MaterialThing materialThing = MaterialThing.findFirst("thing_id = ?", pickupLightPositionMapViewMap.getString("thing_id"));
                    materialThing.set("status", 0);
                    materialThing.saveIt();
                }
                Base.commitTransaction();
                updateBillStockOutDetailTransferQty(billNo, wareId);
//                Runnable runnable = () -> {
//                    updateAndDeleteThingLog("end-outbound", billNo);
//                    updateAndDeleteThingLog("end-inbound", billNo);
//                };
//                new Thread(runnable).start();

                return RequestResult.success();
            } catch (Exception e) {
                Base.rollbackTransaction();
                e.printStackTrace();
                return RequestResult.fail(e.getMessage());
            }
        });
    }

    private void updateBillStockOutDetailTransferQty(String billNo, String wareId) {
        String likeSql = billNo + "%" + wareId;
        List<Log> logList = Log.find("doc_id like ? and log_type = 2 group by thing_id , doc_id", likeSql);
        Map<String, Double> billAndTransferQty = new HashMap<>();
        Map<String, Double> billAndSMTOutQty = new HashMap<>();
        long currentTime = getTimeLongFormat();

        for (Log storageLog : logList) {
            double log_count = storageLog.getDouble("log_count");
            String doc_id = storageLog.getString("doc_id");
            String[] billInfo = doc_id.split("\\|");   //(bill_no + "|" + bill_detail + "|" + material_id + "|"+ ware_id)

            List<ThingLog> thingLogList = ThingLog.find("thing_id = ? and situation = '26' and bill_no_out = ?", storageLog.getString("thing_id"), billInfo[0]);
            if (thingLogList != null && thingLogList.size() != 0) {
                double transferQry = billAndTransferQty.getOrDefault(doc_id, 0.0) + log_count;
                billAndTransferQty.put(doc_id, transferQry);
            }

            thingLogList = ThingLog.find("thing_id = ? and situation = '27' and bill_no_out = ?", storageLog.getString("thing_id"), billInfo[0]);
            if (thingLogList != null && thingLogList.size() != 0) {
                double SMTOutQry = billAndSMTOutQty.getOrDefault(doc_id, 0.0) + log_count;
                billAndSMTOutQty.put(doc_id, SMTOutQry);
            }

        }
        int count = 0;
        for (Map.Entry<String, Double> map : billAndTransferQty.entrySet()) {
            String[] billInfo = map.getKey().split("\\|");
            Double transferQry = map.getValue();
            Double SMTOutQty = billAndSMTOutQty.get(map.getKey()) == null ? 0.0 : billAndSMTOutQty.get(map.getKey());
//            BillStockOutDetail billStockOutDetail = BillStockOutDetail.findFirst("bill_no= ? and bill_detail = ? and material_id = ? and ware_id = ?"
//                    , billInfo[0], billInfo[1], billInfo[2], billInfo[3]);
//            double original_transfer_qty = billStockOutDetail.get("transfer_qty") == null ? 0.0 : billStockOutDetail.getDouble("transfer_qty");

            count += BillStockOutDetail.update("transfer_qty = ?, modify_time = ?, status = 3"
                    , "bill_no= ? and bill_detail = ? and material_id = ? and ware_id = ?"
                    , transferQry - SMTOutQty, currentTime
                    , billInfo[0], billInfo[1], billInfo[2], billInfo[3]);
        }
        if (count > 0)
            BillStockOutMain.update("status = 3, modify_time =?", "bill_no = ? and ware_id = ?", currentTime, billNo, wareId);
    }

    @RequestMapping(value = "/lock-pick", method = RequestMethod.GET)
    public RequestResult<?> lockPickOut() {
        Map result = new HashMap();
        Date now = new Date();
        return ActiveJdbc.operTx(() -> {
            try {
                List<MaterialThing> materialThingList = MaterialThing.find("in_stock = 9");
                for (MaterialThing materialThing : materialThingList) {
                    materialThing.set("status", 1);
                    materialThing.set("column1", null);
                    if (!materialThing.saveIt())
                        throw new RuntimeException("update MaterialThing fial...");
                }
                List<Map> pickupLightPositionMapViewMaps = PickupLightPositionMapView.find("bill_no is null").toMaps();

                insertThingLogWithSituation(pickupLightPositionMapViewMaps, null, null, "25", now);

                result.put("pickInfo", addBillStockInInfo(pickupLightPositionMapViewMaps));
                Base.commitTransaction();
                return RequestResult.success(result);
            } catch (Exception e) {
                Base.rollbackTransaction();
                return RequestResult.fail(e.getMessage());
            }
        });
    }

    private Object addBillStockInInfo(List<Map> pickupLightPositionMapViewMaps) {
        for (Map map : pickupLightPositionMapViewMaps) {
            EnnoconnBillStockInMaterialThingView view = EnnoconnBillStockInMaterialThingView.findFirst("thing_id = ?", map.get("thing_id").toString());
            map.put("material_id", view.getString("material_id"));
            map.put("po_id", view.getString("po_id"));
            map.put("vender_name", view.getString("vender_name"));
            map.put("vender_lot", view.getString("vender_lot"));
            map.put("vender_pn", view.getString("vender_pn"));
            map.put("delivery_date", view.getString("delivery_date"));
            map.put("status", view.getString("status"));
        }
        return pickupLightPositionMapViewMaps;
    }

    @RequestMapping(value = "/query-pick", method = RequestMethod.GET)
    public RequestResult<?> queryPickOut(@RequestParam(value = "thing_id", required = false) String thing_id,
                                         @RequestParam(value = "material_id", required = false) String material_id,
                                         @RequestParam(value = "delivery_date", required = false) String delivery_date,
                                         @RequestParam(value = "vender_id", required = false) String vender_id,
                                         @RequestParam(value = "veder_pn", required = false) String veder_pn,
                                         @RequestParam(value = "vender_lot", required = false) String vender_lot) {
        Map result = new HashMap();
        Date now = new Date();
        return ActiveJdbc.operTx(() -> {
            try {
                StringBuffer sb = new StringBuffer("select * from a_ennoconn_view_bill_stock_in_material_thing where in_stock in (1,98) and status = 0 ");
                if (thing_id != null)
                    sb.append(String.format("AND thing_id = '%s' ", thing_id));
                if (material_id != null)
                    sb.append(String.format("AND material_id = '%s' ", material_id));
                if (delivery_date != null)
                    sb.append(String.format("AND delivery_date = '%s' ", delivery_date));
                if (vender_id != null)
                    sb.append(String.format("AND vender_id = '%s' ", vender_id));
                if (veder_pn != null)
                    sb.append(String.format("AND veder_pn = '%s' ", veder_pn));
                if (vender_lot != null)
                    sb.append(String.format("AND vender_lot = '%s' ", vender_lot));
                System.out.println(sb.toString());
                List<EnnoconnBillStockInMaterialThingView> ennoconnBillStockInMaterialThingViewList = EnnoconnBillStockInMaterialThingView.findBySQL(sb.toString());
                for (EnnoconnBillStockInMaterialThingView view : ennoconnBillStockInMaterialThingViewList) {
                    int updateCount = MaterialThing.update("status = 1, column1 = null", "thing_id = ?", view.getString("thing_id"));
                    if (updateCount != 1)
                        throw new RuntimeException("update MaterialThing fial...");
                }

                List<Map> pickupLightPositionMapViewMaps = PickupLightPositionMapView.find("bill_no is null").toMaps();

                insertThingLogWithSituation(pickupLightPositionMapViewMaps, null, null, "24", now);

                result.put("pickInfo", mergeViewInfo(pickupLightPositionMapViewMaps, ennoconnBillStockInMaterialThingViewList));
                Base.commitTransaction();
                return RequestResult.success(result);
            } catch (Exception e) {
                Base.rollbackTransaction();
                return RequestResult.fail(e.getMessage());
            }
        });
    }

    private Object mergeViewInfo(List<Map> pickupLightPositionMapViewMaps, List<EnnoconnBillStockInMaterialThingView> ennoconnBillStockInMaterialThingViewList) {
        for (Map map : pickupLightPositionMapViewMaps) {
            for (EnnoconnBillStockInMaterialThingView view : ennoconnBillStockInMaterialThingViewList) {
                if (view.getString("thing_id").equals(map.get("thing_id").toString())) {
                    map.put("material_id", view.getString("material_id"));
                    map.put("po_id", view.getString("po_id"));
                    map.put("vender_name", view.getString("vender_name"));
                    map.put("vender_lot", view.getString("vender_lot"));
                    map.put("vender_pn", view.getString("vender_pn"));
                    map.put("delivery_date", view.getString("delivery_date"));
                    map.put("status", view.getString("status"));
                    break;
                }
            }
        }
        return pickupLightPositionMapViewMaps;
    }

    @RequestMapping(value = "/step-thing-pick", method = RequestMethod.GET)
    public RequestResult<?> stepThingPickOut(@RequestParam("thing_id") String thing_id) {
        Map result = new HashMap();
        return ActiveJdbc.operTx(() -> {
            try {
                List<String> pickUpThing = new ArrayList<>();
                List shortageInfo = new ArrayList();
                Date now = new Date();

                MaterialThing materialThing = MaterialThing.findFirst("thing_id = ?", thing_id);
                String[] stockOutDetailInfo = materialThing.getString("column1").split("\\|"); //(bill_no + "|" + bill_detail + "|" + material_id + "|"+ ware_id)
                if (stockOutDetailInfo.length <= 3)
                    stockOutDetailInfo = (materialThing.getString("column1") + " ").split("\\|");
                String billNo = stockOutDetailInfo[0];
                String ware_id = stockOutDetailInfo[3].trim();

                BillStockOutDetail billStockOutDetail = BillStockOutDetail.findFirst("bill_no = ? and bill_detail = ? and material_id = ? and ware_id = ?"
                        , billNo, stockOutDetailInfo[1], stockOutDetailInfo[2], ware_id);

                Base.openTransaction();
                pickupThingByStockOutDetail(billStockOutDetail, pickUpThing, shortageInfo);

                List<Map> pickupLightPositionMapViewMaps = PickupLightPositionMapView.find("bill_no = ?", materialThing.getString("column1")).toMaps();

                insertThingLogWithSituation(pickupLightPositionMapViewMaps, billNo, ware_id, "23", now);

                result.put("shortageInfo", shortageInfo);
                result.put("pickInfo", pickupLightPositionMapViewMaps);
                Base.commitTransaction();
                return RequestResult.success(result);
            } catch (Exception e) {
                Base.rollbackTransaction();
                e.printStackTrace();
                return RequestResult.fail(e.getMessage());
            }
        });
    }

    @RequestMapping(value = "/insert-transfer-db", method = RequestMethod.POST)
    public RequestResult<?> insertTransferDB(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            try {
                String transfer_id = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date());
                data.put("transfer_id", transfer_id);
                StoreTransferMap storeTransferMap = new StoreTransferMap();
                storeTransferMap.fromMap(data);
                if (storeTransferMap.insert()) {
                    return RequestResult.success(transfer_id);
                } else {
                    return RequestResult.fail("insert StoreTransferMap fail..");
                }
            } catch (Exception e) {
                e.printStackTrace();
                return RequestResult.fail(e.getMessage());
            }
        });
    }

    @RequestMapping(value = "/error-inbound", method = RequestMethod.POST)
    public RequestResult<?> deleteErrorInbound(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            try {
                String storeId = data.get("store_id").toString();
                String createBy = data.get("create_by").toString();
                StoreThingMap.delete("store_id=? AND grid_index=? AND cell_start_index=? AND create_by=?", storeId, -1, -1, createBy);
                Log.delete("store_id=? AND store_grid_index=? AND store_cell_index=? AND create_by=?", storeId, -1, -1, createBy);
//                ThingLog.delete("store_id_to=? AND store_grid_id_to=? AND store_cell_id_to=? AND create_by=?", storeId, -1, -1, createBy);
//                new Thread(() -> {
//                    updateAndDeleteThingLog("end-inbound");
//                }).start();
                updateAndDeleteThingLog("end-inbound");
                return RequestResult.success("success");
            } catch (Exception e) {
                e.printStackTrace();
                return RequestResult.fail(e.getMessage());
            }
        });
    }

    @RequestMapping(value = "/inbound", method = RequestMethod.POST)
    public RequestResult<?> inbound(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            try {
                String currentTime = sdf.format(new Date());
                String userId = data.get("create_by").toString();
                System.out.println("thing_id : " + data.get("thing_id"));
                if (data.get("thing_pcs") == null)
                    data.put("thing_pcs", Thing.findFirst("thing_id = ?", data.get("thing_id").toString()).get("thing_pcs"));

                data.put("grid_index", -1);
                data.put("cell_start_index", -1);
                data.put("cell_end_index", -1);
                data.put("thing_cell", 1);
                data.put("create_time", currentTime);
                data.put("modify_by", data.get("create_by").toString());
                data.put("modify_time", currentTime);

                Map log = new HashMap();
                log.put("log_id", userId);
                log.put("log_time", currentTime);
                log.put("store_id", data.get("store_id").toString());

                log.put("store_grid_index", -1);
                log.put("store_cell_index", -1);
                log.put("user_id", EMPTY);
                log.put("thing_id", data.get("thing_id").toString());

                log.put("doc_id", EMPTY);
                log.put("sender_id", EMPTY);
                log.put("log_type", 1);
                log.put("log_count", data.get("thing_pcs"));
                log.put("log_desc", EMPTY);
                log.put("create_by", userId);
                log.put("create_time", currentTime);
                log.put("modify_by", userId);
                log.put("modify_time", currentTime);

                Map thingLog = new HashMap();
//                thingLog.put("log_id", new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date()));
                thingLog.put("thing_id", data.get("thing_id").toString());
                thingLog.put("situation", data.get("situation").toString());
                thingLog.put("bill_no_in", MaterialThing.findFirst("thing_id = ?", data.get("thing_id")).getString("bill_from"));
                thingLog.put("store_id_to", data.get("store_id"));
                thingLog.put("store_grid_id_to", -1);
                thingLog.put("store_cell_id_to", -1);
                thingLog.put("thing_pcs", data.get("thing_pcs"));
                thingLog.put("is_export", "N");
                thingLog.put("create_by", userId);
                thingLog.put("create_time", currentTime);

                ThingLog storageThingLog = new ThingLog();
                storageThingLog.fromMap(thingLog);

                StoreThingMap storeThingMap = new StoreThingMap();
                storeThingMap.fromMap(data);

                Log storageLog = new Log();
                storageLog.fromMap(log);

                if (storageLog.insert() && storeThingMap.insert() && storageThingLog.insert()) {
                    return RequestResult.success("insert db success");
                } else {
                    return RequestResult.fail("insert db fail...");
                }
            } catch (Exception e) {
                e.printStackTrace();
                return RequestResult.fail(e.getMessage());
            }
        });
    }

    @RequestMapping(value = "/inbound-list", method = RequestMethod.POST)
    public RequestResult<?> inboundList(@RequestBody final Map data) {
        String storeId = data.get("store_id").toString();

        return ActiveJdbc.operTx(() -> {
            try {

                if (data.containsKey("demo")) {
                    return RequestResult.success(data.get("demo"));
                }

                Map result = new HashMap();
                List<StoreThingMap> storeThingMapList = StoreThingMap.where("grid_index=-1 AND cell_start_index=-1 AND store_id=?", storeId);
                List inboundList = new ArrayList();
                storeThingMapList.forEach(storeThingMap -> inboundList.add(storeThingMap.getString("thing_id")));

                List<PositionErrorLog> positionErrorLog = PositionErrorLog.where("error_clear=0 AND store_id=?", storeId);
                List<Map> errMsg = new ArrayList<>();
                if (positionErrorLog.size() > 0) {
                    for (PositionErrorLog pel : positionErrorLog) {
                        Map map = new HashMap();
                        map.put("store_id", storeId);
                        map.put("cell_index", pel.getInteger("store_cell_index"));
                        errMsg.add(map);
                    }
                }
                result.put("inbound_list", inboundList);
                result.put("err_msg", errMsg);

                return RequestResult.success(result);
            } catch (Exception e) {
                e.printStackTrace();
                return RequestResult.fail(e.getMessage());
            }
        });
    }

    @RequestMapping(value = "/outbound", method = RequestMethod.POST)
    public RequestResult<?> outbound(@RequestBody final Map data) {
//        synchronized (LOCK) {
        String billNo = data.get("billNo").toString();
        String ware_id = data.get("ware_id") == null ? "" : data.get("ware_id").toString();
        String situation = data.get("situation").toString();
        Date now = new Date();
        List<String> pickupThing = new ArrayList<>();
        Map result = new HashMap();
        List<Map<String, Object>> shortageInfo = new ArrayList();
        return ActiveJdbc.operTx(() -> {
            try {
                List<BillStockOutDetail> billStockOutDetails = BillStockOutDetail.find("bill_no = ? and ware_id = ? and status != 1", billNo, ware_id);

                Base.openTransaction();
                for (BillStockOutDetail billStockOutDetail : billStockOutDetails) {
                    pickupThingByStockOutDetail(billStockOutDetail, pickupThing, shortageInfo);
                }

                String likeSql = billNo + "%" + ware_id;
                List<Map> pickupLightPositionMapViewMaps = PickupLightPositionMapView.find("bill_no like ?", likeSql).toMaps();

                insertThingLogWithSituation(pickupLightPositionMapViewMaps, billNo, ware_id, situation, now);

                result.put("shortageInfo", shortageInfo);
                result.put("pickInfo", pickupLightPositionMapViewMaps);
                Base.commitTransaction();

                if (shortageInfo.size() != 0 && isUnsend(2)) {
                    Runnable runnable = new Runnable() {
                        @Override
                        public void run() {
                            sendShortageMail(billNo, ware_id, shortageInfo, 2);
                        }
                    };
                    new Thread(runnable).start();
                } else {
                    System.out.println("沒有短缺，或是已通知過");
                }

                return RequestResult.success(result);
            } catch (Exception e) {
                Base.rollbackTransaction();
                e.printStackTrace();
                return RequestResult.fail(e.getMessage());
            }
        });
//        }
    }

    private boolean isUnsend(int mail_type_id) {
        Date now = new Date();
        String today = yyyyMMdd.format(now);
        String sql = "SELECT * FROM a_ennoconn_email_record WHERE mail_id like '" + today + "%' and is_send = 'Y' and mail_type_id = " + mail_type_id;
        System.out.println("sql : " + sql);
        List<EmailRecord> emailRecordList = EmailRecord.findBySQL(sql);
        if (emailRecordList == null || emailRecordList.size() == 0)
            return true;
        return false;
    }

    private void insertThingLogWithSituation(List<Map> pickupLightPositionMapViewMaps, String billNo, String ware_id, String situation, Date now) {
        Map data = new HashMap();

        if (situation.equals("22")) {
            data.put("smt_stn_id", BillStockOutMain.findFirst("bill_no = ? and ware_id = ?", billNo, ware_id).getString("smt_stn_id"));

        } else if (situation.equals("26") || situation.equals("27")) {
            data.put("bill_no_out", billNo);
            data.put("smt_stn_id", BillStockOutMain.findFirst("bill_no = ? and ware_id = ?", billNo, ware_id).getString("smt_stn_id"));

        } else {
            data.put("bill_no_out", billNo);
        }

        for (Map map : pickupLightPositionMapViewMaps) {
            ThingLog thingLog = new ThingLog();
            thingLog.fromMap(data);
            thingLog.set("thing_id", map.get("thing_id").toString());
            thingLog.set("situation", situation);
            thingLog.set("store_id_from", map.get("store_id"));
            thingLog.set("store_grid_id_from", -1);
            thingLog.set("store_cell_id_from", -1);
            thingLog.set("thing_pcs", map.get("thing_pcs"));
            thingLog.set("is_export", "N");
            thingLog.set("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
            thingLog.set("create_time", now);
            thingLog.insert();
        }
    }

    private void pickupThingByStockOutDetail(BillStockOutDetail billStockOutDetail, List<String> pickupThing, List<Map<String, Object>> shortageInfo) {

        String materialId = billStockOutDetail.getString("material_id");
        StringBuffer PKStr = new StringBuffer(billStockOutDetail.getString("bill_no"))
                .append("|").append(billStockOutDetail.getString("bill_detail"))
                .append("|").append(materialId)
                .append("|").append(billStockOutDetail.getString("ware_id"));
        //先檢查之前這張單 這個物料拿了多少
        double out_qty = billStockOutDetail.get("out_qty") == null || billStockOutDetail.getString("out_qty").equals("") ? 0.0 : billStockOutDetail.getDouble("out_qty");
        double transfer_qty = billStockOutDetail.get("transfer_qty") == null || billStockOutDetail.getString("transfer_qty").equals("") ? 0.0 : billStockOutDetail.getDouble("transfer_qty");
//        double qty_in_transfer_store = transfer_qty - out_qty < 0 ? 0.0 : transfer_qty - out_qty;
        Double quantity = billStockOutDetail.getDouble("quantity") - out_qty - transfer_qty;
        if (quantity <= 0)
            return;
        System.out.println("此次該拿數量為" + quantity);
        //先拿餘料(is_new = 0)
        String sql = "Select * from " + MaterialThing.getTableName() + " where material_id = '" + materialId + "' and is_new = 0 and status = 0 and in_stock = 1 "
                + getThingIdNotIn(pickupThing) + " order by delivery_date";
        System.out.println(sql);
        List<MaterialThing> materialThings = MaterialThing.findBySQL(sql);
        if (materialThings.size() != 0) {
            for (MaterialThing materialThing : materialThings) {
                String thingId = materialThing.getString("thing_id");
                if (StoreThingMap.find("thing_id = ?", thingId).size() == 0) { //表示這個thing已經不在儲位上了
                    continue;
                }
                Thing thing = Thing.findFirst("thing_id = ?", thingId);
                double thingPcs = thing.getDouble("thing_pcs");
                quantity -= thingPcs;
                pickupThing.add(thingId);
                materialThing.set("status", 1);
                materialThing.set("column1", PKStr.toString());
                materialThing.saveIt();
                if (quantity <= 0) {
                    return;
                }
            }
        }

        //餘料不夠就拿新料，依入庫時間先進先出
        sql = "Select * from " + MaterialThing.getTableName() + " where material_id = '" + materialId + "' and is_new != 0 and status = 0 and in_stock = 1 "
                + getThingIdNotIn(pickupThing) + " order by delivery_date";
        System.out.println(sql);
        materialThings = MaterialThing.findBySQL(sql);
        if (materialThings.size() != 0) {
            for (MaterialThing materialThing : materialThings) {
                String thingId = materialThing.getString("thing_id");
                if (StoreThingMap.find("thing_id = ?", thingId).size() == 0) { //表示這個thing已經不在儲位上了
                    continue;
                }
                Thing thing = Thing.findFirst("thing_id = ?", thingId);
                double thingPcs = thing.getDouble("thing_pcs");
                quantity -= thingPcs;
                pickupThing.add(thingId);
                materialThing.set("status", 1);
                materialThing.set("column1", PKStr.toString());
                materialThing.saveIt();
                if (quantity <= 0) {
                    return;
                }
            }
        }
        Map<String, Object> map = new HashMap<>();
        map.put("smt_detail_pks", billStockOutDetail.get("smt_detail_pks"));
        map.put("bill_detail", materialId);
        map.put("material_id", materialId);
        map.put("quantity", billStockOutDetail.getDouble("quantity")); //工單總需求數
        map.put("column_4", billStockOutDetail.getString("column_4") == null ? "pc" : billStockOutDetail.getString("column_4")); //單位
        map.put("column_2", billStockOutDetail.getDouble("column_2")); //組成用量
        map.put("out_qty", out_qty + transfer_qty); //先前已發數量
        map.put("shortage", quantity); //不足數
        shortageInfo.add(map);
    }

    private String getThingIdNotIn(List<String> pickupThing) {
        if (pickupThing.size() == 0)
            return "";
        StringBuffer sb = new StringBuffer("and thing_id not in ('");
        for (int i = 0; i < pickupThing.size(); i++) {
            sb.append(pickupThing.get(i));
            sb.append("'");
            if (i == pickupThing.size() - 1) {
                sb.append(") ");
            } else {
                sb.append(", '");
            }

        }
        return sb.toString();
    }

    @RequestMapping(value = "/outbound-list", method = RequestMethod.POST)
    public RequestResult<?> outboundList(@RequestBody final Map data) {
        Map<String, Object> result = new HashMap<>();
        List<String> storeIds = (List<String>) data.get("store_ids");
        String billNo = data.get("bill_no") == null ? "" : data.get("bill_no").toString();
        String ware_id = data.get("ware_id") == null ? "" : data.get("ware_id").toString();
        return ActiveJdbc.operTx(() -> {
            try {

                String sql = String.format("select * from a_ennoconn_view_pickup_error_log where error_clear=0 AND store_id in %s", getStoreIdIn(storeIds));
                System.out.println(sql);
                List<PickupErrorLogThingView> pickupErrorLogThingView = PickupErrorLogThingView.findBySQL(sql);
                if (pickupErrorLogThingView.size() != 0) {
                    result.put("err_msg", pickupErrorLogThingView.get(0).toMap());
                }
                String likeSql = billNo + "%" + ware_id;
                System.out.println(likeSql);
                List<Map> pickupLightPositionMapViewMaps;
                if (!billNo.equals("")) {
                    pickupLightPositionMapViewMaps = PickupLightPositionMapView.find("bill_no like ?", likeSql).toMaps();
                } else {
                    pickupLightPositionMapViewMaps = PickupLightPositionMapView.find("bill_no is null").toMaps();
                }
                result.put("outbound_list", pickupLightPositionMapViewMaps);

                return RequestResult.success(result);
            } catch (Exception e) {
                e.printStackTrace();
                return RequestResult.fail(e.getMessage());
            }
        });
    }

    private Object getStoreIdIn(List<String> storeIds) {
        StringBuffer sb = new StringBuffer();
        sb.append("(");
        for (int i = 0; i < storeIds.size(); i++) {
            String storeId = storeIds.get(i);
            sb.append("\'" + storeId + "\'");
            if (i != storeIds.size() - 1)
                sb.append(",");
        }
        sb.append(")");
        return sb.toString();
    }

    @RequestMapping(value = "/endpick", method = RequestMethod.POST)
    public RequestResult<?> endpick(@RequestBody final Map data) {
        String billNo = data.get("bill_no") == null ? "" : data.get("bill_no").toString();
        String wareId = data.get("ware_id") == null ? "" : data.get("ware_id").toString();
        String likeSql = billNo + "%" + wareId;
        System.out.println(likeSql);
        return ActiveJdbc.operTx(() -> {
            try {
                Base.openTransaction();

                List<PickupLightPositionMapView> pickupLightPositionMapViewMaps;
                if (billNo.equals("")) {
                    pickupLightPositionMapViewMaps = PickupLightPositionMapView.find("bill_no is null");
                    for (PickupLightPositionMapView pickupLightPositionMapViewMap : pickupLightPositionMapViewMaps) {
                        MaterialThing materialThing = MaterialThing.findFirst("thing_id = ?", pickupLightPositionMapViewMap.getString("thing_id"));
                        materialThing.set("status", 0);
//                        materialThing.set("column1", null);
                        materialThing.saveIt();
                    }
                    Base.commitTransaction();
//                    Runnable runnable = () -> {
//                        updateAndDeleteThingLog("end-outbound");
//                    };
//                    new Thread(runnable).start();
                    updateAndDeleteThingLog("end-outbound");
                } else {
                    pickupLightPositionMapViewMaps = PickupLightPositionMapView.find("bill_no like ?", likeSql);

                    if (pickupLightPositionMapViewMaps != null && pickupLightPositionMapViewMaps.size() > 0) {
                        for (PickupLightPositionMapView pickupLightPositionMapViewMap : pickupLightPositionMapViewMaps) {
                            MaterialThing materialThing = MaterialThing.findFirst("thing_id = ?", pickupLightPositionMapViewMap.getString("thing_id"));
                            materialThing.set("status", 0);
//                        materialThing.set("column1", null);
                            materialThing.saveIt();
                        }
                    }
                    updateAndDeleteThingLog("end-outbound", billNo);
                    updateBillStockOutDetailOutQty(billNo, wareId);
                    checkAndUpdateDetailAndMainStatus(billNo, wareId);
                    Base.commitTransaction();
//                    Runnable runnable = () -> {
//                        updateAndDeleteThingLog("end-outbound", billNo);
//                    };
//                    new Thread(runnable).start();
                }


                return RequestResult.success();
            } catch (Exception e) {
                Base.rollbackTransaction();
                e.printStackTrace();
                return RequestResult.fail(e.getMessage());
            }
        });
    }

    private void updateBillStockOutDetailOutQty(String billNo, String wareId) throws Exception {
        String likeSql = billNo + "%" + wareId;
        List<Log> logList = Log.find("doc_id like ? and log_type = 2 group by thing_id, doc_id", likeSql);
        Map<String, Double> billAndOutQty = new HashMap<>();
        Map<String, Double> billAndSMTOutQty = new HashMap<>();
        Map<String, Double> billAndSMTTransferQty = new HashMap<>();
        long currentTime = getTimeLongFormat();

        for (Log storageLog : logList) {
            double log_count = storageLog.getDouble("log_count");
            String doc_id = storageLog.getString("doc_id");
            String[] billInfo = doc_id.split("\\|");   //(bill_no + "|" + bill_detail + "|" + material_id + "|"+ ware_id)
            List<ThingLog> thingLogList = ThingLog.find("thing_id = ? and situation like '2%' and situation != 26 and bill_no_out = ?", storageLog.getString("thing_id"), billInfo[0]);

            if (thingLogList != null && thingLogList.size() != 0) {
                double outQry = billAndOutQty.getOrDefault(doc_id, 0.0) + log_count;
                billAndOutQty.put(doc_id, outQry);
            }

            thingLogList = ThingLog.find("thing_id = ? and situation = '27' and bill_no_out = ?", storageLog.getString("thing_id"), billInfo[0]);
            if (thingLogList != null && thingLogList.size() != 0) {
                double SMTOutQry = billAndSMTOutQty.getOrDefault(doc_id, 0.0) + log_count;
                billAndSMTOutQty.put(doc_id, SMTOutQry);
            }

            thingLogList = ThingLog.find("thing_id = ? and situation = '26' and bill_no_out = ?", storageLog.getString("thing_id"), billInfo[0]);
            if (thingLogList != null && thingLogList.size() != 0) {
                double SMTTransferQry = billAndSMTTransferQty.getOrDefault(doc_id, 0.0) + log_count;
                billAndSMTTransferQty.put(doc_id, SMTTransferQry);
            }
        }
        int count = 0;
        for (Map.Entry<String, Double> map : billAndOutQty.entrySet()) {
            String[] billInfo = map.getKey().split("\\|");
            String ware_id = "";
            if (billInfo.length == 4)
                ware_id = billInfo[3];
            Double outQty = map.getValue();
            Double SMTOutQty = billAndSMTOutQty.get(map.getKey()) == null ? 0.0 : billAndSMTOutQty.get(map.getKey());
            Double TransferQty = billAndSMTTransferQty.get(map.getKey()) == null ? 0.0 : billAndSMTTransferQty.get(map.getKey());

//            BillStockOutDetail billStockOutDetail = BillStockOutDetail.findFirst("bill_no= ? and bill_detail = ? and material_id = ? and ware_id = ?"
//                    , billInfo[0], billInfo[1], billInfo[2], ware_id);
//            double transfer_qty = billStockOutDetail.get("transfer_qty") == null ? 0.0 : billStockOutDetail.getDouble("transfer_qty");
//            double newTransferQty = transfer_qty - SMTOutQty < 0 ? 0 : transfer_qty - SMTOutQty;
//            double original_out_qty = billStockOutDetail.get("out_qty") == null ? 0.0 : billStockOutDetail.getDouble("out_qty");

            count += BillStockOutDetail.update("out_qty = ?, transfer_qty = ?, modify_time = ?"
                    , "bill_no= ? and bill_detail = ? and material_id = ? and ware_id = ?"
                    , outQty, TransferQty - SMTOutQty, currentTime
                    , billInfo[0], billInfo[1], billInfo[2], ware_id);
        }
        if (count > 0)
            BillStockOutMain.update("status = 1, locked_by = '' , modify_time =?", "bill_no = ? and ware_id = ?", currentTime, billNo, wareId);
    }

    private void checkAndUpdateDetailAndMainStatus(String billNo, String wareId) {
        int detailFinishStatus = 1;
        int mainFinishStatus = 9;
        System.out.println("Start check Detail");
        BillStockOutDetail.update("status = ?", "bill_no = ? and ware_id = ? and quantity <= out_qty", detailFinishStatus, billNo, wareId);
//        int updateCount = BillStockOutDetail.update("status = ?", "bill_no = ? and ware_id = ? and quantity <= out_qty", detailFinishStatus, billNo, wareId);
//        if (updateCount == 0)
//            return;
        System.out.println("Start check Main");
        List<BillStockOutDetail> billStockOutDetailList = BillStockOutDetail.find("bill_no = ? and ware_id = ? and status != ?", billNo, wareId, detailFinishStatus);
        if (billStockOutDetailList == null || billStockOutDetailList.size() == 0) {
            System.out.println("Start update Main");
            int updateCount = BillStockOutMain.update("status = ?, locked_by = '' ", "bill_no = ? and ware_id = ?", mainFinishStatus, billNo, wareId);
            System.out.println("update Main To " + mainFinishStatus + ", success count " + updateCount);
        }
    }

    private RequestResult<?> updateAndDeleteThingLog(String key, String... bill_no) {
//        return ActiveJdbc.operTx(() -> {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DAY_OF_MONTH, -1);
        String create_time_after = new SimpleDateFormat("yyyy-MM-dd 00:00:00").format(cal.getTime());
        List<ThingLog> thingLogList;
        if (key.equals("end-inbound")) {
            thingLogList = ThingLog.find("create_time > ? and situation like '1%'", create_time_after);
        } else {
            if (bill_no.length != 0) {
                String sql = String.format("select * from a_storage_thing_log where create_time > '%s' and ( bill_no_out = '%s' ||  smt_stn_id = '%s')"
                        , create_time_after, bill_no[0], bill_no[0]) + " and situation like '2%'";
                System.out.println(sql);
                thingLogList = ThingLog.findBySQL(sql);
            } else {
                thingLogList = ThingLog.find("create_time > ? and situation like '2%' and bill_no_out is null and smt_stn_id is null"
                        , create_time_after);
            }
        }

        for (ThingLog thingLog : thingLogList) {

            String log_type = getLogType(thingLog.get("situation").toString());
            String create_time = thingLog.get("create_time").toString();

            Log log;
            if (log_type.equals("1")) {
                log = Log.findFirst("log_time = ? and thing_id = ? and log_type = '1'"
                        , create_time, thingLog.get("thing_id").toString());
                if (log == null) {
                    System.out.println("找不到mapping的log資料，要被刪掉了..Info : " + thingLog.get("thing_id").toString() + "|" + create_time);
                    thingLog.delete();
                    continue;
                }
                thingLog.set("store_grid_id_to", log.getString("store_grid_index"));
                thingLog.set("store_cell_id_to", log.getString("store_cell_index"));
            } else {

                if (thingLog.get("situation").toString().equals("24") || thingLog.get("situation").toString().equals("25")) {
                    log = Log.findFirst("thing_id = ? and log_type = '2' and (doc_id is null || doc_id = '') and log_time >= ? order by create_time desc"
                            , thingLog.get("thing_id").toString(), create_time);
                } else {
                    String billKey = "bill_no_out";
                    if (thingLog.get("situation").toString().equals("22"))
                        billKey = "smt_stn_id";

                    String likeSql = thingLog.get(billKey).toString() + "%";
                    log = Log.findFirst("thing_id = ? and log_type = '2' and doc_id like ?  and log_time >= ? order by create_time desc"
                            , thingLog.get("thing_id").toString(), likeSql, create_time);
                }

                if (log == null) {
                    thingLog.delete();
                    continue;
                }
                thingLog.set("store_grid_id_from", log.getString("store_grid_index"));
                thingLog.set("store_cell_id_from", log.getString("store_cell_index"));
            }
            thingLog.saveIt();
        }
        return RequestResult.success();
//        });
    }

    private String getLogType(String situation) {
        if (situation.startsWith("1"))
            return "1";
        return "2";
    }

    private Map<String, String> buildMap(String[] strings) {
        Map<String, String> map = new HashMap<>();
        for (int i = 0; i < strings.length; i += 2) {
            map.put(strings[i], strings[i + 1]);
        }
        return map;
    }

//    private boolean getMailConfig() {
//        try {
//            JsonParams jsonParams = new JsonParams("mail_config.json");
//            String defaultAccount = jsonParams.getAsString("ennoconn_default");
//            account = defaultAccount.split(",")[0];
//            password = defaultAccount.split(",")[1];
//            return true;
//        } catch (JsonParamsException e) {
//            e.printStackTrace();
//            return false;
//        }
//    }

    private void sendShortageMail(String billNo, String ware_id, List<Map<String, Object>> shortageInfo, int mail_type_id) {
        ActiveJdbc.operTx(() -> {
            try {
                BillStockOutMain billStockOutMain = BillStockOutMain.findFirst("bill_no = ? and ware_id = ?", billNo, ware_id);
                UserMailConfig userMailConfig = UserMailConfig.findFirst("mail_type_id = " + mail_type_id + " or mail_type_name = '發料單缺料通知'");
                String title = userMailConfig.getString("title_format").replace("%1", billNo);
                String[] content_format = userMailConfig.getString("content_format").split(",");
                if (content_format.length != 17)
                    return MailRecord(title, "content_format error", mail_type_id, false);


                List<MailServer> mailServer = MailServer.findAll();
                if (mailServer == null || mailServer.size() != 1)
                    return MailRecord(title, "mailServer error", mail_type_id, false);


                String account = mailServer.get(0).getString("account");
                String password = mailServer.get(0).getString("password");
                ConfigData configData = new ConfigData(
                        account,
                        password,
                        userMailConfig.getString("recipient"),
//                            "volume1325@gmail.com",
//                        String.format("發料單%s缺料通知", billNo),
                        title,
                        System.getProperty(SysPropKey.ROOT_PATH) + "/program/template/default_template_7table_1line_1table_9line.html"
                );
                configData.setHost(mailServer.get(0).getString("mail_server_ip"));
                configData.setPort(mailServer.get(0).getString("port"));

                DataTemplate dataTemplate = new DataTemplate();
                dataTemplate.replaceMap.put("herf", SERVER_IP + "/ServCloud/index.html#app/StockOutManagement/function/zh_tw/03_warehouse_material_search_and_case_closed.html");
                dataTemplate.replaceMap.put("alarm_str", "");
                dataTemplate.replaceMap.put("small_tiitle", content_format[0]);

                List<Map<String, String>> list1 = new ArrayList<>();
                dataTemplate.arrMap.put("arr1", list1);
                list1.add(buildMap(new String[]{"arr1", content_format[1].replace("%2", billNo)}));

                List<Map<String, String>> list2 = new ArrayList<>();
                dataTemplate.arrMap.put("arr2", list2);
                list2.add(buildMap(new String[]{"arr1", content_format[2].replace("%3", billStockOutMain.getString("stock_out_date"))}));

                List<Map<String, String>> list3 = new ArrayList<>();
                dataTemplate.arrMap.put("arr3", list3);
                list3.add(buildMap(new String[]{"arr1", content_format[3].replace("%4", billStockOutMain.getString("column_1") == null ? "null" : billStockOutMain.getString("column_1"))}));

                List<Map<String, String>> list4 = new ArrayList<>();
                dataTemplate.arrMap.put("arr4", list4);
                list4.add(buildMap(new String[]{"arr1", content_format[4].replace("%5", billStockOutMain.getString("column_2") == null ? "null" : billStockOutMain.getString("column_2"))}));

                List<Map<String, String>> list5 = new ArrayList<>();
                dataTemplate.arrMap.put("arr5", list5);
                list5.add(buildMap(new String[]{"arr1", content_format[5].replace("%6", billStockOutMain.getString("column_3") == null ? "null" : billStockOutMain.getString("column_3"))}));

                List<Map<String, String>> list6 = new ArrayList<>();
                dataTemplate.arrMap.put("arr6", list6);
                list6.add(buildMap(new String[]{"arr1", content_format[6].replace("%7", sdf.format(new Date()))}));

                List<Map<String, String>> list7 = new ArrayList<>();
                dataTemplate.arrMap.put("arr7", list7);
                list7.add(buildMap(new String[]{"arr1", content_format[7]}));

                List<Map<String, String>> list8 = new ArrayList<>();
                dataTemplate.arrMap.put("arr8", list8);
                list8.add(buildMap(new String[]{
                        "arr1", content_format[8],
                        "arr2", content_format[9],
                        "arr3", content_format[10],
                        "arr4", content_format[11],
                        "arr5", content_format[12],
                        "arr6", content_format[13],
                        "arr7", content_format[14],
                        "arr8", content_format[15],
                        "arr9", content_format[16]
                }));

                int writeDataCount = 0;
                for (Map<String, Object> resultMap : shortageInfo) {
                    writeDataCount++;

                    double quantity = (double) resultMap.get("quantity");
                    double out_qty = (double) resultMap.get("out_qty");
                    double shortage = (double) resultMap.get("shortage");

                    list8.add(buildMap(new String[]{
                            "arr1", resultMap.get("bill_detail").toString(),
                            "arr2", resultMap.get("material_id").toString(),
                            "arr3", String.valueOf(quantity),//工單總需求數
                            "arr4", resultMap.get("column_4").toString(), //單位
                            "arr5", resultMap.get("column_2").toString(), //組成用量
                            "arr6", String.valueOf(out_qty), //先前已發數量
                            "arr7", String.valueOf(quantity - out_qty),
                            "arr8", String.valueOf(quantity - out_qty - shortage),
                            "arr9", String.valueOf(shortage) //不足數
                    }));
                }
                if (writeDataCount != 0) {
                    if (mailManager.sendMail(dataTemplate, configData)) {
                        return MailRecord(title, "mail 發送成功", mail_type_id, Boolean.TRUE);
                    } else {
                        return MailRecord(title, "mail 發送失敗", mail_type_id, Boolean.FALSE);
                    }
                } else {
                    return RequestResult.success("");
                }
            } catch (Exception e) {
                Base.rollbackTransaction();
                e.printStackTrace();
                return RequestResult.fail(e.getMessage());
            }
        });
    }

    private static boolean MailRecord(String title, String jsonStr, int mail_type_id, boolean is_success) {
        try {
            EmailRecord insertEmailRecord = new EmailRecord();
            String is_send = is_success == Boolean.TRUE ? "Y" : "N";
            Date now = new Date();
            String today = yyyyMMdd.format(now);
            String sql = "SELECT * FROM a_ennoconn_email_record WHERE mail_id like '" + today + "%' and mail_type_id = " + mail_type_id + " ORDER BY mail_id DESC LIMIT 1";
            System.out.println("sql : " + sql);
            List<EmailRecord> emailRecordList = EmailRecord.findBySQL(sql);
            int number = 1;
            if (emailRecordList != null && emailRecordList.size() != 0) {
                String mail_id = emailRecordList.get(0).getString("mail_id");
                number = Integer.valueOf(mail_id.substring(mail_id.length() - 4, mail_id.length())) + 1;
            }
            String new_mail_id = today + String.format("%04d", number);
            insertEmailRecord.set("mail_id", new_mail_id,
                    "title", title,
                    "content", jsonStr,
                    "mail_type_id", mail_type_id,
                    "is_send", is_send,
                    "create_time", now);
            return insertEmailRecord.insert();
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return false;
        }
    }
}

