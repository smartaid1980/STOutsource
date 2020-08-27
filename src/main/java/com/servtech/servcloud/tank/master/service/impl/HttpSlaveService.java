package com.servtech.servcloud.tank.master.service.impl;

import com.servtech.servcloud.tank.bean.Packet;
import com.servtech.servcloud.tank.master.service.SlaveService;
import com.servtech.servcloud.tank.master.service.exception.FailException;
import com.servtech.servcloud.tank.slave.controller.SlaveConfigController;
import org.javalite.http.Http;
import org.javalite.http.Request;

/**
 * Created by hubertlu on 2017/3/20.
 */
public class HttpSlaveService implements SlaveService {

    @Override
    public String ping(String slaveIp, int slavePort) throws FailException {
        Request get = Http.get("http://" + slaveIp + ":" + slavePort + "/ServCloud/api/tank/slave/ping?stkey=9bb0b99adcf44e0ef05e13fc170450cb");
        try {
            Packet packet = Packet.from(get.text());
            if (packet.type == 0) {
                return packet.data;
            } else {
                throw new FailException(packet.data);
            }
        } catch (Exception e) {
            throw new FailException(e.getMessage(), e);
        }
    }

    @Override
    public String add(String masterIp, int masterPort, String slaveIp, int slavePort, String topicName) throws FailException {
        String body = "{" +
                      "  \"ip\":\"" + masterIp + "\"," +
                      "  \"port\":" + masterPort + "," +
                      "  \"topicName\":\"" + topicName +"\"," +
                      "  \"stkey\":\"9bb0b99adcf44e0ef05e13fc170450cb\"" +
                      "}";
        Request post = Http.post("http://" + slaveIp + ":" + slavePort + "/ServCloud/api/tank/slave", body.getBytes(), 10000, 10000);
        post.header("Content-Type", "application/json");

        try {
            Packet packet = Packet.from(post.text());
            if (packet.type == 0) {
                return packet.data;
            } else {
                throw new FailException(packet.data);
            }
        } catch (Exception e) {
            throw new FailException(e.getMessage(), e);
        }
    }

    @Override
    public void delete(String slaveIp, int slavePort) throws FailException {
        Request delete = Http.delete("http://" + slaveIp + ":" + slavePort + "/ServCloud/api/tank/slave?stkey=9bb0b99adcf44e0ef05e13fc170450cb");
        try {
            Packet packet = Packet.from(delete.text());
            if (packet.type != 0) {
                throw new FailException(packet.data);
            }
        } catch (Exception e) {
            throw new FailException(e.getMessage(), e);
        }
    }

    @Override
    public void syncFactory(String slaveIp, int slavePort, String coreId, String uuid) throws FailException {
        Request get = Http.get("http://" + slaveIp + ":" + slavePort + "/ServCloud/api/tank/slave/syncFactory?uuid="+ uuid +"&stkey=9bb0b99adcf44e0ef05e13fc170450cb");
        get.text();
    }

    @Override
    public SlaveConfigController.SyncData getLastResult(String slaveIp, int slavePort, String coreId, String uuid) {
        Request get = Http.get("http://" + slaveIp + ":" + slavePort + "/ServCloud/api/tank/slave/lastResult?uuid="+ uuid +"&stkey=9bb0b99adcf44e0ef05e13fc170450cb");
        SlaveConfigController.SyncData syncData = SlaveConfigController.SyncData.from(get.text());
        return syncData;

    }

}
