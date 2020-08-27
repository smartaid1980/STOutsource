package com.servtech.servcloud.app.controller.servtrack;

import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import com.servtech.servcloud.app.model.servtrack.TabletAuthority;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.PUT;

/**
 * Created by Raynard on 2017/6/27.
 */

@RestController
@RequestMapping("/servtrack/tableauthority")
public class ServtrackTabletAuthorityController {
    private static final Logger log = LoggerFactory.getLogger(ServtrackTabletAuthorityController.class);
    private static File AuthorizationFile = new File(System.getProperty(SysPropKey.CUST_PARAM_PATH), "servTrack/amount.txt");
    private static Authorization auth;


    static {
        if (!AuthorizationFile.exists()) {
            auth = null;
        } else {
            auth = new Authorization(AuthorizationFile);
            String platformIdMD5 = Hashing.md5().hashString(System.getProperty(SysPropKey.SERVCLOUD_ID), Charsets.UTF_8).toString();
            if (platformIdMD5.equals(auth.getPlatformId())) {
                auth.setAuth(true);
            }
        }
    }

    @Autowired
    private HttpServletRequest request;


    @RequestMapping(value = "/registered", method = RequestMethod.GET)
    public RequestResult<String> registered(@RequestParam("id") final String id,
                                            @RequestParam("name") final String name) {

//        Authorization auth = null;
        if (auth == null) {
            return RequestResult.fail("找不到授權文件...");
        } else {
//            auth = new Authorization(AuthorizationFile);
//            String platformIdMD5 = Hashing.md5().hashString(System.getProperty(SysPropKey.SERVCLOUD_ID), Charsets.UTF_8).toString();
            if (!auth.getAuth()) {
                return RequestResult.fail("授權碼不匹配...");
            }
        }
        final Integer maxBind = auth.getMaxBindMachine();
        final Integer maxAuth = auth.getMaxAuthorization();

        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                Integer registeredNum = TabletAuthority.count("id=?", id).intValue();
                if (registeredNum == 0) {
                    Integer recordAuth = TabletAuthority.count("is_open=?", "Y").intValue();
                    Integer recordBind = TabletAuthority.count().intValue();
                    if (recordBind >= maxBind) {
                        return RequestResult.fail("超出平板最大綁定數量...");
                    }
                    if (recordAuth >= maxAuth) {
                        return RequestResult.fail("超出平板授權數量...");
                    }
                }

                String uuidKey = UUID.randomUUID().toString().replace("-", "");
                Map<String, Object> data = new HashMap<String, Object>();
                String key = Hashing.md5().hashString(id + uuidKey, Charsets.UTF_8).toString();
                data.put("id", id);
                data.put("name", name);
                data.put("auth_key", key);
                data.put("is_open", "Y");
                data.put("create_by", "system");
                data.put("create_time", new Timestamp(System.currentTimeMillis()));
                data.put("modify_by", "system");
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                TabletAuthority authority = new TabletAuthority();
                authority.fromMap(data);
                List<TabletAuthority> authorityList = TabletAuthority.find("id=?", id);
                if (authorityList.size() > 0) {
                    TabletAuthority oldAuthority = authorityList.get(0);
                    data.put("is_open", oldAuthority.get("is_open").toString());
                    authority.fromMap(data);
                    if (authority.saveIt()) {
                        return RequestResult.success(uuidKey);
                    } else {
                        return RequestResult.fail("更新失敗...");
                    }
                } else {
                    if (authority.insert()) {
                        return RequestResult.success(uuidKey);
                    } else {
                        return RequestResult.fail("新增失敗...");
                    }

                }

            }
        });

    }

    @RequestMapping(value = "/getauthcount", method = RequestMethod.GET)
    public RequestResult<Map<String, Integer>> getAuthCount() {
        Map<String, Integer> map = new HashMap<String, Integer>();
        Integer maxAuth = 0;
        Integer maxBind = 0;
        if (auth != null) {
            if (auth.getMaxAuthorization() != null) {
                maxAuth = auth.getMaxAuthorization();
            }
            if (auth.getMaxBindMachine() != null) {
                maxBind = auth.getMaxBindMachine();
            }
        }
        map.put("maxAuth", maxAuth);
        map.put("maxBind", maxBind);
        return RequestResult.success(map);
    }

    @RequestMapping(value = "/getstatus", method = RequestMethod.GET)
    public RequestResult<?> getStatus() {
        Map<String, Object> resultMap = new HashMap<String, Object>();
        final String VERIFICATION_SUCCESS = "208";
        final String NO_AUTH_FILE = "209";
        final String AUTH_CODE_NO_MACH = "210";
        if (auth == null) {
            resultMap.put("active", false);
            resultMap.put("message_code", NO_AUTH_FILE);
            return RequestResult.success(resultMap);
        }

        if (!auth.getAuth()) {
            resultMap.put("active", false);
            resultMap.put("message_code", AUTH_CODE_NO_MACH);
            return RequestResult.success(resultMap);
        } else {
            resultMap.put("active", true);
            resultMap.put("message_code", VERIFICATION_SUCCESS);
            return RequestResult.success(resultMap);
        }
    }


    @RequestMapping(value = "/read", method = RequestMethod.GET)
    public RequestResult<List<Map>> read() {
        return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
            @Override
            public RequestResult<List<Map>> operate() {
                return success(TabletAuthority.findAll().toMaps());
            }
        });
    }


    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                if ((TabletAuthority.count("is_open=?", "Y").intValue()) >= auth.getMaxAuthorization()) {
                    if (data.get("is_open").toString().equals("Y")) {
                        List<TabletAuthority> record = TabletAuthority.find("id=? AND is_open=?", data.get("id").toString(), "Y");
                        if (record.size() == 0) {
                            return fail("超過最大授權數量，請先停用其它授權，再行使授權");
                        } else {
                            data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                            data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                            TabletAuthority tabletAuthority = new TabletAuthority();
                            tabletAuthority.fromMap(data);
                            if (tabletAuthority.saveIt()) {
                                return success(tabletAuthority.getString("id"));
                            } else {
                                return fail("修改失敗，原因待查...");
                            }
                        }
                    } else {
                        data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                        data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                        TabletAuthority tabletAuthority = new TabletAuthority();
                        tabletAuthority.fromMap(data);


                        if (tabletAuthority.saveIt()) {
                            return success(tabletAuthority.getString("id"));
                        } else {
                            return fail("修改失敗，原因待查...");
                        }
                    }
                } else {
                    data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("modify_time", new Timestamp(System.currentTimeMillis()));

                    TabletAuthority tabletAuthority = new TabletAuthority();
                    tabletAuthority.fromMap(data);


                    if (tabletAuthority.saveIt()) {
                        return success(tabletAuthority.getString("id"));
                    } else {
                        return fail("修改失敗，原因待查...");
                    }

                }
            }
        });
    }


    static class Authorization {

        private Integer maxBindMachine;
        private Integer maxAuthorization;
        private String platformId;
        private boolean auth = false;

        Authorization(File file) {
            try {
                StringBuilder sb = new StringBuilder();
                BufferedReader br = new BufferedReader(new FileReader(file));
                String line = "";
                while ((line = br.readLine()) != null) {
                    sb.append(line);
                }
                initialize(sb.toString().trim());

            } catch (FileNotFoundException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        void initialize(String s) {

            maxAuthorization = Integer.parseInt(s.substring(1, 2) + s.substring(4, 5));
            maxBindMachine = Integer.parseInt(s.substring(7, 8) + s.substring(10, 11));
            platformId = s.substring(0, 1) +
                    s.substring(2, 4) +
                    s.substring(5, 7) +
                    s.substring(8, 10) +
                    s.substring(11);
        }

        public Integer getMaxBindMachine() {
            return maxBindMachine;
        }

        public Integer getMaxAuthorization() {
            return maxAuthorization;
        }

        public String getPlatformId() {
            return platformId;
        }

        public void setAuth(Boolean result) {
            auth = result;
        }

        public Boolean getAuth() {
            return auth;
        }
    }


}


