package com.servtech.servcloud.app.controller.huangliang;

import com.servtech.servcloud.app.model.huangliang.QualityExamData;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * 品質檢測維護
 * Created by emma on 2016/8/23.
 */
@RestController
@RequestMapping("/huangliang/qualityExamData")
public class HuangLiangQualityExamDataController {

  @RequestMapping(value = "getData", method = POST)
  public RequestResult<?> getQualityRecord(@RequestBody final QueryParam queryParam) {
//        @RequestParam(value = "startDate", required = false) final String startDate,
//        @RequestParam(value = "endDate", required = false) final String endDate,
//        @RequestParam(value = "shiftList[]", required = false) final String[] shiftList,
//        @RequestParam(value = "machineList[]", required = false) final String[] machineList)
    try {

      if (queryParam.machineList == null || queryParam.shiftList == null) {
        return fail("Please select machines and work shift.");
      } else {
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
          @Override
          public RequestResult<?> operate() {

            List<String> param = new ArrayList<String>();
            param.add(queryParam.startDate + " 00:00:00");
            param.add(queryParam.endDate + " 23:59:59");
            param.addAll(queryParam.machineList);
            param.addAll(queryParam.shiftList);

            List<Map> datalist = QualityExamData.where(" date BETWEEN ? AND ? "
                + "AND machine_id IN ( " + Util.strSplitBy("?", ",", queryParam.machineList.size())
                + " ) AND work_shift_name IN( " + Util.strSplitBy("?", ",", queryParam.shiftList.size())
                + " ) ", param.toArray()).toMaps();

            return RequestResult.success(datalist);
          }
        });
      }
    } catch (Exception e) {
      e.printStackTrace();
      return RequestResult.fail(e.getMessage());
    }
  }

  @RequestMapping(value = "save", method = POST)
  public RequestResult saveData(@RequestBody final String[][] strAry) {
    return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
      @Override
      public RequestResult<String> operate() {
        for (String[] ary : strAry) {
          //System.out.println(ary[0] + ", " +ary[1] + ", " + ary[3] + ", " + ary[4] + ", "+ ary[5]);
          //QualityExamData qualityExam = new QualityExamData();
          QualityExamData qualityExam = QualityExamData.findFirst
              ("date = ? AND employee_id = ? AND work_shift_name = ? AND machine_id= ? AND order_id = ?"
                  , ary[0], ary[1], ary[3], ary[4], ary[5]);
          if (qualityExam == null) {
            qualityExam = new QualityExamData();
          }

          qualityExam.set("date", ary[0])
              .set("employee_id", ary[1])
              .set("work_shift_name", ary[3])
              .set("machine_id", ary[4])
              .set("order_id", ary[5])
              .set("multi_process", ary[6])
              .set("examination_defective", ary[8])
              .set("defective_reason", ary[9])
              .set("examination_goods", ary[10])
              .set("qc_partcount", ary[11])
              .set("qc_defectives", ary[12])
              .set("qc_goods", ary[13])
              .set("edit_group", ary[14])
              .set("repair_first_defectives", ary[15])
              .set("calibration_first_defectives", ary[16]);

          qualityExam.saveIt();
        }
        return success();
      }
    });
  }

  public static class QueryParam {
    String startDate;
    String endDate;
    List<String> machineList;
    List<String> shiftList;
  }
}
