package com.servtech.servcloud.app.controller.alarm_clear;

import com.google.common.io.Files;
import com.servtech.servcloud.app.model.alarm_clear.AlarmClearFile;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.model.DbMaxIndex;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static com.servtech.servcloud.core.util.SysPropKey.DATA_PATH;
import static com.servtech.servcloud.core.util.SysPropKey.WEB_ROOT_PATH;
import static org.springframework.web.bind.annotation.RequestMethod.DELETE;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Kevin Big Big on 2016/5/4.
 */

@RestController
@RequestMapping("/alarmclear/file")
public class AlarmClearFileController {
    private static final Logger log = LoggerFactory.getLogger(AlarmClearFileController.class);

    private static final int UPLOAD_FILE_SUCCESS = 0;
    private static final int FILE_EXIST = 1;

    private static final String PLATFORM_MEDIA_DIR = "PLATFORM_MEDIA";//多一層platform media，因為直接放在平台內，不小心手殘刪掉就完蛋了
    private static final String ALARM_COLEAR_FILE_DIR = "alarm_clear_file";//故障排除上傳的檔案都存到該目錄

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                return success(AlarmClearFile.findAll().toMaps());
            }
        });
    }

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(
            @RequestParam("fileName") final String fileName,
            @RequestParam("fileDesc") final String fileDesc,
            @RequestParam("file") final MultipartFile file) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    Map data = new HashMap();
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    int maxIndex;
                    DbMaxIndex dbMaxIndex = DbMaxIndex.findById("a_alarm_clear_file");
                    if(dbMaxIndex.exists()){
                        maxIndex = dbMaxIndex.getInteger("max_index") + 1;
                    }else{
                        return fail("create fail..., table db_max_index not set a_alarm_clear_file max_index");
                    }
                    //web儲存路徑
                    String webRootPath =  getWebRootPath();
                    //使用maxIndex和副檔名組出完整檔名
                    String saveFileName = String.format("%010d", maxIndex) + fileName.substring(fileName.lastIndexOf('.'), fileName.length());//取附檔名
                    //設定要拿取的路徑
                    String fileInWebRootPath = webRootPath + saveFileName;

                    data.put("file_id", String.format("%010d", maxIndex));
                    data.put("file_name", fileName);
                    data.put("file_desc", fileDesc);
                    data.put("file_path", fileInWebRootPath.replaceAll("\\\\", "/"));//因為反斜線再前端使用src拿時會有問題，所以改成斜線

                    AlarmClearFile alarmClearFile = new AlarmClearFile();
                    alarmClearFile.fromMap(data);
                    if (alarmClearFile.insert()) {
                        try {
                            int uploadResult = uploadFile(saveFileName, file);
                            switch (uploadResult){
                                case UPLOAD_FILE_SUCCESS:
                                    //成功: 更新max_index，因為已經新增成功了，index也必須+1才可以
                                    DbMaxIndex updateDbMaxIndex = DbMaxIndex.findById("a_alarm_clear_file");
                                    updateDbMaxIndex.set("max_index", maxIndex)
                                            .set("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY))
                                            .set("modify_time", new Timestamp(System.currentTimeMillis()));
                                    //System.out.println(updateDbMaxIndex.get("table_name"));
                                    //System.out.println(updateDbMaxIndex.get("max_index"));
                                    if(updateDbMaxIndex.saveIt()){
                                        return success();
                                    }else{
                                        return fail("update db_max_index fail... (table_name: a_alarm_clear_file)");
                                    }
                                case FILE_EXIST:
                                    return fail("File already exists");
                            }
                            return success();
                        } catch (Exception e) {
                            e.printStackTrace();
                            log.warn("create file: upload training file exception: {}", e.getMessage());
                            return fail(e.getMessage());
                        }
                    } else {
                        return fail("create fail...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    //更新，但是沒有上傳檔案，只有修改說明
    @RequestMapping(value = "/updateButNotUpload", method = POST)
    public RequestResult<String> updateButNotUpload(
            @RequestParam("fileId") final String fileId,
            @RequestParam("fileDesc") final String fileDesc) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    AlarmClearFile alarmClearFile = AlarmClearFile.findById(fileId);
                    if (!alarmClearFile.exists()) {
                        return fail("update fail..., a_alarm_clear_file id not exist: " + fileId);
                    }
                    alarmClearFile.set("file_desc", fileDesc)
                            .set("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY))
                            .set("modify_time", new Timestamp(System.currentTimeMillis()));
                    if(alarmClearFile.saveIt()){
                        return success();
                    }else{
                        return fail("update fail..., id: " + fileId);
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/update", method = POST)
    public RequestResult<String> update(
            @RequestParam("fileId") final String fileId,
            @RequestParam("fileName") final String fileName,
            @RequestParam("fileDesc") final String fileDesc,
            @RequestParam("file") final MultipartFile file) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    AlarmClearFile alarmClearFile = AlarmClearFile.findById(fileId);
                    if (!alarmClearFile.exists()) {
                        return fail("update fail..., a_alarm_clear_file id not exist: " + fileId);
                    }
                    String filePath = alarmClearFile.getString("file_path");
                    String oldFilePathInWebRootPath = filePath.replace(getWebRootPath().replaceAll("\\\\", "/"), getWebRootAbsolutePath() + File.separator);
                    String oldFilePathInDataPath = filePath.replace(getWebRootPath().replaceAll("\\\\", "/"), dataRootAbsolutePath() + File.separator);
                    //System.out.println("***" + filePath);
                    //System.out.println("+++" + oldFilePathInWebRootPath);
                    //System.out.println("---" + oldFilePathInDataPath);
                    /*刪除舊的*/
                    File oldFileInWebRootPath = new File(oldFilePathInWebRootPath);
                    if (oldFileInWebRootPath.exists()) {
                        log.info("*** update: 1 step delete old file (web): {}", oldFileInWebRootPath.getAbsoluteFile());
                        oldFileInWebRootPath.delete();
                    }
                    File oldFileInDataPath = new File(oldFilePathInDataPath);
                    if (oldFileInDataPath.exists()) {
                        log.info("*** update: 2 step delete old file (data): {}", oldFileInDataPath.getAbsoluteFile());
                        oldFileInDataPath.delete();
                    }

                     /*建立新的*/
                    //web儲存路徑
                    String webRootPath = getWebRootPath();
                    //使用maxIndex和副檔名組出完整檔名
                    String saveFileName = alarmClearFile.getId().toString() + fileName.substring(fileName.lastIndexOf('.'), fileName.length());//取附檔名
                    //設定要拿取的路徑
                    String fileInWebRootPath = webRootPath + saveFileName;

                    alarmClearFile.set("file_name", fileName)
                            .set("file_desc", fileDesc)
                            .set("file_path", fileInWebRootPath.replaceAll("\\\\", "/"))//因為反斜線再前端使用src拿時會有問題，所以改成斜線
                            .set("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY))
                            .set("modify_time", new Timestamp(System.currentTimeMillis()));

                    if (alarmClearFile.saveIt()) {
                        try {
                            int uploadResult = uploadFile(saveFileName, file);
                            switch (uploadResult) {
                                case UPLOAD_FILE_SUCCESS:
                                    return success();
                                case FILE_EXIST:
                                    return fail("File already exists");
                            }
                            return success();
                        } catch (Exception e) {
                            e.printStackTrace();
                            log.warn("create file: upload training file exception: {}", e.getMessage());
                            return fail(e.getMessage());
                        }
                    } else {
                        return fail("create fail...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value ="/delete", method = DELETE)
    public RequestResult<String> delete(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                String fileId = data.get("fileId").toString();
                System.out.println("*** delete " + fileId);
                AlarmClearFile alarmClearFile = AlarmClearFile.findById(fileId);
                if (!alarmClearFile.exists()) {
                    return fail("delete fail..., a_alarm_clear_file id not exist: " + fileId);
                }
                String filePath = alarmClearFile.getString("file_path");
                String oldFilePathInWebRootPath = filePath.replace(getWebRootPath().replaceAll("\\\\", "/"), getWebRootAbsolutePath() + File.separator);
                String oldFilePathInDataPath = filePath.replace(getWebRootPath().replaceAll("\\\\", "/"), dataRootAbsolutePath() + File.separator);
                //System.out.println("***" + filePath);
                //System.out.println("+++" + oldFilePathInWebRootPath);
                //System.out.println("---" + oldFilePathInDataPath);
                /*刪除舊的*/
                File oldFileInWebRootPath = new File(oldFilePathInWebRootPath);
                if (oldFileInWebRootPath.exists()) {
                    log.info("*** delete old file (web): {}", oldFileInWebRootPath.getAbsoluteFile());
                    oldFileInWebRootPath.delete();
                }
                File oldFileInDataPath = new File(oldFilePathInDataPath);
                if (oldFileInDataPath.exists()) {
                    log.info("*** delete old file (data): {}", oldFileInDataPath.getAbsoluteFile());
                    oldFileInDataPath.delete();
                }
                //刪除db內的
                if (alarmClearFile.delete()) {
                    return success();
                } else {
                    return fail("delete fail id: " + fileId);
                }
            }
        });
    }

    //upload file時，需要多複製一份檔案到webapps中，因為讀影片時，只能透過http://，而無法使用file://讀取src
    private int uploadFile(String fileName, MultipartFile uploadFile) throws IOException {
        String dataRootPath = dataRootAbsolutePath();
        //多複製一份到webapps中
        String webRootPath = getWebRootAbsolutePath();
        //要儲存資料的路徑
        File dataRootPathDir = new File(dataRootPath);
        if(!dataRootPathDir.exists()){
            dataRootPathDir.mkdirs();
        }
        File webRootPathDir = new File(webRootPath);
        if(!webRootPathDir.exists()){
            webRootPathDir.mkdirs();
        }

        File fileInData = new File(dataRootPath, fileName);
        if(fileInData.exists()){
            return FILE_EXIST;
        }
        log.info("*** (data) upload file to {}", fileInData.getAbsolutePath());
        fileInData.createNewFile();
        uploadFile.transferTo(fileInData);

        File fileInWebPath = new File(webRootPath, fileName);
        log.info("*** (web) upload file to {}", fileInWebPath.getAbsolutePath());
        fileInWebPath.createNewFile();
        Files.copy(fileInData, fileInWebPath);//複製一份到web可以讀的地方
        //uploadFile.transferTo(fileInWebPath);

        return UPLOAD_FILE_SUCCESS;
    }

    private String getWebRootAbsolutePath(){//給後端取得file路徑
        return System.getProperty(WEB_ROOT_PATH) + File.separator + PLATFORM_MEDIA_DIR + File.separator + ALARM_COLEAR_FILE_DIR + File.separator;
    }

    private String getWebRootPath(){//給前端web看
        return File.separator + PLATFORM_MEDIA_DIR + File.separator + ALARM_COLEAR_FILE_DIR + File.separator;
    }

    private String dataRootAbsolutePath(){//平台儲存檔案的位置
        return System.getProperty(DATA_PATH) + File.separator + ALARM_COLEAR_FILE_DIR + File.separator;
    }
}
