package com.servtech.servcloud.app.controller.servtrack;

import com.servtech.servcloud.app.model.servtrack.Line;
import com.servtech.servcloud.app.model.servtrack.LineWorkingHour;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/6/20.
 */
@RestController
@RequestMapping("/servtrack/lineworkinghour")
public class ServtrackLineWorkingHourController {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(ServtrackLineWorkingHourController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<List<String>> read(@RequestParam("startDate") final String startDate,
                                            @RequestParam("endDate") final String endDate) {
        List<String> result = new ArrayList<String>();
        Set<String> set =  ActiveJdbc.operTx(new Operation<Set<String>>() {
            @Override
            public Set<String> operate() {
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
        });
        result.addAll(set);
        return RequestResult.success(result);
    }

    @RequestMapping(value = "/get", method =  RequestMethod.GET)
    public RequestResult<List<Map>> get(@RequestParam("shiftDay") final String shiftDay) {
        return ActiveJdbc.operTx(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                List<Map> resultMap = LineWorkingHour.find("shift_day=?", shiftDay).toMaps();
                for (Map map : resultMap) {
                    map.put("shift_day",sdf.format(map.get("shift_day")).replace("-", "/"));
                }
                return RequestResult.success(resultMap);
            }
        });
    }

    @RequestMapping(value = "/getlastdate", method = RequestMethod.GET)
    public RequestResult<String> getlastDate() {

        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
                List<LineWorkingHour> workingHourList = LineWorkingHour.where("order by shift_day desc limit 1");
                if (workingHourList.size()==0) {
                    return RequestResult.success(sdf.format(new Date()));
                } else {
                    return RequestResult.success(sdf.format(workingHourList.get(0).get("shift_day")));
                }
            }
        });
    }

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        try{
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
                    String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    Timestamp time = new Timestamp(System.currentTimeMillis());

                    StringBuilder sb = new StringBuilder();
                    sb.append("REPLACE INTO a_servtrack_line_working_hour ");
                    sb.append("( ");
                    sb.append("line_id, ");
                    sb.append("shift_day, ");
                    sb.append("duration_sp, ");
                    sb.append("create_by, ");
                    sb.append("create_time, ");
                    sb.append("modify_by, ");
                    sb.append("modify_time ");
                    sb.append(") ");
                    sb.append("VALUES ");
                    sb.append("(?,?,?,?,?,?,? )");
                    PreparedStatement ps = Base.startBatch(sb.toString());
                    try {
                        Date startDate = sdf.parse(data.get("startDate").toString());
                        Date endDate = sdf.parse(data.get("endDate").toString());
                        Double hour = Double.parseDouble(data.get("hour").toString());
                        WorkingDay workDay = new WorkingDay((List<String>)data.get("workDay"));
                        Integer days = workDay.getInsertDay(startDate, endDate);
                        List<String> lines = new ArrayList<String>();
                        List<Line> lineList = Line.find("is_open = ?", "Y").include();
                        for (Line line : lineList) {
                            lines.add(line.get("line_id").toString());
                        }
                        if (days == 0) {
                            Calendar cal = Calendar.getInstance();
                            cal.setTime(startDate);
                            if(workDay.isWorkingDay(cal)) {
                                for (String line : lines) {
                                    Base.addBatch(ps, line, data.get("startDate").toString(), hour, user, time, user, time);
                                }
                            }
                        } else {
                            Calendar cal = Calendar.getInstance();
                            cal.setTime(startDate);
                            while(days >= 0) {
                                if(workDay.isWorkingDay(cal)) {
                                    for (String line : lines) {
                                        Base.addBatch(ps, line, sdf.format(cal.getTime()), hour, user, time, user, time);
                                    }
                                }
                                cal.add(Calendar.DAY_OF_YEAR, 1);
                                days --;
                            }
                        }
                        Base.executeBatch(ps);

                    } catch (ParseException e) {
                        e.printStackTrace();
                        return fail(e.getMessage());
                    }
                    return success();
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");

            @Override
            public RequestResult<?> operate() {
                try {
                    data.put("shift_day", sdf.parse(data.get("shift_day").toString()));
                } catch (ParseException e) {
                    e.printStackTrace();
                }
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                LineWorkingHour lineWorkingHour = new LineWorkingHour();
                lineWorkingHour.fromMap(data);
                if (lineWorkingHour.saveIt()) {
                    return success(lineWorkingHour.getString("line_id") + "_" + lineWorkingHour.getString("shift_day"));
                } else {
                    return fail("修改失敗...");
                }
            }
        });
    }

    @RequestMapping(value = "/getperioddata", method = RequestMethod.POST)
    public RequestResult<List<Map>> getProidData(@RequestBody final String[] period) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                String stDay = period[0];
                String endDay = period[1];
                String sql = getSQL().append("shift_day BETWEEN " + stDay + " AND " + endDay).toString();
                log.info(sql);
                return success(LineWorkingHour.findBySQL(sql).toMaps());
            }
        });
    }

    @RequestMapping(value = "/getshiftdaydata", method = RequestMethod.POST)
    public RequestResult<List<Map>> getProidData(@RequestBody final String shiftday) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                String sql = getSQL().append("shift_day = " + shiftday).toString();
                log.info(sql);
                return success(LineWorkingHour.findBySQL(sql).toMaps());
            }
        });
    }

    @RequestMapping(value = "/delete", method = RequestMethod.DELETE)
    public RequestResult<Void> delete(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {
                LineWorkingHour.delete("shift_day = ?", data.get("shift_day").toString());
                return success();
            }
        });
    }

    private StringBuilder getSQL() {
        StringBuilder sb = new StringBuilder();
        sb.append("SELECT * FROM a_servtrack_line_working_hour ");
        sb.append("WHERE ");
        return sb;
    }


    static class WorkingDay {
        List<String> workList;

        WorkingDay(List list) {
            workList = list;
        }
        boolean isWorkingDay (Calendar cal) {
            Integer calDay = cal.get(Calendar.DAY_OF_WEEK) - 1;


            String day = calDay + "";
            if (workList.contains(day)) {
                return true;
            } else {
                return false;
            }
        }

        Integer getInsertDay (Date start, Date end) {
            long sl = start.getTime();
            long el = end.getTime();
            Long range = (el - sl) / (24*60*60*1000);

            if (range == 0) {
                return 0;
            } else {
                return range.intValue();
            }
        }
    }
}
