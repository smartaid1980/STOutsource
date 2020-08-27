package com.servtech.servcloud.app.controller.teco_servtrack;

import com.google.zxing.*;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.qrcode.QRCodeReader;
import com.google.zxing.qrcode.QRCodeWriter;
import com.servtech.servcloud.app.model.teco.TecoStaff;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.core.util.Util;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.util.Units;
import org.apache.poi.xwpf.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.imageio.ImageIO;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.awt.image.BufferedImage;
import java.io.*;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;


/**
 * Created by Frank on 2017/7/25.
 */

@RestController
@RequestMapping("/teco/servtrack/staff")
public class TecoStaffController {
    private static final Logger log = LoggerFactory.getLogger(TecoStaffController.class);


    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    data.put("qrcod_staff", UUID.randomUUID().toString().replace("-", ""));
                    TecoStaff staff = new TecoStaff();
                    staff.fromMap(data);
                    if (staff.insert()) {
                        return success(staff.getString("staff_id"));
                    } else {
                        return fail("新增失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read(@RequestParam("staff_id") final String staffId) {
        final String staff_id = staffId;

        if (staff_id !=null && !staff_id.equals("null") && !staff_id.equals("")) {
            return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(TecoStaff.find("staff_id=?", staff_id).toMaps());
                }
            });
        } else {
            return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(TecoStaff.findAll().include().toMaps());
                }
            });
        }
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                TecoStaff staff = new TecoStaff();
                staff.fromMap(data);


                if (staff.saveIt()) {
                    return success(staff.getString("staff_id"));
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }

    @RequestMapping(value = "/printQRCode", method = POST)
    public void printQRCode(@RequestParam("staffIds") final String[] idList,
                            @RequestParam("uuid") final String uuid) {

        List<QRCodeStaff> qrCodeStaffList = ActiveJdbc.operTx(new Operation<List<QRCodeStaff>>() {
            @Override
            public List<QRCodeStaff> operate() {
                List<TecoStaff> list = TecoStaff.find("staff_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);

                List<QRCodeStaff> qrCodeList = new ArrayList<QRCodeStaff>();

                for (TecoStaff staff : list) {
                    qrCodeList.add(new QRCodeStaff(staff));
                }

                return qrCodeList;
            }
        });

        final int MAX_COUNT = 33;
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
            if (qrCodeStaffList.size() > MAX_COUNT) {
                pageCount = getPageCount(qrCodeStaffList.size());
                for (int i =0; i < pageCount; i++) {
                    document.createTable();
                    document.setTable((i + 1), module);
                }
                document.write(output);
                output.close();
                input.close();
                input = new FileInputStream(outputFolder + "/" + uuid + ".docx");
                document = new XWPFDocument(input);
            }
            int tableIndex = 0 ;
            int rowIndex = 0;
            int cellIndex = 0;
            List<XWPFTable> tableList = document.getTables();
            XWPFTable table = null;
            XWPFTableCell cell = null;
            XWPFParagraph paragraph = null;
            XWPFRun r = null;


            for(int i = 0; i < qrCodeStaffList.size(); i++) {
                QRCodeStaff qrCodeStaff = qrCodeStaffList.get(i);
                table = tableList.get(tableIndex);
                String id = qrCodeStaff.staff_id;
                String name = qrCodeStaff.staff_name;
                String content = qrCodeStaff.content;
                String imgPath = outputFolder + "/" + id + ".png";
                QRcodeService.create(content, imgPath);
                cell = table.getRow(rowIndex).getCell(cellIndex);
                paragraph = cell.getParagraphs().get(0);
                r = paragraph.createRun();
                imgInput = new FileInputStream(imgPath);
                r.addPicture(imgInput, XWPFDocument.PICTURE_TYPE_PNG, imgPath, Units.toEMU(68.2), Units.toEMU(68.2));
                imgInput.close();
                cell = table.getRow(rowIndex).getCell(cellIndex+= 1);
                cell.setVerticalAlignment(XWPFTableCell.XWPFVertAlign.TOP);
                paragraph = cell.getParagraphs().get(0);
                r = paragraph.createRun();
                r.addBreak();
                r.setText(id);
                r.addBreak();
                r.setText(name);

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

    static int getPageCount (int size) {
        int result = size / 33 ;
        if (size% 33 == 0) {
            result -=1;
        }
        return result;
    }

    static class QRCodeStaff {
        String content;
        String staff_id;
        String staff_name;

        QRCodeStaff(TecoStaff staff) {

            staff_id = staff.get("staff_id").toString();
            staff_name = staff.get("staff_name").toString();
            content = staff.get("qrcod_staff").toString();
        }
    }


    static class QRcodeService {

        private static final int WIDTH = 1152;
        private static final int HEIGHT = 1152;
        private static final int WHITE = 255 << 16 | 255 << 8 | 255;
        private static final int BLACK = 0;
        private static final String ENCODE = "UTF-8";
        private static Hashtable hints;
        static {
            hints = new Hashtable();
            hints.put(EncodeHintType.CHARACTER_SET, ENCODE);
        }



        public static void create(String content, String filePath) {

            QRCodeWriter writer = new QRCodeWriter();
            BufferedImage image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
            try {
                BitMatrix bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, WIDTH, HEIGHT, hints);

                for (int i = 0; i<WIDTH; i++) {
                    for (int j = 0; j < HEIGHT; j++) {
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

            return  null;
        }
    }

}

