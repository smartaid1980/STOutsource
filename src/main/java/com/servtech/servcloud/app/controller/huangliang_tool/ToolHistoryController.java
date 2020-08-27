package com.servtech.servcloud.app.controller.huangliang_tool;

import com.servtech.servcloud.app.model.huangliang_matStock.ProductProfile;
import com.servtech.servcloud.app.model.huangliang_tool.*;
import com.servtech.servcloud.app.model.huangliang.RepairCode;
import com.servtech.servcloud.app.model.huangliang_tool.view.ToolMpUseMpHistoryWoList;
import com.servtech.servcloud.app.model.huangliang_tool.view.ToolMpHistoryToolMpHisList;
import com.servtech.servcloud.app.model.huangliang_tool.view.ToolSpHistoryToolSpHisList;
import com.servtech.servcloud.app.model.huangliang_tool.view.ToolSpUseToolSpHistory;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.Device;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.servtech.servcloud.core.util.RequestResult.success;

@RestController
@RequestMapping("/huangliangTool/toolhistory")
public class ToolHistoryController {
    static SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    static SimpleDateFormat sdfDatetime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    // 10 _ 5.3.3 量產類領刀單管理-校車領刀單明細檢視_刀具履歷格式下載Excel
    @RequestMapping(value = "/excel", method = RequestMethod.POST)
    public RequestResult<?> downloadExcel(@RequestParam("data") final String jsonStr) {
        return ActiveJdbc.operTx(() -> {
            try {
                System.out.println("jsonStr : " + jsonStr);
                Map params = new Gson().fromJson(jsonStr, new TypeToken<HashMap>() {
                }.getType());
                Object isSample = params.get("isSample");
                Object tool_use_no = params.get("tool_use_no");
                Object tool_history_no = params.get("tool_history_no");
                Object useList = params.get("useList");
                returnExcelStream(tool_history_no, tool_use_no.toString(), isSample, useList);
            } catch (Exception e) {
                StringWriter sw = new StringWriter();
                e.printStackTrace(new PrintWriter(sw));
                System.out.println("Error : " + sw.toString());
                e.printStackTrace();
                return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
            }
            return success();
        });
    }

    @RequestMapping(value = "/updateToolMpHistory", method = RequestMethod.PUT)
    public RequestResult<?> updateToolMpHistory(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            try {
                
                String modify_by = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                String modify_time = sdfDatetime.format(new Date(System.currentTimeMillis()));
                Map toolMpHistory = (Map) data.get("toolMpHistory");
                String toolHistoryNo = toolMpHistory.get("tool_history_no").toString();
                List<Map> toolMpHisList = (List<Map>) data.get("toolMpHisList");
                ToolMpHistory toolMpHistoryModel = new ToolMpHistory();
                toolMpHistoryModel.fromMap(toolMpHistory);
                toolMpHistoryModel.set("modify_time", modify_time,
                  "modify_by", modify_by);
                if (toolMpHistoryModel.saveIt()) {
                    for (Map listData : toolMpHisList) {
                        ToolMpHisList toolMpHisListModel = new ToolMpHisList();
                        toolMpHisListModel.fromMap(listData);
                        toolMpHisListModel.set("modify_time", modify_time,
                          "modify_by", modify_by);
                        if (!toolMpHisListModel.saveIt()) {
                            throw new RuntimeException("update tool_mp_his_list is fail...");
                        }
                    }
                } else {
                    throw new RuntimeException("update tool_mp_history is fail...");
                }
                return success(ToolMpHistoryToolMpHisList.find("tool_history_no = ?", toolHistoryNo).toMaps());
            } catch (Exception e) {
                StringWriter sw = new StringWriter();
                e.printStackTrace(new PrintWriter(sw));
                System.out.println("Error : " + sw.toString());
                e.printStackTrace();
                return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
            }
        });
    }

    @RequestMapping(value = "/updateToolSpHistory", method = RequestMethod.PUT)
    public RequestResult<?> updateToolSpHistory(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            try {
                String modify_by = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                String modify_time = sdfDatetime.format(new Date(System.currentTimeMillis()));
                Map toolSpHistory = (Map) data.get("toolSpHistory");
                String toolHistoryNo = toolSpHistory.get("tool_history_no").toString();
                List<Map> toolSpHisList = (List<Map>) data.get("toolSpHisList");
                ToolSpHistory toolSpHistoryModel = new ToolSpHistory();
                toolSpHistoryModel.fromMap(toolSpHistory);
                toolSpHistoryModel.set("modify_time", modify_time,
                  "modify_by", modify_by);
                if (toolSpHistoryModel.saveIt()) {
                    for (Map listData : toolSpHisList) {
                        ToolSpHisList toolSpHisListModel = new ToolSpHisList();
                        toolSpHisListModel.fromMap(listData);
                        toolSpHisListModel.set("modify_time", modify_time,
                          "modify_by", modify_by);
                        if (!toolSpHisListModel.saveIt()) {
                            throw new RuntimeException("update tool_sp_his_list is fail...");
                        }
                    }
                } else {
                    throw new RuntimeException("update tool_sp_history is fail...");
                }
                return success(ToolSpHistoryToolSpHisList.find("tool_history_no = ?", toolHistoryNo).toMaps());
            } catch (Exception e) {
                StringWriter sw = new StringWriter();
                e.printStackTrace(new PrintWriter(sw));
                System.out.println("Error : " + sw.toString());
                e.printStackTrace();
                return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
            }
        });
    }

    private void returnExcelStream(Object tool_history_no, String tool_use_no, Object isSample, Object useList) throws IOException {
        Workbook wb;
        String templateFilePath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/HuangLiangToolSetting/program/template.xlsx";

        FileInputStream templateFile = new FileInputStream(new File(templateFilePath));
        wb = new XSSFWorkbook(templateFile);
        String sql = "";
        if (isSample == null || isSample.toString().equals("")) {
            sql = String.format("select sum(use_qty) as total_use_qty from a_huangliang_tool_mp_list where tool_use_no = '%s' AND uselist_status = 0", tool_use_no);
        } else {
            sql = String.format("select sum(use_qty) as total_use_qty from a_huangliang_tool_sp_list where tool_use_no = '%s' AND uselist_status = 0", tool_use_no);
        }
        List<Map> sum_use_qty = Base.findAll(sql);

        //取得寫入資料次數
        int dataSize = 0;
        if (sum_use_qty != null && sum_use_qty.size() != 0 && sum_use_qty.get(0).get("total_use_qty") != null) {
            dataSize = Integer.valueOf(sum_use_qty.get(0).get("total_use_qty").toString());
        }
        addSheet(wb, dataSize);
        if (isSample == null || isSample.toString().equals("")) {
            setExcelSheetCellValue(tool_history_no.toString(), tool_use_no, wb, useList);
        } else {
            setSampleExcelSheetCellValue(tool_history_no, tool_use_no, wb, useList);
        }
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
        String filename = tool_use_no + '-' + sdf.format(new Date());
        String mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=\" " + filename + ".xlsx\"";
        response.setContentType(mimeType);
        response.setHeader(headerKey, headerValue);
        ServletOutputStream out = response.getOutputStream();
        System.out.println("Start Write Response File..");
        wb.write(out);
        out.flush();
        out.close();
        wb.close();
    }

    private void setSampleExcelSheetCellValue(Object tool_history_no_obj, String tool_use_no, Workbook wb, Object useList) {
        System.out.println("Start Set Sample Excel..");
        int oneCellWriteCount = 0;
        boolean isFistWrite = true;
        int currentSheetIdx = 0;
        // 8筆資料/分頁的單位數量
        int twelveDataPerSheetUnit = 1;
        //一個分頁包含的table數量
        int tableInOneSheetNum = 12;
        int rowNum1 = 6;
        int rowNum2 = 12;
        int rowNum3 = 14;
        int rowNum4 = 16;

        int cellNum1 = 0;
        int cellNum2 = 2;

        int hasWriteCount = 0;
        String tool_history_no = "";
        String sample_id = "", sample_pid = "", main_chuck = "", second_chuck = "", machine_name = "", tool_ptime = "", program_name = "", create_time = "", mat_code = "";
        if (tool_history_no_obj != null) {
            tool_history_no = tool_history_no_obj.toString();
            ToolSpUseToolSpHistory view = ToolSpUseToolSpHistory.findFirst("tool_history_no = ?", tool_history_no);
            if (view != null) {
                sample_id = view.getString("sample_id");
                sample_pid = view.getString("sample_pid");
                main_chuck = view.getString("main_chuck");
                second_chuck = view.getString("second_chuck");
                machine_name = Device.findFirst("device_id = ?", view.getString("machine_id")).getString("device_name");
                tool_ptime = view.getString("tool_ptime");
                program_name = view.getString("program_name");
                create_time = view.getString("create_time").substring(0, 19);
                mat_code = ToolSpHistory.findFirst("tool_history_no = ?", tool_history_no).getString("mat_code");
            }
        } else {
            ToolSpUse toolSpUse = ToolSpUse.findFirst("tool_use_no = ?", tool_use_no);
            sample_id = toolSpUse.getString("sample_id");
            sample_pid = toolSpUse.getString("sample_pid");
            machine_name = Device.findFirst("device_id = ?", toolSpUse.getString("machine_id")).getString("device_name");
            create_time = toolSpUse.getString("create_time").substring(0, 19);
        }

        // List<ToolSpList> toolSpLists = ToolSpList.find("tool_use_no = ? AND uselist_status = 0", tool_use_no);
        List<Map> toolSpLists = (List<Map>) useList;
        Set<String> toolUseForList = new HashSet<>();
        for (Map toolSpList : toolSpLists) {
            toolUseForList.add(toolSpList.get("tool_use_for").toString());
        }
        Map<String, String> repairCodeMap = new HashMap<>();
        if (toolUseForList.size() > 0) {
          List<RepairCode> repairCode = RepairCode.find("repair_code IN (" + String.join(", ", toolUseForList) + ")");
          for (RepairCode code : repairCode) {
              repairCodeMap.put(code.getString("repair_code"), code.getString("repair_code_name"));
          }
        }
        if (toolSpLists.size() == 0) {
          Sheet sheet = wb.getSheetAt(currentSheetIdx);
          Row oneTimeRow1 = sheet.getRow(0);
          oneTimeRow1.getCell(0).setCellValue("領刀時間 " + create_time);
          oneTimeRow1.getCell(20).setCellValue(tool_history_no);

          Row oneTimeRow3 = sheet.getRow(3);
          oneTimeRow3.getCell(0).setCellValue("領刀單號:" + tool_use_no);

          Row oneTimeRow4 = sheet.getRow(4);
          oneTimeRow4.getCell(2).setCellValue(sample_pid);
          oneTimeRow4.getCell(8).setCellValue(main_chuck);
          oneTimeRow4.getCell(12).setCellValue(machine_name);
          oneTimeRow4.getCell(16).setCellValue(program_name);

          Row oneTimeRow5 = sheet.getRow(5);
          oneTimeRow5.getCell(2).setCellValue(sample_id);
          oneTimeRow5.getCell(8).setCellValue(second_chuck);
          oneTimeRow5.getCell(12).setCellValue(tool_ptime);
          oneTimeRow5.getCell(16).setCellValue(mat_code);
        }

        for (int dataIdx = 0; dataIdx < toolSpLists.size(); dataIdx++) {
            //領刀數量是多少就要寫入幾次...
            int use_qty = (int) Double.parseDouble(toolSpLists.get(dataIdx).get("use_qty").toString());
            for (int writeCount = 0; writeCount < use_qty; writeCount++) {

                //判斷是否分sheet
                int currentDataNum = hasWriteCount + 1;
                double dataNumPerTwelveData = (double) currentDataNum / tableInOneSheetNum;

                if (dataNumPerTwelveData > twelveDataPerSheetUnit) {
                    twelveDataPerSheetUnit = (int) Math.ceil(dataNumPerTwelveData);

                    currentSheetIdx++;
                    rowNum1 = 6;
                    rowNum2 = 12;
                    rowNum3 = 14;
                    rowNum4 = 16;

                    cellNum1 = 0;
                    cellNum2 = 2;
                }

                Sheet sheet = wb.getSheetAt(currentSheetIdx);

                if (isFistWrite) {
                    Row oneTimeRow1 = sheet.getRow(0);
                    oneTimeRow1.getCell(0).setCellValue("領刀時間 " + create_time);
                    oneTimeRow1.getCell(20).setCellValue(tool_history_no);

                    Row oneTimeRow3 = sheet.getRow(3);
                    oneTimeRow3.getCell(0).setCellValue("領刀單號:" + tool_use_no);

                    Row oneTimeRow4 = sheet.getRow(4);
                    oneTimeRow4.getCell(2).setCellValue(sample_pid);
                    oneTimeRow4.getCell(8).setCellValue(main_chuck);
                    oneTimeRow4.getCell(12).setCellValue(machine_name);
                    oneTimeRow4.getCell(16).setCellValue(program_name);

                    Row oneTimeRow5 = sheet.getRow(5);
                    oneTimeRow5.getCell(2).setCellValue(sample_id);
                    oneTimeRow5.getCell(8).setCellValue(second_chuck);
                    oneTimeRow5.getCell(12).setCellValue(tool_ptime);
                    oneTimeRow5.getCell(16).setCellValue(mat_code);
                }

                String uselist_remark = toolSpLists.get(dataIdx).get("uselist_remark").toString().equals("") ? " " : toolSpLists.get(dataIdx).get("uselist_remark").toString();
                String life_remark = toolSpLists.get(dataIdx).get("life_remark").toString().equals("") ? " " : toolSpLists.get(dataIdx).get("life_remark").toString();
                String tool_use_for = toolSpLists.get(dataIdx).get("tool_use_for").toString();
                String tsup_id = toolSpLists.get(dataIdx).get("tsup_id").toString();
                String tsup_name = ToolSupplier.findFirst("tsup_id = ?", tsup_id).getString("tsup_name");
                // String tool_id = toolSpLists.get(dataIdx).get("tool_id").toString();
                // String tool_spec = ToolProfile.findFirst("tool_id = ?", tool_id).getString("tool_spec");
                String tool_spec = toolSpLists.get(dataIdx).get("tool_spec").toString();

                Row row1 = sheet.getRow(rowNum1);
                row1.getCell(cellNum1).setCellValue(uselist_remark + "\n" + life_remark);

                Row row2 = sheet.getRow(rowNum2);
                row2.getCell(cellNum2).setCellValue(repairCodeMap.get(tool_use_for));

                Row row3 = sheet.getRow(rowNum3);
                row3.getCell(cellNum2).setCellValue(tsup_name);

                Row row4 = sheet.getRow(rowNum4);
                row4.getCell(cellNum2).setCellValue(tool_spec);

                cellNum1 += 5;
                cellNum2 += 5;
                oneCellWriteCount++;

                //每列寫3次後要換列
                if (oneCellWriteCount == 3) {
                    rowNum1 = rowNum1 + 12;
                    rowNum2 = rowNum2 + 12;
                    rowNum3 = rowNum3 + 12;
                    rowNum4 = rowNum4 + 12;

                    cellNum1 = 0;
                    cellNum2 = 2;
                    oneCellWriteCount = 0;
                }
                hasWriteCount++;
            }
        }
    }

    private void setExcelSheetCellValue(String tool_history_no, String tool_use_no, Workbook wb, Object useList) {

        ToolMpUseMpHistoryWoList view = ToolMpUseMpHistoryWoList.findFirst("tool_history_no = ?", tool_history_no);
        if (view != null) {
            String product_id = view.getString("product_id");
            String product_pid = view.getString("product_pid");
            String main_chuck = view.getString("main_chuck");
            String second_chuck = view.getString("second_chuck");
            String machine_name = Device.findFirst("device_id = ?", view.getString("machine_id")).getString("device_name");
            String tool_ptime = view.getString("tool_ptime");
            String program_name = view.getString("program_name");
            String create_time = view.getString("create_time").substring(0, 19);
//            String work_by = view.getString("work_by");
            String order_id = view.getString("order_id");
//            String mstock_name = order_id.substring(0, 1).equals("G") ? "GOLF" : "五金";
//            String process = ProductProfile.findFirst("mstock_name = ? and product_id = ?",mstock_name, product_id).getString("process");
            String mat_code = ToolMpHistory.findFirst("tool_history_no = ?", tool_history_no).getString("mat_code");

            int oneCellWriteCount = 0;
            boolean isFistWrite = true;
            int currentSheetIdx = 0;
            // 8筆資料/分頁的單位數量
            int twelveDataPerSheetUnit = 1;
            //一個分頁包含的table數量
            int tableInOneSheetNum = 12;
            int rowNum1 = 6;
            int rowNum2 = 12;
            int rowNum3 = 14;
            int rowNum4 = 16;

            int cellNum1 = 0;
            int cellNum2 = 2;

            int hasWriteCount = 0;
            // List<ToolMpList> toolMpLists = ToolMpList.find("tool_use_no = ? AND uselist_status = 0", tool_use_no);
            List<Map> toolMpLists = (List<Map>) useList;
            Set<String> toolUseForList = new HashSet<>();
            for (Map toolMpList : toolMpLists) {
                toolUseForList.add(toolMpList.get("tool_use_for").toString());
            }
            Map<String, String> repairCodeMap = new HashMap<>();
            if (toolUseForList.size() > 0) {
              List<RepairCode> repairCode = RepairCode.find("repair_code IN (" + String.join(", ", toolUseForList) + ")");
              for (RepairCode code : repairCode) {
                  repairCodeMap.put(code.getString("repair_code"), code.getString("repair_code_name"));
              }
            }
            if (toolMpLists.size() == 0) {
              Sheet sheet = wb.getSheetAt(currentSheetIdx);
              Row oneTimeRow1 = sheet.getRow(0);
              oneTimeRow1.getCell(0).setCellValue("領刀時間 " + create_time);
              oneTimeRow1.getCell(20).setCellValue(tool_history_no);

              Row oneTimeRow2 = sheet.getRow(2);
              oneTimeRow2.getCell(0).setCellValue(order_id);

              Row oneTimeRow3 = sheet.getRow(3);
              oneTimeRow3.getCell(0).setCellValue("領刀單號:" + tool_use_no);

              Row oneTimeRow4 = sheet.getRow(4);
              oneTimeRow4.getCell(2).setCellValue(product_pid);
              oneTimeRow4.getCell(8).setCellValue(main_chuck);
              oneTimeRow4.getCell(12).setCellValue(machine_name);
              oneTimeRow4.getCell(16).setCellValue(program_name);
//                        oneTimeRow3.getCell(20).setCellValue(work_by);

              Row oneTimeRow5 = sheet.getRow(5);
              oneTimeRow5.getCell(2).setCellValue(product_id);
              oneTimeRow5.getCell(8).setCellValue(second_chuck);
              oneTimeRow5.getCell(12).setCellValue(tool_ptime);
              oneTimeRow5.getCell(16).setCellValue(mat_code);
            }
            for (int dataIdx = 0; dataIdx < toolMpLists.size(); dataIdx++) {
                //領刀數量是多少就要寫入幾次...
                int use_qty = (int) Double.parseDouble(toolMpLists.get(dataIdx).get("use_qty").toString());
                for (int writeCount = 0; writeCount < use_qty; writeCount++) {

                    //判斷是否分sheet
                    int currentDataNum = hasWriteCount + 1;
                    double dataNumPerTwelveData = (double) currentDataNum / tableInOneSheetNum;

                    if (dataNumPerTwelveData > twelveDataPerSheetUnit) {
                        twelveDataPerSheetUnit = (int) Math.ceil(dataNumPerTwelveData);

                        currentSheetIdx++;
                        rowNum1 = 6;
                        rowNum2 = 12;
                        rowNum3 = 14;
                        rowNum4 = 16;

                        cellNum1 = 0;
                        cellNum2 = 2;
                    }

                    Sheet sheet = wb.getSheetAt(currentSheetIdx);

                    if (isFistWrite) {
                        Row oneTimeRow1 = sheet.getRow(0);
                        oneTimeRow1.getCell(0).setCellValue("領刀時間 " + create_time);
                        oneTimeRow1.getCell(20).setCellValue(tool_history_no);

                        Row oneTimeRow2 = sheet.getRow(2);
                        oneTimeRow2.getCell(0).setCellValue(order_id);

                        Row oneTimeRow3 = sheet.getRow(3);
                        oneTimeRow3.getCell(0).setCellValue("領刀單號:" + tool_use_no);

                        Row oneTimeRow4 = sheet.getRow(4);
                        oneTimeRow4.getCell(2).setCellValue(product_pid);
                        oneTimeRow4.getCell(8).setCellValue(main_chuck);
                        oneTimeRow4.getCell(12).setCellValue(machine_name);
                        oneTimeRow4.getCell(16).setCellValue(program_name);
//                        oneTimeRow3.getCell(20).setCellValue(work_by);

                        Row oneTimeRow5 = sheet.getRow(5);
                        oneTimeRow5.getCell(2).setCellValue(product_id);
                        oneTimeRow5.getCell(8).setCellValue(second_chuck);
                        oneTimeRow5.getCell(12).setCellValue(tool_ptime);
                        oneTimeRow5.getCell(16).setCellValue(mat_code);
//                        oneTimeRow4.getCell(20).setCellValue(process);
                    }

//                    String uselist_remark = toolMpLists.get(dataIdx).getString("uselist_remark")==null?"":toolMpLists.get(dataIdx).getString("uselist_remark");
//                    String life_remark = toolMpLists.get(dataIdx).getString("life_remark")==null?"":toolMpLists.get(dataIdx).getString("life_remark");
                    String uselist_remark = toolMpLists.get(dataIdx).get("uselist_remark").toString().equals("") ? " " : toolMpLists.get(dataIdx).get("uselist_remark").toString();
                    String life_remark = toolMpLists.get(dataIdx).get("life_remark").toString().equals("") ? " " : toolMpLists.get(dataIdx).get("life_remark").toString();
                    String tool_use_for = toolMpLists.get(dataIdx).get("tool_use_for").toString();
                    String tsup_id = toolMpLists.get(dataIdx).get("tsup_id").toString();
                    String tsup_name = ToolSupplier.findFirst("tsup_id = ?", tsup_id).getString("tsup_name");
                    // String tool_id = toolMpLists.get(dataIdx).get("tool_id").toString();
                    // String tool_spec = ToolProfile.findFirst("tool_id = ?", tool_id).getString("tool_spec");
                    String tool_spec = toolMpLists.get(dataIdx).get("tool_spec").toString();

                    Row row1 = sheet.getRow(rowNum1);
//                    CellStyle cs = wb.createCellStyle();
//                    cs.setWrapText(true);
//                    row1.getCell(cellNum1).setCellStyle(cs);
                    row1.getCell(cellNum1).setCellValue(uselist_remark + "\n" + life_remark);
//                    row1.getCell(cellNum1).setCellValue("uselist_remark"+"\n"+"life_remark");
                    // System.out.println("cellNum2 : "+ cellNum2);
                    Row row2 = sheet.getRow(rowNum2);
                    row2.getCell(cellNum2).setCellValue(repairCodeMap.get(tool_use_for));

                    Row row3 = sheet.getRow(rowNum3);
                    row3.getCell(cellNum2).setCellValue(tsup_name);

                    Row row4 = sheet.getRow(rowNum4);
                    row4.getCell(cellNum2).setCellValue(tool_spec);

                    cellNum1 += 5;
                    cellNum2 += 5;
                    oneCellWriteCount++;

                    //每列寫3次後要換列
                    if (oneCellWriteCount == 3) {
                        rowNum1 = rowNum1 + 12;
                        rowNum2 = rowNum2 + 12;
                        rowNum3 = rowNum3 + 12;
                        rowNum4 = rowNum4 + 12;

                        cellNum1 = 0;
                        cellNum2 = 2;
                        oneCellWriteCount = 0;
                    }
                    hasWriteCount++;
                }
            }
        }
    }

    static void addSheet(Workbook wb, int datas) {
        // System.out.println("datas : " + datas);
        int sumSheetNum = (int) Math.ceil((double) datas / 12);
        int exceptFirstSheetNum = sumSheetNum - 1;
        for (int sheetIdx = 0; sheetIdx < exceptFirstSheetNum; sheetIdx++) {
            wb.cloneSheet(0);
        }
        // System.out.println("sumSheetNum : " + sumSheetNum);
//        addPickingDate(wb, sumSheetNum);
    }

    static void addPickingDate(Workbook wb, int sumSheetNum) {

        String currentTime = sdf.format(new Date());
        XSSFFont font = (XSSFFont) wb.createFont();
        font.setFontHeight(12);
        font.setFontName("新細明體");

        for (int idx = 0; idx < sumSheetNum; idx++) {
            Sheet sheet = wb.getSheetAt(idx);
            Cell cell = sheet.getRow(54).createCell(21);
            CellStyle style = cell.getSheet().getWorkbook().createCellStyle();
            style.setFont(font);
            cell.setCellStyle(style);
            cell.setCellValue(currentTime);
        }
    }
}
