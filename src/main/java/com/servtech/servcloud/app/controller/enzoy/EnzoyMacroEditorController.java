package com.servtech.servcloud.app.controller.enzoy;

import com.servtech.servcloud.app.model.enzoy.WorkMacroRecord;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.service.workshift.WorkShiftTimeService;
import org.springframework.web.bind.annotation.*;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Jenny on 2017/3/3.
 */
@RestController
@RequestMapping("/enzoymacroeditor")
public class EnzoyMacroEditorController {

    private static ConcurrentHashMap<String, WorkMacro> LATEST_WORK_MACRO = new ConcurrentHashMap<String, WorkMacro>();

    @RequestMapping(value = "/insertMacroRecord", method = RequestMethod.POST)
    public RequestResult insertMacroRecord(@RequestBody final Map data) {
        try {
            if (!data.containsKey("machine_id") || !data.containsKey("ctl_datm") || !data.containsKey("macro") ||
                    !data.containsKey("status") || !data.containsKey("creator")) {
                return fail("param should contains keys [machine_id, ctl_datm, macro, status, creator].");
            }

            DateFormat dtf = new SimpleDateFormat("yyyyMMddHHmmss");
            final Date ctl_datm = dtf.parse(data.get("ctl_datm").toString().substring(0, 14));
            data.put("ctl_datm", ctl_datm);
            data.put("macro_start_datetime", ctl_datm);
            WorkShiftTimeService.NowActualShiftTime nowShiftInfo = WorkShiftTimeService.nowActualShiftTime();
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
            data.put("date", df.format(new Date()));
            data.put("logically_date", nowShiftInfo.getLogicallyDate8Bits());
            data.put("work_shift_name", nowShiftInfo.getNowShiftTime().get("name").toString());
            data.put("create_datetime", new Date());

            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    WorkMacroRecord lastWorkMacro = WorkMacroRecord.findFirst("machine_id = ? order by create_datetime desc", data.get("machine_id").toString());

                    //last macro has not ended
                    if (lastWorkMacro != null && lastWorkMacro.get("end_datetime") == null) {
                        lastWorkMacro.set("end_datetime", ctl_datm);
                        if (!lastWorkMacro.saveIt()) {
                            return fail("Update end_datetime failed!");
                        }
                    }

                    // log macro first appear time
                    if (lastWorkMacro != null && lastWorkMacro.get("macro").equals(data.get("macro").toString())) {
                        data.put("macro_start_datetime", lastWorkMacro.get("macro_start_datetime"));
                    }

                    //insert new record
                    WorkMacroRecord newRecord = new WorkMacroRecord().fromMap(data);
                    if (newRecord.insert()) {
                        WorkMacro workMacro = new WorkMacro(data);
                        LATEST_WORK_MACRO.put(workMacro.getMachineId(), workMacro);
                        return success();
                    } else {
                        return fail("WorkMacroRecord insert failed!");
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/getLatestWorkMacro", method = RequestMethod.GET)
    public RequestResult getLatestWorkMacro() {
        if (LATEST_WORK_MACRO.isEmpty()) {
            LATEST_WORK_MACRO = init();
        }
        return success(LATEST_WORK_MACRO);
    }

    @RequestMapping(value = "/getLatestWorkMacroFromDB", method = RequestMethod.GET)
    public RequestResult getLatestWorkMacroFromDB() {
        LATEST_WORK_MACRO = init();
        return success(LATEST_WORK_MACRO);
    }

    @RequestMapping(value = "/query", method = RequestMethod.POST)
    public RequestResult query(@RequestBody final QueryParam queryParam) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                try {
                    List<String> param = new ArrayList<String>();
                    param.add(queryParam.startDate + " 00:00:00");
                    param.add(queryParam.endDate + " 23:59:59");
                    param.add(queryParam.startDate + " 00:00:00");
                    param.add(queryParam.endDate + " 23:59:59");
                    param.addAll(queryParam.machineIds);

                    List<Map> dataList = WorkMacroRecord.where(
                            "( ctl_datm BETWEEN ? AND ? OR end_datetime BETWEEN ? AND ? ) AND machine_id IN (" +
                                    Util.strSplitBy("?", ",", queryParam.machineIds.size()) + ")", param.toArray())
                            .orderBy("ctl_datm").toMaps();
                    return success(dataList);
                } catch (Exception e) {
                    return fail(e.getMessage());
                }
            }
        });
    }

    private ConcurrentHashMap<String, WorkMacro> init() {

        return ActiveJdbc.operTx(new Operation<ConcurrentHashMap<String, WorkMacro>>() {
            @Override
            public ConcurrentHashMap<String, WorkMacro> operate() {
                List<Map> dataList = WorkMacroRecord.findBySQL("SELECT * FROM (" +
                        "   SELECT * " +
                        "   FROM a_enzoy_work_macro_record " +
                        "   order by create_datetime desc) " +
                        "temp group by machine_id;").toMaps();
                for (Map map : dataList) {
                    WorkMacro workMacro = new WorkMacro(map);
                    LATEST_WORK_MACRO.put(workMacro.getMachineId(), workMacro);
                }
                return LATEST_WORK_MACRO;
            }
        });

    }

    private class QueryParam {
        String startDate;
        String endDate;
        List<String> machineIds;

        public QueryParam(String startDate, String endDate, List<String> machineIds) {
            this.startDate = startDate;
            this.endDate = endDate;
            this.machineIds = machineIds;
        }
    }

    public class WorkMacro {
        private String machine_id;
        private String ctl_datm;
        private String end_datetime;
        private String date;
        private String logically_date;
        private String work_shift_name;
        private String macro;
        private String status;
        private String creator;
        private String create_datetime;

        public WorkMacro(Map map) {
            this.machine_id = map.get("machine_id").toString();
            this.ctl_datm = map.get("ctl_datm").toString();
            this.date = map.get("date").toString();
            this.logically_date = map.get("logically_date").toString();
            this.work_shift_name = map.get("work_shift_name").toString();
            this.macro = map.get("macro").toString();
            this.status = map.get("status").toString();
            this.creator = map.get("creator").toString();
            this.create_datetime = map.get("create_datetime").toString();
        }

        public String getMachineId () {
            return this.machine_id;
        }
    }
}
