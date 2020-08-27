package com.servtech.servcloud.core.service.license.impl;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.servtech.servcloud.core.service.license.LicenseModeService;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;

/**
 * Created by Raynard on 2018/1/8.
 */
public class LicenseModeNotMonitorAndNewReport implements LicenseModeService {
    private static final Logger log = LoggerFactory.getLogger(LicenseModeNotMonitorAndNewReport.class);
    @Override
    public void check(HttpServletRequest request, HttpServletResponse response, String requestPath) {
        try {
            if (requestPath.startsWith("/api/mqttpool/data")) {
                RequestResult<String> unvalidateResult = RequestResult.unvalidate();
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().print(unvalidateResult.toJson());
                response.flushBuffer();
            } else {

            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    static {
        log.info("License Mode : " + "Not View Monitor and Query new Report");
    }
}
