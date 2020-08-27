package com.servtech.servcloud.core.mail;

import com.google.gson.Gson;
import com.servtech.servcloud.core.mail.modules.ConfigData;
import com.servtech.servcloud.core.mail.modules.DataTemplate;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by Eric Peng on 2018/10/26.
 */
public class MailManager {
    private static final Logger log = LoggerFactory.getLogger(MailManager.class);
    private DateFormat dateTimeFormat = new SimpleDateFormat("/yyyyMMdd_HHmmss");
    private DateFormat datePathFormat = new SimpleDateFormat("yyyy/MM/");


    public boolean sendMail(DataTemplate dataTemplate, ConfigData configData) {
        String batPath = System.getProperty(SysPropKey.ROOT_PATH) + "/program/HULSendMailTest.bat";
        configData.content = saveData(dataTemplate);
        String[] commands = new String[]{
                new File(batPath).getAbsolutePath(),
                configData.toString()
        };
        RunCmd runCmd = new RunCmd(commands, null, new File(System.getProperty(SysPropKey.ROOT_PATH) + "/program"));
        int resultCode = runCmd.execAndReturn();
        if (resultCode == 0) {
            return true;
        } else {
            return false;
        }
    }

    private String saveData(DataTemplate dataTemplate) {
        Date date = new Date();
        Gson gson = new Gson();
        String dir = System.getProperty(SysPropKey.DATA_PATH)
                + "/email_log_data/" + datePathFormat.format(date)
                + dateTimeFormat.format(date)
                + ".json";
        try {
            File file = new File(dir);
            if (!file.getParentFile().exists())
                file.getParentFile().mkdirs();
            BufferedWriter bufferedWriter = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(dir)), "UTF-8"));
            gson.toJson(dataTemplate, bufferedWriter);
            bufferedWriter.flush();
            bufferedWriter.close();
            return dir;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
}
