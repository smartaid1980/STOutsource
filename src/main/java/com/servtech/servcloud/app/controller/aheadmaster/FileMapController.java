package com.servtech.servcloud.app.controller.aheadmaster;

import com.servtech.servcloud.app.bean.aheadmaster.MapData;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.*;

/**
 * Created by Hubert
 * Datetime: 2015/10/23 上午 11:52
 */
@RestController
@RequestMapping("/aheadmaster/filemap/{name}")
public class FileMapController {
    private static final Logger log = LoggerFactory.getLogger(FileMapController.class);

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public RequestResult<String> create(@PathVariable String name, @RequestBody MapData data) {
        String path = tunePathSeparator(name);

        try {
            LinkedHashMap<String, MapData> currentDataMap = MapData.readWithLinkedHashMap(path);
            if (currentDataMap.containsKey(data.getId())) {
                return fail(data.getId() + " already exist!!");
            } else {
                currentDataMap.put(data.getId(), data);
                MapData.write(currentDataMap, path);
                return success(data.getId());
            }
        } catch (IOException e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<?> read(@PathVariable String name) {
        String path = tunePathSeparator(name);

        try {
            return success(MapData.read(path));
        } catch (IOException e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public RequestResult<String> update(@PathVariable String name, @RequestBody MapData data) {
        String path = tunePathSeparator(name);

        try {
            LinkedHashMap<String, MapData> currentDataMap = MapData.readWithLinkedHashMap(path);
            if (currentDataMap.containsKey(data.getId())) {
                currentDataMap.put(data.getId(), data);
                MapData.write(currentDataMap, path);
                return success(data.getId());
            } else {
                return fail(data.getId() + " not exist!!");
            }
        } catch (IOException e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/delete", method = RequestMethod.DELETE)
    public RequestResult<String> delete(@PathVariable String name, @RequestBody String[] idList) {
        String path = tunePathSeparator(name);

        try {
            LinkedHashMap<String, MapData> currentDataMap = MapData.readWithLinkedHashMap(path);
            for (String dataId : idList) {
                currentDataMap.remove(dataId);
            }
            MapData.write(currentDataMap, path);
            return success();
        } catch (IOException e) {
            return fail(e.getMessage());
        }
    }

    private String tunePathSeparator(String splitedByDash) {
        return splitedByDash.replaceAll("-", "/");
    }

}
