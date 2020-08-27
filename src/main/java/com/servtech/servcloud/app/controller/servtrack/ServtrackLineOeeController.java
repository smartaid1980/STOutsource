package com.servtech.servcloud.app.controller.servtrack;

import com.servtech.servcloud.app.model.servtrack.view.LineOeeView;
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
@RequestMapping("/servtrack/lineoee")
public class ServtrackLineOeeController {

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/readoee", method = RequestMethod.POST)
    public RequestResult<List<Map>> readOee(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString();
        final String endDate = data.get("endDate").toString();
        final String lineId = data.get("lineId") == null? "" : data.get("lineId").toString();
        final String processCode = data.get("processCode") == null? "" : data.get("processCode").toString();

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_servtrack_view_day_detail ");
                sb.append("WHERE ");
                sb.append("(shift_day BETWEEN ");
                sb.append("'" + startDate + "'");
                sb.append("AND ");
                sb.append("'" + endDate + "') ");
                if (!"".equals(lineId) && !lineId.equals("null")) {
                    sb.append("AND ");
                    sb.append("line_id = '" + lineId + "' ");
                    sb.append("GROUP BY shift_day ");
                }
                if (!"".equals(processCode) && !processCode.equals("null")) {
                    sb.append("AND ");
                    sb.append("line_id IN (SELECT line_id FROM a_servtrack_view_day_detail ");
                    sb.append("WHERE ");
                    sb.append("process_code = '" + processCode + "') ");
                    sb.append("GROUP BY line_id, shift_day ");
                }
                sb.append("ORDER BY shift_day");

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
}
