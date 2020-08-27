package com.servtech.servcloud.app.controller.cosmos;

import com.servtech.servcloud.app.model.cosmos.Product;
import com.servtech.servcloud.app.model.cosmos.ProgramProduction;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.apache.log4j.ConsoleAppender;
import org.apache.log4j.DailyRollingFileAppender;
import org.apache.log4j.Logger;
import org.apache.log4j.PatternLayout;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/6/20.
 */
@RestController
@RequestMapping("/cosmos/product")
public class ProductInfoController {
    public static final Logger LOG = Logger.getLogger(ProductInfoController.class);

    static {
        setupLogger();
    }

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/insert", method = RequestMethod.POST)
    public RequestResult<?> insert(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    String userName = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    data.put("create_by", userName);
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    data.put("modify_by", userName);
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    String log = userName + "|" +
                            "INSERT" + "|" +
                            data.get("date").toString() + "|" +
                            data.get("machine_id").toString() + "|" +
                            data.get("work_shift").toString() + "|" +
                            data.get("staff_name").toString() + "|" +
                            data.get("order_id").toString() + "|" +
                            data.get("part_id").toString() + "|" +
                            data.get("std_hours").toString() + "|" +
                            data.get("ng_quantity").toString();

                    Product product = new Product();
                    product.fromMap(data);

                    if (product.insert()) {
                        LOG.info(log);
                        return success(product.getString("date") + "_" + product.getString("machine_id") + "_" + product.getString("work_shift"));
                    } else {
                        return fail("新增失敗...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = RequestMethod.POST)
    public RequestResult<List<Map>> read(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString();
        final String endDate = data.get("endDate").toString();
        final List<String> machineList = (List) data.get("machineList");
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * from a_cosmos_product ");
                sb.append("WHERE ");
                sb.append("(date BETWEEN ");
                sb.append("'" + startDate + " 00:00:00' ");
                sb.append("AND ");
                sb.append("'" + endDate + " 23:59:59' ) ");
                if (machineList.size() > 0) {
                    sb.append("AND ");
                    sb.append("machine_id IN " + strSplitBy(",", machineList));
                }
                String sql = sb.toString();
                List<Map> result = Product.findBySQL(sql).toMaps();
                SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
                for (Map data : result) {
                    data.put("date", sdf.format(data.get("date")));
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/readall", method = RequestMethod.GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                String sql = "SELECT * from a_cosmos_product";
                List<Map> result = Product.findBySQL(sql).toMaps();
                SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
                for (Map data : result) {
                    data.put("date", sdf.format(data.get("date")));
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    String userName = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    data.put("modify_by", userName);
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    String log = userName + "|" +
                            "UPDATE" + "|" +
                            data.get("date").toString() + "|" +
                            data.get("machine_id").toString() + "|" +
                            data.get("work_shift").toString() + "|" +
                            data.get("staff_name").toString() + "|" +
                            data.get("order_id").toString() + "|" +
                            data.get("part_id").toString() + "|" +
                            data.get("std_hours").toString() + "|" +
                            data.get("ng_quantity").toString();
                    Product product = new Product();
                    product.fromMap(data);

                    if (product.saveIt()) {
                        LOG.info(log);
                        return success(product.getString("date") + "_" + product.getString("machine_id") + "_" + product.getString("work_shift"));
                    } else {
                        return fail("修改失敗...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/insertUpdatePgProduction", method = RequestMethod.POST)
    public RequestResult<?> insertUpdatePgProduction(@RequestBody final Map data) {
        String date = data.get("date").toString();
        String machineId = data.get("machine_id").toString();
        String workShift = data.get("work_shift").toString();
        String programName = data.get("program_name").toString();
        String operatorId = data.get("operator_id").toString();
        String orderNo = data.get("order_no").toString();
        String partNo = data.get("part_no").toString();

        String dbOperatorId = data.get("db_operator_id").toString();
        String dbOrderNo = data.get("db_order_no").toString();
        String dbPartNo = data.get("db_part_no").toString();
        Double doubleCycleTime = Double.valueOf(data.get("cycle_time").toString());
        String cycleTime = String.valueOf(doubleCycleTime * 1000);
        String ngQty = data.get("ng_quantity").toString();
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    String userName = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);

                    String insertLog = "INSERT" + "|" +
                                    date + "|" +
                                    machineId + "|" +
                                    workShift + "|" +
                                    programName + "|" +
                                    dbOperatorId + "|" +
                                    dbOrderNo + "|" +
                                    dbPartNo + "|" +
                                    operatorId + "|" +
                                    orderNo + "|" +
                                    partNo + "|" +
                                    cycleTime + "|" +
                                    ngQty + "|" +
                                    userName;


                    String updateLog = "UPDATE" + "|" +
                            date + "|" +
                            machineId + "|" +
                            workShift + "|" +
                            programName + "|" +
                            dbOperatorId + "|" +
                            dbOrderNo + "|" +
                            dbPartNo + "|" +
                            operatorId + "|" +
                            orderNo + "|" +
                            partNo + "|" +
                            cycleTime + "|" +
                            ngQty + "|" +
                            userName;

                    String querySql = "SELECT * FROM a_cosmos_program_production where " +
                            "date = '" + date + "' AND " +
                            "machine_id = '" + machineId + "' AND " +
                            "work_shift = '" + workShift + "' AND " +
                            "program_name = '" + programName + "' AND " +
                            "operator_id = '" + operatorId + "' AND " +
                            "order_no = '" + orderNo + "' AND " +
                            "part_no = '" + partNo + "';";

                    List<Map> queryProgProduction = ProgramProduction.findBySQL(querySql).toMaps();

                    ProgramProduction programProduction = new ProgramProduction();
                    if (queryProgProduction.size() > 0) {
                        data.put("cycle_time" ,cycleTime);
                        data.put("modify_by", userName);
                        data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                        programProduction.fromMap(data);
                        if (programProduction.saveIt()) {
                            LOG.info(updateLog);
                            return success("update success");
                        } else {
                            return fail("update fail...");
                        }
                    } else {
                        data.put("cycle_time" ,cycleTime);
                        data.put("create_by", userName);
                        data.put("create_time", new Timestamp(System.currentTimeMillis()));
                        data.put("modify_by", userName);
                        data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                        programProduction.fromMap(data);
                        if (programProduction.insert()) {
                            LOG.info(insertLog);
                            return success("insert success");
                        } else {
                            return fail("insert fail...");
                        }
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

    static void setupLogger() {
        PatternLayout layout = new PatternLayout();
        String conversionPattern = "[%5p %d{yy/MM/dd HH:mm:ss}] %m [%t][%C{1}.%M:%L]%n";
        layout.setConversionPattern(conversionPattern);

        DailyRollingFileAppender rollingAppender = new DailyRollingFileAppender();
        rollingAppender.setFile("../webapps/ServCloud/WEB-INF/log/ProductInfoCosmos/log.log");
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
