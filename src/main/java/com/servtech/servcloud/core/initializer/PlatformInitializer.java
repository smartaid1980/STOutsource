package com.servtech.servcloud.core.initializer;

import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import com.google.gson.Gson;
import com.servtech.common.cpu.STPCInfo;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.swing.*;

import java.io.*;
import java.util.HashMap;
import java.util.Map;

import static com.servtech.servcloud.core.util.SysPropKey.SERVCLOUD_ID;

/**
 * Created by Raynard on 2017/9/25.
 *
 * 主要是用來 驗證 CPU 與 平台 ID 是否一致， 如果不一致 就是不合法的裝置
 * 此功能有向下相容， 所以不會影響到舊版
 */
public class PlatformInitializer implements ServletContextListener {

    private static final Logger log = LoggerFactory.getLogger(PlatformInitializer.class);
    public static boolean isValid = true;
    public static Integer type = 0;
    public static Map<String, String> FUNC_VERSION_MAP = new HashMap<String, String>();
    public static final Map<String, String> CODE_VERSION_MAP = new HashMap<String, String>();
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        String check = sce.getServletContext().getInitParameter("validate");
        String cpuId = "";

        if (check!= null) {
            boolean valid = Boolean.parseBoolean(check);
            if (valid) {
                String platformId = System.getProperty(SERVCLOUD_ID);
                StringBuilder registeredCode = new StringBuilder();

                try {
                    STPCInfo info = new STPCInfo();
                    byte[] code = new byte[100];
                    int ret = info.GetCpuId(code, 100);
                    cpuId = new String(code, 0, ret);

                    BufferedReader br = new BufferedReader(new FileReader(System.getProperty(SysPropKey.CUST_PARAM_PATH)
                            + "/param/registered"));
                    String line = "";
                    while((line = br.readLine())!=null) {
                        registeredCode.append(line);
                    }
                    br.close();

                    log.info("STPCInfo 版本: " + info.STPCInfoVersion());
                    log.info("CPU ID: " + cpuId);
                    String regStr = Hashing.md5().hashString(platformId + "_" + cpuId.trim(), Charsets.UTF_8).toString();
                    if (!regStr.equals(registeredCode.toString())) {
                        log.warn("裝置不合法");
                        writeCPUFile(cpuId.trim());
                        isValid = false;
                        type = 20;
                    } else {
                        log.info("裝置驗證成功!");
                    }
                } catch (FileNotFoundException e) {
                    log.warn("找不到機台授權文件，請確認");
                    writeCPUFile(cpuId.trim());
                    isValid = false;
                    type = 10;
                } catch (IOException e) {
                    log.warn("讀取授權文件有問題，請確認");
                    writeCPUFile(cpuId);
                    type = 999;
                    isValid = false;
                }
            }
        }
        File funcFile = new File(System.getProperty(SysPropKey.ROOT_PATH), "funcVersion");
        if (funcFile.exists()) {
            try {
                FUNC_VERSION_MAP = new Gson().fromJson(new FileReader(funcFile), Map.class);
            } catch (FileNotFoundException e) {
                //不可能會發生
                //e.printStackTrace();
            }
        } else {
            log.warn("funcVersion 不存在");
        }

    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
    }

    private void writeCPUFile(String cpuId) {
        try {
            FileWriter writer = new FileWriter(new File(System.getProperty(SysPropKey.ROOT_PATH)
                    + "/cpuId.txt"));
            writer.write(cpuId);
            writer.flush();
            writer.close();
        } catch (IOException e) {
            log.warn("寫入CPU有問題，請確認");
            e.printStackTrace();
        }

    }
}
