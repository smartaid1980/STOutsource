package com.servtech.servcloud.app.controller.comoss;


import com.servtech.servcloud.app.controller.storage.util.RuleEnum;
import com.servtech.servcloud.app.controller.storage.util.StdQRCode;
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
import static com.servtech.servcloud.core.util.Util.getTimeLongFormat;

@RestController
@RequestMapping("/comoss/material")
public class ComossMaterialController {
    private static final Logger LOG = LoggerFactory.getLogger(ComossMaterialController.class);
    private static final RuleEnum RULE = RuleEnum.MATERIALTHING;
    private static final String LOCK = new String();

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = RequestMethod.GET)
    public RequestResult<?> readErpMaterial(@RequestParam final String whereclause) {

        synchronized (LOCK) {

            List<Map> result = getStorageMaterialFromErp(whereclause == null ? "" : whereclause);
            return success(result);
        }
    }

    private List<Map> getStorageMaterialFromErp(@RequestParam String whereclause) {
        String querySql = "SELECT *  FROM view_product_main WHERE " + whereclause;
        DatabaseJdbc databaseJdbc = new DatabaseJdbc();
        List<Map> result = null;

        if (databaseJdbc.connection()) {
            Connection conn = databaseJdbc.getConn();
            result = findStorageMaterial(querySql, conn);
        } else {
            result = new ArrayList<>();
        }
        return result;
    }

    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        Optional<String> billNo = Optional.of(data.get("bill_no").toString());
        Optional<Integer> billDetail = Optional.of(Integer.parseInt(data.get("bill_detail").toString()));
        Optional<String> billType = Optional.of(data.get("column1").toString());
        Optional<String> materialId = Optional.of(data.get("material_id").toString());
        Optional<String> materialSub = Optional.of(data.get("material_sub").toString());
        Optional<String> delivery = Optional.of(data.get("delivery_date").toString());
        Optional<String> remark = Optional.of(data.get("remark").toString());
        Optional<List<Map>> groups = Optional.of((List<Map>) data.get("groups"));

        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                try {
                    //最後要回傳的結果
                    List<Map> result = new ArrayList<>();
                    //要塞 Thing 的 ps
                    PreparedStatement thingPs = Base.startBatch("INSERT IGNORE INTO " + Thing.getTableName() +
                            " (thing_id, thing_cell, thing_unit, thing_pcs, thing_profile, thing_reversed, create_by, create_time, modify_by, modify_time) VALUES " +
                            " (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                    //要塞 Material Thing 的 ps
                    PreparedStatement materialThingPs = Base.startBatch("INSERT INTO " + MaterialThing.getTableName() +
                            " (thing_id, material_id, material_sub, remark, bill_from, bill_detail, code_no, column1, column2, column3, delivery_date, exp_date, in_stock, is_new, status, create_by, create_time, modify_by, modify_time) VALUES " +
                            " (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                    String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                    Timestamp timestamp = new Timestamp(System.currentTimeMillis());

                    Calendar cal = Calendar.getInstance();
                    cal.add(Calendar.DAY_OF_YEAR, 90);
                    // 有效日期
                    java.sql.Date expDate = new java.sql.Date(cal.getTimeInMillis());
                    // 有效日期 (前端使用)
                    SimpleDateFormat expSdf = new SimpleDateFormat("yyyy/MM/dd");
                    String expDateStr = expSdf.format(cal.getTimeInMillis());
                    // 流水號時間
                    SimpleDateFormat sdf = new SimpleDateFormat("yyMMdd");


                    // 最後一筆流水號 預設為0
                    int last = 0;
                    //流水號前綴
                    String prefix = materialId.get() + sdf.format(System.currentTimeMillis());
                    Thing thing = Thing.findFirst("thing_id like ? order by thing_id desc", prefix + "%");
                    // 找 Thing 該 Material 的 最後一筆資料的流水號
                    if (thing != null) {
                        String lastThingId = thing.getString("thing_id");
                        int index = lastThingId.indexOf(prefix);
                        last = Integer.parseInt(lastThingId.substring(index + prefix.length()));
                    }

                    String isNull = null;
                    for (Map map : groups.get()) {

                        String thingId = String.format(RuleEnum.getSeq(RULE, last), prefix);
                        map.put("thing_id", thingId);

                        thingPs.setString(1, thingId);
                        thingPs.setInt(2, 1);
                        thingPs.setString(3, map.get("thing_unit").toString());
                        thingPs.setDouble(4, Double.parseDouble(map.get("thing_pcs").toString()));
                        thingPs.setString(5, null);
                        thingPs.setString(6, null);
                        thingPs.setString(7, user);
                        thingPs.setLong(8, getTimeLongFormat());
                        thingPs.setString(9, user);
                        thingPs.setLong(10, getTimeLongFormat());
                        thingPs.addBatch();

                        // material Thing 的部份
                        materialThingPs.setString(1, thingId);
                        materialThingPs.setString(2, materialId.get());
                        materialThingPs.setString(3, materialSub.get());
                        materialThingPs.setString(4, remark.get());
                        materialThingPs.setString(5, billNo.get());
                        materialThingPs.setInt(6, billDetail.get());
                        materialThingPs.setInt(7, Integer.parseInt(map.get("code_no").toString()));
                        materialThingPs.setString(8, map.get("position_id") == null ? "-1": map.get("position_id").toString());
                        materialThingPs.setString(9, billType.get());
                        materialThingPs.setObject(10, map.getOrDefault("schedule_thing_id", isNull));
                        materialThingPs.setString(11, delivery.get());
                        materialThingPs.setString(12, delivery.get());
                        materialThingPs.setInt(13, 0);
                        materialThingPs.setInt(14, 1);
                        materialThingPs.setInt(15, 0);
                        materialThingPs.setString(16, user);
                        materialThingPs.setLong(17, getTimeLongFormat());
                        materialThingPs.setString(18, user);
                        materialThingPs.setLong(19, getTimeLongFormat());
                        materialThingPs.addBatch();
                        last++;
                    }
                    int generateCodeStatus = 1;
                    int updatecount = BillStockIn.update("status=?", "bill_no=? AND bill_detail=?", generateCodeStatus, billNo.get(), billDetail.get());
                    if (updatecount <= 0) {
                        return RequestResult.fail("update bill_stock_in status fail....");
                    }
                    thingPs.executeBatch();
                    materialThingPs.executeBatch();
                    return RequestResult.success(groups.get());
                } catch (SQLException e) {
                    e.printStackTrace();
                    return RequestResult.fail(data);
                }
            });
        }
    }

    @RequestMapping(value = "/thing", method = RequestMethod.GET)
    public RequestResult<?> thing(@RequestParam("material_id") final String materialId,
                                  @RequestParam("start_date") final String startDate,
                                  @RequestParam("end_date") final String endDate) {
        return ActiveJdbc.operTx(() -> {
            final long oneDayMillisecond = 86399000;
            SimpleDateFormat dayTimeFormat = new SimpleDateFormat("yyyy/MM/dd");
//            SimpleDateFormat fullTimeFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
            try {
                Date startTime = dayTimeFormat.parse(startDate);
                Date endTime = dayTimeFormat.parse(endDate);
                Timestamp start = new Timestamp(startTime.getTime());
                Timestamp end = new Timestamp((endTime.getTime() + oneDayMillisecond));

                List<Map> materialThingList = MaterialThing.find("material_id=? AND create_time Between ? AND ?", materialId, start, end).include(Thing.class).toMaps();
                materialThingList.forEach(map -> {
                    Map thing = (Map) map.get("thing");
                    map.put("thing_pcs", thing.get("thing_pcs"));
//                map.remove("thing");
                });

                return RequestResult.success(materialThingList);
            } catch (ParseException e) {
                e.printStackTrace();
                return RequestResult.fail("Date Parse is fail plz check..");
            }

        });
    }

    static List<Map> findStorageMaterial(String sql, Connection conn) {
        Statement st = null;
        ResultSet rs = null;
        List<Map> result = new ArrayList<>();
        try {
            conn.setAutoCommit(false);
            st = conn.createStatement();
            rs = st.executeQuery(sql);
            while (rs.next()) {
                Map map = new HashMap();
                map.put("material_id", rs.getString("ProdID"));
                map.put("class_id", rs.getString("ClassID"));
                map.put("class_name", rs.getString("ClassName"));
                map.put("material_name", rs.getString("ProdName"));
                map.put("unit", rs.getString("Unit"));
                map.put("base_inc", rs.getString("BaseInc"));
                map.put("pack_amt1", rs.getString("PackAmt1"));
                map.put("pack_amt2", rs.getString("PackAmt2"));
                map.put("batch_used", rs.getString("BatchUsed"));
                result.add(map);
            }
            rs.close();
            st.close();
        } catch (Exception e) {
            e.printStackTrace();
            try {
                conn.rollback();
            } catch (SQLException e1) {
                e1.printStackTrace();
            }
        } finally {
            try {
                rs.close();
                st.close();
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return result;
    }

    @RequestMapping(value = "/tablet/qrcode", method = RequestMethod.POST)
    public RequestResult<?> getTabletQrcodeJson(@RequestBody final Map data) {
        return ActiveJdbc.operTx(() -> {
            List<Map<String, Object>> resultList = new ArrayList<>();

            String bill_no = data.get("bill_no").toString();
//            int bill_detail = (int)data.get("bill_detail");
            String bill_detail = data.get("bill_detail").toString();
            String material_no = data.get("material_no").toString();
            String material_sub = data.get("material_sub").toString();
            List<BillStockInMaterialThing> bsimts = BillStockInMaterialThing.find("bill_from = ? and material_id = ? and material_sub = ? and bill_detail = ? and in_stock = 0", bill_no, material_no, material_sub, bill_detail);

            if (bsimts != null) {
                for (BillStockInMaterialThing bsimt : bsimts) {

                    Map<String, Object> resultMap = new HashMap<>();
                    resultMap.put("qrcode", bsimt.getString("thing_id"));
                    resultMap.put("bill_date", bsimt.getString("bill_date"));

                    resultMap.put("material_id", bsimt.getString("material_id"));
                    resultMap.put("material_sub", bsimt.getString("material_sub"));

                    resultMap.put("bill_no", bsimt.getString("bill_from"));
                    resultMap.put("thing_id", bsimt.getString("thing_id"));
                    resultMap.put("code_no", bsimt.getString("code_no"));
                    resultMap.put("thing_pcs", bsimt.getString("thing_pcs"));

                    resultList.add(resultMap);
                }
            }
            return RequestResult.success(resultList);
        });

    }
}
