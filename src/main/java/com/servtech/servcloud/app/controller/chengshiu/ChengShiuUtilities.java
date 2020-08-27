package com.servtech.servcloud.app.controller.chengshiu;

import com.google.gson.Gson;
import com.servtech.servcloud.app.model.chengshiu.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.SysPropKey;
import org.javalite.activejdbc.Base;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;


import static  com.servtech.servcloud.app.controller.chengshiu.ChengShiuDemandAndManufacturing.*;

/**
 * Created by Raynard on 2017/11/14.
 * 一些可能不只一個人用的一些方法
 */

public class ChengShiuUtilities {
    private static final org.slf4j.Logger log = LoggerFactory.getLogger(ChengShiuUtilities.class);
    private static final SimpleDateFormat SQL_DATE_TIME = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private static final SimpleDateFormat SQL_DATE = new SimpleDateFormat("yyyy-MM-dd");
    private static final SimpleDateFormat yyMM = new SimpleDateFormat("yyMM");

    //取得某 產線 的 所有機台;
    public static List<Map> getLineMachines(final String line_id, Boolean open) {
        if (open) {
            return ActiveJdbc.operTx(new Operation<List<Map>>() {
                @Override
                public List<Map> operate() {
                    List<Map> machineList = Machine.find("line_id=?", line_id).include().toMaps();
                    return machineList;
                }
            });
        } else {
            return Machine.find("line_id=?", line_id).include().toMaps();
        }
    }

    // 取得所有設備 的 原料單件資料
    public static Map<String, List<Map>> getMaterialItems(final List<Map> machines, Boolean open) {
        if (open) {
            return ActiveJdbc.operTx(new Operation<Map<String, List<Map>>>() {
                @Override
                public Map<String, List<Map>> operate() {
                    Map<String, List<Map>> map = new HashMap<String, List<Map>>();
                    for (Map machine : machines) {
                        String machine_id = machine.get("machine_id").toString();
                        List<Map> items = MaterialItem.find("machine_id=?", machine_id).include().toMaps();
                        map.put(machine_id, items);
                    }
                    return map;
                }
            });
        } else {
            Map<String, List<Map>> map = new HashMap<String, List<Map>>();
            for (Map machine : machines) {
                String machine_id = machine.get("machine_id").toString();
                List<Map> items = MaterialItem.find("machine_id=?", machine_id).include().toMaps();
                map.put(machine_id, items);
            }
            return map;
        }
    }

    public static Map<String, List<Map>> getMaterialItemsByType(final List<Map> machines) {
        return ActiveJdbc.operTx(new Operation<Map<String, List<Map>>>() {
            @Override
            public Map<String, List<Map>> operate() {
                Map<String, List<Map>> map = new HashMap<String, List<Map>>();
                for (Map machine : machines) {
                    String machine_id = machine.get("machine_id").toString();
                    String type = machine.get("type").toString();
                    List<Map> items = MaterialItem.find("machine_id = ? AND status_id = ?", machine_id, "3").include().toMaps();
                    map.put(type, items);
                }
                return map;
            }
        });
    }
    //取得箱號, 如果 box_id 不為空 就直接回傳， 如果是空的 代表要給他新的而且要順便寫入table
    public static String getBoxSerialNumber(final String work_id, final String box_id, final String user) {
        if (!box_id.equals("")) {
            log.info("箱號不為空值, 直接回傳");
            if (!insertTraceWork(work_id, box_id, user, true)) {
                log.info("寫入成品工單追蹤資料有問題, 請確認");
            }
            return box_id;
        } else {
            String newBox_id =  ActiveJdbc.operTx(new Operation<String>() {
                @Override
                public String operate() {
                    String prefix = "FP";
                    String currDate = yyMM.format(new Date());
                    final List<Map> maxCount = Base.findAll("SELECT COUNT(*) as count FROM a_chengshiu_trace WHERE trace_id like '" + prefix + currDate + "%'");
                    final List<Map> productMap = Base.findAll("SELECT b.product_id from a_chengshiu_work_order a, a_chengshiu_demand_order b WHERE a.work_id='"+ work_id + "' AND a.demand_id = b.demand_id ");
                    String product_id = productMap.get(0).get("product_id").toString();
                    long count = Long.parseLong(maxCount.get(0).get("count").toString());
                    count++;
                    String trace_id = prefix + currDate + String.format("%04d", count);
                    String time = SQL_DATE_TIME.format(new Date());
                    Map data = new HashMap();
                    data.put("trace_id", trace_id);
                    data.put("product_id", product_id);
                    data.put("status_id", "0");
                    data.put("boxing_time", null);
                    data.put("create_by", user);
                    data.put("create_time", time);
                    data.put("modify_by", user);
                    data.put("modify_time", time);
                    Trace trace = new Trace();
                    trace.fromMap(data);
                    if (trace.insert()) {
                        return trace_id;
                    } else {
                        int runCount = 10;
                        for (int i = 0; i < runCount; i++) {
                            count++;
                            trace_id = prefix + currDate + String.format("%04d", count);
                            data.put("trace_id", trace_id);
                            trace.fromMap(data);
                            if (trace.insert()) {
                                break;
                            }
                        }
                        return trace_id;
                    }
                }
            });
            log.info("箱號為空, 產生新箱號");
            log.info("新箱號: " + newBox_id);
            //
            if (!insertTraceWork(work_id, newBox_id, user, true)) {
                log.info("寫入成品工單追蹤資料有問題, 請確認");
            }

            return newBox_id;
        }
    }

    public static String getBoxSerialNumberNop(final String work_id, final String box_id, final String user) {
        String trace_id = "";
        if (!box_id.equals("")) {
            log.info("箱號不為空值, 直接回傳");
            if (!insertTraceWork(work_id, box_id, user, false)) {
                log.info("寫入成品工單追蹤資料有問題, 請確認");
            }
            return box_id;
        } else {
            String prefix = "FP";
            String currDate = yyMM.format(new Date());
            final List<Map> maxCount = Base.findAll("SELECT COUNT(*) as count FROM a_chengshiu_trace WHERE trace_id like '" + prefix + currDate + "%'");
            final List<Map> productMap = Base.findAll("SELECT b.product_id from a_chengshiu_work_order a, a_chengshiu_demand_order b WHERE a.work_id='"+ work_id + "' AND a.demand_id = b.demand_id ");
            String product_id = productMap.get(0).get("product_id").toString();
            long count = Long.parseLong(maxCount.get(0).get("count").toString());
            count++;
            trace_id = prefix + currDate + String.format("%04d", count);
            String time = SQL_DATE_TIME.format(new Date());
            Map data = new HashMap();
            data.put("trace_id", trace_id);
            data.put("product_id", product_id);
            data.put("status_id", "0");
            data.put("boxing_time", null);
            data.put("create_by", user);
            data.put("create_time", time);
            data.put("modify_by", user);
            data.put("modify_time", time);
            Trace trace = new Trace();
            trace.fromMap(data);
            if (trace.insert()) {
                if (!insertTraceWork(work_id, trace_id, user, false)) {
                    log.info("寫入成品工單追蹤資料有問題, 請確認");
                }
                return trace_id;
            } else {
                int runCount = 10;
                for (int i = 0; i < runCount; i++) {
                    count++;
                    trace_id = prefix + currDate + String.format("%04d", count);
                    data.put("trace_id", trace_id);
                    trace.fromMap(data);
                    if (trace.insert()) {
                        if (!insertTraceWork(work_id, trace_id, user, false)) {
                            log.info("寫入成品工單追蹤資料有問題, 請確認");
                        }
                        break;
                    }
                }
            }
        }
        return trace_id;
    }


    //成品原料追蹤
    public static boolean insertTraceMaterial(final String trace_id, final Map<String, List<Map>> machineMaterialMap, final String user, boolean open) {
        if (open) {
            return ActiveJdbc.operTx(new Operation<Boolean>() {
                @Override
                public Boolean operate() {
                    String time = SQL_DATE_TIME.format(new Date());
                    boolean allInsert = true;
                    log.info("寫入成品原料資料...");
                    for (List<Map> items : machineMaterialMap.values()) {
                        for (Map item : items) {
                            Map map = new HashMap();
                            map.put("trace_id", trace_id);
                            map.put("item_id", item.get("item_id").toString());
                            map.put("modify_by", user);
                            map.put("modify_time", time);
                            TraceMaterial traceMaterial = new TraceMaterial();
                            traceMaterial.fromMap(map);
                            if (!traceMaterial.saveIt()) {
                                map.put("create_by", user);
                                map.put("create_time", time);
                                traceMaterial.fromMap(map);
                                if (!traceMaterial.insert()) {
                                    allInsert = false;
                                }
                            } else {
                                log.info("成品原料資料已存在, 所以採用更新的方式");
                            }
                        }
                    }
                    return allInsert;
                }
            });
        } else {
            String time = SQL_DATE_TIME.format(new Date());
            boolean allInsert = true;
            log.info("寫入成品原料資料...");
            for (List<Map> items : machineMaterialMap.values()) {
                for (Map item : items) {
                    Map map = new HashMap();
                    map.put("trace_id", trace_id);
                    map.put("item_id", item.get("item_id").toString());
                    map.put("modify_by", user);
                    map.put("modify_time", time);
                    TraceMaterial traceMaterial = new TraceMaterial();
                    traceMaterial.fromMap(map);
                    if (!traceMaterial.saveIt()) {
                        map.put("create_by", user);
                        map.put("create_time", time);
                        traceMaterial.fromMap(map);
                        if (!traceMaterial.insert()) {
                            allInsert = false;
                        }
                    } else {
                        log.info("成品原料資料已存在, 所以採用更新的方式");
                    }
                }
            }
            return allInsert;
        }
    }

    //成品工單追蹤
    public static boolean insertTraceWork(final String work_id, final String trace_id, final String user, Boolean open) {
        if (open) {
            return ActiveJdbc.operTx(new Operation<Boolean>() {
                @Override
                public Boolean operate() {
                    String time = SQL_DATE_TIME.format(new Date());
                    Map data = new HashMap();
                    log.info("寫入成品工單資料...");
                    data.put("trace_id", trace_id);
                    data.put("work_id", work_id);
                    data.put("modify_by", user);
                    data.put("modify_time", time);
                    TraceWork traceWork = new TraceWork();
                    traceWork.fromMap(data);
                    if (!traceWork.saveIt()) {
                        data.put("create_by", user);
                        data.put("create_time", time);
                        traceWork.fromMap(data);
                        if(traceWork.insert()) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        log.info("成品工單資料已存在, 所以採用更新的方式");
                        return true;
                    }

                }
            });
        } else {
            String time = SQL_DATE_TIME.format(new Date());
            Map data = new HashMap();
            log.info("寫入成品工單資料...");
            data.put("trace_id", trace_id);
            data.put("work_id", work_id);
            data.put("modify_by", user);
            data.put("modify_time", time);
            log.info("新箱號: " + trace_id + " 對應工單: " + work_id);
            TraceWork traceWork = new TraceWork();
            traceWork.fromMap(data);
            if (!traceWork.saveIt()) {
                data.put("create_by", user);
                data.put("create_time", time);
                traceWork.fromMap(data);
                if(traceWork.insert()) {
                    return true;
                } else {
                    return false;
                }
            } else {
                log.info("成品工單資料已存在, 所以採用更新的方式");
                return true;
            }
        }

    }
    //更新 M4 裝籃機 用的方法
    public static boolean updateMachineTrace(final List<Map> machines, final String line_id, final String trace_id, final String user, Boolean open) {
        if (open) {
            return ActiveJdbc.operTx(new Operation<Boolean>() {
                @Override
                public Boolean operate() {
                    boolean result = false;
                    log.info("更新裝籃機設備箱號...");
                    String time = SQL_DATE_TIME.format(new Date());
                    for (Map machine : machines) {
                        if (machine.get("type").toString().startsWith("M4")) {
                            Map data = new HashMap();
                            data.put("machine_id", machine.get("machine_id").toString());
                            data.put("line_id", line_id);
                            data.put("trace_id", trace_id);
                            data.put("modify_by", user);
                            data.put("modify_time", time);
                            Machine m41 = new Machine();
                            m41.fromMap(data);
                            if (m41.saveIt()) {
                                result = true;
                            }
                        }
                    }
                    return result;
                }
            });
        } else {
            boolean result = false;
            log.info("更新裝籃機設備箱號...");
            String time = SQL_DATE_TIME.format(new Date());
            for (Map machine : machines) {
                if (machine.get("type").toString().startsWith("M4")) {
                    Map data = new HashMap();
                    data.put("machine_id", machine.get("machine_id").toString());
                    data.put("line_id", line_id);
                    data.put("trace_id", trace_id);
                    data.put("modify_by", user);
                    data.put("modify_time", time);
                    Machine m41 = new Machine();
                    m41.fromMap(data);
                    if (m41.saveIt()) {
                        result = true;
                    }
                }
            }
            return result;
        }
    }

    public static boolean updateLineWork(final String line_id, final String work_id, final String user) {
        return ActiveJdbc.operTx(new Operation<Boolean>() {
            @Override
            public Boolean operate() {
                String time = SQL_DATE_TIME.format(new Date());
                Map data = new HashMap();
                data.put("line_id", line_id);
                data.put("work_id", work_id);
                data.put("modify_by", user);
                data.put("modify_time", time);
                Line line = new Line();
                line.fromMap(data);
                if (line.saveIt()) {
                    log.info("產線: " + line_id + ", 工單: " + work_id + " 已進站");
                    return true;
                } else {
                    return false;
                }
            }
        });
    }

    public static String getLastWork (final String line_id) {

        return ActiveJdbc.operTx(new Operation<String>() {
            @Override
            public String operate() {
                Line line = Line.findFirst("line_id=?", line_id);

                return line.getString("work_id");
            }
        });

//        File workRoot = new File(System.getProperty(SysPropKey.DATA_PATH) + "/chengshiu/works");
//        File work = new File(workRoot.getAbsoluteFile(), "lastWork");
//        StringBuilder sb = new StringBuilder();
//        if (!work.exists()) {
//            return "";
//        }
//        try {
//            FileInputStream fis = new FileInputStream(work);
//            int fileSize = (int) work.length();
//            int buff;
//            byte[] bytes = new byte[fileSize];
//            while ((buff = fis.read(bytes, 0, bytes.length)) != -1) {
//                sb.append(new String(bytes, 0, buff));
//            }
//            fis.close();
//        } catch (FileNotFoundException e) {
//            System.out.println("讀取最後生產工單失敗");
//            e.printStackTrace();
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//        return sb.toString();
    }

    public static void updateProductStock(final String product_id, final String user) {
        String demandOrder =  "SELECT SUM(not_done) AS sum_not_done FROM a_chengshiu_demand_order where product_id = '" + product_id + "';";
        String salesOrder = "SELECT SUM(not_done) AS sum_not_done FROM a_chengshiu_sales_order_details where product_id = '" + product_id + "';";
        Product product = Product.findFirst("product_id=?", product_id);
        List<Map> demandList = Base.findAll(demandOrder);
        int not_instorage = demandList.get(0) == null ? 0 : demandList.get(0).get("sum_not_done") == null? 0 : Integer.parseInt(demandList.get(0).get("sum_not_done").toString());
        List<Map> salesList = Base.findAll(salesOrder);
        int booking_stock = salesList.get(0) == null ? 0 : salesList.get(0).get("sum_not_done") == null? 0 : Integer.parseInt(salesList.get(0).get("sum_not_done").toString());
        int inventory = product.getInteger("inventory") == null? 0 : product.getInteger("inventory");
        int total_remander = inventory + not_instorage;
        int usable_stock = total_remander - booking_stock;
        Map map = new HashMap();
        map.put("product_id", product_id);
        map.put("booking_stock", booking_stock);
        map.put("total_remander", total_remander);
        map.put("inventory", inventory);
        map.put("not_instorage", not_instorage);
        map.put("usable_stock", usable_stock);
        map.put("modify_by", user);
        map.put("modify_time", new Timestamp(new Date().getTime()));
        product = new Product();
        product.fromMap(map);
        if (!product.saveIt()) {
            log.info("產品: " + product_id + " 庫存更新失敗!");
        }
    }

    public static List<WorkForm> getWorkList(String work_id) {
        if (work_id == null) {
            return new ArrayList<WorkForm>();
        }
        File workRoot = new File(System.getProperty(SysPropKey.DATA_PATH) + "/chengshiu/works");
        File work = new File(workRoot.getAbsoluteFile(), work_id);
        StringBuilder sb = new StringBuilder();
        List<WorkForm> workFormList = null;
        if (work_id.equals("")) {
            return new ArrayList<WorkForm>();
        }
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
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return workFormList;
    }

    public static boolean updateTraceInWarehourse (final String trace_id, final int inbox_pcs, final String pstoring_id, final String user) {

        return ActiveJdbc.operTx(new Operation<Boolean>() {
            @Override
            public Boolean operate() {
                Map map = new HashMap();
                map.put("trace_id", trace_id);
                map.put("inbox_pcs", inbox_pcs);
                map.put("status_id", "3");
                map.put("pstoring_id", pstoring_id);
                map.put("modify_by", user);
                map.put("modify_time", SQL_DATE_TIME.format(new Date()));
                Trace trace = new Trace();
                trace.fromMap(map);
                if (trace.saveIt()) {
                    return true;
                } else {
                    return false;
                }
            }
        });
    }

    public static boolean updatePstoringStatus (final String pstoring_id, final String status) {
        return ActiveJdbc.operTx(new Operation<Boolean>() {
            @Override
            public Boolean operate() {
                Map data = new HashMap();
                data.put("pstoring_id", pstoring_id);
                data.put("status_id", status);
                Storing storing = new Storing();
                storing.fromMap(data);
                return storing.saveIt();
            }
        });
    }






}
