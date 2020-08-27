package com.servtech.servcloud.module.controller;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;

import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.model.LineMachine;
import com.servtech.servcloud.module.model.LineType;

import org.javalite.activejdbc.Base;
import org.javalite.activejdbc.DBException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;

import java.io.*;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;

import static org.springframework.web.bind.annotation.RequestMethod.*;
import static com.servtech.servcloud.core.util.RequestResult.*;

/**
 * Created by Admin on 2015/8/21.
 */

@RestController
@RequestMapping("/lineMachine")
public class LineMachineController {

  private static final Logger logger = LoggerFactory.getLogger(LineMachineController.class);

  @Autowired
  private HttpServletRequest request;

  @RequestMapping(value = "/create", method = POST)
  public RequestResult<String> create(@RequestBody final Map data) {
    try {
      return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
        @Override
        public RequestResult<String> operate() {
          String line_id = String.valueOf(System.currentTimeMillis());

          for (Map detail : (List<Map>) data.get("detail")) {
            detail.put("line_id", line_id);
            detail.put("line_name", data.get("line_name"));
            detail.put("type_id", data.get("type_id"));
            detail.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
            detail.put("create_time", new Timestamp(System.currentTimeMillis()));
            detail.put("create_from", "table");

            LineMachine lineMachine = new LineMachine();
            lineMachine.fromMap(detail);
            if (!lineMachine.insert()) {
              return fail("新增失敗,原因待查...");
            }
          }

          return success(line_id);
        }
      });

    } catch (Exception e) {
      return fail(e.getMessage());
    }
  }

  @RequestMapping(value = "/read", method = GET)
  public RequestResult<List<LineMap>> read() {
    return ActiveJdbc.oper(new Operation<RequestResult<List<LineMap>>>() {
      @Override
      public RequestResult<List<LineMap>> operate() {
        //{lineId:{line_id, line_name, type_id, details:[{}, ...]}, ...}
        Map<String, LineMap> result = new HashMap<String, LineMap>();
        List<Map> lineMachineList =
            Base.findAll("SELECT a.line_id, a.line_name, a.machine_seq, a.type_id, a.op_seq, a.machine_id, b.op_name, b.type_name " +
                "FROM m_line_machine as a, m_line_type as b " +
                "WHERE a.type_id=b.type_id and a.op_seq = b.op_seq;");

        for (Map map : lineMachineList) {
          Detail detail = new Detail(map);
          LineMap lineMap = new LineMap(map, detail);
          String lineId = map.get("line_id").toString();
          if (result.containsKey(lineId)) {
            result.get(lineId).addDetail(detail);
          } else {
            result.put(lineId, lineMap);
          }
        }

        List<LineMap> returnList = new ArrayList<LineMap>(result.values());
        return success(returnList);
      }
    });
  }

  @RequestMapping(value = "/readTypeMachine", method = GET)   //找出typeId的所有machine
  public RequestResult<List<Map>> readTypeMachineList(@RequestParam("type_id") final String typeId) {
    return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
      @Override
      public RequestResult<List<Map>> operate() {

        List<LineMachine> lineMachineList = LineMachine.where("type_id = ? and is_close=?", typeId, 0);
        List<LineType> lineTypes = LineType.where("type_id = ? and is_close=?", typeId, 0);
        Map<Integer, String> opName = new HashMap<Integer, String>();
        Map<String, Map> typeMachineList = new HashMap<String, Map>();

        for (LineType e : lineTypes) {
          opName.put(e.getInteger("op_seq"), e.getString("op_name"));
        }

        for (LineMachine e : lineMachineList) {
          String lineId = e.getString("line_id");
          String seq = opName.get(e.getInteger("op_seq")) + " - " + e.getInteger("machine_seq").toString();

          if (typeMachineList.containsKey(lineId)) {
            typeMachineList.get(lineId).put(seq, e.getString("machine_id"));
          } else {
            Map temp = new TreeMap();
            temp.put("line_id", lineId);
            temp.put("line_name", e.getString("line_name"));
            temp.put("type_id", e.getString("type_id"));
            temp.put(seq, e.getString("machine_id"));
            typeMachineList.put(lineId, temp);
          }
        }

        List<Map> returnList = new ArrayList<Map>(typeMachineList.values());
        return success(returnList);
      }
    });
  }

  @RequestMapping(value = "/update", method = PUT)
  public RequestResult<String> update(@RequestBody final Map data) {
    return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
      @Override
      public RequestResult<String> operate() {

        for (Map detail : (List<Map>) data.get("detail")) {
          detail.put("line_id", data.get("line_id"));
          detail.put("line_name", data.get("line_name"));
          detail.put("type_id", data.get("type_id"));
          detail.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
          detail.put("modify_time", new Timestamp(System.currentTimeMillis()));
          detail.put("modify_from", "table");

          LineMachine lineMachine = new LineMachine();
          lineMachine.fromMap(detail);
          if (!lineMachine.saveIt()) {
            return fail("修改失敗,原因待查...");
          }
        }

        return success(data.get("line_id").toString());
      }
    });
  }

  @RequestMapping(value = "/delete", method = DELETE)
  public RequestResult<Void> delete(@RequestBody final String[] idList) {
    return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
      @Override
      public RequestResult<Void> operate() {
        LineMachine.delete("line_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
        return success();
      }
    });
  }

  @RequestMapping(value = "/checkFile", method = POST)  //先確認file的格式符不符合
  public RequestResult<String> checkFile(@RequestParam("file") final MultipartFile file, @RequestParam("line-type") final String type) {
    return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
      @Override
      public RequestResult<String> operate() {
        //String errorState = "null";
        List<String> lineList = new ArrayList<String>();
        try {
          //errorState = "0 ";
          BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"));
          String line;
          while (br.ready() && !((line = br.readLine()) == null || line.equals(""))) {
            //errorState=errorState+" @ ";
            lineList.add(line);
          }

          if (lineList.size() <= 1) {
            return fail("*檔案沒有內容");
          }
        } catch (IOException e) {
          return fail("*檔案無法讀取");
        }

        String typeId = null;
        String typeName = null;
        Map<String, Integer> opMachine = new HashMap<String, Integer>();
        List<LineType> typeList;
        Map<String, Map<String, Integer>> lineTypeMap = new HashMap<String, Map<String, Integer>>();

        //找出type_name=type參數的typeList
        typeList = LineType.where("type_name = ? and is_close=0 ", type);
        if (typeList.size() == 0) {
          return fail(type + " 不存在!");
        }
        for (LineType l : typeList) {
          if (!lineTypeMap.containsKey(l.getString("type_id"))) {
            Map<String, Integer> m = new HashMap<String, Integer>();
            m.put(l.getString("op_name"), l.getInteger("machine_num"));
            lineTypeMap.put(l.getString("type_id"), m);
          } else {
            lineTypeMap.get(l.getString("type_id")).put(l.getString("op_name"), l.getInteger("machine_num"));
          }
        }

        //取標頭，先找出相對應的 type_id
        String[] columns = lineList.get(0).split(",");
        for (int i = 1; i < columns.length; i++) {

          String header = columns[i];
          String opName = null;
          if (header.contains("-")) {
            opName = header.substring(0, header.indexOf("-"));
          } else {
            opName = header;
          }

          if (opMachine.containsKey(opName)) {
            int num = opMachine.get(opName);
            opMachine.remove(opName);
            opMachine.put(opName, num + 1);
          } else {
            opMachine.put(opName, 1);
          }

        }

        Map<String, Integer> sortOpMachine = new TreeMap<String, Integer>(opMachine);
        for (Map.Entry<String, Map<String, Integer>> e : lineTypeMap.entrySet()) {
          int flag = 1;
          Map<String, Integer> sortLineType = new TreeMap<String, Integer>(e.getValue());
          if (e.getValue().size() == sortOpMachine.size()) {
            Iterator itLine = sortLineType.entrySet().iterator();
            Iterator itOp = sortOpMachine.entrySet().iterator();
            while (itLine.hasNext() && itOp.hasNext()) {
              Map.Entry entryLine = (Map.Entry) itLine.next();
              Map.Entry entryOp = (Map.Entry) itOp.next();
              if (!entryLine.getKey().equals(entryOp.getKey()) || entryLine.getValue() != entryOp.getValue()) {
                flag = 0;
                break;
              }
            }
          } else {
            flag = 0;
          }
          if (flag == 1) { //flag==1表示有找到格式相符的type_id
            typeId = e.getKey();
            typeName = typeList.get(0).getString("type_name");
            break;
          }
        }

        if (typeId == null) {
          throw new DBException("*找不到line type !");
        }

        return success("*" + typeId + "#" + typeName);
      }
    });
  }

  @RequestMapping(value = "/upload", method = POST)
  public RequestResult<String> upload(@RequestParam("file") MultipartFile file, @RequestParam("type-id") String type) {

    try {
      BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"));
      List<String> lineList = new ArrayList<String>();
      String line;
      while ((line = br.readLine()) != null) {
        lineList.add(line);
      }
      if (lineList.size() > 1) {
        updateDB(type, lineList);
      } else {
        return fail("*檔案沒有內容");
      }
    } catch (IOException e) {
      return fail("*檔案無法讀取");
    } catch (DBUpdateException e) {
      return fail(e.getMessage());
    }

    try {

      String fileName = file.getOriginalFilename();
      File uploadCopyFile = new File(System.getProperty(SysPropKey.ROOT_PATH) + "../../../data/" +
          fileName.substring(0, fileName.indexOf(".")) + "_" +
          new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date()) +
          fileName.substring(fileName.indexOf(".")));
      file.transferTo(uploadCopyFile);

    } catch (Exception e) {
      logger.warn("上傳文件備份失敗 ", e);
    }

    return success();
  }

  private void updateDB(final String type, final List<String> lineList) throws DBUpdateException {
    try {
      ActiveJdbc.operTx(new Operation<Void>() {
        @Override
        public Void operate() {

          int[] opSeq = null;
          int[] machineSeq = null;
          String typeId = null;
          List<String> machineList = new ArrayList<String>();
          List<LineType> typeList;
          for (Map m : Device.findAll().toMaps()) {
            machineList.add(m.get("device_id").toString());
          }

          String[] columns = lineList.get(0).split(",");
          opSeq = new int[columns.length];
          machineSeq = new int[columns.length];

          int index = 0;
          for (int i = 1; i < columns.length; i++) {

            String header = columns[i];
            if (header.contains("-")) {
              machineSeq[i] = Integer.parseInt(header.substring(header.indexOf("-") + 1));
            } else {
              machineSeq[i] = 1;
            }

            if (machineSeq[i] == 1) {
              index++;
              opSeq[i] = index;
            } else {
              opSeq[i] = index;
            }

          }

          if (type == null) {
            throw new DBException("*line_type 格式錯誤!  ");
          } else {
            typeId = type;
          }

          for (int i = 1; i < lineList.size(); i++) {
            String[] dataColumns = lineList.get(i).split(",");

            if (dataColumns[0] != null || dataColumns[0].equals("")) {

              String lineId = String.valueOf(System.currentTimeMillis());
              for (int j = 1; j < columns.length; j++) {

                if (j != dataColumns.length && dataColumns[j] != null && !dataColumns[j].equals("")) {

                  if (!machineList.contains(dataColumns[j])) {
                    throw new DBException("*Line Name : " + dataColumns[0] + " , " + columns[j] + " 的機台不存在! ");
                  } else {

                    LineMachine lineMachine;
                    //用primary key 來 check有沒有重複的資料
                    if (LineMachine.where("line_name = ? and machine_seq = ? and type_id = ? and op_seq = ? and is_close=?", dataColumns[0], machineSeq[j], typeId, opSeq[j], 0).size() > 0) {

                      lineMachine = (LineMachine) LineMachine.where("line_name = ? and machine_seq = ? and type_id = ? and op_seq = ? and is_close=?", dataColumns[0], machineSeq[j], typeId, opSeq[j], 0).get(0);
                      lineMachine.set("machine_id", dataColumns[j]);
                      lineMachine.set("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                      lineMachine.set("modify_time", new Timestamp(System.currentTimeMillis()));
                      lineMachine.set("modify_from", "csv");
                      if (!lineMachine.saveIt()) {
                        throw new DBException("*line_id : " + dataColumns[0] + " - op_seq : " + opSeq[j] +
                            " - machine_seq : " + machineSeq[j] + " save fail!");
                      }

                    } else {
                      lineMachine = new LineMachine();
                      lineMachine.set("line_id", lineId);
                      lineMachine.set("line_name", dataColumns[0]);
                      lineMachine.set("type_id", typeId);
                      lineMachine.set("machine_seq", machineSeq[j]);
                      lineMachine.set("op_seq", opSeq[j]);
                      lineMachine.set("machine_id", dataColumns[j]);
                      lineMachine.set("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                      lineMachine.set("create_time", new Timestamp(System.currentTimeMillis()));
                      lineMachine.set("create_from", "csv");

                      if (!lineMachine.insert()) {
                        throw new DBException("*line_id : " + dataColumns[0] + " - op_seq : " + opSeq[j] +
                            " - machine_seq : " + machineSeq[j] + " insert fail!");
                      } else {
                        logger.info("insert  " + "line_id : " + dataColumns[0] + " - op_seq : " + opSeq[j] +
                            " - machine_seq : " + machineSeq[j] + " ! success !");
                      }
                    }
                  }
                } else {
                  if (LineMachine.where("line_name = ? and machine_seq = ? and type_id = ? and op_seq = ? and is_close=?", dataColumns[0], machineSeq[j], typeId, opSeq[j], 0).size() == 0) {
                    LineMachine lineMachine = new LineMachine();
                    lineMachine.set("line_id", lineId);
                    lineMachine.set("line_name", dataColumns[0]);
                    lineMachine.set("type_id", typeId);
                    lineMachine.set("machine_seq", machineSeq[j]);
                    lineMachine.set("op_seq", opSeq[j]);
                    lineMachine.set("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    lineMachine.set("create_time", new Timestamp(System.currentTimeMillis()));
                    lineMachine.set("create_from", "csv");
                    if (!lineMachine.insert()) {
                      throw new DBException("*line_id : " + dataColumns[0] + " - op_seq : " + opSeq[j] +
                          " - machine_seq : " + machineSeq[j] + " insert fail!");
                    } else {
                      logger.info("insert  " + "line_id : " + dataColumns[0] + " - op_seq : " + opSeq[j] +
                          " - machine_seq : " + machineSeq[j] + " ! success !");
                    }
                  }
                }
              }
            }
          }
          return null;
        }
      });
    } catch (Exception e) {
      logger.warn(e.getMessage());
      throw new DBUpdateException(e.getMessage());
    }
  }

  private static class DBUpdateException extends Exception {
    public DBUpdateException(String msg) {
      super(msg);
    }
  }

  public static class Detail {
    String op_name = "";
    String op_seq = "";
    String machine_seq = "";
    String machine_id = "";

    public Detail(Map map) {
      try {
        this.op_name = map.get("op_name").toString();
        this.op_seq = map.get("op_seq").toString();
        this.machine_seq = map.get("machine_seq").toString();
        this.machine_id = map.get("machine_id").toString();
      } catch (NullPointerException e) { }
    }
  }

  public static class LineMap {
    String line_id = "";
    String line_name = "";
    String type_id = "";
    String type_name = "";
    List<Detail> details;

    public LineMap(Map map, Detail detail) {
      this.line_id = map.get("line_id").toString();
      this.line_name = map.get("line_name").toString();
      this.type_id = map.get("type_id").toString();
      this.type_name = map.get("type_name").toString();

      List<Detail> details = new ArrayList<Detail>();
      details.add(detail);
      this.details = details;
    }

    public void addDetail(Detail detail) {
      this.details.add(detail);
    }
  }
}


