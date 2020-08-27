package com.servtech.servcloud.app.controller.equip_monitor;

import com.google.common.io.Files;
import com.servtech.common.platform.MultiGetData;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.DeviceCncBrand;
import com.servtech.servcloud.module.model.WorkSection;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.Charsets;
import org.apache.commons.io.FileUtils;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.lang.reflect.Array;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Kevin Big Big on 2015/7/27.
 */
@Controller
@RequestMapping("/equipmonitor")
public class EquipMonitorController {

    private static final Logger log = LoggerFactory.getLogger(EquipMonitorController.class);

    private static final String F_SEP = File.separator;

    private static final String APP_NAME = "EquipMonitor";

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/parserXml", method = POST)
    @ResponseBody
    public RequestResult<List<Map>> parserXml(@RequestBody final Map data) {
        Document doc = null;
        String xml = (String) data.get("xml");
        try {
            doc = DocumentHelper.parseText(xml);
        } catch (DocumentException e) {
            e.printStackTrace();
        }
        Map map = new MultiGetData().parser(doc);
        List<Map> maps = new ArrayList<Map>();
        maps.add(map);
        return success(maps);
    }

    @RequestMapping(value = "/uploadPlantBackground", method = POST)
    @ResponseBody
    public RequestResult<String> uploadPlantBackground(@RequestParam("file") MultipartFile file) {

        String dir = getDataFolder() + F_SEP +
                "monitor_overall" + F_SEP + "background";
        File bg = new File(dir, "plant.png");

        if (!file.isEmpty()) {
            try {
                buildFolder(bg.getParentFile());
                file.transferTo(bg);
            } catch (IOException e) {
                return fail(e.getMessage());
            }
        }

        return success();
    }

    @RequestMapping(value = "/plantBackground", method = GET, produces = MediaType.IMAGE_PNG_VALUE)
    @ResponseBody
    public byte[] plantBackground() throws IOException {

        String dir = getDataFolder() + F_SEP +
                "monitor_overall" + F_SEP + "background";
        File bg = new File(dir, "plant.png");

        return Files.toByteArray(bg);
    }

    @RequestMapping(value = "/uploadproductionlinebackground", method = POST)
    @ResponseBody
    public RequestResult<String> uploadProductionLineBackground(@RequestParam("id") String id, @RequestParam("file") MultipartFile file) {

        String dir = getDataFolder() + F_SEP +
                "production_line" + F_SEP + "background";
        File bg = new File(dir, id + ".png");

        System.out.println("upload production line background");
        System.out.println("id:" + id);
        System.out.println("file:" + bg.getAbsolutePath());

        if (!file.isEmpty()) {
            try {
                buildFolder(bg.getParentFile());
                file.transferTo(bg);
            } catch (IOException e) {
                return fail(e.getMessage());
            }
        }

        return success();
    }

    @RequestMapping(value = "productionlinebackground", method = GET, produces = MediaType.IMAGE_PNG_VALUE)
    @ResponseBody
    public byte[] productionLineBackground(@RequestParam("id") String id) throws IOException {

        String dir = getDataFolder() + F_SEP +
                "production_line" + F_SEP + "background";
        File bg = new File(dir, id + ".png");

        return Files.toByteArray(bg);
    }

    @RequestMapping(value = "/uploadPlantAreaBackground", method = POST)
    @ResponseBody
    public RequestResult<String> uploadPlantAreaBackground(@RequestParam("id") String id, @RequestParam("file") MultipartFile file) {

        String dir = getDataFolder() + F_SEP +
                "plant_area" + F_SEP + "background";
        File bg = new File(dir, id + ".png");

        System.out.println("upload plant area background");
        System.out.println("id:" + id);
        System.out.println("file:" + bg.getAbsolutePath());

        if (!file.isEmpty()) {
            try {
                buildFolder(bg.getParentFile());
                file.transferTo(bg);
            } catch (IOException e) {
                return fail(e.getMessage());
            }
        }

        return success();
    }

    @RequestMapping(value = "/plantAreaBackground", method = GET, produces = MediaType.IMAGE_PNG_VALUE)
    @ResponseBody
    public byte[] plantAreaBackground(@RequestParam("id") String id) throws IOException {

        String dir = getDataFolder() + F_SEP +
                "plant_area" + F_SEP + "background";
        File bg = new File(dir, id + ".png");

        return Files.toByteArray(bg);
    }

    @RequestMapping(value = "/getPlantAreaImg", method = GET, produces = MediaType.IMAGE_PNG_VALUE)
    @ResponseBody
    public byte[] getPlantAreaImg(@RequestParam("path") String path) {
        try {
            return Files.toByteArray(new File(path));
        } catch (IOException e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            return null;
        }
    }

    @RequestMapping(value = "/uploadPlantAreaDeviceImage", method = POST)
    @ResponseBody
    public RequestResult<String> uploadPlantAreaDeviceImage(@RequestParam("id") String id, @RequestParam("file") MultipartFile file) {
        String dir = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/equipMonitor/users/img";
        File bg = new File(dir, id + ".png");

        if (!file.isEmpty()) {
            try {
                buildFolder(bg.getParentFile());
                file.transferTo(bg);
            } catch (IOException e) {
                return fail(e.getMessage());
            }
        }

        return success();
    }

    @RequestMapping(value = "/getPlantAreaDevicesImage", method = POST)
    @ResponseBody
    public RequestResult<Map<String, String>> getPlantAreaDevicesImage(@RequestBody List<String> devices) {
        return ActiveJdbc.oper(new Operation<RequestResult<Map<String, String>>>() {
            @Override
            public RequestResult<Map<String, String>> operate() {
                Map<String, String> backgroupList = new HashMap<>();
                try {
                    for (int i = 0; i < devices.size(); i++) {
                        String dir = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/equipMonitor/users/img";
                        File bg = new File(dir, devices.get(i) + ".png");
                        if (bg.exists()) {
                            try {
                                backgroupList.put(devices.get(i), "data:image/png;base64," + new String(Base64.encodeBase64(Files.toByteArray(bg)), "UTF-8"));
                            } catch (IOException e) {
                                System.out.println(e);
                            }
                        } else {
                            dir = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/equipMonitor/template/img";
                            List<Map> appResult = DeviceCncBrand.find("device_id = ?", devices.get(i)).toMaps();
                            bg = new File(dir, appResult.get(0).get("cnc_id") + ".png");
                            if (bg.exists()) {
                                try {
                                    backgroupList.put(devices.get(i), "data:image/png;base64," + new String(Base64.encodeBase64(Files.toByteArray(bg)), "UTF-8"));
                                } catch (IOException e) {
                                    System.out.println(e);
                                }
                            }
                        }
                    }
                    return success(backgroupList);
                } catch (IndexOutOfBoundsException e) {
                    return success(backgroupList);
                }
            }
        });
    }

    @RequestMapping(value = "/uploadAllPlantAreaBackground", method = POST)
    @ResponseBody
    public RequestResult<String> uploadAllPlantAreaBackground(@RequestParam("file") MultipartFile file) {
        File bg = new File(System.getProperty(SysPropKey.WEB_ROOT_PATH) + "/ServCloud/app/EquipMonitor/img/plantArea/bkg.png");
        System.out.println("upload all plant area background");
        System.out.println("file:" + bg.getAbsolutePath());

        if (!file.isEmpty()) {
            try {
                buildFolder(bg.getParentFile());
                file.transferTo(bg);
            } catch (IOException e) {
                return fail(e.getMessage());
            }
        }

        return success();
    }

    @RequestMapping(value = "/allPlantAreaBackground", method = GET, produces = MediaType.IMAGE_PNG_VALUE)
    @ResponseBody
    public byte[] allPlantAreaBackground() throws IOException {
        File bg = new File(System.getProperty(SysPropKey.WEB_ROOT_PATH) + "/ServCloud/app/EquipMonitor/img/plantArea/bkg.png");

        return Files.toByteArray(bg);
    }

    @RequestMapping(value = "/updateSectionPosition", method = POST)
    @ResponseBody
    public RequestResult<String> updateSectionPosition(@RequestBody List<Map> sections) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                for (Map data : sections) {
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                    WorkSection section = new WorkSection();
                    section.fromMap(data);

                    if (!section.saveIt()) {
                        System.out.println(data.get("section_id") + " 修改失敗");
                    }
                }
                return success();
            }
        });
    }

    @RequestMapping(value = "/saveMachineParamsToFile", method = POST)
    @ResponseBody
    public RequestResult<String> saveMachineParamsToFile(@RequestBody final Map data) {
        String machinePath = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/equipMonitor/";
        if (data.get("device_id") != null) {
            machinePath += "users/" + data.get("device_id").toString() + ".csv";
        } else if (data.get("brand_id") != null) {
            machinePath += "template/" + data.get("brand_id").toString() + ".csv";
        }
        File folder = new File(machinePath);
        if (!folder.exists()) {
            try {
                folder.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        ArrayList dataList = new ArrayList((ArrayList) data.get("data"));
//        ArrayList dataString = new ArrayList()
        StringBuilder builder = new StringBuilder();
        // String[] list = {"signal", "sourceType", "source", "groupIcon", "groupName-zh_tw", "groupName-en", "groupName-zh", "groupGrid", "cardGrid", "label-zh_tw", "label-en", "label-zh", "index", "position", "type", "color", "min", "max", "unit", "format", "zh_tw", "en", "zh"};
        String[] list = {"signal", "groupIcon", "groupName-zh_tw", "groupName-en", "groupName-zh", "groupGrid", "cardGrid", "類型", "起始位址", "BIT數", "指定Bit", "註解", "訊號類別", "備註", "預設顯示參數 (9)+(30)", "index", "id", "name", "desc", "position", "type", "color", "max", "zh_tw", "en", "zh"};
        String dataString = "";
        for (String str : list) {
            dataString += str + ",";
        }
        builder.append(dataString + "\n");
        for (int index = 0; index < dataList.size(); index++) {
            Map<String, String> dataMap = new HashMap<String, String>((Map) dataList.get(index));
            dataString = "";
            for (String str : list) {
                String value = dataMap.get(str);
                if (dataMap.get(str) == null) {
                    value = "";
                }
                dataString += value + ",";
            }
            builder.append(dataString + "\n");
        }

        try {
            FileOutputStream fos = new FileOutputStream(folder);
            String result = builder.toString();
            fos.write(result.getBytes("utf-8"));
            fos.flush();
            fos.close();
        } catch (IOException e) {
            System.out.println(e);
            return fail("建檔失敗，原因待查...");
        }

        return success("save success");
    }

    @RequestMapping(value = "/saveMachineParamsToJsonFile", method = POST)
    @ResponseBody
    public RequestResult<String> saveMachineParamsToJsonFile(@RequestBody final Map data) {
        String machinePath = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/equipMonitor/";
        if (data.get("device_id") != null) {
            machinePath += "users/" + data.get("device_id").toString() + ".json";
        } else if (data.get("brand_id") != null) {
            machinePath += "template/" + data.get("brand_id").toString() + ".json";
        }
        File folder = new File(machinePath);
        if (!folder.exists()) {
            try {
                folder.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        try {
            FileOutputStream fos = new FileOutputStream(folder);
            String result = data.get("data").toString();
            fos.write(result.getBytes("utf-8"));
            fos.flush();
            fos.close();
        } catch (IOException e) {
            System.out.println(e);
            return fail("建檔失敗，原因待查...");
        }

        return success("save success");
    }

    @RequestMapping(value = "/createMachineParamFile", method = GET)
    @ResponseBody
    public RequestResult<?> createMachineParamFile(@RequestParam(value = "machineId") final String machineId) {
        final String CUST_PARAM_ROOT = System.getProperty(SysPropKey.CUST_PARAM_PATH);
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                try {
                    List<Map> appResult = DeviceCncBrand.find("device_id = ?", machineId).toMaps();
                    File oldFile = new File(CUST_PARAM_ROOT + "/equipMonitor/template/" + appResult.get(0).get("cnc_id") + ".csv");
                    File usersFile = new File(CUST_PARAM_ROOT + "/equipMonitor/users");
                    if (!usersFile.exists()) {
                        usersFile.mkdirs();
                    }
                    // File userFile = new File(CUST_PARAM_ROOT + "/equipMonitor/users/" + userId);
                    // if(!userFile.exists()){
                    //     userFile.mkdirs();
                    // }
                    File newFile = new File(CUST_PARAM_ROOT + "/equipMonitor/users/" + machineId + ".csv");
                    if (!newFile.exists()) {
                        newFile.createNewFile();
                    }

                    if (oldFile.exists()) {
                        StringBuilder sb = new StringBuilder();
                        int fileSize = (int) oldFile.length();
                        int buff;
                        FileInputStream fis = new FileInputStream(oldFile);
                        byte[] bytes = new byte[fileSize];
                        while ((buff = fis.read(bytes, 0, bytes.length)) != -1) {
                            sb.append(new String(bytes, 0, buff, "utf-8"));
                        }
                        fis.close();
                        FileOutputStream fos = new FileOutputStream(newFile);
                        String result = sb.toString();
                        fos.write(result.getBytes("utf-8"));
                        fos.flush();
                        fos.close();
                    }
                    if (!newFile.exists()) {
                        return fail("file not exist: " + newFile.getAbsolutePath());
                    }
                    List<String> records = new ArrayList<String>();
                    try {
                        records = Files.readLines(newFile, Charsets.UTF_8);
                    } catch (Exception e) {
                        e.printStackTrace();
                        log.warn("{}", e);
                    }
                    return success(records);
                } catch (Exception e) {
                    log.warn(e.getMessage());
                    return fail("建檔失敗，原因待查...");
                }
            }

            ;
        });
    }

    /**
     * pattern: $DATA_PATH/{APP_NAME}
     * example: "D://C:/stsf/Platform/data/EquipMonitor"
     *
     * @return String
     */
    String getDataFolder() {
//        return System.getProperty(SysPropKey.DATA_PATH) + F_SEP + APP_NAME;
        return System.getProperty(SysPropKey.DATA_PATH);
    }

    /**
     * @param folder
     * @throws IOException
     */
    void buildFolder(File folder) throws IOException {
        if (folder != null && !folder.exists()) {
            FileUtils.forceMkdir(folder);
        }
    }

}
