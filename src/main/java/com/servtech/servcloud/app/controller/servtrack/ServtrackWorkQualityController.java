package com.servtech.servcloud.app.controller.servtrack;

import com.servtech.servcloud.app.model.servtrack.Product;
import com.servtech.servcloud.app.model.servtrack.view.TrackingDetailView;
import com.servtech.servcloud.app.model.servtrack.view.WorkQualityView;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/7/4.
 */
@RestController
@RequestMapping("/servtrack/workquality")
public class ServtrackWorkQualityController {
    private final Logger log = LoggerFactory.getLogger(ServtrackProcessController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/readwork", method = RequestMethod.POST)
    public RequestResult<List<Map>> readWork(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString() == null? "" : data.get("startDate").toString();
        final String endDate = data.get("endDate").toString() == null? "" : data.get("endDate").toString();
        final String productId = data.get("productId") == null? "" : data.get("productId").toString();
        final String workId = data.get("workId") == null? "" : data.get("workId").toString();
        final List<String> statusIds = (List)data.get("status");

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_servtrack_view_work_quality ");
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
                sb.append(" GROUP BY work_id");
                String sql = sb.toString();
                System.out.println(sql);

                List<Map> result = WorkQualityView.findBySQL(sql).toMaps();
                for (Map data : result) {
                    if (data.containsKey("op_duration")){
                        String opDuration = data.get("op_duration").toString();
                        data.put("op_duration", opDuration);
                    } else {
                        System.out.println("op_duration is null, work status is '1' or '2'");
                    }
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/readtracking", method = RequestMethod.POST)
    public RequestResult<List<Map>> readTracking(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString();
        final String endDate = data.get("endDate").toString();
        final String workId = data.get("workId") == null? "" : data.get("workId").toString();
        final String productId = data.get("productId") == null? "" : data.get("productId").toString();
        final List<String> statusIds = (List)data.get("status");

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_servtrack_view_tracking_detail ");
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
                String sql = sb.toString();
                System.out.println(sql);
                Map<String,String> opQualitySpContainer = new HashMap<String, String>();

                List<Map> pResult = Product.findAll().toMaps();
                for(Map data : pResult) {
                    String pdId = data.get("product_id").toString();
                    String productQualitySp = data.get("product_quality_sp").toString();
                    opQualitySpContainer.put(pdId, productQualitySp);
                }

                List<Map> result = TrackingDetailView.findBySQL(sql).toMaps();
                for (Map data : result ){
                    String pdId = data.get("product_id").toString();
                    String shiftDateStr = data.get("shift_day").toString();
                    String productQualitySp = opQualitySpContainer.get(pdId).toString();
                    data.put("shift_day", shiftDateStr);
                    data.put("product_quality_sp", productQualitySp);
                }
                return success(result);
            }
        });
    }

    String strSplitBy(String splitter, List<String> list) {
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

}
