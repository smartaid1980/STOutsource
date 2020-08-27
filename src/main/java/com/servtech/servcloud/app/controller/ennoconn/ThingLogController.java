package com.servtech.servcloud.app.controller.ennoconn;

import com.servtech.servcloud.app.model.ennoconn.ThingLog;
import com.servtech.servcloud.app.model.storage.Log;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Date;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.success;

@RestController
@RequestMapping("/ennoconn/thing-log")
public class ThingLogController {
    private static final Logger LOG = LoggerFactory.getLogger(FileSyncController.class);
    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> read(@RequestBody Map data) {
//        public RequestResult<?> read(@RequestParam(value = "where", required = false) String where) {
        return ActiveJdbc.operTx(() -> {
            Object whereClause = data.get("whereClause");
            List<Map> thingLogList;
            if (whereClause != null && !whereClause.toString().equals("")) {
                System.out.println(whereClause.toString());
                thingLogList = ThingLog.find(whereClause.toString()).toMaps();
            } else {
                thingLogList = ThingLog.findAll().toMaps();
            }

            for (Map thingLog : thingLogList) {
                String situation = thingLog.get("situation").toString();
                if (thingLog.get("store_grid_id_to") != null || thingLog.get("store_grid_id_from") != null)
                    continue;

                String log_type = getLogType(thingLog.get("situation").toString());
                String create_time = thingLog.get("create_time").toString();

                Log log;
                if (log_type.equals("1")) {
                    log = Log.findFirst("log_time = ? and thing_id = ? and log_type = '1'"
                            , create_time, thingLog.get("thing_id").toString());
                    if (log == null)
                        continue;
                    thingLog.put("store_grid_id_to", log.getString("store_grid_index"));
                    thingLog.put("store_cell_id_to", log.getString("store_cell_index"));

                } else if (situation.equals("24") || situation.equals("25")) {
                    log = Log.findFirst("thing_id = ? and log_type = '2' order by create_time desc"
                            , thingLog.get("thing_id").toString());
                    thingLog.put("store_grid_id_from", log.getString("store_grid_index"));
                    thingLog.put("store_cell_id_from", log.getString("store_cell_index"));

                } else {
                    String billKey = "bill_no_out";
                    if (thingLog.get("situation").toString().equals("22"))
                        billKey = "smt_stn_id";
                    String likeSql = thingLog.get(billKey).toString() + "%";
                    log = Log.findFirst("thing_id = ? and log_type = '2' and doc_id like ? order by create_time desc"
                            , thingLog.get("thing_id").toString(), likeSql);
                    if (log == null)
                        continue;
                    thingLog.put("store_grid_id_from", log.getString("store_grid_index"));
                    thingLog.put("store_cell_id_from", log.getString("store_cell_index"));
                }
            }
            return success(thingLogList);
        });
    }

    private String getLogType(String situation) {
        if (situation.startsWith("1"))
            return "1";
        return "2";
    }

    @RequestMapping(method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody Map data) {
        return ActiveJdbc.operTx(() -> {
            List<String> logs = (List<String>) data.get("logs");
            String sql = String.format("update a_storage_thing_log set is_export = 'Y' where log_id in %s", getLogsIn(logs));
            System.out.println(sql);
            Base.exec(sql);

            return success("update success");
        });
    }

    private String getLogsIn(List<String> logs) {
        StringBuffer sb = new StringBuffer();
        sb.append("(");
        for (int i = 0; i < logs.size(); i++) {
            String log = logs.get(i);
            sb.append("\'" + log + "\'");
            if (i != logs.size() - 1)
                sb.append(",");
        }
        sb.append(")");
        return sb.toString();
    }
}
