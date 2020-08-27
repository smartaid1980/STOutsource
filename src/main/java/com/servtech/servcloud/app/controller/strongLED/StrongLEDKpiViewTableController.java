package com.servtech.servcloud.app.controller.strongLED;

import com.servtech.servcloud.app.model.servtrack.Line;
import com.servtech.servcloud.app.model.servtrack.view.TrackingEfficiencyView;
import com.servtech.servcloud.app.model.servtrack.view.TrackingInvalidLogView;
import com.servtech.servcloud.app.model.servtrack.view.WorkTrackingKpiView;
import com.servtech.servcloud.app.model.servtrack.view.WorkTrackingNGQualityView;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;

/**
 * Created by Frank on 2019/7/9.
 */
@RestController
@RequestMapping("/strongled/kpi-view-table")
public class StrongLEDKpiViewTableController {

    private static final Logger logger = LoggerFactory.getLogger(StrongLEDKpiViewTableController.class);
    DecimalFormat df = new DecimalFormat("0.00");
    DecimalFormat dfForTest = new DecimalFormat("0.0000");

    //換線人時
    @RequestMapping(value = "/changeOverTime", method = RequestMethod.POST)
    public RequestResult<?> getChangeOverTime(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                try {
                    String queryStart = data.get("startDate").toString();
                    String queryEnd = data.get("endDate").toString();

                    List<String> processCodesList = (List<String>) data.get("processCodes");
                    List<Map<String, Object>> resultList = new ArrayList<>();
                    StringBuilder processCodeSB = new StringBuilder("(");
                    for (int i = 0; i < processCodesList.size(); i++) {
                        processCodeSB.append("\'" + processCodesList.get(i) + "\'");
                        if (i != processCodesList.size() - 1)
                            processCodeSB.append(",");
                    }
                    processCodeSB.append(")");

                    String sql = String.format("SELECT * FROM a_strongled_servtrack_view_tracking_invalid_log where " +
                            "shift_day >= '%s' and shift_day <= '%s' and process_code in " + processCodeSB.toString() +
                            " group by move_in , line_id ,op ,line_status_start,invalid_id", queryStart, queryEnd);

                    logger.info("SQL : " + sql);
                    List<TrackingInvalidLogView> views = TrackingInvalidLogView.findBySQL(sql);

                    Map<String, Object> PCII = new HashMap<>();
                    Map<String, Object> PCIIPN = new HashMap<>();
                    Map<String, Object> PCIIPNLI = new HashMap<>();

                    String pcii = "";
                    String pciipn = "";
                    String pciipnli = "";
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    for (TrackingInvalidLogView view : views) {
                        String process_code = view.getString("process_code");
                        String invalid_type = view.getString("invalid_type");
                        if (invalid_type.equals("2")) {
                            String product_name = view.getString("product_name");
                            String line_id = view.getString("line_id");
                            String line_name = Line.findFirst("line_id = ?", line_id).getString("line_name");
                            int invalid_duration_sec = view.getInteger("invalid_duration_sec");

                            pcii = process_code + "," + invalid_type;
                            if (!PCII.containsKey(pcii)) {
                                PCII.put(pcii, invalid_duration_sec);
                            } else {
                                PCII.put(pcii, (int) PCII.get(pcii) + invalid_duration_sec);
                            }
                            pciipn = process_code + "," + invalid_type + "," + product_name + ", ";
                            if (!PCIIPN.containsKey(pciipn)) {
                                PCIIPN.put(pciipn, invalid_duration_sec);
                            } else {
                                PCIIPN.put(pciipn, (int) PCIIPN.get(pciipn) + invalid_duration_sec);
                            }
                            pciipnli = process_code + "," + invalid_type + "," + product_name + "," + line_name;
                            if (!PCIIPNLI.containsKey(pciipnli)) {
                                PCIIPNLI.put(pciipnli, invalid_duration_sec);
                            } else {
                                PCIIPNLI.put(pciipnli, (int) PCIIPNLI.get(pciipnli) + invalid_duration_sec);
                            }
                        }
                    }

                    for (String key1 : PCII.keySet()) {
                        List<Map<String, Object>> productNameList = new ArrayList<>();
                        Map<String, Object> mapPCII = new HashMap<>();
                        String[] pciiArr = key1.split(",");
                        String process_code = pciiArr[0];
                        String invalid_id = pciiArr[1];
                        for (String key2 : PCIIPN.keySet()) {
                            Map<String, Object> mapPCIIPN = new HashMap<>();
                            List<Map<String, Object>> lineIDList = new ArrayList<>();
                            String[] pciipnArr = key2.split(",");
                            String product_name = pciipnArr[2];
                            if (process_code.equals(pciipnArr[0]) && invalid_id.equals(pciipnArr[1])) {
                                for (String key3 : PCIIPNLI.keySet()) {
                                    Map<String, Object> mapPCIIPNLI = new HashMap<>();
                                    String[] pciipnlnArr = key3.split(",");
                                    if (process_code.equals(pciipnlnArr[0]) && invalid_id.equals(pciipnlnArr[1]) && product_name.equals(pciipnlnArr[2])) {
                                        mapPCIIPNLI.put("line_name", pciipnlnArr[3]);
                                        mapPCIIPNLI.put("invalid_duration", df.format((int) PCIIPNLI.get(key3) / (60.0 * 60.0)));
                                        lineIDList.add(mapPCIIPNLI);
                                    }
                                }
                                mapPCIIPN.put("product_name", product_name);
                                mapPCIIPN.put("invalid_duration", df.format((int) PCIIPN.get(key2) / (60.0 * 60.0)));
                                mapPCIIPN.put("lineIDList", lineIDList);
                                productNameList.add(mapPCIIPN);
                            }
                        }
                        mapPCII.put("process_code", process_code);
                        mapPCII.put("invalid_id", invalid_id);
                        mapPCII.put("invalid_duration", df.format((int) PCII.get(key1) / (60.0 * 60.0)));
                        mapPCII.put("productNameList", productNameList);
                        resultList.add(mapPCII);
                    }

                    return RequestResult.success(resultList);
                } catch (Exception e) {
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    System.out.println("Error : " + sw.toString());
                    return fail(e.getMessage());
                }
            }
        });
    }

    //無效人時
    @RequestMapping(value = "/invalidHourEff", method = RequestMethod.POST)
    public RequestResult<?> getInvalidHourEff(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                try {
                    String queryStart = data.get("startDate").toString();
                    String queryEnd = data.get("endDate").toString();

                    List<String> processCodesList = (List<String>) data.get("processCodes");

                    List<Map<String, Object>> resultList = new ArrayList<>();

                    StringBuilder processCodeSB = new StringBuilder("(");
                    for (int i = 0; i < processCodesList.size(); i++) {
                        processCodeSB.append("\'" + processCodesList.get(i) + "\'");
                        if (i != processCodesList.size() - 1)
                            processCodeSB.append(",");
                    }
                    processCodeSB.append(")");

                    String sql = String.format("SELECT * FROM a_strongled_servtrack_view_tracking_invalid_log where " +
                            "shift_day >= '%s' and shift_day <= '%s' and process_code in " + processCodeSB.toString() +
                            " group by move_in , line_id ,op ,line_status_start,invalid_id", queryStart, queryEnd);

                    Map<String, Object> PCII = new HashMap<>();
                    Map<String, Object> PCIIPN = new HashMap<>();
                    Map<String, Object> PCIIPNLI = new HashMap<>();
                    logger.info("SQL : " + sql);
                    List<TrackingInvalidLogView> views = TrackingInvalidLogView.findBySQL(sql);
                    String pcii = "";
                    String pciipn = "";
                    String pciipnli = "";
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    for (TrackingInvalidLogView view : views) {
                        int invalid_type = view.getInteger("invalid_type");
                        if (invalid_type != 0) {
                            String process_code = view.getString("process_code");
                            String invalid_id = view.getString("invalid_id");
                            String product_name = view.getString("product_name");
                            String line_id = view.getString("line_id");
                            String line_name = Line.findFirst("line_id = ?", line_id).getString("line_name");
                            int invalid_duration_sec = view.getInteger("invalid_duration_sec");

                            pcii = process_code + "," + invalid_id;
                            if (!PCII.containsKey(pcii)) {
                                PCII.put(pcii, invalid_duration_sec);
                            } else {
                                PCII.put(pcii, (int) PCII.get(pcii) + invalid_duration_sec);
                            }
                            pciipn = process_code + "," + invalid_id + "," + product_name + ", ";
                            if (!PCIIPN.containsKey(pciipn)) {
                                PCIIPN.put(pciipn, invalid_duration_sec);
                            } else {
                                PCIIPN.put(pciipn, (int) PCIIPN.get(pciipn) + invalid_duration_sec);
                            }
                            pciipnli = process_code + "," + invalid_id + "," + product_name + "," + line_name;
                            if (!PCIIPNLI.containsKey(pciipnli)) {
                                PCIIPNLI.put(pciipnli, invalid_duration_sec);
                            } else {
                                PCIIPNLI.put(pciipnli, (int) PCIIPNLI.get(pciipnli) + invalid_duration_sec);
                            }
                        }
                    }

                    for (String key1 : PCII.keySet()) {
                        List<Map<String, Object>> productNameList = new ArrayList<>();
                        Map<String, Object> mapPCII = new HashMap<>();
                        String[] pciiArr = key1.split(",");
                        String process_code = pciiArr[0];
                        String invalid_id = pciiArr[1];
                        for (String key2 : PCIIPN.keySet()) {
                            Map<String, Object> mapPCIIPN = new HashMap<>();
                            List<Map<String, Object>> lineIDList = new ArrayList<>();
                            String[] pciipnArr = key2.split(",");
                            String product_name = pciipnArr[2];
                            if (process_code.equals(pciipnArr[0]) && invalid_id.equals(pciipnArr[1])) {
                                for (String key3 : PCIIPNLI.keySet()) {
                                    Map<String, Object> mapPCIIPNLI = new HashMap<>();
                                    String[] pciipnlnArr = key3.split(",");
                                    if (process_code.equals(pciipnlnArr[0]) && invalid_id.equals(pciipnlnArr[1]) && product_name.equals(pciipnlnArr[2])) {
                                        mapPCIIPNLI.put("line_name", pciipnlnArr[3]);
                                        mapPCIIPNLI.put("invalid_duration", df.format((int) PCIIPNLI.get(key3) / (60.0 * 60.0)));
                                        lineIDList.add(mapPCIIPNLI);
                                    }
                                }
                                mapPCIIPN.put("product_name", product_name);
                                mapPCIIPN.put("invalid_duration", df.format((int) PCIIPN.get(key2) / (60.0 * 60.0)));
                                mapPCIIPN.put("lineIDList", lineIDList);
                                productNameList.add(mapPCIIPN);
                            }
                        }
                        mapPCII.put("process_code", process_code);
                        mapPCII.put("invalid_id", invalid_id);
                        mapPCII.put("invalid_duration", df.format((int) PCII.get(key1) / (60.0 * 60.0)));
                        mapPCII.put("productNameList", productNameList);
                        resultList.add(mapPCII);
                    }
                    return RequestResult.success(resultList);
                } catch (Exception e) {
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    System.out.println("Error : " + sw.toString());
                    return fail(e.getMessage());
                }
            }
        });
    }

    @RequestMapping(value = "/ng-quality", method = RequestMethod.POST)
    public RequestResult<?> getNGQuality(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

                String queryStart = data.get("startDate").toString();
                String queryEnd = data.get("endDate").toString();

                List<String> processCodesList = (List<String>) data.get("processCodes");

                List<Map<String, Object>> resultList = new ArrayList<>();

                List<String> ngNameList = new ArrayList<>();
                List<String> productSeriesList = new ArrayList<>();
                List<String> lineNameList = new ArrayList();

                StringBuilder processCodeSB = new StringBuilder("(");
                for (int i = 0; i < processCodesList.size(); i++) {
                    processCodeSB.append("\'" + processCodesList.get(i) + "\'");
                    if (i != processCodesList.size() - 1)
                        processCodeSB.append(",");
                }
                processCodeSB.append(")");

                List<WorkTrackingNGQualityView> resultDB = WorkTrackingNGQualityView.find("shift_day >=? and shift_day <= ? and process_code in " + processCodeSB.toString(), queryStart, queryEnd);

                for (WorkTrackingNGQualityView wt : resultDB) {
                    String ng_name = wt.getString("ng_name") == null ? "without_ng_quantity" : wt.getString("ng_name");
                    String product_series = wt.getString("product_series") == null ? "" : wt.getString("product_series");
                    String line_name = wt.getString("line_name");

                    if (!ngNameList.contains(ng_name)) {
                        ngNameList.add(ng_name);
                    }
                    if (!productSeriesList.contains(product_series)) {
                        productSeriesList.add(product_series);
                    }
                    if (!lineNameList.contains(line_name)) {
                        lineNameList.add(line_name);
                    }
                }

                int OutputArray[][][][][] = new int[processCodesList.size() + 1][ngNameList.size() + 1][productSeriesList.size() + 1][lineNameList.size() + 1][3];
                int NGQuantityArray[][][][][] = new int[processCodesList.size() + 1][ngNameList.size() + 1][productSeriesList.size() + 1][lineNameList.size() + 1][3];

                label1:
                for (WorkTrackingNGQualityView wt : resultDB) {
                    String process_code = wt.getString("process_code");
                    String ng_name = wt.getString("ng_name") == null ? "without_ng_quantity" : wt.getString("ng_name");
                    String product_series = wt.getString("product_series") == null ? "" : wt.getString("product_series");
                    String line_name = wt.getString("line_name");
                    int output = wt.getInteger("output") == null ? 0 : (int) wt.getInteger("output");
                    int ng_quantity = wt.getInteger("ng_quantity") == null ? 0 : (int) wt.getInteger("ng_quantity");

                    if (output != 0) {

                        for (int i = 0; i < processCodesList.size(); i++) {
                            for (int j = 0; j < ngNameList.size(); j++) {
                                for (int k = 0; k < productSeriesList.size(); k++) {
                                    for (int m = 0; m < lineNameList.size(); m++) {
                                        if (processCodesList.get(i).equals(process_code) && ngNameList.get(j).equals(ng_name)
                                                && productSeriesList.get(k).equals(product_series) && lineNameList.get(m).equals(line_name)) {

                                            // 同一個processCode
                                            OutputArray[i][0][0][0][0] += output;

                                            //同一個processCode 與 productName
                                            OutputArray[i][0][k + 1][0][0] += output;

                                            //同一個processCode 與 productName 與lineName
                                            OutputArray[i][0][k + 1][m + 1][0] += output;

                                            NGQuantityArray[i][j + 1][0][0][0] += ng_quantity;
                                            NGQuantityArray[i][j + 1][k + 1][0][0] += ng_quantity;
                                            NGQuantityArray[i][j + 1][k + 1][m + 1][1] += ng_quantity;

                                            continue label1;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                for (int i = 0; i < processCodesList.size(); i++) {
                    for (int j = 0; j < ngNameList.size(); j++) {
                        if (NGQuantityArray[i][j + 1][0][0][0] != 0) {
                            Map<String, Object> resultMap = new HashMap<>();
                            List<Map<String, Object>> productList = new ArrayList<>();

                            for (int k = 0; k < productSeriesList.size(); k++) {
                                if (OutputArray[i][0][k + 1][0][0] != 0) {
                                    Map<String, Object> resultProducts = new HashMap<>();
                                    List<Map<String, Object>> lineList = new ArrayList<>();

                                    for (int m = 0; m < lineNameList.size(); m++) {
                                        if (OutputArray[i][0][k + 1][m + 1][0] != 0) {
                                            Map<String, Object> resultLines = new HashMap<>();
                                            resultLines.put("lineName", lineNameList.get(m));
                                            resultLines.put("ngQuantity", NGQuantityArray[i][j + 1][k + 1][m + 1][1]);
                                            resultLines.put("output", OutputArray[i][0][k + 1][m + 1][0]);

                                            lineList.add(resultLines);

                                        }

                                    }
                                    resultProducts.put("productName", productSeriesList.get(k));
                                    resultProducts.put("ngQuantity", NGQuantityArray[i][j + 1][k + 1][0][0]);
                                    resultProducts.put("output", OutputArray[i][0][k + 1][0][0]);
                                    resultProducts.put("lines", lineList);

                                    productList.add(resultProducts);
                                }
                            }
                            resultMap.put("processCode", processCodesList.get(i));
                            resultMap.put("ngName", ngNameList.get(j));
                            resultMap.put("ngQuantity", NGQuantityArray[i][j + 1][0][0][0]);
                            resultMap.put("output", OutputArray[i][0][0][0][0]);
                            resultMap.put("products", productList);

                            resultList.add(resultMap);
                        }
                    }
                }

                return RequestResult.success(resultList);
            }
        });
    }

    @RequestMapping(value = "/fourTable", method = RequestMethod.POST)
    public RequestResult<?> kpiViewTableWeek(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                Map<String, List<Map<String, Object>>> result = new HashMap<>();
                String year = data.get("year").toString();
                String month = String.format("%02d", Integer.parseInt(data.get("month").toString()));
                List<String> processCodesList = (List<String>) data.get("processCodes");

                List<Map<String, Object>> resultList = new ArrayList<>();

                result.put("quarter", getTrackingQuarter(year, processCodesList));
                result.put("month", getTrackingMonth(year, processCodesList));
                result.put("week", getTrackingWeek(year, month, processCodesList));
                result.put("day", getTrackingDay(year, month, processCodesList));
                return RequestResult.success(result);
            }
        });
    }

    //取得日報表資料
    public List<Map<String, Object>> getTrackingDay(String queryYear, String queryMonth, List<String> processCodes) {
        StringBuilder processCodeSB = new StringBuilder("(");
        for (int i = 0; i < processCodes.size(); i++) {
            processCodeSB.append("\'" + processCodes.get(i) + "\'");
            if (i != processCodes.size() - 1)
                processCodeSB.append(",");
        }
        processCodeSB.append(")");

        SimpleDateFormat startDatef = new SimpleDateFormat("yyyy-MM-dd");
        Date nowDate = new Date();
        String nowYear = startDatef.format(nowDate).substring(0, 4);
        String nowMonth = startDatef.format(nowDate).substring(5, 7);
        String queryStart = queryYear + "-" + queryMonth + "-01";
        String queryEnd;
        int lastDay = 0;
        Calendar calendar = Calendar.getInstance();
        if (queryYear.equals(nowYear) && queryMonth.equals(nowMonth)) {

            calendar.setTime(nowDate);
            calendar.add(Calendar.DATE, -1);
            lastDay = calendar.get(Calendar.DAY_OF_MONTH);
            queryEnd = queryYear + "-" + queryMonth + String.format("-%02d", lastDay);
        } else {
            try {
                calendar.setTime(startDatef.parse(queryStart));
            } catch (ParseException e) {
                e.printStackTrace();
            }
            int value = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
            calendar.set(Calendar.DAY_OF_MONTH, value);
            lastDay = calendar.get(Calendar.DAY_OF_MONTH);
            queryEnd = queryYear + "-" + queryMonth + String.format("-%02d", lastDay);
        }
        List<Map<String, Object>> dayResult = new ArrayList<>();
        List<WorkTrackingKpiView> wt = WorkTrackingKpiView.find("shift_day >=? and shift_day <= ? and process_code in " + processCodeSB.toString(), queryStart, queryEnd);

        int[] outputArray = new int[32];
        int[] goQuantityArray = new int[32];
        for (WorkTrackingKpiView wpkv : wt) {
            String day = wpkv.getString("shift_day").substring(8, 10);
            outputArray[Integer.valueOf(day)] += wpkv.getInteger("output");
            goQuantityArray[Integer.valueOf(day)] += wpkv.getInteger("go_quantity");
        }

        String sql = String.format("SELECT * FROM a_strongled_servtrack_view_tracking_invalid_log where " +
                "shift_day >= '%s' and shift_day <= '%s' and process_code in " + processCodeSB.toString() +
                " group by move_in , line_id ,op ,line_status_start,invalid_id", queryStart, queryEnd);

        logger.info("SQL : " + sql);
        List<TrackingInvalidLogView> TILVs = TrackingInvalidLogView.findBySQL(sql);
        Set<String> invalidHourEff_count = new HashSet<>();
        Set<String> changeOverTime_count = new HashSet<>();
        int[] invalidHourEff = new int[32];
        int[] changeOverTime = new int[32];
        for (TrackingInvalidLogView TILView : TILVs) {
            String day = TILView.getString("shift_day").substring(8, 10);

            invalidHourEff[Integer.valueOf(day)] += TILView.getInteger("invalid_duration_sec") == null ? 0 : TILView.getInteger("invalid_duration_sec");
            invalidHourEff_count.add(day);
            if (TILView.getString("invalid_id").equals("100")) {
                changeOverTime[Integer.valueOf(day)] += TILView.getInteger("invalid_duration_sec") == null ? 0 : TILView.getInteger("invalid_duration_sec");
                changeOverTime_count.add(day);
            }
        }
        for (int i = 1; i <= lastDay; i++) {
            String resultDate = queryYear + "-" + queryMonth + String.format("-%02d", i);
            Map<String, Object> mapRes = new HashMap<>();
            mapRes.put("timeSeries", String.valueOf(i));
            mapRes.put("startDate", resultDate);
            mapRes.put("endDate", resultDate);
            mapRes.put("output", outputArray[i]);
            mapRes.put("goQuantity", goQuantityArray[i]);
            if (invalidHourEff[i] != 0 && invalidHourEff_count.size() != 0) {
                mapRes.put("invalidHourEff", df.format((double) invalidHourEff[i] / invalidHourEff_count.size() / (60 * 60)));
            } else {
                mapRes.put("invalidHourEff", 0.00);
            }
            if (changeOverTime[i] != 0 && changeOverTime_count.size() != 0) {
                mapRes.put("changeOverTime", df.format((double) changeOverTime[i] / changeOverTime_count.size() / (60 * 60)));
            } else {
                mapRes.put("changeOverTime", 0.00);
            }

            dayResult.add(mapRes);
        }

        return dayResult;
    }


    //取得周報表資料
    private List<Map<String, Object>> getTrackingWeek(String year, String month, List<String> processCodes) {
        StringBuilder processCodeSB = new StringBuilder("(");
        for (int i = 0; i < processCodes.size(); i++) {
            processCodeSB.append("\'" + processCodes.get(i) + "\'");
            if (i != processCodes.size() - 1)
                processCodeSB.append(",");
        }
        processCodeSB.append(")");
        List<Map<String, Object>> result = new ArrayList<>();
        SimpleDateFormat startDatef = new SimpleDateFormat("yyyy-MM-dd");

        Calendar calendar = Calendar.getInstance();
        //今年
        int nowYear = calendar.get(Calendar.YEAR);
        //今月
        int nowMonth = calendar.get(Calendar.MONTH) + 1;

        Date date = null;
        try {
            date = startDatef.parse(year + "-" + month + "-01");
            int timeSeries = 0;

            //取得第一個禮拜日
            calendar.setTime(getThisWeekSunday(date));
            Date queryStartDate = calendar.getTime();
            String startDate = startDatef.format(queryStartDate);
            String startMonth = startDate.substring(5, 7);

            //取得第一個禮拜六
            calendar.setTime(getThisWeekSaturday(queryStartDate));
            Date queryEndDate = calendar.getTime();
            String endDate = startDatef.format(queryEndDate);
            String endMonth = endDate.substring(5, 7);

            if (Integer.parseInt(month) == nowMonth && Integer.parseInt(year) == nowYear) {
                while (!startDatef.format(queryStartDate).equals(startDatef.format(getThisWeekSunday(new Date())))) {
                    List<Map> wt = Base.findAll(
                            "select sum(output) sumOutPut,sum(go_quantity) sumGoQuantity from a_servtrack_view_tracking_kpi where " +
                                    "shift_day >=? and shift_day <= ? and " +
                                    "process_code IN " + processCodeSB.toString()
                            , startDate, endDate);
                    int output = 0;
                    int goQuantity = 0;
                    for (Map map : wt) {
                        output = map.get("sumOutPut") == null ? 0 : Integer.parseInt(map.get("sumOutPut").toString());
                        goQuantity = map.get("sumGoQuantity") == null ? 0 : Integer.parseInt(map.get("sumGoQuantity").toString());
                    }
                    timeSeries++;

                    String sql = String.format("SELECT * FROM a_strongled_servtrack_view_tracking_invalid_log where " +
                            "shift_day >= '%s' and shift_day <= '%s' and process_code in " + processCodeSB.toString() +
                            " group by move_in , line_id ,op ,line_status_start,invalid_id", startDate, endDate);

                    logger.info("SQL : " + sql);
                    List<TrackingInvalidLogView> TILVs = TrackingInvalidLogView.findBySQL(sql);
                    int invalidHourEff = 0;
                    int changeOverTime = 0;
                    Set<String> invalidHourEff_count = new HashSet<>();
                    Set<String> changeOverTime_count = new HashSet<>();
                    for (TrackingInvalidLogView TILView : TILVs) {
                        String day = TILView.getString("shift_day").substring(8, 10);
                        invalidHourEff += TILView.getInteger("invalid_duration_sec") == null ? 0 : TILView.getInteger("invalid_duration_sec");
                        invalidHourEff_count.add(day);

                        if (TILView.getString("invalid_id").equals("100")) {
                            changeOverTime += TILView.getInteger("invalid_duration_sec") == null ? 0 : TILView.getInteger("invalid_duration_sec");
                            changeOverTime_count.add(day);
                        }
                    }

                    Map<String, Object> resultMap = new HashMap<>();
                    resultMap.put("timeSeries", String.valueOf(timeSeries));
                    resultMap.put("startDate", startDate);
                    resultMap.put("endDate", endDate);
                    resultMap.put("output", output);
                    resultMap.put("goQuantity", goQuantity);
                    if (invalidHourEff != 0 && invalidHourEff_count.size() != 0) {
                        resultMap.put("invalidHourEff", df.format((double) invalidHourEff / invalidHourEff_count.size() / (60 * 60)));
                    } else {
                        resultMap.put("invalidHourEff", 0.00);
                    }
                    if (changeOverTime != 0 && changeOverTime_count.size() != 0) {
                        resultMap.put("changeOverTime", df.format((double) changeOverTime / changeOverTime_count.size() / (60 * 60)));
                    } else {
                        resultMap.put("changeOverTime", 0.00);
                    }
                    result.add(resultMap);

                    //重新設定下次查詢的startDay
                    try {
                        calendar.setTime(startDatef.parse(endDate));
                    } catch (ParseException e) {
                        e.printStackTrace();
                    }
                    calendar.add(Calendar.DATE, 1);
                    queryStartDate = calendar.getTime();
                    startDate = startDatef.format(queryStartDate);
                    startMonth = startDate.substring(5, 7);

                    //重新設定下次查詢的EndDay
                    calendar.setTime(getThisWeekSaturday(queryStartDate));
                    queryEndDate = calendar.getTime();
                    endDate = startDatef.format(queryEndDate);
                    endMonth = endDate.substring(5, 7);
                }
            } else {
                do {
                    List<Map> wt = Base.findAll(
                            "select sum(output) sumOutPut,sum(go_quantity) sumGoQuantity from a_servtrack_view_tracking_kpi where " +
                                    "shift_day >=? and shift_day <= ? and " +
                                    "process_code IN " + processCodeSB.toString()
                            , startDate, endDate);
                    int output = 0;
                    int goQuantity = 0;
                    for (Map map : wt) {
                        output = map.get("sumOutPut") == null ? 0 : Integer.parseInt(map.get("sumOutPut").toString());
                        goQuantity = map.get("sumGoQuantity") == null ? 0 : Integer.parseInt(map.get("sumGoQuantity").toString());
                    }

                    timeSeries++;
                    String sql = String.format("SELECT * FROM a_strongled_servtrack_view_tracking_invalid_log where " +
                            "shift_day >= '%s' and shift_day <= '%s' and process_code in " + processCodeSB.toString() +
                            " group by move_in , line_id ,op ,line_status_start,invalid_id", startDate, endDate);

                    logger.info("SQL : " + sql);
                    List<TrackingInvalidLogView> TILVs = TrackingInvalidLogView.findBySQL(sql);
                    int invalidHourEff = 0;
                    int changeOverTime = 0;
                    Set<String> invalidHourEff_count = new HashSet<>();
                    Set<String> changeOverTime_count = new HashSet<>();
                    for (TrackingInvalidLogView TILView : TILVs) {
                        String day = TILView.getString("shift_day").substring(8, 10);

                        invalidHourEff += TILView.getInteger("invalid_duration_sec") == null ? 0 : TILView.getInteger("invalid_duration_sec");
                        ;
                        invalidHourEff_count.add(day);

                        if (TILView.getString("invalid_id").equals("100")) {
                            changeOverTime += TILView.getInteger("invalid_duration_sec") == null ? 0 : TILView.getInteger("invalid_duration_sec");
                            ;
                            changeOverTime_count.add(day);
                        }
                    }
//                    if (output != 0) {
                    Map<String, Object> resultMap = new HashMap<>();
                    resultMap.put("timeSeries", timeSeries);
                    resultMap.put("startDate", startDate);
                    resultMap.put("endDate", endDate);
                    resultMap.put("output", output);
                    resultMap.put("goQuantity", goQuantity);
                    if (invalidHourEff != 0 && invalidHourEff_count.size() != 0) {
                        resultMap.put("invalidHourEff", df.format((double) invalidHourEff / invalidHourEff_count.size() / (60 * 60)));
                    } else {
                        resultMap.put("invalidHourEff", 0.00);
                    }
                    if (changeOverTime != 0 && changeOverTime_count.size() != 0) {
                        resultMap.put("changeOverTime", df.format((double) changeOverTime / changeOverTime_count.size() / (60 * 60)));
                    } else {
                        resultMap.put("changeOverTime", 0.00);
                    }

                    result.add(resultMap);
//                    }
                    //重新設定下次查詢的startDay
                    try {
                        calendar.setTime(startDatef.parse(endDate));
                    } catch (ParseException e) {
                        e.printStackTrace();
                    }
                    calendar.add(Calendar.DATE, 1);
                    queryStartDate = calendar.getTime();
                    startDate = startDatef.format(queryStartDate);
                    startMonth = startDate.substring(5, 7);

                    //重新設定下次查詢的EndDay
                    calendar.setTime(getThisWeekSaturday(queryStartDate));
                    queryEndDate = calendar.getTime();
                    endDate = startDatef.format(queryEndDate);
                    endMonth = endDate.substring(5, 7);
                } while (endMonth.equals(month) || startMonth.equals(month));
            }
        } catch (ParseException e) {
            e.printStackTrace();
        }

        return result;
    }

    public static Date getThisWeekSunday(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        int dayWeek = cal.get(Calendar.DAY_OF_WEEK);
        if (0 == dayWeek) {
            cal.add(Calendar.DAY_OF_MONTH, -1);
        }
        cal.setFirstDayOfWeek(Calendar.SUNDAY);
        int day = cal.get(Calendar.DAY_OF_WEEK);
        cal.add(Calendar.DATE, cal.getFirstDayOfWeek() - day);
        return cal.getTime();
    }

    public static Date getThisWeekSaturday(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(getThisWeekSunday(date));
        cal.add(Calendar.DATE, 6);
        return cal.getTime();
    }

    public List<Map<String, Object>> getTrackingMonth(String queryYear, List<String> processCodes) {
        StringBuilder processCodeSB = new StringBuilder("(");
        for (int i = 0; i < processCodes.size(); i++) {
            processCodeSB.append("\'" + processCodes.get(i) + "\'");
            if (i != processCodes.size() - 1)
                processCodeSB.append(",");
        }
        processCodeSB.append(")");


        SimpleDateFormat startDatef = new SimpleDateFormat("yyyy-MM-dd");
        Date nowDate = new Date();
        String nowYear = startDatef.format(nowDate).substring(0, 4);
        String nowMonth = startDatef.format(nowDate).substring(5, 7);
        String queryStart = queryYear + "-01-01";
        int endQuery = 0;
        String queryEnd;
        if (queryYear.equals(nowYear)) {
            queryEnd = queryYear + "-" + nowMonth + "-01";
            endQuery = Integer.parseInt(nowMonth);
            //查2019，只查到當前日期前的月份，
            // 例:目前日期2019/07/10，就查詢2019-01-01到2019-06-31
        } else {
            queryEnd = queryYear + "-12-32";//結束日為32是為了要符合查詢條件，查<32 =>查到31
            endQuery = 13;
        }
        List<Map<String, Object>> monResult = new ArrayList<>();
        List<WorkTrackingKpiView> wt = WorkTrackingKpiView.find("shift_day >=? and shift_day < ? and process_code in " + processCodeSB.toString(), queryStart, queryEnd);

        int[] outputArray = new int[13];
        int[] goQuantityArray = new int[13];
        for (WorkTrackingKpiView wpkv : wt) {
            String mon = wpkv.getString("shift_day").substring(5, 7);
            outputArray[Integer.valueOf(mon)] += wpkv.getInteger("output");
            goQuantityArray[Integer.valueOf(mon)] += wpkv.getInteger("go_quantity");
        }

        String sql = String.format("SELECT * FROM a_strongled_servtrack_view_tracking_invalid_log where " +
                "shift_day >= '%s' and shift_day < '%s' and process_code in " + processCodeSB.toString() +
                " group by move_in , line_id ,op ,line_status_start,invalid_id", queryStart, queryEnd);

        logger.info("SQL : " + sql);
        List<TrackingInvalidLogView> TILVs = TrackingInvalidLogView.findBySQL(sql);
        Set<String> invalidHourEff_count = new HashSet<>();
        Set<String> changeOverTime_count = new HashSet<>();
        int[] invalidHourEff = new int[13];
        int[] changeOverTime = new int[13];
        for (TrackingInvalidLogView TILView : TILVs) {
            String mon = TILView.getString("shift_day").substring(5, 7);

            invalidHourEff[Integer.valueOf(mon)] += TILView.getInteger("invalid_duration_sec") == null ? 0 : TILView.getInteger("invalid_duration_sec");
            ;
            invalidHourEff_count.add(mon);
            if (TILView.getString("invalid_id").equals("100")) {
                changeOverTime[Integer.valueOf(mon)] += TILView.getInteger("invalid_duration_sec") == null ? 0 : TILView.getInteger("invalid_duration_sec");
                ;
                changeOverTime_count.add(mon);
            }
        }

        for (int i = 1; i < endQuery; i++) {
            try {
                String startDate = queryYear + "-" + String.format("%02d", i) + "-01";
                Date date1 = startDatef.parse(startDate);
                Calendar calendar = Calendar.getInstance();
                calendar.setTime(date1);
                String endDate = queryYear + "-" + String.format("%02d", i) + "-" + calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
                Map<String, Object> mapRes = new HashMap<>();
                mapRes.put("timeSeries", String.valueOf(i));
                mapRes.put("startDate", startDate);
                mapRes.put("endDate", endDate);
                mapRes.put("output", outputArray[i]);
                mapRes.put("goQuantity", goQuantityArray[i]);
                if (invalidHourEff[i] != 0 && invalidHourEff_count.size() != 0) {
                    mapRes.put("invalidHourEff", df.format((double) invalidHourEff[i] / invalidHourEff_count.size() / (60 * 60)));
                } else {
                    mapRes.put("invalidHourEff", 0.00);
                }
                if (changeOverTime[i] != 0 && changeOverTime_count.size() != 0) {
                    mapRes.put("changeOverTime", df.format((double) changeOverTime[i] / changeOverTime_count.size() / (60 * 60)));
                } else {
                    mapRes.put("changeOverTime", 0.00);
                }

                monResult.add(mapRes);
            } catch (ParseException e) {
                e.printStackTrace();
            }
        }
        return monResult;
    }

    public List<Map<String, Object>> getTrackingQuarter(String queryYear, List<String> processCodes) {
        StringBuilder processCodeSB = new StringBuilder("(");
        for (int i = 0; i < processCodes.size(); i++) {
            processCodeSB.append("\'" + processCodes.get(i) + "\'");
            if (i != processCodes.size() - 1)
                processCodeSB.append(",");
        }
        processCodeSB.append(")");


        SimpleDateFormat startDatef = new SimpleDateFormat("yyyy-MM-dd");
        Date nowDate = new Date();
        String nowYear = startDatef.format(nowDate).substring(0, 4);
        String nowMonth = startDatef.format(nowDate).substring(5, 7);
        String queryStart = queryYear + "-01-01";
        String queryEnd;
        int endQuery = 0;
        if (queryYear.equals(nowYear)) {
            queryEnd = queryYear + "-" + nowMonth + "-01";
            endQuery = (Integer.parseInt(nowMonth) - 1) / 3 + 1;
            //查2019，只查到當前日期前的月份，
            // 例:目前日期2019/07/10，就查詢2019-01-01到2019-06-31
        } else {
            //查2018，目前2019，就查2018-01-01到2018-12-31
            queryEnd = queryYear + "-12-32";//結束日為32是為了要符合查詢條件，查<32 =>查到31
            endQuery = 5;
        }
        List<Map<String, Object>> Result = new ArrayList<>();
        List<WorkTrackingKpiView> wt = WorkTrackingKpiView.find("shift_day >=? and shift_day < ? and process_code IN " + processCodeSB.toString(), queryStart, queryEnd);

        int[] outputArray = new int[5];
        int[] goQuantityArray = new int[5];
        for (WorkTrackingKpiView wpkv : wt) {
            int mon = Integer.parseInt(wpkv.getString("shift_day").substring(5, 7));
            int quarter = (mon - 1) / 3 + 1;
            int nowQuarter = (Integer.parseInt(nowMonth) - 1) / 3 + 1;
            if (quarter < nowQuarter) {
                outputArray[quarter] += wpkv.getInteger("output");
                goQuantityArray[quarter] += wpkv.getInteger("go_quantity");
            }
        }

        String sql = String.format("SELECT * FROM a_strongled_servtrack_view_tracking_invalid_log where " +
                "shift_day >= '%s' and shift_day < '%s' and process_code in " + processCodeSB.toString() +
                " group by move_in , line_id ,op ,line_status_start,invalid_id", queryStart, queryEnd);

        logger.info("SQL : " + sql);
        List<TrackingInvalidLogView> TILVs = TrackingInvalidLogView.findBySQL(sql);
        Set<Integer> invalidHourEff_count = new HashSet<>();
        Set<Integer> changeOverTime_count = new HashSet<>();
        int[] invalidHourEff = new int[5];
        int[] changeOverTime = new int[5];
        for (TrackingInvalidLogView TILView : TILVs) {
            int mon = Integer.parseInt(TILView.getString("shift_day").substring(5, 7));
            int quarter = (mon - 1) / 3 + 1;
            int nowQuarter = (Integer.parseInt(nowMonth) - 1) / 3 + 1;
            if (quarter < nowQuarter) {
                invalidHourEff[quarter] += TILView.getInteger("invalid_duration_sec") == null ? 0 : TILView.getInteger("invalid_duration_sec");
                ;
                invalidHourEff_count.add(quarter);
                if (TILView.getString("invalid_id").equals("100")) {
                    changeOverTime[quarter] += TILView.getInteger("invalid_duration_sec") == null ? 0 : TILView.getInteger("invalid_duration_sec");
                    ;
                    changeOverTime_count.add(quarter);
                }
            }
        }

        for (int i = 1; i < endQuery; i++) {
            try {
                String startDate = queryYear + "-" + String.format("%02d", 3 * i - 2) + "-01";
                Date date1 = startDatef.parse(startDate);
                Calendar calendar = Calendar.getInstance();
                calendar.setTime(date1);
                String endDate = queryYear + "-" + String.format("%02d", 3 * i) + "-" + calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
                Map<String, Object> mapRes = new HashMap<>();
                mapRes.put("timeSeries", String.valueOf(i));
                mapRes.put("startDate", startDate);
                mapRes.put("endDate", endDate);
                mapRes.put("output", outputArray[i]);
                mapRes.put("goQuantity", goQuantityArray[i]);
                if (invalidHourEff[i] != 0 && invalidHourEff_count.size() != 0) {
                    mapRes.put("invalidHourEff", df.format(invalidHourEff[i] / invalidHourEff_count.size() / (60 * 60)));
                } else {
                    mapRes.put("invalidHourEff", 0);
                }
                if (changeOverTime[i] != 0 && changeOverTime_count.size() != 0) {
                    mapRes.put("changeOverTime", df.format(changeOverTime[i] / changeOverTime_count.size() / (60 * 60)));
                } else {
                    mapRes.put("changeOverTime", 0);
                }


                Result.add(mapRes);
            } catch (ParseException e) {
                e.printStackTrace();
            }
        }
        return Result;
    }


    //效率統計4表(1)
    @RequestMapping(value = "/kpiEffFourTable", method = RequestMethod.POST)
    public RequestResult<?> kpiEffFourTable(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                Map<String, List<Map<String, Object>>> result = new HashMap<>();
                String year = data.get("year").toString();
                String month = String.format("%02d", Integer.parseInt(data.get("month").toString()));
                List<String> processCodesList = (List<String>) data.get("processCodes");

                List<Map<String, Object>> resultList = new ArrayList<>();

                try {
                    Long time = System.currentTimeMillis() / 1000;
                    List<Map> TILViews = getQueryYearViewDataByJava(year, processCodesList);
                    logger.info("TILViews Size : " + TILViews.size());

                    Long time0 = System.currentTimeMillis() / 1000;
                    logger.info("getDBDataANDMerge Time : " + (time0 - time) + "s");
                    result.put("quarter", getEffQuarter(year, TILViews));
                    Long time1 = System.currentTimeMillis() / 1000;
                    logger.info("time 0-1 : " + (time1 - time0) + "s");
                    result.put("month", getEffMonth(year, TILViews));
                    Long time2 = System.currentTimeMillis() / 1000;
                    logger.info("time 1-2 : " + (time2 - time1) + "s");
                    result.put("week", getEffWeek(year, month, TILViews));
                    Long time3 = System.currentTimeMillis() / 1000;
                    logger.info("time 2-3 : " + (time3 - time2) + "s");
                    result.put("day", getEffDay(year, month, TILViews));
                    Long time4 = System.currentTimeMillis() / 1000;
                    logger.info("time 3-4 : " + (time4 - time3) + "s");
                    return RequestResult.success(result);
                } catch (Exception e) {
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    System.out.println("Error : " + sw.toString());
                    return fail(e.getMessage());
                }

            }
        });
    }

    private List<Map> getQueryYearViewDataByJava(String year, List<String> processCodesList) throws ParseException {
        long time0 = System.currentTimeMillis();
        List<Map> workTrackingList = Base.findAll(getWorkTrackingSql(year, processCodesList));

        List<Map> invalidHourUneff = Base.findAll("select * from a_strongled_servtrack_view_invalidhour_uneff");
        Map<String, Map> invalidHourUneffMap = listToMap(invalidHourUneff);
        invalidHourUneff.clear();

        List<Map> invalidHourEff = Base.findAll("select * from a_strongled_servtrack_view_invalidhour_eff");
        Map<String, Map> invalidHourEffMap = listToMap(invalidHourEff);
        invalidHourEff.clear();

        List<Map> changeOver = Base.findAll("select * from a_strongled_servtrack_view_changeover_time");
        Map<String, Map> changeOverMap = listToMap(changeOver);
        changeOver.clear();
        long time1 = System.currentTimeMillis();
        logger.info("getDBTime : " + (time1 - time0) + "s");
        return mergeViewData(workTrackingList, invalidHourUneffMap, invalidHourEffMap, changeOverMap);
    }

    private Map<String, Map> listToMap(List<Map> data) {
        Map<String, Map> result = new HashMap<>();
        for (Map map : data) {
            result.put(getKey(map), map);
        }
        return result;
    }

    private String getKey(Map map) {
        StringBuffer sb = new StringBuffer();
        sb.append(map.get("move_in"));
        sb.append(map.get("line_id"));
        sb.append(map.get("work_id"));
        sb.append(map.get("op"));
        return sb.toString();
    }

    private List<Map> mergeViewData(List<Map> workTrackingList, Map<String, Map> invalidHourUneffMap, Map<String, Map> invalidHourEffMap, Map<String, Map> changeOverMap) throws ParseException {
        List<Map> trackingEfficiencyViewList = new ArrayList<>();
        for (Map workTracking : workTrackingList) {
            String key = getKey(workTracking);

            Map invalidHourUneff = invalidHourUneffMap.get(key);
            Double invalidHourUneffVal = 0.0;
            if (invalidHourUneff != null && invalidHourUneff.get("invalidhour_uneff") != null) {
                invalidHourUneffVal = Double.valueOf(invalidHourUneff.get("invalidhour_uneff").toString());
            }
//            TrackingEfficiencyView trackingEfficiencyView = new TrackingEfficiencyView();
//            trackingEfficiencyView.fromMap(workTracking);
            workTracking.put("invalidhour_uneff", invalidHourUneff == null ? null : invalidHourUneffVal);
            workTracking.put("invalidhour_eff", invalidHourEffMap.get(key) == null ? null : invalidHourEffMap.get(key).get("invalidhour_eff"));
            workTracking.put("real_workhour", getRealWorkHour(workTracking, invalidHourUneffVal));
            workTracking.put("changeover_time", changeOverMap.get(key) == null ? null : changeOverMap.get(key).get("changeover_time"));
            trackingEfficiencyViewList.add(workTracking);

            invalidHourUneffMap.remove(key);
            invalidHourEffMap.remove(key);
            changeOverMap.remove(key);
        }
        return trackingEfficiencyViewList;
    }

    private String getRealWorkHour(Map workTracking, double invalidHourUneffVal) throws ParseException {
        int custField2 = Integer.valueOf(workTracking.get("cust_field_2").toString());

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date moveIn = sdf.parse(workTracking.get("move_in").toString());
        Date moveOut = sdf.parse(workTracking.get("move_out").toString());
        Double duration = getDuration(moveIn, moveOut);
        //實作公式 ROUND(((TIMESTAMPDIFF(SECOND, wt.move_in, wt.move_out) * wt.cust_field_2)/3600 - iu.invalidhour_uneff), 4)
        return new DecimalFormat("0.0000").format((duration * custField2) / 3600 - invalidHourUneffVal);
    }

    private Double getDuration(Date moveIn, Date moveOut) {
        return (moveOut.getTime() - moveIn.getTime()) / 1000.0;
    }

    private String getWorkTrackingSql(String year, List<String> processCodes) throws ParseException {
        StringBuilder processCodeSB = new StringBuilder("(");
        for (int i = 0; i < processCodes.size(); i++) {
            processCodeSB.append("\'" + processCodes.get(i) + "\'");
            if (i != processCodes.size() - 1)
                processCodeSB.append(",");
        }
        processCodeSB.append(")");

        Calendar cal = Calendar.getInstance();
        SimpleDateFormat yymmdd = new SimpleDateFormat("yyyy-MM-dd");
        String queryStart = year + "-01-01";
        cal.setTime(yymmdd.parse(queryStart));
        cal.add(Calendar.MONTH, 12);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String queryEnd = sdf.format(cal.getTime());
        String whereSql = String.format(" (SELECT * FROM a_servtrack_work_tracking where " +
                "shift_day >= '%s' and shift_day < '%s')", queryStart, queryEnd);
        String sql = "SELECT a.* FROM (SELECT ROUND((wt.go_quantity * vwo.std_hour/60),4) AS std_workhour, vwo.product_id, vwo.product_name, vwo.product_series, vwo.process_name, vwo.process_code, l.line_name, wt.* FROM " + whereSql + " wt " +
                "INNER JOIN a_servtrack_view_work_op vwo " +
                "on wt.work_id = vwo.work_id and wt.op = vwo.op " +
                "INNER JOIN a_servtrack_line l " +
                "on l.line_id = wt.line_id ) a " +
                "where a.process_code in " + processCodeSB;
        System.out.println("sql : " + sql);
        return sql;
    }

    private List<TrackingEfficiencyView> getQueryYearViewData(String year, List<String> processCodes) throws ParseException {
        StringBuilder processCodeSB = new StringBuilder("(");
        for (int i = 0; i < processCodes.size(); i++) {
            processCodeSB.append("\'" + processCodes.get(i) + "\'");
            if (i != processCodes.size() - 1)
                processCodeSB.append(",");
        }
        processCodeSB.append(")");
        List<Map<String, Object>> Result = new ArrayList<>();

        Calendar cal = Calendar.getInstance();
        SimpleDateFormat yymmdd = new SimpleDateFormat("yyyy-MM-dd");
        String queryStart = year + "-01-01";
        cal.setTime(yymmdd.parse(queryStart));
        cal.add(Calendar.MONTH, 12);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String queryEnd = sdf.format(cal.getTime());
        String sql = String.format("SELECT * FROM a_strongled_servtrack_view_efficiency where " +
                "shift_day >= '%s' and shift_day < '%s' and process_code in " + processCodeSB.toString() +
                " group by move_in , line_id ,op , product_name ,process_code", queryStart, queryEnd);
        logger.info("sql : " + sql);
        return TrackingEfficiencyView.findBySQL(sql);
    }

    //取得季平均效率
    private List<Map<String, Object>> getEffQuarter(String queryYear, List<Map> TILViews) throws Exception {
        List<Map<String, Object>> Result = new ArrayList<>();

        SimpleDateFormat startDatef = new SimpleDateFormat("yyyy-MM-dd");
        Date nowDate = new Date();
        String nowYear = startDatef.format(nowDate).substring(0, 4);
        String nowMonth = startDatef.format(nowDate).substring(5, 7);
        String queryStart = queryYear + "-01-01";
        String queryEnd;
        int endQuery = 0;
        if (queryYear.equals(nowYear)) {
            queryEnd = queryYear + "-" + nowMonth + "-01";
            endQuery = (Integer.parseInt(nowMonth) - 1) / 3 + 1;
            //查2019，只查到當前日期前的月份，
            // 例:目前日期2019/07/10，就查詢2019-01-01到2019-06-31
        } else {
            //查2018，目前2019，就查2018-01-01到2018-12-31
            queryEnd = queryYear + "-12-32";//結束日為32是為了要符合查詢條件，查<32 =>查到31
            endQuery = 5;
        }

        double[] std_workhour = new double[5];
        double[] real_workhour = new double[5];
        double[] invalidhour_eff = new double[5];
        for (Map TILView : TILViews) {
            String shift_day = TILView.get("shift_day").toString();
            Date shift_day_date = startDatef.parse(shift_day);
            if ((shift_day_date.equals(startDatef.parse(queryStart)) || shift_day_date.after(startDatef.parse(queryStart))) && shift_day_date.before(startDatef.parse(queryEnd))) {
                String mon = shift_day.substring(5, 7);

                int quarter = (Integer.valueOf(mon) - 1) / 3 + 1;
                int nowQuarter = (Integer.parseInt(nowMonth) - 1) / 3 + 1;
                if (quarter < nowQuarter) {
                    std_workhour[quarter] += TILView.get("std_workhour") == null ? 0.0 : Double.valueOf(TILView.get("std_workhour").toString());
                    real_workhour[quarter] += TILView.get("real_workhour") == null ? 0.0 : Double.valueOf(TILView.get("real_workhour").toString());
                    invalidhour_eff[quarter] += TILView.get("invalidhour_eff") == null ? 0.0 : Double.valueOf(TILView.get("invalidhour_eff").toString());
                }
            }
        }

        for (int i = 1; i < endQuery; i++) {
            String startDate = queryYear + "-" + String.format("%02d", 3 * i - 2) + "-01";
            Date date1 = startDatef.parse(startDate);
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(date1);
            String endDate = queryYear + "-" + String.format("%02d", 3 * i) + "-" + calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
            Map<String, Object> mapRes = new HashMap<>();
            mapRes.put("timeSeries", String.valueOf(i));
            mapRes.put("startDate", startDate);
            mapRes.put("endDate", endDate);
            if (std_workhour[i] != 0.0 && real_workhour[i] != 0.0) {
                mapRes.put("lineEff", df.format(std_workhour[i] / real_workhour[i]));
                if ((real_workhour[i] - invalidhour_eff[i]) != 0) {
                    mapRes.put("empEff", df.format(std_workhour[i] / (real_workhour[i] - invalidhour_eff[i])));
                } else {
                    mapRes.put("empEff", 0.00);
                }
            } else {
                mapRes.put("lineEff", 0.00);
                mapRes.put("empEff", 0.00);
            }


            Result.add(mapRes);
        }
        return Result;
    }

    //取得月平均效率
    private List<Map<String, Object>> getEffMonth(String queryYear, List<Map> TILViews) throws Exception {
        SimpleDateFormat startDatef = new SimpleDateFormat("yyyy-MM-dd");
        Date nowDate = new Date();
        String nowYear = startDatef.format(nowDate).substring(0, 4);
        String nowMonth = startDatef.format(nowDate).substring(5, 7);
        String queryStart = queryYear + "-01-01";
        int endQuery = 0;
        String queryEnd;
        if (queryYear.equals(nowYear)) {
            queryEnd = queryYear + "-" + nowMonth + "-01";
            endQuery = Integer.parseInt(nowMonth);
            //查2019，只查到當前日期前的月份，
            // 例:目前日期2019/07/10，就查詢2019-01-01到2019-06-31
        } else {
            queryEnd = queryYear + "-12-32";//結束日為32是為了要符合查詢條件，查<32 =>查到31
            endQuery = 13;
        }
        List<Map<String, Object>> monResult = new ArrayList<>();

        double[] std_workhour = new double[13];
        double[] real_workhour = new double[13];
        double[] invalidhour_eff = new double[13];

        for (Map TILView : TILViews) {
            String shift_day = TILView.get("shift_day").toString();
            Date shift_day_date = startDatef.parse(shift_day);
            if ((shift_day_date.equals(startDatef.parse(queryStart)) || shift_day_date.after(startDatef.parse(queryStart))) && shift_day_date.before(startDatef.parse(queryEnd))) {
                String mon = TILView.get("shift_day").toString().substring(5, 7);

                std_workhour[Integer.valueOf(mon)] += TILView.get("std_workhour") == null ? 0 : Double.valueOf(TILView.get("std_workhour").toString());
                real_workhour[Integer.valueOf(mon)] += TILView.get("real_workhour") == null ? 0 : Double.valueOf(TILView.get("real_workhour").toString());
                invalidhour_eff[Integer.valueOf(mon)] += TILView.get("invalidhour_eff") == null ? 0 : Double.valueOf(TILView.get("invalidhour_eff").toString());
            }
        }

        for (int i = 1; i < endQuery; i++) {
            try {
                String startDate = queryYear + "-" + String.format("%02d", i) + "-01";
                Date date1 = startDatef.parse(startDate);
                Calendar calendar = Calendar.getInstance();
                calendar.setTime(date1);
                String endDate = queryYear + "-" + String.format("%02d", i) + "-" + calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
                Map<String, Object> mapRes = new HashMap<>();
                mapRes.put("timeSeries", String.valueOf(i));
                mapRes.put("startDate", startDate);
                mapRes.put("endDate", endDate);
                if (std_workhour[i] != 0.0 && real_workhour[i] != 0.0) {
                    mapRes.put("lineEff", df.format(std_workhour[i] / real_workhour[i]));
                    if ((real_workhour[i] - invalidhour_eff[i]) != 0) {
                        mapRes.put("empEff", df.format(std_workhour[i] / (real_workhour[i] - invalidhour_eff[i])));
                    } else {
                        mapRes.put("empEff", 0.00);
                    }
                } else {
                    mapRes.put("lineEff", 0.00);
                    mapRes.put("empEff", 0.00);
                }

                monResult.add(mapRes);
            } catch (ParseException e) {
                e.printStackTrace();
            }
        }
        return monResult;
    }

    //取得周平均效率
    private List<Map<String, Object>> getEffWeek(String queryYear, String queryMonth, List<Map> TILViews) {
        List<Map<String, Object>> result = new ArrayList<>();
        SimpleDateFormat startDatef = new SimpleDateFormat("yyyy-MM-dd");

        Calendar calendar = Calendar.getInstance();
        //今年
        int nowYear = calendar.get(Calendar.YEAR);
        //今月
        int nowMonth = calendar.get(Calendar.MONTH) + 1;

        Date date = null;
        try {
            date = startDatef.parse(queryYear + "-" + queryMonth + "-01");
            int timeSeries = 0;

            //取得第一個禮拜日
            calendar.setTime(getThisWeekSunday(date));
            Date queryStartDate = calendar.getTime();
            String startDate = startDatef.format(queryStartDate);
            String startMonth = startDate.substring(5, 7);

            //取得第一個禮拜六
            calendar.setTime(getThisWeekSaturday(queryStartDate));
            Date queryEndDate = calendar.getTime();
            String endDate = startDatef.format(queryEndDate);
            String endMonth = endDate.substring(5, 7);

            if (Integer.parseInt(queryMonth) == nowMonth && Integer.parseInt(queryYear) == nowYear) {
                while (!startDatef.format(queryStartDate).equals(startDatef.format(getThisWeekSunday(new Date())))) {
                    double std_workhour = 0;
                    double real_workhour = 0;
                    double invalidhour_eff = 0;

                    for (Map TILView : TILViews) {
                        String shift_day = TILView.get("shift_day").toString();
                        Date shift_day_date = startDatef.parse(shift_day);
                        if ((shift_day_date.equals(startDatef.parse(startDate)) || shift_day_date.after(startDatef.parse(startDate))) && (shift_day_date.equals(startDatef.parse(startDate)) || shift_day_date.before(startDatef.parse(endDate)))) {
                            std_workhour += TILView.get("std_workhour") == null ? 0 : Double.valueOf(TILView.get("std_workhour").toString());
                            real_workhour += TILView.get("real_workhour") == null ? 0 : Double.valueOf(TILView.get("real_workhour").toString());
                            invalidhour_eff += TILView.get("invalidhour_eff") == null ? 0 : Double.valueOf(TILView.get("invalidhour_eff").toString());
                        }
                    }

                    timeSeries++;

                    Map<String, Object> resultMap = new HashMap<>();
                    resultMap.put("timeSeries", String.valueOf(timeSeries));
                    resultMap.put("startDate", startDate);
                    resultMap.put("endDate", endDate);
                    if (std_workhour != 0.0 && real_workhour != 0.0) {
                        resultMap.put("lineEff", df.format(std_workhour / real_workhour));
                        if ((real_workhour - invalidhour_eff) != 0) {
                            resultMap.put("empEff", df.format(std_workhour / (real_workhour - invalidhour_eff)));
                        } else {
                            resultMap.put("empEff", 0.00);
                        }
                    } else {
                        resultMap.put("lineEff", 0.00);
                        resultMap.put("empEff", 0.00);
                    }
                    result.add(resultMap);

                    //重新設定下次查詢的startDay
                    try {
                        calendar.setTime(startDatef.parse(endDate));
                    } catch (ParseException e) {
                        e.printStackTrace();
                    }
                    calendar.add(Calendar.DATE, 1);
                    queryStartDate = calendar.getTime();
                    startDate = startDatef.format(queryStartDate);
                    startMonth = startDate.substring(5, 7);

                    //重新設定下次查詢的EndDay
                    calendar.setTime(getThisWeekSaturday(queryStartDate));
                    queryEndDate = calendar.getTime();
                    endDate = startDatef.format(queryEndDate);
                    endMonth = endDate.substring(5, 7);
                }
            } else {
                do {
                    double std_workhour = 0;
                    double real_workhour = 0;
                    double invalidhour_eff = 0;

                    for (Map TILView : TILViews) {
                        String shift_day = TILView.get("shift_day").toString();
                        Date shift_day_date = startDatef.parse(shift_day);
                        if ((shift_day_date.equals(startDatef.parse(startDate)) || shift_day_date.after(startDatef.parse(startDate))) && (shift_day_date.equals(startDatef.parse(endDate)) || shift_day_date.before(startDatef.parse(endDate)))) {
                            std_workhour += TILView.get("std_workhour") == null ? 0 : Double.valueOf(TILView.get("std_workhour").toString());
                            real_workhour += TILView.get("real_workhour") == null ? 0 : Double.valueOf(TILView.get("real_workhour").toString());
                            invalidhour_eff += TILView.get("invalidhour_eff") == null ? 0 : Double.valueOf(TILView.get("invalidhour_eff").toString());
                        }
                    }

                    timeSeries++;

                    Map<String, Object> resultMap = new HashMap<>();
                    resultMap.put("timeSeries", String.valueOf(timeSeries));
                    resultMap.put("startDate", startDate);
                    resultMap.put("endDate", endDate);
                    if (std_workhour != 0.0 && real_workhour != 0.0) {
                        resultMap.put("lineEff", df.format(std_workhour / real_workhour));
                        if ((real_workhour - invalidhour_eff) != 0) {
                            resultMap.put("empEff", df.format(std_workhour / (real_workhour - invalidhour_eff)));
                        } else {
                            resultMap.put("empEff", 0.00);
                        }
                    } else {
                        resultMap.put("lineEff", 0.00);
                        resultMap.put("empEff", 0.00);
                    }
                    result.add(resultMap);

                    //重新設定下次查詢的startDay
                    try {
                        calendar.setTime(startDatef.parse(endDate));
                    } catch (ParseException e) {
                        e.printStackTrace();
                    }
                    calendar.add(Calendar.DATE, 1);
                    queryStartDate = calendar.getTime();
                    startDate = startDatef.format(queryStartDate);
                    startMonth = startDate.substring(5, 7);

                    //重新設定下次查詢的EndDay
                    calendar.setTime(getThisWeekSaturday(queryStartDate));
                    queryEndDate = calendar.getTime();
                    endDate = startDatef.format(queryEndDate);
                    endMonth = endDate.substring(5, 7);
                } while (endMonth.equals(queryMonth) || startMonth.equals(queryMonth));
            }
        } catch (ParseException e) {
            e.printStackTrace();
        }

        return result;
    }

    //取得日平均效率
    private List<Map<String, Object>> getEffDay(String queryYear, String queryMonth, List<Map> TILViews) {
        SimpleDateFormat startDatef = new SimpleDateFormat("yyyy-MM-dd");
        Date nowDate = new Date();
        String nowYear = startDatef.format(nowDate).substring(0, 4);
        String nowMonth = startDatef.format(nowDate).substring(5, 7);
        String queryStart = queryYear + "-" + queryMonth + "-01";
        String queryEnd;
        int lastDay = 0;
        Calendar calendar = Calendar.getInstance();
        if (queryYear.equals(nowYear) && queryMonth.equals(nowMonth)) {

            calendar.setTime(nowDate);
            calendar.add(Calendar.DATE, -1);
            lastDay = calendar.get(Calendar.DAY_OF_MONTH);
            queryEnd = queryYear + "-" + queryMonth + String.format("-%02d", lastDay);
        } else {
            try {
                calendar.setTime(startDatef.parse(queryStart));
            } catch (ParseException e) {
                e.printStackTrace();
            }
            int value = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
            calendar.set(Calendar.DAY_OF_MONTH, value);
            lastDay = calendar.get(Calendar.DAY_OF_MONTH);
            queryEnd = queryYear + "-" + queryMonth + String.format("-%02d", lastDay);
        }
        List<Map<String, Object>> dayResult = new ArrayList<>();
        double[] std_workhour = new double[32];
        double[] real_workhour = new double[32];
        double[] invalidhour_eff = new double[32];
        try {
            for (Map TILView : TILViews) {
                String shift_day = TILView.get("shift_day").toString();
                Date shift_day_date = startDatef.parse(shift_day);
                if ((shift_day_date.equals(startDatef.parse(queryStart)) || shift_day_date.after(startDatef.parse(queryStart))) && (shift_day_date.equals(startDatef.parse(queryEnd)) || shift_day_date.before(startDatef.parse(queryEnd)))) {
                    String day = TILView.get("shift_day").toString().substring(8, 10);
                    std_workhour[Integer.valueOf(day)] += TILView.get("std_workhour") == null ? 0.0 : Double.valueOf(TILView.get("std_workhour").toString());
                    real_workhour[Integer.valueOf(day)] += TILView.get("real_workhour") == null ? 0.0 : Double.valueOf(TILView.get("real_workhour").toString());
                    invalidhour_eff[Integer.valueOf(day)] += TILView.get("invalidhour_eff") == null ? 0.0 : Double.valueOf(TILView.get("invalidhour_eff").toString());
                }
            }

            for (int i = 1; i <= lastDay; i++) {
                String resultDate = queryYear + "-" + queryMonth + String.format("-%02d", i);
                Map<String, Object> mapRes = new HashMap<>();
                mapRes.put("timeSeries", String.valueOf(i));
                mapRes.put("startDate", resultDate);
                mapRes.put("endDate", resultDate);

                if (std_workhour[i] != 0.0 && real_workhour[i] != 0.0) {
                    mapRes.put("lineEff", df.format(std_workhour[i] / real_workhour[i]));
                    if ((real_workhour[i] - invalidhour_eff[i]) != 0) {
                        mapRes.put("empEff", df.format(std_workhour[i] / (real_workhour[i] - invalidhour_eff[i])));
                    } else {
                        mapRes.put("empEff", 0.00);
                    }
                } else {
                    mapRes.put("lineEff", 0.00);
                    mapRes.put("empEff", 0.00);
                }

                dayResult.add(mapRes);
            }
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return dayResult;
    }


    //效率統計(2)
    @RequestMapping(value = "/kpiEffTable", method = RequestMethod.POST)
    public RequestResult<?> kpiEffTable(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                try {
                    String queryStart = data.get("startDate").toString();
                    String queryEnd = data.get("endDate").toString();
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    Date queryStartDate = sdf.parse(queryStart + " 00:00:00");
                    Date queryEndDate = sdf.parse(queryEnd + " 23:59:59");
                    List<String> processCodesList = (List<String>) data.get("processCodes");
                    List<Map<String, Object>> resultList = new ArrayList<>();
                    StringBuilder processCodeSB = new StringBuilder("(");
                    for (int i = 0; i < processCodesList.size(); i++) {
                        processCodeSB.append("\'" + processCodesList.get(i) + "\'");
                        if (i != processCodesList.size() - 1)
                            processCodeSB.append(",");
                    }
                    processCodeSB.append(")");

                    String sql = String.format("SELECT * FROM a_strongled_servtrack_view_efficiency where " +
                            "shift_day >= '%s' and shift_day <= '%s' and process_code in " + processCodeSB.toString() +
                            " group by move_in , line_id , product_name ,process_code", queryStart, queryEnd);

                    logger.info("SQL : " + sql);
                    List<TrackingEfficiencyView> TILViews = TrackingEfficiencyView.findBySQL(sql);

                    Map<String, double[]> PC = new HashMap<>();
                    Map<String, double[]> PCPN = new HashMap<>();
                    Map<String, double[]> PCPNLI = new HashMap<>();

                    String pc = "";
                    String pcpn = "";
                    String pcpnli = "";

                    for (TrackingEfficiencyView TILView : TILViews) {
                        String process_code = TILView.getString("process_code");
                        String product_name = TILView.getString("product_name");
                        String line_name = TILView.getString("line_name");
                        String move_out = TILView.getString("move_out");
                        Date move_out_date = sdf.parse(move_out);
                        String range = "";
                        //檢查出站時間 是否在查詢區間內
                        if (move_out_date.after(queryStartDate) && move_out_date.before(queryEndDate)) {
                            //如果查詢區間是同一天，單位為小時
                            if (queryStart.equals(queryEnd)) {
                                //確認出站時間是否同一天
                                if (queryEnd.equals(move_out.substring(0, 10))) {
                                    String move_out_hour = move_out.substring(11, 13);
                                    if (move_out_hour.equals("12") || move_out_hour.equals("13")) {
                                        range = "11:00";
                                    } else {
                                        range = move_out_hour + ":00";
                                    }
                                } else {
                                    logger.info(move_out + "不在查詢區間" + queryStart + "-" + queryEnd + "內，不列入計算..");
                                    continue;
                                }
                                //查詢區間不是同一天，單位為日
                            } else {
                                String move_out_day = move_out.substring(8, 10);
                                String move_out_mon = move_out.substring(5, 7);
                                range = move_out_mon + "/" + move_out_day;
                            }
                        } else {
                            logger.info(move_out + "不在查詢區間" + queryStart + "-" + queryEnd + "內，不列入計算..");
                            continue;
                        }

                        double std_workhour = TILView.getDouble("std_workhour") == null ? 0.0 : TILView.getDouble("std_workhour");
                        double real_workhour = TILView.getDouble("real_workhour") == null ? 0.0 : TILView.getDouble("real_workhour");
                        double invalidhour_eff = TILView.getDouble("invalidhour_eff") == null ? 0.0 : TILView.getDouble("invalidhour_eff");


                        pc = range;
                        if (!PC.containsKey(pc)) {
                            double[] data = {std_workhour, real_workhour, invalidhour_eff};
                            PC.put(pc, data);
                        } else {
                            double[] pcData = PC.get(pc);
                            pcData[0] += std_workhour;
                            pcData[1] += real_workhour;
                            pcData[2] += invalidhour_eff;
                            PC.put(pc, pcData);
                        }
                        pcpn = range + "," + product_name;
                        if (!PCPN.containsKey(pcpn)) {
                            double[] data = {std_workhour, real_workhour, invalidhour_eff};
                            PCPN.put(pcpn, data);
                        } else {
                            double[] pcpnData = PCPN.get(pcpn);
                            pcpnData[0] += std_workhour;
                            pcpnData[1] += real_workhour;
                            pcpnData[2] += invalidhour_eff;
                            PCPN.put(pcpn, pcpnData);
                        }
                        pcpnli = range + "," + product_name + "," + line_name;
                        if (!PCPNLI.containsKey(pcpnli)) {
                            double[] data = {std_workhour, real_workhour, invalidhour_eff};
                            PCPNLI.put(pcpnli, data);
                        } else {
                            double[] pcpnliData = PCPNLI.get(pcpnli);
                            pcpnliData[0] += std_workhour;
                            pcpnliData[1] += real_workhour;
                            pcpnliData[2] += invalidhour_eff;
                            PCPNLI.put(pcpnli, pcpnliData);
                        }
                    }

                    for (String key1 : PC.keySet()) {
                        List<Map<String, Object>> productNameList = new ArrayList<>();
                        Map<String, Object> mapPC = new HashMap<>();
                        String[] pcArr = key1.split(",");
                        String range = pcArr[0];

                        for (String key2 : PCPN.keySet()) {
                            Map<String, Object> mapPCPN = new HashMap<>();
                            List<Map<String, Object>> lineIDList = new ArrayList<>();
                            String[] pcpnArr = key2.split(",");
                            String product_name = pcpnArr[1];

                            if (range.equals(pcpnArr[0])) {
                                for (String key3 : PCPNLI.keySet()) {
                                    Map<String, Object> mapPCPNLI = new HashMap<>();
                                    String[] pcpnlnArr = key3.split(",");
                                    if (range.equals(pcpnlnArr[0]) && product_name.equals(pcpnlnArr[1])) {
                                        mapPCPNLI.put("lineName", pcpnlnArr[2]);
                                        mapPCPNLI.put("std_workhour", dfForTest.format(PCPNLI.get(key3)[0]));
                                        mapPCPNLI.put("real_workhour", dfForTest.format(PCPNLI.get(key3)[1]));
                                        mapPCPNLI.put("invalidhour_eff", dfForTest.format(PCPNLI.get(key3)[2]));
                                        if (PCPNLI.get(key3)[0] != 0 && PCPNLI.get(key3)[1] != 0) {
                                            mapPCPNLI.put("line_eff_avg", dfForTest.format(PCPNLI.get(key3)[0] * 100 / PCPNLI.get(key3)[1]));
                                            if ((PCPNLI.get(key3)[1] - PCPNLI.get(key3)[2]) != 0) {
                                                mapPCPNLI.put("emp_eff_avg", dfForTest.format(PCPNLI.get(key3)[0] * 100 / (PCPNLI.get(key3)[1] - PCPNLI.get(key3)[2])));
                                            } else {
                                                mapPCPNLI.put("emp_eff_avg", 0.00);
                                            }
                                        } else {
                                            mapPCPNLI.put("line_eff_avg", 0.00);
                                            mapPCPNLI.put("emp_eff_avg", 0.00);
                                        }


                                        lineIDList.add(mapPCPNLI);
                                    }
                                }
                                mapPCPN.put("product_name", product_name);
                                mapPCPN.put("std_workhour", dfForTest.format(PCPN.get(key2)[0]));
                                mapPCPN.put("real_workhour", dfForTest.format(PCPN.get(key2)[1]));
                                mapPCPN.put("invalidhour_eff", dfForTest.format(PCPN.get(key2)[2]));
                                if (PCPN.get(key2)[0] != 0 && PCPN.get(key2)[1] != 0) {
                                    mapPCPN.put("line_eff_avg", dfForTest.format(PCPN.get(key2)[0] * 100 / PCPN.get(key2)[1]));
                                    if ((PCPN.get(key2)[1] - PCPN.get(key2)[2]) != 0) {
                                        mapPCPN.put("emp_eff_avg", dfForTest.format(PCPN.get(key2)[0] * 100 / (PCPN.get(key2)[1] - PCPN.get(key2)[2])));
                                    } else {
                                        mapPCPN.put("emp_eff_avg", 0.00);
                                    }
                                } else {
                                    mapPCPN.put("line_eff_avg", 0.00);
                                    mapPCPN.put("emp_eff_avg", 0.00);
                                }


                                mapPCPN.put("lineIDList", lineIDList);
                                productNameList.add(mapPCPN);
                            }
                        }
                        mapPC.put("range", range);
                        mapPC.put("std_workhour", dfForTest.format(PC.get(key1)[0]));
                        mapPC.put("real_workhour", dfForTest.format(PC.get(key1)[1]));
                        mapPC.put("invalidhour_eff", dfForTest.format(PC.get(key1)[2]));
                        if (PC.get(key1)[0] != 0 && PC.get(key1)[1] != 0) {
                            mapPC.put("line_eff_avg", dfForTest.format(PC.get(key1)[0] * 100 / PC.get(key1)[1]));
                            if ((PC.get(key1)[1] - PC.get(key1)[2]) != 0) {
                                mapPC.put("emp_eff_avg", dfForTest.format(PC.get(key1)[0] * 100 / (PC.get(key1)[1] - PC.get(key1)[2])));
                            } else {
                                mapPC.put("emp_eff_avg", 0.00);
                            }
                        } else {
                            mapPC.put("line_eff_avg", 0.00);
                            mapPC.put("emp_eff_avg", 0.00);
                        }
                        mapPC.put("productNameList", productNameList);

                        resultList.add(mapPC);
                    }

                    return RequestResult.success(resultList);
                } catch (Exception e) {
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    System.out.println("Error : " + sw.toString());
                    return fail(e.getMessage());
                }
            }
        });
    }


}