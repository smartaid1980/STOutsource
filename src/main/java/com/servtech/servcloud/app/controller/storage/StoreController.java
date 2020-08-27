package com.servtech.servcloud.app.controller.storage;


import com.google.gson.Gson;
import com.servtech.servcloud.app.controller.storage.util.RecordAfter;
import com.servtech.servcloud.app.controller.storage.util.RuleEnum;
import com.servtech.servcloud.app.controller.storage.util.StdQRCode;
import com.servtech.servcloud.app.model.storage.Store;
import com.servtech.servcloud.app.model.storage.StoreThingMap;
import com.servtech.servcloud.app.model.storage.StoreType;
import com.servtech.servcloud.app.model.storage.Thing;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.apache.poi.xwpf.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/storage/store")
public class StoreController {
    private static final Logger LOG = LoggerFactory.getLogger(StoreController.class);

    private static final RuleEnum STORE = RuleEnum.STORE;

    private static final String LOCK = new String();

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                String login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                String last = "";
                Store store = Store.findFirst("ORDER BY store_id Desc");
                if (store == null) {
                    last = RuleEnum.getSeq(STORE, 0);
                } else {
                    int seq = Integer.parseInt(store.getString("store_id").substring(1));
                    last = RuleEnum.getSeq(STORE, seq);
                }
                data.put("store_id", last);
                RecordAfter.putCreateAndModify(data, login_user, System.currentTimeMillis());
                store = new Store().fromMap(data);
                if (store.insert()) {
                    return RequestResult.success(last);
                } else {
                    return RequestResult.fail(last);
                }
            });
        }
    }

    @RequestMapping(value = "/{store_id}/map", method = RequestMethod.GET)
    public RequestResult<?> get(@PathVariable("store_id") String sotreId) {
        return ActiveJdbc.operTx(() -> {
            Store store = Store.findFirst("store_id=?", sotreId);
            String storeTypeId = store.getString("store_type_id");
            return RequestResult.success(Thing.find("store_type_id=?", storeTypeId).toMaps());
        });
    }

    @RequestMapping(value = "/{store_id}/cell", method = RequestMethod.GET)
    public RequestResult<?> getCellStatus(@PathVariable("store_id") String storeId) {
        return ActiveJdbc.operTx(() -> {
            Store store = Store.findFirst("store_id=?", storeId);
            if (store != null) {
                int gridCount = store.getInteger("store_grid_count");
                String storeTypeId = store.getString("store_type_id");
                StoreType storeType = StoreType.findFirst("store_type_id=?", storeTypeId);
                int cellCount = storeType.getInteger("store_type_cell");

                int totalCellCount = gridCount * cellCount;
                int usageCellCount = StoreThingMap.count("store_id=?", storeId).intValue();
                Map<String, Integer> result = new HashMap<>();
                result.put("all", totalCellCount);
                result.put("used", usageCellCount);
                return RequestResult.success(result);
            } else {
                return RequestResult.fail("Store " + storeId + " is not found");
            }
        });

    }

    @RequestMapping(value = "/{store_id}/thing", method = RequestMethod.GET)
    public RequestResult<?> getThings(@PathVariable("store_id") String storeId) {

        return ActiveJdbc.operTx(() -> {
            Store store = Store.findFirst("store_id=?", storeId);
            if (store != null) {
                Map<String, Object> resultMap = new HashMap<>();
                resultMap.put("store_grid_count", store.getInteger("store_grid_count"));
                StoreType storeType = StoreType.findFirst("store_type_id=?", store.getString("store_type_id"));
                resultMap.put("store_type_cell", storeType.getInteger("store_type_cell"));
                List<Map> things = StoreThingMap.find("store_id=?", storeId).include(Thing.class).toMaps();
                resultMap.put("things", things);
                return RequestResult.success(resultMap);

            } else {
                return RequestResult.fail("Store " + storeId + " is not found");
            }
        });
    }




    @RequestMapping(value = "/{store_id}/grid/{grid_index}/free", method = RequestMethod.GET)
    public RequestResult<?> getFree(@PathVariable("store_id") String storeId,
                                @PathVariable("grid_index") String gridIndex) {
        return ActiveJdbc.operTx(() -> {
            Store store = Store.findFirst("store_id=?", storeId);
            if (store != null ) {
                String storeTypeId = store.getString("store_type_id");
                StoreType storeType = StoreType.findFirst("store_type_id=?", storeTypeId);
                int cellCount = storeType.getInteger("store_type_cell");

                List<StoreThingMap> cellMap = StoreThingMap.find("store_id=? and grid_index=? ORDER BY cell_start_index ASC ", storeId, gridIndex);
                if (cellMap.size() == 0 ) {return RequestResult.fail("The Store " + storeId + " - grid_index " + gridIndex + "is not found");}
                List<Integer> usageCellList = cellMap.stream()
                        .map(storeThingMap -> storeThingMap.getInteger("cell_start_index"))
                        .sorted()
                        .collect(Collectors.toList());

                int[] cellStatus = new int[cellCount];
                usageCellList.stream()
                        .forEach(integer -> cellStatus[integer] = 1);

                List<Integer> freeCellList = new ArrayList<>(cellStatus.length);
                for (int i = 0; i < cellCount; i++) {
                    if (cellStatus[i] == 0) {
                        freeCellList.add(i);
                    }
                }

                return RequestResult.success(freeCellList);
            } else {
                return RequestResult.fail("Store " + storeId + " is not found");
            }
        });
    }

    @RequestMapping(value = "/{store_id}/grid/{grid_index}/used", method = RequestMethod.GET)
    public RequestResult<?> getUsed(@PathVariable("store_id") String storeId,
                                    @PathVariable("grid_index") String gridIndex) {
        return ActiveJdbc.operTx(() -> {
            Store store = Store.findFirst("store_id=?", storeId);
            if (store != null ) {
                String storeTypeId = store.getString("store_type_id");
                StoreType storeType = StoreType.findFirst("store_type_id=?", storeTypeId);
                int cellCount = storeType.getInteger("store_type_cell");

                List<StoreThingMap> cellMap = StoreThingMap.find("store_id=? and grid_index=? ORDER BY cell_start_index ASC ", storeId, gridIndex);
                if (cellMap.size() == 0 ) {return RequestResult.fail("The Store " + storeId + " - grid_index " + gridIndex + "is not found");}
                List<Integer> usageCellList = cellMap.stream()
                        .map(storeThingMap -> storeThingMap.getInteger("cell_start_index"))
                        .sorted()
                        .collect(Collectors.toList());

                return RequestResult.success(usageCellList);
            } else {
                return RequestResult.fail("Store " + storeId + " is not found");
            }
        });
    }


    @RequestMapping(value = "/qrcode", method = RequestMethod.GET)
    public void genQRCodeDoc(@RequestParam("store_id[]") String[] ids) {

        ActiveJdbc.operTx(() -> {

            StringJoiner stringJoiner = new StringJoiner(",");
            for (String id : ids) {
                stringJoiner.add("?");
            }
            List<Store> storeList = Store.find("store_id IN (" + stringJoiner.toString() + ")", ids);
            StdQRCode stdQRCode = new StdQRCode();
            stdQRCode.genDoc(storeList.size());

            for (int i = 0; i < storeList.size(); i++) {
                Store store = storeList.get(i);
                Map<String, String> jsonObj = new HashMap<>();
                jsonObj.put("id", store.getString("store_id"));
                jsonObj.put("name", store.getString("store_name"));
                stdQRCode.addImg(i, new Gson().toJson(jsonObj));
                stdQRCode.addTexts(store.getString("store_name"));
                stdQRCode.next();
            }
            stdQRCode.write(response);
            stdQRCode.delete();
            return null;
        });

    }
}