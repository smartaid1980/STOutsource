package com.servtech.servcloud.app.controller.aheadmaster;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by Bendom on 2016/5/12.
 */

@RestController
@RequestMapping("/aheadmaster/excel")
public class ExcelTransformController {

    public static final String PROJECT_NAME = "aheadmaster";
    public static final String REPORT_EXCEL_DIR_NAME = "report_excels";
    public static final String SETTING_EXCEL_DIR_NAME = "setting_excels";
    public static final String SETTING_EXCEL_NAME = "setting";
    public static final String LOG_DIR_NAME = "logs";

    private static final String AHEADMASTER_CHO_CALC_BAT = "aheadmaster_cho_calc.bat";

    @RequestMapping(value = "upload/report", method = RequestMethod.POST)
    public RequestResult<?> upload(@RequestParam("file") MultipartFile file) throws IOException{
        Set<String> sheetNames = new HashSet<String>();
        sheetNames.add("工單資料");
        sheetNames.add("生產日報");

        String timestamp = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date());
        File excelDirFile = new File(System.getProperty(SysPropKey.DATA_PATH), PROJECT_NAME + "/" + REPORT_EXCEL_DIR_NAME);
        File excelFile = new File(excelDirFile, timestamp + file.getOriginalFilename());
        if (!excelFile.exists()) {
            Files.createParentDirs(excelFile);
        }
        file.transferTo(excelFile);

        ExcelCheckResult excelCheckResult = checkExcelSheet(excelFile, sheetNames);
        if(!excelCheckResult.isSuccess){//檢查sheet是否都存在
            excelFile.renameTo(new File(excelDirFile, "Fail-"+ timestamp + file.getOriginalFilename()));
            return RequestResult.fail(excelCheckResult.getErrorMsg());
        }

        String batPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/" + PROJECT_NAME + "/program/excelTransform.bat";
        File settingFile = new File(System.getProperty(SysPropKey.DATA_PATH), PROJECT_NAME + "/" + SETTING_EXCEL_DIR_NAME + "/" + SETTING_EXCEL_NAME +"-now.xlsx");
        String leanID = System.getProperty(SysPropKey.SERVCLOUD_ID);
        String hippoXmlPath = System.getProperty(SysPropKey.ROOT_PATH) + "/WEB-INF/classes/hippo.xml";
        String logPath = new File(System.getProperty(SysPropKey.DATA_PATH), PROJECT_NAME + "/" + LOG_DIR_NAME).getAbsolutePath();

        String choCalcBatPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/" + PROJECT_NAME + "/program/" + AHEADMASTER_CHO_CALC_BAT;

        if (!settingFile.exists()) {
            return RequestResult.fail("請先上傳設定檔!");
        }
        String[] commands = new String[]{new File(batPath).getAbsolutePath(),
                                        excelFile.getAbsolutePath(),
                                        settingFile.getAbsolutePath(),
                                        leanID,
                                        new File(hippoXmlPath).getAbsolutePath(),
                                        logPath};

        RunCmd runCmd = new RunCmd(commands, null, new File(System.getProperty(SysPropKey.ROOT_PATH) + "/app/" + PROJECT_NAME + "/program"));
        int resultCode = runCmd.execAndReturn();
        if (resultCode == 0) {
            excelFile.renameTo(new File(excelDirFile, "Success-" + timestamp + file.getOriginalFilename()));

            String errormsg = calcCho(choCalcBatPath, hippoXmlPath);
            if(errormsg.isEmpty()){
                return RequestResult.success("Report Excel Transform Successfully!");
            }else{
                excelFile.renameTo(new File(excelDirFile, "Fail-"+ timestamp + file.getOriginalFilename()));
                return RequestResult.fail("不明原因失敗, 請檢查報表檔案");
            }
        } else {
            excelFile.renameTo(new File(excelDirFile, "Fail-"+ timestamp + file.getOriginalFilename()));
            File errorMessageFile = new File(logPath + "/" + new SimpleDateFormat("yyyyMMdd").format(new Date()));
            if (errorMessageFile.exists()) {
                return RequestResult.fail(Files.toString(errorMessageFile, Charsets.UTF_8).replace("\r\n","\n"));
            } else {
                return RequestResult.fail("不明原因失敗, 請檢查報表檔案");
            }
        }
    }

    private String calcCho(String batPath, String hippoXmlPath){
        String[] commands = new String[]{new File(batPath).getAbsolutePath(),
                new File(hippoXmlPath).getAbsolutePath()};
        RunCmd runCmd = new RunCmd(commands, null, new File(System.getProperty(SysPropKey.ROOT_PATH) + "/app/" + PROJECT_NAME + "/program"));
        int resultCode = runCmd.execAndReturn();
        if (resultCode == 0) {
            return "";
        }else{
            return "fail";
        }
    }

    @RequestMapping(value = "upload/setting", method = RequestMethod.POST)
    public RequestResult<?> setting(@RequestParam("file") MultipartFile file) throws IOException{
        Set<String> sheetNames = new HashSet<String>();
        sheetNames.add("製程");
        sheetNames.add("途程-製程標準工時");
        sheetNames.add("年月對照");
        sheetNames.add("系列產品");
        sheetNames.add("不良對照表");
        sheetNames.add("無效對照表");
        sheetNames.add("客戶對照表");

        String timestamp = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date());
        File settingDirFile = new File(System.getProperty(SysPropKey.DATA_PATH), PROJECT_NAME + "/" + SETTING_EXCEL_DIR_NAME);

        File temp = new File(System.getProperty(SysPropKey.DATA_PATH), PROJECT_NAME + "/" + SETTING_EXCEL_DIR_NAME + "/temp.xlsx");

        Files.createParentDirs(temp);
        if(temp.exists()){
            temp.delete();
        }
        file.transferTo(temp);

        ExcelCheckResult excelCheckResult = checkExcelSheet(temp, sheetNames);
        if(!excelCheckResult.isSuccess){//檢查sheet是否都存在
            return RequestResult.fail(excelCheckResult.getErrorMsg());
        }

        File settingFile = new File(System.getProperty(SysPropKey.DATA_PATH), PROJECT_NAME + "/" + SETTING_EXCEL_DIR_NAME + "/" + SETTING_EXCEL_NAME +"-now.xlsx");
        if (settingFile.exists()) {
            settingFile.renameTo(new File(settingDirFile, "setting-"+ timestamp + ".xlsx"));
        }
        Files.copy(temp, settingFile);

        return RequestResult.success("設定檔更新成功");
    }

    //用來驗證excel的sheet，因為
    private ExcelCheckResult checkExcelSheet(File file, Set<String> sheetNames){
        Set<String> currentExcelSheets = new HashSet<String>();
        FileInputStream fis = null;
        try {
            fis = new FileInputStream(file);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        InputStream is = fis;
        Workbook workbook = null;
        try {
            workbook = WorkbookFactory.create(is);
            for (Iterator<Sheet> iter = workbook.sheetIterator(); iter.hasNext();) {
                Sheet sheet = iter.next();
                String sheetName = sheet.getSheetName();
                currentExcelSheets.add(sheetName);
            }
            //比對sheet，若sheetNames裡面沒有移除完，就表示excel有漏掉sheet的資料
            sheetNames.removeAll(currentExcelSheets);
            StringBuilder notExistSheetNames = new StringBuilder();
            if(sheetNames.size() > 0){//大於0就是有漏sheet
                for(String name: sheetNames){
                    notExistSheetNames.append("Sheet Name: '" + name + "' not exist! ");
                }
            }

            if(notExistSheetNames.toString().length() > 0){
                return new ExcelCheckResult(false, notExistSheetNames.toString());
            }else{
                return new ExcelCheckResult(true, "");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ExcelCheckResult(false, e.getMessage());
        }finally {
            if (workbook != null) {
                try {
                    workbook.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            try {
                fis.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

    }

    private class ExcelCheckResult{
        private boolean isSuccess;
        private String errorMsg;

        public ExcelCheckResult(boolean isSuccess, String errorMsg) {
            this.isSuccess = isSuccess;
            this.errorMsg = errorMsg;
        }

        public boolean isSuccess() {
            return isSuccess;
        }

        public String getErrorMsg() {
            return errorMsg;
        }
    }
}
