package com.servtech.servcloud.app.controller.shzbg;

import com.servtech.common.file.Files;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.MainProgram;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Eric on 2018/7/26.
 */


@RestController
@RequestMapping("/shzbg/single")
public class SingleAnalysis {

    private final Logger log = LoggerFactory.getLogger(SingleAnalysis.class);

    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<List<MainProgramObject>> readRecord() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<MainProgramObject>>>() {
            @Override
            public RequestResult<List<MainProgramObject>> operate() {
                List<Map> main = MainProgram.findAll().toMaps();
                Map<String, MainProgramObject> hashMap = new HashMap<String, MainProgramObject>();
                List<MainProgramObject> result = new ArrayList<MainProgramObject>();
                for (Map map : main) {
                    String key = getMainString(map);
                    HashMap tempMap = new HashMap();
                    if (hashMap.containsKey(key)) {
                        tempMap.put("run_program", map.get("run_program").toString());
                        tempMap.put("time", map.get("time").toString());
                        hashMap.get(key).run_program.add(tempMap);
                    } else {
                        hashMap.put(key, new MainProgramObject(map));
                    }
                }
                for (Map.Entry<String, MainProgramObject> record : hashMap.entrySet()) {
                    result.add(record.getValue());
                }
                return success(result);
            }
        });
    }

    @RequestMapping(value = "/delete", method = RequestMethod.DELETE)
    public RequestResult<String> deleteRecord(@RequestBody final Object[] idList) {
        return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                int deleteSize = idList.length;
                for (int count = 0; count < deleteSize; count++) {
                    Map pks = (Map) idList[count];
                    String start_time = pks.get("start_time").toString();
                    String end_time = pks.get("end_time").toString();
                    String pg_name = pks.get("pg_name").toString();
                    String machine_id = pks.get("machine_id").toString();
                    Base.exec("DELETE FROM m_main_program WHERE start_time = ? AND end_time = ? AND pg_name = ? AND machine_id = ?"
                            , start_time, end_time, pg_name, machine_id);
                    log.info("delete - start_time: {}, end_time: {}, pg_name: {}, machine_id: {}",
                            start_time, end_time, pg_name, machine_id);
                }
                return success("1");
            }
        });
    }

    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    public RequestResult<?> upload(@RequestParam("file") MultipartFile uploadFile,
                                   @RequestParam("main_program") String main_program,
                                   @RequestParam("machine") String machine,
                                   @RequestParam("date_time") String date_time) {
        log.info("------------------------------");
        log.info(main_program + ", " + machine + ", " + date_time);
        String runName = uploadFile.getOriginalFilename().replace(".txt", "");
        String rawdataPath = System.getProperty(SysPropKey.DATA_PATH);
        File dir = new File(rawdataPath, "program/" + machine + "/" + date_time + "/" + main_program);
        File file = new File(dir, runName);
        log.info(file.toString());
        log.info("------------------------------");
        try {
            if (!dir.exists()) {
                dir.mkdirs();
            }
            uploadFile.transferTo(file);

        } catch (IOException e) {
            e.printStackTrace();
            return fail(0);
        }
        return success(1);
    }

    @RequestMapping(value = "/uploadRead", method = RequestMethod.POST)
    public RequestResult<List<Map>> uploadRead(@RequestBody Map map) {
        String main_program = map.get("main_program").toString();
        String machine = map.get("machine").toString();
        String date_time = map.get("date_time").toString();
        DateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
        log.info("------------------------------");
        log.info(main_program + ", " + machine + ", " + date_time);
        String rawdataPath = System.getProperty(SysPropKey.DATA_PATH);
        File dir = new File(rawdataPath, "program/" + machine + "/" + date_time + "/" + main_program);
        List<Map> result = new ArrayList<Map>();
        try {
            List<File> fileList = Arrays.asList(dir.listFiles());
            for (File file : fileList) {
                Map tempMap = new HashMap();
                List<String> content = Files.readLines(file);
                tempMap.put("name", file.getName());
                tempMap.put("content", content);
                tempMap.put("last_modified", sdf.format(new Date(file.lastModified())));
                log.info(file.toString());
                log.info("------------------------------");
                result.add(tempMap);
            }
            return success(result);
        } catch (Exception e) {
            return fail(result);
        }
    }

    private String getMainString(Map map) {
        return map.get("start_time") + "/" +
                map.get("end_time") + "/" +
                map.get("machine_id") + "/" +
                map.get("pg_name");
    }

    class MainProgramObject {
        String start_time;
        String end_time;
        String pg_name;
        String machine_id;
        Map pks = new HashMap();
        List<Map> run_program;

        public MainProgramObject(Map map) {
            HashMap tempMap = new HashMap();
            tempMap.put("run_program", map.get("run_program").toString());
            tempMap.put("time", map.get("time").toString());
            start_time = map.get("start_time").toString();
            end_time = map.get("end_time").toString();
            pg_name = map.get("pg_name").toString();
            machine_id = map.get("machine_id").toString();
            run_program = new ArrayList<Map>();
            run_program.add(tempMap);
            pks.put("start_time", start_time);
            pks.put("end_time", end_time);
            pks.put("pg_name", pg_name);
            pks.put("machine_id", machine_id);
        }


        public String toString() {
            return start_time + '/' +
                    end_time + '/' +
                    pg_name;
        }
    }
}
