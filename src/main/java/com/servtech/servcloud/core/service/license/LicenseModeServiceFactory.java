package com.servtech.servcloud.core.service.license;

import com.servtech.servcloud.core.service.license.impl.LicenseModeNotAll;
import com.servtech.servcloud.core.service.license.impl.LicenseModeNotMonitorAndNewReport;
import com.servtech.servcloud.core.service.license.impl.LicenseModeNotNewReport;
import com.servtech.servcloud.core.util.SysPropKey;

import java.io.*;

/**
 * Created by Raynard on 2018/1/8.
 */
public class LicenseModeServiceFactory {
//    目前模式有三種
//    value = 1 的話就是 全部頁面都導入 License 過期的頁面, 而且都不能算
//    value = 2 的話就是 可查舊報表, 可以看監控
//    value = 3 的話就是 可查舊報表, 不能看監控

    static final String NOT_ALL = "c4ca4238a0b923820dcc509a6f75849b";
    static final String NOT_NEW_REPORT = "c81e728d9d4c2f636f067f89cc14862c";
    static final String NOT_MOBITOR_AND_NEW_REPORT = "eccbc87e4b5ce2fe28308fd9f2a7baf3";


    public static LicenseModeService create() {
        try {
            int mode = 1;
            File licenseFile = new File(System.getProperty(SysPropKey.CUST_PARAM_PATH), "licenseMode");
            if (licenseFile.exists()) {
                StringBuilder sb = new StringBuilder();
                String line = null;
                BufferedReader br = new BufferedReader(new FileReader(licenseFile));
                while((line = br.readLine()) != null) {
                    sb.append(line);
                }
                //啥麼都不能看
                if (sb.toString().equals(NOT_ALL)) {
                    mode = 1;
                    //可看監控，4/30到期不能查5/1號報表
                } else if (sb.toString().equals(NOT_NEW_REPORT)) {
                    mode = 2;
                    //不能看監控，4/30到期不能查5/1號報表
                } else if (sb.toString().equals(NOT_MOBITOR_AND_NEW_REPORT)) {
                    mode = 3;
                }
            }
            //未來有需要再加
            switch (mode) {
                case 1:
                    return new LicenseModeNotAll();
                case 2:
                    return new LicenseModeNotNewReport();
                case 3:
                    return new LicenseModeNotMonitorAndNewReport();
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return new LicenseModeNotAll();
    }
}
