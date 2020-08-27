package com.servtech.servcloud.app.controller.machine_editor;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.Box;
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.model.DeviceCncBrand;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.w3c.dom.*;
import org.xml.sax.SAXException;

import javax.servlet.http.HttpServletRequest;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.*;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by stadmin on 2016/01/06.
 */
@RestController
@RequestMapping("/MachineEditor")
public class MachineEditorController {

    private static final Logger logger = LoggerFactory.getLogger(MachineEditorController.class);
    protected static final String ADAPTER_DIR = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/adapter/";
    protected static final String ADAPTER_MACHINE_DIR = ADAPTER_DIR + "machine/";
    protected static final String SYS_ADAPTER_XML = ADAPTER_DIR + "system/adapter.xml";

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value="param" , method = GET)
    public void show(){
        String outputPathD = Util.getServBoxD01DevicesXmlPath("ServBoxD01");
        String outputPathE = Util.getServBoxE01DevicesXmlPath("ServBoxD01");
        System.out.println(outputPathD);
        System.out.println(outputPathE);
    }

    @RequestMapping(value = "/readTable" , method = GET)
    public RequestResult<ArrayList<Map<String, Object>>> readTable() throws IOException, SAXException, ParserConfigurationException {
        return ActiveJdbc.operTx(new Operation<RequestResult<ArrayList<Map<String, Object>>>>() {
            @Override
            public RequestResult<ArrayList<Map<String, Object>>> operate() {
                ArrayList<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
                List<Device> deviceList = Device.findAll();
                for (Device d : deviceList) {

                    Map<String, Object> map = new HashMap<String, Object>();
                    map.put("deviceId", d.getId().toString());
                    map.put("deviceName", d.getString("device_name"));

                    try {
                        Map<String, Object> properties = AdapterIO.getMachineProperties(d.getId().toString());
                        map.put("deviceBrand", properties.get("deviceBrand"));
                        map.put("properties", properties.get("properties"));
                        resultList.add(map);
                    } catch (Exception ex) {
                        map.put("deviceBrand", "");
                        map.put("properties", new String[]{""});
                        resultList.add(map);
                    }

                }

                return success(resultList);
            }
        });



    }

    @RequestMapping(value = "/getParamList" , method = GET)
    public RequestResult<Map<String, List<Map<String,String>>>> getParamList() throws IOException, SAXException, ParserConfigurationException {
        Map<String, List<Map<String,String>>> map = AdapterIO.readAdapterXml();
        return success(map);
    }

    @RequestMapping(value = "/saveEdit" , method = POST)
    public RequestResult<String> saveEdit(@RequestParam("ID") final String ID,
                                          @RequestParam("name") final String name,
                                          @RequestParam("brand") final String brand,
                                          @RequestParam("params[]") String[] params,
                                          @RequestParam("values[]") String[] values) throws ParserConfigurationException, TransformerException, SAXException, IOException {

        // 將更新的資訊存進deviceId.xml
        AdapterIO.editMachine(ID, name, brand, params, values);

        // 將更新的資訊存進db
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                Map<String, Object> data = new HashMap<String, Object>();
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                data.put("cnc_brands", brand);
                data.put("device_id", ID);
                data.put("device_name", name);

                Device device = new Device();
                device.fromMap(data);
                if (device.saveIt()) {
                    String cncBrands = data.get("cnc_brands").toString();
                    if (cncBrands != null) {
                        if (!new DeviceCncBrand().setId(data.get("device_id").toString()).set("cnc_id", cncBrands).saveIt()) {
                            logger.warn("saveIt deviceCncBrand fail!!");
                        }
                    }
                    return success(device.getString("device_id"));
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }

    @RequestMapping(value = "/mergeMachine" , method = POST)
    public RequestResult<Boolean> mergeMachine(@RequestParam("selectedBoxes[]") String[] selectedBox) throws ParserConfigurationException, TransformerException, SAXException, IOException {

        for(final String boxId:selectedBox){
            // 去db找到box綁定哪些device
            List<String> deviceList = ActiveJdbc.oper(new Operation<List<String>>() {
                @Override
                public ArrayList<String> operate() {
                    ArrayList<String> deviceList = new ArrayList<String>();
                    final List<Map> maps = Box.findById(boxId).getAll(Device.class).toMaps();
                    for(Map map:maps){
                        deviceList.add(map.get("device_id").toString());
                    }
                    return deviceList;
                }
            });
            // 將所有綁定的deviceId.xml小檔案合併成一個device.xml大檔案
            AdapterIO.mergeMachinesIntoXml(boxId, deviceList);
        }
        return success(true);
    }

    @RequestMapping(value = "/restart" , method = POST)
    public RequestResult<Map<String,Integer>> restartBoxes(@RequestParam("selectedBoxes[]") String[] selectedBox) throws FileNotFoundException {

        RunCmd execBat;
        Map<String,Integer> result = new HashMap<String, Integer>();
        String restart = System.getProperty(SysPropKey.SERV_BOX_RESTART_TOOL_EXE);
        File DIR = new File(restart).getParentFile();
        for(String boxId:selectedBox){
            execBat = new RunCmd(new String[]{restart , boxId}, null, DIR);
            execBat.setPrint(true);
            int exitVal = execBat.execAndReturn();
            // 把執行檔return的值送回去
            result.put(boxId,exitVal);
        }
        return success(result);
    }


    static class AdapterIO {

        public static Map<String, Object> getMachineProperties(String machineId) throws ParserConfigurationException, IOException, SAXException {
            Map<String, String> brandMap = new HashMap<String, String>();

            File adapterXmlFile = new File(SYS_ADAPTER_XML);
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();

            Document BrandListDoc = dBuilder.parse(adapterXmlFile);
            BrandListDoc.getDocumentElement().normalize();
            NodeList BrandNodeList = BrandListDoc.getElementsByTagName("Register");

            for (int brandNLidx = 0; brandNLidx < BrandNodeList.getLength(); brandNLidx++) {
                Node brandNode = BrandNodeList.item(brandNLidx);
                if (brandNode.getNodeType() == Node.ELEMENT_NODE) {
                    Element redElement = (Element) brandNode;
                    String brand  =  redElement.getElementsByTagName("ID").item(0).getFirstChild().getNodeValue();
                    String AssemblyName  =  redElement.getElementsByTagName("AssemblyName").item(0).getFirstChild().getNodeValue();
                    brandMap.put(AssemblyName, brand);
                }
            }


            Map<String,Object> result = new HashMap<String, Object>();
            String machineFilePath = ADAPTER_MACHINE_DIR + machineId + ".xml";

            File fXmlFile = new File(machineFilePath);
            if(fXmlFile.exists()){
                Document doc = dBuilder.parse(fXmlFile);
                doc.getDocumentElement().normalize();

                NodeList regNodeList = doc.getElementsByTagName("Register");
                Node regNode = regNodeList.item(0);
                if (regNode.getNodeType() == Node.ELEMENT_NODE) {
                    Element regElement = (Element) regNode;
                    String driver = regElement.getElementsByTagName("AssemblyName").item(0).getFirstChild().getNodeValue();
                    result.put("deviceBrand", brandMap.get(driver));

                    ArrayList<String> props = new ArrayList<String>();
                    NodeList paraNodeList = regElement.getElementsByTagName("Parameters");
                    for (int paraNLidx=0; paraNLidx < paraNodeList.getLength(); paraNLidx++){
                        Node paraNode = paraNodeList.item(paraNLidx);
                        if(paraNode.getNodeType() == Node.ELEMENT_NODE){
                            NodeList everyParaNodeList = regElement.getElementsByTagName("Parameter");
                            for (int eParaNLidx = 0;eParaNLidx < everyParaNodeList.getLength() ; eParaNLidx++){
                                NamedNodeMap attrList = regElement.getElementsByTagName("Parameter").item(eParaNLidx).getAttributes();
                                if (null != attrList) {
                                    Node p_name = attrList.getNamedItem("name");
                                    Node p_value = attrList.getNamedItem("value");
                                    props.add(p_name.getNodeValue().trim()+":"+p_value.getNodeValue().trim());
                                }
                            }
                        }
                    }
                    result.put("properties",props);
                }
            } else {
                result.put("deviceBrand", "");
                result.put("properties",new String[]{""});
                logger.warn(fXmlFile.getPath() + " not found!");
            }
            return result;
        }

        public static Map<String, List<Map<String,String>>> readAdapterXml() throws ParserConfigurationException, IOException, SAXException {

            File adapterXmlFile = new File(SYS_ADAPTER_XML);
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder dBuilder = null;
            Document doc = null;
            dBuilder = dbFactory.newDocumentBuilder();
            doc = dBuilder.parse(adapterXmlFile);

            doc.getDocumentElement().normalize();

            NodeList regNodeList = doc.getElementsByTagName("Register");

            Map<String, List<Map<String,String>>> result = new HashMap<String, List<Map<String,String>>>();

            for (int regNLidx = 0; regNLidx < regNodeList.getLength(); regNLidx++) {

                Node regNode = regNodeList.item(regNLidx);
                if (regNode.getNodeType() == Node.ELEMENT_NODE) {
                    Element regElement = (Element) regNode;
                    String brand  =  regElement.getElementsByTagName("ID").item(0).getFirstChild().getNodeValue();
                    result.put(brand, new ArrayList<Map<String, String>>());

                    NodeList paraNodeList = regElement.getElementsByTagName("Parameters");
                    for (int paraNLidx=0; paraNLidx < paraNodeList.getLength(); paraNLidx++){
                        Node paraNode = paraNodeList.item(paraNLidx);

                        if(paraNode.getNodeType() == Node.ELEMENT_NODE){
                            NodeList everyParaNodeList = regElement.getElementsByTagName("Parameter");
                            for (int eParaNLidx = 0;eParaNLidx < everyParaNodeList.getLength() ; eParaNLidx++){
                                NamedNodeMap attrList = regElement.getElementsByTagName("Parameter").item(eParaNLidx).getAttributes();
                                if (null != attrList) {
                                    Node parname = attrList.getNamedItem("name");
                                    Node parvalue = attrList.getNamedItem("value");
                                    String readonly = "false";
                                    if(attrList.getNamedItem("readonly") != null){
                                        readonly = attrList.getNamedItem("readonly").getNodeValue().trim().toLowerCase();
                                    }
                                    Map<String,String> paramWithValue = new HashMap<String, String>();
                                    paramWithValue.put("readonly" , readonly);
                                    paramWithValue.put("paramName" , parname.getNodeValue());
                                    paramWithValue.put("defaultValue" , parvalue.getNodeValue());
                                    result.get(brand).add(paramWithValue);
                                }
                            }
                        }
                    }
                }
            }
            return result;
        }

        public static void editMachine(String ID , String name , String brand , String[] params , String[] values) throws ParserConfigurationException, IOException, SAXException, TransformerException {

            File adapterXmlFile = new File(SYS_ADAPTER_XML);
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder dBuilder = null;
            Document doc = null;
            dBuilder = dbFactory.newDocumentBuilder();
            doc = dBuilder.parse(adapterXmlFile);
            doc.getDocumentElement().normalize();

            NodeList regNodeList = doc.getElementsByTagName("Register");

            for (int regNLidx = 0; regNLidx < regNodeList.getLength(); regNLidx++) {
                Node regNode = regNodeList.item(regNLidx);
                if (regNode.getNodeType() == Node.ELEMENT_NODE) {
                    Element regElement = (Element) regNode;
                    String thisNodeBrand = regElement.getElementsByTagName("ID").item(0).getFirstChild().getNodeValue();

                    if(thisNodeBrand.equals(brand)){
                        Node regNodeClone = regNode.cloneNode(true);
                        Element regElementClone = (Element) regNodeClone;
                        regElementClone.normalize();
                        regElementClone.getElementsByTagName("ID").item(0).getFirstChild().setNodeValue(ID);
                        NodeList paraNodeList = regElementClone.getElementsByTagName("Parameters");
                        for (int paraNLidx=0; paraNLidx < paraNodeList.getLength(); paraNLidx++){
                            Node paraNode = paraNodeList.item(paraNLidx);
                            if(paraNode.getNodeType() == Node.ELEMENT_NODE){
                                NodeList everyParaNodeList = regElementClone.getElementsByTagName("Parameter");
                                for (int eParaNLidx = 0;eParaNLidx < everyParaNodeList.getLength() ; eParaNLidx++){
                                    NamedNodeMap attrList = regElementClone.getElementsByTagName("Parameter").item(eParaNLidx).getAttributes();
                                    if (null != attrList) {
                                        attrList.getNamedItem("name").setNodeValue(params[eParaNLidx]);
                                        attrList.getNamedItem("value").setNodeValue(values[eParaNLidx]);
                                    }
                                }
                            }
                        }

                        String machineXml = ADAPTER_MACHINE_DIR + ID + ".xml";

                        Document docToWrite = dBuilder.newDocument();
                        Node newNode = docToWrite.importNode(regNodeClone, true);
                        docToWrite.appendChild(newNode);
                        docToWrite.normalizeDocument();
                        DOMSource source = new DOMSource(docToWrite);
                        StreamResult result = new StreamResult(new File(machineXml));
                        TransformerFactory transformerFactory = TransformerFactory.newInstance();
                        transformerFactory.setAttribute("indent-number", new Integer(2));
                        Transformer transformer = transformerFactory.newTransformer();
                        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
                        transformer.setOutputProperty("omit-xml-declaration", "yes");
                        transformer.transform(source, result);
                        formatXml(machineXml);
                    }
                }
            }
        }


        public static void mergeMachinesIntoXml(String boxId , List<String> deviceList) throws IOException, ParserConfigurationException, SAXException, TransformerException {

            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
            Document docToWrite = dBuilder.newDocument();
            Element rootElement = docToWrite.createElement("ClosedTalk");
            docToWrite.appendChild(rootElement);

            Element Version = docToWrite.createElement("Version");
            Version.appendChild(docToWrite.createTextNode("1.0"));
            rootElement.appendChild(Version);

            SimpleDateFormat sdFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
            String strDate = sdFormat.format(new Date());
            Element updateTime = docToWrite.createElement("UpdateTime");
            updateTime.appendChild(docToWrite.createTextNode(strDate));
            rootElement.appendChild(updateTime);

            for(String machine:deviceList){
                String machineXml = ADAPTER_MACHINE_DIR + machine + ".xml";
                File machineXmlFile = new File(machineXml);
                if(machineXmlFile.exists()){
                    Document doc = dBuilder.parse(machineXmlFile);
                    doc.getDocumentElement().normalize();

                    NodeList regNodeList = doc.getElementsByTagName("Register");
                    Node regNode = regNodeList.item(0);
                    Node newNode = docToWrite.importNode(regNode, true);
                    docToWrite.getElementsByTagName("ClosedTalk").item(0).appendChild(newNode);
                }
            }

            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            transformerFactory.setAttribute("indent-number", new Integer(2));
            Transformer transformer = transformerFactory.newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty("omit-xml-declaration", "yes");
            DOMSource source = new DOMSource(docToWrite);

            String outputPathD = Util.getServBoxD01DevicesXmlPath(boxId);
            String outputPathE = Util.getServBoxE01DevicesXmlPath(boxId);
            File outputFileD = new File(outputPathD);
            File outputFileE = new File(outputPathE);

            if(outputFileD.exists()){
                StreamResult resultD = new StreamResult(outputFileD);
                transformer.transform(source, resultD);
                formatXml(outputPathD);
            } else {
                logger.warn(outputFileD.getPath() + " not found!");
            }

            if(outputFileE.exists()){
                StreamResult resultE = new StreamResult(outputFileE);
                transformer.transform(source, resultE);
                formatXml(outputPathE);
            } else {
                logger.warn(outputFileE.getPath() + " not found!");
            }

        }


        public static void formatXml(String fileWithFullPath) throws IOException {
            FileReader fr = new FileReader(fileWithFullPath);
            BufferedReader br = new BufferedReader(fr);
            Pattern tag = Pattern.compile("<[\\w]*.?>");
            Pattern closer = Pattern.compile("</[\\w]*.?>");
            Matcher tagMatcher;
            Matcher closerMatcher;
            int tabs = 0;
            String content = "";
            while(br.ready()){
                String str = br.readLine().trim();
                tagMatcher = tag.matcher(str);
                closerMatcher = closer.matcher(str);
                boolean hasTag = tagMatcher.find();
                boolean hasCloser = closerMatcher.find();
                if(hasTag && hasCloser){
                    for(int i = 0 ; i < tabs ; i++)
                        content += "\t";
                } else if (hasTag) {
                    for(int i = 0 ; i < tabs ; i++)
                        content += "\t";
                    tabs++;
                } else if (hasCloser){
                    tabs--;
                    for(int i = 0 ; i < tabs ; i++)
                        content += "\t";
                } else {
                    for(int i = 0 ; i < tabs ; i++)
                        content += "\t";
                }
                content += str + System.getProperty("line.separator");
            }
            br.close();
            fr.close();
            FileWriter fw = new FileWriter(fileWithFullPath);
            fw.write(content);
            fw.close();
        }
    }
}


