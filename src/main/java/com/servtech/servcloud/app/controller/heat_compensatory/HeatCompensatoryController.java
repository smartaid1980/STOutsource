package com.servtech.servcloud.app.controller.heat_compensatory;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.Box;
import org.javalite.activejdbc.LazyList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.*;
import java.util.HashMap;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by RDtest01 on 2015/9/3.
 */
@RestController
@RequestMapping("/heatCompensatory")
public class HeatCompensatoryController {

    private static final Logger logger = LoggerFactory.getLogger(HeatCompensatoryController.class);

    // 'thermal_control_test' 資料夾所在的目錄
    private final String thermalFolder = "D:\\AAA\\cloud\\thermal_control_test";

    @RequestMapping("/getData")
    public RequestResult<Map> readData() throws IOException {

        Map map = new HashMap();

        File thermal = new File(thermalFolder);
        if( thermal.exists() ) {
            String str[];
            FileReader fr = new FileReader(thermalFolder + "\\data.txt");
            BufferedReader br = new BufferedReader(fr);
            String[] label = {"x", "y", "z", "main"};

            str = br.readLine().split("\\|");
            for(int i=0;i<4;i++)
                map.put("ini_temp_"+label[i], Float.parseFloat(str[i]));
            str = br.readLine().split("\\|");
            for(int i=0;i<4;i++)
                map.put("com_temp_"+label[i], Float.parseFloat(str[i]));
            str = br.readLine().split("\\|");
            for(int i=0;i<3;i++)
                map.put("main_diff_"+label[i], Float.parseFloat(str[i]));
            str = br.readLine().split("\\|");
            for(int i=0;i<3;i++)
                map.put("server_diff_"+label[i], Float.parseFloat(str[i]));
            br.close();
            fr.close();
        }


        return success(map);
    }

    @RequestMapping("/runWFA1")
    public RequestResult<Boolean> run_WindowsFormsApplication1(){
        File thermal = new File(thermalFolder);
        if( thermal.exists() ) {
            try {
                String BoxIP = getBoxIP();
                String[] cmd = {"cmd", "/c", thermalFolder+"\\do.bat", thermalFolder, BoxIP, "6666"};
                if(!is_WindowsFormsApplication1_running())
                    Runtime.getRuntime().exec(cmd);

                if(is_WindowsFormsApplication1_running())
                    logger.info("WindowsFormsApplication1.exe 啟動成功!");
                else
                    logger.info("啟動失敗!");

            } catch (Exception e) {
                logger.warn("WindowsFormsApplication1.exe 啟動時發生錯誤!");
                logger.warn(e.getMessage());
            }
        } else {
            logger.warn("'thermal_control_test' 資料夾不存在!");
        }

        return success(is_WindowsFormsApplication1_running());
    }

    @RequestMapping("/killWFA1")
    public RequestResult<Boolean> kill_WindowsFormsApplication1(){
        File thermal = new File(thermalFolder);
        if( thermal.exists() ) {
            try {
                FileWriter  fileWriter = new FileWriter(thermalFolder+"\\stop.txt",false);
                fileWriter.close();
            } catch (Exception e) {
                logger.warn("WindowsFormsApplication1.exe 結束執行時發生錯誤!!");
                logger.warn(e.getMessage());
            }
        } else {
            logger.warn("'thermal_control_test' 資料夾不存在!");
        }
        return success(is_WindowsFormsApplication1_running());
    }

    @RequestMapping("/compensate")
    public RequestResult<Boolean> compensate(){
        File thermal = new File(thermalFolder);
        if( thermal.exists() ) {
            try {
                FileWriter fileWriter = new FileWriter(thermalFolder+"\\start.txt",false);
                fileWriter.close();
                return success(true);
            } catch (Exception e) {
                logger.warn("補償失敗!");
            }
        } else {
            logger.warn("'thermal_control_test' 資料夾不存在!");
        }

        return fail(false);
    }

    @RequestMapping("/isSysOn")
    public RequestResult<Boolean> isSysOn(){
        return success(is_WindowsFormsApplication1_running());
    }

    public String getBoxIP(){
        return ActiveJdbc.oper(new Operation<String>() {
                                   @Override
                                   public String operate() {
                                       LazyList<Box> list = Box.findAll();
                                       if(list.size()==0){
                                           return "127.0.0.1";
                                       } else {
                                           return list.get(0).getString("ip");
                                       }
                                   }
                               }
        );
    }

    //  return true if WindowsFormsApplication1.exe is running
    public boolean is_WindowsFormsApplication1_running(){
        try {
            String cmds[] = {"cmd", "/c", "tasklist","/FO","CSV"};
            Process p = Runtime.getRuntime().exec(cmds);

            InputStream inputstream = p.getInputStream();
            InputStreamReader inputstreamreader = new InputStreamReader(inputstream);
            BufferedReader bufferedreader = new BufferedReader(inputstreamreader);
            String line;
            //Search the task "WindowsFormsApplication1.exe"
            while ((line = bufferedreader.readLine()) != null) if (line.contains("WindowsFormsApplication1.exe"))
                return true;
        } catch (Exception e) {
            logger.warn("查詢 tasklist 時發生錯誤!");
            logger.warn(e.getMessage());
        }
        return false;
    }

}
