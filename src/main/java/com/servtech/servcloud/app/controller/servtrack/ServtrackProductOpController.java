package com.servtech.servcloud.app.controller.servtrack;

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
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;

/**
 * Created by Frank on 2017/6/20.
 */
@RestController
@RequestMapping("/servtrack/productop")
public class ServtrackProductOpController {
    private final org.slf4j.Logger log = LoggerFactory.getLogger(ServtrackProductOpController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public RequestResult<?> create(@RequestParam("productid") final String productid, @RequestBody final Map data) {
        try{
            return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
                @Override
                public RequestResult<?> operate() {
                    data.put("product_id", productid);
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                    ProductOp productOp = new ProductOp();
                    productOp.fromMap(data);
                    if (productOp.insert()) {
                        return success(productOp.getString("product_id") + "_" + productOp.getString("op") );
                    } else {
                        return fail("新增失敗...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/readid", method = RequestMethod.GET)
    public RequestResult<List<Map>> getIdData(@RequestParam("productid") final String productid) {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                StringBuilder sb = new StringBuilder();
                sb.append("SELECT * from a_servtrack_product_op ");
                sb.append("WHERE ");
                sb.append("product_id = '" + productid + "'");
                String sql = sb.toString();
                log.info(sql);
                List<Map> result = ProductOp.findBySQL(sql).toMaps();
                return success(TrackCalcUtil.compareOpOrder(result));
            }
        });
    }

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public RequestResult<?> update(@RequestParam("productid") final String productid, @RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                data.put("product_id", productid);
                data.remove("modify_by");
                data.remove("modify_time");
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                ProductOp productOp = new ProductOp();
                productOp.fromMap(data);
                if (productOp.saveIt()) {
                    return success(productOp.getString("product_id") + "_" + productOp.getString("op") );
                } else {
                    return fail("修改失敗...");
                }
            }
        });
    }

}
