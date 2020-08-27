package com.servtech.servcloud.app.controller.yihcheng;

import com.google.zxing.*;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.jacob.activeX.ActiveXComponent;
import com.jacob.com.ComThread;
import com.jacob.com.Dispatch;
import com.jacob.com.Variant;
import com.servtech.servcloud.app.model.servtrack.Work;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.SysUser;
import com.servtech.servcloud.module.util.PdfUtils;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.imageio.ImageIO;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.awt.image.BufferedImage;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

@RestController
@RequestMapping("/yihcheng/excel")
public class YihChengExcelController {

    private static final String LOCK = new String();
    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "download-pdf", method = RequestMethod.GET)
    public RequestResult<?> downloadPDF(@RequestParam("work_id") String work_id) {
        try {
            return ActiveJdbc.operTx(() -> {
                try {
                    returnExcelStream(work_id);
                } catch (Exception e) {
                    e.printStackTrace();
                    if (e.getMessage().contains("Can't get object clsid from progid")) {
                        return fail("啟用excel失敗..");
                    }
                    return fail("something error...");

                }
                return success();
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    /**
     * excel转PDF
     *
     * @param inFilePath
     * @param outFilePath
     */
    public static void excelToPdf(String inFilePath, String outFilePath) {
        ActiveXComponent ax = null;
        Dispatch excel = null;
        try {
            ComThread.InitSTA();
            ax = new ActiveXComponent("Excel.Application");
            ax.setProperty("Visible", new Variant(false));
            ax.setProperty("AutomationSecurity", new Variant(3));//禁用宏
            Dispatch excels = ax.getProperty("Workbooks").toDispatch();
            Object[] obj = new Object[]{
                    inFilePath,
                    new Variant(false),
                    new Variant(false)
            };
            excel = Dispatch.invoke(excels, "Open", Dispatch.Method, obj, new int[9]).toDispatch();
            File tofile = new File(outFilePath);
            if (tofile.exists()) {
                tofile.delete();
            }
            //转换格式
            Object[] obj2 = new Object[]{
                    new Variant(0),//PDF格式=0
                    outFilePath,
                    new Variant(0) //0=标准 (生成的PDF图片不会变的模糊) ; 1=最小文件
            };
            Dispatch.invoke(excel, "ExportAsFixedFormat", Dispatch.Method, obj2, new int[1]);
            System.out.println("转换完毕！");
        } catch (Exception es) {
            es.printStackTrace();
            throw es;
        } finally {
            if (excel != null) {
                Dispatch.call(excel, "CLose", new Variant(false));
            }
            if (ax != null) {
                ax.invoke("Quit", new Variant[]{});
                ax = null;
            }
            ComThread.Release();
        }
    }

    private void returnExcelStream(String work_id) throws Exception {
        Workbook wb;
        String templateFilePath = System.getProperty(SysPropKey.ROOT_PATH) + "/program/template/製令跟箱單.xlsx";

        FileInputStream templateFile = new FileInputStream(new File(templateFilePath));
        wb = new XSSFWorkbook(templateFile);
        String sql = String.format("select * from a_servtrack_work_op where work_id = '%s'", work_id);

        List<Map> work_op_list = Base.findAll(sql);

        //取得寫入資料次數
        int dataSize = work_op_list.size();
        addSheet(wb, dataSize);

        setExcelSheetCellValue(work_id, wb, work_op_list);

        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
        String dateTime = sdf.format(new Date());
        String filename = work_id + '-' + dateTime;
        String month = dateTime.substring(4, 6);

        deletePreviousMonthFile(month);

        String tempDirStr = System.getProperty(SysPropKey.ROOT_PATH) + "/program/template/" + month;
        File tempDir = new File(tempDirStr);
        if (!tempDir.delete()) {
            tempDir.mkdir();
        }
        String tempFile = tempDir + "/" + filename + ".xlsx";
        FileOutputStream fos = new FileOutputStream(tempFile);
        wb.write(fos);
        wb.close();

        String tempPdf = tempFile.replace(".xlsx", ".pdf");
        PdfUtils.convertToPdf(tempFile);
//        excelToPdf(tempFile, tempPdf);
        String mimeType = "application/pdf";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=\" " + filename + ".pdf\"";
        try {
            FileInputStream in = new FileInputStream(tempPdf);
            response.setContentType(mimeType);
            response.setHeader(headerKey, headerValue);
            ServletOutputStream out = response.getOutputStream();
            byte[] bytes = new byte[1024];
            int byteSize;
            while ((byteSize = in.read(bytes)) != -1) {
                out.write(bytes, 0, byteSize);
            }
            out.flush();
            out.close();
            in.close();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void deletePreviousMonthFile(String month) {
        int previousMonth = Integer.valueOf(month) == 1 ? 12 : Integer.valueOf(month) - 1;
        String previousMonthPath = System.getProperty(SysPropKey.ROOT_PATH) + "/program/template/" + String.format("%02d", previousMonth);
        deleteDir(new File(previousMonthPath));
    }

    //遞迴刪除資料夾及其下面的檔案
    private boolean deleteDir(File dir) {
        if (!dir.exists()) {
            return true;
        }
        //迴圈遍歷待刪除目錄下的檔案
        if (dir.isDirectory()) {
            String[] children = dir.list();
            if (children != null) {
                for (int i = 0; i < children.length; i++) {
                    //採用遞迴方式，即使待刪除資料夾下還有多層目錄，也會遞迴先都刪除掉
                    boolean success = deleteDir(new File(dir, children[i]));
                    if (!success) {
                        return false;
                    }
                }
            }
        }
        // 目錄此時為空，可以刪除
        return dir.delete();
    }

    private void setExcelSheetCellValue(String work_id, Workbook wb, List<Map> work_op_list) {
        String user_id = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "unknow user" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
        //一個分頁包含的table數量
        int tableInOneSheetNum = 8;
        int hasWriteCount = 0;
        int total_page = work_op_list.size() == 1 ? 1 : (int) Math.ceil((double) work_op_list.size() / tableInOneSheetNum);
        System.out.println("total_page :" + total_page);
        Work work = Work.findFirst("work_id = ?", work_id);
        if (work != null) {

            for (int currentSheetIdx = 0; currentSheetIdx < total_page; currentSheetIdx++) {
                System.out.println("currentSheetIdx :" + currentSheetIdx);
                Sheet sheet = wb.getSheetAt(currentSheetIdx);


                QRcodeService.create(wb, sheet, 0, 5, work_id);

                Row oneTimeRow8 = sheet.getRow(7);
                String now = new SimpleDateFormat("yyyy/MM/dd HH:MM").format(new Date());

                oneTimeRow8.getCell(6).setCellValue(now);//製表日
                oneTimeRow8.getCell(30).setCellValue(SysUser.findById(user_id).getString("user_name"));//製表者
                oneTimeRow8.getCell(37).setCellValue(currentSheetIdx + 1 + "/" + total_page);//頁次

                Row oneTimeRow10 = sheet.getRow(9);
                oneTimeRow10.getCell(8).setCellValue(work_id);//工單號碼
                oneTimeRow10.getCell(32).setCellValue(SysUser.findById(user_id).getString("user_name"));//部門廠商

                Row oneTimeRow11 = sheet.getRow(10);
                oneTimeRow11.getCell(8).setCellValue(work.getString("product_id"));//產品編號
                oneTimeRow11.getCell(32).setCellValue(work.getString("po"));//訂單單號

                Row oneTimeRow12 = sheet.getRow(11);
                oneTimeRow12.getCell(8).setCellValue(work.getString("product_name"));//品名
                oneTimeRow12.getCell(32).setCellValue(work.getString("exp_start_date"));//預計開工日

                Row oneTimeRow13 = sheet.getRow(12);
                oneTimeRow13.getCell(8).setCellValue(work.getString("product_desc"));//規格
                oneTimeRow13.getCell(32).setCellValue(work.getString("exp_end_date"));//預計完工日

                Row oneTimeRow14 = sheet.getRow(13);
                oneTimeRow14.getCell(8).setCellValue(work.getString("product_process"));//製程編號:
                oneTimeRow14.getCell(32).setCellValue(work.getString("work_date"));//開單日期:

                Row oneTimeRow15 = sheet.getRow(14);
                oneTimeRow15.getCell(8).setCellValue(work.getString("work_class"));//工單型態:
                oneTimeRow15.getCell(11).setCellValue(work.getString("work_class_name"));//工單型態:
                oneTimeRow15.getCell(32).setCellValue(work.getString("unit"));//生產單位:

                Row oneTimeRow16 = sheet.getRow(15);
                oneTimeRow16.getCell(8).setCellValue(work.getString("edn"));//工程圖號:
                oneTimeRow16.getCell(32).setCellValue(work.getString("customer_id"));//客戶代號:

                int op_first_row = 21;

                int add_row = 0;

                for (int i = 0; i < tableInOneSheetNum; i++) {

                    Map work_op = work_op_list.get(hasWriteCount);
                    op_first_row += add_row;
                    Row oneTimeRow22 = sheet.getRow(op_first_row);
                    String op = String.format("%04d", Integer.valueOf(work_op.get("op").toString()));
                    oneTimeRow22.getCell(2).setCellValue(op); //製序(OP) 要補到4位數
                    oneTimeRow22.getCell(10).setCellValue(work_op.get("process_code").toString());//製程說明
                    QRcodeService.create(wb, sheet, op_first_row, 13, work_id + "-" + op);
                    oneTimeRow22.getCell(22).setCellValue(work_op.get("date_start_exp").toString());//預計開工日
                    oneTimeRow22.getCell(24).setCellValue(Double.valueOf(work_op.get("output_exp").toString()));//標準產出量
                    oneTimeRow22.getCell(28).setCellValue(Double.valueOf(work_op.get("qty_input_exp").toString()));//良品轉入量

                    Row oneTimeRow23 = sheet.getRow(op_first_row + 1);
                    oneTimeRow23.getCell(2).setCellValue(work_op.get("division_desc").toString()); //工作中心說明
                    oneTimeRow23.getCell(18).setCellValue(work_op.get("yc_machine_id").toString());//機器編號
                    oneTimeRow23.getCell(22).setCellValue(work_op.get("date_end_exp").toString());//預計完工日
                    oneTimeRow23.getCell(24).setCellValue(Double.valueOf(work_op.get("qty_wip").toString()));//在製餘量
                    oneTimeRow23.getCell(28).setCellValue(Double.valueOf(work_op.get("qty_output_exp").toString()));//良品轉出量
                    hasWriteCount++;

                    if (i == 0 || i == 3) {
                        add_row = 6;
                    } else {
                        add_row = 7;
                    }

                    if (hasWriteCount >= work_op_list.size())
                        break;
                }   //寫8筆工序了，準備換新分頁
            }
        }
    }

    static void addSheet(Workbook wb, int datas) {
        // System.out.println("datas : " + datas);
        int sumSheetNum = (int) Math.ceil((double) datas / 8);
        int exceptFirstSheetNum = sumSheetNum - 1;
        for (int sheetIdx = 0; sheetIdx < exceptFirstSheetNum; sheetIdx++) {
            wb.cloneSheet(0);
        }
        System.out.println("sumSheetNum : " + sumSheetNum);
//        addPickingDate(wb, sumSheetNum);
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


        public static void create(Workbook wb, Sheet sheet, int row, int cell, String content) {

            QRCodeWriter writer = new QRCodeWriter();
            BufferedImage image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
            try {
                BitMatrix bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, WIDTH, HEIGHT, hints);

                for (int i = 0; i < WIDTH; i++) {
                    for (int j = 0; j < HEIGHT; j++) {
                        image.setRGB(i, j, bitMatrix.get(i, j) ? BLACK : WHITE); // set pixel one by one
                    }
                }

                try {
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    ImageIO.write(image, "png", baos);
                    byte[] bytes = baos.toByteArray();
                    int pictureIdx = wb.addPicture(bytes, Workbook.PICTURE_TYPE_PNG);
                    baos.close();

                    ClientAnchor anchor = wb.getCreationHelper().createClientAnchor();

                    anchor.setCol1(cell);
                    anchor.setRow1(row);
                    Drawing drawing = sheet.createDrawingPatriarch();
                    Picture picture = drawing.createPicture(anchor, pictureIdx);
                    picture.resize(6.0, 4.0);
                } catch (IOException e) {
                    e.printStackTrace();
                }

            } catch (WriterException e) {
                e.printStackTrace();
            }
        }
    }

}
