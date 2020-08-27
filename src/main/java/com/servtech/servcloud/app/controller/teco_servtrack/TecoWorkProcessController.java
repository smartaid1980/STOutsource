package com.servtech.servcloud.app.controller.teco_servtrack;

import com.servtech.servcloud.app.controller.servtrack.ServtrackWorkProcessController;
import com.servtech.servcloud.app.controller.servtrack.TrackCalcUtil;
import com.servtech.servcloud.app.model.servtrack.view.TrackingDetailView;
import com.servtech.servcloud.app.model.teco.TecoWorkProcessingDetailView;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2018/12/12.
 */
@RestController
@RequestMapping("/teco/servtrack/work-process")
public class TecoWorkProcessController {
    static ServtrackWorkProcessController swpc = new ServtrackWorkProcessController();
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/readtracking", method = RequestMethod.POST)
    public RequestResult<List<Map>> readTracking(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString() == null ? "" : data.get("startDate").toString();
        final String endDate = data.get("endDate").toString() == null ? "" : data.get("endDate").toString();
        final String workId = data.get("workId") == null ? "" : data.get("workId").toString();
        final String productId = data.get("productId") == null ? "" : data.get("productId").toString();
        final List<String> statusIds = (List) data.get("status");

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                GroupWorkOpData groupWorkOpData = new GroupWorkOpData(startDate, endDate, productId, statusIds, workId).invoke();

                List<Map> queryGpWorkOp = groupWorkOpData.getResult();
                List<String> processingsWorkIs = new ArrayList<>();
                List<Map> currentWorkProcessing = getCurrentWorkProcessing(startDate, endDate, productId, statusIds, workId);

                for (Map data : currentWorkProcessing) {
                    String workId = data.get("work_id").toString();
                    processingsWorkIs.add(workId);
                    data.put("first_move_in", data.get("move_in"));
                    data.put("last_line_name", data.get("line_name"));
                }

                List<Map> tempDeleteData = new ArrayList<>();

                for (Map map : queryGpWorkOp) {
                    String workId = map.get("work_id").toString();
                    if (!processingsWorkIs.contains(workId)) {
                        String firstMoveIn = swpc.getFirstMoveInFromTracking(workId).get(0).get("move_in").toString();
                        String lastLineName = swpc.getLastMoveInFromTracking(workId).get(0).get("line_name").toString();
                        map.put("first_move_in", firstMoveIn);
                        map.put("last_line_name", lastLineName);
                    } else {
                        tempDeleteData.add(map);
                    }
                }
                queryGpWorkOp.removeAll(tempDeleteData);

                List<Map> result = Stream.concat(queryGpWorkOp.stream(), currentWorkProcessing.stream()).collect(Collectors.toList());
                return success(result);

            }
        });
    }

    @RequestMapping(value = "/readprocess", method = RequestMethod.POST)
    public RequestResult<List<Map>> readProcess(@RequestBody final Map data) {
        final String workId = data.get("workId") == null ? "" : data.get("workId").toString();
        String startDate = "";
        String endDate = "";
        String productId = null;
        List statusIds = null;
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * ");
                sb.append("FROM a_servtrack_view_tracking_detail ");
                sb.append("WHERE ");
                sb.append("work_id = '" + workId + "' ");
                sb.append("ORDER BY op ASC");

                List<Map> currentWorkProcessing = getCurrentWorkProcessing(startDate, endDate, productId, statusIds, workId);
                for (Map data : currentWorkProcessing) {
                    data.put("move_out", data.get("move_in"));
                }

                String sql = sb.toString();
                List<Map> queryTrackingDetail = TrackingDetailView.findBySQL(sql).toMaps();

                List<Map> result = Stream.concat(queryTrackingDetail.stream(), currentWorkProcessing.stream()).collect(Collectors.toList());

                return success(TrackCalcUtil.compareOpOrder(result));
            }
        });

    }

    public List<Map> getCurrentWorkProcessing(String startDate, String endDate, String productId, List<String> statusIds, String workId) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT ");
        sql.append("* ");
        sql.append("FROM a_servtrack_view_work_processing_detail ");
        if (!"".equals(startDate) && !startDate.equals("null") && !"".equals(endDate) && !endDate.equals("null")) {
            sql.append("WHERE ");
            sql.append("(shift_day BETWEEN ");
            sql.append("'" + startDate + " 00:00:00' ");
            sql.append("AND ");
            sql.append("'" + endDate + " 23:59:59' ) ");

            if (!"".equals(productId) && !productId.equals("null")) {
                sql.append("AND ");
                sql.append("product_id = '" + productId + "' ");
            }
            if (statusIds.size() > 0) {
                sql.append("AND ");
                sql.append("status_id IN " + swpc.strSplitBy(",", statusIds));
            }
        } else {
            if (!"".equals(workId) && !workId.equals("null")) {
                sql.append("WHERE ");
                sql.append("work_id = '" + workId + "' ");
            }
        }
        List<Map> currentWorkProcessing = TecoWorkProcessingDetailView.findBySQL(sql.toString()).toMaps();

        return currentWorkProcessing;
    }

    private class GroupWorkOpData {
        private String startDate;
        private String endDate;
        private String productId;
        private List<String> statusIds;
        private String workId;
        private List<Map> result;

        public GroupWorkOpData(String startDate, String endDate, String productId, List<String> statusIds, String workId) {
            this.startDate = startDate;
            this.endDate = endDate;
            this.productId = productId;
            this.statusIds = statusIds;
            this.workId = workId;
        }

        public List<Map> getResult() {
            return result;
        }

        public GroupWorkOpData invoke() {
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

                if (!"".equals(productId) && !productId.equals("null")) {
                    sb.append("AND ");
                    sb.append("product_id = '" + productId + "' ");
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
