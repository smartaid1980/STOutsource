package com.servtech.servcloud.module.controller;

import com.google.gson.Gson;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.poi.ss.formula.functions.T;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2019/5/17.
 */
@RestController
@RequestMapping("/externalApp")
public class ExternalAppController {

    @RequestMapping(value = "/callByPathIndex", method = RequestMethod.POST)
    public RequestResult<?> callByPathIndex(@RequestBody Map data) {

        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {

            Map<String, List<Map>> jsonDataMap;

            @Override
            public RequestResult<?> operate() {
                try {

                    // 取得Request 的參數
                    Double indexD = (Double)data.get("appPathIndex");
                    int index = indexD.intValue();

                    // 取得 external_app_config.json 的路徑
                    StringBuilder sb = new StringBuilder();
                    sb.append(System.getProperty(SysPropKey.CUST_PARAM_PATH)).append("/param/");

                    // 取得 external_app_config.json
                    File externamAppConfigJsonFile = new File(sb.toString(), "external_app_config.json");

                    if (!externamAppConfigJsonFile.exists()) {

                        return fail("JsonFile Not Found");
                    } else {

                        jsonDataMap = new Gson().fromJson(new FileReader(externamAppConfigJsonFile), Map.class);

                        Map<String, String> appPath = jsonDataMap.get("appPathList").get(index);

                        String key = appPath.keySet().iterator().next();
                        String path = appPath.get(key);

                        StringBuilder sbPath = new StringBuilder();

                        String[] pathArr = path.split("/");
                        for(int i = 0 ; i< pathArr.length ; i++){
                            if(i == pathArr.length-1){
                                break;
                            }else{
                                sbPath.append(pathArr[i] + "/");
                            }
                        }

                        String[] commands = new String[]{"cmd", "/c", "start" , pathArr[pathArr.length-1]};
                        RunCmd runCmd = new RunCmd(commands, null, new File(sbPath.toString()));

                        int resultCode = runCmd.execAndReturn();

                        if (resultCode == 0) {
                            return success("call "+ key +" success");
                        } else {
                            return fail("call "+ key +" fail");
                        }
                    }
                } catch (FileNotFoundException fnf) {
                    return fail(fnf.getMessage());
                }
            }
        });
    }


}
