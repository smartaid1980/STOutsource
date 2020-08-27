package com.servtech.servcloud.app.controller.huangliang_matStock;

import com.servtech.servcloud.app.model.huangliang_matStock.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.filter.AuthFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.sql.*;
import java.util.*;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/huangliangMatStock/matPrice")
public class EditMatPriceController {
    private static final Logger log = LoggerFactory.getLogger(EditMatPriceController.class);
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    SimpleDateFormat sqlSdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> insertMatPrice(@RequestBody final Map<String, Object> data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

                MatPriceList matPriceList = new MatPriceList();
                Map<String, Object> insertData = new HashMap<>();
                insertData.putAll(data);
                insertData.put("create_time", data.get("modify_time"));
                insertData.put("create_by", login_user);
                insertData.put("modify_by", login_user);

                matPriceList.fromMap(insertData);
                try {
                  matPriceList.insert();
                  Map<String, Object> logData = new HashMap<>();
                  logData.putAll(insertData);
                  logData.put("previous_mat_price", null);
                  logData.put("changed_mat_price", insertData.get("mat_price"));
                  insertMatPriceChgLog(logData);
                } catch (Exception e) {
                    log.warn(e.getMessage());
                }
                Map<String, Object> pks = new HashMap<>();
                pks.put("mat_id", insertData.get("mat_id"));
                pks.put("sup_id", insertData.get("sup_id"));
                return RequestResult.success(pks);
            }
        });
    }

    @RequestMapping(method = RequestMethod.PUT)
    public RequestResult<?> updateMatPrice(@RequestBody final Map<String, Object> data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

                MatPriceList matPriceList = MatPriceList.findFirst("mat_id=? AND sup_id=?", data.get("mat_id"), data.get("sup_id"));
                Object previous_mat_price = matPriceList.get("mat_price");
                Object changed_mat_price = data.get("mat_price");
                Map<String, Object> updateData = new HashMap<>();
                updateData.putAll(data);
                updateData.put("modify_by", login_user);
                matPriceList.fromMap(updateData);
                try {
                  matPriceList.saveIt();
                  Map<String, Object> logData = new HashMap<>();
                  logData.putAll(updateData);
                  logData.put("previous_mat_price", previous_mat_price);
                  logData.put("changed_mat_price", changed_mat_price);
                  insertMatPriceChgLog(logData);
                } catch (Exception e) {
                    log.warn(e.getMessage());
                }
                Map<String, Object> pks = new HashMap<>();
                pks.put("mat_id", updateData.get("mat_id"));
                pks.put("sup_id", updateData.get("sup_id"));
                return RequestResult.success(pks);
            }
        });
    }
    @RequestMapping(method = RequestMethod.DELETE)
    public RequestResult<?> deleteMatPrice(@RequestBody final List<Map<String, Object>> deleteIds) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                long timeMillis = System.currentTimeMillis();
                Timestamp timestamp = new Timestamp(timeMillis);
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
                List<Map> dataList = MatPriceList.find(whereClauseJoiner.toString(), params.toArray(new Object[0])).toMaps();
                Map priceMap = new HashMap<>();
                for (Map data : dataList) {
                  priceMap.put(data.get("sup_id").toString(), data.get("mat_price"));
                }
                int deleteCount = 0;
                try {
                  deleteCount = (Integer) MatPriceList.delete(whereClauseJoiner.toString(), params.toArray(new Object[0]));
                  if (deleteCount == deleteIds.size() && deleteCount > 0) {
                      deleteIds.forEach(pksMap -> {
                        Map<String, Object> logData = new HashMap<>();
                        logData.putAll(pksMap);
                        logData.put("previous_mat_price", priceMap.get(pksMap.get("sup_id").toString()));
                        logData.put("changed_mat_price", null);
                        logData.put("modify_time", timestamp);
                        logData.put("modify_by", login_user);
                        insertMatPriceChgLog(logData);
                      });
                  } else {
                    throw new RuntimeException("delete fail...");
                  }
                } catch (Exception e) {
                    log.warn(e.getMessage());
                }
                return RequestResult.success(deleteCount);
            }
        });
    }
    private boolean insertMatPriceChgLog(Map data) {
      MatPriceChgLog log = new MatPriceChgLog();
      log.set("mat_id", data.get("mat_id"));
      log.set("sup_id", data.get("sup_id"));
      log.set("changed_mat_price",  data.get("changed_mat_price"));
      log.set("previous_mat_price",  data.get("previous_mat_price"));
      log.set("create_time", data.get("modify_time"));
      log.set("create_by", data.get("modify_by"));
      return log.saveIt();
    }

}
