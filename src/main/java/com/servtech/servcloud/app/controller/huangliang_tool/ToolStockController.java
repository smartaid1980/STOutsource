package com.servtech.servcloud.app.controller.huangliang_tool;

import com.servtech.servcloud.app.model.huangliang_tool.*;
import com.servtech.servcloud.app.model.huangliang_tool.view.ToolStockChgToolProFileLocationStock;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

@RestController
@RequestMapping("/huangliangToolStock")
public class ToolStockController {
    private static final Logger log = LoggerFactory.getLogger(ToolStockController.class);
    private static Object create_by;

    @Autowired
    private HttpServletRequest request;

    //5.2.2 刀具進貨記錄建立
    @RequestMapping(value = "/insertToolBuyToolStock", method = RequestMethod.POST)
    public RequestResult<?> insertToolBuyToolStock(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    String buy_time = data.get("buy_time").toString();
                    String tsup_id = data.get("tsup_id").toString();
                    String tool_id = data.get("tool_id").toString();
                    String buy_qty = data.get("buy_qty").toString();
                    String tool_location = data.get("tool_location").toString();
                    Date now = new Date(System.currentTimeMillis());
                    String user_id = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

                    //1. 建立刀具進貨記錄
                    ToolBuy toolBuy = new ToolBuy();
                    toolBuy.fromMap(data);
                    toolBuy.set("create_by", user_id);
                    toolBuy.set("modify_by", user_id);
                    toolBuy.set("modify_time", now);
                    toolBuy.set("create_time", now);
                    if (toolBuy.insert()) {
                        //2. 建立刀具庫存
                        ToolStock toolStock = new ToolStock();
                        toolStock.set("tsup_id", tsup_id);
                        toolStock.set("tool_id", tool_id);
                        toolStock.set("buy_time", buy_time);
                        toolStock.set("tool_location", tool_location);
                        toolStock.set("tool_status", "N");
                        toolStock.set("tool_stock", buy_qty);
                        toolStock.set("create_by", user_id);
                        toolStock.set("modify_by", user_id);
                        toolStock.set("modify_time", now);
                        toolStock.set("create_time", now);
                        if (toolStock.insert()) {
                            return success();
                        } else {
                            throw new RuntimeException();
                        }
                    } else {
                        return fail("Insert ToolBuy fail...");
                    }
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return fail(e.getMessage());
        }
    }

    //5.5.1 刀具庫存異動記錄查詢
    @RequestMapping(value = "/queryStockCHG", method = RequestMethod.GET)
    public RequestResult<?> queryStockCHG(@RequestParam(value = "startDate") String startDate,
                                          @RequestParam(value = "endDate") String endDate,
                                          @RequestParam(value = "chg_type[]", required = false) String[] chg_type,
                                          @RequestParam(value = "tool_location", required = false) String tool_location,
                                          @RequestParam(value = "location_area[]", required = false) String[] location_area,
                                          @RequestParam(value = "tool_type", required = false) String tool_type,
                                          @RequestParam(value = "tool_id", required = false) String tool_id) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    String startDateTime = startDate + " 00:00:00";
                    String endDateTime = endDate + " 23:59:59";
                    String sql = String.format("SELECT * from a_huangliang_view_tool_stock_profile_location where chg_time > '%s' and chg_time <= '%s'", startDateTime, endDateTime);
                    StringBuffer sb = new StringBuffer(sql);
                    if (chg_type != null) {
                        sb.append(" and chg_type IN ");
                        sb.append(getSQLWhereIn(Arrays.asList(chg_type)));
                    }
                    if (tool_location != null && !tool_location.equals("")) {
                        sb.append(" and tool_location = '");
                        sb.append(tool_location);
                        sb.append("'");
                    }
                    if (tool_type != null && !tool_type.equals("")) {
                        sb.append(" and tool_type = '");
                        sb.append(tool_type);
                        sb.append("'");
                    }
                    if (tool_id != null && !tool_id.equals("")) {
                        sb.append(" and tool_id = '");
                        sb.append(tool_id);
                        sb.append("'");
                    }
                    if (location_area != null) {
                        sb.append(" and chg_type IN ");
                        sb.append(getSQLWhereIn(Arrays.asList(location_area)));
                    }
                    log.info("sql : " + sb.toString());
                    List<ToolStockChgToolProFileLocationStock> viewList = ToolStockChgToolProFileLocationStock.findBySQL(sb.toString());
                    List<Map> resultList = new ArrayList<>();
                    for (ToolStockChgToolProFileLocationStock view : viewList) {
                        Map map = new HashMap();
                        map.put("chg_time", view.getString("chg_time"));
                        map.put("chg_type", view.getString("chg_type"));
                        map.put("buy_time", view.getString("buy_time"));
                        map.put("tool_id", view.getString("tool_id"));
                        map.put("tool_status", view.getString("tool_status"));
                        map.put("tool_type", view.getString("tool_type"));
                        map.put("tool_spec", view.getString("tool_spec"));
                        map.put("tsup_id", view.getString("tsup_id"));
                        map.put("tool_location", view.getString("tool_location"));
                        map.put("chg_qty", view.getString("chg_qty"));
                        map.put("location_area", view.get("location_area"));
                        map.put("new_location", view.getString("new_location"));
                        map.put("chg_remark", view.getString("chg_remark"));
                        resultList.add(map);
                    }
                    return success(resultList);
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return fail(e.getMessage());
        }
    }

    private static String getSQLWhereIn(List<String> dataList) {
        StringBuilder sb = new StringBuilder(" (");
        for (int i = 0; i < dataList.size(); i++) {
            sb.append("\'" + dataList.get(i) + "\'");
            if (i != dataList.size() - 1)
                sb.append(",");
        }
        sb.append(") ");
        return sb.toString();
    }

    //5.5.2 刀具庫存異動記錄_數量調整
    @RequestMapping(value = "/createQtyCHG", method = RequestMethod.POST)
    public RequestResult<?> createQtyCHG(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Object buy_time = data.get("buy_time");
                    String tool_id = data.get("tool_id").toString();
                    String tool_location = data.get("tool_location").toString();
                    Double chg_qty_double = data.get("chg_qty") == null ? null : (Double) data.get("chg_qty");
                    int chg_qty = 0;
                    if (chg_qty_double != null) {
                        chg_qty = chg_qty_double.intValue();
                    }
                    String tsup_name = data.get("tsup_name").toString();
                    String tsup_id = ToolSupplier.findFirst("tsup_name = ?", tsup_name).getString("tsup_id");
                    Date now = new Date(System.currentTimeMillis());
                    create_by = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    ToolStockChg insertToolStockChg = new ToolStockChg();
                    insertToolStockChg.set("chg_time", now,
                            "buy_time", buy_time,
                            "tsup_id", tsup_id,
                            "tool_id", tool_id,
                            "tool_status", data.get("tool_status"),
                            "tool_location", tool_location,
                            "chg_type", data.get("chg_type"),
                            "chg_qty", chg_qty,
                            "chg_remark", data.get("chg_remark"),
                            "create_time", now,
                            "create_by", create_by == null ? "admin" : create_by);

                    if (insertToolStockChg.insert()) {
                        if (updateToolStockForQtyCHG(buy_time.toString(), tsup_id, tool_id, tool_location, chg_qty)) {
                            return success("新增 庫存異動 與 更新 刀具庫存 成功");
                        } else {
                            return fail("更新 刀具庫存 失敗，原因待查...");
                        }
                    } else {
                        return fail("新增 庫存異動 失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return fail(e.getMessage());
        }
    }

    //5.5.3 刀具庫存異動記錄_儲位調撥
    @RequestMapping(value = "/createLocationCHG", method = RequestMethod.POST)
    public RequestResult<?> createLocationCHG(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Object buy_time = data.get("buy_time");
                    String tool_id = data.get("tool_id").toString();
                    String tool_location = data.get("tool_location").toString();
                    Double chg_qty_double = data.get("chg_qty") == null ? null : (Double) data.get("chg_qty");
                    int chg_qty = 0;
                    if (chg_qty_double != null) {
                        chg_qty = chg_qty_double.intValue();
                    }
                    String tsup_name = data.get("tsup_name").toString();
                    String tsup_id = ToolSupplier.findFirst("tsup_name = ?", tsup_name).getString("tsup_id");
                    Object new_location = data.get("new_location");
                    String tool_status = data.get("tool_status").toString();
                    Date now = new Date(System.currentTimeMillis());
                    ToolStockChg insertToolStockChg = new ToolStockChg();
                    create_by = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    insertToolStockChg.set("chg_time", now,
                            "buy_time", buy_time,
                            "tsup_id", tsup_id,
                            "tool_id", tool_id,
                            "tool_status", tool_status,
                            "tool_location", tool_location,
                            "chg_type", data.get("chg_type"),
                            "chg_remark", data.get("chg_remark"),
                            "chg_qty", chg_qty,
                            "new_location", new_location,
                            "create_time", now,
                            "create_by", create_by == null ? "admin" : create_by);
                    if (insertToolStockChg.insert()) {
                        if (updateToolStockForLocationCHG(buy_time.toString(), tsup_id, tool_id, tool_location, chg_qty)) {
                            if (insertOrUpdateNewToolStock(buy_time.toString(), tsup_id, tool_id, new_location.toString(), tool_status, chg_qty)) {
                                return success("新增 庫存異動 與 更新 刀具庫存 成功");
                            } else {
                                return fail("更新或新增 新儲位刀具庫存 失敗，原因待查...");
                            }
                        } else {
                            return fail("更新 刀具庫存 失敗，原因待查...");
                        }
                    } else {
                        return fail("新增 庫存異動 失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return fail(e.getMessage());
        }
    }

    //5.5.4 刀具庫存異動記錄_外界暫用
    @RequestMapping(value = "/createBorrowCHG", method = RequestMethod.POST)
    public RequestResult<?> createBorrowCHG(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Object buy_time = data.get("buy_time");
                    String tool_id = data.get("tool_id").toString();
                    String tool_location = data.get("tool_location").toString();
                    Double chg_qty_double = data.get("chg_qty") == null ? null : (Double) data.get("chg_qty");
                    int chg_qty = 0;
                    if (chg_qty_double != null) {
                        chg_qty = chg_qty_double.intValue();
                    }
                    String tsup_name = data.get("tsup_name").toString();
                    String tsup_id = ToolSupplier.findFirst("tsup_name = ?", tsup_name).getString("tsup_id");
                    Date now = new Date(System.currentTimeMillis());
                    ToolStockChg insertToolStockChg = new ToolStockChg();
                    create_by = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    String new_location = data.get("new_location").toString();

                    String ori_area = ToolLocation.findFirst("tool_location = ?", tool_location).getString("location_area");
                    String new_area = ToolLocation.findFirst("tool_location = ?", new_location).getString("location_area");
                    if (ori_area.equals("3") && new_area.equals("3")) {
                        return fail("錯誤 兩個儲位區域都是場外借用!");
                    }
                    String tool_status = "N";
                    insertToolStockChg.set("chg_time", now,
                            "buy_time", buy_time,
                            "tsup_id", tsup_id,
                            "tool_id", tool_id,
                            "tool_status", data.get("tool_status"),
                            "tool_location", tool_location,
                            "chg_type", data.get("chg_type"),
                            "chg_qty", chg_qty,
                            "new_location", new_location,
                            "chg_remark", data.get("chg_remark"),
                            "create_time", now,
                            "create_by", create_by == null ? "admin" : create_by);
                    if (insertToolStockChg.insert()) {
                        if (updateToolStockForLocationCHG(buy_time.toString(), tsup_id, tool_id, tool_location , chg_qty)) {
                            if(insertOrUpdateNewToolStock(buy_time.toString(), tsup_id, tool_id, new_location, tool_status, chg_qty)){
                                return success("新增 庫存異動 與 更新 刀具庫存 成功");
                            }else {
                                return fail("更新或新增 新儲位刀具庫存 失敗，原因待查...");
                            }
                        } else {
                            return fail("更新或新增 新儲位刀具庫存 失敗，原因待查...");
                        }
                    } else {
                        return fail("新增 庫存異動 失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return fail(e.getMessage());
        }
    }

    //5.5.5 刀具庫存異動記錄_回收入庫
    @RequestMapping(value = "/createRecoverCHG", method = RequestMethod.POST)
    public RequestResult<?> createRecoverCHG(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Object buy_time = data.get("buy_time");
                    String tool_id = data.get("tool_id").toString();
                    String tool_location = data.get("tool_location").toString();
                    Double chg_qty_double = data.get("chg_qty") == null ? null : (Double) data.get("chg_qty");
                    int chg_qty = 0;
                    if (chg_qty_double != null) {
                        chg_qty = chg_qty_double.intValue();
                    }
                    String tsup_name = data.get("tsup_name").toString();
                    String tsup_id = ToolSupplier.findFirst("tsup_name = ?", tsup_name).getString("tsup_id");
                    Date now = new Date(System.currentTimeMillis());
                    ToolStockChg insertToolStockChg = new ToolStockChg();
                    create_by = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    String new_location = data.get("new_location").toString();

                    String tool_location_for = ToolLocation.findFirst("tool_location = ?", new_location).getString("tool_location_for");
                    if (!tool_location_for.equals("B")) {
                        return fail("錯誤 需為回收刀!");
                    }

                    insertToolStockChg.set("chg_time", now,
                            "buy_time", buy_time,
                            "tsup_id", tsup_id,
                            "tool_id", tool_id,
                            "tool_status", data.get("tool_status"),
                            "tool_location", tool_location,
                            "chg_type", data.get("chg_type"),
                            "chg_qty", chg_qty,
                            "new_location", new_location,
                            "chg_remark", data.get("chg_remark"),
                            "create_time", now,
                            "create_by", create_by == null ? "admin" : create_by);
                    if (insertToolStockChg.insert()) {
                        ToolStock updateToolStock = ToolStock.findFirst("tool_id = ? and tsup_id = ? and buy_time = ? and tool_location = ?", tool_id, tsup_id, buy_time, new_location);
                        if (updateToolStock == null) {
                            ToolStock insertToolStock = new ToolStock();
                            insertToolStock.set("buy_time", buy_time,
                                    "tsup_id", tsup_id,
                                    "tool_id", tool_id,
                                    "tool_status", "B",
                                    "tool_location", new_location,
                                    "tool_stock", chg_qty,
                                    "use_tqty", 0,
                                    "create_time", now,
                                    "create_by", create_by == null ? "admin" : create_by,
                                    "modify_time", now,
                                    "modify_by", create_by == null ? "admin" : create_by);
                            insertToolStock.saveIt();
                        } else {
                            updateToolStock.set("tool_stock", chg_qty + Integer.valueOf(updateToolStock.get("tool_stock").toString()), "modify_time", now, "modify_by", create_by == null ? "admin" : create_by);
                            updateToolStock.saveIt();
                        }

                        return success("新增 庫存異動 成功");
                    } else {
                        return fail("新增 庫存異動 失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return fail(e.getMessage());
        }
    }

    private static boolean updateToolStockForQtyCHG(String buy_time, String tsup_id, String tool_id, String tool_location, int chg_qty) {
        ToolStock toolStock = ToolStock.findFirst("buy_time = ? and tsup_id = ? and tool_id = ? and tool_location = ?", buy_time, tsup_id, tool_id, tool_location);
        Long tool_stock_long = (Long) toolStock.get("tool_stock");
        int new_tool_stock = tool_stock_long.intValue() + chg_qty;
        if (new_tool_stock < 0) {
            throw new RuntimeException("tool stock not enough ...");
        }
        toolStock.set("tool_stock", new_tool_stock);
        if (!toolStock.saveIt()) {
            throw new RuntimeException("update ToolStock fail...");
        } else {
            return true;
        }
    }

    private static boolean updateToolStockForLocationCHG(String buy_time, String tsup_id, String tool_id, String tool_location, int chg_qty) {
        System.out.println("sql : select * from a_huangliang_tool_stock where buy_time = '" + buy_time + "' and tsup_id = '" + tsup_id + "' and tool_id = '" + tool_id + "' and tool_location = '" + tool_location + "'");
        ToolStock toolStock = ToolStock.findFirst("buy_time = ? and tsup_id = ? and tool_id = ? and tool_location = ?", buy_time, tsup_id, tool_id, tool_location);
        Long tool_stock_long = (Long) toolStock.get("tool_stock");
        int new_tool_stock = tool_stock_long.intValue() - chg_qty;
        if (new_tool_stock < 0) {
            throw new RuntimeException("tool stock not enough ...");
        }
        toolStock.set("tool_stock", new_tool_stock);
        if (!toolStock.saveIt()) {
            throw new RuntimeException("update ToolStock fail...");
        } else {
            return true;
        }
    }

    private static boolean insertOrUpdateNewToolStock(String buy_time, String tsup_id, String tool_id, String new_location, String tool_status, int chg_qty) {
        System.out.println("sql : select * from a_huangliang_tool_stock where buy_time = '" + buy_time + "' and tsup_id = '" + tsup_id + "' and tool_id = '" + tool_id + "' and tool_location = '" + new_location + "'");
        ToolStock toolStock = ToolStock.findFirst("buy_time = ? and tsup_id = ? and tool_id = ? and tool_location = ?", buy_time, tsup_id, tool_id, new_location);
        if (toolStock == null) {
            ToolStock insertToolStock = new ToolStock();
            insertToolStock.set("buy_time", buy_time,
                    "tsup_id", tsup_id,
                    "tool_id", tool_id,
                    "tool_status", tool_status,
                    "tool_location", new_location,
                    "tool_stock", chg_qty,
                    "create_time", new Date(System.currentTimeMillis()),
                    "create_by", create_by == null ? "admin" : create_by);
            if (insertToolStock.saveIt()) {
                return true;
            } else {
                throw new RuntimeException("insert new_location ToolStock fail...");
            }
        } else {
            Long tool_stock_long = (Long) toolStock.get("tool_stock");
            int new_tool_stock = tool_stock_long.intValue() + chg_qty;
            if (new_tool_stock < 0) {
                throw new RuntimeException("tool stock not enough ...");
            }
            toolStock.set("tool_stock", new_tool_stock);
            if (!toolStock.saveIt()) {
                throw new RuntimeException("update new_location ToolStock fail...");
            } else {
                return true;
            }
        }
    }
}