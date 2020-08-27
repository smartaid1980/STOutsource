package com.servtech.servcloud.app.controller.kuochuan_servtrack;

import com.servtech.servcloud.app.controller.servtrack.ServtrackWorkController;
import com.servtech.servcloud.app.model.kuochuan_servtrack.KcProductOp;
import com.servtech.servcloud.app.model.kuochuan_servtrack.view.ProductOpView;
import com.servtech.servcloud.app.model.servtrack.ProductOp;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.DELETE;

/**
 * Created by Frank on 2017/6/20.
 */
@RestController
@RequestMapping("/kuochuan/servtrack/productop")
public class KuoChuanProductOpController {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(KuoChuanProductOpController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public RequestResult<?> create(@RequestBody final Map data) {
        try{
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {

                    Map pData = new HashMap();
                    pData.put("product_id",  data.get("product_id").toString());
                    pData.put("op",  data.get("op").toString());
                    pData.put("process_code",  data.get("process_code").toString());
                    pData.put("std_hour", Double.parseDouble(data.get("std_hour").toString()) / 60);
                    pData.put("op_quality_sp", data.get("op_quality_sp").toString());
                    pData.put("remark",  data.get("remark").toString());
                    pData.put("is_open",  data.get("is_open").toString());
                    pData.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    pData.put("create_time", new Timestamp(System.currentTimeMillis()));
                    pData.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    pData.put("modify_time", new Timestamp(System.currentTimeMillis()));

                    ProductOp productOp = new ProductOp();
                    productOp.fromMap(pData);

                    Map kcData = new HashMap();
                    kcData.put("product_id",  data.get("product_id").toString());
                    kcData.put("op", data.get("op").toString());
                    kcData.put("process_step", data.get("process_step").toString());

                    KcProductOp kcProductOp = new KcProductOp();
                    kcProductOp.fromMap(kcData);


                    if (productOp.insert() && kcProductOp.insert()) {
                        return success(kcProductOp.getString("product_id") + "_" + kcProductOp.getString("op") );
                    } else {
                        return fail("新增失敗...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<List<Map>> getIdData(@RequestParam("product_id") final String productId) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                final String product_id = productId;
                return success(ProductOpView.find("product_id=?", product_id).toMaps());
            }
        });
    }

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                Map pData = new HashMap();
                pData.put("product_id", data.get("product_id").toString());
                pData.put("op", data.get("op").toString());
                pData.put("process_code", data.get("process_code").toString());
                pData.put("std_hour", Double.parseDouble(data.get("std_hour").toString()) / 60);
                pData.put("op_quality_sp", data.get("op_quality_sp").toString());
                pData.put("remark", data.get("remark").toString());
                pData.put("is_open", data.get("is_open").toString());
                pData.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                pData.put("create_time", new Timestamp(System.currentTimeMillis()));
                pData.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                pData.put("modify_time", new Timestamp(System.currentTimeMillis()));

                ProductOp productOp = new ProductOp();
                productOp.fromMap(pData);

                Map kcData = new HashMap();
                kcData.put("product_id", data.get("product_id").toString());
                kcData.put("op", data.get("op").toString());
                kcData.put("process_step", data.get("process_step").toString());

                KcProductOp kcProductOp = new KcProductOp();
                kcProductOp.fromMap(kcData);


                if (productOp.saveIt() && kcProductOp.saveIt()) {
                    return success(kcProductOp.getString("product_id") + "_" + kcProductOp.getString("op"));
                } else {
                    return fail("新增失敗...");
                }

            }
        });
    }

    @RequestMapping(value ="/delete", method = DELETE)
    public RequestResult<String> delete(@RequestBody final Map data) {

        final String product_id = data.get("product_id").toString();
        final List<String> op = (List)data.get("op");
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {

            @Override
            public RequestResult<String> operate() {
                int kcDeleteAmount = KcProductOp.delete("product_id=? AND op IN " + ServtrackWorkController.strSplitBy(",", op), product_id);
                int deleteAmount = ProductOp.delete("product_id=? AND op IN " + ServtrackWorkController.strSplitBy(",", op), product_id);
                if (deleteAmount > 0 && kcDeleteAmount > 0) {
                    return success("刪除成功");
                } else {
                    return fail("刪除失敗...");
                }

            }
        });
    }
}
