package com.servtech.servcloud.app.controller.comoss;


import com.servtech.servcloud.app.controller.storage.util.RuleEnum;
import com.servtech.servcloud.app.controller.storage.util.StdQRCode;
import com.servtech.servcloud.app.model.comoss.MaterialScheduleThing;
import com.servtech.servcloud.app.model.comoss.PurchaseOrder;
import com.servtech.servcloud.app.model.comoss.ScheduleThing;
import com.servtech.servcloud.app.model.comoss.StoreScheduleThingMap;
import com.servtech.servcloud.app.model.storage.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.service.sql.DatabaseJdbc;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Date;

import static com.servtech.servcloud.core.util.RequestResult.success;
import static com.servtech.servcloud.core.util.Util.getDateParseLong;
import static com.servtech.servcloud.core.util.Util.getTimeLongFormat;

@RestController
@RequestMapping("/comoss/schedule/material")
public class StorageScheduleMaterialController {
    private static final Logger LOG = LoggerFactory.getLogger(StorageScheduleMaterialController.class);
    private static final RuleEnum RULE = RuleEnum.MATERIALTHING;
    private static final String LOCK = new String();

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        Optional<String> PurOrderType = Optional.of(data.get("pur_order_type").toString());
        Optional<String> PurId = Optional.of(data.get("pur_id").toString());
        Optional<String> SerialNum = Optional.of(data.get("serial_num").toString());
        Optional<String> materialId = Optional.of(data.get("material_id").toString());
        Optional<List<Map>> groups = Optional.of((List<Map>) data.get("groups"));

        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                try {
                    //要塞 ScheduleThing 的 ps
                    PreparedStatement scheduleThingPs = Base.startBatch("INSERT INTO " + ScheduleThing.getTableName() +
                            " (schedule_thing_id, thing_cell, thing_unit, thing_pcs, thing_profile, thing_reversed, create_by, create_time, modify_by, modify_time) VALUES " +
                            " (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                    //要塞 MaterialScheduleThing 的 ps
                    PreparedStatement materialScheduleThingPs = Base.startBatch("INSERT INTO " + MaterialScheduleThing.getTableName() +
                            " (schedule_thing_id, material_id, pur_order_type, pur_id, serial_num, code_no, column1, column2, column3, status, create_by, create_time, modify_by, modify_time) VALUES " +
                            " (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                    String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "unKnow user" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

                    Calendar cal = Calendar.getInstance();
                    cal.add(Calendar.DAY_OF_YEAR, 90);
                    // 有效日期
                    java.sql.Date expDate = new java.sql.Date(cal.getTimeInMillis());
                    // 有效日期 (前端使用)
                    SimpleDateFormat expSdf = new SimpleDateFormat("yyyy/MM/dd");
                    String expDateStr = expSdf.format(cal.getTimeInMillis());
                    // 流水號時間
                    SimpleDateFormat sdf = new SimpleDateFormat("yyMMdd");
                    SimpleDateFormat stdsdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");


                    // 最後一筆流水號 預設為0
                    int last = 0;
                    //流水號前綴
                    String prefix = materialId.get() + sdf.format(System.currentTimeMillis());
                    ScheduleThing scheduleThing = ScheduleThing.findFirst("schedule_thing_id like ? order by schedule_thing_id desc", prefix + "%");
                    // 找 Thing 該 Material 的 最後一筆資料的流水號
                    if (scheduleThing != null) {
                        String lastScheduleThingId = scheduleThing.getString("schedule_thing_id");
                        int index = lastScheduleThingId.indexOf(prefix);
                        last = Integer.parseInt(lastScheduleThingId.substring(index + prefix.length()));
                    }

                    String isNull = null;
                    for (Map map : groups.get()) {

                        String scheduleThingId = String.format(RuleEnum.getSeq(RULE, last), prefix);
                        map.put("schedule_thing_id", scheduleThingId);

                        scheduleThingPs.setString(1, scheduleThingId);
                        scheduleThingPs.setInt(2, 1);
                        scheduleThingPs.setString(3, map.get("thing_unit").toString());
                        scheduleThingPs.setDouble(4, Double.parseDouble(map.get("thing_pcs").toString()));
                        scheduleThingPs.setString(5, null);
                        scheduleThingPs.setString(6, null);
                        scheduleThingPs.setString(7, user);
                        scheduleThingPs.setLong(8, getTimeLongFormat());
                        scheduleThingPs.setString(9, user);
                        scheduleThingPs.setLong(10, getTimeLongFormat());
                        scheduleThingPs.addBatch();

                        // material Thing 的部份
                        materialScheduleThingPs.setString(1, scheduleThingId);
                        materialScheduleThingPs.setString(2, materialId.get());
                        materialScheduleThingPs.setString(3, PurOrderType.get());
                        materialScheduleThingPs.setString(4, PurId.get());
                        materialScheduleThingPs.setString(5, SerialNum.get());
                        materialScheduleThingPs.setInt(6, Integer.parseInt(map.get("code_no").toString()));
                        materialScheduleThingPs.setString(7, isNull);
                        materialScheduleThingPs.setString(8, isNull);
                        materialScheduleThingPs.setString(9, isNull);
                        materialScheduleThingPs.setInt(10, 0);
                        materialScheduleThingPs.setString(11, user);
                        materialScheduleThingPs.setLong(12, getTimeLongFormat());
                        materialScheduleThingPs.setString(13, user);
                        materialScheduleThingPs.setLong(14, getTimeLongFormat());
                        materialScheduleThingPs.addBatch();
                        last++;
                    }
                    int generateCodeStatus = 1;
                    int updatecount = PurchaseOrder.update("status=?, modify_by= ?, modify_time = ?", "pur_order_type=? AND pur_id=? AND serial_num=?", generateCodeStatus, user, getTimeLongFormat(), PurOrderType.get(), PurId.get(), SerialNum.get());
                    if (updatecount <= 0) {
                        return RequestResult.fail("update purchase order status fail....");
                    }
                    scheduleThingPs.executeBatch();
                    materialScheduleThingPs.executeBatch();
                    return RequestResult.success(groups.get());
                } catch (Exception e) {
                    e.printStackTrace();
                    return RequestResult.fail(data);
                }
            });
        }
    }
}
