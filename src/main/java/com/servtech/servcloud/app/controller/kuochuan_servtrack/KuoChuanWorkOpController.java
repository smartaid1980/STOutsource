package com.servtech.servcloud.app.controller.kuochuan_servtrack;

import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import com.google.zxing.*;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.qrcode.QRCodeReader;
import com.google.zxing.qrcode.QRCodeWriter;
import com.servtech.servcloud.app.controller.servtrack.ServtrackWorkController;
import com.servtech.servcloud.app.model.kuochuan_servtrack.KcWorkOp;
import com.servtech.servcloud.app.model.kuochuan_servtrack.view.WorkOpView;
import com.servtech.servcloud.app.model.servtrack.Line;
import com.servtech.servcloud.app.model.servtrack.WorkOp;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
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
import java.lang.reflect.Type;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.UUID;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.DELETE;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Frank on 2017/6/20.
 */
@RestController
@RequestMapping("/kuochuan/servtrack/workop")
public class KuoChuanWorkOpController {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(KuoChuanWorkOpController.class);
    private static final SimpleDateFormat SDF = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        try{
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {

                    Map wData = new HashMap();
                    wData.put("work_id",  data.get("work_id").toString());
                    wData.put("op",  data.get("op").toString());
                    wData.put("process_code",  data.get("process_code").toString());
                    wData.put("std_hour",  Double.parseDouble(data.get("std_hour").toString()) / 60);
                    wData.put("remark",  data.get("remark").toString());
                    wData.put("qrcode_op", UUID.randomUUID().toString().replace("-", ""));
                    wData.put("is_open", "Y");
                    wData.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    wData.put("create_time", new Timestamp(System.currentTimeMillis()));
                    wData.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    wData.put("modify_time", new Timestamp(System.currentTimeMillis()));

                    WorkOp workOp = new WorkOp();
                    workOp.fromMap(wData);

                    Map kcData = new HashMap();
                    kcData.put("work_id",  data.get("work_id").toString());
                    kcData.put("op", data.get("op").toString());
                    kcData.put("process_step", data.get("process_step").toString());

                    KcWorkOp kcWorkOp = new KcWorkOp();
                    kcWorkOp.fromMap(kcData);

                    if (workOp.insert() && kcWorkOp.insert()) {
                        return success(kcWorkOp.getString("work_id") + "_" + kcWorkOp.getString("op") );
                    } else {
                        return fail("新增失敗...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<List<Map>> getIdData(@RequestParam("work_id") final String workId) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                final String work_id = workId;
                return success(WorkOpView.find("work_id=?", work_id).toMaps());
            }
        });
    }

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                Map wData = new HashMap();
                wData.put("work_id",  data.get("work_id").toString());
                wData.put("op",  data.get("op").toString());
                wData.put("process_code",  data.get("process_code").toString());
                wData.put("std_hour", Double.parseDouble(data.get("std_hour").toString()) / 60);
                wData.put("remark",  data.get("remark").toString());
//                wData.put("is_open", data.get("is_open").toString());
                wData.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                wData.put("modify_time", new Timestamp(System.currentTimeMillis()));

                WorkOp workOp = new WorkOp();
                workOp.fromMap(wData);

                Map kcData = new HashMap();
                kcData.put("work_id", data.get("work_id").toString());
                kcData.put("op", data.get("op").toString());
                kcData.put("process_step", data.get("process_step").toString());

                KcWorkOp kcWorkOp = new KcWorkOp();
                kcWorkOp.fromMap(kcData);

                if (workOp.saveIt() && kcWorkOp.saveIt()) {
                    return success(kcWorkOp.getString("work_id") + "_" + kcWorkOp.getString("op"));
                } else {
                    return fail("新增失敗...");
                }

            }
        });
    }
    //刪除 open is n
    @RequestMapping(value ="/delete", method = DELETE)
    public RequestResult<String> delete(@RequestBody final Map data) {

        final String work_id = data.get("work_id").toString();
        final List<String> op = (List)data.get("op");
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {

            @Override
            public RequestResult<String> operate() {

                int kcDeleteAmount = KcWorkOp.delete("work_id=? AND op IN " + ServtrackWorkController.strSplitBy(",", op), work_id);
                int deleteAmount = WorkOp.delete("work_id=? AND op IN " + ServtrackWorkController.strSplitBy(",", op), work_id);
                if (deleteAmount > 0 && kcDeleteAmount > 0) {
                    return success("刪除成功");
                } else {
                    return fail("刪除失敗...");
                }

            }
        });
    }

    @RequestMapping(value = "/getworks", method = GET)
    public RequestResult<List<Map>> getWorks(@RequestParam("startDate") final String startDate,
                                             @RequestParam("endDate") final String endDate,
                                             @RequestParam("workId") final String workId,
                                             @RequestParam("productId") final String productId) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT a.*, b.product_name, c.user_name ");
                sb.append("FROM ");
                sb.append("(SELECT ");
                sb.append("works.work_id, ");
                sb.append("works.product_id, ");
                sb.append("works.e_quantity, ");
                sb.append("works.input, ");
                sb.append("works.status_id, ");
                sb.append("work_op.op, ");
                sb.append("kc_work_op.process_step, ");
                sb.append("work_op.qrcode_op, ");
                sb.append("work_op.remark, ");
                sb.append("work_op.is_open, ");
                sb.append("work_op.std_hour, ");
                sb.append("work_op.create_by, ");
                sb.append("work_op.create_time, ");
                sb.append("process.process_code, ");
                sb.append("process.process_name ");
                sb.append("FROM a_servtrack_work works ");
                sb.append("INNER JOIN a_servtrack_work_op work_op ");
                sb.append("on works.work_id = work_op.work_id ");
                sb.append("INNER JOIN a_kuochuan_servtrack_work_op kc_work_op ");
                sb.append("on (works.work_id = kc_work_op.work_id AND work_op.op = kc_work_op.op) ");
                sb.append("INNER JOIN ");
                sb.append("a_servtrack_process process ");
                sb.append("on work_op.process_code = process.process_code ");
                sb.append(") as a ");
                sb.append("INNER JOIN ");
                sb.append("a_servtrack_product as b ");
                sb.append("on a.product_id = b.product_id ");
                sb.append("INNER JOIN ");
                sb.append("m_sys_user c ");
                sb.append("on a.create_by = c.user_id ");
                sb.append("WHERE ");
                sb.append("a.create_time BETWEEN ");
                sb.append("'" + startDate + " 00:00:00' ");
                sb.append("AND ");
                sb.append("'" + endDate + " 23:59:59' ");
                if (!workId.equals("") && !workId.isEmpty()) {
                    sb.append("AND ");
                    sb.append("a.work_id = '" + workId + "' ");
                }
                if (!productId.equals("") && !productId.isEmpty()) {
                    sb.append("AND ");
                    sb.append("a.product_id = '" + productId + "' ");
                }
                sb.append("AND ");
                sb.append("a.status_id not IN('2','9') ");
                
                List<Map> result = Base.findAll(sb.toString());
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                for (Map map : result) {
                    map.put("create_time", sdf.format(map.get("create_time")));
                }
                return success(result);

            }
        });
    }

    @RequestMapping(value = "/printQRCode", method = POST)
    public void printQRCode(@RequestParam("works") final String jsonStr,
                            @RequestParam("uuid") final String uuid) {

        final StringBuilder sqlSb = new StringBuilder();
        sqlSb.append("SELECT w.work_id, ");
        sqlSb.append("p.product_id, ");
        sqlSb.append("p.product_name, ");
        sqlSb.append("w_op.op, ");
        sqlSb.append("k_op.process_step, ");
        sqlSb.append("ps.process_name, ");
        sqlSb.append("w_op.qrcode_op, ");
        sqlSb.append("w.e_quantity, ");
        sqlSb.append("w.input, ");
        sqlSb.append("w.status_id, ");
        sqlSb.append("ps.process_code ");
        sqlSb.append("FROM ");
        sqlSb.append("a_servtrack_work AS w, ");
        sqlSb.append("a_servtrack_product AS p, ");
        sqlSb.append("a_servtrack_work_op AS w_op, ");
        sqlSb.append("a_servtrack_process AS ps, ");
        sqlSb.append("a_kuochuan_servtrack_work_op AS k_op ");
        sqlSb.append("WHERE ");
        sqlSb.append("w.product_id = p.product_id ");
        sqlSb.append("AND ");
        sqlSb.append("w.work_id = w_op.work_id ");
        sqlSb.append("AND ");
        sqlSb.append("w_op.process_code = ps.process_code ");
        sqlSb.append("AND ");
        sqlSb.append("(w.work_id = k_op.work_id AND w_op.op = k_op.op) ");
        sqlSb.append("AND ");
//        sqlSb.append("AND ");
//        sqlSb.append("w.work_id = ? ");
//        sqlSb.append("AND ");
//        sqlSb.append("w_op.op  IN  ");
//        sqlSb.append("ORDER BY ");
//        sqlSb.append("work_id, ");
//        sqlSb.append("op ");
//        sqlSb.append("ASC");

        final List<WorkOpParam> paramsList = new ArrayList<WorkOpParam>();
        Type type =  new TypeToken<Map<String, List<String>>>(){}.getType();
        Map<String, List<String>> mapList = new Gson().fromJson(jsonStr, type);
        for (Map.Entry<String, List<String>> entry : mapList.entrySet()) {
            paramsList.add(new WorkOpParam(entry.getKey(), entry.getValue()));
        }
        
        ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {

            @Override
            public RequestResult<Void> operate() {
                List<Map> resultMap = Base.findAll(sqlSb.toString() + sqlSplitBy("OR ", paramsList));
                if (resultMap.size() > 0) {
                    XWPFDocument document = null;
                    String modelPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/KuoChuanServTrackManagement/program/form.docx";
                    final String outputFolder = System.getProperty(SysPropKey.ROOT_PATH) + "/app/KuoChuanServTrackManagement/program/" + uuid;
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
                            pageCount = resultMap.size() - 1;
                            for (int i =0; i < pageCount; i++) {
                                document.createTable();
                                document.setTable((i + 1), module);
                                if (i%2 > 0) {
                                    document.createParagraph();
                                }
                            }
                            document.write(output);
                            output.close();
                            input.close();
                            input = new FileInputStream(outputFolder + "/" + uuid + ".docx");
                            document = new XWPFDocument(input);

                        List<XWPFTable> tableList = document.getTables();
                        XWPFTable table = null;
                        XWPFTableCell cell = null;
                        XWPFParagraph paragraph = null;
                        XWPFRun r = null;
                        String dateTime = SDF.format(new Date());
                        for(int i = 0; i < resultMap.size(); i++) {
                            Map<String, Object> map = resultMap.get(i);
                            table = tableList.get(i);
                            String work_id = map.get("work_id").toString();
                            String product_id = map.get("product_id").toString();
                            String product_name = map.get("product_name").toString();
                            String op =  map.get("op").toString();
                            String process_name = map.get("process_name").toString();
                            String qrcode_op = map.get("qrcode_op").toString();
                            String e_quantity = map.get("e_quantity").toString();
                            String process_step = map.get("process_step").toString();
                            String imgPath = outputFolder + "/" + work_id + map.get("op").toString().trim() + ".png";
                            QRcodeService.create(qrcode_op, imgPath);
                            cell = table.getRow(0).getCell(1);
                            cell.setText(dateTime);

                            cell = table.getRow(0).getCell(3);
                            paragraph = cell.getParagraphs().get(0);
                            r = paragraph.createRun();
                            imgInput = new FileInputStream(imgPath);
                            r.addPicture(imgInput, XWPFDocument.PICTURE_TYPE_PNG, imgPath, Units.toEMU(68.2), Units.toEMU(68.2));
                            imgInput.close();

                            cell = table.getRow(1).getCell(1);
                            cell.setText(product_id + "-" + process_step);

                            cell = table.getRow(2).getCell(1);
                            cell.setText(process_name);

                            cell = table.getRow(3).getCell(1);
                            cell.setText(e_quantity);

                            cell = table.getRow(4).getCell(1);
                            cell.setText(work_id);
                            cell = table.getRow(4).getCell(3);
                            cell.setText(op);

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
                return success();
            }
        });

    }

    static class WorkOpParam {
        private String work_id;
        private List<String> opList;

        WorkOpParam(String work_id, List<String> list) {
            this.work_id = work_id;
            this.opList = new ArrayList<String>();
            for (String s : list) {
                opList.add(s);
            }
        }

        String sqlParamStr () {
            StringBuilder sb = new StringBuilder();
            sb.append("( w.work_id=\'"+work_id+"\' ");
            sb.append("AND w_op.op IN ");
            sb.append(strSplitBy(",", opList));
            sb.append(" )");
            return sb.toString();
        }

        String strSplitBy(String splitter, List<String> list) {
            String sep = "";
            StringBuilder sb = new StringBuilder("( ");

            for (String s : list) {
                sb.append(sep);
                sb.append("\'" + s + "\'");
                sep = splitter;
            }
            sb.append(" ) ");

            return sb.toString();

        }
    }

    String sqlSplitBy(String splitter, List<WorkOpParam> list) {
        String seq = "";
        StringBuilder sb = new StringBuilder();
        sb.append("( ");
        for (WorkOpParam workOpParam : list) {
            sb.append(seq);
            sb.append(workOpParam.sqlParamStr());
            seq = splitter;
        }
        sb.append(" )");
        return sb.toString();
    }

    static class QRCodeLine {
        String content;
        String line_id;
        String line_name;

        QRCodeLine(Line line) {

            line_id = line.get("line_id").toString();
            line_name = line.get("line_name").toString();
            content = line.get("qrcode_line").toString();
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
