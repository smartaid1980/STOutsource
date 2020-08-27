package com.servtech.servcloud.module.controller;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.model.Plant;
import com.servtech.servcloud.module.model.PlantArea;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Kevin Big Big on 2015/8/17.
 */
@RestController
@RequestMapping("/plant")
public class PlantController {
    private static final Logger log = LoggerFactory.getLogger(PlantController.class);

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    data.put("plant_name", "");
                    data.put("row_length", 0);
                    data.put("column_length", 0);
                    data.put("row_head", "");
                    data.put("column_head", "");

                    Plant plant = new Plant();
                    plant.fromMap(data);
                    if (plant.insert()) {
                        return success(plant.getString("plant_id"));
                    } else {
                        return fail("新增失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                return success(Plant.findAll().include(PlantArea.class).toMaps());
            }
        });
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                Plant plant = new Plant();
                plant.fromMap(data);
                if (plant.saveIt()) {
                    return success(plant.getString("plant_id"));
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }

    @RequestMapping(value ="/delete", method = DELETE)
    public RequestResult<Void> delete(@RequestBody final Object[] idList) {
        return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {
                //int deleteAmount = Plant.delete("plant_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                for(Object id:idList) {
                    Plant plant = Plant.findById(id);
                    plant.deleteCascade();
                }
                return success();
            }
        });
    }
}
