package com.servtech.servcloud.app.controller.huangliang_matStock;

import com.servtech.servcloud.app.model.huangliang_matStock.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by Eric Peng on 2018/11/1.
 */

@RestController
@RequestMapping("/huangliangMatStock/matSelectSearch")
public class MatSelectSearch {
    private static final Logger log = LoggerFactory.getLogger(MatSelectSearch.class);
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    SimpleDateFormat sqlSdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");

    @RequestMapping(value = "getLocationWeight", method = RequestMethod.GET)
    public RequestResult<?> getLocationWeight(@RequestParam final String mat_code) {
        final String matId = getMatId(mat_code);
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                Map<String, LocationAreaWeight> resultMap = new HashMap<>();
                List<Map> list = MatStock.find("mat_id=? or mat_id='通用'", matId).toMaps();
                List<Map> locationList = MatLocation.find("mat_id=? or mat_id='通用'", matId).toMaps();
                for (Map map : list) {
                    String key = map.get("location").toString() + "_" + map.get("area").toString();
                    if (!resultMap.containsKey(key)) {
                        resultMap.put(key, new LocationAreaWeight(map.get("area").toString(),
                                map.get("location").toString(), map.get("mstock_qty").toString()));
                    } else {
                        double old = Float.parseFloat(resultMap.get(key).mstock_qty);
                        double value = Double.parseDouble(map.get("mstock_qty").toString());
                        String total = String.format("%.2f", old + value);

                        // log.info("old: " + old + ", new: " + value);
                        // log.info("total: " + total);
                        // log.info("total double: " + total);
                        resultMap.get(key).mstock_qty = total;
                    }
                }
                for (Map map : locationList) {
                    String key = map.get("location").toString() + "_" + map.get("area").toString();
                    if (resultMap.size() == 0 || !resultMap.containsKey(key)) {
                        resultMap.put(key, new LocationAreaWeight(map.get("area").toString(),
                                map.get("location").toString(), "0"));
                    }
                }
                List<LocationAreaWeight> tempList = new ArrayList<>(resultMap.values());
                List<LocationAreaWeight> resultList = tempList.stream()
                        .sorted(Comparator
                                .comparing(locationAreaWeight -> Double.parseDouble(locationAreaWeight.mstock_qty)))
                        .collect(Collectors.toList());

                return RequestResult.success(resultList);
            }
        });
    }

    @RequestMapping(value = "checkLocation", method = RequestMethod.GET)
    public RequestResult<?> checkLocation(@RequestParam final String location) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                List<Map> listMap = MatLocation.find("location=?", location).toMaps();
                if (listMap.size() > 0) {
                    return RequestResult.success(listMap.get(0));
                } else {
                    return RequestResult.fail("no this location");
                }
            }
        });
    }

    @RequestMapping(value = "getPoFile", method = RequestMethod.GET)
    public RequestResult<?> getPoFile(@RequestParam final String mstock_name, @RequestParam final String po_no) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                List<Map> poFileList = PoFile.find("po_no=? and mstock_name=?", po_no, mstock_name).toMaps();
                // List<Map> result = new ArrayList<>();
                for (Map map : poFileList) {
                    try {
                        String matId = getMatId(map.get("mat_code").toString());
                        MatProfile matMap = MatProfile.findById(matId);
                        if (matMap != null) {
                            map.put("mat_id", matMap.get("mat_id"));
                            map.put("mat_type", matMap.get("mat_type"));
                            map.put("mat_color", matMap.get("mat_color"));
                            map.put("mat_att", matMap.get("mat_att"));
                            map.put("mat_unit", matMap.get("mat_unit"));
                        }
                    } catch (Exception e) {
                        log.warn(e.getMessage());
                        log.warn("mat_code: " + map.get("mat_code").toString() + " was not - splited.");
                    }
                }
                return RequestResult.success(poFileList);
            }
        });
    }

    @RequestMapping(value = "getTempStock", method = RequestMethod.GET)
    public RequestResult<?> getTempStock() {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                List<Map> poFileList = PoTempStock.find("status=1").toMaps();
                // log.info(poFileList.toString());
                for (Map map : poFileList) {
                    String str = map.get("shelf_time").toString();
                    log.info(str);
                    try {
                        map.put("shelf_time", sdf.format(sqlSdf.parse(str)));
                    } catch (ParseException e) {
                        e.printStackTrace();
                    }
                }
                return RequestResult.success(poFileList);
            }
        });
    }

    private String getMatId(String str) {
        return str.split("-")[1];
    }

    class LocationAreaWeight {
        String area;
        String location;
        String mstock_qty;

        public LocationAreaWeight(String area, String location, String mstock_qty) {
            this.area = area;
            this.location = location;
            this.mstock_qty = mstock_qty;
        }
    }

}
