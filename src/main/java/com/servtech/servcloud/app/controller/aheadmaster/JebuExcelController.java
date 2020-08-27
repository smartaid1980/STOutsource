package com.servtech.servcloud.app.controller.aheadmaster;

import com.google.common.io.Files;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by Hubert
 * Datetime: 2015/11/19 上午 09:45
 */
@RestController
@RequestMapping("/aheadmaster/jebuxlsx")
public class JebuExcelController {
    private static final Logger log = LoggerFactory.getLogger(JebuExcelController.class);

    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    public RequestResult<String> upload (@RequestParam("file") MultipartFile file, @RequestParam(required = false) String timestamp) {
        if (timestamp == null) {
            timestamp = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date());
        }

        File targetFolder = new File(System.getProperty(SysPropKey.DATA_PATH) + "/jebu_excel", timestamp);
        File uploadFile;
        if (targetFolder.exists()) {
            uploadFile = new File(targetFolder, "" + (targetFolder.list().length + 1) + ".xlsx");
        } else {
            uploadFile = new File(targetFolder, "1.xlsx");
            try {
                Files.createParentDirs(uploadFile);
            } catch (IOException e) {
                return RequestResult.fail("上傳失敗: " + e.getMessage());
            }
        }

        try {
            file.transferTo(uploadFile);
            return RequestResult.success(timestamp);
        } catch (IOException e) {
            log.warn(e.getMessage(), e);
            return RequestResult.fail("上傳失敗: " + e.getMessage());
        }
    }

    @RequestMapping(value = "/downloadMergedXlsx", method = RequestMethod.POST)
    public void downloadMergedXlsx(@RequestParam String timestamp, HttpServletResponse response) throws IOException {
        String runBatPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/aheadmaster/program/run.bat";
        File jebuXlsxFolder = new File(System.getProperty(SysPropKey.DATA_PATH) + "/jebu_excel", timestamp);
        String[] commands = new String[]{
                new File(runBatPath).getAbsolutePath(),
                jebuXlsxFolder.getAbsolutePath()
        };

        RunCmd runCmd = new RunCmd(commands, null, new File(System.getProperty(SysPropKey.ROOT_PATH) + "/app/aheadmaster/program"));

        int returnCode = runCmd.execAndReturn();
        if (returnCode == 0) {
            String mimeType = "application/octect-stream";
            String headerKey = "Content-Disposition";
            String headerValue = "attachment; filename=\"management_report.xlsx\"";
            response.setContentType(mimeType);
            response.setHeader(headerKey, headerValue);

            File file = new File(jebuXlsxFolder, "result.xlsx");
            Files.copy(file, response.getOutputStream());
            file.delete();
        }
    }

}
