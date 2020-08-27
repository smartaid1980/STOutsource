package com.servtech.servcloud.app.bean.huangliang_matStock;

import java.util.List;

/**
 * Created by Frank on 2019/11/13.
 */
public class Schedule {
    private String orderId;
    private String scheduleTime;
    private String expMdate;
    private String expEdate;
    private String machineId;
    private String woMTime;
    private String purpose;
    private String scheduleQuantity;
    private String mQty;

    //特徵記錄用
    private int productTimes = 0;
    private String productId;
    private String pgSeq = "0";
    private String label;
    private String expDate;
    private int stdHour = 0;
    private int preQty = 0;
    private int conflictScheduleByFullQtyNum = 0;
    private int conflictScheduleByHalfQtyNum = 0;
    private int mayScheduleByCusPriority = 0;
    private int isSelected = 0;
    private List<String> oldExpEdates;
    private boolean enablePrioritySchedule = false;

    public Schedule() {

    }

    public Schedule(String orderId, String scheduleTime, String expMdate, String expEdate, String woMTime, String machineId, String mQty, String expDate, String productId) {
        this.orderId = orderId;
        this.scheduleTime = scheduleTime;
        this.expEdate = expEdate;
        this.expMdate = expMdate;
        this.woMTime = woMTime;
        this.machineId = machineId;
        this.mQty = mQty;
        this.expDate = expDate;
        this.productId = productId;
    }

    public Schedule(String orderId, String scheduleTime, String expMdate, String expEdate, String woMTime, String machineId, String scheduleQuantity) {
        this.orderId = orderId;
        this.scheduleTime = scheduleTime;
        this.expEdate = expEdate;
        this.expMdate = expMdate;
        this.woMTime = woMTime;
        this.machineId = machineId;
        this.scheduleQuantity = scheduleQuantity;
    }

    public Schedule(String orderId, String scheduleTime, String expMdate, String expEdate, String woMTime, String machineId) {
        this.orderId = orderId;
        this.scheduleTime = scheduleTime;
        this.expEdate = expEdate;
        this.expMdate = expMdate;
        this.woMTime = woMTime;
        this.machineId = machineId;
    }

    public Schedule(String machineId, String expMdate, String expEdate, int productTimes, String productId, String orderId, String pgSeq, int preQty, String expDate) {
        this.machineId = machineId;
        this.expMdate = expMdate;
        this.expEdate = expEdate;
        this.productTimes = productTimes;
        this.productId = productId;
        this.orderId = orderId;
        this.pgSeq = pgSeq;
        this.preQty = preQty;
        this.expDate = expDate;
    }

    public String getMachineId() {
        return machineId;
    }

    public void setMachineId(String machineId) {
        this.machineId = machineId;
    }

    public String getWoMTime() {
        return woMTime;
    }

    public void setWoMTime(String woMTime) {
        this.woMTime = woMTime;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public void setScheduleTime(String scheduleTime) {
        this.scheduleTime = scheduleTime;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public void setExpMdate(String expMdate) {
        this.expMdate = expMdate;
    }

    public void setExpEdate(String expEdate) {
        this.expEdate = expEdate;
    }

    public String getOrderId() {
        return orderId;
    }

    public String getScheduleTime() {
        return scheduleTime;
    }

    public String getPurpose() {
        return purpose;
    }

    public String getExpMdate() {
        return expMdate;
    }

    public String getExpEdate() {
        return expEdate;
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

    public String getPgSeq() {
        return pgSeq;
    }

    public void setPgSeq(String pgSeq) {
        this.pgSeq = pgSeq;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
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

    public int getConflictScheduleByFullQtyNum() {
        return conflictScheduleByFullQtyNum;
    }

    public void setConflictScheduleByFullQtyNum(int conflictScheduleByFullQtyNum) {
        this.conflictScheduleByFullQtyNum = conflictScheduleByFullQtyNum;
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

    public int getIsSelected() {
        return isSelected;
    }

    public void setIsSelected(int isSelected) {
        this.isSelected = isSelected;
    }

    public List<String> getOldExpEdates() {
        return oldExpEdates;
    }

    public void setOldExpEdates(List<String> oldExpEdates) {
        this.oldExpEdates = oldExpEdates;
    }

    public boolean isEnablePrioritySchedule() {
        return enablePrioritySchedule;
    }

    public void setEnablePrioritySchedule(boolean enablePrioritySchedule) {
        this.enablePrioritySchedule = enablePrioritySchedule;
    }

    public String getExpDate() {
        return expDate;
    }

    public void setExpDate(String expDate) {
        this.expDate = expDate;
    }
}
