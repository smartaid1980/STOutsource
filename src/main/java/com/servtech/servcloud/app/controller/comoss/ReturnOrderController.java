package com.servtech.servcloud.app.controller.comoss;

import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.app.controller.comoss.util.ComossStorageConfig;
import com.servtech.servcloud.app.controller.storage.util.RecordAfter;
import com.servtech.servcloud.app.controller.storage.util.StorageConfig;
import com.servtech.servcloud.app.model.comoss.ReturnLog;
import com.servtech.servcloud.app.model.comoss.StockOutReturnMap;
import com.servtech.servcloud.app.model.storage.*;
import com.servtech.servcloud.app.model.strongLED.BillStockOutDetail;
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
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.lang.reflect.Type;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/comoss/return")
public class ReturnOrderController {

    private static final Logger LOG = LoggerFactory.getLogger(ReturnOrderController.class);
    @Autowired
    private HttpServletRequest request;

    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                Base.openTransaction();
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "KevinTest" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                long timeMillis = System.currentTimeMillis();
                RecordAfter.putCreateAndModify(data, login_user, timeMillis);

                String sender_key = data.get("log_id").toString();
                String uuid = request.getHeader("authKey");
                String token = Hashing.md5().hashString(sender_key + uuid, Charsets.UTF_8).toString();
                System.out.println("token : " + token);

                Sender sender = Sender.findFirst("sender_key=? AND sender_token = ? AND sender_enabled=? ORDER BY modify_time",
                        sender_key,token, "Y");
                if (sender == null) {
                    throw new RuntimeException(
                            "The Sender sender_key:" + data.get("log_id") + " AND enabled is not found..");
                }
                data.put("sender_id", sender.getString("sender_id"));
                data.put("log_time", new java.sql.Timestamp(timeMillis));
                Thing thing = Thing.findFirst("thing_id=?", data.get("thing_id").toString());

                Double cellIndex = Double.parseDouble(data.get("cell_index").toString());

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

                //寫入LOG TABLE
                Log log = new Log().fromMap(data);
                if (!log.insert())
                    throw new RuntimeException("日志写入失败");
                if (data.get("log_count") == null)
                    throw new RuntimeException("入库失败，未填入库数量");

                try {
                    Double logIntVal = Double.parseDouble(data.get("log_count").toString());
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

                StoreThingMap storeThingMap = new StoreThingMap();
                storeThingMap.fromMap(data);
                if (!storeThingMap.insert())
                    throw new RuntimeException("入库失败, 料件写入储位失败");

                int thing_pcs = storeThingMap.getInteger("thing_pcs");
                double stdThingPcs = thing.getDouble("thing_pcs");
                if (!(thing_pcs <= stdThingPcs))
                    throw new RuntimeException("入库失败, 原料数量大於初始值");

                // 將該箱入庫狀態改為1 (已入庫)
                int updatecount = MaterialThing.update("is_new=?, in_stock=1", "thing_id=?", 0,
                        thing.getString("thing_id"));
                if (!(updatecount > 0))
                    throw new RuntimeException("入库失败, 更新原料状态失败");

                thing.set("thing_pcs",data.get("log_count"));
                if(!thing.saveIt())
                    throw new RuntimeException("退料失败, 更新原料數量失敗");

                putReturnLogInfo(data);
                ReturnLog returnLog = new ReturnLog().fromMap(data);
                if (!returnLog.insert())
                    throw new RuntimeException("退料失败, 新增退料日誌失敗");
                Base.commitTransaction();
                return RequestResult.success();

            });
        } catch (
                Exception e)

        {
            e.printStackTrace();
            return RequestResult.fail(e.getMessage().replace("java.lang.RuntimeException:", ""));

        }
    }

    private void putReturnLogInfo(Map data) {
        try {
            MaterialThing materialThing = MaterialThing.findFirst("thing_id = ?", data.get("thing_id").toString());
            Thing thing = Thing.findFirst("thing_id = ?", data.get("thing_id").toString());
            String thing_profile = thing.getString("thing_profile");
            String position_id = getPositionId(thing_profile);
            String[] thingReversedArr = thing.getString("thing_reversed").split("\\|");
            String stock_out_bill_type = "";
            String return_bill_type = "";
            if (thingReversedArr.length > 1) {      //thing_reversed = bill_no(製令單號) + stock_out_bill_type(製令單別) + stock_out_detail_bill_type(領料單別)
                stock_out_bill_type = thingReversedArr[1];
                if(thingReversedArr[2] != null){
                    StockOutReturnMap stockOutReturnMap = StockOutReturnMap.findFirst("stock_out_bill_type = ?", thingReversedArr[2] );     //拿領料單別對應的退料單別
                    if (stockOutReturnMap != null) {
                        return_bill_type = stockOutReturnMap.getString("return_bill_type");
                    }
                }
            }
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
            String date = sdf.format(new Date());
            ReturnLog returnLog = ReturnLog.findFirst("return_id like '" + date + "%' order by return_id desc");
            String return_id = date;
            if (returnLog != null) {
                return_id += String.format("%04d", Integer.valueOf(returnLog.get("return_id").toString().substring(8)) + 1);
            } else {
                return_id += String.format("%04d", 1);
            }

            System.out.println("return_id : " + return_id);
            System.out.println("thingReversedArr[0] : " + thingReversedArr[0]);
            System.out.println("stock_out_bill_type : " + stock_out_bill_type);
            data.put("return_id", return_id);    //退料單號
            data.put("return_datetime", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));    //退料時間
            data.put("stock_out_bill_no", thingReversedArr[0]);       //製令單號
            data.put("stock_out_bill_type", stock_out_bill_type); //製令單別
            data.put("return_bill_type", return_bill_type);    //退料單別
            data.put("return_thing", data.get("thing_id").toString());        //退料原料
            data.put("return_material", materialThing.getString("material_id"));     //退料物料
            data.put("return_pcs", data.get("log_count"));         //退料數量
            data.put("position_id", position_id);       //退料儲位
            data.put("stock_in_bill_no", materialThing.getString("bill_from"));     //進貨單號
            data.put("production_line", BillStockOutMain.findFirst("bill_no = ? and column_1 = ?", thingReversedArr[0], stock_out_bill_type).getString("column_2"));  //生產線別
        } catch (Exception e) {
            throw new RuntimeException();
        }
    }

    private String getPositionId(String thing_profile) {
        System.out.println("thing_profile : " + thing_profile);
        String position_id = "";
        StoreThingMap isExistStoreThingMap = StoreThingMap.findFirst("thing_id=?",
                thing_profile);
        if (isExistStoreThingMap != null) {
            String storeId = isExistStoreThingMap.getString("store_id");
            Integer grid_index = isExistStoreThingMap.getInteger("grid_index");
            Integer cell_index = isExistStoreThingMap.getInteger("cell_start_index");

            StorePosition sp = StorePosition.findFirst(
                    "store_id=? and store_grid_index=? and store_cell_index=?", storeId, grid_index,
                    cell_index);
            position_id = sp.getString("position_id");
        }
        return position_id;
    }

}
