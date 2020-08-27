package com.servtech.servcloud.app.controller.ennoconn;

import com.servtech.servcloud.app.model.storage.BillStockIn;
import com.servtech.servcloud.app.model.storage.MaterialThing;
import com.servtech.servcloud.app.model.storage.Thing;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static com.servtech.servcloud.core.util.Util.getTimeLongFormat;

@RestController
@RequestMapping("/ennoconn/bill-stock")
public class BillStockController {
    private static final Logger LOG = LoggerFactory.getLogger(BillStockController.class);
    private static final String LOCK = new String();
    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "in-create_by_thing_pre", method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody Map data) {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                Map<String, String> result = new HashMap<>();
                Object user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
                Date now = new Date();
                String bill_date = new SimpleDateFormat("yyyyMMdd").format(now);

                if (MaterialThing.findFirst("thing_id = ?", data.get("thing_id").toString()) != null)
                    return fail("此 PKGID: " + data.get("thing_id").toString() + " 已綁定");
                Base.openTransaction();
                try {
                    data.put("create_time", now);
                    data.put("create_by", user);
                    data.put("modify_time", now);
                    data.put("modify_by", user);
                    data.put("material_sub", "0000");
                    data.put("bill_detail", 1);

                    BillStockIn newBillStockIn = new BillStockIn();
                    String bill_no = data.get("thing_id").toString() + getRandomStr();
                    newBillStockIn.fromMap(data);
                    newBillStockIn.set("bill_no", bill_no);
                    newBillStockIn.set("bill_date", bill_date);
//                    newBillStockIn.set("ware_id", "");
                    newBillStockIn.set("quantity", 1);
                    newBillStockIn.set("type", "0");
                    newBillStockIn.set("status", "1");
                    newBillStockIn.set("create_time", getTimeLongFormat());
                    newBillStockIn.set("modify_time", getTimeLongFormat());

                    Thing newThing = new Thing();
                    newThing.fromMap(data);
                    newThing.set("thing_cell", 1);
                    newThing.set("thing_unit", "pce");

                    MaterialThing newMaterialThing = new MaterialThing();
                    newMaterialThing.fromMap(data);
                    newMaterialThing.set("bill_from", bill_no);
                    newMaterialThing.set("is_new", 1);
                    newMaterialThing.set("status", 0);
                    newMaterialThing.set("in_stock", 0);


                    if (newBillStockIn.insert() && newThing.insert() && newMaterialThing.insert()) {
                        Base.commitTransaction();
                        result.put("bill_no", bill_no);
                        result.put("bill_detail", "1");
                        result.put("material_id", data.get("material_id").toString());
                        result.put("material_sub", "0000");
                        return success(result);
                    }
                    throw new RuntimeException("寫入DB失敗");

                } catch (Exception e) {
                    Base.rollbackTransaction();
                    e.printStackTrace();
                    return fail(e.getMessage());

                }
            });
        }
    }

    public static String getRandomStr() {
        Random r = new Random();
        int fir = r.nextInt(26) + 65;
        int sec = r.nextInt(26) + 65;
        int thi = r.nextInt(26) + 65;
        return String.format("%s%s%s", String.valueOf((char) fir), String.valueOf((char) sec), String.valueOf((char) thi));
    }

    @RequestMapping(value = "in-and-material-thing", method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody Map data) {

        return ActiveJdbc.operTx(() -> {
            Map<String, Object> result = new HashMap<>();
            Object user = request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);
            try {
                String bill_no = data.get("bill_no").toString();
                String bill_detail = data.get("bill_detail").toString();
                String material_id = data.get("material_id").toString();
                String material_sub = data.get("material_sub").toString();
                long currentTime = getTimeLongFormat();
                Base.openTransaction();
                BillStockIn.update("unit_qty = ? , vender_lot = ?, vender_pn = ?, delivery_date = ? , exp_date = ?, modify_time = ? , modify_by = ?"
                        , "bill_no = ? and bill_detail = ? and material_id = ? and material_sub = ?"
                        , data.get("unit_qty"), data.get("vender_lot"), data.get("vender_pn"), data.get("delivery_date"), data.get("exp_date"), currentTime, user
                        , bill_no, bill_detail, material_id, material_sub);

                MaterialThing.update("delivery_date = ? , exp_date = ?, modify_time = ? , modify_by = ?"
                        , "bill_from = ? and bill_detail = ? and material_id = ? and material_sub = ?"
                        , data.get("delivery_date"), data.get("exp_date"), new Date(), user
                        , bill_no, bill_detail, material_id, material_sub);

                Base.commitTransaction();
                return success("update success");

            } catch (Exception e) {
                Base.rollbackTransaction();
                e.printStackTrace();
                return fail("update fail..");

            }
        });

    }

}
