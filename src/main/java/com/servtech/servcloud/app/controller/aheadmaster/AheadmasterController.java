package com.servtech.servcloud.app.controller.aheadmaster;

import com.google.common.base.Charsets;
import com.google.common.base.Splitter;
import com.google.common.io.Files;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.lang.reflect.Type;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Jenny on 2015/10/15.
 */

@RestController
@RequestMapping("/aheadmaster/routine")
public class AheadmasterController {

    private static final Logger logger = LoggerFactory.getLogger(AheadmasterController.class);
    private final String ENCODING = "UTF8";
    private static final String KM_DIR = System.getProperty(SysPropKey.ROOT_PATH) + "WEB-INF" + File.separator + "km";
    private static final String RETURN_FILE_NAME = "error.log";
    private static final String DATA_PATH = System.getProperty(SysPropKey.DATA_PATH);
    final static String CSV_SPLIT = ",";

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/uploadRules", method = POST)
    public RequestResult<String> uploadRules(@RequestParam("file") MultipartFile file, @RequestParam("project") String project) {
        File kmRulesFile = new File(DATA_PATH, "aheadmaster/" + project + "/rules/rules.csv");
        try {
            file.transferTo(kmRulesFile);
        } catch (IOException e) {
            logger.warn(e.getMessage(), e);
            return fail(e.getMessage());
        }
        return success();
    }

    @RequestMapping(value = "/uploadInput", method = POST)
    public RequestResult<String> uploadInput(@RequestParam("file") MultipartFile file, @RequestParam("project") String project) {
        File kmInputFile = new File(DATA_PATH, "aheadmaster/" + project + "/input/input.csv");

        List<String> content = new ArrayList<String>();
        try {
            BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), "BIG5"));
            String line;
            while ((line = br.readLine()) != null) {
                if(line.contains("|") && line.replaceAll("\\|", "").length() > 0){
                    content.add(line);
                }else if (line.contains("\t") && line.replaceAll("\t", "").length() > 0){
                    content.add(line.replaceAll("\t", "|"));
                }else if (line.replaceAll(",", "").length() > 0){
                    content.add(line.replaceAll(",", "|"));
                }
            }
            if(content.size() == 0) {
                return fail("檔案沒有內容");
            }
        } catch (IOException e) {
            return fail(e.getMessage());
        }

        try {
            FileUtils.writeLines(kmInputFile, Charsets.UTF_8.name(), content);
        } catch (IOException e) {
            logger.warn(e.getMessage(), e);
            return fail(e.getMessage());
        }

        return success();
    }

    @RequestMapping(value = "/executeKM", method = GET)
    public RequestResult<String> executeKM(@RequestParam("project") String project, @RequestParam("year") String year) {
        File kmDir = new File(KM_DIR);
        if (kmDir.exists()) {
            RunCmd runCmd = new RunCmd(new String[]{ new File(kmDir, "run.bat").getAbsolutePath(),
                    DATA_PATH + "/aheadmaster/" + project, year}, null, kmDir);
            runCmd.exec();
            File returnFile = new File(KM_DIR + File.separator + RETURN_FILE_NAME);
            if (returnFile.exists()) {
                List<String> errorList = readFile(returnFile, ENCODING);
                if (errorList.size() > 0) {
                    return fail("KM execution error, please check " + KM_DIR + File.separator + RETURN_FILE_NAME);
                }
            }
        } else {
            return fail("KM directory :" + KM_DIR +" not exist.");
        }

        return success();
    }

    @RequestMapping(value = "/saveRules", method = POST)
    public RequestResult<String> saveRules(@RequestBody RuleObj ruleObj) {
        String project = ruleObj.project;
        ReportObj report = ruleObj.report;
        String rules = ruleObj.rules;

        if(report.id.equals("")){
            return fail("Please name your report.");
        }

        File reportFile = new File(DATA_PATH, "/aheadmaster/" + project + "/output/report.json");
        Gson gson = new Gson();
        List<RuleObj> listRuleObj = new ArrayList<RuleObj>();
        boolean alreadyExist = false;
        if (!reportFile.exists()) {
            try {
                Files.createParentDirs(reportFile);
                reportFile.createNewFile();
            } catch (IOException e) {
                logger.warn(e.getMessage(), e);
            }
        }else{
            listRuleObj = readReportJson(project);
            for(int i = 0 ; i < listRuleObj.size() ; i++){
                if(listRuleObj.get(i).report.id.equals(report.id)){
                    listRuleObj.set(i, ruleObj);
                    alreadyExist = true;
                    break;
                }
            }
        }
        if(!alreadyExist){
            listRuleObj.add(ruleObj);
        }

        StringBuilder sb = new StringBuilder();
        for (RuleObj data : listRuleObj) {
            sb.append("," + gson.toJson(data))
                    .append(System.getProperty("line.separator"));
        }
        try {
            Files.write("[" + sb.toString().substring(1) + "]", reportFile, Charsets.UTF_8);
        } catch (IOException e) {
            e.printStackTrace();
        }

        String reportPath = DATA_PATH + "/aheadmaster/" + project + "/rules/" + report.id + "/trend/";
        File dateRuleFile = new File(reportPath + "date.csv");
        File weekRuleFile = new File(reportPath + "week.csv");
        File monthRuleFile = new File(reportPath + "month.csv");
        File quarterRuleFile = new File(reportPath + "quarter.csv");

        String[] ruleString = rules.split("\\|", -1);
        List<String> split = Arrays.asList(ruleString);

        try {
            split.set(0, "groupCol(newCol(A),\"日期\")");
            FileUtils.writeLines(dateRuleFile, Charsets.UTF_8.name(), split);

            split.set(0, "groupCol(newCol(E),\"週\")");
            FileUtils.writeLines(weekRuleFile, Charsets.UTF_8.name(), split);

            split.set(0, "groupCol(newCol(C),\"月\")");
            FileUtils.writeLines(monthRuleFile, Charsets.UTF_8.name(), split);

            split.set(0, "groupCol(newCol(D),\"季\")");
            FileUtils.writeLines(quarterRuleFile, Charsets.UTF_8.name(), split);
        } catch (IOException e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
        return success();
    }

    @RequestMapping(value = "/savePivotRule", method = POST)
    public RequestResult<String> savePivotRule(@RequestBody RuleObj ruleObj) {
        String project = ruleObj.project;
        ReportObj report = ruleObj.report;
        String rules = ruleObj.rules;

        if(report.id.equals("")){
            return fail("Please name your report.");
        }

        File reportFile = new File(DATA_PATH, "/aheadmaster/" + project + "/output/report.json");
        Gson gson = new Gson();
        List<RuleObj> listRuleObj = new ArrayList<RuleObj>();
        boolean alreadyExist = false;
        if (!reportFile.exists()) {
            try {
                Files.createParentDirs(reportFile);
                reportFile.createNewFile();
            } catch (IOException e) {
                logger.warn(e.getMessage(), e);
            }
        }else{
            listRuleObj = readReportJson(project);
            for(int i = 0 ; i < listRuleObj.size() ; i++){
                if(listRuleObj.get(i).report.id.equals(report.id)){
                    listRuleObj.set(i, ruleObj);
                    alreadyExist = true;
                    break;
                }
            }
        }
        if(!alreadyExist){
            listRuleObj.add(ruleObj);
        }

        StringBuilder sb = new StringBuilder();
        for (RuleObj data : listRuleObj) {
            sb.append("," + gson.toJson(data))
                    .append(System.getProperty("line.separator"));
        }
        try {
            Files.write("[" + sb.toString().substring(1) + "]", reportFile, Charsets.UTF_8);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return success();
    }

    @RequestMapping(value = "/deletePivotRule", method = POST)
    public RequestResult<String> deletePivotRule(@RequestParam("project") String project,
                                                 @RequestParam("id") List<String> ids) {

        File reportFile = new File(DATA_PATH, "/aheadmaster/" + project + "/output/report.json");
        Gson gson = new Gson();
        List<RuleObj> listRuleObj = new ArrayList<RuleObj>();
        List<RuleObj> newListRuleObj = new ArrayList<RuleObj>();

        if (!reportFile.exists()) {
            try {
                Files.createParentDirs(reportFile);
                reportFile.createNewFile();
            } catch (IOException e) {
                logger.warn(e.getMessage(), e);
            }
        } else {
            listRuleObj = readReportJson(project);
            for(RuleObj obj : listRuleObj){
                if (!ids.contains(obj.report.id)) {
                    newListRuleObj.add(obj);
                }
            }
        }

        StringBuilder sb = new StringBuilder();
        for (RuleObj data : newListRuleObj) {
            sb.append("," + gson.toJson(data))
                    .append(System.getProperty("line.separator"));
        }
        try {
            Files.write("[" + sb.toString().substring(1) + "]", reportFile, Charsets.UTF_8);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return success();
    }

    @RequestMapping(value = "/executePivotKM", method = GET)
    public RequestResult<String> executePivotKM(@RequestParam("project") String project, @RequestParam("year") String year
            , @RequestParam("report") String report) {
        File kmDir = new File(KM_DIR);
        File newRawData = new File( DATA_PATH + "/aheadmaster/" + project + "/newRawData/newRawData.csv");
        if (!kmDir.exists()) {
            return fail("KM directory :" + KM_DIR +" not exist.");
        } else if (!newRawData.exists()){
            return fail("Please upload input.csv, rule.csv and calculate to generate newRawData.");
        }else {
            RunCmd runCmd = new RunCmd(new String[]{ new File(kmDir, "pivot_report.bat").getAbsolutePath(),
                    DATA_PATH + "/aheadmaster/" + project, year, report}, null, kmDir);
            runCmd.exec();
            File returnFile = new File(KM_DIR + File.separator + RETURN_FILE_NAME);
            if (returnFile.exists()) {
                List<String> errorList = readFile(returnFile, ENCODING);
                if (errorList.size() > 0) {
                    return fail("KM execution error, please check " + KM_DIR + File.separator + RETURN_FILE_NAME);
                }
            }
        }
        return success();
    }

    @RequestMapping(value = "/saveAndExecutePivotKM", method = POST)
    @Deprecated
    public RequestResult<String> saveAndExecutePivotKM(@RequestBody RuleObj ruleObj) {

        // save rule
        String project = ruleObj.project;
        ReportObj report = ruleObj.report;
        String rules = ruleObj.rules;

        String year = report.year;

        if(report.id.equals("")){
            return fail("Please name your report.");
        }

        File reportFile = new File(DATA_PATH, "/aheadmaster/" + project + "/output/report.json");
        Gson gson = new Gson();
        List<RuleObj> listRuleObj = new ArrayList<RuleObj>();
        boolean alreadyExist = false;
        if (!reportFile.exists()) {
            try {
                Files.createParentDirs(reportFile);
                reportFile.createNewFile();
            } catch (IOException e) {
                logger.warn(e.getMessage(), e);
            }
        }else{
            listRuleObj = readReportJson(project);
            for(int i = 0 ; i < listRuleObj.size() ; i++){
                if(listRuleObj.get(i).report.id.equals(report.id)){
                    listRuleObj.set(i, ruleObj);
                    alreadyExist = true;
                    break;
                }
            }
        }
        if(!alreadyExist){
            listRuleObj.add(ruleObj);
        }

        StringBuilder sb = new StringBuilder();
        for (RuleObj data : listRuleObj) {
            sb.append("," + gson.toJson(data))
                    .append(System.getProperty("line.separator"));
        }
        try {
            Files.write("[" + sb.toString().substring(1) + "]", reportFile, Charsets.UTF_8);
        } catch (IOException e) {
            e.printStackTrace();
        }

        String reportPath = DATA_PATH + "/aheadmaster/" + project + "/rules/" + report.id + "/trend/";
        File dateRuleFile = new File(reportPath + "date.csv");
        File weekRuleFile = new File(reportPath + "week.csv");
        File monthRuleFile = new File(reportPath + "month.csv");
        File quarterRuleFile = new File(reportPath + "quarter.csv");

        String[] ruleString = rules.split("\\|", -1);
        List<String> split = Arrays.asList(ruleString);

        try {
//            split.set(0, "groupCol(newCol(A),\"日期\")");
            FileUtils.writeLines(dateRuleFile, Charsets.UTF_8.name(), split);

//            split.set(0, "groupCol(newCol(E),\"週\")");
            FileUtils.writeLines(weekRuleFile, Charsets.UTF_8.name(), split);
//
//            split.set(0, "groupCol(newCol(C),\"月\")");
            FileUtils.writeLines(monthRuleFile, Charsets.UTF_8.name(), split);
//
//            split.set(0, "groupCol(newCol(D),\"季\")");
            FileUtils.writeLines(quarterRuleFile, Charsets.UTF_8.name(), split);
        } catch (IOException e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }

        // execute Pivot KM
        File kmDir = new File(KM_DIR);
        File newRawData = new File( DATA_PATH + "/aheadmaster/" + project + "/newRawData/newRawData.csv");
        if (!kmDir.exists()) {
            return fail("KM directory :" + KM_DIR +" not exist.");
        } else if (!newRawData.exists()){
            return fail("Please upload input.csv, rule.csv and calculate to generate newRawData.");
        }else {
            RunCmd runCmd = new RunCmd(new String[]{ new File(kmDir, "pivot_report.bat").getAbsolutePath(),
                    DATA_PATH + "/aheadmaster/" + project, year, report.id}, null, kmDir);
            runCmd.exec();
            File returnFile = new File(KM_DIR + File.separator + RETURN_FILE_NAME);
            if (returnFile.exists()) {
                List<String> errorList = readFile(returnFile, ENCODING);
                if (errorList.size() > 0) {
                    return fail("KM execution error, please check " + KM_DIR + File.separator + RETURN_FILE_NAME);
                }
            }
        }
        return success();
    }

    @RequestMapping(value = "/getReportObjects", method = POST)
    public RequestResult<?> getReportObjects(@RequestParam("project") String project) {
        File file = new File(DATA_PATH, "aheadmaster/" + project + "/output/report.json");
        Gson gson = new Gson();
        try {
            if (file.exists()) {
                List<RuleObj> ruleObj = readReportJson(project);
                return success(gson.toJson(ruleObj));
            }
            return fail(file.getAbsolutePath() + " dose not exist!");
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    private static List<RuleObj> readReportJson(String project) {
        String reportMapPath = "/aheadmaster/" + project + "/output/report.json";
        Gson gson = new Gson();
        Type type = new TypeToken<List<RuleObj>>(){}.getType();
        List<RuleObj> listRuleObj = new ArrayList<RuleObj>();
        try {
            listRuleObj = gson.fromJson(new InputStreamReader(new FileInputStream(DATA_PATH + reportMapPath), "UTF8"), type);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return listRuleObj;
    }

    @RequestMapping(value = "/readTarget", method = POST)
    public RequestResult<?> readTarget(@RequestParam("project") String project, @RequestParam("report") String report) {
        File file = new File(DATA_PATH,  "aheadmaster/" + project + "/target.csv");
        List<String> source = null;
        TargetObj targetObj = null;
        Splitter splitter = Splitter.on(CSV_SPLIT);
        try {
            if (file.exists()) {
                source = FileUtils.readLines(file, Charsets.UTF_8);
                for(String line : source){
                    List<String> split = splitter.splitToList(line);
                    String k = split.get(0);
                    if(k.equals(report)){
                        targetObj = new TargetObj(split.get(1), split.get(2));
                        return success(targetObj);
                    }
                }
            }
            return success("");
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/saveTarget", method = POST)
    public RequestResult<String> saveTarget(@RequestParam("project") String project, @RequestParam("report") String report
            , @RequestParam("target") String target, @RequestParam("isShow") String isShow) {
        File file = new File(DATA_PATH,  "aheadmastere/" + project + "/target.csv");
        List<String> source = null;
        Map<String, String> map = new HashMap<String, String>();
        Splitter splitter = Splitter.on(CSV_SPLIT);
        try {
            if (file.exists()) {
                source = FileUtils.readLines(file, Charsets.UTF_8);
                for(String line : source){
                    List<String> split = splitter.splitToList(line);
                    String k = split.get(0);
                    map.put(k, line);
                }
            }
            // put new comment, override if exist
            map.put(report, report + CSV_SPLIT + target + CSV_SPLIT + isShow);
            // write
            FileUtils.writeLines(file, Charsets.UTF_8.name(), map.values());
            return success();
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    private List<String> readFile(File file, String encoding) {
        List<String> errorList = new ArrayList<String>();
        BufferedReader reader = null;
        StringBuilder sb = new StringBuilder();
        try {
            reader = new BufferedReader(new InputStreamReader(new FileInputStream(file), encoding));
            String line;
            while ((line = reader.readLine()) != null) {
                errorList.add(line);
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return errorList;
    }

    public class TargetObj {
        String target;
        String isShow;

        public TargetObj(String target, String isShow) {
            this.target = target;
            this.isShow = isShow;
        }

        public String getTarget() {
            return target;
        }

        public void setTarget(String target) {
            this.target = target;
        }
    }

    public static class RuleObj {
        String project;
        ReportObj report;
        String rules;

        public RuleObj(String project, ReportObj report, String rules) {
            this.project = project;
            this.report = report;
            this.rules = rules;
        }
    }

    public static class ReportObj {
        String id;
        String name;
        String desc;
        String year;
        String start;
        String end;
        String condition;
        String[] x;
        String[] y;

        public ReportObj(String id, String name, String desc, String year, String start, String end, String condition, String[] x, String[] y) {
            this.id = id;
            this.name = name;
            this.desc = desc;
            this.year = year;
            this.start = start;
            this.end = end;
            this.condition = condition;
            this.x = x;
            this.y = y;
        }
    }

}




