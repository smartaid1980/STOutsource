package com.servtech.servcloud.tank.slave.service.impl;

import com.servtech.servcloud.tank.bean.Packet;
import com.servtech.servcloud.tank.master.service.exception.FailException;
import com.servtech.servcloud.tank.slave.service.MasterService;
import org.javalite.http.Http;
import org.javalite.http.Request;

/**
 * Created by hubertlu on 2017/3/21.
 */
public class HttpMasterService implements MasterService {

    @Override
    public void ping(String masterIp, int masterPort) throws FailException {
        Request get = Http.get("http://" + masterIp + ":" + masterPort + "/ServCloud/api/tank/master/slaveCheck?stkey=9bb0b99adcf44e0ef05e13fc170450cb");
        try {
            Packet packet = Packet.from(get.text());
            if (packet.type != 0) {
                throw new FailException(packet.data);
            }
        } catch (Exception e) {
            throw new FailException(e.getMessage(), e);
        }
    }

}
