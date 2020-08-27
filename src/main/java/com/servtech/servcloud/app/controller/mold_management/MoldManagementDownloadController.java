package com.servtech.servcloud.app.controller.mold_management;

import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;

import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Beata on 2018/7/9.
 */
@RestController
@RequestMapping("/moldmanagement/download")
public class MoldManagementDownloadController {
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/printPDF", method = POST)
    public void printPDF(@RequestParam("mold_id") final String mold_id) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
        String mimeType = "application/pdf";
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=\" " + sdf.format(new Date()) + ".pdf\"";
        try {
            FileInputStream in = new FileInputStream(System.getProperty(SysPropKey.ROOT_PATH) + "/app/moldManagement/data/mold/" + mold_id + ".pdf");
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

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
