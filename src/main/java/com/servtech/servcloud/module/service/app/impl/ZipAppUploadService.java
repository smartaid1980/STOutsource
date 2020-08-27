package com.servtech.servcloud.module.service.app.impl;

import com.google.common.base.Function;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.google.common.io.Files;
import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.SysAppInfo;
import com.servtech.servcloud.module.model.SysFunc;
import com.servtech.servcloud.module.model.TagForApp;
import com.servtech.servcloud.module.service.app.AppUploadService;
import com.servtech.servcloud.module.service.app.exception.AppDecompressException;
import com.servtech.servcloud.module.service.app.exception.AppInsertException;
import com.servtech.servcloud.module.service.app.exception.AppUpdateException;
import com.servtech.servcloud.module.service.app.exception.ConfigJsonException;
import org.javalite.activejdbc.DBException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/**
 * Created by Hubert
 * Datetime: 2015/10/1 上午 10:21
 */
@Component
@Qualifier("zipAppUploadService")
public class ZipAppUploadService implements AppUploadService {
    private static final Logger log = LoggerFactory.getLogger(ZipAppUploadService.class);

    private String uploader;

    @Override
    public void setUploader(String uploader) {
        this.uploader = uploader;
    }

    @Override
    public void upload(File file) throws Exception {
        ZipFile zipFile = null;
        File appRootDir = null;

        try {
            zipFile = new ZipFile(file);
            AppConfig appConfig = getAppConfig(zipFile);

            appRootDir = new File(System.getProperty(SysPropKey.ROOT_PATH), "app/" + appConfig.app.get("id"));

            decompressAppZip(zipFile, appRootDir);

            insertIntoDb(appConfig);

        } catch (IOException e) { // new ZipFile
            throw new Exception(e.getMessage());

        } catch (ConfigJsonException e) { // getAppConfig
            throw new Exception(e.getMessage());

        } catch (AppDecompressException e) { // decompressAppZip
            throw new Exception(e.getMessage());

        } catch (AppInsertException e) { // insertIntoDb
            if (appRootDir.exists()) {
                for (File f : Files.fileTreeTraverser().postOrderTraversal(appRootDir)) {
                    if (f.isFile()) f.delete();
                }
                for (File f : Files.fileTreeTraverser().postOrderTraversal(appRootDir)) {
                    f.delete();
                }
                appRootDir.delete();
            }
            throw new Exception(e.getMessage());

        } finally {
            if (zipFile != null) {
                try {
                    zipFile.close();
                } catch (IOException e) {
                }
            }
        }
    }

    @Override
    public void upload(MultipartFile file) throws Exception {
        File uploadZipFile = new File(System.getProperty(SysPropKey.ROOT_PATH), "app/" + file.getOriginalFilename());

        try {
            file.transferTo(uploadZipFile);

            this.upload(uploadZipFile);

        } catch (IOException e) { // file.transferTo
            throw new Exception(e.getMessage());

        } finally {
            uploadZipFile.delete();
        }
    }

    @Override
    public void updateFunction(MultipartFile file) throws Exception {
        StringBuilder sb = new StringBuilder();
        try {
            BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"));
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
        } catch (IOException e) {
            throw new Exception(e.getMessage());
        }

        String configJson = sb.toString();
        try {
            AppConfig appConfig = new Gson().fromJson(configJson, AppConfig.class);
            appConfig.validation();

            updateDb(appConfig);

            try {
                File uploadConfigFile = new File(System.getProperty(SysPropKey.ROOT_PATH), "app/" + appConfig.app.get("id") + "/" + file.getOriginalFilename() + "_" + new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date()));
                file.transferTo(uploadConfigFile);
            } catch (IOException e) {
                log.warn("config.json 備份失敗了 T.T", e);
            }

        } catch (ConfigJsonException e) {
            throw new Exception(e.getMessage());

        } catch (JsonSyntaxException e) {
            throw new Exception("config.json syntax incorrect.");

        } catch (AppUpdateException e) {
            throw new Exception(e.getMessage());
        }
    }

    private AppConfig getAppConfig(ZipFile zipFile) throws ConfigJsonException {
        ZipEntry configEntry = zipFile.getEntry("config.json");
        if (configEntry == null) {
            throw new ConfigJsonException("No config.json file in upload file.");
        }
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(zipFile.getInputStream(configEntry), "UTF-8"));
            String line;
            StringBuilder sb = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }

            try {
                AppConfig appConfig = new Gson().fromJson(sb.toString(), AppConfig.class);
                appConfig.validation();

                return appConfig;
            } catch (JsonSyntaxException e) {
                throw new ConfigJsonException("config.json syntax incorrect.");
            }
        } catch (IOException e) {
            throw new ConfigJsonException(e.getMessage());
        }
    }


    private void decompressAppZip(ZipFile zipFile, File appRootDir) throws AppDecompressException {
        if (appRootDir.exists()) {
            throw new AppDecompressException(appRootDir.getName() + " already exist.");
        }
        appRootDir.mkdir();

        try {
            Enumeration<? extends ZipEntry> zipEntrys = zipFile.entries();
            while (zipEntrys.hasMoreElements()) {
                ZipEntry zipEntry = zipEntrys.nextElement();
                if (zipEntry.isDirectory()) {
                    File dir = new File(appRootDir, zipEntry.getName());
                    dir.mkdir();

                } else {
                    File file = new File(appRootDir, zipEntry.getName());
                    file.createNewFile();

                    BufferedInputStream is = new BufferedInputStream(zipFile.getInputStream(zipEntry));
                    BufferedOutputStream os = new BufferedOutputStream(new FileOutputStream(file));
                    try {
                        byte[] buf = new byte[1024];
                        int len;
                        while ((len = is.read(buf)) != -1) {
                            os.write(buf, 0, len);
                        }
                    } finally {
                        is.close();
                        os.close();
                    }
                }
            }
        } catch (IOException e) {
            throw new AppDecompressException(e.getMessage());
        }
    }

    private void insertIntoDb(final AppConfig appConfig) throws AppInsertException {
        try {
            ActiveJdbc.operTx(new Operation<Void>() {
                @Override
                public Void operate() {

                    SysAppInfo appInfo = new SysAppInfo();
                    appInfo.set("app_id", appConfig.app.get("id"),
                                "app_name", appConfig.app.get("name"),
                                "app_type", appConfig.app.get("type"),
                                "description", appConfig.app.get("description"),
                                "version", appConfig.app.get("version"),
                                "create_by", uploader,
                                "create_time", new Timestamp(System.currentTimeMillis()));

                    if (appInfo.insert()) {

                        for (String tag : appConfig.tags) {
                            appInfo.add(TagForApp.findById(tag));
                        }

                        for (Map<String, String> function : appConfig.functions) {

                            SysFunc sysFunc = new SysFunc();
                            sysFunc.set("func_id", function.get("id"),
                                        "app_id", appConfig.app.get("id"),
                                        "func_name", function.get("name"),
                                        "hash", "none");

                            if (!sysFunc.insert()) {
                                throw new DBException(function.get("id") + " insert fail!");
                            }
                        }

                    } else {
                        throw new DBException(appConfig.app.get("id") + " insert fail!");
                    }

                    return null;
                }
            });
        } catch (Exception e) {
            log.warn(e.getMessage());
            throw new AppInsertException(e.getMessage());
        }
    }

    private void updateDb(final AppConfig appConfig) throws AppUpdateException {
        try {
            ActiveJdbc.operTx(new Operation<Void>() {
                @Override
                public Void operate() {
                    String appId = (String) appConfig.app.get("id");
                    if (SysAppInfo.exists(appConfig.app.get("id"))) {
                        SysAppInfo appInfo = SysAppInfo.findById(appId);

                        List<String> funcIdListInDb = appInfo.getAll(SysFunc.class).collect("func_id");

                        List<String> newFuncIdList = newFuncIdList(funcIdListInDb, appConfig);
                        for (String newFuncId : newFuncIdList) {
                            SysFunc sysFunc = new SysFunc();
                            sysFunc.set("func_id", newFuncId,
                                        "app_id", appId,
                                        "func_name", appConfig.getFuncNameById(newFuncId),
                                        "hash", "none");
                            if (!sysFunc.insert()) {
                                throw new DBException(newFuncId + " insert fail!");
                            } else {
                                log.info("新增了 " + appId + " - " + newFuncId);
                            }
                        }

                        List<String> dueFuncIdList = dueFuncIdList(funcIdListInDb, appConfig);
                        for (String dueFuncId : dueFuncIdList) {
                            int count = SysFunc.delete("func_id = ? AND app_id = ?", dueFuncId, appId);
                            if (count == 1) {
                                log.info("刪除了 " + appId + " - " + dueFuncId);
                            }
                        }

                    } else {
                        throw new DBException(appId + " not exist!");
                    }

                    return null;
                }
            });

        } catch (Exception e) {
            throw new AppUpdateException(e.getMessage());
        }
    }

    private List<String> newFuncIdList(List<String> funcIdListInDb, AppConfig appConfig) {
        List<String> result = Lists.newArrayList();
        for (Map<String, String> function : appConfig.functions) {
            String funcIdInAppConfig = function.get("id");
            if (!funcIdListInDb.contains(funcIdInAppConfig)) {
                result.add(funcIdInAppConfig);
            }
        }
        return result;
    }

    private List<String> dueFuncIdList(List<String> funcIdListInDb, AppConfig appConfig) {
        List<String> funcIdListInConfig = Lists.transform(appConfig.functions, new Function<Map<String, String>, String>() {
            @Override
            public String apply(Map<String, String> function) {
                return function.get("id");
            }
        });
        List<String> result = Lists.newArrayList();
        for (String funcIdINDb : funcIdListInDb) {
            if (!funcIdListInConfig.contains(funcIdINDb)) {
                result.add(funcIdINDb);
            }
        }
        return result;
    }


    private static class AppConfig {
        Map<String, Object> app;
        List<Map<String, String>> functions;
        List<String> tags;

        public void validation() throws ConfigJsonException {
            if (app == null || functions == null || tags == null) {
                throw new ConfigJsonException("config.json must include app, functions, and tags!");
            }

            Set<String> requiredAppKey = Sets.newHashSet("id", "name", "type", "description", "version");
            for (String key : requiredAppKey) {
                if (!app.containsKey(key)) {
                    throw new ConfigJsonException("config.json must include app." + key + " value");
                }
            }

            Set<String> requiredFunctionKey = Sets.newHashSet("id", "name");

            for (Map<String, String> function : functions) {
                for (String key : requiredFunctionKey) {
                    if (!function.containsKey(key)) {
                        throw new ConfigJsonException("config.json functions array must include id and name value.");
                    }
                }
            }

            ConfigJsonException exception =
                    ActiveJdbc.oper(new Operation<ConfigJsonException>() {
                        @Override
                        public ConfigJsonException operate() {
                            for (String tag : tags) {
                                if (!TagForApp.exists(tag)) {
                                    return new ConfigJsonException("config.json tag " + tag + " not exist in database.");
                                }
                            }
                            return null;
                        }
                    });

            if (exception != null) {
                throw exception;
            }

        }

        public String getFuncNameById(String funcId) {
            for (Map<String, String> function : functions) {
                if (function.get("id").equals(funcId)) {
                    return function.get("name");
                }
            }
            throw new IllegalArgumentException("Not find func_id: " + funcId);
        }
    }

}
