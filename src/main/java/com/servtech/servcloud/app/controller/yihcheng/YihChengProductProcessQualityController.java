package com.servtech.servcloud.app.controller.yihcheng;

import com.servtech.servcloud.app.model.servtrack.view.ProcessQualityView;
import com.servtech.servcloud.app.model.servtrack.view.TrackingDetailView;
import com.servtech.servcloud.app.model.servtrack.view.TrackingNgView;
import com.servtech.servcloud.app.model.yihcheng.Employee;
import com.servtech.servcloud.app.model.yihcheng.WorkTrackingEmployee;
import com.servtech.servcloud.app.model.yihcheng.WorkTrackingMold;
import com.servtech.servcloud.app.model.yihcheng.WorkTrackingTool;
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
 * Created by kevin on 2020/8/7.
 */
@RestController
@RequestMapping("/yihcheng/productprocessquality")
public class YihChengProductProcessQualityController {
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

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
                    String lot_purpose = data.get("lot_purpose") == null ? null : data.get("lot_purpose").toString();
                    String shift = data.get("shift") == null ? null : data.get("shift").toString();
                    String op = data.get("op").toString();
                    String processName = data.get("process_name").toString();
                    String shiftDateStr = data.get("shift_day").toString();
                    String lineId = data.get("line_id").toString();
                    String lineName = data.get("line_name").toString();
                    String workId = data.get("work_id").toString();
                    String pdName = data.get("product_name").toString();
                    String moveIn = data.get("move_in").toString();
                    String moveOut = data.get("move_out").toString();
                    Map<String, String> toolMoldEmpInfo = getToolMoldEmployee(moveIn, lineId, workId, op);
                    String toolId = toolMoldEmpInfo.get("toolId");
                    String moldId = toolMoldEmpInfo.get("moldId");
                    String employeeName = toolMoldEmpInfo.get("employeeName");
                    String output = data.get("output").toString();
                    String goQuantity = data.get("go_quantity").toString();
                    String ngQuantity = data.get("ng_quantity").toString();
                    String quality = data.get("quality").toString();
                    String opQualitySp = data.get("op_quality_sp") == null ? null : data.get("op_quality_sp").toString();

                    Map<String, String> mData = new HashMap<String, String>();
                    mData.put("op", op);
                    mData.put("process_name", processName);
                    mData.put("shift_day", shiftDateStr);
                    mData.put("shift", shift);
                    mData.put("line_name", lineName);
                    mData.put("work_id", workId);
                    mData.put("product_name", pdName);
                    mData.put("move_in", moveIn);
                    mData.put("move_out", moveOut);
                    mData.put("lot_purpose", lot_purpose);
                    mData.put("tool_id", toolId);
                    mData.put("mold_id", moldId);
                    mData.put("employee_name", employeeName);
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

    static Map<String, String> getToolMoldEmployee(String moveIn, String lineId, String workId, String op) {
        Map<String, String> result = new HashMap<>();
        WorkTrackingTool workTrackingTool = WorkTrackingTool.findFirst("move_in = ? and line_id = ? and work_id = ? and op = ?",moveIn, lineId, workId, op);
        String toolId = workTrackingTool == null ? null : workTrackingTool.getString("tool_id");

        WorkTrackingMold workTrackingMold = WorkTrackingMold.findFirst("move_in = ? and line_id = ? and work_id = ? and op = ?",moveIn, lineId, workId, op);
        String moldId = workTrackingMold == null ? null : workTrackingMold.getString("mold_id");

        WorkTrackingEmployee workTrackingEmployee = WorkTrackingEmployee.findFirst("move_in = ? and line_id = ? and work_id = ? and op = ?",moveIn, lineId, workId, op);
        String employeeName = workTrackingEmployee == null ? null : Employee.findById(workTrackingEmployee.getString("employee_id")).getString("emp_name");

        result.put("toolId",toolId);
        result.put("moldId",moldId);
        result.put("employeeName",employeeName);
        return result;
    }
}
