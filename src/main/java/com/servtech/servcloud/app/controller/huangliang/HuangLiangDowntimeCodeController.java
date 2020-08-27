package com.servtech.servcloud.app.controller.huangliang;

import com.servtech.servcloud.app.model.huangliang.DowntimeCode;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Jenny on 2016/8/15.
 */
@RestController
@RequestMapping("/downtimeCode")
public class HuangLiangDowntimeCodeController {

  private static final Logger log = LoggerFactory.getLogger(HuangLiangDowntimeCodeController.class);

  @Autowired
  private HttpServletRequest request;

  @RequestMapping(value = "/create", method = POST)
  public RequestResult<?> create(@RequestBody final Map data) {
    try {
      return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
        @Override
        public RequestResult<?> operate() {
          data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
          data.put("create_time", new Timestamp(System.currentTimeMillis()));
          data.remove("modify_by");
          data.remove("modify_time");

          DowntimeCode downtimeCode = new DowntimeCode();
          downtimeCode.fromMap(data);
          if (downtimeCode.insert()) {
            return success(data.get("downtime_code").toString());
          } else {
            return fail("create downtimeCode fail...");
          }
        }
      });
    } catch (Exception e) {
      return fail(e.getMessage());
    }
  }

  @RequestMapping(value = "/update", method = PUT)
  public RequestResult<?> update(@RequestBody final Map data) {
    return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
      @Override
      public RequestResult<?> operate() {
        data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
        data.put("modify_time", new Timestamp(System.currentTimeMillis()));

        DowntimeCode downtimeCode = new DowntimeCode();
        downtimeCode.fromMap(data);
        if (downtimeCode.saveIt()) {
          return success(data.get("downtime_code").toString());
        } else {
          return fail("update downtimeCode fail...");
        }
      }
    });
  }

  @RequestMapping(value = "/read", method = GET)
  public RequestResult<List<Map>> read() {
    return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
      @Override
      public RequestResult<List<Map>> operate() {
        List<Map> downtimeCodes = DowntimeCode.findAll().toMaps();
        return success(downtimeCodes);
      }
    });
  }

  @RequestMapping(value = "/delete", method = DELETE)
  public RequestResult<String> delete(@RequestBody final Object[] idList) {
    return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
      @Override
      public RequestResult<String> operate() {
        try {
          DowntimeCode.delete("downtime_code IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
          return success();
        } catch (Exception e) {
          log.warn("delete fail: ", e.getMessage());
          return fail(e.getMessage());
        }
      }
    });
  }
}
