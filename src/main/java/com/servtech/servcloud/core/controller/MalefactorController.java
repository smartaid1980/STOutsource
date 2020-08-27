package com.servtech.servcloud.core.controller;


import com.google.gson.Gson;
import com.servtech.hippopotamus.*;
import com.servtech.hippopotamus.exception.NoSpaceException;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

@RestController
@RequestMapping("/malefactor")
public class MalefactorController {

    private static final Logger log = LoggerFactory.getLogger(MalefactorController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = POST)
    public RequestResult<?> post(@RequestBody final Map data) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
        String dataTimestamp = sdf.format(new Date()) + "000";
        Map<String, String> result = new HashMap<String, String>();
        File configFile = new File(System.getProperty(SysPropKey.ROOT_PATH), "WEB-INF/classes/hippo.xml");
        Hippo hippo = HippoFactory.getHippo(configFile);

        try {
            SimpleExhaler simpleExhaler = hippo.newSimpleExhaler();
            Future<SimpleExhalable> future = simpleExhaler.space("request_malefactor")
                    .index("malefactor", new String[]{"malefactor"})
                    .columns("role",
                            "prison_day")
                    .exhale();

            SimpleExhalable simpleExhalable = future.get();
            List<Map<String, Atom>> resultList = simpleExhalable.toMapping();
            for (Map<String, Atom> map : resultList) {
                result.put(map.get("role").asString(), map.get("prison_day").asString());
            }
        } catch (NoSpaceException e) {

        } catch (InterruptedException e) {
//            e.printStackTrace();
        } catch (ExecutionException e) {
//            e.printStackTrace();
        }

        try {

            Malefactor malefactor = new Gson().fromJson(new Gson().toJson(data), Malefactor.class);
            for (String s : malefactor.datas) {
                result.put(s, malefactor.prison_day);
            }
            Inhaler inhaler = hippo.newInhaler();
            inhaler.space("request_malefactor")
                    .index("malefactor", "malefactor");
            for (Map.Entry<String, String> entry : result.entrySet()) {
                inhaler.dataTimestamp(dataTimestamp)
                        .put("role", entry.getKey())
                        .put("prison_day", entry.getValue())
                        .next();
            }
            Future<Inhalable> inhalableFuture = inhaler.inhale();
            inhalableFuture.get();
            return RequestResult.success();
        } catch (InterruptedException e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage());
        } catch (ExecutionException e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage());
        }
    }




    private class Malefactor {
        String prison_day;
        List<String> datas;
    }


}
