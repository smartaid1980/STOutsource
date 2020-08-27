package com.servtech.servcloud.app.controller.strongLED;

import com.servtech.servcloud.app.controller.servtrack.TrackCalcUtil;
import com.servtech.servcloud.app.model.servtrack.*;
import com.servtech.servcloud.app.model.strongLED.InvalidLineStatusLog;
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
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by admin on 2017/6/26.
 */
@RestController
@RequestMapping("/strongled/servtrack/tablet")
public class StrongLEDServtrackTabletController {
    private static final org.slf4j.Logger log = LoggerFactory.getLogger(StrongLEDServtrackTabletController.class);
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    String PRODUCING_STATUS = "1";

    final int ABANDON_TYPE = 1;
    final int MODIFIABLE_TYPE = 2;
    final int WORKINIT_STATUS = 0;
    private static final String LOCK = new String();

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/tracking/uploadWithArray", method = RequestMethod.PUT)
    public RequestResult<String> uploadTabletDatas(@RequestBody final List<Map> datas) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    String moveIn;
                    String moveOut;
                    String lineId = null;
                    String workId = null;
                    String op = null;
                    String output;
                    String ngSumQuantity;
                    String createBy;
                    String createTime;
                    String modifyBy;
                    String modifyTime;
                    String processCode;
                    String shiftDay;
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
                    log.info("###request_param " + datas);

                    try {
                        for (Map mData : datas) {
                            moveIn = mData.get("move_in").toString();
                            lineId = mData.get("line_id").toString();
                            workId = mData.get("work_id").toString();
                            op = mData.get("op").toString();
                            processCode = mData.get("process_code").toString();
                            shiftDay = mData.get("shift_day").toString();
                            output = mData.get("output").toString();
                            ngSumQuantity = mData.get("ng_quantity_sum").toString();
                            moveOut = mData.get("move_out") == null ? null : mData.get("move_out").toString();
                            noOperator = mData.get("staff_id").toString();
                            String currentTime = sdf.format(date);
                            WorkTracking workTracking = WorkTracking.findFirst("move_in = ? AND line_id = ? AND work_id = ? AND op = ?", moveIn, lineId, workId, op);
                            if (workTracking != null) {
                                createBy = workTracking.getString("create_by");
                                createTime = workTracking.getString("create_time");
                            } else {
                                createBy = mData.get("create_by").toString();
                                createTime = currentTime;
                            }
                            modifyBy = createBy;
                            modifyTime = currentTime;

                            stdHour = TrackCalcUtil.getStdHour(workId, op);
                            goQuantity = TrackCalcUtil.checkAndGetGoQuantity(ngSumQuantity, output);
                            quality = TrackCalcUtil.getQuality(goQuantity, output);
                            trackingNg = (List<Map>) mData.get("tracking_ng");
                            pks = lineId + shiftDay;

                            ngAbandon = 0;
                            ngModifiable = 0;

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

                            if (moveOut == null || moveOut.equals("")) {

                                Base.exec(getNoMoveOutUpdateInsertSql(),
                                        moveIn,
                                        lineId,
                                        workId,
                                        op,
                                        createBy,
                                        createTime,
                                        modifyBy,
                                        modifyTime,
                                        noOperator,
                                        shiftDay);

                            } else {
                                List<Map> invalidLineStatusLog = InvalidLineStatusLog.find("move_in=? AND work_id=? AND line_id=? AND op=?", moveIn, workId, lineId, op).toMaps();

                                long sumInvalidMillisec = 0;
                                for (Map map : invalidLineStatusLog) {
                                    long diffInvalidtime = sdf.parse(map.get("line_status_end").toString()).getTime() - sdf.parse(map.get("line_status_start").toString()).getTime();
                                    sumInvalidMillisec += diffInvalidtime;
                                }
                                double sumInvalidMin = (double) sumInvalidMillisec / (1000 * 60);
                                opDuration = getOpDuration(moveIn, moveOut, sumInvalidMillisec);
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
                                        moveOut,
                                        TrackCalcUtil.toRound(opDuration, 4),
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
                            }
                        }
                        return success("update success");
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
                            log.info("### debug tablet request params : " + datas.toString());
                        }
                    }
                }
            });
        }
    }

    @RequestMapping(value = "/invalid-line-status-log/uploadWithArray", method = RequestMethod.PUT)
    public RequestResult<String> uploadinvalidLineStatusLog(@RequestBody final List<Map> datas) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                log.info("@@@invalid_line_status_log " + datas);
                String moveIn;
                String lineId = null;
                String workId = null;
                String op = null;
                String lineStatus;
                String lineStatusStart;
                String lineStatusEnd;
                String createBy;
                String createTime;
                String modifyBy;
                String modifyTime;
                String invalidId;
                String invalidText;
                String noOperator;
                StringWriter sw = new StringWriter();

                Date date = new Date();
                String currentTime = sdf.format(date);
                boolean EXCEPTION_LOG_PRINT_TRIGGER = false;
                PreparedStatement lineMgrLogBatchPs = getLineMgrLogBatchPs();
                try {
                    for (Map data : datas) {
                        moveIn = data.get("move_in").toString();
                        lineId = data.get("line_id").toString();
                        workId = data.get("work_id").toString();
                        op = data.get("op").toString();
                        lineStatus = data.get("line_status").toString();
                        lineStatusStart = data.get("line_status_start") == null ? null : data.get("line_status_start").toString();
                        lineStatusEnd = data.get("line_status_end") == null ? null : data.get("line_status_end").toString();
                        invalidId = data.get("invalid_id") == null ? null : data.get("invalid_id").toString();
                        invalidText = data.get("invalid_text") == null ? null : data.get("invalid_text").toString();
                        noOperator = data.get("staff_id").toString();


                        InvalidLineStatusLog invalidLineStatusLog = InvalidLineStatusLog.findFirst("move_in = ? AND line_id = ? AND work_id = ? AND op = ? AND line_status_start = ?", moveIn, lineId, workId, op, lineStatusStart);
                        if (invalidLineStatusLog != null) {
                            createBy = invalidLineStatusLog.getString("create_by");
                            createTime = invalidLineStatusLog.getString("create_time");
                            modifyBy = createBy;
                            modifyTime = currentTime;

                            if (invalidLineStatusLog.getString("line_status_end") == null) {
                                Base.addBatch(lineMgrLogBatchPs,
                                        moveIn,
                                        lineId,
                                        workId,
                                        op,
                                        createBy,
                                        createTime,
                                        modifyBy,
                                        modifyTime,
                                        lineStatus,
                                        lineStatusStart,
                                        lineStatusEnd,
                                        invalidId,
                                        invalidText,
                                        noOperator
                                );
                            }
                        } else {
                            createBy = data.get("create_by").toString();
                            createTime = currentTime;
                            modifyBy = createBy;
                            modifyTime = currentTime;
                            Base.addBatch(lineMgrLogBatchPs,
                                    moveIn,
                                    lineId,
                                    workId,
                                    op,
                                    createBy,
                                    createTime,
                                    modifyBy,
                                    modifyTime,
                                    lineStatus,
                                    lineStatusStart,
                                    lineStatusEnd,
                                    invalidId,
                                    invalidText,
                                    noOperator
                            );
                        }
                    }
                    Base.executeBatch(lineMgrLogBatchPs);
                    lineMgrLogBatchPs.close();

                    return success("upload success");

                } catch (NullPointerException e) {
                    EXCEPTION_LOG_PRINT_TRIGGER = true;
                    log.info("lineId: " + lineId + ", " +
                            "workId: " + workId + ", " +
                            "op: " + op
                    );
                    e.printStackTrace(new PrintWriter(sw));
                    log.info(sw.toString());
                    return fail("error_code:001: nullpoint");
                } catch (org.javalite.activejdbc.DBException e) {
                    EXCEPTION_LOG_PRINT_TRIGGER = true;
                    e.printStackTrace(new PrintWriter(sw));
                    log.info(sw.toString());
                    return fail("error_code:002:db exception");
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
                        lineMgrLogBatchPs.close();
                    } catch (SQLException e) {
                        e.printStackTrace(new PrintWriter(sw));
                        log.info(sw.toString());
                    }
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
                "`cust_field_1`, " +
                "`cust_field_2`, " +
                "`cust_field_3`, " +
                "`cust_field_4`) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
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
                "`cust_field_1` = VALUES(cust_field_1), " +
                "`cust_field_2` = VALUES(cust_field_2), " +
                "`cust_field_3` = VALUES(cust_field_3), " +
                "`cust_field_4` = VALUES(cust_field_4)";
        return sql;
    }

    public String getNoMoveOutUpdateInsertSql() {
        String sql = "INSERT INTO `a_servtrack_tracking_no_move_out` " +
                "(`move_in`, " +
                "`line_id`, " +
                "`work_id`, " +
                "`op`, " +
                "`create_by`, " +
                "`create_time`, " +
                "`modify_by`, " +
                "`modify_time`, " +
                "`cust_field_2`, " +
                "`cust_field_5`) " +
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
                "`cust_field_2` = VALUES(cust_field_2), " +
                "`cust_field_5` = VALUES(cust_field_5)";
        return sql;
    }


    private static PreparedStatement batchToTracking() {
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
                "`cust_field_1`, " +
                "`cust_field_2`, " +
                "`cust_field_3`, " +
                "`cust_field_4`) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
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
                "`cust_field_1` = VALUES(cust_field_1), " +
                "`cust_field_2` = VALUES(cust_field_2), " +
                "`cust_field_3` = VALUES(cust_field_3), " +
                "`cust_field_4` = VALUES(cust_field_4)");
        return ps;
    }

    private static PreparedStatement getLineMgrLogBatchPs() {
        PreparedStatement ps = Base.startBatch("INSERT INTO `a_strongled_invalid_line_status_log` " +
                "(`move_in`, " +
                "`line_id`, " +
                "`work_id`, " +
                "`op`, " +
                "`create_by`, " +
                "`create_time`, " +
                "`modify_by`, " +
                "`modify_time`, " +
                "`line_status`, " +
                "`line_status_start`, " +
                "`line_status_end`, " +
                "`invalid_id`, " +
                "`invalid_text`, " +
                "`cust_field_2`) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE " +
                "`move_in` = VALUES(move_in), " +
                "`line_id` = VALUES(line_id), " +
                "`work_id` = VALUES(work_id), " +
                "`op` = VALUES(op), " +
                "`create_by` = VALUES(create_by), " +
                "`create_time` = VALUES(create_time), " +
                "`modify_by` = VALUES(modify_by), " +
                "`modify_time` = VALUES(modify_time), " +
                "`line_status` = VALUES(line_status), " +
                "`line_status_start` = VALUES(line_status_start), " +
                "`line_status_end` = VALUES(line_status_end)," +
                "`invalid_id` = VALUES(invalid_id), " +
                "`invalid_text` = VALUES(invalid_text), " +
                "`cust_field_2` = VALUES(cust_field_2)"
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
                "`cust_field_2`, " +
                "`cust_field_5`) " +
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
                "`cust_field_2` = VALUES(cust_field_2), " +
                "`cust_field_5` = VALUES(cust_field_5)"
        );
        return ps;
    }

    public Double getOpDuration(String moveIn, String moveOut, long sumInvalidMillisec) {
        Double minute;
        try {
            if ((moveIn == null || moveIn.equals("")) || (moveOut == null || moveOut.equals(""))) {
                return 0.0;
            } else {
                minute = (double) (sdf.parse(moveOut).getTime() - sdf.parse(moveIn).getTime() - sumInvalidMillisec) / (double) (1000 * 60);
                return minute > 999999 ? 0.0 : minute;
            }
        } catch (ParseException e) {
            e.printStackTrace();
            return 0.0;
        }
    }
}
