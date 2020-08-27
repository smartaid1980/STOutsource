package com.servtech.servcloud.app.controller.yihcheng;

import com.servtech.servcloud.app.controller.servtrack.ServtrackProcessController;
import com.servtech.servcloud.app.model.servtrack.Product;
import com.servtech.servcloud.app.model.servtrack.view.TrackingDetailView;
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

import static com.servtech.servcloud.app.controller.yihcheng.YihChengProductProcessQualityController.getToolMoldEmployee;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Kevin on 2020/8/7.
 */
@RestController
@RequestMapping("/yihcheng/workquality")
public class YihChengWorkQualityController {
    private final Logger log = LoggerFactory.getLogger(ServtrackProcessController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

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
//                Map<String,String> opQualitySpContainer = new HashMap<String, String>();

//                List<Map> pResult = Product.findAll().toMaps();
//                for(Map data : pResult) {
//                    String pdId = data.get("product_id").toString();
//                    String productQualitySp = data.get("product_quality_sp").toString();
//                    opQualitySpContainer.put(pdId, productQualitySp);
//                }

                List<Map> result = TrackingDetailView.findBySQL(sql).toMaps();
                for (Map data : result ){
                    String pdId = data.get("product_id").toString();
                    String shiftDateStr = data.get("shift_day").toString();
//                    String productQualitySp = opQualitySpContainer.get(pdId).toString();
                    String productQualitySp = Product.findFirst("product_id = ?", pdId).getString("product_quality_sp");
                    data.put("shift_day", shiftDateStr);
                    data.put("product_quality_sp", productQualitySp);

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

    private String strSplitBy(String splitter, List<String> list) {
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
