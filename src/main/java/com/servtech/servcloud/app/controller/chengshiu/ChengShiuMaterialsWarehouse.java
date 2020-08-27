package com.servtech.servcloud.app.controller.chengshiu;

import com.servtech.servcloud.app.model.chengshiu.Material;
import com.servtech.servcloud.app.model.chengshiu.MaterialItem;
import com.servtech.servcloud.app.model.chengshiu.MachineMaterial;
import com.servtech.servcloud.app.model.chengshiu.Storing;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/10/11.
 */

@RestController
@RequestMapping("/chengshiu/materialsWarehouse")
public class ChengShiuMaterialsWarehouse {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(ChengShiuMaterialsWarehouse.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/readStoring", method = RequestMethod.POST)
    public RequestResult<?> readStoring(@RequestBody final Map data) {
        final String statusId = data.get("status_id") == "" ? null : data.get("status_id").toString();
        final String pstoringId = data.get("pstoring_id") == "" ? null : data.get("pstoring_id").toString();
        final String materialId = data.get("material_id") == "" ? null : data.get("material_id").toString();
        final String queryType = data.get("query_type").toString();
//        SRS1.4.6_01原料倉以儲位查詢
//        	可選擇顯示所有儲位、顯示所有空儲位(staus_id=0)或依儲位查詢，儲位查詢為單選

//        SRS1.4.6_02原料倉以原料查詢
//        	可選則顯示所有原料、或依原料查詢，原料查詢為單選
        return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                Material material = new Material();
                List<Map> queryMaterial = material.findAll().toMaps();

                Map materialId2Name = new HashMap();
                for (Map map : queryMaterial) {
                    String materialId = map.get("material_id").toString();
                    String materialName = map.get("material_name").toString();
                    materialId2Name.put(materialId, materialName);
                }

                StringBuilder sb = new StringBuilder();
                sb.append("SELECT mi.item_id, mi.purchase_time, mi.material_id, s.status_id, s.pstoring_name, s.pstoring_id, sa.area_id, sa.type ");
                sb.append("FROM a_chengshiu_material_item AS mi ");
                sb.append(queryType.equals("storing") ? "RIGHT JOIN " : "INNER JOIN ");
                sb.append("a_chengshiu_storing AS s ");
                sb.append("ON mi.pstoring_id = s.pstoring_id ");
                sb.append("LEFT JOIN a_chengshiu_storing_area sa ");
                sb.append("ON sa.area_id = s.area_id ");
                sb.append("WHERE type = 'M' ");

                if (queryType.equals("storing")) {
//                SRS1.4.6_01原料倉以儲位查詢
//                	TABLE： STORING儲位、MATERIAL_ITEM原料單件
                    if (!"".equals(statusId)) {
                        sb.append("AND s.status_id = '" + statusId + "' ");
                    } else if (!"".equals(pstoringId)) {
                        sb.append("AND s.pstoring_id = '" + pstoringId + "'");
                    }

//                1.	若該儲位狀態非為空(status_id!=0)，需顯示其原料名稱(material_name)與原料單件號(item_id)
//                2.	若該儲位為空(status_id=0)則於原料名稱與原料單件顯示為”--"

                } else if (queryType.equals("material")) {
                    if (!"".equals(materialId)) {
                        sb.append("AND material_id = '" + materialId + "'");
                    }
                }

                String sql = sb.toString();
                System.out.println(sql);
                List<Map> queryResult = Base.findAll(sql);
                for (Map map : queryResult) {
                    if (map.get("material_id") != null) {
                        String materialId = map.get("material_id").toString();
                        map.put("material_name", materialId2Name.get(materialId));
                    }
                }

//                SRS1.4.6_02原料倉以原料查詢
//                	TABLE：STORING儲位、MATERIAL_ITEM原料單件
//                	依篩選條件取得MATERIAL_ITEM原料單件內，狀態為庫存單件(status_id=0)，顯示內容包含
//                1.	儲存原料=material_name
//                2.	原料單件號=iterm_id
//                3.	儲位名稱=pstoring_name
//                4.	進貨日期=purchase_time
                return success(queryResult);
            }
        });
    }

    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                return success(Material.findAll().toMaps());
            }
        });
    }

    @RequestMapping(value = "/updateProductCountdown", method = RequestMethod.PUT)
    public RequestResult<?> updateProductCountdown(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {

                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                    Material material = new Material();
                    material.fromMap(data);
                    if (material.saveIt()) {
                        return success("update success!!!");
                    } else {
                        return fail("update fail...");
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/updateOutWarehouseStatus", method = RequestMethod.PUT)
    public RequestResult<?> updateOutWarehouseStatus(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    data.put("status_id", "1");
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                    MaterialItem materialItem = new MaterialItem();
                    materialItem.fromMap(data);
                    if (materialItem.saveIt()) {
                        return success("update success!!!");
                    } else {
                        return fail("update fail...");
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/updateManualStoring", method = RequestMethod.PUT)
    public RequestResult<?> updateManualStoring(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Object modifyBy = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                    Timestamp modifyTime = new Timestamp(System.currentTimeMillis());
                    data.put("modify_by", modifyBy);
                    data.put("modify_time", modifyTime);

                    //3.點選儲存更新資料庫
                    //(1)MATERIAL_ITEM.pstoring_id=新儲位
                    MaterialItem materialItem = new MaterialItem();
                    materialItem.fromMap(data);

                    //(2)舊儲位狀態為空(STORING.status_id=0)
                    List<Map> result = MaterialItem.find("item_id = ?", data.get("item_id")).toMaps();
                    String oldStoringId = result.get(0).get("pstoring_id").toString();
                    Map oldStoringMap = new HashMap();
                    oldStoringMap.put("pstoring_id", oldStoringId);
                    oldStoringMap.put("status_id", 0);
                    oldStoringMap.put("modify_by", modifyBy);
                    oldStoringMap.put("modify_time", modifyTime);
                    Storing storing = new Storing();
                    storing.fromMap(oldStoringMap);

                    //(3)新儲位狀態為有存放物(STORING.status_id=1)
                    Map newStoringMap = new HashMap();
                    newStoringMap.put("pstoring_id", data.get("pstoring_id"));
                    newStoringMap.put("status_id", 1);
                    newStoringMap.put("modify_by", modifyBy);
                    newStoringMap.put("modify_time", modifyTime);
                    Storing storing2 = new Storing();
                    storing2.fromMap(newStoringMap);

                    if (materialItem.saveIt() && storing.saveIt() && storing2.saveIt()) {
                        return success("update success");
                    } else {
                        return fail("update fail...");
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/shipment", method = RequestMethod.PUT)
    public RequestResult<?> shipment(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    List<Map> result = MaterialItem.find("item_id = ?", data.get("item_id")).toMaps();
                    String oldStoringId = result.get(0).get("pstoring_id").toString();
                    data.put("status_id", 1);
                    data.put("pstoring_id", null);
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                    MaterialItem materialItem = new MaterialItem();
                    materialItem.fromMap(data);
                    if (!materialItem.saveIt()) {
                        return fail("update material item fail...");
                    }

                    final List<Map> maxCount = Base.findAll("SELECT COUNT(*) as count FROM a_chengshiu_material_item WHERE pstoring_id = '" + oldStoringId + "'");
                    long count = Long.parseLong(maxCount.get(0).get("count").toString());
                    if(count == 0) {
                        Map oldStoringMap = new HashMap();
                        oldStoringMap.put("pstoring_id", oldStoringId);
                        oldStoringMap.put("status_id", 0);
                        Storing storing = new Storing();
                        storing.fromMap(oldStoringMap);
                        if (!storing.saveIt()) {
                            return fail("update storing fail...");
                        }
                    }
                    return success("update success");
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/createMaterialItem", method = RequestMethod.POST)
    public RequestResult<?> createMaterialItem(@RequestBody final Map data) {
        SimpleDateFormat yyyyMM = new SimpleDateFormat("yyyyMM");
        final String currDate = yyyyMM.format(new Date());
        final String materialId = data.get("material_id").toString();
        final Integer count = data.get("count") == null? 0: Integer.parseInt(data.get("count").toString());
        final String expDate = data.get("exp_date") == null? null: data.get("exp_date").toString();
        final Map<String, Object> materialMap = new HashMap<String, Object>();
        final List<String> itemIdList = new ArrayList<String>();
        ActiveJdbc.operTx(new Operation<Void>() {
            @Override
            public Void operate() {
                Material materialPK = Material.findFirst("material_id=?", materialId);
                Integer defaultPcs = materialPK.getInteger("default_pcs");
                final List<Map> maxCount = Base.findAll("SELECT COUNT(*) as count FROM a_chengshiu_material_item WHERE item_id like '" + materialId + "_" + currDate + "%'");
                long number = Long.parseLong(maxCount.get(0).get("count").toString());
                materialMap.put("material_id", materialId);
                materialMap.put("mark_pcs", 0);
                materialMap.put("usable_pcs", defaultPcs);
                materialMap.put("status_id", -1);
                materialMap.put("exp_date", expDate);
                materialMap.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                materialMap.put("create_time", new Timestamp(System.currentTimeMillis()));
                materialMap.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                materialMap.put("modify_time", new Timestamp(System.currentTimeMillis()));

                for (int i = 0; i < count; i++) {
                    number++;
                    String item_id = materialId + "_" + currDate + String.format("%03d", number);
                    materialMap.put("item_id", item_id);
                    MaterialItem materialItem = new MaterialItem();
                    materialItem.fromMap(materialMap);
                    if (materialItem.insert()) {
                        itemIdList.add(item_id);
                    } else {
                        int runCount = 10;
                        for (int j = 0; j < runCount; j++) {
                            number++;
                            item_id = materialId + "_" + currDate + String.format("%03d", number);
                            materialMap.put("item_id", item_id);
                            materialItem.fromMap(materialMap);
                            if (materialItem.insert()) {
                                itemIdList.add(item_id);
                                break;
                            }
                        }
                    }
                }
                return null;
            }
        });

        if (itemIdList.size() == 0) {
            return fail("create fail... plz check");
        } else {
            return success(itemIdList);
        }
    }

    @RequestMapping(value = "/updateMaterialItem", method = RequestMethod.PUT)
    public RequestResult<?> updateMaterialItem(@RequestBody final List<Map> dataList) {
        final Timestamp timestamp = new Timestamp(System.currentTimeMillis());
        final Set<String> storingList = new HashSet<String>();
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                for (Map map : dataList) {
                    if (map.get("status_id").toString().equals("-1")) {
                        map.put("purchase_time", timestamp);
                    }
                    map.put("status_id", 0);
                    storingList.add(map.get("pstoring_id").toString());
                    map.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    map.put("modify_time", timestamp);
                }
                MaterialItem materialItem = new MaterialItem();
                Storing storing = new Storing();
                Map storingMap = new HashMap();
                for (Map map : dataList) {
                    materialItem.fromMap(map);
                    if (!materialItem.saveIt()) {
                        return fail("更新 原料入庫失敗...請確認");
                    }
                }
                for (String storingId : storingList) {
                    storingMap.put("pstoring_id", storingId);
                    storingMap.put("status_id", 1);
                    storing.fromMap(storingMap);
                    if (!storing.saveIt()) {
                        return fail("更新 原料儲位狀態失敗...請確認");
                    }
                }
                return success();
            }
        });
    }

    @RequestMapping(value = "/readMachineMaterial", method = RequestMethod.GET)
    public RequestResult<List<Map>> readMachineMaterial() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                List<Map> materialList = Material.find("is_open = 'Y'").toMaps();
                List<Map> result = new ArrayList<Map>();
                for (Map map : materialList) {
                    List<Map> machineMaterialList = MachineMaterial.find("material_id = '" + map.get("material_id") + "'").toMaps();
                    System.out.println(map.get("material_id"));
                    result.addAll(machineMaterialList);
                }
                return success(result);
            }
        });
    }



}
