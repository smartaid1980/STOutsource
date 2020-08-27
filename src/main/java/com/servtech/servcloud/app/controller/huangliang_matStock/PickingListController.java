package com.servtech.servcloud.app.controller.huangliang_matStock;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.Device;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.success;

@RestController
@RequestMapping("/huangliangMatStock/pickinglist")
public class PickingListController {
    static SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/excel", method = RequestMethod.POST)
    public RequestResult<?> downloadExcel(@RequestParam("data") final String jsonStr) {

        return ActiveJdbc.operTx(() -> {

            try {

                List<Map> params = new Gson().fromJson(jsonStr, new TypeToken<ArrayList<Map>>() {
                }.getType());

                if (params.size() > 0) {
                    //查view
                    List<Map> result = Base.findAll(getPickingListSql(params));
                    returnExcelStream(result);
                } else {
                    List<Map> emptyResult = new ArrayList<>();
                    returnExcelStream(emptyResult);
                }
            } catch (Exception e) {
                e.printStackTrace();
                return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
            }
            return success();
        });
    }

    private void returnExcelStream(List<Map> result) throws IOException {
        Workbook wb;
        String templateFilePath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/HuangLiangMatCollectAndSupplement/program/template.xlsx";

        FileInputStream templateFile = new FileInputStream(new File(templateFilePath));
        wb = new XSSFWorkbook(templateFile);
        addSheet(wb, result);

        setExcelSheetCellValue(result, wb);

        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
        String mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=\" " + sdf.format(new Date()) + ".xlsx\"";
        response.setContentType(mimeType);
        response.setHeader(headerKey, headerValue);
        ServletOutputStream out = response.getOutputStream();
        wb.write(out);
        out.flush();
        out.close();
        wb.close();
    }

    private String getPickingListSql(@RequestBody List<Map> params) {
        StringBuilder sb = new StringBuilder();
        sb.append("SELECT * FROM a_huangliang_view_stock_mat_list ");
        for (int idx = 0; idx < params.size(); idx++) {
            String orderId = params.get(idx).get("order_id").toString();
            String machineId = params.get(idx).get("machine_id").toString();
            String woMTime = params.get(idx).get("wo_m_time").toString();
            String mMatTime = params.get(idx).get("m_mat_time").toString();
            if (idx == 0) {
                sb.append("WHERE ");
            } else {
                sb.append("OR ");
            }
            sb.append("(order_id ='" + orderId + "' AND machine_id ='" + machineId + "' AND wo_m_time ='" + woMTime + "' AND m_mat_time ='" + mMatTime + "' )");
        }
        return sb.toString();
    }

    private void setExcelSheetCellValue(List<Map> result, Workbook wb) {
        int currentSheetIdx = 0;

        // 8筆資料/分頁的單位數量
        int eightDataPerSheetUnit = 1;
        //一個分頁包含的table數量
        int tableInOneSheetNum = 8;
        int rowNum1 = 3;
        int rowNum2 = 5;

        for (int dataIdx = 0; dataIdx < result.size(); dataIdx++) {
            //判斷是否分sheet
            int currentDataNum = dataIdx + 1;
            double dataNumPerEightData = (double) currentDataNum / tableInOneSheetNum;

            if (dataNumPerEightData > eightDataPerSheetUnit) {
                eightDataPerSheetUnit = (int) Math.ceil(dataNumPerEightData);

                currentSheetIdx++;
                rowNum1 = 3;
                rowNum2 = 5;
            }

            Sheet sheet = wb.getSheetAt(currentSheetIdx);
            Map data = result.get(dataIdx);
            String poNo = data.get("po_no") == null ? "" : data.get("po_no").toString();
            String matId = data.get("mat_id") == null ? "" : data.get("mat_id").toString();
            String matColor = data.get("mat_color") == null ? "" : data.get("mat_color").toString();
            String productPid = data.get("product_pid") == null ? "" : data.get("product_pid").toString();
            String usePiece = data.get("use_piece") == null ? "" : data.get("use_piece").toString();
            String useRemark = data.get("use_remark") == null ? "" : data.get("use_remark").toString();
            String combinedPieceMark = (!usePiece.equals("") && !useRemark.equals("")) ? (usePiece + "," + useRemark) : (usePiece + useRemark);
            String supName = data.get("sup_name") == null ? "" : data.get("sup_name").toString();
            String shelfTime = data.get("shelf_time") == null ? "" : data.get("shelf_time").toString();
            String matOd = data.get("mat_od") == null ? "" : data.get("mat_od").toString();
            String reworkSize = data.get("rework_size") == null ? "" : data.get("rework_size").toString();
            String machineId = data.get("machine_id") == null ? "" : data.get("machine_id").toString();
            String orderId = data.get("order_id") == null ? "" : data.get("order_id").toString();
            String useQty = data.get("use_qty") == null ? "" : data.get("use_qty").toString();
            String location = data.get("location") == null ? "" : data.get("location").toString();
            String lotMark = data.get("lot_mark") == null ? "" : data.get("lot_mark").toString();
            String unit = data.get("unit") == null ? "" : data.get("unit").toString();
            String combinedLocationMark = (!location.equals("") && !lotMark.equals("")) ? (location + "," + lotMark) : (location + lotMark);
            Device device = Device.findFirst("device_id=?", machineId);
            String machineName = device.get("device_name").toString();

            Row row1 = sheet.getRow(rowNum1);
            row1.getCell(1).setCellValue(poNo);
            row1.getCell(2).setCellValue(matId);
            row1.getCell(3).setCellValue(matColor);
            row1.getCell(5).setCellValue(productPid);
            row1.getCell(6).setCellValue(combinedPieceMark);
            row1.getCell(8).setCellValue(supName);

            Row row2 = sheet.getRow(rowNum2);
            row2.getCell(1).setCellValue(shelfTime.substring(0, 10));
            row2.getCell(2).setCellValue(matOd);
            row2.getCell(3).setCellValue(reworkSize);
            sheet.getRow(rowNum2 - 1).getCell(4).setCellValue(machineName);
            row2.getCell(5).setCellValue(orderId);
            if (unit.equals("KG")) {
              row2.getCell(7).setCellValue(useQty);
            }
            row2.getCell(8).setCellValue(combinedLocationMark);
            rowNum1 = rowNum1 + 5;
            rowNum2 = rowNum2 + 5;
        }
    }

    static void addSheet(Workbook wb, List datas) {
        int sumSheetNum = (int) Math.ceil((double) datas.size() / 8);
        int exceptFirstSheetNum = sumSheetNum - 1;
        for (int sheetIdx = 0; sheetIdx < exceptFirstSheetNum; sheetIdx++) {
            wb.cloneSheet(0);
        }
        addPickingDate(wb, sumSheetNum);
    }

    static void addPickingDate(Workbook wb, int sumSheetNum) {

        String currentTime = sdf.format(new Date());
        XSSFFont font = (XSSFFont) wb.createFont();
        font.setFontHeight(10);
        font.setFontName("新細明體");

        for (int idx = 0; idx < sumSheetNum; idx++) {
            Sheet sheet = wb.getSheetAt(idx);
            Cell cell = sheet.getRow(41).createCell(9);
            CellStyle style = cell.getSheet().getWorkbook().createCellStyle();
            style.setFont(font);
            cell.setCellStyle(style);
            cell.setCellValue(currentTime);

        }
    }
}
