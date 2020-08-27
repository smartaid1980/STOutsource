package com.servtech.servcloud.app.controller.kuochuan_servtrack;

import com.servtech.servcloud.app.model.servtrack.view.LineOeeView;
import com.servtech.servcloud.app.model.servtrack.view.TrackingDetailView;
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
 * Created by Frank on 2017/7/7.
 */
@RestController
@RequestMapping("/kuochuan/servtrack/oee")
public class KuoChuanOeeController {

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/readoee", method = RequestMethod.POST)
    public RequestResult<List<Map>> readOee(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString();
        final String endDate = data.get("endDate").toString();
        final String lineId = data.get("line_id") == null? "" : data.get("line_id").toString();
        final String processCode = data.get("process_code") == null? "" : data.get("process_code").toString();

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_servtrack_view_day_detail ");
                sb.append("WHERE ");
                sb.append("(shift_day BETWEEN ");
                sb.append("'" + startDate + "'");
                sb.append("AND ");
                sb.append("'" + endDate + "')");
                if (!"".equals(lineId) && !lineId.equals("null")) {
                    sb.append("AND ");
                    sb.append("line_id = '" + lineId + "' ");
                    sb.append("GROUP BY line_id, shift_day ");
                }
                if (!"".equals(processCode) && !processCode.equals("null")) {
                    sb.append("AND ");
                    sb.append("process_code = '" + processCode + "' ");
                    sb.append("GROUP BY line_id, process_code, shift_day ");
                }
                String sql = sb.toString();
                System.out.println(sql);
                List<Map> result = LineOeeView.findBySQL(sql).toMaps();
                for (Map data : result) {
                    data.put("shift_day", data.get("shift_day").toString());
                }

                return success(result);
            }
        });
    }

    @RequestMapping(value = "/readtracking", method = RequestMethod.POST)
    public RequestResult<List<Map>> readTracking(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString();
        final String endDate = data.get("endDate").toString();
        final String lineId = data.get("line_id") == null? "" : data.get("line_id").toString();

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
                if (!"".equals(lineId) && !lineId.equals("null")) {
                    sb.append("AND ");
                    sb.append("line_id = '" + lineId + "' ");
                }
                sb.append("ORDER BY move_in ASC");
                String sql = sb.toString();

                List<Map> result = TrackingDetailView.findBySQL(sql).toMaps();
                for (Map data : result) {
                    data.put("shift_day", data.get("shift_day").toString());
                }
                return success(result);
            }
        });
    }
}
