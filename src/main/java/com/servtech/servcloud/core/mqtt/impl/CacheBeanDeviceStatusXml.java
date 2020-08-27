package com.servtech.servcloud.core.mqtt.impl;

import com.google.gson.Gson;
import com.servtech.servcloud.core.mqtt.CacheBean;
import com.servtech.servcloud.core.mqtt.exception.MqttMessageFormatException;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 格式:
 *  舊版機台狀態(只會傳單系統的XML)
 *  machineId: 拿leanid (就是ServBox的ID)
 *  data: param的值，第一層為gCode，第二層為machineId，第三層為值
 * 輸出:
 *  為了讓新舊版機台狀態一致，就算舊版是單系統，我們也要將它組成多系統，所以才會是String[系統][值]的輸出格式
 *  data: {
 *      G_CONS():{ MA-1560: [[13]]},
 *      G_ALAM():{ MA-1560: [[110, 1001]]}
 *  }
 *
 * Created by Kevin Big Big on 2016/5/27.
 */
public class CacheBeanDeviceStatusXml implements CacheBean {
    private static final Logger log = LoggerFactory.getLogger(CacheBeanDeviceStatusXml.class);
    private static final int MACHINE_ID_INDEX = 0;
    private static final int VALUE_INDEX = 1;

    private String type;
    private String machineId;
    private Map<String, Map<String, List<String[]>>> data;//Map<gCode, Map<machineId, String[系統][值]>>()

    public CacheBeanDeviceStatusXml(String topic, byte[] bytes) throws MqttMessageFormatException {
        this.type = topic;
        try {
            String content = new String(bytes, "UTF-8");
            Document doc = DocumentHelper.parseText(content);
            Element rootElem = doc.getRootElement();
            this.machineId = getBoxId(rootElem);
            this.data = getData(rootElem.element("record").element("params"));
        } catch (UnsupportedEncodingException e) {
            log.warn("不可能發生的編碼錯誤", e);
            throw new MqttMessageFormatException();
        } catch (DocumentException e) {
            log.warn("document: {}", e);
            throw new MqttMessageFormatException();
        } catch (Exception e) {
            log.warn("Exception: {}", e);
            throw new MqttMessageFormatException();
        }
    }

    private String getBoxId(Element rootElem) throws Exception{
        return rootElem.element("infos").elementText("leanid");
    }

    private Map<String, Map<String, List<String[]>>> getData(Element paramsElem) throws Exception{
        Map<String, Map<String, List<String[]>>> data = new HashMap<String, Map<String, List<String[]>>>();
        List<?> params = paramsElem.elements();
        for(Object param:params) {
            Element temp = (Element) param;
            String paramName = temp.attribute("name").getValue();
            String valueText = temp.element("contents").element("content").element("value").getTextTrim();
            if(!data.containsKey(paramName)){
                data.put(paramName, new HashMap<String, List<String[]>>());
            }
            Gson gson = new Gson();
            String[][] matrix = gson.fromJson(valueText, String[][].class);
            for(String[] elements:matrix){
                if(elements.length >= 2){//[機台,值]，所以至少要兩欄
                    String[] value;
                    if(elements[VALUE_INDEX].contains("[")){//有括號表示，是陣列
                        value = gson.fromJson(elements[VALUE_INDEX], String[].class);
                    }else{//不是陣列，自己建一個陣列放入
                        value = new String[]{elements[VALUE_INDEX]};
                    }
                    if(!data.get(paramName).containsKey(elements[MACHINE_ID_INDEX])){
                        data.get(paramName).put(elements[MACHINE_ID_INDEX], new ArrayList<String[]>());
                    }
                    data.get(paramName).get(elements[MACHINE_ID_INDEX]).add(value);//*** 放入單系統
                }else{
                    log.warn("xml_device_status param value length < 2");
                }
            }
        }
        return data;
    }

    @Override
    public String getType() {
        return type;
    }

    @Override
    public String getMachineId() {
        return machineId;
    }

    @Override
    public String asJson() {
        return new Gson().toJson(data);
    }
}
