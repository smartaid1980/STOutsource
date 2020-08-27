package com.servtech.servcloud.app.controller.teco_servtrack;


import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;


@RestController
@RequestMapping("/teco-servtrack/work")
public class TecoFileUploadController {
    private static final Logger log = LoggerFactory.getLogger(TecoFileUploadController.class);
    private static final String FOLDER_NAME = "teco_work_import";
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/update-status", method = RequestMethod.PUT)
    public RequestResult<?> cancelWork(@RequestBody final Map data) {

        String statusId = data.get("status_id").toString();
        List<String> workIds = (List<String>) data.get("works");
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String sql = "update a_servtrack_work set status_id = ? WHERE work_id IN " + splitStrForSql(",", workIds);
                int result = Base.exec(sql, statusId);
                if (result > 0) {
                    return success(result);
                } else {
                    return fail(result);
                }
            }
        });
    }

    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    public RequestResult<?> upload(@RequestParam("file") MultipartFile uploadFile,
                                   @RequestHeader("parseType") String type) {
        //取得檔案 以及 檔名
        String excelName = uploadFile.getOriginalFilename();

        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
        long nowTimeLong = System.currentTimeMillis();
        String dateStr = sdf.format(nowTimeLong);

        String batTarget = System.getProperty(SysPropKey.ROOT_PATH) + "/app/ServTrackManagement/program/Teco/DataImport";

        File targetFolder = new File(System.getProperty(SysPropKey.DATA_PATH),
                FOLDER_NAME + "/" + dateStr.substring(0, 4) + "/" + dateStr.substring(4, 6) + "/" + excelName.replaceAll(".xls", ""));
        File targetFile = new File(targetFolder, dateStr + ".xls");
        try {
            if (!targetFile.exists()) {
                targetFile.mkdirs();
            }

            // 上傳的檔案存放
            uploadFile.transferTo(targetFile);
            String filesPath = targetFile.getAbsolutePath();
            String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

            //要跑 bat 的地方
            String runBatPath = batTarget + "/run.bat";
            String[] commands = new String[]{runBatPath, filesPath, user};
            DataImportCmd cmd = new DataImportCmd.Builder().setCommands(commands)
                    .setEnvp(null)
                    .setFile(new File(batTarget))
                    .build();
            DataImportCmd.ResponseData data = cmd.runCmd();
            if (data.status == 0) {
                return success(data);
            } else {
                return fail(data);
            }

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
            targetFile.delete();
        }
        return success("上傳時，解析失敗!!!");

    }

    String splitStrForSql(String splitter, List<String> list) {
        String sep = "";
        StringBuilder sb = new StringBuilder("( ");

        for (String s : list) {
            sb.append(sep);
            sb.append("'" + s + "'");
            sep = splitter;
        }
        sb.append(" ) ");

        return sb.toString();
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
                            log.info("Process log : " + line);
                        }
                    }
                    log.info("msgList : " + msgList.toString());
                    log.info("dataStr : " + dataStr);

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
}