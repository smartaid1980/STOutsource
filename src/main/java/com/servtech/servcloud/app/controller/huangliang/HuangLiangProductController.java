package com.servtech.servcloud.app.controller.huangliang;

import com.servtech.hippopotamus.Atom;
import com.servtech.hippopotamus.Hippo;
import com.servtech.hippopotamus.SimpleExhalable;
import com.servtech.hippopotamus.SimpleExhaler;
import com.servtech.hippopotamus.exception.QueryIndexException;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

/**
 * Created by Jenny on 2016/7/27.
 */
@RestController
@RequestMapping("/huangliang/product")
public class HuangLiangProductController {

    private static ConcurrentHashMap<String, Product> PRODUCT_MAP = new ConcurrentHashMap<String, Product>();
    private static Date UPDATE_TIME = null;

    @RequestMapping(value = "get", method = RequestMethod.GET)
    public RequestResult<?> getProductList() {
        // 因為目前MRP一天只會匯出一次，所以把更新頻率設定為6小時
        if ((PRODUCT_MAP.size() == 0 && UPDATE_TIME == null) || new Date().getTime() - UPDATE_TIME.getTime() > 6 * 60 * 60 * 1000) {
            UPDATE_TIME = new Date();
            try {
                Object[] golfOrderIdList = getOrderIdList("HUL_golf_product");
                Object[] mrpOrderIdList = getOrderIdList("HUL_mrp_product");
                getSpecificProductSpace("HUL_golf_product", golfOrderIdList);
                getSpecificProductSpace("HUL_mrp_product", mrpOrderIdList);
            } catch (QueryIndexException e) {
                return RequestResult.fail(e.getMessage());
            } catch (InterruptedException e) {
                return RequestResult.fail(e.getMessage());
            } catch (ExecutionException e) {
                return RequestResult.fail(e.getMessage());
            }
        }
        return RequestResult.success(PRODUCT_MAP.values().toArray());
    }

    private Object[] getOrderIdList(String space) {
        List<String> orderIdList = new ArrayList<String>();
        Hippo hippo = HippoService.getInstance();
        List<String> mrpYearList = hippo.queryIndex(space);
        for (String year : mrpYearList) {
            List<String> mrpMonthList = hippo.queryIndex(space, year);
            for (String month : mrpMonthList) {
                orderIdList.addAll(hippo.queryIndex(space, year, month));
            }
        }
        return orderIdList.toArray();
    }

    private void getSpecificProductSpace(String space, Object[] orderIdList) throws ExecutionException, InterruptedException {

        Hippo hippo = HippoService.getInstance();
        List<String> golfYearList = hippo.queryIndex(space);
        String[] monthArray = {"01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"};

        SimpleExhaler exhaler = hippo.newSimpleExhaler();
        Future<SimpleExhalable> future =
                exhaler.space(space)
                        .index("year", golfYearList.toArray())
                        .index("month", monthArray)
                        .index("order_id", orderIdList)
                        .columns(
                                "order_id",
                                "customer_id",
                                "customer_name",
                                "standard_id",
                                "product_name",
                                "quantity",
                                "quantity_undelivered"
                        )
                        .exhale();

        SimpleExhalable exhalable = future.get();
        List<Map<String, Atom>> dataList = exhalable.toMapping();
        String n7 = "";
        if (space.equals("HUL_golf_product")) {
            n7 = "G";
        } else if (space.equals("HUL_mrp_product")) {
            n7 = "M";
        }
        for (Map<String, Atom> map : dataList) {
            String order_id = map.get("order_id").asString();
            //box will parse macro as float
            String serialNo = order_id.substring(7, 10);
            String macro523 = "";
            while (serialNo.endsWith("0")) {
                serialNo = serialNo.substring(0, serialNo.length() - 1);
            }
            if (serialNo.length() != 0) {
                macro523 = n7 + order_id.substring(2, 7) + "." + serialNo;
            } else {
                macro523 = n7 + order_id.substring(2, 7);
            }
            Product product = new Product(
                    macro523,
                    n7 + order_id,
                    map.get("customer_id").asString(),
                    map.get("customer_name").asString(),
                    map.get("standard_id").asString(),
                    map.get("product_name").asString(),
                    map.get("quantity").asString(),
                    map.get("quantity_undelivered").asString()
            );

            PRODUCT_MAP.put(macro523, product);
        }
    }

    public static class Product {
        public String macro523;
        public String order_id;
        public String customer_id;
        public String customer_name;
        public String standard_id;
        public String product_name;
        public String quantity;
        public String quantity_undelivered;

        public Product(String macro523, String order_id, String customer_id, String customer_name, String standard_id,
                       String product_name, String quantity, String quantity_undelivered) {
            this.macro523 = macro523;
            this.order_id = order_id;
            this.customer_id = customer_id;
            this.customer_name = customer_name;
            this.standard_id = standard_id;
            this.product_name = product_name;
            this.quantity = quantity;
            this.quantity_undelivered = quantity_undelivered;
        }
    }

}
