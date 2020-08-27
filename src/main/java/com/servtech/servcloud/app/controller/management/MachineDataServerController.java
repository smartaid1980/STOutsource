package com.servtech.servcloud.app.controller.management;



import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;

import static com.servtech.servcloud.core.util.RequestResult.*;

@RestController
@RequestMapping("/management/machinedataserver")
public class MachineDataServerController {
    private final String DATA_SERVER_NAME = "FanucDataServerMQTT";
    private final Logger logger = LoggerFactory.getLogger(MachineDataServerController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/restart", method = RequestMethod.GET)
    public RequestResult<String> restart() {
        String prevPid = "";
        String dataPath = System.getProperty(SysPropKey.DATA_PATH);
        String commandPath = new File(dataPath).getParent() + "/" + DATA_SERVER_NAME;
        if (!new File(commandPath).exists()) {
            return fail("Can not find DataServer Program, plz check it is exist");
        }
        for (File file : new File(commandPath).listFiles()) {
            String fileName = file.getName();
            if (fileName.endsWith(".pid")) {
                prevPid = fileName.substring(0, fileName.length() - 4);
                break;
            }
        }
        try {
            String[] command = new String[]{"tasklist.exe", "/FO", "CSV"};
            Process proc = Runtime.getRuntime().exec(command);
            BufferedReader input = new BufferedReader(new InputStreamReader(proc.getInputStream()));
            String line;
            while((line = input.readLine()) != null) {
                String[] tasks = line.substring(1, line.length() - 1).split("\",\"");
                String procName = tasks[0];
                String pid = tasks[1];
                if (procName.equals("java.exe") && pid.equals(prevPid)) {
                    proc = Runtime.getRuntime().exec(new String[] {"cmd", "/c", "taskkill", "/f", "/PID", pid});
                }
            }
            String[] commands = new String[]{"cmd", "/c", "start", "run.bat"};
            RunCmd runCmd = new RunCmd(commands, null, new File(commandPath));
            if (runCmd.execAndReturn() == 0 ) {
                return success();
            } else {
                return fail("restart is fail, plz try again");
            }

        } catch (IOException e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

}
