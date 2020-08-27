package com.servtech.servcloud.app.controller.strongLED;

import com.servtech.servcloud.app.model.servtrack.Line;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.app.model.strongLED.GroupLine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.POST;
import static org.springframework.web.bind.annotation.RequestMethod.PUT;

@RestController
@RequestMapping("/strongLED/groupLine")
public class ServtrackGroupLineController {
    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<Object> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<Object>>() {
                @Override
                public RequestResult<Object> operate() {
                    Object createBy = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    Object createTime = new Timestamp(System.currentTimeMillis());
                    Map groupLineData = new HashMap();
                    groupLineData.put("group_id", data.get("group_id"));
                    groupLineData.put("group_name", data.get("group_name"));
                    groupLineData.put("is_open", data.get("is_open"));
                    groupLineData.put("create_by", createBy);
                    groupLineData.put("create_time", createTime);
                    groupLineData.put("modify_by", createBy);
                    groupLineData.put("modify_time", createTime);

                    GroupLine groupLine = new GroupLine();
                    for (String line: (ArrayList<String>)data.get("lines")) {
                        groupLineData.put("line_id", line);
                        groupLine.fromMap(groupLineData);
                        if (!groupLine.insert()) {
                            return fail("新增失敗，原因待查...");
                        }
                    }
                    return success(data);
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<?> read(@RequestParam("hideClose") final boolean hideClose) {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                List<Map> result = GroupLine.findAll().toMaps();

                List<Map> data = new ArrayList<>();
                List<List> lineData = new ArrayList<>();
                for (Map map : result) {
                    boolean entry = false;
                    int index = data.size();
                    for (int i = 0; i < data.size(); i++) {
                        if (data.get(i).get("group_id").equals(map.get("group_id"))) {
                            index = i;
                            entry = true;
                            break;
                        }
                    }
                    if (!entry) {
                        if (!hideClose || (map.get("is_open").equals("Y") && hideClose)) {
                            data.add(index, map);
                        }
                        lineData.add(index, new ArrayList());
                    }
                    lineData.get(index).add(lineData.get(index).size(), map.get("line_id"));
                }
                for(int i = 0; i < data.size(); i++) {
                    data.get(i).remove("line_id");
                    data.get(i).put("lines", lineData.get(i));
                }
                return success(data);
            }
        });
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<Object> update(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<Object>>() {
                @Override
                public RequestResult<Object> operate() {
                    List<Map> result = GroupLine.find("group_id = ?", data.get("group_id")).toMaps();
                    data.put("create_by", result.get(0).get("create_by"));
                    data.put("create_time", result.get(0).get("create_time"));
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                    GroupLine groupLine = new GroupLine();
                    groupLine.fromMap(data);
                    System.out.println(data.get("group_id"));
                    GroupLine.delete("group_id = ?", data.get("group_id"));

                    for (String lineId : (List<String>) data.get("lines")) {
                        groupLine.set("line_id", lineId);
                        System.out.println(groupLine.toString());
                        if (!groupLine.insert()) {
                            return fail("saveIt fail!!");
                        }
                    }
                    return success(groupLine.getString("group_id"));
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }
}
