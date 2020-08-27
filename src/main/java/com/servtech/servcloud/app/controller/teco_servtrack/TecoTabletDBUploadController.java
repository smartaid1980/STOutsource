package com.servtech.servcloud.app.controller.teco_servtrack;

import com.servtech.servcloud.app.model.servtrack.LineWorkingHour;
import com.servtech.servcloud.app.model.servtrack.Work;
import com.servtech.servcloud.app.model.servtrack.WorkOp;
import com.servtech.servcloud.app.model.servtrack.WorkTracking;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by admin on 2017/6/26.
 */
@RestController
@RequestMapping("/teco-servtrack/tablet")
public class TecoTabletDBUploadController {
    private static final org.slf4j.Logger log = LoggerFactory.getLogger(TecoTabletDBUploadController.class);
    static String PRODUCING_STATUS = "1";
    static boolean EXCEPTION_LOG_PRINT_TRIGGER;
    static String moveIn;
    static String moveOut;
    static String lineId;
    static String workId;
    static String op;
    static String output;
    static String ngSumQuantity;
    static String createBy;
    static String createTime;
    static String modifyBy;
    static String modifyTime;
    static String processCode;
    static String shiftDay;
    static Boolean spDurationIsExist;
    static Boolean stdHourIsExist;
    static Map<String, String> stdHourContainer;
    static String comparePks;
    static Map<String, String> spDurationContainer;
    static String comparePks2;
    static Double opDuration;
    static Integer spOutput;
    static Double aval;
    static Double perf;
    static Double oee;
    static Integer outputVariance;
    static Double durationVariance;
    static String stdHourValue;
    static Double stdHour;
    static Integer goQuantity;
    static Double quality;
    static String spDurationValue;
    static Double spDuration;
    static List<Map> trackingNg;
    static String ngCode;
    static String ngQuantity;
    static Double minute;
    static StringBuilder errLog;
    static String staffId;
    StringWriter sw = new StringWriter();

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "upload", method = RequestMethod.PUT)
    public RequestResult<String> uploadTabletDatas(@RequestBody final List<Map> datas) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                EXCEPTION_LOG_PRINT_TRIGGER = false;
                errLog = new StringBuilder();

                PreparedStatement batchToTracking = CalcUtil.batchToTracking();
                PreparedStatement batchToTrackingNg = CalcUtil.batchToTrackingNg();
                PreparedStatement batchToTrackingNoMoveOut = CalcUtil.batchToTrackingNoMoveOut();
                try {
                    for (Map mData : datas) {
                        moveIn = mData.get("move_in").toString();
                        lineId = mData.get("line_id").toString();
                        workId = mData.get("work_id").toString();
                        staffId = mData.get("staff_id").toString();
                        op = mData.get("op").toString();
                        processCode = mData.get("process_code").toString();
                        shiftDay = mData.get("shift_day").toString();
                        output = mData.get("output").toString();
                        ngSumQuantity = mData.get("ng_quantity_sum").toString();
                        moveOut = mData.get("move_out") == null ? null : mData.get("move_out").toString();
                        createBy = mData.get("create_by").toString();
                        createTime = mData.get("create_time").toString();
                        modifyBy = mData.get("modify_by").toString();
                        modifyTime = mData.get("modify_time").toString();
                        stdHour = getStdHour();
                        goQuantity = checkAndGetGoQuantity();
                        quality = CalcUtil.getQuality(goQuantity, output);

                        if (!(moveIn == null || moveIn.equals(""))) {
                            Work work = Work.findFirst("work_id = ?", workId);
                            work.set("status_id", PRODUCING_STATUS).saveIt();
                        }

                        if (moveOut == null || moveOut.equals("")) {
                            Base.addBatch(batchToTrackingNoMoveOut,
                                    moveIn,
                                    lineId,
                                    workId,
                                    op,
                                    createBy,
                                    createTime,
                                    modifyBy,
                                    modifyTime,
                                    staffId,
                                    shiftDay);
                        } else {
                            opDuration = CalcUtil.getOpDuration(moveIn, moveOut);
                            spOutput = CalcUtil.getSpOutput(opDuration, stdHour);

                            checkSpDurationIsExist();

                            if (spDurationIsExist) {
                                spDurationValue = spDurationContainer.get(comparePks2);
                                spDuration = Double.parseDouble(spDurationValue);
                                aval = CalcUtil.getAval(opDuration, spDuration);
                                perf = CalcUtil.getPerf(Integer.parseInt(output), stdHour, opDuration);
                                oee = CalcUtil.getOee(aval, quality, perf);
                            } else {
                                aval = 0.00;
                                perf = CalcUtil.getPerf(Integer.parseInt(output), stdHour, opDuration);
                                oee = 0.00;
                                log.info("line_id: " + lineId + " shift_day: " + shiftDay + " data doesn't have sp_duration value, aval and oee value are zero ");
                            }
                            outputVariance = CalcUtil.getOutputVariance(goQuantity, opDuration, stdHour);
                            durationVariance = CalcUtil.getDurationVariance(opDuration, goQuantity, stdHour);

                            Base.addBatch(batchToTracking,
                                    moveIn,
                                    lineId,
                                    workId,
                                    op,
                                    shiftDay,
                                    moveOut,
                                    CalcUtil.toRound(opDuration, 4),
                                    output,
                                    goQuantity,
                                    ngSumQuantity,
                                    CalcUtil.toRound(quality * 100, 2) > 999 ? 999 : CalcUtil.toRound(quality * 100, 2),
                                    spOutput,
                                    CalcUtil.toRound(aval * 100, 2) > 999 ? 999 : CalcUtil.toRound(aval * 100, 2),
                                    CalcUtil.toRound(perf * 100, 2) > 999 ? 999 : CalcUtil.toRound(perf * 100, 2),
                                    CalcUtil.toRound(oee * 100, 2) > 999 ? 999 : CalcUtil.toRound(oee * 100, 2),
                                    outputVariance,
                                    CalcUtil.toRound(durationVariance, 2),
                                    createBy,
                                    createTime,
                                    modifyBy,
                                    modifyTime,
                                    staffId);

                            if (ngSumQuantity.isEmpty() || ngSumQuantity.equals("") || ngSumQuantity.equals("0")) {
//                                errLog.append("No ng sum quantity");
                            } else {
                                trackingNg = (List<Map>) mData.get("tracking_ng");
                                for (Map tnData : trackingNg) {
                                    ngCode = tnData.get("ng_code").toString();
                                    ngQuantity = tnData.get("ng_quantity").toString();
                                    Base.addBatch(batchToTrackingNg,
                                            moveIn,
                                            lineId,
                                            workId,
                                            op,
                                            processCode,
                                            ngCode,
                                            ngQuantity,
                                            createBy,
                                            createTime,
                                            modifyBy,
                                            modifyTime,
                                            staffId);
                                }
                            }
                        }
                    }
                    Base.executeBatch(batchToTracking);
                    batchToTracking.close();

                    Base.executeBatch(batchToTrackingNg);
                    batchToTrackingNg.close();

                    Base.executeBatch(batchToTrackingNoMoveOut);
                    batchToTrackingNoMoveOut.close();

                    return success("update success");

                } catch (com.mysql.jdbc.exceptions.jdbc4.MySQLIntegrityConstraintViolationException e) {
                    EXCEPTION_LOG_PRINT_TRIGGER = true;
                    log.info("##lineId:" + lineId + ", " +
                            "workId:" + workId + ", " +
                            "op:" + op);
                    e.printStackTrace(new PrintWriter(sw));
                    log.info(sw.toString());
                    return fail("error_code:001");
                } catch (NullPointerException e) {
                    EXCEPTION_LOG_PRINT_TRIGGER = true;
                    log.info("lineId:" + lineId + ", " +
                                    "workId" + workId + ", " +
                                    "op:" + op + ", " +
                                    getSpDurationErrorResult(spDurationIsExist) +
                                    getStdHourErrorResult(stdHourIsExist) +
                                    getMoveOutErrorResult(moveOut)
                    );
                    e.printStackTrace(new PrintWriter(sw));
                    log.info(sw.toString());
                    return fail("error_code:002");
                } catch (org.javalite.activejdbc.DBException e) {
                    EXCEPTION_LOG_PRINT_TRIGGER = true;
                    log.info("db exception...");
                    e.printStackTrace(new PrintWriter(sw));
                    log.info(sw.toString());
                    return fail("error_code:003");
                } catch (Exception e) {
                    EXCEPTION_LOG_PRINT_TRIGGER = true;
                    e.printStackTrace(new PrintWriter(sw));
                    log.info(sw.toString());
                    return fail("update fail...");
                } finally {
                    if (EXCEPTION_LOG_PRINT_TRIGGER) {
                        log.info("### debug tablet request params : " + datas.toString());
                    }
                    try {
                        batchToTracking.close();
                        batchToTrackingNg.close();
                        batchToTrackingNoMoveOut.close();
                    } catch (SQLException e) {
                        e.printStackTrace(new PrintWriter(sw));
                        log.info(sw.toString());
                    }
                }
            }
        });
    }

    public static void checkSpDurationIsExist() {
        spDurationContainer = new HashMap<String, String>();
        List<Map> spDurationDatas = CalcUtil.getSpDuration();
        for (Map data : spDurationDatas) {
            String pks = data.get("line_id").toString() + data.get("shift_day").toString();
            String spDuration = data.get("duration_sp").toString();
            spDurationContainer.put(pks, spDuration);
        }
        comparePks2 = lineId + shiftDay;
        spDurationIsExist = spDurationContainer.containsKey(comparePks2);
        errLog.append("sp_duration is exist ? " + spDurationIsExist + "\n");
    }

    public double getStdHour() {
        stdHourContainer = new HashMap<String, String>();
        List<Map> stdHourDatas = CalcUtil.findStdHours();
        for (Map data : stdHourDatas) {
            String _workId = data.get("work_id").toString();
            String _op = data.get("op").toString();
            String pks = _workId + _op;
            String std_hour = data.get("std_hour").toString();
            stdHourContainer.put(pks, std_hour);
        }
        comparePks = workId + op;
        stdHourIsExist = stdHourContainer.containsKey(comparePks);
        if (stdHourIsExist) {
            stdHourValue = stdHourContainer.get(comparePks);
            stdHour = Double.parseDouble(stdHourValue);
            return stdHour;
        } else {
            return 0.0;
        }
    }

    public int checkAndGetGoQuantity() {
        if (ngSumQuantity.isEmpty() || ngSumQuantity.equals("") || ngSumQuantity.equals("0")) {
            errLog.append("No ng quantity, go_quantity = output\n");
            return goQuantity = Integer.parseInt(output);
        } else {
            return goQuantity = CalcUtil.getGoQuantity(output, ngSumQuantity);
        }
    }

    public static String getStdHourErrorResult(Boolean stdHourIsExist) {
        String message = "";
        if (stdHourIsExist != null) {
            if (!stdHourIsExist) {
                message = "No std_hour, check work op finish to set std_hour";
            }
        }
        return message;
    }

    public static String getSpDurationErrorResult(Boolean spDurationIsExist) {
        String message = "";
        if (spDurationIsExist != null) {
            if (!spDurationIsExist) {
                message = "No sp_duration, check LINE_WORKING_HOUR finish to set sp_duration";
            }
        }
        return message;
    }

    public static String getMoveOutErrorResult(String moveOut) {
        String message = "";
        if (moveOut == null) {
            message = "no move out action!!!";
        }
        return message;
    }

    public static class CalcUtil {

        static SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        public static Double getOpDuration(String moveIn, String moveOut) {
            try {
                if ((moveIn == null || moveIn.equals("")) || (moveOut == null || moveOut.equals(""))) {
                    return 0.0;
                } else {
                    minute = (double) (format.parse(moveOut).getTime() - format.parse(moveIn).getTime()) / (double) (1000 * 60);
                    return minute > 999999 ? 0.0 : minute;
                }
            } catch (ParseException e) {
                e.printStackTrace();
                return 0.0;
            }
        }

        public static int getGoQuantity(String output, String ngQuantity) {
            int goQuantity = Integer.parseInt(output) - Integer.parseInt(ngQuantity);
            if (goQuantity >= 0) {
                return goQuantity;
            } else {
                return 0;
            }
        }

        public static Double getQuality(int goQuantity, String output) {
            if (goQuantity <= 0 || Double.parseDouble(output) <= 0) {
                return 0.0;
            } else {
                double result = (double) goQuantity / Double.parseDouble(output);
                return result;
            }
        }

        public static List<Map> findStdHours() {
            StringBuilder sb = new StringBuilder();
            sb.append("SELECT `work_id`, `op`, `std_hour` from a_servtrack_work_op ");
            String sql = sb.toString();
            return WorkOp.findBySQL(sql).toMaps();
        }

        public static Integer getSpOutput(Double opDuration, Double stdHour) {
            if (opDuration <= 0 || stdHour <= 0) {
                return 0;
            } else {
                double result = opDuration / stdHour;
                int spOutput = (int) result;
                return spOutput;
            }
        }

        public static List<Map> getSpDuration() {
            StringBuilder sb = new StringBuilder();
            sb.append("SELECT `line_id`,`shift_day`,`duration_sp` from a_servtrack_line_working_hour ");
            String sql = sb.toString();
            return LineWorkingHour.findBySQL(sql).toMaps();
        }

        public static Double getAval(Double opDuration, Double spDuration) {
            if (opDuration <= 0 || spDuration <= 0) {
                return 0.0;
            } else {
                double aval = opDuration / (spDuration * 60);
                return aval;
            }
        }

        public static Double getPerf(int output, double stdHour, double opDuration) {
            if (output <= 0 || stdHour <= 0 || opDuration <= 0) {
                return 0.0;
            } else {
                double perf = ((double) output * stdHour) / opDuration;
                return perf;
            }
        }

        public static Double getOee(Double aval, Double quality, Double perf) {
            double oee = aval * quality * perf;
            return oee;
        }

        public static int getOutputVariance(int goQuantity, Double opDuration, Double stdHour) {
            if (opDuration <= 0 || stdHour <= 0) {
                return goQuantity;
            } else {
                int result = goQuantity - (int) (opDuration / stdHour);
                return result;
            }
        }

        public static Double getDurationVariance(Double opDuration, int goQuantity, Double stdHour) {
            double result = ((double) (goQuantity) * stdHour) - opDuration;
            return result;
        }

        public static PreparedStatement batchToTracking() {
            PreparedStatement ps = Base.startBatch("INSERT INTO `a_servtrack_work_tracking` " +
                    "(`move_in`, " +
                    "`line_id`, " +
                    "`work_id`, " +
                    "`op`, " +
                    "`shift_day`, " +
                    "`move_out`, " +
                    "`op_duration`, " +
                    "`output`, " +
                    "`go_quantity`, " +
                    "`ng_quantity`, " +
                    "`quality`, " +
                    "`output_sp`, " +
                    "`aval`, " +
                    "`perf`, " +
                    "`oee`, " +
                    "`output_variance`, " +
                    "`duration_variance`, " +
                    "`create_by`, " +
                    "`create_time`, " +
                    "`modify_by`, " +
                    "`modify_time`, " +
                    "`cust_field_1`) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                    "ON DUPLICATE KEY UPDATE " +
                    "`move_in` = VALUES(move_in), " +
                    "`line_id` = VALUES(line_id), " +
                    "`work_id` = VALUES(work_id), " +
                    "`op` = VALUES(op), " +
                    "`shift_day` = VALUES(shift_day), " +
                    "`move_out` = VALUES(move_out), " +
                    "`op_duration` = VALUES(op_duration), " +
                    "`output` = VALUES(output), " +
                    "`go_quantity` = VALUES(go_quantity), " +
                    "`ng_quantity` = VALUES(ng_quantity), " +
                    "`quality` = VALUES(quality), " +
                    "`output_sp` = VALUES(output_sp), " +
                    "`aval` = VALUES(aval), " +
                    "`perf` = VALUES(perf), " +
                    "`oee` = VALUES(oee), " +
                    "`output_variance` = VALUES(output_variance), " +
                    "`duration_variance` = VALUES(duration_variance), " +
                    "`create_by` = VALUES(create_by), " +
                    "`create_time` = VALUES(create_time), " +
                    "`modify_by` = VALUES(modify_by), " +
                    "`modify_time` = VALUES(modify_time), " +
                    "`cust_field_1` = VALUES(cust_field_1)");
            return ps;
        }

        public static PreparedStatement batchToTrackingNg() {
            PreparedStatement ps = Base.startBatch("INSERT INTO `a_servtrack_work_tracking_ng` " +
                    "(`move_in`, " +
                    "`line_id`, " +
                    "`work_id`, " +
                    "`op`, " +
                    "`process_code`, " +
                    "`ng_code`, " +
                    "`ng_quantity`, " +
                    "`create_by`, " +
                    "`create_time`, " +
                    "`modify_by`, " +
                    "`modify_time`, " +
                    "`cust_field_1`) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                    "ON DUPLICATE KEY UPDATE " +
                    "`move_in` = VALUES(move_in), " +
                    "`line_id` = VALUES(line_id), " +
                    "`work_id` = VALUES(work_id), " +
                    "`op` = VALUES(op), " +
                    "`process_code` = VALUES(process_code), " +
                    "`ng_code` = VALUES(ng_code), " +
                    "`ng_quantity` = VALUES(ng_quantity), " +
                    "`create_by` = VALUES(create_by), " +
                    "`create_time` = VALUES(create_time), " +
                    "`modify_by` = VALUES(modify_by), " +
                    "`modify_time` = VALUES(modify_time), " +
                    "`cust_field_1` = VALUES(cust_field_1)");
            return ps;
        }

        public static PreparedStatement batchToWorkOp() {
            PreparedStatement ps = Base.startBatch("INSERT INTO `a_servtrack_work_op` " +
                            "(`work_id`, " +
                            "`op`, " +
                            "`process_code`, " +
                            "`op_duration`, " +
                            "`output`, " +
                            "`go_quantity`, " +
                            "`ng_quantity`, " +
                            "`quality`, " +
                            "`create_by`, " +
                            "`create_time`, " +
                            "`modify_by`, " +
                            "`modify_time`) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                            "ON DUPLICATE KEY UPDATE " +
                            "`work_id` = VALUES(work_id), " +
                            "`op` = VALUES(op), " +
                            "`process_code` = VALUES(process_code), " +
                            "`op_duration` = VALUES(op_duration), " +
                            "`output` = VALUES(output), " +
                            "`go_quantity` = VALUES(go_quantity), " +
                            "`ng_quantity` = VALUES(ng_quantity), " +
                            "`quality` = VALUES(quality), " +
                            "`create_by` = VALUES(create_by)," +
                            "`create_time` = VALUES(create_time), " +
                            "`modify_by` = VALUES(modify_by), " +
                            "`modify_time` = VALUES(modify_time)"
            );
            return ps;
        }

        public static PreparedStatement batchToWork() {
            PreparedStatement ps = Base.startBatch("INSERT INTO `a_servtrack_work` " +
                            "(`work_id`, " +
                            "`product_id`, " +
                            "`status_id`, " +
                            "`modify_by`, " +
                            "`modify_time`, " +
                            "`cust_field_1`) " +
                            "VALUES (?, ?, ?, ?) " +
                            "ON DUPLICATE KEY UPDATE " +
                            "`work_id` = VALUES(work_id), " +
                            "`product_id` = VALUES(product_id), " +
                            "`status_id` = VALUES(status_id), " +
                            "`modify_by` = VALUES(modify_by), " +
                            "`modify_time` = VALUES(modify_time)"
            );
            return ps;
        }

        public static PreparedStatement batchToTrackingNoMoveOut() {
            PreparedStatement ps = Base.startBatch("INSERT INTO `a_servtrack_tracking_no_move_out` " +
                    "(`move_in`, " +
                    "`line_id`, " +
                    "`work_id`, " +
                    "`op`, " +
                    "`create_by`, " +
                    "`create_time`, " +
                    "`modify_by`, " +
                    "`modify_time`, " +
                    "`cust_field_1`, " +
                    "`shift_day`) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                    "ON DUPLICATE KEY UPDATE " +
                    "`move_in` = VALUES(move_in), " +
                    "`line_id` = VALUES(line_id), " +
                    "`work_id` = VALUES(work_id), " +
                    "`op` = VALUES(op), " +
                    "`create_by` = VALUES(create_by), " +
                    "`create_time` = VALUES(create_time), " +
                    "`modify_by` = VALUES(modify_by), " +
                    "`modify_time` = VALUES(modify_time), " +
                    "`cust_field_1` = VALUES(cust_field_1), " +
                    "`shift_day` = VALUES(shift_day)");
            return ps;
        }

        public static List<Map> getDatasFromWorkOp(String workId, String op) {
            StringBuilder sb = new StringBuilder();
            sb.append("SELECT `op_duration`, `output`, `go_quantity`, `ng_quantity`, `quality`, `ng_quantity` FROM a_servtrack_work_op ");
            sb.append("WHERE ");
            sb.append("work_id = '" + workId + "'");
            sb.append(" AND ");
            sb.append("op = '" + op + "'");
            String sql = sb.toString();
            return WorkOp.findBySQL(sql).toMaps();
        }

        public static List<Map> getLastGoQuantityFromWorkTracking(String workId) {
            StringBuilder sb = new StringBuilder();
            sb.append("SELECT work_id, op, SUM(go_quantity) AS go_quantity FROM a_servtrack_work_tracking ");
            sb.append("WHERE ");
            sb.append("work_id = '" + workId + "' ");
            sb.append("GROUP BY op ");
            String sql = sb.toString();
            List<Map> queryOpsSumGoQuantity = compareOpOrder(WorkTracking.findBySQL(sql).toMaps());

            Map lastOne = queryOpsSumGoQuantity.get(queryOpsSumGoQuantity.size() - 1);
            List<Map> lastGoQuantity = new ArrayList<Map>();
            lastGoQuantity.add(lastOne);

            return lastGoQuantity;
        }

        public static List<Map> getOpDurationFromTracking(String workId) {
            StringBuilder sb = new StringBuilder();
            sb.append("SELECT op_duration FROM a_servtrack_work_tracking ");
            sb.append("WHERE ");
            sb.append("work_id = '" + workId + "'");
            String sql = sb.toString();
            return WorkTracking.findBySQL(sql).toMaps();
        }

        public static List<Map> getLastMoveOutFromTracking(String workId) {
            StringBuilder sb = new StringBuilder();
            sb.append("SELECT move_out FROM a_servtrack_work_tracking ");
            sb.append("WHERE ");
            sb.append("work_id = '" + workId + "'");
            sb.append("ORDER BY move_out DESC LIMIT 0,1 ");
            String sql = sb.toString();
            return WorkTracking.findBySQL(sql).toMaps();
        }

        public static List<Map> getFirstMoveInFromTracking(String workId) {
            StringBuilder sb = new StringBuilder();
            sb.append("SELECT work_id, move_in FROM a_servtrack_work_tracking ");
            sb.append("WHERE ");
            sb.append("work_id = '" + workId + "'");
            sb.append("ORDER BY move_in ASC LIMIT 0,1 ");
            String sql = sb.toString();
            return WorkTracking.findBySQL(sql).toMaps();
        }

        public static double toRound(double doubleNum, int decimalPlace) {
            String stringNum = Double.toString(doubleNum);
            BigDecimal roundNum = new BigDecimal(stringNum).setScale(decimalPlace, BigDecimal.ROUND_HALF_UP);
            return roundNum.doubleValue();
        }

        public static List<Map> compareOpOrder(List<Map> list) {
            Comparator<Map> cmp = new Comparator<Map>() {
                public int compare(Map map1, Map map2) {
                    String alphabet1 = map1.get("op").toString().replaceAll("\\d+$", "");
                    String alphabet2 = map2.get("op").toString().replaceAll("\\d+$", "");
                    int cmpAlphabet = alphabet1.compareToIgnoreCase(alphabet2);
                    if (cmpAlphabet != 0) {
                        return cmpAlphabet;
                    }

                    String numeric1 = "";
                    String numeric2 = "";
                    Pattern pattern = Pattern.compile("\\d+$");
                    Matcher matcher1 = pattern.matcher(map1.get("op").toString());
                    Matcher matcher2 = pattern.matcher(map2.get("op").toString());
                    if (matcher1.find()) {
                        numeric1 = matcher1.group(0);
                    }
                    if (matcher2.find()) {
                        numeric2 = matcher2.group(0);
                    }

                    if ("".equals(numeric1)) {
                        return -1;
                    }
                    if ("".equals(numeric2)) {
                        return 1;
                    }
                    int num1 = Integer.parseInt(numeric1);
                    int num2 = Integer.parseInt(numeric2);
                    return num1 - num2;
                }
            };
            Collections.sort(list, cmp);

            return list;
        }
    }
}
