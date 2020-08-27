package com.servtech.servcloud.module.controller;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.CncBrand;
import com.servtech.servcloud.module.model.DeviceCncBrand;
import com.servtech.servcloud.module.model.MonitorPage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Kevin Big Big on 2015/8/21.
 */
@RestController
@RequestMapping("/cncbrand")
public class CncBrandController {
    private static final Logger log = LoggerFactory.getLogger(CncBrandController.class);

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    CncBrand cncBrand = new CncBrand();
                    cncBrand.fromMap(data);

                    if (cncBrand.insert()) {
                        for (String monitorPageId : (List<String>) data.get("monitor_pages")) {
                            cncBrand.add(MonitorPage.findById(monitorPageId));
                        }
                        return success(cncBrand.getString("cnc_id"));
                    } else {
                        return fail("新增失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                return success(CncBrand.findAll().include(MonitorPage.class).toMaps());
            }
        });
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                //return success(CncBrand.findAll().include(MonitorPage.class).toMaps());
                CncBrand cncBrand = new CncBrand();
                cncBrand.fromMap(data);

                List<MonitorPage> monitorPageList = cncBrand.getAll(MonitorPage.class);
                for(MonitorPage monitorPage:monitorPageList){
                    cncBrand.remove(monitorPage);
                }
                for (String monitorPageId : (List<String>) data.get("monitor_pages")) {
                    cncBrand.add(MonitorPage.findById(monitorPageId));
                }
                if(cncBrand.saveIt()){
                    return success(cncBrand.getString("cnc_id"));
                }else{
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }

    @RequestMapping(value ="/delete", method = DELETE)
    public RequestResult<Void> delete(@RequestBody final Object[] idList) {
        return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {
                int deleteAmount = CncBrand.delete("cnc_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }

    @RequestMapping(value = "/readBindMonitorPage", method = GET)
    public RequestResult<List<Map>> readBindMonitorPage(@RequestParam(value="id") final String id) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<DeviceCncBrand> deviceCncBrands = DeviceCncBrand.find("device_id = ?", id);
                List<Map> maps = new ArrayList<Map>();
                if(deviceCncBrands.size() > 0){
                    String cncId = deviceCncBrands.get(0).get("cnc_id").toString();
                    maps = CncBrand.find("cnc_id = ?", cncId).include(MonitorPage.class).toMaps();
                }else{
                    log.warn("machine: {} not bind monitor page!!", id);
                }

                return success(maps);
            }
        });
    }
}
