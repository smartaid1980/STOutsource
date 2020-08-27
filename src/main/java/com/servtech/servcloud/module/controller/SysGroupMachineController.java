package com.servtech.servcloud.module.controller;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.model.SysGroup;
import com.servtech.servcloud.module.model.SysGroupMachine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Hubert
 * Datetime: 2015/7/23 下午 02:40
 */
@RestController
@RequestMapping("/sysgroupmachine")
public class SysGroupMachineController {

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/read", method = GET)
     public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> result = SysGroup.findAll().toMaps();

                for (Map group : result) {
                    List<SysGroupMachine> sysGroupMachineList = SysGroupMachine.find("group_id = ?", group.get("group_id"));
                    List<Map<String, String>> machines = Lists.newArrayList();

                    for (SysGroupMachine sysGroupMachine : sysGroupMachineList) {
                        String machineId = sysGroupMachine.getString("machine_id");
                        Map<String, String> machineMap = Maps.newHashMap();
                        machineMap.put("machine_id", machineId);
                        machines.add(machineMap);
                    }
                    group.put("machine_id", machines);
                }

                return success(result);
            }
        });
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                SysGroup sysGroup = new SysGroup();
                sysGroup.fromMap(data);

                SysGroupMachine.delete("group_id = ?", sysGroup.getId());

                if (sysGroup.saveIt()) {
                    for (String machineId : (List<String>) data.get("machine_id")) {
                        SysGroupMachine sysGroupMachine = new SysGroupMachine();
                        sysGroupMachine
                            .set("group_id", sysGroup.get("group_id").toString())
                            .set("machine_id", machineId)
                            .set("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY))
                            .set("create_time", new Timestamp(System.currentTimeMillis()));

                        if (!sysGroupMachine.saveIt()) {
                            return fail("saveIt deviceCncBrand fail!!");
                        }
                    }
                    return success(sysGroup.getString("group_id"));
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }

}
