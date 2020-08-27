package com.servtech.servcloud.app.controller.storage;

import com.google.gson.Gson;
import com.servtech.servcloud.app.controller.storage.util.RecordAfter;
import com.servtech.servcloud.app.controller.storage.util.RuleEnum;
import com.servtech.servcloud.app.controller.storage.util.StdQRCode;
import com.servtech.servcloud.app.model.storage.Thing;
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
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

@RestController
@RequestMapping("/storage/thing")
public class ThingController {

    private static final Logger LOG = LoggerFactory.getLogger(ThingController.class);
    private static final RuleEnum RULE = RuleEnum.THING;
    private static final String LOCK = new String();

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;


    @RequestMapping(value = "/{thing_id}", method = RequestMethod.GET)
    public RequestResult<?> getThingById(@PathVariable("thing_id") String thingId) {
        return ActiveJdbc.operTx(() -> {
            return RequestResult.success(Thing.findFirst("thing_id=?", thingId).toMap());
        });
    }
    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                String last = "";
                Thing thing = Thing.findFirst("ORDER BY thing_id Desc");
                if (thing == null) {
                    last = RuleEnum.getSeq(RULE, 0);
                } else {
                    int seq = Integer.parseInt(thing.getString("thing_id").substring(1));
                    last = RuleEnum.getSeq(RULE, seq);
                }
                data.put("thing_id", last);
                RecordAfter.putCreateAndModify(data, login_user, System.currentTimeMillis());
                thing = new Thing().fromMap(data);
                if (thing.insert()) {
                    return RequestResult.success(last);
                } else {
                    return RequestResult.fail(last);
                }
            });
        }
    }

    @RequestMapping(value = "/qrcode", method = RequestMethod.GET)
    public void genQRCodeDoc(@RequestParam("thing_id[]") String[] ids) {

        ActiveJdbc.operTx(() -> {

            StringJoiner stringJoiner = new StringJoiner(",");
            for (String id : ids) {
                stringJoiner.add("?");
            }
            List<Thing> thingList = Thing.find("thing_id IN (" + stringJoiner.toString() + ")", ids);
            StdQRCode stdQRCode = new StdQRCode();
            stdQRCode.genDoc(thingList.size());

            for (int i = 0; i < thingList.size(); i++) {
                Thing thing = thingList.get(i);
                Map<String, String> jsonObj = new HashMap<>();
                jsonObj.put("id", thing.getString("thing_id"));
                jsonObj.put("name", thing.getString("thing_name"));
                stdQRCode.addImg(i, new Gson().toJson(jsonObj));
                stdQRCode.addTexts(thing.getString("thing_name"));
                stdQRCode.next();
            }
            stdQRCode.write(response);
            stdQRCode.delete();
            return null;
        });
    }
}
