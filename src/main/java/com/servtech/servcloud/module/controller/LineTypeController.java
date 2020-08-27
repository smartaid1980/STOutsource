package com.servtech.servcloud.module.controller;


import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.LineMachine;
import com.servtech.servcloud.module.model.LineType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.*;

import static org.springframework.web.bind.annotation.RequestMethod.*;
import static com.servtech.servcloud.core.util.RequestResult.*;

/**
 * Created by Vera  on 2015/8/17.
 */

@RestController
@RequestMapping("/lineType")
public class LineTypeController {

    private static final Logger logger = LoggerFactory.getLogger(LineTypeController.class);

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data){
        try{
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {

                    String typeName = data.get("type_name").toString();
                    String typeId = String.valueOf(System.currentTimeMillis());
                    String createBy = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    Timestamp createTime = new Timestamp(System.currentTimeMillis());
                    List<Map> opList= (List<Map>)data.get("op");

                    for(Map o: opList){
                        o.put("type_name", typeName);
                        o.put("type_id", typeId);
                        o.put("create_by", createBy);
                        o.put("create_time", createTime);
                        LineType lineType = new LineType();
                        lineType.fromMap(o);
                        if(!lineType.insert()){
                            return fail("新增失敗,原因待查...");
                        }
                    }

                    return success(typeId);
                }
            });

        }catch(Exception e){
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read(@RequestParam (value = "type_id", required = false) final String type_id){
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>(){
            @Override
            public RequestResult<List<Map>> operate(){

                List<Map> lineTypeList;
                if (type_id == null) {
                    lineTypeList = LineType.where("is_close = ?", 0).toMaps();  //只取出沒有close的資料
                } else {
                    lineTypeList = LineType.where("type_id = ?", type_id).toMaps();  //只取出某個line type的資料
                }

                Map<String, Map> typeMap = new HashMap<String, Map>();
                Map<String, List<Map>> typeOpMap = new HashMap<String, List<Map>>();

                for(Map e : lineTypeList){
                    String typeId = (String)e.get("type_id");
                    if(!typeMap.containsKey(typeId)) {
                        Map map = new HashMap();
                        map.put("type_id", typeId);
                        map.put("type_name", e.get("type_name"));
                        typeMap.put(typeId,map);

                        List<Map> opList = new ArrayList<Map>();
                        typeOpMap.put(typeId, opList);
                    }

                    Map op = new HashMap();
                    op.put("op_seq",e.get("op_seq"));
                    op.put("op_name", e.get("op_name"));
                    op.put("op_desc", e.get("op_desc"));
                    op.put("machine_num", e.get("machine_num"));

                    typeOpMap.get(typeId).add(op);
                }

                for(Map.Entry<String, List<Map>> e: typeOpMap.entrySet()){
                    typeMap.get(e.getKey()).put("op", e.getValue());
                    typeMap.get(e.getKey()).put("op_num", e.getValue().size());
                }

                List<Map> returnList = new ArrayList<Map>(typeMap.values());
                return success(returnList);
            }
        });
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data){
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                String typeId = data.get("type_id").toString(); //註: 新增的type沒有type Id,但照理來說新增的type不會呼叫update
                String typeName = data.get("type_name").toString();
                int opNum = Integer.parseInt(data.get("op_num").toString());
                List<Map> opList = (List<Map>) data.get("op");
                Timestamp timestamp = new Timestamp(System.currentTimeMillis());
                String updateBy = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

                List<LineType> lineTypes = LineType.where("type_id = ? ", typeId);
                if (lineTypes.size() > 0) {

                    if (lineTypes.size() > opNum) {  //若op數量不同, 則刪除多餘的op,還有op對應到的line_machine
                        for (int i = 0; i < lineTypes.size() - opNum; i++) {
                            LineMachine.delete("(type_id, op_seq) IN (('" + typeId+ "','" + (lineTypes.size()-i) + "'))");
                            LineType.delete("(type_id, op_seq) IN (('" + typeId+ "','" + (lineTypes.size()-i) + "'))");
                        }
                    }

                    for (Map m : opList) {
                        int modifiedMachine = 0; //用來記錄machine_num增加或減少的數量
                        if (Integer.parseInt(m.get("op_seq").toString()) <= lineTypes.size()) {  //如果seq小於line_type的size就直接更新
                            LineType lineType = LineType.findByCompositeKeys(typeId, m.get("op_seq"));
                            lineType.set("type_name", typeName);
                            lineType.set("op_name", m.get("op_name"));
                            lineType.set("op_desc", m.get("op_desc"));
                            if(!lineType.get("machine_num").equals(m.get("machine_num"))) {
                                int machineNum = Integer.parseInt(m.get("machine_num").toString());
                                modifiedMachine = Integer.parseInt(lineType.get("machine_num").toString()) - machineNum;  //確認machine的數量有沒有改變
                                lineType.set("machine_num", m.get("machine_num"));
                                if (modifiedMachine > 0) {   //如果machine數量變少,就要刪掉多出的line_machine
                                    for (int i = 0; i < modifiedMachine; i++) {
                                        LineMachine.delete("(type_id, op_seq, machine_seq) IN (('" + typeId + "','" + m.get("op_seq") + "','" + (machineNum + 1 + i) + "'))");
                                    }
                                } else if (modifiedMachine < 0) {  //如果machine的數量變多,就新增多出來的machine_line
                                    String query = "SELECT DISTINCT line_id, line_name, type_id FROM m_line_machine WHERE type_id = '" + typeId + "' ORDER BY line_id ASC";
                                    List<LineMachine> lineMachines = LineMachine.findBySQL(query);
                                    if (!lineMachines.isEmpty()) {
                                        for (LineMachine l : lineMachines) {
                                            for (int i = 0; i < -modifiedMachine; i++) {
                                                LineMachine newlm = new LineMachine();
                                                newlm.set("line_id", l.get("line_id"));
                                                newlm.set("line_name", l.get("line_name"));
                                                newlm.set("machine_seq", machineNum - i);
                                                newlm.set("type_id", l.get("type_id"));
                                                newlm.set("op_seq", m.get("op_seq"));
                                                newlm.set("create_time", timestamp);
                                                newlm.set("create_by", updateBy);
                                                newlm.set("create_from", "linetype");
                                                if (!newlm.insert()) {
                                                    return fail("更新失敗..無法新增lineMachine");
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            lineType.set("modify_time", timestamp);
                            lineType.set("modify_by", updateBy);
                            if (!lineType.saveIt()) {
                                return fail("更新失敗..");
                            }
                        } else {   //如果seq超過line_type的size,就要新增

                            //先新增linetype的op資料
                            LineType lineType = new LineType();
                            lineType.set("type_id", typeId);
                            lineType.set("op_seq", m.get("op_seq"));
                            lineType.set("type_name", typeName);
                            lineType.set("op_name", m.get("op_name"));
                            lineType.set("op_desc", m.get("op_desc"));
                            lineType.set("machine_num", m.get("machine_num"));
                            lineType.set("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                            lineType.set("create_time", new Timestamp(System.currentTimeMillis()));
                            if (!lineType.insert()) {
                                return fail("修改失敗,原因待查...");
                            }

                            //再新增line_machine的資料
                            String query = "SELECT DISTINCT line_id, line_name, type_id FROM m_line_machine WHERE type_id = '" + typeId  + "' ORDER BY line_id ASC";
                            List<LineMachine> lineMachines = LineMachine.findBySQL(query);
                            if (!lineMachines.isEmpty()) {
                                for (LineMachine l : lineMachines) {
                                    for (int i = 0; i < Integer.parseInt(m.get("machine_num").toString()); i++) {
                                        LineMachine newlm = new LineMachine();
                                        newlm.set("line_id", l.get("line_id"));
                                        newlm.set("line_name", l.get("line_name"));
                                        newlm.set("machine_seq", i + 1);
                                        newlm.set("type_id", l.get("type_id"));
                                        newlm.set("op_seq", m.get("op_seq"));
                                        newlm.set("create_time", timestamp);
                                        newlm.set("create_by", updateBy);
                                        newlm.set("create_from", "linetype");
                                        if (!newlm.insert()) {
                                            return fail("更新失敗..無法新增lineMachine");
                                        }
                                    }

                                }
                            }
                        }
                    }

                } else {  //  若找不到這個linetypeId, 則新增一個 (正常來說,應該不會跑到這裡)
                    typeId = String.valueOf(System.currentTimeMillis());
                    for (Map m : opList) {
                        LineType lineType = new LineType();
                        lineType.set("type_id", typeId);
                        lineType.set("type_name", typeName);
                        lineType.set("op_seq", m.get("op_seq"));
                        lineType.set("op_name", m.get("op_name"));
                        lineType.set("op_desc", m.get("op_desc"));
                        lineType.set("machine_num", m.get("machine_num"));
                        lineType.set("create_by", updateBy);
                        lineType.set("create_time", timestamp);
                        if (!lineType.insert()) {
                            return fail("修改失敗,原因待查...");
                        }
                    }
                }
                return success(typeId);
            }
        });
    }

    @RequestMapping(value = "/delete", method = DELETE)
    public RequestResult<Void> delete(@RequestBody final Object[] idList){
        return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {

                LineType.delete("type_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }

    @RequestMapping(value = "/typeList", method = GET)
    public RequestResult<List<Map>> typeList(){
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                String query = "SELECT DISTINCT type_id, type_name FROM m_line_type WHERE is_close=0 ORDER BY type_name ASC";
                return  success(LineType.findBySQL(query).toMaps());
            }
        });
    }

    @RequestMapping(value = "/download", method = GET)
    public void download(@RequestParam(value = "type_id")final String typeId, @RequestParam(value = "type_name")final String typeName, HttpServletResponse response){

        String mimeType = "application/octet-stream";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment;filename="+typeName+".csv";
        response.setContentType(mimeType);
        response.setHeader(headerKey, headerValue);

        List<LineType> list = ActiveJdbc.oper(new Operation<List<LineType>>() {
            @Override
            public List<LineType> operate() {

                String query = "type_id = '" + typeId + "' and is_close=0";
                List<LineType> list = LineType.where(query);
                Collections.sort(list, LineType.opSeqComparator);

                return list;
            }
        });

        StringBuffer sb = new StringBuffer();
        sb.append("Line Name");

        for (LineType e : list) {
            String seq = e.getString("op_name");
            int num;
            if(e.get("machine_num")!=null) {
                num = e.getInteger("machine_num");
            }else{
                num = 0;
            }
            if (num > 1) {
                for (int i = 1; i <= num; i++) {
                    sb.append(",").append(seq);
                    sb.append("-").append(i);
                }
            } else if(num==1) {
                sb.append(",").append(seq);
            }
        }

        try {
            ServletOutputStream out = response.getOutputStream();
            out.write(sb.toString().getBytes("UTF-8"));
            out.flush();
            out.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

}
