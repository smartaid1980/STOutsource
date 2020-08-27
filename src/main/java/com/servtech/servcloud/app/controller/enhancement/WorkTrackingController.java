package com.servtech.servcloud.app.controller.enhancement;


import com.servtech.servcloud.app.model.enhancement.WorkTracking;
import com.servtech.servcloud.app.model.servtrack.Line;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.PUT;

@RestController
@RequestMapping("enhancement/workTracking")
public class WorkTrackingController {

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
                List<Map> workTrackings = WorkTracking.find("machine_id=? AND shift_date=?", machineId, shiftDate).toMaps();
                SimpleDateFormat yyyyMMddWithSlash = new SimpleDateFormat("yyyy/MM/dd");
                SimpleDateFormat yyyyMMddHHmmssStd = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                String[] pks = WorkTracking.getMetaModel().getCompositeKeys();
                for (Map workTracking : workTrackings) {
                    Map pkMap = new HashMap();
                    for (String pk : pks) {
                        pkMap.put(pk, workTracking.get(pk));
                    }
                    workTracking.put("pks", pkMap);
                    workTracking.put("shift_date", yyyyMMddWithSlash.format(workTracking.get("shift_date")));
                    workTracking.put("start_time", yyyyMMddHHmmssStd.format(workTracking.get("start_time")));
                    workTracking.put("end_time", yyyyMMddHHmmssStd.format(workTracking.get("end_time")));
                }
                return RequestResult.success(workTrackings);
            }
        });
    }

    @RequestMapping(method = PUT)
    public RequestResult<String> put(@RequestBody final Map data) {

        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                WorkTracking workTracking = new WorkTracking();
                workTracking.fromMap(data);
                if (workTracking.saveIt()) {
                    return success(workTracking.getString("machine_id"));
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });

    }



}
