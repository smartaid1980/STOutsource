package com.servtech.servcloud.app.controller.huangliang;

import com.servtech.hippopotamus.Atom;
import com.servtech.hippopotamus.Hippo;
import com.servtech.hippopotamus.SimpleExhalable;
import com.servtech.servcloud.app.model.huangliang.QualityExamData;
import com.servtech.servcloud.app.model.huangliang.SampleManageId;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
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

/**
 * for 機台稼動/產品品質稼動(人)/品質稼動
 * Created by emma on 2016/10/11.
 */
@RestController
@RequestMapping("/huangliang")
public class HuangLiangJiaController {

    @RequestMapping(value="/get/jiaQuality", method = GET)
    public RequestResult getJiaData(@RequestParam(value = "startDate", required = false) final String startDate,
                                  @RequestParam(value = "endDate", required = false) final String endDate,
                                  @RequestParam(value = "shift[]", required = false) final String[] shift,
                                  @RequestParam(value = "machine[]", required = false) final String[] machine
                                  ){
        List<QualityData> list = new ArrayList<QualityData>();
        try {
            Hippo hippo = HippoService.getInstance();
            Future<SimpleExhalable> future = hippo.newSimpleExhaler()
                    .space("HUL_jia_quality")
                    .index("machine_id", machine)
                    .index("work_shift_name", shift)
                    .indexRange("date", startDate.replaceAll("/", ""), endDate.replaceAll("/", ""))
                    .columns("machine_id", "work_shift_name", "date",
                            "user_id", "order_id", "multi_process",
                            "care_partcount")
                    .exhale();
            SimpleExhalable exhalable = future.get();
            List<Map<String, Atom>> hippoList =  exhalable.toMapping();

            List<QualityExamData> dbList = ActiveJdbc.oper(new Operation<List<QualityExamData>>() {
                @Override
                public List<QualityExamData> operate() {
                    StringBuilder sb = new StringBuilder();
                    sb.append("SELECT * FROM a_huangliang_quality_exam_data WHERE")
                            .append(" date BETWEEN '").append(startDate).append("' AND '").append(endDate)
                            .append("' AND work_shift_name IN ( ").append(combineString(shift)).append(") ")
                            .append(" AND machine_id IN ( ").append(combineString(machine)).append(") ");
                    System.out.println("sql=="+sb.toString());
                    List<QualityExamData> qualityList = QualityExamData.findBySQL(sb.toString());
                    qualityList.size();

                    return qualityList;
                }
            });
            list = mergeQuilityFromHippoAndDB(hippoList, dbList, "jia");
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
        return success(list);
    }

    private List<QualityData> mergeQuilityFromHippoAndDB(List<Map<String, Atom>> hippoList, List<QualityExamData> dbList, String reportType){
        List<QualityData> qualityList = new ArrayList<QualityData>();
        Map<String, QualityExamData> dbMap = new HashMap<String, QualityExamData>();
        for(QualityExamData qualityExamData: dbList){
            String key = covertDateFromDB(qualityExamData.getString("date")).substring(0,8)+"@"
                    +qualityExamData.getString("employee_id")+"@"
                    +qualityExamData.getString("work_shift_name")+"@"
                    +qualityExamData.getString("machine_id")+"@"
                    +qualityExamData.getString("order_id");

            dbMap.put(key.trim(), qualityExamData);
        }

        for(Map<String, Atom> map: hippoList){
            String employee_id = "user_id";
            if(reportType.equals("product")){
                employee_id = "macro521";
            }

            String key = map.get("date").asString()+"@"
                    + setFullEmployeeId(map.get(employee_id).asString())+"@"
                    + map.get("work_shift_name").asString()+"@"
                    + map.get("machine_id").asString()+"@"
                    + map.get("order_id").asString();

            if(dbMap.containsKey(key.trim())){

                QualityExamData qe = dbMap.get(key);
                int examination_defective = qe.getString("examination_defective").equals("") ?
                        0 : Integer.parseInt(qe.getString("examination_defective"));
                int qc_defectives = qe.getString("qc_defectives").equals("") ?
                        0 : Integer.parseInt(qe.getString("qc_defectives"));

                int qc_goods = qe.getInteger("qc_goods");

                qualityList.add(new QualityData(map,examination_defective, qc_defectives, qc_goods, reportType));

            }else{
                qualityList.add(new QualityData(map,0, 0, map.get("care_partcount").asInt(), reportType));
            }
        }
        return qualityList;
    }

    //處理從DB取出的時間, 最好可以抽出來...
    private String covertDateFromDB(String s){
        try {
//            DateFormat formatter = new SimpleDateFormat("MMM dd, yyyy HH:mm:ss a", Locale.ENGLISH);
            DateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.S", Locale.ENGLISH);
            Date date = formatter.parse(s);

            formatter = new SimpleDateFormat("yyyyMMddHHmmssSS");
            s = formatter.format(date);

        } catch (ParseException e) {
            e.printStackTrace();
        }
        return s;
    }

    private String combineString(String[] strAry){
        StringBuilder sb = new StringBuilder();
        int i=0;
        for(String s: strAry){
            sb.append("'").append(s).append("'");
            if(i<(strAry.length-1)){
                sb.append(" ,");
            }
            i++;
        }
        return sb.toString();
    }

    private String setFullEmployeeId(String employee_id){
        while(employee_id.length()<5){
            employee_id = "0" + employee_id;
        }

        return employee_id;
    }

    public class QualityData{
        String machine_id;
        String work_shift_name;
        String date;
        String user_id;
        String order_id;
        String multi_process;
        int care_partcount;
        int defectives;
        int qc_defectives;
        int qc_goods;
        double utilization;

        public QualityData(Map<String, Atom> map, int defectives, int qc_defectives, int qc_goods, String reportType){
            this.machine_id = map.get("machine_id").asString();
            this.work_shift_name = map.get("work_shift_name").asString();
            this.date = map.get("date").asString();
            this.order_id = map.get("order_id").asString();
            this.multi_process = map.get("multi_process").asString();
            this.care_partcount = map.get("care_partcount").asInt();
            this.defectives = defectives;
            this.qc_defectives = qc_defectives;
            this.qc_goods = qc_goods;
            if(reportType.equals("product")){
                this.utilization = map.get("utilization").asDouble();
                this.user_id = map.get("macro521").asString(); //產品稼動&機台稼動欄位名稱不同
            }else if(reportType.equals("jia")){
                this.user_id = map.get("user_id").asString();
            }
        }
    }
}
