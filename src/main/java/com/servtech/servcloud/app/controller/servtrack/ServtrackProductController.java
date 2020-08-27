package com.servtech.servcloud.app.controller.servtrack;

import com.servtech.servcloud.app.model.servtrack.*;
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
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/6/20.
 */
@RestController
@RequestMapping("/servtrack/product")
public class ServtrackProductController {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(ServtrackProductController.class);

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

                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                    Product product = new Product();
                    product.fromMap(data);
                    if(product.insert()){
                        return success(product.getString("product_id"));
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
    public RequestResult<List<Map>> read(@RequestParam("productid") final String productid, @RequestParam("productname") final String productname) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * from a_servtrack_product ");
                sb.append("WHERE ");
                sb.append("product_id LIKE '%" + productid + "%' ");
                sb.append("AND ");
                sb.append("product_name LIKE '%" + productname + "%' ");
                String sql = sb.toString();
                log.info(sql);
                return success(Product.findBySQL(sql).toMaps());
            }
        });
    }

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                data.remove("modify_by");
                data.remove("modify_time");
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                Product product = new Product();
                product.fromMap(data);
                if (product.saveIt()) {
                    return success(product.getString("product_id"));
                } else {
                    return fail("修改失敗...");
                }
            }
        });
    }

}
