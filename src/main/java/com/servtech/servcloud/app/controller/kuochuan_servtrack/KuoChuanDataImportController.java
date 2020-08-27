package com.servtech.servcloud.app.controller.kuochuan_servtrack;

import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import static com.servtech.servcloud.core.util.RequestResult.*;

/**
 * Created by Raynard on 2017/7/26.
 */
@RestController
@RequestMapping("/kuochuan/servtrack/dataimport")
public class KuoChuanDataImportController {

    private static final String FOLDER_NAME = "kuochuan_data_import";
    private static final SimpleDateFormat YYYYMMDDHHMMSSSSS = new SimpleDateFormat("yyyyMMddHHmmssSSS");

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    public RequestResult<?> upload(@RequestParam("file") final MultipartFile uploadFile, @RequestParam("type") final String type) {
        //用來判斷是哪一種打卡機 A 還是 B
        String batTarget = System.getProperty(SysPropKey.ROOT_PATH) + "/app/KuoChuanServTrackManagement/program/DataImport";
        String runBatPath = batTarget + "/run.bat";
        String excelName = uploadFile.getOriginalFilename();
        String excelType = excelName.substring(excelName.lastIndexOf("."));
        String datetimestamp = YYYYMMDDHHMMSSSSS.format(System.currentTimeMillis());

        if (!(type.equals("A") || type.equals("B"))) {
            return RequestResult.fail("前端 type 有問題， 應為 A 或 B");
        }

        File targetFolder = new File(System.getProperty(SysPropKey.DATA_PATH),
                FOLDER_NAME + "/" + excelName.substring(0, 4) + "/" + excelName.substring(4, 6) + "/" + type);
        File targetFile = new File(targetFolder, excelName.substring(0, 8) + "_" + datetimestamp + excelType);

        //如果要存 Excel 的 folder 不存在的話 ， 就幫它建
        if (!targetFolder.exists()) {
            targetFolder.mkdirs();
        }
        try {
            // 上傳的檔案存放
            uploadFile.transferTo(targetFile);
        } catch (IOException e) {
            e.printStackTrace();
            return RequestResult.fail("上傳檔案時，儲存發生錯誤!");
        }

        //要跑 bat 的地方

        String [] commands  = new String[]{runBatPath, targetFile.getAbsolutePath(), type, request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString()};
        DataImportCmd cmd = new DataImportCmd.Builder().setCommands(commands)
                                                       .setEnvp(null)
                                                       .setFile(new File(batTarget))
                                                       .build();
        DataImportCmd.ResponseData data = cmd.runCmd();

        if (data.type == 0) {
            return success(data.data);
        } else {
            return fail(data.data);
        }
    }


    public static class DataImportCmd {

        private String [] commands;
        private String [] envp;
        private File file;

        private DataImportCmd(Builder builder) {
            this.commands = builder.commands;
            this.envp = builder.envp;
            this.file = builder.file;

        }



        public static class Builder {
            private String [] commands;
            private String [] envp;
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

        ResponseData runCmd () {

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

            Message(InputStream is){
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
                            System.out.println(line);
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

        static class ResponseData<T>{
            int type;
            T data;

            ResponseData(int type, T data) {
                this.type = type;
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
