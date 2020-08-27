package com.servtech.servcloud.app.controller.servtrack;

import com.servtech.servcloud.app.model.servtrack.Process;
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
@RequestMapping("/servtrack/process")
public class ServtrackProcessController {
    private final Logger log = LoggerFactory.getLogger(ServtrackProcessController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        try{
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                    Process process = new Process();
                    process.fromMap(data);
                    if(process.insert()){
                        return success(process.getString("process_code"));
                    } else {
                        return fail("新增失敗...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<List<Map>> read(@RequestParam("processcode") final String processcode, @RequestParam("processname") final String processname) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * from a_servtrack_process ");
                sb.append("WHERE process_code NOT IN ('invalid') ");
                sb.append("AND ");
                sb.append("process_code LIKE '%" + processcode + "%' ");
                sb.append("AND ");
                sb.append("process_name LIKE '%" + processname + "%' ");
                sb.append("AND ");
                sb.append("process_code <> 'common_process'");
                String sql = sb.toString();
                log.info(sql);
                return success(Process.findBySQL(sql).toMaps());
            }
        });
    }

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                data.remove("modify_by");
                data.remove("modify_time");
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                Process process = new Process();
                process.fromMap(data);
                if(process.saveIt()) {
                    return success(process.getString("process_code"));
                }else{
                    return fail("修改失敗...");
                }
            }
        });
    }

}
