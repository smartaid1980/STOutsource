package com.servtech.servcloud.app.controller.dwg_decoder;

import com.google.common.io.Files;
import com.servtech.servcloud.core.exception.JsonParamsException;
import com.servtech.servcloud.core.util.JsonParams;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;

import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Mike Wu on 2018/12/18.
 */
@RestController
@RequestMapping("/dwgdecoder")
public class DWGDecoder {
    private String pathOfConverter;
    private String inputFolder;
    private String outputFolder;
    private String outputVersion;
    private String outputType;
    private String recursiveFlag;
    private String auditFlag;

    @RequestMapping(value = "/dwg2dxf", method = RequestMethod.POST)
    public RequestResult<?> dwg2dxf(@RequestParam("file") MultipartFile file, HttpServletResponse response) throws IOException {
        Boolean isConfigGet = getPathConfig();
        if(!isConfigGet){
            return RequestResult.fail("Something wrong with reading path config...");
        }

        // write .dwg file
        String fileName = file.getOriginalFilename();
        File inputPath = new File(inputFolder, fileName);
        file.transferTo(inputPath);

        // convert .dwg to .dxf
        String[] commands = new String[]{
                pathOfConverter,
                inputFolder,
                outputFolder,
                outputVersion,
                outputType,
                recursiveFlag,
                auditFlag
        };
        RunCmd runCmd = new RunCmd(commands);
        int resultValue = runCmd.execAndReturn();

        // return .dxf file
        if (resultValue == 0) {
            response.setContentType("text/plain");
            OutputStream outputStream = response.getOutputStream();
//            List<String> lines = Files.readLines(new File(outputFolder, fileName.replaceAll(".dwg", ".dxf")), Charset.forName("utf-8"));
//            for(String line : lines){
//                outputStream.write(line.getBytes(Charset.forName("utf-8")));
//                outputStream.write("\\r\\n".getBytes("UTF-8"));
//            }
            outputStream.write(Files.toByteArray(new File(outputFolder, fileName.replaceAll(".dwg", ".dxf"))));
            return success();
        } else {
            return RequestResult.fail("不明失敗原因，請聯絡產品負責人!");
        }
    }

    private  boolean getPathConfig(){
        try {
            JsonParams jsonParams = new JsonParams("dwg_decoder_config.json");
            this.pathOfConverter = jsonParams.getAsString("pathOfConverter");
            this.inputFolder = jsonParams.getAsString("inputFolder");
            this.outputFolder = jsonParams.getAsString("outputFolder");
            this.outputVersion = jsonParams.getAsString("outputVersion");
            this.outputType = jsonParams.getAsString("outputType");
            this.recursiveFlag = jsonParams.getAsString("recursiveFlag");
            this.auditFlag = jsonParams.getAsString("auditFlag");
            return true;
        } catch (JsonParamsException e) {
            e.printStackTrace();
            return false;
        }
    }
}

