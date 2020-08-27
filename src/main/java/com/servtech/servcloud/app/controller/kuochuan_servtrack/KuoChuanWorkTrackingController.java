package com.servtech.servcloud.app.controller.kuochuan_servtrack;

import com.servtech.servcloud.app.model.kuochuan_servtrack.view.KcWorkTrackingView;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.app.controller.servtrack.ServtrackWorkController.strSplitBy;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/7/4.
 */
@RestController
@RequestMapping("/kuochuan/servtrack/worktracking")
public class KuoChuanWorkTrackingController {
    @RequestMapping(value = "/read", method = RequestMethod.POST)
    public RequestResult<List<Map>> read(@RequestBody final Map data) {
        final String startDate = data.get("startDate") == null? "" : data.get("startDate").toString();
        final String endDate = data.get("endDate") == null? "" : data.get("endDate").toString();;
        final List<String> productIds = (List)data.get("product_ids");
        final String lineId = data.get("line_id") == null? "" : data.get("line_id").toString();
        final String staffId = data.get("staff_id") == null? "" : data.get("staff_id").toString();
        final String productTypeId = data.get("product_type_id") == null? "" : data.get("product_type_id").toString();

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_kuochuan_servtrack_view_tracking_detail ");
                sb.append("WHERE ");

                if (!"".equals(startDate) && !startDate.equals("null") && !"".equals(endDate) && !endDate.equals("null") ) {
                    sb.append("(shift_day BETWEEN ");
                    sb.append("'" + startDate + " 00:00:00' ");
                    sb.append("AND ");
                    sb.append("'" + endDate + " 23:59:59' )");
                    sb.append("AND ");
                }

                if (!"".equals(lineId) && !lineId.equals("null")) {
                    sb.append("line_id = '" + lineId + "' ");
                    sb.append("AND ");
                }
                if (productIds.size() > 0) {
                    sb.append("product_id IN " + strSplitBy(",", productIds));
                    sb.append("AND ");
                }
                if (!"".equals(staffId) && !staffId.equals("null")) {
                    sb.append("staff_id = '" + staffId + "' ");
                    sb.append("AND ");
                }
                if (!"".equals(productTypeId) && !productTypeId.equals("null")) {
                    sb.append("product_type_id = '" + productTypeId + "' ");
                    sb.append("AND ");
                }
                sb.append("is_valid not IN('N') ");

                String sql = sb.toString();
                System.out.println(sql);
                List<Map> result = KcWorkTrackingView.findBySQL(sql).toMaps();
                for (Map data : result) {
                    String shiftDay = data.get("shift_day").toString();
                    data.put("shift_day", shiftDay);
                }
                return success(result);
            }
        });
    }
}
