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
import com.servtech.servcloud.module.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.GET;

@RestController
@RequestMapping("/dashboard")
public class SysDashboardController {

    private static final Logger log = LoggerFactory.getLogger(SysDashboardController.class);

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/groupByApp", method = GET)
    public RequestResult<List<App>> groupByApp() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<App>>>() {
            @Override
            public RequestResult<List<App>> operate() {
                SysUser sysUser = SysUser.findById(request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));

                List<SysGroup> sysGroupList = sysUser.getAll(SysGroup.class);

                Set<String> sysAuthIdSet = new HashSet<String>();

                for (SysGroup sysGroup : sysGroupList) {
                    sysAuthIdSet.addAll(sysGroup.getAll(SysAuth.class).collect("auth_id"));
                }

                String query = "auth_id IN (" + Util.strSplitBy("?", ",", sysAuthIdSet.size()) + ")";
                List<SysAuthFunc> sysAuthFuncList = SysAuthFunc.find(query, sysAuthIdSet.toArray(new Object[sysAuthIdSet.size()]));
                Map<String, String> sysAuthFuncMap = new HashMap<>();
                for(SysAuthFunc sysAuthFunc : sysAuthFuncList){
                    sysAuthFuncMap.put(sysAuthFunc.get("app_id").toString(), sysAuthFunc.get("app_id").toString());
                }

                List<App> result = Lists.newArrayList();
                try {
                    List<SysAppInfo> sysAppInfoList = SysAppInfo.findAll().include(SysDashboard.class);
                    String langTag = Cookie.get(request, "lang");

                    for (SysAppInfo sysAppInfo : sysAppInfoList) {
                        if(sysAuthFuncMap.get(sysAppInfo.getString("app_id")) != null) {
                            App app = new App();
                            app.id = sysAppInfo.getString("app_id");
                            app.name = Language.get(langTag, sysAppInfo.getString("app_name"));
                            for (SysDashboard sysDashboard : sysAppInfo.getAll(SysDashboard.class)) {
                                Dashboard dashboard = new Dashboard();
                                dashboard.id = sysDashboard.getString("dashboard_id");
                                dashboard.name = Language.get(langTag, sysDashboard.getString("dashboard_name"));
                                app.dashboards.add(dashboard);
                            }
                            result.add(app);
                        }
                    }

                } catch (Exception e) {
                    log.warn(e.getMessage());
                }
                return success(result);
            }
        });
    }

    public static class App {
        String id;
        String name;
        List<Dashboard> dashboards = Lists.newArrayList();
    }

    public static class Dashboard {
        String id;
        String name;
    }
}
