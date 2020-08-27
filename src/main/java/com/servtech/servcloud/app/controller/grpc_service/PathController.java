package com.servtech.servcloud.app.controller.grpc_service;

import com.servtech.common.file.Files;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.util.Map;

/**
 * Created by Raynard on 2017/5/19.
 */

@RestController
@RequestMapping("/path")
public class PathController {

    @RequestMapping(value = "/getdatapath", method = RequestMethod.GET)
    public RequestResult<String> getDataPath() {

        return RequestResult.success(System.getProperty(SysPropKey.DATA_PATH));
    }

    @RequestMapping(value = "/getrootpath", method = RequestMethod.GET)
    public RequestResult<String> getRootPath() {

        return RequestResult.success(System.getProperty(SysPropKey.ROOT_PATH));
    }
}
