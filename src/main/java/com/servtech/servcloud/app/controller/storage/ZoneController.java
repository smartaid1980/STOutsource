package com.servtech.servcloud.app.controller.storage;


import com.servtech.servcloud.app.controller.storage.util.RecordAfter;
import com.servtech.servcloud.app.controller.storage.util.RuleEnum;
import com.servtech.servcloud.app.model.storage.Zone;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;

@RestController
@RequestMapping("/storage/zone")
public class ZoneController {

    private static final Logger LOG = LoggerFactory.getLogger(ZoneController.class);
    private static final RuleEnum RULE = RuleEnum.ZONE;
    private static final String LOCK = new String();

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                String last = "";
                Zone zone = Zone.findFirst("ORDER BY zone_id Desc");
                if (zone == null) {
                    last = RuleEnum.getSeq(RULE, 0);
                } else {
                    int seq = Integer.parseInt(zone.getString("zone_id").substring(1));
                    last = RuleEnum.getSeq(RULE, seq);
                }
                data.put("zone_id", last);
                RecordAfter.putCreateAndModify(data, login_user, System.currentTimeMillis());
                zone = new Zone().fromMap(data);
                if (zone.insert()) {
                    return RequestResult.success(last);
                } else {
                    return RequestResult.fail(last);
                }
            });
        }
    }


}
