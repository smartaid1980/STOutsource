package com.servtech.servcloud.app.controller.storage;

import com.servtech.servcloud.app.controller.storage.util.RecordAfter;
import com.servtech.servcloud.app.controller.storage.util.RuleEnum;
import com.servtech.servcloud.app.model.storage.StoreType;
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
@RequestMapping("/storage/storetype")
public class StoreTypeController {

    private static final Logger LOG = LoggerFactory.getLogger(StoreTypeController.class);

//    private static final Enum STORE_TYPE = RuleEnum.STORE_TYPE;
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
                int last = 0;
                StoreType storeType = StoreType.findFirst("ORDER BY store_type_id Desc");
                if (storeType != null) { last = storeType.getInteger("store_type_id") + 1; }
                data.put("store_type_id", last);
                RecordAfter.putCreateAndModify(data, login_user, System.currentTimeMillis());
                storeType = new StoreType().fromMap(data);
                if (storeType.insert()) {
                    return RequestResult.success(last);
                } else {
                    return RequestResult.fail(last);
                }
            });
        }
    }
}

