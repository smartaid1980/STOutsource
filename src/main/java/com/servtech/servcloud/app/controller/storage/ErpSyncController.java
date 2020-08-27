package com.servtech.servcloud.app.controller.storage;

import com.servtech.servcloud.app.model.storage.SynctimeStockIn;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static com.servtech.servcloud.core.util.Util.getTimeLongFormat;

@RestController
@RequestMapping("/storage/erpsyn")
public class ErpSyncController {

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
                    Object userObj = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "StoreSyncSchedule" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    String userId = userObj.toString();

                    long currentTime = getTimeLongFormat();
                    SynctimeStockIn lasttestSynctimeStockIn = SynctimeStockIn.findFirst("order by sync_end desc");
                    String sql = null;
                    if (lasttestSynctimeStockIn == null) {
                        sql = "SELECT * FROM view_new_stock_in WHERE Flag=100 AND WareID=06 AND BillOrder>=190700000 ORDER BY BillOrder";
                    } else{
                        String currentLastestBill = lasttestSynctimeStockIn.getString("lastest_bill");
                        sql = "SELECT * FROM view_new_stock_in WHERE Flag=100 AND WareID=06 AND BillOrder>=190700000 AND BillOrder>="  + currentLastestBill +" ORDER BY BillOrder";
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
                        synctimeStockIn.set("create_by", userId);
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
                "`status`, " +
                "`create_by`, " +
                "`create_time`, " +
                "`modify_by`, " +
                "`modify_time`)" +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";
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
                            rs.getString("BillNO"),
                            rs.getString("BillDate"),
                            rs.getString("PRowNO"),
                            rs.getString("ProdID"),
                            rs.getString("BatchID") == null || rs.getString("BatchID").equals("") ? "0000" : rs.getString("BatchID"),
                            rs.getString("prodName"),
                            rs.getString("WareID"),
                            rs.getString("PQuantity"),
                            rs.getString("ProduceDate"),
                            defaultStatus,
                            userId,
                            currentTime,
                            userId,
                            currentTime
                    );

                    Map map = new HashMap();
                    map.put("bill_no", rs.getString("BillNO"));
                    map.put("bill_date", rs.getString("BillDate"));
                    map.put("bill_order", rs.getString("BillOrder"));
                    map.put("bill_detail", rs.getString("PRowNO"));
                    map.put("material_id", rs.getString("ProdID"));
                    map.put("material_sub", rs.getString("BatchID"));
                    map.put("remark", rs.getString("prodName"));
                    map.put("ware_id", rs.getString("WareID"));
                    map.put("quantity", rs.getString("PQuantity"));
                    map.put("delivery_date", rs.getString("ProduceDate"));
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
}
