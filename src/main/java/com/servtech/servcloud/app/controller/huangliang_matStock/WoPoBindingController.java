package com.servtech.servcloud.app.controller.huangliang_matStock;

import com.servtech.servcloud.app.controller.huangliang_matStock.util.RecordAfter;
import com.servtech.servcloud.app.model.huangliang_matStock.PoFile;
import com.servtech.servcloud.app.model.huangliang_matStock.WoPoBinding;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/huangliangMatStock/wo_po_binding")
public class WoPoBindingController {

    @Autowired
    private HttpServletRequest request;

    // 生產指令綁定採購單
    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                List<Map> poFiles = new ArrayList<>();

                List<Map> pos = (List<Map>) data.get("pos");
                for (Map<String, Object> po : pos) {
                    // 計算所有相同材料庫名稱、採購單、廠商代碼和材料條碼的綁定使用量
                    boolean exists = false;
                    for (Map<String, Object> poFile : poFiles) {
                        if (poFile.get("mstock_name").toString().equals(po.get("mstock_name").toString()) &&
                                poFile.get("po_no").toString().equals(po.get("po_no").toString()) &&
                                poFile.get("sup_id").toString().equals(po.get("sup_id").toString()) &&
                                poFile.get("mat_code").toString().equals(po.get("mat_code").toString())) {
                            poFile.put("bind_qty", Double.parseDouble(po.get("bind_qty").toString()) + Double.parseDouble(poFile.get("bind_qty").toString()));
                            exists = true;
                        }
                    }
                    if (!exists) {
                        Map<String, Object> poFile = new HashMap<>();
                        poFile.put("mstock_name", po.get("mstock_name"));
                        poFile.put("po_no", po.get("po_no"));
                        poFile.put("sup_id", po.get("sup_id"));
                        poFile.put("mat_code", po.get("mat_code"));
                        poFile.put("bind_qty", po.get("bind_qty"));
                        poFiles.add(poFile);
                    }

                    // 建立綁定資料至 生產指令綁定採購單
                    po.put("order_id", data.get("order_id"));
                    po.put("w_p_status", 1);
                    RecordAfter.putCreateAndModify(po, login_user, System.currentTimeMillis());
                    WoPoBinding binding = new WoPoBinding().fromMap(po);
                    binding.insert();
                }

                for (Map<String, Object> po : poFiles) {
                    // 拿到 採購單暫入主檔 此筆資料目前狀態
                    Map<String, Object> p = PoFile.findFirst("mstock_name=? and po_no=? and sup_id=? and mat_code=?", po.get("mstock_name"), po.get("po_no"), po.get("sup_id"), po.get("mat_code")).toMap();

                    // 更新綁定數量至 採購單暫入主檔
                    po.put("bind_qty", Double.parseDouble(p.get("bind_qty").toString()) + Double.parseDouble(po.get("bind_qty").toString()));
                    RecordAfter.putModify(po, login_user, System.currentTimeMillis());
                    PoFile poFile = new PoFile().fromMap(po);
                    poFile.saveIt();
                }

                // 查 生產指令綁定採購單 符合order_id的全部資料
                List<Map> bindingData = WoPoBinding.find("order_id=? ORDER BY create_time DESC", data.get("order_id")).toMaps();
                List<Map> bindedOrderId = new ArrayList<>();
                // 查綁定的採購單除了本身還有被哪張生產指令綁定
                for (Map po : pos) {
                  Map bindedMap = new HashMap<>();
                  List<String> orderIds = new ArrayList<>();
                  bindedMap.put("po_no", po.get("po_no"));
                  bindedMap.put("sup_id", po.get("sup_id"));
                  bindedMap.put("mat_code", po.get("mat_code"));
                  List<Map> orderId = WoPoBinding.find("po_no = ? AND sup_id = ? AND mat_code = ? AND w_p_status = ? AND order_id != ?", 
                    po.get("po_no"), 
                    po.get("sup_id"), 
                    po.get("mat_code"), 
                    1, 
                    data.get("order_id")).toMaps();
                  bindedMap.put("orderIds", orderId);
                  bindedOrderId.add(bindedMap);
                }
                Map response = new HashMap<>();
                response.put("bindingData", bindingData);
                response.put("bindedOrderId", bindedOrderId);
                return RequestResult.success(response);
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    // 修改 生產指令綁定採購單 和 採購單 綁定數量
    @RequestMapping(method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

                // 拿到目前的 生產指令綁定採購單
                Map<String, Object> bind = WoPoBinding.findFirst("order_id=? AND sup_id=? AND mstock_name=? AND po_no=? AND mat_code=?",
                        data.get("order_id"), data.get("sup_id"), data.get("mstock_name"), data.get("po_no"), data.get("mat_code")).toMap();
                // 拿到目前的 採購單
                Map<String, Object> file = PoFile.findFirst("sup_id=? AND mstock_name=? AND po_no=? AND mat_code=?",
                        data.get("sup_id"), data.get("mstock_name"), data.get("po_no"), data.get("mat_code")).toMap();

                // 判斷兩筆資料都有才去調整綁定數量
                if (bind != null && file != null) {
                    // 建立要回傳的map
                    Map<String, Object> requestData = new HashMap<>();
                    // 拿到要修改的綁定數量
                    Double dataBindQty = Double.parseDouble(data.get("bind_qty").toString());
                    // 先判斷數量是不是合理的
                    if (dataBindQty < Double.parseDouble(bind.get("use_qty").toString())) {
                        requestData.put("errorType", 1);
                        requestData.put("errorMsg", "綁定數量不可小於已領數量" + bind.get("use_qty"));
                        return RequestResult.fail(requestData);
                    } else if (dataBindQty > Double.parseDouble(file.get("po_qty").toString())) {
                        requestData.put("errorType", 2);
                        requestData.put("errorMsg", "綁定數量不可大於採購數量" + file.get("po_qty"));
                        return RequestResult.fail(requestData);
                    } else {
                        // 取得目前綁定數量跟修改數量的差
                        Double sub = dataBindQty - Double.parseDouble(bind.get("bind_qty").toString());

                        // 更新 生產指令綁定採購單
                        RecordAfter.putModify(bind, login_user, System.currentTimeMillis());
                        bind.put("bind_qty", dataBindQty);
                        WoPoBinding woPoBinding = new WoPoBinding().fromMap(bind);
                        woPoBinding.saveIt();

                        // 更新 採購單
                        RecordAfter.putModify(file, login_user, System.currentTimeMillis());
                        file.put("bind_qty", Double.parseDouble(file.get("bind_qty").toString()) + sub);
                        PoFile poFile = new PoFile().fromMap(file);
                        poFile.saveIt();

                        // 把更新的 生產指令綁定採購單 和 採購單 帶入回傳資料
                        requestData.put("wo_po_binding", bind);
                        requestData.put("po_file", file);
                        return RequestResult.success(requestData);
                    }
                } else return RequestResult.fail("無此資料");
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    // 查詢可綁定的採購單
    @RequestMapping(method = RequestMethod.GET)
    public RequestResult<?> read(@RequestParam("order_id") final String orderId,
                                 @RequestParam("mstock_name") final String mstockName,
                                 @RequestParam("mat_code") final String matCode) {
        try {
            return ActiveJdbc.operTx(() -> {
                List<Map> requestData = Base.findAll("SELECT *\n" +
                                "FROM a_huangliang_po_file a\n" +
                                "WHERE NOT EXISTS (SELECT 1\n" +
                                "  FROM a_huangliang_wo_po_binding\n" +
                                "  WHERE mat_code = a.mat_code\n" +
                                "    AND mstock_name = a.mstock_name\n" +
                                "    AND po_no = a.po_no\n" +
                                "    AND sup_id = a.sup_id\n" +
                                "    AND order_id = ?)\n" +
                                "  AND mstock_name = ?\n" +
                                "  AND mat_code = ?\n" +
                                "  AND bind_qty < po_qty",
                        orderId, mstockName, matCode);
                return RequestResult.success(requestData);
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }
}
