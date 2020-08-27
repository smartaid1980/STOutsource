package com.servtech.servcloud.module.controller;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.WorkShiftTime;
import com.servtech.servcloud.module.model.WorkShiftChild;
import com.servtech.servcloud.module.model.WorkShiftGroup;
import com.servtech.servcloud.module.service.workshift.WorkShiftTimeService;
import com.servtech.servcloud.module.service.workshift.exception.WorkShiftTimeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.sql.Date;
import java.sql.Time;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

import static org.springframework.web.bind.annotation.RequestMethod.*;
import static com.servtech.servcloud.core.util.RequestResult.*;

/**
 * Created by hubert on 2015/7/25.
 */
@RestController
@RequestMapping("/workshift")
public class WorkShiftController {

    private static final Logger log = LoggerFactory.getLogger(WorkShiftController.class);

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {

                WorkShiftGroup workShiftGroup = new WorkShiftGroup();
                data.put("id", System.currentTimeMillis());
                workShiftGroup.fromMap(data);

                if (workShiftGroup.insert()) {

                    long workShiftGroupId = workShiftGroup.getLong("id");

                    bindWorkShiftChild(workShiftGroup,
                            (List<String>) data.get("work_shift_childs"),
                            workShiftGroup.getString("type"));
                    bindWorkShiftTime(workShiftGroup,
                            (List<Map<String, String>>) data.get("work_shift_times"));

                    return success(String.valueOf(workShiftGroupId));
                } else {
                    return fail("新增失敗，原因待查...");
                }
            }
        });
    }

    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read() {
        final DateFormat yyyyMMddDf = new SimpleDateFormat("yyyy/MM/dd");
        final DateFormat HHmmDf = new SimpleDateFormat("HH:mm");

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> result = WorkShiftGroup.findAll().include(WorkShiftChild.class, WorkShiftTime.class).toMaps();
                for (Map map : result) {
                    map.put("id", String.valueOf(map.get("id")));
                    for (Map workShiftChild : (List<Map>) map.get("work_shift_childs")) {
                        if (workShiftChild.containsKey("date")) {
                            workShiftChild.put("date", yyyyMMddDf.format((Date) workShiftChild.get("date")));
                        }
                    }
                    for (Map workShiftTime : (List<Map>) map.get("work_shift_times")) {
                        workShiftTime.put("start", HHmmDf.format((Time) workShiftTime.get("start")));

                        // end 要減 1 秒
                        Calendar c = Calendar.getInstance();
                        c.setTime((Time) workShiftTime.get("end"));
                        c.add(Calendar.SECOND, 1);
                        workShiftTime.put("end", HHmmDf.format(c.getTime()));
                    }
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                WorkShiftGroup workShiftGroup = new WorkShiftGroup();
                workShiftGroup.fromMap(data);

                String workShiftGroupId = workShiftGroup.getString("id");

                if (workShiftGroup.saveIt()) {

                    WorkShiftChild.delete("work_shift_group_id = ?", workShiftGroupId);
                    bindWorkShiftChild(workShiftGroup,
                            (List<String>) data.get("work_shift_childs"),
                            workShiftGroup.getString("type"));

                    WorkShiftTime.delete("work_shift_group_id = ?", workShiftGroupId);
                    bindWorkShiftTime(workShiftGroup,
                            (List<Map<String, String>>) data.get("work_shift_times"));

                    return success(workShiftGroupId);
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }

    @RequestMapping(value = "/delete", method = DELETE)
    public RequestResult<Void> delete(@RequestBody final Object[] idList) {
        return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {
                int deleteAmount = WorkShiftGroup.delete("id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }

    @RequestMapping(value = "/now", method = GET)
    public RequestResult<Map<String, Object>> now() {
        return success(WorkShiftTimeService.nowActualShiftTime().getNowShiftTime());
    }

    @RequestMapping(value = "/today", method = GET)
    public RequestResult<List<Map<String, Object>>> today() {
        return success(WorkShiftTimeService.nowActualShiftTime().getTodayShiftTimes());
    }

    @RequestMapping(value = "/nowLogicallyDate", method = GET)
    public RequestResult<String> nowLogicallyDate() {
        return success(WorkShiftTimeService.nowActualShiftTime().getLogicallyDate8Bits());
    }

    @RequestMapping(value = "/byDateInterval", method = GET)
    public RequestResult<?> byDateInterval(@RequestParam(value="startDate") String startDate, // yyyyMMdd
                                           @RequestParam(value="endDate") String endDate) {
        try {
            WorkShiftTimeService workShiftTimeService = new WorkShiftTimeService(startDate, endDate);
            return success(workShiftTimeService.getIntervalWorkShiftTimes());
        } catch (WorkShiftTimeException e) {
            return fail(e.getMessage());
        }
    }

    private void bindWorkShiftChild(WorkShiftGroup parent, List<String> children, String type) {
        for (String value : children) {
            WorkShiftChild workShiftChild = new WorkShiftChild();
            workShiftChild.set(type, value);
            parent.add(workShiftChild);
        }
    }

    private void bindWorkShiftTime(WorkShiftGroup parent, List<Map<String, String>> children) {
        DateFormat HHmmDf = new SimpleDateFormat("HH:mm");
        for (Map<String, String> child : children) {
            WorkShiftTime workShiftTime = new WorkShiftTime();
            workShiftTime.set("sequence", child.get("sequence"),
                              "name", child.get("name"),
                              "start", getStart(child.get("start"), HHmmDf),
                              "end", getEnd(child.get("end"), HHmmDf),
                              "is_open", child.get("is_open"));
            parent.add(workShiftTime);
        }
    }

    private Time getStart(String start, DateFormat df) {
        try {
            return new Time(df.parse(start).getTime());
        } catch (ParseException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    private Time getEnd(String end, DateFormat df) {
        try {
            // 注意，減 1 毫秒
            return new Time(df.parse(end).getTime() - 1);
        } catch (ParseException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

}
