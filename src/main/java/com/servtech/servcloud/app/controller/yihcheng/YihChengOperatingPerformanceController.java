package com.servtech.servcloud.app.controller.yihcheng;

import com.servtech.servcloud.app.model.servtrack.view.TrackingDetailView;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.app.controller.yihcheng.YihChengProductProcessQualityController.getToolMoldEmployee;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/7/4.
 */
@RestController
@RequestMapping("/yihcheng/operatingperformance")
public class YihChengOperatingPerformanceController {
    @RequestMapping(value = "/readperformance", method = RequestMethod.POST)
    public RequestResult<List<Map>> readPerformance(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString();
        final String endDate = data.get("endDate").toString();
        final String lineId = data.get("lineId") == null? "" : data.get("lineId").toString();
        final String productId = data.get("productId") == null? "" : data.get("productId").toString();

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_servtrack_view_tracking_detail ");
                sb.append("WHERE ");
                sb.append("(shift_day BETWEEN ");
                sb.append("'" + startDate + " 00:00:00' ");
                sb.append("AND ");
                sb.append("'" + endDate + " 23:59:59' )");
                if (!"".equals(lineId) && !lineId.equals("null")) {
                    sb.append("AND ");
                    sb.append("line_id = '" + lineId + "' ");
                }
                if (!"".equals(productId) && !productId.equals("null")) {
                    sb.append("AND ");
                    sb.append("product_id = '" + productId + "' ");
                }

                String sql = sb.toString();
                List<Map> result = TrackingDetailView.findBySQL(sql).toMaps();
                for (Map data : result) {
                    String shiftDay = data.get("shift_day").toString();
                    data.put("shift_day", shiftDay);

                    //新增資訊
                    String lot_purpose = data.get("lot_purpose") == null ? null : data.get("lot_purpose").toString();
                    String shift = data.get("shift") == null ? null : data.get("shift").toString();
                    String op = data.get("op").toString();
                    String lineId = data.get("line_id").toString();
                    String moveIn = data.get("move_in").toString();
                    Map<String, Object> toolMoldEmpInfo = getToolMoldEmployee(moveIn, lineId, data.get("work_id").toString(), op);
                    Object toolId = toolMoldEmpInfo.get("toolId");
                    Object moldId = toolMoldEmpInfo.get("moldId");
                    Object employeeName = toolMoldEmpInfo.get("employeeName");
                    data.put("shift", shift);
                    data.put("lot_purpose", lot_purpose);
                    data.put("tool_id", toolId);
                    data.put("mold_id", moldId);
                    data.put("employee_name", employeeName);
                }
                return success(result);
            }
        });
    }
}
