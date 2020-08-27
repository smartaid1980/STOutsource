package com.servtech.servcloud.connect.bean;

/**
 * Created by hubertlu on 2017/3/14.
 */
public class Response<T> {
    private static final String SUCCESS = "success";
    private static final String FAIL = "fail";

    private String status;
    private T data;
    private String message;

    private Response(String status, T data, String message) {
        this.status = status;
        this.data = data;
        this.message = message;
    }

    public static <Void> Response<Void> success() {
        return success(null);
    }

    public static <T> Response<T> success(T data) {
        return success(data, null);
    }

    public static <T> Response<T> success(T data, String message) {
        return new Response<T>(SUCCESS, data, message);
    }

    public static <Void> Response<Void> fail() {
        return fail(null);
    }

    public static <Void> Response<Void> fail(String message) {
        return new Response<Void>(FAIL, null, message);
    }
}
