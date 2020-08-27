package com.servtech.servcloud.module.controller;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.Cookie;
import com.servtech.servcloud.core.util.Language;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.model.SysAppInfo;
import com.servtech.servcloud.module.model.SysAuthFunc;
import com.servtech.servcloud.module.model.SysFunc;
import com.servtech.servcloud.module.model.TagForApp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.GET;

/**
 * Created by Hubert Datetime: 2015/7/9 上午 11:49
 */
@RestController
@RequestMapping("/function")
public class SysFuncController {

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "findByAuth", method = GET)
    public RequestResult<List<Map>> findByAuth() {
        HttpSession session = request.getSession();
        final String id = (String) session.getAttribute(AuthFilter.SESSION_LOGIN_KEY);

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<SysAuthFunc> sysAuthFuncList = SysAuthFunc
                        .findBySQL("SELECT distinct af.func_id, af.app_id FROM m_sys_auth_func af WHERE af.auth_id IN ("
                                + "SELECT ga.auth_id FROM m_sys_group_auth ga WHERE ga.group_id IN ( "
                                + "SELECT ug.group_id FROM m_sys_user_group ug WHERE ug.user_id = ? " + ")" + ");", id)
                        .include(SysAppInfo.class, SysFunc.class);

                // 把 func 放進對應的 app 當中
                Map<String, Map> groupByAppId = Maps.newLinkedHashMap();
                for (SysAuthFunc sysAuthFunc : sysAuthFuncList) {
                    String appId = sysAuthFunc.getString("app_id");
                    String funcId = sysAuthFunc.getString("func_id");
                    Map<String, Object> funcMap = SysFunc.first("func_id = ? AND app_id = ?", funcId, appId).toMap();

                    if (groupByAppId.containsKey(appId)) {
                        Map app = groupByAppId.get(appId);
                        ((List<Map<String, Object>>) app.get("sys_func_list")).add(funcMap);
                    } else {
                        SysAppInfo sysAppInfo = sysAuthFunc.parent(SysAppInfo.class);
                        Map app = sysAppInfo.toMap();
                        app.put("tag", sysAppInfo.getAll(TagForApp.class).toMaps());
                        List<Map<String, Object>> sysFuncList = Lists.newArrayList();
                        sysFuncList.add(funcMap);
                        app.put("sys_func_list", sysFuncList);
                        groupByAppId.put(appId, app);
                    }
                }

                // 語言轉換
                List<Map> result = Lists.newArrayList(groupByAppId.values());
                String langTag = Cookie.get(request, "lang");
                for (Map map : result) {
                    String appNameKey = (String) map.get("app_name");
                    map.put("app_name", Language.get(langTag, appNameKey));
                    for (Object func : (List) map.get("sys_func_list")) {
                        Map funcMap = (Map) func;
                        String langKey = (String) funcMap.get("func_name");
                        funcMap.put("func_name", Language.get(langTag, langKey));
                    }
                }

                return success(result);

            }
        });
    }

    @RequestMapping(value = "/groupByApp", method = GET)
    public RequestResult<List<App>> groupByApp() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<App>>>() {
            @Override
            public RequestResult<List<App>> operate() {
                List<SysAppInfo> sysAppInfoList = SysAppInfo.findAll().include(SysFunc.class);
                List<App> result = Lists.newArrayList();
                String langTag = Cookie.get(request, "lang");

                for (SysAppInfo sysAppInfo : sysAppInfoList) {
                    App app = new App();
                    app.id = sysAppInfo.getString("app_id");
                    app.name = Language.get(langTag, sysAppInfo.getString("app_name"));
                    for (SysFunc sysFunc : sysAppInfo.getAll(SysFunc.class)) {
                        Func func = new Func();
                        func.id = sysFunc.getString("func_id");
                        func.name = Language.get(langTag, sysFunc.getString("func_name"));
                        app.funcs.add(func);
                    }
                    result.add(app);
                }
                return success(result);
            }
        });
    }

    public static class App {
        String id;
        String name;
        List<Func> funcs = Lists.newArrayList();
    }

    public static class Func {
        String id;
        String name;
    }
}
