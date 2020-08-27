package com.servtech.servcloud.app.controller.huangliang_matStock;

import com.servtech.servcloud.app.controller.huangliang_matStock.util.RecordAfter;
import com.servtech.servcloud.app.model.huangliang_matStock.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/huangliangMatStock/wo_list")
public class WoListController {

    @Autowired
    private HttpServletRequest request;

    // 按下「取消」後的行為
    @RequestMapping(value = "/cancel", method = RequestMethod.PUT)
    public RequestResult<?> cancel(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                Map<String, Object> order = changeWoListStatus(data.get("order_id").toString(), 99);

                // 查 生產指令綁定採購單 符合order_id的全部資料
                List<Map> bindingData = WoPoBinding.find("order_id=?", data.get("order_id")).toMaps();
                for (Map binding : bindingData) {
                    // 拿到 採購單 目前的狀態
                    Map<String, Object> po = PoFile.findFirst("mstock_name=? AND po_no=? AND sup_id=? AND mat_code=?",
                            binding.get("mstock_name"), binding.get("po_no"), binding.get("sup_id"), binding.get("mat_code")).toMap();

                    // 把 生產指令綁定採購單 中的綁定數量，從 採購單 綁定數量移除
                    Double result = Double.parseDouble(po.get("bind_qty").toString()) - Double.parseDouble(binding.get("bind_qty").toString());
                    if (result < 0) result = 0.0;
                    po.put("bind_qty", result);

                    PoFile poFile = new PoFile().fromMap(po);
                    poFile.saveIt();

                    binding.put("bind_qty", 0);
                    binding.put("w_p_status", 0); // 狀態為解除綁定

                    WoPoBinding woPoBinding = new WoPoBinding().fromMap(binding);
                    woPoBinding.saveIt();
                }
                return RequestResult.success(order);
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    // 按下「結案」後的行為
    @RequestMapping(value = "/close", method = RequestMethod.PUT)
    public RequestResult<?> close(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

                // 判斷是否在 生產指令機台派工 的此order_id都已結案或已取消
                boolean allClosed = true;
                List<Map> woMachine = WoMStatus.find("order_id=?", data.get("order_id")).toMaps();
                for (Map<String, Object> machineData : woMachine) {
                    if (!machineData.get("w_m_status").toString().equals("9") && !machineData.get("w_m_status").toString().equals("99"))
                        allClosed = false;
                }

                if (allClosed) {
                    // 將 生產指令機台派工 狀態不等於9的變更成9(結案)
//                    for (Map<String, Object> machineData : woMachine) {
//                        if (!machineData.get("w_m_status").toString().equals("9")) {
//                            machineData.put("w_m_status", 9);
//                            RecordAfter.putModify(machineData, login_user, System.currentTimeMillis());
//                            WoMStatus machineStatus = new WoMStatus().fromMap(machineData);
//                            machineStatus.saveIt();
//                        }
//                    }

                    List<Map> woPoBinding = WoPoBinding.find("order_id=?", data.get("order_id")).toMaps();
                    for (Map<String, Object> bindingData : woPoBinding) {
                        // 拿到 採購單 目前的狀態
                        Map<String, Object> po = PoFile.findFirst("mstock_name=? AND po_no=? AND sup_id=? AND mat_code=?",
                                bindingData.get("mstock_name"), bindingData.get("po_no"), bindingData.get("sup_id"), bindingData.get("mat_code")).toMap();

                        // 把 生產指令綁定採購單 中的綁定數量，從 採購單 綁定數量移除
                        Double sub = Double.parseDouble(bindingData.get("bind_qty").toString()) - Double.parseDouble(bindingData.get("use_qty").toString());
                        Double result = Double.parseDouble(po.get("bind_qty").toString()) - sub;
                        if (result < 0) result = 0.0;
                        po.put("bind_qty", result);

                        PoFile poFile = new PoFile().fromMap(po);
                        poFile.saveIt();

                        // 將 生產指令綁定採購單 的狀態全都變更成0(解除綁定)
                        bindingData.put("w_p_status", 0);

                        // 判斷在 生產指令綁定採購單 裡的此order_id是否已領數量<綁定數量，如果符合就將綁定數量改成已領數量
                        if (Double.parseDouble(bindingData.get("use_qty").toString()) < Double.parseDouble(bindingData.get("bind_qty").toString()))
                            bindingData.put("bind_qty", bindingData.get("use_qty"));

                        RecordAfter.putModify(bindingData, login_user, System.currentTimeMillis());
                        WoPoBinding binding = new WoPoBinding().fromMap(bindingData);
                        binding.saveIt();
                    }
                    return RequestResult.success(changeWoListStatus(data.get("order_id").toString(), 9));
                } else return RequestResult.success("not close all");
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    // 按下「取消結案」後的行為
    @RequestMapping(value = "/restart", method = RequestMethod.PUT)
    public RequestResult<?> restart(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                return RequestResult.success(changeWoListStatus(data.get("order_id").toString(), 2));
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }

    Map<String, Object> changeWoListStatus(String orderId, int status) {
        String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

        // 拿到 生產指令 目前的狀態
        Map<String, Object> order = WoList.findFirst("order_id=?", orderId).toMap();

        // 紀錄 生產指令狀態變更
        Map<String, Object> logData = new HashMap<>();
        logData.put("order_id", orderId);
        logData.put("previous_wo_status", order.get("wo_status"));
        logData.put("changed_wo_status", status);
        RecordAfter.putCreate(logData, login_user, System.currentTimeMillis());
        WoListChgLog woListChgLog = new WoListChgLog().fromMap(logData);
        woListChgLog.insert();


        // 更新 生產指令 狀態
        order.put("wo_status", status);
        RecordAfter.putModify(order, login_user, System.currentTimeMillis());
        WoList woList = new WoList().fromMap(order);
        woList.saveIt();

        return order;
    }
}
