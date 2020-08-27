package com.servtech.servcloud.app.controller.tool_management;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.servtech.common.file.Files;
import com.servtech.common.platform.calcInfo.CalcInfo;
import com.servtech.hippopotamus.*;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.controller.InfoController;
import com.servtech.servcloud.module.service.hippo.HippoService;
import com.servtech.servcloud.module.service.workshift.WorkShiftTimeService;
import com.servtech.servcloud.module.service.workshift.exception.WorkShiftTimeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import static com.servtech.servcloud.core.util.RequestResult.*;
import static org.springframework.web.bind.annotation.RequestMethod.POST;
import static org.springframework.web.bind.annotation.RequestMethod.GET;


/**
 * Created by Raynard on 2017/1/25.
 */

@RestController
@RequestMapping("/toolstatus")
public class ToolStatusController {

    private static final Logger log = LoggerFactory.getLogger(ToolStatusController.class);
    static Hippo hippo;

    @Autowired
    private HttpServletRequest request;


//    String splitStr = "\\|\\|";
    String folderStr = "equip_line_status";
    String fileName = "tool_status.txt";
    String demoFileName = "demo_machine.txt";

    @RequestMapping(value="settoolstatus", method = POST)
    public RequestResult<String> setToolStatus(@RequestBody final Config config){
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
        String timeStr = sdf.format(new Date());
//        Map<String, ToolInfo> toolInfo = config.toolStatus;
        Map<String, Object> toolMap = (Map)config.toolStatus;

        Map<String, Object> prevMap = (Map)getFileData().toolStatus;

        for(Map.Entry<String, Object> entry : toolMap.entrySet()){
             prevMap.put(entry.getKey(), entry.getValue());
        }
        prevMap.put("lastTime", timeStr);


        File toolStatusFile  = new File(System.getProperty(SysPropKey.DATA_PATH),"/" + folderStr);
        try {
            if (!toolStatusFile.exists()) {
                toolStatusFile.mkdirs();
            }
            File toolFile = new File(toolStatusFile.getPath(), "/" + fileName);
            if (!toolFile.exists()) {
                toolFile.createNewFile();
            }
            FileWriter fw = new FileWriter(toolFile);
            String json = new Gson().toJson(prevMap);
            fw.write(json);
            fw.flush();
            fw.close();
        } catch (IOException e) {
            log.info(e.getMessage());
            e.printStackTrace();
        }
        try {
            for (Map.Entry<String, Object> entry : prevMap.entrySet()) {
                String tool_seq = entry.getKey();
                if(!tool_seq.equals("lastTime")) {
                    ToolInfo data = (ToolInfo)entry.getValue();
                    if (checkExist(timeStr, data.toolName, "toolMagzine")) {
                        addHippoData(timeStr, tool_seq, "toolMagzine", data, true);
                    } else {
                        addHippoData(timeStr, tool_seq, "toolMagzine", data, false);
                    }
                }
            }
        } catch (InterruptedException e) {
            log.info(e.getMessage());
            e.printStackTrace();
        } catch (ExecutionException e) {
            log.info(e.getMessage());
            e.printStackTrace();
        }

        return success();
    }


    @RequestMapping(value="gettoolstatus", method = GET)
    public RequestResult<Map<String, Object>> getToolStatus(){

        Map<String, Object> resultMap = new TreeMap<String, Object>();

        File toolStatusFile  = new File(System.getProperty(SysPropKey.DATA_PATH),"/" + folderStr);
        try {
            if (!toolStatusFile.exists()) {
                resultMap = null;
                return success(resultMap);
            }
            File toolFile = new File(toolStatusFile.getPath(), "/" + fileName);
            if (!toolFile.exists()) {
                resultMap = null;
                return success(resultMap);
            }
            FileReader fr = new FileReader(toolFile);
            BufferedReader br = new BufferedReader(fr);
            String toolStatus = "";
            String tool = "";
            while(( tool = br.readLine())!= null){
                toolStatus += tool;
            }

            br.close();
            fr.close();


             resultMap = new Gson().fromJson(toolStatus,Map.class);


            return success(resultMap);

        } catch (IOException e) {
            log.info(e.getMessage());
            e.printStackTrace();
        }

        return success();
    }


    public Config getFileData(){

        Map<String, Object> resultMap = new TreeMap<String, Object>();

        File toolStatusFile  = new File(System.getProperty(SysPropKey.DATA_PATH),"/" + folderStr);
        Config config = new Config();
        try {
            if (!toolStatusFile.exists()) {
                resultMap = null;
                 config = new Config();
                Map<String, ToolInfo> toolMap = new HashMap<String, ToolInfo>();
                config.toolStatus = toolMap;
                return config;
            }
            File toolFile = new File(toolStatusFile.getPath(), "/" + fileName);
            if (!toolFile.exists()) {
                 config = new Config();
                Map<String, ToolInfo> toolMap = new HashMap<String, ToolInfo>();
                config.toolStatus = toolMap;
                return config;
            }
            FileReader fr = new FileReader(toolFile);
            BufferedReader br = new BufferedReader(fr);
            String toolStatus = "";
            String tool = "";
            while(( tool = br.readLine())!= null){
                toolStatus += tool;
            }

            br.close();
            fr.close();


            resultMap = new Gson().fromJson(toolStatus,Map.class);
            if(resultMap.containsKey("lastTime")) {
                resultMap.remove("lastTime");
            }
            String toolStatusStr = new Gson().toJson(resultMap);
            config = new Config();
            config.toolStatus = new Gson().fromJson(toolStatusStr,new TypeToken<Map<String, ToolInfo>>(){}.getType());



            return config;

        } catch (IOException e) {
            log.info(e.getMessage());
            e.printStackTrace();
        }

        return config;
    }

    // 這個是 demo 用的....  之後 應該會拿掉吧~

    @RequestMapping(value="getdemomachine", method = GET)
    public RequestResult<List<String>> getDemoMachine(){

       List<String> machineList = new ArrayList<String>();

        File toolStatusFile  = new File(System.getProperty(SysPropKey.DATA_PATH),"/" + folderStr);
        try {
            if (!toolStatusFile.exists()) {
                return success(machineList);
            }
            File toolFile = new File(toolStatusFile.getPath(), "/" + demoFileName);
            if (!toolFile.exists()) {
                return success(machineList);
            }
            FileReader fr = new FileReader(toolFile);
            BufferedReader br = new BufferedReader(fr);
            String demoMachineStr = "";

            while(( demoMachineStr = br.readLine())!= null){
                String[] machines = demoMachineStr.split(",");
                machineList.addAll(Arrays.asList(machines));
            }
            br.close();
            fr.close();

            return success(machineList);

        } catch (IOException e) {
            log.info(e.getMessage());
            e.printStackTrace();
        }

        return success();
    }



    private boolean checkExist(String timeStr, String toolName, String machineName){
        hippo = HippoService.getInstance();
        String date = timeStr.substring(0,8);
        String year = timeStr.substring(0,4);
        String month = timeStr.substring(4,6);
        String day = timeStr.substring(6,8);

        return hippo.exists("tool_status", machineName, year, month, day, toolName);

    }

    private void addHippoData (String timeStr, String tool_seq, String machineName ,ToolInfo data , boolean add) throws InterruptedException,ExecutionException {

        Future<Inhalable> future =null;
        WorkShiftTimeService.NowActualShiftTime nowShiftInfo = WorkShiftTimeService.nowActualShiftTime();
        Map<String, Object> nowWork = nowShiftInfo.getNowShiftTime();


        Inhaler inhaler = hippo.newInhaler();
        inhaler.space("tool_status")
                .index("machine_id", machineName)
                .index("year", timeStr.substring(0, 4))
                .index("month", timeStr.substring(4, 6))
                .index("day", timeStr.substring(6, 8))
                .index("tool_name", data.toolName)
                .dataTimestamp(timeStr + "000")
                .put("machine_id", machineName)
                .put("date", timeStr.substring(0, 8))
                .put("work_shift", nowWork.get("name").toString())
                .put("tool_seq", tool_seq)
                .put("tool_name", data.toolName)
                .put("tool", data.tool==null?"---":data.tool.isEmpty()?"---":data.tool)
                .put("status", data.status)
                .put("length", data.length)
                .put("radius", data.radius)
                .put("wl", data.wl)
                .put("wr", data.wr)
                .put("part_count",data.partCount==null?"---":data.partCount)
                .put("cutting_time", data.cuttingTime==null?"---": data.cuttingTime)
                .next();
        if (add) {
            future = inhaler.inhaleAppend();
            future.get();
        } else {
            future = inhaler.inhale();
            future.get();
        }

    }

    private  class Config{
        Map<String, ToolInfo> toolStatus;
    }

    private class ToolInfo{
        private String toolName;    //實際刀號    default - N/A
        private String status;      //狀態 0表示無刀,值1表示有刀,值-1表示NG  default - 0
        private String tool;        //如果狀態 為 0 為2種情況， 1是真的無刀 2是再某台機台上，如果狀況為2，要記錄是再哪一台機台
        private Double length;      //刀長  default - 0.0
        private Double radius;      //半徑  default - 0.0
        private Double wl;          //WL   default - 0.0
        private Double wr;          //WR    default - 0.0
        private String partCount;
        private String cuttingTime;

    }

}
