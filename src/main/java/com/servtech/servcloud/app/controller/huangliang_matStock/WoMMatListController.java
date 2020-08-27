package com.servtech.servcloud.app.controller.huangliang_matStock;

import com.google.gson.Gson;
import com.servtech.servcloud.app.controller.huangliang_matStock.util.RecordAfter;
import com.servtech.servcloud.app.controller.huangliang_matStock.util.WeightPieceConverter;
import com.servtech.servcloud.app.model.huangliang_matStock.*;
import com.servtech.servcloud.app.model.huangliang_matStock.view.MatStatus;
import com.servtech.servcloud.app.model.huangliang_matStock.view.StockMatList;
import com.servtech.servcloud.app.model.huangliang_matStock.view.WoMMatWoMMatListMatStock;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.mqtt.MQTTManager;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.Device;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

@RestController
@RequestMapping("/huangliangMatStock/woMMatList")
public class WoMMatListController {
    private static final Logger log = LoggerFactory.getLogger(WoMMatListController.class);
    private Gson gson = new Gson();

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "cancel", method = RequestMethod.POST)
    public RequestResult<?> cancel(@RequestBody final Map data) {
        try {
            log.info(data.toString());
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    // 扣除鎖定量
                    int mstockCount = MatStock.update(
                            "lock_piece=lock_piece-?, lock_qty=lock_qty-?, modify_by=?, modify_time=?",
                            "mat_code=? and shelf_time=?", data.get("use_piece").toString(),
                            data.get("use_qty").toString(),
                            request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                            new Timestamp(System.currentTimeMillis()), data.get("mat_code").toString(),
                            data.get("shelf_time").toString());

                    // 修改狀態
                    int count = WoMMatList.update("item_status=99, modify_by=?, modify_time=?",
                            "order_id=? and machine_id=? and wo_m_time=? and m_mat_time=? and shelf_time=?",
                            request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                            new Timestamp(System.currentTimeMillis()), data.get("order_id").toString(),
                            data.get("machine_id").toString(), data.get("wo_m_time").toString(),
                            data.get("m_mat_time").toString(), data.get("shelf_time").toString());

                    if (mstockCount > 0 && count > 0) {
                        return success("取消成功");
                    } else {
                        throw new RuntimeException("取消失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "edit", method = RequestMethod.POST)
    public RequestResult<?> edit(@RequestBody final Map data) {
        try {
            log.info(data.toString());
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    // 修改儲位明細記錄派工支數WO_M_MAT_LIST.use_piece欄位，及派工數量WO_M_MAT_LIST.use_QTY (依單支重量換算)
                    double use_piece = Double.parseDouble(data.get("use_piece").toString());
                    double mat_length = Double
                            .parseDouble(data.get("mat_length").toString().replaceAll("m", "").replaceAll("M", ""));
                    String mat_code = data.get("mat_code").toString();
                    WeightPieceConverter converter = new WeightPieceConverter(mat_code);
                    double weight = use_piece; // 先當作塑膠，比重=1
                    if (converter.isMetal) {
                        try {
                            weight = converter.unitWeight(mat_length) * use_piece;
                        } catch (Exception e) {
                            log.error(e.getMessage());
                            throw new RuntimeException("重量換算失敗，請檢查平台材料設定中比重等資訊。");
                        }
                    }
                    // 換算派工支數與數量鎖定要減或加多少
                    WoMMatList woMMatList = WoMMatList.findByCompositeKeys(data.get("order_id"), data.get("machine_id"),
                            data.get("wo_m_time"), data.get("m_mat_time"), data.get("shelf_time"));
                    double oldPiece = woMMatList.getDouble("use_piece");
                    double oldQty = woMMatList.getDouble("use_qty");
                    double diffPiece = use_piece - oldPiece;
                    double diffQty = weight - oldQty;

                    // 修改儲位明細記錄派工支數，及派工數量WO_M_MAT_LIST.use_piece, use_qty
                    int wmmlCount = WoMMatList.update(
                            "use_piece=use_piece+?, use_qty=use_qty+?, modify_by=?, modify_time=?",
                            "order_id=? and machine_id=? and wo_m_time=? and m_mat_time=? and shelf_time=?", diffPiece,
                            diffQty, request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                            new Timestamp(System.currentTimeMillis()), data.get("order_id"), data.get("machine_id"),
                            data.get("wo_m_time"), data.get("m_mat_time"), data.get("shelf_time"));

                    // 更新庫存記錄中派工鎖定支數、派工鎖定數量(MAT_STOCK.lock_piece, lock_qty)
                    int msCount = MatStock.update(
                            "lock_piece=lock_piece+?, lock_qty=lock_qty+?, modify_by=?, modify_time=?",
                            "mat_code=? and shelf_time=?", diffPiece, diffQty,
                            request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                            new Timestamp(System.currentTimeMillis()), mat_code, data.get("shelf_time").toString());

                    if (data.get("type").toString().equals("2")) { // 派工審核修改
                        // 將派工數變動量(更新後派工數量-原派工數量)加總至WO_PO_BINDING. bind _qty，及PO_FILE.bind_QTY
                        int wpbCount = WoPoBinding.update("use_qty=use_qty+?, modify_by=?, modify_time=?",
                                "order_id=? and mstock_name=? and po_no=? and mat_code=? and sup_id=?", diffQty,
                                request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                                new Timestamp(System.currentTimeMillis()), woMMatList.get("order_id"),
                                woMMatList.get("mstock_name"), woMMatList.get("po_no"), woMMatList.get("mat_code"),
                                woMMatList.get("sup_id"));
                        int pfCount = PoFile.update("use_qty=use_qty+?, modify_by=?, modify_time=?",
                                "mstock_name=? and po_no=? and mat_code=? and sup_id=?", diffQty,
                                request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                                new Timestamp(System.currentTimeMillis()), woMMatList.get("mstock_name"),
                                woMMatList.get("po_no"), woMMatList.get("mat_code"), woMMatList.get("sup_id"));

                        if (wmmlCount > 0 && msCount > 0 && wpbCount > 0 && pfCount > 0) {
                            return success("修改成功");
                        } else {
                            throw new RuntimeException("新增失敗，原因待查...");
                        }
                    } else {
                        if (wmmlCount > 0 && msCount > 0) {
                            return success("修改成功");
                        } else {
                            throw new RuntimeException("新增失敗，原因待查...");
                        }
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "check", method = RequestMethod.POST)
    public RequestResult<?> check(@RequestBody final Map data) {
        try {
            log.info(data.toString());
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    switch (data.get("type").toString()) {
                    case "1": // 廠務領補料派工確認
                        // 該筆記錄材料派工狀態改為派工中(1)
                        int wmmCount = WoMMat.update("m_mat_status=1, modify_by=?, modify_time=?",
                                "order_id=? and machine_id=? and wo_m_time=? and m_mat_time=?",
                                request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                                new Timestamp(System.currentTimeMillis()), data.get("order_id"), data.get("machine_id"),
                                data.get("wo_m_time"), data.get("m_mat_time"));
                        // 所有派工材料儲位明細狀態改為派工中(1)
                        int wmmlcount = WoMMatList.update("item_status=1, modify_by=?, modify_time=?",
                                "order_id=? and machine_id=? and wo_m_time=? and m_mat_time=?",
                                request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                                new Timestamp(System.currentTimeMillis()), data.get("order_id"), data.get("machine_id"),
                                data.get("wo_m_time"), data.get("m_mat_time"));

                        if (wmmCount <= 0 || wmmlcount <= 0) {
                            throw new RuntimeException("失敗，原因待查...");
                        }

                        // 將派工數變動量(更新後派工數量-原派工數量)加總至WO_PO_BINDING.use_qty，及PO_FILE.use_qty
                        List<WoMMatList> woMMatLists = WoMMatList.where(
                                "order_id=? and machine_id=? and wo_m_time=? and m_mat_time=?", data.get("order_id"),
                                data.get("machine_id"), data.get("wo_m_time"), data.get("m_mat_time"));
                        for (WoMMatList woMMatList : woMMatLists) {
                            int wpbCount = WoPoBinding.update("use_qty=?, modify_by=?, modify_time=?",
                                    "order_id=? and mstock_name=? and po_no=? and mat_code=? and sup_id=?",
                                    woMMatList.get("use_qty"),
                                    request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                                    new Timestamp(System.currentTimeMillis()), woMMatList.get("order_id"),
                                    woMMatList.get("mstock_name"), woMMatList.get("po_no"), woMMatList.get("mat_code"),
                                    woMMatList.get("sup_id"));
                            int pfCount = PoFile.update("use_qty=?, modify_by=?, modify_time=?",
                                    "mstock_name=? and po_no=? and mat_code=? and sup_id=?", woMMatList.get("use_qty"),
                                    request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                                    new Timestamp(System.currentTimeMillis()), woMMatList.get("mstock_name"),
                                    woMMatList.get("po_no"), woMMatList.get("mat_code"), woMMatList.get("sup_id"));

                            // 因為有可能有沒綁定採購單給生產只另也能領料的情況，所以就不檢查 wpbCount
                            if (pfCount <= 0) {
                                throw new RuntimeException("無可更新已領總數量之採購單。");
                            }
                        }
                        return success("領補料派工確認成功");
                    case "2": // 領補料審核作業 (退庫不會進入審核所以不用過濾領補料)
                        // 更新數量都做在修改的API，因為如果派工數跟回饋數不同但使用者沒有去修改派工數表示他不需要修改
                        // 該筆記錄材料派工狀態改為完成(9)，派工材料儲位明細中所有對應記錄項目狀態改為完成(9)
                        int sWwmmCount = WoMMat.update("m_mat_status=9, modify_by=?, modify_time=?",
                                "order_id=? and machine_id=? and wo_m_time=? and m_mat_time=?",
                                request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                                new Timestamp(System.currentTimeMillis()), data.get("order_id"), data.get("machine_id"),
                                data.get("wo_m_time"), data.get("m_mat_time"));
                        if (sWwmmCount > 0 && finishWwoMMatList(data)) {
                            return success("領補料派工審核成功");
                        } else {
                            throw new RuntimeException("失敗，原因待查...");
                        }
                    default:
                        throw new RuntimeException("未定義審核類別 1:廠務領料派工確認 或 2:領料審核作業 ");
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    // 派工儲位明細狀台變為完成時要更新
    // 派工儲位明細.使用成本(WO_M_MAT_LIST.use_cost),
    // 金屬類:材料單價*派工數量 (MAT_STOCK.mat_price*WO_M_MAT_LIST.use_qty)。
    // 塑膠類:材料單價*派工數量*長度/1000
    // (MAT_STOCK.mat_price*WO_M_MAT_LIST.use_qty*MAT_STOCK.mat_length/1000)
    // 庫存記錄.庫存數量、庫存之數、派工鎖定支數、派工鎖定數量(MAT_STOCK.mstock_qty, stock_piece, lock_piece,
    // lock_qty)扣除派工支數與數量
    private boolean finishWwoMMatList(Map data) {
        List<WoMMatList> woMMatLists = WoMMatList.find("order_id=? and machine_id=? and wo_m_time=? and m_mat_time=?",
                data.get("order_id"), data.get("machine_id"), data.get("wo_m_time"), data.get("m_mat_time"));
        try {
            for (WoMMatList woMMatList : woMMatLists) {
                MatStock matStock = MatStock.findByCompositeKeys(woMMatList.get("mat_code"),
                        woMMatList.get("shelf_time"));
                double matPrice = Double.parseDouble(matStock.get("mat_price").toString());
                double useQty = Double.parseDouble(woMMatList.get("use_qty").toString());
                double matLength = Double.parseDouble(matStock.get("mat_length").toString().replace("mm", "")) / 1000;
                if (matStock.get("unit").toString().equals("KG")) {
                    woMMatList.set("use_cost", matPrice * useQty);
                } else {
                    woMMatList.set("use_cost", matPrice * useQty * matLength);
                }
                woMMatList.set("item_status", "9");

                int count = MatStock.update(
                        "mstock_qty=mstock_qty-?, stock_piece=stock_piece-?, lock_qty=lock_qty-?, lock_piece=lock_piece-?, modify_by=?, modify_time=?",
                        "mat_code=? and shelf_time=?", woMMatList.get("use_qty"), woMMatList.get("use_piece"),
                        woMMatList.get("use_qty"), woMMatList.get("use_piece"),
                        request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                        new Timestamp(System.currentTimeMillis()), woMMatList.get("mat_code"),
                        woMMatList.get("shelf_time"));
                if (!woMMatList.saveIt() || count <= 0) {
                    return false;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return false;
        }
        return true;
    }

    @RequestMapping(value = "getReturnedOfStockData", method = RequestMethod.GET)
    public RequestResult<?> getReturnedOfStockData(@RequestParam("order_id") final String orderId,
            @RequestParam("machine_id") final String machineId) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    List<Map> result = new ArrayList<>();
                    String lastMMatTime = "";
                    // 1. 找到最後一筆領補料的材料派工時間
                    List<Map> lastItem = WoMMatWoMMatListMatStock
                            .find("order_id=? AND machine_id=? and type IN ('1', '2') order by m_mat_time desc",
                                    orderId, machineId)
                            .toMaps();
                    if (lastItem.size() > 0) {
                        lastMMatTime = lastItem.get(0).get("m_mat_time").toString();
                    } else {
                        return fail("該生產指令機台派工未有領補料記錄。");
                    }

                    // 2. 找到1. 材料派工時間下的領補料儲位明細
                    List<Map> list = WoMMatWoMMatListMatStock
                            .find("order_id=? and machine_id=? and m_mat_time=? and type IN ('1', '2')", orderId,
                                    machineId, lastMMatTime)
                            .toMaps();

                    // 3.
                    // 檢查記錄下所有材料派工明細，以訂單編號、機台、材料庫、暫上架時間、採購單號、材料條碼、位置檢查材料派工中是否有對應的退庫記錄，有，則不顯示該筆領料或補料材料派工明細記錄
                    for (Map map : list) {
                        WoMMatWoMMatListMatStock returnItem = WoMMatWoMMatListMatStock.findFirst(
                                "order_id=? and machine_id=? and wo_m_time=? and shelf_time=? and mstock_name=? and po_no=? and mat_code=? and location=? and type='3'",
                                orderId, machineId, map.get("wo_m_time"), map.get("shelf_time"), map.get("mstock_name"),
                                map.get("po_no"), map.get("mat_code"), map.get("location"));
                        if (returnItem == null) {
                            result.add(map);
                        }
                    }

                    // 4. 如該生產指令、機台最晚一筆的領補料材料派工記錄下所有明細都有對應退庫記錄，無材料派工明細顯示，則顯示錯誤訊息，
                    if (result.size() == 0) {
                        return fail("該生產指令機台材料派工最後一筆領料記錄已完成退庫，請重新輸入機台、生產指令");
                    } else {
                        return success(result);
                    }
                    // // 減去該材料派工儲位明細派工數量於於生產指令綁定採購單已領數量（WO_PO
                    // BINDING.use_qty）及採購單已領總數量（PO_FILE.use_qty）
                    // List<Map> result = WoMMatWoMMatListMatStock.find("order_id=? AND machine_id=?
                    // ", orderId, machineId).toMaps();
                    // List<Map> returnOfStockData = new ArrayList<>();
                    //
                    // for (int index = 0; index < result.size(); index++) {
                    // if (result.get(index).get("type").toString().equals("3")) {
                    // returnOfStockData.add(result.get(index));
                    // result.remove(index);
                    // index--;
                    // }
                    // }
                    //
                    // for (int i = 0; i < returnOfStockData.size(); i++) {
                    // Map<String, Object> data = returnOfStockData.get(i);
                    // String mstockName = data.get("mstock_name").toString();
                    // String shelfTime = data.get("shelf_time").toString();
                    // String poNo = data.get("po_no").toString();
                    // String matCode = data.get("mat_code").toString();
                    // String location = data.get("location").toString();
                    // for (int index = 0; index < result.size(); index++) {
                    // Map<String, Object> d = result.get(index);
                    // if (mstockName.equals(d.get("mstock_name").toString()) &&
                    // shelfTime.equals(d.get("shelf_time").toString()) &&
                    // poNo.equals(d.get("po_no").toString()) &&
                    // matCode.equals(d.get("mat_code").toString()) &&
                    // location.equals(d.get("location").toString())) {
                    // result.remove(index);
                    // index--;
                    // }
                    // }
                    // }
                    //
                    // return success(result);
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            log.info("Error : " + sw.toString());
            return fail(e.getMessage() + "error message : " + sw.toString());
        }
    }

    @RequestMapping(value = "returnedOfStock", method = RequestMethod.POST)
    public RequestResult<?> returnedOfStock(@RequestBody final Map data) {
        try {
            log.info(data.toString());
            return ActiveJdbc.operTx(() -> {
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                Long now = System.currentTimeMillis();

                // 取得庫存表目前資訊
                Map<String, Object> stock = MatStock
                        .findFirst("shelf_time=? AND mat_code=?", data.get("shelf_time"), data.get("mat_code")).toMap();

                data.put("m_mat_time", new java.sql.Timestamp(now));
                data.put("type", 3); // 型態3:退庫
                data.put("m_mat_status", 9); // 材料派工狀態9:已完成
                RecordAfter.putCreateAndModify(data, login_user, now);

                // 存入 機台材料派工
                WoMMat woMMat = new WoMMat().fromMap(data);
                woMMat.insert();

                // 支數與重量轉換
                Double qty = Double.parseDouble(data.get("use_qty").toString());
                Double piece = Double.parseDouble(data.get("use_piece").toString());
                if (data.get("mat_att").equals("plastic")) {
                    data.put("use_qty", piece);
                } else { // 不是塑膠就視為金屬
                    String weightStr = stock.get("p_weight").toString();
                    if (weightStr.equals("") || weightStr.equals("null"))
                        weightStr = "0";
                    Double weight = Double.parseDouble(weightStr);
                    data.put("use_piece", weight != 0 ? qty / weight : 0);
                }

                String priceStr = stock.get("mat_price").toString();
                double matLength = Double.parseDouble(stock.get("mat_length").toString().replace("mm", "")) / 1000;
                if (priceStr.equals("") || priceStr.equals("null"))
                    priceStr = "0";
                Double price = Double.parseDouble(priceStr);
                data.put("use_remark", "材料退回");
                data.put("item_status", 9); // 項目狀態9:完成
                if (data.get("mat_att").equals("plastic")) {
                    data.put("use_cost", piece * price * matLength);
                } else {
                    data.put("use_cost", qty * price);
                }
                // 存入 機台材料派工儲位明細
                WoMMatList woMMatList = new WoMMatList().fromMap(data);
                woMMatList.insert();
                //
                // // 更新 庫存表 的派工支數鎖定
                // RecordAfter.putModify(stock, login_user, now);
                // // Double lockQty = 0.0;
                // // Double lockPeice = 0.0;
                // Double mstockQty = 0.0;
                // Double stockPiece = 0.0;
                // Double useQty = 0.0;
                // Double usePiece = 0.0;
                // // if (stock.get("lock_qty") != null)
                // // lockQty = Double.parseDouble(stock.get("lock_qty").toString());
                // if (stock.get("mstock_qty") != null)
                // mstockQty = Double.parseDouble(stock.get("mstock_qty").toString());
                // if (data.get("use_qty") != null) {
                // useQty = Double.parseDouble(data.get("use_qty").toString());
                // // lockQty = lockQty - useQty;
                // // if (lockQty < 0) lockQty = 0.0;
                // mstockQty = mstockQty - useQty;
                // if (mstockQty < 0) mstockQty = 0.0;
                // }
                // // if (stock.get("lock_piece") != null)
                // // lockPeice = Double.parseDouble(stock.get("lock_piece").toString());
                // if (stock.get("stock_piece") != null)
                // stockPiece = Double.parseDouble(stock.get("stock_piece").toString());
                // if (data.get("use_piece") != null) {
                // usePiece = Double.parseDouble(data.get("use_piece").toString());
                // // lockPeice = lockPeice - usePiece;
                // // if (lockPeice < 0) lockPeice = 0.0;
                // stockPiece = stockPiece - usePiece;
                // if (stockPiece < 0) stockPiece = 0.0;
                // }
                // // stock.put("lock_qty", lockQty);
                // // stock.put("lock_piece", lockPeice);
                // stock.put("mstock_qty", mstockQty);
                // stock.put("stock_piece", stockPiece);
                // MatStock matStock = new MatStock().fromMap(stock);
                // matStock.saveIt();

                // 更新 生產指令綁定採購單 的已領數量
                // Map<String, Object> bind = WoPoBinding.findFirst("order_id=? AND
                // mstock_name=? AND po_no=? AND mat_code=? AND sup_id=?",
                // data.get("order_id"), data.get("mstock_name"), data.get("po_no"),
                // data.get("mat_code"), data.get("sup_id")).toMap();
                // Double bindUse = 0.0;
                // if (bind.get("use_qty") != null) {
                // bindUse = Double.parseDouble(bind.get("use_qty").toString());
                // }
                // Double newUseQty = bindUse - useQty;
                // if (newUseQty < 0) newUseQty = 0.0;
                // bind.put("use_qty", newUseQty);
                // RecordAfter.putModify(bind, login_user, now);
                // WoPoBinding woPoBinding = new WoPoBinding().fromMap(bind);
                // woPoBinding.saveIt();

                // 生產指令綁定採購單.已領數量 扣掉退回數量
                int wpbCount = WoPoBinding.update("use_qty=use_qty-?, modify_by=?, modify_time=?",
                        "order_id=? AND mstock_name=? AND po_no=? AND mat_code=? AND sup_id=?", data.get("use_qty"),
                        request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                        new Timestamp(System.currentTimeMillis()), data.get("order_id"), data.get("mstock_name"),
                        data.get("po_no"), data.get("mat_code"), data.get("sup_id"));
                // 可能沒有綁採購單的量給生產指令就領了，所以就不用檢查是不是真的有更新到數量，因為他可能根本沒有這筆紀錄
//                if (wpbCount <= 0) {
//                    throw new RuntimeException("更新生產指令綁定採購單.已領數量失敗，請聯絡系統管理員。");
//                }

                // 加回庫存表.庫存支數與數量
                int msCount = MatStock.update(
                        "stock_piece=stock_piece+?, mstock_qty=mstock_qty+?, modify_by=?, modify_time=?",
                        "mat_code=? AND shelf_time=?", data.get("use_piece"), data.get("use_qty"),
                        request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                        new Timestamp(System.currentTimeMillis()), data.get("mat_code"), data.get("shelf_time"));
                if (msCount <= 0) {
                    throw new RuntimeException("更新庫存表.庫存支數失敗，請聯絡系統管理員。");
                }

                // po_file.use_qty 需被更新, 扣除 use_qty
                int pfCount = PoFile.update("use_qty=use_qty-?, modify_by=?, modify_time=?",
                        "mstock_name=? AND po_no=? AND mat_code=? AND sup_id=?", data.get("use_qty"),
                        request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                        new Timestamp(System.currentTimeMillis()), data.get("mstock_name"), data.get("po_no"),
                        data.get("mat_code"), data.get("sup_id"));
                if (pfCount <= 0) {
                    throw new RuntimeException("更新採購單.已領總數量失敗，請聯絡系統管理員。");
                }

                return RequestResult.success("退庫成功");
            });
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    @RequestMapping(value = "shiftOut", method = RequestMethod.POST)
    public RequestResult<?> shiftOut(@RequestBody final Map data) {
        try {
            log.info(data.toString());
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    // DB內的approve_req
                    String approve_req_db = WoMMat
                            .findFirst("order_id=? and machine_id=? and wo_m_time=? and m_mat_time=?",
                                    data.get("order_id").toString(), data.get("machine_id").toString(),
                                    data.get("wo_m_time").toString(), data.get("m_mat_time").toString())
                            .getString("approve_req");
                    // 機台材料派工狀態改為移料中(2), 若派工支數≠回饋支數、或派工數量≠回饋數量，則機台材料派工審核需求改為”Y”。
                    int wmmCount = WoMMat.update("m_mat_status=2, approve_req=?, modify_by=?, modify_time=?",
                            "order_id=? and machine_id=? and wo_m_time=? and m_mat_time=?",
                            data.get("approve_req").toString().equals("N") ? approve_req_db
                                    : data.get("approve_req").toString(),
                            request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                            new Timestamp(System.currentTimeMillis()), data.get("order_id").toString(),
                            data.get("machine_id").toString(), data.get("wo_m_time").toString(),
                            data.get("m_mat_time").toString());

                    // 將機台材料派工儲位明細項目狀態改為已移出(2)並回饋支數(fb_piece)、回饋數量(fb_qty)
                    int count = WoMMatList.update("item_status=2, fb_piece=?, fb_qty=?, modify_by=?, modify_time=?",
                            "order_id=? and machine_id=? and wo_m_time=? and m_mat_time=? and shelf_time=?",
                            data.get("fb_piece").toString(), data.get("fb_qty").toString(),
                            request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                            new Timestamp(System.currentTimeMillis()), data.get("order_id").toString(),
                            data.get("machine_id").toString(), data.get("wo_m_time").toString(),
                            data.get("m_mat_time").toString(), data.get("shelf_time").toString());

                    if (count > 0 && wmmCount > 0) {
                        return success("儲位移出成功");
                    } else {
                        throw new RuntimeException("儲位移出失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "shiftIn", method = RequestMethod.POST)
    public RequestResult<?> shiftIn(@RequestBody final Map data) {
        try {
            log.info(data.toString());
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    // 將儲位明細項目狀態改為已移入(3)
                    int count = WoMMatList.update("item_status=3, modify_by=?, modify_time=?",
                            "order_id=? and machine_id=? and wo_m_time=? and m_mat_time=? and shelf_time=?",
                            request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                            new Timestamp(System.currentTimeMillis()), data.get("order_id").toString(),
                            data.get("machine_id").toString(), data.get("wo_m_time").toString(),
                            data.get("m_mat_time").toString(), data.get("shelf_time").toString());

                    if (count == 0) {
                        throw new RuntimeException("材料移入失敗，原因待查...");
                    }

                    List<WoMMatList> list = WoMMatList.find(
                            "order_id=? and machine_id=? and wo_m_time=? and m_mat_time=? ",
                            data.get("order_id").toString(), data.get("machine_id").toString(),
                            data.get("wo_m_time").toString(), data.get("m_mat_time").toString());
                    boolean allShiftedIn = true;
                    double sumUseQty = 0;
                    for (WoMMatList woMMatList : list) {
                        sumUseQty += woMMatList.getDouble("use_qty");
                        if (!woMMatList.get("item_status").toString().equals("3")) {
                            allShiftedIn = false;
                        }
                    }

                    // 若該筆材料派工記錄所有儲位明細項目狀態為移入待審(3)，則檢查
                    if (allShiftedIn) {
                        WoMMat woMMat = WoMMat.findFirst("order_id=? and machine_id=? and wo_m_time=? and m_mat_time=?",
                                data.get("order_id").toString(), data.get("machine_id").toString(),
                                data.get("wo_m_time").toString(), data.get("m_mat_time").toString());
                        // * 審核需求等於Y，材料派工狀態改為移料待審(3)，平台發出”廠務審核待確認通知”(格式如4.1.3.9)，審核通知改為”Y”。
                        if (woMMat.get("approve_req").toString().equals("Y")) {
                            String machineName = Device.findById(data.get("machine_id").toString())
                                    .getString("device_name");
                            String msg = String.format("生產指令：%s，材料：%s，派工數量：%.2f 已移至機台 %s，請前往審核。",
                                    data.get("order_id").toString(), data.get("mat_code").toString(), sumUseQty,
                                    machineName);
                            msg = gson.toJson(new MQttObj(msg));
                            log.info(msg);
                            MQTTManager.publish(msg, "Platform_Notice");

                            int wmmCount = WoMMat.update(
                                    "m_mat_status=3, approve_notice='Y', modify_by=?, modify_time=?",
                                    "order_id=? and machine_id=? and wo_m_time=? and m_mat_time=?",
                                    request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                                    new Timestamp(System.currentTimeMillis()), data.get("order_id"),
                                    data.get("machine_id"), data.get("wo_m_time"), data.get("m_mat_time"));
                            if (wmmCount > 0) {
                                return success("儲位移入、材料派工移入待審並發送廠務審核待確認通知成功");
                            } else {
                                throw new RuntimeException("儲位移入、材料派工移入待審並發送廠務審核待確認通知失敗，原因待查...");
                            }
                        } else {
                            // * 審核需求等於N，則材料派工狀態改為完成(9)，該派工下所有派工材料儲位明細項目狀態改為完成(9)
                            int wmmCount = WoMMat.update("m_mat_status=9, modify_by=?, modify_time=?",
                                    "order_id=? and machine_id=? and wo_m_time=? and m_mat_time=?",
                                    request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY),
                                    new Timestamp(System.currentTimeMillis()), data.get("order_id"),
                                    data.get("machine_id"), data.get("wo_m_time"), data.get("m_mat_time"));
                            if (wmmCount > 0 && finishWwoMMatList(data)) {
                                return success("儲位移入、結案材料派工與儲位明細成功");
                            } else {
                                throw new RuntimeException("儲位移入、結案材料派工與儲位明細失敗，原因待查...");
                            }
                        }
                    } else {
                        return success("儲位移入成功");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "useState", method = RequestMethod.GET)
    public RequestResult<?> useState() {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    try {
                        log.info("Start UseState ! ");
                        String sql = "SELECT a.* FROM (SELECT * FROM a_huangliang_view_mat_status ORDER BY m_mat_time DESC) a WHERE a.w_m_status = '1' AND a.mat_control = 'Y' GROUP BY a.machine_id";
                        // 取得生產中且監控中的資料
                        List<MatStatus> matStatuss = MatStatus.findBySQL(sql);
                        log.info("matStatuss sql : " + sql);
                        List<Map<String, Object>> result = new ArrayList<>();

                        if (matStatuss != null) {

                            for (MatStatus matStatus : matStatuss) {
                                Map<String, Object> map = new HashMap<>();
                                String machine_id = matStatus.getString("machine_id");
                                String order_id = matStatus.getString("order_id");
                                String product_id = matStatus.getString("product_id");
                                String m_qty = matStatus.getString("m_qty");
                                String m_pqty = matStatus.getString("m_pqty");
                                String m_bqty = matStatus.getString("m_bqty");
                                // WoMMatList lastWoMMatList = WoMMatList.findFirst("machine_id = ? order by
                                // modify_time desc", machine_id);
                                // String mat_code = lastWoMMatList == null ? "" :
                                // lastWoMMatList.getString("mat_code");
                                String mat_code = matStatus.getString("mat_code") == null ? ""
                                        : matStatus.getString("mat_code");
                                String rework_size = matStatus.getString("rework_size");

                                Object wo_m_time = matStatus.get("wo_m_time");

                                map.put("machine_id", machine_id);
                                map.put("order_id", order_id);
                                map.put("product_id", product_id);
                                map.put("m_qty", m_qty);
                                map.put("m_pqty", m_pqty);
                                map.put("m_bqty", m_bqty);
                                map.put("mat_code", mat_code);

                                Map<String, Integer> materialProduct = getMaterialProduct(matStatus);

                                // 剩餘材料支數
                                map.put("feeding_count",
                                        materialProduct.get("count") == null ? "" : materialProduct.get("count"));
                                // 剩餘材料耗用時間
                                map.put("feeding_time",
                                        materialProduct.get("time") == null ? "" : materialProduct.get("time"));
                                // 提供4.1.4.2建議補料計算 與 修尾預設值
                                map.put("singleProduct", materialProduct.get("singleProduct") == null ? ""
                                        : materialProduct.get("singleProduct"));

                                // 料機架可放置數
                                map.put("place_count", getPutCount(mat_code));
                                map.put("mat_control", matStatus.get("mat_control"));
                                map.put("rework_size", rework_size);

                                map.put("wo_m_time", wo_m_time);

                                result.add(map);
                            }
                        }
                        if (result.size() == 0) {
                            return fail("沒有符合資料");
                        }
                        return success(result);

                    } catch (Exception e) {
                        StringWriter sw = new StringWriter();
                        e.printStackTrace(new PrintWriter(sw));
                        log.info("Error : " + sw.toString());
                        return fail(e.getMessage());
                    }
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            log.info("Error : " + sw.toString());
            return fail(e.getMessage() + "error message : " + sw.toString());
        }
    }

    @RequestMapping(value = "useState2", method = RequestMethod.GET)
    public RequestResult<?> useState2() {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    try {
                        log.info("Start UseState ! ");
                        // 取得"各機台"最新一筆機台派工(狀態為生產中，並且有要材料監控)
                        String sql = "SELECT a.wo_m_time max_wo_m_time, b.* FROM (SELECT c.machine_id, MAX(c.wo_m_time) wo_m_time FROM a_huangliang_wo_m_status c WHERE c.w_m_status = '1' AND c.mat_control = 'Y' GROUP BY c.machine_id) a INNER JOIN a_huangliang_wo_m_status b ON a.machine_id = b.machine_id AND a.wo_m_time = b.wo_m_time";
                        List<MatStatus> matStatuss = MatStatus.findBySQL(sql);
                        log.info("matStatuss sql : " + sql);
                        List<Map<String, Object>> result = new ArrayList<>();

                        if (matStatuss != null) {
                            for (MatStatus matStatus : matStatuss) {
                                Map<String, Object> map = new HashMap<>();
                                String machine_id = matStatus.getString("machine_id");
                                String order_id = matStatus.getString("order_id");
                                String m_qty = matStatus.getString("m_qty");
                                String m_pqty = matStatus.getString("m_pqty");
                                String m_bqty = matStatus.getString("m_bqty");
                                Object wo_m_time = matStatus.get("wo_m_time");

                                map.put("machine_id", machine_id);
                                map.put("order_id", order_id);
                                map.put("m_qty", m_qty);
                                map.put("m_pqty", m_pqty);
                                map.put("m_bqty", m_bqty);

                                Map<String, Object> materialProduct = getMaterialProduct2(matStatus);
                                if(materialProduct == null){
                                    continue;
                                }
                                map.put("product_id", materialProduct.get("product_id"));
                                String mat_code = materialProduct.get("mat_code").toString();
                                if (!mat_code.equals("")) {
                                    map.put("mat_code", mat_code);

                                    // 剩餘材料支數
                                    map.put("feeding_count",
                                            materialProduct.get("count") == null ? "" : materialProduct.get("count"));
                                    // 剩餘材料耗用時間
                                    map.put("feeding_time",
                                            materialProduct.get("time") == null ? "" : materialProduct.get("time"));
                                    // 提供4.1.4.2建議補料計算 與 修尾預設值
                                    map.put("singleProduct", materialProduct.get("singleProduct") == null ? ""
                                            : materialProduct.get("singleProduct"));

                                    // 料機架可放置數
                                    map.put("place_count", getPutCount(mat_code));
                                    map.put("mat_control", matStatus.get("mat_control"));
                                    String rework_size = WoMMat.findFirst(
                                            "order_id = ? AND machine_id = ? AND wo_m_time = ? ORDER BY m_mat_time DESC",
                                            order_id, machine_id, wo_m_time).getString("rework_size");
                                    map.put("rework_size", rework_size);
                                    map.put("process", materialProduct.get("process"));
                                    map.put("wo_m_time", wo_m_time);

                                    result.add(map);
                                }
                            }
                        }
                        if (result.size() == 0) {
                            return fail("沒有符合資料");
                        }
                        return success(result);

                    } catch (Exception e) {
                        StringWriter sw = new StringWriter();
                        e.printStackTrace(new PrintWriter(sw));
                        log.info("Error : " + sw.toString());
                        return fail(e.getMessage());
                    }
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            log.info("Error : " + sw.toString());
            return fail(e.getMessage() + "error message : " + sw.toString());
        }
    }

    static Map<String, Object> getMaterialProduct2(MatStatus matStatus){
        try {
            Map<String, Object> resultMap = new HashMap<>();
            String machine_id = matStatus.getString("machine_id");
            String order_id = matStatus.getString("order_id");
            String wo_m_time = matStatus.getString("wo_m_time");
            String product_id = WoList.findFirst("order_id = ?", order_id).getString("product_id");

            // 取得加工方式
            ProductProfile productProfile = ProductProfile.findFirst("product_id = ? ", product_id);
            String process = "";
            if (productProfile != null && productProfile.get("process") != null) {
                process = productProfile.getString("process");
            }

            // 根據加工方式取得殘材，以計算剩餘材料
            // 如果無法取得加工方式，則用較大值
            int residue = 0;
            MacList macList = MacList.findFirst("machine_id = ?", machine_id);
            int c_scrapsize = macList.getInteger("c_scrapsize");
            int t_scrapsize = macList.getInteger("t_scrapsize");
            if (process.equals("走心")) {
                residue = c_scrapsize;
            } else if (process.equals("走刀")) {
                residue = t_scrapsize;
            } else {
                residue = Math.max(c_scrapsize, t_scrapsize);
            }

            Double m_usage = matStatus.getDouble("m_usage") == null ? 0 : matStatus.getDouble("m_usage");
            int m_pqty = matStatus.getInteger("m_pqty") == null ? 0 : matStatus.getInteger("m_pqty");
            Double m_ptime = matStatus.getDouble("m_ptime") == null ? 0 : matStatus.getDouble("m_ptime");

            // 取得單一機台派工對應的材料派工、明細、庫存(材料派工狀態不為取消並且不是退庫)，以材料派工時間倒序排序
            // 有可能會發生機台派工的狀態已經是生產中卻沒有材料派工，此時 woMMatLists == null
            List<WoMMatWoMMatListMatStock> woMMatLists = WoMMatWoMMatListMatStock.find(
                    "machine_id = ? AND order_id = ? AND wo_m_time = ? AND item_status <> 99 AND type <> 3 ORDER BY m_mat_time DESC",
                    machine_id, order_id, wo_m_time);
            Double use_piece = 0.0;
            // 領用材料可生產數
            int calcPartCount = 0;
            // 最近一筆材料派工材料長度
            int mat_length = 0;
            // 最近一筆材料派工材料條碼
            String last_mat_code = "";

            if (woMMatLists != null) {
                for (WoMMatWoMMatListMatStock woMMatList : woMMatLists) {
                    if (last_mat_code.equals("")) {
                        last_mat_code = woMMatList.getString("mat_code");
                    }

                    int local_mat_length = Integer.valueOf(woMMatList.getString("mat_length").replace("mm", ""));

                    if (mat_length == 0) {
                        mat_length = local_mat_length;
                    }
                    use_piece = woMMatList.getDouble("use_piece");

                    // 計算單筆材料派工儲位明細的可生產數
                    // ∑((派工儲位明細長度(MAT_STOCK.mat_length) - 殘材) / 單件用量(WO_M_STATUS.m_usage) *
                    // 派工支數(WO_M_Mat_List.use_piece))
                    log.info("local_mat_length = "+local_mat_length+" | residue = "+residue+" | m_usage = "+m_usage+" | use_piece = " + use_piece);
                    int partCountPerRecord = (int) Math.floor((local_mat_length - residue) / m_usage * use_piece);
                    calcPartCount += partCountPerRecord;
                }
            }
            log.info("calcPartCount = "+calcPartCount+" | m_pqty = "+m_pqty);
            // 剩餘材料可生產數 = 領用材料可生產數 - 實際已生產數
            int partCountDiff = calcPartCount - m_pqty;

            log.info("剩餘材料可生產數 partCountDiff = " + partCountDiff);
            log.info("領用材料可生產數 calcPartCount = " + calcPartCount);
            log.info("實際已生產數 m_pqty = " + m_pqty);

            // 剩餘材料可生產數
            resultMap.put("lastMProduct", partCountDiff);
            // 剩餘材料支數 = 剩餘材料可生產數 / (最後一筆派工儲位明細長度 - 殘材) / 單件用量(WO_M_STATUS.m_usage)
            resultMap.put("count", (int) (partCountDiff / ((mat_length - residue) / m_usage)));
            // 剩餘材料耗用時間 = 剩餘材料可生產數 * 標工(sec)
            resultMap.put("time", (int) (partCountDiff * m_ptime / 60));
            // 單支材料可生產數 for建議補料
            resultMap.put("singleProduct", (int) ((mat_length - residue) / m_usage));
            resultMap.put("product_id", product_id);
            resultMap.put("mat_code", last_mat_code);
            resultMap.put("process", process);
            return resultMap;
        }catch (Exception e){
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            log.info("Error : " + sw.toString());
            return null;
        }
    }

    @RequestMapping(value = "getBindStock", method = RequestMethod.GET)
    public RequestResult<?> getBindStock(@RequestParam("order_id") final String order_id) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Map<String, Object> result = new HashMap<>();
                    List<Map<String, Object>> poFileList = new ArrayList<>();
                    List<Map<String, Object>> stockInfoList = new ArrayList<>();
                    List<WoPoBinding> woPoBindingList = WoPoBinding.find("order_id = ? ", order_id);
                    if (woPoBindingList != null) {
                        for (WoPoBinding woPoBinding : woPoBindingList) {
                            String mstock_name = woPoBinding.getString("mstock_name");
                            String po_no = woPoBinding.getString("po_no");
                            String sup_id = woPoBinding.getString("sup_id");
                            String mat_code = woPoBinding.getString("mat_code");
                            Double bind_qty = woPoBinding.getDouble("bind_qty") == null ? 0.0
                                    : woPoBinding.getDouble("bind_qty");
                            Double use_qty = woPoBinding.getDouble("use_qty") == null ? 0.0
                                    : woPoBinding.getDouble("use_qty");
                            int w_p_status = woPoBinding.getInteger("w_p_status") == null ? 0
                                    : woPoBinding.getInteger("w_p_status");
                            String mat_id = mat_code.split("-")[1];
                            String mat_unit = MatProfile.findFirst("mat_id = ?", mat_id).getString("mat_unit");
                            Map<String, Object> poFileMap = new HashMap<>();
                            poFileMap.put("mstock_name", mstock_name);
                            poFileMap.put("po_no", po_no);
                            poFileMap.put("sup_id", sup_id);
                            poFileMap.put("mat_code", mat_code);
                            poFileMap.put("bind_qty", bind_qty);
                            poFileMap.put("use_qty", use_qty);
                            poFileMap.put("w_p_status", w_p_status);
                            poFileMap.put("mat_unit", mat_unit);
                            poFileList.add(poFileMap);

                            List<MatStock> matStocks = MatStock.find(
                                    "mstock_name = ? and po_no = ? and sup_id = ? and mat_code = ? group by location , mat_length",
                                    mstock_name, po_no, sup_id, mat_code);
                            for (MatStock matStock : matStocks) {
                                Map<String, Object> stockMap = new HashMap<>();
                                MatProfile matProfile = MatProfile.findFirst("mat_id = ? ", matStock.get("mat_id"));
                                String stock_pieceStr = matStock.getString("stock_piece").equals("") ? "0"
                                        : matStock.getString("stock_piece");
                                String shelf_time = matStock.getString("shelf_time");
                                String location = matStock.getString("location");
                                String mat_length = matStock.getString("mat_length");
                                Double stock_piece = Double.valueOf(stock_pieceStr);
                                Double lock_piece = matStock.getDouble("lock_piece") == null ? 0.0
                                        : matStock.getDouble("lock_piece");
                                Double mstock_qty = matStock.getDouble("mstock_qty") == null ? 0.0
                                        : matStock.getDouble("mstock_qty");
                                Double lock_qty = matStock.getDouble("lock_qty") == null ? 0.0
                                        : matStock.getDouble("lock_qty");
                                stockMap.put("mat_stock", mstock_name);
                                stockMap.put("po_no", po_no);
                                stockMap.put("shelf_time", shelf_time);
                                stockMap.put("sup_id", sup_id);
                                stockMap.put("mat_code", mat_code);
                                stockMap.put("location", location);
                                stockMap.put("mat_length", mat_length);
                                stockMap.put("stock_piece", stock_piece - lock_piece);
                                stockMap.put("stock_qty", mstock_qty - lock_qty);
                                stockInfoList.add(stockMap);
                            }
                        }
                    }

                    result.put("po_file", poFileList);
                    result.put("stock_info", stockInfoList);

                    return success(result);
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return fail(e.getMessage() + "error message : " + sw.toString());
        }
    }

    @RequestMapping(value = "feedSendWork", method = RequestMethod.GET)
    public RequestResult<?> feedSendWork(@RequestBody final Map data) {
        try {
            log.info(data.toString());
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    int result = 0;
                    int m_qty = Integer.valueOf(data.get("m_qty").toString());
                    int p_qty = Integer.valueOf(data.get("p_qty").toString());
                    int b_qty = Integer.valueOf(data.get("b_qty").toString());
                    int feeding_count = Integer.valueOf(data.get("feeding_count").toString());
                    int place_count = Integer.valueOf(data.get("place_count").toString());
                    int singleProduct = Integer.valueOf(data.get("singleProduct").toString());
                    int needCount = (m_qty - p_qty + b_qty) / singleProduct;
                    if (needCount < place_count) {
                        result = needCount - feeding_count;
                    } else {
                        result = place_count - feeding_count;
                    }
                    return success(result);
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/first-edit", method = RequestMethod.PUT)
    public RequestResult<?> firstEdit(@RequestBody final Map param) {
        String orderId = param.get("order_id").toString();
        String machineId = param.get("machine_id").toString();
        String woMTime = param.get("wo_m_time").toString();
        String mMatTime = param.get("m_mat_time").toString();
        List<String> cancel = (List<String>) param.get("cancel");
        List<Map> insert = (List<Map>) param.get("insert");
        String cancelStatus = "99";
        try {
            return ActiveJdbc.operTx(() -> {

                String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                Long now = System.currentTimeMillis();
                Timestamp currentTime = new Timestamp(now);

                if (cancel.size() > 0) {
                    for (String shelfTime : cancel) {
                        int WoMMatListUpateResult = WoMMatList.update("item_status=?, modify_by=?, modify_time=?",
                                "order_id=? AND machine_id=? AND wo_m_time=? AND m_mat_time=? AND shelf_time=?",
                                cancelStatus, user, currentTime, orderId, machineId, woMTime, mMatTime, shelfTime);
                        if (WoMMatListUpateResult < 0) {
                            throw new RuntimeException("WoMMatList update fail..." + "shelf_time=" + shelfTime);
                        }
                    }

                    List<Map> stockMatLists = StockMatList
                            .find("order_id=? and machine_id=? and wo_m_time=? and m_mat_time=? and shelf_time in "
                                    + Util.getSqlInSyntax(",", cancel), orderId, machineId, woMTime, mMatTime)
                            .toMaps();
                    WoMMatController.cancelMatListAndUpdateStock(stockMatLists, user, currentTime);
                }

                if (insert.size() > 0) {
                    for (Map map : insert) {
                        WoMMatList woMMatList = new WoMMatList();
                        map.put("order_id", orderId);
                        map.put("machine_id", machineId);
                        map.put("wo_m_time", woMTime);
                        map.put("m_mat_time", mMatTime);
                        map.put("item_status", "0");

                        map.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        map.put("create_time", new Timestamp(now));
                        map.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        map.put("modify_time", new Timestamp(now));

                        String matCode = map.get("mat_code").toString();
                        String shelfTime = map.get("shelf_time").toString();
                        double useQty = map.get("use_qty") == null ? 0
                                : Double.parseDouble(map.get("use_qty").toString());
                        double usePiece = map.get("use_piece") == null ? 0
                                : Double.parseDouble(map.get("use_piece").toString());
                        MatStock matStock = MatStock.findFirst("mat_code=? and shelf_time=?", matCode, shelfTime);

                        double lockQty = matStock.get("lock_qty") == null ? 0 : matStock.getDouble("lock_qty");
                        double lockPiece = matStock.get("lock_piece") == null ? 0 : matStock.getDouble("lock_piece");

                        lockQty += useQty;
                        lockPiece += usePiece;

                        matStock.setDouble("lock_qty", lockQty);
                        matStock.setDouble("lock_piece", lockPiece);

                        woMMatList.fromMap(map);
                        if (!woMMatList.insert()) {
                            throw new RuntimeException("WoMMatList insert fail=> params:" + map.toString());
                        } else {
                            if (!matStock.saveIt()) {
                                throw new RuntimeException("MatStock update fail=> params:" + map.toString());
                            }
                        }
                    }
                }
                return success(Base.findAll(getQueryViewResult(orderId, machineId, woMTime, mMatTime)));
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    private String getQueryViewResult(String orderId, String machineId, String woMTime, String mMatTime) {
        String sql = "SELECT * FROM a_huangliang_view_wo_m_mat_wo_m_mat_list_mat_stock " + "WHERE order_id = '"
                + orderId + "' AND " + "machine_id = '" + machineId + "' AND " + "wo_m_time = '" + woMTime + "' AND "
                + "m_mat_time = '" + mMatTime + "'";
        return sql;
    }

    private int getPutCount(String mat_code) {
        int result = 0;
        MatStock matStock = MatStock.findFirst("mat_code = ?", mat_code);
        if (matStock != null) {
            String mat_odStr = matStock.getString("mat_od");
            Double mat_od = Double.valueOf(mat_odStr.substring(2, mat_odStr.length()));
            if (mat_od > 1 && mat_od <= 3.05) {
                result = 300;
            } else if (mat_od > 3.05 && mat_od <= 5.05) {
                result = 200;
            } else if (mat_od > 5.05 && mat_od <= 8.05) {
                result = 150;
            } else if (mat_od > 8.05 && mat_od <= 11.05) {
                result = 100;
            } else if (mat_od > 11.05 && mat_od <= 14.05) {
                result = 80;
            } else if (mat_od > 14.05 && mat_od <= 17.05) {
                result = 50;
            } else if (mat_od > 17.05) {
                result = 30;
            }
        }
        return result;
    }

    static Map<String, Integer> getMaterialProduct(MatStatus matStatus) throws Exception {
        Map<String, Integer> resultMap = new HashMap<>();
        String machine_id = matStatus.getString("machine_id");
        String product_id = matStatus.getString("product_id");
        // String m_mat_time = matStatus.getString("m_mat_time");
        ProductProfile productProfile = ProductProfile.findFirst("product_id = ? ", product_id);
        String process = "";
        if (productProfile != null) {
            process = productProfile.getString("process");
        }

        MacList macList = MacList.findFirst("machine_id = ?", machine_id);
        int mat_length = Integer.valueOf(matStatus.getString("mat_length").replace("mm", ""));
        System.out.println("mat_length = " + mat_length);
        int residue = 0;
        if (process.equals("走心")) {
            residue = macList.getInteger("c_scrapsize");
        } else if (process.equals("走刀")) {
            residue = macList.getInteger("t_scrapsize");
        }
        System.out.println("residue = " + residue);
        Double m_usage = matStatus.getDouble("m_usage") == null ? 0 : matStatus.getDouble("m_usage");
        int m_pqty = matStatus.getInteger("m_pqty") == null ? 0 : matStatus.getInteger("m_pqty");
        Double m_ptime = matStatus.getDouble("m_ptime") == null ? 0 : matStatus.getDouble("m_ptime");
        int a2 = 0;

        System.out.println("m_usage = " + m_usage);
        // List<WoMMatList> woMMatLists = WoMMatList.find("machine_id = ? and m_mat_time
        // = ? group by order_id", machine_id, m_mat_time);
        List<WoMMatList> woMMatLists = WoMMatList.find("machine_id = ? group by order_id", machine_id);
        Double use_piece = 0.0;
        int a1 = 0;
        if (woMMatLists != null) {
            for (WoMMatList woMMatList : woMMatLists) {
                String order_id = woMMatList.getString("order_id");
                String wo_m_time = woMMatList.getString("wo_m_time");
                WoMStatus woMStatus = WoMStatus.findFirst("order_id = ? and wo_m_time = ? and machine_id = ?", order_id,
                        wo_m_time, machine_id);
                Double local_m_usage = woMStatus.getDouble("m_usage") == null ? 0 : woMStatus.getDouble("m_usage");
                String shelf_time = woMMatList.getString("shelf_time");
                MatStock matStock = MatStock.findFirst("shelf_time = ?", shelf_time);
                int local_mat_length = Integer.valueOf(matStock.getString("mat_length").replace("mm", ""));
                use_piece = woMMatList.getDouble("use_piece");
                System.out.println("use_piece = " + use_piece);
                // ∑((派工儲位明細長度(MAT_STOCK.mat_length)-殘材)/單件用量(WO_M_STATUS.m_usage)*派工支數(WO_M_Mat_List.use_piece))
                a1 = (int) Math.floor((local_mat_length - residue) / local_m_usage * use_piece);

                // 領用材料可生產數 可能多個
                a2 = a2 + a1;
            }
        }

        //  剩餘材料可生產數 = 領用材料可生產數 - 已生產數
        int a3 = a2 - m_pqty;

        System.out.println("a3 = " + a3);
        System.out.println("a2 = " + a2);
        System.out.println("m_pqty = " + m_pqty);

        // 剩餘材料可生產數
        resultMap.put("lastMProduct", a3);
        //  剩餘材料支數 = 剩餘材料可生產數/(最後一筆派工儲位明細長度-殘材)/單件用量(WO_M_STATUS.m_usage)
        resultMap.put("count", (int) (a3 / ((mat_length - residue) / m_usage)));
        //  剩餘材料耗用時間 = 剩餘材料可生產數 * 標工(sec)
        resultMap.put("time", (int) (a3 * m_ptime / 60));
        // 單支可生產數 for建議補料
        resultMap.put("singleProduct", (int) ((mat_length - residue) / m_usage));
        return resultMap;
    }

    class MQttObj {
        String message;

        MQttObj(String message) {
            this.message = message;
        }
    }
}