package com.servtech.servcloud.app.controller.aerowin;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Kevin Big Big on 2016/10/4.
 */

@RestController
@RequestMapping("/aerowin/departmachine")
public class DepartMachineController {
    private final Logger log = LoggerFactory.getLogger(DepartMachineController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    String createBy = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    Timestamp createTime = new Timestamp(System.currentTimeMillis());

                    String departId = data.get("depart_id").toString();
                    String machineId = data.get("machine_id").toString();
                    int result = Base.exec("INSERT INTO a_aerowin_depart_machine" +
                            " (depart_id, machine_id, create_by, create_time)" +
                            " VALUES (?, ?, ?, ?) ", departId, machineId, createBy, createTime);
                    if(result > 0){
                        return success(departId + ", " + machineId);
                    }else{
                        return fail("a_aerowin_depart_machine insert fail");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }
    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> maps = Base.findAll("SELECT depart_id, machine_id FROM a_aerowin_depart_machine");
                for(Map map:maps){//自建pks給Hubert的crudtable使用
                    Map pks = new HashMap();
                    pks.put("depart_id", map.get("depart_id"));
                    pks.put("machine_id", map.get("machine_id"));
                    map.put("pks", pks);
                }
                return success(maps);
            }
        });
    }

    @RequestMapping(value = "/delete", method = DELETE)
    public RequestResult<Void> delete(@RequestBody final Object[] idList) {
        return ActiveJdbc.oper(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {
                int deleteSize = idList.length;
                for(int count=0; count<deleteSize; count++){
                    Map pks = (Map) idList[count];
                    String departId = pks.get("depart_id").toString();
                    String machineId = pks.get("machine_id").toString();
                    Base.exec("DELETE FROM a_aerowin_depart_machine WHERE depart_id = ? AND machine_id = ?", departId, machineId);
                    log.info("delete - depart_id: {}, machine_id: {}", departId, machineId);
                }
                return success();
            }
        });
    }
}
