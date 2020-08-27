package com.servtech.servcloud.module.controller;

import com.servtech.common.file.Files;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.mqtt.CacheBean;
import com.servtech.servcloud.core.mqtt.MQTTManager;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.bean.DeviceStatus2;
import com.servtech.servcloud.module.model.Box;
import com.servtech.servcloud.module.model.Device;
import org.fusesource.mqtt.client.QoS;
import org.fusesource.mqtt.client.Topic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.Socket;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.TimeUnit;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Hubert
 * Datetime: 2016/10/18 上午 10:17
 */
@RestController
@RequestMapping("/trex")
public class DeviceStatusApiController {

    private final static Logger LOG = LoggerFactory.getLogger(DeviceStatusApiController.class);
    public static final String DEVICE_STATUS = "DeviceStatus";

    private static Map<String, String> CMD_NAME_MAPPING;
    private static Map<String, String> MACHINE_NAME_MAPPING;
    private static Map<String, List<String>> TYPE_BOXES_MAPPING;

    private DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");

    static {
        refreshCmdNameMapping();
        refreshMachineNameMapping();
        refreshBoxId();
    }

    static void refreshCmdNameMapping() {
        CMD_NAME_MAPPING = new LinkedHashMap<String, String>();
        List<String> lines = Files.readLines(new File(System.getProperty(SysPropKey.DATA_PATH), "/command_name_mapping/mapping.csv"));
        for (String line : lines) {
            String[] keyValue = line.split("\\|");
            if (keyValue.length == 2) {
                CMD_NAME_MAPPING.put(keyValue[0], keyValue[1]);
            }
        }
    }

    static void refreshMachineNameMapping() {
        MACHINE_NAME_MAPPING = ActiveJdbc.oper(new Operation<Map<String, String>>() {
            @Override
            public Map<String, String> operate() {
                Map<String, String> result = new LinkedHashMap<String, String>();
                for (Map device : Device.findAll().toMaps()) {
                    result.put(device.get("device_id").toString(), device.get("device_name").toString());
                }
                return result;
            }
        });
    }

    static void refreshBoxId() {
        TYPE_BOXES_MAPPING = ActiveJdbc.oper(new Operation<Map<String, List<String>>>() {
            @Override
            public Map<String, List<String>> operate() {
                Map<String, List<String>> result = new LinkedHashMap<String, List<String>>();
                List<Map> boxMaps = Box.findAll().toMaps();
                List<String> boxIds = new ArrayList<String>();

                for (Map boxMap : boxMaps) {
                    boxIds.add(boxMap.get("box_id").toString());
                }

                result.put(DEVICE_STATUS, boxIds);
                return result;
            }
        });
    }

    @RequestMapping(value = "refreshMapping", method = RequestMethod.GET)
    public RequestResult<Void> refreshMapping() {
        refreshCmdNameMapping();
        refreshMachineNameMapping();
        refreshBoxId();

        return RequestResult.success();
    }

    @RequestMapping()
    public List<Map<String, String>> deviceStatus() {
        List<Map<String, String>> result = new ArrayList<Map<String, String>>();
        String boxId = TYPE_BOXES_MAPPING.get(DEVICE_STATUS).get(0);

        Map<String, Map<String, CacheBean>> pb = MQTTManager.get(TYPE_BOXES_MAPPING);
        String json = pb.get(DEVICE_STATUS).get(boxId).asJson();
        DeviceStatus2 deviceStatus2 = new DeviceStatus2(json);

        for (DeviceStatus2.Machine machine : deviceStatus2.iter()) {
            Map<String, String> map = new LinkedHashMap<String, String>();
            map.put("timestamp", dateFormat.format(new Date()));
            map.put("boxId", boxId);
            map.put("machineName", MACHINE_NAME_MAPPING.get(machine.getId()));

            for (Map.Entry<String, String> entry : CMD_NAME_MAPPING.entrySet()) {
                String cmd = entry.getKey();
                String name = entry.getValue();
                String value = machine.getCmdValue(cmd);
                value = value == null ? "N/A" : value;
                map.put(name, value);
            }
            result.add(map);
        }

        return result;
    }

    @RequestMapping(value = "machineNames", method = RequestMethod.GET)
    public RequestResult<Map<String, String>> machineNames() {
        return RequestResult.success(MACHINE_NAME_MAPPING);
    }

    @RequestMapping(value = "machineNames", method = RequestMethod.POST)
    public RequestResult<String> updateMachineNames(@RequestBody final Map<String, String> newNames) {

        RequestResult<String> result = ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                for (Map.Entry<String, String> entry : newNames.entrySet()) {
                    Device device = Device.findById(entry.getKey());
                    if (device == null) {
                        return RequestResult.fail("There is no machine id \"" + entry.getValue() + "\"");
                    } else {
                        device.set("device_name", entry.getValue());
                        if (!device.saveIt()) {
                            return RequestResult.fail("machine id \"" + entry.getKey() + "\" update fail...");
                        }
                    }
                }

                return RequestResult.success("success");
            }
        });

        if (result.getType() == RequestResult.TYPE_SUCCESS) {
            refreshMachineNameMapping();
        }

        return result;
    }

    @RequestMapping(value = "/connectedBox", method = RequestMethod.POST)
    public RequestResult<?> connectedBox(@RequestParam(value="boxId") final String boxId) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                if(boxId != null){
                    Box box = Box.findById(boxId);
                    if((box != null)) {
                        for(int index=1; index<=3; index++){
                            String boxId = box.getString("box_id");
                            String ip = box.getString("ip");
                            int port = box.getInteger("port");
                            if (testSocketConnect(ip, port)) {
                                return RequestResult.success("success");
                            }
                            LOG.info("reconnect box: {}, ip: {}, port: {}, time: {}",
                                    boxId, port, index);
                            try {
                                TimeUnit.SECONDS.sleep(3);
                            } catch (InterruptedException e) {
                                e.printStackTrace();
                            }
                        }
                        return RequestResult.fail("fail");
                    }else{
                        return RequestResult.fail("this box not exist");
                    }
                }else{
                    return RequestResult.fail("please pass the parameters 'boxId'");
                }
            }
        });
    }

    //全box連線
    @RequestMapping(value = "/connectedBoxs", method = RequestMethod.GET)
    public RequestResult<?> connectedBoxs() {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                Map<String, String> result = new HashMap<String, String>();
                List<Box> boxs = Box.findAll();
                for (int index = 1; index <= 3; index++) {
                    boolean isAllSuccess = true;
                    for (Box box : boxs) {
                        String boxId = box.getString("box_id");
                        String ip = box.getString("ip");
                        int port = box.getInteger("port");
                        if (index == 1) {//第一次 >//////<
                            if (testSocketConnect(ip, port)) {
                                result.put(boxId, "success");
                            } else {
                                result.put(boxId, "fail");
                                isAllSuccess = false;
                            }
                        } else {//將fail的box再度重連
                            if (result.get(boxId).equals("fail") && testSocketConnect(ip, port)) {
                                result.put(boxId, "success");
                            } else {
                                result.put(boxId, "fail");
                                isAllSuccess = false;
                            }
                        }
                    }
                    if (isAllSuccess) {//全部成功，就離開迴圈
                        break;
                    }
                    LOG.info("reconnect all box time: {}", index);
                    try {
                        TimeUnit.SECONDS.sleep(3);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                return RequestResult.success(result);
            }
        });
    }

    //重啟全部ServBox
    @RequestMapping(value = "/restartServBox" , method = RequestMethod.GET)
    public RequestResult<?> restartServBox() throws FileNotFoundException {
        RunCmd execBat;
        String restart = System.getProperty(SysPropKey.SERV_BOX_RESTART_TOOL_EXE);
        File restartTool = new File(restart);
        if(restartTool.exists()){
            //restart tool參數沒帶box id，表示會開啟全部box
            execBat = new RunCmd(new String[]{restart}, null, restartTool.getParentFile());
            execBat.setPrint(true);
            int exitVal = execBat.execAndReturn();
            if(exitVal == 0){
                return success(exitVal);
            }else{
                return fail(exitVal);
            }
        }else{
            return fail("not find restart tool...");
        }
    }

    //測試連線
    private boolean testSocketConnect(String ip, Integer port){
        boolean isSuccess = true;
        Socket socket = null;
        try {
            socket = new Socket(ip, port);
        } catch (IOException e) {
            //e.printStackTrace();
            LOG.warn("socket IOException: {}", e.getMessage());
            isSuccess = false;
        }finally {
            if(socket != null){
                try {
                    socket.close();
                } catch (IOException e1) {
                    //e1.printStackTrace();
                    LOG.warn("socket close fail: {}", e1);
                    isSuccess = false;
                }
            }
        }
        return isSuccess;
    }

    @RequestMapping(value = "/diagnoseConnection", method = RequestMethod.GET)
    public RequestResult<?> dignoseConnection() {
        Map boxInfo = ActiveJdbc.oper(new Operation<Map>() {
            @Override
            public Map operate() {
                return Box.findAll().toMaps().get(0);
            }
        });
        boolean boxConnected = testSocketConnect((String) boxInfo.get("ip"), Integer.parseInt((String) boxInfo.get("port")));

        if (!boxConnected) {
            return RequestResult.fail("ServBox is not on connected...");
        }

        if (!MQTTManager.isConnected()) {
            return RequestResult.fail("MQTT is not on connected...");
        }

        return RequestResult.success();
    }
}
