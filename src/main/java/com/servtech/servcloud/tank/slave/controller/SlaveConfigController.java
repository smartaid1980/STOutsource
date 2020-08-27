package com.servtech.servcloud.tank.slave.controller;

import com.google.common.base.Charsets;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.io.Files;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.core.mqtt.MQTTManager;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.tank.bean.Packet;
import com.servtech.servcloud.tank.master.service.exception.FailException;
import com.servtech.servcloud.tank.slave.service.MasterService;
import com.servtech.servcloud.tank.slave.service.impl.HttpMasterService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import javax.servlet.ServletRequest;
import java.io.*;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;

import static com.servtech.servcloud.core.util.SysPropKey.SERVCLOUD_ID;

/**
 * Created by hubertlu on 2017/3/20.
 */
@RestController
@RequestMapping("/tank/slave")
public class SlaveConfigController {
    private static final Logger LOG = LoggerFactory.getLogger(SlaveConfigController.class);
    private static File masterConfigFile = new File(System.getProperty(SysPropKey.CUST_PARAM_PATH), "serv_tank/master.json");
    private static final Cache<String, SyncData> SYNC_DATA_CACHE = CacheBuilder
            .newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(10, TimeUnit.MINUTES)
            .build();

    private MasterService masterService = new HttpMasterService();

    @RequestMapping(value = "ping", method = RequestMethod.GET)
    public RequestResult<String> ping(ServletRequest request) {
        String pingerAddress = request.getRemoteAddr() + ":" + request.getRemotePort();
        LOG.info(pingerAddress + " ping me.");

        return RequestResult.success(System.getProperty(SysPropKey.SERVCLOUD_ID));
    }

    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<String> add(@RequestBody MasterConfig masterConfig, ServletRequest request) {
//        String platformId = System.getProperty(SERVCLOUD_ID);
//        String topicName = MQTTManager.getDeviceStatusTopic();
//        String boxId = topicName.substring(platformId.length());

        // 確認有帶 ip 和 port 來
        if (masterConfig.ip == null || masterConfig.port == 0) {
            return RequestResult.fail("Please set tank host ip and port...");
        }

        // ping 回去看 ip 和 port 對不對
        try {
            masterService.ping(masterConfig.ip, masterConfig.port);
        } catch (FailException e) {
            LOG.warn(e.getMessage(), e);
            return RequestResult.fail("Core connect to tank with host " + masterConfig.ip + ":" + masterConfig.port + " fail, please check...");
        }

        // 沒加過就加，有加過就錯
        if (!masterConfigFile.exists()) {
            masterConfigFile.getParentFile().mkdirs();
            try {
                masterConfigFile.createNewFile();
            } catch (IOException e) {
                LOG.warn(e.getMessage(), e);
                return RequestResult.fail(e.getMessage());
            }
        } else {
            MasterConfig oldMasterConfig = MasterConfig.unmarshall();
            return RequestResult.fail("The ServCore has been added by " + oldMasterConfig.toString());
        }

        // 寫檔 回傳ID
        try {
            Files.write(masterConfig.toJson(), masterConfigFile, Charsets.UTF_8);

            return RequestResult.success(System.getProperty(SysPropKey.SERVCLOUD_ID));

        } catch (IOException e) {
            LOG.warn(e.getMessage(), e);
            return RequestResult.fail(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.DELETE)
    public RequestResult<?> delete() {
        if (masterConfigFile.exists()) {
            if (masterConfigFile.delete()) {
                return RequestResult.success();
            }
        }

        return RequestResult.fail("fail");
    }


    @RequestMapping(value = "/syncFactory", method = RequestMethod.GET)
    public void sycnFactory(@RequestParam("uuid") String uuid) {
        String batForder = System.getProperty(SysPropKey.ROOT_PATH) + "/app/ServTank/program/ServCoreFactorySync";
        String runBatPath = batForder + "/run.bat";
        String [] commands  = new String[]{runBatPath};
        File file = new File(batForder);
        RunSyncCmd runCmd = new RunSyncCmd.Builder().setCommands(commands).setEnvp(null).setFile(file).setUUID(uuid).build();
        runCmd.runCmd();
    }

    @RequestMapping(value = "/lastResult", method = RequestMethod.GET)
    public SyncData lastResult(@RequestParam("uuid") String uuid) {
        SyncData data = SYNC_DATA_CACHE.asMap().get(uuid);
        if (data.getData() == null && data.getError() == null) {
            data = null;
        }
        if (data == null) {
            SyncData syncData = new SyncData();
            syncData.setType(1);
            syncData.setError("SyncFail plz Check gRPC Server is ready...");
            return syncData;
        } else {
            return data;
        }
    }


    private static class MasterConfig {
        String ip;
        int port;
        String topicName;

        String toJson() {
            return new GsonBuilder().setPrettyPrinting().create().toJson(this);
        }

        static MasterConfig unmarshall() {
            if (masterConfigFile.exists()) {
                try {
                    String json = Files.toString(masterConfigFile, Charsets.UTF_8);
                    return new Gson().fromJson(json, MasterConfig.class);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            return null;
        }

        @Override
        public String toString() {
            return ip + ":" + port;
        }
    }

    public static class SyncData {
        private int type = 0;
        private String data;
        private String error;

        public void setType(int type) {
            this.type = type;
        }

        public void setData(String data) {
            this.data = data;
        }

        public void setError(String error) {
            this.error = error;
        }

        public int getType() {
            return this.type;
        }

        public String getData() {
            return this.data;
        }

        public String getError() {
            return this.error;
        }

        public static SyncData from(String json) {
            return new Gson().fromJson(json, SyncData.class);
        }
    }


    protected static class RunSyncCmd {

        private String [] commands;
        private String [] envp;
        private File file;
        private String uuid;

        private RunSyncCmd(Builder builder) {
            this.commands = builder.commands;
            this.envp = builder.envp;
            this.file = builder.file;
            this.uuid = builder.uuid;
        }

        public static class Builder {
            private String [] commands;
            private String [] envp;
            private File file;
            private String uuid;

            public Builder setCommands(String[] commands) {
                if (commands == null || commands.length == 0) {
                    throw new BuilderExection("commands is null or isEmpty");
                }
                this.commands = commands;
                return this;
            }

            public Builder setEnvp(String[] envp) {
                this.envp = envp;
                return this;
            }

            public Builder setFile(File file) {
                this.file = file;
                return this;
            }

            public Builder setUUID(String uuid) {
                this.uuid = uuid;
                return this;
            }

            public RunSyncCmd build() {
                return new RunSyncCmd(this);
            }
        }


        public static class BuilderExection extends RuntimeException {
            public BuilderExection(String msg) {
                super(msg);
            }
        }

        void runCmd () {
            Runtime rt = Runtime.getRuntime();
            SYNC_DATA_CACHE.put(uuid, new SyncData());
            try {
                Process proc = rt.exec(this.commands, this.envp, this.file);
                new Thread(new Message(uuid, 0, proc.getInputStream())).start();
                new Thread(new Message(uuid, 1, proc.getErrorStream())).start();
                proc.waitFor();

            } catch (IOException e) {
                e.printStackTrace();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        static class Message implements Runnable {

            private InputStream is;
            private int type;
            private String uuid;
            static final String SEP = System.getProperty("line.separator");

            Message(String uuid, int type, InputStream is){
                this.uuid = uuid;
                this.is = is;
                this.type = type;
            }

            @Override
            public void run() {

                try {
                    BufferedReader br = new BufferedReader(new InputStreamReader(is));
                    StringBuilder sb = new StringBuilder();
                    SyncData syncData = SYNC_DATA_CACHE.asMap().get(this.uuid);
                    String line = null;
                    if (type == 0) {
                        while ((line = br.readLine()) != null) {
                            if (line.indexOf("(DB") > -1) {
                                    System.out.println(line);
                                }
                                if (line.indexOf("::") > -1) {
                                    int start = line.indexOf("::") + 2 ;
                                    int end = line.lastIndexOf("::");
                                    String result = line.substring(start, end);
                                    String[] arr = result.split(",");
                                    System.out.println(arr[1]);
                                    if (!arr[0].equals("SUCCESS")) {
                                        sb.append(arr[1]);
                                        sb.append(SEP);
                                    }
                                }
                        }
                        if (sb.length() > 0) {
                            syncData.setType(1);
                        } else {
                            syncData.setType(0);
                        }
                        syncData.setData(sb.toString());

                    } else if (type == 1) {
                        while ((line = br.readLine()) != null) {
                                sb.append(line);
                                sb.append(SEP);
                        }
                        if (sb.length() > 0) {
                            if (sb.toString().indexOf("Terminated") < 0) {
                                syncData.setType(1);
                                syncData.setError(sb.toString());
                            } else {
                                syncData.setType(0);
                                syncData.setError("");
                            }
                        } else {
                            syncData.setType(0);
                        }

                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }


            }

        }
    }
}
