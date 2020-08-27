package com.servtech.servcloud.app.controller.storage;

import com.google.gson.Gson;
import com.servtech.servcloud.app.controller.storage.util.RecordAfter;
import com.servtech.servcloud.app.controller.storage.util.RuleEnum;
import com.servtech.servcloud.app.model.storage.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.core.util.Util;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

@Controller
@RequestMapping("/storage/storage")
public class StorageController {

    private static final Logger LOG = LoggerFactory.getLogger(ZoneController.class);
    private static final String LOCK = new String();

    @Autowired
    private HttpServletRequest request;
    String login_user = "";

    @RequestMapping(value = "/saveJsonFile", method = POST)
    @ResponseBody
    public RequestResult<?> saveJsonFile(@RequestBody final Map<String, Object> data) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                login_user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();
                String path = System.getProperty(SysPropKey.CUST_PARAM_PATH) + "/storage/";
                if (data.get("file_name") != null) {
                    path += data.get("file_name").toString() + ".json";
                }

                if (((List) data.get("zoneDeleteList")).size() > 0) {
                    List store =  Base.findAll("SELECT store_id FROM a_storage_store WHERE zone_id in (" + Util.strSplitBy("?", ",", ((List) data.get("zoneDeleteList")).size()) + ")", ((List) data.get("zoneDeleteList")).toArray());
                    for (int i=0; i<store.size(); i++) {
                        String storeId = ((Map<String, String>)store.get(i)).get("store_id");
                        List position =  Base.findAll("SELECT position_id FROM a_storage_store_position WHERE store_id='" + storeId + "'");
                        for (int positionI=0; positionI<position.size(); positionI++) {
                            StorePositionLightMap.delete("position_id='" + ((Map<String, String>)position.get(positionI)).get("position_id") + "'");
                        }
                        StorePillerLightMap.delete("map_id='" + storeId + "'");
                        StorePosition.delete("store_id='" + storeId + "'");
                    }
                    Store.delete("zone_id IN (" + Util.strSplitBy("?", ",", ((List) data.get("zoneDeleteList")).size()) + ")", ((List) data.get("zoneDeleteList")).toArray());
                    Zone.delete("zone_id IN (" + Util.strSplitBy("?", ",", ((List) data.get("zoneDeleteList")).size()) + ")", ((List) data.get("zoneDeleteList")).toArray());
                }
                if (((List) data.get("storeDeleteList")).size() > 0) {
                    deletePillerLight((List) data.get("storeDeleteList"));
                    List position =  Base.findAll("SELECT position_id FROM a_storage_store_position WHERE store_id in (" + Util.strSplitBy("?", ",", ((List) data.get("storeDeleteList")).size()) + ")", ((List) data.get("storeDeleteList")).toArray());
                    for (int i=0; i<position.size(); i++) {
                        StorePositionLightMap.delete("position_id='" + ((Map<String, String>)position.get(i)).get("position_id") + "'");
                    }
                    StorePosition.delete("store_id IN (" + Util.strSplitBy("?", ",", ((List) data.get("storeDeleteList")).size()) + ")", ((List) data.get("storeDeleteList")).toArray());
                    Store.delete("store_id IN (" + Util.strSplitBy("?", ",", ((List) data.get("storeDeleteList")).size()) + ")", ((List) data.get("storeDeleteList")).toArray());
                }
                if (((List) data.get("positionDeleteList")).size() > 0) {
                    deletePositionLight((List) data.get("positionDeleteList"));
                    StorePosition.delete("position_id IN (" + Util.strSplitBy("?", ",", ((List) data.get("positionDeleteList")).size()) + ")", ((List) data.get("positionDeleteList")).toArray());
                }
                if (((List) data.get("positionLightDeleteList")).size() > 0) {
                    deletePositionLight((List) data.get("positionLightDeleteList"));
                }
                if (((List) data.get("pillerLightDeleteList")).size() > 0) {
                    deletePillerLight((List) data.get("pillerLightDeleteList"));
                }

                StringBuilder idPath = new StringBuilder();
                StringBuilder namePath = new StringBuilder();
                getLevelData((List) data.get("data"), Integer.parseInt(data.get("lastLevel").toString()), idPath, namePath, "", "", "");
                File folder = new File(path);
                if (!folder.exists()) {
                    try {
                        folder.createNewFile();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
                String json = null;
                try {
                    FileOutputStream fos = new FileOutputStream(folder);
                    json = new Gson().toJson(data.get("data"));
                    fos.write(json.getBytes("utf-8"));
                    fos.flush();
                    fos.close();
                } catch (IOException e) {
                    System.out.println(e);
                    return fail("建檔失敗，原因待查...");
                }

                return success(json);
            });
        }
    }

    private void getLevelData(List<Map<String, Object>> data, int level, StringBuilder idPath, StringBuilder namePath, String parentId, String grandParentId, String parentName) {
        int index = 0;
        if (data != null && data.size() > 0) {
            for (Map<String, Object> map : data) {
                StringBuilder childIdPath = new StringBuilder();
                StringBuilder childNamePath = new StringBuilder();
                String db_id = "";

                childIdPath.append(idPath);
                childNamePath.append(namePath);
                if (level - 3 == Integer.valueOf(map.get("level").toString())) {
                    db_id = insertZoneData(map, childIdPath, childNamePath);
                    map.put("db_id", db_id);
                } else if (level - 2 == Integer.valueOf(map.get("level").toString())){
                } else if (level - 1 == Integer.valueOf(map.get("level").toString())) {
                    db_id = insertStoreData(map, grandParentId, parentName);
                    map.put("db_id", db_id);
                } else if (level == Integer.valueOf(map.get("level").toString())) {
                    db_id = insertPositionData(map, parentId, index);
                    map.put("db_id", db_id);
                } else {
                    if (childIdPath.length() > 1) {
                        childIdPath.append("-");
                    }
                    String thisIdPath = "";
                    thisIdPath = map.get("id").toString();
                    if (thisIdPath.equals("")) {
                        thisIdPath = "/NULL/";
                    }
                    childIdPath.append(thisIdPath);
                    if (childNamePath.length() > 1) {
                        childNamePath.append("-");
                    }

                    String thisNamePath = "";
                    thisNamePath = map.get("name").toString();
                    if (thisNamePath.equals("")) {
                        thisNamePath = thisIdPath;
                    }
                    childNamePath.append(thisNamePath);
                }
                if (!isEmpty((List<Map<String, Object>>) map.get("child")))
                    getLevelData((List<Map<String, Object>>) map.get("child"), level, childIdPath, childNamePath, db_id, parentId, map.get("name").toString());

                if (level - 2 == Integer.valueOf(map.get("level").toString())){
                    if (map.get("light_id") != null && !isEmpty((List<Map<String, Object>>) map.get("child"))) {
                        int light = Integer.parseInt(map.get("light_id").toString());
                        for (Map<String, Object> childData : (List<Map<String, Object>>) map.get("child")) {
                            insertPillerLightData(childData.get("db_id").toString(), light);
                        }
                    }
                }
                map.remove("create_by");
                map.remove("create_time");
                map.remove("modify_by");
                map.remove("modify_time");
                index++;
            }
        }
    }

    private boolean isEmpty(Collection<?> collection) {
        return (collection == null || collection.isEmpty());
    }

    private String insertZoneData(Map<String, Object> data, StringBuilder idPath, StringBuilder namePath) { // 更新zone資料
        RuleEnum RULE = RuleEnum.ZONE;
        String last = "";
        data.put("zone_org_id", data.get("id"));
        data.put("zone_name", data.get("name"));
        data.put("zone_id_path", idPath.toString());
        data.put("zone_name_path", namePath.toString());

        Zone zone = new Zone();
        if (data.get("db_id") == null) {
            zone = Zone.findFirst("ORDER BY zone_id Desc");
            if (zone == null) {
                last = RuleEnum.getSeq(RULE, 0);
            } else {
                int seq = Integer.parseInt(zone.getString("zone_id").substring(1));
                last = RuleEnum.getSeq(RULE, seq);
            }
            data.put("zone_id", last);
            RecordAfter.putCreateAndModify(data, login_user, System.currentTimeMillis());
            zone = new Zone().fromMap(data);
            zone.insert();
        } else {
            last = data.get("db_id").toString();
            data.put("zone_id", data.get("db_id"));
            Zone existsZone = Zone.findFirst("zone_id='" + data.get("db_id") + "'");
            if (existsZone != null) {
                RecordAfter.putModify(data, login_user, System.currentTimeMillis());
                zone = new Zone().fromMap(data);
                zone.saveIt();
            } else {
                RecordAfter.putCreateAndModify(data, login_user, System.currentTimeMillis());
                zone = new Zone().fromMap(data);
                zone.insert();
            }
        }
        data.remove("zone_id");
        data.remove("zone_org_id");
        data.remove("zone_name");
        data.remove("zone_id_path");
        data.remove("zone_name_path");
        return last;
    }

    private String insertStoreData(Map<String, Object> data, String parentId, String parentName) { // 更新store資料
        RuleEnum RULE = RuleEnum.STORE;
        String last = "";
        data.put("store_org_id", data.get("id"));
        data.put("store_name", parentName + data.get("name"));
        data.put("zone_id", parentId);
        data.put("store_rule", "{}");
        data.put("store_grid_count", 1);

        if (!isEmpty((List<Map<String, Object>>) data.get("child"))) { // 先塞store type
            Integer id = null;
            if (data.get("store_type_id") != null) {
                id = ((Double)data.get("store_type_id")).intValue();
            }
            data.put("store_type_id", insertStoreType(id, ((List<Map<String, Object>>) data.get("child")).size(), data.get("name").toString()));
        }

        Store store = new Store();
        if (data.get("db_id") == null) {
            store = Store.findFirst("ORDER BY store_id Desc");
            if (store == null) {
                last = RuleEnum.getSeq(RULE, 0);
            } else {
                int seq = Integer.parseInt(store.getString("store_id").substring(1));
                last = RuleEnum.getSeq(RULE, seq);
            }
            data.put("store_id", last);
            RecordAfter.putCreateAndModify(data, login_user, System.currentTimeMillis());
            store = new Store().fromMap(data);
            store.insert();
        } else {
            last = data.get("db_id").toString();
            data.put("store_id", data.get("db_id"));
            Store existsStore = Store.findFirst("store_id='" + data.get("db_id") + "'");
            if (existsStore != null) {
                RecordAfter.putModify(data, login_user, System.currentTimeMillis());
                store = new Store().fromMap(data);
                store.saveIt();
            } else {
                RecordAfter.putCreateAndModify(data, login_user, System.currentTimeMillis());
                store = new Store().fromMap(data);
                store.insert();
            }
        }
        data.remove("store_id");
        data.remove("store_org_id");
        data.remove("store_name");
        data.remove("zone_id");
        data.remove("zone_rule");
        data.remove("store_grid_count");
        return last;
    }

    private int insertStoreType(Integer id, int length, String name) {
        Map<String, Object> data = new HashMap<>();
        data.put("store_type_cell", length);
        int last = 0;
        StoreType storeType = new StoreType();
        
        if (id == null) {
            storeType = StoreType.findFirst("ORDER BY store_type_id Desc");
            if (storeType != null) { last = storeType.getInteger("store_type_id") + 1; }
            data.put("store_type_id", last);
            data.put("store_type_name", name);
            RecordAfter.putCreateAndModify(data, login_user, System.currentTimeMillis());
            storeType = new StoreType().fromMap(data);
            storeType.insert();
        } else {
            last = id;
            data.put("store_type_id", last);
            StoreType existsStoreType = StoreType.findFirst("store_type_id='" + last + "'");
            if (existsStoreType != null) {
                RecordAfter.putModify(data, login_user, System.currentTimeMillis());
                storeType = new StoreType().fromMap(data);
                storeType.saveIt();
            } else {
                RecordAfter.putCreateAndModify(data, login_user, System.currentTimeMillis());
                storeType = new StoreType().fromMap(data);
                storeType.insert();
            }
        }
        data.remove("store_type_id");
        data.remove("store_type_cell");
        data.remove("store_type_name");
        return last;
    }

    private String insertPositionData(Map<String, Object> data, String parent, int grid_index) {
        RuleEnum RULE = RuleEnum.STORE_POSITION;
        String last = "";
        data.put("position_org_id", data.get("id"));
        data.put("position_name", data.get("name"));
        data.put("store_id", parent);
        data.put("store_grid_index", 0);
        data.put("store_cell_index", grid_index);

        StorePosition position = new StorePosition();
        if (data.get("db_id") == null) {
            position = StorePosition.findFirst("ORDER BY position_id Desc");
            if (position == null) {
                last = RuleEnum.getSeq(RULE, 0);
            } else {
                int seq = Integer.parseInt(position.getString("position_id").substring(1));
                last = RuleEnum.getSeq(RULE, seq);
            }
            data.put("position_id", last);
            RecordAfter.putCreateAndModify(data, login_user, System.currentTimeMillis());
            position = new StorePosition().fromMap(data);
            position.insert();
        } else {
            last = data.get("db_id").toString();
            data.put("position_id", data.get("db_id"));
            StorePosition existsPosition = StorePosition.findFirst("position_id='" + data.get("db_id") + "'");
            if (existsPosition != null) {
                RecordAfter.putModify(data, login_user, System.currentTimeMillis());
                position = new StorePosition().fromMap(data);
                position.saveIt();
            } else {
                RecordAfter.putCreateAndModify(data, login_user, System.currentTimeMillis());
                position = new StorePosition().fromMap(data);
                position.insert();
            }
        }
        if (data.get("light_id") != null) {
            insertPositionLightData(last, Integer.parseInt(data.get("light_id").toString()));
        }
        data.remove("position_id");
        data.remove("position_org_id");
        data.remove("position_name");
        data.remove("store_id");
        data.remove("store_grid_index");
        data.remove("store_cell_index");
        return last;
    }

    private void insertPositionLightData(String position_id, int light_index) {
        Map<String, Object> data = new HashMap<>();
        data.put("position_id", position_id);
        data.put("light_index", light_index);
        StorePositionLightMap position = StorePositionLightMap.findFirst("position_id='" + position_id + "'");
        if (position != null) {
            StorePositionLightMap.delete("position_id='" + position_id + "'");
        }
        RecordAfter.putCreateAndModify(data, login_user, System.currentTimeMillis());
        position = new StorePositionLightMap().fromMap(data);
        position.insert();
    }

    private void insertPillerLightData(String store_id, int light_id) {
        Map<String, Object> data = new HashMap<>();
        data.put("map_id", store_id);
        data.put("light_id", light_id);
        data.put("color", "R");  //預設柱位燈顏色為紅色
        StorePillerLightMap piller = StorePillerLightMap.findFirst("map_id='" + store_id + "'");
        if (piller != null) {
            StorePillerLightMap.delete("map_id='" + store_id + "'");
        }
        piller = new StorePillerLightMap().fromMap(data);
        piller.insert();
    }

    private void deletePositionLight (List data) {
        StorePositionLightMap.delete("position_id IN (" + Util.strSplitBy("?", ",", data.size()) + ")", data.toArray());
    }

    private void deletePillerLight (List data) {
        StorePillerLightMap.delete("map_id IN (" + Util.strSplitBy("?", ",", data.size()) + ")", data.toArray());
    }
}
