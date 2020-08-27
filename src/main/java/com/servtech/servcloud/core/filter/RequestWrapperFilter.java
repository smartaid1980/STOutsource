package com.servtech.servcloud.core.filter;

import com.google.common.io.ByteStreams;
import com.google.common.io.CharStreams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.io.*;

/**
 * Created by Hubert
 * Datetime: 2015/10/22 上午 11:38
 */
public class RequestWrapperFilter implements Filter {
    private static final Logger log = LoggerFactory.getLogger(RequestWrapperFilter.class);

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;

        if ("application/json".equals(request.getHeader("Content-Type"))) {
            BodyCachedRequestWrapper requestWrapper = new BodyCachedRequestWrapper(request);
            filterChain.doFilter(requestWrapper, servletResponse);
        } else {
            filterChain.doFilter(request, servletResponse);
        }
    }

    @Override
    public void destroy() {

    }

    public static class BodyCachedRequestWrapper extends HttpServletRequestWrapper {
        private ByteArrayOutputStream cachedBaos = new ByteArrayOutputStream();

        public BodyCachedRequestWrapper(HttpServletRequest request) {
            super(request);

            try {
                ByteStreams.copy(request.getInputStream(), this.cachedBaos);
            } catch (IOException e) {
                log.warn(e.getMessage(), e);
            }
        }

        @Override
        public ServletInputStream getInputStream() throws IOException {
            final ByteArrayInputStream bais = new ByteArrayInputStream(this.cachedBaos.toByteArray());
            return new ServletInputStream() {
                @Override
                public int read() throws IOException {
                    return bais.read();
                }
            };
        }

        @Override
        public BufferedReader getReader() throws IOException {
            return new BufferedReader(new InputStreamReader(getInputStream(), getCharacterEncoding()));
        }
    }

}
