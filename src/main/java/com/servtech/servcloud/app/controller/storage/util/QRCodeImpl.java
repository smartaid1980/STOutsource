package com.servtech.servcloud.app.controller.storage.util;

import com.servtech.servcloud.app.controller.servtrack.ServtrackManagementLineController;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.util.Units;
import org.apache.poi.xwpf.usermodel.*;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.UUID;

public class QRCodeImpl implements QRCode {
    public String FORM_ROOT_PATH = System.getProperty(SysPropKey.ROOT_PATH) + "/app/ServTrackManagement/program";
    public String FORM_TEMPLATE = FORM_ROOT_PATH + "/form.docx";
    public int DOCUMENT_IMG_SIZE = 33;

    public int CELL_TEXT_FONT_SMALL_SIZE = 4;
    public int CELL_TEXT_FONT_BIG_SIZE = 16;

    public int CELL_TEXT_FONT_SIZE = 0;
    public int MAX_ROW_NUMBER = 10;
    public int MAX_CELL_NUMBER = 5;
    public double QRCODE_EMU = 68.2;

    private XWPFDocument document = null;
    private FileInputStream input = null;
    private List<XWPFTable> tableList = null;
    private int tableIndex = 0;
    private int rowIndex = 0;
    private int cellIndex = 0;
    private String outputPath = null;
    private String tempSeq = null;

    XWPFTable table = null;
    XWPFTableCell cell = null;
    XWPFParagraph paragraph = null;
    XWPFRun r = null;
    FileInputStream imgInput = null;

    public QRCodeImpl genDoc(int total) {
        System.out.println("total : " + total);
        //最後產出來的文件路徑
        String path = "";
        //動態產生 暫存識別碼
        tempSeq = UUID.randomUUID().toString().replaceAll("-", "");
        File tempFolder = new File(FORM_ROOT_PATH, tempSeq);
        //沒有就建吧
        if (!tempFolder.exists()) {tempFolder.mkdirs();}
        try {
            int pageCount = 0;
            input = new FileInputStream(FORM_TEMPLATE);
            document = new XWPFDocument(input);
            XWPFTable module = document.getTables().get(0);
            outputPath = FORM_ROOT_PATH + "/" + tempSeq + ".docx";
            FileOutputStream output = new FileOutputStream(outputPath);
            if (total > DOCUMENT_IMG_SIZE) {
                pageCount = getPageCount(total);
                System.out.println("pageCount : " + pageCount);
                for (int i = 0; i < pageCount; i++) {
                    document.createTable();
                    document.setTable((i + 1), module);
                }
                document.write(output);
                output.close();
                input.close();
//                input = new FileInputStream(FORM_ROOT_PATH + "/" + tempSeq + "/" + tempSeq + ".docx");
                input = new FileInputStream(FORM_ROOT_PATH  + "/" + tempSeq + ".docx");
                document = new XWPFDocument(input);
            }
            tableList = document.getTables();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return this;
    }

    public QRCodeImpl addImg(int index, String imgInfo) {
        table = tableList.get(tableIndex);

        String imgPath = FORM_ROOT_PATH + "/" + tempSeq + "/" + index + ".png";
        ServtrackManagementLineController.QRcodeService.create(imgInfo, imgPath);
        cell = table.getRow(rowIndex).getCell(cellIndex);
        paragraph = cell.getParagraphs().get(0);
        r = paragraph.createRun();
        try {
            imgInput = new FileInputStream(imgPath);
            r.addPicture(imgInput, XWPFDocument.PICTURE_TYPE_PNG, imgPath, Units.toEMU(QRCODE_EMU), Units.toEMU(QRCODE_EMU));
            imgInput.close();
            cell = table.getRow(rowIndex).getCell(cellIndex += 1);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (InvalidFormatException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return this;
    }

    public QRCodeImpl addTexts(String ...texts) {
        cell.setVerticalAlignment(XWPFTableCell.XWPFVertAlign.TOP);
        paragraph = cell.getParagraphs().get(0);
        r = paragraph.createRun();
        r.setFontSize(CELL_TEXT_FONT_BIG_SIZE);
        for (String text : texts) {
            r.addBreak();
            r.setText(text);
        }
        return this;
    }

    public QRCodeImpl addDiffSizeTexts(String size ,String ...texts) {
        cell.setVerticalAlignment(XWPFTableCell.XWPFVertAlign.TOP);
        paragraph = cell.getParagraphs().get(0);
        r = paragraph.createRun();
        if(size.equals("small")){
            CELL_TEXT_FONT_SIZE = CELL_TEXT_FONT_SMALL_SIZE;
        }else{
            CELL_TEXT_FONT_SIZE = CELL_TEXT_FONT_BIG_SIZE;
        }
        r.setFontSize(CELL_TEXT_FONT_SIZE);
        for (String text : texts) {
            r.addBreak();
            r.setText(text);
        }
        return this;
    }

    public QRCodeImpl next(){
        if (cellIndex == MAX_CELL_NUMBER) {
            if (rowIndex == MAX_ROW_NUMBER) {
                tableIndex++;
                rowIndex = 0;
                cellIndex = 0;
            } else {
                rowIndex++;
                cellIndex = 0;
            }
        } else {
            cellIndex++;
        }
        return this;
    }
    public XWPFDocument getDocument() {
        return document;
    }

    public void write(HttpServletResponse response) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
            String mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            String headerKey = "Content-Disposition";
            String headerValue = "attachment; filename=\" " + sdf.format(new Date()) + ".docx\"";

            response.setContentType(mimeType);
            response.setHeader(headerKey, headerValue);
            ServletOutputStream out = null;
            out = response.getOutputStream();
            document.write(out);
            out.flush();
            out.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void delete() {
        try {
            input.close();
            File path = new File(FORM_ROOT_PATH, tempSeq);
            if (path.isDirectory()) {
                for (File file : path.listFiles()) {
                    file.delete();
                }
                path.delete();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public int getPageCount(int totalRecord) {
        int result = totalRecord / this.DOCUMENT_IMG_SIZE ;
        if (totalRecord % this.DOCUMENT_IMG_SIZE == 0) {
            result -=1;
        }
        return result;
    }
}
