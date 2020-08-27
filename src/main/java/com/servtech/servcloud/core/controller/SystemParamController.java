package com.servtech.servcloud.core.controller;

import com.google.gson.Gson;
import com.servtech.servcloud.core.exception.JsonParamsException;
import com.servtech.servcloud.core.exception.LeanConfigException;
import com.servtech.servcloud.core.util.JsonParams;
import com.servtech.servcloud.core.util.LeanConfigParam;
import com.servtech.servcloud.core.util.RawDataIndices;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

import static com.servtech.servcloud.core.util.SysPropKey.*;

/**
 * Created by Hubert
 * Datetime: 2015/7/13 上午 11:26
 */
@RestController
@RequestMapping("/sysparam")
public class SystemParamController {
    private static final Logger log = LoggerFactory.getLogger(SystemParamController.class);

    @RequestMapping(value = "/platformid", method = RequestMethod.GET)
    public RequestResult<String> getPlatformId() {
        String platformId = System.getProperty(SERVCLOUD_ID);

        if (platformId.isEmpty()) {
            return RequestResult.fail(platformId);
        }

        return RequestResult.success(platformId);
    }

    @RequestMapping(value = "/datapath", method = RequestMethod.GET)
    public RequestResult<String> getDataPath() {
        String dataPath = System.getProperty(DATA_PATH);

        if (dataPath.isEmpty()) {
            return RequestResult.fail(dataPath);
        }

        return RequestResult.success(dataPath);
    }

    @RequestMapping(value = "/refresh", method = RequestMethod.GET)
    public RequestResult<?> systemParamRefresh() {

        try {
            JsonParams jsonParams = new JsonParams("system_param.json");
            System.setProperty(DB_JNDI_NAME, jsonParams.getAsString("DB_JNDI_NAME"));
            System.setProperty(DATA_PATH, jsonParams.getAsString("DATA_PATH"));
            System.setProperty(CUST_PARAM_PATH, jsonParams.getAsString("CUST_PARAM_PATH"));

        } catch (Exception e) {
            log.warn(e.getMessage(), e);
            return RequestResult.fail("失敗 - 請檢查 WEB-INF/classes/system_param.json");
        }

        try {
            JsonParams jsonParams = new JsonParams(System.getProperty(CUST_PARAM_PATH), "param/system_param.json");

            System.setProperty(SERV_CUSTOMER_HOST, jsonParams.getAsString("SERV_CUSTOMER_HOST"));
            System.setProperty(SERV_BOX_PATH, jsonParams.getAsString("SERV_BOX_PATH"));
            System.setProperty(SERV_BOX_RESTART_TOOL_EXE, jsonParams.getAsString("SERV_BOX_RESTART_TOOL_EXE"));

        } catch (Exception e) {
            log.warn(e.getMessage(), e);
            return RequestResult.fail("失敗 - 請檢查 cust_data/param/system_param.json");
        }

        try {
            JsonParams jsonParams = new JsonParams("system_param.json");
            System.setProperty(DB_JNDI_NAME, jsonParams.getAsString("DB_JNDI_NAME"));
            System.setProperty(DATA_PATH, jsonParams.getAsString("DATA_PATH"));
            System.setProperty(CUST_PARAM_PATH, jsonParams.getAsString("CUST_PARAM_PATH"));

            JsonParams custJsonParams = new JsonParams(System.getProperty(CUST_PARAM_PATH), "param/system_param.json");
            System.setProperty(SERV_CUSTOMER_HOST, custJsonParams.getAsString("SERV_CUSTOMER_HOST"));
            System.setProperty(SERV_BOX_PATH, custJsonParams.getAsString("SERV_BOX_PATH"));
            System.setProperty(SERV_BOX_RESTART_TOOL_EXE, custJsonParams.getAsString("SERV_BOX_RESTART_TOOL_EXE"));
        } catch (Exception e) {
            return RequestResult.fail("失敗 - 請檢查 WEB-INF/classes/system_param.json");
        }

        try {
            LeanConfigParam.LeanConfig  leanConfig = LeanConfigParam.getLeanConfig();
            System.setProperty(SERVCLOUD_ID, leanConfig.id);
            System.setProperty(MQTT_IP, leanConfig.ip);
            System.setProperty(MQTT_PORT, leanConfig.port);
        } catch (Exception e) {
            log.warn(e.getMessage(), e);
            return RequestResult.fail("失敗 - 請檢查 " + LeanConfigParam.getFile().getAbsolutePath());
        }

        System.setProperty(RAW_DATA_INDICES, new Gson().toJson(RawDataIndices.read()));

        try {
            JsonParams jsonParams = new JsonParams(System.getProperty(CUST_PARAM_PATH), "param/rawdata_param.json");
            System.setProperty(RAW_DATA_PARTCOUNT_WHICH_INDEX, jsonParams.getAsString("partcountWhichColumn"));
        } catch (Exception e) {
            log.warn(e.getMessage(), e);
            return RequestResult.fail("失敗 - 請檢查 cust_param/param/rawdata_param.json");
        }

        HippoService.reset();

        Map<String, String> result = new HashMap<String, String>();
        result.put(DB_JNDI_NAME, System.getProperty(DB_JNDI_NAME));
        result.put(DATA_PATH, System.getProperty(DATA_PATH));
        result.put(CUST_PARAM_PATH, System.getProperty(CUST_PARAM_PATH));
        result.put(SERV_CUSTOMER_HOST, System.getProperty(SERV_CUSTOMER_HOST));
        result.put(SERV_BOX_PATH, System.getProperty(SERV_BOX_PATH));
        result.put(SERV_BOX_RESTART_TOOL_EXE, System.getProperty(SERV_BOX_RESTART_TOOL_EXE));
        result.put(SERVCLOUD_ID, System.getProperty(SERVCLOUD_ID));
        result.put(MQTT_IP, System.getProperty(MQTT_IP));
        result.put(MQTT_PORT, System.getProperty(MQTT_PORT));
        result.put(RAW_DATA_INDICES, System.getProperty(RAW_DATA_INDICES));
        result.put(RAW_DATA_PARTCOUNT_WHICH_INDEX, System.getProperty(RAW_DATA_PARTCOUNT_WHICH_INDEX));

        return RequestResult.success(result);

    }
}
