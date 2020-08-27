package com.servtech.servcloud.app.controller.downtime_analysis;

import com.servtech.hippopotamus.Hippo;
import com.servtech.hippopotamus.HippoFactory;
import com.servtech.hippopotamus.SimpleExhaler;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.List;

import static org.springframework.web.bind.annotation.RequestMethod.GET;

/**
 * Created by Raynard on 2017/10/19.
 */

@RestController
@RequestMapping("downtimeanalysis/macroidle")
public class MacroIdleController {

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/getMacro", method = GET)
    public RequestResult<?> getMacro() {
        Hippo hippo = HippoService.getInstance();
        List<String> macroList = hippo.queryIndex("fah_product_work_by_macro");
        return RequestResult.success(macroList);
    }





}
