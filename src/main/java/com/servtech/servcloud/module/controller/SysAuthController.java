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
import com.servtech.servcloud.module.model.SysAuth;
import com.servtech.servcloud.module.model.SysAuthFunc;
import com.servtech.servcloud.module.model.SysFunc;
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

/**
 * Created by Hubert Datetime: 2015/7/23 下午 04:26
 */
@RestController
@RequestMapping("/sysauth")
public class SysAuthController {

    private static final Logger log = LoggerFactory.getLogger(SysAuthController.class);

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    String userId = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    Timestamp currentTime = new Timestamp(System.currentTimeMillis());
                    data.put("create_by", userId);
                    data.put("create_time", currentTime);
                    data.put("is_close", 0);

                    SysAuth sysAuth = new SysAuth();
                    sysAuth.fromMap(data);
                    String authId = sysAuth.getString("auth_id");

                    if (sysAuth.insert()) {
                        if (data.get("sys_funcs") != null) { // 綁定子功能
                            Map<String, List<String>> sysFuncs = (Map<String, List<String>>) data.get("sys_funcs");
                            bindAuthFuncApp(authId, sysFuncs, userId, currentTime);
                        }
                        return success(authId);
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
                    result = SysAuth.findAll().toMaps();
                } else if (id.startsWith("@st@")) {
                    result = SysAuth.where("auth_id <> '@st@sys_super_admin_auth'").toMaps();
                } else {
                    result = SysAuth.where("auth_id not like '@st@%'").toMaps();
                }
                String langTag = Cookie.get(request, "lang");

                for (Map auth : result) {

                    List<SysAuthFunc> sysAuthFuncs = SysAuthFunc.find("auth_id = ?", auth.get("auth_id"));

                    List<Map<String, String>> sysFuncs = Lists.newArrayList();
                    for (SysAuthFunc sysAuthFunc : sysAuthFuncs) {
                        String funcId = sysAuthFunc.getString("func_id");
                        String appId = sysAuthFunc.getString("app_id");

                        SysFunc sysFunc = SysFunc.findFirst("func_id = ? AND app_id = ?", funcId, appId);
                        SysAppInfo sysAppInfo = SysAppInfo.findFirst("app_id = ?", appId);

                        String funcName = Language.get(langTag, sysFunc.getString("func_name"));
                        String appName = Language.get(langTag, sysAppInfo.getString("app_name"));

                        Map<String, String> sysFuncMap = Maps.newHashMap();
                        sysFuncMap.put("func_id", funcId);
                        sysFuncMap.put("func_name", funcName);
                        sysFuncMap.put("app_id", appId);
                        sysFuncMap.put("app_name", appName);
                        sysFuncs.add(sysFuncMap);
                    }
                    auth.put("sys_funcs", sysFuncs);

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

                String userId = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                Timestamp currentTime = new Timestamp(System.currentTimeMillis());
                data.put("modify_by", userId);
                data.put("modify_time", currentTime);

                SysAuth sysAuth = new SysAuth();
                sysAuth.fromMap(data);
                String authId = sysAuth.getString("auth_id");

                if (sysAuth.saveIt()) {

                    // 刪掉舊的綁定
                    SysAuthFunc.delete("auth_id = ?", authId);
                    if (data.get("sys_funcs") != null) { // 綁上新的
                        Map<String, List<String>> sysFuncs = (Map<String, List<String>>) data.get("sys_funcs");
                        bindAuthFuncApp(authId, sysFuncs, userId, currentTime);
                    }

                    return success(authId);
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
                int deleteAmount = SysAuth.delete("auth_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }

    private void bindAuthFuncApp(String authId, Map<String, List<String>> sysFuncs, String userId, Timestamp currentTime) {
        for (Map.Entry<String, List<String>> entry : sysFuncs.entrySet()) {
            String appId = entry.getKey();
            for (String funcId : entry.getValue()) {
                SysAuthFunc sysAuthFunc = new SysAuthFunc();
                sysAuthFunc.set(
                  "auth_id", authId,
                  "func_id", funcId,
                  "app_id", appId,
                  "create_time", currentTime,
                  "create_by", userId
                );
                if (sysAuthFunc.isValid()) {
                    try {
                        sysAuthFunc.insert();
                    } catch (Exception e) {
                        throw new DBException(appId + " - " + funcId + " 綁定失敗,請檢查SQL語法欄位與值是否正確");
                    }
                } else {
                    throw new DBException(appId + " - " + funcId + " 綁定失敗");
                }
                // if (!sysAuthFunc.insert()) {
                // throw new DBException(appId + " - " + funcId + " 綁定失敗");
                // }
            }
        }
    }

}
