package com.servtech.servcloud.module.controller;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.SysDAuth;
import com.servtech.servcloud.module.model.SysDGroup;
import com.servtech.servcloud.module.model.SysUser;
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
 * Created by Hubert Datetime: 2015/7/23 下午 02:40
 */
@RestController
@RequestMapping("/sysDashboardGroup")
public class SysDashboardGroupController {

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

                    data.put("is_close", 0);

                    SysDGroup sysDGroup = new SysDGroup();
                    sysDGroup.fromMap(data);
                    if (sysDGroup.insert()) {
                        for (String dAuthId : (List<String>) data.get("sys_d_auths")) {
                            sysDGroup.add(SysDAuth.findById(dAuthId));
                        }
                        for (String userId : (List<String>) data.get("sys_users")) {
                            sysDGroup.add(SysUser.findById(userId));
                        }
                        return success(sysDGroup.getString("d_group_id"));
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
        String id = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);

        if (id.equals("@st@STAdmin")) {
            return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(SysDGroup.findAll().include(SysDAuth.class, SysUser.class).toMaps());
                }
            });
        } else if (id.startsWith("@st@")) {
            return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(
                            SysDGroup.where("d_group_id <> '@st@sys_super_admin_group'").include(SysDAuth.class, SysUser.class).toMaps());
                }
            });
        } else {
            return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(SysDGroup.where("d_group_id not like '@st@%'").include(SysDAuth.class, SysUser.class).toMaps());
                }
            });
        }

    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                SysDGroup sysDGroup = new SysDGroup();
                sysDGroup.fromMap(data);

                List<SysDAuth> sysDAuthList = sysDGroup.getAll(SysDAuth.class);
                for (SysDAuth sysDAuth : sysDAuthList) {
                    sysDGroup.remove(sysDAuth);
                }
                for (String sysDAuthId : (List<String>) data.get("sys_d_auths")) {
                    sysDGroup.add(SysDAuth.findById(sysDAuthId));
                }
                List<SysUser> sysUserList = sysDGroup.getAll(SysUser.class);
                for (SysUser sysUser : sysUserList) {
                    sysDGroup.remove(sysUser);
                }
                for (String sysUserId : (List<String>) data.get("sys_users")) {
                    sysDGroup.add(SysUser.findById(sysUserId));
                }
                if (sysDGroup.saveIt()) {
                    return success(sysDGroup.getString("d_group_id"));
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
                int deleteAmount = SysDGroup.delete("d_group_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }
}
