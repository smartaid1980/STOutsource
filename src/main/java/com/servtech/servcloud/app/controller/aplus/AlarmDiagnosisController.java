package com.servtech.servcloud.app.controller.aplus;

import au.com.bytecode.opencsv.CSVReader;
import com.google.common.base.Charsets;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.io.Files;
import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import com.servtech.servcloud.app.model.aplus.AAplusAlarmLog;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.mqtt.CacheBean;
import com.servtech.servcloud.core.mqtt.DeviceStatusObserver;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.script.*;
import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.lang.reflect.Type;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.GET;

@RestController
@RequestMapping("/aplus/alarmdiagnosis")
public class AlarmDiagnosisController implements DeviceStatusObserver {
    private static final Logger log = LoggerFactory.getLogger(AlarmDiagnosisController.class);
    private static final String CUST_PARAM_APLUS_TEMP_DIR_PATH = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/a_plus/template";
    private static final String CUST_PARAM_APLUS_RULE_FILE_PATH = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/a_plus/diagnosis/rule.csv";
    private static final String CUST_PARAM_APLUS_RULE_TEMP_FILE_PATH = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/a_plus/diagnosis/rule_temp.csv";
    private static final String CUST_PARAM_APLUS_RULE_TEMP_TRANSFORM_FILE_PATH = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/a_plus/diagnosis/rule_temp_transform.csv";
    private static final String CUST_PARAM_APLUS_RULE_TRANSFORM_FILE_PATH = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/a_plus/diagnosis/rule_transform.csv";


    private static final ScriptEngineManager JS_FACTORY = new ScriptEngineManager();
    private static final ScriptEngine JS_ENGINE = JS_FACTORY.getEngineByName("JavaScript");
    private static final String NEW_LINE = "\r\n";
    private static final String RULE_SPLIT_SYMBOL = "@@@";
    private static final String CSV_SPLIT_SYMBOL = ",";
    private static final int DEFAULT_MAX_PARAM_LENGTH = 20000;//預設值這麼大是因為A+的參數有1000多，所以使用兩倍大來cover避免未來又加長參數造成exception

    private static final CopyOnWriteArrayList<String> EXEC_TIMES = new CopyOnWriteArrayList<String>();

    //因為要記錄log的關係，所以只有alarm第一次發生時要記錄，此set用來比對前次alarm是否已經存在過
    private static Set<String> PRE_ALARM_SET = new HashSet<String>();

    private static final Cache<String, AlarmMsg> cache =
            CacheBuilder.newBuilder()
                    .expireAfterWrite(10, TimeUnit.SECONDS)//創件或替換後多少時間後被移除　//TimeUnit.SECONDS
                    .build();
    //Map<machineId, 紀錄最新的十筆資料>
    private static final ConcurrentHashMap<String, String[][]> MACHINE_TOP_TEN_VAL_MAPPING = new ConcurrentHashMap<String, String[][]>();
    //Map<machineId, 由規則建成的js檔>
    private static final ConcurrentHashMap<String, String> MACHINE_JS_RULE_MAPPING = new ConcurrentHashMap<String, String>();
    //Map<machineId, Map<paramKey, paramIndex>>
    private static final ConcurrentHashMap<String, Map<String, Integer>> MACHINE_PARAM_MAPPING = new ConcurrentHashMap<String, Map<String, Integer>>();
    //Map<machineId, Map<paramIndex, paramKey>>
    private static final ConcurrentHashMap<String, Map<Integer, String>> MACHINE_PARAM_ORI_MAPPING = new ConcurrentHashMap<String, Map<Integer, String>>();
    //Map<alarmId + RULE_SPLIT_SYMBOL + machineId, DiagnosisRule>
    private static final ConcurrentHashMap<String, DiagnosisRule> DIAGNOSIS_RULE_MAP = new ConcurrentHashMap<String, DiagnosisRule>();
    private static final ConcurrentHashMap<String, Integer> MACHINE_MAX_PARAM_MAP = new ConcurrentHashMap<String, Integer>();

    private static final List<DiagnosisRule> DIAGNOSIS_RULES = new ArrayList<DiagnosisRule>();
    private static boolean hasInitDiagnosisRule = false;

    private static final HashMap<String, String> OPERATOR_REPLACE_MAPPING;
    private static final HashMap<String, String> OPERATOR_ORI_REPLACE_MAPPING;

    static{
        OPERATOR_REPLACE_MAPPING = new HashMap<String, String>();
        OPERATOR_REPLACE_MAPPING.put("<>", "  !=  ");
        OPERATOR_REPLACE_MAPPING.put("and", "  &&  ");
        OPERATOR_REPLACE_MAPPING.put("or", "  ||  ");
        OPERATOR_REPLACE_MAPPING.put("not", "  !  ");

        OPERATOR_ORI_REPLACE_MAPPING = new HashMap<String, String>();
        OPERATOR_ORI_REPLACE_MAPPING.put("  !=  ", "<>");
        OPERATOR_ORI_REPLACE_MAPPING.put("  &&  ", "and");
        OPERATOR_ORI_REPLACE_MAPPING.put("  ||  ", "or");
        OPERATOR_ORI_REPLACE_MAPPING.put("  !  ", "not");
    }

    //TODO test
    //private static final String TEST_FILE_PATH = "C:/F/APLUS/rule.csv";
    //private static final String TEST_FILE_PATH2 = "C:/D/Setup/cust_param/a_plus/template";

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value ="/getExecTimes", method = GET)
    public RequestResult<?> getExecTimes() {
        return RequestResult.success(EXEC_TIMES);
    }

    @RequestMapping(value ="/getMaxParamMap", method = GET)
    public RequestResult<?> getMaxParamMap() {
        return RequestResult.success(MACHINE_MAX_PARAM_MAP);
    }

    @RequestMapping(value ="/getTopTenMap", method = GET)
    public RequestResult<?> getTopTenMap() {
        return RequestResult.success(MACHINE_TOP_TEN_VAL_MAPPING);
    }

    @RequestMapping(value ="/getAlarm", method = GET)
    public RequestResult<Map> getAlarm() {
        return RequestResult.success((Map) cache.asMap());
    }

    @RequestMapping(value ="/reloadDiagnosisRule", method = GET)
    public RequestResult<?> reloadDiagnosisRule() {
        RequestResult<String> rule = buildRuleFile();
        writeRuleFile(CUST_PARAM_APLUS_RULE_TEMP_FILE_PATH, rule.getData());
        List<ErrorMsg> ruleFileErrorMsgs = ruleFileErrorMsgs();
        if(ruleFileErrorMsgs.isEmpty()){
            writeRuleFile(CUST_PARAM_APLUS_RULE_FILE_PATH, rule.getData());
            initDiagnosisRule(CUST_PARAM_APLUS_RULE_FILE_PATH);
            initParamMapping(CUST_PARAM_APLUS_TEMP_DIR_PATH);
            initBuildJsRule();
            return RequestResult.success();
        }else{
            return RequestResult.fail(ruleFileErrorMsgs);
        }
    }

    @RequestMapping(value ="/readTypeSelectsByMachineTempFiles", method = GET)
    public RequestResult<?> readTypeSelectsByMachineTempFiles() {
        String filePath = CUST_PARAM_APLUS_TEMP_DIR_PATH;
        Map<String, Map<String, List<String>>> result = new HashMap<String, Map<String, List<String>>>();
        try {
            File file = new File(filePath);
            if(file.exists()){
                String[] machineCsvs = file.list();
                for(String machineCsv:machineCsvs){
                    File machineCsvFile = new File(filePath, machineCsv);
                    CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(machineCsvFile), Charsets.UTF_8), CSV_SPLIT_SYMBOL.charAt(0));
                    List<Map<String, String>> paramMap = parseMachineCsv(reader.readAll());
                    String machineId = machineCsv.replace(".csv", "");
                    for(Map<String, String> param:paramMap){
                        if(param.containsKey("訊號類別") && param.containsKey("name")){
                            if(!result.containsKey(machineId)){
                                result.put(machineId, new HashMap<String, List<String>>());
                            }
                            if(!result.get(machineId).containsKey(param.get("訊號類別"))){
                                result.get(machineId).put(param.get("訊號類別"), new ArrayList<String>());
                            }
                            //String id = "{" + parseToHex(param.get("id")) + "}";
                            String name = "{" + param.get("name") + "}";
                            result.get(machineId).get(param.get("訊號類別")).add(name);
                        }
                    }
                }
            }else{
                log.warn("initParamMapping: {} not exist!", filePath);
            }

        } catch (IOException e) {
            log.warn("initParamMapping: {}", e);
        }
        return success(result);
    }

    @Override
    public void onMessage(Object data) {
        if(!hasInitDiagnosisRule){
            hasInitDiagnosisRule = true;
            log.info("a plus rule path: {}", CUST_PARAM_APLUS_RULE_FILE_PATH);
            log.info("a plus temp path: {}", CUST_PARAM_APLUS_TEMP_DIR_PATH);
            initDiagnosisRule(CUST_PARAM_APLUS_RULE_FILE_PATH);
            initParamMapping(CUST_PARAM_APLUS_TEMP_DIR_PATH);
            initBuildJsRule();
        }

        CacheBean cacheBean = (CacheBean) data;
        String gPmctDatas = parseGPmctFromDeviceStatus(cacheBean.asJson());
        if(gPmctDatas != null){
            StringBuilder logExecTime = new StringBuilder();
            long startTime = System.currentTimeMillis();
            String[][] matrix = new Gson().fromJson(gPmctDatas, String[][].class);
            Map<String, GPmct> gPmctMap = new HashMap<String, GPmct>();
            for(String[] keyAndValue:matrix){
                String machineId = keyAndValue[0];
                String values = keyAndValue[1];
                gPmctMap.put(machineId, new GPmct(machineId, values));
            }
            logExecTime.append("init data: ").append(System.currentTimeMillis() - startTime).append(", ");
            updateTopTenVal(gPmctMap);
            logExecTime.append("update matrix: ").append(System.currentTimeMillis() - startTime).append(", ");
            diagnosis();
            logExecTime.append("diagnosis: ").append(System.currentTimeMillis() - startTime);
            //EXEC_TIMES.add(logExecTime.toString());
            log.info("logExecTime: {}", logExecTime.toString());
        }
    }

    private void updateTopTenVal(Map<String, GPmct> gPmctMap){
        for(String machineId:gPmctMap.keySet()){
            if(!MACHINE_TOP_TEN_VAL_MAPPING.containsKey(machineId)){
                if(MACHINE_MAX_PARAM_MAP.containsKey(machineId)){
                    MACHINE_TOP_TEN_VAL_MAPPING.put(machineId, new String[MACHINE_MAX_PARAM_MAP.get(machineId) + 1][10]);//+1是因為index + 1後才是個數，不然會少一碼
                }else{
                    MACHINE_TOP_TEN_VAL_MAPPING.put(machineId, new String[DEFAULT_MAX_PARAM_LENGTH][10]);//沒有就只能用預設值
                }
            }
            GPmct gPmct = gPmctMap.get(machineId);
            for(int index=0; index<gPmct.getValues().length; index++){
                if(MACHINE_TOP_TEN_VAL_MAPPING.containsKey(machineId)){
                    String[][] currentMachineTopTenVal = MACHINE_TOP_TEN_VAL_MAPPING.get(machineId);
                    if(currentMachineTopTenVal.length > index){//避免實際資料index比設定檔index還要多，造成錯誤
                        String[] current = MACHINE_TOP_TEN_VAL_MAPPING.get(machineId)[index];
                        shift(gPmct.getValue(index), current);
                    }
                }
            }
        }
    }

    private void shift(String newVal, String[] arr){
        for(int index=arr.length-1; index>0; index--){
            arr[index] = arr[index - 1];
        }
        arr[0] = newVal;
    }

    private RequestResult<String> buildRuleFile(){
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                StringBuilder sb = new StringBuilder();
                List<Map> aAplusDetectionRules = Base.findAll("SELECT a.alarm_id, a.machine_id, a.type_id," +
                        " a.condition_rule, a.condition_valid, a.detect_rule, a.is_valid FROM a_aplus_detection_rule a");
                for(Map aAplusDetectionRule:aAplusDetectionRules){
                    sb.append(check(aAplusDetectionRule.get("alarm_id"))).append(RULE_SPLIT_SYMBOL)
                            .append(check(aAplusDetectionRule.get("machine_id"))).append(RULE_SPLIT_SYMBOL)
                            .append(check(aAplusDetectionRule.get("type_id"))).append(RULE_SPLIT_SYMBOL)
                            .append(check(aAplusDetectionRule.get("condition_rule"))).append(RULE_SPLIT_SYMBOL)
                            .append(check(aAplusDetectionRule.get("condition_valid"))).append(RULE_SPLIT_SYMBOL)
                            .append(check(aAplusDetectionRule.get("detect_rule"))).append(RULE_SPLIT_SYMBOL)
                            .append(check(aAplusDetectionRule.get("is_valid"))).append(NEW_LINE);
                }
                return success(sb.toString());
            }
        });
    }

    //檢查，並確保不會換行
    private String check(Object obj){
        if(obj != null){
            return obj.toString().replace(NEW_LINE, "").replace("\n", "").replace("\r", "");
        }else{
            return " ";
        }
    }

    private List<ErrorMsg> ruleFileErrorMsgs(){
        String[][] testDatas = new String[DEFAULT_MAX_PARAM_LENGTH][10];
        List<ErrorMsg> errorMsgs = new ArrayList<ErrorMsg>();
        try {
            List<String> rules = Files.readLines(new File(CUST_PARAM_APLUS_RULE_TEMP_FILE_PATH), Charsets.UTF_8);
            List<DiagnosisRule> testRules = new ArrayList<DiagnosisRule>();
            for(String rule:rules){
                testRules.add(new DiagnosisRule(rule));
            }
            File file = new File(CUST_PARAM_APLUS_TEMP_DIR_PATH);
            Map<String, Map<String, Integer>> testParams = new HashMap<String, Map<String, Integer>>();
            if(file.exists()){
                String[] machineCsvs = file.list();
                for(String machineCsv:machineCsvs){
                    File machineCsvFile = new File(CUST_PARAM_APLUS_TEMP_DIR_PATH, machineCsv);
                    CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(machineCsvFile), Charsets.UTF_8), CSV_SPLIT_SYMBOL.charAt(0));
                    List<Map<String, String>> paramMap = parseMachineCsv(reader.readAll());
                    String machineId = machineCsv.replace(".csv", "");
                    for(Map<String, String> param:paramMap){
                        if(param.containsKey("index") && param.containsKey("id")){
                            if(!testParams.containsKey(machineId)){
                                testParams.put(machineId, new HashMap<String, Integer>());
                            }
                            //String id = "{" + parseToHex(param.get("id")) + "}";
                            String name = "{" + param.get("name") + "}";
                            testParams.get(machineId).put(name, Integer.parseInt(param.get("index")));
                        }
                    }
                }
                StringBuilder sb = new StringBuilder();
                for(DiagnosisRule testRule:testRules){
                    Map<String, Integer> paramMap = testParams.get(testRule.getMachineId());
                    BuildMachineRuleFile buildMachineRuleFile = new BuildMachineRuleFile(testRule, paramMap, true);
                    buildMachineRuleFile.build();
                    String detectRule = buildMachineRuleFile.getFileContent();
                    sb.append(detectRule).append(NEW_LINE);
                    try {
                        //log.info("test rule: {}", detectRule);
                        Compilable compilable = (Compilable) JS_ENGINE;
                        Bindings bindings = JS_ENGINE.createBindings();
                        CompiledScript JSFunction = compilable.compile(detectRule);
                        bindings.put("paramArrStr", new Gson().toJson(testDatas));
                        JSFunction.eval(bindings);
                    } catch (ScriptException e) {
                        String error = e.getMessage().replace("sun.org.mozilla.javascript.", "");
                        Pattern pattern = Pattern.compile("results = \\[\\];if\\((.*)\\)\\{results.push\\(");
                        Matcher matcher = pattern.matcher(error);
                        if(matcher.find()){
                            error = matcher.group(1);
                        }
                        errorMsgs.add(new ErrorMsg(
                                testRule.getMachineId(),
                                testRule.getAlarmId(),
                                error));
                    }
                }
                writeRuleFile(CUST_PARAM_APLUS_RULE_TEMP_TRANSFORM_FILE_PATH, sb.toString());
            }
        } catch (IOException e) {
            e.printStackTrace();
            log.warn("{}", e);
        }
        return errorMsgs;
    }

    private void writeRuleFile(String filePath, String rule){
        try {
            File file = new File(filePath);
            if(file.exists()){
                Files.write(rule, new File(filePath), Charsets.UTF_8);
            }else{
                log.warn("writeRuleFile: {} not exist!", filePath);
                if(file.getParentFile() != null) {
                    file.getParentFile().mkdirs();
                }
                file.createNewFile();
            }
        } catch (IOException e) {
            e.printStackTrace();
            log.warn("writeRuleFile: {}", e);
        }
    }

    private void initDiagnosisRule(String filePath){
        try {
            File file = new File(filePath);
            if(file.exists()){
                List<String> rules = Files.readLines(file, Charsets.UTF_8);
                DIAGNOSIS_RULES.clear();
                for(String rule:rules){
                    if(!rule.isEmpty()){
                        DIAGNOSIS_RULES.add(new DiagnosisRule(rule));
                    }
                }
            }else{
                log.warn("initDiagnosisRule: {} not exist!", filePath);
            }
        } catch (IOException e) {
            log.warn("initDiagnosisRule: {}", e);
        }
    }

    private void initParamMapping(String filePath){
        try {
            File file = new File(filePath);
            if(file.exists()){
                MACHINE_PARAM_MAPPING.clear();
                MACHINE_PARAM_ORI_MAPPING.clear();
                String[] machineCsvs = file.list();
                for(String machineCsv:machineCsvs){
                    File machineCsvFile = new File(filePath, machineCsv);
                    CSVReader reader = new CSVReader(new InputStreamReader(new FileInputStream(machineCsvFile), Charsets.UTF_8), CSV_SPLIT_SYMBOL.charAt(0));
                    List<Map<String, String>> paramMap = parseMachineCsv(reader.readAll());
                    String machineId = machineCsv.replace(".csv", "");
                    for(Map<String, String> param:paramMap){
                        if(param.containsKey("index") && param.containsKey("id")){
                            if(!MACHINE_PARAM_MAPPING.containsKey(machineId)){
                                MACHINE_PARAM_MAPPING.put(machineId, new HashMap<String, Integer>());
                                MACHINE_PARAM_ORI_MAPPING.put(machineId, new HashMap<Integer, String>());
                                MACHINE_MAX_PARAM_MAP.put(machineId, 0);
                            }
                            //String id = "{" + parseToHex(param.get("id")) + "}";
                            String name = "{" + param.get("name") + "}";
                            int index = Integer.parseInt(param.get("index"));
                            MACHINE_PARAM_MAPPING.get(machineId).put(name, index);
                            MACHINE_PARAM_ORI_MAPPING.get(machineId).put(index, name);
                            MACHINE_MAX_PARAM_MAP.put(machineId, Math.max(MACHINE_MAX_PARAM_MAP.get(machineId), index));
                        }
                    }
                }
            }else{
                log.warn("initParamMapping: {} not exist!", filePath);
            }

        } catch (IOException e) {
            log.warn("initParamMapping: {}", e);
        }

    }

    private void initBuildJsRule(){
        Map<String, List<DiagnosisRule>> machineDiagnosisRules = new HashMap<String, List<DiagnosisRule>>();
        for(DiagnosisRule diagnosisRule:DIAGNOSIS_RULES){
            if(!machineDiagnosisRules.containsKey(diagnosisRule.getMachineId())){
                machineDiagnosisRules.put(diagnosisRule.getMachineId(), new ArrayList<DiagnosisRule>());
            }
            machineDiagnosisRules.get(diagnosisRule.getMachineId()).add(diagnosisRule);
            DIAGNOSIS_RULE_MAP.put(diagnosisRule.getAlarmId() + RULE_SPLIT_SYMBOL + diagnosisRule.getMachineId(), diagnosisRule);
        }
        StringBuilder sb = new StringBuilder();
        for(String machineId:machineDiagnosisRules.keySet()){
            List<DiagnosisRule> rules = machineDiagnosisRules.get(machineId);
            Map<String, Integer> paramMap = MACHINE_PARAM_MAPPING.get(machineId);
            BuildMachineRuleFile buildMachineRuleFile = new BuildMachineRuleFile(rules, paramMap);
            buildMachineRuleFile.build();
            MACHINE_JS_RULE_MAPPING.put(machineId, buildMachineRuleFile.getFileContent());
            sb.append("machineId:").append(machineId).append(", ").append(buildMachineRuleFile.getFileContent()).append(NEW_LINE);
        }
        writeRuleFile(CUST_PARAM_APLUS_RULE_TRANSFORM_FILE_PATH, sb.toString());
//        for(String machineId:machineDiagnosisRules.keySet()){
//            try {
//                Files.write(MACHINE_JS_RULE_MAPPING.get(machineId), new File("C:/D/___TEST" + machineId + ".json"), Charsets.UTF_8);
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
//        }
    }

//    //將"X30#F", "Y32#C", "M9110#", "ZR5322#"轉換成 "X1EF", "Y20C", "M9110", "ZR5322"
//    private String parseToHex(String str){
//        Pattern pattern1 = Pattern.compile("\\#$");
//        Pattern pattern2 = Pattern.compile("([a-zA-Z]+)(\\d+)#(\\w)");
//
//        Matcher matcher1 = pattern1.matcher(str);
//        Matcher matcher2 = pattern2.matcher(str);
//        if(matcher1.find()){
//            return str.substring(0, str.length() - 1);
//        }else{
//            if(matcher2.find()){
//                return matcher2.group(1) +
//                        Integer.toHexString(Integer.parseInt(matcher2.group(2))).toUpperCase() +
//                        matcher2.group(3);
//            }
//
//        }
//        return str;
//    }

    private List<Map<String, String>> parseMachineCsv(List<String[]> params){
        List<String> keys = new ArrayList<String>();
        List<Map<String, String>> result = new ArrayList<Map<String, String>>();
        if(params.size() > 0){
            String[] headCols = params.get(0);
            for(String headCol:headCols){
                keys.add(headCol);
                //log.info("head: {}", headCol);
            }
            //log.info("head: {}", keys.size());
            for(int index=1; index<params.size(); index++){
                String[] cols = params.get(index);
                //cols = "";
                //log.info("### cols: {}", cols.length);
                //log.info("### cols: {}", new Gson().toJson(params.get(index)));
                Map<String, String> map = new HashMap<String, String>();
                for(int keyIndex=0; keyIndex<keys.size(); keyIndex++){
                    map.put(keys.get(keyIndex), cols[keyIndex]);
                }
                result.add(map);
            }
        }
        return result;
    }

    private String parseGPmctFromDeviceStatus(String deviceStatusStr){
        String result = null;
        try{
            Type type = new TypeToken<Map<String, Object>>(){}.getType();
            Map<String, Object> deviceStatus = new Gson().fromJson(deviceStatusStr, type);
            List<Map<String, Object>> datas = (List<Map<String, Object>>) ((Map) deviceStatus.get("result")).get("stringValues");
            for(Map<String, Object> map:datas){
                boolean isGPmct = false;
                if(map.containsKey("signal") && ((Map<String, String>)map.get("signal")).get("id").equals("G_PMCT()")){
                    isGPmct = true;
                }
                if(isGPmct && map.containsKey("values")){
                    List<Map<String, List<String>>> gPmctDatas = (List<Map<String, List<String>>>) map.get("values");
                    result = gPmctDatas.get(0).get("array").get(0);
                    break;
                }
            }
        }catch (Exception e){
            log.warn("parseGPmctFromDeviceStatus: {}", e);
        }

        return result;
    }

    private void diagnosis(){
        Set<String> preAlarmSet = new HashSet<String>(PRE_ALARM_SET);
        PRE_ALARM_SET = new HashSet<String>();
        Date timestamp = new Date();
        for(String machineId:MACHINE_TOP_TEN_VAL_MAPPING.keySet()){
            String[][] values = MACHINE_TOP_TEN_VAL_MAPPING.get(machineId);
            if(MACHINE_JS_RULE_MAPPING.containsKey(machineId) && !MACHINE_JS_RULE_MAPPING.get(machineId).isEmpty()){
                String jsRule = MACHINE_JS_RULE_MAPPING.get(machineId);
                Map<Integer, String> paramOriMap = MACHINE_PARAM_ORI_MAPPING.get(machineId);
                List<String> results = findAlarms(jsRule, values);
                for(String result:results){
                    AlarmMsg alarmMsg = buildAlarmMsg(timestamp, result, paramOriMap, DIAGNOSIS_RULE_MAP, values);
                    cache.put(alarmMsg.getId(), alarmMsg);
                    //只記錄第一次發生
                    if(!preAlarmSet.contains(alarmMsg.getId())){
                        logAlarm(alarmMsg);
                    }
                    PRE_ALARM_SET.add(alarmMsg.getId());
                }
            }
        }
    }

    private AlarmMsg buildAlarmMsg(Date timestamp, String result, Map<Integer, String> paramOriMap, Map<String, DiagnosisRule> diagnosisRuleMap, String[][] datas){
        final int ALARM_INDEX= 0;
        final int MACHINE_INDEX= 1;
        final int TYPE_INDEX= 2;
        final int RESULT_INDEX= 3;

        String[] cols = result.split(RULE_SPLIT_SYMBOL);
        String alarmId = cols[ALARM_INDEX];
        String machineId = cols[MACHINE_INDEX];
        String typeId = cols[TYPE_INDEX];
        String diagnosisResult = cols[RESULT_INDEX];
        DiagnosisRule diagnosisRule = diagnosisRuleMap.get(alarmId + RULE_SPLIT_SYMBOL + machineId);
        //System.out.println(diagnosisRule.getDetectRule());
        Pattern pattern = Pattern.compile("(paramArr\\[(\\d+)\\]\\[(\\d+)\\])");
        Matcher matcher = pattern.matcher(diagnosisResult);
        String temp = diagnosisResult;
        while(matcher.find()){
            int row = Integer.parseInt(matcher.group(2));
            int col = Integer.parseInt(matcher.group(3));
            //System.out.println(find + ": " + row + " , " + col);
            String val = datas[row][col];
            String oriKey = paramOriMap.get(row);
            String paramArr = "paramArr[" + row + "][" + col + "]";
            if(col != 0){
                oriKey = oriKey + "[" + col + "]";
            }
            String buildResult = oriKey + "='" + val + "'";
            temp = temp.replace(paramArr, buildResult);
            for(String operatorKey:OPERATOR_ORI_REPLACE_MAPPING.keySet()){//替換成js的運算符號
                temp = temp.replace(operatorKey, OPERATOR_ORI_REPLACE_MAPPING.get(operatorKey));
            }
        }
        String id = alarmId + RULE_SPLIT_SYMBOL + machineId;
        return new AlarmMsg(id, timestamp, machineId, typeId, alarmId, temp);
    }

    private List<String> findAlarms(String jsRule, String[][] datas) {
        List<String> alarms = new ArrayList<String>();
        try {
            Compilable compilable = (Compilable) JS_ENGINE;
            Bindings bindings = JS_ENGINE.createBindings();
            CompiledScript JSFunction = compilable.compile(jsRule);
            bindings.put("paramArrStr", new Gson().toJson(datas));
            alarms = new Gson().fromJson(JSFunction.eval(bindings).toString(), new com.google.gson.reflect.TypeToken<List<String>>(){}.getType());
        } catch (ScriptException e) {
            e.printStackTrace();
            log.warn("{}", e);
        }
        return alarms;
    }

    //TODO 紀錄到 ALARM_LOG table
    private void logAlarm(final AlarmMsg alarmMsg){
        ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                Map data = new HashMap();
                data.put("alarm_id", alarmMsg.getAlarmId());
                data.put("machine_id", alarmMsg.getMachineId());
                data.put("name", alarmMsg.getAlarmId());
                data.put("depiction", alarmMsg.getAlarmId());
                data.put("source", "1");
                data.put("detection_result", alarmMsg.getResult());
                data.put("create_by", "tomcat");
                data.put("create_time", alarmMsg.getTimestampDate());
                AAplusAlarmLog aAplusAlarmLog = new AAplusAlarmLog();
                aAplusAlarmLog.fromMap(data);
                aAplusAlarmLog.insert();
                return success();
            }
        });
    }

    private class GPmct{
        private String machineId;
        private String[] values;

        public GPmct(String machineId, String values) {
            this.machineId = machineId;
            if("B".equals(values)){
                this.values = new String[]{null};
            }else{
                this.values = new Gson().fromJson(values, String[].class);
            }
        }

        public String getMachineId() {
            return machineId;
        }

        public String getValue(int index) {
            if((values == null) || (values[0] == null) || (index >= values.length)){
                return null;//為了與空陣列一致性，所以回傳null
            }
            return values[index];
        }

        public String[] getValues(){
            return values;
        }
    }

    private class AlarmMsg{
        private String id;
        private String timestamp;
        private Date timestampDate;
        private String machineId;
        private String typeId;
        private String alarmId;
        private String result;

        public AlarmMsg(String id, Date timestamp, String machineId, String typeId, String alarmId, String result) {
            this.id = id;
            this.timestamp = timestamp.toString();
            this.timestampDate = timestamp;
            this.machineId = machineId;
            this.typeId = typeId;
            this.alarmId = alarmId;
            this.result = result;
        }

        public String getId() {
            return id;
        }

        public String getTimestamp() {
            return timestamp;
        }

        public Date getTimestampDate() {
            return timestampDate;
        }

        public String getMachineId() {
            return machineId;
        }

        public String getTypeId() {
            return typeId;
        }

        public String getAlarmId() {
            return alarmId;
        }

        public String getResult() {
            return result;
        }
    }

    private class DiagnosisRule{
        private static final String YES = "Y";
        private static final int ALARM_ID_INDEX = 0;
        private static final int MACHINE_ID_INDEX = 1;
        private static final int TYPE_ID_INDEX = 2;
        private static final int CONDITION_RULE_INDEX = 3;
        private static final int CONDITION_VALID_INDEX = 4;
        private static final int DETECT_RULE_INDEX = 5;
        private static final int IS_VALID_INDEX = 6;

        private String alarmId;
        private String machineId;
        private String typeId;
        private String conditionRule;//前置條件判斷式
        private Boolean conditionValid;//前置條件是否有啟用
        private String detectRule;//判斷式
        private Boolean isValid;//是否啟用RULE_SPLIT_SYMBOL

        public DiagnosisRule(String rule){
            this(rule.split(RULE_SPLIT_SYMBOL)[ALARM_ID_INDEX],
                    rule.split(RULE_SPLIT_SYMBOL)[MACHINE_ID_INDEX],
                    rule.split(RULE_SPLIT_SYMBOL)[TYPE_ID_INDEX],
                    rule.split(RULE_SPLIT_SYMBOL)[CONDITION_RULE_INDEX],
                    rule.split(RULE_SPLIT_SYMBOL)[CONDITION_VALID_INDEX],
                    rule.split(RULE_SPLIT_SYMBOL)[DETECT_RULE_INDEX],
                    rule.split(RULE_SPLIT_SYMBOL)[IS_VALID_INDEX]);
        }

        public DiagnosisRule(String alarmId, String machineId, String typeId, String conditionRule, String conditionValid, String detectRule, String isValid) {
            this.alarmId = alarmId;
            this.machineId = machineId;
            this.typeId = typeId;
            this.conditionRule = conditionRule;
            this.conditionValid = false;
            this.detectRule = detectRule;
            this.isValid = false;

            if(YES.equals(conditionValid)){
                this.conditionValid = true;
            }
            if(YES.equals(isValid)){
                this.isValid = true;
            }
        }

        public String getAlarmId() {
            return alarmId;
        }

        public String getMachineId() {
            return machineId;
        }

        public String getTypeId() {
            return typeId;
        }

        public String getConditionRule() {
            return conditionRule;
        }

        public Boolean getConditionValid() {
            return conditionValid;
        }

        public String getDetectRule() {
            return detectRule;
        }

        public Boolean getValid() {
            return isValid;
        }
    }

    private class ErrorMsg{
        private String machineId;
        private String alarmId;
        private String msg;

        public ErrorMsg(String machineId, String alarmId, String msg) {
            this.machineId = machineId;
            this.alarmId = alarmId;
            this.msg = msg;
        }

        public String getMachineId() {
            return machineId;
        }

        public String getAlarmId() {
            return alarmId;
        }

        public String getMsg() {
            return msg;
        }
    }

    private class BuildMachineRuleFile{
        private List<DiagnosisRule> diagnosisRules;
        private Map<String, Integer> paramMap;
        private boolean isCheckRule = false;
        private StringBuilder sb;

        public BuildMachineRuleFile(DiagnosisRule diagnosisRule, Map<String, Integer> paramMap, boolean isCheckRule){
            this.diagnosisRules = new ArrayList<DiagnosisRule>();
            this.diagnosisRules.add(diagnosisRule);
            this.paramMap = paramMap;
            this.isCheckRule = isCheckRule;
        }

        public BuildMachineRuleFile(List<DiagnosisRule> diagnosisRules, Map<String, Integer> paramMap){
            this.diagnosisRules = diagnosisRules;
            this.paramMap = paramMap;
        }

        public void build(){
            this.sb = new StringBuilder();
            sb.append("function diagnosis(paramArrStr){").append("var paramArr = JSON.parse(paramArrStr);")
                    .append("var results = [];");
            for(DiagnosisRule rule:this.diagnosisRules){
                if(rule.getValid() || this.isCheckRule) {//規則啟用
                    sb.append("if( ");
                    if(rule.getConditionValid()|| this.isCheckRule){
                        String conditionRuleTemp = rule.getConditionRule();
                        if(conditionRuleTemp.trim().isEmpty()){
                            conditionRuleTemp = "true";
                        }
                        sb.append("( ").append(replace2index(conditionRuleTemp)).append(" )").append(" && ");
                    }
                    String realRule = replace2index(rule.getDetectRule());
                    sb.append(" ( ").append(realRule).append(" )");
                    sb.append(" ){");
                    sb.append("results.push('").append(rule.getAlarmId()).append(RULE_SPLIT_SYMBOL)
                            .append(rule.getMachineId()).append(RULE_SPLIT_SYMBOL)
                            .append(rule.getTypeId()).append(RULE_SPLIT_SYMBOL)
                            .append(realRule).append("');");
                    sb.append("}");
                }
            }
            sb.append("return JSON.stringify(results);").append("}").append("diagnosis(paramArrStr);");
        }

        private String replace2index(String rule){
            String temp;
            for(String key:this.paramMap.keySet()){
                rule = rule.replace(key, " paramArr[" + paramMap.get(key) + "][0]");
            }
            temp = rule.replaceAll("\\]\\[0\\]\\[", "][");
            for(String operatorKey:OPERATOR_REPLACE_MAPPING.keySet()){//替換成js的運算符號
                temp = temp.replace(operatorKey, OPERATOR_REPLACE_MAPPING.get(operatorKey));
            }
            return temp;
        }

        public String getFileContent(){
            return this.sb.toString();
        }
    }
}
