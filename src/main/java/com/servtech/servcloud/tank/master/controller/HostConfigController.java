package com.servtech.servcloud.tank.master.controller;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.core.mqtt.MQTTManager;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.tank.master.service.SlaveService;
import com.servtech.servcloud.tank.master.service.exception.FailException;
import com.servtech.servcloud.tank.master.service.impl.HttpSlaveService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.Type;
import java.util.*;

/**
 * Created by Jenny on 2017/6/5.
 */
@RestController
@RequestMapping("/tank/master/host")
public class HostConfigController {
    private static final Logger LOG = LoggerFactory.getLogger(HostConfigController.class);
    private static File hostConfigFile = new File(System.getProperty(SysPropKey.CUST_PARAM_PATH), "serv_tank/host.json");

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public RequestResult<String> update(@RequestBody HostConfig hostConfig) {
        try {
            HostConfig.marshall(hostConfig);
        } catch (Exception e) {
            LOG.warn(e.getMessage(), e);
            return RequestResult.fail(e.getMessage());
        }
        return RequestResult.success();
    }

    @RequestMapping(value = "/get", method = RequestMethod.GET)
    public RequestResult<HostConfig[]> get() throws Exception {
        if (hostConfigFile.exists()) {
            HostConfig hostConfig = HostConfig.unmarshall();
            return RequestResult.success(new HostConfig[]{hostConfig});
        }

        return RequestResult.success(new HostConfig[]{new HostConfig()});
    }

    private static class HostConfig {
        String ip;
        int port;

        static HostConfig unmarshall() {
            if (hostConfigFile.exists()) {
                try {
                    Type type = new TypeToken<HostConfig>(){}.getType();
                    String json = Files.toString(hostConfigFile, Charsets.UTF_8);
                    return new Gson().fromJson(json, type);
                } catch (IOException e) {
                    LOG.warn(e.getMessage(), e);
                }
            }
            return new HostConfig();
        }

        static void marshall(HostConfig hostConfigs) {
            if (!hostConfigFile.exists()) {
                hostConfigFile.getParentFile().mkdirs();
                try {
                    hostConfigFile.createNewFile();
                } catch (IOException e) {
                    LOG.warn(e.getMessage(), e);
                }
            }
            String json = new GsonBuilder().setPrettyPrinting().create().toJson(hostConfigs);
            try {
                Files.write(json, hostConfigFile, Charsets.UTF_8);
            } catch (IOException e) {
                LOG.warn(e.getMessage(), e);
            }
        }
    }
}
