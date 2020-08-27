package com.servtech.servcloud.core.service.license.impl;

import com.servtech.servcloud.core.service.license.LicenseModeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by Raynard on 2018/1/8.
 */
public class LicenseModeNotNewReport implements LicenseModeService {
    private static final Logger log = LoggerFactory.getLogger(LicenseModeNotNewReport.class);
    @Override
    public void check(HttpServletRequest request, HttpServletResponse response, String requestPath) {

    }

    static {
        log.info("License Mode : " + "Not Query New Report");
    }
}
