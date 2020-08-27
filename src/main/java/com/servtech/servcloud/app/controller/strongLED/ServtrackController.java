package com.servtech.servcloud.app.controller.strongLED;

import com.servtech.servcloud.app.model.servtrack.ShiftTime;
import com.servtech.servcloud.app.model.servtrack.WorkTracking;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/6/20.
 */
@RestController
@RequestMapping("/strongled/tracking")
public class ServtrackController {
    static SimpleDateFormat sdfYMDHms = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    static SimpleDateFormat sdfYMD = new SimpleDateFormat("yyyy-MM-dd");

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    StrackConfig strackConfig;

    class StrackConfig {
        public Map<String, List<Map>> result;
    }

    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<Map<String, List<Map>>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<Map<String, List<Map>>>>() {
            @Override
            public RequestResult<Map<String, List<Map>>> operate() {
                List<Map> workShiftTime = ShiftTime.findAll().toMaps();
                Date currentDate = new Date();
                int durationSp = Math.round(Float.parseFloat(workShiftTime.get(0).get("duration_sp").toString()));
                String startTime = sdfYMD.format(currentDate) + " " + workShiftTime.get(0).get("start_time").toString();
                String endTime = getEndTime(startTime, durationSp);
                List<Map> onlyTracking = Base.findAll(getOnlyTrackingSql(startTime, endTime));
                List<Map> trackingNoMoveOut = Base.findAll(getTrackingNoMoveOutSql(startTime, endTime));
                List<Map> trackingAll = Stream.of(onlyTracking, trackingNoMoveOut)
                        .flatMap(x -> x.stream())
                        .collect(Collectors.toList());

                List<Map> invalidLineStatusLogs = Base.findAll(getInvalidLineStatusLog(startTime, endTime));
                String currentTime = sdfYMDHms.format(currentDate);
                for (Map ilsLog : invalidLineStatusLogs) {
                    if (ilsLog.get("line_status_end") == null) {
                        ilsLog.put("line_status_end", currentTime);
                        String lineStatusStart = ilsLog.get("line_status_start").toString();
                        ilsLog.put("duration_min", getDurationMin(lineStatusStart, currentTime));
                    } else {
                        String lineStatusStart = ilsLog.get("line_status_start").toString();
                        String lineStatusEnd = ilsLog.get("line_status_end").toString();
                        ilsLog.put("is_end", true);
                        ilsLog.put("duration_min", getDurationMin(lineStatusStart, lineStatusEnd));
                    }
                }

                Map<String, List<Map>> result = new HashMap<>();
                result.put("tracking", trackingAll);
                result.put("invalidLineStatus", invalidLineStatusLogs);

                return success(result);
            }
        });
    }

    @RequestMapping(value = "/shifttime", method = RequestMethod.PUT)
    public RequestResult<?> updateShiftTime(@RequestBody final List<Map> datas) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    //取得現在時間
                    Timestamp timeMillis = new Timestamp(System.currentTimeMillis());
                    //取得修改者
                    String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

                    for (Map data : datas) {
                        String moveIn = data.get("move_in").toString();
                        String workId = data.get("work_id").toString();
                        String lineId = data.get("line_id").toString();
                        String op = data.get("op").toString();
                        WorkTracking.update("shift_time = ?, modify_by = ?, modify_time = ?",
                                "move_in = ? and work_id = ? and line_id = ? and op = ?",
                                timeMillis, user, timeMillis, moveIn, workId, lineId, op);
                    }
                    return success("success");
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    private int getDurationMin(String lineStatusStart, String lineStatusEnd) {
        long diffTime = 0;
        try {
            diffTime = sdfYMDHms.parse(lineStatusEnd).getTime() - sdfYMDHms.parse(lineStatusStart).getTime();
        } catch (ParseException e) {
            e.printStackTrace();
        }
        float durationMin = (float) diffTime / (1000 * 60);
        return Math.round(durationMin);
    }

    static String getOnlyTrackingSql(String startTime, String endTime) {
        StringBuilder sql = new StringBuilder();
//        sql.append("SELECT " +
//                "vql.group_id, " +
//                "vql.group_name, " +
//                "vql.line_id, " +
//                "t.move_in, " +
//                "t.move_out, " +
//                "t.work_id, " +
//                "t.op, " +
//                "t.output, " +
//                "t.ng_quantity, " +
//                "vwo.process_name, " +
//                "vwo.product_name, " +
//                "vql.line_name, " +
//                "vql.is_open " +
//                "FROM a_servtrack_work_tracking AS t ");
//        sql.append("LEFT JOIN a_servtrack_tracking_no_move_out AS tnmo ");
//        sql.append("ON t.move_in = tnmo.move_in AND ");
//        sql.append("t.line_id = tnmo.line_id AND ");
//        sql.append("t.work_id = tnmo.work_id AND ");
//        sql.append("t.op = tnmo.op ");
//
//        sql.append("INNER JOIN a_strongled_view_group_line vql ON t.line_id = vql.line_id ");
//        sql.append("INNER JOIN a_servtrack_view_work_op vwo ON t.work_id = vwo.work_id and t.op = vwo.op ");
//
//        sql.append("WHERE ");
        sql.append("SELECT * FROM a_strongled_servtrack_dashboard_view_only_tracking WHERE ");
        sql.append("(t_move_in between '" + startTime + "' AND '" + endTime + "' ");
        sql.append("OR ");
        sql.append("t_move_in <= '" + startTime + "' AND move_out between '" + startTime + "' AND '" + endTime + "') ");
        sql.append("AND tnmo_move_in IS NULL");
        return sql.toString();
    }

    static String getInvalidLineStatusLog(String startTime, String endTime) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT * FROM a_strongled_dashboard_view_invalid_line_status_log ");
        sql.append("WHERE ");
        sql.append("line_status_end IS NULL ");
        sql.append("OR ");
        sql.append("line_status_end between '" + startTime + "' AND '" + endTime + "' ");

        return sql.toString();
    }

    static String getTrackingNoMoveOutSql(String startTime, String endTime) {
        StringBuilder sql = new StringBuilder();
//        sql.append("SELECT " +
//                "vql.group_id, " +
//                "vql.group_name, " +
//                "vql.line_id, " +
//                "tnmo.move_in, " +
//                "t.move_out, " +
//                "tnmo.op, " +
//                "t.output, " +
//                "t.ng_quantity, " +
//                "tnmo.work_id, " +
//                "vwo.process_name, " +
//                "vwo.product_name, " +
//                "vql.line_name, " +
//                "vql.is_open " +
//                "FROM a_servtrack_work_tracking t ");
//
//        sql.append("RIGHT JOIN a_servtrack_tracking_no_move_out tnmo ");
//        sql.append("ON t.move_in = tnmo.move_in AND ");
//        sql.append("t.line_id = tnmo.line_id AND ");
//        sql.append("t.work_id = tnmo.work_id AND ");
//        sql.append("t.op = tnmo.op ");
//
//        sql.append("INNER JOIN a_strongled_view_group_line vql ON tnmo.line_id = vql.line_id ");
//        sql.append("SELECT * FROM a_servtrack_view_work_tracking_rj_no_move_out_group_line_work_op WHERE ");
//
//        sql.append("WHERE ");
        sql.append("SELECT * FROM a_strongled_servtrack_dashboard_view_tracking_no_move_out WHERE ");
        sql.append("tnmo_move_in <= '" + endTime + "' AND t_move_out IS NULL ");//當前班次天時間之前未出站的資料
        sql.append("OR ");
        sql.append("t_move_out between '" + startTime + "' AND '" + endTime + "' "); //當前班次天時間之前並且在今日出站的資料

        return sql.toString();
    }

    public static String getEndTime(String startTime, int hours) {
        Calendar cal = Calendar.getInstance();
        try {
            Date date = new Date(sdfYMDHms.parse(startTime).getTime());
            cal.setTime(date);
            cal.add(Calendar.HOUR_OF_DAY, hours);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return sdfYMDHms.format(cal.getTime());
    }
}
