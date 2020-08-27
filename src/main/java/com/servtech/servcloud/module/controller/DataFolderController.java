package com.servtech.servcloud.module.controller;

import com.google.common.collect.Lists;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.util.List;

/**
 * Created by Hubert
 * Datetime: 2016/4/19 下午 05:58
 */
@RestController
@RequestMapping("/datafolder")
public class DataFolderController {

    private static final Logger log = LoggerFactory.getLogger(DataFolderController.class);

    @RequestMapping(value = "structure", method = RequestMethod.GET)
    public RequestResult<JsonObject> getFolderStructure(@RequestParam String dataName) {
        File file = new File(System.getProperty(SysPropKey.DATA_PATH), dataName);
        JsonObject jsonObject = transformJsonObject(getFolders(file));
        return RequestResult.success(jsonObject);
    }

    private List<File> getFolders(File root) {
        List<File> folder = Lists.newArrayList();
        for (File child : root.listFiles()) {
            if (child.isDirectory()) {
                folder.add(child);
            }
        }
        return folder;
    }

    private JsonObject transformJsonObject(List<File> folders) {
        JsonObject jsonObject = new JsonObject();
        for (File eachFolder : folders) {
            List<File> folder = getFolders(eachFolder);
            if (folder.size() > 0) {
                jsonObject.add(eachFolder.getName(), transformJsonObject(folder));
            } else {
                jsonObject.add(eachFolder.getName(), getFileNameJsonArray(eachFolder));
            }
        }
        return jsonObject;
    }

    private JsonArray getFileNameJsonArray(File folder) {
        JsonArray jsonArray = new JsonArray();
        for (File child : folder.listFiles()) {
            jsonArray.add(new JsonPrimitive(child.getName()));
        }
        return jsonArray;
    }

}
