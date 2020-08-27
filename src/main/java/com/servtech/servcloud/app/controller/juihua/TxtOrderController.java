package com.servtech.servcloud.app.controller.juihua;

import com.google.common.base.Charsets;
import com.google.common.collect.Lists;
import com.google.common.io.Files;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.nio.charset.Charset;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Created by Hubert
 * Datetime: 2015/11/3 下午 01:41
 */

@RestController
@RequestMapping("/juihua/txtOrder")
public class TxtOrderController {
    private static final Logger log = LoggerFactory.getLogger(TxtOrderController.class);
    private static final String JUIHUA_TXT_ORDER = "juihua_txt_order";
    private static final Charset MS950 = Charset.forName("MS950");
    public static final String JUIHUA_ORDER_OUTPUT = "juihua_order_output";

    @RequestMapping(value = "upload", method = RequestMethod.POST)
    public RequestResult<?> upload(@RequestParam("file") MultipartFile file,
                                   @RequestParam("startDate") String startDate,
                                   @RequestParam("endDate") String endDate) throws IOException {
        String tspFileFolder = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date());
        File juihuaTxtOrderDir = new File(System.getProperty(SysPropKey.DATA_PATH), JUIHUA_TXT_ORDER + "/" + tspFileFolder);
        File juihuaTxtOrderFile = new File(juihuaTxtOrderDir, file.getOriginalFilename());
        if (!juihuaTxtOrderFile.exists()) {
            Files.createParentDirs(juihuaTxtOrderFile);
        }

        file.transferTo(juihuaTxtOrderFile);

        String runBatPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/Juihua/program/runTranslator.bat";
        String deliverDayConfigPath = System.getProperty(SysPropKey.ROOT_PATH) + "/app/Juihua/program/deliverDay.json";
        String[] commands = new String[]{
                new File(runBatPath).getAbsolutePath(),
                juihuaTxtOrderFile.getAbsolutePath(),
                juihuaTxtOrderDir.getAbsolutePath(),
                startDate,
                endDate,
                new File(deliverDayConfigPath).getAbsolutePath(),
                new File(System.getProperty(SysPropKey.DATA_PATH), JUIHUA_ORDER_OUTPUT).getAbsolutePath(),
                startDate.substring(0, 7)
            };
        RunCmd runCmd = new RunCmd(commands, null, new File(System.getProperty(SysPropKey.ROOT_PATH) + "/app/Juihua/program"));
        int resultValue = runCmd.execAndReturn();

        if (resultValue == 0) {
            UploadResult uploadResult = new UploadResult();
            uploadResult.timestamp = tspFileFolder;
            uploadResult.fileName = file.getOriginalFilename();
            uploadResult.message = Files.toString(new File(juihuaTxtOrderDir, "0"), Charsets.UTF_8);
            return RequestResult.success(uploadResult);

        } else {
            File errorMessageFile = new File(juihuaTxtOrderDir, "" + resultValue);
            if (errorMessageFile.exists()) {
                return RequestResult.fail(Files.toString(errorMessageFile, Charsets.UTF_8));
            } else {
                return RequestResult.fail("不明失敗原因，請聯絡產品負責人!");
            }
        }
    }

    @RequestMapping(value = "download", method = RequestMethod.POST)
    public void download(@RequestParam("timestamp") String timestamp,
                         @RequestParam("fileType") String fileType, HttpServletResponse response) throws IOException {
        if (fileType.equals("csv")) {
            File fileDir = new File(System.getProperty(SysPropKey.DATA_PATH), JUIHUA_TXT_ORDER + "/" + timestamp + "/erp_po");
            File[] files = fileDir.listFiles();

            String mimeType = "text/plain";
            String headerKey = "Content-Disposition";
            String headerValue = "attachment; filename=\"erp_po.csv\"";
            response.setContentType(mimeType);
            response.setHeader(headerKey, headerValue);

            List<String> result = mergeErpPo(Arrays.asList(files));

            String lineSep = System.getProperty("line.separator");
            OutputStream outputStream = response.getOutputStream();
            for (String line : result) {
                outputStream.write(line.getBytes(MS950));
                outputStream.write(lineSep.getBytes(MS950));
            }
        }

        if (fileType.equals("excel")) {
            File fileDir = new File(System.getProperty(SysPropKey.DATA_PATH), JUIHUA_TXT_ORDER + "/" + timestamp + "/planning_of_month");
            File[] files = fileDir.listFiles();

            // 超過一個檔案就壓縮
            if (files != null && files.length > 1) {
                String mimeType = "application/octect-stream";
                String headerKey = "Content-Disposition";
                String headerValue = "attachment; filename=\"planning_of_month.zip\"";
                response.setContentType(mimeType);
                response.setHeader(headerKey, headerValue);

                ZipOutputStream zipOutputStream = new ZipOutputStream(response.getOutputStream());
                for (File file : files) {
                    zipFile(zipOutputStream, new BufferedInputStream(new FileInputStream(file)), file.getName());
                }
                zipOutputStream.close();

            // 只有一個檔案就直接給他不用壓縮
            } else if (files != null && files.length == 1) {
                String mimeType = "application/octect-stream";
                String headerKey = "Content-Disposition";
                String headerValue = "attachment; filename=\"planning_of_month.xlsx\"";
                response.setContentType(mimeType);
                response.setHeader(headerKey, headerValue);

                Files.copy(files[0], response.getOutputStream());

            } else {
                log.warn(fileDir.getAbsolutePath() + " 沒檔案...");
            }
        }

    }

    @RequestMapping(value = "downloadAll", method = RequestMethod.POST)
    public void donwloadAll(@RequestParam("tspSplittedByComma") String tspSplittedByComma, HttpServletResponse response) throws IOException {
        String mimeType = "application/octect-stream";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=\"all_in_one.zip\"";
        response.setContentType(mimeType);
        response.setHeader(headerKey, headerValue);

        ZipOutputStream zipOutputStream = new ZipOutputStream(response.getOutputStream());

        String[] tspFolders = tspSplittedByComma.split(",");

        // ERP_PO.csv 合併後壓入 zip
        List<File> erpPoFiles = getAllFile(tspFolders, "erp_po");
        List<String> erpPoContentLines = mergeErpPo(erpPoFiles);
        StringBuilder sb = new StringBuilder();
        String lineSep = System.getProperty("line.separator");
        for (String line : erpPoContentLines) {
            sb.append(line).append(lineSep);
        }
        ByteArrayInputStream bais = new ByteArrayInputStream(sb.toString().getBytes(MS950));
        zipFile(zipOutputStream, bais, "ERP_PO.csv");

        // 月計畫.xlsx 每個檔案直接壓入 zip
        List<File> planningOfMonthFiles = getAllFile(tspFolders, "planning_of_month");
        for (File file : planningOfMonthFiles) {
            zipFile(zipOutputStream, new BufferedInputStream(new FileInputStream(file)), file.getName());
        }

        zipOutputStream.close();
    }

    private void zipFile(ZipOutputStream zos, InputStream is, String entryName) throws IOException {
        ZipEntry zipEntry = new ZipEntry(entryName);
        zos.putNextEntry(zipEntry);
        int l;
        byte[] buf = new byte[1024];
        while ((l = is.read(buf)) > 0) {
            zos.write(buf, 0, l);
        }
        is.close();
        zos.closeEntry();
    }

    private List<File> getAllFile(String[] tspFolders, String targetFolder) {
        List<File> result = Lists.newArrayList();
        for (String tspFolder : tspFolders) {
            File fileDir = new File(System.getProperty(SysPropKey.DATA_PATH), JUIHUA_TXT_ORDER + "/" + tspFolder + "/" + targetFolder);
            result.addAll(Arrays.asList(fileDir.listFiles()));
        }
        return result;
    }

    private List<String> mergeErpPo(List<File> erpPoFiles) throws IOException {
        List<String> result = Lists.newArrayList();
        boolean isFirstFile = true;
        for (File file : erpPoFiles) {
            List<String> fileLines = Files.readLines(file, MS950);

            if (fileLines.size() > 1) {
                // 第一個檔案才要保留標頭
                if (!isFirstFile) {
                    fileLines = fileLines.subList(1, fileLines.size());
                }
                isFirstFile = false;
                result.addAll(fileLines);
            }
        }
        return result;
    }

    public static class UploadResult {
        String timestamp;
        String fileName;
        String message;
    }

}
