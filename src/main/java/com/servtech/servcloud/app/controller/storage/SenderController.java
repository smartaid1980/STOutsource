package com.servtech.servcloud.app.controller.storage;


import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import com.servtech.servcloud.app.controller.storage.util.RecordAfter;
import com.servtech.servcloud.app.controller.storage.util.RuleEnum;
import com.servtech.servcloud.app.model.storage.Sender;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/storage/sender")
public class SenderController {
    private static final Logger LOG = LoggerFactory.getLogger(SenderController.class);
    private static final RuleEnum RULE = RuleEnum.SENDER;
    private static final String LOCK = new String();

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;


    @RequestMapping(value = "/registered", method = RequestMethod.GET)
    public RequestResult<?> create(@RequestParam("id") final String id,
                                   @RequestParam("name") final String name) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                String last = "";
                Sender sender = Sender.findFirst("ORDER BY sender_id Desc");
                if (sender == null) {
                    last = RuleEnum.getSeq(RULE, 0);
                } else {
                    int seq = Integer.parseInt(sender.getString("sender_id").substring(1));
                    last = RuleEnum.getSeq(RULE, seq);
                }
                Map<String, Object> data = new HashMap<>();
                String uuid = UUID.randomUUID().toString().replaceAll("-", "");
                String token = Hashing.md5().hashString(id + uuid, Charsets.UTF_8).toString();
                data.put("sender_key", id);
                data.put("sender_name", name);
                data.put("sender_token", token);
                data.put("sender_id", last);
                data.put("sender_enabled", "Y");
                RecordAfter.putCreateAndModify(data, "system", System.currentTimeMillis());
                sender = new Sender().fromMap(data);
                if (sender.insert()) {
                    return RequestResult.success(uuid);
                } else {
                    return RequestResult.fail("註冊失敗...");
                }
            });
        }

    }
}
