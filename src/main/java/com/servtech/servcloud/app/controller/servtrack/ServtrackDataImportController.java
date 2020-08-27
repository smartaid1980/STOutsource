package com.servtech.servcloud.app.controller.servtrack;

import com.google.common.io.Files;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Raynard on 2017/8/3.
 */
@RestController
@RequestMapping("/servtrack/dataimport")
public class ServtrackDataImportController {

    private static final String FOLDER_NAME = "servtrack_data_import";
    private static final SimpleDateFormat YYYYMMDDHHMMSSSSS = new SimpleDateFormat("yyyyMMddHHmmssSSS");

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/download/example", method = GET)
    public void downloadExample(@RequestParam("type") final int type) {

        String filePath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/ServTrackManagement/program/excel_example/" + type + ".xls";

        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
        TypeEnum typeEnum = getType(type);

        System.out.println(typeEnum.getName());

        String mimeType = "application/vnd.ms-excel";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=\" " + sdf.format(new Date()) + "_" + typeEnum.getName() + ".xls";
        response.setContentType(mimeType);
        response.setHeader(headerKey, headerValue);
        try {
            Files.copy(new File(filePath), response.getOutputStream());
        } catch (IOException e) {
            e.printStackTrace();
        }


    }


    @RequestMapping(value = "/upload", method = POST)
    public RequestResult<?> upload(@RequestParam("file") final MultipartFile uploadFile,
                                   @RequestParam("type") final String type,
                                   @RequestParam("lang") final String lang) {

        long nowTimeLong = System.currentTimeMillis();

        String batTarget = System.getProperty(SysPropKey.ROOT_PATH) + "/app/ServTrackManagement/program/DataImport";
        String runBatPath = batTarget + "/run.bat";
        String dateStr = YYYYMMDDHHMMSSSSS.format(nowTimeLong);
        TypeEnum typeEnum = getType(Integer.parseInt(type));

        File targetFolder = new File(System.getProperty(SysPropKey.DATA_PATH),
                FOLDER_NAME + "/" + dateStr.substring(0, 4) + "/" + dateStr.substring(4, 6) + "/" + typeEnum.getName());
        File targetFile = new File(targetFolder, dateStr + ".csv");

        if (!targetFolder.exists()) {
            targetFolder.mkdirs();
        }

        try {
            // 上傳的檔案存放
            uploadFile.transferTo(targetFile);
        } catch (IOException e) {
            e.printStackTrace();
            return fail("上傳檔案時，儲存發生錯誤!");
        }


        //要跑 bat 的地方

        String[] commands = new String[]{runBatPath, targetFile.getAbsolutePath(), type + "", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString(), lang};
        DataImportCmd cmd = new DataImportCmd.Builder().setCommands(commands)
                .setEnvp(null)
                .setFile(new File(batTarget))
                .build();
        DataImportCmd.ResponseData data = cmd.runCmd();
        data.type = Integer.parseInt(type);

        if (data.status == 0) {
            return success(data);
        } else {
            return fail(data);
        }

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


    public static TypeEnum getType(int type) {
        TypeEnum typeEnum = null;
        switch (type) {
            case 0:
                typeEnum = TypeEnum.type0;
                break;
            case 1:
                typeEnum = TypeEnum.type1;
                break;
            case 2:
                typeEnum = TypeEnum.type2;
                break;
            case 3:
                typeEnum = TypeEnum.type3;
                break;
            case 4:
                typeEnum = TypeEnum.type4;
                break;
            case 5:
                typeEnum = TypeEnum.type5;
                break;
            case 6:
                typeEnum = TypeEnum.type6;
                break;
        }

        return typeEnum;
    }


    public enum TypeEnum {

        type0(0, "work_form"), type1(1, "process_ng"), type2(2, "product_op"), type3(3, "line"), type4(4, "line_working_hour"), type5(5, "tracking"), type6(6, "tracking_ng");

        private int type;
        private String name;

        TypeEnum(int type, String name) {
            this.type = type;
            this.name = name;
        }


        public int getType() {
            return type;
        }

        public String getName() {
            return name;
        }

    }

}
