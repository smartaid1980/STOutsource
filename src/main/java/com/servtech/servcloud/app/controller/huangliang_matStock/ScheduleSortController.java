package com.servtech.servcloud.app.controller.huangliang_matStock;

import com.servtech.servcloud.app.bean.huangliang_matStock.Schedule;
import com.servtech.servcloud.app.model.huangliang_matStock.*;
import com.servtech.servcloud.app.model.huangliang_matStock.view.WoMStatusWoList;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;


import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;


@RestController
@RequestMapping("/huangliangMatStock/scheduleSort")
public class ScheduleSortController {
    private static final Logger log = LoggerFactory.getLogger(ScheduleSortController.class);
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    final String EMPTY = "";

    @RequestMapping(value = "/ProductionScheduling", method = RequestMethod.POST)
    public RequestResult<?> ProductionScheduling(@RequestBody final Map data) {
        Map<String, List<Object>> result = new HashMap<>();
        String orderId = data.get("order_id").toString();
        String expMdate = data.get("exp_mdate").toString();
        String expEdate = data.get("exp_edate").toString();
        String machineId = data.get("machine_id").toString();
        String scheduleTime = data.get("schedule_time") == null ? EMPTY : data.get("schedule_time").toString();
        Object includeExpTimes = data.get("include_exp_time");     //如果插入的預排起訖是已經包含停機(休假)時間，用此參數來避免停機與自己衝突

        List<Object> afterScheduleList = new ArrayList<>();
        List<Object> beforeScheduleList = new ArrayList<>();
        beforeScheduleList.add(new Schedule(orderId, scheduleTime, expMdate, expEdate, EMPTY, machineId));
        return ActiveJdbc.operTx(() -> {
            try {
                Map<String, Object> recordMap = new HashMap<>();
                List<String> nonProductionList = new ArrayList<>();
                if (includeExpTimes != null) {
                    nonProductionList = (List<String>)includeExpTimes;
                }
                recordMap.put("nonProductionList", nonProductionList);

                Schedule insertSchedule = new Schedule(orderId, scheduleTime, expMdate, expEdate, EMPTY, machineId);
                checkProductionSchedule(insertSchedule, beforeScheduleList, afterScheduleList, recordMap);
            } catch (ParseException e) {
                StringWriter sw = new StringWriter();
                e.printStackTrace(new PrintWriter(sw));
                log.info("Error : " + sw.toString());
                return fail("Error " + e.toString());
            }
            result.put("before", beforeScheduleList);
            result.put("after", afterScheduleList);
            return success(result);
        });
    }

    private void checkProductionSchedule(Schedule insertSchedule, List<Object> beforeScheduleList, List<Object> afterScheduleList, Map<String, Object> recordMap) throws ParseException {
        boolean isConflictAtAll = true;
        boolean isConflictWithNonProduct;
        boolean isConflictWithWoMStatus;
        boolean isConflictWithProductionSchedule;
        while (isConflictAtAll) {
            isConflictWithNonProduct = checkTimeConflictWithNonProduct(insertSchedule, recordMap);
            if (isConflictWithNonProduct)
                continue;
            isConflictWithWoMStatus = checkProductionSchedulingTimeConflictWithWoMStatus(insertSchedule, recordMap);
            if (isConflictWithWoMStatus)
                continue;
            Map<String, Object> map = checkProductionScheduleTimeConflictWithProductionSchedule(insertSchedule, recordMap);
            isConflictWithProductionSchedule = (boolean) map.get("isTimeConflict");
            afterScheduleList.add(insertSchedule);
            if (isConflictWithProductionSchedule) {
                Schedule beforeProductionSchedule = (Schedule) map.get("beforeProductionSchedule");
                beforeScheduleList.add(beforeProductionSchedule);
                Schedule afterProductionSchedule = (Schedule) map.get("afterProductionSchedule");
                insertSchedule = afterProductionSchedule;
                continue;
            }
            isConflictAtAll = false;
        }
    }

    @RequestMapping(value = "/WoMStatusScheduling", method = RequestMethod.POST)
    public RequestResult<?> WoMStatusScheduling(@RequestBody final Map data) {
        Map<String, List<Object>> result = new HashMap<>();
        String orderId = data.get("order_id").toString();
        String expMdate = data.get("exp_mdate").toString();
        String expEdate = data.get("exp_edate").toString();
        String machineId = data.get("machine_id").toString();
        String woMTime = data.get("wo_m_time") == null ? EMPTY : data.get("wo_m_time").toString();
        List<String> includeExpTimes = data.get("include_exp_time") == null ? null : (List<String>)data.get("include_exp_time");

        List<Object> afterScheduleList = new ArrayList<>();
        List<Object> beforeScheduleList = new ArrayList<>();
        beforeScheduleList.add(new Schedule(orderId, EMPTY, expMdate, expEdate, woMTime, machineId));
        return ActiveJdbc.operTx(() -> {
            try {
                Schedule insertSchedule = new Schedule(orderId, EMPTY, expMdate, expEdate, woMTime, machineId);
                Map<String, Object> recordMap = new HashMap<>();
                List<String> nonProductionList = new ArrayList<>();
                if (includeExpTimes != null) {
                    nonProductionList = (List<String>)includeExpTimes;

                }
                recordMap.put("nonProductionList", nonProductionList);

                checkWoMStatus(insertSchedule, afterScheduleList, beforeScheduleList, recordMap);
            } catch (ParseException e) {
                StringWriter sw = new StringWriter();
                e.printStackTrace(new PrintWriter(sw));
                log.info("Error : " + sw.toString());
                return fail("Error " + e.toString());
            }
            result.put("before", beforeScheduleList);
            result.put("after", afterScheduleList);
            return success(result);
        });
    }

    private void checkWoMStatus(Schedule insertSchedule, List<Object> afterScheduleList, List<Object> beforeScheduleList, Map<String, Object> recordMap) throws ParseException {
        boolean isConflictAtAll = true;
        boolean isConflictWithNonProduct;
        boolean isConflictWithWoMStatus;
        boolean isConflictWithProductionSchedule;
        while (isConflictAtAll) {
            isConflictWithNonProduct = checkTimeConflictWithNonProduct(insertSchedule, recordMap);
            if (isConflictWithNonProduct)
                continue;
            isConflictWithWoMStatus = checkWoMStatusTimeConflictWithWoMStatus(insertSchedule, recordMap);
            if (isConflictWithWoMStatus)
                continue;
            Map<String, Object> map = checkWoMStatusTimeConflictWithProductionSchedule(insertSchedule, recordMap);
            isConflictWithProductionSchedule = (boolean) map.get("isTimeConflict");
            afterScheduleList.add(insertSchedule);
            if (isConflictWithProductionSchedule) {
                Schedule beforeProductionSchedule = (Schedule) map.get("beforeProductionSchedule");
                beforeScheduleList.add(beforeProductionSchedule);
                insertSchedule = (Schedule) map.get("afterProductionSchedule");

                boolean isConflictWithProductionScheduleAtAll = true;
                boolean isProductionScheduleConflictWithNonProduct;
                boolean isProductionScheduleConflictWithWoMStatus;
                boolean isProductionScheduleConflictWithProductionSchedule;
                Map<String, Object> recordProductionScheduleMap = new HashMap<>();
                while (isConflictWithProductionScheduleAtAll) {
                    isProductionScheduleConflictWithNonProduct = checkTimeConflictWithNonProduct(insertSchedule, recordProductionScheduleMap);
                    if (isProductionScheduleConflictWithNonProduct)
                        continue;
                    isProductionScheduleConflictWithWoMStatus = checkProductionSchedulingTimeConflictWithWoMStatus(insertSchedule, recordProductionScheduleMap);
                    if (isProductionScheduleConflictWithWoMStatus)
                        continue;
                    Map<String, Object> map2 = checkProductionScheduleTimeConflictWithProductionSchedule(insertSchedule, recordProductionScheduleMap);
                    isProductionScheduleConflictWithProductionSchedule = (boolean) map2.get("isTimeConflict");
                    afterScheduleList.add(insertSchedule);
                    if (isProductionScheduleConflictWithProductionSchedule) {
                        Schedule before = (Schedule) map2.get("beforeProductionSchedule");
                        beforeScheduleList.add(before);
                        insertSchedule = (Schedule) map2.get("afterProductionSchedule");
                        continue;
                    }
                    isConflictWithProductionScheduleAtAll = false;
                }
            }
            isConflictAtAll = false;
        }
    }

    @RequestMapping(value = "/NonProductionScheduling", method = RequestMethod.POST)
    public RequestResult<?> NonProductionScheduling(@RequestBody final Map data) {
        Map<String, List<Object>> result = new HashMap<>();
        Object oldExpTime = data.get("old_exp_time");
        String expMdate = data.get("exp_time").toString();
        String expEdate = data.get("exp_edate").toString();
        String machineId = data.get("machine_id").toString();
        String purpose = data.get("purpose").toString();

        List<Object> afterScheduleList = new ArrayList<>();
        List<Object> beforeScheduleList = new ArrayList<>();
        beforeScheduleList.add(new Schedule(EMPTY, EMPTY, expMdate, expEdate, EMPTY, machineId));
        return ActiveJdbc.operTx(() -> {
            try {
                Schedule insertSchedule = new Schedule(EMPTY, EMPTY, expMdate, expEdate, EMPTY, machineId);
                insertSchedule.setPurpose(purpose);
                boolean isConflictWithWoMStatus;
                boolean isConflictWithProductionSchedule;

                //避免檢查衝突時，自己與自己衝突
                Map<String, Object> recordMap = new HashMap<>();
                List<String> nonProductionListForW = new ArrayList<>();
                List<String> nonProductionListForP = new ArrayList<>();
                if (oldExpTime != null) {
                    nonProductionListForW = (List<String>)oldExpTime;
                    nonProductionListForP = (List<String>)oldExpTime;
                }
                recordMap.put("nonProductionList", nonProductionListForW);

                //檢查插入的停機與派工有無衝突
                Map<String, Object> map = checkNonProductionTimeConflictWithWoMStatus(insertSchedule, recordMap);
                isConflictWithWoMStatus = (boolean) map.get("isTimeConflict");
                afterScheduleList.add(insertSchedule);
                if (isConflictWithWoMStatus) {
                    Schedule beforeWoMStatus = (Schedule) map.get("beforeWoMStatus");
                    beforeScheduleList.add(beforeWoMStatus);
                    checkWoMStatus((Schedule) map.get("afterWoMStatus"), afterScheduleList, beforeScheduleList, recordMap);
                }

                //覆蓋掉檢查派工時因衝突後被加入的停機，只留API呼叫時要插入的停機
//                nonProductionList.clear();
//                if (data.get("old_exp_time") != null) {
//                    nonProductionListForP = (List<String>)data.get("old_exp_time");
//                }
                recordMap.put("nonProductionList", nonProductionListForP);
                for(String test : nonProductionListForP){
                    System.out.println("nonProductionList : " + test);
                }
                //檢查插入的停機與預排有無衝突
                Map<String, Object> map2 = checkNonProductionTimeConflictWithProductionSchedule(insertSchedule, recordMap);
                isConflictWithProductionSchedule = (boolean) map2.get("isTimeConflict");
                if (isConflictWithProductionSchedule) {
                    Schedule beforeProductionSchedule = (Schedule) map2.get("beforeProductionSchedule");
                    beforeScheduleList.add(beforeProductionSchedule);
                    checkProductionSchedule((Schedule) map2.get("afterProductionSchedule"), beforeScheduleList, afterScheduleList, recordMap);
                }
            } catch (ParseException e) {
                StringWriter sw = new StringWriter();
                e.printStackTrace(new PrintWriter(sw));
                log.info("Error : " + sw.toString());
                return fail("Error " + e.toString());
            }
            result.put("before", beforeScheduleList);
            result.put("after", afterScheduleList);
            return success(result);
        });
    }

    //情境1 : 派工或預排 與 停機的衝突處理
    private boolean checkTimeConflictWithNonProduct(Schedule insertSchedule, Map<String, Object> recordMap) throws ParseException {
        String whereIn = "";
        if (recordMap != null && recordMap.get("nonProductionList") != null)
            whereIn = getWhereIn((List<String>) recordMap.get("nonProductionList"));
        NonProduction nonProduction = NonProduction.findFirst(
                "machine_id = ? AND status = 0 AND !(exp_time < ? and exp_edate <= ?) AND !(exp_time >= ? and exp_edate > ?) " + whereIn + " order by exp_time"
                , insertSchedule.getMachineId(), insertSchedule.getExpMdate(), insertSchedule.getExpMdate(), insertSchedule.getExpEdate(), insertSchedule.getExpEdate());
        if (nonProduction == null)
            return false;
        Map queryResult = nonProduction.toMap();
        Map<String, Date> newTimeMap;
        Date startPreScheduleTime = sdf.parse(insertSchedule.getExpMdate());
        Date endPreScheduleTime = sdf.parse(insertSchedule.getExpEdate());
        Date startDowntimeScheduleTime = sdf.parse(queryResult.get("exp_time").toString());
        Date endDowntimeScheduleTime = sdf.parse(queryResult.get("exp_edate").toString());
        if (!isTimeConflict(startDowntimeScheduleTime, endDowntimeScheduleTime, startPreScheduleTime, endPreScheduleTime))
            return false;
        if (queryResult.get("purpose").toString().equals("9")) {
            List<String> nonProductionList = recordMap.get("nonProductionList") == null ? new ArrayList<>() : (List<String>) recordMap.get("nonProductionList");
            nonProductionList.add(queryResult.get("exp_time").toString());
            recordMap.put("nonProductionList", nonProductionList);
            newTimeMap = getSplitScheduleTime(startPreScheduleTime, endPreScheduleTime, startDowntimeScheduleTime, endDowntimeScheduleTime);
        } else {
            if (recordMap.get("startPreScheduleTime") != null) {
                startPreScheduleTime = (Date) recordMap.get("startPreScheduleTime");
                endPreScheduleTime = (Date) recordMap.get("endPreScheduleTime");
            }
            newTimeMap = getMoveBehindScheduleTime(startPreScheduleTime, endPreScheduleTime, startDowntimeScheduleTime, endDowntimeScheduleTime);
        }
        insertSchedule.setExpMdate(sdf.format(newTimeMap.get("newStartScheduleTime")));
        insertSchedule.setExpEdate(sdf.format(newTimeMap.get("newEndScheduleTime")));
        return true;
    }

    //情境2 : 預排 與 派工的衝突處理
    private boolean checkProductionSchedulingTimeConflictWithWoMStatus(Schedule insertSchedule, Map<String, Object> recordMap) throws ParseException {
        WoMStatusWoList woMStatus = WoMStatusWoList.findFirst("machine_id = ? AND !(exp_mdate < ? and exp_edate <= ?) AND !(exp_mdate >= ? and exp_edate > ?) AND w_m_status NOT IN (99,9) order by exp_mdate",
                insertSchedule.getMachineId(), insertSchedule.getExpMdate(), insertSchedule.getExpMdate(), insertSchedule.getExpEdate(), insertSchedule.getExpEdate());
        if (woMStatus == null)
            return false;
        Map queryResult = woMStatus.toMap();
        Date startPreScheduleTime = sdf.parse(insertSchedule.getExpMdate());
        Date endPreScheduleTime = sdf.parse(insertSchedule.getExpEdate());
        Date startDowntimeScheduleTime = sdf.parse(queryResult.get("exp_mdate").toString());
        Date endDowntimeScheduleTime = sdf.parse(queryResult.get("exp_edate").toString());
        if (!isTimeConflict(startDowntimeScheduleTime, endDowntimeScheduleTime, startPreScheduleTime, endPreScheduleTime))
            return false;
        if (recordMap.get("startPreScheduleTime") != null) {
            startPreScheduleTime = (Date) recordMap.get("startPreScheduleTime");
            endPreScheduleTime = (Date) recordMap.get("endPreScheduleTime");
        }
        Map<String, Date> newTimeMap = getMoveBehindScheduleTime(startPreScheduleTime, endPreScheduleTime, startDowntimeScheduleTime, endDowntimeScheduleTime);
        insertSchedule.setExpMdate(sdf.format(newTimeMap.get("newStartScheduleTime")));
        insertSchedule.setExpEdate(sdf.format(newTimeMap.get("newEndScheduleTime")));
        return true;
    }

    //情境3 : 停機 與 派工的衝突處理
    private Map<String, Object> checkNonProductionTimeConflictWithWoMStatus(Schedule insertSchedule, Map<String, Object> recordMap) throws ParseException {
        Map<String, Object> result = new HashMap<>();
        result.put("isTimeConflict", false);
        WoMStatusWoList woMStatus = WoMStatusWoList.findFirst("machine_id = ? AND !(exp_mdate < ? and exp_edate < ?) AND !(exp_mdate > ? and exp_edate > ?) AND w_m_status NOT IN (99,9) order by exp_mdate",
                insertSchedule.getMachineId(), insertSchedule.getExpMdate(), insertSchedule.getExpMdate(), insertSchedule.getExpEdate(), insertSchedule.getExpEdate());
        if (woMStatus == null)
            return result;
        Map queryResult = woMStatus.toMap();
        Map<String, Date> newTimeMap;
        String purpose = insertSchedule.getPurpose();
        Date startPreScheduleTime = sdf.parse(insertSchedule.getExpMdate());
        Date endPreScheduleTime = sdf.parse(insertSchedule.getExpEdate());
        Date startWoMStatusTime = sdf.parse(queryResult.get("exp_mdate").toString());
        Date endWoMStatusTime = sdf.parse(queryResult.get("exp_edate").toString());
        if (!isTimeConflict(startWoMStatusTime, endWoMStatusTime, startPreScheduleTime, endPreScheduleTime))
            return result;
        result.put("isTimeConflict", true);
        result.put("beforeWoMStatus", WoMStatusMapToScheduleObj(queryResult));
        recordMap.put("startPreScheduleTime", startWoMStatusTime);
        recordMap.put("endPreScheduleTime", endWoMStatusTime);
        if (purpose.equals("9")) {
            newTimeMap = getSplitScheduleTime(startWoMStatusTime, endWoMStatusTime, startPreScheduleTime, endPreScheduleTime);
        } else {
            newTimeMap = getMoveBehindScheduleTime(startWoMStatusTime, endWoMStatusTime, startPreScheduleTime, endPreScheduleTime);
        }
        queryResult.put("exp_mdate", sdf.format(newTimeMap.get("newStartScheduleTime")));
        queryResult.put("exp_edate", sdf.format(newTimeMap.get("newEndScheduleTime")));
        result.put("afterWoMStatus", WoMStatusMapToScheduleObj(queryResult));
        return result;
    }

    private Schedule WoMStatusMapToScheduleObj(Map map) {
        return new Schedule(map.get("order_id").toString(), EMPTY, map.get("exp_mdate").toString(), map.get("exp_edate").toString(), map.get("wo_m_time").toString()
                , map.get("machine_id").toString(), map.get("m_qty").toString(), map.get("exp_date").toString(), map.get("product_id").toString());
    }

    private Schedule ProductionScheduleMapToScheduleObj(Map map) {
        return new Schedule(map.get("order_id").toString(), map.get("schedule_time").toString(), map.get("exp_mdate").toString()
                , map.get("exp_edate").toString(), EMPTY, map.get("machine_id").toString(), map.get("schedule_quantity").toString());
    }

    //情境4 : 停機 與 預排的衝突處理
    private Map<String, Object> checkNonProductionTimeConflictWithProductionSchedule(Schedule insertSchedule, Map<String, Object> recordMap) throws ParseException {
        Map<String, Object> result = new HashMap<>();
        result.put("isTimeConflict", false);
        ProductionScheduling productionScheduling = ProductionScheduling.findFirst(
                "machine_id = ? AND !(exp_mdate < ? and exp_edate <= ?) AND !(exp_mdate >= ? and exp_edate > ?) AND schedule_status = 0 order by exp_mdate"
                , insertSchedule.getMachineId(), insertSchedule.getExpMdate(), insertSchedule.getExpMdate(), insertSchedule.getExpEdate(), insertSchedule.getExpEdate());
        if (productionScheduling == null)
            return result;
        Map queryResult = productionScheduling.toMap();
        Map<String, Date> newTimeMap;
        String purpose = insertSchedule.getPurpose();
        Date startPreScheduleTime = sdf.parse(insertSchedule.getExpMdate());
        Date endPreScheduleTime = sdf.parse(insertSchedule.getExpEdate());
        Date startProductionSchedulingTime = sdf.parse(queryResult.get("exp_mdate").toString());
        Date endProductionSchedulingTime = sdf.parse(queryResult.get("exp_edate").toString());
        if (!isTimeConflict(startProductionSchedulingTime, endProductionSchedulingTime, startPreScheduleTime, endPreScheduleTime))
            return result;
        result.put("isTimeConflict", true);
        result.put("beforeProductionSchedule", ProductionScheduleMapToScheduleObj(queryResult));
        recordMap.put("startPreScheduleTime", startProductionSchedulingTime);
        recordMap.put("endPreScheduleTime", endProductionSchedulingTime);
        if (purpose.equals("9")) {
            newTimeMap = getSplitScheduleTime(startProductionSchedulingTime, endProductionSchedulingTime, startPreScheduleTime, endPreScheduleTime);
        } else {
            newTimeMap = getMoveBehindScheduleTime(startProductionSchedulingTime, endProductionSchedulingTime, startPreScheduleTime, endPreScheduleTime);
        }
        queryResult.put("exp_mdate", sdf.format(newTimeMap.get("newStartScheduleTime")));
        queryResult.put("exp_edate", sdf.format(newTimeMap.get("newEndScheduleTime")));
        result.put("afterProductionSchedule", ProductionScheduleMapToScheduleObj(queryResult));
        return result;
    }

    //情境5 : 派工 與 預排的衝突處理
    private Map<String, Object> checkWoMStatusTimeConflictWithProductionSchedule(Schedule insertSchedule, Map<String, Object> recordMap) throws ParseException {
        Map<String, Object> result = new HashMap<>();
        result.put("isTimeConflict", false);
        ProductionScheduling productionScheduling = ProductionScheduling.findFirst(
                "machine_id = ? AND !(exp_mdate < ? and exp_edate <= ?) AND !(exp_mdate >= ? and exp_edate > ?) AND schedule_status = 0 order by exp_mdate"
                , insertSchedule.getMachineId(), insertSchedule.getExpMdate(), insertSchedule.getExpMdate(), insertSchedule.getExpEdate(), insertSchedule.getExpEdate());
        if (productionScheduling == null)
            return result;
        Map queryResult = productionScheduling.toMap();
        Date startPreScheduleTime = sdf.parse(insertSchedule.getExpMdate());
        Date endPreScheduleTime = sdf.parse(insertSchedule.getExpEdate());
        Date startProductionSchedulingTime = sdf.parse(queryResult.get("exp_mdate").toString());
        Date endProductionSchedulingTime = sdf.parse(queryResult.get("exp_edate").toString());
        if (!isTimeConflict(startProductionSchedulingTime, endProductionSchedulingTime, startPreScheduleTime, endPreScheduleTime))
            return result;
        result.put("isTimeConflict", true);
        result.put("beforeProductionSchedule", ProductionScheduleMapToScheduleObj(queryResult));
        recordMap.put("startPreScheduleTime", startProductionSchedulingTime);
        recordMap.put("endPreScheduleTime", endProductionSchedulingTime);
        Map<String, Date> newTimeMap = getMoveBehindScheduleTime(startProductionSchedulingTime, endProductionSchedulingTime, startPreScheduleTime, endPreScheduleTime);
        queryResult.put("exp_mdate", sdf.format(newTimeMap.get("newStartScheduleTime")));
        queryResult.put("exp_edate", sdf.format(newTimeMap.get("newEndScheduleTime")));
        result.put("afterProductionSchedule", ProductionScheduleMapToScheduleObj(queryResult));
        return result;
    }

    //情境6 : 預排 與 預排的衝突處理
    private Map<String, Object> checkProductionScheduleTimeConflictWithProductionSchedule(Schedule insertSchedule, Map<String, Object> recordMap) throws ParseException {
        Map<String, Object> result = new HashMap<>();
        result.put("isTimeConflict", false);
        ProductionScheduling productionScheduling = ProductionScheduling.findFirst(
                "machine_id = ? AND !(exp_mdate < ? and exp_edate <= ?) AND !(exp_mdate >= ? and exp_edate > ?) AND schedule_status = 0  AND ( order_id != ? OR schedule_time != ? ) order by exp_mdate"
                , insertSchedule.getMachineId(), insertSchedule.getExpMdate(), insertSchedule.getExpMdate(), insertSchedule.getExpEdate(), insertSchedule.getExpEdate(), insertSchedule.getOrderId(), insertSchedule.getScheduleTime());
        if (productionScheduling == null)
            return result;
        Map queryResult = productionScheduling.toMap();
        Date startPreScheduleTime = sdf.parse(insertSchedule.getExpMdate());
        Date endPreScheduleTime = sdf.parse(insertSchedule.getExpEdate());
        Date startProductionSchedulingTime = sdf.parse(queryResult.get("exp_mdate").toString());
        Date endProductionSchedulingTime = sdf.parse(queryResult.get("exp_edate").toString());
        if (!isTimeConflict(startProductionSchedulingTime, endProductionSchedulingTime, startPreScheduleTime, endPreScheduleTime))
            return result;
        result.put("isTimeConflict", true);
        Schedule s1 = ProductionScheduleMapToScheduleObj(queryResult);
        recordMap.put("startPreScheduleTime", startProductionSchedulingTime);
        recordMap.put("endPreScheduleTime", endProductionSchedulingTime);
        result.put("beforeProductionSchedule", s1);
        Map<String, Date> newTimeMap = getMoveBehindScheduleTime(startProductionSchedulingTime, endProductionSchedulingTime, startPreScheduleTime, endPreScheduleTime);
        queryResult.put("exp_mdate", sdf.format(newTimeMap.get("newStartScheduleTime")));
        queryResult.put("exp_edate", sdf.format(newTimeMap.get("newEndScheduleTime")));
        Schedule s2 = ProductionScheduleMapToScheduleObj(queryResult);
        result.put("afterProductionSchedule", s2);
        return result;
    }

    //情境7 : 派工 與 派工的衝突處理
    private boolean checkWoMStatusTimeConflictWithWoMStatus(Schedule insertSchedule, Map<String, Object> recordMap) throws ParseException {
        WoMStatusWoList woMStatus = WoMStatusWoList.findFirst(
                "machine_id = ? AND !(exp_mdate < ? and exp_edate <= ?) AND !(exp_mdate >= ? and exp_edate > ?) AND w_m_status NOT IN (99,9) AND ( order_id != ? OR wo_m_time != ? ) order by exp_mdate",
                insertSchedule.getMachineId(), insertSchedule.getExpMdate(), insertSchedule.getExpMdate(), insertSchedule.getExpEdate(), insertSchedule.getExpEdate(), insertSchedule.getOrderId(), insertSchedule.getWoMTime());
        if (woMStatus == null)
            return false;
        Map queryResult = woMStatus.toMap();
        Date startPreScheduleTime = sdf.parse(insertSchedule.getExpMdate());
        Date endPreScheduleTime = sdf.parse(insertSchedule.getExpEdate());
        Date startDowntimeScheduleTime = sdf.parse(queryResult.get("exp_mdate").toString());
        Date endDowntimeScheduleTime = sdf.parse(queryResult.get("exp_edate").toString());
        if (!isTimeConflict(startDowntimeScheduleTime, endDowntimeScheduleTime, startPreScheduleTime, endPreScheduleTime))
            return false;
        if (recordMap.get("startPreScheduleTime") == null) {
            startPreScheduleTime = (Date) recordMap.get("startPreScheduleTime");
            endPreScheduleTime = (Date) recordMap.get("endPreScheduleTime");
        }
        Map<String, Date> newTimeMap = getMoveBehindScheduleTime(startPreScheduleTime, endPreScheduleTime, startDowntimeScheduleTime, endDowntimeScheduleTime);
        insertSchedule.setExpMdate(sdf.format(newTimeMap.get("newStartScheduleTime")));
        insertSchedule.setExpEdate(sdf.format(newTimeMap.get("newEndScheduleTime")));
        return true;
    }

    //取得被後移的新插單時間起訖
    private Map<String, Date> getMoveBehindScheduleTime(Date startMoveScheduleTime, Date endMoveScheduleTime, Date startFixedScheduleTime, Date endFixedScheduleTime) {
        Map<String, Date> result = new HashMap<>();
        Date newEndPreScheduleTime = getNewEndScheduleTIme(endFixedScheduleTime, startMoveScheduleTime, endMoveScheduleTime);
        result.put("newStartScheduleTime", endFixedScheduleTime);
        result.put("newEndScheduleTime", newEndPreScheduleTime);
        return result;
    }

    //取得被分割的新插單時間起
    private Map<String, Date> getSplitScheduleTime(Date startMoveScheduleTime, Date endMoveScheduleTime, Date startFixedScheduleTime, Date endFixedScheduleTime) {
        //只有差單的起始時間大於停機起始時間才會被拆成兩半，小於等於的話就跟"維護"的規則一樣
        if (!startMoveScheduleTime.before(startFixedScheduleTime))
            return getMoveBehindScheduleTime(startMoveScheduleTime, endMoveScheduleTime, startFixedScheduleTime, endFixedScheduleTime);
        Map<String, Date> result = new HashMap<>();
        int durationSec = getDurationSec(startMoveScheduleTime, endMoveScheduleTime) - getDurationSec(startMoveScheduleTime, startFixedScheduleTime);
        Calendar cal = Calendar.getInstance();
        cal.setTime(endFixedScheduleTime);
        cal.add(Calendar.SECOND, durationSec);
        result.put("newEndScheduleTime", cal.getTime());
        result.put("newStartScheduleTime", startMoveScheduleTime);
        return result;
    }

    private boolean isTimeConflict(Date startScheduleTime, Date endScheduleTime, Date tempConflictStartTime, Date tempConflictEndTime) {
        //四種時間衝突情境回傳true
        if (tempConflictStartTime.before(startScheduleTime)
                && tempConflictEndTime.after(startScheduleTime)
                && tempConflictEndTime.before(endScheduleTime)) {
            return true;
        }
        if (tempConflictStartTime.after(startScheduleTime)
                && tempConflictEndTime.after(startScheduleTime)
                && tempConflictEndTime.before(endScheduleTime)) {
            return true;
        }
        if (tempConflictStartTime.after(startScheduleTime)
                && tempConflictEndTime.after(startScheduleTime)
                && tempConflictEndTime.after(endScheduleTime)) {
            return true;
        }
        if (tempConflictStartTime.compareTo(startScheduleTime) <= 0
                && tempConflictEndTime.compareTo(startScheduleTime) > 0) {
            return true;
        }
        return false;
    }

    private String getWhereIn(List<String> nonProductionConflict) {
        if (nonProductionConflict.size() == 0)
            return "";
        StringBuffer sb = new StringBuffer(" AND exp_time NOT IN ('");
        for (int i = 0; i < nonProductionConflict.size(); i++) {
            sb.append(nonProductionConflict.get(i));
            if (i == nonProductionConflict.size() - 1) {
                sb.append("') ");
            } else {

                sb.append("','");
            }
        }
        System.out.println(sb.toString());
        return sb.toString();
    }

    private Date getNewEndScheduleTIme(Date startFreeTime, Date startScheduleTime, Date endScheduleTime) {
        int durationSec = getDurationSec(startScheduleTime, endScheduleTime);
        Calendar cal = Calendar.getInstance();
        cal.setTime(startFreeTime);
        cal.add(Calendar.SECOND, durationSec);
        return cal.getTime();
    }

    private int getDurationSec(Date startTime, Date endTime) {
        return (int) ((endTime.getTime() - startTime.getTime()) / 1000);
    }

}