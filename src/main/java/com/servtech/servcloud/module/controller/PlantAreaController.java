package com.servtech.servcloud.module.controller;

import com.google.gson.Gson;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.*;
import com.servtech.servcloud.module.model.view.MachinePlantArea;
import org.javalite.activejdbc.DBException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Kevin Big Big on 2015/8/17.
 */
@RestController
@RequestMapping("/plantarea")
public class PlantAreaController {
    private static final Logger log = LoggerFactory.getLogger(PlantAreaController.class);

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    data.put("row_length", 5);
                    data.put("column_length", 6);
                    data.put("row_head", "[\"\",\"\",\"\",\"\"]");
                    data.put("column_head", "[\"\",\"\",\"\",\"\",\"\"]");
                    Plant plant = new Plant();
                    plant.fromMap(data);

                    if (plant.insert()) {
                        Map<String, String> plantMachineMap = new HashMap<String, String>();
                        Map<String, String> dataMachineMap = new HashMap<String, String>();

                        List<Map> machineMaps = Device.findAll().toMaps();
                        List<Map> plantMachineMaps = PlantArea.findAll().toMaps();

                        String plantId = data.get("plant_id").toString();

                        // 拿到機台跟廠區的關係
                        for(Map machine: plantMachineMaps) {
                            plantMachineMap.put(machine.get("device_id").toString(), machine.get("plant_id").toString());
                        }


                        if(data.get("plant_areas") != null) {
                            for (String deviceId : (List<String>) data.get("plant_areas")) {
                                dataMachineMap.put(deviceId, plantId);
                            }
                        }

                        for(Map machine: machineMaps) {
                            String deviceId = machine.get("device_id").toString();
                            try {
                                if(plantMachineMap.get(deviceId) != null) {
                                    if ((!plantMachineMap.get(deviceId).equals(plantId) && dataMachineMap.get(deviceId) != null) ||
                                            (plantMachineMap.get(deviceId).equals(plantId) && dataMachineMap.get(deviceId) == null)) {
                                        PlantArea.delete("device_id = ?", deviceId);
                                    }
                                }
                                if((plantMachineMap.get(deviceId) == null || !plantMachineMap.get(deviceId).equals(plantId)) &&
                                        dataMachineMap.get(deviceId) != null) {
                                    PlantArea plantArea = new PlantArea();
                                    plantArea.set("plant_id", data.get("plant_id"), "device_id", deviceId, "row_index", 1, "column_index", 1);
                                    plantArea.insert();
                                }
                            } catch (Exception e) {
                                throw new DBException(e);
                            }
                        }
                        return success(plant.getString("plant_id"));
                    } else {
                        return fail("新增失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                return success(Plant.findAll().include(PlantArea.class).toMaps());
            }
        });
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                Map<String, String> plantMachineMap = new HashMap<String, String>();
                Map<String, String> dataMachineMap = new HashMap<String, String>();

                List<Map> machineMaps = Device.findAll().toMaps();
                List<Map> plantMachineMaps = PlantArea.findAll().toMaps();

                String plantId = data.get("plant_id").toString();

                // 拿到機台跟廠區的關係
                for(Map machine: plantMachineMaps) {
                    plantMachineMap.put(machine.get("device_id").toString(), machine.get("plant_id").toString());
                }

                if(data.get("plant_areas") != null) {
                    for (String deviceId : (List<String>) data.get("plant_areas")) {
                        dataMachineMap.put(deviceId, plantId);
                    }
                }

                for(Map machine: machineMaps) {
                    String deviceId = machine.get("device_id").toString();
                    try {
                        if(plantMachineMap.get(deviceId) != null) {
                            if ((!plantMachineMap.get(deviceId).equals(plantId) && dataMachineMap.get(deviceId) != null) ||
                                    (plantMachineMap.get(deviceId).equals(plantId) && dataMachineMap.get(deviceId) == null)) {
                                PlantArea.delete("device_id = ?", deviceId);
                            }
                        }
                        if((plantMachineMap.get(deviceId) == null || !plantMachineMap.get(deviceId).equals(plantId)) &&
                                dataMachineMap.get(deviceId) != null) {
                            PlantArea plantArea = new PlantArea();
                            plantArea.set("plant_id", data.get("plant_id"), "device_id", deviceId, "row_index", 1, "column_index", 1);
                            plantArea.insert();
                        }
                    } catch (Exception e) {
                        throw new DBException(e);
                    }
                }

                Plant plant = new Plant();
                plant.fromMap(data);
                if (plant.saveIt()) {
                    return success(plant.getString("plant_id"));
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }

    @RequestMapping(value = "/delete", method = DELETE)
    public RequestResult<Void> delete(@RequestBody final Object[] idList) {
        return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {
                int deleteAmount = Plant.delete("plant_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }

    @RequestMapping(value = "/readMachineIdWithPlantName", method = GET)
    public RequestResult<List<Map>> readMachineIdWithPlantName() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                Map<String, String> plantMachineMap = new HashMap<String, String>();
                Map<String, String> plantMap = new HashMap<String, String>();

                List<Map> machineMaps = Device.findAll().toMaps();
                List<Map> plantMaps = Plant.findAll().toMaps();
                List<Map> plantMachineMaps = PlantArea.findAll().toMaps();

                // 拿到廠區名稱
                for(Map machine: plantMaps) {
                    plantMap.put(machine.get("plant_id").toString(), machine.get("plant_name").toString());
                }
                // 拿到機台跟廠區的關係
                for(Map machine: plantMachineMaps) {
                    plantMachineMap.put(machine.get("device_id").toString(), machine.get("plant_id").toString());
                }
                for(Map machine: machineMaps) {
                    String deviceId = machine.get("device_id").toString();
                    if(plantMachineMap.get(deviceId) != null) {
                        String plantName = plantMap.get(plantMachineMap.get(deviceId));
                        machine.put("device_name_with_plant", machine.get("device_name").toString() + "(" + plantName + ")");
                    } else {
                        machine.put("device_name_with_plant", machine.get("device_name").toString());
                    }
                }
                return success(machineMaps);
            }
        });
    }

    @RequestMapping(value = "/readAreaById", method = GET)
    public RequestResult<Map> readAreaById(@RequestParam(value = "id") final String id) {
        return ActiveJdbc.oper(new Operation<RequestResult<Map>>() {
            @Override
            public RequestResult<Map> operate() {
                Map result = new HashMap<String, Object>();
                Plant plant = Plant.findById(id);
                if (plant == null) {
                    result.put("msg", "not find this plant area!");
                    return fail(result);
                }
                List<Map> machinePlantAreaMaps = MachinePlantArea.find("plant_id = ?", id).toMaps();
                List<MachinePlantArea> machinePlantAreas = MachinePlantArea.find("plant_id = ?", id);
                List<Map> boxMaps = Box.findAll().include(Device.class).toMaps();//全box綁定的device
                List<Map> machineCncBrandMaps = DeviceCncBrand.findAll().toMaps();//全機台廠牌

                String[][] plantMatrix = buildPlantAreaMatrix(plant, machinePlantAreas);

                result.put("boxs", boxMaps);
                result.put("machines", machinePlantAreaMaps);
                result.put("area", plantMatrix);
                result.put("machineCncBrands", machineCncBrandMaps);

                return success(result);
            }
        });
    }

    @RequestMapping(value = "/readNoPlantMachineIdByPlantId", method = GET)
    public RequestResult<List<Map>> readNoPlantMachineIdByPlantId(@RequestParam(value = "id") final String id) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                //沒有廠域的machine
                List<Map> noPlantMachineMaps = Device.where(" not exists (select pa.device_id from m_plant_area pa where pa.device_id = m_device.device_id)").toMaps();
                //此廠域的machine
                List<Map> thisPlantMachineMaps = PlantArea.find("plant_id = ?", id).toMaps();
                //合併
                thisPlantMachineMaps.addAll(noPlantMachineMaps);
                return success(thisPlantMachineMaps);
            }
        });
    }

    @RequestMapping(value = "/updateArea", method = POST)
    public RequestResult<String> updateArea(
            @RequestBody final Map data) {
        final String id = (String) data.get("id");
        final List<List<String>> matrix = (List<List<String>>) data.get("area");
        return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                List<PlantArea> plantAreas = PlantArea.find("plant_id = ?", id);
                //取出此廠域原先的machines (為了比較machine是否被刪除)
                Set<String> oldMachines = new HashSet<String>();
                for (PlantArea plantArea : plantAreas) {
                    //System.out.println("add " + plantArea.getId());
                    oldMachines.add((String) plantArea.getId());
                }

                List<String> rowHead = new ArrayList<String>();
                List<String> columnHead = new ArrayList<String>();

                int plantAreaRowLength = matrix.size();
                int plantAreaColunmLength = matrix.get(0).size();

                for (int row = 0; row < plantAreaRowLength; row++) {
                    for (int col = 0; col < plantAreaColunmLength; col++) {
                        if ((row == 0) && (col == 0)) {
                            //不做任何事情
                        } else if (row == 0) {
                            columnHead.add(matrix.get(row).get(col));
                        } else if (col == 0) {
                            rowHead.add(matrix.get(row).get(col));
                        } else {
                            if (matrix.get(row).get(col).length() > 0) {
                                String currentMachineId = matrix.get(row).get(col).trim();

                                //System.out.println(currentMachineId + ":" + id + ":" + row + ":" + col);
                                PlantArea plantArea = new PlantArea().findById(currentMachineId);
                                if (plantArea != null) {
                                    new PlantArea().set("device_id", currentMachineId)
                                            .set("plant_id", id)
                                            .set("row_index", row)
                                            .set("column_index", col).saveIt();//更新
                                } else {
                                    new PlantArea().set("device_id", currentMachineId)
                                            .set("plant_id", id)
                                            .set("row_index", row)
                                            .set("column_index", col).insert(); //插入
                                }

                                if (oldMachines.contains(currentMachineId)) {//移掉存在的，剩下就是要刪掉的
                                    //System.out.println("remove:" + currentMachineId);
                                    oldMachines.remove(currentMachineId);
                                }
                            }
                        }
                    }
                }
                //更新廠域
                Plant plant = Plant.findById(id);
                plant.set("row_length", plantAreaRowLength)
                        .set("column_length", plantAreaColunmLength)
                        .set("row_head", new Gson().toJson(rowHead))
                        .set("column_head", new Gson().toJson(columnHead))
                        .saveIt();//更新
                //System.out.println("size:" + oldMachines.size());
                if (oldMachines.size() > 0) {
                    Object[] deletes = oldMachines.toArray(new String[oldMachines.size()]);
                    //刪除
                    int deleteAmount = PlantArea.delete("device_id IN (" + Util.strSplitBy("?", ",", deletes.length) + ")", deletes);
                    //System.out.println(deleteAmount);
                }
                return success("success");
            }
        });
    }

    @RequestMapping(value = "/getMachinePlantArea", method = GET)
    public RequestResult<Map> getPlantArea() {
        return ActiveJdbc.oper(new Operation<RequestResult<Map>>() {
            @Override
            public RequestResult<Map> operate() {
                Map result = new HashMap<String, Object>();

                List<Map> machinePlantAreaMaps = MachinePlantArea.findAll().toMaps();//全廠域的device
                List<Map> boxMaps = Box.findAll().include(Device.class).toMaps();//全box綁定的device
                List<Map> machineCncBrandMaps = DeviceCncBrand.findAll().toMaps();//全機台廠牌

                result.put("machines", machinePlantAreaMaps);
                result.put("boxs", boxMaps);
                result.put("machineCncBrands", machineCncBrandMaps);

                return success(result);
            }
        });
    }

    private String[][] buildPlantAreaMatrix(Plant plant, List<MachinePlantArea> machinePlantAreas) {
        String[] rowHead = new Gson().fromJson(plant.getString("row_head"), String[].class);
        String[] columnHead = new Gson().fromJson(plant.getString("column_head"), String[].class);

        int rowLength = plant.getInteger("row_length");
        int columnLength = plant.getInteger("column_length");
        //還沒有設廠域
        if ((rowLength == 0) || (columnLength == 0)) {
            return new String[0][0];
        }

        String[][] plantAreaMatrix = new String[rowLength][columnLength];

        //初始化
        for (int row = 0; row < plantAreaMatrix.length; row++) {
            for (int col = 0; col < plantAreaMatrix[0].length; col++) {
                plantAreaMatrix[row][col] = "";
            }
        }

        //插入row head
        for (int index = 0; index < rowHead.length; index++) {
            plantAreaMatrix[index + 1][0] = rowHead[index];
        }
        //插入column head
        for (int index = 0; index < columnHead.length; index++) {
            plantAreaMatrix[0][index + 1] = columnHead[index];
        }
        //插入機台
        for (MachinePlantArea machine : machinePlantAreas) {
            plantAreaMatrix[machine.getInteger("row_index")][machine.getInteger("column_index")] = machine.getString("device_id");
        }
        return plantAreaMatrix;
    }
}