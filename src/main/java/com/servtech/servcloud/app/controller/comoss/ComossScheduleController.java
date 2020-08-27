package com.servtech.servcloud.app.controller.comoss;


import com.servtech.servcloud.app.controller.storage.util.RecordAfter;
import com.servtech.servcloud.app.model.comoss.MaterialScheduleThing;
import com.servtech.servcloud.app.model.comoss.ScheduleThing;
import com.servtech.servcloud.app.model.comoss.StoreScheduleThingMap;
import com.servtech.servcloud.app.model.comoss.view.PurchaseOrderMaterialPosition;
import com.servtech.servcloud.app.model.comoss.view.PurchaseOrderSchedule;
import com.servtech.servcloud.app.model.comoss.view.StoreThingPcs;
import com.servtech.servcloud.app.model.storage.Log;
import com.servtech.servcloud.app.model.storage.MaterialThing;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Model;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/comoss/schedule")
public class ComossScheduleController {
    private static final Logger LOG = LoggerFactory.getLogger(ComossScheduleController.class);
    private static final String LOCK = new String();
    Map<String, List<PurchaseOrderSchedule>> purchaseOrderScheduleGroupByStore = new HashMap<>();
    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        Optional<String> scheduleThingId = Optional.of(data.get("schedule_thing_id").toString());
        Optional<String> expDate = Optional.of(data.get("exp_date").toString());
        Optional<String> expEdate = Optional.of(data.get("exp_edate").toString());

        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                try {
                    long timeMillis = System.currentTimeMillis();
                    String userId = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "unKnow user" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    Date now = new Date();
                    ScheduleThing scheduleThing = ScheduleThing.findFirst("schedule_thing_id = ?", scheduleThingId.get());
                    if (scheduleThing == null)
                        throw new RuntimeException(scheduleThingId.get() + " is not exist");

                    scheduleThing.set("exp_date", expDate.get(), "exp_edate", expEdate.get(), "buffer_hour", data.get("buffer_hour"), "modify_by", userId, "modify_time", now);

                    if (!scheduleThing.saveIt())
                        throw new RuntimeException("update Schedule Thing fail...");


                    int generateCodeStatus = 1;
                    int count = MaterialScheduleThing.update("status = ?, modify_by = ? , modify_time = ?", "schedule_thing_id = ?", generateCodeStatus, userId, now, scheduleThingId.get());
                    if (count <= 0)
                        throw new RuntimeException("update Material Schedule Thing fail..");

                    Double cellIndex = Double.parseDouble(data.get("cell_index").toString());
                    data.put("cell_start_index", cellIndex);
                    data.put("cell_end_index", cellIndex.intValue() + scheduleThing.getInteger("thing_cell"));
                    data.put("thing_cell", scheduleThing.getString("thing_cell"));
                    data.put("thing_pcs", data.get("thing_pcs"));
                    RecordAfter.putCreateAndModify(data, userId, timeMillis);

                    StoreScheduleThingMap storeScheduleThingMap = StoreScheduleThingMap.findFirst("schedule_thing_id = ?", scheduleThingId.get());
                    if (storeScheduleThingMap == null) {
                        storeScheduleThingMap = new StoreScheduleThingMap();
                        storeScheduleThingMap.fromMap(data);
                        if (!storeScheduleThingMap.insert())
                            throw new RuntimeException("insert Store Schedule Thing Map fail...");
                    } else {
                        storeScheduleThingMap.set("store_id", data.get("store_id")
                                , "grid_index", data.get("grid_index")
                                , "cell_start_index", data.get("cell_start_index")
                                , "cell_end_index", data.get("cell_end_index")
                                , "modify_by", data.get("modify_by")
                                , "modify_time", data.get("modify_time"));
                        if (!storeScheduleThingMap.saveIt())
                            throw new RuntimeException("update Store Schedule Thing Map fail...");
                    }

                    return RequestResult.success();
                } catch (Exception e) {
                    e.printStackTrace();
                    return RequestResult.fail(data);
                }
            });
        }
    }

    @RequestMapping(value = "/mapping-real", method = RequestMethod.POST)
    public RequestResult<?> queryScheduleMappingReal(@RequestBody final Map data) {
//        Optional<String> materialType = Optional.ofNullable(data.get("material_type").toString());
//        Optional<String> gridIdx = Optional.ofNullable(data.get("grid_index").toString());
//        Optional<String> cellIdx = Optional.ofNullable(data.get("cell_index").toString());
//        Optional<String> expDate = Optional.ofNullable(data.get("exp_date").toString());
//        Optional<String> expEdate = Optional.ofNullable(data.get("exp_edate").toString());
        List<Map> demo = data.get("demo") == null ? null : (List<Map>) data.get("demo");

        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                try {
                    if (demo != null) {
                        return RequestResult.success(demo);
                    }
                    return RequestResult.success();
                } catch (Exception e) {
                    e.printStackTrace();
                    return RequestResult.fail(data);
                }
            });
        }
    }

    @RequestMapping(value = "/get-schedule-info", method = RequestMethod.POST)
    public RequestResult<?> getScheduleInfo(@RequestBody final Map data) {
        String purOrderType = data.get("pur_order_type").toString();
        String purId = data.get("pur_id").toString();
        String serialNum = data.get("serial_num").toString();
        String startDateStr = data.get("start_date").toString();
        String endDateStr = data.get("end_date").toString();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        purchaseOrderScheduleGroupByStore = new HashMap<>();
        return ActiveJdbc.operTx(() -> {
            try {
                Map<String, Object> result = new HashMap<>();
                Date startDate = sdf.parse(startDateStr);
                Date endDate = sdf.parse(endDateStr);
                String sql = String.format("select * from a_comoss_view_purchase_order_schedule where pur_order_type = '%s' and pur_id = '%s' and serial_num = '%s' and !(exp_edate < '%s' or exp_date > '%s') and store_id is not null order by store_id, cell_start_index, exp_date, schedule_thing_id"
                        , purOrderType, purId, serialNum, startDateStr + " 00:00:00", endDateStr + " 23:59:59");
                System.out.println("sql : " + sql);
                List<PurchaseOrderSchedule> purchaseOrderSchedules = PurchaseOrderSchedule.findBySQL(sql);

                List<PurchaseOrderMaterialPosition> purchaseOrderMaterialPositions = PurchaseOrderMaterialPosition.find("pur_order_type = ? and pur_id = ? and serial_num = ?", purOrderType, purId, serialNum);
                Set<String> storeSet = getPurchaseOrderSchedulesGroupByStore(purchaseOrderSchedules, purchaseOrderMaterialPositions);   //將查回來的資料依儲位分群

                for (String storeGroupStr : storeSet) {     //這張採購單放在幾個儲位，就跑幾次
                    startDate = sdf.parse(startDateStr);

                    //查詢區間有幾天，就要跑幾次
                    while (true) {
                        boolean allNoneMatch = true;

                        Map storeGroup = result.get(storeGroupStr) == null ? new HashMap<>() : (Map) result.get(storeGroupStr);

                        for (PurchaseOrderSchedule purchaseOrderSchedule : purchaseOrderScheduleGroupByStore.get(storeGroupStr)) {
                            Date exp_date = purchaseOrderSchedule.getDate("exp_date");
                            Date exp_edate = purchaseOrderSchedule.getDate("exp_edate");
                            String scheduleThingId = purchaseOrderSchedule.getString("schedule_thing_id");
                            if (startDate.before(exp_date) || startDate.after(exp_edate)) {
                                continue;
                            }
                            if(checkScheduleThingIsEnterWarehouse(scheduleThingId)){
                                continue;
                            }
                            allNoneMatch = false;

                            String expDateStr = sdf.format(startDate);
                            Map listGroupByDateAndStore = storeGroup.get(expDateStr) == null ? new HashMap<>() : (Map) storeGroup.get(expDateStr);

                            double total_thing_pcs = listGroupByDateAndStore.get("scheduleTotalThingPcs") == null ? 0.0 : (double) listGroupByDateAndStore.get("scheduleTotalThingPcs");
                            total_thing_pcs += Double.valueOf(purchaseOrderSchedule.getString("thing_pcs"));
                            listGroupByDateAndStore.put("scheduleTotalThingPcs", total_thing_pcs);

                            List<Map> thingsInfo = listGroupByDateAndStore.get("scheduleThingsInfo") == null ? new ArrayList<>() : (List<Map>) listGroupByDateAndStore.get("scheduleThingsInfo");
                            Map groupInfo = new HashMap<>();
                            groupInfo.put("scheduleThingId", scheduleThingId);
                            groupInfo.put("scheduleThingPcs", purchaseOrderSchedule.getString("thing_pcs"));
                            thingsInfo.add(groupInfo);
                            listGroupByDateAndStore.put("scheduleThingsInfo", thingsInfo);
                            storeGroup.put(expDateStr, listGroupByDateAndStore);
                            result.put(storeGroupStr, storeGroup);
                        }

                        if (allNoneMatch) {     //當天沒有任何預排資料的話要放 0 跟 空字串
                            Map listGroupByDateAndStore = new HashMap();
                            listGroupByDateAndStore.put("scheduleThingsInfo", new ArrayList<>());
                            listGroupByDateAndStore.put("scheduleTotalThingPcs", 0);
                            storeGroup.put(sdf.format(startDate), listGroupByDateAndStore);
                            result.put(storeGroupStr, storeGroup);
                        }

                        if (startDate.equals(endDate)) {        //跑到最後一天了，掰掰
                            break;
                        }
                        Calendar cal = Calendar.getInstance();
                        cal.setTime(startDate);
                        cal.add(Calendar.DAY_OF_WEEK, 1);
                        startDate = cal.getTime();
                    }
                }

                //這邊開始塞這些儲位，實際有放哪些原料(thing_id)還有數量多少
                for (Map.Entry<String, Object> entry : result.entrySet()) {
                    String key = entry.getKey();
                    Map storeGroup = (Map) entry.getValue();

                    String[] storeInfo = key.split("\\|");
                    sql = String.format("SELECT * from a_comoss_view_store_thing_pcs where store_id = '%s' and grid_index = '%s' and cell_start_index = '%s' and cell_end_index = '%s' and in_stock != 99"
                            , storeInfo[0], storeInfo[1], storeInfo[2], storeInfo[3]);
                    System.out.println("sql : " + sql);
                    List<StoreThingPcs> storeThingPcsList = StoreThingPcs.findBySQL(sql);
                    double realTotalThingPcs = 0.0;
                    List<Map> realThingIds = new ArrayList<>();
                    for (StoreThingPcs storeThingPcs : storeThingPcsList) {
                        double real_thing_pcs = Double.valueOf(storeThingPcs.getString("thing_pcs"));
                        if(real_thing_pcs == 0)
                            continue;
                        realTotalThingPcs += real_thing_pcs;

                        Map thingInfo = new HashMap();
                        thingInfo.put("thingId", storeThingPcs.getString("thing_id"));
                        thingInfo.put("thingPcs", real_thing_pcs);
                        realThingIds.add(thingInfo);
                    }
                    storeGroup.put("realTotalThingPcs", realTotalThingPcs);
                    storeGroup.put("realThingIds", realThingIds);
                }
                return RequestResult.success(result);
            } catch (Exception e) {
                e.printStackTrace();
                return RequestResult.fail(data);
            }
        });
    }

    private boolean checkScheduleThingIsEnterWarehouse(String scheduleThingId) {
        boolean result = false;
        List<MaterialThing> materialThings = MaterialThing.find("column3 = ?", scheduleThingId);
        if(materialThings == null || materialThings.size() == 0)
            return result;
        for(MaterialThing materialThing : materialThings){
            String thingId = materialThing.getString("thing_id");
            List<Log> logs = Log.find("thing_id = ?", thingId);
            if(logs.size() != 0)
                return true;
        }
        return result;
    }

    private Set<String> getPurchaseOrderSchedulesGroupByStore(List<PurchaseOrderSchedule> purchaseOrderSchedules, List<PurchaseOrderMaterialPosition> purchaseOrderMaterialPositions) {
        Set<String> result = new HashSet<>();
        for (PurchaseOrderSchedule purchaseOrderSchedule : purchaseOrderSchedules) {
            String storeGroupStr = getStoreGroupStr(purchaseOrderSchedule.toMap());
            List<PurchaseOrderSchedule> purchaseOrderScheduleList = purchaseOrderScheduleGroupByStore.get(storeGroupStr) == null ? new ArrayList<>() : purchaseOrderScheduleGroupByStore.get(storeGroupStr);
            purchaseOrderScheduleList.add(purchaseOrderSchedule);
            purchaseOrderScheduleGroupByStore.put(storeGroupStr, purchaseOrderScheduleList);

            result.add(storeGroupStr);
        }
        for (PurchaseOrderMaterialPosition purchaseOrderMaterialPosition : purchaseOrderMaterialPositions) {
            String storeGroupStr = getStoreGroupStr(purchaseOrderMaterialPosition.toMap());
            purchaseOrderScheduleGroupByStore.put(storeGroupStr, purchaseOrderScheduleGroupByStore.getOrDefault(storeGroupStr, new ArrayList<>()));
            result.add(storeGroupStr);
        }
        return result;
    }


    private String getStoreGroupStr(Map map) {
        StringBuffer sb = new StringBuffer();
        String spliter = "|";
        sb.append(map.get("store_id").toString());
        sb.append(spliter);
        sb.append(map.get("grid_index").toString());
        sb.append(spliter);
        sb.append(map.get("cell_start_index") == null ? map.get("cell_index").toString() : map.get("cell_start_index").toString());
        sb.append(spliter);
        sb.append(map.get("cell_end_index") == null ? Integer.valueOf(map.get("cell_index").toString()) + 1 : map.get("cell_end_index").toString());
        return sb.toString();
    }
}
