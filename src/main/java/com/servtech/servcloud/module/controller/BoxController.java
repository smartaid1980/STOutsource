package com.servtech.servcloud.module.controller;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.Box;
import com.servtech.servcloud.module.model.Device;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Node;
import org.dom4j.io.SAXReader;
import org.dom4j.io.XMLWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import static org.springframework.web.bind.annotation.RequestMethod.*;

import static com.servtech.servcloud.core.util.RequestResult.*;
import static com.servtech.servcloud.core.util.SysPropKey.*;

/**
 * Created by Hubert
 * Datetime: 2015/7/7 下午 03:38
 */
@RestController
@RequestMapping("/box")
public class BoxController {
    private static final Logger log = LoggerFactory.getLogger(BoxController.class);
    private static final String BOX_COMMAND_CONFIG_PATH = "Config/Command/NotSend/OEE/CNC/utilization_command.xml";
    private static final String MACRO_XPATH = "//param[@name='G_MRCO']/inputs/input[@name='P_NUMBER']";// XPath找Macro的 P_NUMBER

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

                    Box box = new Box();
                    box.fromMap(data);
                    if (box.insert()) {
                        for (String deviceId : (List<String>) data.get("devices")) {
                            box.add(Device.findById(deviceId));
                        }
                        return success(box.getString("box_id"));
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
                return success(Box.findAll().include(Device.class).toMaps());
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

                Box box = new Box();
                box.fromMap(data);

                List<Device> deviceList = box.getAll(Device.class);
                for (Device device : deviceList) {
                    box.remove(device);
                }
                for (String deviceId : (List<String>) data.get("devices")) {
                    box.add(Device.findById(deviceId));
                }
                if (box.saveIt()) {
                    return success(box.getString("box_id"));
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
                int deleteAmount = Box.delete("box_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }

    //讀取 ServBox 的 utilization_command.xml G_MRCO值
    @RequestMapping(value = "/readMacro", method = GET)
    public RequestResult<String> readMacro(@RequestParam final String boxId) {
        String pNumber = "";
        //將倒數第三位值由D改成E，例: xxxxDxx -> xxxxExx
        if(boxId.length() >= 3){
            String boxEId = boxD2boxE(boxId);
            //根據BoxId找到ServBox路徑下的utilization_command.xml
            String boxECommand = System.getProperty(SERV_BOX_PATH) + "/" + boxEId + "/" + BOX_COMMAND_CONFIG_PATH;
            File file = new File(boxECommand);
            if(!file.exists()){
                log.warn("boxE command path not exist: " + boxECommand);
                return fail("fail - file not exist.");
            }else{
                log.info("boxE command path: " + boxECommand);
            }

            //讀取macore
            SAXReader reader = new SAXReader();
            try {
                Document doc = reader.read(boxECommand);
                Node node = doc.selectSingleNode(MACRO_XPATH);
                pNumber = node.getText();
            } catch (DocumentException e) {
                return fail("fail - DocumentException");
            }
        }else{
            return fail("fail - boxId.length <=3");
        }
        return success(pNumber);
    }

    //更新 ServBox 的 utilization_command.xml G_MRCO值
    @RequestMapping(value = "/updateMacro", method = PUT)
    public RequestResult<String> updateMacro(@RequestBody final Map data) {
        String boxId = data.get("boxId").toString();
        String macro = data.get("macro").toString();

        //將倒數第三位值由D改成E，例: xxxxDxx -> xxxxExx
        if(boxId.length() >= 3){
            String boxEId = boxD2boxE(boxId);
            //根據BoxId找到ServBox路徑下的utilization_command.xml
            String boxECommand = System.getProperty(SERV_BOX_PATH) + "/" + boxEId + "/" + BOX_COMMAND_CONFIG_PATH;
            File file = new File(boxECommand);
            if(!file.exists()){
                log.warn("boxE command path not exist: " + boxECommand);
                return fail("fail - file not exist.");
            }else{
                log.info("boxE command path: " + boxECommand);
            }

            //更新macore
            SAXReader reader = new SAXReader();
            try {
                Document doc = reader.read(boxECommand);
                Node node = doc.selectSingleNode(MACRO_XPATH);
                node.setText(macro);

                XMLWriter write = new XMLWriter(new FileWriter(boxECommand));
                write.write(doc);
                write.close();
            } catch (DocumentException e) {
                e.printStackTrace();
                return fail("fail - DocumentException");
            } catch (IOException e) {
                return fail("fail - IOException");
            }
        }else{
            return fail("fail - boxId.length <=3");
        }
        return success();
    }

    //boxId D轉E
    private String boxD2boxE(String boxDId){
        //將倒數第三位值由D改成E，例: xxxxDxx -> xxxxExx
        return boxDId.substring(0, boxDId.length() - 3) + "E" + boxDId.substring(boxDId.length() - 2, boxDId.length());
    }
}
