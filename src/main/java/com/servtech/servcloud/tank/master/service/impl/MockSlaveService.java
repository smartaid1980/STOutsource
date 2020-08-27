package com.servtech.servcloud.tank.master.service.impl;

import com.servtech.servcloud.tank.bean.Packet;
import com.servtech.servcloud.tank.master.service.SlaveService;
import com.servtech.servcloud.tank.master.service.exception.FailException;
import com.servtech.servcloud.tank.slave.controller.SlaveConfigController;

/**
 * Created by hubertlu on 2017/3/21.
 */
public class MockSlaveService implements SlaveService {

    @Override
    public String ping(String slaveIp, int slavePort) throws FailException {
        return "ServCoreId_" + slaveIp.replaceAll("\\.", "") + slavePort;
    }

    @Override
    public String add(String masterIp, int masterPort, String slaveIp, int slavePort, String topicName) throws FailException {
        return  "ServCoreId_" + slaveIp.replaceAll("\\.", "") + slavePort;
    }

    @Override
    public void delete(String slaveIp, int slavePort) throws FailException {

    }

    @Override
    public void syncFactory(String slaveIp, int slavePort, String coreId, String uuid) throws FailException {
//        return  "ServCoreId_" + slaveIp.replaceAll("\\.", "") + slavePort;
    }

    @Override
    public SlaveConfigController.SyncData getLastResult(String slaveIp, int slavePort, String coreId, String uuid) {
        return null;
    }
}
