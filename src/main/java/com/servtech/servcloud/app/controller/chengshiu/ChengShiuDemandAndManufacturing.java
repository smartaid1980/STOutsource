package com.servtech.servcloud.app.controller.chengshiu;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.app.model.chengshiu.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.javalite.activejdbc.Base;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.*;
import java.lang.reflect.Type;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.*;
import static com.servtech.servcloud.app.controller.chengshiu.ChengShiuUtilities.*;

/**
 * Created by Raynard on 2017/11/2.
 */

@RestController
@RequestMapping("/chengshiu/demandandmanufacturing")
public class ChengShiuDemandAndManufacturing {
    private static final org.slf4j.Logger log = LoggerFactory.getLogger(ChengShiuDemandAndManufacturing.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    private static final SimpleDateFormat SQL_DATE_TIME = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private static final SimpleDateFormat SQL_DATE = new SimpleDateFormat("yyyy-MM-dd");
    private static final String FORM_PREFIX = "W";
    private static final SimpleDateFormat yyMM = new SimpleDateFormat("yyMM");
    public static final Type WORK_FORM_LIST_TYPE = new TypeToken<List<WorkForm>>() {
    }.getType();


    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final List<Map> workFormList) {
        try{
            final String currDate = yyMM.format(new Date());
            final List<String> result = new ArrayList<String>();
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    String demand_id = "";
                    for (Map data : workFormList) {
                        demand_id = data.get("demand_id").toString();
                        final List<Map> maxCount = Base.findAll("SELECT COUNT(*) as count FROM a_chengshiu_work_order WHERE work_id like '" + FORM_PREFIX + currDate + "%'");
                        long count = Long.parseLong(maxCount.get(0).get("count").toString());
                        count++;
                        String work_id = FORM_PREFIX + currDate + String.format("%03d", count);
                        data.put("work_id", work_id);
                        data.put("status_id", "0");
                        data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        data.put("create_time", new Timestamp(System.currentTimeMillis()));
                        data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                        data.put("input_pcs", 0);
                        data.put("output_pcs", 0);
                        data.put("ng_pcs", 0);
                        // issue 調整的部份 2018/03/07
                        data.put("ctn_pcs", 0 );
                        data.put("cmplt_pcs", 0);
                        // 調整部份的結束
                        WorkOrder workOrder = new WorkOrder();
                        workOrder.fromMap(data);
                        if (workOrder.insert()) {
                            result.add(work_id);
                        } else {
                            int runCount = 10;
                            for (int i = 0; i < runCount; i++) {
                                count++;
                                work_id = FORM_PREFIX + currDate + String.format("%03d", count);
                                data.put("work_id", work_id);
                                workOrder.fromMap(data);
                                if (workOrder.insert()) {
                                    result.add(work_id);
                                    break;
                                }
                            }

                        }
                    }
                    if (result.size() == workFormList.size()) {
                        Map map = new HashMap();
                        map.put("demand_id", demand_id);
                        map.put("status_id", "1");
                        map.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        map.put("modify_time", new Timestamp(new Date().getTime()));
                        DemandOrder demandOrder = new DemandOrder();
                        demandOrder.fromMap(map);
                        if (demandOrder.saveIt()) {
                            return success(result);
                        } else {
                            log.info("需求單: " + demand_id +" 狀態更新失敗! 請確認");
                            return fail("需求單狀態更新失敗! 請確認");
                        }
                    } else {
                        log.info("工單轉換未完整，請連絡系統負責人");
                        return fail("工單轉換未完整，請連絡系統負責人");
                    }
                }
            });

        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/getWorkYield", method = RequestMethod.POST)
    public RequestResult<?> getWorkYield(@RequestBody final Map data){
        return  ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT a.*,b.demand_id,b.product_id, c.product_name, c.product_quality_sp ");
                sb.append("From ");
                sb.append("a_chengshiu_work_order as a, ");
                sb.append("a_chengshiu_demand_order as b, ");
                sb.append("a_chengshiu_product as c ");
                sb.append("WHERE ");
                sb.append("(a.demand_id=b.demand_id ");
                sb.append("AND ");
                sb.append("b.product_id = c.product_id) ");
                if (data.get("startDate") != null && data.get("endDate")!= null) {
                    sb.append("AND (a.create_time BETWEEN ");
                    sb.append("'" + data.get("startDate").toString() + " 00:00:00' ");
                    sb.append("AND ");
                    sb.append("'" +  data.get("endDate").toString() + " 23:59:59' ) ");
                }
                if (data.get("product_id")!= null) {
                    sb.append("AND b.product_id = '" + data.get("product_id").toString() + "'");
                }
                if (data.get("status") != null) {
                    List<String> list = (List)data.get("status");
                    if (list.size() > 0) {
                        sb.append("AND ");
                        sb.append("a.status_id IN " + strSplitBy(",", list));
                    }
                }
                if (data.get("work_id") != null) {
                    sb.append("AND a.work_id = '" + data.get("work_id").toString() + "'");
                }
                List<Map> workOrderList = Base.findAll(sb.toString());
//                List<Map> workOrderList = WorkOrder.findAll().include().toMaps();
                for (Map map : workOrderList) {
                    String est_date = SQL_DATE.format(map.get("est_date"));
                    String create_time = SQL_DATE_TIME.format(map.get("create_time"));
                    String modify_time = SQL_DATE_TIME.format(map.get("modify_time"));
                    map.put("create_time", create_time);
                    map.put("modify_time", modify_time);
                    map.put("est_date", est_date);
                }
                return success(workOrderList);
            }
        });
    }

    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<?> read() {

        return  ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT a.*,b.demand_id,b.product_id, c.product_name ");
                sb.append("From ");
                sb.append("a_chengshiu_work_order as a, ");
                sb.append("a_chengshiu_demand_order as b, ");
                sb.append("a_chengshiu_product as c ");
                sb.append("WHERE ");
                sb.append("(a.demand_id=b.demand_id ");
                sb.append("AND ");
                sb.append("b.product_id = c.product_id) ");
                List<Map> workOrderList = Base.findAll(sb.toString());
//                List<Map> workOrderList = WorkOrder.findAll().include().toMaps();
                for (Map map : workOrderList) {
                    String est_date = SQL_DATE.format(map.get("est_date"));
                    String create_time = SQL_DATE_TIME.format(map.get("create_time"));
                    String modify_time = SQL_DATE_TIME.format(map.get("modify_time"));
                    map.put("create_time", create_time);
                    map.put("modify_time", modify_time);
                    map.put("est_date", est_date);
                }
                return success(workOrderList);
            }
        });
    }


    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                WorkOrder workOrder = new WorkOrder();
                workOrder.fromMap(data);
                if (workOrder.saveIt()) {
                    return success(workOrder.getString("work_id"));
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }
    // start 動作說明
    //透過line_id 取得各個料號 資訊
    //透過 work_id + trace_id 做一些判斷
    //  1)如果沒有trace_id  要自動create 一個箱號 且寫人 trace 主表和 work_id_箱號 的表格
    //  2)如果有箱號 箱號主表可以不寫可是  work_id_箱號還是要寫
    //寫入 料號_工單_箱號的表
    //更新當前 產線 的工單
    //寫入工單副表的資訊 (注意count 數)
    //更新 chengshiu/works/工單檔案
    //更新 lastWork 的工單
    @RequestMapping(value = "/start", method = RequestMethod.POST)
    public RequestResult<?> start(@RequestBody final Map data) {
        final String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
        String line_id = data.get("line_id").toString();  //線別
        final String work_id = data.get("work_id").toString();  //工單號
        String trace_id = data.get("trace_id").toString();    //箱號

        if (!trace_id.equals("")) {
            final String trace = trace_id;
            System.out.println("工單: " + work_id + " 接續箱號: " + trace_id);
            ActiveJdbc.oper(new Operation<Void>() {
                @Override
                public Void operate() {
                    String lastWorkId = TraceWork.findFirst("trace_id=? order by modify_time desc", trace).getString("work_id");
                    if (!work_id.equals(lastWorkId)) {
                        int ctn_pcs = Trace.findFirst("trace_id=?", trace).getInteger("inbox_pcs");
                        WorkOrder workOrder = new WorkOrder();
                        Map dataMap = new HashMap();
                        dataMap.put("work_id", work_id);
                        dataMap.put("ctn_pcs", ctn_pcs);
                        dataMap.put("modify_by", user);
                        dataMap.put("modify_time", new Timestamp(System.currentTimeMillis()));
                        workOrder.fromMap(dataMap);
                        if (workOrder.saveIt()) {
                            System.out.println("工單: " + work_id + " 接續片數更新完成");
                        }
                        return null;
                    } else {
                        System.out.println("工單: " + work_id + " 接續箱號: " + trace + "為同一箱");
                        return null;
                    }
                }
            });
        }
        List<Map> machines = getLineMachines(line_id, true);
        Map<String, List<Map>> machineMaterialMap; //所有設備所使用的料件
        if (machines.size() == 0 ) {
            return fail("該產線: " + line_id + " 沒有任何設備, 請確認...");
        } else {
            //把拿到的 所有設備 還有他相關的料件組成map
            machineMaterialMap = getMaterialItems(machines,true );
        }
        //如果 Trace 沒有這個箱號就寫入
        trace_id = getBoxSerialNumber(work_id, trace_id, user);
        data.put("trace_id", trace_id);

        //寫成品原料的資料
        if (!insertTraceMaterial(trace_id, machineMaterialMap, user, true)) {
            return fail("寫入成品原料追蹤資料有問題, 請確認");
        }

        //寫裝籃機設備的箱號資料
        if (!updateMachineTrace(machines, line_id, trace_id, user, true)) {
            return fail("更新裝籃機設備箱號有問題, 請確認");
        }

        //更新產線的工單資訊
        if (!updateLineWork(line_id, work_id, user)) {
            return fail("更新產線當前工單有問題, 請確認");
        }
        System.out.println("工單開始生產: " + work_id);
        return success(insertWorkStart(data, user));


    }

    @RequestMapping(value = "/end", method = RequestMethod.POST)
    public RequestResult<?> end(@RequestBody final Map data) {

        final Type WORK_FORM_LIST_TYPE = new TypeToken<List<WorkForm>>(){}.getType();
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                WorkForm workForm = null;
                List<WorkForm> workFormList;
                final String work_id = data.get("work_id").toString();
                final String line_id = data.get("line_id").toString();
                final String trace_id = data.get("trace_id").toString();
                final Integer ctn_pcs = WorkOrder.findFirst("work_id=?", work_id).getInteger("ctn_pcs");
                if (ctn_pcs > 0 ) {
                    System.out.println("工單: " + work_id + ", 箱號: " + trace_id + " 為接續箱號 結束生產需做加總");
                }
                List<WorkOrderDuration> workOrderDurations = WorkOrderDuration.where("work_id=? order by act_start_time desc", work_id);
                WorkOrderDuration lastDuration = workOrderDurations.get(0);
                final String start_time = SQL_DATE_TIME.format(lastDuration.getDate("act_start_time"));
                final String end_time = SQL_DATE_TIME.format(new Date());
                log.info("工單結束生產: " + work_id);
                String press_count_end = data.get("press_count").toString();
                String ear_count_end = data.get("ear_count").toString();
                String pack_count_end = data.get("pack_count").toString();
                String output_count_end = data.get("output_count").toString();
                String ng_count = data.get("ng_count").toString();

                File work = new File(System.getProperty(SysPropKey.DATA_PATH) + "/chengshiu/works", work_id);
                StringBuilder sb = new StringBuilder();
                try {
                    int fileSize = (int) work.length();
                    int buff;
                    FileInputStream fis = new FileInputStream(work);
                    byte[] bytes = new byte[fileSize];
                    while ((buff = fis.read(bytes, 0, bytes.length)) != -1) {
                        sb.append(new String(bytes, 0, buff));
                    }
                    fis.close();
                    workFormList = new Gson().fromJson(sb.toString(), WORK_FORM_LIST_TYPE);
                    workForm = workFormList.get(workFormList.size() - 1);
                    workForm.end_time = end_time;
                    workForm.press_count_end = press_count_end;
                    workForm.ear_count_end = ear_count_end;
                    workForm.pack_count_end = pack_count_end;
                    workForm.output_count_end = output_count_end;
                    workForm.ng_count = ng_count;
                    final int ngCount = Integer.parseInt(workForm.ng_count);
                    final int total = Integer.parseInt(workForm.press_count_end) - Integer.parseInt(workForm.press_count_start);
                    final int qcTotal = Integer.parseInt(workForm.output_count_end) - Integer.parseInt(workForm.output_count_start);

                    FileOutputStream fos = new FileOutputStream(work);
                    String result = new Gson().toJson(workFormList);
                    fos.write(result.getBytes());
                    fos.flush();
                    fos.close();

                    final Map map = new HashMap();
                    map.put("work_id", work_id);
                    map.put("input_pcs", total);
                    map.put("output_pcs", qcTotal);
                    map.put("act_start_time", start_time);
                    map.put("act_cple_time", end_time);
                    map.put("status_id", "2");
                    map.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    map.put("modify_time", end_time);
                    map.put("ng_pcs", ng_count);
                    updateMaterialItem(line_id, workForm, request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString());
                    updateTrace(trace_id, qcTotal, work_id, line_id, request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString());
                    updateWorkFormPcs(work_id, total, qcTotal, ngCount, request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString());
                    WorkOrderDuration workOrderDuration = new WorkOrderDuration();
                    workOrderDuration.fromMap(map);
                    if (workOrderDuration.saveIt()) {
                        log.info("工單數量更新: " + work_id);
                        Map lineMap = new HashMap();
                        lineMap.put("line_id", line_id);
                        lineMap.put("work_id", null);
                        Line line = new Line();
                        line.fromMap(lineMap);
                        if (line.saveIt()) {
                            log.info("產線: " + line_id + ", 工單: " + work_id + " 已出站");
                        } else {
                            log.info("產線: " + line_id + ", 出站工單: " + work_id + "更新失敗");
                        }
                    } else {
                        log.info("寫入工單 " + work_id + " 起迄失敗，原因待查");
                    }
                    return success(workForm);

                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                }
                return RequestResult.fail(workForm);
            }
        });
    }

    public static WorkForm insertWorkStart(final Map data, final String user) {

        final String work_id = data.get("work_id").toString();
        String trace_id = data.get("trace_id").toString();
        String press_count_start = data.get("press_count").toString();
        String ear_count_start = data.get("ear_count").toString();
        String pack_count_start = data.get("pack_count").toString();
        String output_count_start = data.get("output_count").toString();
        final String operator = data.get("operator") == null ? "": data.get("operator").toString();
        final String start_time = SQL_DATE_TIME.format(new Date());
        List<WorkForm> workFormList = new ArrayList<WorkForm>();

        WorkForm workForm = new WorkForm.Builder().setWork_id(work_id)
                .setTrace_id(trace_id)
                .setStart_time(start_time)
                .setPress_count_start(press_count_start)
                .setEar_count_start(ear_count_start)
                .setPack_count_start(pack_count_start)
                .setOutput_count_start(output_count_start)
                .setOperator(operator)
                .build();
        workFormList.add(workForm);

        ActiveJdbc.operTx(new Operation<Void>() {
            @Override
            public Void operate() {
                final Map<String, Object> workDurationMap = new HashMap<String, Object>();
                workDurationMap.put("work_id", work_id);
                workDurationMap.put("act_start_time", start_time);
                workDurationMap.put("status_id", "1");
                workDurationMap.put("ng_pcs", "0");
                workDurationMap.put("operator", operator);
                workDurationMap.put("create_by", user);
                workDurationMap.put("create_time", start_time);
                workDurationMap.put("modify_by", user);
                workDurationMap.put("modify_time", start_time);

                WorkOrderDuration workOrderDuration = new WorkOrderDuration();
                workOrderDuration.fromMap(workDurationMap);
                if (!workOrderDuration.insert()) {
                    log.info("寫入工單起迄失敗，原因待查...");
                }
                WorkOrder workOrder = WorkOrder.findFirst("work_id=?", work_id);
                int ng_total = workOrder.getInteger("ng_pcs") == null ? 0 : workOrder.getInteger("ng_pcs");
                Map map = new HashMap();
                map.put("work_id", work_id);
                map.put("status_id", "1");
                map.put("ng_pcs", ng_total);
                workOrder = new WorkOrder();
                workOrder.fromMap(map);
                if (!workOrder.saveIt()) {
                    log.info("工單: " + work_id + "狀態更新失敗, 請確認");
                }
                workOrder = WorkOrder.findFirst("work_id=?", work_id);
                String demand_id = workOrder.getString("demand_id");
                DemandOrder demandOrder = DemandOrder.findFirst("demand_id=?", demand_id);
                if (demandOrder.getString("status_id").equals("1")) {
                    Map demandMap = new HashMap();
                    demandMap.put("demand_id", demand_id);
                    demandMap.put("status_id", "2");
                    demandMap.put("modify_by", user);
                    demandMap.put("modify_time", start_time);
                    demandOrder = new DemandOrder();
                    demandOrder.fromMap(demandMap);
                    if (!demandOrder.saveIt()) {
                        log.info("需求單: " + demand_id + "狀態更新失敗, 請確認");
                    }
                }
                return null;
            }
        });
        File workRoot = new File(System.getProperty(SysPropKey.DATA_PATH) + "/chengshiu/works");
        if (!workRoot.exists()) {
            workRoot.mkdirs();
        }
        //工單檔名
        File work = new File(workRoot.getAbsoluteFile(), work_id);
        try {
            FileOutputStream fos = null;
            StringBuilder sb = new StringBuilder();
            //寫入這張單的資訊
            if (!work.exists()) {
                fos = new FileOutputStream(work);
                String result = new Gson().toJson(workFormList);
                fos.write(result.getBytes());
                fos.flush();
                fos.close();
            } else {
                int fileSize = (int) work.length();
                int buff;
                FileInputStream fis = new FileInputStream(work);
                byte[] bytes = new byte[fileSize];
                while ((buff = fis.read(bytes, 0, bytes.length)) != -1) {
                    sb.append(new String(bytes, 0, buff));
                }
                fis.close();
                workFormList = new Gson().fromJson(sb.toString(), WORK_FORM_LIST_TYPE);
                workFormList.add(workForm);
                fos = new FileOutputStream(work);
                String result = new Gson().toJson(workFormList);
                fos.write(result.getBytes());
                fos.flush();
                fos.close();
            }
            work = new File(workRoot.getAbsoluteFile(), "lastWork");
            fos = new FileOutputStream(work);
            fos.write(work_id.getBytes());
            fos.flush();
            fos.close();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return workForm;
    }

    //更新那該死的料的數量
    public static void updateMaterialItem(final String line_id, final WorkForm workForm, final String user) {
        try {
            StringBuilder sb = new StringBuilder();
            PreparedStatement ps = Base.startBatch("Update a_chengshiu_material_item " +
                    "set usable_pcs=?, machine_id=?, modify_by=?, modify_time=? " +
                    "where item_id=? AND material_id=?");

            sb.append("SELECT a.line_id,a.type, b.machine_id, b.material_id, b.item_id, b.usable_pcs ");
            sb.append("FROM ");
            sb.append("a_chengshiu_machine as a, a_chengshiu_material_item as b ");
            sb.append("WHERE ");
            sb.append("a.line_id=? ");
            sb.append("AND ");
            sb.append("a.machine_id = b.machine_id ");
            sb.append("AND ");
            sb.append("b.status_id=? ");
            List<Map> itemMap = Base.findAll(sb.toString(), line_id, "3");
            String[] itemIndexStr = new String[itemMap.size()];
            int itemIndex = 0;
            for (Map map : itemMap) {
                String type = map.get("type").toString();
                String machine_id = map.get("machine_id").toString();
                String material_id = map.get("material_id").toString();
                String item_id = map.get("item_id").toString();
                int prevUsable = Integer.parseInt(map.get("usable_pcs").toString());
                int usable_pcs = 0;
                int result_pcs = 0;
                if (type.equals("M1")) {
                    usable_pcs = Integer.parseInt(workForm.press_count_end) - Integer.parseInt(workForm.press_count_start);
                    result_pcs= prevUsable - usable_pcs;
                } else if (type.equals("M21")) {
                    usable_pcs = Integer.parseInt(workForm.ear_count_end) - Integer.parseInt(workForm.ear_count_start);
                    result_pcs= prevUsable - usable_pcs;
                } else if (type.equals("M31")) {
                    usable_pcs = Integer.parseInt(workForm.pack_count_end) - Integer.parseInt(workForm.pack_count_start);
                    result_pcs= prevUsable - usable_pcs;
                }
                itemIndexStr[itemIndex] = item_id;

                ps.setInt(1, result_pcs);
                ps.setString(2, machine_id);
                ps.setString(3, user);
                ps.setTimestamp(4, new Timestamp(System.currentTimeMillis()));
                ps.setString(5, item_id);
                ps.setString(6, material_id);
                ps.addBatch();

                itemIndex++;
//            Map data = new HashMap();
//            data.put("machine_id", machine_id);
//            data.put("material_id", material_id);
//            data.put("item_id", item_id);
//            data.put("usable_pcs", result_pcs);
//            data.put("modify_by", user);
//            data.put("modify_time", new Timestamp(System.currentTimeMillis()));
//            MaterialItem materialItem = new MaterialItem();
//            materialItem.fromMap(data);
//            if (materialItem.save()) {
//                log.info("原料單件號數量更新成功: " + item_id);
//            } else {
//                log.info("原料單件號數量更新失敗: " + item_id);
//            }
            }
            int[] resultInt = ps.executeBatch();
            for(int i = 0, resultIndex = resultInt.length; i < resultIndex; i++) {
                int result = resultInt[i];
                if (result > 0) {
                    log.info("原料單件號數量更新成功: " + itemIndexStr[i]);
                } else {
                    log.info("原料單件號數量更新失敗: " + itemIndexStr[i]);
                }
            }
            ps.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }


    public static void updateWorkFormPcs(final String work_id, final int total, final int qcTotal, final int ngPcs, String user) {
        log.info("工單: " + work_id + " 更新主表資訊");
        List<WorkOrder> workOrderList = WorkOrder.where("work_id=?", work_id);
        WorkOrder workOrder = workOrderList.get(0);
        int factor = workOrder.getInteger("conv_factor");
        String status = "0";
        int targetCount = workOrder.getInteger("est_pcs");
        int workInput = workOrder.getInteger("input_pcs");
        int workOutput = workOrder.getInteger("output_pcs");
        int workNgPcs = workOrder.getInteger("ng_pcs");
        int ctnPcs = workOrder.getInteger("ctn_pcs");
        int cmpltPcs = workOrder.getInteger("cmplt_pcs");
        workInput += total;
        workOutput += qcTotal;
        int traceCount = ((workOutput + ctnPcs) / factor) * factor;

        workNgPcs += ngPcs;
        if (traceCount >= targetCount) {
            status = "2";
        }

        Map map = new HashMap();
        map.put("work_id", work_id);
        map.put("input_pcs", workInput);
        map.put("output_pcs", workOutput);
        map.put("ng_pcs", workNgPcs);
        map.put("ctn_pcs", 0);
        map.put("cmplt_pcs", traceCount);
        map.put("status_id", status);
        map.put("modify_by", user);
        map.put("modify_time", SQL_DATE_TIME.format(new Date()));
        workOrder = new WorkOrder();
        workOrder.fromMap(map);
        if (workOrder.saveIt()) {
            log.info("工單: " + work_id + " 生產數量及狀態更新成功!");
            if (status.equals("2")) {
                log.info("工單: " + work_id + " 已結案!");
            }
        } else {
            log.info("工單: " + work_id + " 生產數量及狀態更新失敗");
        }
    }

    public static void updateTrace(final String trace_id, final int qcTotal, final String work_id, final String line_id, final String user) {
        log.info("箱號數量更新: " + trace_id);
        List<Trace> traceList = Trace.find("trace_id=?", trace_id).include();
        Trace trace = traceList.get(0);
        int count = trace.getInteger("inbox_pcs")==null? 0 : trace.getInteger("inbox_pcs");
        List<ConversionFactor> conversionFactorList = ConversionFactor.findAll().include();
        int boxingCount = conversionFactorList.get(0).getInteger("conv_factor");
        count = count + qcTotal;
        Map data = new HashMap();
        if (count >= boxingCount) {
            data.put("status_id", "1");
        }
        if (count > boxingCount) {
            data.put("inbox_pcs", boxingCount);
        } else {
            data.put("inbox_pcs", count);
        }
        data.put("trace_id", trace_id);
//        data.put("inbox_pcs", count);
        data.put("modify_by", user);
        data.put("modify_time", new Timestamp(System.currentTimeMillis()));
        trace = new Trace();
        trace.fromMap(data);
        if (trace.saveIt()) {
            log.info("箱號數量更新完成: " + trace_id);
        } else {
            log.info("箱號數量更新失敗: " + trace_id);
        }
        if (count > boxingCount) {
            log.info("數量: " + count + " 大於轉換係數: " + boxingCount);
            int pcs = count - boxingCount;
            String newTrace = getBoxSerialNumberNop(work_id, "", user);
            log.info("溢出數量: " + pcs + " 將放置新箱號: " + newTrace);
            data.put("trace_id", newTrace);
            data.put("inbox_pcs", pcs);
            if (pcs >= boxingCount) {
                data.put("status_id", "1");
            } else {
                data.put("status_id", "0");
            }
            data.put("modify_by", user);
            data.put("modify_time", new Timestamp(System.currentTimeMillis()));
            trace = new Trace();
            trace.fromMap(data);
            if (trace.saveIt()) {
                log.info("箱號: " + newTrace + " 數量更新完成");
            } else {
                log.info("箱號: " + newTrace + " 數量更新失敗");
            }

            //取得所有機台
            List<Map> machines = getLineMachines(line_id, false);
            Map<String, List<Map>> machineMaterialMap = getMaterialItems(machines, false); //所有設備所使用的料件
            if (!insertTraceMaterial(newTrace, machineMaterialMap, user, false)) {
                log.info("寫入成品原料追蹤資料有問題, 請確認");
            }
            //寫裝籃機設備的箱號資料
            if (!updateMachineTrace(machines, line_id, newTrace, user, false)) {
                log.info("更新裝籃機設備箱號有問題, 請確認");
            }
        }
    }

    @RequestMapping(value = "/getLastOutputStart", method = RequestMethod.GET)
    public RequestResult<?> getLastOutputStart(@RequestParam("line_id") final String line_id) {
        final String work_id = getLastWork(line_id);
        List<WorkForm> workFormList = getWorkList(work_id);
        WorkForm prevWorkForm = null;
        if (workFormList.size() > 0) {
            WorkForm workForm = workFormList.get(workFormList.size() - 1);
            if (workFormList.size() >= 2) {
                prevWorkForm = workFormList.get(workFormList.size() - 2);
            }
            int outputStart = 0;
            if (prevWorkForm != null) {
                if (workForm.start_time.equals(prevWorkForm.end_time) &&
                        workForm.output_count_start.equals(prevWorkForm.output_count_end)) {
                    outputStart = Integer.parseInt(prevWorkForm.output_count_start);
                } else {
                    outputStart = Integer.parseInt(workForm.output_count_start);
                }
            } else {
                outputStart = Integer.parseInt(workForm.output_count_start);
            }
            if (outputStart < 0) {
                return fail("開始生產裝籃機計數器 小於 0, Value: " + outputStart);
            } else {
                return success(outputStart);
            }
        } else {
            return fail("請確認工單檔案 : " + work_id + " 是否存在");
        }
    }

    @RequestMapping(value = "/getMachineStatus", method = RequestMethod.GET)
    public RequestResult<?> getMachineStatus(@RequestParam("press_count") final int press_count,
                                             @RequestParam("ear_count") final int ear_count,
                                             @RequestParam("pack_count") final int pack_count,
                                             @RequestParam("output_count") final int output_count,
                                             @RequestParam("line_id") final String line_id) {
        //先取得最後生產的單號, 如果沒有最後一張單的話 會回傳 ""
        final String work_id = getLastWork(line_id);
        List<WorkForm> workFormList = getWorkList(work_id);
        int pressCount = 0;
        int earCount = 0;
        int packCount = 0;
        int outputCount = 0;
        WorkForm workForm = null;

        if (workFormList.size() > 0 ) {
            workForm = workFormList.get(workFormList.size() - 1);
            pressCount = press_count == -1 ? 0 : press_count - Integer.parseInt(workForm.press_count_start);
            earCount = ear_count == -1 ? 0 : ear_count - Integer.parseInt(workForm.ear_count_start);
            packCount = pack_count == -1 ? 0 : pack_count - Integer.parseInt(workForm.pack_count_start);
            outputCount = output_count == -1 ? 0 : output_count - Integer.parseInt(workForm.output_count_start);
        }
        Map<String, Object> resuleMap = new HashMap<String, Object>();
        Map<String, List<Map>> machineMap = getMaterialItemsByType(getLineMachines(line_id,true));
        for (Map.Entry<String, List<Map>> entry : machineMap.entrySet()) {
            String type = entry.getKey();
            if (type.equals("M1")) {
                Map<String, Object> materialMap = new HashMap<String, Object>();
                List<Map> map = entry.getValue();
                for (Map map1 : map) {
                    int total = Integer.parseInt(map1.get("usable_pcs").toString()) - pressCount;
                    materialMap.put(map1.get("material_id").toString(),total);
                }
                resuleMap.put("M1", materialMap);
            } else if (type.equals("M21")) {
                Map<String, Object> materialMap = new HashMap<String, Object>();
                List<Map> map = entry.getValue();
                for (Map map1 : map) {
                    int total = Integer.parseInt(map1.get("usable_pcs").toString()) - earCount;
                    materialMap.put(map1.get("material_id").toString(),total);
                }
                resuleMap.put("M21", materialMap);

            } else if (type.equals("M31")) {
                Map<String, Object> materialMap = new HashMap<String, Object>();
                List<Map> map = entry.getValue();
                for (Map map1 : map) {
                    int total = Integer.parseInt(map1.get("usable_pcs").toString()) - packCount;
                    materialMap.put(map1.get("material_id").toString(),total);
                }
                resuleMap.put("M31", materialMap);
            }
        }

        if (workFormList.size() > 1) {
            for (int i = 0, size = workFormList.size(); i < size - 1; i++) {
                workForm = workFormList.get(i);
                pressCount += (Integer.parseInt(workForm.press_count_end) - Integer.parseInt(workForm.press_count_start));
                earCount += (Integer.parseInt(workForm.ear_count_end) - Integer.parseInt(workForm.ear_count_start));
                packCount += (Integer.parseInt(workForm.pack_count_end) - Integer.parseInt(workForm.pack_count_start));
                outputCount += (Integer.parseInt(workForm.output_count_end) - Integer.parseInt(workForm.output_count_start));
            }
        } else if (workFormList.size() == 0) {
            resuleMap.put("work_id", "N/A");
            resuleMap.put("est_pcs", 0);
            resuleMap.put("press_count", 0);
            resuleMap.put("ear_count", 0);
            resuleMap.put("pack_count", 0);
            resuleMap.put("output_count", 0);
        }
        if (work_id !=null && !work_id.equals("")) {
            List<Map> workOrderMap = ActiveJdbc.operTx(new Operation<List<Map>>() {
                @Override
                public List<Map> operate() {
                    List<Map> result = WorkOrder.find("work_id=?", work_id).include().toMaps();
                    return result;
                }
            });
            resuleMap.put("work_id", work_id);
            resuleMap.put("est_pcs", Integer.parseInt(workOrderMap.get(0).get("est_pcs").toString()));
            resuleMap.put("press_count", pressCount);
            resuleMap.put("ear_count", earCount);
            resuleMap.put("pack_count", packCount);
            resuleMap.put("output_count", outputCount);
        }

        return success(resuleMap);
    }

    public static class WorkForm {

        String work_id; //工單號
        String trace_id; //箱號
        String start_time;//開始生產時間
        String end_time;//結束生產時間
        String press_count_start;//壓合機起始數量
        String press_count_end;//壓合機結束數量
        String ear_count_start; //貼耳機 起始數量
        String ear_count_end;//貼耳機結束數量
        String pack_count_start; //包裝起始數量
        String pack_count_end;  //包裝結數量束
        String output_count_start;  //裝籃數量起始
        String output_count_end;    //裝籃數量結束
        String ng_count;
        String operator;

        public int getPressCount() {
            return Integer.parseInt(press_count_end) - Integer.parseInt(press_count_start);
        }
        public int getEarCount() {
            return Integer.parseInt(ear_count_end) - Integer.parseInt(ear_count_start);
        }
        public int getPackCount() {
            return Integer.parseInt(pack_count_end) - Integer.parseInt(pack_count_start);
        }
        public int getOutputCount() {
            return Integer.parseInt(output_count_end) - Integer.parseInt(output_count_start);
        }

        private WorkForm(Builder builder) {
            this.work_id = builder.work_id;
            this.trace_id = builder.trace_id;
            this.start_time = builder.start_time;
            this.press_count_start = builder.press_count_start;
            this.ear_count_start = builder.ear_count_start;
            this.pack_count_start = builder.pack_count_start;
            this.output_count_start = builder.output_count_start;
        }


        static class Builder {

            String work_id; //工單號
            String trace_id; //箱號
            String start_time;//開始生產時間
            String end_time;//結束生產時間
            String press_count_start;//壓合機起始數量
            String press_count_end;//壓合機結束數量
            String ear_count_start; //貼耳機 起始數量
            String ear_count_end;//貼耳機結束數量
            String pack_count_start; //包裝起始數量
            String pack_count_end;  //包裝結數量束
            String output_count_start;  //裝籃數量起始
            String output_count_end;    //裝籃數量結束
            String ng_count;            //不良數
            String operator;            //生產者

            public WorkForm build() {
                return new WorkForm(this);
            }

            public Builder setWork_id(String work_id) {
                this.work_id = work_id;
                return this;
            }

            public Builder setTrace_id(String trace_id) {
                this.trace_id = trace_id;
                return this;
            }

            public Builder setStart_time(String start_time) {
                this.start_time = start_time;
                return this;
            }

            public Builder setEnd_time(String end_time) {
                this.end_time = end_time;
                return this;
            }

            public Builder setPress_count_start(String press_count_start) {
                this.press_count_start = press_count_start;
                return this;
            }

            public Builder setPress_count_end(String press_count_end) {
                this.press_count_end = press_count_end;
                return this;
            }

            public Builder setEar_count_start(String ear_count_start) {
                this.ear_count_start = ear_count_start;
                return this;
            }

            public Builder setEar_count_end(String ear_count_end) {
                this.ear_count_end = ear_count_end;
                return this;
            }

            public Builder setPack_count_start(String pack_count_start) {
                this.pack_count_start = pack_count_start;
                return this;
            }

            public Builder setPack_count_end(String pack_count_end) {
                this.pack_count_end = pack_count_end;
                return this;
            }

            public Builder setOutput_count_start(String output_count_start) {
                this.output_count_start = output_count_start;
                return this;
            }

            public Builder setOutput_count_end(String output_count_end) {
                this.output_count_end = output_count_end;
                return this;
            }

            public Builder setNg_count(String ng_count) {
                this.ng_count = ng_count;
                return this;
            }

            public Builder setOperator(String operator) {
                this.operator = operator;
                return this;
            }
        }
    }

    @RequestMapping(value = "/machinedetails", method = RequestMethod.POST)
    public RequestResult<?> machineMaterials(@RequestParam("lineId") final String lineId) {
        List<Map> machines = getLineMachines(lineId, true);
        if (machines.size() == 0 ) {
            return fail("該產線: " + lineId + " 沒有任何設備, 請確認...");
        } else {
            //把拿到的 所有設備 還有他相關的料件組成map
            Map<String, List<Map>> machineMaterialMap = getMaterialItems(machines, true);
            return success(machineMaterialMap);
        }
    }

    @RequestMapping(value = "/receivematerial", method = RequestMethod.POST)
    public RequestResult<String> receivematerial(@RequestParam("materialItemId") final String materialItemId) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                // 確認後，更新該原料單件狀態為設備旁待用(status_id=2)
                MaterialItem materialItem = MaterialItem.findById(materialItemId);
                materialItem.set("status_id", 2);
                if (materialItem.saveIt()) {
                    return success("原料收料成功");
                } else {
                    return fail("原料收料失敗");
                }
            }
        });
    }

    @RequestMapping(value = "/changematerial", method = RequestMethod.POST)
    public RequestResult<?> changematerial(@RequestParam("machineId") final String machineId,
                                           @RequestParam("oldItemId") final String oldItemId,
                                           @RequestParam("statusId") final int statusId,
                                           @RequestParam("newItemId") final String newItemId) {

        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                /*
                * 1.變更原原料單件狀態，移除設備代號(MATERIAL_ITEM.machine=null)，寫入原料剩餘可用片數(MATERIAL_ITEM.usable_pcs)
                * */
                if (MaterialItem.exists(oldItemId)) {
                    MaterialItem oldMaterial = MaterialItem.findById(oldItemId);
                    oldMaterial.set("status_id", statusId);
                    // oldMaterial.set("machine_id", null);
                    if (!oldMaterial.saveIt()) {
                        return fail("舊原料更新失敗");
                    }
                }

                /*
                * 2.新原料單件狀態改為設備上(status_id=3)、寫入設備代號(MATERIAL_ITEM.machine)
                * */
                MaterialItem newMaterial = MaterialItem.findById(newItemId);
                newMaterial.set("status_id", 3);
                newMaterial.set("machine_id", machineId);
                if (!newMaterial.saveIt()) {
                    return fail("新原料更新失敗");
                }

                /*
                * 3.更換的原料單件，若為壓合機或該設備同一線的貼耳或包裝機，將該設備目前箱號(MACHINE.trace_id)，新增成品原料追蹤(TRACE_MATERIAL)
                *  因為換料前一定要停止生產，再開始生產的時候會記錄原料追蹤，所以不用在換料的時候新增原料追蹤
                * */
                return success("換料成功");

            }
        });

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
