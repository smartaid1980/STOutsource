package com.servtech.servcloud.app.controller.huangliang;

import com.servtech.hippopotamus.Atom;
import com.servtech.hippopotamus.Hippo;
import com.servtech.hippopotamus.SimpleExhalable;
import com.servtech.hippopotamus.SimpleExhaler;
import com.servtech.servcloud.app.model.huangliang.SampleManageId;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * 樣品管編補填
 * Created by emma on 2016/9/13.
 */
@RestController
@RequestMapping("/huangliang/sampleManageId")
public class HuangLiangSampleManageIdController {

    @RequestMapping(value = "save", method = POST)
    public RequestResult saveData(@RequestBody final List<Map> mapList){
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                for (Map map : mapList) {
                    SampleManageId sampleManageId = new SampleManageId();
                    sampleManageId.fromMap(map);
                    if (sampleManageId.exists()) {
                        sampleManageId.saveIt();
                    } else {
                        sampleManageId.insert();
                    }
                }
                return RequestResult.success();
            }
        });
    }
//    public RequestResult saveData(@RequestBody final String[][] strAry){
//        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
//            @Override
//            public RequestResult<String> operate() {
//                for(String[] ary: strAry) {
//                    SampleManageId manageId = SampleManageId.findFirst(
//                            "date = ? AND machine_id= ? AND macro521 = ? AND work_shift_name = ?"
//                            , ary[11], ary[1], ary[2], ary[4]);
//                    if(manageId==null){
//                        manageId = new SampleManageId();
//                    }
//
//                    manageId.set("date", ary[11])
//                            .set("machine_id", ary[1])
//                            .set("macro521", ary[2])
//                            .set("work_shift_name", ary[4])
//                            .set("work_shift_day", ary[0])
//                            .set("produce_start_tsp", handleTimeString(ary[5]))
//                            .set("produce_end_tsp", handleTimeString(ary[6]))
//                            .set("manage_id", ary[7])
//                            .set("regulate_start_tsp", handleTimeString(ary[8]))
//                            .set("idle_millisecond", ary[9])
//                            .set("unit_partcount", ary[10])
//                            .set("oper_millisecond_100", ary[12])
//                            .set("millisecond_305", ary[13])
//                            .set("millisecond_215", ary[14]);
//
//                    manageId.saveIt();
//                }
//                return success();
//            }
//        });
//    }

    @RequestMapping(value = "getAnalysisData", method = GET)
    public RequestResult analysis(@RequestParam(value = "manage_id", required = false) final String manage_id,
                                  @RequestParam(value = "customer_id", required = false) final String customer_id){

        List<Analysis> dataList = new ArrayList<Analysis>();
        Set<String> manageIdSet = new HashSet<String>();

        if(!manage_id.equals("")){
            manageIdSet.add(manage_id);

        }else if(!customer_id.equals("")){
            manageIdSet = getManageIdByCustomer(customer_id);
        }

        for(String sId: manageIdSet){
            Map<String, Analysis> dataMap = new HashMap<String, Analysis>();
            dataMap = getAnalysisMap(dataMap, sId);
            dataMap = getMergeMap(dataMap, sId);

            dataList = getDataList(dataList, dataMap);
        }

        return success(dataList);
    }

    private List<Analysis> getDataList(List<Analysis> dataList, Map<String, Analysis> dataMap){
        for(String sKey: dataMap.keySet()){
            Analysis analysis = dataMap.get(sKey);

            //總校車時間
            if(analysis.regulate_start_tsp !=null && analysis.produce_start_tsp!=null){
                analysis.regulate_tsp_sum = timeIntervalFullFormat(analysis.regulate_start_tsp
                        , analysis.produce_start_tsp
                        , 0, 0, analysis.millisecond_305);
            }else{
                if(analysis.regulate_start_tsp==null){
                    analysis.regulate_start_tsp = "---";
                }
                analysis.regulate_tsp_sum = "---";
            }

            //總生產時間
            if(analysis.oper_millisecond_100!=0){
                analysis.produce_tsp_sum_without_idle = timeIntervalFullFormat(
                        analysis.oper_millisecond_100,
                        analysis.millisecond_215,
                        analysis.millisecond_305);
            }else{
                analysis.produce_tsp_sum_without_idle = "---";
            }

            //加工時間
            if(analysis.oper_millisecond_100!=0){
                analysis.oper_millisecond_100 = analysis.oper_millisecond_100/1000/60;
            }

            dataList.add(analysis);
        }
        return dataList;
    }

    /**
     * @param manage_id 管編
     */
    private Map<String, Analysis> getAnalysisMap(Map<String, Analysis> map, String manage_id){
//        Map<String, Analysis> map = new HashMap<String, Analysis>();
        List<SampleManageId> list = getSampleDataFromDB(manage_id);

        for(SampleManageId sampleManageId: list){
            String key = sampleManageId.getString("manage_id") + "@"
                    + sampleManageId.getString("machine_id");

            if(map.containsKey(key)){
                Analysis analysis = map.get(key);

                if(sampleManageId.getString("regulate_start_tsp")!=null){
                    if(analysis.regulate_start_tsp==null){
                        analysis.regulate_start_tsp = sampleManageId.getString("regulate_start_tsp");
                    }
                }

                if(sampleManageId.getString("produce_start_tsp")!=null){
                    if(analysis.produce_start_tsp==null){
                        analysis.produce_start_tsp = sampleManageId.getString("produce_start_tsp");
                    }
                }

                if(sampleManageId.getString("produce_end_tsp")!=null){
                    if(analysis.produce_end_tsp==null){
                        analysis.produce_end_tsp = sampleManageId.getString("produce_end_tsp");
                    }
                }

                if(sampleManageId.getInteger("idle_millisecond") !=0){
                    analysis.idle_sum += sampleManageId.getLong("idle_millisecond");
                }

                if(sampleManageId.getLong("unit_partcount") !=0){
                    analysis.partcount_sum += sampleManageId.getInteger("unit_partcount");
                }

                if(sampleManageId.getLong("oper_millisecond_100")!=0){
                    analysis.oper_millisecond_100 += sampleManageId.getLong("oper_millisecond_100");
                }

                if(sampleManageId.getLong("millisecond_215")!=0){
                    analysis.millisecond_215 += sampleManageId.getLong("millisecond_215");
                }

                if(sampleManageId.getLong("millisecond_305")!=0){
                    analysis.millisecond_305 += sampleManageId.getLong("millisecond_305");
                }
            }else{
                map.put(key, new Analysis(sampleManageId));
            }
        }

        return map;
    }

    //取得客戶別底下所有管編資料
    private Set<String> getManageIdByCustomer(String customer_id){
        String[] space = {"HUL_golf_sample", "HUL_mrp_sample"};
        Set<String> manageIdSet = new HashSet<String>();

        for(String s: space){
            manageIdSet = getManageIdOfCustomer(s, customer_id, manageIdSet);
        }
        return manageIdSet;
    }

    private Map<String, Analysis> getMergeMap(Map<String, Analysis> dataMap, String manage_id){
        List<Map<String, Atom>> dataList = getDataFromHippo(manage_id);

        for(Map<String, Atom> map: dataList){
            String manage_id_hippo = map.get("manage_id").asString();
            String key = manage_id_hippo + "@" + map.get("machine_id").asString();

            if(dataMap.containsKey(key)){
                Analysis analysis = dataMap.get(key);

                if(map.get("regulate_start_tsp").asString()!=null && !map.get("regulate_start_tsp").asString().equals("---")){
                    if(analysis.regulate_start_tsp==null){
                        analysis.regulate_start_tsp = map.get("regulate_start_tsp").asString();
                    }else{
                        analysis.regulate_start_tsp =
                                timeCompare(analysis.regulate_start_tsp, map.get("regulate_start_tsp").asString());
                    }
                }

                if(map.get("produce_start_tsp").asString()!=null && !map.get("produce_start_tsp").asString().equals("---")){
                    if(analysis.produce_start_tsp==null){
                        analysis.produce_start_tsp = map.get("produce_start_tsp").asString();
                    }
                }

                if(map.get("produce_end_tsp").asString()!=null && !map.get("produce_end_tsp").asString().equals("---")){
                    if(analysis.produce_end_tsp==null){
                        analysis.produce_end_tsp = map.get("produce_end_tsp").asString();
                    }
                }

                if(map.get("idle_millisecond").asLong() !=0){
                    analysis.idle_sum += map.get("idle_millisecond").asLong();
                }

                if(map.get("unit_partcount").asLong() !=0){
                    analysis.partcount_sum += map.get("unit_partcount").asLong();
                }

                if(map.get("100_oper_millisecond").asLong()!=0){
                    analysis.oper_millisecond_100 += map.get("100_oper_millisecond").asLong();
                }

                if(map.get("215_millisecond").asLong()!=0){
                    analysis.millisecond_215 += map.get("215_millisecond").asLong();
                }

                if(map.get("305_millisecond").asLong()!=0){
                    analysis.millisecond_305 += map.get("305_millisecond").asLong();
                }
            }else{
                dataMap.put(key, new Analysis(map));
            }
        }
        return dataMap;
    }

    private Set<String> getManageIdOfCustomer(String space, String customer_id, Set<String> manageIdSet){

        try{
            Hippo hippo = HippoService.getInstance();
            SimpleExhaler exhaler = hippo.newSimpleExhaler();

            List<String> golfYearList = hippo.queryIndex(space);
            String[] monthArray = {"01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"};

            Future<SimpleExhalable> future =
                    exhaler.space(space)
                            .index("year", golfYearList.toArray())
                            .index("month", monthArray)
                            .columns("sample_id")
                            .exhale();

            SimpleExhalable exhalable = future.get();
            List<Map<String, Atom>> dataList = exhalable.toMapping();

            for(Map<String, Atom> map: dataList){
                String[] sampleIdAry = map.get("sample_id").asString().split("-");
                if(sampleIdAry.length>1){
                    if(sampleIdAry[1].equals(customer_id)){
                        manageIdSet.add(map.get("sample_id").asString());
                    }
                }
            }

        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }

        return manageIdSet;
    }

    private List getDataFromHippo(String manage_id){
        String[] machineAry = getMachineListFromDB();
        List<Map<String, Atom>> dataList = new ArrayList<Map<String, Atom>>();

        try {
            Hippo hippo = HippoService.getInstance();
            SimpleExhaler exhaler = hippo.newSimpleExhaler();

            Future<SimpleExhalable> future =
                    exhaler.space("HUL_sample_analysis")
                            .index("machine_id", machineAry)
                            .index("manage_id", new String[]{manage_id})
                            .columns("date", "machine_id", "manage_id", "macro521", "work_shift_day", "work_shift_name",
                                    "regulate_start_tsp", "produce_start_tsp", "produce_end_tsp", "unit_partcount",
                                    "idle_millisecond", "100_oper_millisecond", "305_millisecond", "215_millisecond")
                            .exhale();

            SimpleExhalable exhalable = future.get();
            dataList = exhalable.toMapping();

        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }

        return dataList;
    }

    private String[] getMachineListFromDB(){
        List<Device> list = ActiveJdbc.oper(new Operation<List<Device>>() {
            @Override
            public List<Device> operate() {
                List<Device> machineList = Device.findAll();
                machineList.size();

                return machineList;
            }
        });

        list.size();
        String[] machineAry = new String[list.size()];
        int i=0;
        for(Device d: list){
            machineAry[i] = d.getString("device_id");
            i++;
        }

        return machineAry;
    }

    /**
     * @param manage_id 管編
     * @return 以管編去DB查詢樣品資料
     */
    private List<SampleManageId> getSampleDataFromDB(final String manage_id){
        List<SampleManageId> list = ActiveJdbc.oper(new Operation<List<SampleManageId>>() {
            @Override
            public List<SampleManageId> operate() {
//                List<SampleManageId> sampleList = SampleManageId.where("manage_id LIKE '%"
//                        + manage_id + "%' ");
                List<SampleManageId> sampleList = SampleManageId.where("manage_id = ?", manage_id);
                sampleList.size();

                return sampleList;
            }
        });
        return list;
    }

    private String handleTimeString(String s){

        if(s!=null){
            if(s.equals("---")){
                return null;
            }

            if(s.length()>3 && s.startsWith("2")){
                s = s.substring(0,16);
            }else{
                s = covertDateFromDB(s);
            }
        }
        return s;
    }

    //處理從DB取出的時間
    private String covertDateFromDB(String s){
        try {
            DateFormat formatter = new SimpleDateFormat("MMM dd, yyyy HH:mm:ss a", Locale.ENGLISH);
            Date date = formatter.parse(s);

            formatter = new SimpleDateFormat("yyyyMMddHHmmssSS");
            s = formatter.format(date);

        } catch (ParseException e) {
            e.printStackTrace();
        }
        return s;
    }

    private String timeCompare(String time1, String time2){
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSS");
        String earlierTime = time1;
        try {
            Date date1 = sdf.parse(time1.substring(0,16));
            Date date2 = sdf.parse(time2.substring(0,16));

            if(date1.after(date2)){
                earlierTime = time2;
            }
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return earlierTime;
    }

    private String timeIntervalFullFormat(long oper_millisecond_100, long idleTime_215, long idleTime_305 ){
        return timeIntervalFullFormat("", "", oper_millisecond_100, idleTime_215, idleTime_305);
    }

    private String timeIntervalFullFormat(String startTime, String endTime,
                                          long oper_millisecond_100,long idleTime_305, long idleTime_215){
        long lTime;
        if(startTime.equals("") && endTime.equals("")){
            lTime = oper_millisecond_100/1000;
        }else if(startTime.equals("---") || endTime.equals("---")){
            lTime = 0;
        }else{
            lTime = timeInterval(startTime, endTime)/1000;
        }

        if(idleTime_305>0){
            lTime = lTime - (idleTime_305/1000);
        }

        if(idleTime_215>0){
            lTime = lTime - (idleTime_215/1000);
        }

        if(lTime>0){
            int day = (int)(lTime/60/60/24);
            int hour = (int)(lTime/60/60) - (day * 24);
            int minute = (int)(lTime/60) - (hour *60) - (day * 24 * 60);
            int second = (int)lTime - (minute*60) - (hour*60*60)  - (day*24*60*60);

            StringBuilder timeFormat = new StringBuilder();
            timeFormat.append(day).append("D")
                    .append(hour).append("H")
                    .append(minute).append("M")
                    .append(second).append("S");

            return timeFormat.toString();
        }else{
            System.out.println("Sample produce time < idle time...");
            return "---";
        }
    }

    private long timeInterval(String startTime, String endTime){
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSS");
        long lTime = 0;

        try {
            Date startDate = sdf.parse(startTime);
            Date endDate = sdf.parse(endTime);

            if(endDate.getTime() - startDate.getTime() >0){
                lTime = endDate.getTime() - startDate.getTime();
            }

        } catch (ParseException e) {
            e.printStackTrace();
        }

        return lTime;
    }

    public class Analysis{
        String manage_id;   //樣品管編
        String customer_id; //客戶別
        String machine_id;  //機台
        String regulate_start_tsp;  //校車開始時間
        String regulate_tsp_sum;    //總校車時間
        String produce_start_tsp;
        String produce_end_tsp;
        String produce_tsp_sum; //加工時間(含暫停)
        String produce_tsp_sum_without_idle; //樣品總時間(不含暫停)
        long idle_sum;   //暫停時間
        int partcount_sum;   //生產件數
        long oper_millisecond_100;  //macro522=100的運轉時間
        long millisecond_305;
        long millisecond_215;

        public Analysis(SampleManageId sampleManageId){
            this.manage_id = sampleManageId.getString("manage_id");
            this.machine_id = sampleManageId.getString("machine_id");
            this.regulate_start_tsp = sampleManageId.getString("regulate_start_tsp");
            this.produce_start_tsp = sampleManageId.getString("produce_start_tsp");
            this.produce_end_tsp = sampleManageId.getString("produce_end_tsp");
            this.idle_sum = sampleManageId.getLong("idle_millisecond");
            this.partcount_sum = sampleManageId.getInteger("unit_partcount");
            this.oper_millisecond_100 = sampleManageId.getLong("oper_millisecond_100");
            this.millisecond_305 = sampleManageId.getLong("millisecond_305");
            this.millisecond_215 = sampleManageId.getLong("millisecond_215");
        }

        public Analysis(Map<String, Atom> map){
            this.manage_id = map.get("manage_id").asString();
            this.machine_id = map.get("machine_id").asString();
            this.regulate_start_tsp = map.get("regulate_start_tsp").asString();
            this.produce_start_tsp = map.get("produce_start_tsp").asString();
            this.produce_end_tsp = map.get("produce_end_tsp").asString();
            this.idle_sum = map.get("idle_millisecond").asLong();
            this.partcount_sum = (int)map.get("unit_partcount").asLong();
            this.oper_millisecond_100 = map.get("100_oper_millisecond").asLong();
            this.millisecond_305 = map.get("305_millisecond").asLong();
            this.millisecond_215 = map.get("215_millisecond").asLong();
        }
    }
}
