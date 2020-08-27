package com.servtech.servcloud.app.controller.chengshiu;

import com.servtech.servcloud.app.model.chengshiu.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/10/11.
 */

@RestController
@RequestMapping("/chengshiu/storeOrderManagement")
public class ChengShiuStoreOrderManagement {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(ChengShiuStoreOrderManagement.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/readOrder", method = RequestMethod.POST)
    public RequestResult<?> readOrder(@RequestBody final Map data) {
        final String customerId = data.get("customer_id").toString();
        final String startDate = data.get("start_date") == null ? "" : data.get("start_date").toString();
        final String endDate = data.get("end_date") == null ? "" : data.get("end_date").toString();
        final String orderId = data.get("order_id") == null ? "" : data.get("order_id").toString();
        try {
            return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    StringBuilder sb = new StringBuilder();
                    sb.append("SELECT order_id, shipping_quantity, create_time, total_quantity, status_id, arrival_date FROM a_chengshiu_sales_order ");
                    if (!"".equals(orderId) && !orderId.equals("null")) {
                        sb.append("WHERE order_id = '" + orderId + "' ");
                    } else if (!"".equals(startDate) && !startDate.equals("null")) {
                        sb.append("WHERE ");
                        sb.append("(create_time BETWEEN ");
                        sb.append("'" + startDate + " 00:00:00' ");
                        sb.append("AND ");
                        sb.append("'" + endDate + " 23:59:59') ");
                    } else {
                        sb.append("WHERE status_id = '0' ");
                    }
                    sb.append("AND ");
                    sb.append("customer_id = '" + customerId + "'");

                    String sql = sb.toString();
                    System.out.println(sql);
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
                    List<Map> result = SalesOrder.findBySQL(sql).toMaps();
                    for (Map data : result) {
                        data.put("arrival_date", sdf.format(data.get("arrival_date")));
                        data.put("create_time", sdf.format(data.get("create_time")));
                    }
                    return success(result);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }


    @RequestMapping(value = "/updateOrder", method = RequestMethod.POST)
    public RequestResult<?> updateOrder(@RequestBody final Map data) {
        final String orderId = data.get("order_id").toString();
        final String totalQuantity = data.get("total_quantity").toString();
        final String customerId = data.get("customer_id").toString();
        final List<Map> checkInDetails = (List<Map>) data.get("check_in_details");
        final List<String> traces = (List<String>) data.get("traces");
        try {
            return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    //	完畢後，點選提交更新訂單資料(SALES_ORDER訂單、SALES_ORDER_DETAILS訂單明細)
                    SalesOrder salesOrder = new SalesOrder();

                    //1.	訂單未到貨箱數(SALES_ORDER.not_done)=原未到貨箱數-掃描/輸入總數
                    List<Map> orderResult = SalesOrder.find("order_id = ?", orderId).toMaps();
                    int oldNotDone = Integer.parseInt(orderResult.get(0).get("not_done").toString());
                    int newNotDone = oldNotDone - Integer.parseInt(totalQuantity);
                    Map orderMap = new HashMap();
                    orderMap.put("order_id", orderId);
                    orderMap.put("not_done", newNotDone);
                    orderMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    orderMap.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    //2.	若訂單未到貨箱數=0，訂單狀態為結案(SALES_ORDER.status_id=2)
                    if (newNotDone == 0) {
                        orderMap.put("status_id", "2");
                    }
                    salesOrder.fromMap(orderMap);

                    boolean orderDetailsIsUpdateSuccess = false;
                    boolean traceUpdateIsSuccess = false;
                    SalesOrderDetails salesOrderDetails = new SalesOrderDetails();
                    for (Map map : checkInDetails) {
                        String productId = map.get("product_id").toString();
                        int checkInQuantity = Integer.parseInt(map.get("check_in_quantity").toString());
                        List<Map> orderDetalsResult = SalesOrderDetails.find("order_id = ? AND product_id = ?", orderId, productId).toMaps();
                        int oldNotDoneDetail = Integer.parseInt(orderDetalsResult.get(0).get("not_done").toString());
                        //3.	訂單明細未到貨箱數(SALES_ORDER_DETAILS.not_done)=原未到箱數-該品項掃描/輸入總數
                        int newNotDoneDetail = oldNotDoneDetail - checkInQuantity;

                        Map detailMap = new HashMap();
                        detailMap.put("order_id", orderId);
                        detailMap.put("product_id", productId);
                        detailMap.put("not_done", newNotDoneDetail);
                        detailMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        detailMap.put("modify_time", new Timestamp(System.currentTimeMillis()));
                        //4.	若訂單明細未到貨箱數=0，訂單細項狀態為結案(SALES_ORDER_DETAILS.status_id=2)
                        if (newNotDoneDetail == 0) {
                            detailMap.put("status_id", "2");
                        }
                        salesOrderDetails.fromMap(detailMap);
                        orderDetailsIsUpdateSuccess = salesOrderDetails.saveIt();

                    }
                    boolean storeProductIsSuccess = false;

                    //5.	成品箱狀態更新為送達商店(TRACE.status_id=5)、商店填入進貨商店客戶(TRACE.customer_id)
                    for (String traceId : traces) {
                        Trace trace = new Trace();
                        Map traceMap = new HashMap();
                        traceMap.put("trace_id", traceId);
                        traceMap.put("status_id", "5");
                        traceMap.put("customer_id", customerId);
                        traceMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        traceMap.put("modify_time", new Timestamp(System.currentTimeMillis()));
                        trace.fromMap(traceMap);
                        traceUpdateIsSuccess = trace.saveIt();

                        //6.   進貨更新商店庫存數，減少未收貨數not_receive，增加剩餘片數spot_pcs
                        List<Map> traceResult = Trace.find("trace_id = ?", traceId).toMaps();
                        String productId = traceResult.get(0).get("product_id").toString();
                        int inBoxPcs = Integer.parseInt(traceResult.get(0).get("inbox_pcs").toString());

                        List<Map> storeProductResult = StoreProduct.find("customer_id = ? AND product_id = ?", customerId, productId).toMaps();
                        int oldSpotPcs = Integer.parseInt(storeProductResult.get(0).get("spot_pcs").toString());
                        int oldNotReceive = Integer.parseInt(storeProductResult.get(0).get("not_receive").toString());

                        int newSpotPcs = oldSpotPcs + inBoxPcs;
                        int newNotReceive = oldNotReceive - inBoxPcs;

                        StoreProduct storeProduct = new StoreProduct();
                        Map storeProdUpdatedata = new HashMap();
                        storeProdUpdatedata.put("customer_id", customerId);
                        storeProdUpdatedata.put("product_id", productId);
                        storeProdUpdatedata.put("spot_pcs", newSpotPcs);
                        storeProdUpdatedata.put("not_receive", newNotReceive);
                        storeProdUpdatedata.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        storeProdUpdatedata.put("modify_time", new Timestamp(System.currentTimeMillis()));
                        storeProduct.fromMap(storeProdUpdatedata);
                        storeProductIsSuccess = storeProduct.saveIt();
                    }

                    if (salesOrder.saveIt() && orderDetailsIsUpdateSuccess && traceUpdateIsSuccess && storeProductIsSuccess) {
                        return success("update success!");
                    } else {
                        return fail("update fail");
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/createOrder", method = RequestMethod.POST)
    public RequestResult<?> createOrder(@RequestBody final Map data) {
        final String customerId = data.get("customer_id").toString();
        final String totalQuantity = data.get("total_quantity").toString();
        final String arrivalDate = data.get("arrival_date").toString();
        final List<Map> orderDetail = (List<Map>) data.get("order_detail");
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    boolean OrderInsertIsSuccess = false;
                    boolean OrderDetailsInsertIsSuccess = false;
                    boolean productInsertIsSuccess = false;
                    boolean storeProductInsertIsSuccess = false;

                    final String prefix = "ORD";
                    SimpleDateFormat sdf = new SimpleDateFormat("yyMM");
                    final String currDate = sdf.format(new Date());
                    final List<Map> maxCount = Base.findAll("SELECT COUNT(*) as count FROM a_chengshiu_sales_order WHERE order_id like '" + prefix + currDate + "%'");
                    long count = Long.parseLong(maxCount.get(0).get("count").toString());
                    count++;
                    String orderId = prefix + currDate + String.format("%03d", count);

                    StoreProduct storeProduct = new StoreProduct();
                    Product product = new Product();
                    SalesOrder salesOrder = new SalesOrder();
                    SalesOrderDetails salesOrderDetails = new SalesOrderDetails();

                    Map orderMap = new HashMap();
                    //SALES_ORDER訂單：新增訂單紀錄
                    //訂單代碼：ORD+YY+MM+流水號3碼 V
                    orderMap.put("order_id", orderId);
                    //客戶：登入帳號所屬商店 V
                    orderMap.put("customer_id", customerId);
                    //訂單總箱數：本次訂購所有細項箱數加總 V
                    orderMap.put("total_quantity", totalQuantity);
                    //預定到貨日：介面輸入 V
                    orderMap.put("arrival_date", arrivalDate);

                    //已出貨箱數：0（出貨時更新）
                    orderMap.put("shipping_quantity", 0);
                    //未出貨箱數：等同於訂單總箱數。（出貨時更新）
                    orderMap.put("not_done", totalQuantity);
                    //預定出貨日：等同於預定到貨日
                    orderMap.put("shipping_date", arrivalDate);
                    //訂單狀態：0(開立)
                    orderMap.put("status_id", 0);
                    orderMap.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    orderMap.put("create_time", new Timestamp(System.currentTimeMillis()));
                    orderMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    orderMap.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    salesOrder.fromMap(orderMap);
                    OrderInsertIsSuccess = salesOrder.insert();

                    //SALES_ORDER_DETAILS訂單明細：將各比細項新增入訂單明細
                    Map orderDetailMap = null;
                    Map pdMap = null;
                    for (Map record : orderDetail) {
                        orderDetailMap = new HashMap();
                        String productId = record.get("product_id").toString();
                        String orderQuantity = record.get("order_quantity").toString();

                        //訂單代碼(SALES_ORDER_DETAILS.order_id)=訂單代碼(SALES_ORDER.order_id)
                        orderDetailMap.put("order_id", orderId);
                        //產品代碼 = 介面品項輸入之產品代碼
                        orderDetailMap.put("product_id", productId);
                        //訂購箱數 = 該品項介面輸入之訂購箱數
                        orderDetailMap.put("order_quantity", orderQuantity);
                        //已出貨箱數= 0 (出貨時更新)
                        orderDetailMap.put("shipping_quantity", 0);
                        //未到出貨箱數 = 等同於訂購箱數
                        orderDetailMap.put("not_done", orderQuantity);
                        //細項狀態 = 0(開立)
                        orderDetailMap.put("status_id", 0);
                        orderDetailMap.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        orderDetailMap.put("create_time", new Timestamp(System.currentTimeMillis()));
                        orderDetailMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        orderDetailMap.put("modify_time", new Timestamp(System.currentTimeMillis()));

                        salesOrderDetails.fromMap(orderDetailMap);
                        OrderDetailsInsertIsSuccess = salesOrderDetails.insert();

                        //PRODUCT產品：依據訂購結果，更新工廠的產品資料
                        //應出貨總數：累計該產品本次訂購箱數加入原應出貨總數
                        List<Map> pdResult = Product.find("product_id = ?", productId).toMaps();
                        int oldBookingStock = Integer.parseInt(pdResult.get(0).get("booking_stock").toString());
                        int sumBookingStock = Integer.parseInt(orderQuantity) + oldBookingStock;
                        pdMap = new HashMap();
                        pdMap.put("product_id", productId);
                        pdMap.put("booking_stock", sumBookingStock);
                        pdMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        pdMap.put("modify_time", new Timestamp(System.currentTimeMillis()));
                        product.fromMap(pdMap);
                        productInsertIsSuccess = product.saveIt();


                        //STORE_PROUCT商店產品：
                        List<Map> spResult = StoreProduct.find("customer_id = ? AND product_id = ?", customerId, productId).toMaps();
                        List<Map> conFactorResult = ConversionFactor.find("conv_id = ?", "box_to_pcs").toMaps();
                        //未收貨片數＝將各品項訂購箱數×箱_片轉換係數累計加入原未收貨片數
                        int boxToPcs = Integer.parseInt(conFactorResult.get(0).get("conv_factor").toString());
                        int oldNotReceive = Integer.parseInt(spResult.get(0).get("not_receive").toString());
                        int sumNotReceive = Integer.parseInt(orderQuantity) * boxToPcs + oldNotReceive;
                        Map storeProductMap = new HashMap();
                        storeProductMap.put("customer_id", customerId);
                        storeProductMap.put("product_id", productId);

                        storeProductMap.put("not_receive", sumNotReceive);
                        storeProductMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        storeProductMap.put("modify_time", new Timestamp(System.currentTimeMillis()));
                        storeProduct.fromMap(storeProductMap);
                        storeProductInsertIsSuccess = storeProduct.saveIt();
                    }

                    if (OrderInsertIsSuccess && OrderDetailsInsertIsSuccess && productInsertIsSuccess && storeProductInsertIsSuccess) {
                        return success("create success");
                    } else {
                        return fail("create fail");
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/readOrderDetail", method = RequestMethod.POST)
    public RequestResult<?> readOrderDetail(@RequestBody final Map data) {
        final String orderId = data.get("order_id").toString();
        try {
            return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    List<Map> result = new ArrayList<Map>();
                    Map map = new HashMap();
                    map.put("product_id", "B01");
                    map.put("product_name", "口罩B01(藍)");
                    map.put("order_number", "1");
                    map.put("amount", "1000");
                    result.add(map);
                    return success(result);
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }


    @RequestMapping(value = "/updateStorineNumber", method = RequestMethod.POST)
    public RequestResult<?> updateStorineNumber(@RequestBody final Map data) {
        final String productId = data.get("product_id").toString();
        final String storeNumber = data.get("store_number").toString();
        try {
            return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    System.out.println(productId);
                    System.out.println(storeNumber);
                    return success("Update success!");
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }
}
