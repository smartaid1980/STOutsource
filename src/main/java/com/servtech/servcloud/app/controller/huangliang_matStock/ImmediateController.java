package com.servtech.servcloud.app.controller.huangliang_matStock;

import com.google.gson.Gson;
import com.servtech.servcloud.app.model.huangliang_matStock.PoTempStock;
import com.servtech.servcloud.app.model.huangliang_matStock.WoMMat;
import com.servtech.servcloud.app.model.huangliang_matStock.WoMMatList;
import com.servtech.servcloud.app.model.huangliang_matStock.WoMStatus;
import com.servtech.servcloud.app.model.huangliang_matStock.view.MatStatus;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.exception.JsonParamsException;
import com.servtech.servcloud.core.mail.MailManager;
import com.servtech.servcloud.core.mail.modules.ConfigData;
import com.servtech.servcloud.core.mail.modules.DataTemplate;
import com.servtech.servcloud.core.mqtt.MQTTManager;
import com.servtech.servcloud.core.util.JsonParams;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.Device;
import com.servtech.servcloud.module.model.SysUser;
import org.javalite.activejdbc.LazyList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.sql.Date;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;

@RestController
@RequestMapping("/huangliangMatStock/immediate")
public class ImmediateController {
    private static final Logger log = LoggerFactory.getLogger(ImmediateController.class);
    private static final String SERVER_IP = "http://220.133.118.197:58080";
    private boolean isMailConfig = getMailConfig();
    private String account;
    private String password;
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    SimpleDateFormat sdfDay = new SimpleDateFormat("yyyy-MM-dd");


    private MailManager mailManager = new MailManager();
    private Gson gson = new Gson();

    //4.1.3.6	即時通報—領料派工延遲通知
    @RequestMapping(value = "delayReceive", method = RequestMethod.GET)
    public RequestResult<?> delayReceive() {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                //查領料派工延遲，需發通知的機台
                @Override
                public RequestResult<String> operate() {
                    Date nowBefore2Hour = new Date(System.currentTimeMillis() - 2 * 60 * 60 * 1000);

                    String sql = String.format("SELECT a.* FROM (SELECT * FROM a_huangliang_wo_m_mat ORDER BY m_mat_time DESC) a " +
                            //型態：領料 and 材料派工狀態為開立、派工中、移料中之記錄
                            "where a.type = '1' and a.m_mat_status in ('0', '1' ,'2') " +
                            //排程檢查，材料派工時間(m_mat_time )是否超過2 hour and 延遲通知(delay_Notic)為N
                            "and a.m_mat_time <= '%s' and delay_notice != 'Y' group by a.machine_id", sdf.format(nowBefore2Hour));
//                    String sql = "SELECT * FROM a_huangliang_wo_m_mat group by machine_id";
                    log.info("SQL: " + sql);
                    List<WoMMat> woMMats = WoMMat.findBySQL(sql);
                    log.info("Query Size: " + woMMats.size());

                    String msg;
                    List<String> msgs = new ArrayList<>();
                    int updateCount = 0;
                    for (WoMMat woMMat : woMMats) {
                        String machine_id = woMMat.get("machine_id").toString();
                        String device_name = Device.findFirst("device_id = ?", machine_id).getString("device_name");

                        //傳送的訊息
                        msg = String.format("%s機台，首次領料延遲通知", device_name);
                        msgs.add(msg);

                        //將延遲通知更改為Y
                        woMMat.set("delay_notice", "Y");
                        if (woMMat.saveIt()) {
                            updateCount++;
                        }
                    }

                    if (updateCount != 0) {
                        msg = gson.toJson(new MQttListObj(msgs));
                        log.info(msg);
                        MQTTManager.publish(msg, "Platform_Notice");
                        log.info(String.format("延遲通知更改筆數為%d", updateCount));
                        return RequestResult.success();
                    } else {
                        log.info("延遲通知更改筆數為0");
                        return RequestResult.success();
                    }
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return fail(e.getMessage());
        }
    }

    //4.1.3.9	即時通報—廠務審核待確認通知
    @RequestMapping(value = "reviewCheck", method = RequestMethod.GET)
    public RequestResult<?> reviewCheck() {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                //查領料派工延遲，需發通知的機台
                @Override
                public RequestResult<String> operate() {
                    //	領補料派工記錄狀態進入移料待審
                    String sql = "SELECT * FROM a_huangliang_wo_m_mat a where a.m_mat_status = '3' and a.approve_notice != 'Y' ";
                    log.info("SQL: " + sql);
                    List<WoMMat> woMMats = WoMMat.findBySQL(sql);
                    log.info("Query Size: " + woMMats.size());
                    int updateCount = 0;
                    String msg = "";
                    List<String> msgs = new ArrayList<>();

                    for (WoMMat woMMat : woMMats) {
                        String order_id = woMMat.getString("order_id");
                        String machine_id = woMMat.getString("machine_id");
                        String device_name = Device.findFirst("device_id = ?", machine_id).getString("device_name");
                        String wo_m_time = woMMat.getString("wo_m_time");
                        String m_mat_time = woMMat.getString("m_mat_time");

                        List<WoMMatList> woMMatLists = WoMMatList.find("order_id = ? and machine_id = ? and wo_m_time = ? and m_mat_time = ? ", order_id, machine_id, wo_m_time, m_mat_time);
                        for (WoMMatList woMMatList : woMMatLists) {
                            String mat_code = woMMatList.getString("mat_code");
                            String use_qty = woMMatList.getString("use_qty");

                            msg = String.format("生產指令%s 材料:%s %s 已移至機台%s , 請前往審核。", order_id, mat_code, use_qty, device_name, machine_id.length());
                            msgs.add(msg);
                            //將延遲通知更改為Y
                            woMMat.set("approve_notice", "Y");
                            if (woMMat.saveIt()) {
                                updateCount++;
                            }
                        }
                    }
                    if (updateCount != 0) {
                        msg = gson.toJson(new MQttListObj(msgs));
                        log.info(msg);
                        MQTTManager.publish(msg, "Platform_Notice");
                        log.info(String.format("廠務審核通知狀態更改筆數為%d", updateCount));
                        return RequestResult.success();
                    } else {
                        log.info("廠務審核通知狀態更改筆數為0");
                        return RequestResult.success();
                    }
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return fail(e.getMessage());
        }
    }

    //4.1.4.3	即時通報—緊急補料通知
    @RequestMapping(value = "emergencyFeed", method = RequestMethod.GET)
    public RequestResult<?> emergencyFeed() {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                //查領料派工延遲，需發通知的機台
                @Override
                public RequestResult<String> operate() {
                    try {
                        String sql = "SELECT a.* FROM (SELECT * FROM a_huangliang_view_mat_status ORDER BY m_mat_time DESC) a WHERE a.w_m_status = '1' AND a.mat_control = 'Y' GROUP BY a.machine_id";
                        //取得生產中且監控中的資料
                        List<MatStatus> matStatuss = MatStatus.findBySQL(sql);
                        log.info("matStatuss sql : " + sql);
                        List<Map<String, Object>> result = new ArrayList<>();

                        String msg = "";
                        List<String> msgs = new ArrayList<>();
                        if (matStatuss != null) {

                            for (MatStatus matStatus : matStatuss) {
                                String machine_id = matStatus.getString("machine_id");
                                String device_name = Device.findFirst("device_id = ?", machine_id).getString("device_name");
                                Integer m_qty = matStatus.getInteger("m_qty") == null ? 0 : matStatus.getInteger("m_qty");
                                Integer m_pqty = matStatus.getInteger("m_pqty") == null ? 0 : matStatus.getInteger("m_pqty");
                                Integer m_bqty = matStatus.getInteger("m_bqty") == null ? 0 : matStatus.getInteger("m_bqty");
                                Map<String, Object> materialProduct = WoMMatListController.getMaterialProduct2(matStatus);
                                if(materialProduct == null){
                                    continue;
                                }
                                Integer lastTime = (int) materialProduct.get("time");
                                Integer lastMProduct = (int) materialProduct.get("lastMProduct");
                                // 剩餘材料耗用時間 <= 36 小時
                                log.info(machine_id + "|lastTime = " + lastTime +
                                        "|lastTime < (36*60) =  " + (lastTime <= (36 * 60)) +
                                        "|lastMProduct = " + lastMProduct +
                                        "| (m_qty - m_pqty + m_bqty) > lastMProduct =  " + ( (m_qty - m_pqty + m_bqty) > lastMProduct) +
                                        "|m_qty = " + m_qty +
                                        "|m_pqty = " + m_pqty+
                                        "|m_bqty = " + m_bqty);
                                if (lastTime <= (36 * 60) && (m_qty - m_pqty + m_bqty) > lastMProduct) {
                                    msg = String.format("機台編號%s 料架上剩餘材料耗用時間低於36H，請盡速補料", device_name);
                                    msgs.add(msg);
                                }
                            }
                            msg = gson.toJson(new MQttListObj(msgs));
                            log.info(msg);
                            MQTTManager.publish(msg, "Platform_Notice");
                        }
                        return RequestResult.success();
                    } catch (Exception e) {
                        StringWriter sw = new StringWriter();
                        e.printStackTrace(new PrintWriter(sw));
                        System.out.println("Error : " + sw.toString());
                        return fail(e.getMessage());
                    }
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return fail(e.getMessage());
        }
    }

    //4.1.4.5	即時通報—補料派工延遲通知
    @RequestMapping(value = "supplementDelayReceive", method = RequestMethod.GET)
    public RequestResult<?> supplementDelayReceive() {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                //查領料派工延遲，需發通知的機台
                @Override
                public RequestResult<String> operate() {
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    Date nowBefore6Hour = new Date(System.currentTimeMillis() - 6 * 60 * 60 * 1000);
                    //材料派工狀態（WO_M_MAT. m_mat_status）：開立、派工中、移料中的派工記錄
                    List<WoMMat> woMMats = WoMMat.find("type = '2' and m_mat_status IN ('0','1','2') and delay_notice = 'N' and m_mat_time < ? ", sdf.format(nowBefore6Hour));
                    log.info("現在的6小時前為 " + sdf.format(nowBefore6Hour));
                    log.info("Query Size: " + woMMats.size());

                    String msg;
                    List<String> msgs = new ArrayList<>();
                    int updateCount = 0;
                    for (WoMMat woMMat : woMMats) {
                        String machine_id = woMMat.get("machine_id").toString();
                        String device_name = Device.findFirst("device_id = ?", machine_id).getString("device_name");

                        //傳送的訊息
                        msg = String.format("%s機台，補料延遲通知", device_name);
                        msgs.add(msg);

                        //將延遲通知更改為Y
                        woMMat.set("delay_notice", "Y");
                        if (woMMat.saveIt()) {
                            updateCount++;
                        }
                    }

                    if (updateCount != 0) {
                        msg = gson.toJson(new MQttListObj(msgs));
                        log.info(msg);
                        MQTTManager.publish(msg, "Platform_Notice");
                        log.info(String.format("延遲通知更改筆數為%d", updateCount));
                        return RequestResult.success();
                    } else {
                        log.info("延遲通知更改筆數為0");
                        return RequestResult.success();
                    }
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return fail(e.getMessage());
        }
    }

    //4.1.4.6	EMAIL通報—補料派工延遲通知清單
    @RequestMapping(value = "delayReceiveList", method = RequestMethod.GET)
    public RequestResult<?> delayReceiveList() {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                //查領料派工延遲，需發通知的機台
                @Override
                public RequestResult<String> operate() {

                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    Date nowBefore6Hour = new Date(System.currentTimeMillis() - 6 * 60 * 60 * 1000);
                    //材料派工狀態（WO_M_MAT. m_mat_status）：開立、派工中、移料中的派工記錄
                    List<WoMMat> woMMats = WoMMat.find("type = '2' and m_mat_status IN ('0','1','2') and m_mat_time < ? ", sdf.format(nowBefore6Hour));
                    log.info("現在的6小時前為 " + sdf.format(nowBefore6Hour));

                    List<Map<String, Object>> resultList = new ArrayList<>();
                    for (WoMMat woMMat : woMMats) {
                        Map<String, Object> resultMap = new HashMap<>();
                        List<Map<String, String>> detailList = new ArrayList<>();
                        String machine_id = woMMat.getString("machine_id");
                        String order_id = woMMat.getString("order_id");
                        String wo_m_time = woMMat.getString("wo_m_time");
                        String m_mat_time = woMMat.getString("m_mat_time");
                        resultMap.put("machine_id", machine_id);
                        resultMap.put("order_id", order_id);
                        resultMap.put("m_mat_time", m_mat_time);

                        List<WoMMatList> woMMatLists = WoMMatList.find("machine_id = ? and order_id = ? and wo_m_time = ? and m_mat_time = ? and item_status in (1,2)", machine_id, order_id, wo_m_time, m_mat_time);
                        for (WoMMatList woMMatList : woMMatLists) {
                            Map<String, String> detailMap = new HashMap<>();
                            detailMap.put("po_no", woMMatList.getString("po_no"));
                            detailMap.put("mat_code", woMMatList.getString("mat_code"));
                            detailMap.put("shelf_time", woMMatList.getString("shelf_time"));
                            detailMap.put("location", woMMatList.getString("location"));
                            detailMap.put("use_piece", woMMatList.getString("use_piece"));
                            detailMap.put("use_remark", woMMatList.getString("use_remark"));
                            detailMap.put("item_status", woMMatList.getString("item_status"));
                            detailList.add(detailMap);
                        }
                        resultMap.put("detailList", detailList);
                        resultList.add(resultMap);
                    }


                    ConfigData configData = new ConfigData(
                            account,
                            password,
                            getGroupUserEmail("factory_service_assistant"),
//                            "kevintsai1325@gmail.com",
                            String.format("機台補料延遲通知-%s", LocalDate.now().toString()),
                            System.getProperty(SysPropKey.ROOT_PATH) + "/program/template/default_template_10line.html"
                    );
                    if (!isMailConfig) {
                        return RequestResult.fail("email config fail");
                    }
                    DataTemplate dataTemplate = new DataTemplate();
                    dataTemplate.replaceMap.put("herf", SERVER_IP + "/ServCloud/index.html#app/HuangLiangMatCollectAndSupplement/function/zh_tw/01_material_assignment_record.html");
                    List<Map<String, String>> list = new ArrayList<>();
                    dataTemplate.replaceMap.put("alarm_str", "");
                    dataTemplate.replaceMap.put("small_tiitle", "補料延遲機台資訊");
                    dataTemplate.arrMap.put("arr", list);
                    list.add(buildMap(new String[]{
                            "arr1", "生產指令",
                            "arr2", "派工機台",
                            "arr3", "材料派工時間",
                            "arr4", "採購單",
                            "arr5", "材料條碼",
                            "arr6", "暫上架時間",
                            "arr7", "位置",
                            "arr8", "派工支數",
                            "arr9", "派工備註",
                            "arr10", "項目狀態"
                    }));

                    int writeDataCount = 0;
                    for (Map<String, Object> resultMap : resultList) {

                        List<Map<String, String>> detailList = (List<Map<String, String>>) resultMap.get("detailList");
                        String machine_id = resultMap.get("machine_id").toString();
                        String order_id = resultMap.get("order_id").toString();
                        String m_mat_time = resultMap.get("m_mat_time").toString();
                        boolean isFirst = true;

                        String device_name;
                        for (Map<String, String> detail : detailList) {
                            if (isFirst) {
                                device_name = Device.findFirst("device_id = ?", machine_id).getString("device_name");
                                m_mat_time = getCleanTimestamp(m_mat_time);
                            } else {
                                order_id = "";
                                device_name = "";
                                m_mat_time = "";
                            }

                            String po_no = detail.get("po_no");
                            String mat_code = detail.get("mat_code");
                            String shelf_time = detail.get("shelf_time");
                            String location = detail.get("location");
                            String use_piece = detail.get("use_piece");
                            String use_remark = detail.get("use_remark");
                            String item_status = detail.get("item_status");
                            if (item_status.equals("1")) {
                                item_status = "派工中";
                            } else if (item_status.equals("2")) {
                                item_status = "移料中";
                            } else {
                                continue;
                            }

                            writeDataCount++;
                            list.add(buildMap(new String[]{
                                    "arr1", order_id,
                                    "arr2", device_name,
                                    "arr3", m_mat_time,
                                    "arr4", po_no,
                                    "arr5", mat_code,
                                    "arr6", getCleanTimestamp(shelf_time),
                                    "arr7", location,
                                    "arr8", use_piece,
                                    "arr9", use_remark,
                                    "arr10", item_status
                            }));
                            isFirst = false;
                        }
                    }
                    if (writeDataCount != 0) {
                        if (mailManager.sendMail(dataTemplate, configData)) {
                            return RequestResult.success("");
                        } else {
                            return fail("mail 發送失敗");
                        }
                    } else {
                        return RequestResult.success("");
                    }
                }
            });
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.out.println("Error : " + sw.toString());
            return fail(e.getMessage());
        }
    }

    private String getCleanTimestamp(String str) {
        try {
            return sdf.format(sdf.parse(str));
        } catch (ParseException e) {
            e.printStackTrace();
            return str;
        }
    }

    private Map<String, String> buildMap(String[] strings) {
        Map<String, String> map = new HashMap<>();
        for (int i = 0; i < strings.length; i += 2) {
            map.put(strings[i], strings[i + 1]);
        }
        return map;
    }

    private String getGroupUserEmail(String group_id) {

        StringBuilder emails = new StringBuilder();
        String sql = "SELECT m.user_email FROM `m_sys_user` as m join m_sys_user_group as g WHERE g.group_id = '" + group_id + "' and m.is_close = 1 and g.user_id = m.user_id";
        List<Map> users = SysUser.findBySQL(sql).toMaps();
        for (Map map : users) {
            String str = (String) map.get("user_email");
            if (str != null && !str.equals("")) {
                emails.append(str).append(",");
            }
        }
        String result = emails.toString();
        if (result.contains(",")) {
            result = result.substring(0, result.length() - 1);
        }

        return result;


    }

    private boolean getMailConfig() {
        try {
            JsonParams jsonParams = new JsonParams("mail_config.json");
            String defaultAccount = jsonParams.getAsString("HUL_default");
            this.account = defaultAccount.split(",")[0];
            this.password = defaultAccount.split(",")[1];
            return true;
        } catch (JsonParamsException e) {
            e.printStackTrace();
            return false;
        }
    }

    class MQttObj {
        String message;

        MQttObj(String message) {
            this.message = message;
        }
    }

    class MQttListObj {
        List<String> message;

        MQttListObj(List<String> message) {
            this.message = message;
        }
    }
}
