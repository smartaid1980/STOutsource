package com.servtech.servcloud.app.controller.chengshiu;

import com.servtech.servcloud.app.model.chengshiu.AlertLog;
import com.servtech.servcloud.app.model.chengshiu.MaintainSetting;
import com.servtech.servcloud.app.model.chengshiu.MaintainSettingAgv;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Jenny on 2017/11/12.
 */

@RestController
@RequestMapping("/chengshiu/alertlog")
public class ChengShiuAlertLog {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(ChengShiuAlertLog.class);
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/confirm", method = RequestMethod.POST)
    public RequestResult<?> confirm(@RequestParam final String logId) {
        try {
            return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {

                    //使用者手動把通知關閉的動作當成是已保養, 才去更新下次保養值
                    List<Map> findAlertLog = AlertLog.find("log_id = ?", logId).toMaps();
                    String typeId = findAlertLog.get(0).get("type_id").toString();

                    if (typeId.equals("A") || typeId.equals("B")) {

                        String valueAct = findAlertLog.get(0).get("value_act").toString();
                        String machineId = findAlertLog.get(0).get("machine_id").toString();
                        String ruleId = findAlertLog.get(0).get("rule_id").toString();
                        List<Map> queryMaSetting = MaintainSetting.find("rule_id = ?", ruleId).toMaps();
                        String cycle =  queryMaSetting.get(0).get("cycle").toString();

                        MaSetting maSetting = new MaSetting();
                        maSetting.setCycle(cycle);
                        maSetting.setMachineId(machineId);
                        maSetting.setRuleId(ruleId);
                        maSetting.setValueAct(valueAct);

                        if (typeId.equals("A")) {
                            updateNextMa(maSetting);
                        }

                        if (typeId.equals("B")) {
                            updateNextMaAgv(maSetting);
                        }
                    }

                    AlertLog alertLog = AlertLog.findById(logId);
                    alertLog.set("is_close", "Y");
                    alertLog.set("close_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    alertLog.set("close_time", new Timestamp(System.currentTimeMillis()));
                    alertLog.set("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    alertLog.set("modify_time", new Timestamp(System.currentTimeMillis()));
                    if (alertLog.saveIt()) {
                        return success(logId + " confirmed!");
                    } else {
                        return fail("Save alertLog failed!");
                    }

                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    private void updateNextMa(MaSetting maSetting) {
        String cycle = maSetting.getCycle();
        String valueAct = maSetting.getValueAct();
        String ruleId = maSetting.getRuleId();

        int nextMa = Integer.parseInt(cycle) + Math.round(Float.parseFloat(valueAct));

        List<Map> findMaSetting = MaintainSetting.find("rule_id = ?", ruleId).toMaps();
        Map resultMaSetting = findMaSetting.get(0);
        resultMaSetting.put("next_ma", nextMa);
        resultMaSetting.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
        resultMaSetting.put("modify_time", new Timestamp(System.currentTimeMillis()));

        MaintainSetting maintainSetting = new MaintainSetting();
        maintainSetting.fromMap(resultMaSetting);
        if (maintainSetting.saveIt()) {
            log.info("update next_ma success");
        }
    }

    private void updateNextMaAgv(MaSetting maSetting) {

        String cycle = maSetting.getCycle();
        String valueAct = maSetting.getValueAct();
        String ruleId = maSetting.getRuleId();
        String machineId = maSetting.getMachineId();
        float nextMa = Float.parseFloat(cycle) + Float.parseFloat(valueAct);

        List<Map> findMaSettingAgv = MaintainSettingAgv.find("rule_id = ? AND machine_id = ?", ruleId, machineId).toMaps();
        Map resultMaSettingAgv = findMaSettingAgv.get(0);
        resultMaSettingAgv.put("next_ma", nextMa);
        resultMaSettingAgv.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
        resultMaSettingAgv.put("modify_time", new Timestamp(System.currentTimeMillis()));

        MaintainSettingAgv maintainSettingAgv = new MaintainSettingAgv();
        maintainSettingAgv.fromMap(resultMaSettingAgv);
        if (maintainSettingAgv.saveIt()) {
            log.info("update next_ma_agv success");
        }
    }

    private class MaSetting {
        private String ruleId;
        private String cycle;
        private String valueAct;
        private String machineId;

        public String getRuleId() {
            return ruleId;
        }

        public void setRuleId(String ruleId) {
            this.ruleId = ruleId;
        }

        public String getCycle() {
            return cycle;
        }

        public void setCycle(String cycle) {
            this.cycle = cycle;
        }

        public String getValueAct() {
            return valueAct;
        }

        public void setValueAct(String valueAct) {
            this.valueAct = valueAct;
        }

        public String getMachineId() {
            return machineId;
        }

        public void setMachineId(String machineId) {
            this.machineId = machineId;
        }
    }

}
