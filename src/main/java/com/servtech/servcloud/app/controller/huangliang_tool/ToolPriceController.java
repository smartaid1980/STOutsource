package com.servtech.servcloud.app.controller.huangliang_tool;

import com.servtech.servcloud.app.model.huangliang_tool.ToolPrice;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

@RestController
@RequestMapping("/huangliangToolSetting/toolPrice")
public class ToolPriceController {
    private static final Logger log = LoggerFactory.getLogger(ToolPriceController.class);

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(method = RequestMethod.GET)
    public RequestResult<?> read(@RequestParam("tool_id") final String tool_id,@RequestParam("tsup_id") final String tsup_id) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    String tsup_id_sql = "";
                    SimpleDateFormat SDF = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    if(!tsup_id.equals("")){
                        tsup_id_sql = String.format("AND m.tsup_id = '%s'",tsup_id);
                    }
                    String sql = String.format("SELECT tp.* FROM ( " +
                            "SELECT tsup_id, MAX(create_time) as max_time FROM servcloud.a_huangliang_tool_price WHERE tool_id = '%s' GROUP BY tsup_id) m " +
                            "JOIN a_huangliang_tool_price tp " +
                            "ON tp.tsup_id= m.tsup_id " +
                            "AND tp.create_time = m.max_time " +
                            "JOIN a_huangliang_tool_supplier ts " +
                            "ON m.tsup_id = ts.tsup_id " +
                            "WHERE ts.is_open = 'Y' ",tool_id) + tsup_id_sql;
                    log.info("sql : "+ sql);
                    List<Map> toolPriceList = ToolPrice.findBySQL(sql).toMaps();
                    toolPriceList.forEach(map -> {
                      Map pks = new HashMap<>();
                      pks.put("tool_id", map.get("tool_id"));
                      pks.put("tsup_id", map.get("tsup_id"));
                      pks.put("create_time", SDF.format(map.get("create_time")));
                      map.put("pks", pks);
                    });
                    return success(toolPriceList);
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody final Map<String, Object> data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    String tool_id = data.get("tool_id").toString();
                    String tsup_id = data.get("tsup_id").toString();
                    Double tool_price = (Double)data.get("tool_price");
                    String create_time = data.get("create_time").toString();
                    Object userId = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    Map pks = new HashMap<>();
                    pks.put("tool_id", tool_id);
                    pks.put("tsup_id", tsup_id);
                    pks.put("create_time", create_time);
                    ToolPrice toolPrice = new ToolPrice();
                    toolPrice.fromMap(data);
                    toolPrice.set("create_by", userId);
                    if(toolPrice.insert()){
                        return success(pks);
                    }else {
                        return fail("Insert ToolPrice fail..");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }
}