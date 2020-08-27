package com.servtech.servcloud.core.mail.modules;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by Eric Peng on 2018/10/26.
 */
public class DataTemplate {
    public Map<String, String> replaceMap = new HashMap<>();
    public Map<String, List<Map<String, String>>> arrMap = new HashMap<>();
}
