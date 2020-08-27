package com.servtech.servcloud.app.controller.kuochuan_servtrack;

import com.servtech.servcloud.app.model.kuochuan_servtrack.KcProduct;
import com.servtech.servcloud.app.model.kuochuan_servtrack.view.ProductView;
import com.servtech.servcloud.app.model.servtrack.Product;
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
import static org.springframework.web.bind.annotation.RequestMethod.GET;

/**
 * Created by Frank on 2017/6/20.
 */
@RestController
@RequestMapping("/kuochuan/servtrack/product")
public class KuoChuanProductController {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(KuoChuanProductController.class);

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
                    pData.put("product_name",  data.get("product_id").toString());
                    pData.put("product_quality_sp",  data.get("product_quality_sp").toString());
                    pData.put("remark",  data.get("remark").toString());
                    pData.put("is_open",  data.get("is_open").toString());
                    pData.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    pData.put("create_time", new Timestamp(System.currentTimeMillis()));
                    pData.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    pData.put("modify_time", new Timestamp(System.currentTimeMillis()));

                    Product product = new Product();
                    product.fromMap(pData);

                    Map kcpData = new HashMap();
                    kcpData.put("product_id", data.get("product_id").toString());
                    kcpData.put("product_type_id", data.get("product_type_id").toString());

                    KcProduct kc_product = new KcProduct();
                    kc_product.fromMap(kcpData);

                    if(product.insert() && kc_product.insert()){
                        return success(kc_product.getString("product_id"));
                    } else {
                        return fail("新增失敗...");
                    }

                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }
    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read(@RequestParam("product_id") final String productId) {
        final String product_id = productId;

        if (product_id !=null && !product_id.equals("null") && !product_id.equals("")) {
            return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(ProductView.find("product_id=?", product_id).toMaps());
                }
            });
        } else {
            return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(ProductView.findBySQL("SELECT * FROM a_kuochuan_servtrack_view_product WHERE product_id NOT IN ('invalid_work')").toMaps());
                }
            });
        }
    }

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {

                Map pData = new HashMap();
                pData.put("product_id",  data.get("product_id").toString());
                pData.put("product_name",  data.get("product_id").toString());
                pData.put("product_quality_sp",  data.get("product_quality_sp").toString());
                pData.put("remark",  data.get("remark").toString());
                pData.put("is_open",  data.get("is_open").toString());
                pData.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                pData.put("modify_time", new Timestamp(System.currentTimeMillis()));

                Product product = new Product();
                product.fromMap(pData);

                Map kcpData = new HashMap();
                kcpData.put("product_id", data.get("product_id").toString());
                kcpData.put("product_type_id", data.get("product_type_id").toString());

                KcProduct kc_product = new KcProduct();
                kc_product.fromMap(kcpData);

                if (kc_product.saveIt() && product.saveIt()) {
                    return success(kc_product.getString("product_id"));
                } else {
                    return fail("修改失敗...");
                }
            }
        });
    }

}
