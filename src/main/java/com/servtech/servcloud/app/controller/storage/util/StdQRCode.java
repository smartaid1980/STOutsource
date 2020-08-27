package com.servtech.servcloud.app.controller.storage.util;

import com.servtech.servcloud.app.controller.kuochuan_servtrack.KuoChuanEmpMaintainController;
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

public class StdQRCode {
    private static final String FORM_ROOT_PATH = System.getProperty(SysPropKey.ROOT_PATH) + "/app/ServTrackManagement/program";
    private static final String FORM_TEMPLATE = FORM_ROOT_PATH + "/form.docx";
    private static final int DOCUMENT_IMG_SIZE = 33;
    private static final int CELL_MAX = 5;
    private static final int ROW_MAN = 10;
    private static final int CELL_TEXT_FONT_SIZE = 8;

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

    public StdQRCode genDoc(int total) {
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
                for (int i = 0; i < pageCount; i++) {
                    document.createTable();
                    document.setTable((i + 1), module);
                }
                document.write(output);
                output.close();
                input.close();
                input = new FileInputStream(FORM_ROOT_PATH  + "/" + tempSeq + ".docx");
//                input = new FileInputStream(FORM_ROOT_PATH + "/" + tempSeq + "/" + tempSeq + ".docx");
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

    public StdQRCode addImg(int index, String imgInfo) {
        table = tableList.get(tableIndex);
        String imgPath = FORM_ROOT_PATH + "/" + tempSeq + "/" + index + ".png";
        ServtrackManagementLineController.QRcodeService.create(imgInfo, imgPath);
        cell = table.getRow(rowIndex).getCell(cellIndex);
        paragraph = cell.getParagraphs().get(0);
        r = paragraph.createRun();
        try {
            imgInput = new FileInputStream(imgPath);
            r.addPicture(imgInput, XWPFDocument.PICTURE_TYPE_PNG, imgPath, Units.toEMU(68.2), Units.toEMU(68.2));
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
    public StdQRCode addTexts(String ...texts) {
        cell.setVerticalAlignment(XWPFTableCell.XWPFVertAlign.TOP);
        paragraph = cell.getParagraphs().get(0);
        r = paragraph.createRun();
        r.setFontSize(CELL_TEXT_FONT_SIZE);
        for (String text : texts) {
            r.addBreak();
            r.setText(text);
        }
        return this;
    }

    public StdQRCode next() {

        if (cellIndex == 5) {
            if (rowIndex == 10) {
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


    public static int getPageCount(int totalRecord) {
        int result = totalRecord / DOCUMENT_IMG_SIZE;
        if (totalRecord % DOCUMENT_IMG_SIZE == 0) {
            result -=1;
        }
        return result;
    }
}
