package com.servtech.servcloud.core.filter;

import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Created by Hubert
 * Datetime: 2015/7/2 下午 15:02
 */
public class ExceptionHandlerFilter implements Filter {
    private final Logger logger = LoggerFactory.getLogger(ExceptionHandlerFilter.class);

    private boolean printStackTrace;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        this.printStackTrace = Boolean.parseBoolean(filterConfig.getInitParameter("printStackTrace"));
    }

    @Override
    public void doFilter(ServletRequest servletRequest,
                         ServletResponse servletResponse,
                         FilterChain filterChain) throws IOException, ServletException {
        try {
            filterChain.doFilter(servletRequest, servletResponse);
        } catch (Throwable e) {
            String expMsg = e.getMessage();
            RequestResult<String> requestResult = RequestResult.exception(expMsg);

            HttpServletResponse response = (HttpServletResponse) servletResponse;
            HttpServletRequest request = ((HttpServletRequest) servletRequest);

            if (printStackTrace) {
                logger.warn("Exception cause API: " + request.getRequestURI(), e);
            } else {
                logger.warn("Exception cause API: " + request.getRequestURI() + "; With message: " + expMsg);
            }

            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json");
            response.getWriter().print(requestResult.toJson());

        }
    }

    @Override
    public void destroy() {

    }
}
