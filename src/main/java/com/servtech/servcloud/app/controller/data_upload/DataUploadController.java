package com.servtech.servcloud.app.controller.data_upload;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.servtech.common.codec.exception.LicenseMismatchException;
import com.servtech.hippopotamus.Inhalable;
import com.servtech.hippopotamus.Inhaler;
import com.servtech.hippopotamus.exception.ExhaleException;
import com.servtech.hippopotamus.exception.InhaleException;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.apache.commons.io.IOUtils;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

/**
 * controller
 * Created by Jenny on 2016/6/29.
 */

@RestController
@RequestMapping("/dataUpload")
public class DataUploadController {

    public static final String PROJECT_NAME = "HuangLiangDataUpload";
    public static final String DIR_NAME = "HuangLiang";
    public static final String EMPLOYEE_EXCEL_DIR_NAME = "employee_excels";
    public static final String EMPLOYEE_EXCEL_NAME = "employee";
    public static final String GOLF_PRODUCT_NAME = "golf_product";
    public static final String GOLF_SAMPLE_NAME = "golf_sample";
    public static final String MRP_PRODUCT_NAME = "mrp_product";
    public static final String MRP_SAMPLE_NAME = "mrp_sample";
    public static final String LOG_DIR_NAME = "logs";

    @RequestMapping(value = "employee", method = RequestMethod.POST)
    public RequestResult<?> employee(@RequestParam("file") MultipartFile file) throws IOException{
        String timestamp = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date());
        String encodeTimestamp = timestamp + "000";

        //讀檔 並 存入space
        Inhaler inhaler = HippoService.getInstance().newInhaler();
        inhaler.space("HUL_care_employees")
               .index("customer_id", "HuangLiang");

        InputStream inputStream = file.getInputStream();
        XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
        XSSFSheet sheet = workbook.getSheetAt(0);
        XSSFRow row;
        //第一行是header
        for (int i = 1 ; i < sheet.getPhysicalNumberOfRows() ; i ++) {
            row = sheet.getRow(i);
            if (row.getCell(0) != null) {
                inhaler.dataTimestamp(encodeTimestamp);
                inhaler.put("employee_id", row.getCell(0).toString().trim())
                       .put("employee_name", row.getCell(1).toString().trim())
                       .next();
            }
        }

        try {
            Future<Inhalable> future = inhaler.inhale();
            Inhalable inhalable = future.get();
        } catch (InterruptedException e) {
            return RequestResult.fail(e.getMessage());
        } catch (ExecutionException e) {
            return RequestResult.fail(e.getMessage());
        } catch (InhaleException e) {
            if (e.getCause() instanceof LicenseMismatchException) {
                return RequestResult.licenseMismatch("License expired!!");
            }
            return RequestResult.fail(e.getMessage());
        }

        //保留上傳過的檔案 log
        File employeeDirFile = new File(System.getProperty(SysPropKey.DATA_PATH), DIR_NAME + "/" + EMPLOYEE_EXCEL_DIR_NAME);
        File employeeFile = new File(System.getProperty(SysPropKey.DATA_PATH), DIR_NAME + "/" + EMPLOYEE_EXCEL_DIR_NAME + "/" + EMPLOYEE_EXCEL_NAME +"-now.xlsx");

        if (employeeFile.exists()) {
            employeeFile.renameTo(new File(employeeDirFile, EMPLOYEE_EXCEL_NAME + "-"+ timestamp + ".xlsx"));
        }

        Files.createParentDirs(employeeFile);
        file.transferTo(employeeFile);

        return RequestResult.success("顧車人員名單上傳成功");
    }

    @RequestMapping(value = "golfProduct", method = RequestMethod.POST)
    public RequestResult<?> golfProduct(@RequestParam("file") MultipartFile file) throws IOException{
        String quantityCheckMessage = checkQuantityValue(file);
        if(quantityCheckMessage.length()>0){
            return RequestResult.success(quantityCheckMessage);
        }
	
        int resultCode = uploadFile(file, GOLF_PRODUCT_NAME, "G", "P");
        if (resultCode == 0) {
            return RequestResult.success("上傳檔案處理成功!");
        } else {
            return RequestResult.success("不明原因失敗, 請檢查報表檔案");
        }
    }

    @RequestMapping(value = "golfSample", method = RequestMethod.POST)
    public RequestResult<?> golfSample(@RequestParam("file") MultipartFile file) throws IOException{
        int resultCode = uploadFile(file, GOLF_SAMPLE_NAME, "G", "S");
        if (resultCode == 0) {
            return RequestResult.success("上傳檔案處理成功!");
        } else {
            return RequestResult.success("不明原因失敗, 請檢查報表檔案");
        }
    }

    @RequestMapping(value = "mrpProduct", method = RequestMethod.POST)
    public RequestResult<?> mrpProduct(@RequestParam("file") MultipartFile file) throws IOException{
        String quantityCheckMessage = checkQuantityValue(file);
        if(quantityCheckMessage.length()>0){
            return RequestResult.success(quantityCheckMessage);
        }		
		
        int resultCode = uploadFile(file, MRP_PRODUCT_NAME, "M", "P");
        if (resultCode == 0) {
            return RequestResult.success("上傳檔案處理成功!");
        } else {
            return RequestResult.success("不明原因失敗, 請檢查報表檔案");
        }
    }

    @RequestMapping(value = "mrpSample", method = RequestMethod.POST)
    public RequestResult<?> mrpSample(@RequestParam("file") MultipartFile file) throws IOException{
        int resultCode = uploadFile(file, MRP_SAMPLE_NAME, "M", "S");
        if (resultCode == 0) {
            return RequestResult.success("上傳檔案處理成功!");
        } else {
            return RequestResult.success("不明原因失敗, 請檢查報表檔案");
        }
    }

    private int uploadFile(MultipartFile file, String dataTypeDirPath, String type1, String type2) throws IOException{
        String timestamp = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date());
        File excelDirFile = new File(System.getProperty(SysPropKey.DATA_PATH), DIR_NAME + "/" + dataTypeDirPath);
        File excelFile = new File(excelDirFile, timestamp + file.getOriginalFilename());
        if (!excelFile.exists()) {
            Files.createParentDirs(excelFile);
        }
        file.transferTo(excelFile);

        String batPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/" + PROJECT_NAME + "/program/uploadHuangLiang.bat";
        String hippoXmlPath = System.getProperty(SysPropKey.ROOT_PATH) + "/WEB-INF/classes/hippo.xml";
//        String logPath = new File(System.getProperty(SysPropKey.DATA_PATH), DIR_NAME + "/" + dataTypeDirPath).getAbsolutePath();
        String[] commands = new String[]{new File(batPath).getAbsolutePath(),
                type1,
                type2,
                excelFile.getAbsolutePath(),
                new File(hippoXmlPath).getAbsolutePath()};

        System.out.println(Arrays.toString(commands));

        RunCmd runCmd = new RunCmd(commands, null, new File(System.getProperty(SysPropKey.ROOT_PATH) + "/app/" + PROJECT_NAME + "/program"));
        int resultCode = runCmd.execAndReturn();
        if (resultCode == 0) {
            excelFile.renameTo(new File(excelDirFile, "Success-"+ timestamp + file.getOriginalFilename()));
        }else{
            excelFile.renameTo(new File(excelDirFile, "Fail-"+ timestamp + file.getOriginalFilename()));
        }

        return resultCode;
    }
	
    private String checkQuantityValue(MultipartFile file) throws IOException{
        StringBuilder sb = new StringBuilder();

        InputStream inputStream = file.getInputStream();
        HSSFWorkbook workbook = new HSSFWorkbook(inputStream);
        HSSFSheet sheet = workbook.getSheetAt(0);

        for (int i = 4 ; i < sheet.getLastRowNum() ; i ++) {
            HSSFRow row = sheet.getRow(i);
            HSSFCell cell = row.getCell(6);
            cell.setCellType(Cell.CELL_TYPE_STRING);
            if(cell.getStringCellValue().equals("")){
                sb.append("第 " + (i+1) + ", ");
            }
        }

        if(sb.toString().length()>0){
            sb.append("行資料缺少總數量, 請確認報表檔案!");
        }
        return sb.toString();
    }	
}
