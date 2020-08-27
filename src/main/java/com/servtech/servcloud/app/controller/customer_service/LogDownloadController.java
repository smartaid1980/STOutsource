package com.servtech.servcloud.app.controller.customer_service;

import com.google.common.io.Files;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import static org.springframework.web.bind.annotation.RequestMethod.POST;
import static org.springframework.web.bind.annotation.RequestMethod.GET;

/**
 * Created by Raynard on 2017/5/22.
 */
@RestController
@RequestMapping("/customerservice/logdownload")
public class LogDownloadController {

    private static final Logger log = LoggerFactory.getLogger(LogDownloadController.class);
    static SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
    static SimpleDateFormat yyyyMMdd = new SimpleDateFormat("yyyyMMdd");


    @RequestMapping(value = "/getplants", method = GET)
    public RequestResult<List<String>> getPlants() {
        List<String> plantList = new ArrayList<String>();

        String filePath = System.getProperty(SysPropKey.DATA_PATH) + "/servcore_maintance_log";
        for (File f : new File(filePath).listFiles()) {
            if (f.isDirectory()) {
                plantList.add(f.getName());
            }
        }
        return RequestResult.success(plantList);
    }



    @RequestMapping(value = "/getlogs", method = POST)
    public RequestResult<List<Log>> getLogs(@RequestBody final Map data) {

        List<Log> logList = new ArrayList<Log>();
        String startDate = data.get("startDate").toString().replace("/","");
        String endDate = data.get("endDate").toString().replace("/", "");
        String platformId = data.get("platformId").toString();


        String filePath = System.getProperty(SysPropKey.DATA_PATH) + "/servcore_maintance_log"
                                                                   + "/" + platformId;
        long range = getDayRange(startDate, endDate);
        appendLog(range,platformId, startDate, filePath, logList);


        return RequestResult.success(logList);

    }
    @RequestMapping(value = "/download", method = GET)
    public void download(@RequestParam("fileName") final String zipPath,
                                  HttpServletResponse response) {
        System.out.println(zipPath);
        String[] arr = zipPath.split("_");
        String platformId = arr[0];
        String fileName = arr[1];
        String filePath = System.getProperty(SysPropKey.DATA_PATH) + "/servcore_maintance_log"
                                                                   + "/" + platformId
                                                                   + "/" + fileName.substring(0, 4)
                                                                   + "/" + fileName.substring(4, 6)
                                                                   + "/" + fileName;


        try {
            String mimeType = "application/zip,application/octect-stream";
            String headerKey = "Content-Disposition";
            String headerValue = "attachment; filename=\" " + fileName + "\"";
            response.setContentType(mimeType);
            response.setHeader(headerKey, headerValue);
            File file = new File(filePath);
            Files.copy(file, response.getOutputStream());

        } catch (FileNotFoundException e){
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }




    long getDayRange(String startDate, String endDate) {

        long range = 0;
        try {
            Date start = yyyyMMdd.parse(startDate);
            Date end = yyyyMMdd.parse(endDate);
            range = (end.getTime() - start.getTime()) / (24*60*60*1000);
        } catch (ParseException e) {
            log.info("Date parse is fail .... plz check input date type ");
        }
        return range;
    }


    void appendLog(long range,String platformId, String startDate, String filePath, List<Log> container) {
        Calendar calendar = initCalendar(startDate, Calendar.getInstance());

        for (long l = 0; l <= range; l++) {
            String date = yyyyMMdd.format(calendar.getTime());
            String path = filePath + "/" + date.substring(0, 4) + "/" + date.substring(4, 6);
            File fileRoot = new File(path);
            try {
                for (File file : fileRoot.listFiles()) {
                    if (fileCheck(date, file)) {
                        container.add(new Log(platformId, file));
                    }
                }
            } catch (NullPointerException e) {
                System.out.println("No data...");
            }
            calendar.add(Calendar.DAY_OF_YEAR, 1);
        }
    }

    boolean fileCheck(String date, File file) {

        if (file.getName().substring(0, 8).equals(date) && file.getName().indexOf(".zip") >0) {
            return  true;
        }else {
            return false;
        }
    }

    Calendar initCalendar(String date, Calendar calendar) {
        int year = Integer.parseInt(date.substring(0, 4));
        int month = Integer.parseInt(date.substring(4, 6)) - 1;
        int day = Integer.parseInt(date.substring(6, 8));
        calendar.set(year, month, day);
        return calendar;
    }
    static class Log {
        String fileName;
        String fileSize;
        String lastModify;
        Log (String platformId, File file) {
            this.fileName = platformId + "_" + file.getName();
            this.fileSize = formetFileSize(file.length());
            this.lastModify = sdf.format(new Date(file.lastModified()));
        }
    }
    static String formetFileSize(long fileS) {//轉換檔案大小
        DecimalFormat df = new DecimalFormat("#.00");
        String fileSizeString = "";
        if (fileS < 1024) {
            fileSizeString = df.format((double) fileS) + " B";
        } else if (fileS < 1048576) {
            fileSizeString = df.format((double) fileS / 1024) + " KB";
        } else if (fileS < 1073741824) {
            fileSizeString = df.format((double) fileS / 1048576) + " MB";
        } else {
            fileSizeString = df.format((double) fileS / 1073741824) + " GB";
        }
        return fileSizeString;
    }


}
