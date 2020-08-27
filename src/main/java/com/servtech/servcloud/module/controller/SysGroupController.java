package com.servtech.servcloud.module.controller;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.SysAuth;
import com.servtech.servcloud.module.model.SysGroup;
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
@RequestMapping("/sysgroup")
public class SysGroupController {

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

                    SysGroup sysGroup = new SysGroup();
                    sysGroup.fromMap(data);
                    if (sysGroup.insert()) {
                        if (data.get("sys_auths") != null) { // 新增時不一定權限已經建好了
                            for (String authId : (List<String>) data.get("sys_auths")) {
                                sysGroup.add(SysAuth.findById(authId));
                            }
                        }
                        if (data.get("sys_users") != null) { // 新增時不一定使用者已經建好了
                            for (String userId : (List<String>) data.get("sys_users")) {
                                sysGroup.add(SysUser.findById(userId));
                            }
                        }
                        return success(sysGroup.getString("group_id"));
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
                    return success(SysGroup.findAll().include(SysAuth.class, SysUser.class).toMaps());
                }
            });
        } else if (id.startsWith("@st@")) {
            return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(
                            SysGroup.where("group_id <> '@st@sys_super_admin_group'").include(SysAuth.class, SysUser.class).toMaps());
                }
            });
        } else {
            return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(SysGroup.where("group_id not like '@st@%'").include(SysAuth.class, SysUser.class).toMaps());
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
                SysGroup sysGroup = new SysGroup();
                sysGroup.fromMap(data);

                List<SysAuth> sysAuthList = sysGroup.getAll(SysAuth.class);
                for (SysAuth sysAuth : sysAuthList) {
                    sysGroup.remove(sysAuth);
                }
                if (data.get("sys_auths") != null) {
                    for (String sysAuthId : (List<String>) data.get("sys_auths")) {
                        sysGroup.add(SysAuth.findById(sysAuthId));
                    }
                }

                List<SysUser> sysUserList = sysGroup.getAll(SysUser.class);
                for (SysUser sysUser : sysUserList) {
                    sysGroup.remove(sysUser);
                }
                if (data.get("sys_users") != null) {
                    for (String sysUserId : (List<String>) data.get("sys_users")) {
                        sysGroup.add(SysUser.findById(sysUserId));
                    }
                }

                if (sysGroup.saveIt()) {
                    return success(sysGroup.getString("group_id"));
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
                int deleteAmount = SysGroup.delete("group_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }
}
