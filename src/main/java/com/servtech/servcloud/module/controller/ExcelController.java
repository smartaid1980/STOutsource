package com.servtech.servcloud.module.controller;

import com.google.gson.Gson;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.List;

/**
 * Created by Hubert
 * Datetime: 2015/8/11 下午 05:42
 */
@RestController
@RequestMapping("/excel")
public class ExcelController {

    private static final Logger log = LoggerFactory.getLogger(ExcelController.class);

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "download", method = RequestMethod.POST)
    public void download(@RequestParam(value = "data") String data, HttpServletResponse response) {
        Data excelData = new Gson().fromJson(data, Data.class);
        // keep memoryRowNum rows in memory, exceeding rows will be flushed to disk ，memoryRowNum 默认是100
        SXSSFWorkbook workbook = new SXSSFWorkbook(100);
        // whether to use gzip compression for temporary files 是否对刷新到磁盘上的临时文件进行压缩
        workbook.setCompressTempFiles(true);

        DataFormat dataFormat = workbook.createDataFormat();
        Sheet sheet = workbook.createSheet("Sheet1");

        // 標頭
        Row headerRow = sheet.createRow(0);
        for (int i = 0, size = excelData.header.size(); i < size; i++) {
            headerRow.createCell(i).setCellValue(excelData.header.get(i));
        }

        // Style
        CellStyle[] styles = new CellStyle[excelData.format.size()];
        for (int i = 0; i < excelData.format.size(); i++) {
            String format = excelData.format.get(i);
            styles[i] = workbook.createCellStyle();
            styles[i].setDataFormat(dataFormat.getFormat(format));
        }

        // 內容
        int rowIndex = 1;
        for (List<String> eachRow : excelData.matrix) {
            Row row = sheet.createRow(rowIndex++);
            int cellIndex = 0;
            for (int i = 0, size = eachRow.size(); i < size; i++) {
                Cell cell = row.createCell(cellIndex);
                String cellValue = eachRow.get(i);
                try {
                    if (excelData.format.get(i).equals("text")) {
                        cell.setCellValue(cellValue);
                    } else if (excelData.format.get(i).equals("0")) {
                        cell.setCellValue(Integer.parseInt(cellValue));
                    } else {
                        cell.setCellValue(Double.parseDouble(cellValue));
                    }
                    cell.setCellStyle(styles[i]);
                } catch (NumberFormatException e) {
                    cell.setCellValue(cellValue);
                }
                cellIndex++;
            }
        }

        setupResponseExcelHeader(response, excelData.fileName);

        try {
            workbook.write(response.getOutputStream());
        } catch (IOException e) {
            log.warn(excelData.fileName + "輸出失敗...", e);
            // 請繼續把後續處理好謝謝謝謝謝謝謝
            try {
                response.getWriter().write("alibuda");
            } catch (IOException e1) {
                e1.printStackTrace();
            }
        }
    }

    @RequestMapping(value = "fromTemplate", method = RequestMethod.POST)
    public void fromTemplate(@RequestParam(value = "data") String data, HttpServletResponse response) {
        DataForTemplate excelData = new Gson().fromJson(data, DataForTemplate.class);

        try {
            File template = new File(System.getProperty(SysPropKey.ROOT_PATH), "/WEB-INF/excel/" + excelData.templateName + ".xlsx");
            FileInputStream fis = new FileInputStream(template);
            XSSFWorkbook workbook = new XSSFWorkbook(fis);
            DataFormat dataFormat = workbook.createDataFormat();
            XSSFSheet sheet = workbook.getSheetAt(0);

            for (Matrix matrix : excelData.matrices) {
                int startRowIndex = matrix.y;
                int endRowIndex = matrix.y + matrix.data.size();
                int startColumnIndex = matrix.x;
                int endColumnIndex = matrix.x + matrix.format.size();

                // Style
                CellStyle[] styles = new CellStyle[matrix.format.size()];
                for (int i = 0; i < matrix.format.size(); i++) {
                    String format = matrix.format.get(i);
                    styles[i] = workbook.createCellStyle();
                    styles[i].setDataFormat(dataFormat.getFormat(format));
                }

                for (int rowIndex = startRowIndex; rowIndex < endRowIndex; rowIndex++) {
                    Row row = sheet.getRow(rowIndex);
                    if (row == null) {
                        row = sheet.createRow(rowIndex);
                    }

                    for (int columnIndex = startColumnIndex; columnIndex < endColumnIndex; columnIndex++) {

                        Cell cell = row.getCell(columnIndex);
                        if (cell == null) {
                            cell = row.createCell(columnIndex);
                        }

                        int x = rowIndex - startRowIndex,
                                y = columnIndex - startColumnIndex;

                        String cellValue = matrix.data.get(x).get(y);
                        try {
                          if (matrix.format.get(y).equals("text")) {
                              cell.setCellValue(cellValue);
                          } else if (matrix.format.get(y).equals("0")) {
                              cell.setCellValue(Integer.parseInt(cellValue));
                          } else {
                              cell.setCellValue(Double.parseDouble(cellValue));
                          }
                          cell.setCellStyle(styles[y]);
                        } catch (NumberFormatException e){
                          CellStyle style = workbook.createCellStyle();
                          style.setDataFormat(dataFormat.getFormat("text"));
                          cell.setCellValue(cellValue);
                          cell.setCellStyle(style);
                        }
                    }
                }
            }

            setupResponseExcelHeader(response, excelData.fileName);
            workbook.write(response.getOutputStream());

        } catch (IOException e) {
            log.warn(excelData.fileName + "上傳失敗...", e);
        }
    }

    private void setupResponseExcelHeader(HttpServletResponse response, String fileName) {
        try {
            String encodedFileName = URLEncoder.encode(fileName, "UTF-8");
            String mimeType = "application/octect-stream";
            String headerKey = "Content-Disposition";
            String headerValue = "attachment; filename=\"" + encodedFileName + ".xlsx\"";
            response.setContentType(mimeType);
            response.setHeader(headerKey, headerValue);
        } catch (UnsupportedEncodingException ex) {
            throw new RuntimeException(ex.getCause());
        }
    }

    private static class Data {
        List<List<String>> matrix;
        String fileName;
        List<String> header;
        List<String> format;
    }

    private static class DataForTemplate {
        private String templateName;
        private String fileName = "default";
        private List<Matrix> matrices;
    }

    private static class Matrix {
        private int x;
        private int y;
        private List<List<String>> data;
        private List<String> format;
    }

}
