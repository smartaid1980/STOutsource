package com.servtech.servcloud.app.controller.huangliang_matStock.bean;

/**
 * Created by Frank on 2019/12/30.
 */
public class Recommend {
    private String machineId;
    private String startTime;
    private String endTime;
    private boolean isMatchData;
    private String code;

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


    public void setIsMatchData(boolean isMatchData) {
        this.isMatchData = isMatchData;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
