package com.servtech.servcloud.app.controller.servcore_v3;

import com.google.gson.Gson;

import com.servtech.hippopotamus.*;
import com.servtech.hippopotamus.exception.ExhaleException;
import com.servtech.hippopotamus.fileio.atom.LongAtom;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import static com.servtech.servcloud.core.util.Util.doubleToPercentage;
import static com.servtech.servcloud.core.util.Util.millisecondToHHmmss;

/**
 * Created by Frank on 2019/6/5.
 */
@RestController
@RequestMapping("/v3/servcore")
public class ServcoreV3UtilizationController {
    @RequestMapping(value = "/utilization/month", method = RequestMethod.POST)
    public RequestResult<?> utiliztionMonth(@RequestBody final Map data) throws ParseException {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd");
        Date startDate = dateFormat.parse(data.get("startMonth").toString());
        Date endDate = dateFormat.parse(data.get("endMonth").toString());
        //2019/06/03，substring(0,4)取得年，substring(5,7)取得月
        int start_year = Integer.parseInt(dateFormat.format(startDate).substring(0, 4));
        int end_year = Integer.parseInt(dateFormat.format(endDate).substring(0, 4));
        int startMonth = Integer.parseInt(dateFormat.format(startDate).substring(5, 7));
        int endMonth = Integer.parseInt(dateFormat.format(endDate).substring(5, 7));
        List<String> machinelist = (List<String>) data.get("machine");
        Boolean isShowDowntime = data.get("isShowDowntime").toString().equals("T");
        List<Map> resultList = new ArrayList<>();
        List<String> monthlist = new ArrayList<>();
        List<Map<String, Atom>> dataList = new ArrayList<Map<String, Atom>>();
        int startTo12=1;
        Map productWorkUtilization = new HashMap<>();
        if (!startDate.before(endDate)) {
            return RequestResult.fail("結束日期在開始日期之前");
        }

        if (start_year == end_year) {           //同年
            for (int i = startMonth; i <= endMonth; i++) {
                monthlist.add(String.format("%02d", i));
            }
            dataList.addAll(hippoExhalerMonthUtil(start_year, monthlist, machinelist));
            if (isShowDowntime) {
              productWorkUtilization.putAll(getProductWorkUtilization(
                start_year,
                monthlist,
                machinelist));
            }
        } else {                              //不同年
            int yearControl = 1;
            //查詢2017/06~2019/04，查詢2017 [06-12]、2018[01-12]、2019 [01-04]
            //查詢2018/08~2019/04，查詢2018[08-12]、2019 [01-04]

            String YearControl="month_midToTwelve";
            for (int i = start_year; i <= end_year; i++) {
                switch (YearControl) {
                    case "month_midToTwelve":     //startMonth-12
                        for (int j = startMonth; j <= 12; j++) {
                            monthlist.add(String.format("%02d", j));
                        }
                        if (i + 1 == end_year) {        //2018+1==2019
                            YearControl="month_OneToEndmonth";
                        } else {                        //2017+1 != 2019 ，還要查2018一整年
                            YearControl="month_oneToTwelve";
                        }
                        dataList.addAll(hippoExhalerMonthUtil(i, monthlist, machinelist));
                        if (isShowDowntime) {
                          productWorkUtilization.putAll(getProductWorkUtilization(
                            i,
                            monthlist,
                            machinelist));
                        }
                        break;
                    case "month_oneToTwelve":         //一整年
                        monthlist.clear();
                        for (int j = 1; j <= 12; j++) {
                            monthlist.add(String.format("%02d", j));
                        }

                        if (i + 1 == end_year) {
                            YearControl="month_OneToEndMonth";
                        } else {
                            YearControl="month_oneToTwelve";
                        }
                        dataList.addAll(hippoExhalerMonthUtil(i, monthlist, machinelist));
                        if (isShowDowntime) {
                          productWorkUtilization.putAll(getProductWorkUtilization(
                            i,
                            monthlist,
                            machinelist));
                        }
                        break;
                    case "month_OneToEndmonth":     //01-endMonth
                        monthlist.clear();
                        for (int j = 1; j <= endMonth; j++) {
                            monthlist.add(String.format("%02d", j));
                        }
                        dataList.addAll(hippoExhalerMonthUtil(i, monthlist, machinelist));
                        if (isShowDowntime) {
                          productWorkUtilization.putAll(getProductWorkUtilization(
                            i,
                            monthlist,
                            machinelist));
                        }
                        break;
                }
            }
        }
        if (isShowDowntime) {
            // Map productWorkUtilization = getProductWorkUtilization(
            //         dateFormat.format(startDate).substring(0, 7),
            //         dateFormat.format(endDate).substring(0, 7),
            //         machinelist);
            for (Map<String, Atom> map : dataList) {
                String date = map.get("date").asString();
                String pk = map.get("machine_id").asString() + "__" + date.substring(0, 6);
                Map downtimeMap = (Map) productWorkUtilization.get(pk);
                map.put("m2", new LongAtom(downtimeMap == null ? 0l : (long) downtimeMap.get("m2"), "", ""));
                map.put("m3", new LongAtom(downtimeMap == null ? 0l : (long) downtimeMap.get("m3"), "", ""));
            }
        }
        for (Map<String, Atom> map : dataList) {
            if (machinelist.contains(map.get("machine_id").asString())) {
                long power_millisecond = map.get("power_millisecond").asLong();
                long operate_millisecond = map.get("operate_millisecond").asLong();
                long cutting_millisecond = map.get("cutting_millisecond").asLong();
                long work_shift_millisecond = map.get("work_shift_millisecond").asLong();
                long m2 = map.get("m2") == null ? 0l : map.get("m2").asLong();
                long m3 = map.get("m3") == null ? 0l : map.get("m3").asLong();
                int year = Integer.parseInt(map.get("date").asString().substring(0, 4));
                int month = Integer.parseInt(map.get("date").asString().substring(4, 6));
                long sum_work_day = (long) map.get("sum_work_day").asInt();
                String denominatorType = data.get("denominator").toString();
                double denominator = 0;
                long millisecondPerDay = 24l * 60l * 60l * 1000l;
                switch (denominatorType) {
                    case "power_millisecond":
                        denominator = power_millisecond;
                        break;
                    case "work_shift_millisecond":
                        denominator = work_shift_millisecond;
                        break;
                    case "natural_day":
                        denominator = sum_work_day == 0 ? 0 : (sum_work_day * millisecondPerDay);
                        break;
                }
                double oee = denominator == 0 ? 0 : operate_millisecond / denominator;
                double effective_oee = denominator == 0 ? 0 : cutting_millisecond / denominator;
                Map<String, Object> Resultdatas = new HashMap<>();
                Resultdatas.put("machine_id", map.get("machine_id").asString());
                Resultdatas.put("power_millisecond", millisecondToHHmmss(map.get("power_millisecond").asLong()));
                Resultdatas.put("operate_millisecond", millisecondToHHmmss(map.get("operate_millisecond").asLong()));
                Resultdatas.put("cutting_millisecond", millisecondToHHmmss(map.get("cutting_millisecond").asLong()));
                Resultdatas.put("idle_millisecond", millisecondToHHmmss(map.get("idle_millisecond").asLong()));
                Resultdatas.put("denominator", denominator);
                Resultdatas.put("part_count", Integer.parseInt(map.get("part_count").asString()));
                Resultdatas.put("oee", doubleToPercentage(oee, 2));
                Resultdatas.put("effective_oee", doubleToPercentage(effective_oee, 2));
                Resultdatas.put("month", year + "/" + String.format("%02d", month));
                if (isShowDowntime) {
                    double capacity_oee = denominator == 0 ? 0 : (operate_millisecond + m2 + m3) / denominator;
                    Resultdatas.put("m2", millisecondToHHmmss(m2));
                    Resultdatas.put("m3", millisecondToHHmmss(m3));
                    Resultdatas.put("capacity_oee", doubleToPercentage(capacity_oee, 2));
                }
                resultList.add(Resultdatas);
            } else {
                return RequestResult.fail("指定機型沒有資料");
            }
        }


        if (resultList.size() != 0) {
            return RequestResult.success(resultList);
        } else {
            return RequestResult.fail("指定年月沒有資料");
        }
    }
    public List<Map<String, Atom>> hippoExhalerMonthUtil(int year, List<String> monthList, List<String> machinelist) {
        SimpleExhaler exhaler = HippoService.getInstance().newSimpleExhaler();
      //  Hippo hippo = HippoFactory.getHippo("src/main/resources/hippo.xml");
      //  SimpleExhaler exhaler=hippo.newSimpleExhaler();
        try {
            Future<SimpleExhalable> future =
                    exhaler.space("month_utilization_time")
                            .index("machine_id", machinelist.toArray())
                            .index("year", new String[]{String.valueOf(year)})
                            .index("month", monthList.toArray())
                            .columns("machine_id",
                                    "date",
                                    "power_millisecond",
                                    "operate_millisecond",
                                    "cutting_millisecond",
                                    "idle_millisecond",
                                    "alarm_millisecond",
                                    "work_shift_millisecond",
                                    "part_count",
                                    "sum_work_day"
                            )
                            .exhale();
            SimpleExhalable exhalable = future.get();
            return exhalable.toMapping();
        } catch (ExhaleException e) {
            e.printStackTrace();
            System.out.println(e.getMessage());
        } catch (InterruptedException e) {
            e.printStackTrace();
            System.out.println(e.getMessage());
        } catch (ExecutionException e) {
            e.printStackTrace();
            System.out.println(e.getMessage());
        }
        return null;
    }
    public Map getProductWorkUtilization(int year, List<String> monthList, List<String> machinelist) {
      SimpleExhaler exhaler = HippoService.getInstance().newSimpleExhaler();
      try {
          Future<SimpleExhalable> future =
                  exhaler.space("production_work_utilization_monthly")
                          .index("machine_id", machinelist.toArray())
                          .index("year", new String[]{String.valueOf(year)})
                          .index("month", monthList.toArray())
                          .columns("machine_id",
                                  "month",
                                  "M2",
                                  "M3"
                          )
                          .exhale();
          SimpleExhalable exhalable = future.get();
          List<Map<String, Atom>> dataList = exhalable.toMapping();
          Map result = new HashMap<>();
          for (Map<String, Atom> data : dataList) {
            String machine_id = data.get("machine_id").asString();
            String month = data.get("month").asString().replace("/", "");
            long m2 = (long) data.get("M2").asDouble();
            long m3 = (long) data.get("M3").asDouble();
            // Map macro_idle_minute_array = new Gson().fromJson(data.get("macro_idle_minute_array").asString(), Map.class);
            // long m2 = macro_idle_minute_array.get("2") == null ? 0l : (long) Double.parseDouble(macro_idle_minute_array.get("2").toString());
            // long m3 = macro_idle_minute_array.get("3") == null ? 0l : (long) Double.parseDouble(macro_idle_minute_array.get("3").toString());

            String pk = machine_id + "__" + month;
            Map macroMap = (Map) result.get(pk);
            if (macroMap == null) {
              macroMap = new HashMap<>();
              macroMap.put("m2", m2);
              macroMap.put("m3", m3);
              result.put(pk, macroMap);
            } else {
              macroMap.put("m2", (long) macroMap.get("m2") + m2);
              macroMap.put("m3", (long) macroMap.get("m3") + m3);
            }
          }
          return result;
      } catch (ExhaleException e) {
          e.printStackTrace();
          System.out.println(e.getMessage());
      } catch (InterruptedException e) {
          e.printStackTrace();
          System.out.println(e.getMessage());
      } catch (ExecutionException e) {
          e.printStackTrace();
          System.out.println(e.getMessage());
      }
      return null;
    }

}