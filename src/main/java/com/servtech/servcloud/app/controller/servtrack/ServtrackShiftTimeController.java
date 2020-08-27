package com.servtech.servcloud.app.controller.servtrack;

import com.servtech.servcloud.app.model.servtrack.ShiftTime;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/6/20.
 */
@RestController
@RequestMapping("/servtrack/shifttime")
public class ServtrackShiftTimeController {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(ServtrackShiftTimeController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                SimpleDateFormat sdf = new SimpleDateFormat("HH:mm");
                List<Map> listMap = ShiftTime.findAll().toMaps();
                for (Map map : listMap) {
                    Date startTime = SQLTime.getTime(map.get("start_time").toString());
                    Date endTime = SQLTime.getTime(map.get("end_time").toString());
                    String range = map.get("duration_sp").toString();
//                    String range = SQLTime.getRangeHour(startTime, endTime);
                    map.put("start_time", SQLTime.toString(startTime));
                    map.put("end_time", SQLTime.toString(endTime));
                    map.put("duration_sp", range);

                }
                return success(listMap);
            }
        });
    }

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                ShiftTime.deleteAll();
                Date startTime = SQLTime.getTime(data.get("start_time").toString());
                String range = data.get("duration_sp").toString();
                Calendar cal = Calendar.getInstance();
                cal.setTimeInMillis(startTime.getTime() - 1000);
                Date endTime = cal.getTime();
                data.put("start_time", startTime);
                data.put("end_time", endTime);
//                Date endTime = SQLTime.getTime(data.get("end_time").toString());
//                String range = SQLTime.getRangeHour(startTime, endTime);
                data.put("duration_sp", range);
                data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("create_time", new Timestamp(System.currentTimeMillis()));
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                ShiftTime.deleteAll();
                ShiftTime shiftTime = new ShiftTime();
                shiftTime.fromMap(data);
                if (shiftTime.insert()) {
                    return success(shiftTime.getString("start_time"));
                } else {
                    return fail("修改失敗...");
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
                    ShiftTime.deleteAll();
                    Date startTime = SQLTime.getTime(data.get("start_time").toString());
                    Date endTime = SQLTime.getTime(data.get("end_time").toString());
                    String range = SQLTime.getRangeHour(startTime, endTime);
                    data.put("duration_sp", range);
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                    ShiftTime shiftTime = new ShiftTime();
                    shiftTime.fromMap(data);
                    if(shiftTime.insert()){
                        return success(shiftTime.getString("start_time"));
                    } else {
                        return fail("新增失敗...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

   static class SQLTime {
       static SimpleDateFormat sdf = new SimpleDateFormat("HH:mm");

       public static String toString (Object o) {
           return sdf.format(o);
       }

       public static Date getTime (String s) {
           Date date = null;
           try {
                date = sdf.parse(s);
           } catch (ParseException e) {
               e.printStackTrace();
           }
           return date;
       }

       public static String getRangeHour (Date start, Date end) {
           DecimalFormat decimalFormat = new DecimalFormat("#.00");
           double time = (end.getTime() - start.getTime()) / 3600000 ;
           return decimalFormat.format(time);

       }
   }
}
