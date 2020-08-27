package com.servtech.servcloud.core.controller;

import com.servtech.servcloud.core.util.Language;
import com.servtech.servcloud.core.util.RequestResult;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by Hubert
 * Datetime: 2015/8/7 下午 01:41
 */
@RestController
@RequestMapping("/language")
public class LanguageController {

    @RequestMapping(value = "/check", method = RequestMethod.GET)
    public RequestResult<String> check() {
        return RequestResult.success(Language.eachLangCount());
    }

    @RequestMapping(value = "/refresh", method = RequestMethod.GET)
    public RequestResult<Void> refresh() {
        Language.loadLanguage();
        return RequestResult.success();
    }

}
