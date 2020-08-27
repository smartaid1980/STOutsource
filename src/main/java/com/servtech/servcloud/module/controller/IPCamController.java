package com.servtech.servcloud.module.controller;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.IpCam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Jenny
 * Datetime: 2016/5/18 上午 10:18
 */
@RestController
@RequestMapping("/ipCam")
public class IPCamController {

    private static final Logger log = LoggerFactory.getLogger(IPCamController.class);

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));

                    IpCam ipCam = new IpCam();
                    ipCam.fromMap(data);
                    if (ipCam.insert()) {
                        return success(ipCam.getString("ip_cam_id"));
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
                return success(IpCam.findAll().toMaps());
            }
        });
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                IpCam ipCam = new IpCam();
                ipCam.fromMap(data);
                if (ipCam.saveIt()) {
                    return success(ipCam.getString("ip_cam_id"));
                } else {
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
                int deleteAmount = IpCam.delete("ip_cam_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }

    @RequestMapping(value = "/query", method = POST)
    public RequestResult<Map<String, Object>> query(@RequestBody final queryParam queryParam) {
        return ActiveJdbc.oper(new Operation<RequestResult<Map<String, Object>>>() {
            @Override
            public RequestResult<Map<String, Object>> operate() {

                IpCam result = null;
                if (queryParam.device_id != null) {
                    result = IpCam.findFirst("device_id = ?", queryParam.device_id);
                } else if (queryParam.line_id != null){
                    result = IpCam.findFirst("line_id = ?", queryParam.line_id);
                } else if (queryParam.plant_id != null) {
                    result = IpCam.findFirst("plant_id = ?", queryParam.plant_id);
                }

                if (result != null) {
                    return success(result.toMap());
                } else {
                    return success((Map<String, Object>)new HashMap());
                }

            }
        });
    }

    public static class queryParam {
        String device_id;
        String line_id;
        String plant_id;
    }

}
