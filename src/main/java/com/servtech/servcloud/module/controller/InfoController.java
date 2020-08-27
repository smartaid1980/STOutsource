package com.servtech.servcloud.module.controller;

import com.google.common.base.Charsets;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.io.Files;
import com.google.gson.Gson;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RawDataIndices;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.model.DeviceCncBrand;
import com.servtech.servcloud.module.service.workshift.WorkShiftTimeService;
import com.servtech.servcloud.module.service.workshift.exception.WorkShiftTimeException;
import org.javalite.activejdbc.Model;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Hubert
 * Datetime: 2015/7/29 上午 09:50
 */
@RestController
@RequestMapping("/info")
public class InfoController {
    private static final Logger LOG = LoggerFactory.getLogger(InfoController.class);

    @RequestMapping(value = "/calcInfo", method = GET)
    public CalculateInfo calculateInfo(@RequestParam(value = "startDate") String startDate, // yyyyMMdd
                                       @RequestParam(value = "endDate") String endDate) {
        CalculateInfo result = new CalculateInfo();

        result.platformId = System.getProperty(SysPropKey.SERVCLOUD_ID);

        result.machines = ActiveJdbc.oper(new Operation<List<Map<String, String>>>() {
            @Override
            public List<Map<String, String>> operate() {
                List<Map<String, String>> devices = Lists.newArrayList();
                for (Model device : Device.findAll()) {
                    Map<String, String> deviceMap = Maps.newHashMap();
                    deviceMap.put("id", device.getString("device_id"));
                    deviceMap.put("name", device.getString("device_name"));
                    devices.add(deviceMap);
                }
                return devices;
            }
        });

        try {
            result.shiftTimes = new WorkShiftTimeService(startDate, endDate).getIntervalWorkShiftTimes();
        } catch (WorkShiftTimeException e) {
            // 阿呆日期格式給錯我就不給你班次資料咧...
            // 再次聲明格式為 yyyyMMdd
        }

        WorkShiftTimeService.NowActualShiftTime nowShiftInfo = WorkShiftTimeService.nowActualShiftTime();
        result.nowLogicallyDate = nowShiftInfo.getLogicallyDate8Bits();
        result.nowShiftTime = nowShiftInfo.getNowShiftTime();
        result.nowShiftTimes = nowShiftInfo.getTodayShiftTimes();

        result.dataRoot = System.getProperty(SysPropKey.DATA_PATH);

        result.rawdataIndex = RawDataIndices.unserializeFromSystemProperties();
        result.partcountColumn = Integer.parseInt(System.getProperty(SysPropKey.RAW_DATA_PARTCOUNT_WHICH_INDEX));

        // hippo server info
        try {
            File hippoServerConfigFile = new File(System.getProperty(SysPropKey.CUST_PARAM_PATH), "serv_tank/master.json");
            String json = Files.toString(hippoServerConfigFile, Charsets.UTF_8);
            HippoServerConfig hippoServerConfig = new Gson().fromJson(json, HippoServerConfig.class);

            result.hippoServerIp = hippoServerConfig.ip;
            result.hippoServerPort = 57600;//hippoServerConfig.port;
        } catch (IOException e) {
            LOG.warn("cust_param/serv_tank/master.json 異常...");
        }

        return result;
    }

    @RequestMapping(value = "/calcMachineInfo", method = GET)
    public List<CalculateMachineInfo> calculateInfo() {
        final Gson gson = new Gson();

        return ActiveJdbc.oper(new Operation<List<CalculateMachineInfo>>() {
            @Override
            public List<CalculateMachineInfo> operate() {
                List<CalculateMachineInfo> devices = Lists.newArrayList();
                for (Model device : DeviceCncBrand.findAll()) {
                    String cncId = device.getString("cnc_id");
                    String deviceId = device.getString("device_id");
                    boolean chk = true;
                    for (CalculateMachineInfo line : devices) {
                        if (line.brand.equals(cncId)) {
                            line.deviceIds.add(deviceId);
                            chk = false;
                            break;
                        }
                    }
                    if (chk) {
                        LOG.info(cncId);
                        CalculateMachineInfo cal = new CalculateMachineInfo();
                        cal.brand = cncId;
                        cal.deviceIds.add(deviceId);
                        try {
                            Reader config = new InputStreamReader(new FileInputStream(new File(System.getProperty(SysPropKey.CUST_PARAM_PATH)
                                    + "/param/brands/" + cncId + "/config.json")), "UTF-8");
                            Reader index = new InputStreamReader(new FileInputStream(new File(System.getProperty(SysPropKey.CUST_PARAM_PATH)
                                    + "/param/brands/" + cncId + "/rawdata_index.json")), "UTF-8");
                            cal.config = gson.fromJson(config, Map.class);
                            cal.radataIndex = gson.fromJson(index, Map.class);
                        } catch (UnsupportedEncodingException e) {
                            e.printStackTrace();
                        } catch (FileNotFoundException e) {
                            e.printStackTrace();
                        }
                        devices.add(cal);
                    }
                }
                return devices;
            }
        });
//        LOG.info(String.valueOf(result.size()));
//        return result;
    }

    public static class CalculateInfo {
        String platformId;

        List<Map<String, String>> machines;

        // 指定日期範圍內的班次表
        Map<String, List<Map<String, Object>>> shiftTimes;

        // 當下時間點的班次相關資訊
        String nowLogicallyDate;
        Map<String, Object> nowShiftTime;
        List<Map<String, Object>> nowShiftTimes;

        // 資料儲存跟目錄
        String dataRoot;

        // RawData 欄位 index
        Map<String, Integer> rawdataIndex;

        // RawData 多系統的 partcount 欄位
        int partcountColumn;

        String hippoServerIp;
        int hippoServerPort;
    }

    private static class HippoServerConfig {
        String ip;
        Integer port;
    }

    class CalculateMachineInfo<T> {
        String brand;
        List<String> deviceIds = new ArrayList<String>();
        Map<String, T> config;
        Map<String, Integer> radataIndex;
    }
}
