package com.servtech.servcloud.module.controller;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.model.DeviceWorkSection;
import com.servtech.servcloud.module.model.WorkSection;
import org.javalite.activejdbc.DBException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.sql.Timestamp;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

@RestController
@RequestMapping("/section")
public class SectionController {

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

                    WorkSection section = new WorkSection();
                    section.fromMap(data);
                    if (section.insert()) {
                        for (String deviceId : (List<String>) data.get("device_work_sections")) {
                            DeviceWorkSection deviceSection = new DeviceWorkSection();
                            deviceSection.set("section_id", data.get("section_id"), "device_id", deviceId);
                            if (deviceSection.isValid()) {
                                try {
                                    deviceSection.insert();
                                } catch (Exception e) {
                                    throw new DBException(data.get("section_id") + " - " + deviceId + " 綁定失敗,請檢查SQL語法欄位與值是否正確");
                                }
                            } else {
                                throw new DBException(data.get("section_id") + " - " + deviceId + " 綁定失敗");
                            }
                        }
                        return success(section.getString("section_id"));
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
                return success(WorkSection.findAll().include(DeviceWorkSection.class).toMaps());
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

                WorkSection section = new WorkSection();
                section.fromMap(data);

                List<DeviceWorkSection> deviceList = section.getAll(DeviceWorkSection.class);
                for (DeviceWorkSection device : deviceList) {
                    section.remove(device);
                }

                for (String deviceId : (List<String>) data.get("device_work_sections")) {
                    DeviceWorkSection deviceSection = new DeviceWorkSection();
                    deviceSection.set("section_id", data.get("section_id"), "device_id", deviceId);
                    if (deviceSection.isValid()) {
                        try {
                            deviceSection.insert();
                        } catch (Exception e) {
                            throw new DBException(data.get("section_id") + " - " + deviceId + " 綁定失敗,請檢查SQL語法欄位與值是否正確");
                        }
                    } else {
                        throw new DBException(data.get("section_id") + " - " + deviceId + " 綁定失敗");
                    }
                }
                if (section.saveIt()) {
                    return success(section.getString("section_id"));
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
                int deleteAmount = WorkSection.delete("section_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }

    @RequestMapping(value = "/getMachine", method = GET)
    public RequestResult<List<Map>> getMachine(@RequestParam(value = "sectionId") final String sectionId) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Device> deviceList = Device.findAll();
                Map<String, String> bindingDevice = new HashMap<String, String>();
                for(Map deviceSection: DeviceWorkSection.findAll().toMaps()){
                    bindingDevice.put(deviceSection.get("device_id").toString(), deviceSection.get("section_id").toString());
                }
                List<Map> notBindingDeviceList = new ArrayList<Map>();
                for(Device device: deviceList) {
                    if(bindingDevice.get(device.get("device_id")) == null) {
                        notBindingDeviceList.add(device.toMap());
                    } else if(bindingDevice.get(device.get("device_id")).equals(sectionId)) {
                        notBindingDeviceList.add(device.toMap());
                    }
                }
                return success(notBindingDeviceList);
            }
        });
    }
}
