package com.servtech.servcloud.app.controller.huangliang;

import com.google.gson.Gson;
import com.servtech.hippopotamus.Atom;
import com.servtech.hippopotamus.Hippo;
import com.servtech.hippopotamus.SimpleExhalable;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.controller.ExcelController;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Eric Peng on 2018/9/25.
 */
@RestController
@RequestMapping("/huangliangExcel")
public class HuangliangDowntimeExcelDownload {

    private static final Logger log = LoggerFactory.getLogger(HuangliangDowntimeExcelDownload.class);
    DecimalFormat doubleFormat = new DecimalFormat("0.00%");
    Map<String, String> machineMap;

    @RequestMapping(value = "/download", method = RequestMethod.POST)
    public void download(@RequestParam String data, HttpServletResponse response) {
        Map excelData = new Gson().fromJson(data, Map.class);
        List<String> machineList = (List<String>) excelData.get("machineList");
        List<String> workShift = (List<String>) excelData.get("workShift");
        log.info(machineList.toString());
        Map<String, String> workerMap = (Map<String, String>) excelData.get("workerMap");
        Map<String, String> codeMap = (Map<String, String>) excelData.get("codeMap");
        machineMap = (Map<String, String>) excelData.get("machineMap");
        String start = ((String) excelData.get("start")).replace("/", "");
        String end = ((String) excelData.get("end")).replace("/", "");
        log.info("start: " + start + " end: " + end);


        Hippo hippo = HippoService.getInstance();
        Map<GroupObj, GroupObj> groupObjLongMap = new HashMap<>();
        Map<String, ArrayList<GroupObj>> machineGroup = new HashMap<>();
        try {
            // 取資料做處理
            SimpleExhalable simpleExhalable = hippo.newSimpleExhaler().space("downtime_analysis")
                    .index("machine_id", machineList.toArray())
                    .index("work_shift_name", workShift.toArray())
                    .indexRange("date", start, end)
                    .columns("machine_id", "m521", "m522", "duration")
                    .exhale().get();

            for (Map<String, Atom> raw : simpleExhalable.toMapping()) {
                GroupObj groupObj = new GroupObj(raw);
                Double duration = raw.get("duration").asDouble();
                if (groupObjLongMap.containsKey(groupObj)) {
                    GroupObj temp = groupObjLongMap.get(groupObj);
                    temp.duration += duration / 60000;
                } else {
                    groupObjLongMap.put(groupObj, groupObj);
                }
            }

            for (Map.Entry<GroupObj, GroupObj> map : groupObjLongMap.entrySet()) {
                String machine = map.getValue().machine_id;
                if (machineGroup.containsKey(machine)) {
                    machineGroup.get(machine).add(map.getValue());
                } else {
                    ArrayList<GroupObj> temp = new ArrayList<>();
                    temp.add(map.getValue());
                    machineGroup.put(machine, temp);
                }
            }
            // 輸出成excel
            try {
                File template = new File(System.getProperty(SysPropKey.ROOT_PATH), "/WEB-INF/excel/HuangLiangDowntimeReportAll.xlsx");
                FileInputStream fis = new FileInputStream(template);
                XSSFWorkbook workbook = new XSSFWorkbook(fis);
                DataFormat dataFormat = workbook.createDataFormat();
                XSSFSheet sheet = workbook.getSheetAt(0);
                int rowIndex = 2;
                // 前處理
                Row initRow = getRow(sheet, 1);
                getCell(initRow, 15).setCellType(Cell.CELL_TYPE_FORMULA);
                getCell(initRow, 15).setCellFormula("SUM(J$3:J$10000)/60/24");
                getCell(initRow, 16).setCellType(Cell.CELL_TYPE_FORMULA);
                getCell(initRow, 16).setCellFormula("SUM(K$3:K$10000)/60/24");
                getCell(initRow, 17).setCellType(Cell.CELL_TYPE_FORMULA);
                getCell(initRow, 17).setCellFormula("SUM(L$3:L$10000)/60/24");

                getCell(initRow, 18).setCellType(Cell.CELL_TYPE_FORMULA);
                getCell(initRow, 18).setCellFormula("SUM(M$3:M$10000)/60/24");
                getCell(initRow, 19).setCellType(Cell.CELL_TYPE_FORMULA);
                getCell(initRow, 19).setCellFormula("SUM(N$3:N$10000)/60/24");
                getCell(initRow, 20).setCellType(Cell.CELL_TYPE_FORMULA);
                getCell(initRow, 20).setCellFormula("SUM(O$3:O$10000)/60/24");
                // 真的來
                for (Map.Entry<String, ArrayList<GroupObj>> map : machineGroup.entrySet()) {
                    Double total = 0.0;
                    for (GroupObj obj : map.getValue()) {
                        total += obj.duration;
                    }
                    for (GroupObj obj : map.getValue()) {
                        Row row = getRow(sheet, rowIndex);
                        getCell(row, 0).setCellValue(getMachineName(obj.machine_id));
                        getCell(row, 1).setCellValue(obj.m521);
                        if (workerMap.containsKey(obj.m521)) {
                            getCell(row, 2).setCellValue(workerMap.get(obj.m521));
                        }
                        getCell(row, 3).setCellValue(obj.m522);
                        if (codeMap.containsKey(obj.m522)) {
                            getCell(row, 4).setCellValue(codeMap.get(obj.m522));
                        }
                        getCell(row, 5).setCellValue(obj.duration);
                        getCell(row, 6).setCellValue(fixed2(obj.duration / total));
                        getCell(row, 9).setCellType(Cell.CELL_TYPE_FORMULA);
                        getCell(row, 9).setCellFormula("IF(D:D=\"101\",F:F,\"\")");
                        getCell(row, 9).setCellStyle(getStyleFillColor(HSSFColor.LIGHT_YELLOW.index, workbook));
                        getCell(row, 10).setCellType(Cell.CELL_TYPE_FORMULA);
                        getCell(row, 10).setCellFormula("IF(D:D=\"206\",F:F,\"\")");
                        getCell(row, 10).setCellStyle(getStyleFillColor(HSSFColor.LIGHT_TURQUOISE.index, workbook));
                        getCell(row, 11).setCellType(Cell.CELL_TYPE_FORMULA);
                        getCell(row, 11).setCellFormula("IF(D:D=\"103\",F:F,\"\")");
                        getCell(row, 11).setCellStyle(getStyleFillColor(HSSFColor.LIGHT_GREEN.index, workbook));

                        getCell(row, 12).setCellType(Cell.CELL_TYPE_FORMULA);
                        getCell(row, 12).setCellFormula("IF(D:D=\"300\",F:F,\"\")");
                        getCell(row, 12).setCellStyle(getStyleFillColor(HSSFColor.GREY_25_PERCENT.index, workbook));
                        getCell(row, 13).setCellType(Cell.CELL_TYPE_FORMULA);
                        getCell(row, 13).setCellFormula("IF(D:D=\"301\",F:F,\"\")");
                        getCell(row, 13).setCellStyle(getStyleFillColor(HSSFColor.TAN.index, workbook));
                        getCell(row, 14).setCellType(Cell.CELL_TYPE_FORMULA);
                        getCell(row, 14).setCellFormula("IF(D:D=\"304\",F:F,\"\")");
                        getCell(row, 14).setCellStyle(getStyleFillColor(HSSFColor.LEMON_CHIFFON.index, workbook));

                        rowIndex++;
                    }
                    rowIndex++;
                }

                setupResponseExcelHeader(response, "HuangLiangDowntimeReportAll_" + start + "_" + end);
                workbook.write(response.getOutputStream());
            } catch (IOException e) {
                e.printStackTrace();
            }

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
    }

    private Cell getCell(Row row, int columnIndex) {
        Cell cell = row.getCell(columnIndex);
        if (cell == null) {
            cell = row.createCell(columnIndex);
        }
        return cell;
    }

    private Row getRow(XSSFSheet sheet, int rowIndex) {
        Row row = sheet.getRow(rowIndex);
        if (row == null) {
            row = sheet.createRow(rowIndex);
        }
        return row;
    }

    private CellStyle getStyleFillColor(short index, XSSFWorkbook workbook) {
        CellStyle temp = workbook.createCellStyle();
        temp.setFillForegroundColor(index);
        temp.setFillPattern(CellStyle.SOLID_FOREGROUND);
        return temp;
    }

    private String fixed2(Double a) {
        return doubleFormat.format(a);
    }

    private String getMachineName(String id) {
        if (machineMap != null && machineMap.containsKey(id)) {
            return machineMap.get(id);
        } else {
            return id;
        }
    }

    private void setupResponseExcelHeader(HttpServletResponse response, String fileName) {
        String mimeType = "application/octect-stream";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=\"" + fileName + ".xlsx\"";
        response.setContentType(mimeType);
        response.setHeader(headerKey, headerValue);
    }

    class GroupObj {
        String machine_id;
        String m521;
        String m522;
        Double duration;


        GroupObj(Map<String, Atom> map) {
            this.machine_id = map.get("machine_id").asString();
            this.m521 = map.get("m521").asString();
            this.m522 = map.get("m522").asString();
            this.duration = map.get("duration").asDouble() / 60000;
        }

        @Override
        public int hashCode() {
//            String hash = String.valueOf(machine_id.hashCode()) + String.valueOf(m521.hashCode()) + String.valueOf(m522.hashCode());
            return machine_id.hashCode() + m521.hashCode() + m522.hashCode();
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (obj == null || getClass() != obj.getClass()) return false;
            return ((GroupObj) obj).m521.equals(m521) && ((GroupObj) obj).m522.equals(m522) && ((GroupObj) obj).machine_id.equals(machine_id);
        }
    }
}
