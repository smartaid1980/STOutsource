package com.servtech.servcloud.core.controller;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.ServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Hubert
 * Datetime: 2016/1/28 下午 02:20
 */
@RestController
@RequestMapping("/js")
public class JsExportsController {
    public static final Logger log = LoggerFactory.getLogger(JsExportsController.class);

    @RequestMapping(value = "/{app}", method = RequestMethod.GET)
    public void getCommonJs(@PathVariable String app, ServletResponse response) throws IOException {
        response.setContentType("application/javascript");

        if (app.equals("overall")) {
            File overallCommonsDir = new File(System.getProperty(SysPropKey.ROOT_PATH), "js/servtech/commons");
            String commonsContent = "";
            if (overallCommonsDir.exists()) {
                commonsContent = getAllFileContent(overallCommonsDir.listFiles());
            }
            Writer writer = response.getWriter();
            writer.write(
                "window.servcloud_overall_commons = function (exports) {" + System.getProperty("line.separator") +
                    commonsContent + System.getProperty("line.separator") +
                "}");
            writer.close();

        } else {
            File appCommonsDir = new File(System.getProperty(SysPropKey.ROOT_PATH), "app/" + app + "/commons");
            String commonsContent = "";
            if (appCommonsDir.exists()) {
                commonsContent = getAllFileContent(appCommonsDir.listFiles());
            }
            Writer writer = response.getWriter();
            writer.write(
                "window.servcloud_" + app + "_commons = function (exports) {" + System.getProperty("line.separator") +
                    commonsContent + System.getProperty("line.separator") +
                "}");
            writer.close();
        }
    }

    @RequestMapping(value = "/containsDashboardApp", method = RequestMethod.GET)
    public RequestResult<List<String>> getContainsDashboardApp() {
        List<String> result = new ArrayList<String>();
        File appRootDir = new File(System.getProperty(SysPropKey.ROOT_PATH), "app");

        for (File appDir : appRootDir.listFiles()) {
            if (appDir.isDirectory() && new File(appDir, "dashboard").exists()) {
                result.add(appDir.getName());
            }
        }

        return RequestResult.success(result);
    }

    private String getAllFileContent(File[] files) {
        StringBuilder result = new StringBuilder();

        if (files != null) {
            for (File file : files) {
                try {
                    result.append(Files.toString(file, Charsets.UTF_8));
                } catch (IOException e) {
                    log.warn(e.getMessage(), e);
                }
            }
        }
        
        return result.toString();
    }

}
