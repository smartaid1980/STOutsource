package com.servtech.servcloud.app.controller.huangliang_matStock.bean;

/**
 * Created by Frank on 2019/12/30.
 */
public class Request {
    private String machineId;
    private String startTime;
    private String endTime;

    public String getMachineId() {
        return machineId;
    }

    public void setMachineId(String machineId) {
        this.machineId = machineId;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
}
