package com.servtech.servcloud.app.controller.serv_market;

/**
 * Created by RDTest01(Vincent) on 2015/10/8.
 */
public class Progress {

    int total = 1;

    int resolve = 0;

    public Progress() {

    }

    public Progress(int total) {
        this.total = total;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public int getResolve() {
        return resolve;
    }

    public void setResolve(int resolve) {
        this.resolve = resolve;
    }

    public void update(int resolve) {
        this.resolve = resolve;
    }

    public double getResult() {
        return resolve / total * 100.0;
    }
}
