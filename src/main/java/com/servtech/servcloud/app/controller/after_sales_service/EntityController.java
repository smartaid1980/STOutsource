package com.servtech.servcloud.app.controller.after_sales_service;


import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.servtech.servcloud.app.model.after_sales_service.Entity;
import com.servtech.servcloud.app.model.after_sales_service.EntityEmp;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.SysUser;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;

import static org.springframework.web.bind.annotation.RequestMethod.*;
import static com.servtech.servcloud.core.util.RequestResult.*;

/**
 * Created by Raynard on 2016/5/16.
 */

@RestController
@RequestMapping("/aftersalesservice/entity")
public class EntityController {
    private final Logger logger = LoggerFactory.getLogger(EntityController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {

                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));

                    Entity entity = new Entity();
                    EntityEmp entityEmp = new EntityEmp();
                    entity.fromMap(data);
                    if (entity.insert()) {
                        for(String userGroup : (List<String>)data.get("user_group")){
                            data.put("user_id",userGroup);
                            entityEmp.fromMap(data);
                            entityEmp.insert();
                        }
                        return success(entity.getString("entity_id"));
                    } else {
                        return fail("新增失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> result = Entity.findAll().toMaps();

                for(Map entity : result){
                    List<EntityEmp> entityEmps = EntityEmp.find("entity_id = ?", entity.get("entity_id"));

//                    List<Map<String,List<String>>> entityUserGroups = Lists.newArrayList();
                        Map<String,Set<String>> entityUserGroups = Maps.newHashMap();
                    for(EntityEmp entityEmp : entityEmps){
                        String entityId = entityEmp.getString("entity_id");
                        String userId = entityEmp.getString("user_id");
                        SysUser sysUser = SysUser.first("user_id='"+userId+"'");
                        userId = sysUser.getString("user_name");

                        if(entityUserGroups.get(entityId)==null){
                            Set<String> userSet = new TreeSet<String>();
                            userSet.add(userId);
                            entityUserGroups.put(entityId,userSet);
                        }else{
                            Set<String> userSet = entityUserGroups.get(entityId);
                            userSet.add(userId);
                            entityUserGroups.put(entityId,userSet);
                        }
                    }
                    entity.put("user_group",entityUserGroups.get(entity.get("entity_id")));

                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                Entity entity = new Entity();
                EntityEmp entityEmp =new EntityEmp();

                entity.fromMap(data);

                if (entity.saveIt()) {
                    List<Entity> entityCreate = Entity.find("entity_id = ?", entity.get("entity_id"));
                    EntityEmp.delete("entity_id ='"+data.get("entity_id")+"'");
                    for(String userGroup : (List<String>)data.get("user_group")) {
                        data.put("user_id", userGroup);
                        data.put("create_by",entityCreate.get(0).getString("create_by"));
                        data.put("create_time",entityCreate.get(0).getString("create_time"));
                        entityEmp.fromMap(data);
                        entityEmp.insert();
                    }
                    return success(entity.getString("entity_id"));
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }

    @RequestMapping(value ="/delete", method = DELETE)
    public RequestResult<Void> delete(@RequestBody final Object[] idList) {
        return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {
                int deleteAmount = EntityEmp.delete("entity_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                int deleteAmount2 = Entity.delete("entity_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);

                return success();
            }
        });
    }

    @RequestMapping(value ="/excel", method = POST)
    public RequestResult<Void> excel()throws IOException{

        return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
                String excelDate = sdf.format(new Date().getTime());
                String mimeType = "application/octet-stream";
                String headerKey = "Content-Disposition";
                String headerValue = "attachment; filename=\"Entity-"+excelDate+".xlsx\"";
                response.setContentType(mimeType);
                response.setHeader(headerKey, headerValue);
                XSSFWorkbook workbook = new XSSFWorkbook();
                Sheet sheet = workbook.createSheet();
                Row row0  = sheet.createRow(0);

                row0.createCell(0).setCellValue("問題類別");
                row0.createCell(1).setCellValue("類別名稱");
                List<Entity> list = Entity.findAll();
                try {
                    int i = 1;
                    for (Entity entity : list) {
                        Row row = sheet.createRow(i);;
                        row.createCell(0).setCellValue(entity.get("entity_id").toString());
                        row.createCell(1).setCellValue(entity.get("entity_name").toString());
                        i++;
                    }
                    ServletOutputStream out = response.getOutputStream();
                    workbook.write(out);
                    out.flush();
                    out.close();
                }catch (IOException e){
                    e.printStackTrace();
                }
                return success();
            }
        });


    }
}
