package com.servtech.servcloud.module.controller;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.*;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by BeataTseng on 2017/9/21.
 */
@RestController
@RequestMapping("/systool")
public class SysToolController {
    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));

                    /* rowReorder用的 */
                    // String sql = "SELECT COUNT(*) as count FROM a_tool";
                    // final List<Map> maxCount = Base.findAll(sql);
                    // long count = Long.parseLong(maxCount.get(0).get("count").toString());
                    // data.put("tool_index", count + 1);

                    SysTool sysTool = new SysTool();
                    sysTool.fromMap(data);

                    if (sysTool.insert()) {
                        // 若已知機台和刀槽a_tool_log就需要記錄
                        if (!data.get("device_id").toString().equals("") && !data.get("tool_slot").toString().equals("")) {
                            SysToolLog sysToolLog = new SysToolLog();
                            sysToolLog.fromMap(data);
                            if (sysToolLog.insert()) {
                                return success(sysToolLog.getString("tool_id"));
                            } else {
                                return fail("新增失敗，原因待查...");
                            }
                        }
                        return success(sysTool.getString("tool_id"));
                    } else {
                        return fail("新增失敗，原因待查...");
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
                return success(SysTool.findAll().toMaps());
            }
        });
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                SysTool sysTool = new SysTool();
                sysTool.fromMap(data);
                SysTool st = SysTool.findFirst("tool_id = ?", data.get("tool_id"));
                String deviceId = st.get("device_id") == null ? "" : st.get("device_id").toString();
                String toolSlot = st.get("tool_slot") == null ? "" : st.get("tool_slot").toString();
                String oldDeviceId = "";
                String oldToolSlot = "";
                if(data.get("device_id") != null) {
                    oldDeviceId = data.get("device_id").toString();
                }
                if(data.get("tool_slot") != null) {
                    oldToolSlot = data.get("tool_slot").toString();
                }
                if (sysTool.saveIt()) {
                    if ((!oldDeviceId.equals(deviceId) && !oldToolSlot.equals(toolSlot))) {
                        SysToolLog sysToolLog = new SysToolLog();
                        sysToolLog.fromMap(data);
                        sysToolLog.set("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        sysToolLog.set("create_time", new Timestamp(System.currentTimeMillis()));
                        if (sysToolLog.insert()) {
                            return success(sysToolLog.getString("tool_id"));
                        } else {
                            return fail("新增失敗，原因待查...");
                        }
                    }
                    return success(sysTool.getString("tool_id"));
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }

    @RequestMapping(value = "/delete", method = DELETE)
    public RequestResult<Void> delete(@RequestBody final Object[] idList) {
        return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {
                int deleteAmount = SysTool.delete("tool_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }


    @RequestMapping(value = "/updateOrder", method = PUT)
    public RequestResult<String> updateOrder(@RequestBody final List<Map> data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                SysTool sysTool = new SysTool();
                for (Map mapData : data) {
                    sysTool.fromMap(mapData);
                }
                if (sysTool.saveIt()) {
                    PreparedStatement ps = Base.startBatch("UPDATE a_tool SET tool_index = ? WHERE tool_id = ?");
                    for (Map mapData : data) {
                        Base.addBatch(ps, mapData.get("tool_index"), mapData.get("tool_id"));
                    }
                    Base.executeBatch(ps);
                    try {
                        ps.close();
                    } catch (SQLException e) {
                        e.printStackTrace();
                    }

                    return success(sysTool.getString("tool_id"));
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }
}
