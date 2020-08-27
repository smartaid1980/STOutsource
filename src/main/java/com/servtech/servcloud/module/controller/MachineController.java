package com.servtech.servcloud.module.controller;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.*;
import com.servtech.servcloud.module.service.adapter.AdapterIO;
import com.servtech.servcloud.module.service.adapter.bean.MachineInfo;
import org.dom4j.DocumentException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.*;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Hubert Datetime: 2015/7/7 下午 03:09
 */
@RestController
@RequestMapping("/machine")
public class MachineController {

  private static final Logger log = LoggerFactory.getLogger(MachineController.class);

  @Autowired
  private HttpServletRequest request;

  @RequestMapping(value = "/create", method = POST)
  public RequestResult<String> create(@RequestBody final Map data) {
    try {

      if (data.get("cnc_brands") == null) {
        data.put("cnc_brands", "FANUC"); // 預設為FANUC
      }
      // 在 WEB-INF/adapter/machine/ 底下新增 deviceId.xml 文件
      createMachine(data.get("device_id").toString(), data.get("cnc_brands").toString());

      return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
        @Override
        public RequestResult<String> operate() {
          data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
          data.put("create_time", new Timestamp(System.currentTimeMillis()));

          Device device = new Device();
          device.fromMap(data);

          if (device.insert()) {
            String cncBrands = data.get("cnc_brands").toString();
            if (cncBrands != null) {
              if (!new DeviceCncBrand().setId(data.get("device_id").toString()).set("cnc_id", cncBrands).insert()) {
                log.warn("insert deviceCncBrand fail!!");
              }
            }
            return success(device.getString("device_id"));
          } else {
            return fail("新增失敗，原因待查...");
          }
        }
      });
    } catch (Exception e) {
      return fail(e.getMessage());
    }
  }

  @RequestMapping(value = "/createIncludeMachineInfo", method = POST)
  public RequestResult<String> createIncludeMachineInfo(@RequestBody final machineCncBrandTypeInfo data) {
    try {

      final MachineInfo machineInfo = new MachineInfo();
      machineInfo.setId(data.device_id);
      machineInfo.setName(data.device_name);
      machineInfo.setBrand(data.cnc_brands);
      for (Map.Entry<String, String> entry : data.param.entrySet()) {
        machineInfo.addParam(entry.getKey(), entry.getValue());
      }

      try {
        ActiveJdbc.operTx(new Operation<Void>() {
          @Override
          public Void operate() {
            Map<String, Object> data = new HashMap<String, Object>();
            data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
            data.put("create_time", new Timestamp(System.currentTimeMillis()));
            data.put("cnc_brands", machineInfo.getBrand());
            data.put("device_id", machineInfo.getId());
            String machineName = machineInfo.getName();
            if (machineName != null) {
              data.put("device_name", machineName);
            }

            Device device = new Device();
            device.fromMap(data);

            // 存 m_device
            if (device.insert()) {
              DeviceCncBrand deviceCncBrand = new DeviceCncBrand().setId(machineInfo.getId()).set("cnc_id",
                  machineInfo.getBrand());

              // 存 m_device_cnc_brand
              if (!deviceCncBrand.insert()) {
                throw new RuntimeException("Brand insert fail...");
              }
            } else {
              throw new RuntimeException("Machine insert fail...");
            }

            // 存 xml 檔
            try {
              String message = AdapterIO.marshall(machineInfo);
              if (message != null) {
                throw new RuntimeException(message);
              }
            } catch (DocumentException e) {
              throw new RuntimeException(e.getMessage());
            }

            return null;
          }
        });

      } catch (RuntimeException e) {
        String message = e.getMessage();
        String expPrefix = "java.lang.RuntimeException: ";
        if (message.startsWith(expPrefix)) {
          message = message.substring(expPrefix.length());
        }
        return fail(message);

      } catch (Exception e) {
        return fail(e.getMessage());
      }

      return success(data.device_id);

    } catch (Exception e) {
      return fail(e.getMessage());
    }
  }

  @RequestMapping(value = "/read", method = GET)
  public RequestResult<List<Map>> read() {
    return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
      @Override
      public RequestResult<List<Map>> operate() {
        List<Map> result = getDeviceCncBrandMachineType();
        return success(result);
      }
    });
  }

  @RequestMapping(value = "/readIncludeMachineInfo", method = GET)
  public RequestResult<List<Map>> readIncludeMachineInfo() {
    return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
      @Override
      public RequestResult<List<Map>> operate() {
        List<Map> result = getDeviceCncBrandMachineType();

        for (Map device : result) {
          String cncId = null;
          List<Map> cncBrand = (List<Map>) device.get("device_cnc_brands");
          if (cncBrand != null && cncBrand.size() > 0) {
            cncId = cncBrand.get(0).get("cnc_id").toString();
          }

          // 控制器連線資訊
          try {
            MachineInfo machineInfo = AdapterIO.unmarshall(device.get("device_id").toString(),
                device.get("device_name").toString(), cncId);
            device.put("param", machineInfo);
          } catch (DocumentException e) {
            log.warn(e.getMessage());
            continue;
          }
        }

        return success(result);
      }
    });
  }

  private List<Map> getDeviceCncBrandMachineType() {
    List<Map> result = Device.findAll().include(DeviceCncBrand.class).toMaps();
    List<CncBrand> cncBrands = CncBrand.findAll();
    Map<String, String> cncBrandMap = new HashMap<String, String>();
    List<MachineType> machineTypes = MachineType.findAll();
    Map<String, String> machineTypeMap = new HashMap<String, String>();
    for (CncBrand cncBrand : cncBrands) {// key:cnc_id, value:name
      cncBrandMap.put(cncBrand.getId().toString(), cncBrand.get("name").toString());
    }
    for (MachineType machineType : machineTypes) {
      machineTypeMap.put(machineType.getId().toString(), machineType.get("type_name").toString());
    }
    for (Map device : result) {
      List<Map> cncBrand = (List<Map>) device.get("device_cnc_brands");
      if (cncBrand != null && cncBrand.size() > 0) {// 有綁訂廠牌
        // 設置廠牌名稱
        // if (cncBrandMap.containsKey(cncBrand.get(0).get("cnc_id").toString())) {
        // String name = cncBrandMap.get(cncBrand.get(0).get("cnc_id").toString());
        // device.put("cnc_brands", name);
        // }
        device.put("cnc_brands", cncBrand.get(0).get("cnc_id").toString());
      } else {
        device.put("cnc_brands", "");
      }
      if (device.containsKey("device_type") && (device.get("device_type") != null)) {
        if (machineTypeMap.containsKey(device.get("device_type").toString())) {
          String typeName = machineTypeMap.get(device.get("device_type").toString());
          device.put("machine_types", typeName);
        }
      } else {
        device.put("machine_types", "");
      }
    }
    return result;
  }

  @RequestMapping(value = "/update", method = PUT)
  public RequestResult<String> update(@RequestBody final Map data) {
    return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
      @Override
      public RequestResult<String> operate() {
        data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
        data.put("modify_time", new Timestamp(System.currentTimeMillis()));

        Device device = new Device();
        device.fromMap(data);
        // if (data.get("cnc_brands") != null) {//有廠牌才處理
        if (device.saveIt()) {
          // String cncBrands = data.get("cnc_brands").toString();
          // if (cncBrands != null) {
          // if (!new
          // DeviceCncBrand().setId(data.get("device_id").toString()).set("cnc_id",
          // cncBrands).saveIt()) {
          // log.warn("saveIt deviceCncBrand fail!!");
          // }
          // }
          // }
          return success(device.getString("device_id"));
        } else {
          return fail("修改失敗，原因待查...");
        }
      }
    });
  }

  @RequestMapping(value = "/updateIncludeMachineInfo", method = PUT)
  public RequestResult<String> updateIncludeMachineInfo(@RequestBody final machineCncBrandTypeInfo data) {
    try {

      final MachineInfo machineInfo = new MachineInfo();
      machineInfo.setId(data.device_id);
      machineInfo.setName(data.device_name);
      machineInfo.setBrand(data.cnc_brands);
      for (Map.Entry<String, String> entry : data.param.entrySet()) {
        machineInfo.addParam(entry.getKey(), entry.getValue());
      }

      try {
        ActiveJdbc.operTx(new Operation<Void>() {
          @Override
          public Void operate() {
            Map<String, Object> map = new HashMap<String, Object>();
            map.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
            map.put("modify_time", new Timestamp(System.currentTimeMillis()));
            map.put("cnc_brands", data.cnc_brands);
            map.put("device_id", data.device_id);
            map.put("device_type", data.machine_types);
            if (data.device_name != null) {
              map.put("device_name", data.device_name);
            }

            Device device = new Device();
            device.fromMap(map);

            // 存 m_device
            if (device.saveIt()) {
              try {
                DeviceCncBrand deviceCncBrand = new DeviceCncBrand();
                StringBuilder sb = new StringBuilder();
                sb.append("Select device_id, cnc_id From m_device_cnc_brand ");
                sb.append("where device_id = '" + machineInfo.getId() + "' ");
                String sql = sb.toString();
                List<Map> queryDeviceCncBrand = DeviceCncBrand.findBySQL(sql).toMaps();

                Map tempData = new HashMap();
                tempData.put("device_id", machineInfo.getId());
                tempData.put("cnc_id", machineInfo.getBrand());
                if (queryDeviceCncBrand.size() == 0) {
                  deviceCncBrand.fromMap(tempData);
                  if (!deviceCncBrand.insert()) {
                    throw new RuntimeException("Brand insert fail...");
                  }
                } else {
                  deviceCncBrand.fromMap(tempData);
                  if (!deviceCncBrand.saveIt()) {
                    throw new RuntimeException("Brand update fail...");
                  }
                }
              } catch (Exception e) {
                e.printStackTrace();
                throw new RuntimeException("Brand update fail...");
              }
              // DeviceCncBrand deviceCncBrand = new DeviceCncBrand()
              // .setId(machineInfo.getId())
              // .set("cnc_id", machineInfo.getBrand());
              // if (!deviceCncBrand.saveIt()) {
              // throw new RuntimeException("Brand update fail...");
              // }
            } else {
              throw new RuntimeException("Machine update fail...");
            }

            // 存 xml 檔
            try {
              String message = AdapterIO.marshall(machineInfo);
              if (message != null) {
                throw new RuntimeException(message);
              }
            } catch (DocumentException e) {
              throw new RuntimeException(e.getMessage());
            }

            return null;
          }
        });

      } catch (RuntimeException e) {
        String message = e.getMessage();
        String expPrefix = "java.lang.RuntimeException: ";
        if (message.startsWith(expPrefix)) {
          message = message.substring(expPrefix.length());
        }
        return fail(message);

      } catch (Exception e) {
        return fail(e.getMessage());
      }

      return success();

    } catch (Exception e) {
      return fail(e.getMessage());
    }
  }

  @RequestMapping(value = "/delete", method = DELETE)
  public RequestResult<Void> delete(@RequestBody final Object[] idList) {

    // 順便刪除 WEB-INF/adapter/machine/ 底下的 deviceId.xml
    for (final Object o : idList) {
      String deviceXml = System.getProperty(SysPropKey.ROOT_PATH) + "WEB-INF/adapter/machine/" + o.toString() + ".xml";
      File file = new File(deviceXml);
      // 如果 deviceId.xml 存在的話先刪除檔案
      if (file.exists()) {
        // 刪除 deviceId.xml
        if (!file.delete()) {
          log.warn("WEB-INF/adapter/machine/" + o.toString() + ".xml 刪除失敗!");
        } else {
          // 若 xml 檔刪除成功的話再去刪db
          ActiveJdbc.operTx(new Operation<Integer>() {
            @Override
            public Integer operate() {
              int deleteAmount = Device.delete("device_id IN (" + Util.strSplitBy("?", ",", 1) + ")", o);
              return deleteAmount;
            }
          });
        }
      } else {
        // 若 deviceId.xml不存在的話直接去刪db
        ActiveJdbc.operTx(new Operation<Integer>() {
          @Override
          public Integer operate() {
            int deleteAmount = Device.delete("device_id IN (" + Util.strSplitBy("?", ",", 1) + ")", o);
            return deleteAmount;
          }
        });
      }
    }
    return success();
  }

  @RequestMapping(value = "/readByGroup", method = GET)
  public RequestResult<List<Map>> readByGroup() {
    return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
      @Override
      public RequestResult<List<Map>> operate() {
        List<Map> result = Lists.newArrayList();

        HttpSession session = request.getSession();
        String userId = (String) session.getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        List<SysGroup> groupList = SysGroup.findBySQL("select * from m_sys_user_group where user_id = ? ", userId);

        for (SysGroup sysGroup : groupList) {
          List<SysGroupMachine> machineList = SysGroupMachine.where("group_id = ?", sysGroup.getString("group_id"));

          for (SysGroupMachine sysGroupMachine : machineList) {
            Map<String, String> machineMap = Maps.newHashMap();
            machineMap.put("machine_id", sysGroupMachine.getString("machine_id"));
            if (!result.contains(machineMap)) {
              result.add(machineMap);
            }
          }
        }

        return success(result);
      }
    });
  }

  public static void createMachine(String ID, String brand)
      throws TransformerException, IOException, ParserConfigurationException, SAXException {

    final String ADAPTER_DIR = System.getProperty(SysPropKey.ROOT_PATH) + "WEB-INF\\adapter\\";
    String adapterXml = ADAPTER_DIR + "system\\adapter.xml";

    File adapterXmlFile = new File(adapterXml);
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

        if (thisNodeBrand.equalsIgnoreCase(brand)) {
          Node regNodeClone = regNode.cloneNode(true);
          Element regElementClone = (Element) regNodeClone;
          regElementClone.normalize();
          regElementClone.getElementsByTagName("ID").item(0).getFirstChild().setNodeValue(ID);

          String machineXmlFile = ADAPTER_DIR + "machine\\" + ID + ".xml";

          Document docToWrite = dBuilder.newDocument();
          Node newNode = docToWrite.importNode(regNodeClone, true);
          docToWrite.appendChild(newNode);
          docToWrite.normalizeDocument();
          DOMSource source = new DOMSource(docToWrite);
          StreamResult result = new StreamResult(new File(machineXmlFile));
          TransformerFactory transformerFactory = TransformerFactory.newInstance();
          transformerFactory.setAttribute("indent-number", new Integer(2));
          Transformer transformer = null;
          transformer = transformerFactory.newTransformer();
          transformer.setOutputProperty(OutputKeys.INDENT, "yes");
          transformer.setOutputProperty("omit-xml-declaration", "yes");
          transformer.transform(source, result);
          formatXml(machineXmlFile);
        }
      }
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
    while (br.ready()) {
      String str = br.readLine().trim();
      tagMatcher = tag.matcher(str);
      closerMatcher = closer.matcher(str);
      boolean hasTag = tagMatcher.find();
      boolean hasCloser = closerMatcher.find();
      if (hasTag && hasCloser) {
        for (int i = 0; i < tabs; i++)
          content += "\t";
      } else if (hasTag) {
        for (int i = 0; i < tabs; i++)
          content += "\t";
        tabs++;
      } else if (hasCloser) {
        tabs--;
        for (int i = 0; i < tabs; i++)
          content += "\t";
      } else {
        for (int i = 0; i < tabs; i++)
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

  private class machineCncBrandTypeInfo {
    String device_id;
    String device_name;
    String machine_types;
    String cnc_brands;
    Map<String, String> param;

    public machineCncBrandTypeInfo(String device_id, String device_name, String machine_types, String cnc_brands,
        Map param) {
      this.device_id = device_id;
      this.device_name = device_name;
      this.machine_types = machine_types;
      this.cnc_brands = cnc_brands;
      this.param = param;
    }

  }

}
