package com.servtech.servcloud.core.initializer;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.google.gson.Gson;
import com.servtech.common.codec.RawDataCryptor;
import com.servtech.common.codec.RawDataCryptorFactory;
import com.servtech.servcloud.core.util.JsonParams;
import com.servtech.servcloud.core.util.LeanConfigParam;
import com.servtech.servcloud.core.util.RawDataIndices;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import java.io.File;
import java.io.IOException;

import static com.servtech.servcloud.core.util.SysPropKey.*;

/**
 * Created by Hubert
 * Datetime: 2015/7/10 下午 02:34
 */
public class SysPropInitializer implements ServletContextListener {

    private static final Logger log = LoggerFactory.getLogger(SysPropInitializer.class);

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        String appRootPath = sce.getServletContext().getRealPath("/");
        File webRootPath = new File(appRootPath);

        System.setProperty(ROOT_PATH, appRootPath);
        System.setProperty(WEB_ROOT_PATH, webRootPath.getParentFile().getPath());//取專案根目錄上一層，到webapps
        System.setProperty(LANG_PATH, sce.getServletContext().getRealPath("/WEB-INF/lang"));

        try {
            System.setProperty(VERSION, Files.readFirstLine(new File(appRootPath, "version"), Charsets.UTF_8));
            log.info("版本號: " + System.getProperty(VERSION));
        } catch (Exception e) {
            log.warn("版本號讀取有問題，請確認...");
            throw new RuntimeException("齁係啦");
        }

        RawDataCryptor cryptor = RawDataCryptorFactory.getCryptor();
        log.info("STDec 版本: " + cryptor.version());

        try {
            String licenseDate = cryptor.expiration();
            log.info("合約到期日: " + licenseDate);

            Files.write(licenseDate, new File(System.getProperty(ROOT_PATH), "license"), Charsets.UTF_8);
            System.setProperty(LICENSE_DATE, licenseDate);

            log.info("合約同步方式: " + sce.getServletContext().getInitParameter("license"));
        } catch (IOException e) {
            log.warn("合約讀取有問題，請確認...");
            System.setProperty(LICENSE_DATE, "");
            throw new RuntimeException("齁係啦");
        } catch (RuntimeException e) {
            log.warn("合約尚未開通...");
            System.setProperty(LICENSE_DATE, "");
            throw new RuntimeException("齁係啦");
        } catch (Exception e) {
            log.warn("合約未預期錯誤...", e);
            System.setProperty(LICENSE_DATE, "");
            throw new RuntimeException("齁係啦");
        }

        try {
            LeanConfigParam.LeanConfig  leanConfig = LeanConfigParam.getLeanConfig();
            System.setProperty(SERVCLOUD_ID, leanConfig.id);
            System.setProperty(MQTT_IP, leanConfig.ip);
            System.setProperty(MQTT_PORT, leanConfig.port);
            log.info("平台 ID: " + System.getProperty(SERVCLOUD_ID));
            log.info("MQTT ip: " + System.getProperty(MQTT_IP));
            log.info("MQTT port: " + System.getProperty(MQTT_PORT));
        } catch (Exception e) {
            log.warn("leanConfig.xml 讀取有問題，請確認...", e);
            throw new RuntimeException("齁係啦");
        }

        try {
            JsonParams jsonParams = new JsonParams("system_param.json");
            System.setProperty(DB_JNDI_NAME, jsonParams.getAsString("DB_JNDI_NAME"));
            System.setProperty(DATA_PATH, jsonParams.getAsString("DATA_PATH"));
            System.setProperty(CUST_PARAM_PATH, jsonParams.getAsString("CUST_PARAM_PATH"));

            log.info("資料路徑: " + System.getProperty(DATA_PATH));
            log.info("客製參數路徑: " + System.getProperty(CUST_PARAM_PATH));
        } catch (Exception e) {
            log.warn("/WEB-INF/classes/system_param.json 參數擋有問題，請確認...", e);
            throw new RuntimeException("齁係啦");
        }

        try {
            JsonParams jsonParams = new JsonParams(System.getProperty(CUST_PARAM_PATH), "param/system_param.json");

            System.setProperty(SERV_CUSTOMER_HOST, jsonParams.getAsString("SERV_CUSTOMER_HOST"));
            System.setProperty(SERV_BOX_PATH, jsonParams.getAsString("SERV_BOX_PATH"));
            System.setProperty(SERV_BOX_RESTART_TOOL_EXE, jsonParams.getAsString("SERV_BOX_RESTART_TOOL_EXE"));

            log.info("ServCustomer URL: " + System.getProperty(SERV_CUSTOMER_HOST));
            log.info("ServBox 路徑: " + System.getProperty(SERV_BOX_PATH));
            log.info("ServBox 重啟路徑: " + System.getProperty(SERV_BOX_RESTART_TOOL_EXE));
        } catch (Exception e) {
            log.warn("cust_param/param/system_param.json 參數擋有問題，請確認...", e);
            throw new RuntimeException("齁係啦");
        }

        System.setProperty(RAW_DATA_INDICES, new Gson().toJson(RawDataIndices.read()));

        try {
            JsonParams jsonParams = new JsonParams(System.getProperty(CUST_PARAM_PATH), "param/rawdata_param.json");
            System.setProperty(RAW_DATA_PARTCOUNT_WHICH_INDEX, jsonParams.getAsString("partcountWhichColumn"));
        } catch (Exception e) {
            log.warn("cust_param/param/rawdata_param.json 參數擋有問題，請確認...", e);
            throw new RuntimeException("齁係啦");
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.clearProperty(ROOT_PATH);
        System.clearProperty(WEB_ROOT_PATH);
        System.clearProperty(LANG_PATH);
        System.clearProperty(VERSION);
        System.clearProperty(LICENSE_DATE);
        System.clearProperty(SERVCLOUD_ID);
        System.clearProperty(MQTT_IP);
        System.clearProperty(MQTT_PORT);
        System.clearProperty(DB_JNDI_NAME);
        System.clearProperty(DATA_PATH);
        System.clearProperty(CUST_PARAM_PATH);
        System.clearProperty(SERV_CUSTOMER_HOST);
        System.clearProperty(SERV_BOX_PATH);
        System.clearProperty(SERV_BOX_RESTART_TOOL_EXE);
        System.clearProperty(RAW_DATA_INDICES);
        System.clearProperty(RAW_DATA_PARTCOUNT_WHICH_INDEX);
    }

}
