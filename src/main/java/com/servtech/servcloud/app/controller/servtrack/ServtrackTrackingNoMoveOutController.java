package com.servtech.servcloud.app.controller.servtrack;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2019/5/10.
 */
@RestController
@RequestMapping("/servtrack/tracking-no-move-out")
public class ServtrackTrackingNoMoveOutController {
    @RequestMapping(value = "/find", method = RequestMethod.POST)
    public RequestResult<List<Map>> readPerformance(@RequestBody final Map data) {
        final String workId = data.get("work_id") == null ? "" : data.get("work_id").toString();
        final String lineId = data.get("line_id") == null ? "" : data.get("line_id").toString();
        final String productId = data.get("product_id") == null ? "" : data.get("product_id").toString();

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                System.out.println(data);
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT tnmo.*, p.product_id ");
                sb.append("FROM a_servtrack_view_tracking_detail t ");
                sb.append("RIGHT JOIN a_servtrack_tracking_no_move_out tnmo ");
                sb.append("ON t.move_in = tnmo.move_in ");
                sb.append("AND t.line_id = tnmo.line_id ");
                sb.append("AND t.work_id = tnmo.work_id ");
                sb.append("AND t.op = tnmo.op ");
                sb.append("INNER JOIN a_servtrack_work w ON tnmo.work_id = w.work_id ");
                sb.append("INNER JOIN a_servtrack_product p ON p.product_id = w.product_id ");
                sb.append("WHERE t.move_in IS NULL ");
                if (!"".equals(workId) && !workId.equals("null")) {
                    sb.append("AND ");
                    sb.append("tnmo.work_id = '" + workId + "' ");
                }
                if (!"".equals(lineId) && !lineId.equals("null")) {
                    sb.append("AND ");
                    sb.append("tnmo.line_id = '" + lineId + "' ");
                }
                if (!"".equals(productId) && !productId.equals("null")) {
                    sb.append("AND ");
                    sb.append("p.product_id = '" + productId + "' ");
                }

                String sql = sb.toString();
                List<Map> result = Base.findAll(sql);
                return success(result);
            }
        });
    }
}
