package com.servtech.servcloud.app.controller.yihcheng;

import com.servtech.servcloud.app.controller.storage.util.RecordAfter;
import com.servtech.servcloud.app.model.servtrack.Line;
import com.servtech.servcloud.app.model.servtrack.LineWorkingHour;
import com.servtech.servcloud.app.model.yihcheng.LineShiftTime;
import com.servtech.servcloud.app.model.yihcheng.ShiftTimeShift;
import com.servtech.servcloud.app.model.servtrack.ShiftTime;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

@RestController
@RequestMapping("/yihcheng/shift-time")
public class YihChengShiftTimeController {

    private static final String LOCK = new String();
    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;


    @RequestMapping(value = "update-and-insert-shift-time-shift", method = RequestMethod.PUT)
    public RequestResult<?> updateAndInsert(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            try {
                double duration_sp = (double) data.get("duration_sp");
                String ori_start_time = data.get("ori_start_time").toString();
                String new_start_time = data.get("new_start_time").toString();
                List<Map> shift_time_shift_list = (List<Map>) data.get("shift_time_shift_list");
                String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "unknow user" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                long time = System.currentTimeMillis();

                Base.openTransaction();
                if (ori_start_time.equals(new_start_time)) {
                    ShiftTime.update("duration_sp = ?, modify_by = ?, modify_time = ?", "start_time = ?", duration_sp, user, new Timestamp(System.currentTimeMillis()), ori_start_time);
                } else {
                    ShiftTimeShift.delete("work_start_time = ?", ori_start_time);
                    ShiftTime.delete("start_time = ?", ori_start_time);
                    Map<String, Object> new_shift_time_map = new HashMap<>();
                    new_shift_time_map.put("start_time", new_start_time);
                    new_shift_time_map.put("end_time", getEndTime(new_start_time));
                    new_shift_time_map.put("duration_sp", duration_sp);
                    RecordAfter.putCreateAndModify(new_shift_time_map, user, time);
                    new ShiftTime().fromMap(new_shift_time_map).insert();
                }

                for (Map shift_time_shift : shift_time_shift_list) {
                    ShiftTimeShift new_shift_time_shift = new ShiftTimeShift();

                    new_shift_time_shift.set("work_start_time", new_start_time);
                    new_shift_time_shift.set("is_open", "Y");
                    if (isShiftExist(shift_time_shift, new_start_time)) {
                        RecordAfter.putModify(shift_time_shift, user, time);
                        new_shift_time_shift.fromMap(shift_time_shift);
                        new_shift_time_shift.saveIt();
                    } else {
                        RecordAfter.putCreateAndModify(shift_time_shift, user, time);
                        new_shift_time_shift.fromMap(shift_time_shift);
                        new_shift_time_shift.insert();
                    }
                }
                Base.commitTransaction();
                return success();
            } catch (Exception e) {
                Base.rollbackTransaction();
                e.printStackTrace();
                return fail(e.getMessage());
            }
        });
    }

    private Object getEndTime(String new_start_time) throws ParseException {
        SimpleDateFormat format = new SimpleDateFormat("HH:mm:ss");
        Date date = format.parse(new_start_time);
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.add(Calendar.SECOND, -1);
        return format.format(cal.getTime());
    }

    private boolean isShiftExist(Map shift_time_shift, String start_time) {
        ShiftTimeShift shiftTimeShift = ShiftTimeShift.findByCompositeKeys(start_time, shift_time_shift.get("sequence"));
        if (shiftTimeShift == null)
            return false;
        return true;
    }

    @RequestMapping(value = "insert-line-shift-time", method = RequestMethod.PUT)
    public RequestResult<?> deleteLineAndInsert(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            try {
                String start_time = data.get("start_time").toString();
                String end_time = data.get("end_time").toString();
                List<Map> line_shift_time_list = (List<Map>) data.get("line_shift_time_list");
                String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "unknow user" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                long time = System.currentTimeMillis();

                Set<String> workDateSet = getWorkDate(start_time, end_time);

                List<Line> lineList = Line.find("group by line_id");
                for (Line line : lineList) {
                    String line_id = line.getString("line_id");
                    for (String workDate : workDateSet) {
                        LineShiftTime.delete("line_id = ? and shift_day = ?"
                                , line_id
                                , workDate);
                        insertLineShiftTime(line_id, workDate, line_shift_time_list, user, time);
                    }
                }

                return success();
            } catch (Exception e) {
                e.printStackTrace();
                return fail(e.getMessage());
            }
        });
    }

    @RequestMapping(value = "update-line-shift-time", method = RequestMethod.PUT)
    public RequestResult<?> updateLineShiftTime(@RequestBody final List<Map> line_shift_time_list) {
        return ActiveJdbc.operTx(() -> {
            try {
                String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "unknow user" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                Map map = line_shift_time_list.get(0);
                String line_id = map.get("line_id").toString();
                String shift_day = map.get("shift_day").toString();

                LineShiftTime.delete("line_id = ? and shift_day = ?", line_id, shift_day);
                for (Map line_shift_time_map : line_shift_time_list) {
                    LineShiftTime lineShiftTime = new LineShiftTime();
                    RecordAfter.putCreateAndModify(line_shift_time_map, user, System.currentTimeMillis());
                    lineShiftTime.fromMap(line_shift_time_map);
                    lineShiftTime.insert();
                }

                LineWorkingHour.update("duration_sp = ?, modify_by = ? , modify_time = ?", "line_id = ? and shift_day = ?", map.get("duration_sp"), user, new Date(), line_id, shift_day);
                return success();
            } catch (Exception e) {
                e.printStackTrace();
                return fail(e.getMessage());
            }
        });
    }

//    @RequestMapping(value = "delete-line-shift-time", method = RequestMethod.DELETE)
//    public RequestResult<?> deleteLineShiftTime(@RequestBody final Map<String, String> data) {
//        return ActiveJdbc.operTx(() -> {
//            try {
//                String line_id = data.get("line_id");
//                String shift_day = data.get("shift_day");
//                LineWorkingHour.delete("line_id = ? and shift_day = ?", line_id, shift_day);
//                LineShiftTime.delete("line_id = ? and shift_day = ?", line_id, shift_day);
//                return success();
//            } catch (Exception e) {
//                e.printStackTrace();
//                return fail(e.getMessage());
//            }
//        });
//    }

    @RequestMapping(value = "delete-line-shift-time", method = RequestMethod.DELETE)
    public RequestResult<?> deleteLineShiftTime(@RequestBody final Map<String, String> data) {
        return ActiveJdbc.operTx(() -> {
            try {
//                String line_id = data.get("line_id");
                String shift_day = data.get("shift_day");
                LineWorkingHour.delete("shift_day = ?", shift_day);
                LineShiftTime.delete("shift_day = ?", shift_day);
                return success();
            } catch (Exception e) {
                e.printStackTrace();
                return fail(e.getMessage());
            }
        });
    }

    private Set<String> getWorkDate(String startDate, String endDate) {
        Set<String> set = new TreeSet<String>();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        StringBuilder sb = new StringBuilder();
        sb.append("SELECT * FROM a_servtrack_line_working_hour ");
        sb.append("WHERE ");
        sb.append("shift_day BETWEEN ");
        sb.append("'" + startDate + " 00:00:00' ");
        sb.append("AND ");
        sb.append("'" + endDate + " 23:59:59' ");
        List<LineWorkingHour> list = LineWorkingHour.findBySQL(sb.toString());
        for (LineWorkingHour lineWorkingHour : list) {
            set.add(sdf.format(lineWorkingHour.getDate("shift_day")));
        }
        return set;
    }


    private void insertLineShiftTime(String line_id, String workDate, List<Map> line_shift_time_list, String user, long time) {
        for (Map line_shift_time : line_shift_time_list) {
            LineShiftTime new_line_shift_time = new LineShiftTime();
            RecordAfter.putCreateAndModify(line_shift_time, user, time);
            new_line_shift_time.fromMap(line_shift_time);
            new_line_shift_time.set("line_id", line_id);
            new_line_shift_time.set("shift_day", workDate);
            new_line_shift_time.insert();
        }
    }
}
