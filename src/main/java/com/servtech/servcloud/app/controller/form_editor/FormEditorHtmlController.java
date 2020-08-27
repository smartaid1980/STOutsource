package com.servtech.servcloud.app.controller.form_editor;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.SysAppClassTag;
import com.servtech.servcloud.module.model.SysAppInfo;
import com.servtech.servcloud.module.model.SysFunc;
import org.apache.tools.zip.ZipEntry;
import org.apache.tools.zip.ZipOutputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.lang.reflect.Type;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;


import static com.servtech.servcloud.app.controller.form_editor.FormEditorAppController.createAppFile;
import static com.servtech.servcloud.app.controller.form_editor.FormEditorFuncController.addFuncDataInConfig;
import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.DELETE;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;
import static org.springframework.web.bind.annotation.RequestMethod.PUT;

/**
 * Created by Beata on 2018/3/20.
 */
@RestController
@RequestMapping("/formeditor/html")
public class FormEditorHtmlController {

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/export", method = POST)
    public RequestResult<String> export(@RequestBody final Map data) {
        try {
            return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    String appPath = System.getProperty(SysPropKey.WEB_ROOT_PATH) + "/ServCloud/app/" + data.get("app_id").toString();
                    String appId = data.get("app_id").toString();
                    String[] folderName = {"/function/en/", "/function/zh/", "/function/zh_tw/", "/tag/"};

                    File appFolder = new File(appPath);
                    if (!appFolder.exists()) {
                        List<Map> appResult = SysAppInfo.find("app_id = ?", appId).toMaps();
                        List<Map> appTagResult = SysAppClassTag.find("app_id = ?", appId).toMaps();
                        appResult.get(0).put("tag_id", appTagResult.get(0).get("tag_id").toString());
                        createAppFile(appResult.get(0));

                        List<Map> funcResult = SysFunc.find("app_id = ?", appId).toMaps();
                        for (Map func : funcResult) {
                            addFuncDataInConfig(appId, func.get("func_id").toString(), func.get("func_name").toString());
                        }

                    }

                    // 建立資料夾
                    for (String nameStr : folderName) {
                        File folder = new File(appPath + nameStr + data.get("func_id").toString() + ".html");
                        try {
                            if (folder.exists()) {
                                StringBuilder sb = new StringBuilder();
                                int fileSize = (int) folder.length();
                                int buff;
                                FileInputStream fis = new FileInputStream(folder);
                                byte[] bytes = new byte[fileSize];
                                while ((buff = fis.read(bytes, 0, bytes.length)) != -1) {
                                    sb.append(new String(bytes, 0, buff, "utf-8"));
                                }
                                fis.close();

                                File oldFolder = new File(appPath + nameStr + data.get("func_id").toString() + new SimpleDateFormat("yyyyMMdd_HHmmssSSS").format(new Date()) + ".html");
                                FileOutputStream fos = new FileOutputStream(oldFolder);
                                String result = sb.toString();
                                fos.write(result.getBytes("utf-8"));
                                fos.flush();
                                fos.close();
                            }
                            System.out.println(nameStr + data.get("func_id").toString() + ".html");
                            FileOutputStream fos = new FileOutputStream(folder);
                            String result = data.get("code").toString();
                            fos.write(result.getBytes("utf-8"));
                            fos.flush();
                            fos.close();
                        } catch (IOException e) {
                            System.out.println(e);
                            return fail("建檔失敗，原因待查...");
                        }
                    }

                    // 建立config資料夾
                    String formEditorFolderName = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/formEditor/" + appId + "/" + data.get("func_id").toString();
                    String jsonPath = "";
                    File formEditorFolder = new File(formEditorFolderName);
                    if (!formEditorFolder.exists()) {
                        formEditorFolder.mkdirs();
                    }
                    if (data.get("name").toString().equals("")) {
                        jsonPath = formEditorFolderName + "/" + new SimpleDateFormat("yyyyMMdd_HHmmssSSS").format(new Date()) + ".json";
                    } else {
                        jsonPath = formEditorFolderName + "/" + data.get("name").toString() + ".json";
                    }
                    File formEditor = new File(jsonPath);
                    try {
                        FileOutputStream fos = new FileOutputStream(formEditor);
                        String result = data.get("config").toString();
                        fos.write(result.getBytes("utf-8"));
                        fos.flush();
                        fos.close();
                    } catch (IOException e) {
                        System.out.println(e);
                        return fail("建檔失敗，原因待查...");
                    }

                    return success("create success");
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/checkConfigFileNameExists", method = POST)
    public RequestResult<Boolean> checkConfigFileNameExists(@RequestBody final Map data) {
        String folderName = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/formEditor/";
        File configFile = new File(folderName + data.get("app").toString() + "/" + data.get("func").toString() + "/" + data.get("name").toString() + ".json");
        return success(configFile.exists());
    }

    @RequestMapping(value = "/getConfigFile", method = GET)
    public RequestResult<?> getConfigFile() {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String formEditorFolderName = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/formEditor/";
                File formEditorFolder = new File(formEditorFolderName);
                Map<String, Map<String, String[]>> fileList = new HashMap<String, Map<String, String[]>>();
                for (File appFolder : formEditorFolder.listFiles()) {
                    Map<String, String[]> funcList = new HashMap<String, String[]>();
                    for (File funcFolder : appFolder.listFiles()) {
                        String[] jsonFileList = funcFolder.list();
                        for (int index = 0; index < jsonFileList.length; index++) {
                            if (jsonFileList[index].toLowerCase().contains(".json".toLowerCase())) {
                                jsonFileList[index] = jsonFileList[index].replace(".json", "");
                            }
                        }
                        funcList.put(funcFolder.getName(), jsonFileList);
                    }
                    fileList.put(appFolder.getName(), funcList);
                }
                return success(fileList);
            }
        });
    }

    @RequestMapping(value = "/getConfigData", method = POST)
    public RequestResult<?> getConfigData(@RequestBody final Map data) {
        String folderName = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/formEditor/";
        File configFile = new File(folderName + data.get("app").toString() + "/" + data.get("func").toString() + "/" + data.get("file").toString() + ".json");
        if (configFile.exists()) {
            try {
                StringBuilder sb = new StringBuilder();
                int fileSize = (int) configFile.length();
                int buff;
                FileInputStream fis = new FileInputStream(configFile);
                byte[] bytes = new byte[fileSize];
                while ((buff = fis.read(bytes, 0, bytes.length)) != -1) {
                    sb.append(new String(bytes, 0, buff, "utf-8"));
                }
                fis.close();

                return success(sb.toString());
            } catch (IOException e) {
                System.out.println(e);
            }
        }
        return fail("沒有這筆資料");
    }

    @RequestMapping(value = "/download", method = POST)
    public RequestResult<String> download(@RequestParam("app_id") final String appId,
                                          @RequestParam("func_id") final String funcId,
                                          @RequestParam("code") final String code) {
        try {
            return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    try {
                        String appPath = System.getProperty(SysPropKey.WEB_ROOT_PATH) + "/ServCloud/app/" + appId;
                        String[] folderName = {"/data/", "/function/en/", "/function/zh/", "/function/zh_tw/", "/img/", "/langs/", "/tag/", "/config.json"};

                        String mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                        String headerKey = "Content-Disposition";
                        String headerValue = "attachment; filename=\"" + appId + ".zip\"";

                        response.setContentType(mimeType);
                        response.setHeader(headerKey, headerValue);

                        ZipOutputStream zos = null;
                        zos = new ZipOutputStream(response.getOutputStream());
                        zos.setEncoding("UTF-8");
                        for (String nameStr : folderName) {
                            File folder = new File(appPath + nameStr);
                            if (folder.exists()) {
                                if (nameStr.equals("/config.json")) {
                                    ZipEntry zipEntry = new ZipEntry(appId + nameStr);
                                    zos.putNextEntry(zipEntry);
                                    int buff;
                                    byte[] bytes = new byte[1024];
                                    FileInputStream fis = new FileInputStream(folder);
                                    BufferedInputStream bis = new BufferedInputStream(fis);
                                    while ((buff = bis.read(bytes)) != -1) {
                                        zos.write(bytes, 0, buff);
                                    }
                                    fis.close();
                                    zos.closeEntry();
                                } else {
                                    for (File file : folder.listFiles()) {
                                        ZipEntry zipEntry = new ZipEntry(appId + nameStr + file.getName());
                                        zos.putNextEntry(zipEntry);
                                        if (file.getName().equals(funcId + ".html")) {
                                            zos.write(code.toString().replace("\\n", "\n").getBytes());
                                        } else if (file.exists()) {
                                            int buff;
                                            byte[] bytes = new byte[1024];
                                            FileInputStream fis = new FileInputStream(file);
                                            BufferedInputStream bis = new BufferedInputStream(fis);
                                            while ((buff = bis.read(bytes)) != -1) {
                                                zos.write(bytes, 0, buff);
                                            }
                                            fis.close();
                                        }
                                        zos.closeEntry();
                                    }
                                }
                            } else {
                                if (nameStr.equals("/function/en/") || nameStr.equals("/function/zh/") ||
                                        nameStr.equals("/function/zh_tw/") || nameStr.equals("/tag/")) {
                                    ZipEntry zipEntry = new ZipEntry(appId + nameStr + funcId + ".html");
                                    zos.putNextEntry(zipEntry);
                                    zos.write(code.toString().replace("\\n", "\n").getBytes());
                                } else if (nameStr.equals("/langs/")) {
                                    ZipEntry zipEntry = new ZipEntry(appId + nameStr + "languages.tsv");
                                    zos.putNextEntry(zipEntry);
                                } else if (nameStr.equals("/config.json")) {
                                    ZipEntry zipEntry = new ZipEntry(appId + nameStr);
                                    zos.putNextEntry(zipEntry);
                                    List<Map> appResult = SysAppInfo.find("app_id = ?", appId).toMaps();
                                    List<Map> appTagResult = SysAppClassTag.find("app_id = ?", appId).toMaps();
                                    List<Map> funcResult = SysFunc.find("app_id = ?", appId).toMaps();
                                    String result = "{\"app\":{" +
                                            "\"id\":\"" + appResult.get(0).get("app_id").toString() + "\"," +
                                            "\"name\":\"" + appResult.get(0).get("app_name").toString() + "\"," +
                                            "\"type\":1," +
                                            "\"description\":\"" + appResult.get(0).get("description").toString() + "\"," +
                                            "\"version\":\"1.0\"}," +
                                            "\"functions\":[";
                                    int count = 0;
                                    for (Map func : funcResult) {
                                        if (count > 0) {
                                            result += ",";
                                        }
                                        result += "{\"id\":\"" + func.get("func_id").toString() + "\",\"name\":\"" + func.get("func_name").toString() + "\"}";
                                        count++;
                                    }
                                    result += "],\"tags\":[\"" + appTagResult.get(0).get("tag_id").toString() + "\"]}";
                                    zos.write(result.getBytes());
                                } else {
                                    ZipEntry zipEntry = new ZipEntry(appId + nameStr);
                                    zos.putNextEntry(zipEntry);
                                }
                                zos.closeEntry();
                            }
                        }
                        zos.close();
                        return RequestResult.success();
                    } catch (IOException e) {
                        System.out.println(e);
                        return fail("建檔失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/getTableDataFileList", method = GET)
    public RequestResult<?> getTableDataFileList(@RequestParam("app_id") final String appId) {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String formEditorFolderName = System.getProperty(SysPropKey.WEB_ROOT_PATH) + "/ServCloud/app/" + appId + "/data/";
                File formEditorFolder = new File(formEditorFolderName);
                String[] jsonFileList = formEditorFolder.list();
                List<String> fileNameList = new ArrayList<String>();

                if (jsonFileList != null) {
                    for (int index = 0; index < jsonFileList.length; index++) {
                        if (jsonFileList[index].toLowerCase().contains(".json".toLowerCase())) {
                            fileNameList.add(jsonFileList[index].replace(".json", ""));
                        }
                    }
                }

                return success(fileNameList);
            }
        });
    }

    @RequestMapping(value = "/read", method = GET)
    public RequestResult<?> read(@RequestParam("app_id") final String appId,
                                 @RequestParam("data_filename") final String dataFilename) {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                final String criteria = request.getParameter("criteria");
                Type type = new TypeToken<Map<String, List>>() {
                }.getType();
                String fileName = System.getProperty(SysPropKey.WEB_ROOT_PATH) + "/ServCloud/app/" + appId + "/data/" + dataFilename + ".json";
                File file = new File(fileName);
                if (file.exists()) {
                    try {
                        StringBuilder sb = new StringBuilder();
                        int fileSize = (int) file.length();
                        int buff;
                        FileInputStream fis = new FileInputStream(file);
                        byte[] bytes = new byte[fileSize];
                        while ((buff = fis.read(bytes, 0, bytes.length)) != -1) {
                            sb.append(new String(bytes, 0, buff, "utf-8"));
                        }
                        fis.close();

                        Map<String, List> dataList = new Gson().fromJson(sb.toString(), type);
                        List<Map<String, Object>> dataMap = new ArrayList<Map<String, Object>>();
                        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

                        for (int i = 0; i < dataList.get("data").size(); i++) {
                            String str = dataList.get("data").get(i).toString().replace("[", "").replace("]", "");
                            String[] tokens = str.split(", ");
                            int count = 0;
                            Map<String, Object> rowData = new HashMap<String, Object>();
                            Map<String, String> keysData = new HashMap<String, String>();
                            for (String token : tokens) {
                                for (int keysCount = 0; keysCount < dataList.get("keys").size(); keysCount++) {
                                    if (dataList.get("head").get(count).toString().equals(dataList.get("keys").get(keysCount).toString())) {
                                        keysData.put(dataList.get("head").get(count).toString(), token);
                                    }
                                }
                                rowData.put(dataList.get("head").get(count).toString(), token);
                                count++;
                            }
                            rowData.put("pks", keysData);
                            if (criteria != null) {
                                boolean isSameValue = true;
                                for (String col : criteria.split("_And_")) {
                                    if (col.split("=")[1].toLowerCase().contains("[".toLowerCase()) &&
                                            col.split("=")[1].toLowerCase().contains("]".toLowerCase())) {
                                        boolean isArrayValueMatch = false;
                                        String newArrayValue = col.split("\\[")[1];
                                        if (newArrayValue.length() > 1) {
                                            newArrayValue = newArrayValue.split("]")[0];
                                            for (String arrayValue : newArrayValue.split(",")) {
                                                if (arrayValue.equals(rowData.get(col.split("=")[0]))) {
                                                    isArrayValueMatch = true;
                                                    break;
                                                }
                                            }
                                            if (!isArrayValueMatch) {
                                                isSameValue = false;
                                                break;
                                            }
                                        } else {
                                            break;
                                        }
                                    } else if (col.split("=")[1].toLowerCase().contains("_Type_date".toLowerCase())) {
                                        try {
                                            Date startTime = sdf.parse(col.split("=")[1].split("_Type_date")[0].replace("/", "-") + " 00:00:00");
                                            Date endTime = sdf.parse(col.split("=")[1].split("_Type_date")[0].replace("/", "-") + " 23:59:59");
                                            Date thisTime = sdf.parse(rowData.get(col.split("=")[0]).toString());
                                            if (!(startTime.compareTo(thisTime) <= 0 && endTime.compareTo(thisTime) >= 0)) {
                                                isSameValue = false;
                                                break;
                                            }
                                        } catch (ParseException e) {
                                            e.printStackTrace();
                                        }
                                    } else if (col.split("=")[1].toLowerCase().contains("_Type_startEndDate".toLowerCase())) {
                                        try {
                                            String startEndDate = col.split("=")[1].split("_Type_startEndDate")[0];
                                            Date startTime = sdf.parse(startEndDate.split("_To_")[0].replace("/", "-") + " 00:00:00");
                                            Date endTime = sdf.parse(startEndDate.split("_To_")[1].replace("/", "-") + " 23:59:59");
                                            Date thisTime = sdf.parse(rowData.get(col.split("=")[0]).toString());
                                            if (!(startTime.compareTo(thisTime) <= 0 && endTime.compareTo(thisTime) >= 0)) {
                                                isSameValue = false;
                                                break;
                                            }
                                        } catch (ParseException e) {
                                            e.printStackTrace();
                                        }
                                    } else {
                                        if (!col.split("=")[1].equals(rowData.get(col.split("=")[0]))) {
                                            isSameValue = false;
                                            break;
                                        }
                                    }
                                }
                                if (isSameValue) {
                                    dataMap.add(rowData);
                                }
                            } else {
                                dataMap.add(rowData);
                            }
                        }
                        return success(dataMap);
                    } catch (IOException e) {
                        System.out.println(e);
                    }
                }
                return success();
            }
        });
    }

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                Type type = new TypeToken<Map<String, List>>() {
                }.getType();
                String fileName = System.getProperty(SysPropKey.WEB_ROOT_PATH) + "/ServCloud/app/" + data.get("app_id") + "/data/" + data.get("data_filename") + ".json";
                File file = new File(fileName);
                if (file.exists()) {
                    try {
                        StringBuilder sb = new StringBuilder();
                        int fileSize = (int) file.length();
                        int buff;
                        FileInputStream fis = new FileInputStream(file);
                        byte[] bytes = new byte[fileSize];
                        while ((buff = fis.read(bytes, 0, bytes.length)) != -1) {
                            sb.append(new String(bytes, 0, buff, "utf-8"));
                        }
                        fis.close();

                        Map<String, List> dataList = new Gson().fromJson(sb.toString(), type);
                        List<String> newData = new ArrayList<String>();
                        Map<String, String> keysData = new HashMap<String, String>();
                        for (int i = 0; i < dataList.get("head").size(); i++) {
                            for (int keyCount = 0; keyCount < dataList.get("keys").size(); keyCount++) {
                                if (dataList.get("head").get(i).equals(dataList.get("keys").get(keyCount))) {
                                    keysData.put(dataList.get("keys").get(keyCount).toString(),
                                            data.get(dataList.get("head").get(i)) != null ? data.get(dataList.get("head").get(i)).toString() : "");
                                    break;
                                }
                            }
                            if (data.get(dataList.get("head").get(i)) != null) {
                                newData.add(data.get(dataList.get("head").get(i)).toString());
                            } else {
                                newData.add("");
                            }
                        }

                        if (!newData.isEmpty()) {
                            dataList.get("data").add(newData);
                        }

                        FileOutputStream fos = new FileOutputStream(fileName);
                        String result = new Gson().toJson(dataList);
                        fos.write(result.getBytes("utf-8"));
                        fos.flush();
                        fos.close();

                        return success(keysData);
                    } catch (IOException e) {
                        System.out.println(e);
                    }
                }
                return success();
            }
        });
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                Type type = new TypeToken<Map<String, List>>() {
                }.getType();
                String fileName = System.getProperty(SysPropKey.WEB_ROOT_PATH) + "/ServCloud/app/" + data.get("app_id") + "/data/" + data.get("data_filename") + ".json";
                File file = new File(fileName);
                if (file.exists()) {
                    try {
                        StringBuilder sb = new StringBuilder();
                        int fileSize = (int) file.length();
                        int buff;
                        FileInputStream fis = new FileInputStream(file);
                        byte[] bytes = new byte[fileSize];
                        while ((buff = fis.read(bytes, 0, bytes.length)) != -1) {
                            sb.append(new String(bytes, 0, buff, "utf-8"));
                        }
                        fis.close();

                        Map<String, List> dataList = new Gson().fromJson(sb.toString(), type);
                        List<Map<String, Object>> dataMap = new ArrayList<Map<String, Object>>();

                        List<String> newData = new ArrayList<String>();
                        for (int i = 0; i < dataList.get("head").size(); i++) {
                            if (data.get(dataList.get("head").get(i)) != null) {
                                newData.add(data.get(dataList.get("head").get(i)).toString());
                            } else {
                                newData.add("");
                            }
                        }

                        for (int i = 0; i < dataList.get("data").size(); i++) {
                            String str = dataList.get("data").get(i).toString().replace("[", "").replace("]", "");
                            String[] tokens = str.split(", ");
                            int count = 0;
                            Map<String, Object> rowData = new HashMap<String, Object>();
                            for (String token : tokens) {
                                rowData.put(dataList.get("head").get(count).toString(), token);
                                count++;
                            }
                            dataMap.add(rowData);
                        }

                        Map<String, String> keysData = new HashMap<String, String>();
                        for (int dataCount = 0; dataCount < dataMap.size(); dataCount++) {
                            boolean isUpdateThisData = true;
                            for (int keyCount = 0; keyCount < dataList.get("keys").size(); keyCount++) {
                                if (!dataMap.get(dataCount).get(dataList.get("keys").get(keyCount)).equals(data.get(dataList.get("keys").get(keyCount)))) {
                                    isUpdateThisData = false;
                                    break;
                                } else {
                                    keysData.put(dataList.get("keys").get(keyCount).toString(), data.get(dataList.get("keys").get(keyCount)).toString());
                                }
                            }
                            if (isUpdateThisData) {
                                for (int updateDataCount = 0; updateDataCount < dataList.get("head").size(); updateDataCount++) {
                                    if (data.get(dataList.get("head").get(updateDataCount)) == null) {
                                        newData.remove(updateDataCount);
                                        newData.add(updateDataCount, dataMap.get(dataCount).get(dataList.get("head").get(updateDataCount)).toString());
                                    }
                                }
                                dataList.get("data").remove(dataCount);
                                dataList.get("data").add(dataCount, newData);
                            }
                        }

                        FileOutputStream fos = new FileOutputStream(fileName);
                        String result = new Gson().toJson(dataList);
                        fos.write(result.getBytes("utf-8"));
                        fos.flush();
                        fos.close();

                        return success(keysData);
                    } catch (IOException e) {
                        System.out.println(e);
                    }
                }
                return success();
            }
        });
    }

    @RequestMapping(value = "/delete", method = DELETE)
    public RequestResult<?> delete(@RequestBody final Object[] idList) {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String appId = request.getParameter("app_id").toString();
                String dataFilename = request.getParameter("data_filename").toString();
                Type type = new TypeToken<Map<String, List>>() {
                }.getType();
                String fileName = System.getProperty(SysPropKey.WEB_ROOT_PATH) + "/ServCloud/app/" + appId + "/data/" + dataFilename + ".json";
                File file = new File(fileName);
                if (file.exists()) {
                    try {
                        StringBuilder sb = new StringBuilder();
                        int fileSize = (int) file.length();
                        int buff;
                        FileInputStream fis = new FileInputStream(file);
                        byte[] bytes = new byte[fileSize];
                        while ((buff = fis.read(bytes, 0, bytes.length)) != -1) {
                            sb.append(new String(bytes, 0, buff, "utf-8"));
                        }
                        fis.close();

                        Map<String, List> dataList = new Gson().fromJson(sb.toString(), type);
                        List<Map<String, Object>> dataMap = new ArrayList<Map<String, Object>>();

                        for (int i = 0; i < dataList.get("data").size(); i++) {
                            String str = dataList.get("data").get(i).toString().replace("[", "").replace("]", "");
                            String[] tokens = str.split(", ");
                            int count = 0;
                            Map<String, Object> rowData = new HashMap<String, Object>();
                            for (String token : tokens) {
                                rowData.put(dataList.get("head").get(count).toString(), token);
                                count++;
                            }
                            dataMap.add(rowData);
                        }

                        List<Integer> deleteDataCount = new ArrayList<Integer>();

                        for (int idListCount = 0; idListCount < idList.length; idListCount++) {
                            Map<String, String> keys = (Map<String, String>) idList[idListCount];
                            for (int dataCount = 0; dataCount < dataMap.size(); dataCount++) {
                                boolean isDeleteThisData = true;
                                for (int keyCount = 0; keyCount < dataList.get("keys").size(); keyCount++) {
                                    if (!dataMap.get(dataCount).get(dataList.get("keys").get(keyCount)).equals(keys.get(dataList.get("keys").get(keyCount)))) {
                                        isDeleteThisData = false;
                                        break;
                                    }
                                }
                                if (isDeleteThisData) {
                                    deleteDataCount.add(0, dataCount);
                                }
                            }
                        }

                        for (Integer count : deleteDataCount) {
                            dataList.get("data").remove((int) count);
                        }

                        FileOutputStream fos = new FileOutputStream(fileName);
                        String result = new Gson().toJson(dataList);
                        fos.write(result.getBytes("utf-8"));
                        fos.flush();
                        fos.close();

                        return success(dataList);
                    } catch (IOException e) {
                        System.out.println(e);
                    }
                }
                return success();
            }
        });
    }

    @RequestMapping(value = "/changeModalData", method = POST)
    public RequestResult<?> changeModalData(@RequestBody final Map data) {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                Type type = new TypeToken<Map<String, List>>() {
                }.getType();
                String fileName = System.getProperty(SysPropKey.WEB_ROOT_PATH) + "/ServCloud/app/" + data.get("app_id") + "/data/" + data.get("data_filename") + ".json";
                File file = new File(fileName);
                if (file.exists()) {
                    try {
                        StringBuilder sb = new StringBuilder();
                        int fileSize = (int) file.length();
                        int buff;
                        FileInputStream fis = new FileInputStream(file);
                        byte[] bytes = new byte[fileSize];
                        while ((buff = fis.read(bytes, 0, bytes.length)) != -1) {
                            sb.append(new String(bytes, 0, buff, "utf-8"));
                        }
                        fis.close();

                        Map<String, List> dataList = new Gson().fromJson(sb.toString(), type);
                        List<Map<String, Object>> dataMap = new ArrayList<Map<String, Object>>();

                        List<String> newData = new ArrayList<String>();
                        for (int i = 0; i < dataList.get("head").size(); i++) {
                            if (data.get(dataList.get("head").get(i)) != null) {
                                newData.add(data.get(dataList.get("head").get(i)).toString());
                            } else {
                                newData.add("");
                            }
                        }
                        System.out.println(newData.toString());

                        for (int i = 0; i < dataList.get("data").size(); i++) {
                            String str = dataList.get("data").get(i).toString().replace("[", "").replace("]", "");
                            String[] tokens = str.split(", ");
                            int count = 0;
                            Map<String, Object> rowData = new HashMap<String, Object>();
                            for (String token : tokens) {
                                rowData.put(dataList.get("head").get(count).toString(), token);
                                count++;
                            }
                            dataMap.add(rowData);
                        }

                        boolean isUpdate = false;
                        for (int dataCount = 0; dataCount < dataMap.size(); dataCount++) {
                            boolean isUpdateThisData = true;
                            for (int keyCount = 0; keyCount < dataList.get("keys").size(); keyCount++) {
                                if (data.get(dataList.get("keys").get(keyCount)) == null) {
                                    isUpdateThisData = false;
                                } else {
                                    if (!dataMap.get(dataCount).get(dataList.get("keys").get(keyCount)).equals(data.get(dataList.get("keys").get(keyCount)))) {
                                        isUpdateThisData = false;
                                    }
                                }
                            }
                            if (isUpdateThisData) {
                                if (!newData.isEmpty()) {
                                    isUpdate = true;
                                    System.out.println("UpdateThisData");
                                    for (int updateDataCount = 0; updateDataCount < dataList.get("head").size(); updateDataCount++) {
                                        if (data.get(dataList.get("head").get(updateDataCount)) == null) {
                                            newData.remove(updateDataCount);
                                            newData.add(updateDataCount, dataMap.get(dataCount).get(dataList.get("head").get(updateDataCount)).toString());
                                        }
                                    }
                                    dataList.get("data").remove(dataCount);
                                    dataList.get("data").add(dataCount, newData);
                                    break;
                                }
                            }
                        }
                        if (!newData.isEmpty()) {
                            if (!isUpdate) {
                                dataList.get("data").add(newData);
                            }
                        }

                        FileOutputStream fos = new FileOutputStream(fileName);
                        String result = new Gson().toJson(dataList);
                        fos.write(result.getBytes("utf-8"));
                        fos.flush();
                        fos.close();

                        return success(dataList);
                    } catch (IOException e) {
                        System.out.println(e);
                    }
                }
                return success();
            }
        });
    }
}
