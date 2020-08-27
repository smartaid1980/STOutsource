package com.servtech.servcloud.app.controller.iiot;

import com.servtech.servcloud.app.controller.chengshiu.ChengShiuAlertLog;
import com.servtech.servcloud.app.model.iiot.IiotMachineToolMergeRecord;
import com.servtech.servcloud.app.model.iiot.IiotToolTracking;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Jenny on 2017/11/24.
 */
@RestController
@RequestMapping("/iiot/tool/report")
public class IiotToolReportController {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(ChengShiuAlertLog.class);
    final String syncErpBatPath = "C:/Servtech/Servolution/Platform/IiotToolErpSync";
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;


    @RequestMapping(value = "/queryToolTracking", method = RequestMethod.GET)
    public RequestResult<?> queryToolTracking(@RequestParam String startDate, @RequestParam String endDate, @RequestParam String machineId, @RequestParam String ncName) {

        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_iiot_tool_tracking ");
                sb.append("WHERE ");
                sb.append("(move_in BETWEEN ");
                sb.append("'" + startDate + " 00:00:00' ");
                sb.append("AND ");
                sb.append("'" + endDate + " 23:59:59' ) ");
                if (!machineId.equals("null") && !machineId.equals("")) {
                    sb.append("AND ");
                    sb.append("machine_id = '" + machineId + "' ");
                }if (!ncName.equals("null") && !ncName.equals("")) {
                    sb.append("AND ");
                    sb.append("nc_name = '" + ncName + "' ");
                }
                List<Map> result = IiotToolTracking.findBySQL(sb.toString()).toMaps();
                SimpleDateFormat datetimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                for (Map data : result) {
                    data.put("move_in", datetimeFormat.format(data.get("move_in")));
                    data.put("move_out", data.get("move_out") == null ? null : datetimeFormat.format(data.get("move_out")));
                }
                return success(result);
            }
        });
    }


    @RequestMapping(value = "/queryTrackingResume", method = RequestMethod.GET)
    public RequestResult<?> queryTrackingResume(
            @RequestParam String startDate, @RequestParam String endDate,
            @RequestParam String machineId, @RequestParam String toolCode, @RequestParam String holderId) {

        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_iiot_machine_tool_merge_record ");
                sb.append("WHERE ");
                sb.append("((work_start_time BETWEEN ");
                sb.append("'" + startDate + " 00:00:00' ");
                sb.append("AND ");
                sb.append("'" + endDate + " 23:59:59' ) ");
                sb.append("AND ");
                sb.append("(work_end_time BETWEEN ");
                sb.append("'" + startDate + " 00:00:00' ");
                sb.append("AND ");
                sb.append("'" + endDate + " 23:59:59' )) ");

                if (!machineId.equals("null") && !machineId.equals("")) {
                    sb.append("AND ");
                    sb.append("machine_id = '" + machineId + "' ");
                }
                if (!toolCode.equals("null") && !toolCode.equals("")) {
                    sb.append("AND ");
                    sb.append("tool_id LIKE '%" + toolCode + "%' ");
                }
                if (!holderId.equals("null") && !holderId.equals("")) {
                    sb.append("AND ");
                    sb.append("holder_id = '" + holderId + "' ");
                }
                List<Map> result = IiotMachineToolMergeRecord.findBySQL(sb.toString()).toMaps();
                SimpleDateFormat datetimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                for (Map data : result) {
                    data.put("work_start_time", datetimeFormat.format(data.get("work_start_time")));
                    data.put("work_end_time", datetimeFormat.format(data.get("work_end_time")));
                    data.put("work_date", dateFormat.format(data.get("work_date")));
                }
                return success(result);
            }
        });
    }

}
