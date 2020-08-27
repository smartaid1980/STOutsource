package com.servtech.servcloud.app.controller.juihua;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import com.servtech.common.csv.CsvUtil;
import com.servtech.common.csv.annotation.CsvColumn;
import com.servtech.common.file.Files;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.krysalis.barcode4j.impl.code39.Code39Bean;
import org.krysalis.barcode4j.output.bitmap.BitmapCanvasProvider;
import org.krysalis.barcode4j.tools.UnitConv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.awt.image.BufferedImage;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Created by Hubert
 * Datetime: 2015/11/26 上午 10:41
 */
@RestController
@RequestMapping("/juihua/deliverOrder")
public class DeliverOrderController {
    private static final Logger log = LoggerFactory.getLogger(DeliverOrderController.class);

    private static final String JUIHUA_RECEIVE_BATCH = "juihua_order_receive_batch";
    private static final String JUIHUA_ACTUAL_AMOUNT = "juihua_order_actual_amount";
    private static final String JUIHUA_RECEIVED = "juihua_order_received";

    @RequestMapping(value = "translate", method = RequestMethod.POST)
    public RequestResult<Map<String, Set<String>>> translate(@RequestParam("date") String date) {
        String inputRootPath = System.getProperty(SysPropKey.DATA_PATH) + "/" + TxtOrderController.JUIHUA_ORDER_OUTPUT;
        String tripTimeConfigPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/Juihua/program/tripTime.json";
        String receiveBatchRootPath = System.getProperty(SysPropKey.DATA_PATH) + "/" + JUIHUA_RECEIVE_BATCH;
        String actualAmountRootPath = System.getProperty(SysPropKey.DATA_PATH) + "/" + JUIHUA_ACTUAL_AMOUNT;

        String date8Bits = date.replace("/", "");
        String datePath = date.substring(0, 8) + date8Bits; // yyyy/MM/yyyyMNdd

        String[] sequences = new String[] {
                "001", "002", "003", "004", "005", "006", "007", "008", "009", "010",
                "011", "012", "013", "014", "015", "016", "017", "018", "019", "020",
                "021", "022", "023", "024", "025", "026", "027", "028", "029", "030",
                "031", "032", "033", "034", "035", "036", "037", "038", "039", "040",
                "041", "042", "043", "044", "045", "046", "047", "048", "049", "050",
                "051", "052", "053", "054", "055", "056", "057", "058", "059", "060",
                "061", "062", "063", "064", "065", "066", "067", "068", "069", "070",
                "071", "072", "073", "074", "075", "076", "077", "078", "079", "080",
                "081", "082", "083", "084", "085", "086", "087", "088", "089", "090",
                "091", "092", "093", "094", "095", "096", "097", "098", "099", "100"
        };

        // 要先清掉舊的...
        clearOld(datePath, sequences);

        String runBatPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/Juihua/program/runSeparator.bat";
        String[] commands = new String[]{
                new File(runBatPath).getAbsolutePath(),
                new File(inputRootPath).getAbsolutePath(),
                date,
                new File(tripTimeConfigPath).getAbsolutePath(),
                new File(receiveBatchRootPath).getAbsolutePath(),
                new File(actualAmountRootPath).getAbsolutePath()
        };
        RunCmd runCmd = new RunCmd(commands, null, new File(System.getProperty(SysPropKey.ROOT_PATH) + "/app/Juihua/program"));

        int result = runCmd.execAndReturn();

        Map<String, Set<String>> resultList = getAllOrderByDate(datePath, date8Bits);

        return RequestResult.success(resultList);
    }

    @RequestMapping(value = "orderByDate", method = RequestMethod.GET)
    public RequestResult<Map<String, Set<String>>> orderByDate(@RequestParam("date") String date) {
        String date8Btis = date.replace("/", "");
        String datePath = date.substring(0, 8) + date8Btis; // yyyy/MM/yyyyMNdd
        Map<String, Set<String>> result = getAllOrderByDate(datePath, date8Btis);

        return RequestResult.success(result);
    }

    @RequestMapping(value = "downloadDeliverOrder", method = RequestMethod.POST)
    public void downloadDeliverOrder(@RequestParam("deliverId") String deliverIdRawString, HttpServletResponse response) throws IOException {
        DeliverId deliverId = new DeliverId(deliverIdRawString);

        String mimeType = "application/octect-stream";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=\"" + deliverId + ".xlsx\"";
        response.setContentType(mimeType);
        response.setHeader(headerKey, headerValue);

        List<ReceiveBatchData> receiveBatchDataList = deliverId.getReceiveBatchDataList();
        Map<String, ActualAmountData> actualAmountDataMap = deliverId.getActualAmountDataList();

        Workbook workbook = new XSSFWorkbook();

        CellStyle borderThinStyle = workbook.createCellStyle();
        borderThinStyle.setBorderBottom(CellStyle.BORDER_THIN);
        borderThinStyle.setBorderTop(CellStyle.BORDER_THIN);
        borderThinStyle.setBorderRight(CellStyle.BORDER_THIN);
        borderThinStyle.setBorderLeft(CellStyle.BORDER_THIN);
        borderThinStyle.setWrapText(true);

        CellStyle bolderFontStyle = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBoldweight(Font.BOLDWEIGHT_BOLD);
        font.setFontHeightInPoints((short) 18);
        bolderFontStyle.setFont(font);

        Sheet sheet = workbook.createSheet();
        setExcelHeader(sheet, borderThinStyle, bolderFontStyle, deliverId);

        int rowIndex = 6;
        for (ReceiveBatchData receiveBatchData : receiveBatchDataList) {
            int actualAmount = 0;
            if (actualAmountDataMap.containsKey(receiveBatchData.materialId)) {
                actualAmount = actualAmountDataMap.get(receiveBatchData.materialId).actualAmount;
            }

            Row row = sheet.createRow(rowIndex);
            setTableRow(row, borderThinStyle, receiveBatchData, actualAmount, rowIndex - 5);
            rowIndex++;
        }

        Row footerRow = sheet.createRow(rowIndex++);
        setExcelFooterTitle(footerRow, borderThinStyle);
        Row footerRowColumn = sheet.createRow(rowIndex);
        setExcelFooterColumn(footerRowColumn, borderThinStyle);

        // 依交料單產出 barcode 放進 Excel
        byte[] barcodeBytes = createBarcode(deliverId);
        addBarcodeToWorkbook(barcodeBytes, workbook, sheet);

        workbook.write(response.getOutputStream());
    }

    @RequestMapping(value = "downloadOrder", method = RequestMethod.POST)
    public void downloadOrder(@RequestParam("orderId") String orderId, HttpServletResponse response) throws IOException {
        String date8Bits = orderId.substring(0, 8);
        String supplier = orderId.substring(8);

        String mimeType = "application/octect-stream";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=\"" + date8Bits + supplier + ".xlsx\"";
        response.setContentType(mimeType);
        response.setHeader(headerKey, headerValue);

        // 原本好像有說要用下載當下的日期作為交貨日
//        Workbook workbook = getOrderWorkbook(supplier, date8Bits, new SimpleDateFormat("yyyy/MM/dd").format(new Date()));

        // 但現在要改成用訂單編號
        String dateSplitBySlash = date8Bits.substring(0, 4) + "/" + date8Bits.substring(4, 6) + "/" + date8Bits.substring(6, 8);
        Workbook workbook = getOrderWorkbook(supplier, date8Bits, dateSplitBySlash);

        workbook.write(response.getOutputStream());
    }

    @RequestMapping(value = "receive", method = RequestMethod.POST)
    public RequestResult<ReceiveResult> receive(@RequestParam("deliverId") String deliverIdRawString) throws IOException {
        DeliverId deliverId = new DeliverId(deliverIdRawString);
        log.info("Receive: " + deliverIdRawString);

        List<ReceiveBatchData> receiveBatchDataList = deliverId.getReceiveBatchDataList();
        Map<String, ActualAmountData> actualAmountDataMap = deliverId.getActualAmountDataList();

        List<List<String>> itemList = Lists.newArrayList();
        List<String> titleResult = Lists.newArrayList();
        titleResult.add("項次");
        titleResult.add("料號");
        titleResult.add("料名");
        titleResult.add("交貨量");
        titleResult.add("實收量");
        itemList.add(titleResult);

        int index = 1;
        for (ReceiveBatchData receiveBatchData : receiveBatchDataList) {
            int actualAmount = 0;
            if (actualAmountDataMap.containsKey(receiveBatchData.materialId)) {
                actualAmount = actualAmountDataMap.get(receiveBatchData.materialId).actualAmount;
            }

            List<String> innerResult = Lists.newArrayList();
            innerResult.add(String.valueOf(index));
            innerResult.add(receiveBatchData.materialId);
            innerResult.add(receiveBatchData.materailName);
            innerResult.add(String.valueOf(receiveBatchData.deliverAmount));
            innerResult.add(String.valueOf(actualAmount));
            itemList.add(innerResult);

            index++;
        }

        File receivedFile = new File(System.getProperty(SysPropKey.DATA_PATH), "juihua_order_received/" + deliverId.getPathWithoutExtension());
        if (!receivedFile.exists()) {
            com.google.common.io.Files.createParentDirs(receivedFile);
            receivedFile.createNewFile();
        }

        ReceiveResult receiveResult = new ReceiveResult();
        receiveResult.deliverId = deliverIdRawString;
        receiveResult.itemList = itemList;
        return RequestResult.success(receiveResult);
    }

    @RequestMapping(value = "noReceived", method = RequestMethod.GET)
    public RequestResult<Map<String, Set<String>>> noReceived(@RequestParam("date") String date) {
        String date8Btis = date.replace("/", "");
        String datePath = date.substring(0, 8) + date8Btis; // yyyy/MM/yyyyMNdd
        String datePathToMonth = date.substring(0, 7); // yyyy/MM
        Map<String, Set<String>> allOrderMap = getAllOrderByDate(datePath, date8Btis);
        Map<String, List<String>> receivedMap = getAllReceivedByDate(datePathToMonth, date8Btis);

        for (Map.Entry<String, List<String>> receivedEntry : receivedMap.entrySet()) {
            Set<String> orderSet = allOrderMap.get(receivedEntry.getKey());
            if (orderSet != null) {
                for (String received : receivedEntry.getValue()) {
                    orderSet.remove(received);
                }
                if (orderSet.isEmpty()) {
                    allOrderMap.remove(receivedEntry.getKey());
                }
            }
        }

        return RequestResult.success(allOrderMap);
    }

    private void setExcelHeader(Sheet sheet, CellStyle borderThinStyle, CellStyle fontBolderStyle, DeliverId deliverId) {
        Row row1 = sheet.createRow(0);
        Cell cellTitle = row1.createCell(0);
        cellTitle.setCellValue("友聯車材交貨收料單");
        cellTitle.setCellStyle(fontBolderStyle);

        Row row2 = sheet.createRow(1);
        row2.createCell(0).setCellValue("訂單號碼：" + deliverId.getOrderId());
        row2.createCell(2).setCellValue("收料條碼：");

        Row row3 = sheet.createRow(2);
        row3.createCell(0).setCellValue("交貨日期：" + deliverId.getFormattedDate());
        row3.createCell(2).setCellValue("交貨時段：");

        Row row4 = sheet.createRow(3);
        row4.createCell(0).setCellValue("廠商代碼：" + deliverId.supplier);
        row4.createCell(2).setCellValue("廠商名稱：" + getSupplierName(deliverId.supplier));

        Row row6 = sheet.createRow(5);
        Cell cell1 = row6.createCell(0);
        cell1.setCellValue("項次");
        cell1.setCellStyle(borderThinStyle);

        Cell cell2 = row6.createCell(1);
        cell2.setCellValue("料號");
        cell2.setCellStyle(borderThinStyle);

        Cell cell3 = row6.createCell(2);
        cell3.setCellValue("料名");
        cell3.setCellStyle(borderThinStyle);

        Cell cell4 = row6.createCell(3);
        cell4.setCellValue("架位");
        cell4.setCellStyle(borderThinStyle);

        Cell cell5 = row6.createCell(4);
        cell5.setCellValue("單位");
        cell5.setCellStyle(borderThinStyle);

        Cell cell6 = row6.createCell(5);
        cell6.setCellValue("交貨量");
        cell6.setCellStyle(borderThinStyle);

        Cell cell7 = row6.createCell(6);
        cell7.setCellValue("實收量");
        cell7.setCellStyle(borderThinStyle);

        Cell cell8 = row6.createCell(7);
        cell8.setCellValue("驗退量");
        cell8.setCellStyle(borderThinStyle);

        sheet.setColumnWidth(0, 5 * 256);
        sheet.setColumnWidth(1, 23 * 256);
        sheet.setColumnWidth(2, 30 * 256);
        sheet.setColumnWidth(3, 5 * 256);
        sheet.setColumnWidth(4, 5 * 256);
        sheet.setColumnWidth(5, 8 * 256);
        sheet.setColumnWidth(6, 8 * 256);
        sheet.setColumnWidth(7, 8 * 256);
    }

    private void setTableRow(Row row, CellStyle borderThinStyle, ReceiveBatchData receiveBatchData, int actualAmount, int itemSequence) {
        Cell cell1 = row.createCell(0);
        cell1.setCellValue("" + itemSequence);
        cell1.setCellStyle(borderThinStyle);

        Cell cell2 = row.createCell(1);
        cell2.setCellValue(receiveBatchData.materialId);
        cell2.setCellStyle(borderThinStyle);

        Cell cell3 = row.createCell(2);
        cell3.setCellValue(receiveBatchData.materailName);
        cell3.setCellStyle(borderThinStyle);

        Cell cell4 = row.createCell(3);
        cell4.setCellValue("");
        cell4.setCellStyle(borderThinStyle);

        Cell cell5 = row.createCell(4);
        cell5.setCellValue("");
        cell5.setCellStyle(borderThinStyle);

        Cell cell6 = row.createCell(5);
        cell6.setCellValue(receiveBatchData.deliverAmount);
        cell6.setCellStyle(borderThinStyle);

        Cell cell7 = row.createCell(6);
        cell7.setCellValue(actualAmount);
        cell7.setCellStyle(borderThinStyle);

        Cell cell8 = row.createCell(7);
        cell8.setCellValue("");
        cell8.setCellStyle(borderThinStyle);
    }

    private void setExcelFooterTitle(Row row, CellStyle borderThinStyle) {
        Cell cell2 = row.createCell(1);
        cell2.setCellValue("缺交");
        cell2.setCellStyle(borderThinStyle);

        Cell cell3 = row.createCell(2);
        cell3.setCellValue("短少");
        cell3.setCellStyle(borderThinStyle);

        Cell cell6 = row.createCell(5);
        cell6.setCellValue("檢驗");
        cell6.setCellStyle(borderThinStyle);

        Cell cell7 = row.createCell(6);
        cell7.setCellValue("點收");
        cell7.setCellStyle(borderThinStyle);

        Cell cell8 = row.createCell(7);
        cell8.setCellValue("出貨章");
        cell8.setCellStyle(borderThinStyle);
    }

    private void setExcelFooterColumn(Row row, CellStyle borderThinStyle) {
        row.setHeight((short) 1000);
        Cell cell2 = row.createCell(1);
        cell2.setCellStyle(borderThinStyle);

        Cell cell3 = row.createCell(2);
        cell3.setCellStyle(borderThinStyle);

        Cell cell6 = row.createCell(5);
        cell6.setCellStyle(borderThinStyle);

        Cell cell7 = row.createCell(6);
        cell7.setCellStyle(borderThinStyle);

        Cell cell8 = row.createCell(7);
        cell8.setCellStyle(borderThinStyle);
    }

    private byte[] createBarcode(DeliverId deliverId) throws IOException {
        Code39Bean bean = new Code39Bean();
        // 精細度
        final int dpi = 150;

        // module寬度
        final double moduleWidth = UnitConv.in2mm(1.0f / dpi);
        // 配置對象
        bean.setModuleWidth(moduleWidth);

        bean.setWideFactor(3);
        bean.doQuietZone(false);
        String format = "image/png";
        String msg = deliverId.toString();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        // 輸出到流
        BitmapCanvasProvider canvas = new BitmapCanvasProvider(baos, format, dpi,
                BufferedImage.TYPE_BYTE_BINARY, false, 0);

        // 生成條形碼
        bean.generateBarcode(canvas, msg);

        // 結束繪製
        canvas.finish();

        return baos.toByteArray();
    }

    private void addBarcodeToWorkbook(byte[] barcodeBytes, Workbook workbook, Sheet sheet) throws IOException {
        int pictureIdx = workbook.addPicture(barcodeBytes, Workbook.PICTURE_TYPE_PNG);

        CreationHelper helper = workbook.getCreationHelper();

        //Creates the top-level drawing patriarch.
        Drawing drawing = sheet.createDrawingPatriarch();

        //Create an anchor that is attached to the worksheet
        ClientAnchor anchor = helper.createClientAnchor();
        anchor.setCol1(3);
        anchor.setRow1(1);

        //Creates a picture
        Picture pict = drawing.createPicture(anchor, pictureIdx);
        //Reset the image to the original size
        pict.resize(4, 1);
    }

    private void clearOld(String datePath, String[] hundredSequence) {
        log.info("清除舊資料");

        File[] receiveBatchSupplierFolders = new File(System.getProperty(SysPropKey.DATA_PATH), JUIHUA_RECEIVE_BATCH).listFiles();
        if (receiveBatchSupplierFolders != null) {
            for (File receiveBatchSupplierFolder : receiveBatchSupplierFolders) {
                for (String sequence : hundredSequence) {
                    File file = new File(receiveBatchSupplierFolder, datePath + sequence + ".csv");
                    if (file.exists()) {
                        file.delete();
                    } else {
                        break;
                    }
                }
            }
        }

        File[] actualAmountSupplierFolders = new File(System.getProperty(SysPropKey.DATA_PATH), JUIHUA_ACTUAL_AMOUNT).listFiles();
        if (actualAmountSupplierFolders != null) {
            for (File actualAmountSupplierFolder : actualAmountSupplierFolders) {
                for (String sequence : hundredSequence) {
                    File file = new File(actualAmountSupplierFolder, datePath + sequence + ".csv");
                    if (file.exists()) {
                        file.delete();
                    } else {
                        break;
                    }
                }
            }
        }
    }

    private Map<String, Set<String>> getAllOrderByDate(String datePath, String date8Bits) {
        String[] sequences = new String[] {
                "001", "002", "003", "004", "005", "006", "007", "008", "009", "010",
                "011", "012", "013", "014", "015", "016", "017", "018", "019", "020",
                "021", "022", "023", "024", "025", "026", "027", "028", "029", "030",
                "031", "032", "033", "034", "035", "036", "037", "038", "039", "040",
                "041", "042", "043", "044", "045", "046", "047", "048", "049", "050",
                "051", "052", "053", "054", "055", "056", "057", "058", "059", "060",
                "061", "062", "063", "064", "065", "066", "067", "068", "069", "070",
                "071", "072", "073", "074", "075", "076", "077", "078", "079", "080",
                "081", "082", "083", "084", "085", "086", "087", "088", "089", "090",
                "091", "092", "093", "094", "095", "096", "097", "098", "099", "100"
        };
        String receiveBatchRootPath = System.getProperty(SysPropKey.DATA_PATH) + "/" + JUIHUA_RECEIVE_BATCH;
        Map<String, Set<String>> resultMap = Maps.newLinkedHashMap();
        File rootFile = new File(receiveBatchRootPath);
        for (String supplier : rootFile.list()) {
            File supplierFile = new File(rootFile, supplier);
            File file = new File(supplierFile, datePath + "001.csv");
            if (file.exists()) {
                Set<String> sequenceFileSet = Sets.newLinkedHashSet();
                for (String sequence : sequences) {
                    File sequenceFile = new File(supplierFile, datePath + sequence + ".csv");
                    if (!sequenceFile.exists()) {
                        break;
                    }
                    sequenceFileSet.add(date8Bits + supplier + sequence);
                }
                resultMap.put(date8Bits + supplier, sequenceFileSet);
            }
        }
        return resultMap;
    }

    private Map<String, List<String>> getAllReceivedByDate(String datePathToMonth, String date8Bits) {
        String receivedRootPath = System.getProperty(SysPropKey.DATA_PATH) + "/" + JUIHUA_RECEIVED;
        Map<String, List<String>> resultMap = Maps.newHashMap();
        File rootFile = new File(receivedRootPath);
        String[] suppliers = rootFile.list();
        if (suppliers != null) {
            for (String supplier : rootFile.list()) {
                File supplierFile = new File(rootFile, supplier);
                File fileFolder = new File(supplierFile, datePathToMonth);
                File[] files = fileFolder.listFiles();
                if (files != null) {
                    List<String> resultList = Lists.newArrayList();
                    for (File file : files) {
                        if (file.getName().startsWith(date8Bits)) {
                            String fileName = file.getName();
                            resultList.add(fileName.substring(0, 8) + supplier + fileName.substring(8));
                        }
                    }

                    if (!resultList.isEmpty()) {
                        resultMap.put(date8Bits + supplier, resultList);
                    }
                }
            }
        }
        return resultMap;
    }

    private Workbook getOrderWorkbook(String supplier, String date8Bits, String receiveDate) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet();

        CellStyle borderThinStyle = workbook.createCellStyle();
        borderThinStyle.setBorderBottom(CellStyle.BORDER_THIN);
        borderThinStyle.setBorderTop(CellStyle.BORDER_THIN);
        borderThinStyle.setBorderRight(CellStyle.BORDER_THIN);
        borderThinStyle.setBorderLeft(CellStyle.BORDER_THIN);
        borderThinStyle.setWrapText(true);

        CellStyle bolderFontStyle = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBoldweight(Font.BOLDWEIGHT_BOLD);
        font.setFontHeightInPoints((short) 18);
        bolderFontStyle.setFont(font);

        Row row1 = sheet.createRow(0);
        Cell cellTitle = row1.createCell(0);
        cellTitle.setCellValue("採購訂單報表");
        cellTitle.setCellStyle(bolderFontStyle);

        Row row2 = sheet.createRow(1);
        row2.createCell(0).setCellValue("訂單號碼：" + date8Bits + supplier);
//        row2.createCell(2).setCellValue("收料條碼：");

        Row row3 = sheet.createRow(2);
        row3.createCell(0).setCellValue("交貨日期：" + receiveDate);
//        row3.createCell(2).setCellValue("交貨時段：");

        Row row4 = sheet.createRow(3);
        row4.createCell(0).setCellValue("廠商代碼：" + supplier);
        row4.createCell(2).setCellValue("廠商名稱：" + getSupplierName(supplier));

        Row row6 = sheet.createRow(5);
        Cell cell1 = row6.createCell(0);
        cell1.setCellValue("項次");
        cell1.setCellStyle(borderThinStyle);

        Cell cell2 = row6.createCell(1);
        cell2.setCellValue("料號");
        cell2.setCellStyle(borderThinStyle);

        Cell cell3 = row6.createCell(2);
        cell3.setCellValue("料名");
        cell3.setCellStyle(borderThinStyle);

        Cell cell4 = row6.createCell(3);
        cell4.setCellValue("到期日期");
        cell4.setCellStyle(borderThinStyle);

        Cell cell5 = row6.createCell(4);
        cell5.setCellValue("已訂貨數量");
        cell5.setCellStyle(borderThinStyle);

        Cell cell6 = row6.createCell(5);
        cell6.setCellValue("未結數量");
        cell6.setCellStyle(borderThinStyle);

        sheet.setColumnWidth(0, 5 * 256);
        sheet.setColumnWidth(1, 23 * 256);
        sheet.setColumnWidth(2, 30 * 256);
        sheet.setColumnWidth(3, 10 * 256);
        sheet.setColumnWidth(4, 12 * 256);
        sheet.setColumnWidth(5, 10 * 256);

        String[] sequences = new String[] {
                "001", "002", "003", "004", "005", "006", "007", "008", "009", "010",
                "011", "012", "013", "014", "015", "016", "017", "018", "019", "020",
                "021", "022", "023", "024", "025", "026", "027", "028", "029", "030",
                "031", "032", "033", "034", "035", "036", "037", "038", "039", "040",
                "041", "042", "043", "044", "045", "046", "047", "048", "049", "050",
                "051", "052", "053", "054", "055", "056", "057", "058", "059", "060",
                "061", "062", "063", "064", "065", "066", "067", "068", "069", "070",
                "071", "072", "073", "074", "075", "076", "077", "078", "079", "080",
                "081", "082", "083", "084", "085", "086", "087", "088", "089", "090",
                "091", "092", "093", "094", "095", "096", "097", "098", "099", "100"
        };
        List<ReceiveBatchData> receiveBatchDataList = Lists.newArrayList();
        for (String sequence : sequences) {
            File file = new File(System.getProperty(SysPropKey.DATA_PATH), "juihua_order_receive_batch/" +
                                                                            supplier + "/" +
                                                                            date8Bits.substring(0, 4) + "/" +
                                                                            date8Bits.substring(4, 6) + "/" +
                                                                            date8Bits + sequence + ".csv");
            if (!file.exists()) {
                break;
            }
            List<String> lines = Files.readLines(file);
            receiveBatchDataList.addAll(CsvUtil.transform(lines, "\\|", ReceiveBatchData.class));
        }

        // 把分開的都合併回去，其實只是把數字加回去
        Map<String, ReceiveBatchData> mergedReceiveBatchDataLinkedMap = Maps.newLinkedHashMap();
        for (ReceiveBatchData receiveBatchData : receiveBatchDataList) {
            if (mergedReceiveBatchDataLinkedMap.containsKey(receiveBatchData.materialId)) {
                ReceiveBatchData oldReceiveBatchData = mergedReceiveBatchDataLinkedMap.get(receiveBatchData.materialId);
                oldReceiveBatchData.deliverAmount += receiveBatchData.deliverAmount;
            } else {
                mergedReceiveBatchDataLinkedMap.put(receiveBatchData.materialId, receiveBatchData);
            }
        }

        String dateForamtted = date8Bits.substring(4, 6) + "/" + date8Bits.substring(6, 8) + "/" + date8Bits.substring(2, 4);
        int rowIndex = 6;
        for (ReceiveBatchData receiveBatchData : mergedReceiveBatchDataLinkedMap.values()) {
            Row row = sheet.createRow(rowIndex);

            Cell celln1 = row.createCell(0);
            celln1.setCellValue("" + (rowIndex - 5));
            celln1.setCellStyle(borderThinStyle);

            Cell celln2 = row.createCell(1);
            celln2.setCellValue(receiveBatchData.materialId);
            celln2.setCellStyle(borderThinStyle);

            Cell celln3 = row.createCell(2);
            celln3.setCellValue(receiveBatchData.materailName);
            celln3.setCellStyle(borderThinStyle);

            Cell celln4 = row.createCell(3);
            celln4.setCellValue(dateForamtted);
            celln4.setCellStyle(borderThinStyle);

            Cell celln5 = row.createCell(4);
            celln5.setCellValue(receiveBatchData.deliverAmount);
            celln5.setCellStyle(borderThinStyle);

            Cell celln6 = row.createCell(5);
            celln6.setCellValue(receiveBatchData.deliverAmount);
            celln6.setCellStyle(borderThinStyle);

            rowIndex++;
        }

        Row roww = sheet.createRow(rowIndex++);
        Cell celll = roww.createCell(5);
        celll.setCellValue("核准者");
        celll.setCellStyle(borderThinStyle);

        Row rowww = sheet.createRow(rowIndex);
        Cell cellll = rowww.createCell(5);
        cellll.setCellStyle(borderThinStyle);
        rowww.setHeight((short) 1000);

        return workbook;
    }

    private String getSupplierName(String supplierId) {
        try {
            Map<String, String> supplierNameMap = ConfigController.SupplierName.fromConfig();
            if (supplierNameMap.containsKey(supplierId)) {
                return supplierNameMap.get(supplierId);
            } else {
                return supplierNameMap.get("god");
            }
        } catch (IOException e) {
            log.warn(e.getMessage(), e);
            return "";
        }
    }

    public static class ReceiveBatchData {
        @CsvColumn(index = 0) String deliverId;
        @CsvColumn(index = 1) String materialId;
        @CsvColumn(index = 2) String materailName;
        @CsvColumn(index = 3) int deliverAmount;
    }

    public static class ActualAmountData {
        @CsvColumn(index = 0) String deliverId;
        @CsvColumn(index = 1) String materialId;
        @CsvColumn(index = 2) int actualAmount;
    }

    private static class DeliverId {
        String date;
        String supplier;
        String sequence;

        public DeliverId(String rawString) {
            this.date = rawString.substring(0, 8);
            this.supplier = rawString.substring(8, rawString.length() - 3);
            this.sequence = rawString.substring(rawString.length() - 3);
        }

        // 沒有實收量的那個資料
        public List<ReceiveBatchData> getReceiveBatchDataList() {
            File file = new File(System.getProperty(SysPropKey.DATA_PATH), "juihua_order_receive_batch/" +
                                                                            supplier + "/" +
                                                                            date.substring(0, 4) + "/" +
                                                                            date.substring(4, 6) + "/" +
                                                                            date + sequence + ".csv");
            List<String> lines = Files.readLines(file);
            return CsvUtil.transform(lines, "\\|", ReceiveBatchData.class);
        }

        // 只有實收量沒有應收量的那個資料
        public Map<String, ActualAmountData> getActualAmountDataList() {
            File file = new File(System.getProperty(SysPropKey.DATA_PATH), "juihua_order_actual_amount/" +
                                                                            supplier + "/" +
                                                                            date.substring(0, 4) + "/" +
                                                                            date.substring(4, 6) + "/" +
                                                                            date + sequence + ".csv");
            List<String> lines = Files.readLines(file);

            Map<String, ActualAmountData> result = Maps.newHashMap();
            List<ActualAmountData> actualAmountDataList = CsvUtil.transform(lines, "\\|", ActualAmountData.class);
            for (ActualAmountData actualAmountData : actualAmountDataList) {
                result.put(actualAmountData.materialId, actualAmountData);
            }
            return result;
        }

        public String getFormattedDate() {
            return date.substring(0, 4) + "/" + date.substring(4, 6) + "/" + date.substring(6, 8);
        }

        public String getPathWithoutExtension() {
            return supplier + "/" + date.substring(0, 4) + "/" + date.substring(4, 6) + "/" + date + sequence;
        }

        public String getOrderId() {
            return date + supplier;
        }

        @Override
        public String toString() {
            return date + supplier + sequence;
        }
    }

    public static class ReceiveResult {
        public String datetime = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss").format(new Date());
        public String deliverId;
        public List<List<String>> itemList;
    }
}

