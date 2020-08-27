package com.servtech.servcloud.app.controller.iiot;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2018/10/15.
 */
@RestController
@RequestMapping("/iiot/idleAI/")
public class IiotIdleAIController {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(IiotIdleAIController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/getPRGMIsChange", method = RequestMethod.GET)
    public RequestResult<Boolean> getPRGMIsChange(@RequestParam("machineId") final String machineId,
                                                 @RequestParam("startTime") final String startTime,
                                                 @RequestParam("endTime") final String endTime) {
        return ActiveJdbc.operTx(new Operation<RequestResult<Boolean>>() {
            @Override
            public RequestResult<Boolean> operate() {
                BufferedReader part2Data = null;
                try {
                    Long inTime = System.currentTimeMillis();
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
                    Date start = sdf.parse(startTime);
                    Date end = sdf.parse(endTime);
//                    String part2Path = "C:/Servtech/Servolution/Vendor/idle/input";
                    String part2Path = "C:/Servtech/Servolution/Platform/calc/part2FilterOutPut";
                    String year = startTime.substring(0,4);
                    String month = startTime.substring(4,6);
                    String startDateStr = startTime.substring(0,8);
                    File file = new File(part2Path, machineId + "/" + year + "/" + month + "/" + startDateStr + ".csv");
                    int firstPRGM = 0;
                    boolean isHeader = true;
                    int testCount = 0;
                    if(file.exists()){
                        part2Data = new BufferedReader(new FileReader(file));
                        String recordStr = null;
//                        List<String> records = deviceRawData.lines().collect(Collectors.toList());
                        while ((recordStr = part2Data.readLine()) != null){
                            //把  [[]] 都去掉 然後分割
                            String[] recordColumns = recordStr.split("\\|");
                            if(isHeader){
                                for(int i = 0 ; i < recordColumns.length ; i++){
                                    if(recordColumns[i].length() >= 5 && recordColumns[i].substring(0,6).equals("G_PRGM")){
                                        firstPRGM = i;
                                        break;
                                    }
                                }
                                isHeader = false;
                            }else {
                                Date timestamp = sdf.parse(recordColumns[0]);
                                if((start.before(timestamp) || start == timestamp) && (end.after(timestamp) || end == timestamp)){
                                    for(int i = 0 ; i < 3 ;i++){
                                        testCount++;
                                        if(recordColumns[firstPRGM + i].equals("1")){
                                            log.info("Time duration return true : " + (inTime - System.currentTimeMillis()) /1000 + "s");
                                            return success(Boolean.TRUE);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    log.info("Time duration return False: " + (inTime - System.currentTimeMillis()) /1000 + "s");
                    return success(Boolean.FALSE);
                } catch (Exception e) {
                    e.printStackTrace();
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    return fail(Boolean.FALSE);
                } finally {
                    if(part2Data != null){
                        try {
                            part2Data.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                }
            }
        });
    }
}


