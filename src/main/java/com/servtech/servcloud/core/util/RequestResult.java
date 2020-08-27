package com.servtech.servcloud.core.util;

import com.google.gson.Gson;

/**
 * Created by Hubert
 * Datetime: 2015/7/2 下午 15:02
 */
public class RequestResult<T> {
    public static final int TYPE_SUCCESS = 0;
    public static final int TYPE_FAIL = 1;
    public static final int TYPE_NO_LOGIN = 2;
    public static final int TYPE_LICENSE_MISMATCH = 3;
    public static final int TYPE_UNVALIDATE = 4;
    public static final int TYPE_EXCEPTION = 999;

    private int type;
    private T data;

    private RequestResult(int type, T data) {
        this.type = type;
        this.data = data;
    }

    public static <T> RequestResult<T> success() {
        return success(null);
    }

    public static <T> RequestResult<T> success(T data) {
        return new RequestResult<T>(TYPE_SUCCESS, data);
    }

    public static <T> RequestResult<T> fail(T data) {
        return new RequestResult<T>(TYPE_FAIL, data);
    }

    public static RequestResult noLogin() {
        return new RequestResult(TYPE_NO_LOGIN, null);
    }

    public static <T> RequestResult<T> licenseMismatch(T data) {
        return new RequestResult<T>(TYPE_LICENSE_MISMATCH, data);
    }

    public static <T> RequestResult<T> unvalidate() {
        return new RequestResult<T>(TYPE_UNVALIDATE, null);
    }

    public static <T> RequestResult<T> exception(T data) {
        return new RequestResult<T>(TYPE_EXCEPTION, data);
    }

    public String toJson() {
        return new Gson().toJson(this);
    }

    public int getType() {
        return type;
    }

    public T getData() {
        return data;
    }
}
