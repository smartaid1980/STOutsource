package com.servtech.servcloud.app.controller.backup_query;

import com.servtech.common.file.FileLineProcessor;
import com.servtech.common.file.Files;
import com.servtech.servcloud.core.util.RequestResult;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FilenameFilter;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.*;
import static com.servtech.servcloud.core.util.SysPropKey.DATA_PATH;

/**
 * Created by Jenny on 2017/6/3.
 */
@RestController
@RequestMapping("/backupquery")
public class BackupQueryController {

    private static final String PATH_SEP = System.getProperty("file.separator");
    private static final String SERVCORE_BACKUP_LOG = System.getProperty(DATA_PATH) + PATH_SEP + "ServCoreBackupLog";

    @RequestMapping(value = "/query", method = RequestMethod.POST)
    public RequestResult query(@RequestParam final String start_date, @RequestParam final String end_date) {

        final List<BackupQuery> resultMap = new ArrayList<BackupQuery>();

        // 先找出有哪些資料夾
        File dir = new File(SERVCORE_BACKUP_LOG);
        String[] directories = dir.list(new FilenameFilter() {
            @Override
            public boolean accept(File current, String name) {
                return new File(current, name).isDirectory();
            }
        });

        // 組成物件回傳
        try {

            List<String> dateFilePathList = dateIntervalFiles(start_date, end_date);
            for (final String directory : directories) {

                FileLineProcessor fileLineProcessor = new FileLineProcessor() {
                    @Override
                    public void process(String line, int lineNumber) {
                        String[] cells = line.split("\\|", -1);
                        if(cells != null && cells.length == 5)
                        {
                            resultMap.add(new BackupQuery(directory, cells));
                        }
                        else
                        {
                            System.out.println("column not enought :"+line);
                        }
                    }
                };

                for (String dateFilePath : dateFilePathList) {
                    File file = new File(SERVCORE_BACKUP_LOG, directory + PATH_SEP + dateFilePath);
                    if (file.exists()) {
                        Files.iterLines(file, fileLineProcessor);
                    }

                }
            }

        } catch (ParseException e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
        return success(resultMap);

    }

    // 組出日期檔案路徑
    private static List<String> dateIntervalFiles(String start_date, String end_date) throws ParseException {

        List<String> dateFilePathList = new ArrayList<String>();
        DateFormat df = new SimpleDateFormat("yyyy/MM/dd");
        DateFormat pathDateFormat = new SimpleDateFormat("yyyy" + PATH_SEP + "MM" + PATH_SEP + "yyyyMMdd");
        Date startDate = df.parse(start_date);
        Date endDate = df.parse(end_date);

        Calendar startCalendar = Calendar.getInstance();
        startCalendar.setTime(startDate);
        Calendar endCalendar = Calendar.getInstance();
        endCalendar.setTime(endDate);

        while (!startCalendar.after(endCalendar)) {
            String generalDatePath = pathDateFormat.format(startCalendar.getTime()) + ".csv";
            dateFilePathList.add(generalDatePath);
            startCalendar.add(Calendar.DAY_OF_MONTH, 1);
        }
        return dateFilePathList;
    }

    private static class BackupQuery {
        String ServCoreId;
        String date;
        String result;
        String startTsp;
        String endTsp;
        String exception;

        public BackupQuery(String directory, String[] cells) {
            if (cells.length != 5) {
                throw new RuntimeException(directory + ", " + cells[0] + " 資料長度不足！！！");
            }
            this.ServCoreId = directory;
            this.date = cells[0];
            this.result = cells[1];
            this.startTsp = cells[2];
            this.endTsp = cells[3];
            this.exception = cells[4];
        }
    }

}
