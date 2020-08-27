package com.servtech.servcloud.app.controller.storage;

import com.servtech.servcloud.app.model.storage.BillStockOutMain;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import org.apache.log4j.ConsoleAppender;
import org.apache.log4j.DailyRollingFileAppender;
import org.apache.log4j.Logger;
import org.apache.log4j.PatternLayout;
import org.javalite.activejdbc.Base;
import org.javalite.activejdbc.Model;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/storage/billstockout")
public class StoreBillStockOutController {

    public static final Logger LOG = Logger.getLogger(StoreBillStockOutController.class);

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    static {
        setupLogger();
    }

    @RequestMapping(value = "/bill-before-today", method = RequestMethod.PUT)
    public RequestResult<?> clearBillBeforeToday() {
        return ActiveJdbc.operTx(() -> {
            try {
                Object user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                long currentTime = Util.getTimeLongFormat();

                String sql = "UPDATE a_strongled_bill_stock_out_main " +
                        "SET status = 9, column_1 = 'manual', modify_by='" + user + "', modify_time='" + currentTime + "' " +
                        "WHERE stock_out_date < '" + new SimpleDateFormat("yyyyMMdd").format(new Date()) + "'";
                Base.exec(sql);
                return RequestResult.success("update success");
            } catch (Exception e) {
                e.printStackTrace();
                return RequestResult.fail("結清失敗:" + e.getMessage());
            }
        });
    }

    @RequestMapping(value = "/check-lock", method = RequestMethod.POST)
    public RequestResult<?> checkLock(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            String EMPTY = "";
            String userId = data.get("user_id").toString();
            String billNo = data.get("bill_no") == null ? EMPTY : data.get("bill_no").toString();
            String model = data.get("model").toString();
            long currentTime = Util.getTimeLongFormat();
            //model = tablet
            //userId =xxx
            //billNo = empty
            //領料單主檔所屬平板名稱=userId全員解鎖
            //----------------------------------
            //userId = xxx
            //bilNo = xxx
            //確認領料單主檔狀態
            // status=2 回fail("有人在使用")
            // status=0更新狀態鎖定(=2)與鎖定名稱
            if (model.equals("tablet")) {
                if (billNo.equals(EMPTY)) {
                    BillStockOutMain.update("status = ?, locked_by = ?, modify_by = ?, modify_time = ?", "locked_by = ?",
                            "0", EMPTY, userId, currentTime, userId);
                    LOG.info("tablet|" + userId + "|unlock all bill");
                } else {
                    Model storeBillStockOutMain = BillStockOutMain.findFirst("bill_no = ?", billNo);

                    if (storeBillStockOutMain.get("status").toString().equals("2")) {
                        return RequestResult.fail(billNo + " locked");
                    } else if (storeBillStockOutMain.get("status").toString().equals("0")) {
                        BillStockOutMain.update("status = ?, locked_by = ?, modify_by = ?, modify_time = ?", "bill_no = ?",
                                "2", userId, userId, currentTime, billNo);
                        LOG.info("tablet|" + userId + "|" + billNo + "|locked");
                    }
                }
                //model = web
                //bilNo = xxx
                //針對特定領料單直接解鎖
                // status=0 並更新狀態鎖定(=0)與鎖定名稱=null
            } else if (model.equals("web")) {
                BillStockOutMain.update("status = ?, locked_by = ?, modify_by = ?, modify_time = ?", "bill_no = ?",
                        "0", EMPTY, userId, currentTime, billNo);
                LOG.info("web|" + userId + "|" + billNo + "|unlock");
            }
            return RequestResult.success("success");
        });
    }

    static void setupLogger() {
        PatternLayout layout = new PatternLayout();
        String conversionPattern = "[%5p %d{yy/MM/dd HH:mm:ss}] %m [%t][%C{1}.%M:%L]%n";
        layout.setConversionPattern(conversionPattern);

        DailyRollingFileAppender rollingAppender = new DailyRollingFileAppender();
        rollingAppender.setFile("../webapps/ServCloud/WEB-INF/log/StrongledStoreBillStockOut/log.log");
        rollingAppender.setEncoding("UTF-8");
        rollingAppender.setDatePattern("'.'yyyy-MM-dd");
        rollingAppender.setLayout(layout);
        rollingAppender.activateOptions();

        ConsoleAppender consoleAppender = new ConsoleAppender();
        consoleAppender.setEncoding("UTF-8");
        consoleAppender.setLayout(layout);
        consoleAppender.activateOptions();

        LOG.addAppender(rollingAppender);
        LOG.addAppender(consoleAppender);
    }
}

