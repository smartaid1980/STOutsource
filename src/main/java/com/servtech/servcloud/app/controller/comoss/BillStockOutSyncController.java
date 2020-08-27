package com.servtech.servcloud.app.controller.comoss;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.RunCmd;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;

import static com.servtech.servcloud.core.util.RequestResult.success;

@RestController
@RequestMapping("/comoss/billstockoutsync")
public class BillStockOutSyncController {
    private static final Logger LOG = LoggerFactory.getLogger(BillStockOutSyncController.class);
    private static final String LOCK = new String();
    private static final String syncErpBillStockOutPath = System.getProperty(SysPropKey.DATA_PATH) + "/../ComossStoreBillStockOutSync";

    @RequestMapping(method = RequestMethod.GET)
    public RequestResult<?> create() {
        synchronized (LOCK) {
            return ActiveJdbc.operTx(() -> {
                LOG.info("syncErpBillStockOutPath : " + syncErpBillStockOutPath);
                String[] commands = new String[]{"cmd", "/c", "start", "run.bat"};
                RunCmd runCmd = new RunCmd(commands, null, new File(syncErpBillStockOutPath));
                runCmd.exec();
                return success("success");
            });
        }
    }
}
