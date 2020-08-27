package com.servtech.servcloud.app.controller.aerowin;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Kevin Big Big on 2016/10/3.
 */

@RestController
@RequestMapping("/aerowin/employee")
public class EmployeeController {
    private final Logger logger = LoggerFactory.getLogger(EmployeeController.class);
    private final String UPLOAD_DIR = System.getProperty(SysPropKey.DATA_PATH) + File.separator + "upload_employee_aerowin" + File.separator;
    private static final Map<String, String> SHIFT_MAP;

    static{
        SHIFT_MAP = new HashMap<String, String>();
        SHIFT_MAP.put("早", "A");
        SHIFT_MAP.put("中", "B");
        SHIFT_MAP.put("晚", "C");
    }

    private final int SHIFT_INDEX = 2;
    private final int EMP_ID_INDEX = 3;
    private final int EMP_NAME_INDEX = 4;
    private final int SHIFT_BEGIN_INDEX = 5;
    private final int SHIFT_END_INDEX = 6;

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    public RequestResult<String> upload(@RequestParam("file") final MultipartFile uploadFile) {

        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                //取得檔案 以及 檔名
                String excelName = uploadFile.getOriginalFilename();
                String excelNameNotFileType = excelName.substring(0, excelName.indexOf("."));
                logger.info("fileName: {}", excelNameNotFileType);
                //取得上傳戳記
                SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
                String datatimetag = sdf.format(System.currentTimeMillis());
                //將上傳檔名切割
                String yyyyMM = excelNameNotFileType.substring(excelNameNotFileType.length() - 6, excelNameNotFileType.length());
                File excelDir = new File(UPLOAD_DIR);
                File excelFile = new File(excelDir, yyyyMM+"_"+(datatimetag.substring(0, 14)+".xls"));
                try {
                    if (!excelDir.exists()) {
                        excelDir.mkdirs();
                    }
                    uploadFile.transferTo(excelFile);
                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                    excelFile.delete();
                }
                List<EmpTemp> empTemps = getDataFromExcel(yyyyMM, excelFile);
                updateEmployeeData(empTemps);
                if(empTemps.size() > 0){
                    return success("");
                }else{
                    return fail("record length is zero or excel header incorrect...");
                }
            }
        });
    }

    private void updateEmployeeData(List<EmpTemp> empTemps){
        if(empTemps.size() == 0){
            logger.info("excel not any record...");
            return;
        }
        String createBy = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        Timestamp createTime = new Timestamp(System.currentTimeMillis());
        Base.exec("DELETE FROM a_aerowin_employee WHERE ym = ?", empTemps.get(0).getYm());
        for(EmpTemp empTemp:empTemps){
            Base.exec("INSERT INTO a_aerowin_employee (ym, emp_id, emp_name, shift, shift_begin, shift_end, create_by, create_time)" +
                    " VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    empTemp.getYm(), empTemp.getEmpId(), empTemp.getEmpName(),
                    empTemp.getShift(), empTemp.getShiftBegin(), empTemp.getShiftEnd(),
                    createBy, createTime);
        }
    }

    private List<EmpTemp> getDataFromExcel(String yyyyMM, File excelFile) {
        List<EmpTemp> empTemps = new ArrayList<EmpTemp>();
        DataFormatter formatter = new DataFormatter();
        try {
            //開始解析excel
            HSSFWorkbook wb = new HSSFWorkbook(new FileInputStream(excelFile));
            //取得機台狀況以方便建立 Mapping 表
            HSSFSheet sheet = wb.getSheetAt(0);
            Row header = sheet.getRow(sheet.getFirstRowNum());

            if(headerCorrect(header, formatter)) {
                //跳過第一行header
                for (int index = (sheet.getFirstRowNum() + 1); index <= sheet.getLastRowNum(); index++) {
                    Row row = sheet.getRow(index);
                    String shift = SHIFT_MAP.get(formatter.formatCellValue(row.getCell(SHIFT_INDEX)));
                    String empId = formatter.formatCellValue(row.getCell(EMP_ID_INDEX));
                    String empName = formatter.formatCellValue(row.getCell(EMP_NAME_INDEX));
                    String beginTime = hhmmFormat(formatter.formatCellValue(row.getCell(SHIFT_BEGIN_INDEX)));
                    String endTime = hhmmFormat(formatter.formatCellValue(row.getCell(SHIFT_END_INDEX)));

                    empTemps.add(new EmpTemp(yyyyMM, empId, empName, shift, beginTime, endTime));
                }
            }else{
                logger.warn("upload excel header incorrect");
            }
        } catch (IOException e) {
            e.printStackTrace();
            excelFile.delete();
        }
        return empTemps;
    }

    //檢查header
    private boolean headerCorrect(Row header, DataFormatter formatter){
        String shiftHeader = formatter.formatCellValue(header.getCell(SHIFT_INDEX));
        String empIdHeader = formatter.formatCellValue(header.getCell(EMP_ID_INDEX));
        String empNameHeader = formatter.formatCellValue(header.getCell(EMP_NAME_INDEX));
        String beginTimeHeader = formatter.formatCellValue(header.getCell(SHIFT_BEGIN_INDEX));
        String endTimeHeader = formatter.formatCellValue(header.getCell(SHIFT_END_INDEX));

        if(shiftHeader.contains("班次") && empIdHeader.contains("報工人員") &&
                empNameHeader.contains("人員名稱") && beginTimeHeader.contains("工作時間(起)") && endTimeHeader.contains("工作時間(迄)")){
            return true;
        }else{
            return false;
        }
    }

    private String hhmmFormat(String hhmm) {
        String[] arr = hhmm.split(":");
        if (arr.length == 2) {
            String hh = arr[0];
            String mm = arr[1];
            if (hh.length() == 1) {
                hh = "0" + hh;
            }
            if (mm.length() == 1) {
                mm = "0" + mm;
            }
            return hh + ":" + mm;
        } else {
            return hhmm;
        }
    }

    private class EmpTemp{
        private String ym;
        private String empId;
        private String empName;
        private String shift;
        private String shiftBegin;
        private String shiftEnd;

        public EmpTemp(String ym, String empId, String empName, String shift, String shiftBegin, String shiftEnd) {
            this.ym = ym;
            this.empId = empId;
            this.empName = empName;
            this.shift = shift;
            this.shiftBegin = shiftBegin;
            this.shiftEnd = shiftEnd;
        }

        public String getYm() {
            return ym;
        }

        public String getEmpId() {
            return empId;
        }

        public String getEmpName() {
            return empName;
        }

        public String getShift() {
            return shift;
        }

        public String getShiftBegin() {
            return shiftBegin;
        }

        public String getShiftEnd() {
            return shiftEnd;
        }
    }
}
