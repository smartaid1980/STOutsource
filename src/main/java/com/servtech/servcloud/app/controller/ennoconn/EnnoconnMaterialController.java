package com.servtech.servcloud.app.controller.ennoconn;


import com.google.gson.Gson;
import com.servtech.servcloud.app.controller.storage.util.RuleEnum;
import com.servtech.servcloud.app.controller.storage.util.StdQRCode;
import com.servtech.servcloud.app.model.ennoconn.ThingPre;
import com.servtech.servcloud.app.model.storage.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.Cookie;
import com.servtech.servcloud.core.util.Language;
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

import static com.servtech.servcloud.app.controller.ennoconn.SMTController.writeFileAndCallCMD;
import static com.servtech.servcloud.app.controller.ennoconn.TSCQRCodeController.checkTSCStatus;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static com.servtech.servcloud.core.util.Util.getTimeLongFormat;

@RestController
@RequestMapping("/ennoconn/material")
public class EnnoconnMaterialController {
    private static final Logger LOG = LoggerFactory.getLogger(EnnoconnMaterialController.class);
    private static final RuleEnum RULE = RuleEnum.MATERIALTHING;
    private static final String LOCK = new String();
    private static Gson gson = new Gson();

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/qrcode", method = RequestMethod.GET)
    public void qucode(@RequestParam("thing_id[]") String[] ids) {
        ActiveJdbc.operTx(() -> {
            String langTag = Cookie.get(request, "lang");

            StringJoiner stringJoiner = new StringJoiner(",");
            for (String id : ids) {
                stringJoiner.add("?");
            }
            List<MaterialThing> thingList = MaterialThing.find("thing_id IN (" + stringJoiner.toString() + ")", ids);
            StdQRCode stdQRCode = new StdQRCode();
            stdQRCode.genDoc(thingList.size());

            for (int i = 0; i < thingList.size(); i++) {
                MaterialThing thing = thingList.get(i);
                stdQRCode.addImg(i, "_" + thing.getString("thing_id"));
                stdQRCode.addTexts(Language.get(langTag, "i18n_ServCloud_Material_Coding") + ": " + thing.getString("thing_id"));
                stdQRCode.addTexts(Language.get(langTag, "i18n_ServCloud_Raw_Material_Number") + ": " + thing.getString("material_id"));
                stdQRCode.addTexts(Language.get(langTag, "i18n_ServCloud_The_Purchases") + ": " + (thing.getString("delivery_date") == null ? "N/A" : thing.getString("delivery_date")));
                stdQRCode.next();
            }
            stdQRCode.write(response);
            stdQRCode.delete();
            return null;
        });
    }

    @RequestMapping(value = "/qrcode-by-tsc", method = RequestMethod.GET)
    public RequestResult<?> qucodeByTSC(@RequestParam("thing_id[]") String[] ids) {
        return ActiveJdbc.operTx(() -> {

            StringJoiner stringJoiner = new StringJoiner(",");
            for (String id : ids) {
                stringJoiner.add("?");
            }
            List<MaterialThing> thingList = MaterialThing.find("thing_id IN (" + stringJoiner.toString() + ")", ids);

            //怕有運算的時間差，所以處理好後，產生temp_code檔案前在檢查
            String temp_code_file_name = checkTSCStatus();
            if (temp_code_file_name != null) {
                return RequestResult.fail(temp_code_file_name);
            }

            temp_code_file_name = printQrcodeByTSC(thingList);
            if (temp_code_file_name == null) {
                return RequestResult.fail("CMD fail..");
            }
            return RequestResult.success(temp_code_file_name);

        });
    }

    private String printQrcodeByTSC(List<MaterialThing> thingList) {
        String langTag = Cookie.get(request, "lang");
        List<Map<String, String>> fileContentList = new ArrayList<>();
        for (int i = 0; i < thingList.size(); i++) {
            Map<String, String> map = new HashMap<>();
            MaterialThing thing = thingList.get(i);
            String thingIdText = Language.get(langTag, "i18n_ServCloud_Material_Coding") + ": " + thing.getString("thing_id");
            String materialIdText = Language.get(langTag, "i18n_ServCloud_Raw_Material_Number") + ": " + thing.getString("material_id");
            String deliveryDateText = Language.get(langTag, "i18n_ServCloud_The_Purchases") + ": " + (thing.getString("delivery_date") == null ? "N/A" : thing.getString("delivery_date"));
            map.put(thing.getString("thing_id"), thingIdText + "\n" + materialIdText + "\n" + deliveryDateText);
            fileContentList.add(map);
        }
        return writeFileAndCallCMD(gson.toJson(fileContentList), "thing");
    }

    @RequestMapping(value = "pre-pkg-print-qrcode-by-tsc", method = RequestMethod.GET)
    public RequestResult<?> prePKGPrintQucodeByTSC(@RequestParam("thing_id[]") String[] ids) {

        return ActiveJdbc.operTx(() -> {
            //怕有運算的時間差，所以處理好後，產生temp_code檔案前在檢查
            String temp_code_file_name = checkTSCStatus();
            if (temp_code_file_name != null) {
                return RequestResult.fail(temp_code_file_name);
            }
            List<String> idList = Arrays.asList(ids);
            temp_code_file_name = printPreQrcodeByTSC(idList);
            if (temp_code_file_name == null) {
                return RequestResult.fail("CMD fail..");
            }
            return RequestResult.success(temp_code_file_name);
        });
    }

    @RequestMapping(value = "pre-create-and-print-qrcode-by-tsc", method = RequestMethod.GET)
    public RequestResult<?> preCreateAndPrintQrcodeByTSC(@RequestParam(value = "count") final double createCount) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                try {
                    Date now = new Date();
                    Object user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    SimpleDateFormat sdf = new SimpleDateFormat("yyMMdd");

                    //流水號前綴
                    String prefix = "T" + sdf.format(System.currentTimeMillis()) + "-";

                    int last = getLast(prefix);

                    PreparedStatement thingPrePs = Base.startBatch(getThingPreInsertSql());

                    List<String> ids = new ArrayList<>();
                    for (int i = 0; i < createCount; i++) {
                        String thingId = String.format(RuleEnum.getSeq(RULE, last), prefix);
                        ids.add(thingId);
                        Base.addBatch(thingPrePs, thingId, user, now, user, now);
                        last++;
                    }
                    if (last + createCount > 9999) {
                        return RequestResult.fail("今日已建數量:" + last + "，此次新增" + (int) createCount + "筆失敗，每日累計數量不能超過9999");
                    }

                    //怕有運算的時間差，所以處理好後，產生temp_code檔案前在檢查
                    String temp_code_file_name = checkTSCStatus();
                    if (temp_code_file_name != null) {
                        return RequestResult.fail(temp_code_file_name);
                    }
                    Base.executeBatch(thingPrePs);

                    temp_code_file_name = printPreQrcodeByTSC(ids);
                    if (temp_code_file_name == null) {
                        return RequestResult.fail("CMD fail..");
                    }
                    return RequestResult.success(temp_code_file_name);
                } catch (Exception e) {
                    e.printStackTrace();
                    return RequestResult.fail(e.getMessage());
                }
            });
        }
    }

    private String printPreQrcodeByTSC(List<String> ids) {
        String langTag = Cookie.get(request, "lang");
        List<Map<String, String>> fileContentList = new ArrayList<>();
        for (int i = 0; i < ids.size(); i++) {
            Map<String, String> map = new HashMap<>();
            String thing_id = ids.get(i);
            map.put(thing_id, Language.get(langTag, "i18n_ServCloud_Material_Coding") + ": " + thing_id);
            fileContentList.add(map);
        }
        return writeFileAndCallCMD(gson.toJson(fileContentList), "preThing");
    }

    @RequestMapping(value = "check-pre-pkg", method = RequestMethod.GET)
    public RequestResult<?> checkPrePKGIsOverLimit(@RequestParam(value = "count") final double createCount) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                try {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyMMdd");
                    //流水號前綴
                    String prefix = "T" + sdf.format(System.currentTimeMillis()) + "-";

                    int last = getLast(prefix);
                    if (last + createCount > 9999) {
                        return RequestResult.fail("今日已建數量:" + last + "，此次新增" + (int) createCount + "筆失敗，每日累計數量不能超過9999");
                    } else {
                        return RequestResult.success();
                    }

                } catch (Exception e) {
                    e.printStackTrace();
                    return RequestResult.fail(e.getMessage());
                }
            });
        }
    }

    @RequestMapping(value = "pre-create-and-return-qrcode", method = RequestMethod.GET)
    public RequestResult<?> preCreate(@RequestParam(value = "count") final double createCount) {

        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                try {
                    Date now = new Date();
                    Object user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    SimpleDateFormat sdf = new SimpleDateFormat("yyMMdd");

                    //流水號前綴
                    String prefix = "T" + sdf.format(System.currentTimeMillis()) + "-";

                    int last = getLast(prefix);

                    PreparedStatement thingPrePs = Base.startBatch(getThingPreInsertSql());

                    List<String> ids = new ArrayList<>();
                    for (int i = 0; i < createCount; i++) {
                        String thingId = String.format(RuleEnum.getSeq(RULE, last), prefix);
                        ids.add(thingId);
                        Base.addBatch(thingPrePs, thingId, user, now, user, now);
                        last++;
                    }
                    if (last + createCount > 9999) {
                        return RequestResult.fail("今日已建數量:" + last + "，此次新增" + (int) createCount + "筆失敗，每日累計數量不能超過9999");
                    }
                    Base.executeBatch(thingPrePs);
                    printQrcode(ids);
                } catch (Exception e) {
                    e.printStackTrace();
                    return RequestResult.fail(e.getMessage());
                }
                return RequestResult.success();
            });
        }
    }

    private int getLast(String prefix) {
        // 最後一筆流水號 預設為0
        int last = 0;
        ThingPre thingPre = ThingPre.findFirst("thing_id like ? order by thing_id desc", prefix + "%");
        // 找 Thing 該 Material 的 最後一筆資料的流水號
        if (thingPre != null) {
            String lastThingId = thingPre.getString("thing_id");
            int index = lastThingId.indexOf(prefix);
            last = Integer.parseInt(lastThingId.substring(index + prefix.length()));
        }
        return last;
    }

    private void printQrcode(List<String> ids) {
        String langTag = Cookie.get(request, "lang");

        StringJoiner stringJoiner = new StringJoiner(",");
        for (String id : ids) {
            stringJoiner.add("?");
        }
//        List<ThingPre> thingList = ThingPre.find("thing_id IN (" + stringJoiner.toString() + ")", ids);
        StdQRCode stdQRCode = new StdQRCode();
        stdQRCode.genDoc(ids.size());

        for (int i = 0; i < ids.size(); i++) {
            String thing_id = ids.get(i);
            stdQRCode.addImg(i, thing_id);
            stdQRCode.addTexts(Language.get(langTag, "i18n_ServCloud_Material_Coding") + ": " + thing_id);
            stdQRCode.next();
        }
        stdQRCode.write(response);
        stdQRCode.delete();
    }

    private String getThingPreInsertSql() {
        StringBuilder sb = new StringBuilder();
        sb.append("INSERT INTO a_storage_thing_pre ");
        sb.append("(thing_id, create_by, create_time, modify_by, modify_time) ");
        sb.append("VALUES(?, ?, ?, ?, ?) ");
        sb.append("ON DUPLICATE KEY UPDATE ");
        sb.append("thing_id = VALUES(thing_id), ");
        sb.append("create_by = VALUES(create_by), ");
        sb.append("create_time = VALUES(create_time), ");
        sb.append("modify_by = VALUES(modify_by), ");
        sb.append("modify_time = VALUES(modify_time); ");
        return sb.toString();
    }

    @RequestMapping(value = "unlock", method = RequestMethod.PUT)
    public RequestResult<?> unbind(@RequestBody Map data) {
        return ActiveJdbc.operTx(() -> {
            List<String> thing_ids = (List<String>) data.get("thing_ids");
            String sql = String.format("update a_storage_material_thing set in_stock = 1 where thing_id in %s", getThingIdsIn(thing_ids));
            System.out.println(sql);
            Base.exec(sql);

            return success("unbind success");
        });
    }

    @RequestMapping(value = "lock", method = RequestMethod.PUT)
    public RequestResult<?> binding(@RequestBody Map data) {
        return ActiveJdbc.operTx(() -> {
            List<String> thing_ids = (List<String>) data.get("thing_ids");
            String sql = String.format("update a_storage_material_thing set in_stock = 9 where status != 1 and thing_id in %s", getThingIdsIn(thing_ids));
            System.out.println(sql);
            Base.exec(sql);

            return success("binding success");
        });
    }

    private String getThingIdsIn(List<String> thing_ids) {
        StringBuffer sb = new StringBuffer();
        sb.append("(");
        for (int i = 0; i < thing_ids.size(); i++) {
            String thing_id = thing_ids.get(i);
            sb.append("\'" + thing_id + "\'");
            if (i != thing_ids.size() - 1)
                sb.append(",");
        }
        sb.append(")");
        return sb.toString();
    }

    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        Optional<String> billNo = Optional.of(data.get("bill_no").toString());
        Optional<Integer> billDetail = Optional.of(Integer.parseInt(data.get("bill_detail").toString()));
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
                    PreparedStatement thingPs = Base.startBatch("INSERT INTO " + Thing.getTableName() +
                            " (thing_id, thing_cell, thing_unit, thing_pcs, thing_profile, thing_reversed, create_by, create_time, modify_by, modify_time) VALUES " +
                            " (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                    //要塞 Material Thing 的 ps
                    PreparedStatement materialThingPs = Base.startBatch("INSERT INTO " + MaterialThing.getTableName() +
                            " (thing_id, material_id, material_sub, remark, bill_from, bill_detail, code_no, column1, column2, column3, delivery_date, exp_date, in_stock, is_new, status, create_by, create_time, modify_by, modify_time) VALUES " +
                            " (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                    String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

                    BillStockIn billStockIn = BillStockIn.findFirst("bill_no = ? and bill_detail = ? and material_id = ? and material_sub = ?", billNo.get(), billDetail.get(), materialId.get(), materialSub.get());
                    if (billStockIn == null)
                        throw new RuntimeException("查不到對應的入庫單");
                    String exp_date = billStockIn.getString("exp_date");

                    Calendar cal = Calendar.getInstance();
                    cal.add(Calendar.DAY_OF_YEAR, 90);

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
                        thingPs.setInt(4, Integer.parseInt(map.get("thing_pcs").toString()));
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
                        materialThingPs.setString(8, isNull);
                        materialThingPs.setString(9, isNull);
                        materialThingPs.setString(10, isNull);
                        materialThingPs.setString(11, delivery.get());
                        materialThingPs.setString(12, exp_date);
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

    @RequestMapping(value = "/pre-pkg-qrcode", method = RequestMethod.GET)
    public void prePKGQucode(@RequestParam("thing_id[]") String[] ids) {
        ActiveJdbc.operTx(() -> {
            List<String> idList = Arrays.asList(ids);
            printQrcode(idList);
            return null;
        });
    }

}
