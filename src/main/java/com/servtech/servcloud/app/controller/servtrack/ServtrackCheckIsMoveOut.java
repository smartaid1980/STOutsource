package com.servtech.servcloud.app.controller.servtrack;

import com.servtech.servcloud.app.model.servtrack.WorkTracking;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/9/13.
 */
@RestController
@RequestMapping("/servtrack/checkIsmoveout")
public class ServtrackCheckIsMoveOut {

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/read", method = RequestMethod.POST)
    public RequestResult<List<Map>> read(@RequestBody final Map[] datas) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_servtrack_work_tracking ");
                String sql = sb.toString();
                List<Map> result = WorkTracking.findBySQL(sql).toMaps();
                Map<String, Map<String, String>> checkMap = new HashMap<String, Map<String, String>>();
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                for (Map<String, String> data : result) {
                    String move_in = dateFormat.format(data.get("move_in"));
                    String line_id = data.get("line_id").toString();
                    String work_id = data.get("work_id").toString();
                    String op = data.get("op").toString();
                    String key = move_in + line_id + work_id + op;
                    checkMap.put(key, data);
                }
                
                List<Map> checkedResult = new ArrayList<Map>();
                for (Map data : datas) {
                    String move_in = data.get("move_in").toString();
                    String line_id = data.get("line_id").toString();
                    String work_id = data.get("work_id").toString();
                    String op = data.get("op").toString();
                    String key = move_in + line_id + work_id + op;
                    if (checkMap.containsKey(key)) {
                        checkedResult.add(checkMap.get(key));
                    }
                }

                return success(checkedResult);
            }
        });
    }
}
