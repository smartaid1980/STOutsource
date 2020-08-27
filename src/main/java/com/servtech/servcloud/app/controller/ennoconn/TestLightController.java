package com.servtech.servcloud.app.controller.ennoconn;

import com.servtech.servcloud.app.model.ennoconn.TestLight;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.util.RequestResult;
import junit.framework.Test;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ennoconn/testlight")
public class TestLightController {

    @RequestMapping(method = RequestMethod.PUT)
//    public RequestResult<?> update(@RequestBody final List<Map> dataList) {
    public RequestResult<?> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            try {
//                for (Map data : dataList) {
                    TestLight testLight = new TestLight();
                    testLight.fromMap(data);
                    if (!testLight.saveIt()) {
                        if(!testLight.insert()){
                            return RequestResult.fail(data.get("store_id").toString() + " insert or update fail..");
                        }
                    }
//                }
                return RequestResult.success("success");
            } catch (Exception e) {
                e.printStackTrace();
                return RequestResult.fail(e.getMessage());
            }
        });
    }
}
