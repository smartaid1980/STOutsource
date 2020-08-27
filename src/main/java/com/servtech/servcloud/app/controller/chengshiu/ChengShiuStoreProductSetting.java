package com.servtech.servcloud.app.controller.chengshiu;

import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.oned.Code128Writer;
import com.google.zxing.qrcode.QRCodeWriter;
import com.servtech.servcloud.app.model.chengshiu.Product;
import com.servtech.servcloud.app.model.chengshiu.StoreProduct;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.util.Units;
import org.apache.poi.xwpf.usermodel.*;
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

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/10/11.
 */

@RestController
@RequestMapping("/chengshiu/store/productSetting")
public class ChengShiuStoreProductSetting {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(ChengShiuStoreProductSetting.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                    StoreProduct storeProduct = new StoreProduct();
                    storeProduct.fromMap(data);

                    if (storeProduct.insert()) {
                        return success(storeProduct.getString("product_id") + " create success!");
                    } else {
                        return fail("create fail...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        final String customerId = data.get("customer_id").toString();
        final String productId = data.get("product_id").toString();
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));


                    StoreProduct storeProduct = new StoreProduct();
                    storeProduct.fromMap(data);
                    List<Map> queryStoreProduct = StoreProduct.find("customer_id = ? AND product_id = ?", customerId, productId).toMaps();

                    // store_product 沒有資料無法修改則改為新增
                    if (queryStoreProduct.size() == 0) {
                        data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        data.put("create_time", new Timestamp(System.currentTimeMillis()));
                        storeProduct.fromMap(data);
                        if (storeProduct.insert()) {
                            return success("insert success");
                        } else {
                            return fail("insert fail");
                        }
                    } else {
                        storeProduct.fromMap(data);
                        if (storeProduct.saveIt()) {
                            return success("update success");
                        } else {
                            return fail("update fail");
                        }
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                return success(StoreProduct.findAll().toMaps());
            }
        });
    }

    @RequestMapping(value = "/readStoreProduct", method = RequestMethod.GET)
    public RequestResult<?> readStoreProduct(@RequestParam("customerId") final String customerId) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    //列出工廠端(PROUCT商店產品)所有產品
                    //1.	售出單價、安全庫存(片)、是否啟用，資料來自TABLE：STORE_PROUCT商店產品
                    List<Map> queryProduct = Product.findAll().toMaps();
                    List<Map> result = new ArrayList<Map>();
                    Map productMap = null;
                    for (Map map : queryProduct) {
                        String  productId = map.get("product_id").toString();
                        String productName = map.get("product_name").toString();
                        String productStatus = map.get("is_open").toString();
                        List<Map> queryStoreProduct = StoreProduct.find("customer_id = ? AND product_id = ?", customerId, productId).toMaps();
                            //2.	若TABLE：STORE_PROUCT商店產品無該品項資料，則售出單價顯示0，安全庫存顯示0，是否啟用顯示為”不啟用”
                        if (productStatus.equals("Y") && queryStoreProduct.size() == 0) {
                            productMap = new HashMap();
                            productMap.put("product_id", productId);
                            productMap.put("product_name", productName);
                            productMap.put("customer_id", customerId);
                            productMap.put("sale_price", 0);
                            productMap.put("buffer_stock", 0);
                            productMap.put("is_open", "N");
                            productMap.put("spot_pcs", 0);
                            productMap.put("not_receive", 0);
                            result.add(productMap);
                            //4.	若工廠產品為不啟用(PRODUCT.is_open=N)，且TABLE：STORE_PROUCT商店產品”無”該品項資料，則不顯示
                        } else if (productStatus.equals("N") && queryStoreProduct.size() == 0) {
                            //5.	若工廠產品為不啟用(PRODUCT.is_open=N)，且TABLE：STORE_PROUCT商店產品”有”該品項資料，
                            // 則售出單價、安全庫存，依STORE_PROUCT商店產品資料；是否啟用欄位顯示為”工廠停產”，並且不得編輯該列是否啟用
                        } else if (productStatus.equals("N") && queryStoreProduct.size() != 0) {
                            productMap = new HashMap();
                            productMap.put("product_id", productId);
                            productMap.put("product_name", productName);
                            productMap.put("customer_id", customerId);
                            productMap.put("sale_price", queryStoreProduct.get(0).get("sale_price").toString());
                            productMap.put("buffer_stock", queryStoreProduct.get(0).get("buffer_stock").toString());
                            productMap.put("is_open", queryStoreProduct.get(0).get("is_open").toString());
                            productMap.put("is_stop", true);
                            productMap.put("spot_pcs", queryStoreProduct.get(0).get("spot_pcs").toString());
                            productMap.put("not_receive", queryStoreProduct.get(0).get("not_receive").toString());
                            result.add(productMap);
                            //3.	若工廠產品為啟用(PRODUCT.is_open=Y)，且TABLE：STORE_PROUCT商店產品”有”該品項資料，則售出單價、安全庫存、是否啟用依STORE_PROUCT商店產品資料
                        } else {
                            productMap = new HashMap();
                            productMap.put("product_id", productId);
                            productMap.put("product_name", productName);
                            productMap.put("customer_id", customerId);
                            productMap.put("sale_price", queryStoreProduct.get(0).get("sale_price").toString());
                            productMap.put("buffer_stock", queryStoreProduct.get(0).get("buffer_stock").toString());
                            productMap.put("is_open", queryStoreProduct.get(0).get("is_open").toString());
                            productMap.put("spot_pcs", queryStoreProduct.get(0).get("spot_pcs").toString());
                            productMap.put("not_receive", queryStoreProduct.get(0).get("not_receive").toString());
                            result.add(productMap);
                        }
                    }
                    return success(result);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/printCode", method = RequestMethod.POST)
    //前端call servkit.downloadFile方法只能使用RequestParam方式回傳
    public void printCode(@RequestParam("datas") final String datas,
                          @RequestParam("printType") final String printType) {
        ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {

            @Override
            public RequestResult<Void> operate() {
                final String QR_CODE = "QrCode";
                final String CODE_128 = "Code128";
                UUID uuid = UUID.randomUUID();
                Type type = new TypeToken<List<Map<String, String>>>() {}.getType();
                List<Map> dataList = new Gson().fromJson(datas, type);

                if (dataList.size() > 0) {
                    String modelPath = null;
                    XWPFDocument document = null;
                    if (printType.equals(QR_CODE)) {
                        modelPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/CSUStore/program/form_qrcode.docx";
                    } else if (printType.equals(CODE_128)) {
                        modelPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/CSUStore/program/form_code128.docx";
                    }


                    final String outputFolder = System.getProperty(SysPropKey.ROOT_PATH) + "/app/CSUStore/program/" + uuid;
                    if (!new File(outputFolder).exists()) {
                        new File(outputFolder).mkdirs();
                    }

                    try {
                        FileInputStream input = new FileInputStream(modelPath);
                        FileInputStream imgInput = null;
                        document = new XWPFDocument(input);
                        XWPFTable module = document.getTables().get(0);
                        FileOutputStream output = new FileOutputStream(outputFolder + "/" + uuid + ".docx");

                        final int MAX_COUNT = 33;
                        int pageCount = 0;

                        if (dataList.size() > MAX_COUNT) {
                            pageCount = getPageCount(dataList.size());
                            for (int page = 0; page < pageCount; page++) {
                                document.createTable();
                                document.setTable((page + 1), module);
                            }
                            document.write(output);
                            output.close();
                            input.close();
                            input = new FileInputStream(outputFolder + "/" + uuid + ".docx");
                            document = new XWPFDocument(input);
                        }

                        List<XWPFTable> tableList = document.getTables();
                        XWPFTable table = null;
                        XWPFTableCell cell = null;
                        XWPFParagraph paragraph = null;
                        XWPFRun r = null;
                        int tableIndex = 0;
                        int rowIndex = 0;
                        int cellIndex = 0;


                        for (int i = 0; i < dataList.size(); i++) {
                            Map<String, Object> map = dataList.get(i);
                            table = tableList.get(tableIndex);
                            String id = map.get("id").toString();
                            String name = map.get("name").toString();
                            String imgPath = outputFolder + "/" + id + ".png";

                            int width = 0;
                            int height = 0;
                            if (printType.equals(QR_CODE)) {
                                cell = table.getRow(rowIndex).getCell(cellIndex);
                                paragraph = cell.getParagraphs().get(0);
                                r = paragraph.createRun();
                                QRcodeService.createQrCode(id, imgPath);
                                width = Units.toEMU(68);
                                height = Units.toEMU(68);
                                imgInput = new FileInputStream(imgPath);
                                r.addPicture(imgInput, XWPFDocument.PICTURE_TYPE_PNG, imgPath, width, height);
                                imgInput.close();

                                cell = table.getRow(rowIndex).getCell(cellIndex += 1);
                                cell.setVerticalAlignment(XWPFTableCell.XWPFVertAlign.TOP);
                                paragraph = cell.getParagraphs().get(0);
                                r = paragraph.createRun();
                                r.setFontSize(8);
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
                                        rowIndex++;
                                        cellIndex = 0;
                                    }
                                } else {
                                    cellIndex++;
                                }
                            } else if (printType.equals(CODE_128)) {
                                cell = table.getRow(rowIndex).getCell(cellIndex);
                                paragraph = cell.getParagraphs().get(0);
                                paragraph.setAlignment(ParagraphAlignment.CENTER);
                                r = paragraph.createRun();
                                QRcodeService.createCode128(id, imgPath);
                                width = Units.toEMU(110);
                                height = Units.toEMU(30);
                                imgInput = new FileInputStream(imgPath);
                                r.addPicture(imgInput, XWPFDocument.PICTURE_TYPE_PNG, imgPath, width, height);
                                imgInput.close();
                                cell = table.getRow(rowIndex + 1).getCell(cellIndex);
                                cell.setVerticalAlignment(XWPFTableCell.XWPFVertAlign.TOP);
                                paragraph = cell.getParagraphs().get(0);
                                paragraph.setAlignment(ParagraphAlignment.CENTER);
                                r = paragraph.createRun();
                                r.setFontSize(8);
                                r.setText(id);
                                r.addBreak();
                                r.setText(name);
                                if (cellIndex == 2) {
                                    if (rowIndex == 20) {
                                        tableIndex++;
                                        rowIndex = 0;
                                        cellIndex = 0;
                                    } else {
                                        rowIndex += 2;
                                        cellIndex = 0;
                                    }
                                } else {
                                    cellIndex++;
                                }
                            }
                        }
                        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
                        String mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                        String headerKey = "Content-Disposition";
                        String headerValue = "attachment; filename=\" " + sdf.format(new Date()) + ".docx\"";
//                      unit test
//                        FileOutputStream testOutput = new FileOutputStream(System.getProperty(SysPropKey.ROOT_PATH) + "/app/CSUStore/program/testOutput.docx");
//                        document.write(testOutput);

                        response.setContentType(mimeType);
                        response.setHeader(headerKey, headerValue);
                        ServletOutputStream out = response.getOutputStream();
                        document.write(out);
                        output.close();
                        out.flush();
                        out.close();

//                        input.close();

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

    static int getPageCount(int countNum) {
        int onePageMaxCount = 33;
        int result = countNum / onePageMaxCount;
        if (countNum % onePageMaxCount == 0) {
            result -= 1;
        }
        return result;
    }

    static class QRcodeService {

        private static final int WIDTH_QRCODE =  1152;
        private static final int HEIGHT_QRCODE = 1152;
        private static final int WIDTH_CODE128 =  1100;
        private static final int HEIGHT_CODE128 = 520;
        private static final int WHITE = 255 << 16 | 255 << 8 | 255;
        private static final int BLACK = 0;
        private static final String ENCODE = "UTF-8";
        private static Hashtable hints;

        static {
            hints = new Hashtable();
            hints.put(EncodeHintType.CHARACTER_SET, ENCODE);
        }

        public static void createCode128(String content, String filePath) {

            Code128Writer writer = new Code128Writer();

            BufferedImage image = new BufferedImage(WIDTH_CODE128, HEIGHT_CODE128, BufferedImage.TYPE_INT_RGB);
            try {
                BitMatrix bitMatrix = writer.encode(content, BarcodeFormat.CODE_128, WIDTH_CODE128, HEIGHT_CODE128, hints);

                for (int i = 0; i < WIDTH_CODE128; i++) {
                    for (int j = 0; j < HEIGHT_CODE128; j++) {
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

        public static void createQrCode(String content, String filePath) {

            QRCodeWriter writer = new QRCodeWriter();
            BufferedImage image = new BufferedImage(WIDTH_QRCODE, HEIGHT_QRCODE, BufferedImage.TYPE_INT_RGB);
            try {
                BitMatrix bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, WIDTH_QRCODE, HEIGHT_QRCODE, hints);

                for (int i = 0; i < WIDTH_QRCODE; i++) {
                    for (int j = 0; j < HEIGHT_QRCODE; j++) {
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
    }
}
