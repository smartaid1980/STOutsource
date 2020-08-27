package com.servtech.servcloud.app.controller.huangliang_matStock;


import com.servtech.hippopotamus.Atom;
import com.servtech.hippopotamus.HippoFactory;
import com.servtech.servcloud.app.bean.huangliang_matStock.Schedule;
import com.servtech.servcloud.app.controller.huangliang_matStock.bean.RecommendResult;
import com.servtech.servcloud.app.model.huangliang.CustomerPriority;
import com.servtech.servcloud.app.model.huangliang.QualityExamData;
import com.servtech.servcloud.app.model.huangliang_matStock.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import org.javalite.activejdbc.Base;
import org.javalite.activejdbc.Model;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static com.servtech.servcloud.core.util.SysPropKey.ROOT_PATH;
import static com.servtech.servcloud.core.util.SysPropKey.WEB_ROOT_PATH;


@RestController
@RequestMapping("/huangliangMatStock/schedule")
public class ScheduleRecommendController {
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    private static final Logger log = LoggerFactory.getLogger(ScheduleRecommendController.class);
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    String hippoXmlPath = null;
    private static int INVALID_PRIORITY = 0;
    String regex = "[0-9]";
    Pattern pattern = Pattern.compile(regex);
    String CHECK_SCHEDULE_MODE = "0";
    String RECOMMEND_SCHEDULE_MODE = "1";
    static String EMPTY = "";


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

    private Date getNewEndScheduleTime(Date baseTime, Date startScheduleTime, Date endScheduleTime) {
        int durationSec = getDurationSec(startScheduleTime, endScheduleTime);
        Calendar cal = Calendar.getInstance();
        cal.setTime(baseTime);
        cal.add(Calendar.SECOND, durationSec);
        return cal.getTime();
    }

    private Date getNewStartScheduleTime(Date baseTime, Date startScheduleTime, Date endScheduleTime) {
        int durationSec = getDurationSec(startScheduleTime, endScheduleTime);
        Calendar cal = Calendar.getInstance();
        cal.setTime(baseTime);
        cal.add(Calendar.SECOND, -durationSec);
        return cal.getTime();
    }

    private boolean checkShiftAHaveFreeTime(Date startFreeTime, Date endFreeTime) {
        //區間有空檔可塞入
        int freeDurationSec = getDurationSec(startFreeTime, endFreeTime);
        if (freeDurationSec > 0) {
            return true;
        }
        return false;
    }

    private int getDurationSec(Date startTime, Date endTime) {
        return (int) ((endTime.getTime() - startTime.getTime()) / 1000);
    }

    @RequestMapping(value = "/getstdhour", method = RequestMethod.POST)
    public RequestResult<?> getStdhour(@RequestBody final Map data) {
        File webRootPath = new File(System.getProperty(WEB_ROOT_PATH));
        String orderHistoryPath = webRootPath.getParentFile().getParentFile().getPath() + "\\zebraFoee\\orderhistory.csv";

        int defaultVal = 1;
        String macId = data.get("machine_id").toString();
        String productId = data.get("product_id").toString();
        return ActiveJdbc.operTx(() -> {

            Map<String, String> macId2Type = getMacId2MacType();

            List<String> orderHistoryCsv = null;
            try {
                orderHistoryCsv = Files.readAllLines(Paths.get(orderHistoryPath));
            } catch (IOException e) {
                e.printStackTrace();
            }

            //把訂單歷史紀錄檔案整理後轉成物件
            Map<String, Map<String, MachineType>> productList = new HashMap<>();
            csvToObj(orderHistoryCsv, productList, macId2Type);

            //拿到做過指定productId的機型 機台資料
            Map<String, MachineType> assignPdData = productList.get(productId);

            if (assignPdData == null) {
                return success(orderHistoryPath + "沒有" + macId + " stdhour");
            }
            String specMacType = macId2Type.get(macId);

            if (assignPdData.get(specMacType) != null) {
                Map<String, MachineHistory> assignMacList = assignPdData.get(specMacType).macList;

                for (Map.Entry<String, MachineHistory> entry : assignMacList.entrySet()) {

                    MachineHistory mData = entry.getValue();
                    if (mData.macId.equals(macId)) {
                        int medianStdhour = getMedianStdhour(mData);
                        return success(medianStdhour);
                    }
                }
            } else {
                log.info(orderHistoryPath + "沒有" + macId + " stdhour");
                return success(defaultVal);
            }
            return success(defaultVal);
        });
    }

    @RequestMapping(value = "/recommend/feature", method = RequestMethod.POST)
    public RequestResult<?> saveFeature(@RequestBody final List<Map<String, String>> data) {

        StringBuilder sb = new StringBuilder();
        for (Map<String, String> m : data) {
            List<String> row = new ArrayList<>();
            row.add(m.get("machineId"));
            row.add(m.get("productId"));
            row.add(m.get("orderId"));
            row.add(m.get("expDate"));
            row.add(m.get("expMdate"));
            row.add(m.get("expEdate"));
            row.add(m.get("stdHour"));
            row.add(m.get("preQty"));
            row.add(m.get("productTimes"));
            row.add(m.get("conflictScheduleByFullQtyNum"));
            row.add(m.get("conflictScheduleByHalfQtyNum"));
            row.add(m.get("mayScheduleByCusPriority"));
            row.add(m.get("pgSeq"));
            row.add(m.get("label"));
            row.add(m.get("isSelected"));

            String rowStr = row.stream().collect(Collectors.joining("|")) + "\n";

            sb.append(rowStr);
        }
        String record = sb.toString();

        Date current = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
        String fileName = sdf.format(current);
        String directoryPath = "C:\\Servtech\\Servolution\\Platform\\rawdata\\schedule_feature\\";
        String featureFilePath = directoryPath + fileName + ".csv";

        File directory = new File(directoryPath);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        try {
            File featureFile = new File(featureFilePath);
            if (!featureFile.exists()) {
                String header = "machine_id|product_id|order_id|exp_date|exp_mdate|exp_edate|std_hour|pre_qty|product_times|conflictScheduleByFullQtyNum|conflictScheduleByHalfQtyNum|mayScheduleByCusPriority|pgSeq|label|isSelected" + "\n";
                Files.write(Paths.get(featureFilePath), header.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
            }

            Files.write(Paths.get(featureFilePath), record.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (IOException ex) {
            ex.printStackTrace();
        }

        return success("insert success!!!");
    }

    @RequestMapping(value = "/recommend/endtime", method = RequestMethod.POST)
    public RequestResult<?> calcEndtime(@RequestBody final Map apiInput) {
        log.info("###input_param:");
        apiInput.forEach((k, v) -> log.info(k + ":" + v));

        String EMPTY = "";
        String macId = apiInput.get("machine_id") == null ? EMPTY : apiInput.get("machine_id").toString();
        String productId = apiInput.get("product_id").toString();
        double orderQty = Double.parseDouble(apiInput.get("order_qty").toString());
        String startTime = apiInput.get("exp_mdate") == null ? EMPTY : apiInput.get("exp_mdate").toString();
        double correctionTime = apiInput.get("correction_time") == null ? 8 : Double.parseDouble(apiInput.get("correction_time").toString());
        double bufferTime = apiInput.get("buffer_time") == null ? 24 : Double.parseDouble(apiInput.get("buffer_time").toString());
        int stdHour = Integer.parseInt(apiInput.get("std_hour").toString());

        File webRoot = new File(System.getProperty(WEB_ROOT_PATH));
        String orderHistoryPath = webRoot.getParentFile().getParentFile().getPath() + "\\zebraFoee\\orderhistory.csv";
        hippoXmlPath = System.getProperty(ROOT_PATH) + "WEB-INF\\classes\\hippo.xml";

        return ActiveJdbc.operTx(() -> {
            try {
                Map<String, String> macId2MacType = getMacId2MacType();
                Map<String, Map<String, MachineType>> product2MacType2Macs = getProduct2MacType2Macs(orderHistoryPath, macId2MacType);
                Map<String, MachineType> assignProductInfo = product2MacType2Macs.get(productId);

                if (assignProductInfo == null) {
                    log.info(RecommendReason.D1.info());
                    return fail(RecommendReason.D1.info());
                }

                String specMacType = macId2MacType.get(macId);
                if (assignProductInfo.get(specMacType) == null) {
                    return fail(RecommendReason.A1.info());

                }

                Map<String, MachineHistory> assignMacList = assignProductInfo.get(specMacType).macList;
                if (!assignMacList.containsKey(macId)) {
                    return fail(RecommendReason.A2.info());
                }

                //從訂單歷史檔案找到中位數的標工
                if (stdHour == 0) {
                    return fail(RecommendReason.A3.info());
                }

                String[] orderIds = assignMacList.get(macId).orderIds.stream().toArray(String[]::new);
                convertOrderIds(orderIds);
                double quality = getQuality(orderIds, macId) == 0 ? 1 : getQuality(orderIds, macId);
                double oee = getAvgOee(orderIds, macId) == 0 ? 1 : getAvgOee(orderIds, macId);

                double buffer = bufferTime * 60 * 60 + correctionTime * 60 * 60;

                //計算出排程時間
                Date expTime = calcExpEdate(startTime, orderQty, stdHour, quality, oee, buffer);
                Map<String, String> result = new HashMap<>();
                result.put("endTime", sdf.format(expTime));
                return success(result);

            } catch (Exception e) {
                e.printStackTrace();
                return fail(e.getMessage());
            }
        });
    }

    @RequestMapping(value = "/recommend/check", method = RequestMethod.POST)
    public RequestResult<?> checkAndrecommend(@RequestBody final Map apiInput) {
        log.info("###input param:");
        apiInput.forEach((k, v) -> log.info(k + ":" + v));
        boolean isDemo = apiInput.get("is_demo") == null ? false : (boolean) apiInput.get("is_demo");
        String productId = apiInput.get("product_id").toString();

        File webRoot = new File(System.getProperty(WEB_ROOT_PATH));
        String orderHistoryPath = webRoot.getParentFile().getParentFile().getPath() + "\\zebraFoee\\orderhistory.csv";
        hippoXmlPath = System.getProperty(ROOT_PATH) + "WEB-INF\\classes\\hippo.xml";

        RecommendResult recommendResult = new RecommendResult();
        List<com.servtech.servcloud.app.bean.huangliang_matStock.Schedule> featureList = new ArrayList<>();
        Map status = new HashMap();
        return ActiveJdbc.operTx(() -> {
            try {
                if (isDemo) {
                    return getDemoResult(apiInput);
                }
                Map<String, String> macId2MacType = getMacId2MacType();
                Map<String, Map<String, MachineType>> product2MacType2Macs = getProduct2MacType2Macs(orderHistoryPath, macId2MacType);
                Map<String, MachineType> assignProductInfo = product2MacType2Macs.get(productId);

                checkAssignMachineScheduleStatus(apiInput, assignProductInfo, recommendResult);
                checkMultMachinesScheduleStatusForCheckMode(apiInput, featureList, assignProductInfo);
                recommendResult.setFeatureList(featureList);
                return success(recommendResult);
            } catch (Exception e) {
                e.printStackTrace();
                return fail(e.getMessage());
            }
        });
    }

    private RequestResult<?> getDemoResult(Map apiInput) {
        RecommendResult recommendResult = new RecommendResult();
        List<com.servtech.servcloud.app.bean.huangliang_matStock.Schedule> featureList = new ArrayList<>();
        Map status = new HashMap();
        Map checkStatus = new HashMap();

        String EMPTY = "";
        String macId = apiInput.get("machine_id") == null ? EMPTY : apiInput.get("machine_id").toString();
        String productId = apiInput.get("product_id").toString();
        String orderId = apiInput.get("order_id").toString();
        String pgSeq = apiInput.get("pg_seq").toString();
        String code = apiInput.get("code") == null ? EMPTY : apiInput.get("code").toString();

        String expDate = apiInput.get("exp_date").toString() + " 08:00:00";
        double orderQty = Double.parseDouble(apiInput.get("order_qty").toString());
        String expMdate = apiInput.get("exp_mdate") == null ? EMPTY : apiInput.get("exp_mdate").toString() + " 08:00:00";
        String expEdate = apiInput.get("exp_edate") == null ? EMPTY : apiInput.get("exp_edate").toString();

        double correctionTime = apiInput.get("correction_time") == null ? 8 : Double.parseDouble(apiInput.get("correction_time").toString());
        double bufferTime = apiInput.get("buffer_time") == null ? 24 : Double.parseDouble(apiInput.get("buffer_time").toString());

        status.put("code", code);
        status.put("codeMsg", RecommendReason.D2.info());

        List<String> labels = Arrays.asList("X", "A", "B", "C", "C", "C", "D", "Y");
        for (int i = 0; i < 8; i++) {
            com.servtech.servcloud.app.bean.huangliang_matStock.Schedule s = new com.servtech.servcloud.app.bean.huangliang_matStock.Schedule();
            int index = i + 1;
            String machineId = "_HULPLATFORM01D01M0" + index;
            s.setMachineId(machineId);
            s.setProductId(productId);
            s.setOrderId(orderId);
            s.setExpDate(expDate);
            s.setExpMdate("2020-02-04 08:00:00");
            s.setExpEdate("2020-02-04 12:00:00");
            s.setStdHour(1);
            if (labels.get(i).equals("C")) {
                s.setPreQty((int) (orderQty / 2));
            } else {
                s.setPreQty((int) orderQty);
            }
            s.setProductTimes(10);
            s.setPgSeq(pgSeq);
            s.setLabel(labels.get(i));
            featureList.add(s);
        }
        recommendResult.setCheckResult(featureList.get(0));
        recommendResult.setCheckStatus(status);

        recommendResult.setFeatureList(featureList);
        recommendResult.setStatus(status);
        return success(recommendResult);
    }

    @RequestMapping(value = "/recommend", method = RequestMethod.POST)
    public RequestResult<?> recommend(@RequestBody final Map apiInput) {
        log.info("###input param:");
        apiInput.forEach((k, v) -> log.info(k + ":" + v));
        boolean isDemo = apiInput.get("is_demo") == null ? false : (boolean) apiInput.get("is_demo");
        String productId = apiInput.get("product_id").toString();
        File webRoot = new File(System.getProperty(WEB_ROOT_PATH));
        String orderHistoryPath = webRoot.getParentFile().getParentFile().getPath() + "\\zebraFoee\\orderhistory.csv";
        hippoXmlPath = System.getProperty(ROOT_PATH) + "WEB-INF\\classes\\hippo.xml";

        RecommendResult recommendResult = new RecommendResult();
        List<com.servtech.servcloud.app.bean.huangliang_matStock.Schedule> featureList = new ArrayList<>();
        Map status = new HashMap();
        return ActiveJdbc.operTx(() -> {
            try {
                if (isDemo) {
                    return getDemoResult(apiInput);
                }

                Map<String, String> macId2MacType = getMacId2MacType();
                Map<String, Map<String, MachineType>> product2MacType2Macs = getProduct2MacType2Macs(orderHistoryPath, macId2MacType);
                Map<String, MachineType> assignProductInfo = product2MacType2Macs.get(productId);
//
                if (assignProductInfo == null) {
                    log.info(RecommendReason.D1.info());

                    status.put("code", RecommendReason.D1.code);
                    status.put("codeMsg", RecommendReason.D1.info());
                    recommendResult.setFeatureList(featureList);
                    recommendResult.setStatus(status);

                    return fail(recommendResult);
                }
                checkMultMachinesScheduleStatus(apiInput, featureList, assignProductInfo);
                recommendResult.setFeatureList(featureList);
                return success(recommendResult);

            } catch (Exception e) {
                e.printStackTrace();
                return fail(e.getMessage());
            }
        });
    }

    private void checkAssignMachineScheduleStatus(Map apiInput, Map<String, MachineType> assignPastProductInfo, RecommendResult recommendResult) throws ParseException {
        Map checkSatus = new HashMap();
        String machineId = apiInput.get("machine_id").toString();
        String orderId = apiInput.get("order_id").toString();
        String productId = apiInput.get("product_id").toString();
        String pgSeq = apiInput.get("pg_seq").toString();
        String expDate = apiInput.get("exp_date").toString() + " 08:00:00";
        String expMdate = apiInput.get("exp_mdate").toString();
        Double orderQty = Double.parseDouble(apiInput.get("order_qty").toString());
        int stdhour = Integer.parseInt(apiInput.get("std_hour").toString());
        double correctionTime = apiInput.get("correction_time") == null ? 8 : Double.parseDouble(apiInput.get("correction_time").toString());
        double bufferTime = apiInput.get("buffer_time") == null ? 24 : Double.parseDouble(apiInput.get("buffer_time").toString());
        String scheduleTime = apiInput.get("schedule_time") == null ? EMPTY : apiInput.get("schedule_time").toString();

        Map<String, String> macId2MacType = getMacId2MacType();
        String assignMacType = macId2MacType.get(machineId);

        com.servtech.servcloud.app.bean.huangliang_matStock.Schedule schedule = null;
        Map tempRecord = new HashMap<>();
        String[] orderIds = null;

        if (assignPastProductInfo == null || !assignPastProductInfo.containsKey(assignMacType) || !assignPastProductInfo.get(assignMacType).macList.containsKey(machineId)) {
            String pastPgSeq = "1";
            int productTimes = 0;
            orderIds = new String[0];

            schedule = new com.servtech.servcloud.app.bean.huangliang_matStock.Schedule(
                    machineId,
                    expMdate,
                    EMPTY,
                    productTimes,
                    productId,
                    orderId,
                    pastPgSeq,
                    orderQty.intValue(),
                    expDate);
        } else {
            Map<String, MachineHistory> assignPastMacList = assignPastProductInfo.get(assignMacType).macList;
            MachineHistory machineHistory = assignPastMacList.get(machineId);
            String pastPgSeq = getPgSeqFromHistory(machineHistory, pgSeq);
            orderIds = machineHistory.orderIds.stream().toArray(String[]::new);

            schedule = new com.servtech.servcloud.app.bean.huangliang_matStock.Schedule(
                    machineId,
                    expMdate,
                    EMPTY,
                    machineHistory.productTimes,
                    productId,
                    orderId,
                    pastPgSeq,
                    orderQty.intValue(),
                    expDate);
        }

        schedule.setStdHour(stdhour);
        schedule.setExpEdate("---");
        schedule.setScheduleTime(scheduleTime);

        if (stdhour == 0) {
            checkSatus.put("code", RecommendReason.A3.code);
            checkSatus.put("codeMsg", RecommendReason.A3.info());
            recommendResult.setCheckStatus(checkSatus);
            return;
        }

        convertOrderIds(orderIds);
        double quality = getQuality(orderIds, machineId) == 0 ? 1 : getQuality(orderIds, machineId);
        double oee = getAvgOee(orderIds, machineId) == 0 ? 1 : getQuality(orderIds, machineId);

        double buffer = bufferTime * 60 * 60 + correctionTime * 60 * 60;
        Date expEdate = calcExpEdate(expMdate, orderQty, stdhour, quality, oee, buffer);
        schedule.setExpEdate(sdf.format(expEdate));

        tempRecord.put("initScheduleStartTime", sdf.parse(expMdate));
        tempRecord.put("initScheduleEndTime", expEdate);

        boolean isConflictAtAll = true;
        boolean isConflictWithNonProduct;
        boolean isConflictWithWoMStatus;
        boolean isConflictWithProductionSchedule;
        boolean isOverExpDate;
        boolean isMayScheduleByFullQty = true;
        boolean isMayScheduleByHalfQty = true;
        boolean isMayScheduleByCusPriority = true;
        int conflictScheduleNum = 0;
        int checkTimes = 1;

        while (isConflictAtAll) {
            //待預排與停機衝突檢查
            isConflictWithNonProduct = checkTimeConflictWithNonProduct(schedule, tempRecord, CHECK_SCHEDULE_MODE);
            if (isConflictWithNonProduct) {
                continue;
            }

            //待預排與派工衝突檢查
            isConflictWithWoMStatus = checkTimeConflictWithWoMStatus(schedule, tempRecord, CHECK_SCHEDULE_MODE);
            if (isConflictWithWoMStatus) {
                schedule.setOldExpEdates(null);
                continue;
            }

            //待預排與原預排衝突檢查
            isConflictWithProductionSchedule = checkTimeConflictWithProductionSchedule(schedule, tempRecord, CHECK_SCHEDULE_MODE);
            if (isConflictWithProductionSchedule) {
                conflictScheduleNum++;
                schedule.setOldExpEdates(null);
                continue;
            }

            //預排開始時間不能早於當下時間
            if (sdf.parse(schedule.getExpEdate()).after(sdf.parse(expDate))) {
                isOverExpDate = true;
                if (checkTimes == 1) {
                    isMayScheduleByFullQty = false;
                    schedule.setConflictScheduleByFullQtyNum(conflictScheduleNum);
                } else if (checkTimes == 2) {
                    isMayScheduleByHalfQty = false;
                    schedule.setConflictScheduleByHalfQtyNum(conflictScheduleNum);
                } else if (checkTimes == 3) {
                    isMayScheduleByCusPriority = false;
                }
                checkTimes++;
            } else {
                isOverExpDate = false;
            }

            if (isOverExpDate) {
                conflictScheduleNum = 0;
                if (isMayScheduleByFullQty == false && isMayScheduleByHalfQty == true) {
                    String initScheduleStartTime = sdf.format(tempRecord.get("initScheduleStartTime"));
                    Double halfOty = orderQty / 2;
                    schedule.setExpMdate(initScheduleStartTime);
                    schedule.setExpEdate(sdf.format(calcExpEdate(initScheduleStartTime, orderQty, stdhour, quality, oee, buffer)));
                    schedule.setOldExpEdates(null);
                    schedule.setPreQty(halfOty.intValue());
                    tempRecord.put("nonProductionList", new ArrayList<>());
                    continue;
                }
                if (isMayScheduleByFullQty == false && isMayScheduleByHalfQty == false && isMayScheduleByCusPriority == true) {
                    String initScheduleStartTime = sdf.format(tempRecord.get("initScheduleStartTime"));
                    schedule.setExpMdate(initScheduleStartTime);
                    schedule.setExpEdate(sdf.format(calcExpEdate(initScheduleStartTime, orderQty, stdhour, quality, oee, buffer)));
                    schedule.setEnablePrioritySchedule(true);
                    schedule.setOldExpEdates(null);
                    schedule.setPreQty(orderQty.intValue());
                    tempRecord.put("nonProductionList", new ArrayList<>());
                    continue;
                }
            }
            isConflictAtAll = false;
        }

        if (checkTimes == 1 && isMayScheduleByFullQty) {
            schedule.setConflictScheduleByFullQtyNum(conflictScheduleNum);
            if (schedule.getPgSeq().equals("1")) {
                schedule.setLabel("A");
            } else {
                schedule.setLabel("B");
            }
        }

        if (checkTimes == 2 && isMayScheduleByHalfQty) {
            schedule.setConflictScheduleByHalfQtyNum(conflictScheduleNum);
            schedule.setLabel("C");
        }
        if (checkTimes == 3 && isMayScheduleByCusPriority) {
            schedule.setLabel("D");
        }
        if (isMayScheduleByFullQty == false && isMayScheduleByHalfQty == false && isMayScheduleByCusPriority == false) {
            schedule.setLabel("Y");
        }
        recommendResult.setCheckResult(schedule);
    }

    private void checkMultMachinesScheduleStatusForCheckMode(Map apiInput, List<com.servtech.servcloud.app.bean.huangliang_matStock.Schedule> featureList, Map<String, MachineType> assignPastProductInfo) throws ParseException {
        String orderId = apiInput.get("order_id").toString();
        String productId = apiInput.get("product_id").toString();
        String pgSeq = apiInput.get("pg_seq").toString();
        String expEdate = apiInput.get("exp_date").toString() + " 08:00:00";
        String expDate = apiInput.get("exp_date").toString() + " 08:00:00";
        Double orderQty = Double.parseDouble(apiInput.get("order_qty").toString());
        int stdHour = apiInput.get("std_hour") == null ? 0 : Integer.parseInt(apiInput.get("std_hour").toString());
        String assignMachineId = apiInput.get("machine_id").toString();
        double correctionTime = apiInput.get("correction_time") == null ? 8 : Double.parseDouble(apiInput.get("correction_time").toString());
        double bufferTime = apiInput.get("buffer_time") == null ? 24 : Double.parseDouble(apiInput.get("buffer_time").toString());
        String EMPTY = "";

        Map<String, MachineHistory> assignPastMacList = null;
        Map<String, List<String>> queryMacType2MacIdList = getMacType2MacIdList();
        List<String> assignMacListFromDb = null;

        if (assignPastProductInfo == null) {
            Map<String, String> macId2MacType = getMacId2MacType();
            String assignMacType = macId2MacType.get(assignMachineId);
            assignMacListFromDb = queryMacType2MacIdList.get(assignMacType);
        } else {
            String maxUseTimesMacType = getMaxUseTimesMacType(assignPastProductInfo);
            assignMacListFromDb = queryMacType2MacIdList.get(maxUseTimesMacType);
            assignPastMacList = assignPastProductInfo.get(maxUseTimesMacType).macList;
        }

        for (String machineId : assignMacListFromDb) {

            Map tempRecord = new HashMap<>();
            com.servtech.servcloud.app.bean.huangliang_matStock.Schedule schedule = null;
            int medianStdhour = 0;
            String[] orderIds = null;

            if (assignPastMacList != null && assignPastMacList.containsKey(machineId)) {
                MachineHistory machineHistory = assignPastMacList.get(machineId);
                String pastPgSeq = getPgSeqFromHistory(machineHistory, pgSeq);
                orderIds = machineHistory.orderIds.stream().toArray(String[]::new);

                medianStdhour = getMedianStdhour(machineHistory);
                if (medianStdhour == 0 || machineId.equals(assignMachineId)) {
                    medianStdhour = stdHour;
                }

                schedule = new com.servtech.servcloud.app.bean.huangliang_matStock.Schedule(
                        machineId,
                        EMPTY,
                        expEdate,
                        machineHistory.productTimes,
                        productId,
                        orderId,
                        pastPgSeq,
                        orderQty.intValue(),
                        expDate);

            } else {
                int productTimes = 0;
                String pastPgSeq = "1";
                orderIds = new String[0];
                medianStdhour = stdHour;

                schedule = new com.servtech.servcloud.app.bean.huangliang_matStock.Schedule(
                        machineId,
                        EMPTY,
                        expEdate,
                        productTimes,
                        productId,
                        orderId,
                        pastPgSeq,
                        orderQty.intValue(),
                        expDate);
            }

            schedule.setStdHour(medianStdhour);
            schedule.setExpMdate("---");

            convertOrderIds(orderIds);
            double quality = getQuality(orderIds, machineId) == 0 ? 1 : getQuality(orderIds, machineId);
            double oee = getAvgOee(orderIds, machineId) == 0 ? 1 : getQuality(orderIds, machineId);

            double buffer = bufferTime * 60 * 60 + correctionTime * 60 * 60;
            Date expMdate = calcExpMdate(expEdate, orderQty, medianStdhour, quality, oee, buffer);

            schedule.setExpMdate(sdf.format(expMdate));
            schedule.setScheduleTime(EMPTY);
            tempRecord.put("initScheduleStartTime", expMdate);
            tempRecord.put("initScheduleEndTime", sdf.parse(expEdate));

            startSchedule(featureList, orderQty, tempRecord, schedule, medianStdhour, quality, oee, buffer);
        }
        bestSort(featureList);
    }


    private void checkMultMachinesScheduleStatus(Map apiInput, List<com.servtech.servcloud.app.bean.huangliang_matStock.Schedule> featureList, Map<String, MachineType> assignPastProductInfo) throws ParseException {
        String orderId = apiInput.get("order_id").toString();
        String productId = apiInput.get("product_id").toString();
        String pgSeq = apiInput.get("pg_seq").toString();
        String expEdate = apiInput.get("exp_date").toString() + " 08:00:00";
        String expDate = apiInput.get("exp_date").toString() + " 08:00:00";
        Double orderQty = Double.parseDouble(apiInput.get("order_qty").toString());

        double correctionTime = apiInput.get("correction_time") == null ? 8 : Double.parseDouble(apiInput.get("correction_time").toString());
        double bufferTime = apiInput.get("buffer_time") == null ? 24 : Double.parseDouble(apiInput.get("buffer_time").toString());
        String EMPTY = "";
        int emptyNum = 0;


        Map<String, List<String>> queryMacType2MacIdList = getMacType2MacIdList();
        String maxUseTimesMacType = getMaxUseTimesMacType(assignPastProductInfo);
        Map<String, MachineHistory> assignPastMacList = assignPastProductInfo.get(maxUseTimesMacType).macList;
        List<String> assignMacListFromDb = queryMacType2MacIdList.get(maxUseTimesMacType);

        for (String machineId : assignMacListFromDb) {
            if (!assignPastMacList.containsKey(machineId)) {
                com.servtech.servcloud.app.bean.huangliang_matStock.Schedule schedule =
                        new com.servtech.servcloud.app.bean.huangliang_matStock.Schedule(
                                machineId,
                                EMPTY,
                                expEdate,
                                emptyNum,
                                productId,
                                orderId,
                                EMPTY,
                                orderQty.intValue(),
                                expDate);
                schedule.setLabel("X");
                featureList.add(schedule);
                continue;
            }

            MachineHistory machineHistory = assignPastMacList.get(machineId);
            Map tempRecord = new HashMap<>();

            String pastPgSeq = getPgSeqFromHistory(machineHistory, pgSeq);

            com.servtech.servcloud.app.bean.huangliang_matStock.Schedule schedule =
                    new com.servtech.servcloud.app.bean.huangliang_matStock.Schedule(
                            machineId,
                            EMPTY,
                            expEdate,
                            machineHistory.productTimes,
                            productId,
                            orderId,
                            pastPgSeq,
                            orderQty.intValue(),
                            expDate);

            int medianStdhour = getMedianStdhour(machineHistory);
            schedule.setStdHour(medianStdhour);
            schedule.setExpMdate("---");

            if (medianStdhour == 0) {
                schedule.setLabel("X");
                featureList.add(schedule);
                continue;
            }

            String[] orderIds = machineHistory.orderIds.stream().toArray(String[]::new);

            convertOrderIds(orderIds);
            double quality = getQuality(orderIds, machineId) == 0 ? 1 : getQuality(orderIds, machineId);
            double oee = getAvgOee(orderIds, machineId) == 0 ? 1 : getQuality(orderIds, machineId);
            if (quality == 0 || oee == 0) {
                schedule.setLabel("Y");
                featureList.add(schedule);
                continue;
            }

            double buffer = bufferTime * 60 * 60 + correctionTime * 60 * 60;
            Date expMdate = calcExpMdate(expEdate, orderQty, medianStdhour, quality, oee, buffer);

            schedule.setExpMdate(sdf.format(expMdate));
            schedule.setScheduleTime(EMPTY);
            tempRecord.put("initScheduleStartTime", expMdate);
            tempRecord.put("initScheduleEndTime", sdf.parse(expEdate));

            startSchedule(featureList, orderQty, tempRecord, schedule, medianStdhour, quality, oee, buffer);
        }
        bestSort(featureList);
    }

    private void startSchedule(List<Schedule> featureList, Double orderQty, Map tempRecord, Schedule schedule, int medianStdhour, double quality, double oee, double buffer) throws ParseException {
        boolean isConflictAtAll = true;
        boolean isConflictWithNonProduct;
        boolean isConflictWithWoMStatus;
        boolean isConflictWithProductionSchedule;
        boolean isOverCurrentDate;
        boolean isMayScheduleByFullQty = true;
        boolean isMayScheduleByHalfQty = true;
        boolean isMayScheduleByCusPriority = true;

        int conflictScheduleNum = 0;

        int checkTimes = 1;
        while (isConflictAtAll) {

            //待預排與停機衝突檢查
            isConflictWithNonProduct = checkTimeConflictWithNonProduct(schedule, tempRecord, RECOMMEND_SCHEDULE_MODE);
            if (isConflictWithNonProduct) {
                continue;
            }

            //待預排與派工衝突檢查
            isConflictWithWoMStatus = checkTimeConflictWithWoMStatus(schedule, tempRecord, RECOMMEND_SCHEDULE_MODE);
            if (isConflictWithWoMStatus) {
                schedule.setOldExpEdates(null);
                continue;
            }

            //待預排與原預排衝突檢查
            isConflictWithProductionSchedule = checkTimeConflictWithProductionSchedule(schedule, tempRecord, RECOMMEND_SCHEDULE_MODE);
            if (isConflictWithProductionSchedule) {
                conflictScheduleNum++;
                schedule.setOldExpEdates(null);
                continue;
            }

            //預排開始時間不能早於當下時間
            if (sdf.parse(schedule.getExpMdate()).before(new Date())) {
                isOverCurrentDate = true;
                if (checkTimes == 1) {
                    isMayScheduleByFullQty = false;
                    schedule.setConflictScheduleByFullQtyNum(conflictScheduleNum);
                } else if (checkTimes == 2) {
                    isMayScheduleByHalfQty = false;
                    schedule.setConflictScheduleByHalfQtyNum(conflictScheduleNum);
                } else if (checkTimes == 3) {
                    isMayScheduleByCusPriority = false;
                }
                checkTimes++;
            } else {
                isOverCurrentDate = false;
            }

            if (isOverCurrentDate) {
                conflictScheduleNum = 0;
                if (isMayScheduleByFullQty == false && isMayScheduleByHalfQty == true) {
                    String initScheduleEndTime = sdf.format((Date) tempRecord.get("initScheduleEndTime"));
                    Double halfOty = orderQty / 2;
                    schedule.setExpMdate(sdf.format(calcExpMdate(initScheduleEndTime, halfOty, medianStdhour, quality, oee, buffer)));
                    schedule.setExpEdate(initScheduleEndTime);
                    schedule.setOldExpEdates(null);
                    schedule.setPreQty(halfOty.intValue());
                    tempRecord.put("nonProductionList", new ArrayList<>());
                    continue;
                }
                if (isMayScheduleByFullQty == false && isMayScheduleByHalfQty == false && isMayScheduleByCusPriority == true) {
                    String initScheduleEndTime = sdf.format(tempRecord.get("initScheduleEndTime"));
                    schedule.setExpMdate(sdf.format(calcExpMdate(initScheduleEndTime, orderQty, medianStdhour, quality, oee, buffer)));
                    schedule.setExpEdate(initScheduleEndTime);
                    schedule.setEnablePrioritySchedule(true);
                    schedule.setOldExpEdates(null);
                    schedule.setPreQty(orderQty.intValue());
                    tempRecord.put("nonProductionList", new ArrayList<>());
                    continue;
                }
            }
            isConflictAtAll = false;
        }

        if (checkTimes == 1 && isMayScheduleByFullQty) {
            schedule.setConflictScheduleByFullQtyNum(conflictScheduleNum);
            if (schedule.getPgSeq().equals("1")) {
                schedule.setLabel("A");
            } else {
                schedule.setLabel("B");
            }
        }

        if (checkTimes == 2 && isMayScheduleByHalfQty) {
            schedule.setConflictScheduleByHalfQtyNum(conflictScheduleNum);
            schedule.setLabel("C");
        }
        if (checkTimes == 3 && isMayScheduleByCusPriority) {
            schedule.setLabel("D");
        }
        if (isMayScheduleByFullQty == false && isMayScheduleByHalfQty == false && isMayScheduleByCusPriority == false) {
            schedule.setLabel("Y");
        }
        featureList.add(schedule);
    }

    //情境1 : 預排與停機的衝突處理
    private boolean checkTimeConflictWithNonProduct(com.servtech.servcloud.app.bean.huangliang_matStock.Schedule schedule, Map<String, Object> tempRecord, String mode) throws ParseException {
        String holidayStatus = "9";
        String whereIn = "";
        if (tempRecord != null && tempRecord.get("nonProductionList") != null) {
            whereIn = getWhereIn((List<String>) tempRecord.get("nonProductionList"));
        }

        NonProduction nonProduction = NonProduction.findFirst(
                "machine_id = ? AND (exp_time < ? AND exp_edate > ?) " + whereIn + " order by exp_time desc",
                schedule.getMachineId(),
                schedule.getExpEdate(),
                schedule.getExpMdate());

        if (nonProduction == null) {
            return false;
        }

        Map queryNonProduction = nonProduction.toMap();
        Map<String, Date> newTimeMap = null;
        Date startPreScheduleTime = sdf.parse(schedule.getExpMdate());
        Date endPreScheduleTime = sdf.parse(schedule.getExpEdate());
        Date startDowntimeScheduleTime = sdf.parse(queryNonProduction.get("exp_time").toString());
        Date endDowntimeScheduleTime = sdf.parse(queryNonProduction.get("exp_edate").toString());

        if (!isTimeConflict(startDowntimeScheduleTime, endDowntimeScheduleTime, startPreScheduleTime, endPreScheduleTime)) {
            return false;
        }

        if (queryNonProduction.get("purpose").toString().equals(holidayStatus)) {
            List<String> nonProductionList = tempRecord.get("nonProductionList") == null ? new ArrayList<>() : (List<String>) tempRecord.get("nonProductionList");
            nonProductionList.add(queryNonProduction.get("exp_time").toString());
            tempRecord.put("nonProductionList", nonProductionList);

            if (mode.equals(RECOMMEND_SCHEDULE_MODE)) {
                newTimeMap = getSplitScheduleTimeOrderByDesc(startPreScheduleTime, endPreScheduleTime, startDowntimeScheduleTime, endDowntimeScheduleTime);
            } else if (mode.equals(CHECK_SCHEDULE_MODE)) {
                newTimeMap = getSplitScheduleTimeOrderByAsc(startPreScheduleTime, endPreScheduleTime, startDowntimeScheduleTime, endDowntimeScheduleTime);
            }

            //紀錄被合併停機，後續其他API應用過濾該停機時間避免衝突
            if (schedule.getOldExpEdates() == null) {
                List<String> list = new ArrayList<>();
                list.add(sdf.format(endDowntimeScheduleTime));
                schedule.setOldExpEdates(list);
            } else {
                schedule.getOldExpEdates().add(sdf.format(endDowntimeScheduleTime));
            }
        } else {
            if (tempRecord.get("initScheduleStartTime") != null) {
                startPreScheduleTime = (Date) tempRecord.get("initScheduleStartTime");
                endPreScheduleTime = (Date) tempRecord.get("initScheduleEndTime");
            }
            if (mode.equals(RECOMMEND_SCHEDULE_MODE)) {
                newTimeMap = getMoveBeforeScheduleTime(startPreScheduleTime, endPreScheduleTime, startDowntimeScheduleTime, endDowntimeScheduleTime);
            } else if (mode.equals(CHECK_SCHEDULE_MODE)) {
                newTimeMap = getMoveBehindScheduleTime(startPreScheduleTime, endPreScheduleTime, startDowntimeScheduleTime, endDowntimeScheduleTime);
            }
        }
        schedule.setExpMdate(sdf.format(newTimeMap.get("newStartScheduleTime")));
        schedule.setExpEdate(sdf.format(newTimeMap.get("newEndScheduleTime")));

        return true;
    }

    //情境2 : 預排 與 派工的衝突處理
    private boolean checkTimeConflictWithWoMStatus(
            com.servtech.servcloud.app.bean.huangliang_matStock.Schedule schedule, Map<String, Object> tempRecord, String mode) throws ParseException {
        WoMStatus woMStatus = WoMStatus.findFirst(
                "machine_id = ? AND (exp_mdate < ? AND exp_edate > ?) AND w_m_status != 99 order by exp_mdate desc",
                schedule.getMachineId(),
                schedule.getExpEdate(),
                schedule.getExpMdate());

        if (woMStatus == null) {
            return false;
        }

        Map queryWoMStatus = woMStatus.toMap();
        Date startPreScheduleTime = sdf.parse(schedule.getExpMdate());
        Date endPreScheduleTime = sdf.parse(schedule.getExpEdate());
        Date startDowntimeScheduleTime = sdf.parse(queryWoMStatus.get("exp_mdate").toString());
        Date endDowntimeScheduleTime = sdf.parse(queryWoMStatus.get("exp_edate").toString());

        if (!isTimeConflict(startDowntimeScheduleTime, endDowntimeScheduleTime, startPreScheduleTime, endPreScheduleTime)) {
            return false;
        }

        if (tempRecord.get("initScheduleStartTime") != null) {
            startPreScheduleTime = (Date) tempRecord.get("initScheduleStartTime");
            endPreScheduleTime = (Date) tempRecord.get("initScheduleEndTime");
        }
        Map<String, Date> newTimeMap = null;
        if (mode.equals(RECOMMEND_SCHEDULE_MODE)) {
            newTimeMap = getMoveBeforeScheduleTime(startPreScheduleTime, endPreScheduleTime, startDowntimeScheduleTime, endDowntimeScheduleTime);
        } else if (mode.equals(CHECK_SCHEDULE_MODE)) {
            newTimeMap = getMoveBehindScheduleTime(startPreScheduleTime, endPreScheduleTime, startDowntimeScheduleTime, endDowntimeScheduleTime);
        }

        schedule.setExpMdate(sdf.format(newTimeMap.get("newStartScheduleTime")));
        schedule.setExpEdate(sdf.format(newTimeMap.get("newEndScheduleTime")));
        return true;
    }

    //情境6 : 預排 與 預排的衝突處理
    private boolean checkTimeConflictWithProductionSchedule(
            com.servtech.servcloud.app.bean.huangliang_matStock.Schedule schedule, Map<String, Object> tempRecord, String mode) throws ParseException {
        ProductionScheduling productionScheduling = null;
        if (schedule.getScheduleTime().equals(EMPTY)) {
            productionScheduling = ProductionScheduling.findFirst(
                    "machine_id = ? AND (exp_mdate < ? AND exp_edate > ?) AND schedule_status = 0 order by exp_mdate desc"
                    , schedule.getMachineId(), schedule.getExpEdate(), schedule.getExpMdate());
        } else {
            productionScheduling = ProductionScheduling.findFirst(
                    "machine_id = ? AND (exp_mdate < ? AND exp_edate > ?) AND schedule_status = 0  AND ( order_id != ? OR schedule_time != ? ) order by exp_mdate desc"
                    , schedule.getMachineId(), schedule.getExpEdate(), schedule.getExpMdate(), schedule.getOrderId(), schedule.getScheduleTime());
        }

        if (productionScheduling == null) {
            return false;
        }

        Map queryProductionScheduling = productionScheduling.toMap();
        Date startPreScheduleTime = sdf.parse(schedule.getExpMdate());
        Date endPreScheduleTime = sdf.parse(schedule.getExpEdate());
        Date startExistPreScheduleTime = sdf.parse(queryProductionScheduling.get("exp_mdate").toString());
        Date endExistPreScheduleTime = sdf.parse(queryProductionScheduling.get("exp_edate").toString());


        if (!isTimeConflict(startExistPreScheduleTime, endExistPreScheduleTime, startPreScheduleTime, endPreScheduleTime)) {
            return false;
        }

        if (schedule.isEnablePrioritySchedule()) {
            String existOrderId = queryProductionScheduling.get("order_id").toString();
            int existOrderPriority = getOrderPriority(existOrderId);
            int scheduleOrderPriority = getOrderPriority(schedule.getOrderId());

            if (scheduleOrderPriority > existOrderPriority) {
                schedule.setMayScheduleByCusPriority(schedule.getMayScheduleByCusPriority() + 1);
                return false;
            }
        }

        if (tempRecord.get("initScheduleStartTime") != null) {
            startPreScheduleTime = (Date) tempRecord.get("initScheduleStartTime");
            endPreScheduleTime = (Date) tempRecord.get("initScheduleEndTime");
        }
        Map<String, Date> newTimeMap = null;
        if (mode.equals(RECOMMEND_SCHEDULE_MODE)) {
            newTimeMap = getMoveBeforeScheduleTime(startPreScheduleTime, endPreScheduleTime, startExistPreScheduleTime, endExistPreScheduleTime);
        } else if (mode.equals(CHECK_SCHEDULE_MODE)) {
            newTimeMap = getMoveBehindScheduleTime(startPreScheduleTime, endPreScheduleTime, startExistPreScheduleTime, endExistPreScheduleTime);
        }
        schedule.setExpMdate(sdf.format(newTimeMap.get("newStartScheduleTime")));
        schedule.setExpEdate(sdf.format(newTimeMap.get("newEndScheduleTime")));
        return true;
    }

    //取得被後移的新插單時間起訖
    private Map<String, Date> getMoveBehindScheduleTime(Date startMoveScheduleTime, Date endMoveScheduleTime, Date startFixedScheduleTime, Date endFixedScheduleTime) {
        Map<String, Date> result = new HashMap<>();
        Date newEndPreScheduleTime = getNewEndScheduleTime(endFixedScheduleTime, startMoveScheduleTime, endMoveScheduleTime);
        result.put("newStartScheduleTime", endFixedScheduleTime);
        result.put("newEndScheduleTime", newEndPreScheduleTime);
        return result;
    }

    private Map<String, Date> getMoveBeforeScheduleTime(Date startMoveScheduleTime, Date endMoveScheduleTime, Date startFixedScheduleTime, Date endFixedScheduleTime) {
        Map<String, Date> result = new HashMap<>();
        Date newStartPreScheduleTime = getNewStartScheduleTime(startFixedScheduleTime, startMoveScheduleTime, endMoveScheduleTime);
        result.put("newStartScheduleTime", newStartPreScheduleTime);
        result.put("newEndScheduleTime", startFixedScheduleTime);
        return result;
    }

    //取得被分割的新插單時間起
    private Map<String, Date> getSplitScheduleTimeOrderByAsc(Date startMoveScheduleTime, Date endMoveScheduleTime, Date startFixedScheduleTime, Date endFixedScheduleTime) {
        //只有插單的起始時間大於停機起始時間才會被拆成兩半，小於等於的話就跟"維護"的規則一樣
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

    private Map<String, Date> getSplitScheduleTimeOrderByDesc(Date startMoveScheduleTime, Date endMoveScheduleTime, Date startFixedScheduleTime, Date endFixedScheduleTime) {
        //只有插單的結束時間大於停機結束時間才會被拆成兩半，小於等於跟"維護"的規則一樣
        if (endMoveScheduleTime.after(endFixedScheduleTime)) {
            Map<String, Date> result = new HashMap<>();
            int durationSec = getDurationSec(startMoveScheduleTime, endMoveScheduleTime) - getDurationSec(endFixedScheduleTime, endMoveScheduleTime);
            Calendar cal = Calendar.getInstance();
            cal.setTime(startFixedScheduleTime);
            cal.add(Calendar.SECOND, -durationSec);

            result.put("newStartScheduleTime", cal.getTime());
            result.put("newEndScheduleTime", endMoveScheduleTime);
            return result;
        }
        return getMoveBeforeScheduleTime(startMoveScheduleTime, endMoveScheduleTime, startFixedScheduleTime, endFixedScheduleTime);
    }

    private Map<String, String> getMacId2MacType() {
        Map<String, String> macId2Type = new HashMap<>();
        List<Map> macList = MacList.find("is_open=?", "Y").toMaps();
        for (Map map : macList) {
            if (map.get("mac_type") != null) {
                macId2Type.put(map.get("machine_id").toString(), map.get("mac_type").toString());
            }
        }
        return macId2Type;
    }

    private Map<String, List<String>> getMacType2MacIdList() {
        Map<String, List<String>> macType2Id = new HashMap<>();
        List<Map> macList = MacList.find("is_open=?", "Y").toMaps();

        for (Map map : macList) {
            if (map.get("mac_type") == null) {
                continue;
            }
            String macType = map.get("mac_type").toString();
            String macId = map.get("machine_id").toString();

            if (macType2Id.containsKey(macType)) {
                macType2Id.get(macType).add(macId);
            } else {
                List<String> macIdList = new ArrayList<>();
                macIdList.add(macId);
                macType2Id.put(macType, macIdList);
            }
        }
        return macType2Id;
    }

    private Map<String, Map<String, MachineType>> getProduct2MacType2Macs(String orderHistoryPath, Map<String, String> macId2MacType) throws IOException {
        Map<String, Map<String, MachineType>> product2MacType2Mac = new HashMap<>();
        List<String> orderHistoryCsv = Files.readAllLines(Paths.get(orderHistoryPath));
        csvToObj(orderHistoryCsv, product2MacType2Mac, macId2MacType);
        return product2MacType2Mac;
    }

    @RequestMapping(value = "/updateNonProduction", method = RequestMethod.POST)
    public RequestResult<?> updateNonProduction(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                final Object modifyBy = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                final Timestamp modifyTime = new Timestamp(System.currentTimeMillis());
                // 更新停機設定
                Map<String, List<Map>> nonProduction = (Map) data.get("NonProduction");
                if (nonProduction.size() >= 1) {
                    for (Map nonData : nonProduction.get("before")) {
                        System.out.println("before: " + nonData.get("machine_id").toString() + "---" + nonData.get("exp_time").toString());
                        NonProduction target = NonProduction.findFirst("machine_id = ? AND exp_time = ? AND purpose = ?",
                                nonData.get("machine_id").toString(),
                                nonData.get("exp_time").toString(),
                                (int) Double.parseDouble(nonData.get("purpose").toString())
                        );
                        if (target != null) {
                            NonProductionLog nonProductionLog = new NonProductionLog();
                            nonProductionLog.fromMap(target.toMap());
                            nonProductionLog.set("remove_time", modifyTime);
                            nonProductionLog.set("remove_by", modifyBy);
                            nonProductionLog.insert();
                        }
                        NonProduction.delete("machine_id = ? AND exp_time = ? AND purpose = ?",
                                nonData.get("machine_id").toString(),
                                nonData.get("exp_time").toString(),
                                (int) Double.parseDouble(nonData.get("purpose").toString())
                        );
                    }
                    for (Map nonData : nonProduction.get("after")) {
                        System.out.println("after: " + nonData.get("machine_id").toString() + "---" + nonData.get("exp_time").toString());
                        NonProduction non = new NonProduction();
                        nonData.put("modify_by", modifyBy);
                        nonData.put("modify_time", modifyTime);
                        nonData.put("create_by", modifyBy);
                        nonData.put("create_time", modifyTime);
                        non.fromMap(nonData);
                        non.insert();
                    }
                }

                // 更新預排
                Map<String, List<Map>> productionScheduling = (Map) data.get("ProductionScheduling");
                if (productionScheduling.size() >= 1) {
                    for (Map scheduleData : productionScheduling.get("after")) {
                        ProductionScheduling schedule = ProductionScheduling.findFirst("schedule_time = ? AND machine_id = ? AND order_id = ?",
                                scheduleData.get("schedule_time"),
                                scheduleData.get("machine_id"),
                                scheduleData.get("order_id"));

                        scheduleData.put("modify_by", modifyBy);
                        scheduleData.put("modify_time", modifyTime);
                        if (schedule == null) {
                            schedule = new ProductionScheduling();
                            scheduleData.put("create_by", modifyBy);
                            scheduleData.put("create_time", modifyTime);
                            schedule.fromMap(scheduleData);
                            schedule.insert();
                        } else {
                            schedule.fromMap(scheduleData);
                            schedule.saveIt();
                        }
                    }
                }

                // 更新機台派工
                Map<String, List<Map>> woMStatus = (Map) data.get("WoMStatus");
                if (woMStatus.size() >= 1) {
                    for (Map statusData : woMStatus.get("after")) {
                        WoMStatus status = WoMStatus.findFirst("wo_m_time = ? AND machine_id = ? AND order_id = ?",
                                statusData.get("wo_m_time"),
                                statusData.get("machine_id"),
                                statusData.get("order_id"));
                        statusData.put("modify_by", modifyBy);
                        statusData.put("modify_time", modifyTime);
                        if (status == null) {
                            status = new WoMStatus();
                            statusData.put("create_time", modifyTime);
                            statusData.put("create_by", modifyBy);
                            status.fromMap(statusData);
                            status.insert();
                        } else {
                            status.fromMap(statusData);
                            status.saveIt();
                        }
                    }
                }
                return RequestResult.success("success");
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    @RequestMapping(value = "/getWoListData", method = RequestMethod.GET)
    public RequestResult<?> getWoListData(@RequestParam("start") final String start,
                                          @RequestParam("end") final String end,
                                          @RequestParam("productId") final String productId,
                                          @RequestParam("orderId") final String orderId) {
        try {
            return ActiveJdbc.operTx(() -> {
                StringBuilder sql = new StringBuilder();
                sql.append("SELECT * FROM a_huangliang_wo_list WHERE");
                sql.append(" (wo_status=0 OR wo_status=1 OR wo_status=2)");
                if (!start.equals("")) sql.append(" AND create_time >= '" + start + " 00:00:00'");
                if (!end.equals("")) sql.append(" AND create_time <= '" + end + " 23:59:59'");
                if (!productId.equals("")) sql.append(" AND product_id LIKE '%" + productId + "%'");
                if (!orderId.equals("")) sql.append(" AND order_id LIKE '%" + orderId + "%'");

                final List<Map> result = Base.findAll(sql.toString());
                for (Map data : result) {
                    String thisOrderId = data.get("order_id").toString();
                    String mstockName = "";
                    if (thisOrderId.startsWith("G")) mstockName = "GOLF";
                    else if (thisOrderId.startsWith("M")) mstockName = "五金";

                    // 找到 管編生產條件設定 的資料 (製程數)
                    ProductProfile productProfile = ProductProfile.findFirst("mstock_name=? AND product_id=?",
                            mstockName, data.get("product_id").toString());
                    if (productProfile != null) {
                        data.put("mstock_name", productProfile.get("mstock_name"));
                        data.put("multiprogram", productProfile.get("multiprogram"));
                        data.put("mat_usage", productProfile.get("mat_usage"));
                    }

                    // 計算預排數量
                    int scheduleCount = 0;
                    List<ProductionScheduling> scheduleList = ProductionScheduling.find("order_id=? AND schedule_status=0", thisOrderId);
                    for (ProductionScheduling schedule : scheduleList) {
                        if (schedule.get("schedule_quantity") != null) {
                            scheduleCount += Integer.parseInt(schedule.get("schedule_quantity").toString());
                        }
                    }
                    data.put("all_schedule_quantity", scheduleCount);

                    // 紀錄是否有被預排過
                    boolean productionScheduled = false;
                    String productionScheduledSql = "SELECT COUNT(*) as count FROM a_huangliang_production_scheduling WHERE order_id=? AND schedule_status<>99";
                    final List<Map> maxCount = Base.findAll(productionScheduledSql, thisOrderId);
                    long count = Long.parseLong(maxCount.get(0).get("count").toString());
                    if (count > 0) productionScheduled = true;
                    data.put("production_scheduled", productionScheduled);

                    // 計算機台派工數量
                    int statusCount = 0;
                    List<WoMStatus> woMStatusList = WoMStatus.find("order_id=? AND w_m_status<>99", thisOrderId);
                    for (WoMStatus woMStatus : woMStatusList) {
                        if (woMStatus.get("m_qty") != null)
                            statusCount += Integer.parseInt(woMStatus.get("m_qty").toString());
                    }
                    data.put("all_m_qty", statusCount);
                }
                return RequestResult.success(result);
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    public int getOrderPriority(String orderId) {
        int priority = INVALID_PRIORITY;
        Model woList = WoList.findFirst("order_id = ?", orderId);
        String customerId = woList.get("customer_id").toString();
        Model custPriority = CustomerPriority.findFirst("customer_id = ?", customerId);
        if (custPriority != null) {
            priority = custPriority.getInteger("priority");
        }
        return priority;
    }

    private String getMaxUseTimesMacType(Map<String, MachineType> assignPdData) {
        String maxUseTimesMacType = null;
        int maxSumUseTimes = 0;
        for (Map.Entry<String, MachineType> entry : assignPdData.entrySet()) {
            entry.getValue().calcSumUseTimes();
            int sumUseTimes = entry.getValue().sumUseTimes;
            if (sumUseTimes > maxSumUseTimes) {
                maxUseTimesMacType = entry.getKey();
                maxSumUseTimes = sumUseTimes;
            }
        }
        return maxUseTimesMacType;
    }

    public void bestSort(List<com.servtech.servcloud.app.bean.huangliang_matStock.Schedule> idleMachines) {
        Collections.sort(idleMachines, (o1, o2) -> {
            if (o1.getLabel().equals(o2.getLabel())) {

                if (o1.getPgSeq().equals(o2.getPgSeq())) {
                    return o2.getExpMdate().compareTo(o1.getExpMdate());
                } else {
                    return o1.getPgSeq().compareTo(o2.getPgSeq());
                }
            } else {
                return o1.getLabel().compareTo(o2.getLabel());
            }
        });
    }

    public double getQuality(String[] orderIds, String machineId) {
        if (orderIds.length == 0) {
            return 0;
        }
        try {
            double sumExaminationDefective = 0;
            double sumPartcount = 0;
            double sumQcDefectives = 0;

            List<QualityExamData> qualityExamData = QualityExamData
                    .find("machine_id = '" + machineId + "' AND order_id IN(" + Util.strSplitBy("?", ",", orderIds.length) + ")", orderIds);
            for (QualityExamData data : qualityExamData) {
                sumExaminationDefective += Double.parseDouble(data.getString("examination_defective"));
                String qcDefectives = data.getString("qc_defectives");
                sumQcDefectives += Double.parseDouble(qcDefectives == null || qcDefectives.equals("") ? "0" : data.getString("qc_defectives"));
            }

            List<Map<String, Atom>> mapData = HippoFactory
                    .getHippo(hippoXmlPath)
                    .newSimpleExhaler()
                    .space("HUL_jia_quality_product")
                    .index("order_id", orderIds)
                    .columns("date")
                    .columns("employee_id")
                    .columns("work_shift_name")
                    .columns("machine_id")
                    .columns("order_id")
                    .columns("care_partcount")
                    .columns("multi_process")
                    .exhale().get().toMapping();


            for (Map<String, Atom> data : mapData) {
                if (machineId.equals(data.get("machine_id").asString())) {
                    double partcount = data.get("care_partcount").asDouble();
                    sumPartcount += partcount;
                }
            }
            //(如果直接抓品質檢測數據報表, 則為SUM各班次(實際產量-例檢不良品數-QC不良品數)/ 實際產量
            double quality = sumPartcount == 0 ? 0 : (sumPartcount - sumExaminationDefective - sumQcDefectives) / sumPartcount;
            return quality;
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
        return 0;
    }

    public String[] convertOrderIds(String[] orderIds) {
        for (int idx = 0; idx < orderIds.length; idx++) {
            String orderId = orderIds[idx];
            String newOrderId = orderId.charAt(0) + orderId.substring(3, orderId.length() - 3) + "." + orderId.substring(orderId.length() - 3, orderId.length());
            orderIds[idx] = newOrderId;
        }
        return orderIds;
    }

    public double getAvgOee(String[] orderIds, String machineId) {
        if (orderIds.length == 0) {
            return 0;
        }
        try {
            List<Map<String, Atom>> mapData = HippoFactory
                    .getHippo(hippoXmlPath)
                    .newSimpleExhaler()
                    .space("HUL_jia_people_product")
                    .index("order_id", orderIds)
                    .columns("machine_id")
                    .columns("std_second")
                    .columns("care_operate_millisecond")
                    .columns("care_partcount")
                    .exhale().get().toMapping();

            double tempSumPartcount = 0;
            double tempSumExpPartcoumt = 0;
            for (Map<String, Atom> data : mapData) {
                String macId = data.get("machine_id").asString();
                double stdSec = data.get("std_second").asDouble();
                double careOperMillisec = data.get("care_operate_millisecond").asDouble();
                double partcount = data.get("care_partcount").asDouble();

                if (machineId.equals(macId)) {
                    if (stdSec != 0 && careOperMillisec != 0 && partcount != 0) {
                        double expectPartcount = (careOperMillisec / 1000) / stdSec;
                        tempSumPartcount += partcount;
                        tempSumExpPartcoumt += expectPartcount;
                    }
                }
            }
            double avgOee = tempSumExpPartcoumt == 0 ? 0 : tempSumPartcount / tempSumExpPartcoumt;
            return avgOee;
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
        return 0;
    }

    private Date calcExpMdate(String expDate, double orderQty, int medianStdhour, double quality, double efficiency, double buffer) throws ParseException {
        Double durSec = orderQty * medianStdhour / (quality * efficiency) + buffer;
        Calendar expMdate = Calendar.getInstance();
        expMdate.setTime(sdf.parse(expDate));
        expMdate.add(Calendar.SECOND, -durSec.intValue());

        return expMdate.getTime();
    }

    private Date calcExpEdate(String startDate, double orderQty, int medianStdhour, double quality,
                              double efficiency, double buffer) throws ParseException {
        Double durSec = orderQty * medianStdhour / (quality * efficiency) + buffer;
        Calendar expEdate = Calendar.getInstance();
        expEdate.setTime(sdf.parse(startDate));
        expEdate.add(Calendar.SECOND, durSec.intValue());

        return expEdate.getTime();
    }

    private int getMedianStdhour(MachineHistory mData) {
        Collections.sort(mData.stdHours);
        return Integer.parseInt(mData.stdHours.get(mData.stdHours.size() / 2));
    }

    private String getPgSeqFromHistory(MachineHistory machineHistory, String requestPgSeq) {
        if (machineHistory.pgSeqs.size() > 0) {
            return machineHistory.pgSeqs.contains(requestPgSeq) ? requestPgSeq : machineHistory.pgSeqs.first();
        }
        return "0";
    }

    private void csvToObj(List<String> orderHistoryCsv, Map<String, Map<String, MachineType>> prodList, Map<String, String> macId2Type) {
        for (String line : orderHistoryCsv) {
            List<String> record = Arrays.asList(line.split(","));
            String pdId = record.get(0);
            String macId = record.get(1);
            if (macId2Type.containsKey(macId)) {
                String macTypeName = macId2Type.get(macId);
                //沒有productId
                if (prodList.containsKey(pdId)) {

                    if (prodList.get(pdId).containsKey(macTypeName)) {
                        Map<String, MachineHistory> existMacList = prodList.get(pdId).get(macTypeName).macList;

                        if (existMacList.containsKey(macId)) {
                            existMacList.get(macId).productTimes += 1;
                            existMacList.get(macId).stdHours.add(record.get(3));
                            existMacList.get(macId).orderIds.add(record.get(2));
                            if (pattern.matcher(record.get(6)).matches()) {
                                existMacList.get(macId).pgSeqs.add(record.get(6));
                            }
                        } else {
                            MachineHistory mData = new MachineHistory(record);
                            existMacList.put(macId, mData);
                        }
                    } else {
                        MachineType macTypeObj = getMachineType(record, macTypeName);
                        prodList.get(pdId).put(macTypeName, macTypeObj);
                    }

                } else {
                    MachineType macTypeObj = getMachineType(record, macTypeName);
                    Map<String, MachineType> macTypeData = new HashMap<>();
                    macTypeData.put(macTypeName, macTypeObj);
                    prodList.put(pdId, macTypeData);
                }

            }
        }
    }

    private MachineType getMachineType(List<String> record, String macTypeName) {
        MachineHistory macData = new MachineHistory(record);

        MachineType macTypeObj = new MachineType(macTypeName);
        macTypeObj.addMacData(macData);
        return macTypeObj;
    }

    public class MachineType {
        private int sumUseTimes = 0;
        private String macType;
        private Map<String, MachineHistory> macList = new HashMap<>();

        public MachineType(String macType) {
            this.macType = macType;
        }

        public void addMacData(MachineHistory macData) {
            macList.put(macData.macId, macData);
        }

        public void calcSumUseTimes() {
            for (Map.Entry<String, MachineHistory> entry : macList.entrySet()) {
                sumUseTimes += entry.getValue().productTimes;
            }
        }
    }

    public class MachineHistory {
        private List<String> stdHours = new ArrayList<>();
        private TreeSet<String> pgSeqs = new TreeSet<String>();
        private Set<String> orderIds = new HashSet<>();
        private int productTimes = 0;
        private String macId;

        public MachineHistory(List<String> record) {
            this.macId = record.get(1);
            this.orderIds.add(record.get(2));
            this.stdHours.add(record.get(3));
            this.productTimes += 1;
            if (record.size() == 7) {
                if (pattern.matcher(record.get(6)).matches()) {
                    this.pgSeqs.add(record.get(6));
                }
            } else {
                this.pgSeqs.add("1");
            }
        }
    }


    enum RecommendReason {
        A1("A1", "指定機台的機型在歷史紀錄orderhistory.csv不存在"),
        A2("A2", "指定機台在歷史紀錄orderhistory.csv不存在"),
        A3("A3", "指定機台抓到的歷史中位數標工=0，無法計算預排"),
        A4("A4", "指定機台抓到的歷史平均良率=0，無法計算預排"),
        A5("A5", "指定機台抓到的歷史平均稼動率=0，無法計算預排"),

        D1("D1", "產品廠務部歷史紀錄沒有此管編資料請確認orderhistory.csv"),
        D2("D2", "產品廠務部歷史紀錄沒有此機型資料請確認orderhistory.csv");

        private String code;
        private String description;

        private RecommendReason(String c, String d) {
            code = c;
            description = d;
        }

        public String info() {
            return code + ":" + description;
        }
    }
}