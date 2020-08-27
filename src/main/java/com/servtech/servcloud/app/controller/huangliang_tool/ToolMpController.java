package com.servtech.servcloud.app.controller.huangliang_tool;

import com.google.gson.Gson;
import com.mysql.fabric.xmlrpc.base.Array;
import com.servtech.servcloud.app.model.huangliang_matStock.MacList;
import com.servtech.servcloud.app.model.huangliang_matStock.WoList;
import com.servtech.servcloud.app.model.huangliang.RepairCode;
import com.servtech.servcloud.app.model.huangliang.RepairRecord;
import com.servtech.servcloud.app.model.huangliang.RepairItem;
import com.servtech.servcloud.app.model.huangliang_tool.*;
import com.servtech.servcloud.app.model.huangliang_tool.view.*;
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
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.model.SysUser;
import com.servtech.servcloud.tank.master.service.exception.FailException;
import com.sun.org.apache.xpath.internal.operations.Bool;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

@RestController
@RequestMapping("/huangliangTool/toolmp")
public class ToolMpController {
    private static final String LOCK = new String();
    private static final Logger log = LoggerFactory.getLogger(ToolMpController.class);
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

    //5.3.1 量產類領刀單管理-記錄查詢_查詢量產領刀紀錄
    @RequestMapping(value = "/queryToolMpList", method = RequestMethod.GET)
    public RequestResult<?> queryToolMpList(@RequestParam(value = "order_id", required = false) String order_id,
                                            @RequestParam(value = "mstock_name[]") List<String> mstock_name,
                                            @RequestParam(value = "machine_id[]", required = false) List<String> machine_id,
                                            @RequestParam(value = "startDate") String startDate,
                                            @RequestParam(value = "endDate") String endDate,
                                            @RequestParam(value = "tool_use_no", required = false) String tool_use_no,
                                            @RequestParam(value = "use_reason[]", required = false) List<Integer> use_reason,
                                            @RequestParam(value = "create_by", required = false) String create_by,
                                            @RequestParam(value = "product_id", required = false) String product_id) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Map data = new HashMap();
                    data.put("order_id", order_id);
                    data.put("mstock_name", mstock_name);
                    data.put("machine_id", machine_id);
                    data.put("startDate", startDate);
                    data.put("endDate", endDate);
                    data.put("tool_use_no", tool_use_no);
                    data.put("use_reason", use_reason);
                    data.put("create_by", create_by);
                    data.put("product_id", product_id);

                    String sql = getToolMpUseSQL(data);
                    log.info("sql : " + sql);
                    List<Map<String, Object>> resultList = new ArrayList<>();
                    List<ToolMpUseMpHistoryWoList> views = ToolMpUseMpHistoryWoList.findBySQL(sql);
                    if (views != null && views.size() != 0) {
                        for (ToolMpUseMpHistoryWoList view : views) {
                            Map<String, Object> map = new HashMap<>();
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
                            String tool_use_no = view.getString("tool_use_no");
                            List<Map> toolMpList = ToolMpList.find("tool_use_no = ?", tool_use_no).toMaps();
                            Double sum_use_cost = 0.0;
                            for (Map record : toolMpList) {
                                Object use_cost = record.get("use_cost");
                                Double useCostD = use_cost != null ? Double.valueOf(use_cost.toString()) : 0;
                                sum_use_cost += useCostD;
                            }
                            map.putAll(view.toMap());
                            map.put("list", toolMpList);
                            map.put("sum_use_cost", sum_use_cost);
                            map.put("create_time", sdf.format(view.getDate("create_time")));
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

    // 5_5.3.2 量產類領刀單管理-校車領刀單建立(1)_查詢同管編同機型最後一筆刀具履歷
    @RequestMapping(value = "/getHistoryData", method = RequestMethod.GET)
    public RequestResult<?> getHistoryData(@RequestParam(value = "order_id") String order_id,
                                           @RequestParam(value = "machine_id") String machine_id) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Map result = new HashMap();
                    WoList woList = WoList.findFirst("order_id = ?", order_id);
                    String product_id = woList.getString("product_id");
                    String product_pid = woList.getString("product_pid");
                    MacList macList = MacList.findFirst("machine_id = ?", machine_id);
                    String machine_type = macList.getString("mac_type");
                    String sql = String.format("SELECT twm.* FROM " +
                            "(SELECT tmh.tool_history_no, tmh.order_id , tmh.work_by, tmh.produce_notice, tmh.tool_ptime , tmh.main_chuck , tmh.second_chuck , tmh.mat_code  , tmh.program_seq , tmh.program_name, wl.product_id, wl.product_pid , ml.machine_id , ml.mac_type as machine_type " +
                            "FROM a_huangliang_tool_mp_history tmh " +
                            "JOIN a_huangliang_tool_mp_his_list tmhl " +
                            "ON tmh.tool_history_no = tmhl.tool_history_no " +
                            "JOIN a_huangliang_wo_list wl " +
                            "ON tmh.order_id = wl.order_id " +
                            "JOIN a_huangliang_mac_list ml " +
                            "ON tmh.machine_id = ml.machine_id " +
                            "WHERE wl.product_id = '%s' and ml.mac_type = '%s' ORDER BY tmh.create_time DESC) as twm", product_id, machine_type);
                    System.out.println("sql : " + sql);
                    List<Map> maps = Base.findAll(sql);
                    if (maps != null && maps.size() != 0) {
                        return success(maps.get(0));
                    }
                    result.put("product_id", product_id);
                    result.put("product_pid", product_pid);
                    return success(result);
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return fail(e.getMessage());
        }
    }

    // 6_5.3.2 量產類領刀單管理-校車領刀單建立(2)_建刀具履歷主表 a_huangliang_tool_mp_history
    @RequestMapping(value = "createMpHistory", method = RequestMethod.POST)
    public RequestResult<?> createMpHistory(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Map<String, Object> result = new HashMap<>();
                    String work_by = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "admin" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

                    //1. 產生刀具履歷編號：PH+年月日+流水號3碼 共11碼
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
                    String yyyyMMdd = sdf.format(new Date(System.currentTimeMillis()));
                    String yyMMdd = yyyyMMdd.substring(2, 8);
                    String pre_tool_history_no = "PH" + yyMMdd;
                    String where = String.format("tool_history_no like '%s", pre_tool_history_no) + "%' order by tool_history_no desc";
                    ToolMpHistory toolMpHistory = ToolMpHistory.findFirst(where);
                    int number = 1;
                    if (toolMpHistory != null) {
                        String last_tool_history_no = toolMpHistory.getString("tool_history_no");
                        number = Integer.valueOf(last_tool_history_no.substring(last_tool_history_no.length() - 3, last_tool_history_no.length())) + 1;
                    }
                    String new_tool_history_no = pre_tool_history_no + String.format("%03d", number);
                    Date currentTime = new Date(System.currentTimeMillis());
                    ToolMpHistory insertToolMpHistory = new ToolMpHistory();
                    insertToolMpHistory.fromMap(data);
                    insertToolMpHistory.set(
                            "tool_history_no", new_tool_history_no,
                            "work_by", work_by,
                            "create_by", work_by,
                            "create_time", currentTime,
                            "modify_by", work_by,
                            "modify_time", currentTime
                    );
                    if (insertToolMpHistory.insert()) {
                        result.put("tool_history_no", new_tool_history_no);
                        result.put("list", getMpHisList(data, new_tool_history_no));
                        return success(result);
                    } else {
                        return fail("Insert ToolMpHistory fail...");
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

    // 7_5.3.2 量產類領刀單管理-校車領刀單建立(3)_查是否在刀具履歷項目內
    @RequestMapping(value = "/getToolHisIsExist", method = RequestMethod.GET)
    public RequestResult<?> getToolHisIsExist(@RequestParam("tool_id") final String tool_id, @RequestParam("product_id") final String product_id) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Set<String> toolIdList = new HashSet<>();
                    toolIdList.add(tool_id);
                    List<String> exceptionUseToolId = getExceptionUseToolId(product_id, toolIdList);
                    return success(exceptionUseToolId.size() > 0 ? "N" : "Y");
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return fail(e.getMessage());
        }
    }

    // 8_5.3.2 量產類領刀單管理-校車領刀單建立(3)_查刀具庫存
    @RequestMapping(value = "/getToolStock", method = RequestMethod.GET)
    public RequestResult<?> getToolStock(@RequestParam("tool_id") final String tool_id) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Map<String, Map<String, Object>> resultMap = new HashMap();
                    ToolProfile toolProfile = ToolProfile.findFirst("tool_id = ?", tool_id);
                    String tool_newloc = toolProfile.getString("tool_newloc");
                    String tool_recloc = toolProfile.getString("tool_recloc");
                    List<ToolStock> toolStockList = ToolStock.find("tool_id = ? AND tool_stock > 0", tool_id);
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    int tool_newloc_stock = 0;
                    int tool_recloc_stock = 0;
                    List<Map> newStockList = new ArrayList<>();
                    List<Map> recStockList = new ArrayList<>();
                    for (ToolStock toolStock : toolStockList) {
                        Map<String, Object> map = new HashMap();
                        String tool_location = toolStock.getString("tool_location");
                        int tool_stock = toolStock.getInteger("tool_stock");
                        String buy_time = sdf.format(toolStock.get("buy_time"));
                        String tsup_id = toolStock.getString("tsup_id");
                        String tool_status = toolStock.getString("tool_status");

                        map.put("buy_time", buy_time);
                        map.put("tsup_id", tsup_id);
                        map.put("tool_id", tool_id);
                        map.put("tool_location", tool_location);
                        map.put("tool_status", tool_status);
                        map.put("tool_stock", tool_stock);

                        if (tool_status.equals("N")) {
                            tool_newloc_stock += tool_stock;
                            newStockList.add(map);
                        } else {
                            tool_recloc_stock += tool_stock;
                            recStockList.add(map);
                        }
                    }
                    Map<String, Object> newLocMap = new HashMap<>();
                    Map<String, Object> recLocMap = new HashMap<>();
                    newLocMap.put("tool_location", tool_newloc);
                    newLocMap.put("sum_tool_stock", tool_newloc_stock);
                    newLocMap.put("stockList", newStockList);
                    recLocMap.put("tool_location", tool_recloc);
                    recLocMap.put("sum_tool_stock", tool_recloc_stock);
                    recLocMap.put("stockList", recStockList);
                    resultMap.put("N", newLocMap);
                    resultMap.put("B", recLocMap);

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

    // 9_5.3.2 量產類領刀單管理-校車領刀單建立(3)_建立領刀單(主表、明細、履歷明細)
    @RequestMapping(value = "/createToolMpUse", method = RequestMethod.POST)
    public RequestResult<?> createToolMpUse(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    String new_tool_use_no = getNewToolUseNo();
                    List<Map> list = (List<Map>) data.get("list");
                    Object use_reason = data.get("use_reason");
                    String order_id = data.get("order_id").toString();
                    String machine_id = data.get("machine_id").toString();
                    String tool_history_no = data.get("tool_history_no").toString();
                    String create_by = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    String create_time = sdf.format(new Date(System.currentTimeMillis()));

                    Map<String, List> insertData = getInsertData(new_tool_use_no, tool_history_no, create_by, list, create_time);
                    List<ToolMpHisList> insertToolMpHisList = insertData.get("toolMpHisList");

                    // 檢查是否未在刀具履歷內，有就發mail通知
                    firstThread = new Thread(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                checkExceptionToolUse(data, create_by, create_time, insertToolMpHisList);
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    });
                    firstThread.start();

                    ToolMpUse toolMpUse = new ToolMpUse();
                    toolMpUse.set(
                      "tool_use_no", new_tool_use_no,
                      "use_reason", use_reason,
                      "order_id", order_id,
                      "machine_id", machine_id,
                      "tool_history_no", tool_history_no,
                      "create_by", create_by,
                      "create_time", create_time
                    );
                    if (toolMpUse.insert()) {
                        // 建立領刀明細和履歷明細
                        createToolMpList(new_tool_use_no, create_by, tool_history_no, insertData);
                        // 取消刀具履歷(維修領刀順便取消明細)
                        List<Map> cancelList = (List<Map>) data.get("cancelList");
                        if (cancelList != null && cancelList.size() > 0) {
                          // 取消刀具履歷不用刪掉對應的維修項目，以防萬一先留著
                          // 查「愈取消的履歷明細」 對應的 「領刀明細」 對應的 「維修項目」
                          String toolHistoryNoToCancel = cancelList.get(0).get("tool_history_no").toString();
                          // StringJoiner repairItemJoiner = new StringJoiner(" OR ", "(", ")");
                          // for (Map map : cancelList) {
                          //   repairItemJoiner.add("(useList.tool_use_for = '" + map.get("tool_use_for").toString() + "' AND useList.tool_id = '" + map.get("tool_id").toString() + "')");
                          // }
                          // String sql = "SELECT subQuery.*, repairItem.* " +
                          // "FROM a_huangliang_repair_record repairRecord " +
                          // "JOIN a_huangliang_repair_item repairItem" +
                          // "ON repairRecord.machine_id = repairItem.machine_id AND repairRecord.alarm_time = repairItem.alarm_time " +
                          // "JOIN " +
                          // "(SELECT useList.tool_use_no, useList.tool_use_for, SUM(d.use_qty) sum_use_qty " +
                          // "FROM a_huangliang_tool_mp_list useList " +
                          // "JOIN a_huangliang_tool_mp_use useRecord ON useList.tool_use_no = useRecord.tool_use_no " +
                          // "JOIN a_huangliang_tool_mp_his_list hisList " +
                          // "ON useRecord.tool_history_no = hisList.tool_history_no AND hisList.tool_use_for = useList.tool_use_for AND hisList.tool_id = useList.tool_id " +
                          // "WHERE useRecord.tool_history_no = '" + toolHistoryNoToCancel + "' AND " +
                          // repairItemJoiner.toString() +
                          // " AND useRecord.use_reason = '12' AND hisList.`status` = 0 AND useList.uselist_status = 0 GROUP BY useList.tool_use_no, useList.tool_use_for) subQuery " +
                          // "ON subQuery.tool_use_no = repairRecord.tool_use_no AND subQuery.tool_use_for = repairItem.repair_code";
                          // log.info("sql : " + sql);
                          // List<Map> repairItem = Base.findAll(sql);
                          // for (Map map : repairItem) {
                          //   int sum_use_qty = Integer.valueOf(map.get("sum_use_qty").toString());
                          //   int itemCount = Integer.valueOf(map.get("count").toString());
                          //   String alarm_time = map.get("alarm_time").toString();
                          //   String repair_code = map.get("repair_code").toString();
                          //   if (itemCount == sum_use_qty) {
                          //     RepairItem.delete("alarm_time = ? AND machine_id = ? AND repair_code = ?", alarm_time, machine_id, repair_code);
                          //   } else {
                          //     RepairItem.update("count = count - " + sum_use_qty, "alarm_time = ? AND machine_id = ? AND repair_code = ?", alarm_time, machine_id, repair_code);
                          //   }
                          // }

                          for (Map rowData : cancelList) {
                              ToolMpHisList.update(
                                "status = 1, modify_time = ?, modify_by = ?", "tool_history_no = ? and tool_id = ? and tool_use_for = ?",
                                create_time,
                                create_by,
                                toolHistoryNoToCancel,
                                rowData.get("tool_id"),
                                rowData.get("tool_use_for")
                              );
                          }
                        }
                        // 如果有維修通報時間(維修領刀時)，就更新/新增維修項目
                        String alarm_time = data.get("alarm_time").toString();
                        if (!alarm_time.equals("")) {
                          RepairRecord.update("tool_use_no = ?", "alarm_time = ? AND machine_id = ?", new_tool_use_no, alarm_time, machine_id);
                          for (Map toolUse : list) {
                            String repair_code = toolUse.get("tool_use_for").toString();
                            RepairItem repairItem = RepairItem.findFirst("machine_id = ? AND alarm_time = ? AND repair_code = ?", machine_id, alarm_time, repair_code);
                            Double use_qty_double = (Double) toolUse.get("use_qty");
                            int use_qty = use_qty_double.intValue();
                            if (repairItem != null) {
                              repairItem.set("count", repairItem.getInteger("count") + use_qty);
                              repairItem.saveIt();
                            } else {
                              repairItem = new RepairItem();
                              repairItem.set(
                                "machine_id", machine_id,
                                "alarm_time", alarm_time,
                                "repair_code", repair_code,
                                "count", use_qty,
                                "create_by", create_by,
                                "create_time", create_time
                              );
                              repairItem.insert();
                            }
                          }
                        }
                        Map resultMap = new HashMap<>();
                        resultMap.put("tool_use_no", new_tool_use_no);
                        List<Map> toolMpList = Base.findAll("SELECT * FROM a_huangliang_view_tool_stock_tool_mp_list WHERE tool_use_no = ?", new_tool_use_no);
                        resultMap.put("toolMpList", toolMpList);
                        return success(resultMap);
                    } else {
                        return fail("Insert ToolMpUse fail..");
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

    // 11 _ 5.3.4 量產類領刀單管理-校車領刀單明細修改 _修改量產領刀明細
    @RequestMapping(value = "/updateToolMpList", method = RequestMethod.PUT)
    public RequestResult<?> updateToolMpList(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Map resultMap = new HashMap();
                    List<Map> result = new ArrayList<>();
                    String tool_history_no = data.get("tool_history_no").toString();
                    String tool_use_no = data.get("tool_use_no").toString();
                    List<Map> insertList = (List<Map>) data.get("insert");
                    List<Map> updateList = (List<Map>) data.get("update");
                    List<Map> cancelList = (List<Map>) data.get("cancel");
                    List<Map> returnList = (List<Map>) data.get("return");
                    String create_by = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    String create_time = sdf.format(new Date(System.currentTimeMillis()));
                    RepairRecord repairRecord = RepairRecord.findFirst("tool_use_no = ?", tool_use_no);

                    if (insertList.size() != 0 && insertList != null) {
                        Map<String, List> insertData = getInsertData(tool_use_no, tool_history_no, create_by, insertList, create_time);
                        List<ToolMpHisList> insertToolMpHisList = insertData.get("toolMpHisList");
                        firstThread = new Thread(new Runnable() {
                            @Override
                            public void run() {
                                try {
                                    log.info(Thread.currentThread().getName() + ":start");
                                    checkExceptionToolUse(data, create_by, create_time, insertToolMpHisList);
                                } catch (Exception e) {
                                    e.printStackTrace();
                                }
                            }
                        });
                        firstThread.start();
                        // 1 ~ 3 建立量產領刀明細 與 建立量產刀具履歷明細
                        createToolMpList(tool_use_no, create_by, tool_history_no, insertData);
                        // 更新維修項目
                        if (repairRecord != null) {
                          String alarm_time = repairRecord.getString("alarm_time");
                          String machine_id = repairRecord.getString("machine_id");
                          for (Map toolUse : insertList) {
                            String repairCode = toolUse.get("tool_use_for").toString();
                            RepairItem repairItem = RepairItem.findFirst("machine_id = ? AND alarm_time = ? AND repair_code = ?", machine_id, alarm_time, repairCode);
                            Double use_qty_double = (Double) toolUse.get("use_qty");
                            int use_qty = use_qty_double.intValue();
                            if (repairItem != null) {
                              repairItem.set("count", repairItem.getInteger("count") + use_qty);
                              repairItem.saveIt();
                            } else {
                              repairItem = new RepairItem();
                              repairItem.set(
                                "machine_id", machine_id,
                                "alarm_time", alarm_time,
                                "repair_code", repairCode,
                                "count", use_qty,
                                "create_by", create_by,
                                "create_time", create_time
                              );
                              repairItem.insert();
                            }
                          }
                        }
                    }

                    //4. 取消
                    for (Map cancel : cancelList) {
                        String buy_time = cancel.get("buy_time").toString();
                        String tool_id = cancel.get("tool_id").toString();
                        String tsup_id = cancel.get("tsup_id").toString();
                        String tool_location = cancel.get("tool_location").toString();
                        String tool_use_for = cancel.get("tool_use_for").toString();
                        int fix_for = cancel.get("fix_for") == null ? -1 : (int) Double.parseDouble(cancel.get("fix_for").toString());
                        Boolean isBrokenTool = fix_for == 0;
                        int count = ToolMpList.update("uselist_status = '1', modify_time = ?, modify_by = ?", 
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
                            count = isBrokenTool ? 0 : ToolMpHisList.update("status = '1', modify_time = ?, modify_by = ?",
                              "tool_history_no = ? and tool_id = ? and tool_use_for = ?",
                              create_time,
                              create_by,
                              tool_history_no,
                              tool_id,
                              tool_use_for);
                            // 更新維修項目
                            if (repairRecord != null) {
                              String alarm_time = repairRecord.getString("alarm_time");
                              String machine_id = repairRecord.getString("machine_id");
                              Double use_qty_double = (Double) cancel.get("use_qty");
                              int use_qty = use_qty_double.intValue();
                              RepairItem repairItem = RepairItem.findFirst("machine_id = ? AND alarm_time = ? AND repair_code = ?", machine_id, alarm_time, tool_use_for);
                              int itemCount = repairItem.getInteger("count");
                              if (itemCount == use_qty) {
                                repairItem.delete();
                              } else {
                                repairItem.set("count", itemCount - use_qty);
                                repairItem.saveIt();
                              }
                            }
                            if (count != 1 && !isBrokenTool) {
                                throw new RuntimeException("ToolMpHisList update fail..");
                            }
                        } else {
                            throw new RuntimeException("ToolMpList update fail..");
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
                        ToolMpList toolMpList = ToolMpList.findFirst("tool_use_no = ? and buy_time = ? and tool_id = ? and tsup_id = ? and tool_location = ? and tool_use_for = ?", tool_use_no, buy_time, tool_id, tsup_id, tool_location, tool_use_for);
                        int fix_for = toolMpList.get("fix_for") == null ? -1 : (int) Double.parseDouble(toolMpList.get("fix_for").toString());
                        Boolean isBrokenTool = fix_for == 0;
                        //領刀明細的領刀明細狀態改成99
                        toolMpList.set("uselist_status", "99",
                          "modify_time", create_time,
                          "modify_by", create_by);
                        if (toolMpList.saveIt()) {
                            ToolStock toolStock = ToolStock.findFirst("buy_time = ? and tool_id = ? and tsup_id = ? and tool_location = ?", buy_time, tool_id, tsup_id, tool_location);
                            //找到每筆領刀明細對應的庫存，將其庫存數加回領用數
                            toolStock.set("tool_stock", toolStock.getInteger("tool_stock") + use_qty,
                              "modify_time", create_time,
                              "modify_by", create_by);
                            if (toolStock.saveIt()) {
                                //對應的履歷明細的狀態改成99
                                int count = isBrokenTool ? 0 : ToolMpHisList.update("status = '99', modify_time = ?, modify_by = ?",
                                  "tool_history_no = ? and tool_id = ? and tool_use_for = ?",
                                  create_time,
                                  create_by,
                                  tool_history_no,
                                  tool_id,
                                  tool_use_for);
                                if (repairRecord != null) {
                                  String alarm_time = repairRecord.getString("alarm_time");
                                  String machine_id = repairRecord.getString("machine_id");
                                  RepairItem repairItem = RepairItem.findFirst("machine_id = ? AND alarm_time = ? AND repair_code = ?", machine_id, alarm_time, tool_use_for);
                                  int itemCount = repairItem.getInteger("count");
                                  if (itemCount == use_qty) {
                                    repairItem.delete();
                                  } else {
                                    repairItem.set("count", itemCount - use_qty);
                                    repairItem.saveIt();
                                  }
                                }
                                if (count != 1 && !isBrokenTool) {
                                    throw new RuntimeException("ToolMpHisList update fail..");
                                }
                            } else {
                                throw new RuntimeException("ToolStock update fail..");
                            }
                        } else {
                            throw new RuntimeException("ToolMpList update fail..");
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
                        int fix_for = update.get("fix_for") == null ? -1 : (int) Double.parseDouble(update.get("fix_for").toString());
                        Boolean isBrokenTool = fix_for == 0;
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
                            ToolMpList toolMpList = ToolMpList.findFirst("tool_use_no = ? and buy_time = ? and tool_id = ? and tsup_id = ? and tool_location = ? and tool_use_for = ?", tool_use_no, buy_time, tool_id, tsup_id, tool_location, tool_use_for);
                            ToolMpHisList toolMpHisList = ToolMpHisList.findFirst("tool_history_no = ? and tool_id = ? and tool_use_for = ?", tool_history_no, tool_id, tool_use_for);
                            String tool_status = toolMpList.getString("tool_status");
                            ToolProfile toolProfile = ToolProfile.findFirst("tool_id = ?", tool_id);
                            String tool_type = toolProfile.getString("tool_type");
                            Double unit_price = Double.valueOf(ToolBuy.findFirst("tsup_id = ? and tool_id = ? and buy_time = ?", tsup_id, tool_id, buy_time).getString("unit_price"));
                            // 回收成本比例(%)
                            Double cost_pc = tool_status.equals("B") ? (Double.valueOf(ToolType.findFirst("tool_type = ?", tool_type).getString("cost_pc")) / 100) : 1;
                            Double use_cost = unit_price * cost_pc * use_qty;
                            toolMpList.set("use_cost", use_cost, 
                              "use_qty", use_qty,
                              "modify_time", create_time,
                              "modify_by", create_by);
                            if (toolMpList.saveIt()) {
                                if (!isBrokenTool) {
                                  toolMpHisList.set("use_qty", use_qty,
                                    "modify_time", create_time,
                                    "modify_by", create_by);
                                  if (!toolMpHisList.saveIt()) {
                                      throw new RuntimeException("ToolMpHisList update fail..");
                                  }
                                }
                            } else {
                                throw new RuntimeException("ToolMpList update fail..");
                            }
                        }
                        // 維修領刀不能修改數量，但還是留著這段以防萬一
                        if (repairRecord != null) {
                          String alarm_time = repairRecord.getString("alarm_time");
                          String machine_id = repairRecord.getString("machine_id");
                          RepairItem repairItem = RepairItem.findFirst("machine_id = ? AND alarm_time = ? AND repair_code = ?", machine_id, alarm_time, tool_use_for);
                          int count = repairItem.getInteger("count");
                          repairItem.set("count", count + delta);
                          repairItem.saveIt();
                        }
                    }
                    if (toolIdSetToCheckStock.size() > 0) {
                      if (firstThread != null) {
                          T1 secondThread = new T1(firstThread, new ArrayList<>(toolIdSetToCheckStock));
                          secondThread.start();
                      } else {
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
                    }
                    resultMap.put("updateFail", result);
                    List<Map> toolMpList = Base.findAll("SELECT * FROM a_huangliang_view_tool_stock_tool_mp_list WHERE tool_use_no = ?", tool_use_no);
                    resultMap.put("toolMpList", toolMpList);
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

    public static class T1 extends Thread {
        List<String> data;
        Thread thread;

        public T1() {
        }

        public T1(Thread thread, List<String> data) {
            this.data = data;
            this.thread = thread;
        }

        @Override
        public void run() {
            try {
                log.info(Thread.currentThread().getName() + ":start");
                log.info("data : " + data);
                this.thread.join();
                checkStockNotEnough(this.data);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    // 20. [5.3.5 量產類領刀單管理-維修領刀單明細建立] 取得刀具履歷明細
    @RequestMapping(value = "/toolMpHisList", method = RequestMethod.GET)
    public RequestResult<?> getToolMpHisList(
            @RequestParam(value = "machine_id", required = true) String machine_id,
            @RequestParam(value = "order_id", required = true) String order_id) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    // 用機台編號和生產指令查找符合領刀單，取建立日期最接近現在的領刀單對應的刀具履歷編號，再取得其狀態為建立(0)的刀具履歷明細
                    ToolMpUse firstMatch = ToolMpUse.findFirst("order_id = ? AND machine_id = ? ORDER BY create_time DESC", order_id, machine_id);
                    if (firstMatch != null) {
                        String tool_history_no = firstMatch.getString("tool_history_no");
                        WoList woList = WoList.findFirst("order_id = ?", order_id);
                        ToolMpHistory toolMpHistory = ToolMpHistory.findFirst("tool_history_no = ?", tool_history_no);
                        Map result = new HashMap<>();
                        result.put("tool_history_no", tool_history_no);
                        result.put("product_id", woList.get("product_id") != null ? woList.getString("product_id") : "");
                        result.put("product_pid", woList.get("product_pid") != null ? woList.getString("product_pid") : "");
                        result.put("program_name", toolMpHistory.get("program_name") != null ? toolMpHistory.getString("program_name") : "");
                        List<Map> list = ToolMpHisList.find("tool_history_no = ? AND status = 0", tool_history_no).toMaps();
                        result.put("list", list);
                        return success(result);
                    } else {
                        return fail("Not found");
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

    @RequestMapping(value = "/testMail", method = RequestMethod.POST)
    public RequestResult<?> testMail(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    List<String> tool_id_list = (List<String>) data.get("list");
                    boolean mail2 = checkStockNotEnough(tool_id_list);
                    return success(mail2);
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    private static String getToolMpUseSQL(Map data) {

        StringBuilder sqlsb = new StringBuilder();
        sqlsb.append("select * from a_huangliang_view_tool_mp_use_tool_mp_history_wo_list where 1=1 ");
        StringBuilder sb = new StringBuilder();

        //判斷條件 : 材料庫
        if (data.containsKey("mstock_name") && data.get("mstock_name") != null) {
            List<String> mstock_names = (List<String>) data.get("mstock_name");
            if (mstock_names.size() == 1) {
                sb.append(" and order_id like '");
                if (mstock_names.get(0).equals("五金")) {
                    sb.append("M");
                } else {
                    sb.append("G");
                }

                sb.append("%' ");
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
            sb.append(" and create_time >= '");
            sb.append(data.get("startDate").toString() + " 00:00:00");
            sb.append("' and create_time <= '");
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

        //判斷條件 : 生產指令
        if (data.containsKey("order_id") && data.get("order_id") != null) {
            sb.append(" and order_id = '");
            sb.append(data.get("order_id").toString());
            sb.append("' ");

            sqlsb.append(sb.toString());
            sb.setLength(0);
        }

        //判斷條件 : 管編
        if (data.containsKey("product_id") && data.get("product_id") != null) {
            String product_id = data.get("product_id").toString();
            sb.append(" and product_id = '");
            sb.append(product_id);
            sb.append("'");
            sqlsb.append(sb.toString());
            sb.setLength(0);
        }

        //判斷條件 : 領刀人員
        if (data.containsKey("create_by") && data.get("create_by") != null) {
            String create_by = data.get("create_by").toString();
            sb.append(" and create_by = '");
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

    //URS 5.3.8量產類領刀單管理-例外刀具領用警示
    private static boolean checkExceptionToolUse(Map<String, Object> param, String create_by, String create_time, List<ToolMpHisList> insertMpHisListData) {
        return ActiveJdbc.operTx(new Operation<Boolean>() {
            @Override
            public Boolean operate() {
                try {
                    List<Map> result = new ArrayList<>();
                    List<Map> dataList = (List<Map>) param.get("list");
                    String tool_history_no = param.get("tool_history_no").toString();
                    String order_id = param.get("order_id").toString();
                    String product_id = WoList.findFirst("order_id = ?", order_id).getString("product_id");
                    String machine_name = Device.findFirst("device_id = ?", param.get("machine_id").toString()).getString("device_name");
                    String create_by_name = SysUser.findFirst("user_id = ?", create_by).getString("user_name");
                    int use_reason = Double.valueOf(param.get("use_reason").toString()).intValue();
                    String use_reason_name = useReasonMap.get(use_reason);
                    Set<String> toolIdList = new HashSet<>();
                    for (ToolMpHisList data : insertMpHisListData) {
                        toolIdList.add(data.get("tool_id").toString());
                    }
                    List<String> exceptionUseToolIdList = getExceptionUseToolId(product_id, toolIdList);
                    Set<String> toolUseForSet = new HashSet<>();
                    Map<String, Map> toolProfileMap = new HashMap<>();
                    if (exceptionUseToolIdList.size() > 0) {
                        List<ToolProfile> toolProfile = ToolProfile.find("tool_id IN (" + String.join(", ", exceptionUseToolIdList) + ")");
                        for (ToolProfile record : toolProfile) {
                            Map<String, String> toolTypeSpecMap = new HashMap<>();
                            toolTypeSpecMap.put("tool_type", record.getString("tool_type"));
                            toolTypeSpecMap.put("tool_spec", record.getString("tool_spec"));
                            toolProfileMap.put(record.getString("tool_id"), toolTypeSpecMap);
                        }
                    }
                    for (ToolMpHisList data : insertMpHisListData) {
                        String tool_id = data.get("tool_id").toString();
                        boolean isExeption = exceptionUseToolIdList.contains(tool_id);
                        if (isExeption) {
                            Map map = new HashMap();
                            String tool_use_for = data.get("tool_use_for").toString();
                            toolUseForSet.add(tool_use_for);
                            map.put("tool_id", tool_id);
                            map.put("tool_type", toolProfileMap.get(tool_id).get("tool_type"));
                            map.put("tool_spec", toolProfileMap.get(tool_id).get("tool_spec"));
                            map.put("tool_use_for", tool_use_for);
                            map.put("use_qty", data.get("use_qty").toString());
                            map.put("uselist_remark", data.get("uselist_remark") == null ? "" : data.get("uselist_remark").toString());
                            result.add(map);
                        }
                    }
                    Map<String, String> repairCodeMap = new HashMap<>();
                    if (toolUseForSet.size() > 0) {
                        List<RepairCode> repairCode = RepairCode.find("repair_code IN (" + String.join(", ", toolUseForSet) + ")");
                        for (RepairCode code : repairCode) {
                            repairCodeMap.put(code.getString("repair_code"), code.getString("repair_code_name"));
                        }
                    }
                    String title = String.format("%s例外刀具領用警示通知-%s", machine_name, LocalDate.now().toString());
                    Map<String, Object> mailContent = new HashMap<>();
                    if (result.size() != 0) {
                        ConfigData configData = new ConfigData(
                                account,
                                password,
                                getGroupUserEmail("factory_manager"),
                              //  "kevintsai1325@gmail.com",
                                title,
                                System.getProperty(SysPropKey.ROOT_PATH) + "/program/template/default_template_6line_2table.html"
                        );
                        if (!isMailConfig) {
                            return false;
                        }
                        DataTemplate dataTemplate = new DataTemplate();
                        dataTemplate.replaceMap.put("herf", SERVER_IP + "/ServCloud/index.html#app/HuangLiangToolUse/function/zh_tw/01_mp_tool_use_management.html");
                        List<Map<String, String>> list = new ArrayList<>();
                        dataTemplate.replaceMap.put("alarm_str", "");
                        dataTemplate.replaceMap.put("small_tiitle", String.format("%s領用非刀具履歷項目，明細如下", machine_name));
                        dataTemplate.arrMap.put("arr", list);
                        list.add(buildMap(new String[]{
                                "arr1", "生產指令",
                                "arr2", "管編",
                                "arr3", "派工機台",
                                "arr4", "領刀時間",
                                "arr5", "領刀原因",
                                "arr6", "領刀人員"
                        }));
                        list.add(buildMap(new String[]{
                                "arr1", order_id,
                                "arr2", product_id,
                                "arr3", machine_name,
                                "arr4", create_time,
                                "arr5", use_reason_name,
                                "arr6", create_by_name
                        }));
                        List<Map<String, String>> list2 = new ArrayList<>();
                        dataTemplate.arrMap.put("arr1", list2);
                        list2.add(buildMap(new String[]{
                                "arr1", "刀具編碼",
                                "arr2", "刀具類型",
                                "arr3", "刀具規格",
                                "arr4", "領刀種類",
                                "arr5", "領用數量",
                                "arr6", "領刀備註"
                        }));
                        result.forEach(map -> {
                                    map.put("repairName", repairCodeMap.get(map.get("tool_use_for").toString()));
                                    list2.add(buildMap(new String[]{
                                            "arr1", map.get("tool_id").toString(),
                                            "arr2", map.get("tool_type").toString(),
                                            "arr3", map.get("tool_spec").toString(),
                                            "arr4", repairCodeMap.get(map.get("tool_use_for").toString()),
                                            "arr5", map.get("use_qty").toString(),
                                            "arr6", map.get("uselist_remark").toString()
                                    }));
                                }
                        );
                        mailContent.put("order_id", order_id);
                        mailContent.put("product_id", product_id);
                        mailContent.put("machine_name", machine_name);
                        mailContent.put("create_time", create_time);
                        mailContent.put("use_reason_name", use_reason_name);
                        mailContent.put("create_by_name", create_by_name);
                        mailContent.put("list", result);
                        Gson gson = new Gson();
                        String jsonStr = gson.toJson(mailContent);
                        return MailRecord(title, jsonStr, 1, mailManager.sendMail(dataTemplate, configData));
                    }
                    return Boolean.TRUE;
                } catch (Exception e) {
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    System.out.println("Error : " + sw.toString());
                    return Boolean.FALSE;
                }
            }
        });
    }

    // 取得例外領刀的刀具編號
    private static List<String> getExceptionUseToolId(String product_id, Set<String> toolIdList) {
        try {
            List<String> exeptionUseToolIdList = new ArrayList<>();
            Set<String> existToolId = new HashSet<>();

            // 取得同管編的刀具履歷明細
            String whereClause = "product_id = ? AND tool_id IS NOT NULL GROUP BY tool_id";
            List<ToolMpHistoryToolMpHisList> toolMpHisList = ToolMpHistoryToolMpHisList.find(whereClause, product_id);

            // 如果過去沒有建立過此管編的刀具履歷就回傳空陣列
            if (toolMpHisList.size() == 0) {
                return exeptionUseToolIdList;
            }

            for (ToolMpHistoryToolMpHisList data : toolMpHisList) {
                if (data.get("tool_id") != null) {
                    existToolId.add(data.get("tool_id").toString());
                }
            }

            for (String toolId : toolIdList) {
                boolean isExist = existToolId.contains(toolId);
                if (!isExist) {
                    exeptionUseToolIdList.add(toolId);
                }
            }
            return exeptionUseToolIdList;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return new ArrayList<>();
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

    private static String getCleanTimestamp(String str) {
        try {
            return sdf.format(sdf.parse(str));
        } catch (ParseException e) {
            e.printStackTrace();
            return str;
        }
    }

    private static Map<String, String> buildMap(String[] strings) {
        Map<String, String> map = new HashMap<>();
        for (int i = 0; i < strings.length; i += 2) {
            map.put(strings[i], strings[i + 1]);
        }
        return map;
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

    private static Map<Integer, String> getReasonMap() {
        Map<Integer, String> result = new HashMap<>();
        result.put(11, "量產校車");
        result.put(12, "量產維修");
        return result;
    }

    // 查同管編，各機台最新一筆刀具履歷下的履歷明細
    private static List<Map> getMpHisList(Map data, String tool_history_no) {
        List<Map> result = new ArrayList<>();
        String product_id = data.get("product_id").toString();
        // 先篩出同管編的刀具履歷(去掉沒有履歷明細的履歷)才能GROUP機台取得各機台最新的刀具履歷，再JOIN明細等等的資料
        String sql = String.format("SELECT t7.*, t5.create_time max_time, t5.machine_id, t6.program_name, t8.tool_spec, t8.tool_type FROM " +
                "(SELECT max(t4.create_time) create_time, t4.machine_id FROM " +
                "(SELECT t1.tool_history_no FROM a_huangliang_tool_mp_history t1 " +
                "JOIN a_huangliang_wo_list t2 " +
                "ON t1.order_id = t2.order_id " +
                "JOIN a_huangliang_tool_mp_his_list t9 " +
                "ON t1.tool_history_no = t9.tool_history_no " +
                "WHERE t2.product_id = '%s' AND t1.tool_history_no <> '%s') t3 " +
                "JOIN a_huangliang_tool_mp_history t4 ON t3.tool_history_no = t4.tool_history_no " +
                "GROUP BY t4.machine_id) t5 " +
                "JOIN a_huangliang_tool_mp_history t6 ON t5.create_time = t6.create_time " +
                "JOIN a_huangliang_tool_mp_his_list t7 ON t7.tool_history_no = t6.tool_history_no " +
                "JOIN a_huangliang_tool_profile t8 ON t7.tool_id = t8.tool_id " + 
                "WHERE t7.status = 0", product_id, tool_history_no);
        System.out.println("sql : " + sql);
        List<Map> maps = Base.findAll(sql);
        return maps;
    }

    private String getNewToolUseNo() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
        String yyyyMMdd = sdf.format(new Date(System.currentTimeMillis()));
        String yyMMdd = yyyyMMdd.substring(2, 8);
        String pre_tool_use_no = "PT" + yyMMdd;
        String where = String.format("tool_use_no like '%s", pre_tool_use_no) + "%' order by tool_use_no desc";
        int number = 1;
        if (ToolMpUse.findFirst(where) != null) {
            String last_tool_use_no = ToolMpUse.findFirst(where).getString("tool_use_no");
            number = Integer.valueOf(last_tool_use_no.substring(last_tool_use_no.length() - 3, last_tool_use_no.length())) + 1;
        }
        return pre_tool_use_no + String.format("%03d", number);
    }

    // 建立量產刀具履歷明細、建立量產領刀明細、更新刀具庫存數、安全庫存警示(mail)
    private static void createToolMpList(String tool_use_no, String create_by, String tool_history_no, Map<String, List> insertData) throws RuntimeException {
        List<String> tool_id_list = insertData.get("toolIdList");
        List<ToolMpHisList> insertToolMpHisListData = insertData.get("toolMpHisList");
        List<ToolMpList> insertToolMpListData = insertData.get("toolMpList");
        try {
            insertToolMpListData.forEach(insertToolMpList -> {
                if (insertToolMpList.insert()) {
                    int use_qty = insertToolMpList.getInteger("use_qty");
                    ToolStock toolStock = ToolStock.findFirst("buy_time = ? AND tsup_id = ? AND tool_id = ? AND tool_location = ?",
                            insertToolMpList.get("buy_time"),
                            insertToolMpList.get("tsup_id"),
                            insertToolMpList.get("tool_id"),
                            insertToolMpList.get("tool_location"));
                    toolStock.set("tool_stock", toolStock.getInteger("tool_stock") - use_qty);
                    toolStock.set("modify_time", insertToolMpList.get("create_time"));
                    toolStock.set("modify_by", create_by);

                    if (!toolStock.saveIt()) {
                        throw new RuntimeException();
                    }
                } else {
                    throw new RuntimeException();
                }
            });
            insertToolMpHisListData.forEach(insertToolMpHisList -> {
                String tool_id = insertToolMpHisList.getString("tool_id");
                String tool_use_for = insertToolMpHisList.get("tool_use_for").toString();
                ToolMpHisList toolMpHisList = ToolMpHisList.findFirst("tool_id = ? AND tool_use_for = ? AND tool_history_no = ?", tool_id, tool_use_for, tool_history_no);
                if (toolMpHisList == null) {
                    if (!insertToolMpHisList.insert()) {
                        throw new RuntimeException();
                    }
                } else {
                    int use_qty = toolMpHisList.getInteger("use_qty");
                    toolMpHisList.set("use_qty", use_qty + insertToolMpHisList.getInteger("use_qty"));
                    toolMpHisList.set("modify_time", insertToolMpHisList.get("create_time"));
                    toolMpHisList.set("modify_by", create_by);

                    if (!toolMpHisList.saveIt()) {
                        throw new RuntimeException();
                    }
                }

            });
            if (firstThread != null) {
                T1 secondThread = new T1(firstThread, tool_id_list);
                secondThread.start();
            } else {
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
            }
        //  checkStockNotEnough(tool_id_list);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    // 處理要INSERT的資料：INSERT領刀明細、INSERT履歷明細、INSERT的tool_id列表(檢查安全庫存用)
    // INSERT刀具履歷明細時要合併同刀具編號、領刀種類的資料
    private static Map<String, List> getInsertData(String tool_use_no, String tool_history_no, String create_by, List<Map> list, String create_time) throws RuntimeException {
        Set<String> tool_id_list = new HashSet<>();
        Map<String, ToolMpHisList> insertToolMpHisMap = new HashMap<>();
        List<ToolMpList> insertToolMpListData = new ArrayList<>();
        Map<String, List> result = new HashMap<>();

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

            
            int fix_for = map.get("fix_for") == null ? -1 : (int) Double.parseDouble(map.get("fix_for").toString());
            Boolean isBrokenTool = fix_for == 0;

            tool_id_list.add(tool_id);

            ToolMpList insertToolMpList = new ToolMpList();
            insertToolMpList.set("tool_use_no", tool_use_no,
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
                    "fix_no", map.get("fix_no"),
                    "fix_for", map.get("fix_for"),
                    "create_time", create_time,
                    "create_by", create_by,
                    "modify_time", create_time,
                    "modify_by", create_by);
            insertToolMpListData.add(insertToolMpList);

            if (isBrokenTool) {
              continue;
            }
            String toolMpHisListPk = tool_history_no + "-" + tool_id + "-" + tool_use_for;
            Boolean hasPk = insertToolMpHisMap.containsKey(toolMpHisListPk);
            ToolMpHisList insertToolMpHisList = new ToolMpHisList();
            if (hasPk) {
                insertToolMpHisList = insertToolMpHisMap.get(toolMpHisListPk);
                insertToolMpHisList.set("use_qty", insertToolMpHisList.getInteger("use_qty") + use_qty);
            } else {
                insertToolMpHisList.set("tool_history_no", tool_history_no,
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
                insertToolMpHisList.set("tsup_id", tsup_id);
            }
            insertToolMpHisMap.put(toolMpHisListPk, insertToolMpHisList);
        }
        List<ToolMpHisList> toolMpHisList = new ArrayList<>();
        List<String> toolIdList = new ArrayList<>();
        toolIdList.addAll(tool_id_list);
        toolMpHisList.addAll(insertToolMpHisMap.values());
        result.put("toolMpHisList", toolMpHisList);
        result.put("toolMpList", insertToolMpListData);
        result.put("toolIdList", toolIdList);
        return result;
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