package com.servtech.servcloud.app.controller.ennoconn;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.app.controller.storage.util.QRCodeImpl;
import com.servtech.servcloud.app.controller.storage.util.SQRCode;
import com.servtech.servcloud.app.controller.storage.util.XLQRCode;
import com.servtech.servcloud.app.model.ennoconn.SMTStationDetail;
import com.servtech.servcloud.app.model.storage.BillStockOutMain;
import com.servtech.servcloud.app.model.strongLED.BillStockOutDetail;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.lang.reflect.Type;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

@RestController
@RequestMapping("/ennoconn/qrcode")
public class TSCQRCodeController {
    private static final Logger LOG = LoggerFactory.getLogger(TSCQRCodeController.class);
    private static Gson gson = new Gson();
    private static SimpleDateFormat yyyyMMddHHmmss = new SimpleDateFormat("yyyyMMddHHmmss");

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/printer-status", method = RequestMethod.GET)
    public RequestResult<?> printerStatus() {
        return ActiveJdbc.operTx(() -> {
            return RequestResult.success(checkTSCStatus());
        });

    }

    @RequestMapping(value = "/print-work-status", method = RequestMethod.GET)
    public RequestResult<?> printWorkStatus(@RequestParam("code_name") String code_name) {
        return ActiveJdbc.operTx(() -> {

            String temp_code_file_name = checkTSCStatus();
            if (code_name.equals(temp_code_file_name)) {
                return RequestResult.success("running");
            }

            return RequestResult.success(checkTSCStatusSuccessOrFail(code_name));
        });

    }

    static String checkTSCStatus() {
        String temp_code_file_name = null;
        String TSCPrinterPath = System.getProperty(SysPropKey.ROOT_PATH) + "/program/TSCPrinter/temp_code";
        File temp_code_dir = new File(TSCPrinterPath);
        if (temp_code_dir.isDirectory()) {
            File[] temp_code_file_list = temp_code_dir.listFiles();

            if (temp_code_file_list == null)
                return null;

            if (temp_code_file_list.length == 1) {
                temp_code_file_name = temp_code_file_list[0].getName();
            }
            if (temp_code_file_list.length > 1) {
                System.gc();
                for (File temp_code_file : temp_code_file_list) {
                    temp_code_file.delete();
                }
            }
        }
        return temp_code_file_name;
    }

    static String checkTSCStatusSuccessOrFail(String code_name) {
        String[] code_name_arr = code_name.split("_");
        String dateTime = code_name_arr[code_name_arr.length - 1];
        String yyyy = dateTime.substring(0, 4);
        String MM = dateTime.substring(4, 6);
        String TSCPrinterSuccessPath = System.getProperty(SysPropKey.ROOT_PATH) + "/program/TSCPrinter/print_success" + "/" + yyyy + "/" + MM;
        File print_success_dir = new File(TSCPrinterSuccessPath);
        if (print_success_dir.isDirectory()) {
            File[] print_success_file_list = print_success_dir.listFiles();
            if (print_success_file_list != null) {
                for (File success_file : print_success_file_list) {
                    String success_file_name = success_file.getName();
                    if (success_file_name.equals(code_name))
                        return "success";
                }
            }
        }
        String TSCPrinterFailPath = System.getProperty(SysPropKey.ROOT_PATH) + "/program/TSCPrinter/print_fail" + "/" + yyyy + "/" + MM;
        File print_fail_dir = new File(TSCPrinterFailPath);
        if (print_fail_dir.isDirectory()) {
            File[] print_fail_file_list = print_fail_dir.listFiles();
            if (print_fail_file_list != null) {
                for (File fail_file : print_fail_file_list) {
                    String fail_file_name = fail_file.getName();
                    if (fail_file_name.equals("fail_" + code_name))
                        return "fail";
                }
            }

        }
        return code_name + " not found..";
    }
}
