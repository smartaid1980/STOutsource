package com.servtech.servcloud.app.controller.superpcb;

import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.web.bind.annotation.RequestMethod.GET;

@RestController
@RequestMapping("/superpcb/history")
public class HistoryDataController {

    private static final Logger log = LoggerFactory.getLogger(HistoryDataController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = GET)
    public RequestResult<?> get() {

        String machineId = request.getParameter("machine_id");
        if (machineId == null) {
            return RequestResult.success(Collections.EMPTY_MAP);
        } else {
            String fileName = System.getProperty(SysPropKey.DATA_PATH) + File.separator + "history_data" + File.separator + machineId + File.separator + "data.csv";
            if (Files.exists(Paths.get(fileName))) {
                try (BufferedReader br = Files.newBufferedReader(Paths.get(fileName))) {
                    List<String> list = br.lines().collect(Collectors.toList());
                    if (list.size() >= 2) {
                        String[] headers = list.get(0).split("\\|");
                        String[] datas = list.get(1).split("\\|");
                        Map<String, String> resultMap = new HashMap<>();
                        int headLen = headers.length;
                        for (int len = 0; len < headLen; len++) {
                            resultMap.put(headers[len], datas[len] == null? "---" : datas[len]);
                        }
                        return RequestResult.success(resultMap);
                    } else {
                        return RequestResult.success(Collections.EMPTY_MAP);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                    return RequestResult.fail(Collections.EMPTY_MAP);
                }
            } else {
                return RequestResult.success(Collections.EMPTY_MAP);
            }
        }
    }
}
