package com.servtech.servcloud.module.controller;

import com.google.common.collect.Lists;
import com.google.gson.Gson;
import com.servtech.servcloud.app.controller.shzbg.SingleAnalysis;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.DeviceCncBrand;
import com.servtech.servcloud.module.model.MachineAlarm;
import com.servtech.servcloud.module.model.MainProgram;
import org.javalite.activejdbc.Base;
import org.javalite.activejdbc.Model;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.DELETE;
import static org.springframework.web.bind.annotation.RequestMethod.POST;
import static org.springframework.web.bind.annotation.RequestMethod.PUT;

/**
 * Created by Eric Peng on 2018/8/7.
 */

@RestController
@RequestMapping("/zebra/config")
public class ZebraConfigController {

    private final Logger log = LoggerFactory.getLogger(ZebraConfigController.class);
    final Gson gson = new Gson();

    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<List<Map>> readRecord() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> result = new ArrayList<Map>();
                Map<String, String> brands = new HashMap<String, String>();
                for (Model device : DeviceCncBrand.findAll()) {
                    String cncId = device.getString("cnc_id");
                    if (!brands.containsKey(cncId)) {
                        brands.put(cncId, "1");
                        log.info(cncId);
                        Map<String, Integer> indexs = getBrandsIndexs(cncId);
                        if (indexs != null)
                            for (Map.Entry<String, Integer> raw : indexs.entrySet()) {
                                Map resultMap = new HashMap();
                                resultMap.put("cnc_id", cncId);
                                resultMap.put("name", raw.getKey());
                                resultMap.put("index", raw.getValue());
                                Map pks = new HashMap();
                                pks.put("cnc_id", cncId);
                                pks.put("name", raw.getKey());
                                resultMap.put("pks", pks);
                                result.add(resultMap);
                            }
                    }
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        String cncId = data.get("cnc_id").toString();
        String name = data.get("name").toString();
        int index = Integer.parseInt(data.get("index").toString());

        Map indexs = getBrandsIndexs(cncId);
        if (indexs == null) {
            indexs = new HashMap();
        }
        indexs.put(name, index);
        setBrandsIndexs(cncId, indexs);
        return success(cncId + "_" + name);
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        String cncId = data.get("cnc_id").toString();
        String name = data.get("name").toString();
        int index = Integer.parseInt(data.get("index").toString());

        Map indexs = getBrandsIndexs(cncId);
        if (indexs == null) {
            return fail(cncId + "_" + name);
        }
        indexs.put(name, index);
        if (setBrandsIndexs(cncId, indexs)) {
            return success(cncId + "_" + name);
        } else {
            return fail(cncId + "_" + name);
        }
    }

    @RequestMapping(value = "/delete", method = DELETE)
    public RequestResult<Void> delete(@RequestBody final Object[] idList) {
        int deleteSize = idList.length;
        for (int count = 0; count < deleteSize; count++) {
            Map pks = (Map) idList[count];
            String cncId = pks.get("cnc_id").toString();
            String name = pks.get("name").toString();
            Map indexs = getBrandsIndexs(cncId);
            if (indexs != null && indexs.containsKey(name)) {
                indexs.remove(name);
            }
            setBrandsIndexs(cncId, indexs);
        }
        return success();
    }

    private Map getBrandsIndexs(String cncId) {
        Reader index = null;
        try {
            index = new InputStreamReader(new FileInputStream(new File(System.getProperty(SysPropKey.CUST_PARAM_PATH)
                    + "/param/brands/" + cncId + "/rawdata_index.json")), "UTF-8");
            Map indexs = gson.fromJson(index, Map.class);
            return indexs;
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        return null;
    }

    private boolean setBrandsIndexs(String cncId, Map indexMap) {
        Writer writer = null;
        String path = System.getProperty(SysPropKey.CUST_PARAM_PATH)
                + "/param/brands/" + cncId + "/rawdata_index.json";
        try {
            writer = new OutputStreamWriter(new FileOutputStream(new File(path)), "UTF-8");
            gson.toJson(indexMap, writer);
            writer.flush();
            return true;
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return false;
    }
}
