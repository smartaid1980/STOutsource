package com.servtech.servcloud.app.controller.huangliang_matStock.bean;

import com.servtech.servcloud.app.bean.huangliang_matStock.Schedule;

import java.util.List;
import java.util.Map;

/**
 * Created by Frank on 2019/12/30.
 */
public class RecommendResult {
    private Map<String, Object> status;
    private List<Schedule> featureList;
    private Map<String, Object> checkStatus;
    private Schedule checkResult;

    public Map<String, Object> getCheckStatus() {
        return checkStatus;
    }

    public void setCheckStatus(Map<String, Object> checkStatus) {
        this.checkStatus = checkStatus;
    }

    public Schedule getCheckResult() {
        return checkResult;
    }

    public void setCheckResult(Schedule checkResult) {
        this.checkResult = checkResult;
    }

    public Map<String, Object> getStatus() {
        return status;
    }

    public void setStatus(Map<String, Object> status) {
        this.status = status;
    }

    public List<Schedule> getFeatureList() {
        return featureList;
    }

    public void setFeatureList(List<Schedule> featureList) {
        this.featureList = featureList;
    }
}
