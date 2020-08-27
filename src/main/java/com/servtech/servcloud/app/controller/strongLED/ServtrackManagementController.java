package com.servtech.servcloud.app.controller.strongLED;

import com.servtech.servcloud.app.model.servtrack.WorkTracking;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2019/8/27.
 */
@RestController
@RequestMapping("/strongled/track-management")
public class ServtrackManagementController {

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/output-qty", method = RequestMethod.PUT)
    public RequestResult<?> updateOutputQuantity(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    //取得現在時間
                    Timestamp timeMillis = new Timestamp(System.currentTimeMillis());
                    //取得修改者
                    String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    String output = data.get("output").toString();
                    String canBeFixed = data.get("cust_field_3").toString();
                    String obsolete = data.get("cust_field_4").toString();
                    String moveIn = data.get("move_in").toString();
                    String workId = data.get("work_id").toString();
                    String lineId = data.get("line_id").toString();
                    String op = data.get("op").toString();
                    Map<String, Object> workTracking = WorkTracking.findFirst("move_in = ? and work_id = ? and line_id = ? and op = ?", moveIn, workId, lineId, op).toMap();
                    int new_ng_quantity = Integer.valueOf(canBeFixed) + Integer.valueOf(obsolete);
                    int output_web = Integer.valueOf(output);
                    int output_db = Integer.valueOf(workTracking.get("output").toString());
                    int ng_quantity = Integer.valueOf(workTracking.get("ng_quantity").toString());
                    int go_quantity = Integer.valueOf(workTracking.get("go_quantity").toString());
                    int new_go_quantity = go_quantity + (output_web - output_db) + ( ng_quantity - new_ng_quantity) ;

                    if(output_web == 0){
                        new_go_quantity = 0;
                        new_ng_quantity = 0;
                        canBeFixed = "0";
                        obsolete = "0";
                    }
                    System.out.println("output:"+output_web +"|go_quantity:"+new_go_quantity +"|ng_quantity:"+ng_quantity +"|move_in:"+moveIn +"|work_id:"+workId +"|line_id:"+lineId +"|op:"+op);
                    WorkTracking.update("output = ?, cust_field_3 = ?, cust_field_4 = ?, go_quantity = ? , ng_quantity = ? , modify_by = ?, modify_time = ?",
                            "move_in = ? and work_id = ? and line_id = ? and op = ?",
                            output_web, canBeFixed, obsolete, new_go_quantity , new_ng_quantity , user, timeMillis, moveIn, workId, lineId, op);
                    return success("success");

                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }
}
