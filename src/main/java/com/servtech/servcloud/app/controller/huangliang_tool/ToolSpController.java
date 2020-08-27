package com.servtech.servcloud.app.controller.huangliang_tool;

import com.google.gson.Gson;
import com.servtech.servcloud.app.model.huangliang_tool.*;
import com.servtech.servcloud.app.model.huangliang_tool.view.ToolSpUseToolSpHistory;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.exception.JsonParamsException;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.mail.MailManager;
import com.servtech.servcloud.core.mail.modules.ConfigData;
import com.servtech.servcloud.core.mail.modules.DataTemplate;
import com.servtech.servcloud.core.util.JsonParams;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.SysUser;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

@RestController
@RequestMapping("/huangliangTool/toolsp")
public class ToolSpController {
    private static final String LOCK = new String();
    private static final Logger log = LoggerFactory.getLogger(ToolSpController.class);
    private static final String SERVER_IP = "http://220.133.118.197:58080";
    private static boolean isMailConfig = getMailConfig();
    private static String account;
    private static String password;
    static SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    static SimpleDateFormat sdfDay = new SimpleDateFormat("yyyy-MM-dd");
    public static Map<Integer, String> useReasonMap = getReasonMap();
    private static Thread firstThread = null;


    private static MailManager mailManager = new MailManager();
    private static Gson gson = new Gson();

    @Autowired
    private HttpServletRequest request;

    //5.3.10 其他類領刀單管理-記錄查詢_查詢其他領刀紀錄
    @RequestMapping(value = "/queryToolSpList", method = RequestMethod.GET)
    public RequestResult<?> queryToolSpList(@RequestParam(value = "sample_pid", required = false) String sample_pid,  //樣品圖號
                                            @RequestParam(value = "mstock_name[]") List<String> mstock_name,
                                            @RequestParam(value = "machine_id[]", required = false) List<String> machine_id,
                                            @RequestParam(value = "startDate") String startDate,
                                            @RequestParam(value = "endDate") String endDate,
                                            @RequestParam(value = "tool_use_no", required = false) String tool_use_no,
                                            @RequestParam(value = "use_reason[]", required = false) List<Integer> use_reason,
                                            @RequestParam(value = "create_by", required = false) String create_by,
                                            @RequestParam(value = "sample_id", required = false) String sample_id) {   //樣品管編
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Map data = new HashMap();
                    data.put("sample_pid", sample_pid);
                    data.put("mstock_name", mstock_name);
                    data.put("machine_id", machine_id);
                    data.put("startDate", startDate);
                    data.put("endDate", endDate);
                    data.put("tool_use_no", tool_use_no);
                    data.put("use_reason", use_reason);
                    data.put("create_by", create_by);
                    data.put("sample_id", sample_id);

                    String sql = getToolSpUseSQL(data);
                    log.info("sql : " + sql);
                    List<Map<String, Object>> resultList = new ArrayList<>();
                    List<ToolSpUseToolSpHistory> views = ToolSpUseToolSpHistory.findBySQL(sql);
                    if (views != null && views.size() != 0) {
                        for (ToolSpUseToolSpHistory view : views) {
                            Map<String, Object> map = new HashMap<>();
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
                            String tool_use_no = view.getString("tool_use_no");
                            List<Map> toolSpList = ToolSpList.find("tool_use_no = ?", tool_use_no).toMaps();
                            Double sum_use_cost = 0.0;
                            for (Map record : toolSpList) {
                                Object use_cost = record.get("use_cost");
                                Double useCostD = use_cost != null ? Double.valueOf(use_cost.toString()) : 0;
                                sum_use_cost += useCostD;
                            }
                            map.putAll(view.toMap());
                            map.put("list", toolSpList);
                            map.put("sum_use_cost", sum_use_cost);
                            map.put("create_time", sdf.format(view.getDate("use_create_time")));
                            resultList.add(map);
                        }
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

    // 5.3.13 其他類領刀單管理-樣品試作領刀單明細修改 _修改其他領刀明細
    @RequestMapping(value = "/updateToolSpList", method = RequestMethod.PUT)
    public RequestResult<?> updateToolSpList(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Map resultMap = new HashMap();
                    List<Map> result = new ArrayList<>();
                    String tool_history_no = data.get("tool_history_no") != null ? data.get("tool_history_no").toString() : "";
                    String tool_use_no = data.get("tool_use_no").toString();
                    List<Map> insertList = (List<Map>) data.get("insert");
                    List<Map> updateList = (List<Map>) data.get("update");
                    List<Map> cancelList = (List<Map>) data.get("cancel");
                    List<Map> returnList = (List<Map>) data.get("return");
                    String create_by = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    String create_time = sdf.format(new Date(System.currentTimeMillis()));

                    if (insertList.size() != 0 && insertList != null) {
                        Map<String, List> insertData = getInsertData(tool_use_no, tool_history_no, create_by, insertList, create_time);
                        // 1 ~ 3 建立量產領刀明細 與 建立量產刀具履歷明細
                        createToolSpList(tool_use_no, create_by, tool_history_no, insertData);
                    }

                    //4. 取消
                    for (Map cancel : cancelList) {
                        String buy_time = cancel.get("buy_time").toString();
                        String tool_id = cancel.get("tool_id").toString();
                        String tsup_id = cancel.get("tsup_id").toString();
                        String tool_location = cancel.get("tool_location").toString();
                        String tool_use_for = cancel.get("tool_use_for").toString();
                        int count = ToolSpList.update("uselist_status = '1', modify_time = ?, modify_by = ?", 
                          "tool_use_no = ? and buy_time = ? and tool_id = ? and tsup_id = ? and tool_location = ? and tool_use_for = ?",
                          create_time,
                          create_by,
                          tool_use_no,
                          buy_time,
                          tool_id,
                          tsup_id,
                          tool_location, 
                          tool_use_for);
                        if (count == 1) {
                            count = 0;
                            count = ToolSpHisList.update("status = '1', modify_time = ?, modify_by = ?",
                              "tool_history_no = ? and tool_id = ? and tool_use_for = ?",
                              create_time,
                              create_by,
                              tool_history_no,
                              tool_id,
                              tool_use_for);
                            if (count != 1) {
                                throw new RuntimeException("ToolSpHisList update fail..");
                            }
                        } else {
                            throw new RuntimeException("ToolSpList update fail..");
                        }
                    }

                    //5. 歸還
                    for (Map returnData : returnList) {
                        String buy_time = returnData.get("buy_time").toString();
                        String tool_id = returnData.get("tool_id").toString();
                        String tsup_id = returnData.get("tsup_id").toString();
                        String tool_location = returnData.get("tool_location").toString();
                        String tool_use_for = returnData.get("tool_use_for").toString();
                        Double use_qty_double = (Double) returnData.get("use_qty");
                        int use_qty = use_qty_double.intValue();
                        ToolSpList toolSpList = ToolSpList.findFirst("tool_use_no = ? and buy_time = ? and tool_id = ? and tsup_id = ? and tool_location = ? and tool_use_for = ?", tool_use_no, buy_time, tool_id, tsup_id, tool_location, tool_use_for);
                        //領刀明細的領刀明細狀態改成99
                        toolSpList.set("uselist_status", "99",
                          "modify_time", create_time,
                          "modify_by", create_by);
                        if (toolSpList.saveIt()) {
                            ToolStock toolStock = ToolStock.findFirst("buy_time = ? and tool_id = ? and tsup_id = ? and tool_location = ?", buy_time, tool_id, tsup_id, tool_location);
                            //找到每筆領刀明細對應的庫存，將其庫存數加回領用數
                            toolStock.set("tool_stock", toolStock.getInteger("tool_stock") + use_qty,
                              "modify_time", create_time,
                              "modify_by", create_by);
                            if (toolStock.saveIt()) {
                                //對應的履歷明細的狀態改成99
                                if (!tool_history_no.equals("")) {
                                  int count = ToolSpHisList.update("status = '99', modify_time = ?, modify_by = ?",
                                    "tool_history_no = ? and tool_id = ? and tool_use_for = ?",
                                    create_time,
                                    create_by,
                                    tool_history_no,
                                    tool_id,
                                    tool_use_for);
                                  if (count != 1) {
                                      throw new RuntimeException("ToolSpHisList update fail..");
                                  }
                                }
                            } else {
                                throw new RuntimeException("ToolStock update fail..");
                            }
                        } else {
                            throw new RuntimeException("ToolSpList update fail..");
                        }
                    }

                    Set toolIdSetToCheckStock = new HashSet<>();

                    //6. 修改領刀明細庫存數
                    for (Map update : updateList) {
                        String buy_time = update.get("buy_time").toString();
                        String tool_id = update.get("tool_id").toString();
                        String tsup_id = update.get("tsup_id").toString();
                        String tool_location = update.get("tool_location").toString();
                        String tool_use_for = update.get("tool_use_for").toString();
                        Double use_qty_double = (Double) update.get("use_qty");
                        int use_qty = use_qty_double.intValue();
                        Double orig_qty_double = (Double) update.get("orig_qty");
                        int orig_qty = orig_qty_double.intValue();
                        int delta = use_qty - orig_qty;
                        ToolStock toolStock = ToolStock.findFirst("buy_time = ? and tsup_id = ? and tool_id = ? and tool_location = ?", buy_time, tsup_id, tool_id, tool_location);
                        int tool_stock = toolStock.getInteger("tool_stock");
                        boolean needRecalculate = false;
                        toolIdSetToCheckStock.add(tool_id);
                        //要多領刀 ， 先檢查庫存吧!
                        if (delta > 0) {
                            if (toolStock != null) {
                                //竟然夠..
                                if (tool_stock >= delta) {
                                    toolStock.set("tool_stock", tool_stock - delta,
                                      "modify_time", create_time,
                                      "modify_by", create_by);
                                    needRecalculate = toolStock.saveIt();
                                    //不夠耶..殘念
                                } else {
                                    Map map = new HashMap();
                                    map.put("buy_time", buy_time);
                                    map.put("tsup_id", tsup_id);
                                    map.put("tool_id", tool_id);
                                    map.put("tool_location", tool_location);
                                    map.put("tool_stock", tool_stock);
                                    result.add(map);
                                }
                            }
                            //領太多刀要退貨?? ， 將庫存加回來..
                        } else if (delta < 0) {
                            toolStock.set("tool_stock", tool_stock - delta,
                              "modify_time", create_time,
                              "modify_by", create_by);
                            needRecalculate = toolStock.saveIt();
                        }
                        if (needRecalculate) {
                            ToolSpList toolSpList = ToolSpList.findFirst("tool_use_no = ? and buy_time = ? and tool_id = ? and tsup_id = ? and tool_location = ? and tool_use_for = ?", tool_use_no, buy_time, tool_id, tsup_id, tool_location, tool_use_for);
                            String tool_status = toolSpList.getString("tool_status");
                            ToolProfile toolProfile = ToolProfile.findFirst("tool_id = ?", tool_id);
                            String tool_type = toolProfile.getString("tool_type");
                            Double unit_price = Double.valueOf(ToolBuy.findFirst("tsup_id = ? and tool_id = ? and buy_time = ?", tsup_id, tool_id, buy_time).getString("unit_price"));
                            // 回收成本比例(%)
                            Double cost_pc = tool_status.equals("B") ? (Double.valueOf(ToolType.findFirst("tool_type = ?", tool_type).getString("cost_pc")) / 100) : 1;
                            Double use_cost = unit_price * cost_pc * use_qty;
                            toolSpList.set("use_cost", use_cost,
                              "use_qty", use_qty,
                              "modify_time", create_time,
                              "modify_by", create_by);
                            if (toolSpList.saveIt()) {
                                if (!tool_history_no.equals("")) {
                                  ToolSpHisList toolSpHisList = ToolSpHisList.findFirst("tool_history_no = ? and tool_id = ? and tool_use_for = ?", tool_history_no, tool_id, tool_use_for);
                                  toolSpHisList.set("use_qty", use_qty,
                                    "modify_time", create_time,
                                    "modify_by", create_by);
                                  if (!toolSpHisList.saveIt()) {
                                      throw new RuntimeException("ToolSpHisList update fail..");
                                  }
                                }
                            } else {
                                throw new RuntimeException("ToolSpList update fail..");
                            }
                        }
                    }
                    if (toolIdSetToCheckStock.size() > 0) {
                      new Thread(new Runnable() {
                          @Override
                          public void run() {
                              try {
                                  checkStockNotEnough(new ArrayList<>(toolIdSetToCheckStock));
                              } catch (Exception e) {
                                  e.printStackTrace();
                              }
                          }
                      }).start();
                    }
                    resultMap.put("updateFail", result);
                    List<Map> toolSpList = Base.findAll("SELECT * FROM a_huangliang_view_tool_stock_tool_sp_list WHERE tool_use_no = ?", tool_use_no);
                    resultMap.put("toolSpList", toolSpList);
                    return success(resultMap);
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return fail(e.getMessage());
        }
    }

    // 5.3.11 其他類領刀單管理-其他領刀單建立_建立領刀單(主表、明細、履歷明細)
    @RequestMapping(value = "/createToolSpUse", method = RequestMethod.POST)
    public RequestResult<?> createToolSpUse(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    String new_tool_use_no = getNewToolUseNo();
                    List<Map> list = (List<Map>) data.get("list");
                    Object use_reason = data.get("use_reason");
                    String tool_history_no = data.get("tool_history_no") != null ? data.get("tool_history_no").toString() : "";
                    String create_by = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    String create_time = sdf.format(new Date(System.currentTimeMillis()));

                    Map<String, List> insertData = getInsertData(new_tool_use_no, tool_history_no, create_by, list, create_time);

                    ToolSpUse toolSpUse = new ToolSpUse();
                    toolSpUse.set("tool_use_no", new_tool_use_no,
                            "use_reason", use_reason,
                            "mstock_name", data.get("mstock_name"),
                            "sample_id", data.get("sample_id"),
                            "sample_pid", data.get("sample_pid"),
                            "machine_id", data.get("machine_id"),
                            "create_by", create_by,
                            "create_time", create_time);
                    if (!tool_history_no.equals("")) {
                      toolSpUse.set("tool_history_no", tool_history_no);
                    }
                    if (toolSpUse.insert()) {
                        createToolSpList(new_tool_use_no, create_by, tool_history_no, insertData);
                        Map resultMap = new HashMap<>();
                        resultMap.put("tool_use_no", new_tool_use_no);
                        List<Map> toolSpList = Base.findAll("SELECT * FROM a_huangliang_view_tool_stock_tool_sp_list WHERE tool_use_no = ?", new_tool_use_no);
                        resultMap.put("toolSpList", toolSpList);
                        return success(resultMap);
                    } else {
                        return fail("Insert ToolSpUse fail..");
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

    // 5.3.11 其他類領刀單管理-其他領刀單建立(2)_建刀具履歷主表 a_huangliang_tool_sp_history
    @RequestMapping(value = "createSpHistory", method = RequestMethod.POST)
    public RequestResult<?> createSpHistory(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Map<String, Object> result = new HashMap<>();
                    String work_by = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "admin" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

                    //1. 產生刀具履歷編號：SH+年月日+流水號3碼 共11碼
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
                    String yyyyMMdd = sdf.format(new Date(System.currentTimeMillis()));
                    String yyMMdd = yyyyMMdd.substring(2, 8);
                    String pre_tool_history_no = "SH" + yyMMdd;
                    String where = String.format("tool_history_no like '%s", pre_tool_history_no) + "%' order by tool_history_no desc";
                    ToolSpHistory toolSpHistory = ToolSpHistory.findFirst(where);
                    int number = 1;
                    if (toolSpHistory != null) {
                        String last_tool_history_no = toolSpHistory.getString("tool_history_no");
                        number = Integer.valueOf(last_tool_history_no.substring(last_tool_history_no.length() - 3, last_tool_history_no.length())) + 1;
                    }
                    String new_tool_history_no = pre_tool_history_no + String.format("%03d", number);

                    ToolSpHistory insertToolSpHistory = new ToolSpHistory();
                    Date currentTime = new Date(System.currentTimeMillis());
                    insertToolSpHistory.fromMap(data);
                    insertToolSpHistory.set(
                            "tool_history_no", new_tool_history_no,
                            "work_by", work_by,
                            "create_by", work_by,
                            "create_time", currentTime,
                            "modify_by", work_by,
                            "modify_time", currentTime
                    );
                    if (insertToolSpHistory.insert()) {
                        result.put("tool_history_no", new_tool_history_no);
                        return success(result);
                    } else {
                        return fail("Insert ToolSpHistory fail...");
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

    private String getNewToolUseNo() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
        String yyyyMMdd = sdf.format(new Date(System.currentTimeMillis()));
        String yyMMdd = yyyyMMdd.substring(2, 8);
        String pre_tool_use_no = "ST" + yyMMdd;
        String where = String.format("tool_use_no like '%s", pre_tool_use_no) + "%' order by tool_use_no desc";
        int number = 1;
        if (ToolSpUse.findFirst(where) != null) {
            String last_tool_use_no = ToolSpUse.findFirst(where).getString("tool_use_no");
            number = Integer.valueOf(last_tool_use_no.substring(last_tool_use_no.length() - 3, last_tool_use_no.length())) + 1;
        }
        return pre_tool_use_no + String.format("%03d", number);
    }

    // 建立刀具履歷明細、建立領刀明細、更新刀具庫存數、安全庫存警示(mail)
    private static void createToolSpList(String tool_use_no, String create_by, String tool_history_no, Map<String, List> insertData) throws RuntimeException {
        List<String> tool_id_list = insertData.get("toolIdList");
        List<ToolSpHisList> insertToolSpHisListData = insertData.get("toolSpHisList");
        List<ToolSpList> insertToolSpListData = insertData.get("toolSpList");
        try {
            insertToolSpListData.forEach(insertToolSpList -> {
                if (insertToolSpList.insert()) {
                    int use_qty = insertToolSpList.getInteger("use_qty");
                    ToolStock toolStock = ToolStock.findFirst("buy_time = ? AND tsup_id = ? AND tool_id = ? AND tool_location = ?",
                            insertToolSpList.get("buy_time"),
                            insertToolSpList.get("tsup_id"),
                            insertToolSpList.get("tool_id"),
                            insertToolSpList.get("tool_location"));
                    toolStock.set("tool_stock", toolStock.getInteger("tool_stock") - use_qty);
                    toolStock.set("modify_time", insertToolSpList.get("create_time"));
                    toolStock.set("modify_by", create_by);

                    if (!toolStock.saveIt()) {
                        throw new RuntimeException();
                    }
                } else {
                    throw new RuntimeException();
                }
            });
            insertToolSpHisListData.forEach(insertToolSpHisList -> {
                String tool_id = insertToolSpHisList.getString("tool_id");
                String tool_use_for = insertToolSpHisList.get("tool_use_for").toString();
                ToolSpHisList toolSpHisList = ToolSpHisList.findFirst("tool_id = ? AND tool_use_for = ? AND tool_history_no = ?", tool_id, tool_use_for, tool_history_no);
                if (toolSpHisList == null) {
                    if (!insertToolSpHisList.insert()) {
                        throw new RuntimeException();
                    }
                } else {
                    int use_qty = toolSpHisList.getInteger("use_qty");
                    toolSpHisList.set("use_qty", use_qty + insertToolSpHisList.getInteger("use_qty"));
                    toolSpHisList.set("modify_time", insertToolSpHisList.get("create_time"));
                    toolSpHisList.set("modify_by", create_by);

                    if (!toolSpHisList.saveIt()) {
                        throw new RuntimeException();
                    }
                }

            });
            new Thread(new Runnable() {
                @Override
                public void run() {
                    try {
                        checkStockNotEnough(tool_id_list);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }).start();
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    //URS 5.3.9安全庫存警示通知(Email)
    private static boolean checkStockNotEnough(List<String> tool_id_list) {
        return ActiveJdbc.operTx(new Operation<Boolean>() {
            @Override
            public Boolean operate() {
                try {
                    List<Map> result = new ArrayList<>();

                    String sql = String.format("SELECT * FROM a_huangliang_tool_profile where tool_id in %s", getSQLWhereIn(tool_id_list));
                    log.info("sql : " + sql);
                    List<ToolProfile> toolProfileList = ToolProfile.findBySQL(sql);
                    for (ToolProfile toolProfile : toolProfileList) {
                        String tool_id = toolProfile.getString("tool_id");
                        int tool_ss = toolProfile.getInteger("tool_ss");
                        String tool_newloc = toolProfile.getString("tool_newloc");
                        sql = String.format("Select sum(tool_stock) as total_tool_stock From a_huangliang_tool_stock Where tool_id = '%s' and tool_location = '%s'", tool_id, tool_newloc);
                        log.info("sql : " + sql);
                        List<Map> toolStockList = Base.findAll(sql);
                        int total_tool_stock = 0;
                        if (toolStockList != null && toolStockList.size() != 0) {
                            String total_tool_stock_str = toolStockList.get(0).get("total_tool_stock") == null ? "0" : toolStockList.get(0).get("total_tool_stock").toString();
                            total_tool_stock = Integer.valueOf(total_tool_stock_str);
                        }
                        log.info("total_tool_stock : " + total_tool_stock);
                        log.info("tool_ss : " + tool_ss);
                        if (total_tool_stock < tool_ss) {

                            Map<String, Object> map = new HashMap<>();
                            map.put("tool_id", tool_id);
                            map.put("tool_type", toolProfile.getString("tool_type"));
                            map.put("tool_spec", toolProfile.getString("tool_spec"));
                            map.put("tool_location", tool_newloc);
                            map.put("tool_stock", total_tool_stock);
                            map.put("tool_ss", tool_ss);
                            result.add(map);
                        }

                    }
                    String title = String.format("安全庫存不足警示-%s", LocalDate.now().toString());
                    Gson gson = new Gson();
                    String jsonStr = gson.toJson(result);
                    if (result.size() > 0) {
                        ConfigData configData = new ConfigData(
                                account,
                                password,
                                getGroupUserEmail("factory_manager"),
                              //  "kevintsai1325@gmail.com",
                                title,
                                System.getProperty(SysPropKey.ROOT_PATH) + "/program/template/default_template_6line.html"
                        );
                        if (!isMailConfig) {
                            return false;
                        }
                        DataTemplate dataTemplate = new DataTemplate();
                        dataTemplate.replaceMap.put("herf", SERVER_IP + "/ServCloud/index.html#app/HuangLiangToolStock/function/zh_tw/02_tool_stock.html");
                        List<Map<String, String>> list = new ArrayList<>();
                        dataTemplate.replaceMap.put("alarm_str", "");
                        dataTemplate.replaceMap.put("small_tiitle", "現場刀具庫安全庫存不足警示項目如下");
                        dataTemplate.arrMap.put("arr", list);
                        list.add(buildMap(new String[]{
                                "arr1", "刀具編碼",
                                "arr2", "刀具類型",
                                "arr3", "刀具規格",
                                "arr4", "儲位",
                                "arr5", "庫存數",
                                "arr6", "安全庫存"
                        }));
                        result.forEach(map ->
                                list.add(buildMap(new String[]{
                                        "arr1", map.get("tool_id").toString(),
                                        "arr2", map.get("tool_type").toString(),
                                        "arr3", map.get("tool_spec").toString(),
                                        "arr4", map.get("tool_location").toString(),
                                        "arr5", map.get("tool_stock").toString(),
                                        "arr6", map.get("tool_ss").toString()
                                }))
                        );
                        return MailRecord(title, jsonStr, 2, mailManager.sendMail(dataTemplate, configData));
                    } else {
                        return Boolean.TRUE;
                    }
                } catch (Exception e) {
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    System.out.println("Error : " + sw.toString());
                    return Boolean.FALSE;
                }
            }
        });
    }

    // 處理要INSERT的資料：INSERT領刀明細、INSERT履歷明細、INSERT的tool_id列表(檢查安全庫存用)
    // INSERT刀具履歷明細時要合併同刀具編號、領刀種類的資料
    private static Map<String, List> getInsertData(String tool_use_no, String tool_history_no, String create_by, List<Map> list, String create_time) throws RuntimeException {
        Set<String> tool_id_list = new HashSet<>();
        Map<String, ToolSpHisList> insertToolSpHisMap = new HashMap<>();
        List<ToolSpList> insertToolSpListData = new ArrayList<>();
        Map<String, List> result = new HashMap<>();
        boolean isInsertHistoryData = !tool_history_no.equals("");

        for (Map map : list) {
            String buy_time = map.get("buy_time").toString();
            String tool_id = map.get("tool_id").toString();
            String tool_type = map.get("tool_type").toString();
            String tool_spec = map.get("tool_spec").toString();
            String tsup_id = map.get("tsup_id").toString();
            String tool_location = map.get("tool_location").toString();
            String tool_use_for = map.get("tool_use_for").toString();
            String tool_status = map.get("tool_status").toString();
            Double use_qty_double = (Double) map.get("use_qty");
            int use_qty = use_qty_double.intValue();
            String uselist_remark = map.get("uselist_remark").toString();
            String life_remark = map.get("life_remark").toString();
            Boolean isFirst = Boolean.parseBoolean(map.get("isFirst") == null ? "false" : map.get("isFirst").toString());
            Double unit_price = Double.valueOf(ToolBuy.findFirst("tsup_id = ? and tool_id = ? and buy_time = ?", tsup_id, tool_id, buy_time).getString("unit_price"));
            Double use_cost = unit_price * (tool_status.equals("B") ? Double.valueOf(ToolType.findFirst("tool_type = ?", tool_type).getString("cost_pc")) / 100 : 1) * use_qty;

            tool_id_list.add(tool_id);

            ToolSpList insertToolSpList = new ToolSpList();
            insertToolSpList.set("tool_use_no", tool_use_no,
                    "buy_time", buy_time,
                    "tool_id", tool_id,
                    "tsup_id", tsup_id,
                    "tool_location", tool_location,
                    "tool_use_for", tool_use_for,
                    "tool_status", tool_status,
                    "use_qty", use_qty,
                    "use_cost", use_cost,
                    "uselist_status", 0,
                    "uselist_remark", uselist_remark,
                    "life_remark", life_remark,
                    "create_time", create_time,
                    "create_by", create_by,
                    "modify_time", create_time,
                    "modify_by", create_by);
            insertToolSpListData.add(insertToolSpList);

            if (isInsertHistoryData) {
              String toolSpHisListPk = tool_history_no + "-" + tool_id + "-" + tool_use_for;
              Boolean hasPk = insertToolSpHisMap.containsKey(toolSpHisListPk);
              ToolSpHisList insertToolSpHisList = new ToolSpHisList();
              if (hasPk) {
                  insertToolSpHisList = insertToolSpHisMap.get(toolSpHisListPk);
                  insertToolSpHisList.set("use_qty", insertToolSpHisList.getInteger("use_qty") + use_qty);
              } else {
                  insertToolSpHisList.set("tool_history_no", tool_history_no,
                          "tool_id", tool_id,
                          "tool_use_for", tool_use_for,
                          "use_qty", use_qty,
                          "uselist_remark", uselist_remark,
                          "life_remark", life_remark,
                          "tool_use_no", tool_use_no,
                          "status", 0,
                          "create_time", create_time,
                          "create_by", create_by,
                          "modify_time", create_time,
                          "modify_by", create_by);
              }
              if (isFirst) {
                  insertToolSpHisList.set("tsup_id", tsup_id);
              }
              insertToolSpHisMap.put(toolSpHisListPk, insertToolSpHisList);
            }
        }
        List<ToolSpHisList> toolSpHisList = new ArrayList<>();
        List<String> toolIdList = new ArrayList<>();
        toolIdList.addAll(tool_id_list);
        toolSpHisList.addAll(insertToolSpHisMap.values());
        result.put("toolSpHisList", toolSpHisList);
        result.put("toolSpList", insertToolSpListData);
        result.put("toolIdList", toolIdList);
        return result;
    }

    private static Map<Integer, String> getReasonMap() {
        Map<Integer, String> result = new HashMap<>();
        result.put(20, "樣品");
        result.put(21, "其他-治具");
        result.put(22, "其他-其他");
        return result;
    }

    private static Map<String, String> buildMap(String[] strings) {
        Map<String, String> map = new HashMap<>();
        for (int i = 0; i < strings.length; i += 2) {
            map.put(strings[i], strings[i + 1]);
        }
        return map;
    }

    private static boolean getMailConfig() {
        try {
            JsonParams jsonParams = new JsonParams("mail_config.json");
            String defaultAccount = jsonParams.getAsString("HUL_default");
            account = defaultAccount.split(",")[0];
            password = defaultAccount.split(",")[1];
            return true;
        } catch (JsonParamsException e) {
            e.printStackTrace();
            return false;
        }
    }

    private static String getToolSpUseSQL(Map data) {

        StringBuilder sqlsb = new StringBuilder();
        sqlsb.append("select * from a_huangliang_view_tool_sp_use_tool_sp_history where 1=1 ");
        StringBuilder sb = new StringBuilder();

        //判斷條件 : 材料庫
        if (data.containsKey("mstock_name") && data.get("mstock_name") != null) {
            List<String> mstock_name_List = (List<String>) data.get("mstock_name");
            if (mstock_name_List != null && mstock_name_List.size() != 0) {
                sb.append(" and mstock_name in ");
                sb.append(getSQLWhereIn(mstock_name_List));
            }
            sqlsb.append(sb.toString());
            sb.setLength(0);
        }

        //判斷條件 : 機台
        if (data.containsKey("machine_id") && data.get("machine_id") != null) {
            List<String> machine_id_List = (List<String>) data.get("machine_id");
            if (machine_id_List != null && machine_id_List.size() != 0) {
                sb.append(" and machine_id in ");
                sb.append(getSQLWhereIn(machine_id_List));
            }
            sqlsb.append(sb.toString());
            sb.setLength(0);
        }

        //判斷條件 : 領刀日期
        if (data.containsKey("startDate") && data.get("startDate") != null) {
            sb.append(" and use_create_time >= '");
            sb.append(data.get("startDate").toString() + " 00:00:00");
            sb.append("' and use_create_time <= '");
            sb.append(data.get("endDate").toString() + " 23:59:59");
            sb.append("' ");

            sqlsb.append(sb.toString());
            sb.setLength(0);
        }

        //判斷條件 : 領刀單號
        if (data.containsKey("tool_use_no") && data.get("tool_use_no") != null) {
            sb.append(" and tool_use_no = '");
            sb.append(data.get("tool_use_no").toString());
            sb.append("' ");

            sqlsb.append(sb.toString());
            sb.setLength(0);
        }

        //判斷條件 : 樣品管編
        if (data.containsKey("sample_id") && data.get("sample_id") != null) {
            sb.append(" and sample_id = '");
            sb.append(data.get("sample_id").toString());
            sb.append("' ");

            sqlsb.append(sb.toString());
            sb.setLength(0);
        }

        //判斷條件 : 樣品圖號
        if (data.containsKey("sample_pid") && data.get("sample_pid") != null) {
            String sample_pid = data.get("sample_pid").toString();
            sb.append(" and sample_pid = '");
            sb.append(sample_pid);
            sb.append("'");
            sqlsb.append(sb.toString());
            sb.setLength(0);
        }

        //判斷條件 : 領刀人員
        if (data.containsKey("create_by") && data.get("create_by") != null) {
            String create_by = data.get("create_by").toString();
            sb.append(" and use_create_by = '");
            sb.append(create_by);
            sb.append("'");
            sqlsb.append(sb.toString());
            sb.setLength(0);
        }

        //判斷條件 : 領刀原因
        if (data.containsKey("use_reason") && data.get("use_reason") != null) {
            List<Integer> use_reason_List = (List<Integer>) data.get("use_reason");
            if (use_reason_List != null && use_reason_List.size() != 0) {
                sb.append(" and use_reason in (");
                for (int i = 0; i < use_reason_List.size(); i++) {
                    sb.append(use_reason_List.get(i));
                    if (i + 1 != use_reason_List.size()) {
                        sb.append(" , ");
                    }
                }
                sb.append(" ) ");
            }
            sqlsb.append(sb.toString());
            sb.setLength(0);
        }

        return sqlsb.toString();
    }

    private static String getGroupUserEmail(String group_id) {
        StringBuilder emails = new StringBuilder();
        String sql = "SELECT m.user_email FROM `m_sys_user` as m join m_sys_user_group as g WHERE g.group_id = '" + group_id + "' and g.user_id = m.user_id";
        List<Map> users = SysUser.findBySQL(sql).toMaps();
        for (Map map : users) {
            String str = (String) map.get("user_email");
            if (str != null && !str.equals("")) {
                emails.append(str).append(",");
            }
        }
        String result = emails.toString();
        if (result.contains(",")) {
            result = result.substring(0, result.length() - 1);
        }
        return result;
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

    //URS 5.3.8 / 5.3.9 Insert寄信紀錄API
    private static boolean MailRecord(String title, String jsonStr, int type, boolean is_success) {
        try {
            EmailRecord insertEmailRecord = new EmailRecord();
            String is_send = is_success == Boolean.TRUE ? "Y" : "N";
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd hh:mm:ss");
            Date date = new Date(System.currentTimeMillis());
            String yyyyMMdd = sdf.format(date).substring(0, 8);
            String sql = "SELECT * FROM a_huangliang_email_record WHERE mail_id like '" + yyyyMMdd + "%' ORDER BY mail_id DESC LIMIT 1";
            System.out.println("sql : " + sql);
            List<EmailRecord> emailRecordList = EmailRecord.findBySQL(sql);
            int number = 1;
            if (emailRecordList != null && emailRecordList.size() != 0) {
                String mail_id = emailRecordList.get(0).getString("mail_id");
                System.out.println("mail_id = " + mail_id);
                number = Integer.valueOf(mail_id.substring(mail_id.length() - 4, mail_id.length())) + 1;
            }
            String new_mail_id = yyyyMMdd + String.format("%04d", number);
            System.out.println("new_mail_id = " + new_mail_id);
            insertEmailRecord.set("mail_id", new_mail_id,
                    "title", title,
                    "content", jsonStr,
                    "type", type,
                    "is_send", is_send,
                    "create_time", date);
            return insertEmailRecord.insert();
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return false;
        }
    }
}