package com.servtech.servcloud.app.controller.yihcheng;

import com.servtech.servcloud.app.controller.storage.util.RecordAfter;
import com.servtech.servcloud.app.model.servtrack.Work;
import com.servtech.servcloud.app.model.servtrack.WorkOp;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static com.servtech.servcloud.core.util.Util.isNumeric;

@RestController
@RequestMapping("/yihcheng/split-batch")
public class YihChengSplitBatchController {

    private static final String LOCK = new String();
    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "for-ng", method = RequestMethod.POST)
    public RequestResult<?> forNg(@RequestBody Map data) {
        try {
            return ActiveJdbc.operTx(() -> {
                List<String> result = new ArrayList<>();
                String work_id = data.get("work_id").toString();
                String ori_op = data.get("op").toString();
                int lot_purpose = Integer.valueOf(data.get("lot_purpose").toString());
                List<Map> op_list = (List<Map>)data.get("op_list");
                String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "unknow user" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

                Work work = Work.findFirst("work_id = ?", work_id);
                List<WorkOp> workOpList = WorkOp.find("work_id = ? order by op", work_id);

                if (work == null)
                    return fail(work_id + " does not exist..");
                if (workOpList == null || workOpList.size() == 0)
                    return fail(work_id + " op does not exist..");

                Base.openTransaction();
                String ori_work_id = work_id.split("_")[0];
                int work_new_quantity = work.getInteger("e_quantity");
                for(Map op_info : op_list){
                    String op = op_info.get("op").toString();
                    int new_work_qty = Integer.valueOf(op_info.get("new_work_qty").toString());
                    String new_work_id = createNewWorkId(ori_work_id);
                    result.add(new_work_id);

                    work_new_quantity -= new_work_qty;
                    //新增工單-------------------------
                    Work new_work = new Work();

                    Map ori_work_map = work.toMap();
                    RecordAfter.putCreateAndModify(ori_work_map, user, System.currentTimeMillis());

                    new_work.fromMap(ori_work_map);
                    new_work.set("work_id", new_work_id);
                    new_work.set("e_quantity", new_work_qty);
                    new_work.set("op_start", op);
                    new_work.set("status_id", 0);
                    new_work.set("lot_purpose", lot_purpose);
                    new_work.set("parent_id", work.getString("parent_id") == null ? work_id : work.getString("parent_id") + "|" + work_id);

                    new_work.insert();
                    System.out.println("work insert");
                    //更新工序與新增工序-------------------------
                    boolean is_first = true;
                    for (WorkOp work_op : workOpList) {
                        if (op != null && isIgnoreInsert(lot_purpose, Integer.valueOf(op), work_op))
                            continue;
                        WorkOp new_work_op = new WorkOp();
                        Map ori_work_op_map = work_op.toMap();
                        RecordAfter.putCreateAndModify(ori_work_op_map, user, System.currentTimeMillis());
                        new_work_op.fromMap(ori_work_op_map);
                        new_work_op.set("work_id", new_work_id);
                        new_work_op.set("is_open", "Y");
                        if (is_first) {
                            new_work_op.set("qty_wip", new_work_qty);
                            new_work_op.set("qty_input_exp", new_work_qty);
                            is_first = false;
                        } else {
                            new_work_op.set("qty_wip", 0);
                            new_work_op.set("qty_input_exp", 0);
                        }
                        new_work_op.set("output_exp", new_work_qty);
                        new_work_op.set("qty_output_exp", 0);
                        new_work_op.insert();
                    }
                    System.out.println("work op insert");

                }
                //更新原工單-------------------------
                work.set("e_quantity", work_new_quantity);
                work.set("modify_time", new java.sql.Timestamp(System.currentTimeMillis()));
                work.set("modify_by", user);
                work.saveIt();
                System.out.println("work update");

                //更新工序-------------------------
                boolean is_first = true;
                for (WorkOp work_op : workOpList) {
                    if (ori_op != null && isIgnoreUpdate(lot_purpose, Integer.valueOf(ori_op), work_op))
                        continue;
                    if (is_first) {
                        work_op.set("qty_wip", work_new_quantity);
                        work_op.set("qty_input_exp", work_new_quantity);
                        is_first = false;
                    } else {
                        work_op.set("qty_wip", 0);
                        work_op.set("qty_input_exp", 0);
                    }
                    work_op.set("output_exp", work_new_quantity);
                    work_op.set("qty_output_exp", 0);
                    work_op.set("modify_time", new java.sql.Timestamp(System.currentTimeMillis()));
                    work_op.set("modify_by", user);
                    work_op.saveIt();
                }
                System.out.println("work op update");

                Base.commitTransaction();
                return success(result);
            });
        } catch (Exception e) {
            Base.rollbackTransaction();
            e.printStackTrace();
            return fail(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.GET)
    public RequestResult<?> splitBatchBeforeProduce(@RequestParam("new_work_qty") int new_work_qty,
                                                    @RequestParam(value = "new_work_id", required = false) String new_work_id,
                                                    @RequestParam("work_id") String work_id,
                                                    @RequestParam(value = "remark", required = false) String remark,
                                                    @RequestParam("lot_purpose") int lot_purpose,
                                                    @RequestParam(value = "op", required = false) String op) {
        try {
            return ActiveJdbc.operTx(() -> {
                String user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY) == null ? "unknow user" : request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY).toString();

                Work work = Work.findFirst("work_id = ?", work_id);
                List<WorkOp> workOpList = WorkOp.find("work_id = ? order by op", work_id);

                if (work == null)
                    return fail(work_id + " does not exist..");
                if (workOpList == null || workOpList.size() == 0)
                    return fail(work_id + " op does not exist..");

                String ori_work_id = work_id.split("_")[0];
                //前端可能不給新的工單ID.....
                String new_local_work_id = new_work_id;
                if (new_local_work_id == null || new_local_work_id.equals(""))
                    new_local_work_id = createNewWorkId(ori_work_id);

                Base.openTransaction();

                //更新原工單-------------------------
                int ori_work_new_quantity = work.getInteger("e_quantity") - new_work_qty;

                work.set("e_quantity", ori_work_new_quantity);
                work.set("modify_time", new java.sql.Timestamp(System.currentTimeMillis()));
                work.set("modify_by", user);
                work.saveIt();
                System.out.println("work update");
                //新增工單-------------------------
                Work new_work = new Work();

                Map ori_work_map = work.toMap();
                RecordAfter.putCreateAndModify(ori_work_map, user, System.currentTimeMillis());

                new_work.fromMap(ori_work_map);
                new_work.set("work_id", new_local_work_id);
                new_work.set("e_quantity", new_work_qty);
//                new_work.set("input", new_work_qty);
                if(op != null && !op.equals("")){
                    new_work.set("op_start", getOpStart(work_id, op, lot_purpose));
                }
                new_work.set("status_id", 0);
                new_work.set("remark", remark);
                new_work.set("lot_purpose", lot_purpose);
                new_work.set("parent_id", work.getString("parent_id") == null ? work_id : work.getString("parent_id") + "|" + work_id);

                new_work.insert();
                System.out.println("work insert");
                //更新工序與新增工序-------------------------
                boolean is_first = true;
                for (WorkOp work_op : workOpList) {
                    if (op != null && isIgnoreUpdate(lot_purpose, Integer.valueOf(op), work_op))
                        continue;
                    if (is_first) {
                        work_op.set("qty_wip", ori_work_new_quantity);
                        work_op.set("qty_input_exp", ori_work_new_quantity);
                        is_first = false;
                    } else {
                        work_op.set("qty_wip", 0);
                        work_op.set("qty_input_exp", 0);
                    }
                    work_op.set("output_exp", ori_work_new_quantity);
                    work_op.set("qty_output_exp", 0);
                    work_op.set("modify_time", new java.sql.Timestamp(System.currentTimeMillis()));
                    work_op.set("modify_by", user);
                    work_op.saveIt();
                }
                System.out.println("work op update");
                is_first = true;
                for (WorkOp work_op : workOpList) {
                    if (op != null && isIgnoreInsert(lot_purpose, Integer.valueOf(op), work_op))
                        continue;
                    WorkOp new_work_op = new WorkOp();
                    Map ori_work_op_map = work_op.toMap();
                    RecordAfter.putCreateAndModify(ori_work_op_map, user, System.currentTimeMillis());
                    new_work_op.fromMap(ori_work_op_map);
                    new_work_op.set("work_id", new_local_work_id);
                    new_work_op.set("is_open", "Y");
                    if (is_first) {
                        new_work_op.set("qty_wip", new_work_qty);
                        new_work_op.set("qty_input_exp", new_work_qty);
                        is_first = false;
                    } else {
                        new_work_op.set("qty_wip", 0);
                        new_work_op.set("qty_input_exp", 0);
                    }
                    new_work_op.set("output_exp", new_work_qty);
                    new_work_op.set("qty_output_exp", 0);
                    new_work_op.insert();
                }
                System.out.println("work op insert");
                Base.commitTransaction();
                return success(new_local_work_id);
            });
        } catch (Exception e) {
            e.printStackTrace();
            Base.rollbackTransaction();
            return fail(e.getMessage());
        }
    }

    private Object getOpStart(String work_id , String op, int lot_purpose) {
        if(lot_purpose == 4){
            return WorkOp.findFirst("work_id = ? and op > ? order by op", work_id, op).getString("op");
        }else {
            return op;
        }
    }

    private String createNewWorkId(String work_id) {
        String work_like = "work_id like '" + work_id + "%' order by work_id desc";
        System.out.println("work_like : " + work_like);
        Work last_work = Work.findFirst(work_like);
        String[] work_id_arr = last_work.getString("work_id").split("_");
        int index = 1;
        if (work_id_arr.length > 0) {
            if (isNumeric(work_id_arr[work_id_arr.length - 1])) {
                index = Integer.valueOf(work_id_arr[work_id_arr.length - 1]) + 1;
            }
        }
        return String.format("%s_%03d", work_id, index);
    }

    private boolean isIgnoreInsert(int lot_purpose, int op, WorkOp work_op) {
        boolean isIgnore = false;
        Integer this_time_op = Integer.valueOf(work_op.getString("op"));
        switch (lot_purpose) {
            case 1:
                break;
            case 2:
                if (this_time_op < op)
                    isIgnore = true;
                break;
            case 3:
                if (this_time_op < op)
                    isIgnore = true;
                break;
            case 4:
                if (this_time_op <= op)
                    isIgnore = true;
                break;
        }
        System.out.println("Insert lot_purpose : " + lot_purpose + ", op : " + op + ", this_time_op : " + this_time_op + ", isIgnore : " + isIgnore);
        return isIgnore;
    }

    private boolean isIgnoreUpdate(int lot_purpose, int op, WorkOp work_op) {
        boolean isIgnore = false;
        Integer this_time_op = Integer.valueOf(work_op.getString("op"));
        switch (lot_purpose) {
            case 1:
                break;
            case 2:
                if (this_time_op <= op)
                    isIgnore = true;
                break;
            case 3:
                if (this_time_op < op)
                    isIgnore = true;
                break;
            case 4:
                if (this_time_op <= op)
                    isIgnore = true;
                break;
        }
        System.out.println("Update lot_purpose : " + lot_purpose + ", op : " + op + ", this_time_op : " + this_time_op + ", isIgnore : " + isIgnore);

        return isIgnore;
    }

}
