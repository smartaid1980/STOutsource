package com.servtech.servcloud.app.controller.juihua;

import com.google.common.collect.Lists;
import com.google.common.io.CharStreams;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.servtech.common.file.Files;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by Hubert
 * Datetime: 2015/11/26 上午 09:28
 */
@RestController
@RequestMapping("/juihua/config")
public class ConfigController {
    private static final Logger log = LoggerFactory.getLogger(ConfigController.class);
    private static final String TRIP_TIME_HEADER = "供應商編號,交貨趟次";
    private static final String DELIVER_DAY_HEADER = "供應商編號,星期(1~5，可多個),日期(YYYY/MM/DD，可多個)";
    private static final String SUPPLIER_NAME_HEADER = "供應商編號,供應商名稱";

    @RequestMapping(value = "uploadDeliverDay", method = RequestMethod.POST)
    public RequestResult<?> uploadDeleverDay(@RequestParam MultipartFile file) {
        try {
            String fileContent = CharStreams.toString(new InputStreamReader(file.getInputStream(), "MS950"));

            Map<String, DeliverDay> deliverDayMap = DeliverDay.fromCsv(fileContent);
            Type type = new TypeToken<Map<String, DeliverDay>>(){}.getType();
            String resultJson = new GsonBuilder().setPrettyPrinting().create().toJson(deliverDayMap, type);
            Files.writeStringToFile(resultJson, new File(System.getProperty(SysPropKey.ROOT_PATH) + "/app/Juihua/program/deliverDay.json"));

            return RequestResult.success(deliverDayMap);
        } catch (IllegalArgumentException e) {
            log.warn("交貨時間參數檔上傳: " + e.getMessage());
            return RequestResult.fail(e.getMessage());

        } catch (IOException e) {
            log.warn(e.getMessage(), e);
            return RequestResult.fail(e.getMessage());
        }
    }

    @RequestMapping(value = "uploadTripTime", method = RequestMethod.POST)
    public RequestResult<?> uploadTripTime(@RequestParam MultipartFile file) {
        try {
            String fileContent = CharStreams.toString(new InputStreamReader(file.getInputStream(), "MS950"));

            Map<String, TripTime> tripTimeMap = TripTime.fromCsv(fileContent);
            Type type = new TypeToken<Map<String, TripTime>>(){}.getType();
            String resultJson = new GsonBuilder().setPrettyPrinting().create().toJson(tripTimeMap, type);
            Files.writeStringToFile(resultJson, new File(System.getProperty(SysPropKey.ROOT_PATH) + "/app/Juihua/program/tripTime.json"));

            return RequestResult.success(tripTimeMap);
        } catch (IllegalArgumentException e) {
            log.warn("交貨趟次參數檔上傳: " + e.getMessage());
            return RequestResult.fail(e.getMessage());

        } catch (IOException e) {
            log.warn(e.getMessage(), e);
            return RequestResult.fail(e.getMessage());
        }
    }

    @RequestMapping(value = "uploadSupplierName", method = RequestMethod.POST)
    public RequestResult<?> uploadSupplierName(@RequestParam MultipartFile file) {
        try {
            String fileContent = CharStreams.toString(new InputStreamReader(file.getInputStream(), "MS950"));

            Map<String, String> supplierNameMap = SupplierName.fromCsv(fileContent);
            Type type = new TypeToken<Map<String, TripTime>>(){}.getType();
            String resultJson = new GsonBuilder().setPrettyPrinting().create().toJson(supplierNameMap, type);
            Files.writeStringToFile(resultJson, new File(System.getProperty(SysPropKey.ROOT_PATH) + "/app/Juihua/program/supplierName.json"));

            return RequestResult.success(supplierNameMap);
        } catch (IllegalArgumentException e) {
            log.warn("供應商名稱參數檔上傳: " + e.getMessage());
            return RequestResult.fail(e.getMessage());

        } catch (IOException e) {
            log.warn(e.getMessage(), e);
            return RequestResult.fail(e.getMessage());
        }
    }

    @RequestMapping(value = "deliverDayConfig", method = RequestMethod.GET)
    public RequestResult<Map<String, DeliverDay>> deliverDayConfig() throws IOException {
        return RequestResult.success(DeliverDay.fromConfig());
    }

    @RequestMapping(value = "tripTimeConfig", method = RequestMethod.GET)
    public RequestResult<Map<String, TripTime>> tripTimeConfig() throws IOException {
        return RequestResult.success(TripTime.fromConfig());
    }

    @RequestMapping(value = "supplierNameConfig", method = RequestMethod.GET)
    public RequestResult<Map<String, String>> supplierNameConfig() throws IOException {
        return RequestResult.success(SupplierName.fromConfig());
    }

    @RequestMapping(value = "downloadDeliverDayConfig", method = RequestMethod.POST)
    public void downloadDeliverDayConfig(HttpServletResponse response) throws IOException {
        String mimeType = "text/plain";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=\"deliver_day.csv\"";
        response.setContentType(mimeType);
        response.setHeader(headerKey, headerValue);
        response.setCharacterEncoding("MS950");

        response.getWriter().write(DeliverDay.toCsv());
        response.getWriter().close();
    }

    @RequestMapping(value = "downloadTripTimeConfig", method = RequestMethod.POST)
    public void downloadTripTimeConfig(HttpServletResponse response) throws IOException {
        String mimeType = "text/plain";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=\"trip_time.csv\"";
        response.setContentType(mimeType);
        response.setHeader(headerKey, headerValue);
        response.setCharacterEncoding("MS950");

        response.getWriter().write(TripTime.toCsv());
        response.getWriter().close();
    }

    @RequestMapping(value = "downloadSupplierNameConfig", method = RequestMethod.POST)
    public void downloadSupplierNameConfig(HttpServletResponse response) throws IOException {
        String mimeType = "text/plain";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=\"supplier_name.csv\"";
        response.setContentType(mimeType);
        response.setHeader(headerKey, headerValue);
        response.setCharacterEncoding("MS950");

        response.getWriter().write(SupplierName.toCsv());
        response.getWriter().close();
    }

    static class DeliverDay {
        List<Integer> week;
        List<String> date;

        static Map<String, DeliverDay> fromCsv(String csvContent) {
            Pattern weekPattern = Pattern.compile("[12345]");
            Pattern datePattern = Pattern.compile("\\d{4}/\\d{1,2}/\\d{1,2}");
            String[] lines = csvContent.split("\\n|\\r\\n");
            Map<String, DeliverDay> result = new HashMap<String, DeliverDay>();

            int lineNumber = 0;
            for (String line : lines) {
                if (lineNumber++ == 0) {
                    continue;
                }

                String[] datas = line.split(",");
                DeliverDay deliverDay = new DeliverDay();
                deliverDay.week = Lists.newArrayList();
                deliverDay.date = Lists.newArrayList();
                int datasLength = datas.length;
                for (int i = 1; i < datasLength; i++) {
                    if (datas[i].isEmpty()) {
                        continue;
                    }
                    if (weekPattern.matcher(datas[i]).matches()) {
                        deliverDay.week.add(Integer.parseInt(datas[i]));
                        continue;
                    }
                    if (datePattern.matcher(datas[i]).matches()) {
                        deliverDay.date.add(formatDate(datas[i]));
                        continue;
                    }
                    log.warn(line);
                    throw new IllegalArgumentException("格式有問題");
                }
                result.put(datas[0], deliverDay);
            }

            // 造神
            if (!result.containsKey("god")) {
                DeliverDay deliverDay = new DeliverDay();
                deliverDay.week = Lists.newArrayList(1, 3, 5);
                deliverDay.date = Lists.newArrayList();
                result.put("god", deliverDay);
            }

            return result;
        }

        static Map<String, DeliverDay> fromConfig() throws IOException{
            File deliverDayFile = new File(System.getProperty(SysPropKey.ROOT_PATH) + "/app/Juihua/program/deliverDay.json");
            Type type = new TypeToken<Map<String, DeliverDay>>(){}.getType();
            FileReader reader = new FileReader(deliverDayFile);
            Map<String, DeliverDay> deliverDayMap = new Gson().fromJson(reader, type);
            reader.close();
            return deliverDayMap;
        }

        static String toCsv() throws IOException {
            Map<String, DeliverDay> deliverDayMap = fromConfig();
            String lineSep = System.getProperty("line.separator");
            StringBuilder sb = new StringBuilder(DELIVER_DAY_HEADER);
            sb.append(lineSep);
            for (Map.Entry<String, DeliverDay> entry : deliverDayMap.entrySet()) {
                sb.append(entry.getKey());
                DeliverDay deliverDay = entry.getValue();
                for (Integer week : deliverDay.week) {
                    sb.append(",").append(week);
                }
                for (String date : deliverDay.date) {
                    sb.append(",").append(date);
                }
                sb.append(lineSep);
            }
            return new String(sb.toString().getBytes(), "MS950");
        }

        static String formatDate(String dateString) {
            String[] ymd = dateString.split("/");
            return ymd[0] + "/" +
                   (ymd[1].length() == 1 ? "0" + ymd[1] : ymd[1]) + "/" +
                   (ymd[2].length() == 1 ? "0" + ymd[2] : ymd[2]);
        }
    }

    static class TripTime {
//        String name;
        int tripTime;

        public TripTime() {
        }

        public TripTime(/*String name, */int tripTime) {
//            this.name = name;
            this.tripTime = tripTime;
        }

        static Map<String, TripTime> fromCsv(String csvContent) {
            String[] lines = csvContent.split("\\n|\\r\\n");
            Map<String, TripTime> result = new HashMap<String, TripTime>();

            int lineNumber = 0;
            for (String line : lines) {
                if (lineNumber++ == 0) {
                    continue;
                }

                String[] datas = line.split(",");
                if (datas.length == 0) {
                    continue;
                }
                try {
                    result.put(datas[0], new TripTime(/*datas[1], */Integer.parseInt(datas[1])));
                } catch (Exception e) {
                    log.warn(line, e);
                    throw new IllegalArgumentException("格式有問題");
                }
            }

            // 造神
            if (!result.containsKey("god")) {
                result.put("god", new TripTime(/*"god", */1));
            }

            return result;
        }

        static Map<String, TripTime> fromConfig() throws IOException {
            File tripTimeFile = new File(System.getProperty(SysPropKey.ROOT_PATH) + "/app/Juihua/program/tripTime.json");
            Type type = new TypeToken<Map<String, TripTime>>(){}.getType();
            FileReader reader = new FileReader(tripTimeFile);
            Map<String, TripTime> tripTimeMap = new Gson().fromJson(reader, type);
            reader.close();
            return tripTimeMap;
        }

        static String toCsv() throws IOException {
            Map<String, TripTime> tripTimeMap = fromConfig();
            String lineSep = System.getProperty("line.separator");
            StringBuilder sb = new StringBuilder(TRIP_TIME_HEADER);
            sb.append(lineSep);
            for (Map.Entry<String, TripTime> entry : tripTimeMap.entrySet()) {
                TripTime tripTime = entry.getValue();
                sb.append(entry.getKey())
//                  .append(",").append(tripTime.name)
                  .append(",").append(tripTime.tripTime)
                  .append(lineSep);
            }
            return new String(sb.toString().getBytes(), "MS950");
        }
    }

    static class SupplierName {

        static Map<String, String> fromCsv(String csvContent) {
            String[] lines = csvContent.split("\\n|\\r\\n");
            Map<String, String> result = new HashMap<String, String>();

            int lineNumber = 0;
            for (String line : lines) {
                if (lineNumber++ == 0) {
                    continue;
                }

                String[] datas = line.split(",");
                if (datas.length == 0) {
                    continue;
                }
                try {
                    result.put(datas[0], datas[1]);
                } catch (Exception e) {
                    log.warn(line, e);
                    throw new IllegalArgumentException("格式有問題");
                }
            }

            // 造神
            if (!result.containsKey("god")) {
                result.put("god", "未填寫");
            }

            return result;
        }

        static Map<String, String> fromConfig() throws IOException {
            File tripTimeFile = new File(System.getProperty(SysPropKey.ROOT_PATH) + "/app/Juihua/program/supplierName.json");
            Type type = new TypeToken<Map<String, String>>(){}.getType();
            InputStreamReader reader = new InputStreamReader(new FileInputStream(tripTimeFile), "UTF-8");
            Map<String, String> supplierNameMap = new Gson().fromJson(reader, type);
            reader.close();
            return supplierNameMap;
        }

        static String toCsv() throws IOException {
            Map<String, String> tripTimeMap = fromConfig();
            String lineSep = System.getProperty("line.separator");
            StringBuilder sb = new StringBuilder(SUPPLIER_NAME_HEADER);
            sb.append(lineSep);
            for (Map.Entry<String, String> entry : tripTimeMap.entrySet()) {
                sb.append(entry.getKey())
                  .append(",").append(entry.getValue())
                  .append(lineSep);
            }
            return new String(sb.toString().getBytes(), "MS950");
        }
    }

}
