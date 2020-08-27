package com.servtech.servcloud.tank.master.controller;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.core.mqtt.MQTTManager;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.tank.bean.Packet;
import com.servtech.servcloud.tank.master.service.SlaveService;
import com.servtech.servcloud.tank.master.service.exception.FailException;
import com.servtech.servcloud.tank.master.service.impl.HttpSlaveService;
import com.servtech.servcloud.tank.slave.controller.SlaveConfigController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.Type;
import java.util.*;

import static com.servtech.servcloud.core.util.SysPropKey.SERVCLOUD_ID;

/**
 * Created by hubertlu on 2017/3/20.
 */
@RestController
@RequestMapping("/tank/master")
public class MasterConfigController {
    private static final Logger LOG = LoggerFactory.getLogger(MasterConfigController.class);
    private static File slavesConfigFile = new File(System.getProperty(SysPropKey.CUST_PARAM_PATH), "serv_tank/slaves.json");

    private SlaveService slaveService = new HttpSlaveService();

    @RequestMapping(value = "ping", method = RequestMethod.GET)
    public RequestResult<String> ping(@RequestParam("ip") String slaveIp,
                                      @RequestParam("port") int slavePort) {
        try {
            String slaveId = slaveService.ping(slaveIp, slavePort);
            return RequestResult.success(slaveId);

        } catch (FailException e) {
            return RequestResult.fail(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<String> add(@RequestBody SlaveConfig slaveConfig, HttpServletRequest request) {

        Host host = getHost();
        String topicName = System.getProperty(SERVCLOUD_ID);

        try {
            String slavePlatformId = slaveService.ping(slaveConfig.ip, slaveConfig.port);
            String slaveId = slaveService.add(host.ip, host.port, slaveConfig.ip, slaveConfig.port, (topicName + "_" + slavePlatformId+"D01"));

            slaveConfig.id = slaveId;
            slaveConfig.marshall();

            return RequestResult.success(slaveId);

        } catch (FailException e) {
            LOG.warn(e.getMessage(), e);
            return RequestResult.fail(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.DELETE)
    public RequestResult<?> delete(@RequestBody SlaveConfig slaveConfig) {
        try {
            slaveService.delete(slaveConfig.ip, slaveConfig.port);

            slaveConfig.remove();

            return RequestResult.success();

        } catch (FailException e) {
            return RequestResult.fail(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.GET)
    public RequestResult<Set<SlaveConfig>> getAll() throws Exception {
        if (slavesConfigFile.exists()) {
            Set<SlaveConfig> slaveConfigs = SlaveConfig.unmarshall();

            return RequestResult.success(slaveConfigs);
        }

        return RequestResult.success((Set<SlaveConfig>) new HashSet<SlaveConfig>());
    }

    @RequestMapping(value = "/servcoreAmount", method = RequestMethod.GET)
    public RequestResult<List<SlaveConfig>> getCoreAmount() {
        Set<SlaveConfig> slaveConfigSet = SlaveConfig.unmarshall();
        List<SlaveConfig> slaveConfigList = new ArrayList<SlaveConfig>(slaveConfigSet);

        Host host = getHost();
        int maxAmount = host.coreAmount;

        for (int i = 0; i < maxAmount - slaveConfigSet.size(); i++) {
            slaveConfigList.add(new SlaveConfig());
        }
        return RequestResult.success(slaveConfigList);
    }

    @RequestMapping(value = "/slaveCheck", method = RequestMethod.GET)
    public RequestResult<Void> slaveCheck() {
        return RequestResult.success();
    }

    @RequestMapping(value = "/syncFactory", method = RequestMethod.GET)
    public RequestResult<String> syncFactory(@RequestParam("ip") final String slaveIp,
                                             @RequestParam("port") final int slavePort,
                                             @RequestParam("id") final String cordId,
                                             HttpServletRequest request){
            final String uuid = UUID.randomUUID().toString().replace("-","");
            new Thread(new Runnable() {
                @Override
                public void run()  {
                    try {
                        slaveService.syncFactory(slaveIp, slavePort, cordId, uuid);
                    } catch (FailException e) {
                        e.printStackTrace();
                    }
                }
            }).start();
        return RequestResult.success(uuid);
    }

    @RequestMapping(value = "/lastResult", method = RequestMethod.GET)
    public RequestResult<SlaveConfigController.SyncData> lastResult(@RequestParam("ip") final String slaveIp,
                                            @RequestParam("port") final int slavePort,
                                            @RequestParam("id") final String cordId,
                                            @RequestParam("uuid") final String uuid,
                                             HttpServletRequest request){

        SlaveConfigController.SyncData result = slaveService.getLastResult(slaveIp, slavePort, cordId, uuid);

        if(result.getType() == 0) {
            return RequestResult.success(result);
        }else {
            return RequestResult.fail(result);
        }
    }



    private static class SlaveConfig {
        String id;
        String ip;
        int port;

        static Set<SlaveConfig> unmarshall() {
            if (slavesConfigFile.exists()) {
                try {
                    Type type = new TypeToken<Set<SlaveConfig>>(){}.getType();
                    String json = Files.toString(slavesConfigFile, Charsets.UTF_8);
                    return new Gson().fromJson(json, type);
                } catch (IOException e) {
                    LOG.warn(e.getMessage(), e);
                }
            }
            return new LinkedHashSet<SlaveConfig>();
        }

        static void marshall(Set<SlaveConfig> slaveConfigs) {
            if (!slavesConfigFile.exists()) {
                slavesConfigFile.getParentFile().mkdirs();
                try {
                    slavesConfigFile.createNewFile();
                } catch (IOException e) {
                    LOG.warn(e.getMessage(), e);
                }
            }
            String json = new GsonBuilder().setPrettyPrinting().create().toJson(slaveConfigs);
            try {
                Files.write(json, slavesConfigFile, Charsets.UTF_8);
            } catch (IOException e) {
                LOG.warn(e.getMessage(), e);
            }
        }

        void marshall() {
            Set<SlaveConfig> slaveConfigs = SlaveConfig.unmarshall();
            slaveConfigs.add(this);
            SlaveConfig.marshall(slaveConfigs);
        }

        void remove() {
            Set<SlaveConfig> slaveConfigs = SlaveConfig.unmarshall();
            slaveConfigs.remove(this);
            SlaveConfig.marshall(slaveConfigs);
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;

            SlaveConfig that = (SlaveConfig) o;

            if (port != that.port) return false;
            if (id != null ? !id.equals(that.id) : that.id != null) return false;
            return ip != null ? ip.equals(that.ip) : that.ip == null;
        }

        @Override
        public int hashCode() {
            int result = id != null ? id.hashCode() : 0;
            result = 31 * result + (ip != null ? ip.hashCode() : 0);
            result = 31 * result + port;
            return result;
        }
    }

    private static class Host {
        String ip;
        int port;
        int coreAmount;
    }

    private Host getHost() {
        File hostFile = new File(System.getProperty(SysPropKey.CUST_PARAM_PATH), "serv_tank/host.json");
        try {
            Host host = new Gson().fromJson(Files.toString(hostFile, Charsets.UTF_8), Host.class);
            host.coreAmount = getAmount();
            return host;
        } catch (IOException e) {
            LOG.warn(e.getMessage(), e);
        }
        return new Host();
    }

    private int getAmount() {
        int amount = 1;
        File amountFile = new File(System.getProperty(SysPropKey.CUST_PARAM_PATH), "serv_tank/amount");
        try {
            String content = Files.toString(amountFile, Charsets.UTF_8);
            String amountCount = content.substring(3,4)+content.substring(5,6);
            amount = Integer.valueOf(amountCount);
             
            
        } catch (IOException e) {
            LOG.warn(e.getMessage(), e);
        }
        return amount;
    }
}
