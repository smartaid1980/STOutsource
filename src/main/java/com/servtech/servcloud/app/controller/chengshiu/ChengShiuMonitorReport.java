package com.servtech.servcloud.app.controller.chengshiu;

import com.google.common.base.Charsets;
import com.google.common.collect.Lists;
import com.google.common.io.Files;
import com.google.common.io.LineProcessor;
import com.servtech.common.codec.RawDataCryptor;
import com.servtech.common.codec.RawDataCryptorFactory;
import com.servtech.common.codec.impl.KeyCategory;
import com.servtech.common.codec.Key;
import com.servtech.servcloud.app.model.chengshiu.Sensor;
import com.servtech.servcloud.app.model.chengshiu.SensorType;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RawDataIndices;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.javalite.activejdbc.Base;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/10/11.
 */

@RestController
@RequestMapping("/chengshiu/monitorreport")
public class ChengShiuMonitorReport {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(ChengShiuMonitorReport.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/sensor/read", method = RequestMethod.GET)
    public RequestResult<?> resdSensorList() {
        try {
            return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(Sensor.findAll().include(SensorType.class).toMaps());
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/sensor/update", method = RequestMethod.POST)
    public RequestResult<?> updateSensorData(@RequestBody final List<Map> list) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                Object modify_by = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                Object modify_time = new Timestamp(System.currentTimeMillis());

                for (Map map : list) {
                    map.put("modify_by", modify_by);
                    map.put("modify_time", modify_time);

                    SensorType sensorType = new SensorType();
                    sensorType = sensorType.fromMap(map);
                    if (!sensorType.saveIt()) {
                        return fail(sensorType.getString("type_id") + " update failed!");
                    }
                }
//                //batch update
//                StringBuilder sb = new StringBuilder();
//                sb.append("INSERT INTO a_chengshiu_sensor_type ");
//                sb.append("(type_id, max_out, min_out, max_in, min_in, modify_by, modify_time) ");
//                sb.append("VALUES (?, ?, ?, ?, ?, ?, ?) ");
//                sb.append("ON DUPLICATE KEY UPDATE ");
//                sb.append("max_out = VALUES(max_out), ");
//                sb.append("max_out = VALUES(min_out), ");
//                sb.append("max_out = VALUES(max_out), ");
//                sb.append("min_in = VALUES(min_in), ");
//                sb.append("modify_by = VALUES(modify_by), ");
//                sb.append("modify_time = VALUES(modify_time); ");
//
//                String sql = sb.toString();
//                log.info(sql);
//                try {
//                    PreparedStatement ps = Base.startBatch(sql);
//                    for (SensorType map : list) {
//                        map.getString("type_id")
//                        Object max_out = map.get("max_out").
//                        System.out.println(map.get("type_id").toString());
//                        System.out.println(map.get("max_in").toString());
//                        Base.addBatch(ps,
//                                map.get("type_id").toString(),
//                                map.get("max_out").toString(),
//                                map.get("min_out").toString(),
//                                map.get("max_out").toString(),
//                                map.get("min_in").toString(),
//                                modify_by,
//                                modify_time);
//                    }
//                    Base.executeBatch(ps);
//                    ps.close();
//                } catch (SQLException e) {
//                    e.printStackTrace();
//                    return fail(e.getSQLState());
//                }
                return success("Update success!");
            }
        });
    }

    @RequestMapping(value = "/sensorhistory", method = RequestMethod.POST)
    public RequestResult<?> readSensorHistory(@RequestBody final Map data) {
        final String date = data.get("date").toString();
        final String sensorId = data.get("sensorId").toString();
        try {
            return ActiveJdbc.oper(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    Map result = new HashMap();
                    // query sensor threshold
                    List<Map> threshold = Base.findAll("SELECT b.max_in, b.min_in " +
                            "FROM a_chengshiu_sensor a JOIN a_chengshiu_sensor_type b " +
                            "WHERE a.type_id = b.type_id and a.sensor_id = ?", sensorId);
                    result.put("threshold", threshold);

                    // read raw data
                    Map<String, Integer> rawdataIndices = RawDataIndices.read();
                    Integer sensorIndex = rawdataIndices.get(sensorId);

                    String dataPath = System.getProperty(SysPropKey.DATA_PATH);
                    DateFormat rawdataPathPattern = new SimpleDateFormat("yyyy/MM/yyyyMMdd");
                    String rawdataEntry = "device_raw_data/CSU_ENV/" + rawdataPathPattern.format(new Date(date)) + ".csv";
                    File rawdataFile = new File(dataPath, rawdataEntry);

                    if (rawdataFile.exists()) {
                        List<Map<String, String>> dataList = new ArrayList<Map<String, String>>();
                        RawDataCryptor cryptor = RawDataCryptorFactory.getCryptor();
                        Key key = KeyCategory.Decode.key;
                        List<String> lines = null;
                        try {
                            lines = decodeRawdataLines(rawdataFile, cryptor, key);
                        } catch (IOException e) {
                            e.printStackTrace();
                            return fail(e.getMessage());
                        }

                        for (String line : lines) {
                            String[] lineAry = line.split("\\|");
                            Map<String, String> sensorData = new LinkedHashMap<String, String>();
                            sensorData.put("timestamp", lineAry[0]); // timestamp
                            sensorData.put("value", lineAry[sensorIndex].replaceAll("\\[\\[", "").replaceAll("]]", "")); // value
                            dataList.add(sensorData);
                        }
                        result.put("data", dataList);
                    }
                    return success(result);
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    private List<String> decodeRawdataLines(File rawdataFile, final RawDataCryptor cryptor, final Key key) throws IOException {
        return Files.readLines(rawdataFile, Charsets.UTF_8, new LineProcessor<List<String>>() {
            List<String> afterProcessesLines = Lists.newArrayList();

            @Override
            public boolean processLine(String line) throws IOException {
                return afterProcessesLines.add(cryptor.decode(key, line));
            }

            @Override
            public List<String> getResult() {
                return afterProcessesLines;
            }
        });
    }
}
