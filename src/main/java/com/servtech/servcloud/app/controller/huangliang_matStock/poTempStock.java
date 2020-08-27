package com.servtech.servcloud.app.controller.huangliang_matStock;

import com.google.gson.Gson;
import com.servtech.servcloud.app.controller.huangliang_matStock.util.WeightPieceConverter;
import com.servtech.servcloud.app.model.huangliang_matStock.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.exception.JsonParamsException;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.mail.MailManager;
import com.servtech.servcloud.core.mail.modules.ConfigData;
import com.servtech.servcloud.core.mail.modules.DataTemplate;
import com.servtech.servcloud.core.mqtt.MQTTManager;
import com.servtech.servcloud.core.util.JsonParams;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.SysUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by Eric Peng on 2018/10/26.
 */
@RestController
@RequestMapping("/huangliangMatStock/poTempStock")
public class poTempStock {
    private static final Logger log = LoggerFactory.getLogger(poTempStock.class);
    private static final String SERVER_IP = "http://220.133.118.197:58080";
    private boolean isMailConfig = getMailConfig();
    private String account;
    private String password;
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    SimpleDateFormat sdfDay = new SimpleDateFormat("yyyy-MM-dd");

    @Autowired
    private HttpServletRequest request;

    private MailManager mailManager = new MailManager();
    private Gson gson = new Gson();

    @RequestMapping(value = "delayAlarm", method = RequestMethod.GET)
    public RequestResult<?> delayAlarm(@RequestParam final String startTime, @RequestParam final String endTime) {
        List<Map> tempStocks = ActiveJdbc.operTx(new Operation<List<Map>>() {
            @Override
            public List<Map> operate() {
                // String startTime = "";
                // String endTime = "";
                String sql = String.format("SELECT * FROM a_huangliang_po_temp_stock as ts where "
                        + "ts.`status`=1 and ts.shelf_qc_notice='Y' and ts.iqc_delay_notice='N' "
                        + "and (shelf_time BETWEEN '%s' AND '%s')", startTime, endTime);
                log.info("SQL: " + sql);
                List<Map> tempStocks = PoTempStock.findBySQL(sql).toMaps();
                log.info("Query Size: " + tempStocks.size());
                return tempStocks;
            }
        });

        for (Map map : tempStocks) {
            ConfigData configData = new ConfigData(account, password,
                    getGroupUserEmail("material_stock_quality_control_manager"),
                    String.format("採購單號(%s)已延遲驗料，請主管派人前往進行驗料", map.get("po_no")),
                    System.getProperty(SysPropKey.ROOT_PATH) + "/program/template/default_template_2line.html");
            if (!isMailConfig) {
                return RequestResult.fail("email config fail");
            }
            DataTemplate dataTemplate = new DataTemplate();
            dataTemplate.replaceMap.put("herf",
                    SERVER_IP + "/ServCloud/index.html?appId=HuangLiangMaterialTempStock&funcId=10_pending_iqc"
                            + "#app/HuangLiangMaterialTempStock/function/zh_tw/10_pending_iqc.html");
            dataTemplate.replaceMap.put("alarm_str", "");
            dataTemplate.replaceMap.put("small_tiitle", "材料暫入通知-詳細資料");
            List<Map<String, String>> list = new ArrayList<>();
            dataTemplate.arrMap.put("arr", list);
            list.add(buildMap(
                    new String[]{"arr1", "上架日期", "arr2", getCleanTimestamp(map.get("shelf_time").toString())}));
            list.add(buildMap(new String[]{"arr1", "材料庫", "arr2", map.get("mstock_name").toString()}));
            list.add(buildMap(new String[]{"arr1", "採購單號", "arr2", map.get("po_no").toString()}));
            list.add(buildMap(new String[]{"arr1", "廠商", "arr2", map.get("sup_id").toString()}));
            list.add(buildMap(new String[]{"arr1", "材料條碼", "arr2", map.get("mat_code").toString()}));
            list.add(buildMap(new String[]{"arr1", "材料長度", "arr2", map.get("mat_length").toString()}));
            list.add(buildMap(new String[]{"arr1", "上漆顏色", "arr2", map.get("mat_color").toString()}));
            list.add(buildMap(new String[]{"arr1", "數量", "arr2", map.get("shelf_qty").toString()}));
            list.add(buildMap(new String[]{"arr1", "單位", "arr2", map.get("unit").toString()}));
            list.add(buildMap(new String[]{"arr1", "上架位置", "arr2", map.get("location").toString()}));
            list.add(buildMap(new String[]{"arr1", "操作人員", "arr2", map.get("shelf_by").toString()}));

            if (mailManager.sendMail(dataTemplate, configData)) {
                ActiveJdbc.operTx(new Operation<Void>() {
                    @Override
                    public Void operate() {
                        PoTempStock poTempStock = PoTempStock.findByCompositeKeys(map.get("mstock_name"),
                                map.get("po_no"), map.get("sup_id"), map.get("mat_code"), map.get("location"),
                                map.get("shelf_time"));
                        poTempStock.set("iqc_delay_notice", "Y");
                        poTempStock.saveIt();
                        return null;
                    }
                });
            }
        }
        return RequestResult.success();
    }

    // 暫入上架
    @RequestMapping(value = "temporaryStorage", method = RequestMethod.POST)
    public RequestResult<?> temporaryStorage(@RequestBody Map data) {
        log.info(data.toString());
        data.put("status", 1); // 待驗料
        if (data.containsKey("mstock_name") && data.containsKey("po_no") && data.containsKey("sup_id")
                && data.containsKey("mat_code") && data.containsKey("po_qty") && data.containsKey("mat_id")
                && data.containsKey("mat_length") && data.containsKey("mat_od") && data.containsKey("mat_color")
                && data.containsKey("modify_by") && data.containsKey("shelf_piece") && data.containsKey("shelf_qty")
                && data.containsKey("unit") && data.containsKey("location") && data.containsKey("area")
                && data.containsKey("shelf_time") && data.containsKey("shelf_by")) {
            String acceptMail = getGroupUserEmail("material_stock_production_management");
            return ActiveJdbc.operTx(() -> {
                // 支數重量轉換
                Double qty = 0.0; // 塑膠: 支, 金屬: 總重
                String matCode = data.get("mat_code").toString();
                WeightPieceConverter converter = new WeightPieceConverter(matCode);
                String shape = converter.getShape(); // 形狀
                double piece = Double.parseDouble(data.get("shelf_piece").toString());
                double len = Double.parseDouble(data.get("mat_length").toString().replaceAll("m", "").replaceAll("M", ""));
                if (len == 0.0) {
                    return RequestResult.fail("mat_length should not be zero.");
                } else if (piece == 0.0 && data.get("shelf_qty").toString().equals("0")) {
                    return RequestResult.fail("shelf_piece and shelf_qty should not both be zero.");
                }

                if (!converter.isMetal) { // 塑膠
                    // mantis: 2106 由於一期有許多項目以PO_TEMP_STOCK.shelf_qty計算，因此二期修改上架方式
                    // 塑膠類材料上架數值填入shelf_piece時, 以該數字同步寫入shelft_qty
                    qty = Double.parseDouble(data.get("shelf_piece").toString());
                    data.put("shelf_qty", data.get("shelf_piece"));
                } else { // 金屬
                    qty = Double.parseDouble(data.get("shelf_qty").toString());
                    if (shape.equals("C") || shape.equals("H") || shape.equals("S")) { // C/H/S
                        double pieceWeight = 0;
                        try {
                            pieceWeight = converter.unitWeight(len);
                        } catch (Exception e) {
                            e.printStackTrace();
                            log.error(e.getMessage());
                            return RequestResult.fail(e.getMessage());
                        }

                        if (pieceWeight == 0) {
                            return RequestResult.fail("p_weight should not be 0.");
                        }

                        data.put("p_weight", pieceWeight);
                        data.put("shelf_piece", Math.floor(qty / pieceWeight));
                    } else if (data.containsKey("p_weight")) { // P/X/L
                        // 暫上架支數=暫上架數量/單支重量，暫上架支數計算後需取整數，小數位無條件捨去
                        double pieceWeight = Double.parseDouble(data.get("p_weight").toString());
                        data.put("shelf_piece", Math.floor(qty / pieceWeight));
                    } else  {
                        return RequestResult.fail("None of unit equals to '支', has p_weight or shape equals to C/H/S is true.");
                    }
                }

                // 新增材料單價：取該材料編碼、廠商編碼最新一筆成本單價寫入材料單價，如無廠商編成本單價，則取該材料編碼的最高單價
                String matId = converter.getMatId();
                try {
                    MatPriceList theMatPrice = MatPriceList.findByCompositeKeys(matId, data.get("sup_id").toString());
                    MatPriceList highestMatPrices = MatPriceList.findFirst("mat_id=? order by mat_price desc", matId);
                    if (theMatPrice == null && highestMatPrices == null) {
                        return RequestResult.fail("此材料編碼未維護成本單價，請生管協助維護"); // 此材料編碼未維護成本單價，請生管協助維護
                    } else if (theMatPrice != null) {
                        data.put("mat_price", theMatPrice.get("mat_price").toString());
                        data.put("mat_price_ref_sup_id", theMatPrice.get("sup_id").toString());
                        data.put("mat_price_ref_date", theMatPrice.get("modify_time").toString().substring(0, 19));
                    } else {
                        data.put("mat_price", highestMatPrices.get("mat_price").toString());
                        data.put("mat_price_ref_sup_id", highestMatPrices.get("sup_id").toString());
                        data.put("mat_price_ref_date", highestMatPrices.get("modify_time").toString().substring(0, 19));
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    log.error(e.getMessage());
                    return RequestResult.fail("新增材料單價失敗，缺少單價、供應商或建立日期");
                }

                // 將暫入的數量累加到採購單的已暫入上架數量中
                PoTempStock poTempStock = new PoTempStock();
                poTempStock.fromMap(data);
                int poFileCount = 0;
                if (poTempStock.insert()) {
                    poFileCount = PoFile.update("shelf_qty=shelf_qty+?, modify_by=?, modify_time=?",
                            "mstock_name=? and po_no=? and sup_id=? and mat_code=?",
                            data.get("shelf_qty"), data.get("modify_by"), new Timestamp(System.currentTimeMillis()),
                            data.get("mstock_name"), data.get("po_no"), data.get("sup_id"), data.get("mat_code"));
                }

                // 發 email 通知
                if (poFileCount > 0 && isMailConfig) {
                    ConfigData configData = new ConfigData(account, password, acceptMail,
                            String.format("採購單號 %s 已入廠於 %s (位置)", data.get("po_no"), data.get("location")),
                            System.getProperty(SysPropKey.ROOT_PATH) + "/program/template/default_template_2line.html");
                    DataTemplate dataTemplate = new DataTemplate();
                    dataTemplate.replaceMap.put("herf",
                            SERVER_IP + "/ServCloud/index.html?appId=HuangLiangMaterialTempStock&funcId=10_pending_iqc"
                                    + "#app/HuangLiangMaterialTempStock/function/zh_tw/10_pending_iqc.html");
                    dataTemplate.replaceMap.put("alarm_str", "");
                    dataTemplate.replaceMap.put("small_tiitle", "材料暫入通知-詳細資料");
                    List<Map<String, String>> list = new ArrayList<>();
                    dataTemplate.arrMap.put("arr", list);
                    list.add(buildMap(new String[]{"arr1", "上架日期", "arr2", getCleanTimestamp(data.get("shelf_time").toString())}));
                    list.add(buildMap(new String[]{"arr1", "材料庫", "arr2", data.get("mstock_name").toString()}));
                    list.add(buildMap(new String[]{"arr1", "採購單號", "arr2", data.get("po_no").toString()}));
                    list.add(buildMap(new String[]{"arr1", "廠商", "arr2", data.get("sup_id").toString()}));
                    list.add(buildMap(new String[]{"arr1", "材料條碼", "arr2", data.get("mat_code").toString()}));
                    list.add(buildMap(new String[]{"arr1", "材料長度", "arr2", data.get("mat_length").toString()}));
                    list.add(buildMap(new String[]{"arr1", "上漆顏色", "arr2", data.get("mat_color").toString()}));
                    list.add(buildMap(new String[]{"arr1", "數量", "arr2", qty.toString()}));
                    list.add(buildMap(new String[]{"arr1", "單位", "arr2", data.get("unit").toString()}));
                    list.add(buildMap(new String[]{"arr1", "上架位置", "arr2", data.get("location").toString()}));
                    list.add(buildMap(new String[]{"arr1", "操作人員", "arr2", data.get("shelf_by").toString()}));

                    if (!mailManager.sendMail(dataTemplate, configData))
                        return RequestResult.fail("send email fail");

                    PoTempStock.update("shelf_pm_notice='Y', shelf_qc_notice='Y'",
                            "mstock_name=? and po_no=? and sup_id=? and mat_code=? and location=? and shelf_time=?",
                            data.get("mstock_name"), data.get("po_no"), data.get("sup_id"), data.get("mat_code"), data.get("location"), data.get("shelf_time"));

                    // 發推播通知
                    String checkAlarm;
                    String tempDate = sdfDay.format(new Date()) + " 12:00:00";
                    try {
                        if (new Date().getTime() <= sdf.parse(tempDate).getTime()) {
                            checkAlarm = "今日16:00";
                        } else {
                            checkAlarm = "明日12:00";
                        }
                        String msg = String.format("採購單號 %s 已入廠於 %s (位置), 請於 %s 前驗料完畢", data.get("po_no"), data.get("location"), checkAlarm);
                        msg = gson.toJson(new MQttObj(msg));
                        log.info(msg);
                        MQTTManager.publish(msg, "Platform_Notice");
                    } catch (ParseException e) {
                        e.printStackTrace();
                        log.error(e.getMessage());
                        return RequestResult.fail("發送推播失敗，請聯絡系統管理員。");
                    }
                    return RequestResult.success();
                } else {
                    return RequestResult.fail("暫入上架失敗，請聯絡系統管理員。");
                }
            });
        }
        return RequestResult.fail("資料缺失，請聯絡系統管理員。");
    }

    @RequestMapping(value = "testMQTT", method = RequestMethod.GET)
    public RequestResult<?> testMQTT() {
        String msg = String.format("採購單號 %s 已入廠於 %s (位置), 請於 %s 前驗料完畢", "data.get(\"po_no\")", "data.get(\"location\")",
                "checkAlarm");
        msg = gson.toJson(new MQttObj(msg));
        log.info(msg);
        MQTTManager.publish(msg, "Platform_Notice");
        return RequestResult.success("");
    }

    @RequestMapping(value = "checkPurchase", method = RequestMethod.POST)
    public RequestResult<?> checkPurchase(@RequestBody final Map data) {
        boolean isContentPK = true;
        Map<String, String> pkMap = new HashMap<>();
        pkMap.put("mstock_name", "");
        pkMap.put("po_no", "");
        pkMap.put("sup_id", "");
        pkMap.put("mat_code", "");
        pkMap.put("location", "");
        pkMap.put("shelf_time", "");

        for (Map.Entry<String, String> map : pkMap.entrySet()) {
            if (!data.containsKey(map.getKey())) {
                isContentPK = false;
            }
        }

        if (isContentPK) {
            Boolean iqc_result = true;
            String reason = data.containsKey("iqc_ng_reason") ? data.get("iqc_ng_reason").toString() : "無";
            Map isUpdate = ActiveJdbc.operTx(new Operation<Map>() {
                @Override
                public Map operate() {
                    String iqc_result_str = "OK";
                    PoTempStock poTempStock = PoTempStock.findByCompositeKeys(data.get("mstock_name"),
                            data.get("po_no"), data.get("sup_id"), data.get("mat_code"), data.get("location"),
                            data.get("shelf_time"));
                    if (poTempStock == null) {
                        return null;
                    }
                    // 帶入暫入時查到的材料單價(一定會有，因為沒有的話暫入不了，但是舊的資料沒有)
                    if (poTempStock.get("mat_price") != null) {
                        data.put("mat_price", poTempStock.get("mat_price"));
                        data.put("mat_price_ref_date", poTempStock.get("mat_price_ref_date"));
                        data.put("mat_price_ref_sup_id", poTempStock.get("mat_price_ref_sup_id"));
                    }
                    // 形狀為C、S、H依照品檢輸入值，重新計算單支重量、暫入支數
                    WeightPieceConverter converter = new WeightPieceConverter(data.get("mat_code").toString());
                    String shape = converter.getShape();
                    double length = data.containsKey("iqc_length_val")
                            && !data.get("iqc_length_val").toString().equals("")
                            ? Double.parseDouble(data.get("iqc_length_val").toString().replaceAll("m", "")
                            .replaceAll("M", ""))
                            : Double.parseDouble(poTempStock.get("mat_length").toString().replaceAll("m", "")
                            .replaceAll("M", ""));
                    if (data.containsKey("iqc_od_val") && !data.get("iqc_od_val").toString().equals("") && shape != null
                            && (shape.equals("C") || shape.equals("S") || shape.equals("H"))) {
                        converter.setOd(Double.parseDouble(data.get("iqc_od_val").toString()));
                        double pWeight = 0;
                        try {
                            pWeight = converter.unitWeight(length);
                        } catch (Exception e) {
                            log.error(e.getMessage());
                        }
                        if (pWeight == 0) {
                            return null;
                        }
                        data.put("p_weight", pWeight);
                        data.put("shelf_piece",
                                Math.floor(Double.parseDouble(poTempStock.get("shelf_qty").toString()) / pWeight));
                    }

                    log.info(data.toString());
                    // 依各項目輸入值存入暫入記錄，外徑檢驗值(iqc_od_val)、長度檢驗值(iqc_length_val)
                    for (Object str : data.keySet()) {
                        String key = str.toString();
                        if (data.get(key).toString().equals("NG")) {
                            iqc_result_str = "NG";
                        }
                        if (!pkMap.containsKey(key)) {
                            poTempStock.set(key, data.get(key));
                        }
                    }

                    poTempStock.set("iqc_result", iqc_result_str);
                    poTempStock.set("status", "2");

                    if (poTempStock.saveIt()) {
                        return poTempStock.toMap();
                    } else
                        return null;
                }
            });
            if (isUpdate == null) {
                return RequestResult.fail("update DB fail, p_weight = 0 or can not find this record");
            } else if (!isMailConfig) {
                return RequestResult.fail("mail config error");
            }
            String subject;
            if (iqc_result) {
                subject = String.format("採購單號(%s)已驗料合格，請進行確認入庫作業", data.get("po_no"));
            } else {// 驗料不合格通知生管：採購單號($單號)驗料不合格；原因：品質NG
                subject = String.format("採購單號(%s)驗料不合格；原因：%s", data.get("po_no"), reason);
            }
            ConfigData configData = new ConfigData(account, password,
                    getGroupUserEmail("material_stock_production_management"), subject,
                    System.getProperty(SysPropKey.ROOT_PATH) + "/program/template/default_template.html");
            DataTemplate dataTemplate = new DataTemplate();
            dataTemplate.replaceMap.put("herf",
                    SERVER_IP + "/ServCloud/index.html?appId=HuangLiangMaterialTempStock&funcId=20_pending_stock"
                            + "#app/HuangLiangMaterialTempStock/function/zh_tw/20_pending_stock.html");
            dataTemplate.replaceMap.put("alarm_str", "*請至網頁畫面確認是否進料");
            dataTemplate.replaceMap.put("small_tiitle", "材料暫入通知-詳細資料");
            List<Map<String, String>> list = new ArrayList<>();
            dataTemplate.arrMap.put("arr", list);
            list.add(buildMap(new String[]{"arr1", "上架日期", "arr2",
                    getCleanTimestamp(isUpdate.get("shelf_time").toString()), "arr3", ""}));
            list.add(buildMap(
                    new String[]{"arr1", "材料庫", "arr2", isUpdate.get("mstock_name").toString(), "arr3", ""}));
            list.add(buildMap(new String[]{"arr1", "採購單號", "arr2", isUpdate.get("po_no").toString(), "arr3", ""}));
            list.add(buildMap(new String[]{"arr1", "廠商", "arr2", isUpdate.get("sup_id").toString(), "arr3", ""}));
            list.add(
                    buildMap(new String[]{"arr1", "材料條碼", "arr2", isUpdate.get("mat_code").toString(), "arr3", ""}));
            list.add(buildMap(new String[]{"arr1", "材料編碼", "arr2", isUpdate.get("mat_id").toString(), "arr3",
                    data.get("iqc_mat_id").toString()}));
            list.add(buildMap(new String[]{"arr1", "材料外徑", "arr2", isUpdate.get("mat_od").toString(), "arr3",
                    data.get("iqc_od").toString()}));
            list.add(buildMap(new String[]{"arr1", "材料長度", "arr2", isUpdate.get("mat_length").toString(), "arr3",
                    data.get("iqc_length").toString(),}));
            list.add(buildMap(new String[]{"arr1", "驗料位置", "arr2", isUpdate.get("location").toString(), "arr3",
                    data.get("iqc_location").toString(),}));
            list.add(buildMap(new String[]{"arr1", "材料重量", "arr2", isUpdate.get("shelf_qty").toString() + " KG",
                    "arr3", data.get("iqc_qty").toString(),}));
            list.add(buildMap(new String[]{"arr1", "品質", "arr2", "", "arr3", data.get("iqc_quality").toString()}));

            list.add(buildMap(new String[]{"arr1", "NG原因", "arr2", iqc_result ? "" : reason, "arr3", ""}));
            list.add(
                    buildMap(new String[]{"arr1", "上架人員", "arr2", isUpdate.get("shelf_by").toString(), "arr3", ""}));
            list.add(buildMap(new String[]{"arr1", "驗料人員", "arr2", isUpdate.get("iqc_by").toString(), "arr3", ""}));

            if (!mailManager.sendMail(dataTemplate, configData))
                return RequestResult.fail("send email fail");

            Boolean finalIqc_result = iqc_result;
            ActiveJdbc.operTx(new Operation<Boolean>() {
                @Override
                public Boolean operate() {
                    PoTempStock poTempStock = PoTempStock.findByCompositeKeys(data.get("mstock_name"),
                            data.get("po_no"), data.get("sup_id"), data.get("mat_code"), data.get("location"),
                            data.get("shelf_time"));
                    if (finalIqc_result) {
                        poTempStock.set("iqc_ok_notice", "Y");
                    } else {
                        poTempStock.set("iqc_ng_notice", "Y");
                    }
                    poTempStock.saveIt();
                    return Boolean.TRUE;
                }
            });

            return RequestResult.success();
        } else {
            return RequestResult.fail("lost some key");
        }
    }

    @RequestMapping(value = "returnNotice", method = RequestMethod.POST)
    public RequestResult<?> returnNotice(@RequestBody final Map data) {
        boolean isContentPK = true;
        Map<String, String> pkMap = new HashMap<>();
        pkMap.put("mstock_name", "");
        pkMap.put("po_no", "");
        pkMap.put("sup_id", "");
        pkMap.put("mat_code", "");
        pkMap.put("location", "");
        pkMap.put("shelf_time", "");

        for (Map.Entry<String, String> map : pkMap.entrySet()) {
            if (!data.containsKey(map.getKey())) {
                isContentPK = false;
            }
        }
        String msg = String.format("採購單號 %s 暫入檢驗異常，生管通知退料。", data.get("po_no"));
        msg = gson.toJson(new MQttObj(msg));
        log.info(msg);
        MQTTManager.publish(msg, "Platform_Notice");
        ActiveJdbc.operTx(new Operation<Boolean>() {
            @Override
            public Boolean operate() {
                PoTempStock poTempStock = PoTempStock.findByCompositeKeys(data.get("mstock_name"), data.get("po_no"),
                        data.get("sup_id"), data.get("mat_code"), data.get("location"), data.get("shelf_time"));
                poTempStock.set("return_notice", "Y");
                poTempStock.saveIt();
                return Boolean.TRUE;
            }
        });

        if (!isContentPK)
            return RequestResult.fail("lost some key");

        return RequestResult.success();
    }

    // 退料
    @RequestMapping(value = "matReturn", method = RequestMethod.POST)
    public RequestResult<?> matReturn(@RequestBody final List<Map> dataList) {
        List<Map> successList = new ArrayList<>();
        for (Map data : dataList) {
            boolean isContentPK = true;
            Map<String, String> pkMap = new HashMap<>();
            pkMap.put("mstock_name", "");
            pkMap.put("po_no", "");
            pkMap.put("sup_id", "");
            pkMap.put("mat_code", "");
            pkMap.put("location", "");
            pkMap.put("shelf_time", "");
            pkMap.put("return_qty", "");
            pkMap.put("return_by", "");

            for (Map.Entry<String, String> map : pkMap.entrySet()) {
                String key = map.getKey();
                if (!data.containsKey(key)) {
                    isContentPK = false;
                    break;
                } else {
                    pkMap.put(key, data.get(key).toString());
                }
            }
            if (!isContentPK)
                continue;

            ActiveJdbc.operTx(new Operation<Boolean>() {
                @Override
                public Boolean operate() {
                    PoTempStock poTempStock = PoTempStock.findByCompositeKeys(data.get("mstock_name"),
                            data.get("po_no"), data.get("sup_id"), data.get("mat_code"), data.get("location"),
                            data.get("shelf_time"));
                    poTempStock.set("return_qty", Double.parseDouble(pkMap.get("return_qty")));
                    poTempStock.set("return_by", pkMap.get("return_by"));
                    poTempStock.set("status", "5"); // 已退料
                    poTempStock.set("return_time", new Timestamp(System.currentTimeMillis()));
                    poTempStock.saveIt();
                    return Boolean.TRUE;
                }
            });
            ActiveJdbc.operTx(new Operation<Boolean>() {
                @Override
                public Boolean operate() {
                    PoFile poFile = PoFile.findByCompositeKeys(data.get("mstock_name"), data.get("po_no"),
                            data.get("sup_id"), data.get("mat_code"));
                    Double qty = poFile.getDouble("shelf_qty");
                    Double returnQty = Double.parseDouble(pkMap.get("return_qty"));
                    Double result = qty - returnQty;
                    poFile.set("shelf_qty", result < 0.0 ? 0.0 : result);
                    poFile.saveIt();
                    return Boolean.TRUE;
                }
            });
            successList.add(pkMap);

        }
        return RequestResult.success(successList);
    }

    @RequestMapping(value = "chgMatLocation", method = RequestMethod.PUT)
    public RequestResult<?> chgMatLocation(@RequestBody final Map<String, Object> data) {
        // 1. 更新材料庫存：
        // UPDATE a_huangliang_mat_stock SET location = {chg_location} WHERE shelf_time = { shelf_time } AND mat_code { mat_code };
        // 2. 寫入材料庫存變更記錄：
        // INSERT INTO a_huangliang_mat_stock_chg_log (`mstock_name`, `mat_code`, `shelf_time`, `po_no`, `sup_id`, `location`, `orig_location`, `chg_location`, `orig_qty`, `chg_qty`, `chg_type`, `chg_reason`, `chg_by`, `chg_time`) VALUES ({mstock_name}, {mat_code}, {shelf_time}, {po_no}, {sup_id}, {chg_location}, {orig_location}, {chg_location}, {mstock_qty}, {mstock_qty}, {chg_type}, {chg_reason}, userId, NOW());
        // 3. 更新機台材料派工儲位明細(狀態為開立0或派工中1)：
        // UPDATE a_huangliang_wo_m_mat_list SET location = { chg_location } WHERE shelf_time = { shelf_time } AND mat_code = { mat_code } AND item_status IN (1, 0);
        String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
        String matCode = data.get("mat_code").toString();
        String shelfTime = data.get("shelf_time").toString();
        String location = data.get("chg_location").toString();
        Object mstockQty = data.get("mstock_qty");
        ActiveJdbc.operTx(new Operation<Boolean>() {
            @Override
            public Boolean operate() {
                MatStock.update("location = ?", "shelf_time = ? AND mat_code = ? ", location, shelfTime, matCode);
                data.put("location", location);
                data.put("orig_qty", mstockQty);
                data.put("chg_qty", mstockQty);
                data.put("chg_by", login_user);
                data.put("chg_time", new Timestamp(System.currentTimeMillis()));
                MatStockChangeLog chgLog = new MatStockChangeLog().fromMap(data);
                chgLog.insert();
                WoMMatList.update("location = ?", "shelf_time = ? AND mat_code = ? AND item_status IN (1, 0)", location, shelfTime, matCode);
                return Boolean.TRUE;
            }
        });

        return RequestResult.success();
    }

    @RequestMapping(value = "chgMatQty", method = RequestMethod.PUT)
    public RequestResult<?> chgMatQty(@RequestBody final Map<String, Object> data) {
        String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
        String matCode = data.get("mat_code").toString();
        String shelfTime = data.get("shelf_time").toString();
        String location = data.get("location").toString();
        String unit = data.get("unit").toString();
        Double chgQty = Double.parseDouble(data.get("chg_qty").toString());
        Boolean isMetal = unit.equals("KG");
        Boolean isSuccess = ActiveJdbc.operTx(new Operation<Boolean>() {
            @Override
            public Boolean operate() {
                MatStock matStock = MatStock.findFirst("shelf_time = ? AND mat_code = ? ", shelfTime, matCode);
                double mat_length = Double.parseDouble(matStock.get("mat_length").toString().replaceAll("m", "").replaceAll("M", ""));
                WeightPieceConverter converter = new WeightPieceConverter(matCode);
                int chqPiece = isMetal ? converter.qtyToPiece(chgQty, mat_length) : chgQty.intValue();
                matStock.set("mstock_qty", chgQty, "stock_piece", chqPiece);
                // MatStock.update("mstock_qty = ?", "shelf_time = ? AND mat_code = ? ", chgQty, shelfTime, matCode);
                if (matStock.saveIt()) {
                  data.put("orig_location", location);
                  data.put("chg_location", location);
                  data.put("chg_by", login_user);
                  data.put("chg_time", new Timestamp(System.currentTimeMillis()));
                  MatStockChangeLog chgLog = new MatStockChangeLog().fromMap(data);
                  chgLog.insert();
                  return Boolean.TRUE;
                } else {
                  return Boolean.FALSE;
                }
            }
        });
        if (isSuccess) {
          return RequestResult.success();
        } else {
          return RequestResult.fail("update matStock fail...");
        }
    }

    private String getCleanTimestamp(String str) {
        try {
            return sdf.format(sdf.parse(str));
        } catch (ParseException e) {
            e.printStackTrace();
            return str;
        }
    }

    private boolean getMailConfig() {
        try {
            JsonParams jsonParams = new JsonParams("mail_config.json");
            String defaultAccount = jsonParams.getAsString("HUL_default");
            this.account = defaultAccount.split(",")[0];
            this.password = defaultAccount.split(",")[1];
            return true;
        } catch (JsonParamsException e) {
            e.printStackTrace();
            return false;
        }
    }

    private Map<String, String> buildMap(String[] strings) {
        Map<String, String> map = new HashMap<>();
        for (int i = 0; i < strings.length; i += 2) {
            map.put(strings[i], strings[i + 1]);
        }
        return map;
    }

    private String getGroupUserEmail(String group_id) {
        return ActiveJdbc.operTx(new Operation<String>() {
            @Override
            public String operate() {
                StringBuilder emails = new StringBuilder();
                // String sql = String.format("SELECT user_email FROM `m_sys_user` WHERE user_id
                // = " +
                // "(SELECT user_id FROM m_sys_user_group as g WHERE g.group_id ='%s')",
                // group_id);
                // SysUserGroup.findBySQL("SELECT user_id FROM m_sys_user_group as g WHERE
                // g.group_id ='%s'");
                String sql = "SELECT m.user_email FROM `m_sys_user` as m join m_sys_user_group as g WHERE g.group_id = '"
                        + group_id + "' and g.user_id = m.user_id AND m.is_close = 1";
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
        });
    }

    private void test() {
        ConfigData configData = new ConfigData("thl22143734huangliang", "thl22143734huangliang", "kimey583@gmail.com",
                "採購單號1703021001P已延遲驗料,請主管派人前往進行驗料",
                "C:/pengpeng/01_Huangliang/001_HULSendMailTest/template/default_template.html");
        try {
            // new InputStreamReader(new FileInputStream(DATA_PATH + reportMapPath), "UTF8")
            BufferedReader index = new BufferedReader(new InputStreamReader(
                    new FileInputStream(new File("C:/pengpeng/01_Huangliang/001_HULSendMailTest/template/test.json")),
                    "UTF-8"));
            // Reader index =
            // Files.newBufferedReader(Paths.get("C:/pengpeng/01_Huangliang/001_HULSendMailTest/template/test.json"));
            DataTemplate dataTemplate = gson.fromJson(index, DataTemplate.class);

            log.info(String.valueOf(dataTemplate.arrMap.size()));
            log.info(String.valueOf(dataTemplate.replaceMap.size()));
            mailManager.sendMail(dataTemplate, configData);
        } catch (FileNotFoundException | UnsupportedEncodingException e) {
            e.printStackTrace();
        }
    }

    class MQttObj {
        String message;

        MQttObj(String message) {
            this.message = message;
        }
    }
}
