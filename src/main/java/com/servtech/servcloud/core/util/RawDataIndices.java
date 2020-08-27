package com.servtech.servcloud.core.util;

import com.google.gson.Gson;
import com.google.gson.JsonIOException;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.lang.reflect.Type;
import java.util.Collections;
import java.util.Map;

import static com.servtech.servcloud.core.util.SysPropKey.CUST_PARAM_PATH;
import static com.servtech.servcloud.core.util.SysPropKey.RAW_DATA_INDICES;

/**
 * Created by Hubert
 * Datetime: 2015/7/29 上午 10:29
 */
public class RawDataIndices {
    private static final Logger log = LoggerFactory.getLogger(RawDataIndices.class);

    public static Map<String, Integer> read() {
        Gson gson = new Gson();
        Type type = new TypeToken<Map<String, Integer>>(){}.getType();
        try {
            return gson.fromJson(new FileReader(System.getProperty(CUST_PARAM_PATH) + "/param/rawdata_index.json"), type);
        } catch (FileNotFoundException e) {
            log.warn("找不到檔案 cust_param/param/rawdata_index.json", e);
        } catch (JsonIOException e) {
            log.warn("IO有問題 cust_param/param/rawdata_index.json", e);
        } catch (JsonSyntaxException e) {
            log.warn("語法有問題 cust_param/param/rawdata_index.json", e);
        } catch (Exception e) {
            log.warn("cust_param/param/rawdata_index.json 莫名原因 - " + e.getMessage(), e);
        }
        return Collections.EMPTY_MAP;
    }

    public static Map<String, Integer> unserializeFromSystemProperties() {
        String serializedJson = System.getProperty(RAW_DATA_INDICES);
        Gson gson = new Gson();
        Type type = new TypeToken<Map<String, Integer>>(){}.getType();
        return gson.fromJson(serializedJson, type);
    }
}
