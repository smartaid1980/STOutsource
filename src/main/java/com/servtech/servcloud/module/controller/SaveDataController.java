package com.servtech.servcloud.module.controller;

import com.servtech.common.file.Files;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.commons.io.Charsets;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.util.Map;

/**
 * Created by Hubert
 * Datetime: 2015/8/27 下午 04:58
 */
@RestController
@RequestMapping("/savedata")
public class SaveDataController {

    @RequestMapping(value = "/{type}", method = RequestMethod.POST)
    public RequestResult<String> save(@PathVariable String type, @RequestBody Map<String, String> data) {
        String rootPath = System.getProperty(SysPropKey.DATA_PATH) + "/" + type;
        for (Map.Entry<String,String> entry : data.entrySet()) {
            try {
                Files.writeStringToFile(entry.getValue(), new File(rootPath, entry.getKey()));
            } catch (IOException e) {
                return RequestResult.fail(e.getMessage());
            }
        }
        return RequestResult.success();
    }
}
