package com.servtech.servcloud.app.controller.storage;

import com.google.gson.Gson;
import com.servtech.servcloud.app.controller.storage.util.RecordAfter;
import com.servtech.servcloud.app.model.servtrack.WorkOp;
import com.servtech.servcloud.app.model.storage.*;
import com.servtech.servcloud.app.model.storage.view.WorkOpMaterialThingView;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.javalite.activejdbc.LazyList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/storage/workopmaterial")
public class StorageWorkOpMaterialController {
    private static final Logger LOG = LoggerFactory.getLogger(StorageWorkOpMaterialController.class);

    private static final List<String> PICKUP_LINGHT;
    private static final String WORK_OP_MATERIAL_LOCK = new String("work_op_material_lock");
    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = RequestMethod.GET)
    public RequestResult<?> get(@RequestParam("work_id") final String workId,
                                @RequestParam("op") final String op,
                                @RequestParam("sender_key") final String senderKey) {
        synchronized (WORK_OP_MATERIAL_LOCK) {
            try {
                return ActiveJdbc.operTx(() -> {
                    //看此工單是不是正在撿料，是的話, 目前不支援多人撿料 齁系
                    if (searchWorkOPStatusIsExist(workId, op, senderKey))
                        throw new RuntimeException("工单:" + workId + " 工序: " + op + " 捡料中");

                    //如果前一次撿料還沒結束 這次又想撿其它的料 就齁系
                    searchPreviousButNotFinish(workId, op, senderKey);

                    //取得閒置燈號 如果沒有代表目前滿線 不能撿料
                    Optional<String> pickupLight = getPickupLight(workId, op, senderKey);
                    if (!pickupLight.isPresent()) throw new RuntimeException("捡料线程已满...请稍后再试");
                    //拿可以用的燈號
                    String lightCode = pickupLight.get();
                    //寫入撿料記錄
                    String pickupTimestamp = insertPickup(workId, op, lightCode, senderKey);

                    //直接回列表
                    return RequestResult.success(getWorkOpPick(workId, op, pickupTimestamp, senderKey));
                });
            } catch (Exception e) {
                e.printStackTrace();
                return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
            }
        }
    }

    @RequestMapping(value = "/pickup", method = RequestMethod.PUT)
    public RequestResult<?> pickupUpdate(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                String workId = data.get("work_id").toString();
                String senderKey = data.get("sender_key").toString();
                String op = data.get("op").toString();
                String pickup_timestamp = data.get("pickup_timestamp").toString();
                PickupLog pickupLog = PickupLog.findFirst("pickup_timestamp=? and work_no=? and order_no=? and sender_key=?", pickup_timestamp,
                        workId, op, senderKey);
                if (pickupLog == null) throw new RuntimeException("工单: " + workId + " 工序: " + op + "设备: " + senderKey + " 时间: " + pickup_timestamp + " 捡料日志无此记录");

                pickupLog.setTimestamp("pickup_end_time", new java.sql.Timestamp(System.currentTimeMillis()));
                if (!pickupLog.saveIt()) throw new RuntimeException("工单: " + workId + " 工序: " + op + " 捡料更新失败");
                String workOrderNo = (workId + op).toLowerCase();
                Pickup.delete("pickup_timestamp=? and work_order_no=? and sender_key=?", pickup_timestamp, workOrderNo, senderKey);
//                if (Pickup.delete("pickup_timestamp=? and work_order_no=? and sender_key=?", pickup_timestamp, workOrderNo, senderKey) == 0) {
//                    throw new RuntimeException("工单: " + workId + " 工序: " + op + " 捡料线程清除失败");
//                }
                return RequestResult.success();
            });

        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }

    }

    @RequestMapping(value = "/qrcodeop/{qrcodeop}", method = RequestMethod.GET)
    public RequestResult<?> qrcodeop(@PathVariable String qrcodeop) {
        return ActiveJdbc.operTx(() -> {
            return RequestResult.success(WorkOp.findFirst("qrcode_op=?", qrcodeop).toMap());
        });
    }

    @RequestMapping(method = RequestMethod.PUT)
    public RequestResult<?> put(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                String logId = data.get("log_id").toString();
                String userId = data.get("user_id").toString();
                List<Map> things = (List<Map>) data.get("things");
                Calendar cal = Calendar.getInstance();

                Sender sender = Sender.findFirst("sender_key=? AND sender_enabled=? ORDER BY modify_time", data.get("log_id"), "Y");
                if (sender == null) {
                    throw new RuntimeException("The Sender sender_key:" + data.get("log_id") + " AND enabled is not found..");
                }
                String senderId = sender.getString("sender_id");
                things.forEach(thing -> {
                    long timeMillis = cal.getTimeInMillis();
                    java.sql.Timestamp timestamp = new java.sql.Timestamp(timeMillis);
                    Map<String, Object> logObj = new HashMap<>();
                    logObj.put("log_id", logId);
                    logObj.put("log_time", timestamp);
                    RecordAfter.putCreateAndModify(logObj, logId, timeMillis);
                    logObj.put("store_id", thing.get("store_id"));
                    logObj.put("store_grid_index", thing.get("grid_index"));
                    logObj.put("store_cell_index", thing.get("cell_index"));
                    logObj.put("thing_id", thing.get("thing_id"));
                    logObj.put("sender_id", senderId);
                    logObj.put("log_type", 2);
                    logObj.put("log_count", thing.get("thing_pcs"));
                    logObj.put("user_id", userId);
                    Log log = new Log().fromMap(logObj);
                    if (log.insert()) {
                        StoreThingMap storeThingMap = StoreThingMap.findFirst("thing_id=? and store_id=? and grid_index=? and cell_start_index=?",
                                thing.get("thing_id"), thing.get("store_id"), thing.get("grid_index"), thing.get("cell_index"));
                        if (storeThingMap == null) {
                            throw new RuntimeException("储位无此料件, 无法出库");
                        }
                        if (!storeThingMap.delete()) {
                            throw new RuntimeException("储位出库失败");
                        }
                    } else {
                        throw new RuntimeException("进出记历写入异常");
                    }
                    cal.add(Calendar.MILLISECOND, 1000);
                });

                return RequestResult.success();
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));
        }
    }


    public Optional<String> getPickupLight(String workId, String op, String senderKey) {
        StringJoiner stringJoiner = new StringJoiner(",", "(", ")");
        PICKUP_LINGHT.forEach(color -> {
            stringJoiner.add("'" + color + "'");
        });
        //因為有可能裝置 重新撿料， 所以再查一次 如果有的話直接回傳 那個燈號代碼
        Pickup pickupWork = Pickup.findFirst("work_order_no=? AND sender_key=?", (workId + op).toLowerCase(), senderKey);
        if (pickupWork != null) return Optional.of(pickupWork.getString("pickup_color"));

        //沒有的話 取得閒置燈號
        List<Pickup> pickups = Pickup.find("pickup_color IN " + stringJoiner.toString());
        if (pickups.size() == 0) {
            return Optional.of(PICKUP_LINGHT.get(0));
        } else if (pickups.size() == PICKUP_LINGHT.size()) {
            return Optional.empty();
        } else {
            Optional<String> idleColor = null;
            List<String> usageColor = pickups.stream()
                    .map(pickup -> pickup.getString("pickup_color"))
                    .collect(Collectors.toList());
            for (String color : PICKUP_LINGHT) {
                if (!usageColor.contains(color)) {
                    idleColor = Optional.of(color);
                    break;
                }
            }
            return idleColor;
        }
    }

    //來看工單是不是撿料中
    public Boolean searchWorkOPStatusIsExist(String workId, String op, String senderKey) {
        //為了一致性 全轉小寫
        String workOrderNo = (workId + op).toLowerCase();
        Pickup pickup = Pickup.findFirst("work_order_no=?", workOrderNo);
        if (pickup == null) {
            return false;
        } else {
            if (pickup.getString("sender_key").equals(senderKey)) {
                return false;
            } else {
                return true;
            }
        }
    }

    //看看上次是不是沒有出站
    public void searchPreviousButNotFinish(String workId, String op, String senderKey) {
        PickupLog pickupLog = PickupLog.findFirst("sender_key=? order by pickup_timestamp desc", senderKey);
        if (pickupLog != null) {
            if (pickupLog.getTimestamp("pickup_end_time") == null) {
                String work_no = pickupLog.getString("work_no");
                String order_no = pickupLog.getString("order_no");
                if (!work_no.equals(workId) || !order_no.equals(op)) {
                    throw new RuntimeException("前次捡料 工单:" + work_no + " 工序: " + order_no + " 尚未完成");
                }
            }
        }

    }

    //寫入撿料
    public String insertPickup(String workId, String op, String color, String senderKey) {
        //17碼的系統流水號
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmssSSS");
        long systemTime = System.currentTimeMillis();
        java.sql.Timestamp timestamp = new java.sql.Timestamp(systemTime);
        Pickup pickup = Pickup.findFirst("work_order_no=? AND sender_key=?", (workId + op).toLowerCase(), senderKey);
        if (pickup == null) {
            pickup = new Pickup();
            pickup.setString("pickup_timestamp", sdf.format(systemTime));
            pickup.setString("work_order_no", (workId + op).toLowerCase());
            pickup.setString("sender_key", senderKey);
            pickup.setString("pickup_color", color);
            pickup.setString("create_by", senderKey);
            pickup.setTimestamp("create_time", timestamp);
            pickup.setString("modify_by", senderKey);
            pickup.setTimestamp("modify_time", timestamp);
            if (!pickup.insert()) throw new RuntimeException("工单: " + workId + " 工序: " + op + " 捡料写入失败");

            // PickLog 寫入失敗
            PickupLog pickupLog = new PickupLog();
            pickupLog.setString("pickup_timestamp", sdf.format(systemTime));
            pickupLog.setString("work_no", workId);
            pickupLog.setString("order_no", op);
            pickupLog.setString("sender_key", senderKey);
            pickupLog.setString("pickup_color", color);
            pickupLog.setTimestamp("pickup_start_time", timestamp);
            pickupLog.setString("create_by", senderKey);
            pickupLog.setTimestamp("create_time", timestamp);
            pickupLog.setString("modify_by", senderKey);
            pickupLog.setTimestamp("modify_time", timestamp);
            if (!pickupLog.insert()) throw new RuntimeException("工单: " + workId + " 工序: " + op + " 捡料日志写入失败");
            return sdf.format(systemTime);
        } else {
            //如果 pickup 有記錄 結果 顏色代碼不一樣 有問題 ! 齁係, 如果一樣應該代表可能 APP 操作流程的議題 所以重新撿料 只要更新時間
            if (!pickup.getString("pickup_color").equals(color))
                throw new RuntimeException("工单: " + workId + " 工序: " + op + " 已在捡料");
            pickup.setString("modify_by", senderKey);
            pickup.setTimestamp("modify_time", timestamp);
            if (!pickup.saveIt()) throw new RuntimeException("工单: " + workId + " 工序: " + op + " 捡料更新失败");
            return pickup.getString("pickup_timestamp");
        }
    }

    public Map<String, Object> getWorkOpPick(String workId, String op, String pickupTimestamp, String senderKey) {
        Map<String, Object> result = new HashMap<>();
        String profile = (workId + op).toLowerCase();
        //看thing 的  thing_profile 有沒有紀錄 有的話代表拿過了直接處理後回傳
        List<Map> workOpMaterialThingViewList = WorkOpMaterialThingView.find("work_id=? and op=? and thing_profile=?", workId, op, profile).toMaps();
        int profileSize = workOpMaterialThingViewList.size();
        if (profileSize > 0) {
            int finishCount = 0;
            for (Map map : workOpMaterialThingViewList) {
                //沒有 store_id 代表已出庫
                if (map.get("store_id") == null) {
                    map.put("success", true);
                    finishCount++;
                } else {
                    map.put("success", false);
                }
            }
            result.put("picks", workOpMaterialThingViewList);
            if (finishCount == profileSize) {
                result.put("finish", true);
                //如果已經撿完 還要撿 這筆 Log 不應該記，刪掉這個 log 並讓它下車
                PickupLog.delete("pickup_timestamp=? AND work_no=? and order_no=? AND sender_key=?", pickupTimestamp, workId, op, senderKey);
                Pickup.delete("pickup_timestamp=? AND work_order_no=? AND sender_key=?", pickupTimestamp, profile, senderKey);
            } else {
                result.put("finish", false);
            }
            result.put("pickup_timestamp", pickupTimestamp);
            return result;

            // 第一次撿料才會進來
        } else {
            List<Map> pickListMap = new ArrayList<>();

            List<WorkOpMaterial> workOpMaterialList = WorkOpMaterial.find("work_id=? AND op=?", workId, op);
            if (workOpMaterialList.size() == 0) {
                throw new RuntimeException("工单号: " + workId + " - 制程 : " + op + " 查无原料号");
            }

            //這邊是記這張單的那個工序會用到的料及數量的 Map
            HashMap<String, Integer> materialMap = new HashMap<>();

            workOpMaterialList.forEach(consumer -> {
                materialMap.put(consumer.getString("material_id"), consumer.getInteger("use_qty"));
            });

            //迭代這個Map 看他會用到哪些料
            for (String materialId : materialMap.keySet()) {
                int needCount = materialMap.get(materialId);
                int total = 0;
                workOpMaterialThingViewList = WorkOpMaterialThingView.find("material_id=? AND work_id=? AND op= ? AND store_id is not null AND thing_profile is null order by is_new, exp_date,thing_id  asc", materialId, workId, op).toMaps();
                for (Map workOpMaterialThingView : workOpMaterialThingViewList) {
                    if (total >= needCount) {
                        break;
                    } else {
                        total += Integer.parseInt(workOpMaterialThingView.get("store_thing_pcs").toString());
                        workOpMaterialThingView.put("success", false);
                        String thingId = workOpMaterialThingView.get("thing_id").toString();
                        if (Thing.update("thing_profile=?", "thing_id=?", profile, thingId) == 0) {throw new RuntimeException("原料: " + thingId +  " 状态写入失败..");}
                        pickListMap.add(workOpMaterialThingView);
                    }
                }
            }

            result.put("finish", false);
            result.put("picks", pickListMap);
            result.put("pickup_timestamp", pickupTimestamp);

            return result;
        }
    }




    static {
        Set<String> pickSet = new HashSet<>();
        String custParamPath = System.getProperty(SysPropKey.CUST_PARAM_PATH);
        File pickupJsonFile = new File(custParamPath, "pickup_light.json");
        if (!pickupJsonFile.exists()) {
            pickSet.add("R");
            PICKUP_LINGHT = new ArrayList<>(pickSet);
        } else {
            try {
                List<Map> listMap = new Gson().fromJson(new FileReader(pickupJsonFile), List.class);
                listMap.forEach(map -> pickSet.add(map.get("color").toString()));
            } catch (FileNotFoundException e) {
                pickSet.add("R");
            }
            PICKUP_LINGHT = new ArrayList<>(pickSet);
        }
    }
}

