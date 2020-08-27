package com.servtech.servcloud.app.controller.iiot;

import com.servtech.servcloud.app.model.iiot.IiotTool;
import com.servtech.servcloud.app.model.iiot.IiotToolHolderList;
import com.servtech.servcloud.app.model.iiot.IiotToolPrepList;
import com.servtech.servcloud.app.model.iiot.IiotToolTracking;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2018/10/15.
 */
@RestController
@RequestMapping("/iiot/tablet")
public class IiotTabletController {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(IiotTabletController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/checkToolIsExist", method = RequestMethod.GET)
    public RequestResult<String> checkToolIsExist(@RequestParam final String toolId) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                try {
                    if (toolId.equals("")) {
                        return success("欄位不能為空");
                    }
                    List<Map> queryTool = IiotTool.find("tool_id = ? AND is_open = 'Y'", toolId).toMaps();
                    if (queryTool.size() > 0) {
                        return success("true");
                    } else {
                        return success("該刀具未建檔或未啟用");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    return fail("fail..." + sw.toString());
                }
            }
        });
    }

    @RequestMapping(value = "/checkHolderIsExist", method = RequestMethod.GET)
    public RequestResult<String> checkHolderIsExist(@RequestParam final String holderId) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                try {
                    if (holderId.equals("")) {
                        return success("欄位不能為空");
                    }
                    List<Map> queryHolderList = IiotToolHolderList.find("holder_id = ? AND is_open = 'Y'", holderId).toMaps();
                    if (queryHolderList.size() > 0) {
                        String deptId = queryHolderList.get(0).get("dept_id").toString();
                        return success(deptId);
                    } else {
                        return success("該刀把未建檔或未啟用");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    return fail("fail..." + sw.toString());
                }
            }
        });
    }

    @RequestMapping(value = "/upload", method = RequestMethod.PUT)
    public RequestResult<?> upload(@RequestBody final Map data) {
        List<Map> toolPrepLists = data.get("tool_prep_list") == null ? null : (List<Map>) data.get("tool_prep_list");
        List<Map> toolTrackings = data.get("tool_tracking") == null ? null : (List<Map>) data.get("tool_tracking");
        List<Map> toolTrackingChgs = data.get("tool_tracking_chg") == null ? null : (List<Map>) data.get("tool_tracking_chg");

        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                try {
                    Base.openTransaction();
                    PreparedStatement psPrep = Base.startBatch(getInsetToolPrepList());
                    PreparedStatement psTracking = Base.startBatch(getInsetToolTracking());
                    PreparedStatement psTrackingChg = Base.startBatch(getInsetToolTrackingChg());

                    batchInsertToolPrepList(psPrep, toolPrepLists);
                    batchInsertToolTracking(psTracking, toolTrackings);
                    batchInsertToolTrackingChg(psTrackingChg, toolTrackingChgs);

                    psPrep.close();
                    psTracking.close();
                    psTrackingChg.close();
                    Base.commitTransaction();

                    return success("upload success");
                } catch (Exception e) {
                    e.printStackTrace();
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    Base.rollbackTransaction();
                    return fail("upload fail... : " + sw.toString());
                }
            }
        });
    }

    public String getInsetToolTracking() {
        StringBuilder sb = new StringBuilder();
        sb.append("INSERT INTO a_iiot_tool_tracking ");
        sb.append("(move_in, machine_id, nc_name, tool_prep_id, work_barcode, tool_no, tool_id, dept_id, holder_id, move_out, create_by, create_time, modify_by, modify_time) ");
        sb.append("VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ");
        sb.append("ON DUPLICATE KEY UPDATE ");
        sb.append("move_in = VALUES(move_in), ");
        sb.append("machine_id = VALUES(machine_id), ");
        sb.append("nc_name = VALUES(nc_name), ");
        sb.append("tool_prep_id = VALUES(tool_prep_id), ");
        sb.append("work_barcode = VALUES(work_barcode), ");
        sb.append("tool_no = VALUES(tool_no), ");
        sb.append("tool_id = VALUES(tool_id), ");
        sb.append("dept_id = VALUES(dept_id), ");
        sb.append("holder_id = VALUES(holder_id), ");
        sb.append("move_out = VALUES(move_out), ");
        sb.append("create_by = VALUES(create_by), ");
        sb.append("create_time = VALUES(create_time), ");
        sb.append("modify_by = VALUES(modify_by), ");
        sb.append("modify_time = VALUES(modify_time); ");
        return sb.toString();
    }

    public String getInsetToolTrackingChg() {
        StringBuilder sb = new StringBuilder();
        sb.append("INSERT INTO a_iiot_tool_tracking_chg ");
        sb.append("(move_in, machine_id, nc_name, tool_prep_id, work_barcode, tool_no, tool_id, dept_id, holder_id, chg_tool_id, chg_holder_id, chg_dept_id, create_by, create_time, modify_by, modify_time) ");
        sb.append("VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ");
        return sb.toString();
    }

    public String getInsetToolPrepList() {

        StringBuilder sb = new StringBuilder();
        sb.append("INSERT INTO a_iiot_tool_prep_list ");
        sb.append("(tool_prep_id, nc_name, tool_no, compensation, tool_spec, tool_type, tool_code, tool_length, holder_type, dept_id, tool_id, holder_id, memo, create_by, create_time, modify_by, modify_time) ");
        sb.append("VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ");
        sb.append("ON DUPLICATE KEY UPDATE ");
        sb.append("tool_prep_id = VALUES(tool_prep_id), ");
        sb.append("nc_name = VALUES(nc_name), ");
        sb.append("tool_no = VALUES(tool_no), ");
        sb.append("compensation = VALUES(compensation), ");
        sb.append("tool_spec = VALUES(tool_spec), ");
        sb.append("tool_type = VALUES(tool_type), ");
        sb.append("tool_code = VALUES(tool_code), ");
        sb.append("tool_length = VALUES(tool_length), ");
        sb.append("holder_type = VALUES(holder_type), ");
        sb.append("dept_id = VALUES(dept_id), ");
        sb.append("tool_id = VALUES(tool_id), ");
        sb.append("holder_id = VALUES(holder_id), ");
        sb.append("memo = VALUES(memo), ");
        sb.append("create_by = VALUES(create_by), ");
        sb.append("create_time = VALUES(create_time), ");
        sb.append("modify_by = VALUES(modify_by), ");
        sb.append("modify_time = VALUES(modify_time); ");
        return sb.toString();
    }

    public void batchInsertToolTracking(PreparedStatement ps, List<Map> tabletDatas) {
        if (tabletDatas != null && tabletDatas.size() > 0) {
            Map trackingPksData = getTrackingPksData();
            for (Map map : tabletDatas) {
                String move_in = map.get("move_in").toString();
                String machine_id = map.get("machine_id").toString();
                String nc_name = map.get("nc_name").toString();
                String tool_prep_id = map.get("tool_prep_id").toString();
                String work_barcode = map.get("work_barcode").toString();
                String tool_no = map.get("tool_no").toString();
                String tool_id = map.get("tool_id").toString();
                String dept_id = map.get("dept_id").toString();
                String holder_id = map.get("holder_id").toString();
                String move_out = map.get("move_out").toString();
                String pk = move_in + machine_id + nc_name + tool_prep_id + tool_no;
                String create_by;
                String create_time;

                if (trackingPksData.containsKey(pk)) {
                    create_by = trackingPksData.get("create_by").toString();
                    create_time = trackingPksData.get("create_time").toString();
                } else {
                    create_by = map.get("create_by").toString();
                    create_time = map.get("create_time").toString();
                }

                String modify_by = map.get("modify_by").toString();
                String modify_time = map.get("modify_time").toString();

                Base.addBatch(ps,
                        convertStrDate2Timestamp(move_in),
                        machine_id,
                        nc_name,
                        convertStrDate2Timestamp(tool_prep_id),
                        work_barcode,
                        tool_no,
                        tool_id,
                        dept_id,
                        holder_id,
                        convertStrDate2Timestamp(move_out),
                        create_by,
                        convertStrDate2Timestamp(create_time),
                        modify_by,
                        convertStrDate2Timestamp(modify_time)
                );
            }
            Base.executeBatch(ps);
        }
    }

    public void batchInsertToolTrackingChg(PreparedStatement ps, List<Map> tabletDatas) {
        if (tabletDatas != null && tabletDatas.size() > 0) {
            for (Map map : tabletDatas) {
                String move_in = map.get("move_in").toString();
                String machine_id = map.get("machine_id").toString();
                String nc_name = map.get("nc_name").toString();
                String tool_prep_id = map.get("tool_prep_id").toString();
                String work_barcode = map.get("work_barcode").toString();
                String tool_no = map.get("tool_no").toString();
                String tool_id = map.get("tool_id").toString();
                String dept_id = map.get("dept_id").toString();
                String holder_id = map.get("holder_id").toString();
                String chg_tool_id = map.get("chg_tool_id").toString();
                String chg_holder_id = map.get("chg_holder_id").toString();
                String chg_dept_id = map.get("chg_dept_id").toString();
                String create_by = map.get("create_by").toString();
                String create_time = map.get("create_time").toString();
                String modify_by = create_by;
                String modify_time = create_time;

                Base.addBatch(ps,
                        convertStrDate2Timestamp(move_in),
                        machine_id,
                        nc_name,
                        convertStrDate2Timestamp(tool_prep_id),
                        work_barcode,
                        tool_no,
                        tool_id,
                        dept_id,
                        holder_id,
                        chg_tool_id,
                        chg_holder_id,
                        chg_dept_id,
                        create_by,
                        convertStrDate2Timestamp(create_time),
                        modify_by,
                        modify_time
                );
            }
            Base.executeBatch(ps);
        }
    }

    public void batchInsertToolPrepList(PreparedStatement ps, List<Map> tabletDatas) {
        if (tabletDatas != null && tabletDatas.size() > 0) {
            Map toolPrepPksData = getToolPrepPksData();
            for (Map map : tabletDatas) {
                String tool_prep_id = map.get("tool_prep_id").toString();
                String nc_name = map.get("nc_name").toString();
                String tool_no = map.get("tool_no").toString();
                String compensation = map.get("compensation").toString();
                String tool_spec = map.get("tool_spec").toString();
                String tool_type = map.get("tool_type").toString();
                String tool_code = map.get("tool_code").toString();
                String tool_length = map.get("tool_length").toString();
                String holder_type = map.get("holder_type").toString();
                String dept_id = map.get("dept_id").toString();
                String tool_id = map.get("tool_id").toString();
                String holder_id = map.get("holder_id").toString();
                String memo = map.get("memo").toString();
                String create_by;
                String create_time;
                String pk = tool_prep_id + nc_name + tool_no;
                if (toolPrepPksData.containsKey(pk)) {
                    create_by = toolPrepPksData.get("create_by").toString();
                    create_time = toolPrepPksData.get("create_time").toString();
                } else {
                    create_by = map.get("create_by").toString();
                    create_time = map.get("create_time").toString();
                }
                String modify_by = map.get("modify_by").toString();
                String modify_time = map.get("modify_time").toString();

                Base.addBatch(ps,
                        convertStrDate2Timestamp(tool_prep_id),
                        nc_name,
                        tool_no,
                        compensation,
                        tool_spec,
                        tool_type,
                        tool_code,
                        tool_length,
                        holder_type,
                        dept_id,
                        tool_id,
                        holder_id,
                        memo,
                        create_by,
                        convertStrDate2Timestamp(create_time),
                        modify_by,
                        convertStrDate2Timestamp(modify_time)
                );
            }
            Base.executeBatch(ps);
        }
    }

    public Map getTrackingPksData() {
        Map result = new HashMap();
        List<Map> queryTracking = IiotToolTracking.findAll().toMaps();
        for (Map data : queryTracking) {
            Map map = new HashMap();
            String move_in = data.get("move_in").toString();
            String machine_id = data.get("machine_id").toString();
            String nc_name = data.get("nc_name").toString();
            String tool_prep_id = data.get("tool_prep_id").toString();
            String tool_no = data.get("tool_no").toString();
            String pk = move_in + machine_id + nc_name + tool_prep_id + tool_no;
            map.put("create_by", data.get("create_by").toString());
            map.put("create_time", data.get("create_time").toString());
            result.put(pk, map);
        }
        return result;
    }

    public Map getToolPrepPksData() {
        Map result = new HashMap();
        List<Map> queryToolPrepList = IiotToolPrepList.findAll().toMaps();
        for (Map data : queryToolPrepList) {
            Map map = new HashMap();
            String tool_prep_id = data.get("tool_prep_id").toString();
            String nc_name = data.get("nc_name").toString();
            String tool_no = data.get("tool_no").toString();
            String pk = tool_prep_id + nc_name + tool_no;
            map.put("create_by", data.get("create_by").toString());
            map.put("create_time", data.get("create_time").toString());
            result.put(pk, map);
        }
        return result;
    }

    public Timestamp convertStrDate2Timestamp(String date) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
        Date parsedDate = null;
        Timestamp timestamp = null;
        try {
            parsedDate = dateFormat.parse(date);
            timestamp = new java.sql.Timestamp(parsedDate.getTime());
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return timestamp;
    }
}


