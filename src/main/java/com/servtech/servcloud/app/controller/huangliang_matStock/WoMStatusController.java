package com.servtech.servcloud.app.controller.huangliang_matStock;

import com.servtech.hippopotamus.Atom;
import com.servtech.servcloud.app.controller.huangliang_matStock.util.RecordAfter;
import com.servtech.servcloud.app.model.huangliang.QualityExamData;
import com.servtech.servcloud.app.model.huangliang_matStock.*;
import com.servtech.servcloud.app.model.huangliang_matStock.view.WoMStatusWoList;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.javalite.activejdbc.Base;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/huangliangMatStock/wo_m_status")
public class WoMStatusController {

    @Autowired
    private HttpServletRequest request;
    private final org.slf4j.Logger logger = LoggerFactory.getLogger(WoMStatusController.class);
    private static final String LOCK = new String();

    // 新增一筆 生產指令機台派工 資料
    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                Long now = System.currentTimeMillis();
                data.put("wo_m_time", new java.sql.Timestamp(now));

                if (data.get("m_qty") != null) {
                    // 拿到 生產指令 目前狀態
                    Map<String, Object> wo = WoList.findFirst("order_id=?", data.get("order_id")).toMap();

                    // 更新派工單數(目前派工總數 + 新增的派工總數)
                    wo.put("wo_mqty", Double.parseDouble(wo.get("wo_mqty").toString()) + Double.parseDouble(data.get("m_qty").toString()));
                    if (Integer.parseInt(wo.get("wo_status").toString()) == 0) { // 如果 生產指令 狀態是0的話，就將狀態改成1(派工待生產)
                        wo.put("wo_status", 1);
                    }
                    WoList woList = new WoList().fromMap(wo);
                    woList.saveIt();
                }

                // 計算預計完工日
                Integer minutes = 0;
                if (data.get("m_qty") != null && data.get("m_ptime") != null) {
                    double qty = Double.parseDouble(data.get("m_qty").toString());
                    double time = Double.parseDouble(data.get("m_ptime").toString());
                    minutes = (int) Math.ceil(qty * time / (60 * 60));
                }
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                Calendar calendar = Calendar.getInstance();
                try {
                    calendar.setTime(sdf.parse(data.get("exp_mdate").toString()));
                    calendar.add(Calendar.MINUTE, minutes);
                    data.put("exp_edate", sdf.format(calendar.getTime()));
                } catch (java.text.ParseException e) {
                    System.out.println("預計生產日轉換失敗");
                }

                // 更新 生產指令機台派工
                RecordAfter.putCreateAndModify(data, login_user, System.currentTimeMillis());
                WoMStatus woMStatus = new WoMStatus().fromMap(data);
                woMStatus.insert();

                // 拿到 生產指令機台派工 和 生產指令 目前的狀態
                Map<String, Object> status = WoMStatusWoList.findFirst("order_id=? AND machine_id=? AND wo_m_time=?", data.get("order_id"), data.get("machine_id"), new java.sql.Timestamp(now)).toMap();
                return RequestResult.success(status);
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    // 透過訂單編號order_id找到 管編生產條件設定
    @RequestMapping(method = RequestMethod.GET)
    public RequestResult<?> read(@RequestParam("order_id") final String orderId) {
        try {
            return ActiveJdbc.operTx(() -> {
                // 拿到 生產指令 中的此order_id資料
                Map<String, Object> woList = WoList.findFirst("order_id=?", orderId).toMap();

                Map<String, Object> data = new HashMap<>();
                data.put("order_id", orderId);
                data.put("product_id", woList.get("product_id"));
                data.put("wo_pqty", woList.get("wo_pqty")); // 生產總數
                data.put("wo_mqty", woList.get("wo_mqty")); // 派工總數

                // 透過查出的管編編號找到 管編生產條件設定
                List<Map<String, Object>> productProfilesList = new ArrayList<>();
                List<ProductProfile> productProfiless = ProductProfile.find("product_id=?", woList.get("product_id"));
                for (int i = 0; i < productProfiless.size(); i++) {
                    productProfilesList.add(productProfiless.get(i).toMap());
                }

                data.put("profiles", productProfilesList);
                return RequestResult.success(data);
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    // 更新資料
    @RequestMapping(method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                Long now = System.currentTimeMillis();

                Double w_m_status = 0.0;
                if (data.get("w_m_status") != null)
                    w_m_status = Double.parseDouble(data.get("w_m_status").toString());

                // 拿到 生產指令機台派工 目前的狀態
                Map<String, Object> status = WoMStatus.findFirst("order_id=? AND machine_id=? AND wo_m_time=?",
                        data.get("order_id"), data.get("machine_id"), data.get("wo_m_time")).toMap();

                // 如果是結案要更新 生產指令機台派工 的實際完工日
                if (w_m_status == 9.0) {
                    Date today = new Date(System.currentTimeMillis());
                    data.put("act_edate", today);
                }

                // 更新 生產指令機台派工
                RecordAfter.putModify(data, login_user, now);
                WoMStatus woMStatus = new WoMStatus().fromMap(data);
                woMStatus.saveIt();

                if (data.get("m_qty") != null || (data.get("w_m_status") != null && w_m_status == 99.0)) {
                    // 拿到 生產指令 目前狀態
                    Map<String, Object> wo = WoList.findFirst("order_id=?", data.get("order_id")).toMap();

                    Double sub = 0.0;
                    if (data.get("m_qty") != null) {
                        // 計算 生產指令機台派工 的變動差值
                        sub = Double.parseDouble(data.get("m_qty").toString()) - Double.parseDouble(status.get("m_qty").toString());
                    }

                    // 狀態改成「取消」時
                    if (data.get("w_m_status") != null && w_m_status == 99.0) {
                        sub = 0.0 - Double.parseDouble(status.get("m_qty").toString());

                        // 判斷是否在 生產指令機台派工 中的所有這個生產指令的狀態都為99，若皆為99就把 生產指令 的狀態改成0(開立)
                        List<Map> maxCount = Base.findAll("SELECT COUNT(*) as count FROM a_huangliang_wo_m_status WHERE order_id=? AND w_m_status <> 99", data.get("order_id"));
                        long count = Long.parseLong(maxCount.get(0).get("count").toString());
                        if (count == 0) {
                            wo.put("wo_status", 0);
                        }
                    }

                    // 更新派工單數(目前派工總數 + 生產指令機台派工 的變動差值)
                    wo.put("wo_mqty", Double.parseDouble(wo.get("wo_mqty").toString()) + sub);
                    WoList woList = new WoList().fromMap(wo);
                    woList.saveIt();
                }

                // 狀態改成「取消」時，更新 機台材料派工 和 機台材料派工儲位明細
                if (data.get("w_m_status") != null && (w_m_status == 99.0 || w_m_status == 9.0)) {
                    // 拿到 機台材料派工
                    List<Map> mats = WoMMat.find("order_id=? AND machine_id=? AND wo_m_time=? AND m_mat_status=0",
                            data.get("order_id"), data.get("machine_id"), data.get("wo_m_time")).toMaps();
                    for (Map mat : mats) {
                        // 更新 機台材料派工 材料派工狀態
                        mat.put("m_mat_status", 99);
                        RecordAfter.putModify(mat, login_user, now);
                        WoMMat woMMat = new WoMMat().fromMap(mat);
                        woMMat.saveIt();

                        // 拿到 機台材料派工明細
                        List<Map> matLists = WoMMatList.find("order_id=? AND machine_id=? AND wo_m_time=? AND m_mat_time=?",
                                data.get("order_id"), data.get("machine_id"), data.get("wo_m_time"), mat.get("m_mat_time")).toMaps();
                        for (Map matList : matLists) {
                            if (Double.parseDouble(matList.get("item_status").toString()) == 0) {
                                // 更新 機台材料派工明細 項目狀態
                                matList.put("item_status", 99);
                                RecordAfter.putModify(matList, login_user, now);
                                WoMMatList woMMatList = new WoMMatList().fromMap(matList);
                                woMMatList.saveIt();

                                // 更新 庫存表 的派工數量鎖定和派工支數鎖定
                                Map<String, Object> stock = MatStock.findFirst("mat_code=? AND shelf_time=?",
                                        matList.get("mat_code"), matList.get("shelf_time")).toMap();
                                RecordAfter.putModify(stock, login_user, now);
                                Double lock = 0.0;
                                Double use = 0.0;
                                if (stock.get("lock_qty") != null)
                                    lock = Double.parseDouble(stock.get("lock_qty").toString());
                                if (matList.get("use_qty") != null) {
                                    lock = lock - Double.parseDouble(matList.get("use_qty").toString());
                                    if (lock < 0) lock = 0.0;
                                }
                                if (stock.get("lock_piece") != null)
                                    use = Double.parseDouble(stock.get("lock_piece").toString());
                                if (matList.get("use_piece") != null) {
                                    use = use - Double.parseDouble(matList.get("use_piece").toString());
                                    if (use < 0) use = 0.0;
                                }
                                stock.put("lock_qty", lock);
                                stock.put("lock_piece", use);
                                MatStock matStock = new MatStock().fromMap(stock);
                                matStock.saveIt();
                            }
                        }
                    }
                }

                // 拿到 生產指令機台派工 和 生產指令 更新後的狀態
                Map<String, Object> updatedStatus = WoMStatusWoList.findFirst("order_id=? AND machine_id=? AND wo_m_time=?",
                        data.get("order_id"), data.get("machine_id"), data.get("wo_m_time")).toMap();
                return RequestResult.success(updatedStatus);
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    @RequestMapping(value = "/checkAndUpdate", method = RequestMethod.PUT)
    public RequestResult<?> checkAndUpdate(@RequestBody final Map<String, Object> map) {
        return ActiveJdbc.operTx(() -> {
            try {
                List<Map<String, String>> dataList = (List<Map<String, String>>) map.get("data");
                String machine_id = map.get("machine_id").toString();
                for (Map<String, String> data : dataList) {
                    String macro522 = data.get("macro522");
                    String order_id = "";
                    logger.info("Data Form Zebra## machine_id : " + machine_id + "| macro522 : " + data.get("macro522") + "| order_id : " + data.get("order_id") + "| pg_seq : " + data.get("pg_seq") + "| process : " + data.get("process") + "| mstock_name : " + data.get("mstock_name"));
                    String HUL_order_id = data.get("order_id");
                    if (!HUL_order_id.equals("")) {
                        StringBuffer DB_order_id = new StringBuffer();
                        DB_order_id.append(HUL_order_id.substring(0, 1));
                        DB_order_id.append("M");
                        //M90902.025
                        String ordYearStr = HUL_order_id.substring(1, 2);
                        int ordYear = Integer.valueOf(ordYearStr);
                        if (ordYear >= 5) {
                            DB_order_id.append("1");
                        } else {
                            DB_order_id.append("2");
                        }
                        DB_order_id.append(HUL_order_id.substring(1, HUL_order_id.length() - 4));
                        DB_order_id.append(HUL_order_id.substring(HUL_order_id.length() - 3, HUL_order_id.length()));
                        order_id = DB_order_id.toString();
                    }

                    String pg_seq = data.get("pg_seq");
                    String process = data.get("process").equals("") ? "N" : data.get("process");
                    String mstock_name = data.get("mstock_name").equals("G") ? "GOLF" : "五金";
                    logger.info("macro522 : " + macro522 + "| order_id : " + order_id + "| pg_seq : " + pg_seq + "| process : " + data.get("process") + "| mstock_name : " + data.get("mstock_name"));
                    WoList woList = WoList.findFirst("order_id = ?", order_id);
                    if (woList != null) {
                        String product_id = woList.getString("product_id");
                        ProductProfile productProfile = ProductProfile.findFirst("mstock_name = ? and product_id = ?", mstock_name, product_id);
                        if (productProfile != null) {
                            productProfile.set("process", process.equals("N") ? "走刀" : "走心");
                            productProfile.saveIt();
                        }
                    }
                    if (!order_id.equals("")) {
                        checkWoMStatusFunWithOrderId(machine_id, macro522, pg_seq, order_id ,data.get("timestamp"));
                        updateWoListQtyFunWithOrderId(machine_id, pg_seq, order_id);
                        checkWoListFunWithOrderId(machine_id, order_id);
                        releaseBindFunWithOrderId(machine_id, order_id);
                    }
                }
                return RequestResult.success();
            } catch (Exception e) {
                StringWriter sw = new StringWriter();
                e.printStackTrace(new PrintWriter(sw));
                logger.info("Error : " + sw.toString());
                return RequestResult.fail("Error Massage : " + e.getMessage());
            }
        });
    }

    private void checkWoMStatusFunWithOrderId(String machine_id, String macro522, String pg_seq, String order_id , String timestamp) throws Exception {
        if (macro522.equals("100")) {
            //更新**生產指令(wo_list)**狀態為派工待生產(1)的生產指令狀態為生產中(2)
            WoList.update("wo_status = 2", "order_id = ? and wo_status = 1", order_id);

            List<WoMStatus> woMStatusList = WoMStatus.find("machine_id = ? and pg_seq = ? and order_id = ? and w_m_status = '1' order by wo_m_time DESC limit 1", machine_id, pg_seq, order_id);

            //若同order_id, mac_id, program_seq的**機台派工(wo_m_status)**中沒有狀態為生產中(1)的紀錄
            if (woMStatusList == null || woMStatusList.size() == 0) {
//                Date now = new Date(System.currentTimeMillis());
                WoMStatus woMStatus = WoMStatus.findFirst("order_id = ? and machine_id = ? and pg_seq = ? and w_m_status = 0 order by wo_m_time ASC", order_id ,machine_id, pg_seq);
                if (woMStatus != null) {
                    String wo_m_time = woMStatus.getString("wo_m_time");
                    SimpleDateFormat ymd = new SimpleDateFormat("yyyyMMddHHmmss");
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    //則更新同製程順序、派工時間最早且狀態為開立(0)的機台派工狀態為生產中(1), 實際生產日為macro 為100的當下時間
                    WoMStatus.update("w_m_status = 1 , act_mdate = ? ", "order_id = ? and machine_id = ? and pg_seq = ? and w_m_status = 0 and wo_m_time = ?", sdf.format(ymd.parse(timestamp)), order_id, machine_id, pg_seq, wo_m_time);
                }
            }
        } else if (macro522.equals("103")) {
//            logger.info(machine_id + " marco 103 start cal..pg_seq is " + pg_seq);
            WoMStatus woMStatus = WoMStatus.findFirst("machine_id = ? and w_m_status = '1' and order_id = ? order by wo_m_time DESC", machine_id, order_id);
            if (woMStatus != null) {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                String act_mdate_str = woMStatus.getString("act_mdate");
                int m_qty = woMStatus.getInteger("m_qty") == null ? 0 : woMStatus.getInteger("m_qty");
                Date act_mdate = sdf.parse(act_mdate_str);
                Date now = new Date(System.currentTimeMillis());
                String now_str = sdf.format(now);
                int last = 0;
                if (order_id.substring(order_id.length() - 1, order_id.length()).equals("0")) {
                    last = 1;
                    if (order_id.substring(order_id.length() - 2, order_id.length() - 1).equals("0")) {
                        last = 2;
                    }
                }
                //ex MM191003002 改成 M91003.002
                String hippoOrderId = order_id.substring(0, 1) + order_id.substring(3, order_id.length() - 3) + "." + order_id.substring(order_id.length() - 3, order_id.length() - last);

//                logger.info("hippoOrderId = " + hippoOrderId);
                //查詢space HUL_jia_people_product
                List<Map<String, Atom>> mapData = HippoService.getInstance().newSimpleExhaler().space("HUL_jia_people_product")
                        .index("order_id", new String[]{hippoOrderId})
                        .columns("date")
                        .columns("machine_id")
                        .columns("order_id")
                        .columns("multi_process")
                        .columns("care_partcount")
                        .exhale().get().toMapping();
                SimpleDateFormat sdfAtom = new SimpleDateFormat("yyyyMMddhhmmss");

                Long pqty = 0L;
                if (mapData != null && mapData.size() != 0) {
                    //生產數: 過濾特定機台後加總顆數
                    for (Map<String, Atom> map : mapData) {
//                        logger.info("Hippo Log＃machine_id : " + map.get("machine_id").asString() + " vs " + machine_id + " | " + "order_id : " + map.get("order_id").asString() + " vs " + hippoOrderId + " | " + "multi_process : " + map.get("multi_process").asString().substring(0, 1) + " vs " + pg_seq);
                        Date date = sdfAtom.parse(map.get("date").asString().substring(0, 14));
                        if (map.get("order_id").asString().equals(hippoOrderId)
                                && map.get("multi_process").asString().substring(0, 1).equals(pg_seq)
                                && map.get("machine_id").asString().equals(machine_id)
                                && !date.after(now)
                                && !date.before(act_mdate)) {
//                            logger.info("care_partcount = " + map.get("care_partcount").asLong());
                            pqty += map.get("care_partcount").asLong();
                        }
                    }
                }

                //不良數
                int bqty = 0;
                List<QualityExamData> qualityExamDatas = QualityExamData.find
                        ("date BETWEEN ? and ? and machine_id = ? and order_id = ? and multi_process = ? ", act_mdate_str, now_str, machine_id, order_id, pg_seq);
//                logger.info("date BETWEEN '" + act_mdate_str + "' and '" + now_str + "' and machine_id = '" + machine_id + "' and order_id = '" + order_id + "' and multi_process = '" + pg_seq + "' ");
                if (qualityExamDatas != null && qualityExamDatas.size() != 0) {
                    for (QualityExamData qualityExamData : qualityExamDatas) {
                        int examination_defective = qualityExamData.getInteger("examination_defective") == null ? 0 : qualityExamData.getInteger("examination_defective");
                        int qc_defectives = qualityExamData.getInteger("qc_defectives") == null ? 0 : qualityExamData.getInteger("qc_defectives");
//                        logger.info("examination_defective + qc_defectives = " + (examination_defective + qc_defectives));
                        bqty += examination_defective + qc_defectives;
                    }
                }
                logger.info("Final pqty = " + pqty);
                logger.info("Final bqty = " + bqty);
//                logger.info("Final m_qty = " + m_qty);
                if ((pqty - bqty) > m_qty) {
                    Date today = new Date(System.currentTimeMillis());
                    woMStatus.set("w_m_status", "9");
                    woMStatus.set("act_edate", today);
                    if (woMStatus.saveIt()) {
                        logger.info("更新 WoMStatus 的派工狀態為結案 ，實際完工日為" + today);
                    } else {
                        logger.info("更新 WoMStatus失敗，原因待查..");
                    }
                } else {
                    logger.info("生產數-不良數 不大於 派工數，不需更新..");
                }

                //若該生產指令所有機台派工皆為結案或取消(wo_m_status.w_m_status=9 or 99)且生產數-不良數 > 訂單數(wo_pqty-wo_bqty>order_qty)，則將該生產指令結案(wo_list.wo_status=9)
                List<WoMStatus> status = WoMStatus.find("order_id = ? AND ( w_m_status != 9 OR w_m_status != 99 )", order_id);
                if (status.size() == 0 || status == null) {
                    WoList woList = WoList.findFirst("order_id = ?", order_id);
                    int wo_pqty = woList.getInteger("wo_pqty") == null ? 0 : woList.getInteger("wo_pqty");
                    int wo_bqty = woList.getInteger("wo_bqty") == null ? 0 : woList.getInteger("wo_bqty");
                    int order_qty = woList.getInteger("order_qty") == null ? 0 : woList.getInteger("order_qty");
                    if ((wo_pqty - wo_bqty) > order_qty) {
                        woList.set("wo_status", "9");
                        if (woList.saveIt()) {
                            logger.info("更新 WoList 的生產指令狀態為結案");
                        } else {
                            logger.info("更新 WoList 失敗，原因待查..");
                        }
                    } else {
                        logger.info("生產數-不良數 不大於 訂單數，不需更新");
                    }
                } else {
                    logger.info("生產指令尚有機台未結案，不需更新");
                }
            } else {
                logger.info("該機台沒有派工狀態為生產中的生產指令...");
            }
        }
    }

    private void updateWoListQtyFunWithOrderId(String machine_id, String pg_seq, String order_id) throws Exception {
        List<WoMStatus> woMStatusList = WoMStatus.find("machine_id = ? and order_id =?", machine_id, order_id);
        int updateCount = 0;
        if (woMStatusList != null && woMStatusList.size() != 0) {
            for (WoMStatus woMStatus : woMStatusList) {
                //正常應只有一筆會符合，其他都是 null
                List<WoMStatus> woMStatusDatas = WoMStatus.find("machine_id = ? and order_id = ? and pg_seq = ? and w_m_status = '1' ", machine_id, order_id, pg_seq);
                logger.info("machine_id = '" + machine_id + "' and order_id = '" + order_id + "' and pg_seq = '" + pg_seq + "' and w_m_status = '1' ");
//                logger.info("woMStatusDatas.size = " + woMStatusDatas.size());
                if (woMStatusDatas != null) {
                    if (woMStatusDatas.size() != 1) {
//                        return RequestResult.success("資料數有誤，原因待查..");
                    } else {
                        WoMStatus woMStatusData = woMStatusDatas.get(0);
                        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                        SimpleDateFormat sdfAtom = new SimpleDateFormat("yyyyMMddHHmmss");
                        String act_mdate_str = woMStatusData.getString("act_mdate");    //實際生產日
                        String act_edate_str = woMStatusData.getString("act_edate") == null ? sdf.format(new Date(System.currentTimeMillis())) : woMStatusData.getString("act_edate");    //實際完工日
//                        logger.info(machine_id + " start cal..");
                        //ex MM191003002 改成 M91003.002
                        int last = 0;
                        if (order_id.substring(order_id.length() - 1, order_id.length()).equals("0")) {
                            last = 1;
                            if (order_id.substring(order_id.length() - 2, order_id.length() - 1).equals("0")) {
                                last = 2;
                            }
                        }
                        String hippoOrderId = order_id.substring(0, 1) + order_id.substring(3, order_id.length() - 3) + "." + order_id.substring(order_id.length() - 3, order_id.length() - last);
                        logger.info("hippoOrderId = " + hippoOrderId);
                        List<Map<String, Atom>> mapData = HippoService.getInstance().newSimpleExhaler().space("HUL_jia_people_product")
                                .index("order_id", new String[]{hippoOrderId})
                                .columns("date")
                                .columns("multi_process")
                                .columns("machine_id")
                                .columns("order_id")
                                .columns("care_partcount")
                                .exhale().get().toMapping();
//                        logger.info("Hippo Size = " + mapData.size());
                        //已生產數量
                        Long care_partcount = 0L;
                        if (mapData != null && mapData.size() != 0) {
                            for (Map<String, Atom> map : mapData) {
//                                logger.info("Hippo Log＃＃machine_id : " + map.get("machine_id").asString() + " vs " + machine_id + " | " + "order_id : " + map.get("order_id").asString() + " vs " + hippoOrderId + " | " + "multi_process : " + map.get("multi_process").asString().substring(0, 1) + " vs " + pg_seq + " | " + "date1 : " + sdfAtom.parse(map.get("date").asString().substring(0, 14)) + " vs " + act_edate_str);
                                if (map.get("machine_id").asString().equals(machine_id)
                                        && map.get("order_id").asString().equals(hippoOrderId)
                                        && map.get("multi_process").asString().substring(0, 1).equals(pg_seq)
                                        && !sdfAtom.parse(map.get("date").asString().substring(0, 14)).after(sdf.parse(act_edate_str))
                                        && !sdfAtom.parse(map.get("date").asString().substring(0, 14)).before(sdf.parse(act_mdate_str))) {
//                                    logger.info("care_partcount = " + map.get("care_partcount").asLong());
                                    care_partcount += map.get("care_partcount").asLong();
                                }
                            }
                        }
                        int m_pqty = care_partcount.intValue();
                        logger.info("已生產總數 = " + m_pqty);
                        //不良數
                        int bad_qty = 0;
                        List<QualityExamData> qualityExamDatas = QualityExamData.find
                                ("date BETWEEN ? and ? and machine_id = ? and order_id = ? and multi_process = ? ", act_mdate_str, act_edate_str, machine_id, order_id, pg_seq);
//                        logger.info("date BETWEEN '" + act_mdate_str + "' and '" + act_edate_str + "' and machine_id = '" + machine_id + "' and order_id = '" + order_id + "' and multi_process = '" + pg_seq + "' ");
                        if (qualityExamDatas != null && qualityExamDatas.size() != 0) {
                            for (QualityExamData qualityExamData : qualityExamDatas) {
                                int examination_defective = qualityExamData.getInteger("examination_defective") == null ? 0 : qualityExamData.getInteger("examination_defective");
                                int qc_defectives = qualityExamData.getInteger("qc_defectives") == null ? 0 : qualityExamData.getInteger("qc_defectives");
                                bad_qty += examination_defective + qc_defectives;
                            }
                        }
                        int m_bqty = bad_qty;
                        logger.info("不良總數 = " + m_bqty);

                        woMStatusData.set("m_pqty", m_pqty,
                                "m_bqty", m_bqty,
                                "modify_by", "AdjustProductInstruction",
                                "modify_time", sdf.format(new Date(System.currentTimeMillis())));
                        if (woMStatusData.saveIt()) {
                            logger.info("生產指令機台派工更新 m_pqty為" + m_pqty + "與m_bqty為" + m_bqty + "成功");
                        } else {
                            logger.info("生產指令機台派工更新 m_pqty為" + m_pqty + "與m_bqty為" + m_bqty + "失敗");
                            throw new RuntimeException();
                        }
                        String sql = "SELECT SUM(a.m_bqty) as m_bqty , SUM(a.m_pqty) as m_pqty FROM (SELECT * FROM a_huangliang_wo_m_status ORDER BY wo_m_time DESC) a WHERE a.order_id = '" + order_id + "'";

                        Map result = Base.findAll(sql).get(0);
                        //不良總數(wo_bqty): 加總該生產指令各機台派工記錄-不良數(wo_m_status.m_bqty)
                        int total_m_bqty = Integer.valueOf(result.get("m_bqty").toString());
                        //生產總數(wo_pqty): 加總該生產指令各機台派工記錄-已生產數量(wo_m_status.m_pqty)
                        int total_m_pqty = Integer.valueOf(result.get("m_pqty").toString());
                        int count = WoList.update("wo_pqty= ? , wo_bqty = ?", "order_id = ?", total_m_pqty, total_m_bqty, order_id);
                        updateCount += count;
                        if (count == 1) {
                            logger.info("生產指令 : " + order_id + " 更新 生產總數為" + total_m_pqty + " 不良總數為" + total_m_bqty + "成功");
                        } else {
                            logger.info("生產指令 : " + order_id + " 更新生產總數與不良總數失敗 原因待查..");
                        }

                    }
                }
            }
        }
        System.out.println("Update count is " + updateCount);
    }

    private void checkWoListFunWithOrderId(String machine_id, String order_id) throws Exception {
        List<WoMStatus> woMStatuss = WoMStatus.find("machine_id = ? AND w_m_status = '9' and order_id = ?", machine_id, order_id);
//        logger.info("woMStatuss size is " + woMStatuss.size());
        if (woMStatuss != null && woMStatuss.size() != 0) {
            for (WoMStatus woMStatus : woMStatuss) {
                //查狀態為生產中(2)的生產指令
                WoList woList = WoList.findFirst("order_id = ? AND wo_status = 2 ", order_id);
                //只會有 1筆 或 0筆
                if (woList != null) {
                    int wo_pqty = woList.getInteger("wo_pqty") == null ? 0 : woList.getInteger("wo_pqty");
                    int wo_bqty = woList.getInteger("wo_bqty") == null ? 0 : woList.getInteger("wo_bqty");
                    int order_qty = woList.getInteger("order_qty") == null ? 0 : woList.getInteger("order_qty");

                    //是否符合結案條件檢查 ---> 良品數（生產數-不良數）＞訂單數(order_qty)
                    if ((wo_pqty - wo_bqty) >= order_qty) {
                        List<WoMStatus> machDatas = WoMStatus.find("machine_id = ? and order_id = ? and w_m_status != '9'", machine_id, order_id);

                        if (machDatas == null || machDatas.size() == 0) {
                            //將未結案的更新為結案
                            woList.set("wo_status", "9");
                            if (woList.saveIt()) {
                                logger.info("生產指令 : " + order_id + " 良品數 : " + (wo_pqty - wo_bqty) + " > 訂單數 : " + order_qty + " 更新狀態為 結案 成功");
                            } else {
                                logger.info("更新失敗，原因待查");
                            }
                        } else {
                            logger.info("有機台未結案 未達到更新條件");
                        }
                    } else {
                        logger.info("良品數（生產數-不良數）未大於 訂單數(order_qty) 未達到更新條件");
                    }
                }
            }
        }
    }

    private void releaseBindFunWithOrderId(String machine_id, String order_id) throws Exception {
        List<WoMStatus> woMStatuss = WoMStatus.find("machine_id = ? and order_id = ?", machine_id, order_id);
//        logger.info("woMStatuss size is " + woMStatuss.size());
        if (woMStatuss != null && woMStatuss.size() != 0) {
            for (WoMStatus woMStatus : woMStatuss) {
                //檢查機台派工紀錄(WO_M_status)，同一生產指令內所有機台派工記錄狀態為結案
                List<WoMStatus> machines = WoMStatus.find("order_id = ? AND w_m_status != 9", order_id);

                //確定狀態無未結案
                if (machines == null || machines.size() == 0) {

                    //更新綁定狀態為解除綁定(WO_PO_binding.W_P_status=0)
                    int updateCount = WoPoBinding.update("w_p_status = 0", "order_id = ? AND w_p_status != 0", order_id);
//                    logger.info("Update WoPoBinding Count is " + updateCount);
                    List<WoPoBinding> woPoBinds = WoPoBinding.find("order_id = ?", order_id);

                    if (woPoBinds != null && woPoBinds.size() != 0) {
                        for (WoPoBinding woPoBind : woPoBinds) {
                            Double use_qty = woPoBind.getDouble("use_qty") == null ? 0.0 : woPoBind.getDouble("use_qty");
                            Double bind_qty = woPoBind.getDouble("bind_qty") == null ? 0.0 : woPoBind.getDouble("bind_qty");
//                            logger.info("已領數量 : " + use_qty);
//                            logger.info("綁定數量 : " + bind_qty);
//                            logger.info("已領數量<綁定數量 : " + (use_qty < bind_qty));
                            // 已領數量<綁定數量
                            if (use_qty < bind_qty) {

                                //更新 WoPoBinding 的綁定數量
                                woPoBind.set("bind_qty", use_qty);
                                if (woPoBind.saveIt()) {
                                    logger.info("Updata WoPoBinding.bind_qty to " + use_qty + " Success !");
                                } else {
                                    logger.info("Updata WoPoBinding.bind_qty fail !");
                                }

                                String mstock_name = woPoBind.getString("mstock_name");
                                String po_no = woPoBind.getString("po_no");
                                String sup_id = woPoBind.getString("sup_id");
                                String mat_code = woPoBind.getString("mat_code");

                                List<PoFile> poFiles = PoFile.find(" mstock_name = ? AND po_no = ? AND sup_id = ? AND mat_code = ?", mstock_name, po_no, sup_id, mat_code);

                                if (poFiles != null && poFiles.size() != 0) {
                                    for (PoFile poFile : poFiles) {
                                        Double po_file_bind_qty = poFile.getDouble("bind_qty") == null ? 0.0 : poFile.getDouble("bind_qty");
                                        //採購單綁定總數=採購單綁定總數-(綁定數量-已領數量)
                                        po_file_bind_qty = po_file_bind_qty - (bind_qty - use_qty);
                                        poFile.set("bind_qty", po_file_bind_qty);
                                        if (poFile.saveIt()) {
                                            logger.info("更新 PoFile 的綁定總數為" + po_file_bind_qty);
                                        } else {
                                            logger.info("更新 PoFile 的綁定總數 失敗，原因待查..");
                                        }
                                        Double po_qty = poFile.getDouble("po_qty") == null ? 0.0 : poFile.getDouble("po_qty");
                                        if ((po_file_bind_qty - po_qty) == 0) {
                                            poFile.set("po_status", "1");
                                            if (poFile.saveIt()) {
                                                logger.info("更新 PoFile 的綁定狀態為不可綁定");
                                            } else {
                                                logger.info("更新 PoFile 的綁定狀態 失敗，原因待查..");
                                            }
                                        } else {
                                            logger.info("採購數量 不等於 綁定數量 ，狀態不需更新");
                                        }
                                    }
                                }
                            } else {
                                logger.info("已領數量 沒有小於 綁定數量 ，不需更新");
                            }
                        }
                    }

                } else {
                    logger.info("生產指令 : " + order_id + "有機台狀態未結案，未達到更新條件");
                }
            }
        }
    }
}
