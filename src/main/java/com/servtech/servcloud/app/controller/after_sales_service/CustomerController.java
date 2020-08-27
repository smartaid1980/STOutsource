package com.servtech.servcloud.app.controller.after_sales_service;

import com.servtech.servcloud.app.model.after_sales_service.Customer;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Raynard on 2016/5/23.
 */

@RestController
@RequestMapping("/aftersalesservice/customer")
public class CustomerController {

    private final Logger logger = LoggerFactory.getLogger(CustomerController.class);

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

                    Customer customer = new Customer();
                    customer.fromMap(data);
                    if (customer.insert()) {
                        return success(customer.getString("cus_id"));
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
                return success(Customer.findAll().toMaps());
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

                Customer customer = new Customer();
                customer.fromMap(data);


                if (customer.saveIt()) {
                    return success(customer.getString("cus_id"));
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
                int deleteAmount = Customer.delete("cus_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }

    @RequestMapping(value ="/excel", method = POST)
    public RequestResult<Void> excel()throws IOException {

        return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
                String excelDate = sdf.format(new Date().getTime());
                String mimeType = "application/octet-stream";
                String headerKey = "Content-Disposition";
                String headerValue = "attachment; filename=\"Customer-"+excelDate+".xlsx\"";
                response.setContentType(mimeType);
                response.setHeader(headerKey, headerValue);
                XSSFWorkbook workbook = new XSSFWorkbook();
                Sheet sheet = workbook.createSheet();
                Row row0  = sheet.createRow(0);
                row0.createCell(0).setCellValue("地區代碼");
                row0.createCell(1).setCellValue("地區名稱");

                List<Customer> list = Customer.findAll();
                try {
                    int i = 1;
                    for (Customer customer : list) {
                        Row row = sheet.createRow(i);
                        row.createCell(0).setCellValue(customer.get("cus_id").toString());
                        row.createCell(1).setCellValue(customer.get("cus_name").toString());
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

