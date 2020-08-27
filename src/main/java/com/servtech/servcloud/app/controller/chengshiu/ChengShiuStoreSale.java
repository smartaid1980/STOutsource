package com.servtech.servcloud.app.controller.chengshiu;

import com.servtech.servcloud.app.model.chengshiu.AlertLog;
import com.servtech.servcloud.app.model.chengshiu.Customer;
import com.servtech.servcloud.app.model.chengshiu.StoreProduct;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.sql.BatchUpdateException;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static com.servtech.servcloud.core.util.SysPropKey.WEB_ROOT_PATH;

/**
 * Created by Frank on 2017/10/11.
 */

@RestController
@RequestMapping("/chengshiu/store/sale")
public class ChengShiuStoreSale {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(ChengShiuStoreSale.class);
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/createSalesRecord", method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        final String customerId = data.get("customer_id").toString();
        final List<Map> saleDetails = (List<Map>) data.get("sale_details");
        final List errorList = new ArrayList();

        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                try {
                    PreparedStatement batchToStoreSalesRecord = batchToStoreSalesRecord();
                    PreparedStatement batchToStoreProduct = batchToStoreProduct();
                    PreparedStatement batchToAlertLog = batchToAlertLog();
                    PreparedStatement batchToSameAlertLog = batchToSameAlertLog();

                    Map salesRecordMap = null;
                    Map salesProductMap = null;
//                  新增商店銷售紀錄於TABLE：STORE_SALES_RECORD，並更新STORE_PROUCT商店產品
//                  1.	新增商店銷售紀錄
//                  (1)	介面輸入X筆銷售品項紀錄，則新增於資料庫X筆銷售紀錄
//                  (2)	商店代碼=該登入商店帳號
//                  (3)	售出時間=紀錄送出當下時間
                    Timestamp currentTime = new Timestamp(System.currentTimeMillis());
                    Object user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    for (Map map : saleDetails) {
//                  (4)	產品代碼=介面紀錄之品號
                        String productId = map.get("product_id").toString();
                        String productName = map.get("product_name").toString();
//                  (5)	銷售數量=介面紀錄之數量(片)
                        String quantity = map.get("quantity").toString();
//                  (6)	總價=介面紀錄之小計
                        String total = map.get("total").toString();
                        List<Map> storeProductResult = StoreProduct.find("customer_id = ? AND product_id = ?", customerId, productId).toMaps();
                        int oldSpotPcs = Integer.parseInt(storeProductResult.get(0).get("spot_pcs").toString());

                        if (oldSpotPcs >= Integer.parseInt(quantity)) {
                            Base.addBatch(batchToStoreSalesRecord, customerId, currentTime, productId, quantity, total, user, currentTime, user, currentTime);

//                          2.	更新商店產品
                            int notReceive = Integer.parseInt(storeProductResult.get(0).get("not_receive").toString());
                            int bufferStock = Integer.parseInt(storeProductResult.get(0).get("buffer_stock").toString());
                            String createBy = storeProductResult.get(0).get("create_by").toString();
                            String createTime = storeProductResult.get(0).get("create_time").toString();

//                          (1)	現貨剩餘片數=原現貨剩餘片數-介面該產品銷售數量(片)
                            int newSpotPcs = oldSpotPcs - Integer.parseInt(quantity);
                            Base.addBatch(batchToStoreProduct, customerId, productId, newSpotPcs, createBy, createTime, user, currentTime);


                            List<Map> customerResult = Customer.find("customer_id = ?", customerId).toMaps();
                            String customerName = customerResult.get(0).get("customer_name").toString();
//                          3.	若商店產品(STORE_PROUCT商店產品)
//                          (現貨剩餘片數+未收貨片數)<安全存量(片)，則觸發商店低庫存提醒
                            int storeSumPcs = newSpotPcs + notReceive;

                            if (storeSumPcs < bufferStock) {
                                System.out.println("低庫存提醒");
                                AlertLog alertLog = new AlertLog();
//                          1.	提醒類別=商店低於安全庫存(type=F)
                                String typeId = "F";
//                          2.	商店產品剩餘總數=(現貨剩餘片數+未收貨片數)
//                          3.	提醒內容(content)=「% customer_id %：%product_name% (%product_id%)剩餘%商店產品剩餘總數%」如「商店A：口罩G01綠(G01)剩餘99片」
                                String content = customerName + ":" + productName + "(" + productId + ")剩餘" + storeSumPcs + "片";
//                          4.	商店代碼=該登入商店帳號 V
//                          5.	產品代碼=觸發通知的產品代碼(STORE_PROUCT.product_id) V
//                          6.	實際數值=產品剩餘總數 V
                                int valueAct = storeSumPcs;
//                          7.	應被觸發數值=該商店產品安全存量(片)( STORE_PROUCT.buffer_stock) V
//                          	若已有相同(商店、產品代碼)之通知紀錄且未確認(is_close=N)，則不可重複發通知，但須更新實際數值(value_act)
                                List<Map> alertLogResult = AlertLog.find("customer_id = ? AND product_id = ? AND is_close = ?", customerId, productId, "N").toMaps();
                                Map alertLogMap = null;
                                if (alertLogResult.size() > 0) {
                                    //update
                                    alertLogMap = alertLogResult.get(0);
                                    String createBy2 = alertLogMap.get("create_by").toString();
                                    String createTime2 = alertLogMap.get("create_time").toString();
                                    String logId = alertLogMap.get("log_id").toString();
                                    Base.addBatch(batchToSameAlertLog, logId, content, valueAct, createBy2, createTime2, user, currentTime);
                                } else {
                                    //insert
                                    String closed = "N";
                                    Base.addBatch(batchToAlertLog, typeId, content, customerId, productId, valueAct, bufferStock, closed, user, currentTime, user, currentTime);
                                }
                            }
                        } else {
                            Map errorMap = new HashMap();
                            errorMap.put("product_id", productId);
                            errorMap.put("spot_pcs", oldSpotPcs);
                            errorList.add(errorMap);
                        }
                    }

                    if (errorList.size() > 0) {
                        return fail(errorList);
                    }

                    Base.executeBatch(batchToStoreSalesRecord);
                    Base.executeBatch(batchToStoreProduct);
                    Base.executeBatch(batchToSameAlertLog);
                    Base.executeBatch(batchToAlertLog);
                    batchToStoreSalesRecord.close();
                    batchToStoreProduct.close();
                    batchToSameAlertLog.close();
                    batchToAlertLog.close();

                    return success("create success");
                } catch (BatchUpdateException e) {
                    e.printStackTrace();
                    return fail(e.getMessage());
                } catch (SQLException e) {
                    e.printStackTrace();
                    return fail(e.getMessage());
                } catch (Exception e) {
                    e.printStackTrace();
                    return fail(e.getMessage());
                }
            }
        });

    }

    public static PreparedStatement batchToStoreSalesRecord() {
        PreparedStatement ps = Base.startBatch("INSERT INTO `a_chengshiu_store_sales_record` " +
                "(`customer_id`, " +
                "`sale_time`, " +
                "`product_id`, " +
                "`quantity`, " +
                "`total`, " +
                "`create_by`, " +
                "`create_time`, " +
                "`modify_by`, " +
                "`modify_time`) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE " +
                "`customer_id` = VALUES(customer_id), " +
                "`sale_time` = VALUES(sale_time), " +
                "`product_id` = VALUES(product_id), " +
                "`quantity` = VALUES(quantity), " +
                "`total` = VALUES(total), " +
                "`create_by` = VALUES(create_by), " +
                "`create_time` = VALUES(create_time), " +
                "`modify_by` = VALUES(modify_by), " +
                "`modify_time` = VALUES(modify_time)");
        return ps;
    }

    public static PreparedStatement batchToStoreProduct() {
        PreparedStatement ps = Base.startBatch("INSERT INTO `a_chengshiu_store_product` " +
                "(`customer_id`, " +
                "`product_id`, " +
                "`spot_pcs`, " +
                "`create_by`, " +
                "`create_time`, " +
                "`modify_by`, " +
                "`modify_time`) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE " +
                "`customer_id` = VALUES(customer_id), " +
                "`product_id` = VALUES(product_id), " +
                "`spot_pcs` = VALUES(spot_pcs), " +
                "`create_by` = VALUES(create_by), " +
                "`create_time` = VALUES(create_time), " +
                "`modify_by` = VALUES(modify_by), " +
                "`modify_time` = VALUES(modify_time)");
        return ps;
    }

    public static PreparedStatement batchToAlertLog() {
        PreparedStatement ps = Base.startBatch("INSERT INTO `a_chengshiu_alert_log` " +
                "(`type_id`, " +
                "`content`, " +
                "`customer_id`, " +
                "`product_id`, " +
                "`value_act`, " +
                "`value_est`, " +
                "`is_close`, " +
                "`create_by`, " +
                "`create_time`, " +
                "`modify_by`, " +
                "`modify_time`) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE " +
                "`type_id` = VALUES(type_id), " +
                "`content` = VALUES(content), " +
                "`customer_id` = VALUES(customer_id), " +
                "`product_id` = VALUES(product_id), " +
                "`value_act` = VALUES(value_act), " +
                "`value_est` = VALUES(value_est), " +
                "`is_close` = VALUES(is_close), " +
                "`create_by` = VALUES(create_by), " +
                "`create_time` = VALUES(create_time), " +
                "`modify_by` = VALUES(modify_by), " +
                "`modify_time` = VALUES(modify_time)");
        return ps;
    }

    public static PreparedStatement batchToSameAlertLog() {
        PreparedStatement ps = Base.startBatch("INSERT INTO `a_chengshiu_alert_log` " +
                "(`log_id`, " +
                "`content`, " +
                "`value_act`, " +
                "`create_by`, " +
                "`create_time`, " +
                "`modify_by`, " +
                "`modify_time`) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE " +
                "`log_id` = VALUES(log_id), " +
                "`content` = VALUES(content), " +
                "`value_act` = VALUES(value_act), " +
                "`create_by` = VALUES(create_by), " +
                "`create_time` = VALUES(create_time), " +
                "`modify_by` = VALUES(modify_by), " +
                "`modify_time` = VALUES(modify_time)");
        return ps;
    }

    @RequestMapping(value = "/readProductName", method = RequestMethod.GET)
    public RequestResult<List<Map>> readProductName(@RequestParam("productId") final String productId) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT product_id, product_name, price from a_chengshiu_store_product ");
                sb.append("WHERE ");
                sb.append("product_id = '" + productId + "'");
                String sql = sb.toString();
                log.info(sql);
                return success(StoreProduct.findBySQL(sql).toMaps());
            }
        });
    }

    @RequestMapping(value = "/readSaleDetail", method = RequestMethod.POST)
    public RequestResult<List<Map>> readSaleDetail(@RequestBody final Map data) {

        String str = null;
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd hh:mm:ss");
        SimpleDateFormat sdf2 = new SimpleDateFormat("yyyyMMdd");
        List<Map> dataList = new ArrayList<Map>();
        File webRootPath = new File(System.getProperty(WEB_ROOT_PATH));
        File salesRecordDirectory = new File(webRootPath.getParentFile().getParentFile().getPath() + "/salesRecord");
        String[] containFileNames = salesRecordDirectory.list();
        try {
            Date startDate = sdf.parse(data.get("startDate").toString());
            Date endDate = sdf.parse(data.get("endDate").toString());

            for (String fileName : containFileNames) {
                //移除.csv字串取得 ex.20170808
                String dateString = fileName.substring(0, fileName.lastIndexOf("."));
                Date fileDate = sdf2.parse(dateString);
                //判斷檔案日期名是否包含查詢的時間區間
                if (startDate.getTime() <= fileDate.getTime() && fileDate.getTime() <= endDate.getTime()) {
                    FileReader csv = new FileReader(webRootPath.getParentFile().getParentFile().getPath() + "/salesRecord/" + fileName);
                    BufferedReader br = new BufferedReader(csv);
                    int i = 0;
                    while ((str = br.readLine()) != null) {
                        if (i != 0) {
                            String[] array = str.split(",");
                            Map map = new HashMap();
                            map.put("sale_time", array[0]);
                            map.put("product_id", array[1]);
                            map.put("product_name", array[2]);
                            map.put("unit_price", array[3]);
                            map.put("sale_quantity", array[4]);
                            map.put("subtotal", array[5]);
                            dataList.add(map);
                        }
                        i++;
                    }
                }
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return success(dataList);
    }

}
