package com.servtech.servcloud.app.controller.huangliang_matStock.bean;

import java.util.List;
import java.util.Map;

/**
 * Created by Frank on 2019/12/30.
 */
public class ScheduleAnalysis {
    private Map<String, Object> smartAnalysis;
    private List<Schedule> featureList;

    public Map<String, Object> getSmartAnalysis() {
        return smartAnalysis;
    }

    public void setSmartAnalysis(Map<String, Object> smartAnalysis) {
        this.smartAnalysis = smartAnalysis;
    }

    public void setFeatureList(List<Schedule> featureList) {
        this.featureList = featureList;
    }

    public List<Schedule> getFeatureList() {
        return featureList;
    }
}
