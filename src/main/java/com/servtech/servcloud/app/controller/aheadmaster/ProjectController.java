package com.servtech.servcloud.app.controller.aheadmaster;

import com.google.common.io.Files;
import com.servtech.servcloud.app.bean.aheadmaster.MapData;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Hubert
 * Datetime: 2015/10/28 上午 11:10
 */
@RestController
@RequestMapping("/aheadmaster/project")
public class ProjectController {

    private static final Logger log = LoggerFactory.getLogger(ProjectController.class);
    private static final String PROJECT_FILE_PATH = "aheadmaster/project";

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public RequestResult<String> create(@RequestBody MapData data) {
        try {
            LinkedHashMap<String, MapData> dataMap = MapData.readWithLinkedHashMap(PROJECT_FILE_PATH);
            if (dataMap.containsKey(data.getId())) {
                return fail(data.getId() + " already exist!!");
            } else {
                dataMap.put(data.getId(), data);
                MapData.write(dataMap, PROJECT_FILE_PATH);

                // 新增專案資料夾然後建好所有預設 map
                createDefaultCsv(data.getId());

                return success(data.getId());
            }
        } catch (IOException e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<?> read() {
        try {
            return success(MapData.read(PROJECT_FILE_PATH));
        } catch (IOException e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public RequestResult<String> update(@RequestBody MapData data) {
        try {
            LinkedHashMap<String, MapData> dataMap = MapData.readWithLinkedHashMap(PROJECT_FILE_PATH);
            if (dataMap.containsKey(data.getId())) {
                dataMap.put(data.getId(), data);
                MapData.write(dataMap, PROJECT_FILE_PATH);
                return success(data.getId());
            } else {
                return fail(data.getId() + " not exist!!");
            }
        } catch (IOException e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/delete", method = RequestMethod.DELETE)
    public RequestResult<String> delete(@RequestBody String[] idList) {
        String tsp = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date());
        try {
            LinkedHashMap<String, MapData> dataMap = MapData.readWithLinkedHashMap(PROJECT_FILE_PATH);
            List<File> deleteProjectDirs = new ArrayList<File>();

            for (String dataId : idList) {
                dataMap.remove(dataId);
                deleteProjectDirs.add(new File(System.getProperty(SysPropKey.DATA_PATH), "aheadmaster/" + dataId));
            }
            MapData.write(dataMap, PROJECT_FILE_PATH);

            // 被刪掉的專案資料夾補上時間戳記
            for (File projectDir : deleteProjectDirs) {
                if (projectDir.exists()) {
                    projectDir.renameTo(new File(projectDir.getAbsolutePath() + "_" + tsp));
                }
            }

            return success();
        } catch (IOException e) {
            return fail(e.getMessage());
        }
    }

    private void createDefaultCsv(String projectId) throws IOException {
        String templateRootDirPath = System.getProperty(SysPropKey.ROOT_PATH) + "/WEB-INF/aheadmaster";
        String targetRootPath = System.getProperty(SysPropKey.DATA_PATH) + "/aheadmaster/" + projectId;
        File templateRootDir = new File(templateRootDirPath);

        for (File templateFile : Files.fileTreeTraverser().preOrderTraversal(templateRootDir)) {
            if (templateFile.isFile()) {
                String postPath = templateFile.getAbsolutePath().substring(templateRootDirPath.length());
                File newFile = new File(targetRootPath, postPath);

                Files.createParentDirs(newFile);
                Files.copy(templateFile, newFile);
            }
        }
    }
}
