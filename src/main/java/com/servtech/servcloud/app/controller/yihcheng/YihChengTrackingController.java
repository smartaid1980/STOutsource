package com.servtech.servcloud.app.controller.yihcheng;

import com.servtech.servcloud.app.controller.servtrack.TrackCalcUtil;
import com.servtech.servcloud.app.controller.strongLED.StrongLEDServtrackTabletController;
import com.servtech.servcloud.app.model.servtrack.ProcessNg;
import com.servtech.servcloud.app.model.servtrack.Work;
import com.servtech.servcloud.app.model.servtrack.WorkTrackingNoMoveOut;
import com.servtech.servcloud.app.model.strongLED.InvalidLineStatusLog;
import com.servtech.servcloud.app.model.yihcheng.WorkTrackingEmployee;
import com.servtech.servcloud.app.model.yihcheng.WorkTrackingMold;
import com.servtech.servcloud.app.model.yihcheng.WorkTrackingTool;
import com.servtech.servcloud.core.db.ActiveJdbc;
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
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Kevin on 2020/8/12.
 */
@RestController
@RequestMapping("/yihcheng/tracking")
public class YihChengTrackingController {

    private static final org.slf4j.Logger log = LoggerFactory.getLogger(YihChengTrackingController.class);
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    String PRODUCING_STATUS = "1";

    final int ABANDON_TYPE = 1;
    final int MODIFIABLE_TYPE = 2;
    final int WORKINIT_STATUS = 0;

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/line-status", method = RequestMethod.PUT)
    public RequestResult<?> lineStatus(@RequestBody Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                Timestamp timestamp = new Timestamp(System.currentTimeMillis());
                String modify_by = data.get("modify_by").toString();
                String line_id = data.get("line_id").toString();

                List<InvalidLineStatusLog> invalidLineStatusLogList = InvalidLineStatusLog.find("line_id = ? and  line_status_end is null ",  line_id);
                if(invalidLineStatusLogList == null || invalidLineStatusLogList.size() == 0)
                    return fail("line_id " + line_id + " can't found any info..");

                String line_status_next = invalidLineStatusLogList.get(0).getString("line_status").equals("1") ? "2" : "1";
                data.put("modify_time", timestamp);
                data.put("create_time", timestamp);
                data.put("create_by", modify_by);
                data.put("line_status", line_status_next);
                data.put("line_status_start", timestamp);
                data.put("move_in", timestamp);

                Base.openTransaction();
                for (InvalidLineStatusLog invalidLineStatusLog : invalidLineStatusLogList) {
                    invalidLineStatusLog.set("line_status_end", timestamp);
                    invalidLineStatusLog.set("modify_by", modify_by);
                    invalidLineStatusLog.set("modify_time", timestamp);
                    invalidLineStatusLog.saveIt();

                    InvalidLineStatusLog newInvalidLineStatusLog = new InvalidLineStatusLog();
                    newInvalidLineStatusLog.fromMap(data);
                    newInvalidLineStatusLog.set("move_in", invalidLineStatusLog.getString("move_in"));
                    newInvalidLineStatusLog.set("work_id", invalidLineStatusLog.getString("work_id"));
                    newInvalidLineStatusLog.set("op", invalidLineStatusLog.getString("op"));
                    newInvalidLineStatusLog.insert();
                }
                Base.commitTransaction();
                return success();
            });
        } catch (Exception e) {
            e.printStackTrace();
            Base.rollbackTransaction();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/in", method = RequestMethod.PUT)
    public RequestResult<?> in(@RequestBody Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                Timestamp timestamp = new Timestamp(System.currentTimeMillis());
                String create_by = data.get("create_by").toString();
                String staff_id = data.get("staff_id").toString();
                String shift_day = data.get("shift_day").toString();
                String shift = data.get("shift").toString();
                data.put("create_time", timestamp);
                data.put("modify_by", create_by);
                data.put("modify_time", timestamp);

                WorkTrackingNoMoveOut workTrackingNoMoveOut = new WorkTrackingNoMoveOut();
                workTrackingNoMoveOut.fromMap(data);
                workTrackingNoMoveOut.set("cust_field_1", -1);
                workTrackingNoMoveOut.set("cust_field_2", staff_id);
                workTrackingNoMoveOut.set("cust_field_3", -1);
                workTrackingNoMoveOut.set("cust_field_4", shift);
                workTrackingNoMoveOut.set("cust_field_5", shift_day);
                workTrackingNoMoveOut.insert();

                if (data.get("mold_id_list") != null) {
                    List<String> mold_id_list = (List<String>) data.get("mold_id_list");
                    for (String mold_id : mold_id_list) {
                        WorkTrackingMold workTrackingMold = new WorkTrackingMold();
                        workTrackingMold.fromMap(data);
                        workTrackingMold.set("mold_id", mold_id);
                        workTrackingMold.insert();
                    }
                }
                if (data.get("tool_id_list") != null) {
                    List<String> tool_id_list = (List<String>) data.get("tool_id_list");
                    for (String tool_id : tool_id_list) {
                        WorkTrackingTool workTrackingTool = new WorkTrackingTool();
                        workTrackingTool.fromMap(data);
                        workTrackingTool.set("tool_id", tool_id);
                        workTrackingTool.insert();
                    }
                }
                if (data.get("employee_id_list") != null) {
                    List<String> employee_id_list = (List<String>) data.get("employee_id_list");
                    for (String employee_id : employee_id_list) {
                        WorkTrackingEmployee workTrackingEmployee = new WorkTrackingEmployee();
                        workTrackingEmployee.fromMap(data);
                        workTrackingEmployee.set("employee_id", employee_id);
                        workTrackingEmployee.insert();
                    }
                }
                InvalidLineStatusLog invalidLineStatusLog = new InvalidLineStatusLog();
                invalidLineStatusLog.fromMap(data);
                invalidLineStatusLog.set("line_status", 1);
                invalidLineStatusLog.set("line_status_start", data.get("move_in"));
                invalidLineStatusLog.insert();

                return success();
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/out", method = RequestMethod.PUT)
    public RequestResult<?> out(@RequestBody Map mData) {
        return ActiveJdbc.operTx(() -> {
            String moveIn;
            String moveOut;
            String lineId = null;
            String workId = null;
            String op = null;
            String qtyFai;
            String output;
            String ngSumQuantity;
            String createBy;
            String createTime;
            String modifyBy;
            String modifyTime;
            String processCode;
            String shiftDay;
            String shift;
            Boolean spDurationIsExist;
            String pks;
            Double opDuration;
            Integer spOutput;
            Double aval;
            Double perf;
            Double oee;
            Integer outputVariance;
            Double durationVariance;
            Double stdHour;
            Integer goQuantity;
            Double quality;
            String spDurationValue;
            Double spDuration;
            List<Map> trackingNg;
            Map<String, String> spDurationContainer;
            boolean EXCEPTION_LOG_PRINT_TRIGGER = false;
            Date date = new Date();
            String noOperator;
            int ngModifiable;
            int ngAbandon;
            StringWriter sw = new StringWriter();
            log.info("###request_param " + mData);

            try {
                moveIn = mData.get("move_in").toString();
                lineId = mData.get("line_id").toString();
                workId = mData.get("work_id").toString();
                op = mData.get("op").toString();
                processCode = mData.get("process_code").toString();
                qtyFai = mData.get("qty_fai").toString();
                output = mData.get("output").toString();
                ngSumQuantity = mData.get("ng_quantity_sum").toString();
                moveOut = mData.get("move_out").toString();

                String currentTime = sdf.format(date);
                List<WorkTrackingNoMoveOut> workTrackingNoMoveOutList = WorkTrackingNoMoveOut.find("move_in = ? and line_id = ? and work_id = ? and op = ?", moveIn, lineId, workId, op);
                if (workTrackingNoMoveOutList == null || workTrackingNoMoveOutList.size() == 0) {
                    return fail("Can't found WorkTrackingNoMoveOut");
                } else if (workTrackingNoMoveOutList.size() != 1) {
                    return fail("Found WorkTrackingNoMoveOut.size > 1");
                } else {
                    WorkTrackingNoMoveOut workTrackingNoMoveOut = workTrackingNoMoveOutList.get(0);
                    shiftDay = workTrackingNoMoveOut.getString("cust_field_5");
                    shift = workTrackingNoMoveOut.getString("cust_field_4");
                    noOperator = workTrackingNoMoveOut.getString("cust_field_2");
                }

                createBy = mData.get("create_by").toString();
                createTime = currentTime;
                modifyBy = createBy;
                modifyTime = currentTime;

                stdHour = TrackCalcUtil.getStdHour(workId, op);
                goQuantity = TrackCalcUtil.checkAndGetGoQuantity(ngSumQuantity, output);
                quality = TrackCalcUtil.getQuality(goQuantity, output);
                trackingNg = (List<Map>) mData.get("tracking_ng");
                pks = lineId + shiftDay;

                ngAbandon = 0;
                ngModifiable = 0;

                InvalidLineStatusLog.update("line_status_end = ?", "move_in=? AND work_id=? AND line_id=? AND op=? AND line_status_end is null", moveOut, moveIn, workId, lineId, op);

                for (Map tnData : trackingNg) {
                    String ngCode = tnData.get("ng_code").toString();
                    int ngType = findNgType(processCode, ngCode);
                    int ngQuantity = Integer.parseInt(tnData.get("ng_quantity").toString());
                    if (ngType == ABANDON_TYPE) {
                        ngAbandon += ngQuantity;
                    } else if (ngType == MODIFIABLE_TYPE) {
                        ngModifiable += ngQuantity;
                    }
                }

                Work work = Work.findFirst("work_id = ?", workId);
                int workStatus = work.getInteger("status_id");
                if (workStatus == WORKINIT_STATUS) {
                    work.set("status_id", PRODUCING_STATUS).saveIt();
                }

                List<Map> invalidLineStatusLog = InvalidLineStatusLog.find("move_in=? AND work_id=? AND line_id=? AND op=? AND line_status = 2", moveIn, workId, lineId, op).toMaps();

                long sumInvalidMillisec = 0;
                for (Map map : invalidLineStatusLog) {
                    long diffInvalidtime = sdf.parse(map.get("line_status_end").toString()).getTime() - sdf.parse(map.get("line_status_start").toString()).getTime();
                    sumInvalidMillisec += diffInvalidtime;
                }
                double sumInvalidMin = (double) sumInvalidMillisec / (1000 * 60);
                opDuration = new StrongLEDServtrackTabletController().getOpDuration(moveIn, moveOut, sumInvalidMillisec);
                spOutput = TrackCalcUtil.getSpOutput(opDuration, stdHour);

                spDurationContainer = TrackCalcUtil.getDurations();
                spDurationIsExist = spDurationContainer.containsKey(pks);

                if (spDurationIsExist) {
                    spDurationValue = spDurationContainer.get(pks);
                    spDuration = Double.parseDouble(spDurationValue);
                    aval = TrackCalcUtil.getAval(opDuration, spDuration);
                    perf = TrackCalcUtil.getPerf(Integer.parseInt(output), stdHour, opDuration);
                    oee = TrackCalcUtil.getOee(aval, quality, perf);
                } else {
                    aval = 0.00;
                    perf = TrackCalcUtil.getPerf(Integer.parseInt(output), stdHour, opDuration);
                    oee = 0.00;
                }
                outputVariance = TrackCalcUtil.getOutputVariance(goQuantity, opDuration, stdHour);
                durationVariance = TrackCalcUtil.getDurationVariance(opDuration, goQuantity, stdHour);

                Base.exec(getTrackingUpdateInsertSql(),
                        moveIn,
                        lineId,
                        workId,
                        op,
                        shiftDay,
                        shift,
                        moveOut,
                        TrackCalcUtil.toRound(opDuration, 4),
                        qtyFai,
                        output,
                        goQuantity,
                        ngSumQuantity,
                        TrackCalcUtil.toRound(quality * 100, 2) > 999 ? 999 : TrackCalcUtil.toRound(quality * 100, 2),
                        spOutput,
                        TrackCalcUtil.toRound(aval * 100, 2) > 999 ? 999 : TrackCalcUtil.toRound(aval * 100, 2),
                        TrackCalcUtil.toRound(perf * 100, 2) > 999 ? 999 : TrackCalcUtil.toRound(perf * 100, 2),
                        TrackCalcUtil.toRound(oee * 100, 2) > 999 ? 999 : TrackCalcUtil.toRound(oee * 100, 2),
                        outputVariance,
                        TrackCalcUtil.toRound(durationVariance, 2),
                        createBy,
                        createTime,
                        modifyBy,
                        modifyTime,
                        sumInvalidMin,
                        noOperator,
                        ngModifiable,
                        ngAbandon
                );

                if (!(ngSumQuantity.isEmpty() || ngSumQuantity.equals("") || ngSumQuantity.equals("0"))) {
                    for (Map tnData : trackingNg) {
                        String ngCode = tnData.get("ng_code").toString();
                        String ngQuantity = tnData.get("ng_quantity").toString();

                        Base.exec(getTrackingNgUpdateInsertSql(),
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
                                modifyTime
                        );
                    }
                }

                WorkTrackingNoMoveOut.delete("move_in=? AND work_id=? AND line_id=? AND op=?", moveIn, workId, lineId, op);
                return success("out success");
            } catch (NullPointerException e) {
                EXCEPTION_LOG_PRINT_TRIGGER = true;
                log.info("lineId: " + lineId + ", " +
                        "workId: " + workId + ", " +
                        "op: " + op
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
                    log.info("### debug tablet request params : " + mData.toString());
                }
            }
        });
    }

    private static int findNgType(String processCode, String ngCode) {
        ProcessNg processNg = ProcessNg.findFirst("process_code = ? AND ng_code = ?", processCode, ngCode);
        int ngType = processNg.getInteger("ng_type");
        return ngType;
    }

    private String getTrackingNgUpdateInsertSql() {
        String sql = "INSERT INTO `a_servtrack_work_tracking_ng` " +
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
                "`modify_time` = VALUES(modify_time)";
        return sql;
    }

    private String getTrackingUpdateInsertSql() {
        String sql = "INSERT INTO `a_servtrack_work_tracking` " +
                "(`move_in`, " +
                "`line_id`, " +
                "`work_id`, " +
                "`op`, " +
                "`shift_day`, " +
                "`shift`, " +
                "`move_out`, " +
                "`op_duration`, " +
                "`qty_fai`, " +
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
                "`cust_field_1`, " +
                "`cust_field_2`, " +
                "`cust_field_3`, " +
                "`cust_field_4`) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE " +
                "`move_in` = VALUES(move_in), " +
                "`line_id` = VALUES(line_id), " +
                "`work_id` = VALUES(work_id), " +
                "`op` = VALUES(op), " +
                "`shift_day` = VALUES(shift_day), " +
                "`shift` = VALUES(shift), " +
                "`move_out` = VALUES(move_out), " +
                "`op_duration` = VALUES(op_duration), " +
                "`qty_fai` = VALUES(qty_fai), " +
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
                "`cust_field_1` = VALUES(cust_field_1), " +
                "`cust_field_2` = VALUES(cust_field_2), " +
                "`cust_field_3` = VALUES(cust_field_3), " +
                "`cust_field_4` = VALUES(cust_field_4)";
        return sql;
    }

}
