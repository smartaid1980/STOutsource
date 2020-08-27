package com.servtech.servcloud.core.controller;

import com.servtech.servcloud.core.initializer.PlatformInitializer;
import com.servtech.servcloud.core.util.RequestResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static com.servtech.servcloud.core.util.RequestResult.*;

/**
 * Created by Raynard on 2018/3/31.
 */
@RestController
@RequestMapping("/ver")
public class VersionController {

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;


    @RequestMapping(method = GET)

    public RequestResult<?> get() {
        String funcId = request.getParameter("funcId");
        if (funcId == null) {
            return success(PlatformInitializer.FUNC_VERSION_MAP);
        } else {
            if (PlatformInitializer.FUNC_VERSION_MAP.containsKey(funcId)) {
                Map<String, String> resultMap = new HashMap<String, String>();
                resultMap.put(funcId, PlatformInitializer.FUNC_VERSION_MAP.get(funcId));
                return success(resultMap);
            } else {
                Map<String, String> resultMap = new HashMap<String, String>();
                resultMap.put(funcId, "N/A");
                return success(resultMap);
            }
        }
    }
}
