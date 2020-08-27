package com.servtech.servcloud.core.controller;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.servtech.filemanagement.FileInfo;
import com.servtech.filemanagement.FileManagement;
import com.servtech.filemanagement.FileManagementFactory;
import com.servtech.filemanagement.ActionResult;
import com.servtech.filemanagement.exception.ConnectException;
import com.servtech.filemanagement.impl.DefaultFTPImpl;
import com.servtech.filemanagement.impl.DefaultSSHImpl;
import com.servtech.servcloud.app.model.management.FileManageMachine;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.activation.MimetypesFileTypeMap;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


import java.io.*;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

import static org.springframework.web.bind.annotation.RequestMethod.*;
import static com.servtech.servcloud.core.util.RequestResult.*;

/**
 * Created by Raynard on 2018/2/5.
 */
@RestController
@RequestMapping("/filemanagement")
public class FileManagementController {

    private static final Logger log = LoggerFactory.getLogger(FileManagementController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    private static final Cache<String, FileInfo> FILE_STATUS_CACHE = CacheBuilder
            .newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(30, TimeUnit.MINUTES)
            .build();


    @RequestMapping(value = "/getFileList", method = GET)
    public RequestResult<?> getFileList() {
        try {
            final String machineId = request.getParameter("machine_id");
            final String path = request.getParameter("path") == null? ".": request.getParameter("path");
            String user = request.getParameter("user");
            String password = request.getParameter("password");
            final ConnectionInfo connectionInfo = new ConnectionInfo(machineId);
            if (user != null && password != null) {
                connectionInfo.account = user;
                connectionInfo.password = password;
            }
            FileManagement server = connectionInfo.getServer();
            ActionResult<?> result = server.onnnect();
            if (result.getType() == 0) {
                result = server.getFileList(path);
                if(result.getType() == 0) {
                    List<FileInfo> infoList = (List<FileInfo>)result.getData();
                    server.disconnect();
                    return success(infoList);
                } else {
                    List<FileInfo> infoList = (List<FileInfo>)result.getData();
                    server.disconnect();
                    return fail(infoList);
                }
            } else {
                FileInfo info = new FileInfo();
                info.errorMsg = (String)result.getData();
                List<FileInfo> infoList = new ArrayList<FileInfo>();
                infoList.add(info);
                return fail(infoList);
            }
        } catch (ConnectException e) {
            e.printStackTrace();
            FileInfo info = new FileInfo();
            info.errorMsg = e.getMessage();
            List<FileInfo> infoList = new ArrayList<FileInfo>();
            infoList.add(info);
            return fail(infoList);
        }
    }

    @RequestMapping(value = "/getFileStatus", method = GET)
    public RequestResult<?> getFileStatus(@RequestParam("key") final String key) {
        FileInfo fileInfo = FILE_STATUS_CACHE.asMap().get(key);
        if (fileInfo.isFinish == true) {
            return success();
        } else if (fileInfo.isFinish == false && fileInfo.isError == false) {
            return success("wait");
        } else if (fileInfo.isFinish == false && fileInfo.isError == true) {
            return fail(fileInfo.errorMsg);
        }
        return fail("不明原因, 請連絡系統負責人");
    }

    @RequestMapping(value = "/createFolder", method = GET)
    public RequestResult<String> creteFolder(@RequestParam("path") String path,
                                        @RequestParam("machine_id") final String machineId) {
        String user = request.getParameter("user");
        String password = request.getParameter("password");
        final ConnectionInfo connectionInfo = new ConnectionInfo(machineId);
        if (user != null && password != null) {
            connectionInfo.account = user;
            connectionInfo.password = password;
        }
        final FileManagement server = connectionInfo.getServer();
        ActionResult<String> result = null;
        try {
            result = server.mkdir(path);
            if (result.getType() == 0) {
                return success(result.getData());
            } else {
                return fail(result.getData());
            }
        } catch (ConnectException e) {
            e.printStackTrace();
            return fail(result.getData());
        }
    }

    @RequestMapping(value = "/upload", method = POST)
    public RequestResult<String> upload(@RequestParam("file") final MultipartFile file,
                                   @RequestParam("path") final String path,
                                   @RequestParam("machine_id") final String machineId,
                                   @RequestParam("key") final String key) {
        final String fullPath = path + "/" + file.getOriginalFilename();
        try {
            final InputStream is = file.getInputStream();
            String user = request.getParameter("user");
            String password = request.getParameter("password");
            final ConnectionInfo connectionInfo = new ConnectionInfo(machineId);
            if (user != null && password != null) {
                connectionInfo.account = user;
                connectionInfo.password = password;
            }
            final FileManagement server = connectionInfo.getServer();
            final FileInfo fileInfo = new FileInfo();
            FILE_STATUS_CACHE.put(key, fileInfo);
            new Thread(new Runnable() {
                @Override
                public void run() {
                    try {
                        server.upload(fullPath, is, fileInfo);
                    } catch (ConnectException e) {
                        e.printStackTrace();
                    }
                }
            }).start();
            return success();

        } catch (IOException e) {
            e.printStackTrace();
            return fail("不明原因, 請連絡系統負責人");
        }

    }

    @RequestMapping(value = "/delete", method = GET)
    public RequestResult<String> delete(@RequestParam("path") final String path,
                                   @RequestParam("machine_id") final String machineId) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
        String date8Bits = sdf.format(new Date());
        String user = request.getParameter("user");
        String password = request.getParameter("password");
        final ConnectionInfo connectionInfo = new ConnectionInfo(machineId);
        if (user != null && password != null) {
            connectionInfo.account = user;
            connectionInfo.password = password;
        }
        FileManagement server = connectionInfo.getServer();
        ActionResult<String> result =null;
        try {
            result = server.remove(path);
            File file = new File(SysPropKey.CUST_PARAM_PATH, "/" + machineId + "/" + date8Bits.substring(0, 4) + "/" + date8Bits.substring(4, 6) + ".csv");
            if (!file.getParentFile().exists()) {
                file.getParentFile().mkdirs();
            }
            BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(file, true), StandardCharsets.UTF_8));
            String stUser = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
            String actionStr = date8Bits + " - LoginUser: " + stUser + ", FTPUser: " + user + " |DELETE: " + path + "|";
//            log.info(result.toString());
            if (result.getType() == 0) {
                actionStr += "success";
                bw.write(actionStr);
                bw.close();
                return success();
            } else {
                actionStr += result.getData();
                bw.write(actionStr);
                bw.close();
                return fail(result.getData());
            }
        } catch (ConnectException e) {
            e.printStackTrace();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return fail("不明原因, 請連絡系統負責人");
    }

    @RequestMapping(value = "/download", method = POST)
    public RequestResult<?> download(@RequestParam("path") final String path,
                                     @RequestParam("machine_id") final String machineId) {
        String user = request.getParameter("user");
        String password = request.getParameter("password");
        final ConnectionInfo connectionInfo = new ConnectionInfo(machineId);
        if (user != null && password != null) {
            connectionInfo.account = user;
            connectionInfo.password = password;
        }
        ActionResult<String> result = null;
        FileManagement server = connectionInfo.getServer();
        try {
            String fileName = path.substring(path.lastIndexOf("/") + 1);
            String mimeType = new MimetypesFileTypeMap().getContentType(new File(path));
            String headerKey = "Content-Disposition";
            String headerValue = "attachment; filename=\" " + new String(fileName.getBytes(), "ISO-8859-1") + "\"";
            response.setContentType(mimeType);
            response.setHeader(headerKey, headerValue);
            OutputStream out = response.getOutputStream();
            result = server.download(path, out);

            return success();
        } catch (ConnectException e) {
            e.printStackTrace();
            return fail(result.getData());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return fail("連線 DataServer 失敗， 請確認...");
    }

    static class ConnectionInfo {
        String server_type;
        String ip;
        Integer port;
        String account;
        String password;
        public ConnectionInfo(){}
        public ConnectionInfo(final String machineId) {
            ActiveJdbc.operTx(new Operation<Void>() {
                @Override
                public Void operate() {
                    FileManageMachine fileManageMachine = FileManageMachine.findFirst("machine_id=?", machineId);
                    server_type = fileManageMachine.getString("server_type");
                    ip = fileManageMachine.getString("server_ip");
                    port = fileManageMachine.getInteger("server_port");
                    account = fileManageMachine.getString("account");
                    password = fileManageMachine.getString("password");
                    return null;
                }
            });
        }
        public FileManagement getServer() {
            if (server_type.equals("FANUC")) {
                DefaultFTPImpl ftp = (DefaultFTPImpl)FileManagementFactory.getDefaultFTP();
                ftp.setServerIP(ip);
                ftp.setServerPort(port);
                ftp.setUser(account);
                ftp.setPassword(password);
                return ftp;
            } else if (server_type.equals("SIEMENS")) {
                DefaultSSHImpl ssh = FileManagementFactory.getDefaultSSH();
                ssh.setServerIP(ip);
                ssh.setServerPort(port);
                ssh.setUser(account);
                ssh.setPassword(password);
                return ssh;
            }
            return null;
        }

    }

//    static class FileInfo {
//        String fullPath;
//        String fileName;
//        boolean isDirectory = false;
//    }


}
