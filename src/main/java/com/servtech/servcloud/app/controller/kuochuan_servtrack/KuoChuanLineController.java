package com.servtech.servcloud.app.controller.kuochuan_servtrack;

import com.servtech.servcloud.app.model.kuochuan_servtrack.KcLine;
import com.servtech.servcloud.app.model.kuochuan_servtrack.view.LineTrackingView;
import com.servtech.servcloud.app.model.kuochuan_servtrack.view.LineView;
import com.servtech.servcloud.app.model.servtrack.Line;
import com.servtech.servcloud.app.model.servtrack.ShiftTime;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;


/**
 * Created by Frank on 2017/7/25.
 */

@RestController
@RequestMapping("/kuochuan/servtrack/line")
public class KuoChuanLineController {
    private static final Logger log = LoggerFactory.getLogger(KuoChuanLineController.class);


    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    data.put("qrcode_line", UUID.randomUUID().toString().replace("-", ""));

                    Line line = new Line();
                    line.fromMap(data);
                    Map mData = new HashMap();
                    mData.put("line_id", data.get("line_id").toString());
                    mData.put("is_valid", "Y");

                    KcLine kcline = new KcLine();
                    kcline.fromMap(mData);

                    if (line.insert() && kcline.insert()) {
                        return success(kcline.getString("line_id"));
                    } else {
                        return fail("新增失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/createinvalid", method = POST)
    public RequestResult<String> createInvalid(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    data.put("qrcode_line", UUID.randomUUID().toString().replace("-", ""));

                    Line line = new Line();
                    line.fromMap(data);
                    Map mData = new HashMap();
                    mData.put("line_id", data.get("line_id").toString());
                    mData.put("is_valid", "N");

                    KcLine kcline = new KcLine();
                    kcline.fromMap(mData);

                    if (line.insert() && kcline.insert()) {
                        return success(kcline.getString("line_id"));
                    } else {
                        return fail("新增失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read(@RequestParam("line_id") final String lineId) {
        final String line_id = lineId;

        if (line_id !=null && !line_id.equals("null") && !line_id.equals("")) {
            return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(LineView.find("line_id=? AND is_valid=?", line_id, "Y").toMaps());
                }
            });
        } else {
            return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(LineView.find("is_valid=?", "Y").include().toMaps());
                }
            });
        }
    }

    @RequestMapping(value = "/readinvalid", method = GET)
    public RequestResult<List<Map>> readInvalid(@RequestParam("line_id") final String lineId) {
        final String line_id = lineId;

        if (line_id !=null && !line_id.equals("null") && !line_id.equals("")) {
            return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(LineView.find("line_id=? AND is_valid=?", line_id, "N").toMaps());
                }
            });
        } else {
            return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(LineView.find("is_valid=?", "N").include().toMaps());
                }
            });
        }
    }

    @RequestMapping(value = "/readtracking", method = POST)
    public RequestResult<List<Map>> readTracking(@RequestBody final Map data) {
        final String line_id = data.get("line_id").toString();
        final String shift_day = data.get("shift_day").toString();

        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * FROM a_kuochuan_servtrack_view_line_tracking ");
                sb.append("WHERE ");
                sb.append("shift_day = '" + shift_day + "' ");
                sb.append("AND ");
                sb.append("line_id = '" + line_id + "' ");
                sb.append("AND ");
                sb.append("is_open not IN('N') ");
                sb.append("AND ");
                sb.append("is_valid not IN('N') ");

                String sql = sb.toString();
                System.out.println(sql);
                List<Map> shiftTime = ShiftTime.findBySQL("SELECT * FROM a_servtrack_shift_time ").toMaps();
                List<Map> result = LineTrackingView.findBySQL(sql).toMaps();
                if(!shiftTime.isEmpty()){
                    for (Map mData : result) {
                        String shiftDay = mData.get("shift_day").toString();
                        mData.put("shift_day", shiftDay);
                        mData.put("start_time", shiftTime.get(0).get("start_time").toString());
                        mData.put("end_time", shiftTime.get(0).get("end_time").toString());
                        mData.put("duration_sp", shiftTime.get(0).get("duration_sp").toString());
                    }
                } else {
                    System.out.println("班次:" + shift_day + "線別:" + line_id + "沒有設定班次天起訖時間，系統代入起始時間00:00:00，結束時間23:59:59，班次天時間24小時");
                    for (Map mData : result) {
                        String shiftDay = mData.get("shift_day").toString();
                        mData.put("shift_day", shiftDay);
                        mData.put("start_time", "00:00:00");
                        mData.put("end_time", "23:59:59");
                        mData.put("duration_sp", 24.00);
                    }
                }
                return success(result);
            }
        });
    }

}

