package com.servtech.servcloud.app.controller.kuochuan_servtrack;

import com.servtech.servcloud.app.controller.servtrack.ServtrackProcessController;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

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
 * Created by Raynard on 2017/8/18.
 */
@RestController
@RequestMapping("/kuochuan/servtrack/work")
public class KuoChuanWorkController {
    private final Logger log = LoggerFactory.getLogger(ServtrackProcessController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        try{
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
                    StringBuilder queryProductStr = new StringBuilder();

                    queryProductStr.append("SELECT * FROM a_kuochuan_servtrack_view_product_op ");
                    queryProductStr.append("WHERE ");
                    queryProductStr.append("product_id='" + product_id + "' ");
                    queryProductStr.append("AND ");
                    queryProductStr.append("is_open = 'Y'");
                    System.out.println(queryProductStr);
                    List<Map> productList = Base.findAll(queryProductStr.toString());
                    System.out.println("productList");
                    System.out.println(productList);


                    StringBuilder workOpSql = new StringBuilder();
                    workOpSql.append("INSERT INTO a_servtrack_work_op ( ");
                    workOpSql.append("work_id, op, process_code, qrcode_op, remark, is_open, std_hour, create_by, create_time, modify_by, modify_time ) ");
                    workOpSql.append("VALUES (?,?,?,?,?,?,?,?,?,?,?)");
                    PreparedStatement ps = Base.startBatch(workOpSql.toString());

                    StringBuilder kcOpSql = new StringBuilder();
                    kcOpSql.append("INSERT INTO a_kuochuan_servtrack_work_op ( ");
                    kcOpSql.append("work_id, op, process_step ) ");
                    kcOpSql.append("VALUES (?,?,?)");
                    PreparedStatement ps2 = Base.startBatch(kcOpSql.toString());

                    String user_id = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    List<WorkOpData> workOpDataList = getWorkOpData(data.get("work_id").toString(), user_id, productList);
                    System.out.println("workOpDataList");
                    System.out.println(workOpDataList);
                    if (workOpDataList.size() > 0) {
                        for (WorkOpData opData : workOpDataList) {
                            System.out.println("opData");
                            System.out.println(opData);
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
                            System.out.println();
                            System.out.println(opData.work_id);
                            System.out.println(opData.op);
                            Base.addBatch(ps2,
                                    opData.work_id,
                                    opData.op,
                                    opData.process_step);

                        }
                    }
                    System.out.println("111");
                    Base.executeBatch(ps);
                    System.out.println("222");
                    Base.executeBatch(ps2);
                    System.out.println("333");
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
        final String workId = data.get("workId") == null? "" : data.get("workId").toString();
        final String productId = data.get("productId") == null? "" : data.get("productId").toString();
        final List<String> statusIds = (List)data.get("status");



        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                StringBuilder sb = new StringBuilder();

                sb.append("SELECT a.*, b.process_step FROM a_servtrack_view_work as a, a_kuochuan_servtrack_product_op b ");
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
                    sb.append("b.product_id = '"+ productId +"' ");
                }
                if (statusIds.size() > 0) {
                    sb.append("AND ");
                    sb.append("status_id IN " + strSplitBy(",", statusIds));
                }
                sb.append("AND ");
                sb.append("work_id NOT IN ('INVALID_WORK') ");
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
                    if (map.get("move_in") !=null) {
                        String move_in = sdf.format(map.get("move_in"));
                        map.put("move_in", move_in);
                    }
                    if (map.get("move_in_without_out") !=null) {
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


    List<WorkOpData> getWorkOpData (String workId, String userId, List<Map> list) {
        List<WorkOpData> resultList = new ArrayList<WorkOpData>();
        WorkOpData workData = null;
        for (Map productOp : list) {
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
            workData.process_step = productOp.get("process_step").toString();
            resultList.add(workData);
        }
        return resultList;
    }

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
        String process_step;

    }

}
