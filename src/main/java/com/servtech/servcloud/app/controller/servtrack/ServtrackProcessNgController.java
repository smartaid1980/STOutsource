package com.servtech.servcloud.app.controller.servtrack;

import com.servtech.servcloud.app.model.servtrack.ProcessNg;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/6/15.
 */

@RestController
@RequestMapping("/servtrack/processng")
public class ServtrackProcessNgController {
    private final Logger log = LoggerFactory.getLogger(ServtrackProcessNgController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public RequestResult<?> create(@RequestParam("processcode") final String processcode, @RequestBody final Map data) {
        try{
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    data.put("process_code", processcode);
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    ProcessNg processNg = new ProcessNg();
                    processNg.fromMap(data);
                    if(processNg.insert()){
                        return success(processNg.getString("process_code") + "_" + processNg.getString("ng_code"));
                    } else {
                        return fail("新增失敗，原因待查....");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/readcode", method = RequestMethod.GET)
    public RequestResult<List<Map>> getCodeData(@RequestParam("processcode") final String processcode) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * from a_servtrack_process_ng ");
                sb.append("WHERE ");
                sb.append("process_code = '" + processcode + "'");
                String sql = sb.toString();
                log.info(sql);
                return success(ProcessNg.findBySQL(sql).toMaps());
            }
        });
    }

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public RequestResult<String> updateData(@RequestParam("processcode") final String processcode, @RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                data.put("process_code", processcode);
                data.remove("modify_by");
                data.remove("modify_time");
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                ProcessNg processNg = new ProcessNg();
                processNg.fromMap(data);
                if(processNg.saveIt()) {
                    return success(processNg.getString("process_code") + "_" + processNg.getString("ng_code"));
                }else{
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }
}
