package com.servtech.servcloud.app.controller.kuochuan_servtrack;

import com.mysql.jdbc.exceptions.jdbc4.MySQLIntegrityConstraintViolationException;
import com.servtech.servcloud.app.controller.servtrack.ServtrackProcessNgController;
import com.servtech.servcloud.app.model.servtrack.LineWorkingHour;
import com.servtech.servcloud.app.model.servtrack.Work;
import com.servtech.servcloud.app.model.servtrack.WorkOp;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by admin on 2017/6/26.
 */
@RestController
@RequestMapping("/kuochuan/servtrack/tablet")
public class KuoChuanTabletDBUploadController {
    private final Logger log = LoggerFactory.getLogger(ServtrackProcessNgController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;
    @RequestMapping(value = "/upload", method = RequestMethod.PUT)
    public RequestResult<String> uploadTabletDatas(@RequestBody final Map[] datas) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                String moveIn = null;
                String moveOut = null;
                String lineId = null;
                String staffId;
                String workId = null;
                String op = null;
                String shiftDay = null;
                Boolean spDurationIsExist = null;
                Boolean stdHourIsExist = null;
                Map<String,String> stdHourContainer = null;
                String comparePks = null;
                Map<String, String> spDurationContainer = null;
                String comparePks2 = null;
                Integer partCount = null;

                try {
                    PreparedStatement batchToTracking = CalculateUtil.batchToTracking();
                    PreparedStatement batchToTrackingNg = CalculateUtil.batchToTrackingNg();
                    PreparedStatement batchToKuoChuanTracking = CalculateUtil.batchToKuoChuanTracking();
                    PreparedStatement batchToKuoChuanTrackingNg = CalculateUtil.batchToKuoChuanTrackingNg();
                    PreparedStatement batchToTrackingNoMoveOut = CalculateUtil.batchToTrackingNoMoveOut();
                    for (Map mData : datas) {

                        partCount = 0;
                        moveIn = mData.get("move_in").toString();
                        lineId = mData.get("line_id").toString();
                        staffId = mData.get("staff_id").toString();
                        String cust_staffId = staffId;
                        workId = mData.get("work_id").toString();
                        op = mData.get("op").toString();

                        String createBy = mData.get("create_by").toString();
                        String createTime = mData.get("create_time").toString();
                        String modifyBy = mData.get("modify_by").toString();
                        String modifyTime = mData.get("modify_time").toString();
                        partCount++; //part1

                        String processCode = mData.get("process_code").toString();
                        String cust_processCode = processCode;
                        shiftDay = mData.get("shift_day").toString();
                        String output = mData.get("output").toString();
                        String ngSumQuantity = mData.get("ng_quantity_sum").toString();
                        moveOut = mData.get("move_out") == null? null : mData.get("move_out").toString();
                        partCount++; //part2
                        //有進站資料，還沒有出站，派工單狀態新增為生產中
                        if(moveOut == null || moveOut.equals("")) {
                            //將工單狀態改程生產中，代號1
                            String statusId = "1";
                            Work e = Work.findFirst("work_id = ?", workId);
                            e.set("status_id", statusId).saveIt();
                            Base.addBatch(batchToTrackingNoMoveOut,
                                    moveIn,
                                    lineId,
                                    workId,
                                    op,
                                    createBy,
                                    createTime,
                                    modifyBy,
                                    modifyTime);
                            System.out.println("batchToTrackingNoMoveOut");
                        } else {
                            stdHourContainer = new HashMap<String, String>();
                            List<Map> stdHourDatas = CalculateUtil.getStdHour();
                            for(Map data : stdHourDatas) {
                                String _workId = data.get("work_id").toString();
                                String _op = data.get("op").toString();
                                String pks = _workId+_op;
                                String std_hour = data.get("std_hour").toString();
                                stdHourContainer.put(pks, std_hour);
                            }
                            comparePks = workId + op;
                            System.out.println("-------------");
                            System.out.println("comparePks");
                            System.out.println(comparePks);
                            stdHourIsExist = stdHourContainer.containsKey(comparePks);
                            System.out.println("stdHourIsExist");
                            System.out.println(stdHourIsExist);
                            System.out.println("-------------");
                            String stdHourValue = stdHourContainer.get(comparePks);
                            Double stdHour = Double.parseDouble(stdHourValue);
                            partCount++;//part3

                            Integer goQuantity;
                            if(ngSumQuantity.isEmpty() || ngSumQuantity.equals("") || ngSumQuantity.equals("0")) {
                                System.out.println("沒有不良品，良品數等於實際產量");
                                goQuantity = Integer.parseInt(output);
                            } else {
                                goQuantity = CalculateUtil.getGoQuantity(output, ngSumQuantity);
                            }

                            Double quality = CalculateUtil.getQuality(goQuantity, output);
                            partCount++;//part4

                            Double opDuration = null;
                            Integer spOutput = null;
                            Double aval = null;
                            Double perf = null;
                            Double oee = null;
                            Integer outputVariance = null;
                            Double durationVariance = null;

                            opDuration = CalculateUtil.getOpDuration(moveIn, moveOut);
                            System.out.println("opDuration");
                            System.out.println(opDuration);
                            System.out.println(stdHour);
                            spOutput = CalculateUtil.getSpOutput(opDuration, stdHour);

                            //到每日各線應生產工時表格找此線別與班次的進出站紀錄的應生產時間(duration_sp)
                            spDurationContainer = new HashMap<String, String>();
                            List<Map> spDurationDatas = CalculateUtil.getSpDuration();
                            for (Map data : spDurationDatas) {
                                String pks = data.get("line_id").toString() + data.get("shift_day").toString();
                                String spDuration = data.get("duration_sp").toString();
                                spDurationContainer.put(pks, spDuration);
                            }
                            comparePks2 = lineId + shiftDay;
                            spDurationIsExist = spDurationContainer.containsKey(comparePks2);
                            System.out.println("spDurationIsExist:" + spDurationIsExist);
                            if (spDurationIsExist) {
                                String spDurationValue = spDurationContainer.get(comparePks2);
                                Double spDuration = Double.parseDouble(spDurationValue);
                                aval = CalculateUtil.getAval(opDuration, spDuration);
                                perf = CalculateUtil.getPerf(goQuantity, stdHour, opDuration);
                                oee = CalculateUtil.getOee(aval, quality, perf);
                            } else {
                                //若每日各線應生產工時查不到此線別與班次的應生產時間(duration_sp)，用應生產時間計算的值都代零
                                aval = 0.00;
                                perf = CalculateUtil.getPerf(goQuantity, stdHour, opDuration);
                                oee = 0.00;
                                System.out.println("每日各線應生產工時資料表，查不到此線別:" + lineId + "與班次:" + shiftDay + "的應生產時間紀錄，用應生產時間計算的利用率與總體稼動率都代入0表示");
                            }
                            outputVariance = CalculateUtil.getOutputVariance(goQuantity, opDuration, stdHour);
                            durationVariance = CalculateUtil.getDurationVariance(opDuration, goQuantity, stdHour);

                            partCount++;//part5


                            //如果有進站時間，派工單狀態修改為生產中(代碼:1)
                            if(!moveIn.isEmpty()){
                                String statusId = "1";
                                Work e = Work.findFirst("work_id = ?", workId);
                                e.set("status_id", statusId).saveIt();
                            }
                            System.out.println("------------------------------------------");
                            System.out.println("moveIn : "+moveIn);
                            System.out.println("lineId : "+lineId);
                            System.out.println("workId : "+workId);
                            System.out.println("op : "+op);
                            System.out.println("shiftDay : "+shiftDay);
                            System.out.println("moveOut : "+ moveOut);
                            System.out.println("opDuration : "+opDuration);
                            System.out.println("output : "+output);
                            System.out.println("goQuantity : "+goQuantity);
                            System.out.println("ngSumQuantity : "+ngSumQuantity);
                            System.out.println("quality : "+quality);
                            System.out.println("spOutput : "+spOutput);
                            System.out.println("aval : " + aval);
                            System.out.println("perf : "+perf);
                            System.out.println("oee : "+oee);
                            System.out.println("outputVariance : "+outputVariance);
                            System.out.println("durationVariance : "+durationVariance);
                            System.out.println("processCode : "+ processCode);
                            System.out.println("createBy : " + createBy);
                            System.out.println("createTime : "+createTime);
                            System.out.println("modifyBy : " + modifyBy);
                            System.out.println("modifyTime : " + modifyTime);
                            System.out.println("------------------------------------------");
                            Base.addBatch(batchToTracking,
                                    moveIn,
                                    lineId,
                                    workId,
                                    op,
                                    cust_staffId,
                                    cust_processCode,
                                    shiftDay,
                                    moveOut,
                                    CalculateUtil.toRound(opDuration, 4),
                                    output,
                                    goQuantity,
                                    ngSumQuantity,
                                    CalculateUtil.toRound(quality * 100, 2) > 999 ? 999 : CalculateUtil.toRound(quality * 100, 2),
                                    spOutput,
                                    CalculateUtil.toRound(aval * 100, 2) > 999 ? 999 : CalculateUtil.toRound(aval * 100, 2),
                                    CalculateUtil.toRound(perf * 100, 2) > 999 ? 999 : CalculateUtil.toRound(perf * 100, 2),
                                    CalculateUtil.toRound(oee * 100, 2) > 999 ? 999 : CalculateUtil.toRound(oee * 100, 2),
                                    outputVariance,
                                    CalculateUtil.toRound(durationVariance, 2),
                                    createBy,
                                    createTime,
                                    modifyBy,
                                    modifyTime);
                            System.out.println("batchToTracking");
                            partCount++;//part6

                            Base.addBatch(batchToKuoChuanTracking,
                                    moveIn,
                                    lineId,
                                    staffId,
                                    workId,
                                    op,
                                    processCode);
                            System.out.println("batchToKuoChuanTracking");


                            List<Map> trackingNg = (List<Map>)mData.get("tracking_ng");
                            String ngCode = "";
                            String ngQuantity = null;
                            Integer newNgQuantity = null;
                            if (ngSumQuantity.isEmpty() || ngSumQuantity.equals("") || ngSumQuantity.equals("0")){
                                System.out.println("No ng, No batchToTrackingNg");
                            } else {
                                for(Map tnData : trackingNg) {
                                    ngCode = tnData.get("ng_code").toString();
                                    ngQuantity = tnData.get("ng_quantity").toString();

                                    System.out.println("ng_code " + ngCode);
                                    System.out.println("ngQuantity " + ngQuantity);

                                    Base.addBatch(batchToTrackingNg, moveIn, lineId, workId, op, cust_staffId,processCode, ngCode, ngQuantity,
                                            createBy, createTime, modifyBy, modifyTime);
                                    System.out.println("ng_code" + ngCode + "run batchToTrackingNg");

                                    Base.addBatch(batchToKuoChuanTrackingNg, moveIn, staffId, lineId, workId, op, processCode, ngCode);
                                    System.out.println("run batchToKuoChuanTrackingNg");
                                }
                            }
                            partCount++;//part7
                        }
                    }

                    Base.executeBatch(batchToTracking);
                    batchToTracking.close();

                    Base.executeBatch(batchToTrackingNg);
                    batchToTrackingNg.close();

                    Base.executeBatch(batchToKuoChuanTracking);
                    batchToKuoChuanTracking.close();

                    Base.executeBatch(batchToKuoChuanTrackingNg);
                    batchToKuoChuanTrackingNg.close();

                    Base.executeBatch(batchToTrackingNoMoveOut);
                    batchToTrackingNoMoveOut.close();

                    return success("上傳成功");

                } catch (MySQLIntegrityConstraintViolationException e) {
                    System.out.println();
                    System.out.println("進站時間:" + moveIn + ", " +
                                        "線別編號:" + lineId + ", " +
                                       "工單編號:" + workId + ", " +
                                       "製程:" + op + ", " +
                                       "錯誤編碼:" + partCount + ", " +
                                       "匯入資料庫的資料關聯有問題。此筆進出站紀錄，可能線別編號或工單編號或製程與平台基本資料不符");
                    e.printStackTrace();
                    return fail(
                                "進站時間:" + moveIn + ", " + "線別編號:" + lineId + ", " +
                                "工單編號:" + workId + ", " +
                                "製程:" + op + ", " +
                                "錯誤編碼:" + partCount + ", " +
                                "匯入資料庫的資料關聯有問題。此筆進出站紀錄，可能線別編號或工單編號或製程與平台基本資料不符");
                } catch (NullPointerException e) {
                    System.out.println();
                    System.out.println(
                            "進站時間:" + moveIn + ", " +
                            "線別編號:" + lineId + ", " +
                            "工單編號:" + workId + ", " +
                            "製程:" + op + ", " +
                            "錯誤編碼:" + partCount + ", " +
                            getSpDurationErrorResult(spDurationIsExist) +
                            getStdHourErrorResult(stdHourIsExist) +
                            getMoveOutErrorResult(moveOut)
                    );
                    e.printStackTrace();
                    return fail (
                                "進站時間:" + moveIn + ", " +
                                "線別編號:" + lineId + ", " +
                                "工單編號:" + workId + ", " +
                                "製程:" + op + ", " +
                                "錯誤編碼:" + partCount + ", " +
                                getSpDurationErrorResult(spDurationIsExist) +
                                getStdHourErrorResult(stdHourIsExist) +
                                getMoveOutErrorResult(moveOut)
                    );
                } catch (Exception e) {
                    e.printStackTrace();
                    return fail("批次上傳失敗，原因待查...");
                }
            }
        });
    }

    public static String getStdHourErrorResult (Boolean stdHourIsExist) {
        String message = "";
        if (stdHourIsExist != null ) {
            if(!stdHourIsExist) {
                message = "此筆進出站紀錄找不到單件標工值，請確定派工單工序是否有設定";
            }
        }
        return message;
    }

    public static String getSpDurationErrorResult (Boolean spDurationIsExist) {
        String message = "";
        if (spDurationIsExist != null ) {
            if(!spDurationIsExist) {
                message = "此筆進出站紀錄找不到應生產時間值，請確定各線每日應生產工時報表是否有設定";
            }
        }
        return message;
    }

    public static String getMoveOutErrorResult (String moveOut) {
        String message = "";
        if (moveOut == null ) {
            message = "沒有出站紀錄，請再確認";
        }
        return message;
    }

    static class CalculateUtil {

        static SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        public static Double getOpDuration(String moveIn, String moveOut){
            Double minute = null;
            try {
                minute  = (double)(format.parse(moveOut).getTime() - format.parse(moveIn).getTime()) / (double)(1000 * 60);
                return minute;
            } catch (ParseException e) {
                e.printStackTrace();
                return null;
            }
        }

        public static int getGoQuantity(String output, String ngQuantity) {
            int goQuantity = Integer.parseInt(output) - Integer.parseInt(ngQuantity);
            if(goQuantity >= 0){
                return goQuantity;
            } else {
                return 0;
            }
        }

        public static Double getQuality(int goQuantity, String output) {
            double max = 999.0; //若使用者key資料錯誤導致計算百分比超過999，則以999表示
            if(goQuantity <= 0 || Double.parseDouble(output) <= 0){
                return 0.0;
            } else {
                // 良率 = 良品數/實際產量
                double result = (double) goQuantity / Double.parseDouble(output);
                if(result > max) {
                    return max;
                } else {
                    return result;
                }
            }
        }
        public static List<Map> getStdHour() {
            StringBuilder sb = new StringBuilder();
            sb.append("SELECT `work_id`, `op`, `std_hour` from a_servtrack_work_op ");
            String sql = sb.toString();
            return WorkOp.findBySQL(sql).toMaps();
        }

        public static Integer getSpOutput(Double opDuration, Double stdHour) {
            if(opDuration <= 0 || stdHour <= 0 ){
                return 0;
            } else {
                double result = opDuration / stdHour;
                int spOutput = (int)result;
                return spOutput;
            }
        }

        public static List<Map> getSpDuration() {
            StringBuilder sb = new StringBuilder();
            sb.append("SELECT `line_id`,`shift_day`,`duration_sp` from a_servtrack_line_working_hour ");
            String sql = sb.toString();
            return LineWorkingHour.findBySQL(sql).toMaps();
        }

        public static Double getAval(Double opDuration, Double spDuration) {
            double max = 999.0;
            if (opDuration <= 0 || spDuration <=0) {
                return 0.0;
            } else {
                //利用率 = 總生產時間(分)/班次天起訖時間(時)
                double aval = opDuration / (spDuration * 60);
                if(aval > max) {
                    return max;
                } else {
                    return aval;
                }
            }
        }

        public static Double getPerf(int goQuantity, double stdHour, double opDuration) {
            double max = 999.0;
            if (goQuantity <= 0 || stdHour <= 0 || opDuration <= 0){
                return 0.0;
            } else {
                //產能效率 = (良品*單件標工)/生產時間
                double perf = ((double)goQuantity * stdHour) / opDuration;
                if(perf > max) {
                    return max;
                } else {
                    return perf;
                }
            }
        }

        public static Double getOee(Double aval, Double quality, Double perf) {
            double max = 999.0;
            //總體稼動率 = 利用率*良率*產能效率
            double oee = aval * quality * perf;
            if(oee > max) {
                return max;
            } else {
                return oee;
            }
        }

        public static int getOutputVariance(int goQuantity, Double opDuration, Double stdHour) {
            if (opDuration <= 0 || stdHour <=0) {
                return goQuantity;
            } else {
                int result = goQuantity - (int)(opDuration / stdHour);
                return result;
            }
        }

        public static Double getDurationVariance(Double opDuration, int goQuantity, Double stdHour) {
            //績效時間= (良品*單件標工)-總生產時間
            double result = ((double)(goQuantity) * stdHour) - opDuration;
            return result;
        }

        public static PreparedStatement batchToTracking() {
            PreparedStatement ps = Base.startBatch("INSERT INTO `a_servtrack_work_tracking` " +
                    "(`move_in`, " +
                    "`line_id`, " +
                    "`work_id`, " +
                    "`op`, " +
                    "`cust_field_1`, " +
                    "`cust_field_2`, " +
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
                    "`modify_time`) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                    "ON DUPLICATE KEY UPDATE " +
                    "`move_in` = VALUES(move_in), " +
                    "`line_id` = VALUES(line_id), " +
                    "`work_id` = VALUES(work_id), " +
                    "`op` = VALUES(op), " +
                    "`cust_field_1` = VALUES(cust_field_1), " +
                    "`cust_field_2` = VALUES(cust_field_2), " +
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
                    "`modify_time` = VALUES(modify_time)");
            return ps;
        }

        public static PreparedStatement batchToKuoChuanTracking() {
            PreparedStatement ps = Base.startBatch("INSERT INTO `a_kuochuan_servtrack_work_tracking` " +
                            "(`move_in`, " +
                            "`line_id`, " +
                            "`staff_id`, " +
                            "`work_id`, " +
                            "`op`, " +
                            "`process_code`) " +
                            "VALUES (?, ?, ?, ?, ?, ?) " +
                            "ON DUPLICATE KEY UPDATE " +
                            "`move_in` = VALUES(move_in), " +
                            "`line_id` = VALUES(line_id), " +
                            "`staff_id` = VALUES(staff_id), " +
                            "`work_id` = VALUES(work_id), " +
                            "`op` = VALUES(op), " +
                            "`process_code` = VALUES(process_code)"
            );
            return ps;
        }

        public static PreparedStatement batchToTrackingNg() {
            PreparedStatement ps = Base.startBatch("INSERT INTO `a_servtrack_work_tracking_ng` " +
                    "(`move_in`, " +
                    "`line_id`, " +
                    "`work_id`, " +
                    "`op`, " +
                    "`cust_field_1`, " +
                    "`process_code`, " +
                    "`ng_code`, " +
                    "`ng_quantity`, " +
                    "`create_by`, " +
                    "`create_time`, " +
                    "`modify_by`, " +
                    "`modify_time`) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                    "ON DUPLICATE KEY UPDATE " +
                    "`move_in` = VALUES(move_in), " +
                    "`line_id` = VALUES(line_id), " +
                    "`work_id` = VALUES(work_id), " +
                    "`op` = VALUES(op), " +
                    "`cust_field_1` = VALUES(cust_field_1), " +
                    "`process_code` = VALUES(process_code), " +
                    "`ng_code` = VALUES(ng_code), " +
                    "`ng_quantity` = VALUES(ng_quantity), " +
                    "`create_by` = VALUES(create_by), " +
                    "`create_time` = VALUES(create_time), " +
                    "`modify_by` = VALUES(modify_by), " +
                    "`modify_time` = VALUES(modify_time)");
            return ps;
        }

        public static PreparedStatement batchToKuoChuanTrackingNg() {
            PreparedStatement ps = Base.startBatch("INSERT INTO `a_kuochuan_servtrack_work_tracking_ng` " +
                    "(`move_in`, " +
                    "`staff_id`, " +
                    "`line_id`, " +
                    "`work_id`, " +
                    "`op`, " +
                    "`process_code`, " +
                    "`ng_code`) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?) " +
                    "ON DUPLICATE KEY UPDATE " +
                    "`move_in` = VALUES(move_in), " +
                    "`staff_id` = VALUES(staff_id), " +
                    "`line_id` = VALUES(line_id), " +
                    "`work_id` = VALUES(work_id), " +
                    "`op` = VALUES(op), " +
                    "`process_code` = VALUES(process_code), " +
                    "`ng_code` = VALUES(ng_code)");
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
                    "`modify_time`) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?) " +
                    "ON DUPLICATE KEY UPDATE " +
                    "`move_in` = VALUES(move_in), " +
                    "`line_id` = VALUES(line_id), " +
                    "`work_id` = VALUES(work_id), " +
                    "`op` = VALUES(op), " +
                    "`create_by` = VALUES(create_by), " +
                    "`create_time` = VALUES(create_time), " +
                    "`modify_by` = VALUES(modify_by), " +
                    "`modify_time` = VALUES(modify_time)");
            return ps;
        }

        //任意小數點後位數四捨五入
        public static double toRound(double doubleNum, int decimalPlace) {
            String stringNum = Double.toString(doubleNum);
            BigDecimal roundNum = new BigDecimal(stringNum).setScale(decimalPlace, BigDecimal.ROUND_HALF_UP);
            return roundNum.doubleValue();
        }
    }
}
