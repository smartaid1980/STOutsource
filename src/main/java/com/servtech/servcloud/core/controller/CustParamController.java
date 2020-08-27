package com.servtech.servcloud.core.controller;

import com.google.gson.*;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.FileReader;

import static com.servtech.servcloud.core.util.SysPropKey.*;

/**
 * Created by Jenny
 * Datetime: 2017/2/10 下午 18:02
 */
@RestController
@RequestMapping("/custparam")
public class CustParamController {
    private static final Logger log = LoggerFactory.getLogger(CustParamController.class);

    @RequestMapping(value = "/showdemoconfig", method = RequestMethod.GET)
    public RequestResult<?> showdemoconfig() {

        try {
            File file = new File(System.getProperty(CUST_PARAM_PATH), "param/showdemo_config.json");
            FileReader fileReader = new FileReader(file);
            JsonObject jsonObject = (JsonObject) new JsonParser().parse(fileReader);
            fileReader.close();
            return RequestResult.success(jsonObject);
        } catch (Exception e) {
            return RequestResult.fail("失敗 - 請檢查 cust_param/param/system_param.json");
        }

    }
}
