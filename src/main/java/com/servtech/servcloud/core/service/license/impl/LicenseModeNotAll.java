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
import java.io.PrintWriter;

/**
 * Created by Raynard on 2018/1/8.
 */
public class LicenseModeNotAll implements LicenseModeService {
    private static final Logger log = LoggerFactory.getLogger(LicenseModeNotAll.class);
    @Override
    public void check(HttpServletRequest request, HttpServletResponse response, String requestPath) {
        try {
            if (requestPath.startsWith("/api")) {
                RequestResult<String> unvalidateResult = RequestResult.unvalidate();
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().print(unvalidateResult.toJson());
            } else {

                File validateFile = new File(System.getProperty(SysPropKey.ROOT_PATH), "licenseexpired.html");
                String validateHtml = Files.toString(validateFile, Charsets.UTF_8);
                response.setCharacterEncoding("UTF-8");
                response.setContentType("text/html");
                response.getWriter().print(validateHtml);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    static {
        log.info("License Mode : " + "Not All");
    }
}
