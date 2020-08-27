package com.servtech.servcloud.tank.slave.service;

import com.servtech.servcloud.tank.master.service.exception.FailException;

/**
 * Created by hubertlu on 2017/3/21.
 */
public interface MasterService {

    /**
     * ping master
     *
     * @param masterIp
     * @param masterPort
     * @throws FailException
     */
    void ping(String masterIp, int masterPort) throws FailException;
}
