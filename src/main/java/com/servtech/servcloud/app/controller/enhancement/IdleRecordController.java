package com.servtech.servcloud.app.controller.enhancement;


import com.servtech.servcloud.app.model.enhancement.IdleReason;
import com.servtech.servcloud.app.model.enhancement.IdleRecord;
import com.servtech.servcloud.app.model.enhancement.WorkTracking;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sun.misc.Request;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.PreparedStatement;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

@RestController
@RequestMapping("enhancement/idleRecord")
public class IdleRecordController {
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = GET)
    public RequestResult<?> get() {
        final String machineId = request.getParameter("machine_id");
        final String shiftDate = request.getParameter("shift_date").replace("/", "-");
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                List<Map> IdleRecords = IdleRecord.find("machine_id=? AND shift_date=?", machineId, shiftDate).toMaps();
                SimpleDateFormat yyyyMMddWithSlash = new SimpleDateFormat("yyyy/MM/dd");
                SimpleDateFormat yyyyMMddHHmmssStd = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                String[] pks = IdleRecord.getMetaModel().getCompositeKeys();
                for (Map idleRecord : IdleRecords) {
                    Map pkMap = new HashMap();
                    for (String pk : pks) {
                        pkMap.put(pk, idleRecord.get(pk));
                    }
                    idleRecord.put("pks", pkMap);
                    idleRecord.put("shift_date", yyyyMMddWithSlash.format(idleRecord.get("shift_date")));
                    idleRecord.put("start_time", yyyyMMddHHmmssStd.format(idleRecord.get("start_time")));
                    idleRecord.put("end_time", yyyyMMddHHmmssStd.format(idleRecord.get("end_time")));
                }
                return RequestResult.success(IdleRecords);
            }
        });
    }

    @RequestMapping(method = POST)
    public RequestResult<?> post(@RequestBody final List<Map> datas) {

        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                PreparedStatement ps = Base.startBatch("INSERT INTO a_enhancement_idle_record " +
                        "(machine_id, idle_id, status, start_time, end_time, tag, shift_date) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?) " +
                        "ON DUPLICATE KEY UPDATE " +
                        "end_time=VALUES(end_time), shift_date=VALUES(shift_date), idle_id=VALUES(idle_id)");
                for (Map data : datas) {
                    Base.addBatch(ps,
                            data.get("machine_id"),
                            data.get("idle_id"),
                            data.get("status"),
                            data.get("start_time"),
                            data.get("end_time"),
                            data.get("tag"),
                            data.get("shift_date"));
                }
                try{
                    Base.executeBatch(ps);
                    return RequestResult.success();
                } catch (Exception e) {
                    return RequestResult.fail(e.getMessage());
                }
            }
        });

    }
}
