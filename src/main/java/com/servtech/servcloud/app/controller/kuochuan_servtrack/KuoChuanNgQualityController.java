package com.servtech.servcloud.app.controller.kuochuan_servtrack;

import com.servtech.servcloud.app.model.kuochuan_servtrack.view.NgQualityView;
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
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/7/5.
 */
@RestController
@RequestMapping("/kuochuan/servtrack/ngquality")
public class KuoChuanNgQualityController {
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/readngquality", method = RequestMethod.POST)
    public RequestResult<List<Map>> readProcessQuality(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString();
        final String endDate = data.get("endDate").toString();
        final String processCode = data.get("process_code").toString();
        final String productTypeId = data.get("product_type_id") == null? "" : data.get("product_type_id").toString();
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT ");
                sb.append("product_id, ");
                sb.append("product_name, ");
                sb.append("product_type_id ");
                sb.append("op, ");
                sb.append("process_code, ");
                sb.append("process_name, ");
                sb.append("process_quality, ");
                sb.append("sum(output) AS output, ");
                sb.append("sum(go_quantity) AS go_quantity, ");
                sb.append("sum(ng_quantity) AS ng_quantity, ");
                sb.append("op_quality_sp, ");
                sb.append("shift_day ");
                sb.append("FROM a_kuochuan_servtrack_view_ng_quality ");
                sb.append("WHERE ");
                sb.append("(shift_day BETWEEN ");
                sb.append("'" + startDate + "'");
                sb.append("AND ");
                sb.append("'" + endDate + "')");
                sb.append("AND ");
                sb.append("process_code = '" + processCode + "' ");
                if (!"".equals(productTypeId) && !productTypeId.equals("null")) {
                    sb.append("AND ");
                    sb.append("product_type_id = '" + productTypeId + "' ");
                    sb.append("GROUP BY product_type_id, process_code, shift_day");
                } else {
                    sb.append("GROUP BY process_code, shift_day");
                }
                String sql = sb.toString();
                System.out.println(sql);
                List<Map> result = NgQualityView.findBySQL(sql).toMaps();
                for (Map data : result ){
                    data.put("shift_day", data.get("shift_day").toString());
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/readtrackingng", method = RequestMethod.POST)
    public RequestResult<List<Map>> readTrackingNg(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString();
        final String endDate = data.get("endDate").toString();
        final String processCode = data.get("process_code").toString();
        final String productTypeId = data.get("product_type_id") == null? "" : data.get("product_type_id").toString();

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
                        "FROM (SELECT tn.*, kcp.product_type_id FROM a_servtrack_view_tracking_ng tn " +
                        "INNER JOIN a_kuochuan_servtrack_product kcp ON tn.product_id = kcp.product_id) AS a ");
                sb.append("WHERE ");
                sb.append("(shift_day BETWEEN ");
                sb.append("'" + startDate + "'");
                sb.append("AND ");
                sb.append("'" + endDate + "')");
                if (!"".equals(productTypeId) && !productTypeId.equals("null")) {
                    sb.append("AND ");
                    sb.append("product_type_id = '" + productTypeId + "' ");
                }
                sb.append("AND ");
                sb.append("process_code = '" + processCode + "' ");
                sb.append("GROUP BY ng_code");
                String sql = sb.toString();
                System.out.println(sql);
                List<Map> result = TrackingNgView.findBySQL(sql).toMaps();
                
                return success(result);
            }
        });
    }

}
