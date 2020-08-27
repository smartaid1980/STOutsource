package com.servtech.servcloud.app.controller.downtime_analysis;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.controller.ZebraConfigController;
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
 * Created by Eric Peng on 2018/9/14.
 */

@RestController
@RequestMapping("/v3/macro/config")
public class MacroEditController {

    private final Logger log = LoggerFactory.getLogger(ZebraConfigController.class);
    final Gson gson = new GsonBuilder().setPrettyPrinting().create();    
    String configFilePath = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/param/macro.json";

    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<List<Map>> readRecord() {
        Map<String, Map> jsonMap = getMacroJson();
        List<Map> result = new ArrayList<Map>();
        if (jsonMap != null) {
            for (Map.Entry<String, Map> raw : jsonMap.entrySet()) {
                if (!raw.getKey().equals("-1")) {
                    Macro macro = new Macro(raw.getKey(), raw.getValue());
                    Map<String, Object> macroMap = macro.toMap();
                    result.add(macroMap);
                }
            }
            return success(result);
        }
        return success(null);
    }

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        String macro_code = data.get("macro_code").toString();

        Map indexs = getMacroJson();
        if (indexs == null) {
            indexs = new HashMap();
        }
        indexs.put(macro_code, data);
        setMacroJson(indexs);
        return success(macro_code);
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        String macro_code = data.get("macro_code").toString();

        Map indexs = getMacroJson();
        if (indexs == null) {
            return fail(macro_code);
        }
        Map map = (Map) indexs.get(macro_code);
        map.putAll(data);
        if (setMacroJson(indexs)) {
            return success(macro_code);
        } else {
            return fail(macro_code);
        }
    }

    @RequestMapping(value = "/delete", method = DELETE)
    public RequestResult<Void> delete(@RequestBody final String[] idList) {
        int deleteSize = idList.length;
        Map indexs = getMacroJson();
        for (int count = 0; count < deleteSize; count++) {
            String id = idList[count];
            if (indexs != null && indexs.containsKey(id)) {
                indexs.remove(id);
            }
        }
        setMacroJson(indexs);
        return success();
    }


    private Map<String, Map> getMacroJson() {
        Reader index = null;
        try {
            index = new InputStreamReader(new FileInputStream(new File(configFilePath)), "UTF-8");
            Map<String, Map> indexs = gson.fromJson(index, Map.class);
            return indexs;
        } catch (UnsupportedEncodingException | FileNotFoundException e) {
            e.printStackTrace();
        }
        return null;
    }

    private boolean setMacroJson(Map indexMap) {
        Writer writer = null;
        try {
            writer = new OutputStreamWriter(new FileOutputStream(new File(configFilePath)), "UTF-8");
            gson.toJson(indexMap, writer);
            writer.flush();
            return true;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return false;
    }

    public static class Macro {
      String macro_code;
      String macro_code_name;
      String color_code;
      String color_name;
      String is_active;
      Object cal_status;
      String can_modify;
      public Macro (String macroCode, Map macroMap) {
          macro_code = macroCode;
          macro_code_name = macroMap.get("macro_code_name").toString();
          color_code = macroMap.get("color_code").toString();
          color_name = macroMap.get("color_name").toString();
          is_active = macroMap.get("is_active").toString();
          cal_status = macroMap.get("cal_status");    //之前沒這個欄位..for Cosmos 所以不使用toString() 避免nullPoint
          can_modify = macroMap.get("can_modify").toString();
      }
      public Map<String, Object> toMap () {
        Map<String, Object> result = new HashMap<>();
        result.put("macro_code", macro_code);
        result.put("macro_code_name", macro_code_name);
        result.put("color_code", color_code);
        result.put("color_name", color_name);
        result.put("is_active", is_active);
        result.put("cal_status", cal_status);
        result.put("can_modify", can_modify);
        return result;
      }
    }
}