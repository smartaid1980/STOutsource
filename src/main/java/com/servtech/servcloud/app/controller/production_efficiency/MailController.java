package com.servtech.servcloud.app.controller.production_efficiency;

import com.servtech.servcloud.app.model.production_efficiency.AxisEfficiency;
import com.servtech.servcloud.app.model.production_efficiency.Mail;
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
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Raynard on 2016/10/28.
 */

@RestController
@RequestMapping("/productionefficiency/mail")
public class MailController {
    private final Logger logger = LoggerFactory.getLogger(MailController.class);

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
                    System.out.println(data.get("mail_address").toString());

                    Mail mail = new Mail();
                    mail.fromMap(data);
                    if (mail.insert()) {
                        return success(mail.getString("group_minute"));
                    } else {
                        return fail("新增失敗， 原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }
    @RequestMapping(value ="/delete", method = DELETE)
    public RequestResult<Void> delete(@RequestBody final Object[] idList) {
        return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {
                int deleteAmount = Mail.delete("group_minute IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
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

                Mail mail = new Mail();
                mail.fromMap(data);


                if (mail.saveIt()) {
                    return success(mail.getString("group_minute"));
                } else {
                    return fail("更新失敗，原因待查...");
                }
            }
        });
    }



    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                return success(Mail.findAll().toMaps());
            }
        });
    }
}
