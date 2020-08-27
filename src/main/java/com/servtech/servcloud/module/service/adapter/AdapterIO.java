package com.servtech.servcloud.module.service.adapter;

import com.servtech.common.file.Files;
import com.servtech.servcloud.module.service.adapter.bean.MachineInfo;
import com.servtech.servcloud.core.util.SysPropKey;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Created by hubertlu on 2017/3/15.
 */
public class AdapterIO {
    private static final String ADAPTER_DIR = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/adapter/";
    private static final String ADAPTER_MACHINE_DIR = ADAPTER_DIR + "machine/";
    private static final String SYS_ADAPTER_XML = ADAPTER_DIR + "system/adapter.xml";

    public static MachineInfo unmarshall(String machineId, String name, String brand) throws DocumentException {
        String xmlFilePath = ADAPTER_MACHINE_DIR + machineId + ".xml";
        MachineInfo machineInfo = new MachineInfo();
        machineInfo.setId(machineId);
        machineInfo.setName(name);
        machineInfo.setBrand(brand);

        SAXReader reader = new SAXReader();
        Document doc = reader.read(xmlFilePath);
        List<Element> list = doc.selectNodes("//Register/Device/Driver/Parameters/*");

        for (Element ele : list) {
            String paramName = ele.attributeValue("name");
            String paramValue = ele.attributeValue("value");
            boolean readonly = Boolean.parseBoolean(ele.attributeValue("readonly"));
            if (!readonly) {
                machineInfo.addParam(paramName, paramValue);
            }
        }

        return machineInfo;
    }

    /**
     *
     * @return Error message or null if success
     */
    public static String marshall(MachineInfo machineInfo) throws DocumentException {
        SAXReader reader = new SAXReader();
        Document doc = reader.read(SYS_ADAPTER_XML);
        Element ele = (Element) doc.selectSingleNode("//Register/Device/ID[text()='" + machineInfo.getBrand() + "']");
        if (ele == null) {
            return "There is no brand " + machineInfo.getBrand();
        } else {
            ele.setText(machineInfo.getId());
        }

        Element registerEle = ele.getParent().getParent();
        for (Map.Entry<String, String> entry : machineInfo.getParam().entrySet()) {
            String name = entry.getKey();
            String value = entry.getValue();

            Element parameterEle = (Element) registerEle.selectSingleNode("Device/Driver/Parameters/Parameter[@name='" + name + "']");

            // 沒有
            if (parameterEle == null) {
                return "There is no param." + name;
            }

            // readonly
            boolean readonly = Boolean.parseBoolean(parameterEle.attributeValue("readonly"));
            if (readonly) {
                return "There is no param." + name;
            }

            // 都 OK
            parameterEle.addAttribute("value", value);
        }

        // 寫檔
        String xmlFilePath = ADAPTER_MACHINE_DIR + machineInfo.getId() + ".xml";
        try {
            Files.writeStringToFile(registerEle.asXML(), new File(xmlFilePath));
        } catch (IOException e) {
            return "Update fail: " + e.getMessage();
        }

        return null;
    }
//
//    public static void main(String[] args) throws DocumentException {
//        MachineInfo machineInfo = new MachineInfo();
//        machineInfo.addParam("IP", "192.168.130.115");
//        machineInfo.addParam("PORT", "8180");
//        machineInfo.setBrand("Mitsubishi");
//        System.out.println(AdapterIO.marshall(machineInfo));
//    }

}
