package com.servtech.servcloud.app.controller.ennoconn;

import com.servtech.servcloud.app.controller.storage.util.RuleEnum;
import com.servtech.servcloud.app.model.ennoconn.*;
import com.servtech.servcloud.app.model.ennoconn.view.BillStockInWithStatusView;
import com.servtech.servcloud.app.model.storage.BillStockIn;
import com.servtech.servcloud.app.model.storage.BillStockOutMain;
import com.servtech.servcloud.app.model.storage.MaterialThing;
import com.servtech.servcloud.app.model.storage.Thing;
import com.servtech.servcloud.app.model.strongLED.BillStockOutDetail;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.apache.commons.io.FileUtils;
import org.javalite.activejdbc.Base;
import org.javalite.activejdbc.Model;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.*;
import java.util.Date;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static com.servtech.servcloud.core.util.Util.getTimeLongFormat;

@RestController
@RequestMapping("/ennoconn/filesyn")
public class FileSyncController {
    private static final Logger LOG = LoggerFactory.getLogger(FileSyncController.class);
    private static final String LOCK = new String();
    private static final String VENDOR_PATH = "C:\\Servtech\\Servolution\\Vendor\\";
    private static final RuleEnum RULE = RuleEnum.MATERIALTHING;

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "parse-smt-file", method = RequestMethod.POST)
    public RequestResult<?> parseSMTFile(@RequestParam("file") MultipartFile file) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                Map<String, Object> result = new HashMap<>();
                try {
                    String fileName = file.getOriginalFilename();
                    File tempFile = new File(VENDOR_PATH, fileName);
                    if (tempFile.exists()) {
                        tempFile.delete();
                    }
                    file.transferTo(tempFile);
                    Map<String, Object> fileInfo = parseSMTFileContent(tempFile);
                    result.put("fileInfo", fileInfo);
                } catch (Exception e) {
                    e.printStackTrace();
                    return fail(e.getMessage());
                }
                return success(result);
            });
        }
    }

    @RequestMapping(value = "smt-station", method = RequestMethod.GET)
    public RequestResult<?> SMTStation(@RequestParam("fileName") String fileName) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {

                Object userObj = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "StoreSyncSchedule" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                String userId = userObj.toString();
                Date currentTime = new Date();

                Map<String, Object> successAndFailInfo = new HashMap<>();
                try {
                    insertSMTStationFromFile(userId, currentTime, fileName, successAndFailInfo);
                } catch (Exception e) {
                    e.printStackTrace();
                    return fail(e.getMessage());
                }
                return success(successAndFailInfo);
            });
        }
    }

    private void insertSMTStationFromFile(String userId, Date currentTime, String uploadFileName, Map<String, Object> successAndFailInfo) {
        String file_name_new = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()).substring(2) + ".csv";
        BufferedReader fos = null;
        InputStreamReader isr = null;
        List<Integer> errorRow = new ArrayList<>();
        List<Integer> mainInsertRow = new ArrayList<>();
        List<Integer> mainUpdateRow = new ArrayList<>();
        List<Integer> detailInsertRow = new ArrayList<>();
        List<Integer> detailUpdateRow = new ArrayList<>();
        try {
            int count = 0;
            File uploadFile = new File(VENDOR_PATH, uploadFileName);
            isr = new InputStreamReader(new FileInputStream(uploadFile), getCharset(uploadFile));
            fos = new BufferedReader(isr);
            String line;
            Boolean isHeader = true;

            Boolean anyError = false;
            while ((line = fos.readLine()) != null) {
                line += ' ';
                count++;
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                List<String> list = new ArrayList<>();
                String[] arr1 = line.split("\"");
                if (arr1.length == 1) {
                    arr1 = line.split(",");
                }
                for (int i = 0; i < arr1.length; i++) {
                    String str1 = arr1[i];
                    if (str1.startsWith(",") || str1.endsWith(",")) {
                        String str2 = processString(str1);
                        String[] str3 = str2.split(",");
                        for (int j = 0; j < str3.length; j++) {
                            list.add(str3[j].trim());
                        }
                    } else {
                        list.add(str1.trim());
                    }
                }

                if (list.size() != 14) {
                    LOG.warn("size error..need 14 real " + list.size() + "\nString countent : " + line);
                    anyError = true;
                    errorRow.add(count);
                } else if (list.get(0).equals("") || list.get(1).equals("") || list.get(2).equals("") || list.get(4).equals("")
                        || list.get(5).equals("") || list.get(8).equals("") || list.get(9).equals("") || list.get(11).equals("")) {
                    anyError = true;
                    errorRow.add(count);
                } else {
                    Map smtStationData = SMTStationListToMap(list, userId, currentTime, file_name_new);
                    Object smtStationFlag = smtStationData.get("smtStationFlag");
                    Object smtStationDetailFlag = smtStationData.get("smtStationDetailFlag");
                    SMTStation smtStation = new SMTStation().fromMap(smtStationData);
                    SMTStationDetail smtStationDetail = new SMTStationDetail().fromMap(smtStationData);

                    if (smtStationFlag == null && smtStationDetailFlag == null) {
                        if (!smtStation.insert() || !smtStationDetail.insert()) {
                            errorRow.add(count);
                            anyError = true;
                        } else {
                            mainInsertRow.add(count);
                            detailInsertRow.add(count);
                        }
                    } else if (smtStationFlag != null && smtStationDetailFlag != null) {
                        if (!smtStation.saveIt() || !smtStationDetail.saveIt()) {
                            errorRow.add(count);
                            anyError = true;
                        } else {
                            mainUpdateRow.add(count);
                            detailUpdateRow.add(count);
                        }
                    } else if (smtStationFlag != null) {
                        if (!smtStation.saveIt() || !smtStationDetail.insert()) {
                            errorRow.add(count);
                            anyError = true;
                        } else {
                            mainUpdateRow.add(count);
                            detailInsertRow.add(count);
                        }
                    } else {
                        if (!smtStation.insert() || !smtStationDetail.saveIt()) {
                            errorRow.add(count);
                            anyError = true;
                        } else {
                            mainInsertRow.add(count);
                            detailUpdateRow.add(count);
                        }
                    }
                }
            }
            if (anyError) {
                moveFileToDateFolder(uploadFile, "SMTStationFile\\fail", file_name_new);
            } else {
                moveFileToDateFolder(uploadFile, "SMTStationFile\\success", file_name_new);
            }

            SMTPositionLog smtPositionLog = new SMTPositionLog();
            int totalCount = count - 1;
            int successCount = totalCount - errorRow.size();
            String errorStr = errorRowToStr(errorRow);
            smtPositionLog.set("file_name_new", file_name_new
                    , "sync_end", new Date()
                    , "file_name", uploadFile.getName()
                    , "quantity", totalCount
                    , "qty_success", successCount
                    , "fail", errorStr
                    , "create_by", userId
                    , "create_time", getTimeLongFormat()
                    , "modify_by", userId
                    , "modify_time", getTimeLongFormat());
            smtPositionLog.insert();
            fos.close();
            System.gc();
            System.out.println(uploadFile.getName() + " delete() : " + uploadFile.delete());
            successAndFailInfo.put("mainInsertRow", mainInsertRow);
            successAndFailInfo.put("mainUpdateRow", mainUpdateRow);
            successAndFailInfo.put("detailInsertRow", detailInsertRow);
            successAndFailInfo.put("detailUpdateRow", detailUpdateRow);
            successAndFailInfo.put("successCount", successCount);
            successAndFailInfo.put("errorRow", errorRow);
        } catch (Exception e) {
            try {
                if (fos != null) {
                    fos.close();
                }
                if (isr != null) {
                    isr.close();
                }
            } catch (IOException e1) {
                e1.printStackTrace();
            }
            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
    }

    private Map SMTStationListToMap(List<String> list, String userId, Date currentTime, String file_name_new) {
        Map result = new HashMap();
        String smt_stn_id = list.get(0) + "|" + list.get(1) + "|" + list.get(2);
        System.out.println(smt_stn_id);
        SMTStation smtStation = SMTStation.findByCompositeKeys(list.get(0), list.get(1), list.get(2));
        if (smtStation != null) {
            result.put("smtStationFlag", "update");
        }
        SMTStationDetail smtStationDetail = SMTStationDetail.findByCompositeKeys(smt_stn_id, list.get(4), list.get(5), list.get(8), list.get(9));
        if (smtStationDetail != null) {
            result.put("smtStationDetailFlag", "update");
        }
        result.put("material_pca", list.get(0));
        result.put("line", list.get(1));
        result.put("version", list.get(2));
        result.put("smt_stn_id", smt_stn_id);
        result.put("issue_day", list.get(3).equals("") ? null : list.get(3));
        result.put("material_id", list.get(4));
        result.put("machine", list.get(5));
        result.put("machine_type", list.get(6).equals("") ? null : list.get(6));
        result.put("program", list.get(7).equals("") ? null : list.get(7));
        result.put("track", list.get(8));
        result.put("sub_track", list.get(9));
        result.put("spec", list.get(10).equals("") ? null : list.get(10));
        result.put("feeder_type", list.get(11));
        result.put("location", list.get(12));
        result.put("qty_pcs", list.get(13));
        result.put("create_by", userId);
        result.put("create_time", currentTime);
        result.put("modify_by", userId);
        result.put("modify_time", currentTime);
        return result;
    }

    private Map<String, Object> parseSMTFileContent(File file) {
        BufferedReader fos = null;
        InputStreamReader isr = null;
        Map<String, Object> result = new HashMap<>();
        try {

            List<List<String>> fileContent = new ArrayList<>();
            isr = new InputStreamReader(new FileInputStream(file), getCharset(file));
            fos = new BufferedReader(isr);
            String line;
            Boolean isHeader = true;
            while ((line = fos.readLine()) != null) {

                if (line.startsWith(",") && line.endsWith(",")) {
                    line = ' ' + line + ' ';
                } else if (line.endsWith(",")) {
                    line += ' ';
                } else if (line.startsWith(",")) {
                    line = ' ' + line;
                }

                System.out.println("line : " + line);
                List<String> list = new ArrayList<>();

                if (isHeader) {
                    String[] arr1 = line.split(",");
                    if (arr1[0].contains("主件料號")) {
                        result.put("fileType", "SMTStation");
                    }
                    fileContent.add(Arrays.asList(arr1));
                    isHeader = false;
                    continue;
                }

                String[] arr1 = line.split("\"");
                if (arr1.length == 1) {
                    arr1 = line.split(",");
                }
                for (int i = 0; i < arr1.length; i++) {
                    String str1 = arr1[i];
                    if (str1.startsWith(",") || str1.endsWith(",")) {
                        String str2 = processString(str1);
                        String[] str3 = str2.split(",");
                        for (int j = 0; j < str3.length; j++) {
                            list.add(str3[j].trim());
                        }
                    } else {
                        list.add(str1.trim());
                    }
                }
                if (list.size() != 14) {
                    LOG.warn("size error..need 14 real " + list.size() + "\nString countent : " + line);
                }
                fileContent.add(list);
            }
            result.put("fileContent", fileContent);
            fos.close();
            System.gc();

        } catch (Exception e) {
            try {
                if (fos != null) {
                    fos.close();
                }
                if (isr != null) {
                    isr.close();
                }
            } catch (IOException e1) {
                e1.printStackTrace();
            }
            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
        return result;
    }

    private static String processString(String str1) {
        if (str1.startsWith(",") && str1.endsWith(",")) {
            String str2 = str1.replaceFirst(",", "");
            return str2.substring(0, str2.length() - 1);
        }
        if (str1.startsWith(",")) {
            return str1.replaceFirst(",", "");
        }
        String str2 = str1.substring(0, str1.length() - 1);
        if (str2.startsWith(",") && str2.endsWith(",")) {
            str2 = ' ' + str2 + ' ';
            return str2;
        }
        if (str2.startsWith(",")) {
            str2 = ' ' + str2;
            return str2;
        }
        if (str2.endsWith(",")) {
            str2 += ' ';
            return str2;
        }
        return str2;
    }

    @RequestMapping(value = "parseFile", method = RequestMethod.POST)
    public RequestResult<?> parseFile(@RequestParam("file") MultipartFile file) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                Map<String, Object> result = new HashMap<>();
                try {
                    String fileName = file.getOriginalFilename();
                    File tempFile = new File(VENDOR_PATH, fileName);
                    if (tempFile.exists()) {
                        tempFile.delete();
                    }
                    file.transferTo(tempFile);
                    Map<String, Object> fileInfo = parseFileContent(tempFile);
                    result.put("fileInfo", fileInfo);
                } catch (Exception e) {
                    e.printStackTrace();
                    return fail(e.getMessage());
                }
                return success(result);
            });
        }
    }

    @RequestMapping(value = "billstockin", method = RequestMethod.GET)
    public RequestResult<?> billstockin(@RequestParam("fileName") String fileName) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {

                Object userObj = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "StoreSyncSchedule" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                String userId = userObj.toString();
                long currentTime = getTimeLongFormat();

                Map<String, Object> successAndFailInfo = new HashMap<>();
                try {
                    insertStockInFromFile(userId, currentTime, fileName, successAndFailInfo);
                } catch (Exception e) {
                    e.printStackTrace();
                    return fail(e.getMessage());
                }
                return success(successAndFailInfo);
            });
        }
    }

    @RequestMapping(value = "/billstockout-main", method = RequestMethod.GET)
    public RequestResult<?> billStockOutMain(@RequestParam("fileName") String fileName) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {

                Object userObj = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "StoreSyncSchedule" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                String userId = userObj.toString();
                long currentTime = getTimeLongFormat();

                Map<String, Object> successAndFailInfo = new HashMap<>();
                try {
                    insertStockOutFromFile(userId, currentTime, fileName, successAndFailInfo, "main");
                } catch (Exception e) {
                    e.printStackTrace();
                    return fail(e.getMessage());
                }
                return success(successAndFailInfo);
            });
        }
    }

    @RequestMapping(value = "/billstockout-detail", method = RequestMethod.GET)
    public RequestResult<?> billStockOutDetail(@RequestParam("fileName") String fileName) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {

                Object userObj = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "StoreSyncSchedule" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                String userId = userObj.toString();
                long currentTime = getTimeLongFormat();

                Map<String, Object> successAndFailInfo = new HashMap<>();
                try {
                    insertStockOutFromFile(userId, currentTime, fileName, successAndFailInfo, "detail");
                } catch (Exception e) {
                    e.printStackTrace();
                    return fail(e.getMessage());
                }
                return success(successAndFailInfo);
            });
        }
    }

    private Map<String, Object> parseFileContent(File file) {
        BufferedReader fos = null;
        InputStreamReader isr = null;
        Map<String, Object> result = new HashMap<>();
        try {
            List<List<String>> fileContent = new ArrayList<>();
            isr = new InputStreamReader(new FileInputStream(file), getCharset(file));
            fos = new BufferedReader(isr);
            String line;
            Boolean isHeader = true;
            Boolean isStockIn = false;
            while ((line = fos.readLine()) != null) {

                if (line.startsWith(",") && line.endsWith(",")) {
                    line = ' ' + line + ' ';
                } else if (line.endsWith(",")) {
                    line += ' ';
                } else if (line.startsWith(",")) {
                    line = ' ' + line;
                }

                System.out.println("line : " + line);
                List<String> list = new ArrayList<>();

                if (isHeader) {
                    String[] arr1 = line.split(",");
                    if (arr1[1].contains("品項")) {
                        result.put("fileType", "StockOutDetail");
                    } else if (arr1[2].contains("品項")) {
                        isStockIn = true;
                        result.put("fileType", "StockIn");
                    } else {
                        result.put("fileType", "StockOutMain");
                    }
                    fileContent.add(Arrays.asList(arr1));
                    isHeader = false;
                    continue;
                }

                if (isStockIn) {
                    String[] arr1 = line.split("\"");
                    if (arr1.length == 1) {
                        arr1 = line.split(",");
                        for (String str2 : arr1) {
                            if (str2.split("/").length == 3) { // EX : 2020/04/07
                                String[] arr3 = str2.split("/");
                                list.add(String.format("%s%02d%02d", arr3[0], Integer.valueOf(arr3[1]), Integer.valueOf(arr3[2].trim())));
                                continue;
                            }
                            list.add(str2.trim());
                        }
                    } else {
                        for (int i = 0; i < arr1.length; i++) {
                            String str1 = arr1[i];
                            if (str1.startsWith(",") || str1.endsWith(",")) {
                                String str2 = processString(str1);
                                String[] str3 = str2.split(",");
                                for (int j = 0; j < str3.length; j++) {
                                    list.add(str3[j].trim());
                                }
                            } else {
                                list.add(str1.trim());
                            }
                        }
                    }

                    if (list.size() != 17) {
                        LOG.warn("size error..need 17 real " + list.size() + "\nString countent : " + line);
                    }
                    fileContent.add(list);

                } else {
                    String[] arr1 = line.split(",");
                    for (String str1 : arr1) {
                        if (str1.split("/").length == 3) { // EX : 2020-04-07
                            String[] arr2 = str1.split("/");
                            list.add(String.format("%s%02d%02d", arr2[0], Integer.valueOf(arr2[1]), Integer.valueOf(arr2[2].trim())));
                            continue;
                        }
                        list.add(str1.trim());
                    }

                    if (list.size() != 8) {
                        LOG.warn("size error..need 8 real " + list.size() + "\nString countent : " + line);
                    }
                    fileContent.add(list);

                }

            }
            result.put("fileContent", fileContent);
            fos.close();
            System.gc();
        } catch (Exception e) {
            try {
                if (fos != null) {
                    fos.close();
                }
                if (isr != null) {
                    isr.close();
                }
            } catch (IOException e1) {
                e1.printStackTrace();
            }

            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
        return result;
    }

    private String getCharset(File file) {
        String code = null;
        try {
            BufferedInputStream bis = new BufferedInputStream(new FileInputStream(file));
            int p = (bis.read() << 8) + bis.read();
            switch (p) {
                case 0xefbb:
                    code = "UTF-8";
                    break;
                case 0xfffe:
                    code = "Unicode";
                    break;
                default:
                    code = "BIG5";
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return code;
    }

    private void insertStockOutFromFile(String userId, long currentTime, String uploadFileName, Map<String, Object> successAndFailInfo, String fileType) {
        String file_name_new = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()).substring(2) + ".csv";
        BufferedReader fos = null;
        InputStreamReader isr = null;
        List<Integer> errorRow = new ArrayList<>();
        List<Integer> insertRow = new ArrayList<>();
        List<Integer> updateRow = new ArrayList<>();
        try {
            int count = 0;
            File uploadFile = new File(VENDOR_PATH, uploadFileName);
            isr = new InputStreamReader(new FileInputStream(uploadFile), getCharset(uploadFile));
            fos = new BufferedReader(isr);
            String line;
            Boolean isHeader = true;
            Boolean anyError = false;
            while ((line = fos.readLine()) != null) {

                if (line.startsWith(",") && line.endsWith(",")) {
                    line = ' ' + line + ' ';
                } else if (line.endsWith(",")) {
                    line += ' ';
                } else if (line.startsWith(",")) {
                    line = ' ' + line;
                }

                count++;
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                List<String> list = new ArrayList<>();
                String[] arr1 = line.split(",");
                for (String str1 : arr1) {
                    if (str1.split("/").length == 3) { // EX : 2020-04-07
                        String[] arr2 = str1.split("/");
                        list.add(String.format("%s%02d%02d", arr2[0], Integer.valueOf(arr2[1]), Integer.valueOf(arr2[2].trim())));
                        continue;
                    }
                    list.add(str1.trim());
                }

                if (list.size() != 8) {
                    LOG.warn("size error..need 8 real " + list.size() + "\nString countent : " + line);
                    errorRow.add(count);
                    anyError = true;
                } else {
                    if (fileType.equals("main")) {
//                        if (list.get(0).equals("") || list.get(3).equals("")) {
                        if (list.get(0).equals("") || list.get(1).equals("")) {  //0 跟 3分別是PK，但倉別允許是空字串
                            errorRow.add(count);
                            anyError = true;
                        } else {
                            Map mainData = stockOutMainListToMap(list, userId, currentTime, file_name_new);
                            Object sqlFlag = mainData.get("sqlFlag");
                            BillStockOutMain billStockOutMain = new BillStockOutMain().fromMap(mainData);
                            if (sqlFlag == null) {
                                billStockOutMain.set("create_by", userId);
                                billStockOutMain.set("create_time", currentTime);
                                if (!billStockOutMain.insert()) {
                                    errorRow.add(count);
                                    anyError = true;
                                } else {
                                    insertRow.add(count);
                                }
                            } else {
                                if (sqlFlag.toString().equals("update")) {
                                    if (!billStockOutMain.saveIt()) {
                                        errorRow.add(count);
                                        anyError = true;
                                    } else {
                                        updateRow.add(count);
                                    }
                                }
                                if (sqlFlag.toString().equals("ignore")) {
                                    errorRow.add(count);
                                    anyError = true;
                                }
                            }
                        }

                    } else {
                        if (list.get(0).equals("") || list.get(1).equals("") || list.get(2).equals("") || list.get(7).equals("")) {  //這些是PK，不可空值, 7是數量也不能空
                            errorRow.add(count);
                            anyError = true;
                        } else {
                            Map detailData = stockOutDetailListToMap(list, userId, currentTime, file_name_new);

                            if (detailData == null) {
                                errorRow.add(count);
                                anyError = true;
                            } else if (detailData.get("sqlFlag") == null) {
                                BillStockOutDetail billStockOutDetail = new BillStockOutDetail().fromMap(detailData);
                                billStockOutDetail.set("create_by", userId);
                                billStockOutDetail.set("create_time", currentTime);
                                if (!billStockOutDetail.insert()) {
                                    errorRow.add(count);
                                    anyError = true;
                                } else {
                                    insertRow.add(count);
                                }
                            } else {
                                if (detailData.get("sqlFlag").toString().equals("update")) {
                                    BillStockOutDetail billStockOutDetail = new BillStockOutDetail().fromMap(detailData);
                                    if (!billStockOutDetail.saveIt()) {
                                        errorRow.add(count);
                                        anyError = true;
                                    } else {
                                        updateRow.add(count);
                                    }
                                }
                                if (detailData.get("sqlFlag").toString().equals("ignore")) {
                                    errorRow.add(count);
                                    anyError = true;
                                }
                            }
                        }

                    }
                }
            }
            if (fileType.equals("main")) {
                if (anyError) {
                    moveFileToDateFolder(uploadFile, "StockOutFile\\Main\\fail", file_name_new);
                } else {
                    moveFileToDateFolder(uploadFile, "StockOutFile\\Main\\success", file_name_new);
                }
                BillStockOutLog billStockOutLog = new BillStockOutLog();
                int totalCount = count - 1;
                int successCount = totalCount - errorRow.size();
                String errorStr = errorRowToStr(errorRow);
                billStockOutLog.set("file_name_new", file_name_new
                        , "sync_end", new Date()
                        , "file_name", uploadFile.getName()
                        , "quantity", totalCount
                        , "qty_success", successCount
                        , "fail", errorStr
                        , "create_by", userId
                        , "create_time", currentTime
                        , "modify_by", userId
                        , "modify_time", currentTime);
                billStockOutLog.insert();
            } else {
                if (anyError) {
                    moveFileToDateFolder(uploadFile, "StockOutFile\\Detail\\fail", file_name_new);
                } else {
                    moveFileToDateFolder(uploadFile, "StockOutFile\\Detail\\success", file_name_new);
                }
                BillStockOutDetailLog billStockOutDetailLog = new BillStockOutDetailLog();
                int totalCount = count - 1;
                int successCount = totalCount - errorRow.size();
                String errorStr = errorRowToStr(errorRow);
                billStockOutDetailLog.set("file_name_new", file_name_new
                        , "sync_end", new Date()
                        , "file_name", uploadFile.getName()
                        , "quantity", totalCount
                        , "qty_success", successCount
                        , "fail", errorStr
                        , "create_by", userId
                        , "create_time", currentTime
                        , "modify_by", userId
                        , "modify_time", currentTime);
                billStockOutDetailLog.insert();
            }

            fos.close();
            System.gc();
            System.out.println(uploadFile.getName() + " delete() : " + uploadFile.delete());
            successAndFailInfo.put("successCount", count - errorRow.size() - 1);
            successAndFailInfo.put("errorRow", errorRow);
            successAndFailInfo.put("insertRow", insertRow);
            successAndFailInfo.put("updateRow", updateRow);
        } catch (Exception e) {
            try {
                if (fos != null) {
                    fos.close();
                }
                if (isr != null) {
                    isr.close();
                }
            } catch (IOException e1) {
                e1.printStackTrace();
            }
            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
    }

    private void insertStockInFromFile(String userId, long currentTime, String uploadFileName, Map<String, Object> successAndFailInfo) {
        String file_name_new = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()).substring(2) + ".csv";
        InputStreamReader isr = null;
        BufferedReader fos = null;
        List<Integer> errorRow = new ArrayList<>();
        List<Integer> insertRow = new ArrayList<>();
        List<Integer> updateRow = new ArrayList<>();
        int count = 0;
        Boolean anyError = false;
        try {

            File uploadFile = new File(VENDOR_PATH, uploadFileName);
            isr = new InputStreamReader(new FileInputStream(uploadFile), getCharset(uploadFile));
            fos = new BufferedReader(isr);
            String line;
            Boolean isHeader = true;

            while ((line = fos.readLine()) != null) {

                if (line.startsWith(",") && line.endsWith(",")) {
                    line = ' ' + line + ' ';
                } else if (line.endsWith(",")) {
                    line += ' ';
                } else if (line.startsWith(",")) {
                    line = ' ' + line;
                }

                count++;
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                List<String> list = new ArrayList<>();
                String[] arr1 = line.split("\"");
                if (arr1.length == 1) {
                    arr1 = line.split(",");
                    for (String str2 : arr1) {
                        if (str2.split("/").length == 3) { // EX : 2020/04/07
                            String[] arr3 = str2.split("/");
                            list.add(String.format("%s%02d%02d", arr3[0], Integer.valueOf(arr3[1]), Integer.valueOf(arr3[2].trim())));
                            continue;
                        }
                        list.add(str2.trim());
                    }
                } else {
                    for (int i = 0; i < arr1.length; i++) {
                        String str1 = arr1[i];
                        if (i == 1) {
                            list.add(str1.trim());
                            continue;
                        }
                        if (str1.startsWith(","))
                            str1 = str1.substring(1);
                        String[] arr2 = str1.split(",");
                        for (String str2 : arr2) {
                            if (str2.split("/").length == 3) { // EX : 2020/04/07
                                String[] arr3 = str2.split("/");
                                list.add(String.format("%s%02d%02d", arr3[0], Integer.valueOf(arr3[1]), Integer.valueOf(arr3[2].trim())));
                                continue;
                            }
                            list.add(str2.trim());
                        }
                    }
                }


                if (list.size() != 17) {  //欄位數要一致
                    LOG.warn("size error..need 17 real " + list.size() + "\nString countent : " + line);
                    anyError = true;
                    errorRow.add(count);
                } else if (list.get(0).equals("") || list.get(2).equals("") || list.get(3).equals("") || list.get(6).equals("")) {  //這幾個是PK，不能是空值
                    anyError = true;
                    errorRow.add(count);
                } else {
                    Map stockInData = stockInListToMap(list, userId, currentTime, file_name_new);
                    Object sqlFlag = stockInData.get("sqlFlag");
                    BillStockIn billStockIn = new BillStockIn().fromMap(stockInData);
                    if (sqlFlag == null) {
                        billStockIn.set("create_by", userId);
                        billStockIn.set("create_time", currentTime);
                        if (!billStockIn.insert()) {
                            errorRow.add(count);
                            anyError = true;
                        } else {
                            insertRow.add(count);
                        }
                    } else {
                        if (sqlFlag.toString().equals("update")) {
                            if (!billStockIn.saveIt()) {
                                errorRow.add(count);
                                anyError = true;
                            } else {
                                updateRow.add(count);
                            }
                        }
                        if (sqlFlag.toString().equals("ignore")) {
                            errorRow.add(count);
                            anyError = true;
                        }
                    }
                }
            }
            if (anyError) {
                moveFileToDateFolder(uploadFile, "StockInFile\\fail", file_name_new);
            } else {
                moveFileToDateFolder(uploadFile, "StockInFile\\success", file_name_new);
            }
            BillStockInLog billStockInLog = new BillStockInLog();
            int totalCount = count - 1;
            int successCount = totalCount - errorRow.size();
            String errorStr = errorRowToStr(errorRow);
            billStockInLog.set("file_name_new", file_name_new
                    , "sync_end", new Date()
                    , "file_name", uploadFile.getName()
                    , "quantity", totalCount
                    , "qty_success", successCount
                    , "fail", errorStr
                    , "create_by", userId
                    , "create_time", currentTime
                    , "modify_by", userId
                    , "modify_time", currentTime);
            billStockInLog.insert();
            fos.close();
            System.gc();
            System.out.println(uploadFile.getName() + " delete() : " + uploadFile.delete());
            successAndFailInfo.put("successCount", successCount);
            successAndFailInfo.put("errorRow", errorRow);
            successAndFailInfo.put("insertRow", insertRow);
            successAndFailInfo.put("updateRow", updateRow);
        } catch (Exception e) {
            try {
                if (fos != null) {
                    fos.close();
                }
                if (isr != null) {
                    isr.close();
                }
            } catch (IOException e1) {
                e1.printStackTrace();
            }
//            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
    }

    private String errorRowToStr(List<Integer> errorRow) {
        StringBuffer result = new StringBuffer();
        for (int i = 0; i < errorRow.size(); i++) {
            result.append(errorRow.get(i));
            if (i != errorRow.size() - 1) {
                result.append(",");
            }
        }
        return result.toString();
    }

    private Map stockOutDetailListToMap(List<String> billDetail, String userId, long currentTime, String file_name_new) {
        BillStockOutMain billStockOutMain = BillStockOutMain.findFirst("bill_no = ? order by modify_time desc", billDetail.get(0));
        if (billStockOutMain == null)
            return null;
        Map result = new HashMap();

        String defaultMaterialSub = "0000";

        String defaultStatus = stockOutDetailSetProcess(billDetail, billStockOutMain, result);
        result.put("bill_no", billDetail.get(0));
        result.put("bill_date", billStockOutMain.getString("bill_date"));
        result.put("bill_detail", billDetail.get(1));
        result.put("material_id", billDetail.get(2));
        result.put("material_sub", defaultMaterialSub);
        result.put("ware_id", billStockOutMain.getString("ware_id"));
        result.put("quantity", billDetail.get(7).equals("") ? 0.0 : Double.valueOf(billDetail.get(7)));

        if (!billDetail.get(3).equals(""))
            result.put("column_1", Float.valueOf(billDetail.get(3)));
        if (!billDetail.get(5).equals(""))
            result.put("column_2", Float.valueOf(billDetail.get(5)));
        if (!billDetail.get(6).equals(""))
            result.put("column_3", Float.valueOf(billDetail.get(6)));
        if (!billDetail.get(4).equals(""))
            result.put("column_4", billDetail.get(4));
        result.put("column_5", file_name_new);
        result.put("status", defaultStatus);
        result.put("modify_by", userId);
        result.put("modify_time", currentTime);
        return result;
    }

    private String stockOutDetailSetProcess(List<String> billDetail, BillStockOutMain billStockOutMain, Map result) {
        BillStockOutDetail billStockOutDetail = BillStockOutDetail.findFirst("bill_no = ? and bill_detail = ? and material_id = ?", billDetail.get(0), billDetail.get(1), billDetail.get(2));
        if (billStockOutDetail != null) {

            int status = billStockOutDetail.getInteger("status");

            if (billStockOutMain.getInteger("status") == 2 || billStockOutMain.getInteger("status") == 9) {
                result.put("sqlFlag", "ignore");
                return String.valueOf(status);
            }

            if (status == 1) {
                result.put("sqlFlag", "ignore");
                return String.valueOf(status);
            }

            double new_quantity = billDetail.get(7).equals("") ? 0.0 : Double.valueOf(billDetail.get(7));
            double original_quantity = billStockOutDetail.getDouble("quantity");
            if (new_quantity == original_quantity || new_quantity > original_quantity) {
                result.put("sqlFlag", "update");
                return String.valueOf(status);
            }

            double out_qty = billStockOutDetail.getDouble("out_qty");
            if (out_qty > new_quantity) {
                result.put("sqlFlag", "ignore");
                return String.valueOf(status);
            }
            result.put("sqlFlag", "update");
            return String.valueOf(status);
        }
        return "0";
    }

    private Map stockOutMainListToMap(List<String> billMain, String userId, long currentTime, String file_name_new) {
        Map result = new HashMap();
        BillStockOutMain billStockOutMain = BillStockOutMain.findFirst("bill_no = ? and ware_id = ?", billMain.get(0), billMain.get(3));
        String defaultStatus = stockOutMainSetProcess(billStockOutMain, result);

        result.put("bill_no", billMain.get(0));
        result.put("bill_date", billMain.get(1));
        result.put("stock_out_date", billMain.get(1));
        result.put("ware_id", billMain.get(3));

        if (!billMain.get(2).equals(""))
            result.put("remark", billMain.get(2));
        if (!billMain.get(4).equals(""))
            result.put("column_1", billMain.get(4));
        if (!billMain.get(5).equals(""))
            result.put("column_2", billMain.get(5));
        if (!billMain.get(6).equals(""))
            result.put("column_3", billMain.get(6));
        if (!billMain.get(7).equals(""))
            result.put("column_4", billMain.get(7));

        result.put("column_5", file_name_new);
        result.put("status", defaultStatus);
        result.put("locked_by", userId);
        result.put("modify_by", userId);
        result.put("modify_time", currentTime);
        return result;
    }

    private String stockOutMainSetProcess(BillStockOutMain billStockOutMain, Map result) {
        String defaultStatus = "0";
        if (billStockOutMain != null) {
            int status = billStockOutMain.getInteger("status");
            if (status == 2 || status == 9) {
                result.put("sqlFlag", "ignore");
            } else {
                defaultStatus = String.valueOf(status);
                result.put("sqlFlag", "update");
            }
        }
        return defaultStatus;
    }

    private Map stockInListToMap(List<String> list, String userId, long currentTime, String file_name_new) throws RuntimeException {
        Map result = new HashMap();

        double new_quantity = Double.valueOf(list.get(6));

        BillStockInWithStatusView bsiView = BillStockInWithStatusView.findFirst("bill_no = ? and bill_detail = ? and material_id = ? and material_sub = ?", list.get(0), list.get(2), list.get(3), "0000");
        System.out.println(list.get(0)+"|"+ list.get(2)+"|"+ list.get(3)+"|"+ list.get(14));
        String defaultStatus = stockInSetProcess(list, bsiView, result, new_quantity);
        System.out.println("defaultStatus: " + defaultStatus);
        System.out.println("sqlFlag: " + result.get("sqlFlag"));

        result.put("bill_no", list.get(0));
        result.put("bill_date", list.get(1));
        result.put("bill_detail", list.get(2).equals("") ? 1 : Integer.valueOf(list.get(2)));
        result.put("material_id", list.get(3));
        result.put("material_sub", "0000");
        if (!list.get(4).equals(""))
            result.put("remark", list.get(4));

        result.put("ware_id", list.get(5));
        result.put("quantity", new_quantity);
        if (!list.get(7).equals(""))
            result.put("unit", list.get(7));
        result.put("unit_qty", list.get(8));
        result.put("delivery_date", list.get(9));
        result.put("type", 0);
        result.put("po_id", list.get(10));
        if (!list.get(11).equals(""))
            result.put("po_date", list.get(11));
        if (!list.get(12).equals(""))
            result.put("vender_id", list.get(12));
        if (!list.get(13).equals(""))
            result.put("vender_name", list.get(13));
        if (!list.get(14).equals(""))
            result.put("vender_lot", list.get(14));
        result.put("column_1", file_name_new);
        if (!list.get(15).equals(""))
            result.put("vender_pn", list.get(15));
        if (!list.get(16).equals(""))
            result.put("exp_date", list.get(16));
        result.put("status", defaultStatus);
        result.put("modify_by", userId);
        result.put("modify_time", currentTime);
        return result;
    }

    private String stockInSetProcess(List<String> list, BillStockInWithStatusView bsiView, Map result, double new_quantity) throws RuntimeException {
        String defaultStatus = "0";
        if (bsiView != null) {      //PK重複時
            System.out.println("PK 重複");
            double original_quantity = bsiView.getDouble("quantity");
            if (new_quantity == original_quantity && new_quantity != 0       //新數量=原數量,的處理方式
                    || new_quantity > original_quantity && !bsiView.getBoolean("is_create_pkg_id")     //新數量 > 原數量, 且未生成條碼
                    || new_quantity < original_quantity && !bsiView.getBoolean("is_create_pkg_id") && new_quantity != 0) {     //新數量 < 原數量, 且未生成條碼
                result.put("sqlFlag", "update");
            } else if (bsiView.getBoolean("is_all_stock_in")      //全部已入庫
                    || (new_quantity == 0 && bsiView.getBoolean("is_any_stock_in"))) {      //新數量 = 0, 且任一單件入庫
                result.put("sqlFlag", "ignore");
            } else if (new_quantity == 0 && !bsiView.getBoolean("is_create_pkg_id")) {      //新數量 = 0, 且未生成條碼
                defaultStatus = "99";
                result.put("sqlFlag", "update");
            } else if (new_quantity > original_quantity) {      //新數量 > 原數量, 且未生成條碼未入庫 或 任一單件入庫
                createPKGID(list, new_quantity - original_quantity);
                result.put("sqlFlag", "update");
            } else if (new_quantity < original_quantity && bsiView.getBoolean("is_any_stock_in")) {
                List<Map> map = Base.findAll(String.format("select stock_in_count from a_storage_view_bill_stock_in_with_thing_stock_in_count where " +
                                "bill_from = '%s' and bill_detail = '%s' and material_id = '%s' and material_sub = '%s'"
                        , list.get(0), list.get(2), list.get(3), list.get(14)));

                if (map != null && map.size() != 0) {
                    long stock_in_count = (Long) map.get(0).get("stock_in_count");
                    if (stock_in_count > new_quantity) {
                        result.put("sqlFlag", "ignore");
                    }
                    if (stock_in_count <= new_quantity) {
                        deletePKGID(list, original_quantity - new_quantity);
                        result.put("sqlFlag", "update");
                    }
                }
            } else {
                if (new_quantity < original_quantity && new_quantity != 0) {
                    deletePKGID(list, original_quantity - new_quantity);
                    result.put("sqlFlag", "update");
                } else {
                    deletePKGID(list, original_quantity);
                    defaultStatus = "99";
                    result.put("sqlFlag", "update");
                }
            }
        }
        return defaultStatus;
    }

    private void createPKGID(List<String> list, double addCount) {
        Long currentTime = getTimeLongFormat();
        Object user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        Map materialThingMap = MaterialThing.findFirst("bill_from = ? and bill_detail = ? and material_id = ? and material_sub = ? order by code_no desc", list.get(0), list.get(2), list.get(3), list.get(14)).toMap();
        Map thingMap = Thing.findFirst("thing_id = ?", materialThingMap.get("thing_id").toString()).toMap();

        // 最後一筆流水號 預設為0
        int last = 0;
        //流水號前綴
        String prefix = list.get(3) + new SimpleDateFormat("yyMMdd").format(System.currentTimeMillis());
        System.out.println(prefix + "% , addCount: " + addCount);
        Thing thing = Thing.findFirst("thing_id like ? order by thing_id desc", prefix + "%");
        // 找 Thing 該 Material 的 最後一筆資料的流水號
        if (thing != null) {
            String lastThingId = thing.getString("thing_id");
            int index = lastThingId.indexOf(prefix);
            last = Integer.parseInt(lastThingId.substring(index + prefix.length()));
        }

        long code_no = (long) materialThingMap.get("code_no");

        Base.openTransaction();
        for (int i = 1; i <= addCount; i++) {
            String thingId = String.format(RuleEnum.getSeq(RULE, last), prefix);

            MaterialThing newMaterialThing = new MaterialThing().fromMap(materialThingMap);
            newMaterialThing.set("thing_id", thingId);
            newMaterialThing.set("code_no", code_no + i);
            newMaterialThing.set("in_stock", 0);
            newMaterialThing.set("is_new", 1);
            newMaterialThing.set("status", 0);
            newMaterialThing.set("create_time", currentTime);
            newMaterialThing.set("modify_time", currentTime);
            newMaterialThing.set("create_by", user);
            newMaterialThing.set("modify_by", user);

            Thing newThing = new Thing().fromMap(thingMap);
            newThing.set("thing_id", thingId);
            newThing.set("create_time", currentTime);
            newThing.set("modify_time", currentTime);
            newThing.set("create_by", user);
            newThing.set("modify_by", user);

            last++;
            if (!newThing.insert() || !newMaterialThing.insert()) {
                Base.rollbackTransaction();
                throw new RuntimeException("insert new MaterialThing or Thing fail...");
            }
        }
        Base.commitTransaction();
    }

    //    private void deletePKGID(List<String> list, double deleteCount) {
//        int code_no = MaterialThing.findFirst("bill_from = ? and bill_detail = ? and material_id = ? and material_sub = ? order by code_no desc", list.get(0), list.get(2), list.get(3), list.get(14)).getInteger("code_no");
//        Base.openTransaction();
//        for (int i = 0; i < deleteCount; i++) {
//            String thing_id = MaterialThing.findFirst("bill_from = ? and bill_detail = ? and material_id = ? and material_sub = ? and code_no = ?"
//                    , list.get(0), list.get(2), list.get(3), list.get(14), code_no - i).getString("thing_id");
//            if (MaterialThing.delete("thing_id = ?", thing_id) != 1 || Thing.delete("thing_id = ?", thing_id) != 1) {
//                Base.rollbackTransaction();
//                throw new RuntimeException("刪除MaterialThing 或 Thing 失敗..");
//            }
//        }
//
//        Base.commitTransaction();
//    }
    private void deletePKGID(List<String> list, double deleteCount) {
        List<MaterialThing> materialThingList = MaterialThing.find("bill_from = ? and bill_detail = ? and material_id = ? and material_sub = ? " +
                        "and in_stock = 0 and is_new = 1 and status = 0 order by code_no desc"
                , list.get(0), list.get(2), list.get(3), list.get(14));
        Base.openTransaction();
        int count = 0;
        for (MaterialThing materialThing : materialThingList) {
            count++;
            String thing_id = materialThing.getString("thing_id");
            if (MaterialThing.delete("thing_id = ?", thing_id) != 1 || Thing.delete("thing_id = ?", thing_id) != 1) {
                Base.rollbackTransaction();
                throw new RuntimeException("刪除MaterialThing 或 Thing 失敗..");
            }
            if (count == deleteCount) {
                Base.commitTransaction();
                return;
            }
        }
        Base.rollbackTransaction();
        throw new RuntimeException("MaterialThing 或 Thing 的可刪除數量不夠...");

    }

    private void moveFile(File file, String path) throws IOException {
        String targetPath = file.getParent() + "\\" + path;
        File target = new File(targetPath);
        if (!target.exists()) {
            target.mkdir();
        }
        FileUtils.copyFile(file, new File(targetPath, file.getName()));
    }

    private void moveFileToDateFolder(File file, String path, String fileNameNew) throws IOException {
        LocalDate date = LocalDate.now();
        String YYYY = String.valueOf(date.getYear());
        String MM = String.format("%02d", date.getMonthValue());
        String targetPath = file.getParent() + "\\" + path + "\\" + YYYY + "\\" + MM;
        File target = new File(targetPath);
        if (!target.exists()) {
            target.mkdir();
        }
        FileUtils.copyFile(file, new File(targetPath, fileNameNew));
    }
}
