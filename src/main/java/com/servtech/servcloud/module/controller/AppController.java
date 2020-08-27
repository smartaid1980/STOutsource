package com.servtech.servcloud.module.controller;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.*;
import com.servtech.servcloud.module.model.SysAppInfo;
import com.servtech.servcloud.module.model.SysFunc;
import com.servtech.servcloud.module.service.app.AppUploadService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

import static org.springframework.web.bind.annotation.RequestMethod.*;
import static com.servtech.servcloud.core.util.RequestResult.*;

/**
 * Created by Hubert
 * Datetime: 2015/8/7 上午 09:44
 */
@RestController
@RequestMapping("/app")
public class AppController {

    private static final Logger log = LoggerFactory.getLogger(AppController.class);

    @Autowired
    private HttpServletRequest request;

    @Autowired
    @Qualifier("zipAppUploadService")
    private AppUploadService appUploadService;

    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> result = SysAppInfo.findAll().include(SysFunc.class).toMaps();

                String langTag = Cookie.get(request, "lang");
                for (Map map : result) {
                    String appNameKey = (String) map.get("app_name");
                    map.put("app_name", Language.get(langTag, appNameKey));

                    if(map.get("sys_funcs") != null) {
                        for (Map sysFuncs : (List<Map>) map.get("sys_funcs")) {
                            String funcNameKey = (String) sysFuncs.get("func_name");
                            sysFuncs.put("func_name", Language.get(langTag, funcNameKey));
                        }
                    }
                }

                return  success(result);
            }
        });
    }

    @RequestMapping(value = "/upload", method = POST)
    public RequestResult<String> upload(@RequestParam("file") MultipartFile file) {
        String uploader = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        appUploadService.setUploader(uploader);
        try {
            appUploadService.upload(file);
            return success();

        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/updateFunction", method = POST)
    public RequestResult<String> updateFunction(@RequestParam("file") MultipartFile file) {
        String uploader = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        appUploadService.setUploader(uploader);
        try {
            appUploadService.updateFunction(file);
            return success();

        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

}
