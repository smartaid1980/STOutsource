package com.servtech.servcloud.core.util;

import com.google.common.base.Charsets;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.io.Files;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by Hubert
 * Datetime: 2015/7/10 下午 01:26
 */
public class Language {

    // Map<lang, Map<key, literal>>
    // lang: zh_tw, zh, en, ...
    // key: i18n_blabla...
    // literal: 對應值
    private static Map<String, Map<String, String>> langMap;
    private static int langAmount;

    private static final Logger logger = LoggerFactory.getLogger(Language.class);

    static {
        loadLanguage();
    }

    public static String get(String lang, String key) {
        try {
            String result = langMap.get(lang).get(key);
            return result == null ? key : result;
        } catch (NullPointerException e) {
            return key;
        }
    }

    public static String eachLangCount() {
        String prefixMsg = "語言載入情況: 期望 - " + langAmount + "筆";
        StringBuilder sb = new StringBuilder(prefixMsg);
        for (String lang : langMap.keySet()) {
            sb.append(", ").append(lang).append(" - ").append(langMap.get(lang).size()).append("筆");
        }
        String result = sb.toString();
        if (result.equals(prefixMsg)) {
            return "語言包空空如也...";
        }
        return result;
    }

    public static void loadLanguage() {
        Map<String, Map<String, String>> langMapTemp = Maps.newHashMap();
        List<String> langLines = null;
        int invalidLineAmount = 0;
        Map<Integer, String> langPosMap = Maps.newHashMap();
        List<String> errorMsgList = Lists.newArrayList();

        try {
            langLines = Files.readLines(new File(System.getProperty(SysPropKey.LANG_PATH), "languages.tsv"), Charsets.UTF_8);
            String[] firstLineSplitted = langLines.get(0).split("\t");

            // lang
            for (int i = 1; i < firstLineSplitted.length; i++) {
                String lang = firstLineSplitted[i];
                langMapTemp.put(lang, new HashMap<String, String>());
                langPosMap.put(i, lang);
            }

            // each tag mapping to lang
            for (String langLine : langLines.subList(1, langLines.size())) {
                if (langLine.isEmpty() || langLine.startsWith("#")) {
                    invalidLineAmount++;
                    continue;
                }
                String[] lineSplitted = langLine.split("\t");
                String key = lineSplitted[0];
                if (langPosMap.size() != lineSplitted.length - 1) {
                    logger.warn(key + " 數量異常...");
                }
                for (int i = 1; i < lineSplitted.length; i++) {
                    Map<String, String> langMap = langMapTemp.get(langPosMap.get(i));
                    if (i == 2 && langMap.containsKey(key)) {
                        errorMsgList.add(key + " 重覆了啦...");
                    }
                    langMap.put(key, lineSplitted[i]);
                }
            }
            for (String msg : errorMsgList) {
                logger.warn(msg);
            }
        } catch (IOException e) {
            logger.warn("語言包讀檔發生問題...", e);
        }

        langMap = Collections.unmodifiableMap(langMapTemp);
        langAmount = langLines == null ? 0 : langLines.size() - 1 - invalidLineAmount;
    }

}
