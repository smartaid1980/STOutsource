package com.servtech.servcloud.module.controller;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.Cookie;
import com.servtech.servcloud.core.util.Language;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.SysAppInfo;
import com.servtech.servcloud.module.model.SysDAuth;
import com.servtech.servcloud.module.model.SysDAuthDashboard;
import com.servtech.servcloud.module.model.SysDashboard;
import org.javalite.activejdbc.DBException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

@RestController
@RequestMapping("/sysDashboardAuth")
public class SysDashboardAuthController {

    private static final Logger log = LoggerFactory.getLogger(SysAuthController.class);

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

                    SysDAuth sysDAuth = new SysDAuth();
                    sysDAuth.fromMap(data);

                    if (sysDAuth.insert()) {

                        String dAuthId = sysDAuth.getString("d_auth_id");
                        // 綁定子功能
                        Map<String, List<String>> sysDashboards = (Map<String, List<String>>) data.get("sys_dashboards");
                        bindAuthDashboardApp(dAuthId, sysDashboards);

                        return success(dAuthId);
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
                String id = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                List<Map> result;
                if (id.equals("@st@STAdmin")) {
                    result = SysDAuth.findAll().toMaps();
                } else if (id.startsWith("@st@")) {
                    result = SysDAuth.where("d_auth_id <> '@st@sys_super_admin_auth'").toMaps();
                } else {
                    result = SysDAuth.where("d_auth_id not like '@st@%'").toMaps();
                }
                String langTag = Cookie.get(request, "lang");

                for (Map auth : result) {
                    try {
                        List<SysDAuthDashboard> sysDAuthDashboards = SysDAuthDashboard.find("d_auth_id = ?", auth.get("d_auth_id"));

                        List<Map<String, String>> sysDashboards = Lists.newArrayList();
                        for (SysDAuthDashboard sysDAuthDashboard : sysDAuthDashboards) {
                            String dashboardId = sysDAuthDashboard.getString("dashboard_id");
                            String appId = sysDAuthDashboard.getString("app_id");

                            SysDashboard sysDashboard = SysDashboard.findFirst("dashboard_id = ? AND app_id = ?", dashboardId, appId);
                            SysAppInfo sysAppInfo = SysAppInfo.findFirst("app_id = ?", appId);

                            String dashboardName = Language.get(langTag, sysDashboard.getString("dashboard_name"));
                            String appName = Language.get(langTag, sysAppInfo.getString("app_name"));

                            Map<String, String> sysDashboardMap = Maps.newHashMap();
                            sysDashboardMap.put("dashboard_id", dashboardId);
                            sysDashboardMap.put("dashboard_name", dashboardName);
                            sysDashboardMap.put("app_id", appId);
                            sysDashboardMap.put("app_name", appName);
                            sysDashboards.add(sysDashboardMap);
                        }
                        auth.put("sys_dashboards", sysDashboards);
                    } catch (Exception e) {
                        log.warn(e.getMessage());
                    }

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

                SysDAuth sysDAuth = new SysDAuth();
                sysDAuth.fromMap(data);

                String dAuthId = sysDAuth.getString("d_auth_id");
                if (sysDAuth.saveIt()) {

                    // 刪掉舊的綁定
                    SysDAuthDashboard.delete("d_auth_id = ?", dAuthId);
                    // 綁上新的
                    Map<String, List<String>> sysDashboards = (Map<String, List<String>>) data.get("sys_dashboards");
                    bindAuthDashboardApp(dAuthId, sysDashboards);

                    return success(dAuthId);
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
                int deleteAmount = SysDAuth.delete("d_auth_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }

    private void bindAuthDashboardApp(String authId, Map<String, List<String>> sysDashboards) {
        for (Map.Entry<String, List<String>> entry : sysDashboards.entrySet()) {
            String author = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
            String time = new Timestamp(System.currentTimeMillis()).toString();
            String appId = entry.getKey();
            for (String dashboardId : entry.getValue()) {
                SysDAuthDashboard sysDAuthDashboard = new SysDAuthDashboard();
                sysDAuthDashboard.set("d_auth_id", authId, "dashboard_id", dashboardId, "app_id", appId,
                        "create_by", author, "create_time", time, "modify_by", author, "modify_time", time);
                if (sysDAuthDashboard.isValid()) {
                    try {
                        sysDAuthDashboard.insert();
                    } catch (Exception e) {
                        throw new DBException(appId + " - " + dashboardId + " 綁定失敗,請檢查SQL語法欄位與值是否正確");
                    }
                } else {
                    throw new DBException(appId + " - " + dashboardId + " 綁定失敗");
                }
            }
        }
    }

}

