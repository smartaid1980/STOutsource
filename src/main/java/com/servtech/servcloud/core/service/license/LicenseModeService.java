package com.servtech.servcloud.core.service.license;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by Raynard on 2018/1/8.
 */
public interface LicenseModeService {
    void check (HttpServletRequest request, HttpServletResponse response, String requestPath);
}
