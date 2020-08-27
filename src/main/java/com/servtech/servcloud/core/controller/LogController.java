package com.servtech.servcloud.core.controller;

import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.log4j.PropertyConfigurator;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by Hubert
 * Datetime: 2015/7/10 下午 02:47
 */
@RestController
@RequestMapping("/log")
public class LogController {

    @RequestMapping(value = "/refresh", method = RequestMethod.GET)
    public RequestResult<String> refresh() {
        String configPath = System.getProperty(SysPropKey.ROOT_PATH) + "/WEB-INF/classes/log4j.properties";
        PropertyConfigurator.configure(configPath);
        return RequestResult.success("成功");
    }

}
