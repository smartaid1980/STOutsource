package com.servtech.servcloud.app.controller.jumpway;

import com.servtech.servcloud.app.controller.servtrack.ServtrackWorkProcessController;
import com.servtech.servcloud.app.controller.servtrack.TrackCalcUtil;
import com.servtech.servcloud.app.model.servtrack.Line;
import com.servtech.servcloud.app.model.servtrack.WorkTrackingNoMoveOut;
import com.servtech.servcloud.app.model.servtrack.view.TrackingDetailView;
import com.servtech.servcloud.app.model.servtrack.view.WorkOpView;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2018/12/12.
 */
@RestController
@RequestMapping("/jumpway/work-process")
public class JumpwayWorkProcessController {
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/readtracking", method = RequestMethod.POST)
    public RequestResult<List<Map>> readTracking(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString() == null ? "" : data.get("startDate").toString();
        final String endDate = data.get("endDate").toString() == null ? "" : data.get("endDate").toString();
        final String workId = data.get("workId") == null ? "" : data.get("workId").toString();
        final List<String> productIds = (List<String>) data.get("productIds");
        final List<String> statusIds = (List<String>) data.get("status");

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                GroupWorkOpData groupWorkOpData = new GroupWorkOpData(startDate, endDate, productIds, statusIds, workId).invoke();
                ServtrackWorkProcessController swpc = groupWorkOpData.getSwpc();
                List<Map> result = groupWorkOpData.getResult();

                for (Map data : result) {
                    String workId = data.get("work_id").toString();
                    String firstMoveIn = swpc.getFirstMoveInFromTracking(workId).get(0).get("move_in").toString();
                    String lastLineName = swpc.getLastMoveInFromTracking(workId).get(0).get("line_name").toString();
                    String lastMoveIn = swpc.getLastMoveInFromTracking(workId).get(0).get("move_in").toString();
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


    @RequestMapping(value = "/getWorkDetail", method = RequestMethod.POST)
    public RequestResult<List<Map>> getWorkDetail(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString() == null ? "" : data.get("startDate").toString();
        final String endDate = data.get("endDate").toString() == null ? "" : data.get("endDate").toString();
        final String workId = data.get("workId") == null ? "" : data.get("workId").toString();
        final List<String> productIds = (List) data.get("productIds");
        final List<String> statusIds = (List) data.get("status");

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                GroupWorkOpData groupWorkOpData = new GroupWorkOpData(startDate, endDate, productIds, statusIds, workId).invoke();
                ServtrackWorkProcessController swpc = groupWorkOpData.getSwpc();
                List<Map> result = groupWorkOpData.getResult();


                List<Map> combineList = new ArrayList<Map>();
                for (Map data : result) {
                    String workId = data.get("work_id").toString();
                    String firstMoveIn = swpc.getFirstMoveInFromTracking(workId).get(0).get("move_in").toString();
                    String lastLineName = swpc.getLastMoveInFromTracking(workId).get(0).get("line_name").toString();
                    String lastMoveIn = swpc.getLastMoveInFromTracking(workId).get(0).get("move_in").toString();
                    String lastGoQuntity = TrackCalcUtil.getLastGoQuantityFromWorkTracking(workId).get(0).get("go_quantity").toString();
                    data.put("first_move_in", firstMoveIn);
                    data.put("last_line_name", lastLineName);
                    data.put("last_move_in", lastMoveIn);
                    data.put("last_go_quntity", lastGoQuntity);
                    combineList.addAll(getProcessDetailData(workId, data));
                }
                return success(combineList);
            }
        });
    }

    @RequestMapping(value = "/getWorkProcessDetail", method = RequestMethod.POST)
    public RequestResult<?> getWorkProcessDetail(@RequestBody final Map data) {
        final String workId = data.get("workId").toString();
        return ActiveJdbc.operTx(() -> {
            try {
                List<Map> result = getProcessTrackingTableData(workId);
                return success(result);
            } catch (Exception e) {
                e.printStackTrace();
                List<Map> empty = new ArrayList<Map>();
                return fail(empty);
            }
        });
    }

    private List<Map> getProcessDetailData(String workId, Map orderData) {
        int responsibilityQuantity = 0;
        int workEQuantity = 0;
        int lastTrackOpGoQuantity = 0;

        //A查目前tracking 工單 工序
        List<Map> groupTrackingOrderByOp = getGroupTracking(workId);

        //B查有無進站未出站的線別紀錄
        Map<String, String> lineId2Name = getLineId2Name();
        Map<String, Map> currentLine = getCurrentLine(lineId2Name, workId);
        //A與B結合
        for (int index = 0; index < groupTrackingOrderByOp.size(); index++) {
            Map data = groupTrackingOrderByOp.get(index);
            String gt_WorkId = data.get("work_id").toString();
            String op = data.get("op").toString();
            String key = gt_WorkId + op;
            //已存在進站的工單工序檢查是否有進佔未出站的資料，有的話apppend進站未出站的線別
            if (currentLine.containsKey(key)) {
                data.put("current_line", currentLine.get(key).get("current_line").toString());
                currentLine.remove(key);
            }
            //第一個工序預估量為工單初始設定
            if (index == 0) {
                workEQuantity = (Integer) data.get("e_quantity");
                responsibilityQuantity = workEQuantity;
            } else {
                //非第一個工序預估量為前一個工序的良品產量
                responsibilityQuantity = ((BigDecimal) groupTrackingOrderByOp.get(index - 1).get("go_quantity")).intValue();
            }

            data.put("responsibility_quantity", responsibilityQuantity);
            //
            if (index == groupTrackingOrderByOp.size() - 1) {
                lastTrackOpGoQuantity = ((BigDecimal) groupTrackingOrderByOp.get(index).get("go_quantity")).intValue();
            }
            if (orderData.size() > 0) {
                data.putAll(orderData);
            }
        }

        //剩下進站未出站資料，則要append到tracking工單工序資料
        if (currentLine.size() > 0) {
            for (Map.Entry<String, Map> entry : currentLine.entrySet()) {
                Map lineData = entry.getValue();
                String lWorkId = lineData.get("work_id").toString();
                String lOp = lineData.get("op").toString();
                lineData.put("e_quantity", workEQuantity);
                lineData.put("go_quantity", 0);

                List<Map> workOpView = WorkOpView.find("work_id = ? AND op = ?", lWorkId, lOp).toMaps();
                lineData.put("process_name", workOpView.get(0).get("process_name").toString());

                lineData.put("responsibility_quantity", lastTrackOpGoQuantity);

                if (orderData.size() > 0) {
                    lineData.putAll(orderData);
                }
                groupTrackingOrderByOp.add(lineData);
            }
        }
        return groupTrackingOrderByOp;
    }

    private List<Map> getProcessTrackingTableData(String workId) {
        int targetQuantity = 0;
        BigDecimal goQuantity = null;
        //A查工單有哪些工序
        List<Map> workOps = queryWorkOps(workId);

        //B查目前工單完成進出站的工序(加總數量)
        Map<String, Map> trackingGroupByWorkIdOp = queryTrackingGroupByWorkIdOp(workId);

        //C查進站未出站的線別紀錄
        Map<String, String> lineId2Name = getLineId2Name();
        Map<String, Map> currentLine = getCurrentLine(lineId2Name, workId);

        //ABC結合
        for (int index = 0; index < workOps.size(); index++) {
            Map data = workOps.get(index);
            String subWorkId = data.get("work_id").toString();
            String op = data.get("op").toString();
            String key = subWorkId + op;

            //已存在進站的工單工序檢查是否有進佔未出站的資料，有的話apppend進站未出站的線別
            if (currentLine.containsKey(key)) {
                data.put("current_line", currentLine.get(key).get("current_line").toString());
            }

            //良品產量
            if (trackingGroupByWorkIdOp.containsKey(key)) {
                goQuantity = (BigDecimal) trackingGroupByWorkIdOp.get(key).get("go_quantity");
            } else {
                goQuantity = BigDecimal.valueOf(0);

            }
            data.put("go_quantity", goQuantity);

            //預估量
            //第一個工序預估量為工單初始設定
            if (index == 0) {
                targetQuantity = (Integer) data.get("e_quantity");
            } else {
                //非第一個工序預估量為前一個工序的良品產量
                Map prvWorkOp = workOps.get(index - 1);
                String prvWorkOpPk = prvWorkOp.get("work_id").toString() + prvWorkOp.get("op").toString();

                if (trackingGroupByWorkIdOp.containsKey(prvWorkOpPk)) {
                    targetQuantity = ((BigDecimal) trackingGroupByWorkIdOp.get(prvWorkOpPk).get("go_quantity")).intValue();
                } else {
                    targetQuantity = 0;
                }
            }
            data.put("responsibility_quantity", targetQuantity);

            int unFinishedTargetQty = targetQuantity - goQuantity.intValue();
            data.put("unFinished_responsibility_quantity", unFinishedTargetQty);

            DecimalFormat df = new DecimalFormat("###.00");
            double finishedRate = (goQuantity.floatValue() / (Integer) data.get("e_quantity")) * 100;
            data.put("finished_rate", Double.parseDouble(df.format(finishedRate)));

            data.put("unFinished_work_quantity", (Integer) data.get("e_quantity") - goQuantity.intValue());
        }
        return workOps;
    }

    public Map<String, Map> getCurrentLine(Map lineId2Name, String workId) {
        StringBuilder moveOutSql = new StringBuilder();
        moveOutSql.append("SELECT tnmo.* FROM a_servtrack_work_tracking t ");
        moveOutSql.append("RIGHT JOIN a_servtrack_tracking_no_move_out tnmo ");
        moveOutSql.append("ON t.move_in = tnmo.move_in ");
        moveOutSql.append("AND ");
        moveOutSql.append("t.line_id = tnmo.line_id ");
        moveOutSql.append("AND ");
        moveOutSql.append("t.work_id = tnmo.work_id ");
        moveOutSql.append("AND ");
        moveOutSql.append("t.op = tnmo.op ");
        moveOutSql.append("WHERE t.work_id IS NULL ");
        moveOutSql.append("AND ");
        moveOutSql.append("tnmo.work_id = '" + workId + "' ");
        moveOutSql.append("GROUP BY tnmo.line_id, tnmo.op");

        Map<String, Map> currentLine = new HashMap();

        List<Map> trackingNoMoveOuts = WorkTrackingNoMoveOut.findBySQL(moveOutSql.toString()).toMaps();
        if (trackingNoMoveOuts.size() > 0) {
            for (Map data : trackingNoMoveOuts) {

                String nmo_workId = data.get("work_id").toString();
                String op = data.get("op").toString();
                String lineId = data.get("line_id").toString();
                String key = nmo_workId + op;

                if (currentLine.containsKey(key)) {
                    StringBuilder linesSb = new StringBuilder();
                    linesSb.append(currentLine.get(key).get("current_line").toString());
                    linesSb.append(",");
                    linesSb.append(lineId2Name.get(lineId).toString());

                    currentLine.get(key).put("current_line", linesSb.toString());
                } else {
                    Map lineData = new HashMap();
                    lineData.put("work_id", nmo_workId);
                    lineData.put("op", op);
                    lineData.put("current_line", lineId2Name.get(lineId).toString());
                    currentLine.put(key, lineData);
                }
            }
        }
        return currentLine;
    }

    public List<Map> getGroupTracking(String workId) {
        StringBuilder trackingSql = new StringBuilder();
        trackingSql.append("SELECT " +
                "work_id, " +
                "e_quantity, " +
                "process_name, " +
                "op, " +
                "SUM(go_quantity) AS go_quantity " +
                "FROM a_servtrack_view_tracking_detail ");
        trackingSql.append("WHERE work_id = '" + workId + "' ");
        trackingSql.append("GROUP BY  work_id, op");

        List<Map> groupTracking = TrackingDetailView.findBySQL(trackingSql.toString()).toMaps();
        return TrackCalcUtil.compareOpOrder(groupTracking);
    }

    public Map<String, Map> queryTrackingGroupByWorkIdOp(String workId) {
        StringBuilder trackingSql = new StringBuilder();
        trackingSql.append("SELECT " +
                "work_id, " +
                "e_quantity, " +
                "process_name, " +
                "op, " +
                "SUM(go_quantity) AS go_quantity " +
                "FROM a_servtrack_view_tracking_detail ");
        trackingSql.append("WHERE work_id = '" + workId + "' ");
        trackingSql.append("GROUP BY  work_id, op");

        List<Map> groupTracking = TrackingDetailView.findBySQL(trackingSql.toString()).toMaps();
        Map result = new HashMap();
        for (Map map : groupTracking) {
            String key = map.get("work_id").toString() + map.get("op").toString();
            result.put(key, map);
        }
        return result;
    }

    public List<Map> queryWorkOps(String workId) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT " +
                "work_id, " +
                "e_quantity, " +
                "process_name, " +
                "op " +
                "FROM a_servtrack_view_work_op ");
        sql.append("WHERE work_id = '" + workId + "' ");

        List<Map> groupTracking = WorkOpView.findBySQL(sql.toString()).toMaps();
        return TrackCalcUtil.compareOpOrder(groupTracking);
    }

    public Map<String, String> getLineId2Name() {
        Map<String, String> lineId2Name = new HashMap();
        List<Map> queryLines = Line.findAll().toMaps();
        for (Map line : queryLines) {
            String lineId = line.get("line_id").toString();
            String lineName = line.get("line_name").toString();
            lineId2Name.put(lineId, lineName);
        }
        return lineId2Name;
    }

    private class GroupWorkOpData {
        private String startDate;
        private String endDate;
        private List<String> productIds;
        private List<String> statusIds;
        private String workId;
        private ServtrackWorkProcessController swpc;
        private List<Map> result;

        public GroupWorkOpData(String startDate, String endDate, List<String> productIds, List<String> statusIds, String workId) {
            this.startDate = startDate;
            this.endDate = endDate;
            this.productIds = productIds;
            this.statusIds = statusIds;
            this.workId = workId;
        }

        public ServtrackWorkProcessController getSwpc() {
            return swpc;
        }

        public List<Map> getResult() {
            return result;
        }

        public GroupWorkOpData invoke() {
            swpc = new ServtrackWorkProcessController();
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
            if (!"".equals(startDate) && !startDate.equals("null") && !"".equals(endDate) && !endDate.equals("null")) {
                sb.append("WHERE ");
                sb.append("(shift_day BETWEEN ");
                sb.append("'" + startDate + " 00:00:00' ");
                sb.append("AND ");
                sb.append("'" + endDate + " 23:59:59' ) ");

                if (productIds != null && productIds.size() > 0) {
                    sb.append("AND ");
                    sb.append("product_id IN " + swpc.strSplitBy(",", productIds));
                }
                if (statusIds.size() > 0) {
                    sb.append("AND ");
                    sb.append("status_id IN " + swpc.strSplitBy(",", statusIds));
                }
            } else {
                if (!"".equals(workId) && !workId.equals("null")) {
                    sb.append("WHERE ");
                    sb.append("work_id = '" + workId + "' ");
                }
            }
            sb.append(" GROUP BY work_id ");
            sb.append("ORDER BY create_time, work_id");
            String sql = sb.toString();

            result = TrackingDetailView.findBySQL(sql).toMaps();
            return this;
        }
    }

}
