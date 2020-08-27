package com.servtech.servcloud.app.controller.servtrack;

import com.servtech.servcloud.app.model.servtrack.ProductOp;
import com.servtech.servcloud.app.model.servtrack.Work;
import com.servtech.servcloud.app.model.servtrack.view.WorkView;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by admin on 2017/6/25.
 */
@RestController
@RequestMapping("/servtrack/work")
public class ServtrackWorkController {
    private final Logger log = LoggerFactory.getLogger(ServtrackProcessController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;


    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {

                    data.put("status_id", 0);
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    Work work = new Work();
                    work.fromMap(data);
                    if (!work.insert()) {
                        return fail(null);
                    }
                    String product_id = data.get("product_id").toString();
                    List<ProductOp> productList = ProductOp.find("product_id = ? AND is_open = ?", product_id, "Y");

                    StringBuilder workOpSql = new StringBuilder();
                    workOpSql.append("INSERT INTO a_servtrack_work_op ( ");
                    workOpSql.append("work_id, op, process_code, qrcode_op, remark, is_open, std_hour, create_by, create_time, modify_by, modify_time ) ");
                    workOpSql.append("VALUES (?,?,?,?,?,?,?,?,?,?,?)");
                    PreparedStatement ps = Base.startBatch(workOpSql.toString());

                    String user_id = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    List<WorkOpData> workOpDataList = getWorkOpData(data.get("work_id").toString(), user_id, productList);
                    if (workOpDataList.size() > 0) {
                        for (WorkOpData opData : workOpDataList) {
                            Base.addBatch(ps,
                                    opData.work_id,
                                    opData.op,
                                    opData.process_code,
                                    opData.qrcode_op,
                                    opData.remark,
                                    opData.is_open,
                                    opData.std_hour,
                                    opData.create_by,
                                    opData.create_time,
                                    opData.modify_by,
                                    opData.modify_time);
                        }
                    }
                    Base.executeBatch(ps);
                    List<Map> resultList = WorkView.find("work_id=?", data.get("work_id").toString()).toMaps();
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                    for (Map map : resultList) {
                        if (map.get("user_id").toString().equals(request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString())) {
                            map.put("is_edit", true);
                        } else {
                            map.put("is_edit", false);
                        }
                        String createTime = sdf.format(map.get("create_time"));
                        if (map.get("move_in") != null) {
                            String move_in = sdf.format(map.get("move_in"));
                            map.put("move_in", move_in);
                        }
                        map.put("create_time", createTime);
                    }


                    return success(resultList);
                }
            });
        } catch (Exception e) {
            return fail("新增失敗...");
        }
    }

    @RequestMapping(value = "/read", method = RequestMethod.POST)
    public RequestResult<List<Map>> getWorks(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString();
        final String endDate = data.get("endDate").toString();
        final String workId = data.get("workId") == null ? "" : data.get("workId").toString();
        final String productId = data.get("productId") == null ? "" : data.get("productId").toString();
        final List<String> statusIds = (List) data.get("status");


        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                StringBuilder sb = new StringBuilder();

                sb.append("SELECT * FROM a_servtrack_view_work ");
                sb.append("WHERE ");
                sb.append("(create_time BETWEEN ");
                sb.append("'" + startDate + " 00:00:00' ");
                sb.append("AND ");
                sb.append("'" + endDate + " 23:59:59' )");
                if (!"".equals(workId) && !workId.equals("null")) {
                    sb.append("AND ");
                    sb.append("work_id = '" + workId + "' ");
                }
                if (!"".equals(productId) && !productId.equals("null")) {
                    sb.append("AND ");
                    sb.append("product_id = '" + productId + "' ");
                }
                if (statusIds.size() > 0) {
                    sb.append("AND ");
                    sb.append("status_id IN " + strSplitBy(",", statusIds));
                }
//                sb.append(" AND user_id='" + request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString() + "'");
                sb.append(" GROUP BY work_id");

//                System.out.println(sb.toString());

                List<Map> listMap = WorkView.findBySQL(sb.toString()).toMaps();
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                List<Map> newListMap = new ArrayList<Map>();
                for (Map map : listMap) {
                    if (map.get("user_id").toString().equals(request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString())) {
                        map.put("is_edit", true);
                    } else {
                        map.put("is_edit", false);
                    }
                    String createTime = sdf.format(map.get("create_time"));
                    if (map.get("move_in") != null) {
                        String move_in = sdf.format(map.get("move_in"));
                        map.put("move_in", move_in);
                    }
                    if (map.get("move_in_without_out") != null) {
                        String move_in_without_out = sdf.format(map.get("move_in_without_out"));
                        map.put("move_in_without_out", move_in_without_out);
                    }
                    map.remove("create_time");
                    map.put("create_time", createTime);
                    newListMap.add(map);
                }
                return success(newListMap);
            }
        });
    }


    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                Work work = new Work();
                work.fromMap(data);

                if (work.saveIt()) {
                    List<Map> resultList = WorkView.find("work_id=?", data.get("work_id").toString()).toMaps();
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                    for (Map map : resultList) {
                        String createTime = sdf.format(map.get("create_time"));
                        if (map.get("move_in") != null) {
                            String move_in = sdf.format(map.get("move_in"));
                            map.put("move_in", move_in);
                        }
                        map.put("create_time", createTime);
                    }
                    return success(resultList);
                } else {
                    return fail("修改失敗...");
                }
            }
        });
    }
//    @RequestMapping(value = "/updatestatusid", method = RequestMethod.PUT)
//    public RequestResult<?> updateStatusId(@RequestParam("statusId") final String statusId, @RequestBody final Map data) {
//        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
//            @Override
//            public RequestResult<?> operate() {
//                data.remove("staus_id");
//                data.remove("modify_by");
//                data.remove("modify_time");
//                data.put("status_id", statusId);
//                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
//                data.put("modify_time", new Timestamp(System.currentTimeMillis()));
//                Work work = new Work();
//                work.fromMap(data);
//                if (work.saveIt()) {
//                    return success(work.getString("work_id"));
//                } else {
//                    return fail("修改失敗...");
//                }
//            }
//        });
//    }


    public static String strSplitBy(String splitter, List<String> list) {
        String sep = "";
        StringBuilder sb = new StringBuilder("(");

        for (String s : list) {
            sb.append(sep);
            sb.append("\'" + s + "\'");
            sep = splitter;
        }
        sb.append(")");

        return sb.toString();
    }

    @RequestMapping(value = "/calculate", method = RequestMethod.PUT)
    public RequestResult<String> calculateData(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                String workId = data.get("work_id").toString();
                Object useForTrack = data.get("useForTrack");
                String lastGoQuantity = null;
                Double quality = null;
                String lastMoveOut = null;
                String firstMoveIn = null;

                if (useForTrack != null) {
                    System.out.println("useForTrack is " + useForTrack);
                    List<Map> goQuantityData = TrackCalcUtil.getLastGoQuantityFromWorkTracking(workId, useForTrack);
                    for (Map data : goQuantityData) {
                        lastGoQuantity = data.get("go_quantity").toString();
                        quality = Double.valueOf(data.get("OpYeildProduct").toString());
                    }
                } else {
                    String input = data.get("input").toString();
                    List<Map> goQuantityData = TrackCalcUtil.getLastGoQuantityFromWorkTracking(workId);
                    for (Map data : goQuantityData) {
                        lastGoQuantity = data.get("go_quantity").toString();
                        quality = TrackCalcUtil.getQuality(Integer.parseInt(lastGoQuantity), input);
                    }
                }

                List<Map> opDurationData = TrackCalcUtil.getOpDurationFromTracking(workId);
                double opDurationSum = 0;
                for (Map data : opDurationData) {
                    String result = data.get("op_duration").toString();
                    double opDuration = Double.parseDouble(result);
                    opDurationSum += opDuration;
                }
                long opDurationSumSec = (long) (opDurationSum * 60);
                String opDuration = formatOpDuration(opDurationSumSec);

                List<Map> lastMoveOutData = TrackCalcUtil.getLastMoveOutFromTracking(workId);
                for (Map data : lastMoveOutData) {
                    lastMoveOut = data.get("move_out").toString();
                }
                List<Map> firstMoveInData = TrackCalcUtil.getFirstMoveInFromTracking(workId);
                for (Map data : firstMoveInData) {
                    firstMoveIn = data.get("move_in").toString();
                }
                double result = TrackCalcUtil.getOpDuration(firstMoveIn, lastMoveOut);
                String foramtDuration = formatDuration(result);
                log.info("==Work calculate result==");
                log.info("workId : " + workId);
                log.info("lastGoQuantity : " + lastGoQuantity);
                log.info("quality : " + quality);
                log.info("opDuration : " + opDuration);
                log.info("foramtDuration : " + foramtDuration);
                log.info("firstMoveIn : " + firstMoveIn);
                log.info("lastMoveOut : " + lastMoveOut);

                Object modify_by = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "workScheduleAutoCloseCase" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                data.put("go_quantity", lastGoQuantity);
                data.put("quality", TrackCalcUtil.toRound(quality * 100, 2));
                data.put("op_duration", opDuration);
                data.put("duration", foramtDuration);
                data.put("modify_by", modify_by);
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                Work work = new Work();
                work.fromMap(data);

                if (work.saveIt()) {
                    return success(work.getString("work_id"));
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }

    public String formatDuration(double opDuration) {
        long millisecond = (long) (opDuration * 60 * 1000);
        long day = (millisecond / (1000 * 60 * 60)) / 24;
        long hour = (millisecond / (1000 * 60 * 60)) % 24;
        long min = (millisecond / (1000 * 60)) % 60;
        long sec = (millisecond / 1000) % 60;
        return String.format("%02dd %02dh %02dm %02ds", day, hour, min, sec);

    }

    public String formatOpDuration(long second) {
        long hour = second / (60 * 60);
        long min = (second / 60) % 60;
        long sec = second % 60;
        return String.format("%d:%02d:%02d", hour, min, sec);
    }

    List<WorkOpData> getWorkOpData(String workId, String userId, List<ProductOp> list) {
        List<WorkOpData> resultList = new ArrayList<WorkOpData>();
        WorkOpData workData = null;
        for (ProductOp productOp : list) {
            workData = new WorkOpData();
            Timestamp timestamp = new Timestamp(System.currentTimeMillis());
            workData.work_id = workId;
            workData.op = productOp.get("op").toString();
            workData.process_code = productOp.get("process_code").toString();
            workData.qrcode_op = UUID.randomUUID().toString().replace("-", "");
            workData.remark = productOp.get("remark").toString();
            workData.is_open = productOp.get("is_open").toString();
            workData.std_hour = productOp.get("std_hour").toString();
            workData.create_by = userId;
            workData.create_time = timestamp;
            workData.modify_by = userId;
            workData.modify_time = timestamp;
            resultList.add(workData);
        }
        return resultList;
    }

    static class WorkOpData {
        String work_id;
        String op;
        String process_code;
        String qrcode_op;
        String remark;
        String is_open;
        String std_hour;
        String create_by;
        Timestamp create_time;
        String modify_by;
        Timestamp modify_time;

    }
}
