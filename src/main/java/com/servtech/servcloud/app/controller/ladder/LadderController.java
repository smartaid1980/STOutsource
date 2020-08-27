package com.servtech.servcloud.app.controller.ladder;

import com.google.common.base.Charsets;
import com.google.common.collect.Lists;
import com.google.common.io.Files;
import com.servtech.servcloud.core.service.box.BoxCommanderFactory;
import com.servtech.servcloud.core.service.box.Type;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileFilter;
import java.io.FilenameFilter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;

import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Hubert
 * Datetime: 2016/6/2 下午 03:26
 */
@RestController
@RequestMapping("/ladder/routine")
public class LadderController {

    private static final Logger log = LoggerFactory.getLogger(LadderController.class);

    @RequestMapping(value = "/upload", method = POST)
    public RequestResult<String> uploadLadder(@RequestParam("file") MultipartFile file,
                                              @RequestParam("machineId") String machineId) throws IOException {

        Map<String, String> errorMap = new HashMap<String, String>();
        errorMap.put("-1", "INPUT_FAIL");
        errorMap.put("-2", "CLEAR_PATH_FAIL");
        errorMap.put("-5", "CREATE_PATH_FAIL");
        errorMap.put("-10", "PATH_FAILE");
        errorMap.put("-20", "UNCOMPRESS_FAIL");
        errorMap.put("-30", "CHECK_SYMBOL_FAIL");
        errorMap.put("-40", "CHECK_LADDER_FAIL");
        errorMap.put("-50", "CREATE_RESULT_FAIL");
        errorMap.put("-999", "UNKNOWN_FAIL");

        String pmcId = Files.getNameWithoutExtension(file.getOriginalFilename());

        String ladderAppPath = new File(System.getProperty(SysPropKey.ROOT_PATH) + "/app/Ladder").getCanonicalPath();
        String pmcDataFilePath = ladderAppPath + "/Data/pmcData/" + machineId + "/ladder";
        String pmcOriginalFilePath = ladderAppPath + "/Data/pmcOriginal/" + machineId + "/ladder";
        String pmcBatPath = ladderAppPath + "/Data/LadderParser";
        String pmcDataTempPath = pmcDataFilePath + "/TEMP";
        String pmcLadderHTMLPath = ladderAppPath + "/Data/ladderHTML/" + machineId + "/ladder";
        String ladderPath = pmcOriginalFilePath + "/" + file.getOriginalFilename();

        File errorCodeFile = new File(pmcBatPath, UUID.randomUUID().toString());

        // 先備份舊的
        backupOldLadder(ladderAppPath, machineId, true);

        try {
            File ladderFile = new File(ladderPath);
            ladderFile.mkdirs();
            file.transferTo(ladderFile);

            File bat = new File(pmcBatPath + "/LadderParser.bat");
            File exe = new File(pmcBatPath + "/FanucLadderPaserApp.exe");

            File pmcDataTempFile = new File(pmcDataTempPath);
            pmcDataTempFile.mkdirs();

            File pmcDataFile = new File(pmcDataFilePath);
            pmcDataFile.mkdirs();

            String[] commands = new String[]{
                    "cmd",
                    "/c",
                    bat.getCanonicalPath(),
                    exe.getCanonicalPath(),
                    ladderFile.getCanonicalPath(),
                    pmcDataTempFile.getCanonicalPath(),
                    pmcDataFile.getCanonicalPath(),
                    machineId,
                    pmcId,
                    errorCodeFile.getCanonicalPath()
            };

            RunCmd runCmd = new RunCmd(commands, null, null);
            runCmd.setPrint(false);
            int resultCode = runCmd.execAndReturn();

            if (resultCode == 0) {
                File pmcDataDir = new File(pmcDataFilePath);
                File[] pmcHtmlAndXmlFiles = pmcDataDir.listFiles(new FileFilter() {
                    @Override
                    public boolean accept(File file) {
                        String fileName = file.getName();
                        return fileName.endsWith(".html") || fileName.endsWith(".xml");
                    }
                });

                if (pmcHtmlAndXmlFiles != null) {
                    File pmcLadderHTMLDir = new File(pmcLadderHTMLPath);
                    pmcLadderHTMLDir.mkdirs();
                    for (File pmcHtmlAndXmlFile : pmcHtmlAndXmlFiles) {
                        pmcHtmlAndXmlFile.renameTo(new File(pmcLadderHTMLDir, pmcHtmlAndXmlFile.getName()));
                    }
                }

                if (errorCodeFile.exists()) {
                    String code = Files.toString(errorCodeFile, Charsets.UTF_8).trim();
                    if (code.equals("0")) {
                        log.info("[上傳成功] " + machineId + " - " + pmcId);
                        return RequestResult.success(pmcId);

                    } else {
                        backupOldLadder(ladderAppPath, machineId, false);
                        log.warn("[上傳失敗] " + code);
                        if (errorMap.containsKey(code)) {
                            return RequestResult.fail("ERROR: " + errorMap.get(code));
                        } else {
                            return RequestResult.fail("ERROR: " + errorMap.get("-999"));
                        }
                    }
                } else {
                    backupOldLadder(ladderAppPath, machineId, false);
                    log.warn("[上傳失敗] 連 error level 都沒有...");
                    return RequestResult.fail("ERROR: " + errorMap.get("-999"));
                }

            } else {
                backupOldLadder(ladderAppPath, machineId, false);
                log.warn("[上傳失敗] 程式回傳非 0");
                return RequestResult.fail("ERROR: " + errorMap.get("-999"));
            }

        } catch (IOException e) {
            backupOldLadder(ladderAppPath, machineId, false);
            log.warn("[上傳失敗] " + e.getMessage(), e);
            return RequestResult.fail("ERROR: " + errorMap.get("-999"));

        } finally {
            errorCodeFile.delete();
        }

    }

    /**
     * Map key: 機台 id
     * Map value: ladder 名稱
     */
    @RequestMapping(value = "/ladders", method = GET)
    private RequestResult<Map<String, String>> queryMachineLadder() {
        Map<String, String> result = new LinkedHashMap<String, String>();
        File pmcOriginalDir = new File(System.getProperty(SysPropKey.ROOT_PATH) + "/app/Ladder/Data/pmcOriginal");

        File[] machineDirs = pmcOriginalDir.listFiles();
        if (machineDirs == null) {
            return RequestResult.success(result);
        }

        for (File machineDir : machineDirs) {
            File ladderDir = new File(machineDir, "ladder");
            if (ladderDir.exists()) {
                File[] ladderFiles = ladderDir.listFiles();
                if (ladderFiles != null) {
                    result.put(machineDir.getName(), Files.getNameWithoutExtension(ladderFiles[0].getName()));
                }
            }
        }

        return RequestResult.success(result);
    }

    /**
     * Map key: level 名稱
     * Map value: 該 level 位址集
     *
     * 成功回傳 Map<String, Addresses>
     * 失敗回傳 String
     */
    @RequestMapping(value = "/levels", method = GET)
    private RequestResult<?> queryLadderLevel(@RequestParam("machineId") String machineId) {
        Map<String, Addresses> result = new TreeMap<String, Addresses>();

        File ladderDataDir = new File(System.getProperty(SysPropKey.ROOT_PATH) + "/app/Ladder/Data");
        File ladderHtmlDir = new File(ladderDataDir, "ladderHTML");
        File ladderDir = new File(ladderHtmlDir, machineId + "/ladder");
        String[] levelNames = ladderDir.list(new FilenameFilter() {
            @Override
            public boolean accept(File dir, String name) {
                return name.endsWith(".html");
            }
        });

        if (levelNames == null) {
            levelNames = new String[0];
        }

        // 從 ladderHTML 中的所有 html 檔將 level 初始
        List<String> levelNameList = Lists.newArrayList(levelNames);
        putLevel(result, levelNameList);

        // 從 pmcData 中的 allindex.txt 把位址和 Level 對應找出並置入
        File allindexFile = new File(ladderDataDir, "pmcData/" + machineId + "/ladder/allindex.txt");
        List<String> allindexLines;
        try {
            allindexLines = Files.readLines(allindexFile, Charsets.UTF_8);
        } catch (IOException e) {
            allindexLines = new ArrayList<String>();
            log.warn(e.getMessage(), e);
        }
        putAddress(result, allindexLines);

        // 送資料
        File allcommandJsonFile = new File(ladderDataDir, "pmcData/" + machineId + "/ladder/allcommand.json");
        String allcommandJson = null;
        try {
            allcommandJson = Files.toString(allcommandJsonFile, Charsets.UTF_8);

            String failMsg = BoxCommanderFactory.v1_0().send(Type.Fetch,
                                                             new Type[]{ Type.Storage },
                                                             machineId,
                                                             allcommandJson);
            if (failMsg.isEmpty()) {
                return RequestResult.success(result);
            } else {
                return RequestResult.fail(failMsg);
            }
        } catch (IOException e) {
            log.warn("allcommand.json read fail...", e);
            return RequestResult.fail("allcommand.json read fail...");
        }

    }

    private void putLevel(Map<String, Addresses> result, List<String> levelNameList) {
        for (String levelName : levelNameList) {
            String newLevelName = Files.getNameWithoutExtension(levelName);
            newLevelName = padLevelName(newLevelName);
            result.put(newLevelName, new Addresses());
        }
    }

    private void putAddress(Map<String, Addresses> result, List<String> allindexLines) {
        for (String allindexLine : allindexLines) {
            int equalIndex = allindexLine.indexOf("=");
            String address = allindexLine.substring(0, equalIndex);
            String levelsStr = allindexLine.substring(equalIndex + 1);
            String[] levels = levelsStr.substring(1, levelsStr.length() - 1).split("\\),\\(");

            for (String level : levels) {
                String padLevel = padLevelName(level.substring(0, level.indexOf(",")));
                if (result.containsKey(padLevel)) {
                    result.get(padLevel).add(address);
                } else {
                    Addresses addresses = new Addresses();
                    addresses.add(address);
                    result.put(padLevel, addresses);
                }
            }
        }
    }

    private String padLevelName(String levelName) {
        String result = levelName;
        if (result.startsWith("P")) {
            String number = result.substring(1);
            switch (number.length()) {
                case 1:
                    result = "P" + "000" + number;
                    break;
                case 2:
                    result = "P" + "00" + number;
                    break;
                case 3:
                    result = "P" + "0" + number;
                    break;
                default:
                    break;
            }
        }
        return result;
    }

    private void backupOldLadder(String ladderAppPath, String machineId, boolean success) {
        File ladderHTMLMachineDir = new File(ladderAppPath, "Data/ladderHTML/" + machineId);
        File pmcDataMachineDir = new File(ladderAppPath, "Data/pmcData/" + machineId);
        File pmcOriginalMachineDir = new File(ladderAppPath, "Data/pmcOriginal/" + machineId);

        String timestamp = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date()) + "_" + (success ? "success" : "fail");

        backupOldLadder(ladderHTMLMachineDir, timestamp);
        backupOldLadder(pmcDataMachineDir, timestamp);
        backupOldLadder(pmcOriginalMachineDir, timestamp);
    }

    private void backupOldLadder(File machineDir, String backupTimestamp) {
        if (!machineDir.exists()) {
            machineDir.mkdirs();
        }

        File backupDir = new File(machineDir, "backup");

        if (!backupDir.exists()) {
            backupDir.mkdirs();
        }

        File ladderDir = new File(machineDir, "ladder");

        if (ladderDir.exists()) {
            ladderDir.renameTo(new File(backupDir, backupTimestamp));
        }
    }

    public static class Addresses {
        boolean containsAlarm = false;
        Set<String> addresses = new TreeSet<String>();

        public boolean add(String address) {
            if (address.startsWith("A")) {
                containsAlarm = true;
            }
            return addresses.add(address);
        }
    }

//    public static void main(String[] args) {
//        String line = "A0000_2=(P200,1666),(P200,1738),(P200,7842),(P200,13626)";
//        int i = line.indexOf("=");
//        String addr = line.substring(0, i);
//        String levels = line.substring(i + 1);
//        System.out.println(addr + " - " + levels);
//
//        for (String level : levels.substring(1, levels.length() - 1).split("\\),\\(")) {
//            System.out.println(level);
//        }
//    }

}
