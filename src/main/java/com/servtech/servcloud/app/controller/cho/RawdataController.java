package com.servtech.servcloud.app.controller.cho;

import com.google.gson.Gson;
import com.servtech.hippopotamus.Atom;
import com.servtech.hippopotamus.SimpleExhalable;
import com.servtech.hippopotamus.SimpleExhaler;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.springframework.web.bind.annotation.RequestMethod.GET;

/**
 * Created by Kevin Big Big on 2016/11/25.
 */

@RestController
@RequestMapping("/cho/rawdata")
public class RawdataController {
    private static final Logger log = LoggerFactory.getLogger(RawdataController.class);
    private static final String NEW_LINE = "\r\n";
    private static final String CSV_SPLIT = "|";

    private static final String RAW_DATA_SPACE_NAME = "rawdata_download_cho";
    private static final String HIPPO_MACHINE_ID_INDEX = "machine_id";
    private static final String HIPPO_DATE_INDEX = "date";

    private static final String DOWNLOAD_TYPE_MACHINE_YIELD = "MACHINE_YIELD";

    private static final String HIPPO_TIMESTAMP_COL = "timestamp";
    private static final String HIPPO_DATE_COL = "date";
    //private static final String HIPPO_G_CONS_COL = "G_CONS";
    //private static final String HIPPO_G_ALAM_COL = "G_ALAM";
    private static final String HIPPO_G_PSCP_COL = "G_PSCP";//當日產量
    private static final String HIPPO_G_UPAT_COL = "G_UPAT";//上熱盤實際溫度
    private static final String HIPPO_G_UPST_COL = "G_UPST";//上熱盤設定溫度
    private static final String HIPPO_G_LPAT_COL = "G_LPAT";//下熱盤實際溫度
    private static final String HIPPO_G_LPST_COL = "G_LPST";//下熱盤設定溫度
    private static final String HIPPO_G_ACTP_COL = "G_ACTP";//主機壓力(實際)
    private static final String HIPPO_G_FEXP_COL = "G_FEXP";//一次排氣壓力
    private static final String HIPPO_G_FASP_COL = "G_FASP";//一次加硫壓力
    private static final String HIPPO_G_FSAT_COL = "G_FSAT";//一次加硫實際時間
    private static final String HIPPO_G_FSST_COL = "G_FSST";//一次加硫設定時間

    private static final String ZERO_HH_MM_SS = "000000";

    @RequestMapping(value = "/download", method = GET)
     public RequestResult<String> downloadRawData(@RequestParam(value = "startTime") @DateTimeFormat(pattern="yyyy/MM/dd HH") Date startTime,
                                                  @RequestParam(value = "endTime") @DateTimeFormat(pattern="yyyy/MM/dd HH") Date endTime,
                                                  @RequestParam(value = "downloadType") String downloadType,
                                                  @RequestParam(value = "machines") List<String> machines,
                                                  HttpServletResponse response) {
        DateFormat datePattern = new SimpleDateFormat("yyyyMMdd");
        DateFormat dateHourPattern = new SimpleDateFormat("yyyy-MM-dd HH");
        DateFormat limitPattern = new SimpleDateFormat("yyyyMMddHHmmss");

        //String downloadType = "MACHINE_YIELD";
        //機台產量下載
        if(downloadType.equals(DOWNLOAD_TYPE_MACHINE_YIELD)){
            log.info("download machine yield range: {} ~ {}", dateHourPattern.format(startTime), dateHourPattern.format(endTime));
        }else{//否則就是原始資料下載
            log.info("download range: {} ~ {}", dateHourPattern.format(startTime), dateHourPattern.format(endTime));
        }

        String startTimeLimit = limitPattern.format(startTime);
        String endTimeLimit = limitPattern.format(endTime);

        String mimeType = "application/octect-stream";
        String headerKey = "Content-Disposition";
        String headerValue;
        if(downloadType.equals(DOWNLOAD_TYPE_MACHINE_YIELD)){
            headerValue = "attachment; filename=\"machine_yield.xlsx\"";
        }else{
            headerValue = "attachment; filename=\"rawdata.xlsx\"";
        }
        response.setContentType(mimeType);
        response.setHeader(headerKey, headerValue);

        Map<String, String> machineMap = buildMachineMap(machines);

        TreeMap<String, List<RawdataFile>> machineDataMap = new TreeMap<String, List<RawdataFile>>();
        TreeMap<String, List<RawdataFile>> dateDataMap = new TreeMap<String, List<RawdataFile>>();

        //query hippo時，開始時間要多撈前一天，結束時間要多撈後一天，因為是班次天，會有跨天的問題，但是前端使用的搜尋是自然天...
        String queryStartTime = datePattern.format(addDay(startTime, -1));
        String queryEndTime = datePattern.format(addDay(endTime, 1));
        for (String machine : machines) {
            SimpleExhaler exhaler = HippoService.getInstance()
                    .newSimpleExhaler()
                    .space(RAW_DATA_SPACE_NAME);
            exhaler.index(HIPPO_MACHINE_ID_INDEX, new String[]{machine});
            exhaler.indexRange(HIPPO_DATE_INDEX, queryStartTime, queryEndTime);
            exhaler.columns(HIPPO_TIMESTAMP_COL,
                    HIPPO_DATE_COL,
                    //HIPPO_G_CONS_COL,
                    //HIPPO_G_ALAM_COL,
                    HIPPO_G_PSCP_COL,
                    HIPPO_G_UPAT_COL,
                    HIPPO_G_UPST_COL,
                    HIPPO_G_LPAT_COL,
                    HIPPO_G_LPST_COL,
                    HIPPO_G_ACTP_COL,
                    HIPPO_G_FEXP_COL,
                    HIPPO_G_FASP_COL,
                    HIPPO_G_FSAT_COL,
                    HIPPO_G_FSST_COL
            );
            try {
                Future<SimpleExhalable> future = exhaler.exhale();
                String machineName;
                if(machineMap.containsKey(machine)){
                    machineName = machineMap.get(machine);
                }else{
                    machineName = machine;
                }
                //log.info("***** machineName: {}", machineName);

                if(downloadType.equals(DOWNLOAD_TYPE_MACHINE_YIELD)){
                    buildDateDataMapByMachineYield(dateDataMap, machine, machineName, future, startTimeLimit, endTimeLimit);
                }else{
                    buildMachineDataMapByRawDataDownload(machineDataMap, machine, machineName, future, startTimeLimit, endTimeLimit);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            } catch (ExecutionException e) {
                e.printStackTrace();
            }
        }
        try {
            if(downloadType.equals(DOWNLOAD_TYPE_MACHINE_YIELD)){
                new ExcelFileByMachineYield(dateDataMap).getWorkbook().write(response.getOutputStream());
            }else{
                new ExcelFile(machineDataMap).getWorkbook().write(response.getOutputStream());
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return RequestResult.success();
    }

    private void buildMachineDataMapByRawDataDownload(TreeMap<String, List<RawdataFile>> machineDataMap, String machine, String machineName,
                                     Future<SimpleExhalable> future, String startTimeLimit, String endTimeLimit) throws ExecutionException, InterruptedException {
        List<RawdataFile> rawdataFiles = hippoData2RawdataFile(machine, machineName, future.get().toMapping(), startTimeLimit, endTimeLimit);
        if(!machineDataMap.containsKey(machineName)){
            machineDataMap.put(machineName, new ArrayList<RawdataFile>());
        }
        for(RawdataFile rawdataFile:rawdataFiles){
            machineDataMap.get(machineName).add(rawdataFile);
        }
    }

    private void buildDateDataMapByMachineYield(TreeMap<String, List<RawdataFile>> dateDataMap, String machine, String machineName,
                                                Future<SimpleExhalable> future, String startTimeLimit, String endTimeLimit) throws ExecutionException, InterruptedException {
        List<RawdataFile> rawdataFiles = hippoData2RawdataFileByMachineYield(machine, machineName, future.get().toMapping(), startTimeLimit, endTimeLimit);
        for(RawdataFile rawdataFile:rawdataFiles){
            if(!dateDataMap.containsKey(rawdataFile.getDateStr())){
                dateDataMap.put(rawdataFile.getDateStr(), new ArrayList<RawdataFile>());
            }
            dateDataMap.get(rawdataFile.getDateStr()).add(rawdataFile);
        }
    }

    private Map<String, String> buildMachineMap(List<String> machineIds){
        final Object[] machineIdArr = machineIds.toArray(new String[machineIds.size()]);
        try {
            return ActiveJdbc.operTx(new Operation<Map<String, String>>() {
                @Override
                public Map<String, String> operate() {
                    Map<String, String> machineMap = new HashMap<String, String>();

                    List<Map> machines = Device.where("device_id IN (" + Util.strSplitBy("?", ",", machineIdArr.length) + ")", machineIdArr).toMaps();
                    for(Map machine:machines){
                        String machineId = machine.get("device_id").toString();
                        String machineName = machine.get("device_name").toString();
                        machineMap.put(machineId, machineName);
                    }
                    return machineMap;
                }
            });
        } catch (Exception e) {
            log.warn("{}", e);
            return new HashMap<String, String>();
        }
    }

    private List<RawdataFile> hippoData2RawdataFile(String machineId, String machineName, List<Map<String, Atom>> records, String startTimeLimit, String endTimeLimit){
        String preDate = null;
        List<RawdataFile> rawdataFiles = new ArrayList<RawdataFile>();
        //StringBuilder content = new StringBuilder();
        List<String> newRecords = new LinkedList<String>();
        boolean isZeroHHmmssPreDate = false;
        String baseDate = null;//歸哪一天

        for(Map<String, Atom> record:records){
            String timestamp = record.get(HIPPO_TIMESTAMP_COL).asString();
            String date = timestamp.substring(0, 8);

            if(preDate == null){
                //content.append(hippoData2Csv(record));
                newRecords.add(hippoData2ChoData(machineName, record));
                baseDate = date;
            }else{
                //log.info("machineId: {}, date: {}", machineId, date);
                if(!preDate.equals(date) || isZeroHHmmssPreDate){//不同表示日期換惹
                    //log.info("********************************");
                    if(timestamp.equals(date + ZERO_HH_MM_SS)){//只有整點要歸前一天
                        isZeroHHmmssPreDate = true;
                        baseDate = preDate;//因為歸前一天
                    }else{
                        if(!isZeroHHmmssPreDate){
                            baseDate = date;
                        }
                        //rawdataFiles.add(new RawdataFile(machineId, baseDate, content.toString()));
                        rawdataFiles.add(new RawdataFile(machineId, machineName, baseDate, newRecords, startTimeLimit, endTimeLimit));
                        //content = new StringBuilder();
                        newRecords = new LinkedList<String>();
                        isZeroHHmmssPreDate = false;
                    }
                }
                //content.append(hippoData2Csv(record));
                newRecords.add(hippoData2ChoData(machineName, record));
            }
            preDate = date;
        }
        //rawdataFiles.add(new RawdataFile(machineId, preDate, content.toString()));
        rawdataFiles.add(new RawdataFile(machineId, machineName, baseDate, newRecords, startTimeLimit, endTimeLimit));

        return rawdataFiles;
    }

    /*private String hippoData2Csv(Map<String, Atom> record){
        StringBuilder sb = new StringBuilder();
        sb.append(record.get(HIPPO_TIMESTAMP_COL).asString()).append(CSV_SPLIT)
                //.append(record.get(HIPPO_G_CONS_COL).asString()).append(CSV_SPLIT)
                //.append(record.get(HIPPO_G_ALAM_COL).asString()).append(CSV_SPLIT)
                .append(record.get(HIPPO_G_PSCP_COL).asString()).append(CSV_SPLIT)
                .append(record.get(HIPPO_G_UPAT_COL).asString()).append(CSV_SPLIT)
                .append(record.get(HIPPO_G_UPST_COL).asString()).append(CSV_SPLIT)
                .append(record.get(HIPPO_G_LPAT_COL).asString()).append(CSV_SPLIT)
                .append(record.get(HIPPO_G_LPST_COL).asString()).append(CSV_SPLIT)
                .append(record.get(HIPPO_G_ACTP_COL).asString()).append(NEW_LINE);
                //.append(record.get(HIPPO_G_FEXP_COL).asString()).append(CSV_SPLIT)
                //.append(record.get(HIPPO_G_FASP_COL).asString()).append(CSV_SPLIT)
                //.append(record.get(HIPPO_G_FSAT_COL).asString()).append(CSV_SPLIT)
                //.append(record.get(HIPPO_G_FSST_COL).asString()).append(NEW_LINE);
        return sb.toString();
    }*/

    private String hippoData2ChoData(String machineName, Map<String, Atom> record){
        StringBuilder sb = new StringBuilder();
        String timestamp = record.get(HIPPO_TIMESTAMP_COL).asString();
        if((timestamp.length() >= 12) && (timestamp.substring(10, 12).equals("30") || timestamp.substring(10, 12).equals("00"))){
            sb.append(timestamp).append(CSV_SPLIT)
                    .append(machineName).append(CSV_SPLIT)
                    .append(record.get(HIPPO_G_PSCP_COL).asString()).append(CSV_SPLIT)
                    .append(record.get(HIPPO_G_UPAT_COL).asString()).append(CSV_SPLIT)
                    .append(record.get(HIPPO_G_UPST_COL).asString()).append(CSV_SPLIT)
                    .append(record.get(HIPPO_G_LPAT_COL).asString()).append(CSV_SPLIT)
                    .append(record.get(HIPPO_G_LPST_COL).asString()).append(CSV_SPLIT)
                    .append(record.get(HIPPO_G_ACTP_COL).asString()).append(CSV_SPLIT)
                    .append(record.get(HIPPO_G_FEXP_COL).asString()).append(CSV_SPLIT)
                    .append(record.get(HIPPO_G_FASP_COL).asString()).append(CSV_SPLIT)
                    .append(record.get(HIPPO_G_FSAT_COL).asString()).append(CSV_SPLIT)
                    .append(record.get(HIPPO_G_FSST_COL).asString()).append(NEW_LINE);
        }
        return sb.toString();
    }

    private List<RawdataFile> hippoData2RawdataFileByMachineYield(String machineId, String machineName, List<Map<String, Atom>> records, String startTimeLimit, String endTimeLimit){
        List<RawdataFile> rawdataFiles = new ArrayList<RawdataFile>();
        //StringBuilder content = new StringBuilder();
        TreeMap<String, List<String>> dispatchRecords = new TreeMap<String, List<String>>();
        //根據日期對資料做分類
        for(Map<String, Atom> record:records){
            //String timestamp = record.get(HIPPO_TIMESTAMP_COL).asString();
            //改成使用班次天分sheet
            String date = record.get(HIPPO_DATE_COL).asString();//timestamp.substring(0, 8);
            if(!dispatchRecords.containsKey(date)){
                dispatchRecords.put(date, new ArrayList<String>());
            }
            dispatchRecords.get(date).add(hippoData2ChoMachineYieldData(machineName, record));
        }
        //轉成RawdataFile格式
        for(String dateKey:dispatchRecords.keySet()){
            rawdataFiles.add(new RawdataFile(machineId, machineName, dateKey, dispatchRecords.get(dateKey), startTimeLimit, endTimeLimit));
        }
        return rawdataFiles;
    }

    //產量下載
    private String hippoData2ChoMachineYieldData(String machineName, Map<String, Atom> record){
        StringBuilder sb = new StringBuilder();
        String timestamp = record.get(HIPPO_TIMESTAMP_COL).asString();
        //每日每機台僅可下載6:50及18:50各1筆
        if((timestamp.length() >= 12) && (timestamp.substring(8, 12).equals("0650") || timestamp.substring(8, 12).equals("1850"))){
            sb.append(timestamp).append(CSV_SPLIT)
                    .append(machineName).append(CSV_SPLIT)
                    .append(record.get(HIPPO_G_PSCP_COL).asString()).append(NEW_LINE);
        }
        return sb.toString();
    }

    //時間加日
    private Date addDay(Date date, int day){
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.add(Calendar.DATE, day);
        return cal.getTime();
    }

    private class RawdataFile{
        private String machineId;
        private String machineName;
        private String date;
        private String dateStr;
        private List<String> records;
        private String startTimeLimit;
        private String endTimeLimit;

        public RawdataFile(String machineId, String machineName, String date, List<String> records, String startTimeLimit, String endTimeLimit) {
            this.machineId = machineId;
            this.machineName = machineName;
            this.date = date;
            this.dateStr = buildDateStr();
            this.records = new LinkedList<String>(records);
            this.startTimeLimit = startTimeLimit;
            this.endTimeLimit = endTimeLimit;
        }

        public String buildDateStr(){
            if(this.date != null && this.date.length() >= 8){
                return this.date.substring(0, 4) + "-" + this.date.substring(4, 6) + "-" + this.date.substring(6, 8);
            }else{
                return "---";
            }
        }

        public String getDatePathFormat(){
            return this.date.substring(0, 4) + "/" + this.date.substring(4, 6) + "/" + this.date;
        }

        public String getMachineId() {
            return machineId;
        }

        public String getMachineName() {
            return machineName;
        }

        public String getDate() {
            return date;
        }

        public String getDateStr() {
            return dateStr;
        }

        public String getContent() {
            StringBuilder sb = new StringBuilder();
            for(String record:records){
                if(record.length() > 14){
                    String timestamp = record.substring(0, 14);
                    //區間範圍內才放入
                    if(timestamp.compareTo(this.startTimeLimit) > 0 && timestamp.compareTo(this.endTimeLimit) <= 0){
                        sb.append(record);
                    }
                }
            }
            return sb.toString();
        }
    }

    private class ExcelFileByMachineYield{
        //machineName, date, time, G_PSCP, G_UPAT, G_UPST, G_LPAT, G_LPST, G_ACTP, G_FEXP, G_FASP, G_FSAT, G_FSST
        private final String[] HEADER = {"機台", "日期", "時間", "每日生產數量"};
        private final String NEW_LINE_REGEX = "\\r?\\n";
        private final String CSV_SPLIT_REGEX = "\\|";
        private final String TIMESTAMP_FORMAT = "yyyyMMddHHmmss";

        private Workbook workbook;

        public ExcelFileByMachineYield(TreeMap<String, List<RawdataFile>> dateDataMap){
            //log.info("***** {}", new Gson().toJson(dateDataMap));
            this.workbook = new XSSFWorkbook();
            if(dateDataMap.isEmpty()){//沒有資料就存no data
                Sheet sheet = this.workbook.createSheet("---");
                Row headerRow = sheet.createRow(0);
                headerRow.createCell(0).setCellValue("no data");
            }else{
                for(Map.Entry<String, List<RawdataFile>> dateDataEntry:dateDataMap.entrySet()){
                    String date = dateDataEntry.getKey();
                    List<RawdataFile> rawdataFiles = dateDataEntry.getValue();
                    //避免空的sheet出現，所以沒內容時，就不建sheet
                    StringBuilder content = new StringBuilder();
                    for(RawdataFile rawdataFile:rawdataFiles){
                        content.append(rawdataFile.getContent());
                    }
                    if(!content.toString().isEmpty()){
                        buildData(date, rawdataFiles);
                    }

                }
            }

        }

        private void buildData(String date, List<RawdataFile> rawdataFiles){
            //DataFormat dataFormat = this.workbook.createDataFormat();
            Sheet sheet = this.workbook.createSheet(date);

            // 標頭
            Row headerRow = sheet.createRow(0);
            for (int i = 0, size = HEADER.length; i < size; i++) {
                headerRow.createCell(i).setCellValue(HEADER[i]);
            }

            // 內容
            int rowIndex = 1;
            for(RawdataFile rawdataFile:rawdataFiles){
                String content = rawdataFile.getContent();
                if((rawdataFile.getDate() != null) && (content.length() > 0)){//因為date == null表示無任何一筆record存在
                    List<List<String>> choDataMatrix = choDataFormat(rawdataFile.getContent());
                    for (List<String> eachRow : choDataMatrix) {
                        Row row = sheet.createRow(rowIndex++);
                        int cellIndex = 0;
                        for (int i = 0, size = eachRow.size(); i < size; i++) {
                            Cell cell = row.createCell(cellIndex);
                            String cellValue = eachRow.get(i);
                            cell.setCellValue(cellValue);
                            cellIndex++;
                        }
                    }
                }
            }
        }

        private List<List<String>> choDataFormat(String data){
            List<List<String>> matrix = new ArrayList<List<String>>();
            String[] records = data.split(NEW_LINE_REGEX);
            for(String record:records){
                List<String> cols = new ArrayList<String>();
                String[] colDatas = record.split(CSV_SPLIT_REGEX, -1);
                for(String colData:choFormat(colDatas)){
                    cols.add(colData);
                }
                matrix.add(cols);
            }
            return matrix;
        }

        //組成excel對映的欄位
        private String[] choFormat(String[] colDatas){
            //"G_PSCP";//當日產量[2]
            //20161121200000|3A3|8|191.5|190.0|191.0|190.0|82.3
            String[] dateAndTime = choDateFormat(colDatas[0]);//日期與時間
            String[] cols = new String[4];
            cols[0] = colDatas[1];      //"機台"
            cols[1] = dateAndTime[0];   //"日期"
            cols[2] = dateAndTime[1];   //"時間"
            cols[3] = colDatas[2];      //"每日生產數量"
            return cols;
        }

        //arr:[date, time]
        private String[] choDateFormat(String timestampStr){
            //yyyy/MM/dd
            String date = timestampStr.substring(0, 4) + "/" +
                    timestampStr.substring(4, 6) + "/" +
                    timestampStr.substring(6, 8);
            //HH:mm
            String time = timestampStr.substring(8, 10) + ":" +
                    timestampStr.substring(10, 12);
            return new String[]{date, time};

        }

        public Workbook getWorkbook() {
            return workbook;
        }
    }

    private class ExcelFile{
        //machineName, date, time, G_PSCP, G_UPAT, G_UPST, G_LPAT, G_LPST, G_ACTP, G_FEXP, G_FASP, G_FSAT, G_FSST
        private final String[] HEADER = {"機台", "日期", "時間", "每日生產數量", "上熱盤實際溫度", "上熱盤設定溫度", "下熱盤實際溫度", "下熱盤設定溫度", "主機壓力(實際)", "一次排氣壓力", "一次加硫壓力", "一次加硫實際時間", "一次加硫設定時間"};
        private final String NEW_LINE_REGEX = "\\r?\\n";
        private final String CSV_SPLIT_REGEX = "\\|";
        private final String TIMESTAMP_FORMAT = "yyyyMMddHHmmss";

        private Workbook workbook;

        public ExcelFile(TreeMap<String, List<RawdataFile>> machineDataMap){
            this.workbook = new XSSFWorkbook();
            for(Map.Entry<String, List<RawdataFile>> machineDataEntry:machineDataMap.entrySet()){
                String machineName = machineDataEntry.getKey();
                List<RawdataFile> rawdataFiles = machineDataEntry.getValue();
                buildData(machineName, rawdataFiles);
            }
        }

        private void buildData(String machineName, List<RawdataFile> rawdataFiles){
            //DataFormat dataFormat = this.workbook.createDataFormat();
            Sheet sheet = this.workbook.createSheet(machineName);

            // 標頭
            Row headerRow = sheet.createRow(0);
            for (int i = 0, size = HEADER.length; i < size; i++) {
                headerRow.createCell(i).setCellValue(HEADER[i]);
            }

            // 內容
            int rowIndex = 1;
            for(RawdataFile rawdataFile:rawdataFiles){
                String content = rawdataFile.getContent();
                if((rawdataFile.getDate() != null) && (content.length() > 0)){//因為date == null表示無任何一筆record存在
                    List<List<String>> choDataMatrix = choDataFormat(rawdataFile.getContent());
                    for (List<String> eachRow : choDataMatrix) {
                        Row row = sheet.createRow(rowIndex++);
                        int cellIndex = 0;
                        for (int i = 0, size = eachRow.size(); i < size; i++) {
                            Cell cell = row.createCell(cellIndex);
                            String cellValue = eachRow.get(i);
                            cell.setCellValue(cellValue);
                            cellIndex++;
                        }
                    }
                }
            }
        }

        private List<List<String>> choDataFormat(String data){
            List<List<String>> matrix = new ArrayList<List<String>>();
            String[] records = data.split(NEW_LINE_REGEX);
            for(String record:records){
                List<String> cols = new ArrayList<String>();
                String[] colDatas = record.split(CSV_SPLIT_REGEX, -1);
                for(String colData:choFormat(colDatas)){
                    cols.add(colData);
                }
                matrix.add(cols);
            }
            return matrix;
        }

        //組成excel對映的欄位
        private String[] choFormat(String[] colDatas){
            //"G_PSCP";//當日產量[2]
            //"G_UPAT";//上熱盤實際溫度[3]
            //"G_UPST";//上熱盤設定溫度[4]
            //"G_LPAT";//下熱盤實際溫度[5]
            //"G_LPST";//下熱盤設定溫度[6]
            //"G_ACTP";//主機壓力(實際)[7]
            //"G_FEXP";//一次排氣壓力[8]
            //"G_FASP";//一次加硫壓力[9]
            //"G_FSAT";//一次加硫實際時間[10]
            //"G_FSST";//一次加硫設定時間[11]
            //20161121200000|3A3|8|191.5|190.0|191.0|190.0|82.3
            String[] dateAndTime = choDateFormat(colDatas[0]);//日期與時間
            String[] cols = new String[13];
            cols[0] = colDatas[1];      //"機台"
            cols[1] = dateAndTime[0];   //"日期"
            cols[2] = dateAndTime[1];   //"時間"
            cols[3] = colDatas[2];      //"每日生產數量"
            cols[4] = colDatas[3];      //"上熱盤實際溫度"
            cols[5] = colDatas[4];      //"下熱盤實際溫度"
            cols[6] = colDatas[5];      //"上熱盤設定溫度"
            cols[7] = colDatas[6];      //"下熱盤設定溫度"
            cols[8] = colDatas[7];      //"主機壓力(實際)"
            cols[9] = colDatas[8];      //"一次排氣壓力"
            cols[10] = colDatas[9];     //"一次加硫壓力"
            cols[11] = colDatas[10];    //"一次加硫實際時間"
            cols[12] = colDatas[11];    //"一次加硫設定時間"
            return cols;
        }

        //arr:[date, time]
        private String[] choDateFormat(String timestampStr){
            DateFormat timestampFormat = new SimpleDateFormat(TIMESTAMP_FORMAT);
            try {
                Date timestamp = timestampFormat.parse(timestampStr);
                Date timestampSubOneMin = addMin(timestamp, -1);//為了讓00:30變00:29，23:00變22:59
                String timestampSubOneMinStr = timestampFormat.format(timestampSubOneMin);
                //yyyy/MM/dd
                String date = timestampSubOneMinStr.substring(0, 4) + "/" +
                        timestampSubOneMinStr.substring(4, 6) + "/" +
                        timestampSubOneMinStr.substring(6, 8);
                //HH:mm
                String time = timestampSubOneMinStr.substring(8, 10) + ":" +
                        timestampSubOneMinStr.substring(10, 12);
                return new String[]{date, time};
            } catch (ParseException e) {
                e.printStackTrace();
                return new String[]{"", ""};
            }
        }

        //時間加分
        private Date addMin(Date date, int min){
            Calendar cal = Calendar.getInstance();
            cal.setTime(date);
            cal.add(Calendar.MINUTE, min);
            return cal.getTime();
        }

        public Workbook getWorkbook() {
            return workbook;
        }
    }
}