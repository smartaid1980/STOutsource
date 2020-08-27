package com.servtech.servcloud.app.controller.iiot;

import com.google.zxing.*;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.qrcode.QRCodeReader;
import com.google.zxing.qrcode.QRCodeWriter;
import com.servtech.servcloud.app.controller.chengshiu.ChengShiuAlertLog;
import com.servtech.servcloud.app.model.iiot.IiotTool;
import com.servtech.servcloud.app.model.iiot.IiotToolErpSync;
import com.servtech.servcloud.app.model.iiot.IiotToolHolderList;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.util.Units;
import org.apache.poi.xwpf.usermodel.*;
import org.javalite.activejdbc.Base;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.awt.image.BufferedImage;
import java.io.*;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Jenny on 2017/11/24.
 */
@RestController
@RequestMapping("/iiot/tool/management")
public class IiotToolManagementController {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(ChengShiuAlertLog.class);
    final String syncErpBatPath = "C:/Servtech/Servolution/Platform/IiotToolErpSync";
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/batch-create-tool", method = RequestMethod.POST)
    public RequestResult<?> batchCreateTool(@RequestBody final Map data) {
        String toolCode = data.get("tool_code").toString();
        String toolSpec = data.get("tool_spec").toString();
        String toolType = data.get("tool_type").toString();
        String useLifeHr = data.get("use_life_hr").toString().equals("") ? "0" : data.get("use_life_hr").toString();
        String alarmLifeHr = data.get("alarm_life_hr").toString().equals("") ? "0" : data.get("alarm_life_hr").toString();
        String workSum = data.get("work_sum").toString();
        String toolStatus = data.get("tool_status").toString();
        String isOpen = data.get("is_open").toString();
        int createToolNumber = Integer.parseInt(data.get("create_holder_number").toString());
        String insertSql = "INSERT INTO a_iiot_tool " +
                "(tool_id, tool_code, tool_spec, tool_type, use_life_hr, alarm_life_hr, work_sum, tool_status, is_open, create_by, create_time, modify_by, modify_time) " +
                "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)";

        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    String user = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    Timestamp curerntTime = new Timestamp(System.currentTimeMillis());
                    SimpleDateFormat sdf = new SimpleDateFormat("yyMMdd");
                    String currnetDate = sdf.format(new Date());
                    String querySql = "SELECT * FROM a_iiot_tool WHERE tool_code = '" + toolCode + "' " +
                            "AND tool_id LIKE '%_" + currnetDate + "%' order by tool_id desc limit 1";
                    List<Map> toolList = IiotTool.findBySQL(querySql).toMaps();
                    String toolIdForOneRecord = null;
                    try {
                        Base.openTransaction();
                        PreparedStatement ps = Base.startBatch(insertSql);

                        if (toolList.size() == 0) {
                            for (int i = 1; i <= createToolNumber; i++) {
                                String toolId = toolCode + "_" + currnetDate + String.format("%03d", i);
                                toolIdForOneRecord = toolId;
                                Base.addBatch(ps, toolId, toolCode, toolSpec, toolType, useLifeHr, alarmLifeHr, workSum, toolStatus, isOpen, user, curerntTime, user, curerntTime);
                            }
                        } else {
                            String lastToolIdStr = toolList.get(0).get("tool_id").toString();
                            int lastToolIdNumber = Integer.parseInt(lastToolIdStr.substring(lastToolIdStr.length() - 3, lastToolIdStr.length()));
                            int initNumber = lastToolIdNumber + 1;
                            int maxNumber = initNumber + createToolNumber;
                            for (int i = initNumber; i < maxNumber; i++) {
                                String toolId = toolCode + "_" + currnetDate + String.format("%03d", i);
                                toolIdForOneRecord = toolId;
                                Base.addBatch(ps, toolId, toolCode, toolSpec, toolType, useLifeHr, alarmLifeHr, workSum, toolStatus, isOpen, user, curerntTime, user, curerntTime);
                            }
                        }
                        Base.executeBatch(ps);
                        ps.close();
                        Base.commitTransaction();

                    } catch (Exception e) {
                        e.printStackTrace();
                        Base.rollbackTransaction();
                        return fail("新增失敗...");
                    }
                    return success(toolIdForOneRecord);
                }
            });
        } catch (Exception e) {
            return fail("新增失敗...");
        }
    }

    @RequestMapping(value = "/batch-create-holder", method = RequestMethod.POST)
    public RequestResult<?> batchCreateHolder(@RequestBody final Map data) {
        String holderCode = data.get("holder_code").toString();
        String deptId = data.get("dept_id").toString();
        String isOpen = data.get("is_open").toString();
        int createHolderNumber = Integer.parseInt(data.get("create_holder_number").toString());
        String insertSql = "INSERT INTO a_iiot_tool_holder_list " +
                "(holder_id, dept_id, holder_code, is_open, create_by, create_time, modify_by, modify_time) " +
                "VALUES(?,?,?,?,?,?,?,?)";
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    String user = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    Timestamp curerntTime = new Timestamp(System.currentTimeMillis());

                    List<Map> holderList = IiotToolHolderList.find("holder_code = ? AND dept_id = ? order by holder_id desc limit 1", holderCode, deptId).toMaps();

                    try {
                        Base.openTransaction();
                        PreparedStatement ps = Base.startBatch(insertSql);

                        if (holderList.size() == 0) {
                            for (int i = 1; i <= createHolderNumber; i++) {
                                String holderId = deptId + ":" + holderCode + String.format("%03d", i);
                                Base.addBatch(ps, holderId, deptId, holderCode, isOpen, user, curerntTime, user, curerntTime);
                            }
                        } else {
                            String lastHolderId = holderList.get(0).get("holder_id").toString();
                            int lastIndex = holderList.get(0).get("holder_id").toString().length();
                            int lastHolderIdNumber = Integer.parseInt(lastHolderId.substring((lastIndex -3), lastIndex));
                            int initNumber = lastHolderIdNumber + 1;
                            int maxNumber = initNumber + createHolderNumber;
                            for (int i = initNumber; i < maxNumber; i++) {
                                String holderId = deptId + ":" + holderCode + String.format("%03d", i);
                                Base.addBatch(ps, holderId, deptId, holderCode, isOpen, user, curerntTime, user, curerntTime);
                            }
                        }
                        Base.executeBatch(ps);
                        ps.close();
                        Base.commitTransaction();

                    } catch (Exception e) {
                        e.printStackTrace();
                        Base.rollbackTransaction();
                        return fail("新增失敗...");
                    }
                    return success("create success");
                }
            });
        } catch (Exception e) {
            return fail("新增失敗...");
        }
    }


    @RequestMapping(value = "/syncErp", method = RequestMethod.GET)
    public RequestResult<?> syncErp() {
        String[] commands = new String[]{"cmd", "/c", "start", "run.bat"};
        RunCmd runCmd = new RunCmd(commands, null, new File(syncErpBatPath));
        runCmd.exec();

        return success("success");

    }

    @RequestMapping(value = "/getToolErpSync", method = RequestMethod.GET)
    public RequestResult<?> getToolErpSync(@RequestParam("tooltype") final String toolType, @RequestParam("toolcode") final String toolCode) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_iiot_tool_erp_sync ");
                if (!"".equals(toolType) || !"".equals(toolCode)) {
                    sb.append("WHERE ");
                    if (!"".equals(toolType) && "".equals(toolCode)) {
                        sb.append("tool_type = '" + toolType + "' ");
                    }

                    if (!"".equals(toolCode) && "".equals(toolType)) {
                        sb.append("tool_code = '" + toolCode + "' ");
                    }

                    if (!"".equals(toolCode) && !"".equals(toolType)) {
                        sb.append("tool_type = '" + toolType + "' ");
                        sb.append("And ");
                        sb.append("tool_code = '" + toolCode + "' ");
                    }
                }

                List<Map> result = IiotToolErpSync.findBySQL(sb.toString()).toMaps();
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/updateTool", method = RequestMethod.PUT)
    public RequestResult<?> updateTool(@RequestBody final Map data) {
        String toolId = data.get("tool_id").toString();
        String useLifeHr = data.get("use_life_hr").toString();
        String alarmLifeHr = data.get("alarm_life_hr").toString();
        String isOpen = data.get("is_open").toString();

        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                Map map = new HashMap();
                map.put("tool_id", toolId);
                map.put("use_life_hr", useLifeHr);
                map.put("alarm_life_hr", alarmLifeHr);
                map.put("is_open", isOpen);
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                IiotTool iiotTool = new IiotTool();
                iiotTool.fromMap(map);
                if (iiotTool.saveIt()) {
                    return success("update success");
                } else {
                    return fail("修改失敗...");
                }
            }
        });
    }

    @RequestMapping(value = "/getTool", method = RequestMethod.GET)
    public RequestResult<?> getTool(@RequestParam String startDate, @RequestParam String endDate, @RequestParam String toolCode, @RequestParam String toolType, @RequestParam String isOpen) {

        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_iiot_view_tool_analysis ");
                sb.append("WHERE ");
                sb.append("(create_time BETWEEN ");
                sb.append("'" + startDate + " 00:00:00' ");
                sb.append("AND ");
                sb.append("'" + endDate + " 23:59:59' ) ");

                if (!isOpen.equals("null") && !isOpen.equals("")) {
                    sb.append("AND ");
                    sb.append("is_open = '" + isOpen + "' ");
                }
                if (!toolType.equals("null") && !toolType.equals("")) {
                    sb.append("AND ");
                    sb.append("tool_type = '" + toolType + "' ");
                }
                if (!toolCode.equals("null") && !toolCode.equals("")) {
                    sb.append("AND ");
                    sb.append("tool_code = '" + toolCode + "' ");
                }

                List<Map> result = Base.findAll(sb.toString());
                SimpleDateFormat datetimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                for (Map data : result) {
                    data.put("create_time", datetimeFormat.format(data.get("create_time")));
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/print10mmx10mmQRCode", method = POST)
    public void print10mmx10mmQRCode(@RequestParam("datas") final String[] datas,
                                     @RequestParam("uuid") final String uuid) {
        final int WIDTH = 1152;
        final int HEIGHT = 1152;
        final int MAX_COUNT = 184;
//        String uuid = UUID.randomUUID().toString().replace("-","");
        XWPFDocument document = null;
        String modelPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/IIOTToolManagement/program/10mmx10mmQrcode/form-10x10.docx";
        final String outputFolder = System.getProperty(SysPropKey.ROOT_PATH) + "/app/IIOTToolManagement/program/10mmx10mmQrcode/" + uuid;
        if (!new File(outputFolder).exists()) {
            new File(outputFolder).mkdirs();
        }

        try {
            int pageCount = 0;
            FileInputStream input = new FileInputStream(modelPath);
            FileInputStream imgInput = null;
            document = new XWPFDocument(input);
            XWPFTable module = document.getTables().get(0);
            FileOutputStream output = new FileOutputStream(outputFolder + "/" + uuid + ".docx");
            if (datas.length > MAX_COUNT) {
                pageCount = getPageCount(datas.length, MAX_COUNT);
                for (int i = 0; i < pageCount; i++) {
                    document.createTable();
                    document.setTable((i + 1), module);
                }
                document.write(output);
                output.close();
                input.close();
                input = new FileInputStream(outputFolder + "/" + uuid + ".docx");
                document = new XWPFDocument(input);
            }
            int tableIndex = 0;
            int rowIndex = 0;
            int cellIndex = 0;
            List<XWPFTable> tableList = document.getTables();
            XWPFTable table = null;
            XWPFTableCell cell = null;
            XWPFParagraph paragraph = null;
            XWPFRun r = null;

            for (int i = 0; i < datas.length; i++) {
                table = tableList.get(tableIndex);
                String content = datas[i];
                String imgPath = outputFolder + "/" + i + ".png";
                QRcodeService.create(content, imgPath, WIDTH, HEIGHT);

                cell = table.getRow(rowIndex).getCell(cellIndex);
                paragraph = cell.getParagraphs().get(0);
                r = paragraph.createRun();
                imgInput = new FileInputStream(imgPath);
                r.addPicture(imgInput, XWPFDocument.PICTURE_TYPE_PNG, imgPath, Units.toEMU(30), Units.toEMU(30));
                imgInput.close();

                cell = table.getRow(rowIndex).getCell(cellIndex += 1);
                cell.setVerticalAlignment(XWPFTableCell.XWPFVertAlign.TOP);
                paragraph = cell.getParagraphs().get(0);
                r = paragraph.createRun();
                r.setFontSize(5);
                r.addBreak();
                r.setText(content);

                if (cellIndex == 22) {
                    if (rowIndex == 22) {
                        tableIndex++;
                        rowIndex = 0;
                        cellIndex = 0;
                    } else {
                        rowIndex++;
                        cellIndex = 0;
                    }
                } else {
                    cellIndex = cellIndex + 2;
                }
            }
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");

            String mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            String headerKey = "Content-Disposition";
            String headerValue = "attachment; filename=\" " + sdf.format(new Date()) + ".docx\"";

            response.setContentType(mimeType);
            response.setHeader(headerKey, headerValue);
            ServletOutputStream out = response.getOutputStream();
            document.write(out);
            output.close();
            out.flush();
            out.close();
            input.close();
            imgInput.close();

            File path = new File(outputFolder);
            if (path.isDirectory()) {
                for (File file : path.listFiles()) {
                    file.delete();
                }
                path.delete();
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InvalidFormatException e) {
            e.printStackTrace();
        }
    }

    @RequestMapping(value = "/print24mmx24mmQRCode", method = POST)
    public void print24mmx24mmQRCode(@RequestParam("datas") final String[] datas,
                                     @RequestParam("uuid") final String uuid) {
        final int WIDTH = 1152;
        final int HEIGHT = 1152;
        final int MAX_COUNT = 33;
//        String uuid = UUID.randomUUID().toString().replace("-","");
        XWPFDocument document = null;
        String modelPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/ServTrackManagement/program/form.docx";
        final String outputFolder = System.getProperty(SysPropKey.ROOT_PATH) + "/app/ServTrackManagement/program/" + uuid;
        if (!new File(outputFolder).exists()) {
            new File(outputFolder).mkdirs();
        }

        try {
            int pageCount = 0;
            FileInputStream input = new FileInputStream(modelPath);
            FileInputStream imgInput = null;
            document = new XWPFDocument(input);
            XWPFTable module = document.getTables().get(0);
            FileOutputStream output = new FileOutputStream(outputFolder + "/" + uuid + ".docx");
            if (datas.length > MAX_COUNT) {
                pageCount = getPageCount(datas.length, MAX_COUNT);
                for (int i = 0; i < pageCount; i++) {
                    document.createTable();
                    document.setTable((i + 1), module);
                }
                document.write(output);
                output.close();
                input.close();
                input = new FileInputStream(outputFolder + "/" + uuid + ".docx");
                document = new XWPFDocument(input);
            }
            int tableIndex = 0;
            int rowIndex = 0;
            int cellIndex = 0;
            List<XWPFTable> tableList = document.getTables();
            XWPFTable table = null;
            XWPFTableCell cell = null;
            XWPFParagraph paragraph = null;
            XWPFRun r = null;

            for (int i = 0; i < datas.length; i++) {
                table = tableList.get(tableIndex);
                String content = datas[i];
                String imgPath = outputFolder + "/" + i + ".png";
                QRcodeService.create(content, imgPath, WIDTH, HEIGHT);

                cell = table.getRow(rowIndex).getCell(cellIndex);
                paragraph = cell.getParagraphs().get(0);
                r = paragraph.createRun();
                imgInput = new FileInputStream(imgPath);
                r.addPicture(imgInput, XWPFDocument.PICTURE_TYPE_PNG, imgPath, Units.toEMU(68.2), Units.toEMU(68.2));
                imgInput.close();

                cell = table.getRow(rowIndex).getCell(cellIndex += 1);
                cell.setVerticalAlignment(XWPFTableCell.XWPFVertAlign.TOP);
                paragraph = cell.getParagraphs().get(0);
                r = paragraph.createRun();
                r.setFontSize(8);
                r.addBreak();
                r.setText(content);

                if (cellIndex == 5) {
                    if (rowIndex == 10) {
                        tableIndex++;
                        rowIndex = 0;
                        cellIndex = 0;
                    } else {
                        rowIndex ++;
                        cellIndex = 0;
                    }
                } else {
                    cellIndex ++;
                }
            }
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");

            String mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            String headerKey = "Content-Disposition";
            String headerValue = "attachment; filename=\" " + sdf.format(new Date()) + ".docx\"";

            response.setContentType(mimeType);
            response.setHeader(headerKey, headerValue);
            ServletOutputStream out = response.getOutputStream();
            document.write(out);
            output.close();
            out.flush();
            out.close();
            input.close();
            imgInput.close();

            File path = new File(outputFolder);
            if (path.isDirectory()) {
                for (File file : path.listFiles()) {
                    file.delete();
                }
                path.delete();
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InvalidFormatException e) {
            e.printStackTrace();
        }
    }

    static int getPageCount(int size, int maxCount) {
        int result = size / maxCount;
        if (size % maxCount == 0) {
            result -= 1;
        }
        return result;
    }

    static class QRcodeService {

        private static final int WHITE = 255 << 16 | 255 << 8 | 255;
        private static final int BLACK = 0;
        private static final String ENCODE = "UTF-8";
        private static Hashtable hints;

        static {
            hints = new Hashtable();
            hints.put(EncodeHintType.CHARACTER_SET, ENCODE);
        }


        public static void create(String content, String filePath, int width, int height) {

            QRCodeWriter writer = new QRCodeWriter();
            BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
            try {
                BitMatrix bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, width, height, hints);

                for (int i = 0; i < width; i++) {
                    for (int j = 0; j < height; j++) {
                        image.setRGB(i, j, bitMatrix.get(i, j) ? BLACK : WHITE); // set pixel one by one
                    }
                }
                try {
                    ImageIO.write(image, "png", new File(filePath)); // save QR image to disk
                } catch (IOException e) {
                    e.printStackTrace();
                }

            } catch (WriterException e) {
                e.printStackTrace();
            }

        }

        public static String read(String filePath) {

            QRCodeReader reader = new QRCodeReader();
            File file = new File(filePath);
            BufferedImage image = null;
            BinaryBitmap bitmap = null;
            Result result = null;

            try {
                image = ImageIO.read(file);
                int[] pixels = image.getRGB(0, 0, image.getWidth(), image.getHeight(), null, 0, image.getWidth());
                RGBLuminanceSource source = new RGBLuminanceSource(image.getWidth(), image.getHeight(), pixels);
                bitmap = new BinaryBitmap(new HybridBinarizer(source));

                result = reader.decode(bitmap);
                return result.getText();
            } catch (IOException e) {
                e.printStackTrace();
            } catch (ChecksumException e) {
                e.printStackTrace();
            } catch (NotFoundException e) {
                e.printStackTrace();
            } catch (FormatException e) {
                e.printStackTrace();
            }

            return null;
        }
    }
}
