package com.servtech.servcloud.app.controller.shengtai_pdf;

import com.servtech.servcloud.app.controller.iiot.IiotFileUploadController;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.nio.channels.FileChannel;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.*;

/**
 * controller
 * Created by kevin on 2020/3/2.
 */

@RestController
@RequestMapping("shengtai/pdf")
public class ShengTaiPDFController {
    @Autowired
    private HttpServletResponse response;
    private static final Logger log = LoggerFactory.getLogger(ShengTaiPDFController.class);

    @RequestMapping(value = "upload", method = RequestMethod.POST)
    public RequestResult<?> upload(@RequestParam("file") MultipartFile file) {
        try {
            String fileAllName = file.getOriginalFilename();
            String fileName = fileAllName.substring(0, fileAllName.lastIndexOf("."));

            String rawdataPath = System.getProperty(SysPropKey.DATA_PATH);
            File saveFile = new File(rawdataPath + "\\pdf\\upload\\" + fileName + ".pdf");
            file.transferTo(saveFile);

            String statusEndPath = rawdataPath + "\\pdf\\status\\" + fileName + ".end";
            File endFile = new File(statusEndPath);
            if(endFile.exists()){
                endFile.delete();
            }

            String statusStartPath = rawdataPath + "\\pdf\\status\\" + fileName + ".start";
            File startFile = new File(statusStartPath);
            if(startFile.exists()){
                startFile.delete();
            }
            FileWriter writeStartFile = new FileWriter(new File(statusStartPath));
            writeStartFile.close();

            String timestampPath = rawdataPath + "\\pdf\\recordTimestamp\\" + fileName + "\\";
            File timestampFolder = new File(timestampPath);
            if (!timestampFolder.exists()) {
                timestampFolder.mkdirs();
            }
            File[] timestamps = timestampFolder.listFiles();
            if(timestamps != null && timestamps.length > 0){
                for(File timestamp : timestamps){
                    timestamp.delete();
                }
            }
            String recordTimestamp = timestampPath + fileName + "@@" + new SimpleDateFormat("yyyyMMddHHmmss").format(new Date(System.currentTimeMillis())) + ".txt";

            FileWriter write = new FileWriter(new File(recordTimestamp));
            write.close();

            String cmdStr = "cmd.exe /c start appendTextToPDF.exe " + fileName + ".pdf";
            String filePath = rawdataPath.substring(0, rawdataPath.lastIndexOf("rawdata")) + "\\program\\AppendPDF";
            log.info("filePaht : " + filePath);
            Runtime.getRuntime().exec(cmdStr, null, new File(filePath));
            return RequestResult.success(new DataImportCmd.ResponseData(0, "success"));
        } catch (IOException e) {
            e.printStackTrace();
            return RequestResult.fail(new DataImportCmd.ResponseData(1, "IO Exception"));
        }
    }

    @RequestMapping(value = "download", method = RequestMethod.GET)
    public RequestResult<?> download(@RequestParam("fileName") String fileName, @RequestParam("language") String language) {
        String filePath = System.getProperty(SysPropKey.DATA_PATH) + "/pdf/download/" + language + "/" + fileName + ".pdf";
        log.info("filePath : " + filePath);
        File file = new File(filePath);
        String mimeType = "application/pdf";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=\" " + fileName + ".pdf\"";
        if (file.exists()) {
            try {
                FileInputStream in = new FileInputStream(file);
                response.setContentType(mimeType);
                response.setHeader(headerKey, headerValue);
                ServletOutputStream out = response.getOutputStream();
                byte[] bytes = new byte[1024];
                int byteSize;
                while ((byteSize = in.read(bytes)) != -1) {
                    out.write(bytes, 0, byteSize);
                }
                out.flush();
                out.close();
                in.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return RequestResult.success();
    }

    @RequestMapping(value = "check_status", method = RequestMethod.GET)
    public RequestResult<?> checkStatus() {
        String statusPath = System.getProperty(SysPropKey.DATA_PATH) + "/pdf/status";
        log.info("statusPath : " + statusPath);
        File path = new File(statusPath);
        List<String> complete = new ArrayList<>();
        List<String> withoutEnd = new ArrayList<>();
        Map<String, List<String>> result = new HashMap<>();
        if (path.isDirectory()) {
            File[] fileList = path.listFiles();
            if (fileList == null || fileList.length == 0)
                return RequestResult.success(result);
            for (int i = 0; i < fileList.length; i++) {
                String fileAllName = fileList[i].getName();
                String fileName = fileAllName.substring(0, fileAllName.lastIndexOf("."));
                String extension = fileAllName.substring(fileAllName.lastIndexOf(".") + 1, fileAllName.length());

                if (extension.equals("end")) {
                    complete.add(fileName);
                    if (withoutEnd.contains(fileName)) {
                        withoutEnd.remove(fileName);
                    }
                } else {
                    if (!complete.contains(fileName)) {
                        withoutEnd.add(fileName);
                    }
                }
            }
            result.put("complete", addTimestamp(complete));
            result.put("withoutEnd", addTimestamp(withoutEnd));
        }
        return RequestResult.success(result);
    }

    private List<String> addTimestamp(List<String> fileNameList) {
        List<String> result = new ArrayList<>();
        for(String fileName : fileNameList){
            String timestampPath = System.getProperty(SysPropKey.DATA_PATH) + "\\pdf\\recordTimestamp\\" + fileName + "\\";
            System.out.println("timestampPath : " +timestampPath);
            File[] files = new File(timestampPath).listFiles();
            System.out.println("files.length : " +files.length);
            if(files != null && files.length > 0){
                System.out.println("files[0].getName() : " + files[0].getName());
                result.add(files[0].getName());
            }
        }
        return result;
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
