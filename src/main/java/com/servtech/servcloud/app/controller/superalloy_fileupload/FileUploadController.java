package com.servtech.servcloud.app.controller.superalloy_fileupload;


import com.servtech.hippopotamus.Hippo;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;

import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.*;

import static com.servtech.servcloud.core.util.RequestResult.*;


@RestController
@RequestMapping("/superalloyFileupload/fileupload")
public class FileUploadController {
    private static final Logger log = LoggerFactory.getLogger(FileUploadController.class);
    private static Hippo hippo = HippoService.getInstance();
    private static final String FILE_UPLOAD = "superalloy_filedispatch";

    Map<String, List<String>> deviceIdMap = new HashMap<String, List<String>>();
//    ExcelData excelData = new ExcelData();

    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    public RequestResult<?> upload(@RequestParam("file") MultipartFile uploadFile, @RequestHeader("parseType") String type) {
        //取得檔案 以及 檔名
        String excelName = uploadFile.getOriginalFilename();
        //取得上傳戳記
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
        String datatimetag = sdf.format(System.currentTimeMillis());
        //將上傳檔名切割
//        String savePath = excelName.substring(0,excelName.indexOf("."));
        String savePath = excelName.substring(0, 12);
        File excelDir = new File(System.getProperty(SysPropKey.DATA_PATH), FILE_UPLOAD + "/" + excelName.substring(0, 4) + "/" + excelName.substring(4, 6));
        File excelFile = new File(excelDir, savePath + "_" + (datatimetag.substring(0, 14) + ".xlsx"));
        try {
            if (!excelDir.exists()) {
                excelDir.mkdirs();
            }
            uploadFile.transferTo(excelFile);
            String runBatPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/DispatchManagement/program/runSuperAlloyFileDispatch.bat";
            String filestring = System.getProperty(SysPropKey.DATA_PATH) + "/" + FILE_UPLOAD + "/" + excelName.substring(0, 4) + "/" + excelName.substring(4, 6) + "/" + savePath + "_" + (datatimetag.substring(0, 14) + ".xlsx");
            String hippostring = System.getProperty(SysPropKey.ROOT_PATH) + "WEB-INF/classes/hippo.xml";
            String[] commands = new String[]{runBatPath, hippostring, filestring, type};
            String batTarget = System.getProperty(SysPropKey.ROOT_PATH) + "/app/DispatchManagement/program";

//            RunCmd runCmd = new RunCmd(commands, null, new File(System.getProperty(SysPropKey.ROOT_PATH) + "/app/DispatchManagement/program"));
//            int resultValue = runCmd.execAndReturn();

//            if (resultValue == 0) {
//
//                return RequestResult.success("上傳成功!!!");
//
//            } else {
//                excelFile.delete();
//
//                return RequestResult.fail("不明失敗原因，請聯絡產品負責人!");
//            }
            //要跑 bat 的地方
            DataImportCmd cmd = new DataImportCmd.Builder().setCommands(commands)
                    .setEnvp(null)
                    .setFile(new File(batTarget))
                    .build();
            DataImportCmd.ResponseData data = cmd.runCmd();
            if (data.status == 1) {
                data.type = 1;
                return success(data);
            } else {
                data.type = 0;
                return fail(data);
            }

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
            excelFile.delete();
        }
        return success("上傳成功!!!但解析失敗!!!");

    }

    public static class DataImportCmd {

        private String[] commands;
        private String[] envp;
        private File file;

        private DataImportCmd(Builder builder) {
            this.commands = builder.commands;
            this.envp = builder.envp;
            this.file = builder.file;

        }


        public static class Builder {
            private String[] commands;
            private String[] envp;
            private File file;

            public Builder setCommands(String[] commands) {
                if (commands == null || commands.length == 0) {
                    throw new BuilderExection("commands is null or isEmpty");
                }
                this.commands = commands;
                return this;
            }

            public Builder setEnvp(String[] envp) {
                this.envp = envp;
                return this;
            }

            public Builder setFile(File file) {
                this.file = file;
                return this;
            }

            public DataImportCmd build() {
                return new DataImportCmd(this);
            }
        }

        ResponseData runCmd() {

            try {
                ProcessBuilder pb = new ProcessBuilder(this.commands).directory(this.file).redirectErrorStream(true);
                Process proc = pb.start();
                ExecutorService executor = Executors.newCachedThreadPool();
                Callable<ResponseData> task = new Message(proc.getInputStream());
                Future<ResponseData> future = executor.submit(task);
                proc.waitFor();
                return future.get();
            } catch (IOException e) {
                e.printStackTrace();
            } catch (InterruptedException e) {
                e.printStackTrace();
            } catch (ExecutionException e) {
                e.printStackTrace();
            }
            return null;
        }

        static class Message implements Callable<ResponseData> {

            private InputStream is;
            static final String SEP = System.getProperty("line.separator");

            Message(InputStream is) {
                this.is = is;
            }

            @Override
            public ResponseData call() throws Exception {
                try {
                    BufferedReader br = new BufferedReader(new InputStreamReader(is, "UTF-8"));
                    List<String> msgList = new ArrayList<String>();
                    String dataStr = "";
                    String line = "";
                    while ((line = br.readLine()) != null) {
                        if (line.indexOf("###") > -1) {
                            msgList.add(line.substring(line.indexOf("###") + 3));
                        } else if (line.indexOf("#DATA#") > -1) {
                            dataStr = line.substring(line.indexOf("#DATA#") + 6);
                        } else if (line.indexOf("@@@") > -1) {
                            System.out.println(line.substring(line.indexOf("@@@") + 6));
                        } else {
                            log.info("Process log : "+line);
                        }
                    }
                    if (msgList.size() > 0) {
                        return new ResponseData(1, msgList);
                    } else {
                        return new ResponseData(0, dataStr);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
                return null;
            }

        }

        static class ResponseData<T> {
            int status;
            int type;
            T data;

            ResponseData(int status, T data) {
                this.status = status;
                this.data = data;
            }

        }

        static class BuilderExection extends RuntimeException {
            public BuilderExection(String msg) {
                super(msg);
            }
        }

    }
/*
* 廠區 = workFactory
* 區域 = area
* 機台編號 = deviceId;
* 日期 = date;
* 班別 = schedule;
* 產品編號 = productId;
* 領班 = supervisorName;
* 組長 = leaderName;
* 員工 = employeeName;
* 報工時數 = totalHour;
* 工作中心 = workCenter;
* 製程 = op;
* 機時 = deviceMinute;
* 人時 = manHour;
* 最大產出 = maxOutput;
* 派工目標數 = dispatchTarget;
* 人力利用率 = personRate;
*/

}