package com.servtech.servcloud.app.controller.servtrack;

import com.servtech.servcloud.app.model.servtrack.view.TrackingDetailView;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.servtech.servcloud.core.util.RequestResult.success;
/**
 * Created by Frank on 2017/7/8.
 */
@RestController
@RequestMapping("/servtrack/workprocess")
public class ServtrackWorkProcessController {
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/readtracking", method = RequestMethod.POST)
    public RequestResult<List<Map>> readTracking(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString() == null? "" : data.get("startDate").toString();
        final String endDate = data.get("endDate").toString() == null? "" : data.get("endDate").toString();
        final String productId = data.get("productId") == null? "" : data.get("productId").toString();
        final String workId = data.get("workId") == null? "" : data.get("workId").toString();
        final List<String> statusIds = (List)data.get("status");

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT ");
                sb.append("work_id, ");
                sb.append("shift_day, ");
                sb.append("product_name, ");
                sb.append("e_quantity, ");
                sb.append("input, ");
                sb.append("create_time, ");
                sb.append("user_name, ");
                sb.append("status_id ");
                sb.append("FROM a_servtrack_view_tracking_detail ");
                addQueryTrackingCondition(sb, startDate, endDate, productId, statusIds, workId);
                String sql = sb.toString();

                List<Map> result = TrackingDetailView.findBySQL(sql).toMaps();
                for (Map data : result) {
                    String workId = data.get("work_id").toString();
                    String firstMoveIn = getFirstMoveInFromTracking(workId).get(0).get("move_in").toString();
                    String lastLineName = getLastMoveInFromTracking(workId).get(0).get("line_name").toString();
                    String lastMoveIn = getLastMoveInFromTracking(workId).get(0).get("move_in").toString();
                    String lastGoQuntity = TrackCalcUtil.getLastGoQuantityFromWorkTracking(workId).get(0).get("go_quantity").toString();
                    data.put("first_move_in", firstMoveIn);
                    data.put("last_line_name", lastLineName);
                    data.put("last_move_in", lastMoveIn);
                    data.put("last_go_quntity", lastGoQuntity);
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/readtracking-with-no-move-out", method = RequestMethod.POST)
    public RequestResult<List<Map>> readTrackingWithNoMoveOut(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString() == null? "" : data.get("startDate").toString();
        final String endDate = data.get("endDate").toString() == null? "" : data.get("endDate").toString();
        final String productId = data.get("productId") == null? "" : data.get("productId").toString();
        final String workId = data.get("workId") == null? "" : data.get("workId").toString();
        final List<String> statusIds = (List)data.get("status");

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT ");
                sb.append("work_id, ");
                sb.append("shift_day, ");
                sb.append("product_name, ");
                sb.append("e_quantity, ");
                sb.append("input, ");
                sb.append("create_time, ");
                sb.append("user_name, ");
                sb.append("status_id ");
                sb.append("FROM a_servtrack_view_tracking_detail ");
                addQueryTrackingCondition(sb, startDate, endDate, productId, statusIds, workId);
                String sql = sb.toString();

                List<Map> tracking = TrackingDetailView.findBySQL(sql).toMaps();
                List<String> trackedWorkIds = new ArrayList<>();
                for (Map data : tracking) {
                    String workId = data.get("work_id").toString();
                    String firstMoveIn = getFirstMoveInFromTracking(workId).get(0).get("move_in").toString();
                    String lastLineName = getLastMoveInFromTracking(workId).get(0).get("line_name").toString();
                    String lastMoveIn = getLastMoveInFromTracking(workId).get(0).get("move_in").toString();
                    String lastGoQuntity = TrackCalcUtil.getLastGoQuantityFromWorkTracking(workId).get(0).get("go_quantity").toString();
                    data.put("first_move_in", firstMoveIn);
                    data.put("last_line_name", lastLineName);
                    data.put("last_move_in", lastMoveIn);
                    data.put("last_go_quntity", lastGoQuntity);
                    trackedWorkIds.add(workId);
                }
                List<Map> removedNoMoveOut = new ArrayList<>();
                List<Map> trackingNoMoveOut = Base.findAll(getTrackingNoMoveOutForQuery(startDate, endDate, productId, statusIds, workId));
                for (Map data : trackingNoMoveOut) {
                    String workId = data.get("work_id").toString();
                    if (trackedWorkIds.contains(workId)) {
                        System.out.println(workId);
                        removedNoMoveOut.add(data);
                    } else {
                        System.out.println("_ " + workId);
                        data.put("first_move_in", data.get("move_in"));
                        data.put("last_go_quntity", 0);
                    }
                }
                trackingNoMoveOut.removeAll(removedNoMoveOut);

                List<Map> result = Stream.of(tracking, trackingNoMoveOut)
                        .flatMap(x -> x.stream())
                        .collect(Collectors.toList());

                return success(result);
            }
        });
    }

    private void addQueryTrackingCondition(StringBuilder sb, String startDate, String endDate, String productId, List<String> statusIds, String workId) {
        if (!"".equals(startDate) && !startDate.equals("null") && !"".equals(endDate) && !endDate.equals("null") ) {
            sb.append("WHERE ");
            sb.append("(shift_day BETWEEN ");
            sb.append("'" + startDate + " 00:00:00' ");
            sb.append("AND ");
            sb.append("'" + endDate + " 23:59:59' ) ");

            if (!"".equals(productId) && !productId.equals("null")) {
                sb.append("AND ");
                sb.append("product_id = '" + productId + "' ");
            }

            if (statusIds.size() > 0) {
                sb.append("AND ");
                sb.append("status_id IN " + strSplitBy(",", statusIds));
            }
        } else {
            if (!"".equals(workId) && !workId.equals("null")) {
                sb.append("WHERE ");
                sb.append("work_id = '" + workId + "' ");
            }
        }
        sb.append(" GROUP BY work_id ");
        sb.append("ORDER BY create_time, work_id");
    }

    @RequestMapping(value = "/readprocess", method = RequestMethod.POST)
    public RequestResult<List<Map>> readProcess(@RequestBody final Map data) {
        final String workId = data.get("workId") == null ? "" : data.get("workId").toString();

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * ");
                sb.append("FROM a_servtrack_view_tracking_detail ");
                sb.append("WHERE ");
                sb.append("work_id = '" + workId + "' ");
                sb.append("ORDER BY op ASC");

                String sql = sb.toString();
                List<Map> result = TrackingDetailView.findBySQL(sql).toMaps();
                return success(TrackCalcUtil.compareOpOrder(result));
            }
        });
    }

    @RequestMapping(value = "/trackingall", method = RequestMethod.POST)
    public RequestResult<List<Map>> readtrackingall(@RequestBody final Map data) {
        final String workId = data.get("workId") == null ? "" : data.get("workId").toString();

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                //A進出站紀錄
                List<Map> onlyTracking = Base.findAll(getOnlyTrackingSql(workId));
                //B進站未出站記錄
                List<Map> trackingNoMoveOut = Base.findAll(getTrackingNoMoveOutSql(workId));
                //A+B合併
                List<Map> tracking = Stream.of(onlyTracking, trackingNoMoveOut)
                        .flatMap(x -> x.stream())
                        .collect(Collectors.toList());

                List<Map> trackedOp = new ArrayList<>();
                //C移除已報工的工序，留下沒有報工的工序資料
                List<Map> workOps = Base.findAll("SELECT work_id, op, process_name, duration AS work_duration, go_quantity AS work_go_quantity FROM a_servtrack_view_work_op WHERE work_id = ?", workId);
                for (Map map : tracking) {
                    String op = map.get("op").toString();
                    for (Map workOp : workOps) {
                        if (workOp.get("op").equals(op)) {
                            trackedOp.add(workOp);
                        } else if(!workOp.containsKey("move_in")){
                            workOp.put("move_in", null);
                            workOp.put("move_out", null);
                        }
                    }
                }
                workOps.removeAll(trackedOp);
                //A+B+C 合併
                List<Map> trackingAll = Stream.of(tracking, workOps)
                        .flatMap(x -> x.stream())
                        .collect(Collectors.toList());
                //依照op自然排序
                List<Map> result = TrackCalcUtil.compareOpOrder(trackingAll);
                return success(result);
            }
        });
    }

    public List<Map> getFirstMoveInFromTracking(String workId) {
        StringBuilder sb = new StringBuilder();
        sb.append("SELECT work_id, move_in, line_name FROM a_servtrack_view_tracking_detail ");
        sb.append("WHERE ");
        sb.append("work_id = '" + workId + "' ");
        sb.append("ORDER BY move_in ASC LIMIT 0,1");
        String sql = sb.toString();
        return TrackingDetailView.findBySQL(sql).toMaps();
    }

    public List<Map> getLastMoveInFromTracking(String workId) {
        StringBuilder sb = new StringBuilder();
        sb.append("SELECT work_id, move_in, line_name, go_quantity FROM a_servtrack_view_tracking_detail ");
        sb.append("WHERE ");
        sb.append("work_id = '" + workId + "' ");
        sb.append("ORDER BY move_in DESC LIMIT 0,1");
        String sql = sb.toString();
        return TrackingDetailView.findBySQL(sql).toMaps();
    }

    public String strSplitBy(String splitter, List<String> list) {
        if (list.size() == 0) {
            String emptySqlSyntax = "('')";
            return emptySqlSyntax;
        }
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
    public String getOnlyTrackingSql(String workId) {
        StringBuilder sb = new StringBuilder();
        sb.append("SELECT ");
        sb.append("t.work_id, ");
        sb.append("t.op, ");
        sb.append("vwo.process_name, ");
        sb.append("t.move_in, ");
        sb.append("t.move_out, ");
        sb.append("vwo.go_quantity AS work_go_quantity, ");
        sb.append("vwo.duration AS work_duration ");
        sb.append("FROM a_servtrack_work_tracking t ");
        sb.append("INNER JOIN a_servtrack_view_work_op vwo ");
        sb.append("ON t.work_id = vwo.work_id ");
        sb.append("and t.op = vwo.op ");
        sb.append("WHERE ");
        sb.append("t.work_id = '" + workId + "'");
        return sb.toString();
    }
    public String getTrackingNoMoveOutSql(String workId) {
        StringBuilder sb = new StringBuilder();
        sb.append("SELECT ");
        sb.append("tnmo.work_id, ");
        sb.append("tnmo.op, ");
        sb.append("vwo.process_name, ");
        sb.append("tnmo.move_in, ");
        sb.append("t.move_out, ");
        sb.append("vwo.go_quantity AS work_go_quantity, ");
        sb.append("vwo.duration AS work_duration ");
        sb.append("FROM a_servtrack_work_tracking t ");
        sb.append("RIGHT JOIN a_servtrack_tracking_no_move_out tnmo ");
        sb.append("ON t.move_in = tnmo.move_in ");
        sb.append("AND t.line_id = tnmo.line_id ");
        sb.append("AND t.work_id = tnmo.work_id ");
        sb.append("AND t.op = tnmo.op ");
        sb.append("INNER JOIN a_servtrack_view_work_op vwo ");
        sb.append("ON tnmo.work_id = vwo.work_id ");
        sb.append("and tnmo.op = vwo.op ");
        sb.append("WHERE t.move_out IS NULL ");
        sb.append("AND tnmo.work_id = '" + workId + "'");
        return sb.toString();
    }

    public String getTrackingNoMoveOutForQuery(String startDate, String endDate, String productId, List<String> statusIds, String workId) {
        StringBuilder sb = new StringBuilder();
        sb.append("SELECT ");
        sb.append("tnmo.work_id, ");
        sb.append("vwo.product_name, ");
        sb.append("vwo.create_time, ");
        sb.append("u.user_name, ");
        sb.append("tnmo.move_in, ");
        sb.append("vwo.e_quantity, ");
        sb.append("vwo.status_id ");

        sb.append("FROM a_servtrack_work_tracking t ");
        sb.append("RIGHT JOIN a_servtrack_tracking_no_move_out tnmo ");
        sb.append("ON t.move_in = tnmo.move_in ");
        sb.append("AND t.line_id = tnmo.line_id ");
        sb.append("AND t.work_id = tnmo.work_id ");
        sb.append("AND t.op = tnmo.op ");

        sb.append("INNER JOIN a_servtrack_view_work_op vwo ");
        sb.append("ON tnmo.work_id = vwo.work_id ");
        sb.append("and tnmo.op = vwo.op ");

        sb.append("INNER JOIN m_sys_user u ");
        sb.append("on vwo.create_by = u.user_id ");

        sb.append("WHERE t.move_out IS NULL ");
        sb.append("AND ");

        if (!"".equals(startDate) && !startDate.equals("null") && !"".equals(endDate) && !endDate.equals("null") ) {
            sb.append("(tnmo.move_in BETWEEN ");
            sb.append("'" + startDate + " 00:00:00' ");
            sb.append("AND ");
            sb.append("'" + endDate + " 23:59:59' ) ");

            if (!"".equals(productId) && !productId.equals("null")) {
                sb.append("AND ");
                sb.append("vwo.product_id = '" + productId + "' ");
            }

            if (statusIds.size() > 0) {
                sb.append("AND ");
                sb.append("vwo.status_id IN " + strSplitBy(",", statusIds));
            }
        } else {
            if (!"".equals(workId) && !workId.equals("null")) {
                sb.append("tnmo.work_id = '" + workId + "' ");
            }
        }
        sb.append(" GROUP BY tnmo.work_id ");
        sb.append("ORDER BY vwo.create_time, tnmo.work_id");

        return sb.toString();
    }

}
