package com.servtech.servcloud.app.controller.servtrack;

import com.servtech.servcloud.app.model.servtrack.*;
import com.servtech.servcloud.app.model.servtrack.Process;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.DELETE;
import static org.springframework.web.bind.annotation.RequestMethod.GET;

/**
 * Created by Frank on 2017/6/20.
 */
@RestController
@RequestMapping("/servtracksimulator")
public class ServtrackSimulatorController {
    static SimpleDateFormat moveInOutformat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    static String move_in = null;
    static String line_id = null;
    static String work_id = null;
    static String op = null;
    static String cust_field_1 = null;
    static String cust_field_2 = null;
    static String cust_field_3 = null;
    static String cust_field_4 = null;
    static String cust_field_5 = null;
    static String shift_day = null;
    static String move_out = null;
    static double op_duration;
    static int output = 0;
    static int go_quantity;
    static Integer ng_quantity;
    static double quality;
    static int sp_output;
    static double spDuration;
    static double aval;
    static double perf;
    static double oee;
    static int output_variance;
    static double duration_variance;
    static String create_by;
    static Timestamp create_time;
    static String modify_by;
    static Timestamp modify_time;
    static double stdHour;
    static String user = "admin";
    static Map<String, Integer> everyTrackingNgSum = new HashMap();
    static Map<String, Double> everyLineDaySpDuration = new HashMap<String, Double>();
    static Map<String, Double> everyWorkOpStdHour = new HashMap<String, Double>();
    static int count = 0;
    static int max = 999;

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/clearBasicData", method = DELETE)
    public RequestResult<String> clearBasicData() {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                try {
                    LineWorkingHour.deleteAll();
                    LineOee.deleteAll();
                    Line.deleteAll();
                    ProductOp.deleteAll();
                    Product.deleteAll();
                    ProcessNg.deleteAll();
                    Process.deleteAll();
                    return success("clear success");
                } catch (Exception e) {
                    e.printStackTrace();
                    return fail("請按照順序清除 1.報工與不良紀錄資料 2.派工單 3.基本資料");
                }
            }
        });
    }

    @RequestMapping(value = "/clearWorkData", method = DELETE)
    public RequestResult<String> clearWorkData() {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                try {
                    WorkOp.deleteAll();
                    Work.deleteAll();
                    return success("clear success");
                } catch (Exception e) {
                    e.printStackTrace();
                    return fail("請按照順序清除 1.報工與不良紀錄資料 2.派工單 3.基本資料");
                }
            }
        });
    }

    @RequestMapping(value = "/clearTrackingData", method = DELETE)
    public RequestResult<String> clearTrackingData() {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                try {
                    WorkTrackingNg.deleteAll();
                    WorkTracking.deleteAll();
                    return success("clear success");
                } catch (Exception e) {
                    e.printStackTrace();
                    return fail("請按照順序清除 1.報工與不良紀錄資料 2.派工單 3.基本資料");
                }
            }
        });
    }

    @RequestMapping(value = "/calculate", method = GET)
    public RequestResult<String> calculate() {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                try {
                    PreparedStatement batchToTracking = Base.startBatch(getInsertTrackingSql());
                    List<Map> findTrackingNgs = WorkTrackingNg.findAll().toMaps();
                    for (Map trackingNg : findTrackingNgs) {
                        String pks = new StringBuilder()
                                .append(trackingNg.get("move_in").toString())
                                .append(trackingNg.get("line_id").toString())
                                .append(trackingNg.get("work_id").toString())
                                .append(trackingNg.get("op").toString())
                                .append(trackingNg.get("cust_field_1").toString())
                                .append(trackingNg.get("cust_field_2").toString())
                                .append(trackingNg.get("cust_field_3").toString())
                                .append(trackingNg.get("cust_field_4").toString())
                                .append(trackingNg.get("cust_field_5").toString())
                                .toString();
                        if (everyTrackingNgSum.containsKey(pks)) {
                            int newNgQuantity = everyTrackingNgSum.get(pks) + Integer.parseInt(trackingNg.get("ng_quantity").toString());
                            everyTrackingNgSum.put(pks.toString(), newNgQuantity);
                        } else {
                            everyTrackingNgSum.put(pks.toString(), Integer.parseInt(trackingNg.get("ng_quantity").toString()));
                        }
                    }

                    List<Map> findLineWorkingHours = LineWorkingHour.findAll().toMaps();
                    for (Map lineWorkingHour : findLineWorkingHours) {
                        String lineId = lineWorkingHour.get("line_id").toString();
                        String shiftDay = lineWorkingHour.get("shift_day").toString();
                        double duration_sp = Double.parseDouble(lineWorkingHour.get("duration_sp").toString());
                        String keys = lineId + shiftDay;
                        everyLineDaySpDuration.put(keys, duration_sp);

                    }

                    List<Map> findWorkOp = WorkOp.findAll().toMaps();
                    for (Map workOp : findWorkOp) {
                        String workId = workOp.get("work_id").toString();
                        String op2 = workOp.get("op").toString();
                        String pks = workId + op2;
                        double std_hour = Double.parseDouble(workOp.get("std_hour").toString());
                        everyWorkOpStdHour.put(pks, std_hour);
                    }
                    List<Map> findTrackings = WorkTracking.findAll().toMaps();
                    if (findTrackings.size() == 0) {
                        batchToTracking.close();
                        return success("沒有報工資料");
                    }
                    for (Map tracking : findTrackings) {
                        move_in = tracking.get("move_in").toString();
                        line_id = tracking.get("line_id").toString();
                        work_id = tracking.get("work_id").toString();
                        op = tracking.get("op").toString();
                        cust_field_1 = tracking.get("cust_field_1").toString();
                        cust_field_2 = tracking.get("cust_field_2").toString();
                        cust_field_3 = tracking.get("cust_field_3").toString();
                        cust_field_4 = tracking.get("cust_field_4").toString();
                        cust_field_5 = tracking.get("cust_field_5").toString();
                        shift_day = tracking.get("shift_day").toString();
                        move_out = tracking.get("move_out").toString();
                        output = Integer.parseInt(tracking.get("output").toString());
                        String trackingNgPk = new StringBuilder()
                                .append(move_in)
                                .append(line_id)
                                .append(work_id)
                                .append(op)
                                .append(cust_field_1)
                                .append(cust_field_2)
                                .append(cust_field_3)
                                .append(cust_field_4)
                                .append(cust_field_5)
                                .toString();
                        String lineWorkingHrPk = line_id + shift_day;
                        String workOpPk = work_id + op;

                        ng_quantity = everyTrackingNgSum.containsKey(trackingNgPk) ? everyTrackingNgSum.get(trackingNgPk) : 0;
                        go_quantity = output - ng_quantity;
                        op_duration = getOpDuration(move_in, move_out);
                        quality = getQuality(go_quantity, output);
                        stdHour = everyWorkOpStdHour.containsKey(workOpPk) ? everyWorkOpStdHour.get(workOpPk) : 0;
                        sp_output = getSpOutput(op_duration, stdHour);
                        spDuration = everyLineDaySpDuration.containsKey(lineWorkingHrPk) ? everyLineDaySpDuration.get(lineWorkingHrPk) : 0;
                        perf = getPerf(go_quantity, stdHour, op_duration);

                        if (spDuration > 0) {
                            aval = getAval(op_duration, spDuration);
                            oee = getOee(aval, quality, perf);
                        } else {
                            aval = 0.0;
                            oee = 0.0;
                            System.out.println("duration_sp is not exist or equals zero, check line_working_hour table!");
                        }
                        output_variance = getOutputVariance(go_quantity, op_duration, stdHour);
                        duration_variance = getDurationVariance(op_duration, go_quantity, stdHour);
                        create_by = user;
                        create_time = new Timestamp(System.currentTimeMillis());
                        modify_by = user;
                        modify_time = new Timestamp(System.currentTimeMillis());


                        Base.addBatch(batchToTracking,
                                move_in,
                                line_id,
                                work_id,
                                op,
                                cust_field_1,
                                cust_field_2,
                                cust_field_3,
                                cust_field_4,
                                cust_field_5,
                                shift_day,
                                move_out,
                                toRound(op_duration, 4),
                                output,
                                go_quantity,
                                ng_quantity,
                                toRound(quality * 100, 2),
                                sp_output,
                                toRound(aval * 100, 2),
                                toRound(perf * 100, 2),
                                toRound(oee * 100, 2),
                                output_variance,
                                toRound(duration_variance, 2),
                                create_by,
                                create_time,
                                modify_by,
                                modify_time);
                        count++;
                    }
                    Base.executeBatch(batchToTracking);
                    batchToTracking.close();
                    System.out.println("Insert DB finish!");
                    System.out.println("Insert record number:" + count);

                    String[] command = {"cmd.exe", "/C", "Start", "C:/Servtech/Servolution/Platform/calc/oee_schedule_calculate/run.bat"};
                    Runtime.getRuntime().exec(command);

                    return success("calculate success");
                } catch (SQLException e) {
                    e.printStackTrace();
                    return fail("calculate fail - " + e.getMessage());
                } catch (IOException e) {
                    e.printStackTrace();
                    return fail("calculate oee report fail - " + e.getMessage());
                } catch (Exception e) {
                    return fail("calculate fail - " + e.getMessage());
                }
            }
        });
    }

    public static String getInsertTrackingSql() {
        String sql = "INSERT INTO `a_servtrack_work_tracking` " +
                "(move_in, " +
                "line_id, " +
                "work_id, " +
                "op, " +
                "cust_field_1, " +
                "cust_field_2, " +
                "cust_field_3, " +
                "cust_field_4, " +
                "cust_field_5, " +
                "shift_day, " +
                "move_out, " +
                "op_duration, " +
                "output, " +
                "go_quantity, " +
                "ng_quantity, " +
                "quality, " +
                "output_sp, " +
                "aval, " +
                "perf, " +
                "oee, " +
                "output_variance, " +
                "duration_variance, " +
                "create_by, " +
                "create_time, " +
                "modify_by, " +
                "modify_time) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE " +
                "move_in = VALUES(move_in), " +
                "line_id = VALUES(line_id), " +
                "work_id = VALUES(work_id), " +
                "op = VALUES(op), " +
                "cust_field_1 = VALUES(cust_field_1), " +
                "cust_field_2 = VALUES(cust_field_2), " +
                "cust_field_3 = VALUES(cust_field_3), " +
                "cust_field_4 = VALUES(cust_field_4), " +
                "cust_field_5 = VALUES(cust_field_5), " +
                "shift_day = VALUES(shift_day), " +
                "move_out = VALUES(move_out), " +
                "op_duration = VALUES(op_duration), " +
                "output = VALUES(output), " +
                "go_quantity = VALUES(go_quantity), " +
                "ng_quantity = VALUES(ng_quantity), " +
                "quality = VALUES(quality), " +
                "output_sp = VALUES(output_sp), " +
                "aval = VALUES(aval), " +
                "perf = VALUES(perf), " +
                "oee = VALUES(oee), " +
                "output_variance = VALUES(output_variance), " +
                "duration_variance = VALUES(duration_variance), " +
                "create_by = VALUES(create_by), " +
                "create_time = VALUES(create_time), " +
                "modify_by = VALUES(modify_by), " +
                "modify_time = VALUES(modify_time)";
        return sql;
    }

    public static double getOpDuration(String moveIn, String moveOut) {
        try {
            double minute = (double) (moveInOutformat.parse(moveOut).getTime() - moveInOutformat.parse(moveIn).getTime()) / (double) (1000 * 60);
            return minute;
        } catch (ParseException e) {
            e.printStackTrace();
            return 0;
        }
    }

    public static double getOee(double aval, double quality, double perf) {
        double oee = aval * quality * perf;
        if (oee > max) {
            return max;
        } else {
            return oee;
        }
    }

    public static double getAval(double opDuration, double spDuration) {
        if (opDuration <= 0 || spDuration <= 0) {
            return 0.0;
        } else {
            double aval = opDuration / (spDuration * 60);
            if (aval > max) {
                return max;
            } else {
                return aval;
            }
        }
    }

    public static double getQuality(int goQuantity, int output) {
        if (goQuantity <= 0 || output <= 0) {
            return 0.0;
        } else {
            double result = (double) goQuantity / (double) output;
            if (result > max) {
                return max;
            } else {
                return result;
            }
        }
    }

    public static int getSpOutput(double opDuration, double stdHour) {
        if (opDuration <= 0 || stdHour <= 0) {
            return 0;
        } else {
            double result = opDuration / stdHour;
            int spOutput = (int) result;
            return spOutput;
        }
    }

    public static double getPerf(int goQuantity, double stdHour, double opDuration) {
        if (goQuantity <= 0 || stdHour <= 0 || opDuration <= 0) {
            return 0.0;
        } else {
            double perf = ((double) goQuantity * stdHour) / opDuration;
            if (perf > max) {
                return max;
            } else {
                return perf;
            }
        }
    }

    public static int getOutputVariance(int goQuantity, double opDuration, double stdHour) {
        if (opDuration <= 0 || stdHour <= 0) {
            return goQuantity;
        } else {
            int result = goQuantity - (int) (opDuration / stdHour);
            return result;
        }
    }

    public static double getDurationVariance(double opDuration, int goQuantity, double stdHour) {
        double result = ((double) goQuantity * stdHour) - opDuration;
        return result;
    }

    public static double toRound(double doubleNum, int decimalPlace) {
        String stringNum = Double.toString(doubleNum);
        BigDecimal roundNum = new BigDecimal(stringNum).setScale(decimalPlace, BigDecimal.ROUND_HALF_UP);
        return roundNum.doubleValue();
    }

}
