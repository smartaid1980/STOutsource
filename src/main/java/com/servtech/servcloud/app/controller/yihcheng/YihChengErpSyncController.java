package com.servtech.servcloud.app.controller.yihcheng;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

@RestController
@RequestMapping("/yihcheng/erpsyn")
public class YihChengErpSyncController {

    private static final String LOCK = new String();
    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;


    @RequestMapping(method = RequestMethod.GET)
    public RequestResult<?> syncErp() {
        return ActiveJdbc.operTx(() -> {
            try {

                Runnable runnable = new Runnable() {
                    @Override
                    public void run() {
                        String[] commands = new String[]{"cmd", "/c", "start", "runSyncConfigAndWork.bat"};
                        String commandPath = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/../YihChengErpSyncToDB";
                        RunCmd runCmd = new RunCmd(commands, null, new File(commandPath));
                        runCmd.execAndReturn();
                    }
                };
                new Thread(runnable).start();
                return success();
            } catch (Exception e) {
                e.printStackTrace();
                return fail(e.getMessage());
            }
        });
    }

    @RequestMapping(value = "work", method = RequestMethod.GET)
    public RequestResult<?> syncWorkErp() {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                try {
                    String[] commands = new String[]{"cmd", "/c", "start", "run.bat"};
                    String commandPath = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/../YihChengWorkSync";
                    RunCmd runCmd = new RunCmd(commands, null, new File(commandPath));
                    runCmd.execAndReturn();

                    return success();
                } catch (Exception e) {
                    e.printStackTrace();
                    return fail(e.getMessage());
                }
            });
        }
    }

}
