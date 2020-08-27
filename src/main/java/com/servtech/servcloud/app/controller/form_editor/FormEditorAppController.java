package com.servtech.servcloud.app.controller.form_editor;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.Cookie;
import com.servtech.servcloud.core.util.Language;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.SysAppClassTag;
import com.servtech.servcloud.module.model.SysAppInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Beata on 2018/3/16.
 */
@RestController
@RequestMapping("/formeditor/app")
public class FormEditorAppController {
    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> result = SysAppInfo.findAll().toMaps();
                List<Map> tagResult = SysAppClassTag.findAll().toMaps();

                String langTag = Cookie.get(request, "lang");
                for (Map map : result) {
                    String appNameKey = (String) map.get("app_name");
                    map.put("app_name", Language.get(langTag, appNameKey));

                    for (Map tagMap : tagResult) {
                        if(map.get("app_id").toString().equals(tagMap.get("app_id").toString())) {
                            map.put("tag_id", tagMap.get("tag_id").toString());
                        }
                    }

                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        final String appId = data.get("app_id").toString();
        final Object createBy = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        final Timestamp createTime = new Timestamp(System.currentTimeMillis());

        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    Map appTnfo = new HashMap();
                    appTnfo.put("app_id", appId);
                    appTnfo.put("app_name", data.get("app_name").toString());
                    appTnfo.put("app_type", 1);
                    appTnfo.put("description", data.get("description").toString());
                    appTnfo.put("version", "1.0");
                    appTnfo.put("create_by", createBy);
                    appTnfo.put("create_time", createTime);

                    SysAppInfo sysAppInfo = new SysAppInfo();
                    sysAppInfo.fromMap(appTnfo);

                    Map appClassTag = new HashMap();
                    appClassTag.put("app_id", appId);
                    appClassTag.put("tag_id", data.get("tag_id").toString());
                    appClassTag.put("create_by", createBy);
                    appClassTag.put("create_time", createTime);

                    SysAppClassTag sysClassTag = new SysAppClassTag();
                    sysClassTag.fromMap(appClassTag);

                    createAppFile(data);
                    if (sysAppInfo.insert() && sysClassTag.insert()) {
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


    @RequestMapping(value = "/img", method = POST)
    public RequestResult<String> img(@RequestParam("file") MultipartFile uploadFile, @RequestParam("data") String data) {
        String appName = System.getProperty(SysPropKey.WEB_ROOT_PATH) + "/ServCloud/app/" + data;
        File imgDestFile = new File(appName + "/img/default.png");
        if(!imgDestFile.exists()) {
            System.out.println("開始複製");
            try {
                uploadFile.transferTo(imgDestFile);
            }  catch (IOException e){
                System.out.println(e);
                return fail("複製失敗，原因待查...");
            }
        }
        return success("copy success");
    }

    public static void createAppFile (final Map data) {
        String appName = System.getProperty(SysPropKey.WEB_ROOT_PATH) + "/ServCloud/app/" + data.get("app_id").toString();
        String[] folderName = {"/function/en","/function/zh","/function/zh_tw", "/img", "/langs", "/tag"};

        // 建立資料夾
        for(String nameStr : folderName) {
            File folder = new File(appName + nameStr);
            if (!folder.exists()) {
                folder.mkdirs();
            }
        }

        File langFile = new File(appName + "/langs/languages.tsv");
        if(!langFile.exists()) {
            try {
                System.out.println("languages.tsv: " + langFile.createNewFile());
            } catch (IOException e){
                System.out.println(e);
            }
        }

        File configFile = new File(appName + "/config.json");
        if(!configFile.exists()) {
            try {
                System.out.println("config.json: " + configFile.createNewFile());
                FileOutputStream fos = null;
                fos = new FileOutputStream(configFile);
                String result = "{\"app\":{" +
                        "\"id\":\"" + data.get("app_id").toString() + "\"," +
                        "\"name\":\"" + data.get("app_name").toString() + "\"," +
                        "\"type\":1," +
                        "\"description\":\"" + data.get("description").toString() + "\"," +
                        "\"version\":\"1.0\"}," +
                        "\"functions\":[]," +
                        "\"tags\":[\"" + data.get("tag_id").toString() + "\"]}";
                fos.write(result.getBytes());
                fos.flush();
                fos.close();
            } catch (IOException e){
                System.out.println(e);
            }
        }
    }
}
