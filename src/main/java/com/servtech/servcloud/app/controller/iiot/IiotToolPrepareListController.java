package com.servtech.servcloud.app.controller.iiot;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.app.controller.juihua.ConfigController;
import com.servtech.servcloud.app.model.iiot.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.lang.reflect.Type;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Jenny on 2017/11/24.
 */
@RestController
@RequestMapping("/iiot/tool/preparelist")
public class IiotToolPrepareListController {
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;


    @RequestMapping(value = "/createToolPrep", method = RequestMethod.POST)
    public RequestResult<?> createToolPrep(@RequestBody final Map data) {

        final String ncName = data.get("nc_name").toString();
        final String openStatus = "0";
        final List<Map> toolPrepLists = (List<Map>) data.get("tool_prep_list");


        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                try {
                    boolean prepInsertSuccess = false;
                    boolean prepListInsertSuccess = false;
                    Timestamp currentTime = new Timestamp(System.currentTimeMillis());
                    Map prepMap = new HashMap();
                    prepMap.put("tool_prep_id", currentTime);
                    prepMap.put("nc_name", ncName);
                    prepMap.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    prepMap.put("create_time", currentTime);
                    prepMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    prepMap.put("modify_time", currentTime);
                    prepMap.put("status", openStatus);

                    IiotToolPrep iiotToolPrep = new IiotToolPrep();
                    iiotToolPrep.fromMap(prepMap);
                    if (iiotToolPrep.insert()) {
                        prepInsertSuccess = true;
                        System.out.println("insert tool prep success!!!!");
                    }
                    ;

                    IiotToolPrepList iiotToolPrepList = new IiotToolPrepList();
                    for (Map toolPrepList : toolPrepLists) {
                        toolPrepList.put("tool_prep_id", currentTime);
                        toolPrepList.put("nc_name", ncName);
                        toolPrepList.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        toolPrepList.put("create_time", currentTime);
                        toolPrepList.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        toolPrepList.put("modify_time", currentTime);
                        iiotToolPrepList.fromMap(toolPrepList);
                        if (iiotToolPrepList.insert()) {
                            prepListInsertSuccess = true;
                            System.out.println("insert tool prep list success!!!!");
                        }
                        ;
                    }
                    if (prepInsertSuccess && prepListInsertSuccess) {
                        return success("update success");
                    } else {
                        return fail("update fail...");
                    }

                } catch (Exception e) {
                    e.printStackTrace();
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    return fail(sw.toString());
                }
            }
        });
    }

    @RequestMapping(value = "/updatePrepList", method = RequestMethod.PUT)
    public RequestResult<?> updatePrepList(@RequestBody final Map data) {
        final String toolPrepId = data.get("tool_prep_id").toString();
        final String ncName = data.get("nc_name").toString();

        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                Map map = new HashMap();
                map.put("tool_prep_id", toolPrepId);
                map.put("nc_name", ncName);
                map.put("status", "1");
                map.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                map.put("modify_time", new Timestamp(System.currentTimeMillis()));
                IiotToolPrep iiotToolPrep = new IiotToolPrep();
                iiotToolPrep.fromMap(map);
                if (iiotToolPrep.saveIt()) {
                    return success("update success");
                } else {
                    return fail("update fail...");
                }
            }
        });
    }

    @RequestMapping(value = "/updatePrep", method = RequestMethod.PUT)
    public RequestResult<?> updatePrep(@RequestBody final Map data) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String mapping_time = sdf.format(new Date(System.currentTimeMillis()));
        final String tool_prep_id = data.get("tool_prep_id").toString();
        final String tool_stored = data.get("tool_stored").toString();
        String[] tool_stored_arr = tool_stored.split("_");
        String move_in = data.get("move_in").toString();
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                IiotToolOnStore iiotToolOnStore = IiotToolOnStore.findFirst("move_in = ? and shelf_id = ? and layer_id = ? and position_id = ?", move_in, tool_stored_arr[0], tool_stored_arr[1], tool_stored_arr[2]);
                String nc_name = iiotToolOnStore.getString("nc_name");
                String tool_no = iiotToolOnStore.getString("tool_no");
                IiotToolPrepList iiotToolPrepList = IiotToolPrepList.findFirst("tool_prep_id = ? and nc_name = ? and tool_no = ? ", tool_prep_id, nc_name, tool_no);
                if (iiotToolPrepList != null) {
                    String tool_id = iiotToolPrepList.getString("tool_id");
                    int count = IiotToolOnStore.update("mapping_time = ? , tool_prep_id = ? , tool_id = ?"
                            , "move_in = ? and shelf_id = ? and layer_id = ? and position_id = ?"
                            , mapping_time, tool_prep_id, tool_id, move_in, tool_stored_arr[0], tool_stored_arr[1], tool_stored_arr[2]);
                    if (count == 1) {
                        return success("update success");
                    } else {
                        return fail("update fail...");
                    }
                }
                return success("此儲位無須綁定刀號");
            }
        });
    }

    @RequestMapping(value = "/oneKeyCreateToolPrep", method = RequestMethod.POST)
    public RequestResult<Timestamp> oneKeyCreateToolPrep(@RequestBody final Map data) {
        Map config = getConfig(new File(System.getProperty(SysPropKey.CUST_PARAM_PATH), "iiot/toolPrepListConfig.json"));
        final Object user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "admin" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        final String ncName = data.get("nc_name").toString();
        final String satus = config.get("satus") == null ? "0" : config.get("satus").toString();
        final String holderId = config.get("holder_id") == null ? "G2:A004" : config.get("holder_id").toString();;
        final Map<String, List<String>> toolCodeGroup = batchCreateToolAndGetToolCodeGroup(ncName, user , config);
        final List<Map> toolPrepLists = getToolPrepLists(toolCodeGroup, ncName , config);

        return ActiveJdbc.operTx(new Operation<RequestResult<Timestamp>>() {
            @Override
            public RequestResult<Timestamp> operate() {
                try {
                    boolean prepInsertSuccess = false;
                    boolean prepListInsertSuccess = false;
                    Timestamp currentTime = new Timestamp(System.currentTimeMillis());
                    Map prepMap = new HashMap();
                    prepMap.put("tool_prep_id", currentTime);
                    prepMap.put("nc_name", ncName);
                    prepMap.put("create_by", user);
                    prepMap.put("create_time", currentTime);
                    prepMap.put("modify_by", user);
                    prepMap.put("modify_time", currentTime);
                    prepMap.put("status", satus);

                    IiotToolPrep iiotToolPrep = new IiotToolPrep();
                    iiotToolPrep.fromMap(prepMap);
                    if (iiotToolPrep.insert()) {
                        prepInsertSuccess = true;
                        System.out.println("insert tool prep success!!!!");
                    }
                    IiotToolPrepList iiotToolPrepList = new IiotToolPrepList();
                    for (Map toolPrepList : toolPrepLists) {
                        toolPrepList.put("tool_prep_id", currentTime);
                        toolPrepList.put("nc_name", ncName);
                        toolPrepList.put("holder_id", holderId);
                        toolPrepList.put("create_by", user);
                        toolPrepList.put("create_time", currentTime);
                        toolPrepList.put("modify_by", user);
                        toolPrepList.put("modify_time", currentTime);
                        iiotToolPrepList.fromMap(toolPrepList);
                        if (iiotToolPrepList.insert()) {
                            prepListInsertSuccess = true;
                            System.out.println("insert tool prep list success!!!!");
                        }
                    }
                    if (prepInsertSuccess && prepListInsertSuccess) {
                        return success(currentTime);
                    } else {
                        return fail(null);
                    }
                } catch (Exception e) {
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    System.out.println(sw.toString());
                    return fail(null);
                }
            }
        });
    }

    private Map getConfig(File file) {
        if(file.exists()){
            try {
                Gson gson = new Gson();
                return gson.fromJson(new FileReader(file), Map.class);
            } catch (FileNotFoundException e) {
                e.printStackTrace();
                return null;
            }
        }else {
            return null;
        }
    }

    private List<Map> getToolPrepLists(Map<String, List<String>> toolCodeGroup, String ncName , Map config) {
        return ActiveJdbc.operTx(new Operation<List<Map>>() {
            @Override
            public List<Map> operate() {
                String memo = "";
                String dept_id = config.get("dept_id") == null ? "G2" :  config.get("dept_id").toString(); //金屬二課
                String sql = "SELECT * FROM a_iiot_tool_nc_list as a where a.nc_name = '"+ncName+"' order by CAST(a.tool_no AS UNSIGNED);";
                List<Map> toolNcList = Base.findAll(sql);
                for (Map map : toolNcList) {
                    String tool_code = map.get("tool_code").toString();
                    map.put("tool_id", toolCodeGroup.get(tool_code).get(0));
                    map.put("memo", memo);
                    map.put("dept_id", dept_id);
                    toolCodeGroup.get(tool_code).remove(0);
                }
                return toolNcList;
            }
        });
    }

    private Map<String, List<String>> batchCreateToolAndGetToolCodeGroup(String ncName, Object user , Map config) {
        return ActiveJdbc.operTx(new Operation<Map<String, List<String>>>() {
            @Override
            public Map<String, List<String>> operate() {
                Map<String, List<String>> toolCodeGroup = new HashMap();
                String sql = "SELECT * , count(*) as create_holder_number FROM a_iiot_tool_nc_list where nc_name = '" + ncName + "' group by tool_code";
                List<Map> iiotToolNcLists = Base.findAll(sql);
                String isOpen = config.get("is_open") == null ? "0" : config.get("is_open").toString();
                String toolStatus = config.get("tool_status") == null ? "0" : config.get("tool_status").toString();
                String use_life_hr = config.get("use_life_hr") == null ? "4" : config.get("use_life_hr").toString();
                String alarm_life_hr = config.get("alarm_life_hr") == null ? "1" : config.get("alarm_life_hr").toString();
                for (Map iiotToolNcList : iiotToolNcLists) {
                    String toolCode = iiotToolNcList.get("tool_code").toString();
                    String toolSpec = iiotToolNcList.get("tool_spec").toString();
                    if (toolSpec.contains("D6")) {
                        use_life_hr = "3";
                    }
                    IiotToolErpSync iiotToolErpSync = IiotToolErpSync.findFirst("tool_code = ? ", toolCode);
                    if (iiotToolErpSync.get("use_life_hr") != null) {
                        use_life_hr = iiotToolErpSync.get("use_life_hr").toString();
                        alarm_life_hr = iiotToolErpSync.get("alarm_life_hr").toString();
                    }

                    String work_sum = "00:00:00";
                    iiotToolNcList.put("use_life_hr", use_life_hr);
                    iiotToolNcList.put("alarm_life_hr", alarm_life_hr);
                    iiotToolNcList.put("work_sum", work_sum);
                    iiotToolNcList.put("tool_status", toolStatus);
                    iiotToolNcList.put("is_open", isOpen);
                    List<String> toolIdList = batchCreateToolAndGetToolIdList(iiotToolNcList ,user);
                    toolCodeGroup.put(toolCode, toolIdList);
                }
                return toolCodeGroup;
            }
        });
    }

    private List<String> batchCreateToolAndGetToolIdList(Map data ,Object user) {
        String toolCode = data.get("tool_code").toString();
        String toolSpec = data.get("tool_spec").toString();
        String toolType = data.get("tool_type").toString();
        String useLifeHr = data.get("use_life_hr").toString().equals("") ? "0" : data.get("use_life_hr").toString();
        String alarmLifeHr = data.get("alarm_life_hr").toString().equals("") ? "0" : data.get("alarm_life_hr").toString();
        String workSum = data.get("work_sum").toString();
        String toolStatus = data.get("tool_status").toString();
        String isOpen = data.get("is_open").toString();
        int createToolNumber = Integer.parseInt(data.get("create_holder_number").toString());
        String insertSql = "INSERT INTO a_iiot_tool " +
                "(tool_id, tool_code, tool_spec, tool_type, use_life_hr, alarm_life_hr, work_sum, tool_status, is_open, create_by, create_time, modify_by, modify_time) " +
                "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)";

        try {
            List<String> toolIdList = new ArrayList();
            Timestamp curerntTime = new Timestamp(System.currentTimeMillis());
            SimpleDateFormat sdf = new SimpleDateFormat("yyMMdd");
            String currnetDate = sdf.format(new Date());
            String querySql = "SELECT * FROM a_iiot_tool WHERE tool_code = '" + toolCode + "' " +
                    "AND tool_id LIKE '%_" + currnetDate + "%' order by tool_id desc limit 1";
            List<Map> toolList = IiotTool.findBySQL(querySql).toMaps();
            try {
                Base.openTransaction();
                PreparedStatement ps = Base.startBatch(insertSql);

                if (toolList.size() == 0) {
                    for (int i = 1; i <= createToolNumber; i++) {
                        String toolId = toolCode + "_" + currnetDate + String.format("%03d", i);
                        toolIdList.add(toolId);
                        Base.addBatch(ps, toolId, toolCode, toolSpec, toolType, useLifeHr, alarmLifeHr, workSum, toolStatus, isOpen, user, curerntTime, user, curerntTime);
                    }
                } else {
                    String lastToolIdStr = toolList.get(0).get("tool_id").toString();
                    int lastToolIdNumber = Integer.parseInt(lastToolIdStr.substring(lastToolIdStr.length() - 3, lastToolIdStr.length()));
                    int initNumber = lastToolIdNumber + 1;
                    int maxNumber = initNumber + createToolNumber;
                    for (int i = initNumber; i < maxNumber; i++) {
                        String toolId = toolCode + "_" + currnetDate + String.format("%03d", i);
                        toolIdList.add(toolId);
                        Base.addBatch(ps, toolId, toolCode, toolSpec, toolType, useLifeHr, alarmLifeHr, workSum, toolStatus, isOpen, user, curerntTime, user, curerntTime);
                    }
                }
                Base.executeBatch(ps);
                ps.close();
                Base.commitTransaction();

            } catch (Exception e) {
                StringWriter sw = new StringWriter();
                e.printStackTrace(new PrintWriter(sw));
                System.out.println("Error : " + sw.toString());
                Base.rollbackTransaction();
                return null;
            }
            return toolIdList;


        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return null;
        }
    }


}
