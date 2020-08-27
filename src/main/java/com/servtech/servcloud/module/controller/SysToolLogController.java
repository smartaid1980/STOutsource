package com.servtech.servcloud.module.controller;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.SysToolLog;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by BeataTseng on 2017/10/3.
 */
@RestController
@RequestMapping("/systoollog")
public class SysToolLogController {
    @RequestMapping(value = "/read", method = POST)
    public RequestResult<List<Map>> read(@RequestBody final Data data) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<String> param = new ArrayList<String>();
                param.add(data.startDate + " 00:00:00");
                param.add(data.endDate + " 23:59:59");
                param.addAll(data.machineList);
                param.addAll(data.toolList);
                List<Map> result = SysToolLog.where(" create_time BETWEEN ? AND ? AND device_id IN ( " +
                        Util.strSplitBy("?", ",", data.machineList.size()) + " ) AND tool_id IN ( " +
                        Util.strSplitBy("?", ",", data.toolList.size()) + " ) ", param.toArray()).toMaps();
                return success(result);
            }
        });
    }

    public class Data {
        String startDate;
        String endDate;
        List<String> machineList;
        List<String> toolList;
    }
}


