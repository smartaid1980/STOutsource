package com.servtech.servcloud.app.controller.comoss;

import com.servtech.servcloud.app.model.storage.SynctimeStockIn;
import com.servtech.servcloud.app.model.storage.SynctimeStockOut;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.service.sql.DatabaseJdbc;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Date;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static com.servtech.servcloud.core.util.Util.getTimeLongFormat;

@RestController
@RequestMapping("/comoss/erpsyn")
public class ComossErpSyncController {

    private static final String LOCK = new String();

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = RequestMethod.GET)
    public RequestResult<?> syncErp() {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                try {
                    Timestamp startTimestamp = new Timestamp(System.currentTimeMillis());
                    PreparedStatement billStockInPs = batchInsertBillStockIn();
                    Object userObj = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "ComossStoreOrderSync" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    String userId = userObj.toString();

                    long currentTime = getTimeLongFormat();
                    SynctimeStockIn lasttestSynctimeStockIn = SynctimeStockIn.findFirst("create_by = 'billStockInSync' order by sync_end desc");
                    String sql = null;
                    if (lasttestSynctimeStockIn == null) {  //TH028 (1表示未驗收，2:已驗收, 3: 不良, 4:特殊)
                        sql = "select tg.TG014, th.* from PURTH th inner join PURTG tg on th.TH001 = tg.TG001 and th.TH002 = tg.TG002 where TH028 != 1 and TH002 >= 190701001 ORDER BY TH002";
                    } else {
                        String currentLastestBill = lasttestSynctimeStockIn.getString("lastest_bill");
                        sql = "select tg.TG014, th.* from PURTH th inner join PURTG tg on th.TH001 = tg.TG001 and th.TH002 = tg.TG002 where TH028 != 1 and TH002 >= " + currentLastestBill + " ORDER BY TH002";
                    }
                    System.out.println("sql=== " + sql);
                    List<Map> viewNewStockIn = getViewNewStockIn(billStockInPs, userId, currentTime, sql);

                    Base.executeBatch(billStockInPs);
                    billStockInPs.close();

                    if (viewNewStockIn.size() > 0) {
                        Map lastestStockIn = viewNewStockIn.get(viewNewStockIn.size() - 1);
                        String lastestBill = lastestStockIn.get("bill_order").toString();
                        Timestamp endTimestamp = new Timestamp(System.currentTimeMillis());
                        SynctimeStockIn synctimeStockIn = new SynctimeStockIn();
                        synctimeStockIn.set("sync_start", startTimestamp);
                        synctimeStockIn.set("sync_end", endTimestamp);
                        synctimeStockIn.set("lastest_bill", lastestBill);
                        synctimeStockIn.set("sync_account", userId);
                        synctimeStockIn.set("create_by", "billStockInSync");
                        synctimeStockIn.set("create_time", getTimeLongFormat());
                        synctimeStockIn.set("modify_by", userId);
                        synctimeStockIn.set("modify_time", getTimeLongFormat());

                        if (synctimeStockIn.insert()) {
                            return success("sync success");
                        } else {
                            return fail("insert synctimeStockIn fail...");
                        }
                    } else {
                        return success("bill stock in is empty!!!");
                    }
                } catch (SQLException e) {
                    e.printStackTrace();
                    return fail(e.getMessage());
                }
            });
        }
    }

    public static PreparedStatement batchInsertBillStockIn() {
        String sql = "INSERT IGNORE INTO `a_strongled_bill_stock_in` " +
                "(`bill_no`, " +
                "`bill_date`, " +
                "`bill_detail`, " +
                "`material_id`, " +
                "`material_sub`, " +
                "`remark`, " +
                "`ware_id`, " +
                "`quantity`, " +
                "`delivery_date`, " +
                "`column_1`, " +
                "`column_2`, " +
                "`column_3`, " +
                "`column_4`, " +
                "`status`, " +
                "`create_by`, " +
                "`create_time`, " +
                "`modify_by`, " +
                "`modify_time`)" +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";
        PreparedStatement ps = Base.startBatch(sql);
        return ps;
    }

    public List<Map> getViewNewStockIn(PreparedStatement billStockInPs, String userId, long currentTime, String sql) {
        DatabaseJdbc databaseJdbc = new DatabaseJdbc();
        String defaultStatus = "0";
        Statement st = null;
        ResultSet rs = null;
        List<Map> result = new ArrayList<>();
        if (databaseJdbc.connection()) {
            Connection conn = databaseJdbc.getConn();
            try {
                conn.setAutoCommit(false);
                st = conn.createStatement();
                rs = st.executeQuery(sql);
                while (rs.next()) {
                    Base.addBatch(billStockInPs,
                            rs.getString("TH002").trim(), //進貨單號(bill_no)
                            rs.getString("TG014"),   //單據日期(bill_date)
                            rs.getString("TH003"), //明細分項(bill_detail)
                            rs.getString("TH004"),  //品號or原料代碼(material_id)
                            rs.getString("TH003") == null || rs.getString("TH003").equals("") ? "0000" : rs.getString("TH003"),   //批號
                            rs.getString("TH005"),  //品名
                            rs.getString("TH009"),  //倉別
                            rs.getString("TH015"),  //數量
                            rs.getString("TG014"),  //出廠日期=date_code YYYYMMDD ，ERP沒有，隨便塞
                            rs.getString("TH001"),  //進貨單別 column_1
                            rs.getString("TH011"),  //採購單別 column_2
                            rs.getString("TH012"),  //採購單號 column_3
                            rs.getString("TH013"),  //採購序號 column_4
                            rs.getDouble("TH015") == 0 ? "9" : defaultStatus,   //數量如果是0，狀態直接給 9:已入庫
                            userId,
                            currentTime,
                            userId,
                            currentTime
                    );

                    Map map = new HashMap();
                    map.put("bill_order", rs.getString("TH002").trim());
                    result.add(map);
                }
                rs.close();
                st.close();
            } catch (Exception e) {
                e.printStackTrace();
                try {
                    conn.rollback();
                } catch (SQLException e1) {
                    e1.printStackTrace();
                }
            } finally {
                try {
                    rs.close();
                    st.close();
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }

        }
        return result;
    }

    @RequestMapping(value = "/purchase-order", method = RequestMethod.GET)
    public RequestResult<?> syncPurchaseOrderAndMaterial() {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                try {
                    Timestamp startTimestamp = new Timestamp(System.currentTimeMillis());
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
                    String currentDate = sdf.format(new Date());

                    Object userObj = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "purchaseOrderSync" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    String userId = userObj.toString();
                    long currentTime = getTimeLongFormat();

                    SynctimeStockIn lastestSynctimeStockIn = SynctimeStockIn.findFirst("create_by = 'purchaseOrderSync' order by sync_end desc");

                    StringBuilder sb = new StringBuilder();
                    sb.append("SELECT tc.TC024, td.* ");
                    sb.append("FROM PURTD td ");
                    sb.append("INNER JOIN PURTC tc ON ");
                    sb.append("td.TD001 = tc.TC001 AND td.TD002 = tc.TC002 ");
                    if (lastestSynctimeStockIn == null) {
//                        sb.append("WHERE td.TD002 >= '181222001'");
                        sb.append("WHERE td.TD002 >= '200101001' ORDER BY td.TD002");
                    } else {
                        sb.append("WHERE td.TD002 >= '" + lastestSynctimeStockIn.getString("lastest_bill") + "' ORDER BY td.TD002");
                    }

                    String sql = sb.toString();

                    DatabaseJdbc databaseJdbc = new DatabaseJdbc();
                    Statement st = null;
                    ResultSet rs = null;
                    PreparedStatement purchaseOrderPs = batchInsertPurchaseOrder();
                    PreparedStatement materialPs = batchInsertMaterial();
                    String lastestSyncPurcharseOrder = null;
                    if (databaseJdbc.connection()) {
                        Connection conn = databaseJdbc.getConn();
                        try {
                            conn.setAutoCommit(false);
                            st = conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,ResultSet.CONCUR_READ_ONLY);
                            rs = st.executeQuery(sql);
                            while (rs.next()) {
                                Base.addBatch(purchaseOrderPs,
                                        rs.getString("TD001"),//採購單別
                                        rs.getString("TD002"),//採購單號
                                        rs.getString("TD003"),//序號
                                        rs.getString("TC024"),//單據日期
                                        rs.getString("TD004"),//品號
                                        rs.getString("TD005"),//品名
                                        rs.getString("TD006"),//規格
                                        rs.getString("TD008"),//數量
                                        rs.getString("TD009"),//單位
                                        userId,
                                        currentTime,
                                        userId,
                                        currentTime
                                );

                                Base.addBatch(materialPs,
                                        rs.getString("TD004"),//品號
                                        rs.getString("TD005"),//品名
                                        rs.getString("TD005"),//品名=類型
                                        rs.getString("TD006"),//規格
                                        rs.getString("TD009"),//單位
                                        userId,
                                        currentTime,
                                        userId,
                                        currentTime
                                );
                            }

                            if (rs.previous()) {
                                lastestSyncPurcharseOrder = rs.getString("TD002");
                            }
                            Base.executeBatch(purchaseOrderPs);
                            Base.executeBatch(materialPs);
                            purchaseOrderPs.close();
                            materialPs.close();

                        } catch (Exception e) {
                            e.printStackTrace();
                            return fail(e.getMessage());
                        }
                    }
                    if (lastestSyncPurcharseOrder != null) {
                        Timestamp endTimestamp = new Timestamp(System.currentTimeMillis());
                        SynctimeStockIn synctimeStockIn = new SynctimeStockIn();
                        synctimeStockIn.set("sync_start", startTimestamp);
                        synctimeStockIn.set("sync_end", endTimestamp);
                        synctimeStockIn.set("lastest_bill", lastestSyncPurcharseOrder);
                        synctimeStockIn.set("sync_account", userId);
                        synctimeStockIn.set("create_by", "purchaseOrderSync");
                        synctimeStockIn.set("create_time", getTimeLongFormat());
                        synctimeStockIn.set("modify_by", userId);
                        synctimeStockIn.set("modify_time", getTimeLongFormat());

                        if (synctimeStockIn.insert()) {
                            return success("sync success");
                        } else {
                            return fail("insert synctimeStockIn fail...");
                        }
                    }

                    return success("sync success");
                } catch (Exception e) {
                    e.printStackTrace();
                    return fail(e.getMessage());
                }
            });
        }
    }

    public static PreparedStatement batchInsertPurchaseOrder() {
        String sql = "INSERT IGNORE INTO `a_comoss_purchase_order` " +
                "(`pur_order_type`, " +
                "`pur_id`, " +
                "`serial_num`, " +
                "`order_date`, " +
                "`material_id`, " +
                "`material_name`, " +
                "`spec`, " +
                "`qunatity`, " +
                "`unit`, " +
                "`create_by`, " +
                "`create_time`, " +
                "`modify_by`, " +
                "`modify_time`)" +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";
        PreparedStatement ps = Base.startBatch(sql);
        return ps;
    }

    public static PreparedStatement batchInsertMaterial() {
        String sql = "INSERT IGNORE INTO `a_comoss_material` " +
                "(`material_id`, " +
                "`material_name`, " +
                "`material_type`, " +
                "`material_desc`, " +
                "`material_unit`, " +
                "`create_by`, " +
                "`create_time`, " +
                "`modify_by`, " +
                "`modify_time`)" +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ";
        PreparedStatement ps = Base.startBatch(sql);
        return ps;
    }

    @RequestMapping(value = "/bill-stock-out-main", method = RequestMethod.GET)
    public RequestResult<?> syncBillStockOutMain() {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                try {
                    Timestamp startTimestamp = new Timestamp(System.currentTimeMillis());
                    PreparedStatement billStockOutPs = batchInsertBillStockOutMain();
                    Object userObj = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "ComossStoreOrderSync" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    String userId = userObj.toString();

                    long currentTime = getTimeLongFormat();
                    SynctimeStockOut lasttestSynctimeStockOut = SynctimeStockOut.findFirst("create_by = 'Main' order by sync_end desc");
                    String sql = null;
                    if (lasttestSynctimeStockOut == null) {
                        sql = "select * from MOCTA where TA002 >= 190701001 ORDER BY TA002";
                    } else {
                        String currentLastestBill = lasttestSynctimeStockOut.getString("lastest_bill");
                        sql = "select * from MOCTA where TA002 >= " + currentLastestBill + " ORDER BY TA002";
                    }
                    System.out.println("sql=== " + sql);
                    List<Map> viewNewStockOut = getViewNewStockOut(billStockOutPs, userId, currentTime, sql);

                    Base.executeBatch(billStockOutPs);
                    billStockOutPs.close();

                    if (viewNewStockOut.size() > 0) {
                        Map lastestStockOut = viewNewStockOut.get(viewNewStockOut.size() - 1);
                        String lastestBill = lastestStockOut.get("bill_order").toString();
                        Timestamp endTimestamp = new Timestamp(System.currentTimeMillis());
                        SynctimeStockOut synctimeStockOut = new SynctimeStockOut();
                        synctimeStockOut.set("sync_start", startTimestamp);
                        synctimeStockOut.set("sync_end", endTimestamp);
                        synctimeStockOut.set("lastest_bill", lastestBill);
                        synctimeStockOut.set("sync_account", userId);
                        synctimeStockOut.set("create_by", "Main");
                        synctimeStockOut.set("create_time", getTimeLongFormat());
                        synctimeStockOut.set("modify_by", userId);
                        synctimeStockOut.set("modify_time", getTimeLongFormat());

                        if (synctimeStockOut.insert()) {
                            return success("sync success");
                        } else {
                            return fail("insert synctimeStockIn fail...");
                        }
                    } else {
                        return success("bill stock in is empty!!!");
                    }
                } catch (SQLException e) {
                    e.printStackTrace();
                    return fail(e.getMessage());
                }
            });
        }
    }

    private List<Map> getViewNewStockOut(PreparedStatement billStockOutPs, String userId, long currentTime, String sql) {
        DatabaseJdbc databaseJdbc = new DatabaseJdbc();
        String defaultStatus = "0";
        Statement st = null;
        ResultSet rs = null;
        List<Map> result = new ArrayList<>();
        if (databaseJdbc.connection()) {
            Connection conn = databaseJdbc.getConn();
            try {
                conn.setAutoCommit(false);
                st = conn.createStatement();
                rs = st.executeQuery(sql);
                while (rs.next()) {
                    Base.addBatch(billStockOutPs,
                            rs.getString("TA002").trim(), //製令單號(bill_no)
                            new SimpleDateFormat("yyyyMMdd").parse(rs.getString("TA003")),   //單據日期(bill_date)
                            rs.getString("TA009"), //應領料日(stock_out_date)
                            rs.getString("TA029"),  //備註
                            rs.getString("TA020"),  //倉別
                            rs.getString("TA001"),  //製令單號 column_1
                            rs.getString("TA021"),  //生產線別 column_2
                            defaultStatus,
                            userId,
                            currentTime,
                            userId,
                            currentTime
                    );

                    Map map = new HashMap();
                    map.put("bill_order", rs.getString("TA002").trim());
                    result.add(map);
                }
                rs.close();
                st.close();
            } catch (Exception e) {
                e.printStackTrace();
                try {
                    conn.rollback();
                } catch (SQLException e1) {
                    e1.printStackTrace();
                }
            } finally {
                try {
                    rs.close();
                    st.close();
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }

        }
        return result;
    }

    private PreparedStatement batchInsertBillStockOutMain() {
        String sql = "INSERT IGNORE INTO `a_strongled_bill_stock_out_main` " +
                "(`bill_no`, " +
                "`bill_date`, " +
                "`stock_out_date`, " +
                "`remark`, " +
                "`ware_id`, " +
                "`column_1`, " +
                "`column_2`, " +
                "`status`, " +
                "`create_by`, " +
                "`create_time`, " +
                "`modify_by`, " +
                "`modify_time`)" +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";
        PreparedStatement ps = Base.startBatch(sql);
        return ps;
    }

    @RequestMapping(value = "/bill-stock-out-detail", method = RequestMethod.GET)
    public RequestResult<?> syncBillStockOutDetail() {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                try {
                    Timestamp startTimestamp = new Timestamp(System.currentTimeMillis());
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
                    String currentDate = sdf.format(new Date());

                    Object userObj = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "StockOutDetailSync" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    String userId = userObj.toString();
                    long currentTime = getTimeLongFormat();

                    SynctimeStockOut lastestDetail = SynctimeStockOut.findFirst("create_by = 'StockOutDetailSync' order by sync_end desc");
                    String sql = null;
                    if (lastestDetail == null) {
                        sql = "SELECT * FROM MOCTE WHERE TE002 >= 200101001 ORDER BY TE002";
                    } else {
                        sql = "SELECT * FROM MOCTE WHERE TE002 >= " + lastestDetail.getString("lastest_bill") + " ORDER BY TE002";
                    }

                    DatabaseJdbc databaseJdbc = new DatabaseJdbc();
                    Statement st = null;
                    ResultSet rs = null;
                    PreparedStatement stockOutDetailPs = batchInsertStockOutDetail();
                    String lastPickingOrder = null;

                    if (databaseJdbc.connection()) {
                        Connection conn = databaseJdbc.getConn();
                        try {
                            conn.setAutoCommit(false);
                            st = conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,ResultSet.CONCUR_READ_ONLY);
                            rs = st.executeQuery(sql);

                            while (rs.next()) {
                                Base.addBatch(stockOutDetailPs,
                                        rs.getString("TE012"),//製令單號
                                        rs.getString("CREATE_DATE"),//領料單單據日期
                                        rs.getString("TE002"),//領料單號
                                        rs.getString("TE004"),//材料品號
                                        "0000",//原料分項
                                        rs.getString("TE018"),//規格
                                        rs.getString("TE008"),//庫別
                                        rs.getString("TE005"),//需領料量
                                        rs.getString("CREATE_DATE"),//領料單單據日期=出廠日期
                                        rs.getString("TE011"),//製令單別
                                        rs.getString("TE001"),//領料單別
                                        "0",//
                                        userId,
                                        currentTime,
                                        userId,
                                        currentTime
                                );
                            }

                            if (rs.previous()) {
                                lastPickingOrder = rs.getString("TE002");
                            }

                            Base.executeBatch(stockOutDetailPs);
                            stockOutDetailPs.close();

                        } catch (Exception e) {
                            e.printStackTrace();
                            return fail(e.getMessage());
                        }
                    }
                    if (lastPickingOrder != null) {
                        Timestamp endTimestamp = new Timestamp(System.currentTimeMillis());
                        SynctimeStockOut synctimeStockOut = new SynctimeStockOut();
                        synctimeStockOut.set("sync_start", startTimestamp);
                        synctimeStockOut.set("sync_end", endTimestamp);
                        synctimeStockOut.set("lastest_bill", lastPickingOrder);
                        synctimeStockOut.set("sync_account", userId);
                        synctimeStockOut.set("create_by", "StockOutDetailSync");
                        synctimeStockOut.set("create_time", getTimeLongFormat());
                        synctimeStockOut.set("modify_by", userId);
                        synctimeStockOut.set("modify_time", getTimeLongFormat());
                        if (synctimeStockOut.insert()) {
                            return success("sync success");
                        } else{
                            return fail("insert synctimeStockOut fail...");
                        }
                    }

                    return success("sync success");
                } catch (Exception e) {
                    e.printStackTrace();
                    return fail(e.getMessage());
                }
            });
        }
    }

    public static PreparedStatement batchInsertStockOutDetail() {
        String sql = "INSERT INTO `a_strongled_bill_stock_out_detail` " +
                "(`bill_no`, " +
                "`bill_date`, " +
                "`bill_detail`, " +
                "`material_id`, " +
                "`material_sub`, " +
                "`remark`, " +
                "`ware_id`, " +
                "`quantity`, " +
                "`delivery_date`, " +
                "`column_1`, " +
                "`column_2`, " +
                "`status`, " +
                "`create_by`, " +
                "`create_time`, " +
                "`modify_by`, " +
                "`modify_time`)" +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE " +
                "`quantity` = VALUES(quantity)";
        PreparedStatement ps = Base.startBatch(sql);
        return ps;
    }
}
