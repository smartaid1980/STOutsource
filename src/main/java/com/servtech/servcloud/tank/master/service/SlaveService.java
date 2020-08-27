package com.servtech.servcloud.tank.master.service;

import com.servtech.servcloud.tank.bean.Packet;
import com.servtech.servcloud.tank.master.service.exception.FailException;
import com.servtech.servcloud.tank.slave.controller.SlaveConfigController;

/**
 * Created by hubertlu on 2017/3/20.
 */
public interface SlaveService {

    /**
     * ping slave
     *
     * @param slaveIp
     * @param slavePort
     * @return slave id
     * @throws FailException
     */
    String ping(String slaveIp, int slavePort) throws FailException;

    /**
     * 對 slave 做加入
     *
     * @param masterIp master ip
     * @param masterPort master port
     * @param slaveIp slave ip
     * @param slavePort slave port
     * @return slave id
     * @throws FailException
     */
    String add(String masterIp, int masterPort, String slaveIp, int slavePort, String topicName) throws FailException;

    /**
     * 把 slave 刪掉
     *
     * @param slaveIp master ip
     * @param slavePort master port
     * @throws FailException
     */
    void delete(String slaveIp, int slavePort) throws FailException;

    /**
     * slave Box plant Machine 資料 同歩 到 master
     *
     *
     * @param slaveIp master ip
     * @param slavePort master port
     * @throws FailException
     */

    void syncFactory(String slaveIp, int slavePort, String coreId, String uuid) throws FailException;


    SlaveConfigController.SyncData getLastResult(String slaveIp, int slavePort, String coreId, String uuid);
}
