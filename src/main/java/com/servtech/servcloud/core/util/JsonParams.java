package com.servtech.servcloud.core.util;

import com.google.gson.*;
import com.servtech.servcloud.core.exception.JsonParamsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;

import static com.servtech.servcloud.core.util.SysPropKey.*;

/**
 * Created by Hubert
 * Datetime: 2015/7/13 上午 10:47
 */
public class JsonParams {
    private Logger logger = LoggerFactory.getLogger(JsonParams.class);
    private JsonObject jsonObject;

    public JsonParams(String fileName) throws JsonParamsException {
        this.init(System.getProperty(ROOT_PATH) + "/WEB-INF/classes/", fileName);
    }

    public JsonParams(String custPath, String fileName) throws JsonParamsException {
        this.init(custPath, fileName);
    }

    private void init(String parentPath, String childPath) throws JsonParamsException {
        File file = new File(parentPath, childPath);
        try {
            jsonObject = (JsonObject) new JsonParser().parse(new FileReader(file));
        } catch (JsonIOException e) {
            logger.warn("JSON 參數擋 " + file.getAbsolutePath() + " 有問題!");
            throw new JsonParamsException(e.getMessage());
        } catch (JsonSyntaxException e) {
            logger.warn("JSON 參數擋 " + file.getAbsolutePath() + " 語法錯誤!");
            throw new JsonParamsException(e.getMessage());
        } catch (FileNotFoundException e) {
            logger.warn("JSON 參數擋 " + file.getAbsolutePath() + " 不存在!");
            throw new JsonParamsException(e.getMessage());
        }
    }

    public String getAsString(String key) {
        return jsonObject.get(key).getAsString();
    }

    public int getAsInt(String key) {
        return jsonObject.get(key).getAsInt();
    }

    public double getAsDouble(String key) {
        return jsonObject.get(key).getAsDouble();
    }

    public boolean getAsBoolean(String key) {
        return jsonObject.get(key).getAsBoolean();
    }

    public JsonArray getAsJsonArray(String key) {
        return jsonObject.get(key).getAsJsonArray();
    }

}
