package com.servtech.servcloud.app.controller.production_process;

import com.servtech.hippopotamus.Hippo;
import com.servtech.hippopotamus.HippoFactory;
import com.servtech.hippopotamus.Inhalable;
import com.servtech.servcloud.app.model.ffg.ProductionMode;
import com.servtech.servcloud.app.model.ffg.ProductionProcess;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.service.hippo.HippoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import static org.springframework.web.bind.annotation.RequestMethod.*;
import static com.servtech.servcloud.core.util.RequestResult.*;
/**
 * Created by Raynard on 2017/11/30.
 * 目前是用於友嘉的生產履歷要用的controller
 */

@RestController
@RequestMapping("/productionprocess")
public class ProductionProcessController {

    private final Logger logger = LoggerFactory.getLogger(ProductionProcessController.class);
    private static final SimpleDateFormat TIMESTAMP17 = new SimpleDateFormat("yyyyMMddHHmmssSSS");
    private static final SimpleDateFormat DATE8 = new SimpleDateFormat("yyyyMMdd");

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/setMode", method = GET)
    public RequestResult<?> setMode(@RequestParam("mode") final String mode) {

        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String timestamp = TIMESTAMP17.format(new Date()) + "000";
                Map data = new HashMap();
                data.put("timestamp", timestamp);
                data.put("mode", mode);
                ProductionMode productionMode = new ProductionMode();
                productionMode.fromMap(data);
                if (productionMode.insert()) {
                    return success();
                } else {
                    return fail("設定模式失敗, 請確認...");
                }
            }
        });




//        Hippo hippo = HippoService.getInstance();
//        Future<Inhalable> future = hippo.newInhaler()
//                .space("mode")
//                .index("date", DATE8.format(new Date()))
//                .dataTimestamp(dataTimestamp)
//                .put("timestamp",dataTimestamp)
//                .put("mode", mode)
//                .next().inhaleAppend();
//        try {
//            future.get();
//        } catch (InterruptedException e) {
//            e.printStackTrace();
//            return fail("設定模式失敗, 請確認...");
//        } catch (ExecutionException e) {
//            e.printStackTrace();
//            return fail("設定模式失敗, 請確認...");
//        }
//        return success();
    }

    @RequestMapping(value = "/setProductNumber", method = GET)
    public RequestResult<?> setProductNumber(@RequestParam("productId") final String productId) {

        return ActiveJdbc.operTx(new Operation<RequestResult<?>>() {
            @Override
            public RequestResult<?> operate() {
                String timestamp = TIMESTAMP17.format(new Date()) + "000";
                Map data = new HashMap();
                data.put("product_id", productId);
                data.put("timestamp", timestamp);
                ProductionProcess productionProcess = new ProductionProcess();
                productionProcess.fromMap(data);
                if (productionProcess.insert()) {
                    return success();
                } else {
                    return fail("寫入產品序號失敗, 請確認...");
                }
            }
        });
//        Hippo hippo = HippoService.getInstance();
//        Future<Inhalable> future = hippo.newInhaler()
//                .space("product")
//                .index("product_id", product)
//                .index("date", DATE8.format(new Date()))
//                .dataTimestamp(dataTimestamp)
//                .put("timestamp",dataTimestamp)
//                .put("product", product)
//                .next().inhaleAppend();
//        try {
//            future.get();
//        } catch (InterruptedException e) {
//            e.printStackTrace();
//            return fail("寫入產品序號失敗, 請確認...");
//        } catch (ExecutionException e) {
//            e.printStackTrace();
//            return fail("寫入產品序號失敗, 請確認...");
//        }
//        return success();
    }

}
