package com.servtech.servcloud.app.controller.aheadmaster;

import com.google.common.base.Charsets;
import com.google.common.base.Splitter;
import com.google.common.io.Files;
import com.servtech.servcloud.core.util.RequestResult;
import org.apache.commons.io.FileUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.util.*;

import static org.springframework.web.bind.annotation.RequestMethod.*;

import static com.servtech.servcloud.core.util.SysPropKey.*;
import static com.servtech.servcloud.core.util.RequestResult.*;

/**
 * Created by RDTest01(Vincent) on 2015/10/19.
 */
@RestController
@RequestMapping("/aheadmaster/comment")
public class CommentController {

    final static String CSV_SPLIT = "|";

    @RequestMapping(value = "save", method = POST)
    public RequestResult<String> save(@RequestParam("project") String project, @RequestParam("type") String type,
                                      @RequestParam("mode") String mode, @RequestParam("year") String year,
                                      @RequestParam("key") String key, @RequestParam("comment") String comment) {
        String sep = File.separator;
        String commentPath = System.getProperty(DATA_PATH) + sep + "aheadmaster" + sep +
                project + sep + "comment" + sep + type + sep + mode + sep + year + ".csv";
        File file = new File(commentPath);

        try {
            if(!file.exists()){
                Files.createParentDirs(file);
                file.createNewFile();
            }
        } catch (IOException e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }

        List<String> source = null;
        Map<String, String> map = new HashMap<String, String>();
        Splitter splitter = Splitter.on(CSV_SPLIT);
        try {
            if (file.exists()) {
                source = FileUtils.readLines(file, Charsets.UTF_8);
                for(String line : source){
                    List<String> split = splitter.splitToList(line);
                    String k = split.get(0);
                    map.put(k, line);
                }
            }
            // put new comment, override if exist
            map.put(key, key + CSV_SPLIT + comment);
            // write
            FileUtils.writeLines(file, Charsets.UTF_8.name(), map.values());
            return success();
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

}
