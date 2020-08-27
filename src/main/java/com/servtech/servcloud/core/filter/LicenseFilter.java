package com.servtech.servcloud.core.filter;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.servtech.servcloud.core.service.license.LicenseModeService;
import com.servtech.servcloud.core.service.license.LicenseModeServiceFactory;
import com.servtech.servcloud.core.service.license.SyncLicenseService;
import com.servtech.servcloud.core.service.license.SyncLicenseServiceFactory;
import com.servtech.servcloud.core.service.license.exception.UpdateException;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

/**
 * Created by Hubert
 * Datetime: 2016/2/15 上午 09:38
 */
public class LicenseFilter implements Filter {
    private static final Logger log = LoggerFactory.getLogger(LicenseFilter.class);
    private static long lastUpdateDateMillis;
    private SyncLicenseService syncLicenseService;
    private LicenseModeService licenseModeService;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        syncLicenseService =
                SyncLicenseServiceFactory.create(filterConfig.getServletContext().getInitParameter("license"));
        licenseModeService = LicenseModeServiceFactory.create();
        updateLastDateMillis();
    }

    @Override
    public void doFilter(ServletRequest servletRequest,
                         ServletResponse servletResponse,
                         FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        String requestPath = request.getRequestURI().substring(request.getContextPath().length());

        // LICENSE_DATE 內容以經存在表示已通過驗證，所以要確認每天自動更新一次
        if (!System.getProperty(SysPropKey.LICENSE_DATE).isEmpty()) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                Date licenseDate = sdf.parse(System.getProperty(SysPropKey.LICENSE_DATE));
                if (System.currentTimeMillis() - licenseDate.getTime() > 0) {
                        licenseModeService.check(request, response, requestPath);
                } else {
                    if (!requestPath.endsWith("api/license/update")) { // 並非手動按下同步
                        if (System.currentTimeMillis() - lastUpdateDateMillis > 86400000l) { // 超過一天
                            try {
                                updateLastDateMillis();
                                syncLicenseService.update(System.getProperty(SysPropKey.SERVCLOUD_ID));
                            } catch (UpdateException e) {
                                e.printStackTrace();
                            }
                        }
                    } else {
                        updateLastDateMillis();
                    }
                }
            } catch (ParseException e) {
                licenseModeService.check(request, response, requestPath);
                e.printStackTrace();
            }
            filterChain.doFilter(servletRequest, servletResponse);

            // LICENSE_DATE 確定為空，尚未通過驗證，且又是這三個 url，直接通過
        } else if (requestPath.endsWith("validate.html") ||
                requestPath.endsWith("api/license/validate") ||
                requestPath.equals("/")) {
            filterChain.doFilter(servletRequest, servletResponse);

            // LICENSE_DATE 確定為空，又不是以上三個 url，就判斷分別該怎麼回應
        } else {
            if (requestPath.endsWith(".html")) {
                File validateFile = new File(System.getProperty(SysPropKey.ROOT_PATH), "validate.html");
                String validateHtml = Files.toString(validateFile, Charsets.UTF_8);
                response.setCharacterEncoding("UTF-8");
                response.setContentType("text/html");
                response.getWriter().print(validateHtml);
            } else {
                RequestResult<String> unvalidateResult = RequestResult.unvalidate();
                response.setCharacterEncoding("UTF-8");
                response.setContentType("application/json");
                response.getWriter().print(unvalidateResult.toJson());
            }
        }
    }

    @Override
    public void destroy() {

    }

    private void updateLastDateMillis() {
        Calendar c = Calendar.getInstance();
        c.setTime(new Date());
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        lastUpdateDateMillis = c.getTimeInMillis();
        log.info("最後同步 License 日期: " + new SimpleDateFormat("yyyy/MM/dd HH:mm:ss.SSS").format(c.getTime()));
    }
}
