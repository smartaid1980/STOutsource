package com.servtech.servcloud.app.controller.servtrack;

import com.servtech.servcloud.app.model.servtrack.LineWorkingHour;
import com.servtech.servcloud.app.model.servtrack.WorkOp;
import com.servtech.servcloud.app.model.servtrack.WorkTracking;
import org.javalite.activejdbc.Base;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by Frank on 2019/5/8.
 */
public class TrackCalcUtil {
    static String stdHourValue;
    static Boolean stdHourIsExist;
    static Double minute;
    static Map<String, String> stdHourContainer;
    static String comparePks;


    static SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    public static Map<String, String> getDurations() {
        Map<String, String> spDurationContainer = new HashMap<String, String>();
        List<Map> spDurationDatas = getSpDuration();
        for (Map data : spDurationDatas) {
            String pks = data.get("line_id").toString() + data.get("shift_day").toString();
            String spDuration = data.get("duration_sp").toString();
            spDurationContainer.put(pks, spDuration);
        }
        return spDurationContainer;
    }

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
                "`modify_time`) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
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
                "`modify_time` = VALUES(modify_time)");
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
                "`modify_time`) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
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
                "`modify_time` = VALUES(modify_time)");
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
                "`modify_time`) " +
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
                "`modify_time`) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE " +
                "`move_in` = VALUES(move_in), " +
                "`line_id` = VALUES(line_id), " +
                "`work_id` = VALUES(work_id), " +
                "`op` = VALUES(op), " +
                "`create_by` = VALUES(create_by), " +
                "`create_time` = VALUES(create_time), " +
                "`modify_by` = VALUES(modify_by), " +
                "`modify_time` = VALUES(modify_time)");
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

    public static List<Map> getLastGoQuantityFromWorkTracking(String workId , Object useForTrack){
        StringBuilder sb = new StringBuilder();
        sb.append("SELECT a.work_id, a.op, a.move_in , a.move_out , SUM(a.go_quantity) AS go_quantity , SUM(a.output) AS output FROM (SELECT * FROM a_servtrack_work_tracking order by move_out DESC) a ");
        sb.append("WHERE ");
        sb.append("a.work_id = '" + workId + "' ");
        sb.append("GROUP BY a.op ");
        String sql = sb.toString();

        List<Map> results = Base.findAll(sql);
        List<Map> WorkTracking = new ArrayList<>();
        double OpYeildProduct = 1.0;
        for(Map result : results){
            Map map = new HashMap();
            double go_quantity = Double.valueOf(result.get("go_quantity").toString() == null ? "0" : result.get("go_quantity").toString());
            double output = Double.valueOf(result.get("output").toString() == null ? "0" : result.get("output").toString());
            if(go_quantity != 0.0 && output != 0.0){
                OpYeildProduct *= (go_quantity / output);
            }
            map.put("op",result.get("op").toString());
            map.put("move_in",result.get("move_in").toString());
            map.put("move_out",result.get("move_out").toString());
            map.put("go_quantity",go_quantity);
            WorkTracking.add(map);
        }
        List<Map> queryOpsSumGoQuantity = compareOpOrder(WorkTracking);

        Map lastOne = queryOpsSumGoQuantity.get(queryOpsSumGoQuantity.size() - 1);
        lastOne.put("OpYeildProduct",OpYeildProduct);
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

    public static int checkAndGetGoQuantity(String ngSumQuantity, String output) {
        if (ngSumQuantity.isEmpty() || ngSumQuantity.equals("") || ngSumQuantity.equals("0")) {
            return Integer.parseInt(output);
        } else {
            return TrackCalcUtil.getGoQuantity(output, ngSumQuantity);
        }
    }

    public static double getStdHour(String workId, String op) {

        stdHourContainer = new HashMap<String, String>();
        List<Map> stdHourDatas = TrackCalcUtil.findStdHours();
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
            return Double.parseDouble(stdHourValue);
        } else {
            return 0.0;
        }
    }
}
