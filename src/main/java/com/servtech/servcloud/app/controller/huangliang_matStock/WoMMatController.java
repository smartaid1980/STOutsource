package com.servtech.servcloud.app.controller.huangliang_matStock;

import com.servtech.servcloud.app.controller.huangliang_matStock.util.RecordAfter;
import com.servtech.servcloud.app.model.huangliang_matStock.*;
import com.servtech.servcloud.app.model.huangliang_matStock.view.StockMatList;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/huangliangMatStock/wo_m_mat")
public class WoMMatController {

    @Autowired
    private HttpServletRequest request;

    // 透過訂單編號order_id找到材料條碼(要自行組合)、綁定物料、未綁定物料、暫入上架
    @RequestMapping(method = RequestMethod.GET)
    public RequestResult<?> read(@RequestParam("order_id") final String orderId) {
        try {
            return ActiveJdbc.operTx(() -> {
                Map<String, Object> data = new HashMap<>();
                String mstockName = orderId.substring(0, 1).equals("G") ? "GOLF" : "五金";
                WoPoBinding woPoBinding = WoPoBinding.findFirst("order_id = ? AND mstock_name = ? ORDER BY create_time ASC", orderId, mstockName);
                List<String> matCodes = new ArrayList<>();
                
                if (woPoBinding != null) {
                  matCodes.add(woPoBinding.getString("mat_code"));
                } else {
                  // 拿到 生產指令 中的此order_id資料
                  Map<String, Object> woList = WoList.findFirst("order_id=?", orderId).toMap();
                  // 透過查出的管編編號找到 管編生產條件設定
                  List<ProductProfile> productProfiless = ProductProfile.find("product_id=?", woList.get("product_id"));
                  // 取得所有材料條碼mat_code
                  for (ProductProfile product : productProfiless)
                    matCodes.add(getMaterialCode(product.toMap()));
                }
                
                data.put("mat_codes", matCodes);

                // 取得綁定物料
                data.put("binding_mats", getBindingData(orderId));

                // 取得未綁定物料
                if (matCodes.size() > 0)
                    data.put("unbinding_mats", getUnbindingData(mstockName, matCodes.get(0)));
                else
                    data.put("unbinding_mats", new ArrayList<>());

                // 取得暫入上架
                data.put("temp_stocks", tempStockData(orderId));

                return RequestResult.success(data);
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    // 透過訂單編號order_id、材料條碼mat_code找到未綁定物料
    @RequestMapping(value = "unbindingData", method = RequestMethod.GET)
    public RequestResult<?> unbindingData(@RequestParam("mstock_name") final String mstockName,
                                          @RequestParam("mat_code") final String matCode) {
        try {
            return ActiveJdbc.operTx(() -> {
                return RequestResult.success(getUnbindingData(mstockName, matCode));
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    // 新增 機台材料派工 跟 機台材料派工儲位明細
    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                Long now = System.currentTimeMillis();

                data.put("m_mat_time", new java.sql.Timestamp(now));
                RecordAfter.putCreateAndModify(data, login_user, now);

                // 存入 機台材料派工
                WoMMat woMMat = new WoMMat().fromMap(data);
                woMMat.insert();

                for (Map<String, Object> material : (List<Map>) data.get("materials")) {
                    material.put("order_id", data.get("order_id"));
                    material.put("machine_id", data.get("machine_id"));
                    material.put("wo_m_time", data.get("wo_m_time"));
                    material.put("m_mat_time", new java.sql.Timestamp(now));
                    RecordAfter.putCreateAndModify(material, login_user, now);

                    // 存入 機台材料派工儲位明細
                    WoMMatList woMMatList = new WoMMatList().fromMap(material);
                    woMMatList.insert();

                    // 更新 庫存表 的派工支數鎖定
                    Map<String, Object> stock = MatStock.findFirst("shelf_time=? AND mat_code=?",
                            material.get("shelf_time"), material.get("mat_code")).toMap();
                    RecordAfter.putModify(stock, login_user, now);
                    Double lock = 0.0;
                    Double use = 0.0;
                    if (stock.get("lock_qty") != null)
                        lock = Double.parseDouble(stock.get("lock_qty").toString());
                    if (material.get("use_qty") != null)
                        lock = lock + Double.parseDouble(material.get("use_qty").toString());
                    if (stock.get("lock_piece") != null)
                        use = Double.parseDouble(stock.get("lock_piece").toString());
                    if (material.get("use_piece") != null)
                        use = use + Double.parseDouble(material.get("use_piece").toString());
                    stock.put("lock_qty", lock);
                    stock.put("lock_piece", use);
                    MatStock matStock = new MatStock().fromMap(stock);
                    matStock.saveIt();
                }
                return RequestResult.success("派工成功");
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    // 機台材料派工取消
    @RequestMapping(value = "/cancel", method = RequestMethod.PUT)
    public RequestResult<?> cancel(@RequestBody final Map param) {
        String orderId = param.get("order_id").toString();
        String machineId = param.get("machine_id").toString();
        String woMTime = param.get("wo_m_time").toString();
        String mMatTime = param.get("m_mat_time").toString();
        try {
            return ActiveJdbc.operTx(() -> {
                String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                Long now = System.currentTimeMillis();
                Timestamp currentTime = new Timestamp(now);
                String cancelStatus = "99";
                int WoMMatUpateResult = WoMMat.update(
                        "m_mat_status=?, modify_by=?, modify_time=?",
                        "order_id=? AND machine_id=? AND wo_m_time=? AND m_mat_time=?",
                        cancelStatus, user, now, orderId, machineId, woMTime, mMatTime);
                int WoMMatListUpateResult = WoMMatList.update(
                        "item_status=?, modify_by=?, modify_time=?",
                        "order_id=? AND machine_id=? AND wo_m_time=? AND m_mat_time=?",
                        cancelStatus, user, currentTime, orderId, machineId, woMTime, mMatTime);
                if (WoMMatUpateResult < 0 || WoMMatListUpateResult < 0) {
                    throw new RuntimeException("WoMMatList.update fail...");
                }

                List<Map> stockMatLists = StockMatList.find("order_id=? AND machine_id=? AND wo_m_time=? AND m_mat_time=?", orderId, machineId, woMTime, mMatTime).toMaps();
                cancelMatListAndUpdateStock(stockMatLists, user, currentTime);
                return RequestResult.success("cancel success");
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    public static void cancelMatListAndUpdateStock(List<Map> stockMatLists, String user, Timestamp currentTime) {
        for (Map stockMatList : stockMatLists) {
            if (stockMatList.get("lock_qty") != null && stockMatList.get("lock_piece") != null) {
                int lockQty = ((BigDecimal) stockMatList.get("lock_qty")).intValue();
                int lockPiece = ((BigDecimal) stockMatList.get("lock_piece")).intValue();
                int useQty = stockMatList.get("use_qty") == null ? 0 : ((BigDecimal) stockMatList.get("use_qty")).intValue();
                int usePiece = stockMatList.get("use_piece") == null ? 0 : ((BigDecimal) stockMatList.get("use_piece")).intValue();
                int qtyDiff = lockQty - useQty;
                int pieceDiff = lockPiece - usePiece;
                String matCode = stockMatList.get("mat_code").toString();
                String shelfTime = stockMatList.get("shelf_time").toString();
                int matStockUpdateReasult = MatStock.update(
                        "lock_qty=?,lock_piece=?,modify_by=?,modify_time=?",
                        "mat_code=? AND shelf_time=?",
                        qtyDiff, pieceDiff, user, currentTime, matCode, shelfTime);
                if (matStockUpdateReasult < 0) {
                    throw new RuntimeException("MatStock.update fail...");
                }

            }
        }
    }

    // 組合材料條碼
    private String getMaterialCode(Map data) {
        String matCode = "M";
//        if (data.get("mstock_name") != null) matCode += data.get("mstock_name").toString().charAt(0);
        if (data.get("mat_id") != null) {
            if (data.get("mat_id").toString().length() > 10)
                matCode += "-" + data.get("mat_id").toString().substring(0, 10);
            else
                matCode += "-" + data.get("mat_id").toString();
        }
        if (data.get("mat_shape") != null) matCode += "-" + data.get("mat_shape").toString();
        if (data.get("mat_dim") != null) {
            String matDim = data.get("mat_dim").toString();
            String value = "";
            BigDecimal dim = new BigDecimal(matDim);
            if (matDim.matches("[0-9]+.[0]+")) {
                // 小數點後全是0，只保留小數點後一位
                dim = dim.setScale(1);
            } else if (matDim.matches("[0-9]+.[0-9]+")) {
                // 小數點超過三位，無條件捨去(且去除多餘的0)
                dim = dim.setScale(3, BigDecimal.ROUND_DOWN).stripTrailingZeros();
            }

            if (matDim.split("\\.")[0].length() < 2) {
                value = "0";
            }
            matCode += "-" + value + dim;
        }
        return matCode;
    }

    // 找到此訂單編號的所有材料資料
    private List<Map<String, Object>> getBindingData(String orderId) {
        // 取得符合order_id綁定狀態為已綁定的 生產指令綁定採購單
        List<WoPoBinding> woPoBinding = WoPoBinding.find("order_id=? AND w_p_status=?", orderId, 1);
        List<Map<String, Object>> bindings = new ArrayList<>();
        for (WoPoBinding bind : woPoBinding) {
            // 取得採購單、材料編碼找到 庫存表 裡的資料
            List<Map> matStocks = MatStock.find("mstock_name=? AND po_no=? AND sup_id=? AND mat_code=? AND (mstock_qty>lock_qty OR lock_qty IS NULL)",
                    bind.get("mstock_name"), bind.get("po_no"), bind.get("sup_id"), bind.get("mat_code")).toMaps();
            for (Map stock : matStocks) {
                // 帶入 生產指令綁定採購單 得到的已領數量
                stock.put("use_qty", bind.get("use_qty"));
                stock.put("bind_qty", bind.get("bind_qty"));
                bindings.add(stock);
            }
        }
        return bindings;
    }

    // 找到此訂單編號原此料條碼綁定狀態是綁定的其他全部資料
    private List<Map> getUnbindingData(String mstockName, String matCode) {
//        List<Map<String, Object>> unBindings = new ArrayList<>();

        // 取得所有綁定狀態為未綁定的 生產指令綁定採購單
        List<Map> requestData = Base.findAll("SELECT b.*, a.mat_code mc FROM a_huangliang_mat_stock b\n" +
                        "LEFT JOIN ((\n" +
                        "  SELECT c.mat_code, c.sup_id, c.mstock_name, c.po_no FROM a_huangliang_wo_po_binding c\n" +
                        "  WHERE c.mat_code = ?\n" +
                        "    AND c.mstock_name = ?\n" +
                        "    AND c.w_p_status = 1)) a ON a.mat_code = b.mat_code \n" +
                        "  AND a.mstock_name = b.mstock_name \n" +
                        "  AND a.sup_id = b.sup_id \n" +
                        "  AND a.po_no = b.po_no \n" +
                        "WHERE b.mat_code = ?\n" +
                        "  AND b.mstock_name = ?\n" +
                        "  AND a.mat_code IS null\n" + 
                        "  AND (b.mstock_qty>b.lock_qty OR b.lock_qty IS NULL)",
                matCode, mstockName, matCode, mstockName);
        // 取得所有綁定狀態為未綁定的 生產指令綁定採購單
//        List<WoPoBinding> woPoBindingBind = WoPoBinding.find("mat_code=? AND w_p_status=?", matCode, 0);
//        for (WoPoBinding bind : woPoBindingBind) {
//            // 取得材料庫、採購單、供應商、材料編碼找到 庫存表 裡的資料
//            List<Map> matStocks = MatStock.find("mstock_name=? AND po_no!=? AND sup_id!=? AND mat_code!=?",
//                    bind.get("mstock_name"), bind.get("po_no"), bind.get("sup_id"), bind.get("mat_code")).toMaps();
//            for (Map stock : matStocks) {
//                unBindings.add(stock);
//            }
//        }
        return requestData;
    }

    // 找到此原料條碼綁定狀態是綁定的其他全部資料
    private List<Map<String, Object>> tempStockData(String orderId) {
        // 取得符合order_id的 生產指令綁定採購單
        List<WoPoBinding> woPoBindingBind = WoPoBinding.find("order_id=?", orderId);
        List<Map<String, Object>> stocks = new ArrayList<>();
        for (WoPoBinding bind : woPoBindingBind) {
            // 取得材料庫、採購單、供應商、材料編碼找找到 採購單記錄檔 裡的資料
            List<Map> poTempStocks = PoTempStock.find("mstock_name=? AND po_no=? AND sup_id=? AND mat_code=? AND status IN (0, 1, 2, 3)",
                    bind.get("mstock_name"), bind.get("po_no"), bind.get("sup_id"), bind.get("mat_code")).toMaps();
            for (Map stock : poTempStocks) {
                stocks.add(stock);
            }
        }
        return stocks;
    }
}
