package com.servtech.servcloud.app.controller.servtrack;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;

/**
 * Created by Frank on 2017/8/9.
 */

@RestController
@RequestMapping("/servtrack/tabletparam")
public class ServtrackTabletParamController {

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/getconfig", method = RequestMethod.GET)
    public RequestResult<?> getconfig() {
        try {
            InputStreamReader isr = new InputStreamReader(new FileInputStream(System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/param/tablet_config.json"), "UTF-8");
            BufferedReader br = new BufferedReader(isr);
            JsonObject jsonObject = (JsonObject) new JsonParser().parse(br);
            br.close();
            isr.close();
            return RequestResult.success(jsonObject);
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail("失敗 - 請檢查 C:/Servtech/Servolution/Platform/cust_param/param/tablet_config.json");
        }
    }
}
