package com.servtech.servcloud.app.controller.management;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.SysUserDGroup;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.sql.Timestamp;
import java.util.Map;
import java.util.List;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.DELETE;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

@RestController
@RequestMapping("/management/sysUserDashboardGroup")
public class SysUserDahsboardGroupController {

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    String create_by = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    String create_time = new Timestamp(System.currentTimeMillis()).toString();
                    String group_id = "app_dashboard_group"; // for cosmos
                     List store =  Base.findAll("SELECT d_group_id FROM m_sys_d_group WHERE d_group_id='" + group_id + "'");
                    if (store.size() == 0) group_id = "sys_admin_group";
                    data.put("d_group_id", group_id);
                    data.put("create_by", create_by);
                    data.put("create_time", create_time);
                    data.put("modify_by", create_by);
                    data.put("modify_time", create_time);

                    SysUserDGroup sysUserDGroup = new SysUserDGroup();
                    sysUserDGroup.fromMap(data);
                    if (sysUserDGroup.insert()) {
                        return success(sysUserDGroup.getString("user_id"));
                    } else {
                        return fail("新增失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/delete", method = DELETE)
    public RequestResult<Void> delete(@RequestBody final Object[] idList) {
        return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {
                SysUserDGroup.delete("user_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }
}
