package com.servtech.servcloud.connect.controller;

import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import com.google.common.io.LineProcessor;
import com.google.gson.reflect.TypeToken;
import com.google.gson.Gson;
import com.servtech.common.codec.Key;
import com.servtech.common.codec.RawDataCryptor;
import com.servtech.common.codec.RawDataCryptorFactory;
import com.servtech.common.codec.exception.LicenseMismatchException;
import com.servtech.common.codec.impl.KeyCategory;
import com.servtech.common.file.Files;
import com.servtech.servcloud.app.controller.storage.StoreBillStockOutController;
import com.servtech.servcloud.app.model.iiot.*;
import com.servtech.servcloud.connect.bean.*;
import com.servtech.servcloud.connect.service.Security;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.mqtt.CacheBean;
import com.servtech.servcloud.core.mqtt.MQTTManager;
import com.servtech.servcloud.core.service.box.Type;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.bean.DeviceStatus2;
import com.servtech.servcloud.module.model.Box;
import com.servtech.servcloud.module.model.CncBrand;
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.model.DeviceCncBrand;
import com.servtech.servcloud.module.service.adapter.AdapterIO;
import com.servtech.servcloud.module.service.adapter.bean.MachineInfo;
import com.servtech.servcloud.tank.bean.Packet;
import com.servtech.servcloud.tank.master.service.exception.FailException;
import org.apache.log4j.ConsoleAppender;
import org.apache.log4j.DailyRollingFileAppender;
import org.apache.log4j.Logger;
import org.apache.log4j.PatternLayout;
import org.dom4j.DocumentException;
import org.javalite.activejdbc.Base;
import org.javalite.activejdbc.LazyList;
import org.javalite.activejdbc.Model;
import org.javalite.http.Http;
import org.javalite.http.Request;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.Socket;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static com.servtech.servcloud.core.util.SysPropKey.DATA_PATH;

/**
 * Created by hubertlu on 2017/3/14.
 */

@RestController
@RequestMapping("/v1")
public class Version1 {
    private static final String DEVICE_STATUS = "DeviceStatus";
    private static final String PARAM_ROOT = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/serv_connect";
    private static final org.slf4j.Logger LOG = LoggerFactory.getLogger(Version1.class);
    private static final org.apache.log4j.Logger HHOLOG = org.apache.log4j.Logger.getLogger(Version1.class);

    private static Map<String, String> CMD_NAME_MAPPING;
    private static Map<String, String> MACHINE_ID_NAME_MAPPING;
    private static Map<String, String> TYPE_BOXES_MAPPING;
    private static Map<String, String> MACHINE_ID_BRAND_MAPPING = new LinkedHashMap<String, String>();
    private static List<Map> BOXES;

    static {
        refreshCmdNameMapping();
        refreshMachineNameMapping();
        refreshBoxId();
        refreshBoxIds();
        setupHHOLogger();
    }

    private static void refreshCmdNameMapping() {
        CMD_NAME_MAPPING = new LinkedHashMap<String, String>();
        List<String> lines = Files.readLines(new File(PARAM_ROOT, "mapping.csv"));
        for (String line : lines) {
            String[] keyValue = line.split("\\|");
            if (keyValue.length == 2) {
                CMD_NAME_MAPPING.put(keyValue[0], keyValue[1]);
            }
        }
    }

    private static void refreshMachineNameMapping() {
        MACHINE_ID_NAME_MAPPING = ActiveJdbc.oper(new Operation<Map<String, String>>() {

            {
                MACHINE_ID_BRAND_MAPPING.clear();
            }

            @Override
            public Map<String, String> operate() {
                Map<String, String> result = new LinkedHashMap<String, String>();
                for (Map device : Device.findAll().include(DeviceCncBrand.class).toMaps()) {
                    String machineId = device.get("device_id").toString();
                    String machineName = device.get("device_name").toString();

                    /* 哭爸的廠牌拿法... */
                    List<Map> cncBrand = (List<Map>) device.get("device_cnc_brands");
                    String machineBrand;
                    if (cncBrand == null) {
                        machineBrand = "";
                        LOG.warn("他媽的資料庫沒有設機台 " + machineId + " 的廠牌");
                    } else {
                        machineBrand = cncBrand.isEmpty() ? "" : cncBrand.get(0).get("cnc_id").toString();
                    }
                    /* 哭爸的廠牌拿法... */

                    result.put(machineId, machineName);
                    MACHINE_ID_BRAND_MAPPING.put(machineId, machineBrand);
                }
                return result;
            }
        });
    }

    private static void refreshBoxIds() {
        BOXES = ActiveJdbc.oper(new Operation<List<Map>>() {
            @Override
            public List<Map> operate() {
                List<Map> boxs = Box.findAll().toMaps();
                return boxs;
            }
        });
    }

    private static void refreshBoxId() {
        TYPE_BOXES_MAPPING = ActiveJdbc.oper(new Operation<Map<String, String>>() {
            @Override
            public Map<String, String> operate() {
                Map<String, String> result = new LinkedHashMap<String, String>();
                List<Map> boxMaps = Box.findAll().toMaps();

                if (!boxMaps.isEmpty()) {
                    result.put(DEVICE_STATUS, boxMaps.get(0).get("box_id").toString());
                }

                return result;
            }
        });
    }

    private static List<String> decodeRawdataLines(File rawdataFile, final RawDataCryptor cryptor, final Key key) throws IOException {
        return com.google.common.io.Files.readLines(rawdataFile, Charsets.UTF_8, new LineProcessor<List<String>>() {
            List<String> decodedLines = new ArrayList<String>(42000);

            @Override
            public boolean processLine(String line) throws IOException {
                return decodedLines.add(cryptor.decode(key, line));
            }

            @Override
            public List<String> getResult() {
                return decodedLines;
            }
        });
    }

    /**
     * 驗證 key 的玩意兒
     */
    private Security security = new SecurityImpl();

    /**
     * 1. 取得所有機號及機台名稱
     *
     * @param key
     * @return {
     * "machine_id": "machine_name",
     * ...
     * }
     */
    @RequestMapping(value = "getmnames", method = RequestMethod.GET)
    public Response<?> getMachineNames(@RequestParam(value = "key", required = false) String key) {
        Response<Void> keyFailResponse = checkKey(key);
        if (keyFailResponse != null) return keyFailResponse;

        return Response.success(MACHINE_ID_NAME_MAPPING);
    }


    /**
     * 2. 設定機台名稱
     *
     * @param requestBody2
     * @return Void
     */
    @RequestMapping(value = "setmnames", method = RequestMethod.PUT)
    public Response<?> setMachineNames(@RequestBody final RequestBody2 requestBody2) {
        Response<Void> keyFailResponse = checkKey(requestBody2.getKey());
        if (keyFailResponse != null) return keyFailResponse;

        Response<String> result = ActiveJdbc.operTx(new Operation<Response<String>>() {
            @Override
            public Response<String> operate() {
                for (Map.Entry<String, String> machineIdName : requestBody2.getMachineIdName()) {
                    String machineId = machineIdName.getKey();
                    String machineName = machineIdName.getValue();

                    Device device = Device.findById(machineId);
                    if (device == null) {
                        return Response.fail("There is no machine id " + machineId);
                    } else {
                        device.set("device_name", machineName);
                        if (!device.saveIt()) {
                            return Response.fail("Machine id " + machineId + " update fail...");
                        }
                    }
                }
                return null;
            }
        });

        if (result == null) {
            refreshMachineNameMapping();
            result = Response.success();
        }

        return result;
    }


    /**
     * 3. 設定機台的廠牌及連線資訊
     *
     * @param requestBody3
     * @return Void
     */
    @RequestMapping(value = "setminfo", method = RequestMethod.PUT)
    public Response<?> setMachineInfo(@RequestBody final RequestBody3 requestBody3,
                                      final HttpServletRequest request) {
        Response<Void> keyFailResponse = checkKey(requestBody3.getKey());
        if (keyFailResponse != null) return keyFailResponse;

        // 準備要存入 adapter/machine/id.xml 的 MachineInfo
        final MachineInfo machineInfo = requestBody3.getMachineInfo();

        // 驗證
        if (machineInfo == null) {
            return Response.fail("Please give data parameter");
        }
        if (requestBody3.getId() == null) {
            return Response.fail("Please give data.id parameter");
        }
        if (requestBody3.getBrand() == null) {
            return Response.fail("Please give data.brand parameter");
        }
        if (requestBody3.getParams() == null) {
            return Response.fail("Please give data.param parameter");
        }
        if (!MACHINE_ID_NAME_MAPPING.containsKey(requestBody3.getId())) {
            return Response.fail("There is no machine id " + requestBody3.getId());
        }
        if (ActiveJdbc.oper(new Operation<Boolean>() {
            @Override
            public Boolean operate() {
                return !CncBrand.exists(requestBody3.getBrand());
            }
        })) {
            return Response.fail("There is no brand " + requestBody3.getBrand());
        }

        try {
            ActiveJdbc.operTx(new Operation<Void>() {
                @Override
                public Void operate() {
                    Map<String, Object> data = new HashMap<String, Object>();
                    data.put("modify_by", "scapi");
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    data.put("cnc_brands", machineInfo.getBrand());
                    data.put("device_id", machineInfo.getId());
                    String machineName = machineInfo.getName();
                    if (machineName != null) {
                        data.put("device_name", machineName);
                    }

                    Device device = new Device();
                    device.fromMap(data);

                    // 存 m_device
                    if (device.saveIt()) {
                        DeviceCncBrand deviceCncBrand = new DeviceCncBrand()
                                .setId(machineInfo.getId())
                                .set("cnc_id", machineInfo.getBrand());

                        // 存 m_device_cnc_brand
                        if (!deviceCncBrand.saveIt()) {
                            throw new RuntimeException("Brand update fail...");
                        }
                    } else {
                        throw new RuntimeException("Machine update fail...");
                    }

                    // 存 xml 檔
                    try {
                        String message = AdapterIO.marshall(machineInfo);
                        if (message != null) {
                            throw new RuntimeException(message);
                        }
                    } catch (DocumentException e) {
                        throw new RuntimeException(e.getMessage());
                    }

                    return null;
                }
            });

        } catch (RuntimeException e) {
            String message = e.getMessage();
            String expPrefix = "java.lang.RuntimeException: ";
            if (message.startsWith(expPrefix)) {
                message = message.substring(expPrefix.length());
            }
            return Response.fail(message);

        } catch (Exception e) {
            return Response.fail(e.getMessage());
        }

        refreshMachineNameMapping();
        return Response.success();
    }


    /**
     * 4. 取得所有機台的廠牌及連線資訊
     *
     * @param key
     * @return {
     * "infos": [
     * {
     * "id": "machine_id_01",
     * "name": "MA-1001",
     * "brand": "FANUC",
     * "params": {
     * "IP": "192.168.1.1",
     * "PORT": "8193",
     * ...
     * }
     * },
     * ...
     * ]
     * }
     */
    @RequestMapping(value = "getminfos", method = RequestMethod.GET)
    public Response<?> getMachineInfos(@RequestParam(value = "key", required = false) String key) {
        Response<Void> keyFailResponse = checkKey(key);
        if (keyFailResponse != null) return keyFailResponse;

        ResponseBody4 responseBody4 = new ResponseBody4();
        for (String machineId : MACHINE_ID_NAME_MAPPING.keySet()) {
            String machineName = MACHINE_ID_NAME_MAPPING.get(machineId);
            String machineBrand = MACHINE_ID_BRAND_MAPPING.get(machineId);
            try {
                MachineInfo machineInfo = AdapterIO.unmarshall(machineId, machineName, machineBrand);
                responseBody4.addMachineInfo(machineInfo);
            } catch (DocumentException e) {
                return Response.fail(e.getMessage());
            }
        }

        return Response.success(responseBody4);
    }


    /**
     * 5. 取得所有(或指定)機台的即時數據
     *
     * @param key
     * @return {
     * "machine_id_01": {
     * "key1": "value1",
     * "key2": "value2",
     * ...
     * },
     * "machine_id_02": {
     * "key1": "value1",
     * "key2": "value2",
     * ...
     * },
     * ...
     * }
     */
    @RequestMapping(value = "getnowdata", method = RequestMethod.GET)
    public Response<?> getNowData(@RequestParam(value = "key", required = false) String key,
                                  @RequestParam(value = "machines", required = false) String[] machines) {
        Map<String, Map<String, String>> result = new LinkedHashMap<String, Map<String, String>>();
        Response<Void> keyFailResponse = checkKey(key);
        if (keyFailResponse != null) return keyFailResponse;

        // 確認 box 存在
        if (TYPE_BOXES_MAPPING.isEmpty()) {
            return Response.fail("There is no ServBox info in the database...");
        }

        for (Map boxMap : BOXES) {
            String boxId = boxMap.get("box_id").toString();
            // DeviceStatus from MqttPool
//            final String boxId = TYPE_BOXES_MAPPING.get(DEVICE_STATUS);
            Map<String, List<String>> mqttParam = new LinkedHashMap<String, List<String>>();
            mqttParam.put(DEVICE_STATUS, new ArrayList<String>() {{
                add(boxId);
            }});

            Map<String, Map<String, CacheBean>> pb = MQTTManager.get(mqttParam);
            DeviceStatus2 deviceStatus2;
            try {
                String json = pb.get(DEVICE_STATUS).get(boxId).asJson();
                deviceStatus2 = new DeviceStatus2(json);
            } catch (Exception e) {
                return Response.fail("Data flow has something wrong...");
            }

            // 需要的機台
            Set<String> machineIds;
            if (machines == null) {
                machineIds = MACHINE_ID_NAME_MAPPING.keySet();
            } else {
                machineIds = new LinkedHashSet<String>();
                for (String machineId : machines) {
                    machineIds.add(machineId);
                }
            }

            // 請求時間
            DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
            String requestTimestamp = dateFormat.format(new Date());

            // 組組組
            for (String machineId : machineIds) {
                DeviceStatus2.Machine machine = deviceStatus2.getMachine(machineId);
                if (machine == null) {
                    continue;
                }

                Map<String, String> map = new LinkedHashMap<String, String>();
                map.put("timestamp", requestTimestamp);
                map.put("box_id", boxId);
                map.put("machine_name", MACHINE_ID_NAME_MAPPING.get(machineId));

                for (Map.Entry<String, String> entry : CMD_NAME_MAPPING.entrySet()) {
                    String cmd = entry.getKey();
                    String name = entry.getValue();
                    String value = machine.getCmdValue(cmd);
                    value = value == null ? "N/A" : value;
                    map.put(name, value);
                }
                result.put(machineId, map);
            }
        }
        return Response.success(result);
    }


    /**
     * 6. 取得機台的歷史數據
     *
     * @param key
     * @param machines
     * @param startDate
     * @param endDate
     * @return
     */
    @RequestMapping(value = "gethistory", method = RequestMethod.GET)
    public Response<?> getHistory(@RequestParam(value = "key", required = false) String key,
                                  @RequestParam(value = "machines") List<String> machines,
                                  @RequestParam(value = "startdate") @DateTimeFormat(pattern = "yyyy/MM/dd") Date startDate,
                                  @RequestParam(value = "enddate") @DateTimeFormat(pattern = "yyyy/MM/dd") Date endDate,
                                  HttpServletResponse response) {
        Response<Void> keyFailResponse = checkKey(key);
        if (keyFailResponse != null) return keyFailResponse;

        // 確認給的機台都有
        for (String machineId : machines) {
            if (!MACHINE_ID_NAME_MAPPING.containsKey(machineId)) {
                return Response.fail("There is no machine id " + machineId);
            }
        }

        // 確認日期是 start <= end
        if (startDate.after(endDate)) {
            DateFormat df = new SimpleDateFormat("yyyy/MM/dd");
            return Response.fail("Parameter startdate(" + df.format(startDate) + ") cannot larger than enddate(" + df.format(endDate) + ")");
        }

        DateFormat rawdataPathPattern = new SimpleDateFormat("yyyy/MM/yyyyMMdd");
        RawDataCryptor cryptor = RawDataCryptorFactory.getCryptor();
        Key decodeKey = KeyCategory.Decode.key;
        String dataPath = System.getProperty(DATA_PATH);

        String mimeType = "application/octect-stream";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=\"rawdata.zip\"";
        response.setContentType(mimeType);
        response.setHeader(headerKey, headerValue);

        ZipOutputStream zos = null;
        try {
            zos = new ZipOutputStream(response.getOutputStream());
            byte[] changeLine = System.getProperty("line.separator").getBytes();

            Calendar currCalendar = Calendar.getInstance();
            for (String machine : machines) {
                currCalendar.setTime(startDate);

                while (currCalendar.getTime().before(endDate) || currCalendar.getTime().equals(endDate)) {
                    String rawdataEntry = machine + "/" + rawdataPathPattern.format(currCalendar.getTime()) + ".csv";
                    String rawdataPath = "device_raw_data/" + rawdataEntry;
                    File rawdataFile = new File(dataPath, rawdataPath);
                    if (rawdataFile.exists()) {
                        List<String> lines = decodeRawdataLines(rawdataFile, cryptor, decodeKey);

                        zos.putNextEntry(new ZipEntry(rawdataEntry));
                        for (String line : lines) {
                            zos.write(line.getBytes());
                            zos.write(changeLine);
                        }
                        zos.closeEntry();
                    }

                    currCalendar.add(Calendar.DAY_OF_MONTH, 1);
                }
            }

            return Response.success();

        } catch (IOException e) {
            LOG.warn("rawdata compress error", e);
            return Response.fail("File compress error: " + e.getMessage());
        } catch (LicenseMismatchException e) {
            return Response.fail("Data license expired!!");
        } catch (Exception e) {
            LOG.warn("rawdata download wrong out of expected...", e);
            return Response.fail("Something wrong: " + e.getMessage());
        } finally {
            if (zos != null) {
                try {
                    zos.close();
                } catch (IOException e) {
                    // ...
                }
            }
        }
    }


    /**
     * 7. 檢查目前系統狀態
     *
     * @param key
     * @return
     */
    @RequestMapping(value = "diagnose", method = RequestMethod.GET)
    public Response<?> diagnose(@RequestParam("key") String key) {
        Response<Void> keyFailResponse = checkKey(key);
        if (keyFailResponse != null) return keyFailResponse;

        ResponseBody7 responseBody7;

        Map boxInfo = ActiveJdbc.oper(new Operation<Map>() {
            @Override
            public Map operate() {
                return Box.findAll().toMaps().get(0);
            }
        });
        boolean boxConnected = testSocketConnect((String) boxInfo.get("ip"), Integer.parseInt((String) boxInfo.get("port")));

        if (!boxConnected) {
            responseBody7 = ResponseBody7.servboxNotConnected();
            return Response.success(responseBody7, responseBody7.getMessage());
        }

        if (!MQTTManager.isConnected()) {
            responseBody7 = ResponseBody7.mqttNotConnected();
            return Response.success(responseBody7, responseBody7.getMessage());
        }

        responseBody7 = ResponseBody7.ok();
        return Response.success(responseBody7, responseBody7.getMessage());
    }


    /**
     * 額外讓佈署人員可以不關閉小貓重新載入 command_name_mapping, machine info, box info 用
     *
     * @return
     */
    @RequestMapping(value = "refreshMapping", method = RequestMethod.GET)
    public Response<Map<String, Map<String, String>>> refreshMapping() {
        refreshCmdNameMapping();
        refreshMachineNameMapping();
        refreshBoxId();

        return Response.success((Map<String, Map<String, String>>) new LinkedHashMap<String, Map<String, String>>() {{
            put("cmd_name_mapping", CMD_NAME_MAPPING);
            put("machine_id_name_mapping", MACHINE_ID_NAME_MAPPING);
            put("topic_box_mapping", TYPE_BOXES_MAPPING);
        }});
    }

    /**
     * 重讀 license 檔
     *
     * @return
     */
    @RequestMapping(value = "refreshLicense", method = RequestMethod.GET)
    public Response<String> refreshLicense() {
        String message = ((SecurityImpl) security).loadLicense();

        if (message.equals("success")) {
            return Response.success(message);
        } else {
            return Response.fail(message);
        }
    }

    /**
     * 取得到期日
     *
     * @return
     */
    @RequestMapping(value = "expiration", method = RequestMethod.GET)
    public Response<String> getExpiration() {
        String expiration = security.getExpiration();
        if (expiration == null) {
            return Response.fail("There is no license...");
        }
        return Response.success(expiration);
    }

    /**
     * 驗證 key
     *
     * @param key
     * @return
     */
    private Response<Void> checkKey(String key) {
        String message = security.check(key);
        if (message == null) {
            return null;
        }
        return Response.fail(message);
    }

    /**
     * IIOT加工機台環境告警
     *
     * @param data
     * @return Void
     */
    @RequestMapping(value = "triggerAlarm", method = RequestMethod.POST)
    public Response<?> triggerAlarm(@RequestBody final Map data, final HttpServletRequest request) {
        try {
            String key = data.get("key").toString();
            Response<Void> keyFailResponse = checkKey(key);
            if (keyFailResponse != null) return keyFailResponse;

            Map param = (Map) data.get("data");
            String machineId = param.get("machine_id").toString();
            String alarmType = param.get("alarm_type").toString();
            String alarmLogId = data.get("alarm_log_id") == null ? null : data.get("alarm_log_id").toString();
            String alarmEndTime = data.get("alarm_end_time") == null ? null : data.get("alarm_end_time").toString();
            String tempalarmEndTime = data.get("temp_alarm_end_time") == null ? null : data.get("temp_alarm_end_time").toString();
            String duration = data.get("duration") == null ? "00:00:00" : data.get("duration").toString();
            String user = "scapi";
            List<String> alarmContent = (List<String>) param.get("alarm_content");
            List<String> alarmCode = (List<String>) param.get("alarm_code");
            Timestamp currentTime = new Timestamp(System.currentTimeMillis());

            if (machineId == null) {
                return Response.fail("Please give data.machine_id parameter");
            }
            if (alarmType == null) {
                return Response.fail("Please give data.alarm_type parameter");
            }
            if (alarmCode.size() == 0) {
                return Response.fail("Please give data.alarm_code parameter");
            }
            if (alarmContent.size() == 0) {
                return Response.fail("Please give data.alarm_content parameter");
            }

            if (!MACHINE_ID_NAME_MAPPING.containsKey(machineId)) {
                return Response.fail("There is no machine id " + machineId);
            }
            if (ActiveJdbc.oper(new Operation<Boolean>() {
                @Override
                public Boolean operate() {
                    return !IiotMachineAlarmFreq.exists(alarmType);
                }
            })) {
                return Response.fail("There is no alarm type " + alarmType);
            }


            ActiveJdbc.operTx(new Operation<Void>() {
                @Override
                public Void operate() {
                    String sql = "INSERT INTO `a_iiot_machine_alarm_log` " +
                            "(`alarm_log_id`, " +
                            "`alarm_start_time`, " +
                            "`alarm_end_time`, " +
                            "`temp_alarm_end_time`, " +
                            "`machine_id`, " +
                            "`alarm_code`, " +
                            "`alarm_content`, " +
                            "`alarm_type`, " +
                            "`duration`, " +
                            "`is_succes`, " +
                            "`create_by`, " +
                            "`create_time`, " +
                            "`modify_by`, " +
                            "`modify_time`) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                            "ON DUPLICATE KEY UPDATE " +
                            "`alarm_log_id` = VALUES(alarm_log_id), " +
                            "`alarm_start_time` = VALUES(alarm_start_time), " +
                            "`alarm_end_time` = VALUES(alarm_end_time), " +
                            "`temp_alarm_end_time` = VALUES(temp_alarm_end_time), " +
                            "`machine_id` = VALUES(machine_id), " +
                            "`alarm_code` = VALUES(alarm_code), " +
                            "`alarm_content` = VALUES(alarm_content), " +
                            "`alarm_type` = VALUES(alarm_type), " +
                            "`duration` = VALUES(duration), " +
                            "`is_succes` = VALUES(is_succes), " +
                            "`create_by` = VALUES(create_by), " +
                            "`create_time` = VALUES(create_time), " +
                            "`modify_by` = VALUES(modify_by), " +
                            "`modify_time` = VALUES(modify_time)";

                    //中正呼叫api情境:無需給警報紀錄時間戳記
                    if (alarmLogId == null) {
                        Base.exec(sql,
                                currentTime,
                                currentTime,
                                null,
                                null,
                                machineId,
                                convertList2Str(alarmCode),
                                convertList2Str(alarmContent),
                                alarmType,
                                duration,
                                "Y",
                                user,
                                currentTime,
                                user,
                                currentTime);
                    } else {
                        //平台程式持續聽機台警報狀態，DB沒有對應警報就insert，反之update
                        List<Map> iiotMachineAlarmLog = IiotMachineAlarmLog.find("alarm_log_id = ? and machine_id = ?", alarmLogId, machineId).toMaps();
                        if (iiotMachineAlarmLog.size() > 0) {
                            Base.exec(sql,
                                    alarmLogId,
                                    iiotMachineAlarmLog.get(0).get("alarm_start_time"),
                                    alarmEndTime,
                                    tempalarmEndTime,
                                    machineId,
                                    convertList2Str(alarmCode),
                                    convertList2Str(alarmContent),
                                    alarmType,
                                    duration,
                                    "Y",
                                    iiotMachineAlarmLog.get(0).get("create_by"),
                                    iiotMachineAlarmLog.get(0).get("create_time"),
                                    user,
                                    currentTime);
                        } else {
                            Base.exec(sql,
                                    alarmLogId,
                                    alarmLogId,
                                    alarmEndTime,
                                    tempalarmEndTime,
                                    machineId,
                                    convertList2Str(alarmCode),
                                    convertList2Str(alarmContent),
                                    alarmType,
                                    duration,
                                    "Y",
                                    user,
                                    currentTime,
                                    user,
                                    currentTime);
                        }
                    }
                    return null;
                }
            });
        } catch (RuntimeException e) {
            e.printStackTrace();
            String message = e.getMessage();
            String expPrefix = "java.lang.RuntimeException: ";
            if (message.startsWith(expPrefix)) {
                message = message.substring(expPrefix.length());
            }
            return Response.fail(message);

        } catch (Exception e) {
            e.printStackTrace();
            return Response.fail(e.getMessage());
        }
        return Response.success();
    }

    /**
     * IIOT三期刀具_給禾禾當機台reStart時使用
     *
     * @param data
     * @return Void
     */
    @RequestMapping(value = "tool/HHOGetToolStore", method = RequestMethod.POST)
    public Response<?> HHOGetData(@RequestBody final Map data) {
        Map<String, String> resultMap = new HashMap<>();
        Map param = new HashMap();
        try {
            String key = data.get("key").toString();
            Response<Void> keyFailResponse = checkKey(key);
            if (keyFailResponse != null) return keyFailResponse;
            param = (Map) data.get("data");
            String machine_id = param.get("machine_id").toString();
            String tool_no = param.get("tool_no").toString();
            HHOLOG.info("HHOGetToolStore|" + machine_id + "|" + tool_no);
            if (machine_id == null) {
                return Response.fail("Please give data.machine_id parameter");
            }
            if (tool_no == null) {
                return Response.fail("Please give data.tool_no parameter");
            }

            boolean isSuccess = ActiveJdbc.operTx(new Operation<Boolean>() {
                @Override
                public Boolean operate() {
                    String sql = "SELECT * FROM a_iiot_tool_on_store where machine_id = '" + machine_id + "' and tool_no = '" + tool_no + "'and move_in_by = 1 and move_out_by = 2 order by move_in desc";
                    List<IiotToolOnStore> IiotToolOnStoreList = IiotToolOnStore.findBySQL(sql);
                    if (IiotToolOnStoreList != null && IiotToolOnStoreList.size() > 0) {
                        IiotToolOnStore toolOnStore = IiotToolOnStoreList.get(0);
                        StringBuffer sb_tool_stored = new StringBuffer();
                        sb_tool_stored.append(toolOnStore.getString("shelf_id")).append("_").
                                append(toolOnStore.getString("layer_id")).append("_").
                                append(toolOnStore.getString("position_id"));
                        resultMap.put("tool_stored", sb_tool_stored.toString());
                        resultMap.put("move_in", toolOnStore.getString("move_out"));
                        resultMap.put("nc_name", toolOnStore.getString("nc_name"));
                        HHOLOG.info("HHOGetToolStore Return " + sb_tool_stored.toString() + "|" + toolOnStore.getString("move_out") + "|" + toolOnStore.getString("nc_name"));
                    }
                    return Boolean.TRUE;
                }
            });
        } catch (RuntimeException e) {
            e.printStackTrace();
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            HHOLOG.info("Error : " + sw.toString());
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            HHOLOG.info("GetToolStoreError|" + sdf.format(new Date(System.currentTimeMillis())) +
                    "|" + param.get("machine_id").toString() +
                    "|" + param.get("tool_no").toString());
            return Response.success();
        } catch (Exception e) {
            e.printStackTrace();
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            HHOLOG.info("Error : " + sw.toString());
            return Response.success();
        }
        return Response.success(resultMap);
    }

    /**
     * IIOT三期刀具上架
     *
     * @param data
     * @return Void
     */
    @RequestMapping(value = "tool/HHOToolOnStore", method = RequestMethod.POST)
    public Response<?> HHOToolOnStore(@RequestBody final Map data, final HttpServletRequest request) {
        Map param = new HashMap();
        try {
            String key = data.get("key").toString();
            Response<Void> keyFailResponse = checkKey(key);
            if (keyFailResponse != null) return keyFailResponse;

            param = (Map) data.get("data");
            String machine_id = param.get("machine_id").toString();
            String tool_stored = param.get("tool_stored").toString();
            String nc_name = param.get("nc_name").toString();
            String tool_no = param.get("tool_no").toString();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String move_in = sdf.format(new Date(System.currentTimeMillis()));
            String user = "HHOToolOnStore";
            HHOLOG.info("HHOToolOnStoreParam|" + machine_id + "|" + tool_stored + "|" + nc_name + "|" + tool_no);
            if (machine_id == null) {
                return Response.fail("Please give data.machine_id parameter");
            }
            if (tool_stored == null) {
                return Response.fail("Please give data.tool_stored parameter");
            }
            if (nc_name == null) {
                return Response.fail("Please give data.nc_name parameter");
            }
            if (tool_no == null) {
                return Response.fail("Please give data.tool_no parameter");
            }
            String[] tool_stored_arr = tool_stored.split("_");
            String shelf_id = tool_stored_arr[0];
            String layer_id = tool_stored_arr[1];
            String position_id = tool_stored_arr[2];
            ActiveJdbc.operTx(new Operation<Boolean>() {
                @Override
                public Boolean operate() {
                    IiotToolOnStore toolOnStore = new IiotToolOnStore();
                    toolOnStore.set("machine_id", machine_id
                            , "shelf_id", shelf_id
                            , "layer_id", layer_id
                            , "position_id", position_id
                            , "nc_name", nc_name
                            , "tool_no", tool_no
                            , "move_in", move_in
                            , "move_in_by", "1"
                            , "create_by", user
                            , "create_time", move_in
                            , "modify_by", user
                            , "modify_time", move_in);
                    int count = 0;
                    /**
                     *  每次上架，都先檢查同櫃同一層的刀具架狀態有沒有未移出刀架的刀，
                     *  有的話先移出刀具櫃，並把ToolOnStore同一個上架時間的那筆紀錄的move_out填上時間
                     */
                    if (position_id.equals("1")) {
                        removeToolStore(shelf_id, layer_id, move_in);
                    }
                    if (toolOnStore.saveIt()) {
                        count = IiotToolShelf.update("status = 1 , move_in = ? , modify_by = ? , modify_time = ?", "shelf_id = ? and layer_id = ? and position_id = ?", move_in, user, sdf.format(new Date(System.currentTimeMillis())), shelf_id, layer_id, position_id);
                        if (count != 1) {
                            throw new RuntimeException("IiotToolShelf update fail...");
                        }
                    } else {
                        throw new RuntimeException("ToolOnStore update fail...");
                    }
                    return Boolean.TRUE;
                }
            });

        } catch (RuntimeException e) {
            e.printStackTrace();
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            HHOLOG.info("Error : " + sw.toString());
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            HHOLOG.info("OnStoreError|" + sdf.format(new Date(System.currentTimeMillis())) +
                    "|" + param.get("machine_id").toString() +
                    "|" + param.get("tool_stored").toString() +
                    "|" + param.get("nc_name").toString() +
                    "|" + param.get("tool_no").toString());
            return Response.success();

        } catch (Exception e) {
            e.printStackTrace();
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            HHOLOG.info("Error : " + sw.toString());
            return Response.success();
        }
        return Response.success();
    }

    private void removeToolStore(String shelf_id, String layer_id, String now) {
        List<IiotToolShelf> iiotToolShelfs = IiotToolShelf.find("shelf_id = ? and layer_id = ? and status = 1", shelf_id, layer_id);
        String APIName = "removeToolStore";
        iiotToolShelfs.forEach(iiotToolShelf -> {
            String move_in = iiotToolShelf.get("move_in").toString();
            String position_id = iiotToolShelf.get("position_id").toString();
            int count = IiotToolOnStore.update("move_out = ? , move_out_by = 2 , modify_by = ? , modify_time = ?", "shelf_id = ? and layer_id = ? and position_id = ? and move_in = ?", now, APIName, now, shelf_id, layer_id, position_id, move_in);
            if (count != 1) {
                return;
            }
            iiotToolShelf.set("status", 0
                    , "move_in", null
                    , "move_out", now
                    , "modify_by", APIName
                    , "modify_time", now).saveIt();
        });
    }

    /**
     * IIOT三期刀具上機
     *
     * @param data
     * @return Void
     */
    @RequestMapping(value = "tool/HHOToolOnMachine", method = RequestMethod.POST)
    public Response<?> HHOToolOnMachine(@RequestBody final Map data, final HttpServletRequest request) {
        Map param = new HashMap();
        try {
            String key = data.get("key").toString();
            Response<Void> keyFailResponse = checkKey(key);
            if (keyFailResponse != null) return keyFailResponse;

            param = (Map) data.get("data");
            String machine_id = param.get("machine_id").toString();
            String tool_stored = param.get("tool_stored").toString();
            String nc_name = param.get("nc_name").toString();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String move_out = sdf.format(new Date(System.currentTimeMillis()));
            String user = "HHOToolOnMachine";
            HHOLOG.info("HHOToolOnMachineParam|" + machine_id + "|" + tool_stored + "|" + nc_name);
            if (machine_id == null) {
                return Response.fail("Please give data.machine_id parameter");
            }
            if (tool_stored == null) {
                return Response.fail("Please give data.tool_stored parameter");
            }
            if (nc_name == null) {
                return Response.fail("Please give data.nc_name parameter");
            }
            String[] tool_stored_arr = tool_stored.split("_");
            String shelf_id = tool_stored_arr[0];
            String layer_id = tool_stored_arr[1];
            String position_id = tool_stored_arr[2];
//            if (!MACHINE_ID_NAME_MAPPING.containsKey(machine_id)) {
//                return Response.fail("There is no machine id " + machine_id);
//            }

            boolean isSuccess = ActiveJdbc.operTx(new Operation<Boolean>() {
                @Override
                public Boolean operate() {
                    IiotToolShelf iiotToolShelf = IiotToolShelf.findFirst("shelf_id = ? and layer_id = ? and position_id = ?", shelf_id, layer_id, position_id);
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    String move_in = sdf.format(iiotToolShelf.getDate("move_in"));
                    int count = IiotToolOnStore.update("move_out = ? , move_out_by = 2 , modify_by = ? , modify_time = ?", "shelf_id = ? and layer_id = ? and position_id = ? and move_in = ?", move_out, user, sdf.format(new Date(System.currentTimeMillis())), shelf_id, layer_id, position_id, move_in);
                    if (count == 1) {
                        IiotToolOnStore iiotToolOnStore = IiotToolOnStore.findFirst("shelf_id = ? and layer_id = ? and position_id = ? and move_in = ?", shelf_id, layer_id, position_id, move_in);
                        String tool_no = iiotToolOnStore.getString("tool_no");
                        count = 0;
                        count = IiotToolShelf.update("status = 0 , move_in = ? , move_out = ? ,modify_by = ? ,modify_time = ?", "shelf_id = ? and layer_id = ? and position_id = ?", null, move_out, user, sdf.format(new Date(System.currentTimeMillis())), shelf_id, layer_id, position_id);
                        if (count == 1) {
                            Date mapping_time = iiotToolOnStore.getDate("mapping_time");
                            if (mapping_time != null) {
                                String work_barcode = iiotToolOnStore.get("work_barcode") == null ? null : iiotToolOnStore.get("work_barcode").toString();
                                String tool_id = iiotToolOnStore.getString("tool_id");
                                String tool_prep_id = sdf.format(iiotToolOnStore.getDate("tool_prep_id"));
                                String sql = String.format("Select * from a_iiot_tool_prep_list where tool_prep_id = '%s' and nc_name = '%s' and tool_id = '%s'", tool_prep_id, nc_name, tool_id);
                                System.out.println("sql : " + sql);
                                List<IiotToolPrepList> iiotToolPrepLists = IiotToolPrepList.findBySQL(sql);
                                IiotToolPrepList iiotToolPrepList = new IiotToolPrepList();
                                if (iiotToolPrepLists != null && iiotToolPrepLists.size() != 0) {
                                    iiotToolPrepList = iiotToolPrepLists.get(0);
                                }
                                String dept_id = iiotToolPrepList.getString("dept_id");
                                String holder_id = iiotToolPrepList.getString("holder_id");
                                IiotToolTracking iiotToolTracking = new IiotToolTracking();
                                iiotToolTracking.set("move_in", move_out
                                        , "machine_id", machine_id
                                        , "nc_name", nc_name
                                        , "tool_prep_id", tool_prep_id
                                        , "work_barcode", work_barcode
                                        , "tool_no", tool_no
                                        , "tool_id", tool_id
                                        , "dept_id", dept_id
                                        , "holder_id", holder_id
                                        , "create_by", user
                                        , "create_time", sdf.format(new Date(System.currentTimeMillis()))
                                        , "modify_by", user
                                        , "modify_time", sdf.format(new Date(System.currentTimeMillis()))
                                );
                                return iiotToolTracking.saveIt();
                            } else {
                                IiotToolTrackingNoTool insertIiotToolTrackingNoTool = new IiotToolTrackingNoTool();
                                insertIiotToolTrackingNoTool.set("move_in", move_out
                                        , "machine_id", machine_id
                                        , "nc_name", nc_name
                                        , "tool_no", tool_no
                                        , "create_by", user
                                        , "create_time", sdf.format(new Date(System.currentTimeMillis()))
                                        , "modify_by", user
                                        , "modify_time", sdf.format(new Date(System.currentTimeMillis())));
                                return insertIiotToolTrackingNoTool.saveIt();
                            }

                        } else {
                            throw new RuntimeException("IiotToolShelf update fail...");
                        }
                    } else {
                        throw new RuntimeException("IiotToolOnStore update fail...");
                    }

                }
            });
            if (!isSuccess) {
                throw new RuntimeException("IiotToolTracking update fail...");
            }
        } catch (RuntimeException e) {
            e.printStackTrace();
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            HHOLOG.info("Error : " + sw.toString());
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            HHOLOG.info("OnMachineError|" + sdf.format(new Date(System.currentTimeMillis())) +
                    "|" + param.get("machine_id").toString() +
                    "|" + param.get("tool_stored").toString() +
                    "|" + param.get("nc_name").toString());
            return Response.success();
        } catch (Exception e) {
            e.printStackTrace();
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            HHOLOG.info("Error : " + sw.toString());
            return Response.success();
        }
        return Response.success();
    }

    /**
     * IIOT三期刀具下機
     *
     * @param data
     * @return Void
     */
    @RequestMapping(value = "tool/HHOToolOffMachine", method = RequestMethod.POST)
    public Response<?> HHOToolOffMachine(@RequestBody final Map data, final HttpServletRequest request) {
        Map param = new HashMap();
        try {
            String key = data.get("key").toString();
            Response<Void> keyFailResponse = checkKey(key);
            if (keyFailResponse != null) return keyFailResponse;

            param = (Map) data.get("data");
            String machine_id = param.get("machine_id").toString();
            String tool_stored = param.get("tool_stored").toString();
            String nc_name = param.get("nc_name").toString();
            String tool_no = param.get("tool_no").toString();
            String move_in = param.get("move_in").toString().substring(0, 19);
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String move_out = sdf.format(new Date(System.currentTimeMillis()));
            String user = "HHOToolOffMachine";
            HHOLOG.info("HHOToolOffMachineParam|" + machine_id + "|" + tool_stored + "|" + nc_name + "|" + tool_no + "|" + move_in);
            if (machine_id == null) {
                return Response.fail("Please give data.machine_id parameter");
            }
            if (nc_name == null) {
                return Response.fail("Please give data.nc_name parameter");
            }
            if (tool_no == null) {
                return Response.fail("Please give data.tool_no parameter");
            }
            if (move_in == null) {
                return Response.fail("Please give data.move_in parameter");
            }
            if (tool_stored == null) {
                return Response.fail("Please give data.tool_stored parameter");
            }
            String[] tool_storeds = tool_stored.split("_");
            /**
             * 下面會註解掉是因為禾禾給的參數常常會有錯，所以另提供一隻API給禾禾在下機前呼叫，回傳該機台最新一筆的上機資料給他
             */
            //檢查禾禾給的刀具進戰時間是否跟當下時間一樣，一樣表示他們的上機資料遺失，move_in只能自己找了..
//            String new_move_in = checkIsSameTime(move_in, move_out) ? getRealMoveIn(machine_id, tool_no, nc_name) : move_in;
            ActiveJdbc.operTx(new Operation<Boolean>() {
                @Override
                public Boolean operate() {
//                    IiotToolTracking iiotToolTracking = IiotToolTracking.findFirst("TIMESTAMPDIFF(SECOND ,move_in , ?) < 30 and machine_id = ? and nc_name = ? and tool_no = ?", new_move_in, machine_id, nc_name, tool_no);
                    IiotToolTracking iiotToolTracking = IiotToolTracking.findFirst("move_in =? and machine_id = ? and nc_name = ? and tool_no = ?", move_in, machine_id, nc_name, tool_no);
                    boolean isUpdateSuccess;
                    if (iiotToolTracking == null) {
//                        IiotToolTrackingNoTool iiotToolTrackingNoTool = IiotToolTrackingNoTool.findFirst("TIMESTAMPDIFF(SECOND ,move_in , ?) < 30 and machine_id = ? and nc_name = ? and tool_no = ? ", new_move_in, machine_id, nc_name, tool_no);
                        IiotToolTrackingNoTool iiotToolTrackingNoTool = IiotToolTrackingNoTool.findFirst("move_in =? and machine_id = ? and nc_name = ? and tool_no = ? ", move_in, machine_id, nc_name, tool_no);
                        if (iiotToolTrackingNoTool.get("move_out") != null) {
                            throw new RuntimeException("This Tool has been move_out ! param error");
                        }
                        iiotToolTrackingNoTool.set("move_out", move_out);
                        iiotToolTrackingNoTool.set("modify_by", "HHOToolOffMachine");
                        iiotToolTrackingNoTool.set("modify_time", move_out);
                        isUpdateSuccess = iiotToolTrackingNoTool.saveIt();
                    } else {
                        if (iiotToolTracking.get("move_out") != null) {
                            throw new RuntimeException("This Tool has been move_out ! param error");
                        }
                        iiotToolTracking.set("move_out", move_out);
                        iiotToolTracking.set("modify_by", "HHOToolOffMachine");
                        iiotToolTracking.set("modify_time", move_out);
                        isUpdateSuccess = iiotToolTracking.saveIt();
                    }

                    if (isUpdateSuccess) {
//                        IiotToolTracking toolTracking = IiotToolTracking.findFirst("TIMESTAMPDIFF(SECOND ,move_in , ?) < 30  and machine_id = ? and nc_name = ? and tool_no = ? order by move_in desc ", new_move_in, machine_id, nc_name, tool_no);
                        IiotToolTracking toolTracking = IiotToolTracking.findFirst("move_in =? and machine_id = ? and nc_name = ? and tool_no = ? order by move_in desc ", move_in, machine_id, nc_name, tool_no);
                        String tool_id = toolTracking == null ? null : toolTracking.getString("tool_id");
                        IiotToolOnStore toolOnStore = new IiotToolOnStore();
                        toolOnStore.set("machine_id", machine_id
                                , "move_in", move_out
                                , "shelf_id", tool_storeds[0]
                                , "layer_id", tool_storeds[1]
                                , "position_id", tool_storeds[2]
                                , "nc_name", nc_name
                                , "tool_id", tool_id
                                , "tool_no", tool_no
                                , "move_in_by", 2
                                , "create_by", user
                                , "create_time", sdf.format(new Date(System.currentTimeMillis()))
                                , "modify_by", user
                                , "modify_time", sdf.format(new Date(System.currentTimeMillis())));
                        if (toolOnStore.saveIt()) {
                            int count = IiotToolShelf.update("status = 1 , move_in = ? , modify_by = ? , modify_time = ? ", "shelf_id= ? and layer_id = ? and position_id = ? ", move_out, user, sdf.format(new Date(System.currentTimeMillis())), tool_storeds[0], tool_storeds[1], tool_storeds[2]);
                            if (count != 1) {
                                throw new RuntimeException("IiotToolShelf Updata Fail..");
                            }
                            return Boolean.TRUE;
                        } else {
                            throw new RuntimeException("IiotToolOnStore Insert Fail..");
                        }
                    } else {
                        throw new RuntimeException("IIOTToolTracking Updata Fail..");
                    }
                }
            });

        } catch (RuntimeException e) {
            e.printStackTrace();
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            HHOLOG.info("Error : " + sw.toString());
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            HHOLOG.info("OffMachineError|" + sdf.format(new Date(System.currentTimeMillis())) +
                    "|" + param.get("machine_id").toString() +
                    "|" + param.get("tool_stored").toString() +
                    "|" + param.get("nc_name").toString() +
                    "|" + param.get("tool_no").toString() +
                    "|" + param.get("move_in").toString());
            return Response.success();

        } catch (Exception e) {
            e.printStackTrace();
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            HHOLOG.info("Error : " + sw.toString());
            return Response.success();
        }
        return Response.success();
    }

    private String getRealNcName(String machine_id, String nc_name, String tool_no) {
        return ActiveJdbc.operTx(new Operation<String>() {
            @Override
            public String operate() {
                String sql = "SELECT * FROM a_iiot_tool_on_store where machine_id = '" + machine_id + "' and tool_no = '" + tool_no + "' and move_in_by = 1 and move_out_by = 2 order by move_in desc limit 1";
                HHOLOG.info("getRealNcName sql : " + sql);
                List<IiotToolOnStore> IiotToolOnStoreList = IiotToolOnStore.findBySQL(sql);
                if (IiotToolOnStoreList != null && IiotToolOnStoreList.size() > 0) {
                    IiotToolOnStore toolOnStore = IiotToolOnStoreList.get(0);
                    return toolOnStore.getString("nc_name");
                }
                return null;
            }
        });
    }

    private String getRealMoveIn(String machine_id, String tool_no, String nc_name) {
        return ActiveJdbc.operTx(new Operation<String>() {
            @Override
            public String operate() {

                String sql = "SELECT * FROM a_iiot_tool_on_store where machine_id = '" + machine_id + "' and tool_no = '" + tool_no + "' and nc_name = '" + nc_name + "' and move_in_by = 1 and move_out_by = 2 order by move_in desc limit 1";
                HHOLOG.info("getRealMoveIn sql : " + sql);
                List<IiotToolOnStore> IiotToolOnStoreList = IiotToolOnStore.findBySQL(sql);
                if (IiotToolOnStoreList != null && IiotToolOnStoreList.size() > 0) {
                    IiotToolOnStore toolOnStore = IiotToolOnStoreList.get(0);
                    return toolOnStore.getString("move_out");
                }
                return null;
            }
        });

    }

    private boolean checkIsSameTime(String move_in, String move_out) {
        LocalDateTime in = LocalDateTime.parse(move_in, DateTimeFormatter.ofPattern("yyyy-M-d H:m:s"));
        LocalDateTime out = LocalDateTime.parse(move_out, DateTimeFormatter.ofPattern("yyyy-M-d H:m:s"));
        return Duration.between(in, out).getSeconds() >= -10 && Duration.between(in, out).getSeconds() <= 10;
    }

    /**
     * IIOT三期刀具下架
     *
     * @param data
     * @return Void
     */
    @RequestMapping(value = "tool/HHOToolOffStore", method = RequestMethod.POST)
    public Response<?> HHOToolOffStore(@RequestBody final Map data, final HttpServletRequest request) {
        String tool_stored = "";
        try {
            String key = data.get("key").toString();
            Response<Void> keyFailResponse = checkKey(key);
            if (keyFailResponse != null) return keyFailResponse;

            Map param = (Map) data.get("data");
            tool_stored = param.get("tool_stored").toString();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String move_out = sdf.format(new Date(System.currentTimeMillis()));
            String user = "HHOToolOffStore";
            HHOLOG.info("HHOToolOffStoreParam|" + tool_stored);
            if (tool_stored == null) {
                return Response.fail("Please give data.tool_stored parameter");
            }
            String[] tool_storeds = tool_stored.split("_");
            ActiveJdbc.operTx(new Operation<Boolean>() {
                @Override
                public Boolean operate() {
                    Date move_in_date = IiotToolShelf.findFirst("shelf_id = ? and layer_id = ? and position_id = ? ", tool_storeds[0], tool_storeds[1], tool_storeds[2]).getDate("move_in");
                    String move_in = sdf.format(move_in_date);
                    int count = IiotToolOnStore.update("move_out = ? , move_out_by = 1 , modify_by = ? , modify_time = ?", "shelf_id = ? and layer_id = ? and position_id = ? and move_in = ? ", move_out, user, sdf.format(new Date(System.currentTimeMillis())), tool_storeds[0], tool_storeds[1], tool_storeds[2], move_in);
                    if (count == 1) {
                        count = 0;
                        count = IiotToolShelf.update("status = 0 , move_in = ? ,move_out = ? , modify_by = ? , modify_time = ? ", "shelf_id= ? and layer_id = ? and position_id = ? ", null, move_out, user, sdf.format(new Date(System.currentTimeMillis())), tool_storeds[0], tool_storeds[1], tool_storeds[2]);
                        if (count != 1) {
                            throw new RuntimeException("IiotToolShelf Updata Fail..");
                        }
                        return Boolean.TRUE;
                    } else {
                        throw new RuntimeException("IiotToolOnStore Updata Fail..");
                    }
                }
            });
        } catch (RuntimeException e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            HHOLOG.info("Error : " + sw.toString());
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            HHOLOG.info("OffStoreError|" + sdf.format(new Date(System.currentTimeMillis())) + "|" + tool_stored);
            return Response.success();
        } catch (Exception e) {
            e.printStackTrace();
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            HHOLOG.info("Error : " + sw.toString());
            return Response.success();
        }
        return Response.success();
    }

    /**
     * 給尚陽取得景福工單產量資訊用，只能用時間查詢
     *
     * @param key
     * @param startDate
     * @param endDate
     * @return Void
     */
    @RequestMapping(value = "sunyoung/getWorkInfo", method = RequestMethod.GET)
    public Response<?> getWorkInfo(@RequestParam(value = "key", required = false) String key,
                                   @RequestParam(value = "startDate", required = false) String startDate,
                                   @RequestParam(value = "endDate", required = false) String endDate) {
        try {
//            String key = param.get("key").toString();
            Response<Void> keyFailResponse = checkKey(key);
            if (keyFailResponse != null) return keyFailResponse;
//            Map data = (Map) param.get("data");
//            String startDate = data.get("startDate").toString();
//            String endDate = data.get("endDate").toString();
            if (startDate == null) {
                return Response.fail("Please give data.startDate parameter");
            }
            if (endDate == null) {
                return Response.fail("Please give data.endDate parameter");
            }
            String url = "http://127.0.0.1:58080/ServCloud/api/jinfu/utilization?stkey=9bb0b99adcf44e0ef05e13fc170450cb&startDate=" + startDate + "&endDate=" + endDate;
            Request get = Http.get(url, 10000, 10000);
            get.header("Accept", "application/json");
            Gson gson = new Gson();
            Map result = gson.fromJson(get.text(), Map.class);
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
            double type = (double) result.get("type");
            if ((int) type == 0) {
                ArrayList<Map> dataList = (ArrayList<Map>) result.get("data");
                for (Map data : dataList) {
                    Object machine_name = data.get("machine_id");
                    data.put("machine_name", machine_name);
                    data.put("date", sdf.format(System.currentTimeMillis()));
                    data.remove("machine_id");
                    data.remove("product_name");
                    data.remove("exp_mdate");
                    data.remove("exp_edate");
                    data.remove("machine_id");
                    data.remove("completion_percentage");
                    data.remove("downtime");
                    data.remove("effective_utilization");
                    data.remove("part_count_diff");
                    data.remove("utilization");
                    data.remove("work_qty");
                    data.remove("workshift_millisecond");
                    data.remove("product_id");
//                    if(data.get("program_name").toString().equals("---") || data.get("machine_name").toString().equals("---")){
//                        data.put("message","ERP資料錯誤...");
//                    }
                }
                return Response.success(dataList);
            } else {
                throw new FailException(result.get("data").toString());
            }
        } catch (Exception e) {
            e.printStackTrace();
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            return Response.success();
        }
    }

//    class JinFuWorkBean {
//        Long power_millisecond;
//        Long operate_millisecond;
//        Long cutting_millisecond;
//        String machine_id;
//        String program_name;
//        String work_id;
//        int part_count;
//        String is_close;
//        Date exp_mdate;
//        Date exp_edate;
//
//        void JinFuWorkBean() {
//
//        }
//
//        void JinFuWorkBean(Map workData) {
//            this.power_millisecond = (long) workData.get("power_millisecond");
//            this.operate_millisecond = (long) workData.get("operate_millisecond");
//            this.cutting_millisecond = (long) workData.get("cutting_millisecond");
//            this.machine_id = workData.get("machine_id").toString();
//            this.program_name = workData.get("program_name").toString();
//            this.work_id = workData.get("work_id").toString();
//            this.is_close = workData.get("is_close").toString();
//            this.exp_mdate = (Date) workData.get("exp_mdate");
//            this.exp_edate = (Date) workData.get("exp_edate");
//            this.part_count = (int) workData.get("part_count");
//        }
//    }

    public String convertList2Str(List<String> list) {
        StringBuilder sb = new StringBuilder();
        int finalStrIndex = list.size() - 1;
        for (String s : list) {
            if (!list.get(finalStrIndex).equals(s)) {
                sb.append(s);
                sb.append(", ");
            } else {
                sb.append(s);
            }
        }
        return sb.toString();
    }

    /**
     * 驗證實做
     */
    private static class SecurityImpl implements Security {
        private String key;
        private String expiration;

        private Date expirationDate;

        public SecurityImpl() {
            loadLicense();
        }

        @Override
        public String check(String key) {
            if (key == null) {
                return "Please take key together with request...";
            }

            if (!this.expirationDate.after(new Date())) {
                return "ServConnect has already expired...";
            }

            if (!this.key.equals(key)) {
                return "Key mismatch...";
            }

            return null;
        }

        @Override
        public String getExpiration() {
            return expiration;
        }

        private String loadLicense() {
            String readLicenseMsg = this.readLicence();
            if (readLicenseMsg == null) {
                buildKey();
                return "success";
            }

            return readLicenseMsg;
        }

        private String readLicence() {
            File licenseFile = new File(PARAM_ROOT, "license");
            try {
                this.expiration = com.google.common.io.Files.toString(licenseFile, Charsets.UTF_8);
            } catch (IOException e) {
                LOG.warn("ServConnect license file read fail...", e);
                return "ServConnect license file read fail...";
            }

            String checkMsg = expirationChecker();
            if (checkMsg != null) {
                LOG.warn(checkMsg);
            }

            return checkMsg;

        }

        /**
         * 依 ServCloud id, servtech 和 license date 的順序交疊字母後做 MD5
         */
        private void buildKey() {
            String cloudId = System.getProperty(SysPropKey.SERVCLOUD_ID);
            String servtech = "servtech";

            int maxLen = Math.max(cloudId.length(), Math.max(servtech.length(), this.expiration.length()));

            StringBuilder keyBuilder = new StringBuilder();
            for (int i = 0; i < maxLen; i++) {
                if (cloudId.length() > i) {
                    keyBuilder.append(cloudId.charAt(i));
                }
                if (servtech.length() > i) {
                    keyBuilder.append(servtech.charAt(i));
                }
                if (this.expiration.length() > i) {
                    keyBuilder.append(this.expiration.charAt(i));
                }
            }

            this.key = Hashing.md5().hashString(keyBuilder.toString(), Charsets.UTF_8).toString();
        }

        private String expirationChecker() {
            DateFormat df = new SimpleDateFormat("yyyy/MM/dd");
            try {
                Date licenseDate = df.parse(expiration);
                if (!expiration.equals(df.format(licenseDate))) {
                    return "ServConnect license 日期值有誤，" + expiration + " 並非合法日期...";
                }

                Calendar c = Calendar.getInstance();
                c.setTime(licenseDate);
                c.add(Calendar.DAY_OF_MONTH, 1);
                this.expirationDate = c.getTime();

                return null;

            } catch (ParseException e) {
                return "ServConnect license 日期格式為 YYYY/MM/DD，你的輸入為 " + expiration;
            }
        }
    }

    private boolean testSocketConnect(String ip, Integer port) {
        boolean isSuccess = true;
        Socket socket = null;
        try {
            socket = new Socket(ip, port);
        } catch (IOException e) {
            LOG.warn("socket IOException: {}", e.getMessage());
            isSuccess = false;
        } finally {
            if (socket != null) {
                try {
                    socket.close();
                } catch (IOException e1) {
                    LOG.warn("socket close fail: {}", e1);
                    isSuccess = false;
                }
            }
        }
        return isSuccess;
    }

    private static String formatPercentage(Long numerator, Long denominator) {
        String result;
        if (numerator != 0L && denominator != 0L) {
            double perc = (double) numerator / denominator;
            BigDecimal b = new BigDecimal(perc);
            return b.setScale(2, RoundingMode.HALF_UP).doubleValue() + "%";
        } else {
            result = "0%";
        }
        return result;
    }

    private static void setupHHOLogger() {
        PatternLayout layout = new PatternLayout();
        String conversionPattern = "[%5p %d{yy/MM/dd HH:mm:ss}] %m [%t][%C{1}.%M:%L]%n";
        layout.setConversionPattern(conversionPattern);

        DailyRollingFileAppender rollingAppender = new DailyRollingFileAppender();
        rollingAppender.setFile("../webapps/ServCloud/WEB-INF/log/Version1/HHO/log.log");
        rollingAppender.setEncoding("UTF-8");
        rollingAppender.setDatePattern("'.'yyyy-MM-dd");
        rollingAppender.setLayout(layout);
        rollingAppender.activateOptions();

        ConsoleAppender consoleAppender = new ConsoleAppender();
        consoleAppender.setEncoding("UTF-8");
        consoleAppender.setLayout(layout);
        consoleAppender.activateOptions();
        HHOLOG.addAppender(rollingAppender);
        HHOLOG.addAppender(consoleAppender);
    }
}
