package com.servtech.servcloud.app.controller.kuochuan_servtrack;

import com.servtech.servcloud.app.model.kuochuan_servtrack.ShouldWork;
import com.servtech.servcloud.app.model.kuochuan_servtrack.Staff;
import com.servtech.servcloud.app.model.kuochuan_servtrack.view.EmpPerformanceView;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.app.controller.servtrack.ServtrackWorkController.strSplitBy;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.POST;


/**
 * Created by Frank on 2017/7/25.
 */

@RestController
@RequestMapping("/kuochuan/servtrack/empperformance")
public class KuoChuanEmpPerformanceController {
    private static final Logger log = LoggerFactory.getLogger(KuoChuanEmpPerformanceController.class);


    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/read", method = POST)
    public RequestResult<List<Map>> read(@RequestBody final Map data) {
        final String shift_day = data.get("shift_day").toString();
        final List<String> productIds = (List)data.get("product_ids");
        final String staffId = data.get("staff_id") == null? "" : data.get("staff_id").toString();
        final String productTypeId = data.get("product_type_id") == null? "" : data.get("product_type_id").toString();
        final String addMangerWageCondition = data.get("addMangerWageCondition") == null? "" : data.get("addMangerWageCondition").toString();

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_kuochuan_servtrack_view_emp_performance ");
                sb.append("WHERE ");
                sb.append("shift_day = '" + shift_day + "' ");
                if (productIds.size() > 0) {
                    sb.append("AND ");
                    sb.append("product_id IN " + strSplitBy(",", productIds));
                }
                if (!"".equals(staffId) && !staffId.equals("null")) {
                    sb.append("AND ");
                    sb.append("staff_id = '" + staffId + "' ");
                }
                if (!"".equals(productTypeId) && !productTypeId.equals("null")) {
                    sb.append("AND ");
                    sb.append("product_type_id = '" + productTypeId + "' ");
                }
                String sql = sb.toString();
                System.out.println(sql);
                List<Map> result = EmpPerformanceView.findBySQL(sql).toMaps();

                //產品類型查詢有addMangerWageCondition條件，而且加入該線主管薪資計算單件平均成本
                if (!"".equals(addMangerWageCondition) && !addMangerWageCondition.equals("null") && addMangerWageCondition.equals("1")) {
                    for (Map mData : result) {
                        //找到主管名子與時薪
                        String manger_id = mData.get("manger_id").toString();
                        Staff staff = Staff.findFirst("staff_id = ?", manger_id);
                        String manager_name = staff.getString("staff_name");
                        int manager_wage = staff.getInteger("staff_wage");

                        //找主管每日應上班時間
                        ShouldWork shouldWork = ShouldWork.findFirst("staff_id = ? AND shift_day = ?", manger_id, shift_day);

                        float working_hour;
                        if (shouldWork == null) {
                            working_hour = 0;
                        } else {
                            working_hour = shouldWork.getFloat("working_hour");
                        }
                        mData.put("manager_name", manager_name);
                        mData.put("manager_wage", manager_wage);
                        mData.put("working_hour", working_hour);
                    }
                } else {
                    //綜合查詢沒有addMangerWageCondition，不加入該線主管薪資計算單件平均成本，主管時薪與每日上班時間代0
                    for (Map mData : result) {
                        String manger_id = mData.get("manger_id").toString();
                        Staff staff = Staff.findFirst("staff_id = ?", manger_id);
                        String manager_name = staff.getString("staff_name");
                        mData.put("manager_name", manager_name);
                        mData.put("manager_wage", 0);
                        mData.put("working_hour", 0.0);
                    }
                }
                return success(result);
            }
        });
    }
}

