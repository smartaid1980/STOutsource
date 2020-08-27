package com.servtech.servcloud.app.controller.servtrack;

import com.servtech.servcloud.app.model.servtrack.Work;
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
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by admin on 2017/6/26.
 */
@RestController
@RequestMapping("/servtrack/tablet")
public class TabletDBUploadController {
    private static final org.slf4j.Logger log = LoggerFactory.getLogger(TabletDBUploadController.class);
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
    static String pks;
    static Double opDuration;
    static Integer spOutput;
    static Double aval;
    static Double perf;
    static Double oee;
    static Integer outputVariance;
    static Double durationVariance;
    static Double stdHour;
    static Integer goQuantity;
    static Double quality;
    static String spDurationValue;
    static Double spDuration;
    static List<Map> trackingNg;
    static String ngCode;
    static String ngQuantity;
    static Map<String, String> spDurationContainer;
    static StringBuilder errLog;
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

                PreparedStatement batchToTracking = TrackCalcUtil.batchToTracking();
                PreparedStatement batchToTrackingNg = TrackCalcUtil.batchToTrackingNg();
                PreparedStatement batchToTrackingNoMoveOut = TrackCalcUtil.batchToTrackingNoMoveOut();
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
                        createBy = mData.get("create_by").toString();
                        createTime = mData.get("create_time").toString();
                        modifyBy = mData.get("modify_by").toString();
                        modifyTime = mData.get("modify_time").toString();
                        stdHour = TrackCalcUtil.getStdHour(workId, op);
                        goQuantity = TrackCalcUtil.checkAndGetGoQuantity(ngSumQuantity, output);
                        quality = TrackCalcUtil.getQuality(goQuantity, output);
                        trackingNg = (List<Map>) mData.get("tracking_ng");
                        pks = lineId + shiftDay;

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
                                    modifyTime);
                        } else {
                            opDuration = TrackCalcUtil.getOpDuration(moveIn, moveOut);
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

                            Base.addBatch(batchToTracking,
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
                                    modifyTime);

                            if (!(ngSumQuantity.isEmpty() || ngSumQuantity.equals("") || ngSumQuantity.equals("0"))) {
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
                                            modifyTime);
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
                } catch (java.lang.NullPointerException e) {
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
}
