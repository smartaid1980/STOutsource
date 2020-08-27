package com.servtech.servcloud.app.controller.huangliang_matStock.bean;

/**
 * Created by Frank on 2020/1/30.
 */
public class Schedule {
    private String orderId;
    private String machineId;
    private String startTime;
    private String endTime;

    private int productTimes;
    private String productId;
    private String pgSeq;
    private String label;
    private int stdHour = 0;
    private int preQty = 0;
    private int conflictScheduleByAllQtyNum = 0;
    private int conflictScheduleByHalfQtyNum = 0;
    private int mayScheduleByCusPriority = 0;
    private boolean isConflictNonProduction = false;
    private int isSelected = 0;

    public Schedule(String label, String pgSeq, String startTime) {
        this.label = label;
        this.pgSeq = pgSeq;
        this.startTime = startTime;
    }

    public Schedule(String machineId, String endTime, int productTimes, String productId, String orderId) {
        this.machineId = machineId;
        this.endTime = endTime;
        this.productTimes = productTimes;
        this.productId = productId;
        this.orderId = orderId;
    }

    public Schedule() {

    }

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

    public String getPgSeq() {
        return pgSeq;
    }

    public void setPgSeq(String pgSeq) {
        this.pgSeq = pgSeq;
    }

    public int getProductTimes() {
        return productTimes;
    }

    public void setProductTimes(int productTimes) {
        this.productTimes = productTimes;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public int getStdHour() {
        return stdHour;
    }

    public void setStdHour(int stdHour) {
        this.stdHour = stdHour;
    }

    public int getPreQty() {
        return preQty;
    }

    public void setPreQty(int preQty) {
        this.preQty = preQty;
    }

    public int getConflictScheduleByAllQtyNum() {
        return conflictScheduleByAllQtyNum;
    }

    public void setConflictScheduleByAllQtyNum(int conflictScheduleByAllQtyNum) {
        this.conflictScheduleByAllQtyNum = conflictScheduleByAllQtyNum;
    }

    public int getConflictScheduleByHalfQtyNum() {
        return conflictScheduleByHalfQtyNum;
    }

    public void setConflictScheduleByHalfQtyNum(int conflictScheduleByHalfQtyNum) {
        this.conflictScheduleByHalfQtyNum = conflictScheduleByHalfQtyNum;
    }

    public int getMayScheduleByCusPriority() {
        return mayScheduleByCusPriority;
    }

    public void setMayScheduleByCusPriority(int mayScheduleByCusPriority) {
        this.mayScheduleByCusPriority = mayScheduleByCusPriority;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public int getIsSelected() {
        return isSelected;
    }

    public void setIsSelected(int isSelected) {
        this.isSelected = isSelected;
    }

    public boolean isConflictNonProduction() {
        return isConflictNonProduction;
    }

    public void setConflictNonProduction(boolean conflictNonProduction) {
        isConflictNonProduction = conflictNonProduction;
    }
}
