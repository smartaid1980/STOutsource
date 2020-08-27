package com.servtech.servcloud.app.controller.form_editor;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.Cookie;
import com.servtech.servcloud.core.util.Language;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.*;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Beata on 2018/3/17.
 */
@RestController
@RequestMapping("/formeditor/func")
public class FormEditorFuncController {
    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<?> read(@RequestParam("app_id") final String appId) {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                System.out.println(appId);
                List<Map> result = SysFunc.find("app_id=?", appId).toMaps();

                String langTag = Cookie.get(request, "lang");
                for (Map map : result) {
                    String appNameKey = (String) map.get("func_name");
                    map.put("i18n_tag", appNameKey);
                    map.put("func_name", Language.get(langTag, appNameKey));
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        final String appId = data.get("app_id").toString();
        final String funcId = data.get("func_id").toString();
        final String funcName = data.get("func_name").toString();
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    Map funcTnfo = new HashMap();
                    funcTnfo.put("app_id", appId);
                    funcTnfo.put("func_id", funcId);
                    funcTnfo.put("func_name", funcName);
                    funcTnfo.put("description", data.get("description").toString());
                    funcTnfo.put("author", data.get("author").toString());
                    funcTnfo.put("hash", "none");
                    SysFunc sysFuncInfo = new SysFunc();
                    sysFuncInfo.fromMap(funcTnfo);

                    List<Map> groupResult = SysUserGroup.find("user_id=?", data.get("user_id").toString()).toMaps();
                    String groupId = groupResult.get(0).get("group_id").toString();
                    List<Map> authResult = Base.findAll(
                            "SELECT auth_id  FROM m_sys_group_auth WHERE group_id=? AND auth_id like '%@%'", groupId);
                    if (authResult.size() <= 0) {
                        authResult = Base.findAll("SELECT auth_id  FROM m_sys_group_auth WHERE group_id=?", groupId);
                    }
                    String authId = authResult.get(0).get("auth_id").toString();

                    Map authFunc = new HashMap();
                    authFunc.put("auth_id", authId);
                    authFunc.put("app_id", appId);
                    authFunc.put("func_id", funcId);
                    authFunc.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    authFunc.put("create_time", new Timestamp(System.currentTimeMillis()));
                    SysAuthFunc sysAuthFunc = new SysAuthFunc();
                    sysAuthFunc.fromMap(authFunc);

                    addFuncDataInConfig(appId, funcId, funcName);

                    if (sysFuncInfo.insert() && sysAuthFunc.insert()) {
                        return success(appId);
                    } else {
                        return fail("新增失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    public static void addFuncDataInConfig(String appId, String funcId, String funcName) {
        String appName = System.getProperty(SysPropKey.WEB_ROOT_PATH) + "/ServCloud/app/" + appId;
        File configFile = new File(appName + "/config.json");
        if (configFile.exists()) {
            try {
                StringBuilder sb = new StringBuilder();
                int fileSize = (int) configFile.length();
                int buff;
                FileInputStream fis = new FileInputStream(configFile);
                byte[] bytes = new byte[fileSize];
                while ((buff = fis.read(bytes, 0, bytes.length)) != -1) {
                    sb.append(new String(bytes, 0, buff));
                }
                fis.close();

                String s = sb.toString();
                System.out.println(s);
                s = s.replaceAll("\\s+", "");
                System.out.println(s);
                sb = sb.replace(0, sb.length(), s);
                int index = s.indexOf("}],\"tags\"");
                System.out.println(index);
                if (index < 0) {
                    index = s.indexOf("],\"tags\"");
                    System.out.println(index);
                    sb.insert(index, "{\"id\":\"" + funcId + "\",\"name\":\"" + funcName + "\"}");// 插入
                } else {
                    sb.insert(index + 1, ",{\"id\":\"" + funcId + "\",\"name\":\"" + funcName + "\"}");// 插入
                }
                System.out.println(sb);// 成功了?

                FileOutputStream fos = new FileOutputStream(configFile);
                String result = sb.toString();
                fos.write(result.getBytes("utf-8"));
                fos.flush();
                fos.close();
            } catch (IOException e) {
                System.out.println(e);
            }
        }
    }
}
