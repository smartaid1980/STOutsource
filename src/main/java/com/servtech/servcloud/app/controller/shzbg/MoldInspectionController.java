package com.servtech.servcloud.app.controller.shzbg;

import com.servtech.servcloud.app.model.shzbg.QcRecord;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2018/6/26.
 */

@RestController
@RequestMapping("/shzbg/mold")
public class MoldInspectionController {
    private final Logger log = LoggerFactory.getLogger(MoldInspectionController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/readqcrecord", method = RequestMethod.POST)
    public RequestResult<List<Map>> readQcRecord(@RequestBody final Map data) {
        final String startDate = data.get("startDate").toString();
        final String endDate = data.get("endDate").toString();
        final String workId = data.get("workId") == null ? "" : data.get("workId").toString();
        final String moldId = data.get("moldId") == null ? "" : data.get("moldId").toString();
        final String machineId = data.get("machineId") == null ? "" : data.get("machineId").toString();

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT ");
                sb.append("mold_id, ");
                sb.append("part_id, ");
                sb.append("part_ed, ");
                sb.append("part_no, ");
                sb.append("work_id, ");
                sb.append("meas_datetime, ");
                sb.append("machine_id, ");
                sb.append("operator_id, ");

                //溫濕度
                sb.append("temp, ");
                sb.append("humidity, ");
                //間隙
                sb.append("nom_dev, ");
                sb.append("up_tol, ");
                sb.append("low_tol, ");
                //水平/高度間隙
                sb.append("xy_max_dev, ");
                sb.append("xy_min_dev, ");
                sb.append("xy_ave_dev, ");
                sb.append("z_max_dev, ");
                sb.append("z_min_dev, ");
                sb.append("z_ave_dev, ");
                sb.append("flatness, ");
                //矢量
                sb.append("points_ok_num, ");
                sb.append("points_tc_num, ");
                sb.append("points_ng_num, ");
                sb.append("part_result, ");
                //電機信息
                sb.append("offset_x, ");
                sb.append("offset_y, ");
                sb.append("offset_z, ");
                //模仁信息
                sb.append("stylus_name, ");
                sb.append("tip_name, ");
                sb.append("tip_dia, ");
                sb.append("used_temp_comp, ");
                //矢量點值
                sb.append("pnt_arry ");
                sb.append("FROM a_shzbg_qc_record ");
                sb.append("WHERE ");
                if (!"".equals(startDate) && !startDate.equals("null") && !"".equals(endDate) && !endDate.equals("null")) {
                    sb.append("(meas_datetime BETWEEN ");
                    sb.append("'" + startDate + " 00:00:00' ");
                    sb.append("AND ");
                    sb.append("'" + endDate + " 23:59:59' ) ");
                }

                if (!"".equals(workId) && !workId.equals("null")) {
                    sb.append("AND ");
                    sb.append("work_id = '" + workId + "' ");
                }

                if (!"".equals(moldId) && !moldId.equals("null")) {
                    sb.append("AND ");
                    sb.append("mold_id LIKE '%" + moldId + "%' ");
                }
                if (!"".equals(machineId) && !machineId.equals("null")) {
                    sb.append("AND ");
                    sb.append("machine_id = '" + machineId + "' ");
                }
                sb.append("ORDER BY meas_datetime");
                String sql = sb.toString();

                List<Map> result = QcRecord.findBySQL(sql).toMaps();
                for (Map map : result) {
                    String pointsValue = map.get("pnt_arry") == null ? "" : map.get("pnt_arry").toString();
                    String[] arrPointsValue = pointsValue.split("\\],");
                    List<String> pointsValues = new ArrayList<String>();

                    for (String str : arrPointsValue) {
                        pointsValues.add(str.replaceAll("[\\[\\]]",""));
                    }
                    map.put("pnt_arry", pointsValues);
                }
                return success(result);
            }
        });
    }
}
