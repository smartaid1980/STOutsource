package com.servtech.servcloud.app.controller.downtime_analysis;

import com.servtech.servcloud.app.model.downtime_analysis.WorkMacroRecord;
import com.servtech.servcloud.app.model.downtime_analysis.WorkMacroRecordLog;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.service.license.exception.ValidateException;
import com.servtech.servcloud.core.util.RequestResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.concurrent.ConcurrentHashMap;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static com.servtech.servcloud.core.util.Util.getTimeLongFormat;

/**
 * Created by Jenny on 2017/3/3.
 */
@RestController
@RequestMapping("/v3/servcore/macro-downtime")
public class ServcoreV3MacroIdleController {

  private static ConcurrentHashMap<String, Map> LATEST_WORK_MACRO = new ConcurrentHashMap<String, Map>();

  @Autowired
  private HttpServletRequest request;

  @Autowired
  private HttpServletResponse response;

  @RequestMapping(value = "/record", method = RequestMethod.POST)
  public RequestResult insertMacroRecord(@RequestBody final Map data) {
    try {
      return ActiveJdbc.operTx(new Operation<RequestResult>() {
        @Override
        public RequestResult operate() {
          // 取得現在時間
          long timeMillis = System.currentTimeMillis();

          // 用現在時間比對shift_name
          // Date time =new Date(timeMillis);
          // SimpleDateFormat shift_time_format= new SimpleDateFormat("HH:mm:ss");
          //
          // StringBuilder nowTimeToName = new StringBuilder("SELECT name ");
          // nowTimeToName.append("FROM servcloud.m_work_shift_time where \'");
          // nowTimeToName.append(shift_time_format.format(time));
          // nowTimeToName.append("\' between start and end;");
          //
          // String sql = nowTimeToName.toString();

          // String user="fred";
          String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

          WorkMacroRecord workMacroRecord = new WorkMacroRecord();
          Map map = new HashMap();

          map.put("machine_id", data.get("machine_id"));
          map.put("macro_create_time", getTimeLongFormat());
          map.put("macro", data.get("macro"));

          // map.put("shift_name",Base.firstColumn(sql).get(0));
          // 暫時不用比對shift_name

          map.put("create_by", user);
          map.put("create_time", new Timestamp(timeMillis));
          map.put("modify_by", user);
          map.put("modify_time", new Timestamp(timeMillis));

          workMacroRecord.fromMap(map);
          if (workMacroRecord.insert()) {
              LATEST_WORK_MACRO.put(workMacroRecord.get("machine_id").toString(), map);
              insertMacroRecordLog("create", map);
              return success(LATEST_WORK_MACRO);
          } else {
            return fail("insert fail !");
          }
        }
      });
    } catch (Exception e) {
      e.printStackTrace();
      return fail(e.getMessage());
    }
  }

  @RequestMapping(method = RequestMethod.POST)
  public RequestResult createMacroRecord(@RequestBody final Map data) {
    try {
      return ActiveJdbc.operTx(new Operation<RequestResult>() {
        @Override
        public RequestResult operate() {
          // 取得現在時間
          long timeMillis = System.currentTimeMillis();
          Timestamp timestamp = new Timestamp(timeMillis);
          String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
          String machineId = data.get("machine_id").toString();
          String macroCreateTime = data.get("macro_create_time").toString();
          WorkMacroRecord existWorkMacroRecord = WorkMacroRecord.findFirst("machine_id=? AND macro_create_time=?", machineId, macroCreateTime);
          if (existWorkMacroRecord != null) {
            return fail("duplicated");
          }
          WorkMacroRecord workMacroRecord = new WorkMacroRecord();
          workMacroRecord.fromMap(data);
          workMacroRecord.set("create_by", user);
          workMacroRecord.set("create_time", timestamp);
          workMacroRecord.set("modify_by", user);
          workMacroRecord.set("modify_time", timestamp);

          if (workMacroRecord.insert()) {
            Map recordMap = workMacroRecord.toMap();
            Map cachedMachineMacroRecord = LATEST_WORK_MACRO.get(machineId);
            long cachedMachineMacroCreateTime = cachedMachineMacroRecord != null ?
                    Long.parseLong(cachedMachineMacroRecord.get("macro_create_time").toString()) :
                    0l;
            if (cachedMachineMacroRecord == null || (
                    cachedMachineMacroCreateTime != 0l &&
                        Long.parseLong(workMacroRecord.get("macro_create_time").toString()) > cachedMachineMacroCreateTime
            )) {
              LATEST_WORK_MACRO.put(machineId, recordMap);
            }
            insertMacroRecordLog("create", recordMap);
            Map pksMap = new HashMap();
            pksMap.put("machine_id", machineId);
            pksMap.put("macro_create_time", Long.parseLong(data.get("macro_create_time").toString()));
            return success(pksMap);
          } else {
            return fail("update fail !");
          }
        }
      });
    } catch (Exception e) {
      e.printStackTrace();
      return fail(e.getMessage());
    }
  }

  @RequestMapping(method = RequestMethod.PUT)
  public RequestResult updateMacroRecord(@RequestBody final Map data) {
    try {
      return ActiveJdbc.operTx(new Operation<RequestResult>() {
        @Override
        public RequestResult operate() {
          // 取得現在時間
          long timeMillis = System.currentTimeMillis();
          Timestamp timestamp = new Timestamp(timeMillis);
          String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
          Long macroCreateTime = Long.parseLong(data.get("macro_create_time").toString());
          String machineId = data.get("machine_id").toString();
          String macro = data.get("macro").toString();
          WorkMacroRecord workMacroRecord = WorkMacroRecord.findFirst("machine_id=? AND macro_create_time=?", machineId, macroCreateTime);

          workMacroRecord.set("macro", macro);
          workMacroRecord.set("modify_time", timestamp);
          workMacroRecord.set("modify_by", user);

          if (workMacroRecord.saveIt()) {
            Map recordMap = workMacroRecord.toMap();
            Map cachedMachineMacroRecord = LATEST_WORK_MACRO.get(machineId);
            long cachedMachineMacroCreateTime = cachedMachineMacroRecord != null ?
                    Long.parseLong(cachedMachineMacroRecord.get("macro_create_time").toString()) :
                    0l;
            if (cachedMachineMacroRecord == null || (
                    cachedMachineMacroCreateTime != 0l &&
                            Long.parseLong(workMacroRecord.get("macro_create_time").toString()) >= cachedMachineMacroCreateTime
            )) {
              LATEST_WORK_MACRO.put(machineId, recordMap);
            }
            insertMacroRecordLog("update", recordMap);
            Map pksMap = new HashMap();
            pksMap.put("machine_id", machineId);
            pksMap.put("macro_create_time", macroCreateTime);
            return success(pksMap);
          } else {
            return fail("update fail !");
          }
        }
      });
    } catch (Exception e) {
      e.printStackTrace();
      return fail(e.getMessage());
    }
  }

  @RequestMapping(method = RequestMethod.DELETE)
  public RequestResult deleteMacroRecord(@RequestBody final List<Map<String, Object>> deleteIds) {
    try {
      return ActiveJdbc.operTx(new Operation<RequestResult>() {
        @Override
        public RequestResult operate() {
          // 取得現在時間
          long timeMillis = System.currentTimeMillis();
          Timestamp timestamp = new Timestamp(timeMillis);
          String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

          StringJoiner whereClauseJoiner = new StringJoiner(" OR ");
          List<Object> params = new ArrayList<>();

          deleteIds.forEach(map -> {
            StringJoiner pksJoiner = new StringJoiner(" AND ", "(", ")");
            for (Map.Entry<String, Object> entry : map.entrySet()) {
              pksJoiner.add(entry.getKey() + "=?");
              params.add(entry.getValue());
            }
            whereClauseJoiner.add(pksJoiner.toString());
          });
          int deleteCount = (Integer) WorkMacroRecord.delete(whereClauseJoiner.toString(), params.toArray(new Object[0]));
          if (deleteCount == deleteIds.size() && deleteCount > 0) {
              // refresh LATEST_WORK_MACRO
              List<Map> dataList = WorkMacroRecord.findBySQL("SELECT * FROM (" +
                      "   SELECT * " +
                      "   FROM a_work_macro_record " +
                      "   order by macro_create_time desc) " +
                      "temp group by machine_id;").toMaps();
              Map<String, Map> dataMap = new HashMap<>();
              for (Map map : dataList) {
                  dataMap.put(map.get("machine_id").toString(), map);
              }
              for (String machineId : LATEST_WORK_MACRO.keySet()) {
                if (dataMap.containsKey(machineId)) {
                  LATEST_WORK_MACRO.put(machineId, dataMap.get(machineId));
                } else {
                  LATEST_WORK_MACRO.remove(machineId);
                }
              }

              deleteIds.forEach(pksMap -> {
                Map<String, Object> map = new HashMap<>();
                map.putAll(pksMap);
                map.put("modify_time", timestamp);
                map.put("modify_by", user);
                insertMacroRecordLog("delete", map);
              });
              
              return success(deleteCount);
          } else {
            return fail("delete fail !");
          }
        }
      });
    } catch (Exception e) {
      e.printStackTrace();
      return fail(e.getMessage());
    }
  }

  @RequestMapping(value = "/getLatestWorkMacro", method = RequestMethod.GET)
  public RequestResult getLatestWorkMacro() {
    if (LATEST_WORK_MACRO.isEmpty()) {
      LATEST_WORK_MACRO = init();
    }
    return success(LATEST_WORK_MACRO);
  }

  @RequestMapping(value = "/getLatestWorkMacroFromDB", method = RequestMethod.GET)
  public RequestResult getLatestWorkMacroFromDB() {
    LATEST_WORK_MACRO = init();
    return success(LATEST_WORK_MACRO);
  }

  private ConcurrentHashMap<String, Map> init() {
      return ActiveJdbc.operTx(new Operation<ConcurrentHashMap<String, Map>>() {
          @Override
          public ConcurrentHashMap<String, Map> operate() {
              List<Map> dataList = WorkMacroRecord.findBySQL("SELECT * FROM (" +
                      "   SELECT * " +
                      "   FROM a_work_macro_record " +
                      "   order by macro_create_time desc) " +
                      "temp group by machine_id;").toMaps();
              for (Map map : dataList) {
                  LATEST_WORK_MACRO.put(map.get("machine_id").toString(), map);
              }
              return LATEST_WORK_MACRO;
          }
      });
  }

  private boolean insertMacroRecordLog(String type, Map recordMap) {
    WorkMacroRecordLog log = new WorkMacroRecordLog();
    log.set("machine_id", recordMap.get("machine_id"));
    log.set("macro_create_time", recordMap.get("macro_create_time"));
    log.set("type", type);
    log.set("macro_after", recordMap.get("macro"));
    log.set("create_time", recordMap.get("modify_time"));
    log.set("create_by", recordMap.get("modify_by"));
    return log.saveIt();
  }
}
