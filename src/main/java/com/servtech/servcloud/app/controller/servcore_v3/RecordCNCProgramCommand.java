package com.servtech.servcloud.app.controller.servcore_v3;

import com.servtech.hippopotamus.Hippo;
import com.servtech.hippopotamus.Inhaler;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.apache.http.auth.AUTH;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/v3/servcore")
public class RecordCNCProgramCommand {
    @Autowired
    private HttpServletRequest request;


    @RequestMapping(value = "/record/cnc/programCommand", method = RequestMethod.POST)
    public RequestResult<?> recordProgramCommand(@RequestBody final Map data) throws ParseException {
        try {

            String machine = data.get("machine").toString();      //機台
            String action = data.get("action").toString();      //動作
            String command_start_time = data.get("command_start_time").toString();      //命令開始時間
            String command_end_time = data.get("command_end_time").toString();      //命令結束時間
            String result = data.get("result").toString();      //執行結果
            String program = data.get("program").toString();        //程式名稱
            String ip_from_pc = request.getHeader("x－forwarded－for") == null ? request.getRemoteAddr() : request.getHeader("x－forwarded－for");        //操作電腦的IP
            Object create_by = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);     //上傳者
            Timestamp createTime = new Timestamp(System.currentTimeMillis());      //新增時間
            String timestamp = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date()) + "000";

            Hippo hippo = HippoService.getInstance();

            Inhaler inhaler = hippo.newInhaler().space("cnc_program_command_log")
                    .index("machine", machine)
                    .index("date", timestamp.substring(0, 8));

            String machine_name = ActiveJdbc.operTx(() -> {
                return Device.findFirst("device_id = ?", machine).getString("device_name");
            });
            inhaler.dataTimestamp(timestamp)
                    .put("machine", machine_name)
                    .put("action", action)
                    .put("command_start_time", command_start_time.substring(0, 19))
                    .put("command_end_time", command_end_time.substring(0, 19))
                    .put("result", result)
                    .put("program", program)
                    .put("ip_from_pc", ip_from_pc)
                    .put("create_by", create_by.toString())
                    .put("create_time", createTime.toString().substring(0, 19))
                    .next();
            inhaler.inhaleAppend();
            return RequestResult.success("Space產生成功");

        } catch (Exception e) {
            return RequestResult.fail("Space產生失敗，錯誤訊息:" + e.getMessage());
        }
    }
}
