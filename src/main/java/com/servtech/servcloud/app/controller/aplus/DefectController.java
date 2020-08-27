package com.servtech.servcloud.app.controller.aplus;

import com.google.gson.Gson;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

@RestController
@RequestMapping("/aplus/defect")
public class DefectController {
    private static final Logger log = LoggerFactory.getLogger(DefectController.class);

    @Autowired
    private HttpServletRequest request;

    //缺陷類別與設備關聯統計報表
    @RequestMapping(value = "/getDefectHistoryByRange", method = POST)
    public RequestResult<?> getDefectHistoryByRange(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String startDate = data.get("startDate").toString().replace("/", "-");
                String endDate = data.get("endDate").toString().replace("/", "-");
                List<Map> results = Base.findAll("SELECT aad.defect_number, aad.defect_type, aad.machine_id, aad.cause_factor, aad.defect_caption, aadh.occur_timestamp, SUM(aadh.defect_count) as defect_count" +
                        " FROM a_aplus_defect aad, a_aplus_defect_history aadh" +
                        " WHERE aad.machine_id = aadh.machine_id AND aad.defect_number = aadh.defect_number" +
                        " AND aadh.occur_timestamp BETWEEN ? AND ? GROUP BY aad.defect_number, aad.machine_id", startDate + " 00:00:00", endDate + " 23:59:59");
                return success(results);
            }
        });
    }

    //設備與缺陷類別關聯分析報表
    @RequestMapping(value = "/getDefectHistoryByMachineId", method = POST)
    public RequestResult<?> getDefectHistoryByMachineId(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String machineId = data.get("machineId").toString();
                String startDate = data.get("startDate").toString().replace("/", "-");
                String endDate = data.get("endDate").toString().replace("/", "-");

                List<Map> results = Base.findAll("SELECT aad.defect_number, aad.defect_type, aad.machine_id, aad.cause_factor, aad.defect_caption, aadh.occur_timestamp, SUM(aadh.defect_count) as defect_count" +
                        " FROM a_aplus_defect aad, a_aplus_defect_history aadh" +
                        " WHERE aad.machine_id = aadh.machine_id AND aad.defect_number = aadh.defect_number" +
                        " AND aadh.occur_timestamp BETWEEN ? AND ? AND aad.machine_id = ? GROUP BY aad.defect_number, aad.machine_id", startDate + " 00:00:00", endDate + " 23:59:59", machineId);
                return success(results);
            }
        });
    }
}
