package com.servtech.servcloud.app.controller.equip_line;

import com.google.common.io.Files;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.io.*;

import static com.servtech.servcloud.core.util.RequestResult.*;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Raynard on 2017/1/25.
 * 產線狀態 辣~~
 */


@RestController
@RequestMapping("/equipline")
public class EquipLineController {


  private static final Logger log = LoggerFactory.getLogger(EquipLineController.class);

  @Autowired
  private HttpServletRequest request;

  String folderStr = "equip_line_status";
  String fileName = "line_status.txt";

  @RequestMapping(value = "/setstatus", method = POST)
  public void setStatus(@RequestParam("status") final String status) {

    File lineStatusFile = new File(System.getProperty(SysPropKey.DATA_PATH), "/" + folderStr);
    try {
      if (!lineStatusFile.exists()) {
        lineStatusFile.mkdirs();
      }
      File statusFile = new File(lineStatusFile.getPath(), "/" + fileName);
      if (!statusFile.exists()) {
        statusFile.createNewFile();
      }
      FileWriter fw = new FileWriter(statusFile);
      fw.write(status);
      fw.close();
    } catch (IOException e) {
      log.info(e.getMessage());
      e.printStackTrace();
    }

  }

  @RequestMapping(value = "/getstatus", method = GET)
  public RequestResult<String> getStatus() {

    File lineStatusFile = new File(System.getProperty(SysPropKey.DATA_PATH), "/" + folderStr);
    File statusFile = new File(lineStatusFile.getPath(), "/" + fileName);
    try {
      if (!statusFile.exists()) {
        setStatus("1");
        return success("1");
      } else {
        FileReader fr = new FileReader(statusFile);
        BufferedReader br = new BufferedReader(fr);
        String lineStatus = "";
        String line = "";
        while ((line = br.readLine()) != null) {
          lineStatus += line;
        }
        br.close();
        fr.close();
        return success(lineStatus);
      }
    } catch (FileNotFoundException e1) {
      e1.printStackTrace();
      return fail(e1.getMessage());
    } catch (IOException e2) {
      e2.printStackTrace();
      return fail(e2.getMessage());
    }
  }

  @RequestMapping(value = "/getstatuspng", method = GET, produces = MediaType.IMAGE_PNG_VALUE)
  @ResponseBody
  public byte[] getStatusJpg() throws IOException {

    File lineStatusFile = new File(System.getProperty(SysPropKey.DATA_PATH), "/" + folderStr);
    File statusFile = new File(lineStatusFile.getPath(), "/" + fileName);
    if (!statusFile.exists()) {
      setStatus("1");
      File bg = new File(lineStatusFile, "1.png");
      return Files.toByteArray(bg);
    } else {
      FileReader fr = new FileReader(statusFile);
      BufferedReader br = new BufferedReader(fr);
      String lineStatus = "";
      String line = "";
      while ((line = br.readLine()) != null) {
        lineStatus += line;
      }
      br.close();
      fr.close();
      File bg = new File(lineStatusFile, lineStatus + ".png");
      return Files.toByteArray(bg);
    }
  }

}
