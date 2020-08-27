package com.servtech.servcloud.app.controller.JinFu;

import com.servtech.servcloud.app.model.JinFu.WorkStatus;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

/**
 * Created by Kevin on 2019/12/31.
 */
@RestController
@RequestMapping("/jinfu/work")
public class JinFuWorkController {
    private static final Logger log = LoggerFactory.getLogger(JinFuWorkController.class);
    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "updateWorkStatus", method = RequestMethod.PUT)
    public RequestResult<?> updateWorkStatus(@RequestBody final Map data) {

        return ActiveJdbc.operTx(() -> {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                String work_id = data.get("work_id").toString();
                String is_close = data.get("is_close").toString();
                Object user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                if(user == null) user = "updateWorkStatus";
                String now = sdf.format(new Date(System.currentTimeMillis()));

                WorkStatus workStatus = WorkStatus.findFirst("work_id = ?", work_id);

                if (workStatus == null) {
                    WorkStatus insertWorkStatus = new WorkStatus();
                    insertWorkStatus.fromMap(data);
                    insertWorkStatus.set("create_by", user, "create_time", now, "modify_by", user, "modify_time", now);
                    boolean isSuccess = insertWorkStatus.insert();
                    System.out.println("isSuccess : " + isSuccess);
                } else {
                    workStatus.set("is_close", is_close, "modify_by", user, "modify_time", now);
                    workStatus.saveIt();
                }
            }catch (Exception e){
                StringWriter sw = new StringWriter();
                e.printStackTrace(new PrintWriter(sw));
                System.out.println("Error : " + sw.toString());
            }
            return RequestResult.success();
        });
    }
}
