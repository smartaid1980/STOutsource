package com.servtech.servcloud.app.controller.servtrack;

import com.servtech.servcloud.app.model.servtrack.view.ProcessQualityView;
import com.servtech.servcloud.app.model.servtrack.view.TrackingDetailView;
import com.servtech.servcloud.app.model.servtrack.view.TrackingNgView;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/7/5.
 */
@RestController
@RequestMapping("/servtrack/productprocessquality")
public class ServtrackProductProcessQualityController {
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/readprocessquality", method = RequestMethod.POST)
    public RequestResult<List<Map>> readProcessQuality(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString();
        final String endDate = data.get("endDate").toString();
        final String productId = data.get("productId").toString();

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT ");
                sb.append("product_id, ");
                sb.append("product_name, ");
                sb.append("op, ");
                sb.append("process_code, ");
                sb.append("process_name, ");
                sb.append("sum(output) AS output, ");
                sb.append("sum(go_quantity) AS go_quantity, ");
                sb.append("sum(ng_quantity) AS ng_quantity, ");
                sb.append("op_quality_sp, ");
                sb.append("shift_day ");
                sb.append("FROM a_servtrack_view_process_quality ");
                sb.append("WHERE ");
                sb.append("(shift_day BETWEEN ");
                sb.append("'" + startDate + "'");
                sb.append("AND ");
                sb.append("'" + endDate + "')");
                sb.append("AND ");
                sb.append("product_id = '" + productId + "' ");
                sb.append("GROUP BY op");
                String sql = sb.toString();
                System.out.println(sql);
                List<Map> result = ProcessQualityView.findBySQL(sql).toMaps();
                for (Map data : result) {
                    data.put("shift_day", data.get("shift_day").toString());
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/readtracking", method = RequestMethod.POST)
    public RequestResult<List<Map>> readtracking(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString();
        final String endDate = data.get("endDate").toString();
        final String productId = data.get("productId").toString();

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_servtrack_view_tracking_detail ");
                sb.append("WHERE ");
                sb.append("(shift_day BETWEEN ");
                sb.append("'" + startDate + "'");
                sb.append("AND ");
                sb.append("'" + endDate + "')");
                sb.append("AND ");
                sb.append("product_id = '" + productId + "' ");
                sb.append("ORDER BY op, shift_day");
                String sql = sb.toString();
                System.out.println(sql);
                List<Map> container = new ArrayList<Map>();
                List<Map> result = TrackingDetailView.findBySQL(sql).toMaps();
                for (Map data : result) {
                        String op = data.get("op").toString();
                        String processName = data.get("process_name").toString();
                        String shiftDateStr = data.get("shift_day").toString();
                        String lineName = data.get("line_name").toString();
                        String workId = data.get("work_id").toString();
                        String pdName = data.get("product_name").toString();
                        String moveIn = data.get("move_in").toString();
                        String moveOut = data.get("move_out").toString();
                        String output = data.get("output").toString();
                        String goQuantity = data.get("go_quantity").toString();
                        String ngQuantity = data.get("ng_quantity").toString();
                        String quality = data.get("quality").toString();
                        String opQualitySp = data.get("op_quality_sp") == null ? null : data.get("op_quality_sp").toString();

                        Map<String, String> mData = new HashMap<String, String>();
                        mData.put("op", op);
                        mData.put("process_name", processName);
                        mData.put("shift_day", shiftDateStr);
                        mData.put("line_name", lineName);
                        mData.put("work_id", workId);
                        mData.put("product_name", pdName);
                        mData.put("move_in", moveIn);
                        mData.put("move_out", moveOut);
                        mData.put("output", output);
                        mData.put("go_quantity", goQuantity);
                        mData.put("ng_quantity", ngQuantity);
                        mData.put("quality", quality);
                        mData.put("op_quality_sp", opQualitySp);
                        container.add(mData);
                }
                return success(container);
            }
        });
    }

    @RequestMapping(value = "/readtrackingng", method = RequestMethod.POST)
    public RequestResult<List<Map>> readTrackingNg(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString();
        final String endDate = data.get("endDate").toString();
        final String productId = data.get("productId").toString();

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT product_id, " +
                        "product_name, " +
                        "op, " +
                        "process_code, " +
                        "process_name, " +
                        "ng_code, " +
                        "ng_name, " +
                        "SUM(ng_quantity) as ng_quantity " +
                        "FROM a_servtrack_view_tracking_ng ");
                sb.append("WHERE ");
                sb.append("(shift_day BETWEEN ");
                sb.append("'" + startDate + "'");
                sb.append("AND ");
                sb.append("'" + endDate + "')");
                sb.append("AND ");
                sb.append("product_id = '" + productId + "' ");
                sb.append("GROUP BY op, ng_code");
                String sql = sb.toString();
                System.out.println(sql);
                List<Map> ngContainer = new ArrayList<Map>();
                List<Map> result = TrackingNgView.findBySQL(sql).toMaps();
                for (Map data : result) {
                    String pdId = data.get("product_id").toString();
                    String pdName = data.get("product_name").toString();
                    String op = data.get("op").toString();
                    String processCode = data.get("process_code").toString();
                    String processName = data.get("process_name").toString();
                    String ngCode = data.get("ng_code").toString();
                    String ngName = data.get("ng_name").toString();
                    String ngQuantity = data.get("ng_quantity").toString();
                    Map<String, String> mData = new HashMap<String, String>();
                    mData.put("product_id", pdId);
                    mData.put("product_name", pdName);
                    mData.put("op", op);
                    mData.put("process_code", processCode);
                    mData.put("process_name", processName);
                    mData.put("ng_code", ngCode);
                    mData.put("ng_name", ngName);
                    mData.put("ng_quantity", ngQuantity);
                    ngContainer.add(mData);
                }
                return success(ngContainer);
            }
        });
    }

}
