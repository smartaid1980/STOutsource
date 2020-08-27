package com.servtech.servcloud.app.controller.huangliang_matStock;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.success;

@RestController
@RequestMapping("/huangliangMatStock/matStockChangeLog")
public class MatStockChangeLogController {
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/excel", method = RequestMethod.POST)
    public RequestResult<?> downloadExcel(@RequestParam("data") final String jsonStr) {
        try {
            List<Map> logs = new Gson().fromJson(jsonStr, new TypeToken<ArrayList<Map>>() {}.getType());
            Workbook wb;
            String templateFilePath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/HuangLiangMaterialTempStock/excel/庫存儲位變更單.xlsx";
            FileInputStream templateFile = new FileInputStream(new File(templateFilePath));
            wb = new XSSFWorkbook(templateFile);
            addSheet(wb, logs);

            if (logs.size() > 0) {
                setExcelSheetCellValue(logs, wb);
            } else {
                return RequestResult.fail("請選取資料...");
            }

            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
            String fileName = "庫存儲位變更單"+ sdf.format(new Date()) + ".xlsx";
            fileName = new String (fileName.getBytes(), "ISO8859-1");
            String mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            String headerKey = "Content-Disposition";
            String headerValue = "attachment; filename=" + fileName;
            response.setContentType(mimeType);
            response.setHeader(headerKey, headerValue);
            ServletOutputStream out = response.getOutputStream();
            wb.write(out);
            out.flush();
            out.close();
            wb.close();

        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
        return success();
    }

    private void setExcelSheetCellValue(List<Map> result, Workbook wb) {
        int currentSheetIdx = 0;
        // 8筆資料/分頁的單位數量
        int eightDataPerSheetUnit = 1;
        //一個分頁包含的table數量
        int tableInOneSheetNum = 8;
        int rowNum1 = 2;
        int col1 = 2;
        int col2 = 4;
        int col3 = 6;

        for (int dataIdx = 0; dataIdx < result.size(); dataIdx++) {
            //判斷是否分sheet
            int currentDataNum = dataIdx + 1;
            double dataNumPerEightData = (double) currentDataNum / tableInOneSheetNum;
            if (dataNumPerEightData > eightDataPerSheetUnit) {
                eightDataPerSheetUnit = (int) Math.ceil(dataNumPerEightData);
                currentSheetIdx++;
                rowNum1 = 2;
            }

            Sheet sheet = wb.getSheetAt(currentSheetIdx);
            Map data = result.get(dataIdx);
            String mstock_name = data.get("mstock_name") == null ? "" : data.get("mstock_name").toString();
            String po_no = data.get("po_no") == null ? "" : data.get("po_no").toString();
            String mat_code = data.get("mat_code") == null ? "" : data.get("mat_code").toString();
            String sup_name = data.get("sup_name") == null ? "" : data.get("sup_name").toString();
            String mat_length = data.get("mat_length") == null ? "" : data.get("mat_length").toString();
            String mat_color = data.get("mat_color") == null ? "" : data.get("mat_color").toString();
            String shelf_time = data.get("shelf_time") == null ? "" : data.get("shelf_time").toString();
            String orig_location = data.get("orig_location") == null ? "" : data.get("orig_location").toString();
            String chg_location = data.get("chg_location") == null ? "" : data.get("chg_location").toString();

            int tempRow = rowNum1;
            sheet.getRow(tempRow).getCell(col1, Row.CREATE_NULL_AS_BLANK).setCellValue(mstock_name);
            sheet.getRow(tempRow).getCell(col2, Row.CREATE_NULL_AS_BLANK).setCellValue(po_no);
            tempRow++;
            sheet.getRow(tempRow).getCell(col1, Row.CREATE_NULL_AS_BLANK).setCellValue(mat_code);
            tempRow++;
            sheet.getRow(tempRow).getCell(col1, Row.CREATE_NULL_AS_BLANK).setCellValue(sup_name);
            tempRow++;
            sheet.getRow(tempRow).getCell(col1, Row.CREATE_NULL_AS_BLANK).setCellValue(mat_length);
            sheet.getRow(tempRow).getCell(col2, Row.CREATE_NULL_AS_BLANK).setCellValue(mat_color);
            sheet.getRow(tempRow).getCell(col3, Row.CREATE_NULL_AS_BLANK).setCellValue(shelf_time.substring(0, 10));
            tempRow++;
            sheet.getRow(tempRow).getCell(col1, Row.CREATE_NULL_AS_BLANK).setCellValue(orig_location);
            sheet.getRow(tempRow).getCell(col2, Row.CREATE_NULL_AS_BLANK).setCellValue(chg_location);

            if (dataIdx % 2 == 1) {
                rowNum1 += 8;
                col1 = 2;
                col2 = 4;
                col3 = 6;
            } else {
                col1 = 9;
                col2 = 11;
                col3 = 13;
            }
        }
    }

    static void addSheet(Workbook wb, List dataList) {
        // 填入列印日期
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
        String currentTime = sdf.format(new Date());
        wb.getSheetAt(0).getRow(1).getCell(13, Row.CREATE_NULL_AS_BLANK).setCellValue(currentTime);
        int sumSheetNum = (int) Math.ceil((double) dataList.size() / 8);
        for (int sheetIdx = 1; sheetIdx <= sumSheetNum - 1; sheetIdx++) {
            wb.cloneSheet(0);
            wb.setSheetName(sheetIdx, "工作表"+(sheetIdx+1));
        }
    }
}
