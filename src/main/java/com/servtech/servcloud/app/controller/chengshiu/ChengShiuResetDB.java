package com.servtech.servcloud.app.controller.chengshiu;

import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.commons.io.FileUtils;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Jenny on 2017/11/24.
 */
@RestController
@RequestMapping("/chengshiu/resetdb")
public class ChengShiuResetDB {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(ChengShiuAlertLog.class);
    final String SQL_DIR = System.getProperty(SysPropKey.ROOT_PATH) + "WEB-INF\\sql\\";

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/reset", method = RequestMethod.GET)
    public RequestResult<?> reset() {

        // delete chengshiu little heaven
        String dir = System.getProperty(SysPropKey.DATA_PATH) + "/chengshiu/";
        File dirPath = new File(dir);
        try {
            FileUtils.deleteDirectory(dirPath);
        } catch (Exception e) {
            e.printStackTrace();
            log.warn(e.getMessage());
            return fail("正修小天地刪除失敗...");
        }

        // delete last reset log
        File resetErrLogFile = new File(SQL_DIR, "reset_err.log");
        File resetOverFile = new File(SQL_DIR, "reset_over");
        resetOverFile.delete();
        resetErrLogFile.delete();

        String[] commands = new String[]{"cmd", "/c", "start", "resetCSU.bat"};
        RunCmd runCmd = new RunCmd(commands, null, new File(SQL_DIR));
        runCmd.exec();
        String userId = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
        log.info("使用者: " + userId + " 重建資料庫");

        while(true) {
            if (resetOverFile.exists()) {
                if (resetErrLogFile.exists()) {
                    if (resetErrLogFile.length() == 0) {
                        break;
                    } else {
                        return fail("重建資料失敗，有錯誤訊息。");
                    }
                } else {
                    return fail("重建資料失敗，流程異常。");
                }
            }
        }
        return success("重建資料成功。");

    }
}
