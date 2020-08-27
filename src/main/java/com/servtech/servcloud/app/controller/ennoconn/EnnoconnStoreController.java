package com.servtech.servcloud.app.controller.ennoconn;


import com.google.gson.Gson;
import com.servtech.servcloud.app.controller.storage.util.RecordAfter;
import com.servtech.servcloud.app.controller.storage.util.RuleEnum;
import com.servtech.servcloud.app.controller.storage.util.StdQRCode;
import com.servtech.servcloud.app.model.storage.*;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.Cookie;
import com.servtech.servcloud.core.util.Language;
import com.servtech.servcloud.core.util.RequestResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.*;
import java.util.stream.Collectors;

import static com.servtech.servcloud.app.controller.ennoconn.SMTController.writeFileAndCallCMD;
import static com.servtech.servcloud.app.controller.ennoconn.TSCQRCodeController.checkTSCStatus;

@RestController
@RequestMapping("/ennoconn/store")
public class EnnoconnStoreController {
    private static final Logger LOG = LoggerFactory.getLogger(EnnoconnStoreController.class);

    private static final RuleEnum STORE = RuleEnum.STORE;
    private static Gson gson = new Gson();
    private static final String LOCK = new String();

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/qrcode-by-tsc", method = RequestMethod.GET)
    public RequestResult<?>  genQRCodeDoc(@RequestParam("store_id[]") String[] ids) {

        return ActiveJdbc.operTx(() -> {

            StringJoiner stringJoiner = new StringJoiner(",");
            for (String id : ids) {
                stringJoiner.add("?");
            }
            List<Store> storeList = Store.find("store_id IN (" + stringJoiner.toString() + ")", ids);

            //怕有運算的時間差，所以處理好後，產生temp_code檔案前在檢查
            String temp_code_file_name = checkTSCStatus();
            if (temp_code_file_name != null) {
                return RequestResult.fail(temp_code_file_name);
            }

            temp_code_file_name = printQrcodeByTSC(storeList);
            if (temp_code_file_name == null) {
                return RequestResult.fail("CMD fail..");
            }
            return RequestResult.success(temp_code_file_name);
        });

    }

    private String printQrcodeByTSC(List<Store> storeList) {
        List<Map<String, String>> fileContentList = new ArrayList<>();
        for (int i = 0; i < storeList.size(); i++) {
            Map<String, String> map = new HashMap<>();
            Store store = storeList.get(i);

            Map<String, String> jsonObj = new HashMap<>();
            jsonObj.put("id", store.getString("store_id"));
            jsonObj.put("name", store.getString("store_name"));
            map.put(gson.toJson(jsonObj), store.getString("store_name"));
            fileContentList.add(map);
        }
        return writeFileAndCallCMD(gson.toJson(fileContentList), "store");
    }
}