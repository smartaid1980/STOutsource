package com.servtech.servcloud.connect.service;

/**
 * Created by hubertlu on 2017/3/14.
 */
public interface Security {
    String check(String key);

    String getExpiration();
}
