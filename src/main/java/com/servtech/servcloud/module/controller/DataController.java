package com.servtech.servcloud.module.controller;

import com.google.common.base.Charsets;
import com.google.common.base.Joiner;
import com.google.common.base.Splitter;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.hash.Hashing;
import com.google.common.io.Files;
import com.google.common.io.LineProcessor;
import com.google.gson.Gson;
import com.servtech.common.codec.Key;
import com.servtech.common.codec.RawDataCryptor;
import com.servtech.common.codec.RawDataCryptorFactory;
import com.servtech.common.codec.exception.LicenseMismatchException;
import com.servtech.common.codec.impl.KeyCategory;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.DeviceCncBrand;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.*;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static com.servtech.servcloud.core.util.SysPropKey.CUST_PARAM_PATH;
import static com.servtech.servcloud.core.util.SysPropKey.DATA_PATH;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;


/**
 * Created by Hubert
 * Datetime: 2015/7/13 上午 10:01
 */
@RestController
@RequestMapping("/getdata")
public class DataController {
    private static final String YEAR_PATTERN = "{YYYY}";
    private static final String MONTH_PATTERN = "{MM}";
    private static final String DAY_PATTERN = "{DD}";
    private static final Pattern PATH_PARAM_REGEX = Pattern.compile("\\{(?!YYYY|MM|DD)\\w+\\}");

    private static final String PARAM_ROOT = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/rawdatadl";
    private static final String CUST_PARAM_ROOT = System.getProperty(SysPropKey.CUST_PARAM_PATH);

    private static final Logger log = LoggerFactory.getLogger(DataController.class);

    @RequestMapping(value = "/custParamFile", method = GET)
    public RequestResult<?> custParamFile(@RequestParam(value = "filePath") String filePath) {
        File file = new File(CUST_PARAM_ROOT + "/" + filePath);
        if (!file.exists()) {
            return fail("file not exist: " + file.getAbsolutePath());
        }
        List<String> records = new ArrayList<String>();
        try {
            records = Files.readLines(file, Charsets.UTF_8);
        } catch (Exception e) {
            e.printStackTrace();
            log.warn("{}", e);
        }
        return success(records);
    }

    @RequestMapping(value = "/custParamJsonFile", method = GET)
    public RequestResult<?> custParamJsonFile(@RequestParam(value = "filePath") String filePath) {
        File file = new File(CUST_PARAM_ROOT + "/" + filePath);
        if (!file.exists()) {
            return fail("file not exist: " + file.getAbsolutePath());
        }

        StringBuilder sb = new StringBuilder();
        int fileSize = (int) file.length();
        int buff;
        try {
            FileInputStream fis = new FileInputStream(file);
            byte[] bytes = new byte[fileSize];
            while ((buff = fis.read(bytes, 0, bytes.length)) != -1) {
                sb.append(new String(bytes, 0, buff, "utf-8"));
            }
            fis.close();

        } catch (Exception e) {
            e.printStackTrace();
            log.warn("{}", e);
        }
        return success(sb.toString());
    }

    @RequestMapping(value = "/custParamFileRename", method = GET)
    public RequestResult<?> custParamFileRename(@RequestParam(value = "filePath") String filePath,
                                                @RequestParam(value = "newFilePath") String newFilePath) {
        File file = new File(CUST_PARAM_ROOT + "/" + filePath);
        if (!file.exists()) {
            return fail("file not exist: " + file.getAbsolutePath());
        }
        File newFile = new File(CUST_PARAM_ROOT + "/" + newFilePath);
        if (!newFile.getParentFile().exists()) {
            newFile.getParentFile().mkdirs();
        }
        if (!file.renameTo(newFile)) {
            return fail("file rename fail..., filePath: " + file.getAbsolutePath() + ", newFilePath: " + newFile.getAbsolutePath());
        }
        return success();
    }

    @RequestMapping(value = "/custParamFileSave", method = POST)
    public RequestResult<?> custParamFileSave(@RequestBody Map<String, String> fileData) {
        if (!fileData.containsKey("filePath") || !fileData.containsKey("data")) {
            return fail("not set 'filePath' or 'data' param...");
        }
        String filePath = fileData.get("filePath");
        String data = fileData.get("data");

        File file = new File(CUST_PARAM_ROOT + "/" + filePath);
        try {
            com.servtech.common.file.Files.writeStringToFile(data, file);
        } catch (IOException e) {
            e.printStackTrace();
            return fail("save file fail: " + e.getMessage());
        }
        return success();
    }

    @RequestMapping(value = "/file", method = POST)
    public RequestResult<?> dataFromFile(@RequestBody FileParam fileParam) {
        log.info(fileParam.type + "/" + fileParam.pathPattern);

        try {
            List<String> paths = fileParam.getPaths();
            List<List<String>> result = Lists.newArrayList();
            String dataRootPath = System.getProperty(DATA_PATH);

            for (String path : paths) {
                File file = new File(dataRootPath, path);
                try {
                    List<String> lines = Files.readLines(file, Charsets.UTF_8);
                    Splitter splitter = getSplitter(lines);
                    for (String line : lines) {
                        List<String> cells = Lists.newArrayList();
                        for (String cell : splitter.split(line)) {
                            cells.add(cell);
                        }
                        result.add(cells);
                    }
                } catch (FileNotFoundException e) {
                    log.debug("檔案 " + file.getAbsolutePath() + " 不存在!");
                }
            }
            return success(result);

        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/db", method = POST)
    public RequestResult<?> dataFromDb(@RequestBody final DbParam dbParam) {
        final String sql = dbParam.getSQL();
        log.info(sql);

        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                if (dbParam.whereParams == null) {
                    return success(Base.findAll(sql));
                } else {
                    return success(Base.findAll(sql, dbParam.whereParams));
                }
            }
        });
    }


    private Date getLastDate(StringBuilder msg) {
        String lastDateText = "2018/6/30";
        Date lastDate = null;


        File licenseFile = new File(PARAM_ROOT, "rdbflic"); // for rawdata download date

        // if have license file
        if (licenseFile.exists()) {
            String expiration = ""; // read license file content
            try {
                expiration = com.google.common.io.Files.toString(licenseFile, Charsets.UTF_8);
            } catch (IOException e) {
                log.warn("Rawdata Download license file read fail...", e);
                msg.append("Rawdata Download license file read fail");
                return lastDate;
            }

            // calc md5 key for SERVCLOUD cross servtech
            String cloudId = System.getProperty(SysPropKey.SERVCLOUD_ID);
            String servtech = "servtech";

            int maxLen = Math.max(cloudId.length(), servtech.length());

            StringBuilder keyBuilder = new StringBuilder();
            for (int i = 0; i < maxLen; i++) {
                if (cloudId.length() > i) {
                    keyBuilder.append(cloudId.charAt(i));
                }
                if (servtech.length() > i) {
                    keyBuilder.append(servtech.charAt(i));
                }
            }

            String key = Hashing.md5().hashString(keyBuilder.toString(), Charsets.UTF_8).toString();

            // split license file content to key and date
            StringBuilder datetimeBuilder = new StringBuilder();
            StringBuilder compareBuilder = new StringBuilder();

            int len = expiration.length();
            int klen = 10; // date length

            // expect license will be key & datetime cross
            for (int i = 0; i < len; ++i) {
                // key length not yet arrived
                if (datetimeBuilder.length() < klen) {
                    if ((i % 3 == 2)) {
                        if ((datetimeBuilder.length() == 4) || (datetimeBuilder.length() == 7)) {
                            datetimeBuilder.append("/");
                        }

                        datetimeBuilder.append(expiration.charAt(i));
                    } else {
                        compareBuilder.append(expiration.charAt(i));
                    }
                } else {
                    compareBuilder.append(expiration.charAt(i));
                }

            }

            // license key correct update last date
            if (compareBuilder.toString().equals(key)) {
                //long expireDateTime = Long.parseLong(datetimeBuilder.toString());
                //lastDate = new Date(expireDateTime);
                lastDateText = datetimeBuilder.toString();

            } else {
                msg.append("rawdata download key fail!");
                return lastDate;
            }

        } else {
            log.warn("file not exist !" + licenseFile.getAbsolutePath());
        }

        try {
            // because java's date month from 0~
            // to avoid error use parser for min mistake
            SimpleDateFormat dateformat = new SimpleDateFormat("yyyy/MM/dd");
            //DateFormat df = DateFormat.getDateInstance();
            lastDate = dateformat.parse(lastDateText);
        } catch (ParseException pse) {
            msg.append("last date format fail!! :" + lastDateText);
        }

        return lastDate;

    }


    @RequestMapping(value = "/rawDownloadLastDate", method = GET)
    public RequestResult<String> downloadRawDataBeforeDate(HttpServletResponse response) {

        StringBuilder msg = new StringBuilder();

        Date lastDate = getLastDate(msg);

        if (lastDate == null) {
            return RequestResult.fail(msg.toString());
        } else {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            return RequestResult.success(sdf.format(lastDate));
        }

    }

    private boolean checkLastDate(Date checkdate, StringBuilder msg) {


        Date lastDate = getLastDate(msg);

        if (lastDate == null) return false;

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");


        log.info("last :" + sdf.format(lastDate) + " check :" + sdf.format(checkdate));


        if (checkdate.after(lastDate)) {
            //SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            msg.append("End Date mulst before " + sdf.format(lastDate));
            return false;
        }


        msg.append("succes");
        return true;
    }


    // pass two date for lie use check method
    @RequestMapping(value = "/rawDownloadAllow", method = GET)
    public RequestResult<String> downloadRawDataBeforeDate(@RequestParam(value = "startDate") @DateTimeFormat(pattern = "yyyy/MM/dd") Date startDate,
                                                           @RequestParam(value = "endDate") @DateTimeFormat(pattern = "yyyy/MM/dd") Date endDate,
                                                           HttpServletResponse response) {

        StringBuilder msg = new StringBuilder();

        if (checkLastDate(endDate, msg)) {
            return RequestResult.success();
        } else {
            return RequestResult.fail(msg.toString());
        }

    }


    @RequestMapping(value = "/rawDownloadBeforeDate", method = GET)
    public RequestResult<String> downloadRawDataBeforeDate(@RequestParam(value = "startDate") @DateTimeFormat(pattern="yyyy/MM/dd") Date startDate,
                                                           @RequestParam(value = "endDate") @DateTimeFormat(pattern="yyyy/MM/dd") Date endDate,
                                                           @RequestParam(value = "machines") List<String> machines,
                                                           HttpServletResponse response) {

        // still do check to avoid user modify html code to pass
        StringBuilder msg = new StringBuilder();

        if(!checkLastDate(endDate,msg))
        {
            return RequestResult.fail(msg.toString());
        }



        DateFormat rawdataPathPattern = new SimpleDateFormat("yyyy/MM/yyyyMMdd");
        RawDataCryptor cryptor = RawDataCryptorFactory.getCryptor();
        Key key = KeyCategory.Decode.key;
        String dataPath = System.getProperty(DATA_PATH);

        String mimeType = "application/octect-stream";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=\"rawdata.zip\"";
        response.setContentType(mimeType);
        response.setHeader(headerKey, headerValue);

        ZipOutputStream zos = null;
        try {
            zos = new ZipOutputStream(response.getOutputStream());
            byte[] changeLine = System.getProperty("line.separator").getBytes();

            Calendar currCalendar = Calendar.getInstance();
            for (String machine : machines) {
                currCalendar.setTime(startDate);

                while (currCalendar.getTime().before(endDate) || currCalendar.getTime().equals(endDate)) {
                    String rawdataEntry = "device_raw_data/" + machine + "/" + rawdataPathPattern.format(currCalendar.getTime()) + ".csv";
                    File rawdataFile = new File(dataPath, rawdataEntry);
                    if (rawdataFile.exists()) {
                        List<String> lines = decodeRawdataLines(rawdataFile, cryptor, key);

                        zos.putNextEntry(new ZipEntry(rawdataEntry));
                        for (String line : lines) {
                            zos.write(line.getBytes());
                            zos.write(changeLine);
                        }
                    }

                    currCalendar.add(Calendar.DAY_OF_MONTH, 1);
                }
            }


            return RequestResult.success();

        } catch (IOException e) {
            log.warn(e.getMessage(), e);
            return RequestResult.fail(e.getMessage());
        } catch (LicenseMismatchException e) {
            e.printStackTrace();
            return RequestResult.licenseMismatch("License expired!!");
        } finally {

            if (zos != null) {
                try {
                    zos.closeEntry();
                    zos.close();
                } catch (IOException e) {
                    // ...
                }
            }

        }

    }

    @RequestMapping(value = "/rawDownload", method = GET)
    public RequestResult<?> downloadRawData(@RequestParam(value = "startDate") @DateTimeFormat(pattern = "yyyy/MM/dd") Date startDate,
                                            @RequestParam(value = "endDate") @DateTimeFormat(pattern = "yyyy/MM/dd") Date endDate,
                                            @RequestParam(value = "machines") List<String> machines,
                                            HttpServletResponse response) {
        return ActiveJdbc.operTx(() -> {
            DateFormat rawdataPathPattern = new SimpleDateFormat("yyyy/MM/yyyyMMdd");
            RawDataCryptor cryptor = RawDataCryptorFactory.getCryptor();
            Key key = KeyCategory.Decode.key;
            String dataPath = System.getProperty(DATA_PATH);

            String mimeType = "application/octect-stream";
            String headerKey = "Content-Disposition";
            String headerValue = "attachment; filename=\"rawdata.zip\"";
            response.setContentType(mimeType);
            response.setHeader(headerKey, headerValue);
            ZipOutputStream zos = null;
            try {
                zos = new ZipOutputStream(response.getOutputStream());
                byte[] changeLine = System.getProperty("line.separator").getBytes();

                Calendar currCalendar = Calendar.getInstance();
                for (String machine : machines) {
                    currCalendar.setTime(startDate);

                    while (currCalendar.getTime().before(endDate) || currCalendar.getTime().equals(endDate)) {
                        String rawdataEntry = "device_raw_data/" + machine + "/" + rawdataPathPattern.format(currCalendar.getTime()) + ".csv";
                        File rawdataFile = new File(dataPath, rawdataEntry);

                        if (rawdataFile.exists()) {
                            File brandsCommand = new File(System.getProperty(CUST_PARAM_PATH), "param/rawdataHeader/brands_utilization_command_path.json");
                            Gson gson = new Gson();
                            List<String> lines = null;

                            if (brandsCommand.exists() && getJson2Map(brandsCommand, gson).size() > 0) {
                                Map brandsCommandMap = getJson2Map(brandsCommand, gson);
                                String commandPath = getBrandCommandPath(machine, brandsCommandMap);
                                lines = decodeRawdataLinesWithHeader(rawdataFile, cryptor, key, getHeader(gson, commandPath));
                            } else {
                                lines = decodeRawdataLines(rawdataFile, cryptor, key);
                            }

                            zos.putNextEntry(new ZipEntry(rawdataEntry));
                            for (String line : lines) {
                                zos.write(line.getBytes());
                                zos.write(changeLine);
                            }
                        }
                        currCalendar.add(Calendar.DAY_OF_MONTH, 1);
                    }
                }

                return RequestResult.success();

            } catch (IOException e) {
                log.warn(e.getMessage(), e);
                return RequestResult.fail(e.getMessage());
            } catch (LicenseMismatchException e) {
                e.printStackTrace();
                return RequestResult.licenseMismatch("License expired!!");
            } catch (SAXException e) {
                e.printStackTrace();
            } catch (ParserConfigurationException e) {
                e.printStackTrace();
            } finally {

                if (zos != null) {
                    try {
                        zos.closeEntry();
                        zos.close();
                    } catch (IOException e) {
                        // ...
                    }
                }
            }
            return RequestResult.fail("fail...");
        });
    }

    @RequestMapping(value = "/anyDataDownload", method = GET)
    public RequestResult<String> downloadAnyData(@RequestParam(value = "startDate") @DateTimeFormat(pattern="yyyy/MM/dd") Date startDate,
                                                 @RequestParam(value = "endDate") @DateTimeFormat(pattern="yyyy/MM/dd") Date endDate,
                                                 @RequestParam(value = "machines") List<String> machines,
                                                 @RequestParam(value = "space") String space,
                                                 HttpServletResponse response) {
        DateFormat rawdataPathPattern = new SimpleDateFormat("yyyy/MM/yyyyMMdd");
        RawDataCryptor cryptor = RawDataCryptorFactory.getCryptor();
        Key key = KeyCategory.Decode.key;
        String dataPath = System.getProperty(DATA_PATH);

        String mimeType = "application/octect-stream";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=\"rawdata.zip\"";
        response.setContentType(mimeType);
        response.setHeader(headerKey, headerValue);

        ZipOutputStream zos = null;
        try {
            zos = new ZipOutputStream(response.getOutputStream());
            byte[] changeLine = System.getProperty("line.separator").getBytes();

            Calendar currCalendar = Calendar.getInstance();
            for (String machine : machines) {
                currCalendar.setTime(startDate);

                while (currCalendar.getTime().before(endDate) || currCalendar.getTime().equals(endDate)) {
                    String rawdataEntry = space + "/" + machine + "/" + rawdataPathPattern.format(currCalendar.getTime()) + ".csv";
                    File rawdataFile = new File(dataPath, rawdataEntry);
                    if (rawdataFile.exists()) {
                        List<String> lines = decodeRawdataLines(rawdataFile, cryptor, key);

                        zos.putNextEntry(new ZipEntry(rawdataEntry));
                        for (String line : lines) {
                            zos.write(line.getBytes());
                            zos.write(changeLine);
                        }
                    }

                    currCalendar.add(Calendar.DAY_OF_MONTH, 1);
                }
            }


            return RequestResult.success();

        } catch (IOException e) {
            log.warn(e.getMessage(), e);
            return RequestResult.fail(e.getMessage());
        } catch (LicenseMismatchException e) {
            e.printStackTrace();
            return RequestResult.licenseMismatch("License expired!!");
        } finally {

            if (zos != null) {
                try {
                    zos.closeEntry();
                    zos.close();
                } catch (IOException e) {
                    // ...
                }
            }

        }

    }

    private String getBrandCommandPath(String machine, Map brandsCommandMap) {
        DeviceCncBrand deviceCncBrand = DeviceCncBrand.findFirst("device_id = ?", machine);
        String brand = deviceCncBrand.getString("cnc_id");
        return brandsCommandMap.get(brand).toString();
    }

    private String getHeader(Gson gson, String commandPath) throws ParserConfigurationException, SAXException, IOException {
        Map gcode2TmtcName = getGcode2TmtcName(gson);
        Map<String, Integer> dynamicIdx = new LinkedHashMap();
        int rawdataIndex = 1;

        File commandXml = new File(commandPath);
        DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder = documentBuilderFactory.newDocumentBuilder();

        Document listDoc = dBuilder.parse(commandXml);
        listDoc.getDocumentElement().normalize();
        NodeList nodeList = listDoc.getElementsByTagName("param");

        for (int idx = 0; idx < nodeList.getLength(); idx++) {
            Node brandNode = nodeList.item(idx);
            Element element = (Element) brandNode;
            String gcode = element.getAttribute("name");
            String treatedName = null;

            if (gcode.equals("G_NONG")) {
                String nongCode = element.getElementsByTagName("filter").item(0).getFirstChild().getNodeValue();
                String nongCodeTag = "G_NONG(" + nongCode + ")";
                treatedName = (String) gcode2TmtcName.get(nongCodeTag);
            } else {
                treatedName = (String) gcode2TmtcName.get(gcode);
            }

            System.out.println(rawdataIndex + " " + gcode + " " + treatedName);

            if (dynamicIdx.containsKey(treatedName)) {
                String _key = treatedName + "(2)";
                dynamicIdx.put(_key, rawdataIndex);
            } else {
                dynamicIdx.put(treatedName, rawdataIndex);
            }
            rawdataIndex++;
        }

        StringBuilder header = new StringBuilder();
        header.append("timestamp");

        for (Map.Entry<String, Integer> map : dynamicIdx.entrySet()) {
            header.append("|").append(map.getKey());
        }
        return header.toString();
    }

    private Map getGcode2TmtcName(Gson gson) throws FileNotFoundException {
        File gcode2TmtcNameFile = new File(System.getProperty(CUST_PARAM_PATH), "param/rawdataHeader/gcode_maping_tmtc_name.json");
        return getJson2Map(gcode2TmtcNameFile, gson);
    }

    private HashMap getJson2Map(File jsonFile, Gson gson) throws FileNotFoundException {
        return gson.fromJson(new FileReader(jsonFile), HashMap.class);
    }

    @RequestMapping(value = "/path", method = GET)
    public String path() {
        return System.getProperty(DATA_PATH);
    }

    public class FileParam {
        String type;
        String pathPattern;
        Map<String, List<String>> pathParam;
        String startDate;
        String endDate;

        private Date getStartDate() throws ParseException {
            log.debug("getdata startDate: " + startDate);
            if (startDate == null) return null;
            return new SimpleDateFormat("yyyy/MM/dd").parse(startDate);
        }

        private Date getEndDate() throws ParseException {
            log.debug("getdata endDate: " + endDate);
            if (endDate == null) return null;
            return new SimpleDateFormat("yyyy/MM/dd").parse(endDate);
        }

        public List<String> getPaths() {
            List<String> result = Lists.newArrayList();
            Date startDate;
            Date endDate;
            String pathWithPattern = type + "/" + pathPattern;
            if (pathParam == null) {
                pathParam = Maps.newHashMap();
            }

            List<String> pathParamNames = Lists.newArrayList();
            Matcher matcher = PATH_PARAM_REGEX.matcher(pathPattern);
            while (matcher.find()) {
                String matchedParam = matcher.group();
                String trimHeadTailParam = matchedParam.substring(1, matchedParam.length() - 1);

                // 不存在才要放進去
                if (!pathParamNames.contains(trimHeadTailParam)) {
                    pathParamNames.add(trimHeadTailParam);
                }
            }

            try {
                startDate = getStartDate();
                endDate = getEndDate();
                if (startDate != null) {
                    Calendar endDateCalendar = Calendar.getInstance();
                    if (endDate != null) {
                        endDateCalendar.setTime(endDate);
                    } else {
                        endDateCalendar.setTime(startDate);
                    }
                    endDateCalendar.set(Calendar.HOUR_OF_DAY, 23);
                    endDateCalendar.set(Calendar.MINUTE, 59);
                    endDateCalendar.set(Calendar.SECOND, 59);
                    endDateCalendar.set(Calendar.MILLISECOND, 999);
                    endDate = endDateCalendar.getTime();
                    if (endDate.before(startDate)) {
                        throw new IllegalArgumentException("startDate 不得大於 endDate!!");
                    }
                }
            } catch (ParseException e) {
                throw new IllegalArgumentException("startDate 與 endDate 格式需為 yyyy/MM/dd");
            }

            if (startDate != null) {
                Calendar startDateCalendar = Calendar.getInstance();
                startDateCalendar.setTime(startDate);

                String replaced = pathWithPattern.replace(YEAR_PATTERN, String.format("%04d", startDateCalendar.get(Calendar.YEAR)));
                replaced = replaced.replace(MONTH_PATTERN, String.format("%02d", startDateCalendar.get(Calendar.MONTH) + 1));
                replaced = replaced.replace(DAY_PATTERN, String.format("%02d", startDateCalendar.get(Calendar.DAY_OF_MONTH)));
                result.add(replaced);
                startDateCalendar.add(Calendar.DAY_OF_MONTH, 1);

                if (endDate != null) {
                    Calendar endDateCalendar = Calendar.getInstance();
                    endDateCalendar.setTime(endDate);
                    while (startDateCalendar.before(endDateCalendar)) {
                        replaced = pathWithPattern.replace(YEAR_PATTERN, String.format("%04d", startDateCalendar.get(Calendar.YEAR)));
                        replaced = replaced.replace(MONTH_PATTERN, String.format("%02d", startDateCalendar.get(Calendar.MONTH) + 1));
                        replaced = replaced.replace(DAY_PATTERN, String.format("%02d", startDateCalendar.get(Calendar.DAY_OF_MONTH)));
                        result.add(replaced);
                        startDateCalendar.add(Calendar.DAY_OF_MONTH, 1);
                    }
                }
            } else {
                result.add(pathWithPattern);
            }

            for (String pathParamName : pathParamNames) {
                if (pathParam.containsKey(pathParamName)) {
                    List<String> paramValues = pathParam.get(pathParamName);
                    log.debug("getdata pathParam: " + pathParamName + " - " + paramValues.size() + "筆");

                    List<String> tempResult = result;
                    result = Lists.newArrayList();
                    for (String paramValue : paramValues) {
                        for (String tempPattern : tempResult) {
                            result.add(tempPattern.replace("{" + pathParamName + "}", paramValue));
                        }
                    }
                } else {
                    throw new IllegalArgumentException("請確定 " + pathParamName + " 存在於 pathPattern 與 pathParam 當中...");
                }
            }

            return result;
        }
    }

    private Splitter getSplitter(List<String> csvLines) {
        if (csvLines.size() > 0)
            return csvLines.get(0).contains("|") ? Splitter.on("|") : Splitter.on(",");
        return Splitter.on(",");
    }

    public static class DbParam {
        public DbParam() {

        }
        String table;
        List<String> columns;
        String whereClause;
        Object[] whereParams;

        private String getSQL() {
            StringBuilder sb = new StringBuilder("SELECT ");
            if (columns == null) {
                sb.append("* FROM ");
            } else {
                sb.append(Joiner.on(", ").join(columns)).append(" FROM ");
            }
            sb.append(table);
            if (whereClause != null) {
                sb.append(" WHERE ").append(whereClause);
            }
            return sb.toString();
        }
    }

    private List<String> decodeRawdataLinesWithHeader(File rawdataFile, final RawDataCryptor cryptor, final Key key, String header) throws IOException {
        return Files.readLines(rawdataFile, Charsets.UTF_8, new LineProcessor<List<String>>() {
            List<String> afterProcessesLines = Lists.newArrayList(header);

            @Override
            public boolean processLine(String line) throws IOException {
                try {
                    String decodeLine = cryptor.decode(key, line);
                    afterProcessesLines.add(decodeLine);
                } catch (Exception e) {
//                    e.printStackTrace();
                }
                return true;
            }

            @Override
            public List<String> getResult() {
                return afterProcessesLines;
            }
        });
    }

    private List<String> decodeRawdataLines(File rawdataFile, final RawDataCryptor cryptor, final Key key) throws IOException {
        return Files.readLines(rawdataFile, Charsets.UTF_8, new LineProcessor<List<String>>() {
            List<String> afterProcessesLines = Lists.newArrayList();

            @Override
            public boolean processLine(String line) throws IOException {
                try {
                    String decodeLine = cryptor.decode(key, line);
                    afterProcessesLines.add(decodeLine);
                } catch (Exception e) {
//                    e.printStackTrace();
                }
                return true;
            }

            @Override
            public List<String> getResult() {
                return afterProcessesLines;
            }
        });
    }

    private String getRawdataHeader(String brand) {
        Gson gson = new Gson();
        StringBuilder sbHeader = new StringBuilder();
        try {
            File file = new File(System.getProperty(CUST_PARAM_PATH), "param/brands/" + brand + "/rawdata_index.json");

            Map<String, Integer> DYNAMIC_INDEX = gson.fromJson(new FileReader(file), LinkedHashMap.class);

            sbHeader.append("timestamp");

            for (Map.Entry<String, Integer> map : DYNAMIC_INDEX.entrySet()) {
                sbHeader.append("|").append(map.getKey());
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        return sbHeader.toString();
    }
}
