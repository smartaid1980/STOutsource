package com.servtech.servcloud.tank.master.service.exception;

/**
 * Created by hubertlu on 2017/3/20.
 */
public class FailException extends Exception {
    public FailException(String message) {
        super(message);
    }

    public FailException(String message, Throwable cause) {
        super(message, cause);
    }
}
