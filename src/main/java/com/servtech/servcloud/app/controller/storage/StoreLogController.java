package com.servtech.servcloud.app.controller.storage;

import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import com.servtech.servcloud.app.controller.storage.util.RecordAfter;
import com.servtech.servcloud.app.model.storage.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/storage/log")
public class StoreLogController {

    private static final Logger LOG = LoggerFactory.getLogger(DocumentController.class);
    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        final Double type = Double.parseDouble(data.get("log_type").toString());
        final int actionType = type.intValue();
        try {
            return ActiveJdbc.operTx(() -> {
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                long timeMillis = System.currentTimeMillis();
                RecordAfter.putCreateAndModify(data, login_user, timeMillis);

                String sender_key = data.get("log_id").toString();
                Sender sender = Sender.findFirst("sender_key=? AND sender_enabled=? ORDER BY modify_time",
                        sender_key,"Y");
                if (sender == null) {
                    throw new RuntimeException(
                            "The Sender sender_key:" + data.get("log_id") + " AND enabled is not found..");
                }
                data.put("sender_id", sender.getString("sender_id"));
                data.put("log_time", new java.sql.Timestamp(timeMillis));
                Thing thing = Thing.findFirst("thing_id=?", data.get("thing_id").toString());

                Double cellIndex = Double.parseDouble(data.get("cell_index").toString());
                StoreThingMap storeThingMap = StoreThingMap.findFirst(
                        "store_id=? and grid_index=? and cell_start_index=?", data.get("store_id"),
                        data.get("grid_index"), cellIndex.intValue());
                if (actionType == 2) { // 出庫
                    if (storeThingMap == null)
                        throw new RuntimeException("出库失败, 储位无此料件 无法出库");
                    data.put("log_count", storeThingMap.getInteger("thing_pcs"));
                }

                if (actionType == 1) { // 入庫
                    StoreThingMap isExistStoreThingMap = StoreThingMap.findFirst("thing_id=?",
                            data.get("thing_id").toString());
                    if (isExistStoreThingMap != null) {
                        String storeId = isExistStoreThingMap.getString("store_id");
                        Integer grid_index = isExistStoreThingMap.getInteger("grid_index");
                        Integer cell_index = isExistStoreThingMap.getInteger("cell_start_index");

                        data.put("store_id", storeId);
                        data.put("store_grid_index", grid_index);
                        data.put("store_cell_index", cell_index);

                        StorePosition sp = StorePosition.findFirst(
                                "store_id=? and store_grid_index=? and store_cell_index=?", storeId, grid_index,
                                cell_index);
                        throw new RuntimeException("入库失败, 料件已存在 " + sp.getString("position_name") + "储位 不可重复入库");
                    }
                    if (data.get("log_count") == null || data.get("log_count").toString().equals(""))
                        throw new RuntimeException("入库失败，未填入库数量");
                }

                data.put("store_grid_index", data.get("grid_index"));
                data.put("store_cell_index", data.get("cell_index"));
                Log log = new Log().fromMap(data);
                if (!log.insert())
                    throw new RuntimeException("日志写入失败");
                switch (actionType) {
                case 1:
                    if (data.get("log_count") == null)
                        throw new RuntimeException("入库失败，未填入库数量");
                    try {
                        Integer logIntVal = Integer.parseInt(data.get("log_count").toString());
                        if (logIntVal <= 0)
                            throw new RuntimeException("入库失败, 请确认入库数量为正整数");
                    } catch (NumberFormatException e) {
                        throw new RuntimeException("入库失败, 请确认入库数量为正整数");
                    }
                    data.put("cell_start_index", cellIndex.intValue());
                    data.put("cell_end_index", cellIndex.intValue() + 1);
                    data.put("thing_cell", thing.getString("thing_cell"));
                    data.put("thing_pcs", data.get("log_count"));
                    RecordAfter.putCreateAndModify(data, login_user, timeMillis);

                    storeThingMap = new StoreThingMap();
                    storeThingMap.fromMap(data);
                    if (storeThingMap.insert()) {
                        int thing_pcs = storeThingMap.getInteger("thing_pcs");
                        int stdThingPcs = thing.getInteger("thing_pcs");
                        if (thing_pcs <= stdThingPcs) {
                            // 將該箱入庫狀態改為1 (已入庫)
                            int updatecount = MaterialThing.update("is_new=?, in_stock=1", "thing_id=?", 0,
                                    thing.getString("thing_id"));
                            thing.set("thing_profile", null);
                            if (updatecount > 0 && thing.saveIt()) {
                                try {
                                    String bill_from = MaterialThing
                                            .findFirst("thing_id = ?", data.get("thing_id").toString())
                                            .getString("bill_from");
                                    // 每箱都已入庫則將該進貨單狀態改為已入庫
                                    if (MaterialThing.count("bill_from = ? and in_stock = 0", bill_from) == 0) {
                                        Base.exec(
                                                "update a_strongled_bill_stock_in set status = 9, modify_by=?, modify_time=? where bill_no = (select bill_from from a_storage_material_thing where thing_id = ?)",
                                                thing.getString("thing_id"), "/storage/log",
                                                new java.sql.Timestamp(System.currentTimeMillis()));
                                    }
                                } catch (Exception e) {
                                    LOG.error(e.getMessage());
                                    e.printStackTrace();
                                    throw new RuntimeException("入库失败, 更新进货单状态失败");
                                }
                                // select count(*) from MaterialThing where thing_id = thing_id and in_stock = 0
                                return RequestResult.success();
                            } else {
                                throw new RuntimeException("入库失败, 更新原料状态失败");
                            }
                        } else {
                            throw new RuntimeException("入库失败, 原料数量大於初始值");
                        }
                    } else {
                        throw new RuntimeException("入库失败, 料件写入储位失败");
                    }
                case 2:
                    storeThingMap = StoreThingMap.findFirst(
                            "thing_id=? and store_id=? and grid_index=? and cell_start_index=?", data.get("thing_id"),
                            data.get("store_id"), data.get("grid_index"), cellIndex.intValue());
                    if (storeThingMap == null) {
                        return RequestResult.fail("出库失败,储位无此料件,无法出库");
                    }
                    if (storeThingMap.delete()) {
                        return RequestResult.success();
                    } else {
                        throw new RuntimeException("出库失败,储位状态更新失败");
                    }

                }
                return RequestResult.success();
            });
        } catch (Exception e) {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));

        }
    }
}
