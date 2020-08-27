package com.servtech.servcloud.core.util;


import javax.servlet.http.HttpServletRequest;

/**
 * Created by Hubert
 * Datetime: 2015/7/10 下午 03:01
 */
public class Cookie {

    public static String get(HttpServletRequest request, String name) {
        for (javax.servlet.http.Cookie cookie : request.getCookies()) {
            if (cookie.getName().equals(name)) {
                return cookie.getValue();
            }
        }
        return "";
    }

}
