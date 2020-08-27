package com.servtech.servcloud.app.controller.chengshiu;

import com.servtech.servcloud.app.model.chengshiu.Agv;
import com.servtech.servcloud.app.model.chengshiu.MaintainSettingAgv;
import com.servtech.servcloud.app.model.chengshiu.MaintainSetting;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import static org.springframework.web.bind.annotation.RequestMethod.*;
import static com.servtech.servcloud.core.util.RequestResult.*;

/**
 * Created by Raynard on 2017/11/14.
 */
@RestController
@RequestMapping("/chengshiu/masetting")
public class ChengShiuMaSetting {

    private final org.slf4j.Logger log = LoggerFactory.getLogger(ChengShiuMaSetting.class);
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;


    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    boolean insertMaSettingIsSuccessFul = true;
                    boolean insertAgvMaSettingIsSuccessFul = true;
                    MaintainSetting maintainSetting = new MaintainSetting();

                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    maintainSetting.fromMap(data);
                    insertMaSettingIsSuccessFul = maintainSetting.insert();

                    if (data.get("type").equals("A")) {
                        MaintainSettingAgv maintainSettingAgv = new MaintainSettingAgv();
                        List<Map> queryMaintainSetting = MaintainSetting.findBySQL("SELECT * FROM a_chengshiu_ma_setting  ORDER BY rule_id DESC LIMIT 0,1").toMaps();
                        List<Map> queryAgvs = Agv.findAll().toMaps();
                        for (Map agv : queryAgvs) {
                            String ruleId = queryMaintainSetting.get(0).get("rule_id").toString();
                            String machineId = agv.get("agv_id").toString();
                            data.put("rule_id", ruleId);
                            data.put("machine_id", machineId);
                            maintainSettingAgv.fromMap(data);
                            if (!maintainSettingAgv.insert()) {
                                String errMsg = new StringBuilder()
                                        .append("Insert ma_setting_agv fail (")
                                        .append("rule_id : " + ruleId)
                                        .append("machine_id : " + machineId + ")")
                                        .toString();
                                log.info(errMsg);
                                insertAgvMaSettingIsSuccessFul = false;
                            }
                        }
                    }

                    if (insertMaSettingIsSuccessFul && insertAgvMaSettingIsSuccessFul) {
                        return success(maintainSetting.getString("rule_id"));
                    } else {
                        return fail("新增失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/readA", method = GET)
    public RequestResult<?> readA() {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                List<Map> resultMap = MaintainSetting.find("type=?", "A").include().toMaps();
                return success(resultMap);
            }
        });
    }

    @RequestMapping(value = "/readM", method = GET)
    public RequestResult<?> readM() {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                List<Map> resultMap = MaintainSetting.find("type <> ? AND type <> ? ", "A", "M4").include().toMaps();
                return success(resultMap);
            }
        });
    }


    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {

                boolean updateMaSettingIsSuccessFul = true;
                boolean updateAgvMaSettingIsSuccessFul = true;
                String ruleId = data.get("rule_id").toString();
                List<Map> queryMaSetting = MaintainSetting.find("rule_id = ?", ruleId).toMaps();
                String queryCycle = queryMaSetting.get(0).get("cycle").toString();
                String cycle = data.get("cycle").toString();

                if (Float.parseFloat(queryCycle) != Float.parseFloat(cycle)) {
                    data.put("next_ma", null);
                }

                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                MaintainSetting maintainSetting = new MaintainSetting();
                maintainSetting.fromMap(data);
                updateMaSettingIsSuccessFul = maintainSetting.saveIt();

                if (data.get("type").equals("A")) {
                    MaintainSettingAgv maintainSettingAgv = new MaintainSettingAgv();
                    List<Map> queryAgvs = Agv.findAll().toMaps();
                    for (Map agv : queryAgvs) {
                        String machineId = agv.get("agv_id").toString();
                        data.put("machine_id", machineId);

                        maintainSettingAgv.fromMap(data);

                        if (!maintainSettingAgv.saveIt()) {
                            String errMsg = new StringBuilder()
                                    .append("Update ma_setting_agv fail (")
                                    .append("rule_id : " + data.get("rule_id").toString())
                                    .append("machine_id : " + machineId + ")")
                                    .toString();
                            log.info(errMsg);
                            updateMaSettingIsSuccessFul = false;
                        }
                    }
                }

                if (updateAgvMaSettingIsSuccessFul && updateMaSettingIsSuccessFul) {
                    return success(maintainSetting.getString("rule_id"));
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }

    @RequestMapping(value = "/delete", method = DELETE)
    public RequestResult<Void> delete(@RequestBody final Object[] idList) {
        return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {
                MaintainSettingAgv.delete("rule_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                MaintainSetting.delete("rule_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }
}
