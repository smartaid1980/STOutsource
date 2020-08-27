package com.servtech.servcloud.app.controller.chengshiu;

import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import com.google.zxing.*;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.oned.Code128Writer;
import com.google.zxing.qrcode.QRCodeReader;
import com.google.zxing.qrcode.QRCodeWriter;
import com.servtech.servcloud.app.model.chengshiu.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.util.Units;
import org.apache.poi.xwpf.usermodel.*;
import org.javalite.activejdbc.Base;
import org.javalite.activejdbc.DBException;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.awt.image.BufferedImage;
import java.io.*;
import java.lang.reflect.Type;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.app.controller.chengshiu.ChengShiuDemandAndManufacturing.*;
import static com.servtech.servcloud.app.controller.chengshiu.ChengShiuUtilities.*;
import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/10/11.
 */

@RestController
@RequestMapping("/chengshiu/warehouse")
public class ChengShiuFinishedGoodsWarehouse {
    private static final org.slf4j.Logger log = LoggerFactory.getLogger(ChengShiuFinishedGoodsWarehouse.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    private static final SimpleDateFormat SQL_DATE_TIME = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private static final SimpleDateFormat SQL_DATE = new SimpleDateFormat("yyyy-MM-dd");
    private static final SimpleDateFormat SDF_PRINT_DATE = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");

    @RequestMapping(value = "/readNoClosedRequisition", method = RequestMethod.GET)
    public RequestResult<List<Map>> readNoClosedRequisition() {

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                List<Map> result = new ArrayList<Map>();
                Map<String, String> data1 = new HashMap<String, String>();
                data1.put("order_id", "B17082101");
                data1.put("product_id", "B01");
                data1.put("product_name", "口罩B01(藍)");
                data1.put("request_time", "2017/08/21 09:00:00");
                data1.put("request_qty_box", "1");
                data1.put("estimated_finish_date", "2017/09/25");
                data1.put("status", "生產中");

                Map<String, String> data2 = new HashMap<String, String>();
                data2.put("order_id", "G17082101");
                data2.put("product_id", "B01");
                data2.put("product_name", "口罩B01(藍)");
                data2.put("request_time", "2017/08/21 09:00:00");
                data2.put("request_qty_box", "1");
                data2.put("estimated_finish_date", "2017/09/25");
                data2.put("status", "待生產");

                result.add(data1);
                result.add(data2);
                return success(result);
            }
        });
    }


    @RequestMapping(value = "/creatDemandOrder", method = RequestMethod.POST)
    public RequestResult<?> creatDemandOrder(@RequestBody final Map<String, Object> data) {
        final String prefix = "DMD";
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyMM");
            final String currDate = sdf.format(new Date());
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    final List<Map> maxCount = Base.findAll("SELECT COUNT(*) as count FROM a_chengshiu_demand_order WHERE demand_id like '" + prefix + currDate + "%'");
                    List<String> reasonList = (List<String>) data.get("reason_id");
                    String product_id = data.get("product_id").toString();
                    int demand_quantity = Integer.parseInt(data.get("demand_quantity").toString());
                    long count = Long.parseLong(maxCount.get(0).get("count").toString());
                    count++;
                    String demand_id = prefix + currDate + String.format("%03d", count);
                    data.put("demand_id", demand_id);
                    data.put("status_id", "0");
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    DemandOrder demandOrder = new DemandOrder();
                    demandOrder.fromMap(data);
                    if (demandOrder.insert()) {
                        PreparedStatement ps = Base.startBatch("INSERT INTO a_chengshiu_demand2_order (demand_id, reason_id) VALUES (?, ?)");
                        for (String reason : reasonList) {
                            Base.addBatch(ps, demand_id, reason);
                        }
                        Base.executeBatch(ps);
                        try {
                            ps.close();
                        } catch (SQLException e) {
                            e.printStackTrace();
                        }
                        updateProductStock(product_id, request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString());

                        return success(demandOrder.getString("demand_id"));
                    } else {
                        int runCount = 10;
                        for (int i = 0; i < runCount; i++) {
                            count++;
                            demand_id = prefix + currDate + String.format("%03d", count);
                            data.put("demand_id", demand_id);
                            demandOrder.fromMap(data);
                            if (demandOrder.insert()) {
                                PreparedStatement ps = Base.startBatch("INSERT INTO a_chengshiu_demand2_order (demand_id, reason_id) VALUES (?, ?)");
                                for (String reason : reasonList) {
                                    Base.addBatch(ps, demand_id, reason);
                                }
                                Base.executeBatch(ps);
                                try {
                                    ps.close();
                                } catch (SQLException e) {
                                    e.printStackTrace();
                                }
                                updateProductStock(product_id, request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString());
                                return success(demandOrder.getString("demand_id"));
                            }
                        }
                        return fail("新增失敗...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/readDemandOrder", method = RequestMethod.GET)
    public RequestResult<?> readDemandOrder() {
        final String demandId = request.getParameter("demand_id");
        final String startDate = request.getParameter("start_date") == null ? null : request.getParameter("start_date").replace("/", "-") + " 00:00:00";
        final String endDate = request.getParameter("end_date") == null ? null : request.getParameter("end_date").replace("/", "-") + " 23:59:59";
        final String[] statudIds = new Gson().fromJson(request.getParameter("status_id"), String[].class);
        final List<Map> resultMap = new ArrayList<Map>();
        if (demandId == null && startDate == null && endDate == null && statudIds == null) {
            ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    List<Map> demandOrders = DemandOrder.find("status_id=? or status_id=?", "0", "9").toMaps();
                    resultMap.addAll(demandOrders);
                    return null;
                }
            });
        } else if (demandId != null) {
            ActiveJdbc.operTx(new Operation<Void>() {
                @Override
                public Void operate() {
                    List<Map> demandOrders = DemandOrder.find("demand_id=?", demandId).toMaps();
                    resultMap.addAll(demandOrders);
                    return null;
                }
            });
        } else {
            if (startDate == null && endDate == null) {
                final StringBuilder sb = new StringBuilder();
                sb.append("status_id IN (");
                String split = "";
                for (String statudId : statudIds) {
                    sb.append(split);
                    sb.append("?");
                    split = ",";
                }
                sb.append(")");
                ActiveJdbc.operTx(new Operation<Void>() {
                    @Override
                    public Void operate() {
                        List<Map> demandOrders = DemandOrder.find(sb.toString(), statudIds).toMaps();
                        resultMap.addAll(demandOrders);
                        return null;
                    }
                });
            } else if (startDate != null && endDate != null && statudIds != null) {
                final StringBuilder sb = new StringBuilder();
                sb.append("create_time BETWEEN ? AND ? AND ");
                sb.append("status_id IN (");
                String split = "";
                for (String statudId : statudIds) {
                    sb.append(split);
                    sb.append("?");
                    split = ",";
                }
                sb.append(")");

                ActiveJdbc.operTx(new Operation<Void>() {
                    @Override
                    public Void operate() {
                        List<String> paramList = new ArrayList<String>();
                        paramList.add(startDate);
                        paramList.add(endDate);
                        paramList.addAll(Arrays.asList(statudIds));
                        List<Map> demandOrders = DemandOrder.find(sb.toString(), paramList.toArray(new String[0])).toMaps();
                        resultMap.addAll(demandOrders);
                        return null;
                    }
                });

            } else if (startDate != null && endDate != null) {
                ActiveJdbc.operTx(new Operation<Void>() {
                    @Override
                    public Void operate() {
                        List<Map> demandOrders = DemandOrder.find("create_time BETWEEN ? AND ? ", startDate, endDate).toMaps();
                        resultMap.addAll(demandOrders);
                        return null;
                    }
                });

            }
        }

        for (Map map : resultMap) {
            String create_time = SQL_DATE_TIME.format(map.get("create_time"));
            String modify_time = SQL_DATE_TIME.format(map.get("modify_time"));
            String est_complete_date = SQL_DATE.format(map.get("est_complete_date"));
            String act_complete_time = map.get("act_complete_time") == null ? "N/A" : SQL_DATE_TIME.format(map.get("act_complete_time"));
            map.put("create_time", create_time);
            map.put("modify_time", modify_time);
            map.put("est_complete_date", est_complete_date);
            map.put("act_complete_time", act_complete_time);
        }

        return success(resultMap);
    }


    @RequestMapping(value = "/updateDemandOrder", method = RequestMethod.PUT)
    public RequestResult<?> updateDemandOrder(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                DemandOrder demandOrder = new DemandOrder();
                demandOrder.fromMap(data);
                if (demandOrder.saveIt()) {
                    return success(demandOrder.getString("demand_id"));
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });

    }

    @RequestMapping(value = "/readShippingOrder", method = RequestMethod.GET)
    public RequestResult<List<Map>> readShippingOrder() {

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT so.order_id, c.customer_name, p.product_name, sod.order_quantity, sod.shipping_quantity, sod.not_done, so.shipping_date, p.inventory FROM a_chengshiu_sales_order_details AS sod ");
                sb.append("INNER JOIN a_chengshiu_sales_order AS so ");
                sb.append("ON sod.order_id = so.order_id ");
                sb.append("INNER JOIN a_chengshiu_product AS p ");
                sb.append("ON sod.product_id = p.product_id ");
                sb.append("INNER JOIN a_chengshiu_customer AS c ");
                sb.append("ON c.customer_id = so.customer_id ");
                sb.append("WHERE sod.status_id = '0' ");
                sb.append("AND ");
                sb.append("sod.shipping_quantity < sod.order_quantity");
                String sql = sb.toString();
                System.out.println(sql);
                List<Map> result = Base.findAll(sql);
                for (Map map : result) {
                    map.put("shipping_date", sdf.format(map.get("shipping_date")));
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/readBoxInfo", method = RequestMethod.GET)
    public RequestResult<?> readBoxId(@RequestParam("boxId") final String boxId) {
        try {
            return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    List<Map> result = new ArrayList<Map>();
                    Map map = new HashMap();
                    map.put("box_id", boxId);
                    map.put("product_id", "B01");
                    map.put("product_name", "口罩B01(藍色)");
                    result.add(map);
                    return success(result);
                }
            });
        } catch (Exception e) {
            return fail("read fail... " + e.getMessage());
        }
    }

    @RequestMapping(value = "/updateBackorder", method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        final String orderId = data.get("order_id").toString();
        final String customerId = data.get("customer_id").toString();
        final String productId = data.get("product_id").toString();
        final String sumShippingQty = data.get("sum_shipping_qty").toString();
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    System.out.println(orderId);
                    System.out.println(customerId);
                    System.out.println(productId);
                    System.out.println(sumShippingQty);
                    return success("update success");
                }
            });
        } catch (Exception e) {
            return fail("update fail... " + e.getMessage());
        }
    }

    @RequestMapping(value = "/updateStoringPlace", method = RequestMethod.PUT)
    public RequestResult<?> updateStoringPlace(@RequestBody final Map data) {
        final String storingPlace = data.get("storing_place").toString();
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    data.put("status_id", "3");
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    Trace trace = new Trace();
                    trace.fromMap(data);
                    if (trace.saveIt()) {
                        return success("update success");
                    } else {
                        return fail("update faile...");
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail("update fail... " + e.getMessage());
        }
    }

    @RequestMapping(value = "/updateTracePstoring", method = RequestMethod.PUT)
    public RequestResult<?> updateTracePstoring(@RequestBody final Map data) {
        final String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
        final String line_id = data.get("line_id").toString();
        final String work_id = data.get("work_id").toString();
        final String trace_id = data.get("trace_id").toString();
        final String pstoring_id = data.get("pstoring_id").toString();

        //先拿轉換係數先，預設是 200 吧 怕以後會改來著
        Map convFactor = ActiveJdbc.operTx(new Operation<Map>() {
            @Override
            public Map operate() {
                return ConversionFactor.findFirst("1=1").toMap();
            }
        });
        final int conv_factor_pcs = Integer.parseInt(convFactor.get("conv_factor").toString());
        //先拿到要更新的是哪一箱
        Map traceMap = ActiveJdbc.operTx(new Operation<Map>() {
            @Override
            public Map operate() {
                return Trace.findFirst("trace_id=?", trace_id).toMap();
            }
        });
        if (traceMap.size() == 0) {
            return fail("無此箱號, 請確認");
        }
        int existPcs = traceMap.get("inbox_pcs") == null ? 0 : Integer.parseInt(traceMap.get("inbox_pcs").toString());
        final int resultPcs = conv_factor_pcs - existPcs;
        //先update舊箱號的狀態
        boolean inWarehourse = updateTraceInWarehourse(trace_id, conv_factor_pcs, pstoring_id, user);
        if (!inWarehourse) {
            return fail(trace_id + " 箱號狀態更新失敗 請確認");
        }
        boolean pstoringStatus = updatePstoringStatus(pstoring_id, "3");
        if (!pstoringStatus) {
            return fail(pstoring_id + " 儲位狀態更新失敗 請確認");
        }
        if (resultPcs != 0 && resultPcs > 0) {
            //先取得檔案
            List<WorkForm> workFormList = getWorkList(work_id);
            if (workFormList == null || workFormList.size() == 0) {
                return fail("無法寫入 工單 歷程表, 請確認 工單: " + work_id);
            }
            int press = 0;
            int ear = 0;
            int pack = 0;
            int output = 0;
            int lastPress = 0;
            int lastEar = 0;
            int lastPack = 0;
            int lastOutput = 0;
            for (WorkForm work : workFormList) {
                if (work.trace_id.equals(trace_id)) {
                    if (work.press_count_end != null && work.ear_count_end != null && work.pack_count_end != null && work.output_count_end != null) {
                        press += work.getPressCount();
                        ear += work.getEarCount();
                        pack += work.getPackCount();
                        output += work.getOutputCount();
                    } else {
                        lastPress = Integer.parseInt(work.press_count_start);
                        lastEar = Integer.parseInt(work.ear_count_start);
                        lastPack = Integer.parseInt(work.pack_count_start);
                        lastOutput = Integer.parseInt(work.output_count_start);
                    }
                }
            }
            press = resultPcs;
            ear = resultPcs;
            pack = resultPcs;
            output = resultPcs;
            lastPress = lastPress + press;
            lastEar = lastEar + ear;
            lastPack = lastPack + pack;
            lastOutput = lastOutput + output;
            WorkForm workForm = workFormList.get(workFormList.size() - 1);
            String workFormTime = SQL_DATE_TIME.format(new Date());
            workForm.press_count_end = lastPress + "";
            workForm.ear_count_end = lastEar + "";
            workForm.pack_count_end = lastPack + "";
            workForm.output_count_end = lastOutput + "";
            workForm.end_time = workFormTime;
            final WorkForm updateWorkForm = workForm;
            //更新一下 work_order_duration 還有工單數量
            final Map workOrderDurationMap = new HashMap();
            workOrderDurationMap.put("work_id", work_id);
            workOrderDurationMap.put("input_pcs", press);
            workOrderDurationMap.put("output_pcs", output);
            workOrderDurationMap.put("act_start_time", workForm.start_time);
            workOrderDurationMap.put("act_cple_time", workFormTime);
            workOrderDurationMap.put("status_id", "2");
            workOrderDurationMap.put("modify_by", user);
            workOrderDurationMap.put("modify_time", workFormTime);
            ActiveJdbc.operTx(new Operation<Void>() {
                @Override
                public Void operate() {
                    WorkOrderDuration workOrderDuration = new WorkOrderDuration();
                    workOrderDuration.fromMap(workOrderDurationMap);
                    if (workOrderDuration.saveIt()) {
                        log.info("工單數量更新: " + work_id);
                        updateMaterialItem(line_id, updateWorkForm, line_id);
                        updateWorkFormPcs(work_id, resultPcs, resultPcs, 0, user);
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
                fos = new FileOutputStream(work);
                String result = new Gson().toJson(workFormList);
                fos.write(result.getBytes());
                fos.flush();
                fos.close();
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

            //如果已經點了結束生產就不在 new 新的箱號
            if (getLastWork(line_id) != null) {
                //先產生箱號先
                String newTrace = getBoxSerialNumber(work_id, "", user);

                //取得所有機台
                List<Map> machines = getLineMachines(line_id, true);
                Map<String, List<Map>> machineMaterialMap = getMaterialItems(machines, true); //所有設備所使用的料件
                if (!insertTraceMaterial(newTrace, machineMaterialMap, user, true)) {
                    return fail("寫入成品原料追蹤資料有問題, 請確認");
                }
                //寫裝籃機設備的箱號資料
                if (!updateMachineTrace(machines, line_id, newTrace, user, true)) {
                    return fail("更新裝籃機設備箱號有問題, 請確認");
                }

                Map workStart = new HashMap();
                workStart.put("work_id", work_id);
                workStart.put("trace_id", newTrace);
                workStart.put("press_count", lastPress);
                workStart.put("ear_count", lastEar);
                workStart.put("pack_count", lastPack);
                workStart.put("output_count", lastOutput);
                //寫一下工單
                insertWorkStart(workStart, user);
            }
        } else if (resultPcs != 0 && resultPcs < 0) {
            final Timestamp time = new Timestamp(new Date().getTime());
            final String product_id = traceMap.get("product_id").toString();
            final int overflow = existPcs - conv_factor_pcs;
            final String newTrace = getBoxSerialNumber(work_id, "", user);
            log.info("指定儲位 箱號: " + trace_id + " 溢出: " + overflow + " 將指定至新箱號: " + newTrace);
            ActiveJdbc.operTx(new Operation<Void>() {
                @Override
                public Void operate() {
                    Map data = new HashMap();
                    data.put("trace_id", newTrace);
                    data.put("product_id", product_id);
                    data.put("inbox_pcs", overflow);
                    data.put("pstoring_id", null);
                    data.put("boxing_name", null);
                    if (overflow >= conv_factor_pcs) {
                        data.put("status_id", "1");
                    } else {
                        data.put("status_id", "0");
                    }
                    data.put("create_by", user);
                    data.put("create_time", time);
                    data.put("modify_by", user);
                    data.put("modify_time", time);
                    Trace trace = new Trace();
                    trace.fromMap(data);
                    if (trace.saveIt()) {
                        log.info("溢出片數移動成功!");
                    } else {
                        log.info("溢出片數移動失敗!");
                    }
                    insertTraceWork(work_id, newTrace, user, false);
                    List<Map> machines = getLineMachines(line_id, false);
                    Map<String, List<Map>> machineMaterialMap = getMaterialItems(machines, false); //所有設備所使用的料件
                    if (!insertTraceMaterial(newTrace, machineMaterialMap, user, false)) {
                        log.info("寫入成品原料追蹤資料有問題, 請確認");
                    }
                    return null;
                }
            });
        }
        return success();
    }

    @RequestMapping(value = "/readNoStorageList", method = RequestMethod.GET)
    public RequestResult<List<Map>> readNoStorageList() {

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT t.trace_id, tw.work_id, t.product_id, t.pstoring_id, p.product_name, MIN(wod.act_start_time) AS act_start_time, t.boxing_time FROM a_chengshiu_trace AS t ");
                sb.append("INNER JOIN ");
                sb.append("( SELECT a.trace_id, a.work_id, a.create_time FROM a_chengshiu_trace_work a ");
                sb.append("JOIN ");
                sb.append("(SELECT trace_id, max(create_time) as create_time ");
                sb.append("FROM a_chengshiu_trace_work GROUP BY trace_id) as b ");
                sb.append("ON a.trace_id = b.trace_id ");
                sb.append("AND ");
                sb.append("a.create_time = b.create_time) AS tw ");
                sb.append("ON t.trace_id = tw.trace_id ");
                sb.append("INNER JOIN a_chengshiu_work_order_duration AS wod ");
                sb.append("ON tw.work_id = wod.work_id ");
                sb.append("INNER JOIN a_chengshiu_product AS p ");
                sb.append("ON t.product_id = p.product_id ");
                sb.append("WHERE t.status_id IN ('0', '1', '3') ");
                sb.append("GROUP BY trace_id");
                String sql = sb.toString();
                System.out.println(sql);
                List<Map> result = Base.findAll(sql);

                for (Map map : result) {
                    map.put("act_start_time", map.get("act_start_time").toString());
                    map.put("boxing_time", map.get("boxing_time") == null ? "" : map.get("boxing_time").toString());
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/updateStoringTime", method = RequestMethod.PUT)
    public RequestResult<?> updateStoringTime(@RequestBody final Map data) {
        final String modifyTime = data.get("storing_time").toString();
        final String pstoringId = data.get("pstoring_id").toString();
        final String traceId = data.get("trace_id").toString();
        final Map currentStoringsStatus = (Map) data.get("current_storings_status");
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {

                    Trace trace = new Trace();
                    StringBuilder sb = new StringBuilder();
                    sb.append("SELECT tw.trace_id, wo.work_id, wo.not_done_quantity, do.demand_id, do.not_done FROM a_chengshiu_trace_work as tw ");
                    sb.append("INNER JOIN a_chengshiu_work_order AS wo ");
                    sb.append("ON tw.work_id = wo.work_id ");
                    sb.append("INNER JOIN a_chengshiu_demand_order AS do ");
                    sb.append("ON do.demand_id = wo.demand_id ");
                    sb.append("WHERE trace_id = '" + traceId + "'");
                    List<Map> queryViewResult = Base.findAll(sb.toString());


                    //入庫非指定儲位
                    List<Map> queryTrace = Trace.find("trace_id = ?", traceId).toMaps();
                    String assignPstoringId = queryTrace.get(0).get("pstoring_id") == null ? "" : queryTrace.get(0).get("pstoring_id").toString();
                    List<Map> queryStoring = Storing.find("pstoring_id = ?", assignPstoringId).toMaps();
                    String assignPstoringStatus = queryStoring.size() == 0 ? "" : queryStoring.get(0).get("status_id").toString();
                    if (!assignPstoringId.equals(pstoringId) && assignPstoringStatus.equals(StoringStatus.ASSIGN_NO_STORAGE)) {
                        Storing storing = new Storing();
                        Map storingMap = new HashMap();
                        storingMap.put("pstoring_id", assignPstoringId);
                        storingMap.put("status_id", StoringStatus.EMPTY);
                        storingMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        storingMap.put("modify_time", modifyTime);
                        storing.fromMap(storingMap);
                        if (storing.saveIt()) {
                            log.debug(assignPstoringId + " assign pstoring id reset empty status ");
                        }
                    }


                    ///更新需求單 工單 產品 的關聯數量與狀態
                    DemandOrder demandOrder = new DemandOrder();
                    Map demandOrderMap = new HashMap();
                    String demandId = queryViewResult.get(0).get("demand_id").toString();
                    int newNotDone = Integer.parseInt(queryViewResult.get(0).get("not_done").toString()) - 1;
                    demandOrderMap.put("demand_id", demandId);
                    demandOrderMap.put("not_done", newNotDone);
                    if (newNotDone == 0) {
                        demandOrderMap.put("act_complete_time", new Timestamp(System.currentTimeMillis()));
                        demandOrderMap.put("status_id", DemandOrderStatus.CLOSE);
                    } else {
                        demandOrderMap.put("status_id", DemandOrderStatus.PRODUCING);
                    }
                    demandOrder.fromMap(demandOrderMap);
                    demandOrder.saveIt();

                    WorkOrder workOrder = new WorkOrder();
                    Map workOrderMap = new HashMap();
                    //一個箱號可能會對多個工單，計算待生產數量要放在最後一個工單，先記著第二階段解決
                    String workId = queryViewResult.get(0).get("work_id").toString();
                    int newNotDoneQuantity = Integer.parseInt(queryViewResult.get(0).get("not_done_quantity").toString()) - 1;
                    workOrderMap.put("work_id", workId);
                    workOrderMap.put("not_done_quantity", newNotDoneQuantity);
                    if (newNotDoneQuantity == 0) {
                        workOrderMap.put("status_id", WorkOrderStatus.CLOSE);
                    }
                    workOrder.fromMap(workOrderMap);
                    workOrder.saveIt();

                    Product product = new Product();
                    List<Map> traceResult = Trace.find("trace_id = ?", traceId).toMaps();
                    String productId = traceResult.get(0).get("product_id").toString();
                    List<Map> productResult = Product.find("product_id = ?", productId).toMaps();
                    String inventory = productResult.get(0).get("inventory").toString();
                    Map productMap = new HashMap();
                    productMap.put("product_id", productId);
                    productMap.put("inventory", Integer.parseInt(inventory) + 1);
                    product.fromMap(productMap);
                    product.saveIt();
                    ChengShiuUtilities.updateProductStock(productId, request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString());

                    //高對低儲位Mapping表
                    Map highToLowStoringMap = new HashMap();
                    highToLowStoringMap.put(PstoringId.A_H, PstoringId.A_L);
                    highToLowStoringMap.put(PstoringId.B_H, PstoringId.B_L);
                    highToLowStoringMap.put(PstoringId.C_H, PstoringId.C_L);
                    Map productStoringMap = new HashMap();
                    Storing storing = new Storing();
                    String msg = null;
//                    判斷入庫儲位若為高儲位
                    if (highToLowStoringMap.containsKey(pstoringId)) {
                        String lowPstoringId = highToLowStoringMap.get(pstoringId).toString();
                        List<Map> queryLowStoring = Storing.find("pstoring_id = ?", lowPstoringId).toMaps();
                        String dbLowPstoringStatus = queryLowStoring.get(0).get("status_id").toString();
                        System.out.println("高儲位" + pstoringId);
                        System.out.println("低儲位" + lowPstoringId);
                        System.out.println("低儲位LIST" + queryLowStoring.toString());
//                  入庫時，檢查該與該入庫相同儲架(STORING.shelf)之低儲位(type_id=L)，是否為空(status_id=0且遮斷感測器偵測為否)
//                    1.若為空，高儲位成品箱移至低儲位
                        System.out.println("低儲位狀態" + dbLowPstoringStatus);
                        if ((dbLowPstoringStatus.equals(StoringStatus.EMPTY) || dbLowPstoringStatus.equals(StoringStatus.ASSIGN_NO_STORAGE))) {
//                      (1)	更新位於該儲區高儲位成品箱(TABLE：TRACE)，更新其儲位改為低儲位代碼(TRACE.pstoring_id)
                            data.put("pstoring_id", lowPstoringId);
                            data.put("status_id", TraceStatus.STORAGE);
                            data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                            data.put("modify_time", modifyTime);
                            trace.fromMap(data);
                            trace.saveIt();

//                      (2)	更新該儲區高儲位狀態為空(staus_id=0)
                            productStoringMap.put("pstoring_id", pstoringId);
                            productStoringMap.put("status_id", StoringStatus.EMPTY);
                            productStoringMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                            productStoringMap.put("modify_time", modifyTime);
                            storing.fromMap(productStoringMap);
                            storing.saveIt();

//                      (3)	更新該儲區低儲位狀態為存放物品(staus_id=1)
                            productStoringMap.put("pstoring_id", lowPstoringId);
                            productStoringMap.put("status_id", StoringStatus.STORAGE);
                            productStoringMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                            productStoringMap.put("modify_time", modifyTime);
                            storing.fromMap(productStoringMap);
                            storing.saveIt();
                            msg = "自動調整儲位由" + pstoringId + "到" + lowPstoringId;
//                    2.低儲位有置物，高儲位成品箱不移動
                        } else if (dbLowPstoringStatus.equals(StoringStatus.STORAGE)) {
//                          (1)	更新位於該儲區高儲位成品箱(TABLE：TRACE)，更新其儲位改為高儲位代碼(TRACE.pstoring_id)
                            data.put("status_id", TraceStatus.STORAGE);
                            data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                            data.put("modify_time", modifyTime);
                            trace.fromMap(data);
                            trace.saveIt();

//                          (2)	更新該儲區高儲位狀態為存放物品(staus_id=1)
                            productStoringMap.put("pstoring_id", pstoringId);
                            productStoringMap.put("status_id", StoringStatus.STORAGE);
                            storing.fromMap(productStoringMap);
                            storing.saveIt();
                        }
//                   判斷入庫儲位若為低儲位
                    } else {
                        String lowPstoringId = pstoringId;
                        List<Map> queryLowStoring = Storing.find("pstoring_id = ?", lowPstoringId).toMaps();
                        String dbLowPstoringStatus = queryLowStoring.get(0).get("status_id").toString();
                        String realLowPstoringStatus = (currentStoringsStatus.get(lowPstoringId) == null || currentStoringsStatus.get(lowPstoringId).toString().equals("B")) ?
                                null : currentStoringsStatus.get(lowPstoringId).toString();
                        if ((dbLowPstoringStatus.equals(StoringStatus.EMPTY) || dbLowPstoringStatus.equals(StoringStatus.ASSIGN_NO_STORAGE)) &&
                                realLowPstoringStatus == null ? true : realLowPstoringStatus.equals(StoringStatus.EMPTY)) {
//                          (1)	更新位於該儲區低儲位成品箱(TABLE：TRACE)，更新其儲位改為高儲位代碼(TRACE.pstoring_id)
                            data.put("status_id", TraceStatus.STORAGE);
                            data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                            data.put("modify_time", modifyTime);
                            trace.fromMap(data);
                            trace.saveIt();

//                          (2)	更新該儲區低儲位狀態為存放物品(staus_id=1)
                            productStoringMap.put("pstoring_id", lowPstoringId);
                            productStoringMap.put("status_id", StoringStatus.STORAGE);
                            storing.fromMap(productStoringMap);
                            storing.saveIt();
                        }
                    }
                    if (msg != null) {
                        return success(msg);
                    }
                    return success("update success");
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail("update fail... " + e.getMessage());
        }
    }


    @RequestMapping(value = "/printFinishedBoxList", method = RequestMethod.POST)
//    public void printFinishedBoxList(@RequestBody final Map data) {
    public void printFinishedBoxList(@RequestParam("trace_id") final String trace_id,
                                     @RequestParam("product_id") final String product_id,
                                     @RequestParam("product_name") final String product_name) {
        ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {

            @Override
            public RequestResult<Void> operate() {
                UUID uuid = UUID.randomUUID();
                String boxingTime = null;
                List<Map> traceResult = Trace.find("trace_id = ?", trace_id).toMaps();
                String inboxPcs = traceResult.get(0).get("inbox_pcs").toString();
                SimpleDateFormat sdf2 = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                //成品箱沒有裝箱時間就建立
                if (traceResult.get(0).get("boxing_time") == null) {
                    Date date = new Date();
                    boxingTime = sdf2.format(date);
                    Map traceMap = new HashMap();
                    traceMap.put("trace_id", trace_id);
                    traceMap.put("boxing_time", boxingTime);
                    Trace trace = new Trace();
                    trace.fromMap(traceMap);
                    if (trace.saveIt()) {
                        log.info(trace_id + "更新裝箱完成時間" + boxingTime + "成功");
                    }
                } else {
                    try {
                        boxingTime = sdf2.format(sdf2.parse(traceResult.get(0).get("boxing_time").toString()));
                    } catch (ParseException e) {
                        e.printStackTrace();
                    }
                }

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT tm.item_id, mi.material_id, m.material_name  FROM a_chengshiu_trace_material AS tm ");
                sb.append("INNER JOIN a_chengshiu_material_item AS mi ");
                sb.append("ON tm.item_id = mi.item_id ");
                sb.append("INNER JOIN a_chengshiu_material AS m ");
                sb.append("ON mi.material_id = m.material_id ");
                sb.append("WHERE trace_id = '" + trace_id + "'");
                sb.append("ORDER BY material_id");
                String sql = sb.toString();
                System.out.println(sql);
                List<Map> result = Base.findAll(sql);
                XWPFDocument document = null;
                String modelPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/CSUProductWarehouse/program/finishedBoxListForm.docx";
                final String outputFolder = System.getProperty(SysPropKey.ROOT_PATH) + "/app/CSUProductWarehouse/program/" + uuid;
                if (!new File(outputFolder).exists()) {
                    new File(outputFolder).mkdirs();
                }

                try {
//                        int pageCount = 0;
                    FileInputStream input = new FileInputStream(modelPath);
                    FileInputStream imgInput = null;
                    document = new XWPFDocument(input);
                    XWPFTable module = document.getTables().get(0);
                    FileOutputStream output = new FileOutputStream(outputFolder + "/" + uuid + ".docx");
//                        pageCount = resultMap.size() - 1;
//                        for (int i =0; i < pageCount; i++) {
//                            document.createTable();
//                            document.setTable((i + 1), module);
//                            if (i%2 > 0) {
//                                document.createParagraph();
//                            }
//                        }
                    document.write(output);
                    output.close();
                    input.close();
                    input = new FileInputStream(outputFolder + "/" + uuid + ".docx");
                    document = new XWPFDocument(input);

                    List<XWPFTable> tableList = document.getTables();
                    XWPFTable table = null;
                    XWPFTableCell cell = null;
                    XWPFParagraph paragraph = null;
                    XWPFRun r = null;
                    table = tableList.get(0);
//                    String trace_id = data.get("trace_id").toString();
//                    String product_id = data.get("product_id").toString();
//                    String product_name = data.get("product_name").toString();
//                    String boxing_time = data.get("boxing_time").toString();

                    String imgPath = outputFolder + "/" + trace_id + ".png";

                    cell = table.getRow(0).getCell(1);
                    cell.setText(trace_id);

                    QRcodeService.createCode128(trace_id, imgPath);
                    cell = table.getRow(0).getCell(2);
                    paragraph = cell.getParagraphs().get(0);
                    r = paragraph.createRun();
                    imgInput = new FileInputStream(imgPath);
                    r.addPicture(imgInput, XWPFDocument.PICTURE_TYPE_PNG, imgPath, Units.toEMU(204.6), Units.toEMU(68.2));
                    imgInput.close();

                    QRcodeService.createQrcode(trace_id, imgPath);
                    cell = table.getRow(0).getCell(3);
                    paragraph = cell.getParagraphs().get(0);
                    r = paragraph.createRun();
                    imgInput = new FileInputStream(imgPath);
                    r.addPicture(imgInput, XWPFDocument.PICTURE_TYPE_PNG, imgPath, Units.toEMU(68.2), Units.toEMU(68.2));
                    imgInput.close();

                    cell = table.getRow(1).getCell(1);
                    cell.setText(product_name);

                    cell = table.getRow(1).getCell(3);
                    cell.setText(" " + inboxPcs);

                    cell = table.getRow(2).getCell(1);
                    cell.setText(product_id);

                    cell = table.getRow(3).getCell(1);
                    cell.setText(boxingTime);

                    Map<String, Map> m = new LinkedHashMap();
                    for (Map map : result) {
                        String itemId = map.get("item_id").toString();
                        String materialId = map.get("material_id").toString();
                        String materialName = map.get("material_name").toString();
                        System.out.println(map);
                        if (!m.containsKey(materialId)) {
                            Map ele = new HashMap();
                            ArrayList<String> al = new ArrayList<String>();
                            al.add(itemId);
                            ele.put("material_name", materialName);
                            ele.put("item_ids", al);
                            m.put(materialId, ele);
                        } else {
                            ArrayList<String> al = (ArrayList<String>) m.get(materialId).get("item_ids");
                            al.add(itemId);
                        }
                    }

                    XWPFParagraph xp = table.getRow(4).getCell(1).getParagraphs().get(0);
                    for (Map.Entry<String, Map> entry : m.entrySet()) {
                        String materialName = entry.getValue().get("material_name").toString();
                        ArrayList<String> itemIds = (ArrayList<String>) entry.getValue().get("item_ids");
                        String listString = "";
                        for (String s : itemIds) {
                            listString += s + " ";
                        }
                        XWPFRun run = xp.createRun();
                        run.setText(materialName + " : " + listString);
                        run.addBreak();
                    }

                    SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");

                    String mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    String headerKey = "Content-Disposition";
                    String headerValue = "attachment; filename=\" " + sdf.format(new Date()) + ".docx\"";

                    response.setContentType(mimeType);
                    response.setHeader(headerKey, headerValue);
                    ServletOutputStream out = response.getOutputStream();
                    document.write(out);
                    output.close();
                    out.flush();
                    out.close();
                    input.close();
                    imgInput.close();
//                    FileOutputStream output2 = new FileOutputStream(outputFolder + "/" + "123" + ".docx");
//                    document.write(output2);

                    File path = new File(outputFolder);
                    if (path.isDirectory()) {
                        for (File file : path.listFiles()) {
                            file.delete();
                        }
                        path.delete();
                    }
                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                } catch (InvalidFormatException e) {
                    e.printStackTrace();
                }

                return success();
            }
        });
    }

    @RequestMapping(value = "/updateShippingData", method = RequestMethod.POST)
    public RequestResult<?> updateShippingData(@RequestBody final Map data) {
        final Map currentStoringsStatus = (Map) data.get("current_storings_status");
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() throws DBException {
                    String shippingId = data.get("shipping_id").toString();
                    String orderId = data.get("order_id").toString();
                    String timeStamp = data.get("create_time").toString();
                    List<Map<String, String>> shippingDetail = (List<Map<String, String>>) data.get("shipping_detail");
                    Object user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    List normalMsgList = new ArrayList();
                    List abnormalMsgList = new ArrayList();

                    //即時狀態不為B與空字串(代表沒有抓到sensor data或者servbox當機)而且DB與即時監控儲位狀態不一樣而就回傳錯誤訊息
                    if (currentStoringsStatus.size() > 0) {
                        for (Map map : shippingDetail) {
                            String traceId = map.get("trace_id").toString();
                            List<Map> queryTrace = Trace.find("trace_id = ?", traceId).toMaps();
                            String pstoringId = queryTrace.get(0).get("pstoring_id").toString();
                            List<Map> findStoring = Storing.find("pstoring_id = ?", pstoringId).toMaps();
                            String dbStoringStatus = findStoring.get(0).get("status_id").toString();
                            String pstoringName = findStoring.get(0).get("pstoring_name").toString();
                            String realStoringStatus = currentStoringsStatus.get(pstoringId) == null ? "" : currentStoringsStatus.get(pstoringId).toString();
                            if (!realStoringStatus.equals("") && !realStoringStatus.equals("B")) {
                                if (!dbStoringStatus.equals(realStoringStatus)) {
                                    Map msgMap2 = new HashMap();
                                    msgMap2.put("msg", pstoringName + "資料庫與遮斷器的儲位狀態不一致，請先確認再出貨");
                                    abnormalMsgList.add(msgMap2);
                                }
                            }
                        }
                    }

                    if (abnormalMsgList.size() > 0) {
                        return fail(abnormalMsgList);
                    }

                    Trace trace = new Trace();
                    Storing storing = new Storing();

                    //低儲位對高儲位mapping表
                    Map low2HighStoring = new HashMap();
                    low2HighStoring.put(PstoringId.A_L, PstoringId.A_H);
                    low2HighStoring.put(PstoringId.B_L, PstoringId.B_H);
                    low2HighStoring.put(PstoringId.C_L, PstoringId.C_H);

                    for (Map map : shippingDetail) {
                        //找到箱號與儲位
                        String traceId = map.get("trace_id").toString();
                        List<Map> queryTrace = Trace.find("trace_id = ?", traceId).toMaps();
                        String pstoringId = queryTrace.get(0).get("pstoring_id").toString();

                        Map productStoringMap = new HashMap();
                        Map traceMap = new HashMap();

//                      判斷出庫為低儲位
                        if (low2HighStoring.containsKey(pstoringId)) {
                            String highPstoringId = low2HighStoring.get(pstoringId).toString();
                            String highPstoringStatus = Storing.find("pstoring_id = ?", highPstoringId).toMaps().get(0).get("status_id").toString();
                            //判斷對應高儲位有置物
                            if (highPstoringStatus.equals(StoringStatus.STORAGE)) {
                                //把高儲位狀態改為空
                                productStoringMap.put("pstoring_id", highPstoringId);
                                productStoringMap.put("status_id", StoringStatus.EMPTY);
                                storing.fromMap(productStoringMap);
                                storing.saveIt();

                                //將原高儲位成品箱位置改為低儲位
                                String highTraceId = Trace.find("pstoring_id = ? AND status_id = ?", highPstoringId, TraceStatus.STORAGE).toMaps().get(0).get("trace_id").toString();
                                traceMap.put("trace_id", highTraceId);
                                traceMap.put("pstoring_id", pstoringId);
                                traceMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                                traceMap.put("modify_time", new Timestamp(System.currentTimeMillis()));
                                trace.fromMap(traceMap);
                                trace.saveIt();

                                traceMap.put("trace_id", traceId);
                                traceMap.put("status_id", TraceStatus.SHIPPING);
                                traceMap.put("pstoring_id", null);
                                traceMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                                traceMap.put("modify_time", new Timestamp(System.currentTimeMillis()));
                                trace.fromMap(traceMap);
                                trace.saveIt();

                                Map msgMap1 = new HashMap();
                                msgMap1.put("msg", "自動調整" + highTraceId + "的儲位由" + highPstoringId + "到" + pstoringId);
                                normalMsgList.add(msgMap1);

                                //判斷對應高儲位沒置物
                            } else if (highPstoringStatus.equals(StoringStatus.EMPTY)) {
                                productStoringMap.put("pstoring_id", pstoringId);
                                productStoringMap.put("status_id", StoringStatus.EMPTY);
                                storing.fromMap(productStoringMap);
                                storing.saveIt();

                                traceMap.put("trace_id", traceId);
                                traceMap.put("status_id", TraceStatus.SHIPPING);
                                traceMap.put("pstoring_id", null);
                                traceMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                                traceMap.put("modify_time", new Timestamp(System.currentTimeMillis()));
                                trace.fromMap(traceMap);
                                trace.saveIt();
                            }
//                      判斷出庫為高儲位
                        } else {
                            productStoringMap.put("pstoring_id", pstoringId);
                            productStoringMap.put("status_id", StoringStatus.EMPTY);
                            storing.fromMap(productStoringMap);
                            storing.saveIt();

                            traceMap.put("trace_id", traceId);
                            traceMap.put("status_id", TraceStatus.SHIPPING);
                            traceMap.put("pstoring_id", null);
                            traceMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                            traceMap.put("modify_time", new Timestamp(System.currentTimeMillis()));
                            trace.fromMap(traceMap);
                            trace.saveIt();
                        }
                    }

                    //掃描成品箱號陣列
                    //2.	更新訂單明細TABLE：SALES_ORDER_DETAILS訂單明細
                    SalesOrderDetails salesOrderDetails = new SalesOrderDetails();
                    //同品項記錄累計次數
                    Map<String, Integer> shippingNumMap = new HashMap<String, Integer>();
                    for (Map map : shippingDetail) {
                        String productId = map.get("product_id").toString();
                        if (!shippingNumMap.containsKey(productId)) {
                            shippingNumMap.put(productId, 1);
                        } else {
                            int oldshippingNum = Integer.parseInt(shippingNumMap.get(productId).toString());
                            int newshippingNum = oldshippingNum + 1;
                            shippingNumMap.put(productId, newshippingNum);
                        }
                    }

                    for (Map.Entry<String, Integer> entry : shippingNumMap.entrySet()) {
                        String productId = entry.getKey();
                        Map result = SalesOrderDetails.find("order_id = ? AND product_id = ?", orderId, productId).toMaps().get(0);
                        int shippingNum = entry.getValue().intValue();
                        //(1)	已出貨箱數=原已出貨箱數+本次出貨該品項箱數
                        int newShippingQuantity = Integer.parseInt(result.get("shipping_quantity").toString()) + shippingNum;
                        result.put("shipping_quantity", newShippingQuantity);
                        result.put("modify_by", user);
                        result.put("modify_time", timeStamp);
                        salesOrderDetails.fromMap(result);
                        salesOrderDetails.saveIt();

                        Product product = new Product();
                        List<Map> productResult = Product.find("product_id = ?", productId).toMaps();
                        String inventory = productResult.get(0).get("inventory").toString();
                        Map productMap = new HashMap();
                        productMap.put("product_id", productId);
                        productMap.put("inventory", Integer.parseInt(inventory) - shippingNum);
                        product.fromMap(productMap);
                        product.saveIt();
                        ChengShiuUtilities.updateProductStock(productId, request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString());
                    }

                    //3.	更新訂單TABLE：SALES_ORDER訂單
                    SalesOrder salesOrder = new SalesOrder();
                    Map saleOrderResult = salesOrder.find("order_id = ?", orderId).toMaps().get(0);
                    //(1)	已出貨箱數=原已出貨箱數+本次出貨箱數
                    int newShippingQuantitySaleOrder = Integer.parseInt(saleOrderResult.get("shipping_quantity").toString()) + shippingDetail.size();
                    saleOrderResult.put("shipping_quantity", newShippingQuantitySaleOrder);
                    saleOrderResult.put("modify_by", user);
                    saleOrderResult.put("modify_time", timeStamp);
                    salesOrder.fromMap(saleOrderResult);
                    salesOrder.saveIt();

                    //4.	新增各筆成品箱之訂單出貨記錄TABLE：ORDER_SHIPPING訂單出貨記錄
                    OrderShipping orderShipping = new OrderShipping();
                    Map orderShippingMap = new HashMap();
                    for (Map shippingMap : shippingDetail) {
                        orderShippingMap.put("shipping_id", shippingId);
                        orderShippingMap.put("order_id", orderId);
                        orderShippingMap.put("trace_id", shippingMap.get("trace_id").toString());
                        orderShippingMap.put("create_by", user);
                        //(2)	同一次出貨各品項的出貨紀錄建立時間(ORDER_SHIPPING.create_time)相同
                        orderShippingMap.put("create_time", timeStamp);
                        orderShippingMap.put("modify_by", user);
                        orderShippingMap.put("modify_time", timeStamp);
                        orderShipping.fromMap(orderShippingMap);
                        orderShipping.insert();
                    }

                    Map msgMap3 = new HashMap();
                    msgMap3.put("msg", "update success");
                    normalMsgList.add(msgMap3);
                    return success(normalMsgList);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail("update fail... " + e.getMessage());
        }
    }

    @RequestMapping(value = "/printShippingList", method = RequestMethod.POST)
//    public void printShippingList(@RequestBody final Map map) {
    public void printShippingList(@RequestParam("shipping_id") final String shippingId, // 出貨單號
                                  @RequestParam("create_time") final String createTime, // 出貨時間
                                  @RequestParam("order_id") final String orderId, // 訂單編號
                                  @RequestParam("shipping_detail") final String shipping_detail) {

        ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {

            @Override
            public RequestResult<Void> operate() {

                UUID uuid = UUID.randomUUID();
                Type type = new TypeToken<List<Map<String, String>>>() {
                }.getType();
                //掃描成品箱號陣列
                List<Map<String, String>> shippingDetail = new Gson().fromJson(shipping_detail, type);
                //查SQL找到訂單明細
                //拿到List<Map>
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT p.product_name, so.arrival_date, sot.* FROM a_chengshiu_sales_order_details AS sot ");
                sb.append("INNER JOIN a_chengshiu_sales_order AS so ");
                sb.append("ON sot.order_id = so.order_id ");
                sb.append("INNER JOIN a_chengshiu_product AS p ");
                sb.append("ON sot.product_id = p.product_id ");
                sb.append("where sot.order_id = '" + orderId + "'");
                String sql = sb.toString();
                System.out.println(sql);
                List<Map> orderDetail = Base.findAll(sql);
                XWPFDocument document = null;
                String modelPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/CSUProductWarehouse/program/shippingListForm.docx";
                final String outputFolder = System.getProperty(SysPropKey.ROOT_PATH) + "/app/CSUProductWarehouse/program/" + uuid;
                if (!new File(outputFolder).exists()) {
                    new File(outputFolder).mkdirs();
                }

                try {
                    FileInputStream input = new FileInputStream(modelPath);
                    FileInputStream imgInput = null;
                    document = new XWPFDocument(input);
                    XWPFTable module = document.getTables().get(0);
                    FileOutputStream output = new FileOutputStream(outputFolder + "/" + uuid + ".docx");
//
                    document.write(output);
                    output.close();
                    input.close();
                    input = new FileInputStream(outputFolder + "/" + uuid + ".docx");
                    document = new XWPFDocument(input);

                    List<XWPFTable> tableList = document.getTables();
                    XWPFTableCell cell = null;
                    XWPFParagraph paragraph = null;
                    XWPFRun r = null;
                    XWPFTable shippingTable = tableList.get(0);

                    cell = shippingTable.getRow(0).getCell(1);
                    cell.setText(shippingId);

                    cell = shippingTable.getRow(0).getCell(3);
                    cell.setText(createTime);

                    int shippingRow = 2;
                    int shippingIndex = 1;
                    for (Map shippingRecord : shippingDetail) {

                        cell = shippingTable.getRow(shippingRow).getCell(0);
                        cell.setText(String.valueOf(shippingIndex));

                        cell = shippingTable.getRow(shippingRow).getCell(1);
                        cell.setText(shippingRecord.get("trace_id").toString());

                        cell = shippingTable.getRow(shippingRow).getCell(2);
                        cell.setText(shippingRecord.get("product_id").toString());

                        cell = shippingTable.getRow(shippingRow).getCell(3);
                        cell.setText(shippingRecord.get("product_name").toString());
                        shippingRow++;
                        shippingIndex++;
                    }

                    XWPFTable orderTable = tableList.get(1);

                    cell = orderTable.getRow(0).getCell(1);
                    cell.setText(orderId);

                    String imgPath = outputFolder + "/" + orderId + ".png";
                    QRcodeService.createCode128(orderId, imgPath);
                    cell = orderTable.getRow(0).getCell(2);
                    paragraph = cell.getParagraphs().get(0);
                    r = paragraph.createRun();
                    imgInput = new FileInputStream(imgPath);
                    r.addPicture(imgInput, XWPFDocument.PICTURE_TYPE_PNG, imgPath, Units.toEMU(204.6), Units.toEMU(68.2));
                    imgInput.close();

                    QRcodeService.createQrcode(orderId, imgPath);
                    cell = orderTable.getRow(0).getCell(3);
                    paragraph = cell.getParagraphs().get(0);
                    r = paragraph.createRun();
                    imgInput = new FileInputStream(imgPath);
                    r.addPicture(imgInput, XWPFDocument.PICTURE_TYPE_PNG, imgPath, Units.toEMU(68.2), Units.toEMU(68.2));
                    imgInput.close();

                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                    int orderRow = 2;
                    int orderIndex = 1;
                    for (Map orderRecord : orderDetail) {
                        cell = orderTable.getRow(orderRow).getCell(0);
                        cell.setText(String.valueOf(orderIndex));
                        cell = orderTable.getRow(orderRow).getCell(1);
                        cell.setText(orderRecord.get("product_name").toString());
                        cell = orderTable.getRow(orderRow).getCell(2);
                        cell.setText(sdf.format(sdf.parse(orderRecord.get("arrival_date").toString())));
                        cell = orderTable.getRow(orderRow).getCell(3);
                        cell.setText(orderRecord.get("order_quantity").toString());
                        cell = orderTable.getRow(orderRow).getCell(4);
                        cell.setText(orderRecord.get("not_done").toString());
                        orderRow++;
                        orderIndex++;
                    }


                    SimpleDateFormat sdf2 = new SimpleDateFormat("yyyyMMddHHmmssSSS");

                    String mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    String headerKey = "Content-Disposition";
                    String headerValue = "attachment; filename=\" " + sdf2.format(new Date()) + ".docx\"";

                    response.setContentType(mimeType);
                    response.setHeader(headerKey, headerValue);
                    ServletOutputStream out = response.getOutputStream();
                    document.write(out);
                    output.close();
                    out.flush();
                    out.close();
                    input.close();
                    imgInput.close();
//                    FileOutputStream output2 = new FileOutputStream(outputFolder + "/" + "123" + ".docx");
//                    document.write(output2);

                    File path = new File(outputFolder);
                    if (path.isDirectory()) {
                        for (File file : path.listFiles()) {
                            file.delete();
                        }
                        path.delete();
                    }
                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                } catch (InvalidFormatException e) {
                    e.printStackTrace();
                } catch (ParseException e) {
                    e.printStackTrace();
                }
                return success();
            }
        });
    }

    @RequestMapping(value = "/updateManualStoring", method = RequestMethod.PUT)
    public RequestResult<?> updateManualStoring(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Object modifyBy = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    Timestamp modifyTime = new Timestamp(System.currentTimeMillis());

                    data.put("modify_by", modifyBy);
                    data.put("modify_time", modifyTime);
                    //3.點選儲存更新資料庫
                    Trace trace = new Trace();
                    trace.fromMap(data);

                    List<Map> result = Trace.find("trace_id = ?", data.get("trace_id")).toMaps();
                    String oldStoringId = result.get(0).get("pstoring_id").toString();

                    Map oldStoringMap = new HashMap();
                    oldStoringMap.put("pstoring_id", oldStoringId);
                    oldStoringMap.put("status_id", 0);
                    oldStoringMap.put("modify_by", modifyBy);
                    oldStoringMap.put("modify_time", modifyTime);

                    Storing storing = new Storing();
                    storing.fromMap(oldStoringMap);

                    //(3)新儲位狀態為有存放物(STORING.status_id=1)
                    Map newStoringMap = new HashMap();
                    newStoringMap.put("pstoring_id", data.get("pstoring_id"));
                    newStoringMap.put("status_id", 1);
                    newStoringMap.put("modify_by", modifyBy);
                    newStoringMap.put("modify_time", modifyTime);

                    Storing storing2 = new Storing();
                    storing2.fromMap(newStoringMap);

                    if (trace.saveIt() && storing.saveIt() && storing2.saveIt()) {
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

    @RequestMapping(value = "/readStoring", method = RequestMethod.POST)
    public RequestResult<?> readStoring(@RequestBody final Map data) {
        final String statusId = data.get("status_id") == null ? "" : data.get("status_id").toString();
        final String pstoringId = data.get("pstoring_id") == null ? "" : data.get("pstoring_id").toString();
        final String productId = data.get("product_id") == null ? "" : data.get("product_id").toString();
        final String queryType = data.get("query_type").toString();
        final Map currentStoringsStatus = (Map) data.get("current_storings_status");
        final String EMPTY = "0";
        final String STORED = "1";
        try {
            return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
//                    	TABLE：STORING成品倉儲位、TRACE成品箱、PRODUCT產品
                    //儲位名稱 品項 箱號 裝箱時間

                    Product product = new Product();
                    List<Map> queryProduct = product.findAll().toMaps();
                    Map productId2Name = new HashMap();
                    for (Map map : queryProduct) {
                        String productId = map.get("product_id").toString();
                        String productName = map.get("product_name").toString();
                        productId2Name.put(productId, productName);
                    }

                    StringBuilder sb = new StringBuilder();
                    sb.append("SELECT storing.pstoring_id, storing.pstoring_name, storing.status_id, trace.trace_id, trace.product_id, trace.boxing_time ");
                    sb.append("FROM a_chengshiu_storing AS storing ");
                    sb.append("INNER JOIN a_chengshiu_storing_shelf AS shelf ");
                    sb.append("ON (storing.is_open = shelf.is_open AND ");
                    sb.append("storing.shelf_id = shelf.shelf_id) ");
                    sb.append("INNER JOIN a_chengshiu_storing_area AS area ");
                    sb.append("ON (storing.shelf_id = shelf.shelf_id AND ");
                    sb.append("shelf.area_id = area.area_id) ");
                    sb.append(queryType.equals("storing") ? "LEFT JOIN " : "INNER JOIN ");
                    sb.append("a_chengshiu_trace AS trace ");
                    sb.append("ON trace.pstoring_id = storing.pstoring_id ");
                    sb.append("WHERE ");
                    sb.append("storing.is_open='Y' AND shelf.is_open='Y' AND area.is_open='Y' AND area.is_open='Y' ");
                    sb.append("AND area.type='P' ");
                    if (queryType.equals("storing")) {
                        if (!"".equals(statusId)) {
                            sb.append("AND storing.status_id = '" + statusId + "' ");
                        } else if (!"".equals(pstoringId)) {
                            sb.append("AND storing.pstoring_id = '" + pstoringId + "' ");
                        }
                    } else if (queryType.equals("product")) {
                        sb.append("AND trace.status_id = '2' ");
                        if (!"".equals(productId)) {
                            sb.append("AND trace.product_id = '" + productId + "' ");
                        }
                    }
                    String sql = sb.toString();
                    System.out.println(sql);
                    List<Map> queryResult = Base.findAll(sql);

//                    	可選擇顯示所有儲位、顯示所有空儲位(staus_id=0且遮斷感測器偵測為否)或依儲位查詢，儲位查詢為單選
//                    	依篩選方式，顯示STORING成品倉儲位儲位資訊
//                    1.	若該儲位狀態非為空(status_id!=0或是遮斷感測器偵測為真)，需顯示其品項(product_name)與成品箱號(trace.id)
//                      (1)	若資料庫內無記錄但遮斷感測器偵測為真，則顯示”未知”，點選未知，可建立成品箱並確認入庫
//                      (2)	若資料庫有記錄但遮斷感測器偵測為否，則顯示紅色”%成品箱號%(感測不到物品)”
//                    2.	點選未知，可建立成品箱並確認入庫
//                    3.	若該儲位為空(status_id=0且遮斷感測器偵測為否)則於品項與成品箱號顯示為”--"

                    for (Map map : queryResult) {
                        if (map.get("product_id") != null) {
                            String productId = map.get("product_id").toString();
                            map.put("product_name", productId2Name.get(productId));
                        }
                        String statusId = map.get("status_id").toString();
                        String pstoringId = map.get("pstoring_id").toString();
                        System.out.println(currentStoringsStatus);
                        System.out.println(currentStoringsStatus.get(pstoringId));
                        if (!(currentStoringsStatus.get(pstoringId) == null || currentStoringsStatus.get(pstoringId).toString().equals("B"))) {
                            if (statusId.equals(EMPTY) && currentStoringsStatus.get(pstoringId).equals(STORED)) {
                                map.put("error_status", "unknow");
                            }
                            if (statusId.equals(STORED) && currentStoringsStatus.get(pstoringId).equals(EMPTY)) {
                                map.put("error_status", "no_detect");
                            }
                        }
                    }
                    return success(queryResult);

                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail("read fail... " + e.getMessage());
        }
    }

    @RequestMapping(value = "/readEmptyStoring", method = RequestMethod.GET)
    public RequestResult<?> readEmptyStoring(@RequestParam("type") final String type) {
        try {
            return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    String emptyStatus = "0";
                    String sql = "SELECT s.pstoring_id, s.status_id, sa.type FROM a_chengshiu_storing_area AS sa " +
                            "INNER JOIN a_chengshiu_storing AS s " +
                            "ON sa.area_id = s.area_id ";
                    System.out.println(sql);
                    if (type.equals("M") || type.equals("P")) {
                        List<Map> result = Base.findAll(sql + "WHERE type = ? AND status_id = ?", type, emptyStatus);
                        return success(result);
                    } else {
                        return fail("Input type value is wrong, plz key in M or P");
                    }
                }
            });
        } catch (Exception e) {
            return fail("read fail... " + e.getMessage());
        }
    }

    @RequestMapping(value = "/makeUpTrace", method = RequestMethod.POST)
    public RequestResult<?> makeUpTrace(@RequestBody final Map data) {
        final String inboxPcsString = data.get("inbox_pcs").toString();
        final int inboxPcs = Integer.parseInt(inboxPcsString);
        final String pstoringId = data.get("pstoring_id").toString();
        final String productId = data.get("product_id").toString();
        final List<Map> traceMaterialList = (List<Map>) data.get("trace_material");
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    SimpleDateFormat yyMM = new SimpleDateFormat("yyMM");
                    final Timestamp time = new Timestamp(new Date().getTime());

//                    	確認選擇入庫並列印成品箱單按鈕，新增記錄於資料庫
//                    1.	新增一成品箱記錄(TRACE成品箱)，內容如介面輸入
                    String prefix = "FP";
                    String currDate = yyMM.format(new Date());
                    final List<Map> maxCount = Base.findAll("SELECT COUNT(*) as count FROM a_chengshiu_trace WHERE trace_id like '" + prefix + currDate + "%'");
                    long count = Long.parseLong(maxCount.get(0).get("count").toString());
                    count++;
                    String traceId = prefix + currDate + String.format("%04d", count);

                    Map traceMap = new HashMap();
                    traceMap.put("trace_id", traceId);
                    traceMap.put("product_id", productId);
                    traceMap.put("status_id", "2");
                    traceMap.put("inbox_pcs", inboxPcs);
                    traceMap.put("boxing_time", time);
                    traceMap.put("pstoring_id", pstoringId);
                    traceMap.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    traceMap.put("create_time", time);
                    traceMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    traceMap.put("modify_time", time);
                    Trace trace = new Trace();
                    trace.fromMap(traceMap);
                    if (trace.insert()) {
                        log.info(traceId + " insert trace success");
                    } else {
                        log.debug(traceId + " insert trace fail");
                    }

                    Storing storing = new Storing();
                    Map storingMap = new HashMap();
                    storingMap.put("pstoring_id", pstoringId);
                    storingMap.put("status_id", "1");
                    storingMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
//                    (1)	則裝箱時間為當下系統時間
                    storingMap.put("modify_time", time);
                    storing.fromMap(storingMap);
                    if (storing.saveIt()) {
                        log.info(pstoringId + " insert storing success");
                    } else {
                        log.debug(pstoringId + " insert storing fail");
                    }

//                    2.	若介面輸入裝箱片數>=箱片轉換係數
                    String boxToPcsString = ConversionFactor.find("conv_id = ?", "box_to_pcs").toMaps().get(0).get("conv_factor").toString();
                    int boxToPcs = Integer.parseInt(boxToPcsString);
                    if (inboxPcs >= boxToPcs) {
                        Product product = new Product();
                        int inventory = Integer.parseInt(Product.find("product_id = ?", productId).toMaps().get(0).get("inventory").toString());
                        System.out.println("inventory: " + inventory);
                        int notInstorage = Integer.parseInt(Product.find("product_id = ?", productId).toMaps().get(0).get("not_instorage").toString());
//                    (2)	且該項產品庫存總數(PRODUCT.inventory)累計加1
                        int newInventory = inventory + 1;
                        System.out.println("newInventory : " + newInventory);
//                    (3)	更新產品剩餘總數(PRODUCT.total_remander)=庫存總數+未入庫總數
                        int totalRemander = newInventory + notInstorage;
                        System.out.println("totalRemander" + totalRemander);
                        Map pdMap = new HashMap();
                        pdMap.put("product_id", productId);
                        pdMap.put("inventory", newInventory);
                        pdMap.put("total_remander", totalRemander);
                        pdMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        pdMap.put("modify_time", time);
                        product.fromMap(pdMap);
                        if (product.saveIt()) {
                            log.info(productId + " insert product success");
                        } else {
                            log.debug(productId + " insert product fail");
                        }
                    }
//                    3.	若有輸入使用原料，則新增TRACE_MATERIAL成品原料追蹤記錄
                    if (traceMaterialList.size() > 0) {
                        TraceMaterial traceMaterial = new TraceMaterial();
                        for (Map map : traceMaterialList) {
                            String itemId = map.get("item_id").toString();
                            Map traceMaterialMap = new HashMap();
                            traceMaterialMap.put("trace_id", traceId);
                            traceMaterialMap.put("item_id", itemId);
                            traceMaterialMap.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                            traceMaterialMap.put("create_time", new Timestamp(System.currentTimeMillis()));
                            traceMaterialMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                            traceMaterialMap.put("modify_time", new Timestamp(System.currentTimeMillis()));
                            traceMaterial.fromMap(traceMaterialMap);
                            if (traceMaterial.insert()) {
                                log.info(traceId + "_" + itemId + " insert trace_material success");
                            } else {
                                log.debug(traceId + "_" + itemId + " insert trace_material fail");
                            }
                        }
                    }
                    return success("mark up success");
//                    4.	列印成品箱單功能同SRS1.6.2_02成品箱單列印
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    static class QRcodeService {

        private static final int QRCODE_WIDTH = 1152;
        private static final int QRCODE_HEIGHT = 1152;
        private static final int CODE_128_WIDTH = 3456;
        private static final int CODE_128_HEIGHT = 1152;
        private static final int WHITE = 255 << 16 | 255 << 8 | 255;
        private static final int BLACK = 0;
        private static final String ENCODE = "UTF-8";
        private static Hashtable hints;

        static {
            hints = new Hashtable();
            hints.put(EncodeHintType.CHARACTER_SET, ENCODE);
        }

        public static void createCode128(String content, String filePath) {

            Code128Writer writer = new Code128Writer();
            BufferedImage image = new BufferedImage(CODE_128_WIDTH, CODE_128_HEIGHT, BufferedImage.TYPE_INT_RGB);
            try {
                BitMatrix bitMatrix = writer.encode(content, BarcodeFormat.CODE_128, CODE_128_WIDTH, CODE_128_HEIGHT, hints);

                for (int i = 0; i < CODE_128_WIDTH; i++) {
                    for (int j = 0; j < CODE_128_HEIGHT; j++) {
                        image.setRGB(i, j, bitMatrix.get(i, j) ? BLACK : WHITE); // set pixel one by one
                    }
                }
                try {
                    ImageIO.write(image, "png", new File(filePath)); // save QR image to disk
                } catch (IOException e) {
                    e.printStackTrace();
                }

            } catch (WriterException e) {
                e.printStackTrace();
            }

        }


        public static void createQrcode(String content, String filePath) {

            QRCodeWriter writer = new QRCodeWriter();
            BufferedImage image = new BufferedImage(QRCODE_WIDTH, QRCODE_HEIGHT, BufferedImage.TYPE_INT_RGB);
            try {
                BitMatrix bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, QRCODE_WIDTH, QRCODE_HEIGHT, hints);

                for (int i = 0; i < QRCODE_WIDTH; i++) {
                    for (int j = 0; j < QRCODE_HEIGHT; j++) {
                        image.setRGB(i, j, bitMatrix.get(i, j) ? BLACK : WHITE); // set pixel one by one
                    }
                }
                try {
                    ImageIO.write(image, "png", new File(filePath)); // save QR image to disk
                } catch (IOException e) {
                    e.printStackTrace();
                }

            } catch (WriterException e) {
                e.printStackTrace();
            }

        }

        public static String read(String filePath) {

            QRCodeReader reader = new QRCodeReader();
            File file = new File(filePath);
            BufferedImage image = null;
            BinaryBitmap bitmap = null;
            Result result = null;

            try {
                image = ImageIO.read(file);
                int[] pixels = image.getRGB(0, 0, image.getWidth(), image.getHeight(), null, 0, image.getWidth());
                RGBLuminanceSource source = new RGBLuminanceSource(image.getWidth(), image.getHeight(), pixels);
                bitmap = new BinaryBitmap(new HybridBinarizer(source));

                result = reader.decode(bitmap);
                return result.getText();
            } catch (IOException e) {
                e.printStackTrace();
            } catch (ChecksumException e) {
                e.printStackTrace();
            } catch (NotFoundException e) {
                e.printStackTrace();
            } catch (FormatException e) {
                e.printStackTrace();
            }

            return null;
        }
    }

    public static class TraceStatus {
        final static String INCOMPLETE = "0";
        final static String COMPLETE_NO_STORAGE = "1";
        final static String STORAGE = "2";
        final static String ASSIGN_NO_STORAGE = "3";
        final static String SHIPPING = "4";
    }

    public static class StoringStatus {
        final static String EMPTY = "0";
        final static String STORAGE = "1";
        final static String ASSIGN_NO_STORAGE = "3";
    }

    public static class SalesOrderStatus {
        final static String CREATE = "0";
        final static String CLOSE = "2";
        final static String CANCEL = "9";
    }

    public static class SalesOrderDetailStatus {
        final static String CREATE = "0";
        final static String PRODUCED = "2";
        final static String CANCEL = "9";
    }

    public static class DemandOrderStatus {
        final static String NO_CONVERT_WORK = "0";
        final static String CONVERT_WORK_WAIT_PRODUCE = "1";
        final static String PRODUCING = "2";
        final static String CLOSE = "3";
        final static String CANCEL = "9";
    }

    public static class WorkOrderStatus {
        final static String WAIT_PRODUCE = "0";
        final static String PRODUCING = "1";
        final static String CLOSE = "2";
        final static String CANCEL = "9";
    }

    public static class WorkOrderDurationStatus {
        final static String WAIT_PRODUCE = "0";
        final static String PRODUCING = "1";
        final static String CLOSE = "2";
        final static String CANCEL = "9";
    }

    public static class MaterialItemStatus {
        final static String STOCK = "0";
        final static String SHIPPING_NO_GET_MATERIAL = "1";
        final static String MATERIAL_STAND_BY = "2";
        final static String ON_NACHINE = "3";
        final static String RESTORING = "7";
        final static String STOCK_RUN_OUT = "8";
        final static String SCRAPPED_MATERIAL_SHIPPING = "9";
    }

    public static class PstoringId {
        final static String A_H = "G_PL401()";
        final static String A_L = "G_PL402()";
        final static String B_H = "G_PL403()";
        final static String B_L = "G_PL404()";
        final static String C_H = "G_PL405()";
        final static String C_L = "G_PL406()";

    }

}
