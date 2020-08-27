package com.servtech.servcloud.app.controller.chengshiu;

import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import com.servtech.servcloud.app.model.chengshiu.Customer;
import com.servtech.servcloud.app.model.chengshiu.SalesOrder;
import com.servtech.servcloud.app.model.chengshiu.SalesOrderDetails;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.model.SysUser;
import com.servtech.servcloud.module.model.SysUserGroup;
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
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.app.controller.chengshiu.ChengShiuUtilities.updateProductStock;
import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/10/11.
 */

@RestController
@RequestMapping("/chengshiu/factoryorder")
public class ChengShiuFactoryOrder {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(ChengShiuFactoryOrder.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        final String prefix = "ORD";
        final String customerId = data.get("customer_id").toString();
        final String totalQuantity = data.get("total_quantity").toString();
        final String shippingQuantity = "0";
        final String notDone = totalQuantity;
        final String shippingDate = data.get("shipping_date").toString();
        final String arrivalDate = shippingDate;
        final String statusId = "0";
        final List<Map<String, String>> detailList = (List) data.get("order_details");

        final Object createBy = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        final Timestamp createTime = new Timestamp(System.currentTimeMillis());
        final Object modifyBy = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        final Timestamp modifyTime = new Timestamp(System.currentTimeMillis());

        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    boolean orderIsInsert = false;
                    boolean orderDetailsIsInsert = false;
                    SimpleDateFormat sdf = new SimpleDateFormat("yyMM");
                    final String currDate = sdf.format(new Date());

                    StringBuilder sb = new StringBuilder();
                    sb.append("SELECT COUNT(*) as count FROM a_chengshiu_sales_order ");
                    sb.append("WHERE order_id LIKE '" + prefix + currDate + "%'");
                    String sql = sb.toString();

                    final List<Map> maxCount = Base.findAll(sql);
                    long count = Long.parseLong(maxCount.get(0).get("count").toString());
                    count++;
                    String orderId = prefix + currDate + String.format("%03d", count);

                    Map order = new HashMap();
                    order.put("order_id", orderId);
                    order.put("customer_id", customerId);
                    order.put("total_quantity", totalQuantity);
                    order.put("shipping_quantity", shippingQuantity);
                    order.put("not_done", notDone);
                    order.put("arrival_date", arrivalDate);
                    order.put("shipping_date", shippingDate);
                    order.put("status_id", statusId);
                    order.put("create_by", createBy);
                    order.put("create_time", createTime);
                    order.put("modify_by", modifyBy);
                    order.put("modify_time", modifyTime);
                    SalesOrder salesOrder = new SalesOrder();
                    salesOrder.fromMap(order);
                    orderIsInsert = salesOrder.insert();


                    SalesOrderDetails salesOrderDetails = new SalesOrderDetails();
                    Map orderDetails = new HashMap();
                    Map productMap = new HashMap();


                    for (Map<String, String> map : detailList) {

                        orderDetails.put("order_id", orderId);
                        orderDetails.put("product_id", map.get("product_id"));
                        orderDetails.put("order_quantity", map.get("order_quantity"));
                        orderDetails.put("shipping_quantity", shippingQuantity);
                        orderDetails.put("not_done", map.get("order_quantity"));
                        orderDetails.put("status_id", statusId);
                        orderDetails.put("create_by", createBy);
                        orderDetails.put("create_time", createTime);
                        orderDetails.put("modify_by", modifyBy);
                        orderDetails.put("modify_time", modifyTime);
                        salesOrderDetails.fromMap(orderDetails);
                        orderDetailsIsInsert = salesOrderDetails.insert();

                        //應出貨總數=該品項於SALES_ORDER_DETAILS訂單明細中，未出貨總數加總
                        updateProductStock(map.get("product_id").toString(), modifyBy.toString());
                    }

                    if (orderIsInsert && orderDetailsIsInsert) {
                        return success(orderId);
                    } else {
                        return fail("create fail...");
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }


    @RequestMapping(value = "/read", method = RequestMethod.POST)
    public RequestResult<List<Map>> read(@RequestBody final Map data) {
        final String startDate = data.get("startDate") == null ? "" : data.get("startDate").toString();
        final String endDate = data.get("endDate") == null ? "" : data.get("endDate").toString();
        final String orderId = data.get("orderId") == null ? "" : data.get("orderId").toString();
        final List<String> status = (List) data.get("status");

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT order_id, customer_id, create_time, total_quantity, shipping_quantity, shipping_date, status_id FROM a_chengshiu_sales_order ");
                sb.append("WHERE ");
                if (!"".equals(startDate) && !startDate.equals("null") && !"".equals(endDate) && !endDate.equals("null")) {
                    sb.append("(create_time BETWEEN ");
                    sb.append("'" + startDate + " 00:00:00'" + " AND '" + endDate + " 23:59:59') ");
                }
                if (status.size() > 0) {
                    sb.append("status_id NOT IN " + strSplitBy(",", status));
                }
                if (!"".equals(orderId) && !orderId.equals("null")) {
                    sb.append("order_id = '" + orderId + "' ");
                }

                String sql = sb.toString();
                log.info(sql);
                List<Map> DBQueryResult = SalesOrder.findBySQL(sql).toMaps();
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
                for (Map map : DBQueryResult) {
                    String shippingDate = sdf.format(map.get("shipping_date"));
                    String createTime = sdf.format(map.get("create_time"));
                    map.put("shipping_date", shippingDate);
                    map.put("create_time", createTime);
                }
                return success(DBQueryResult);
            }
        });
    }

    @RequestMapping(value = "/createCustomer", method = RequestMethod.POST)
    public RequestResult<?> createCustomer(@RequestBody final Map data) {
        final String customerId = data.get("customer_id").toString();
        final String customerName = data.get("customer_name").toString();
        final String groupId = "sys_chengshiu_store_group";
        final Object createBy = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        final Timestamp createTime = new Timestamp(System.currentTimeMillis());
        final Object modifyBy = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        final Timestamp modifyTime = new Timestamp(System.currentTimeMillis());
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {

                    //點選新增案鈕新增客戶資料於TABLE：CUSTOMER客戶資料
                    Customer customer = new Customer();
                    data.put("group_id", groupId);
                    data.put("create_by", createBy);
                    data.put("create_time", createTime);
                    data.put("modify_by", modifyBy);
                    data.put("modify_time", modifyTime);
                    customer.fromMap(data);

                    //1.	新增客戶時，同時新增該客戶的平台使用帳號。帳號/密碼預設為客戶代碼
                    //使用者新增
                    SysUser sysUser = new SysUser();
                    final String hashingPwd = Hashing.md5().hashString(customerId, Charsets.UTF_8).toString();
                    Map userMap = new HashMap();
                    userMap.put("user_id", customerId);
                    userMap.put("user_pwd", hashingPwd);
                    userMap.put("user_name", customerName);
                    userMap.put("user_email", "");
                    userMap.put("user_phone", "");
                    userMap.put("user_address", "");
                    userMap.put("pwd_error_count", 0);
                    userMap.put("is_valid", 0);
                    userMap.put("is_lock", 0);
                    userMap.put("is_close", 1);
                    userMap.put("create_time", createTime);
                    userMap.put("create_by", createBy);
                    userMap.put("modify_time", modifyTime);
                    userMap.put("modify_by", modifyBy);
                    userMap.put("language", "zh_tw");
                    sysUser.fromMap(userMap);

                    //2.	群組(CUSTOMER.group)需引用至功能群組設定，該客戶帳號僅能使用商店APP且僅能觀看自己商店內資料
                    //權限關聯群組新增
                    SysUserGroup sysUserGroup = new SysUserGroup();
                    Map sysUserGroupMap = new HashMap();
                    sysUserGroupMap.put("user_id", customerId);
                    sysUserGroupMap.put("group_id", groupId);
                    sysUserGroupMap.put("create_time", createTime);
                    sysUserGroupMap.put("create_by", createBy);
                    sysUserGroupMap.put("modify_time", modifyTime);
                    sysUserGroupMap.put("modify_by", modifyBy);
                    sysUserGroup.fromMap(sysUserGroupMap);

                    if (customer.insert() && sysUser.insert() && sysUserGroup.insert()) {
                        return success("insert success");
                    } else {
                        return fail("insert fail...");
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/updateCustomer", method = RequestMethod.PUT)
    public RequestResult<?> updateCustomer(@RequestBody final Map data) {
        final Object modifyBy = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        final Timestamp modifyTime = new Timestamp(System.currentTimeMillis());
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Customer customer = new Customer();
                    data.put("modify_by", modifyBy);
                    data.put("modify_time", modifyTime);
                    customer.fromMap(data);
                    if (customer.saveIt()) {
                        return success("update success");
                    } else {
                        return fail("update fail...");
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    public static String strSplitBy(String splitter, List<String> list) {
        String sep = "";
        StringBuilder sb = new StringBuilder("(");

        for (String s : list) {
            sb.append(sep);
            sb.append("\'" + s + "\'");
            sep = splitter;
        }
        sb.append(")");

        return sb.toString();
    }

}
