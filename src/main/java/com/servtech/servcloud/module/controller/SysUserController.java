package com.servtech.servcloud.module.controller;

import com.google.common.base.Charsets;
import com.google.common.collect.Maps;
import com.google.common.hash.Hashing;
import com.google.gson.Gson;
import com.servtech.servcloud.app.controller.shayangye.MachineSyncController;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.SysGroup;
import com.servtech.servcloud.module.model.SysUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.*;

/**
 * Created by Hubert Datetime: 2015/7/6 下午 15:02
 */
@RestController
@RequestMapping("/user")
public class SysUserController {
    public static final String LOGIN_NO_USER = "2005";
    public static final String LOGIN_WRONG_PWD = "2004";
    public static final String LOGIN_NO_PERMIT = "2003";
    public static final String CHANGE_PWD_NOT_SAME = "2006";
    public static final String MAX_LENGTH_20 = "2007";

    public static final String COOKIE_LANG = "lang";

    private static final Logger logger = LoggerFactory.getLogger(SysUserController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/login", method = POST)
    public RequestResult<String> login(@RequestParam(value = "id") final String id,
                                       @RequestParam(value = "password") final String password) {

        if (AuthFilter.getCustomer().equals("superpcb")) {
            int superpcbType = superpcbCheck(id, password);
            if (superpcbType == 0) {
                return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
                    @Override
                    public RequestResult<String> operate() {
                        SysUser sysUser = SysUser.findFirst(" user_id = ?", id);
                        if (sysUser != null) {
                            setLoginInfo(sysUser.getString("user_id"), sysUser.getString("language"), request, response);
                            List userGroupIdList = sysUser.getAll(SysGroup.class).collect("group_id");
                            String[] userGroups = new String[userGroupIdList.size()];
                            userGroupIdList.toArray(userGroups);

                            Map<String, Object> result = Maps.newHashMap();
                            result.put("user_id", id);
                            result.put("user_name", sysUser.getString("user_name"));
                            result.put("user_group", userGroups);
                            result.put("license", System.getProperty(SysPropKey.LICENSE_DATE));
                            result.put("version", System.getProperty(SysPropKey.VERSION));
                            return success(new Gson().toJson(result));
                        } else {
                            Map<String, Object> data = new HashMap<>();
                            data.put("user_id", id);
                            data.put("user_pwd", Hashing.md5().hashString((String) id, Charsets.UTF_8).toString());
                            data.put("user_name", id);
                            data.put("user_email", "");
                            data.put("user_phone", "");
                            data.put("user_address", "");
                            data.put("language", "zh_tw");
                            data.put("pwd_error_count", 0);
                            data.put("is_valid", 0);
                            data.put("is_lock", 0);
                            data.put("is_close", 1);
                            data.put("create_by", "admin");
                            data.put("create_time", new Timestamp(System.currentTimeMillis()));
                            SysUser nwUser = new SysUser();
                            nwUser.fromMap(data);
                            if (nwUser.insert()) {
                                nwUser.add(SysGroup.findById("superpcb_default_group"));
                                setLoginInfo(id, "zh_tw", request, response);
                                String[] userGroups = new String[] {"superpcb_default_group"};
                                Map<String, Object> result = Maps.newHashMap();
                                result.put("user_id", id);
                                result.put("user_name", id);
                                result.put("user_group", userGroups);
                                result.put("license", System.getProperty(SysPropKey.LICENSE_DATE));
                                result.put("version", System.getProperty(SysPropKey.VERSION));
                                return success(new Gson().toJson(result));
                            } else {
                                return RequestResult.fail("");
                            }
                        }
                    }
                });
            } else if (superpcbType == 9999) {
                return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
                    @Override
                    public RequestResult<String> operate() {
                        SysUser sysUser = SysUser.findFirst(" user_id = ?", id);

                        if (sysUser != null) {
                            String hashPwd = Hashing.md5().hashString(password, Charsets.UTF_8).toString();

                            if (hashPwd.equals(sysUser.getString("user_pwd"))) {

                                if (sysUser.getInteger("is_close") == 1) {
                                    setLoginInfo(id, sysUser.getString("language"), request, response);
                                    List userGroupIdList = sysUser.getAll(SysGroup.class).collect("group_id");
                                    String[] userGroups = new String[userGroupIdList.size()];
                                    userGroupIdList.toArray(userGroups);

                                    Map<String, Object> result = Maps.newHashMap();
                                    result.put("user_id", sysUser.getString("user_id"));
                                    result.put("user_name", sysUser.getString("user_name"));
                                    result.put("user_group", userGroups);
                                    result.put("license", System.getProperty(SysPropKey.LICENSE_DATE));
                                    result.put("version", System.getProperty(SysPropKey.VERSION));

                                    return success(new Gson().toJson(result));

                                } else {
                                    return fail(LOGIN_NO_PERMIT);
                                }

                            } else {
                                return fail(LOGIN_WRONG_PWD);

                            }
                        } else {
                            return fail(LOGIN_NO_USER);
                        }
                    }
                });
            } else {
                return RequestResult.fail("" + superpcbType);
            }

        } else {
            return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    SysUser sysUser = SysUser.findFirst(" user_id = ?", id);

                    if (sysUser != null) {
                        String hashPwd = Hashing.md5().hashString(password, Charsets.UTF_8).toString();
                        if (hashPwd.equals(sysUser.getString("user_pwd"))) {

                            if (sysUser.getInteger("is_close") == 1) {
                                setLoginInfo(sysUser.getString("user_id"), sysUser.getString("language"), request, response);
                                List userGroupIdList = sysUser.getAll(SysGroup.class).collect("group_id");
                                String[] userGroups = new String[userGroupIdList.size()];
                                userGroupIdList.toArray(userGroups);

                                Map<String, Object> result = Maps.newHashMap();
                                result.put("user_id", sysUser.getString("user_id"));
                                result.put("user_name", sysUser.getString("user_name"));
                                result.put("user_group", userGroups);
                                result.put("license", System.getProperty(SysPropKey.LICENSE_DATE));
                                result.put("version", System.getProperty(SysPropKey.VERSION));

                                return success(new Gson().toJson(result));

                            } else {
                                return fail(LOGIN_NO_PERMIT);
                            }

                        } else {
                            return fail(LOGIN_WRONG_PWD);

                        }
                    } else {
                        return fail(LOGIN_NO_USER);
                    }
                }
            });
        }

    }

    @RequestMapping(value = "/logout", method = GET)
    public RequestResult<Void> logout() {
        HttpSession session = request.getSession();
        String id = (String) session.getAttribute(AuthFilter.SESSION_LOGIN_KEY);

        logger.info("使用者登出: " + id);

        session.invalidate();
        return success();
    }

    @RequestMapping(value = "/loginInfo", method = GET)
    public RequestResult<String> userInfo() {
        final String id = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);

        return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                SysUser sysUser = SysUser.findFirst(" user_id = ?", id);

                List userGroupIdList = sysUser.getAll(SysGroup.class).collect("group_id");
                String[] userGroups = new String[userGroupIdList.size()];
                userGroupIdList.toArray(userGroups);

                Map<String, Object> result = Maps.newHashMap();
                result.put("user_id", sysUser.getString("user_id"));
                result.put("user_name", sysUser.getString("user_name"));
                result.put("user_group", userGroups);
                result.put("license", System.getProperty(SysPropKey.LICENSE_DATE));
                result.put("version", System.getProperty(SysPropKey.VERSION));

                return success(new Gson().toJson(result));
            }
        });

    }

    @RequestMapping(value = "/changeLang", method = POST)
    public RequestResult<String> changeLang(@RequestParam(value = "lang") final String lang) {
        HttpSession session = request.getSession();
        final String id = (String) session.getAttribute(AuthFilter.SESSION_LOGIN_KEY);

        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                int numOfUpdateRecord = SysUser.update("language = ?", "user_id = ?", lang, id);
                if (numOfUpdateRecord != -1) {
                    for (Cookie cookie : request.getCookies()) {
                        if (cookie.getName().equals(COOKIE_LANG)) {
                            cookie.setValue(lang);
                            cookie.setPath(request.getContextPath());
                            response.addCookie(cookie);
                        }
                    }
                    return success();
                }
                return fail("他到了一個到不了的遠方...");
            }
        });
    }

    @RequestMapping(value = "/changepwd", method = POST)
    public RequestResult<String> changePwd(@RequestParam(value = "oldpwd") final String oldPwd,
                                           @RequestParam(value = "newpwd") final String newPwd,
                                           @RequestParam(value = "confirmpwd") final String confirmPwd) {
        HttpSession session = request.getSession();
        final String id = (String) session.getAttribute(AuthFilter.SESSION_LOGIN_KEY);
        final String hashOldPwd = Hashing.md5().hashString(oldPwd, Charsets.UTF_8).toString();

        boolean oldPwdMatch = ActiveJdbc.oper(new Operation<Boolean>() {
            @Override
            public Boolean operate() {
                SysUser sysUser = SysUser.findFirst("BINARY user_id = ?", id);
                if (sysUser != null) {
                    if (sysUser.getString("user_pwd").equals(hashOldPwd)) {
                        return true;
                    } else {
                        return false;
                    }
                }
                logger.info("他到了一個到不了的遠方...");
                return false;
            }
        });

        if (oldPwdMatch) {
            if (newPwd.length() > 20) {
                return fail(MAX_LENGTH_20);
            } else if (newPwd.equals(confirmPwd)) {
                return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                    @Override
                    public RequestResult<String> operate() {
                        SysUser sysUser = SysUser.findFirst("BINARY user_id = ?", id);
                        String hashNewPwd = Hashing.md5().hashString(newPwd, Charsets.UTF_8).toString();
                        sysUser.set("user_pwd", hashNewPwd);
                        if (sysUser.saveIt()) {
                            return success();
                        } else {
                            return fail("修改失敗，原因待查...");
                        }
                    }
                });
            } else {
                return fail(CHANGE_PWD_NOT_SAME);
            }
        } else {
            return fail(LOGIN_WRONG_PWD);
        }
    }

    @RequestMapping(value = "/create", method = POST)
    public RequestResult<String> create(@RequestBody final Map data) {
        try {
            return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
                @Override
                public RequestResult<String> operate() {
                    data.put("create_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                    data.put("create_time", new Timestamp(System.currentTimeMillis()));

                    data.put("user_pwd", Hashing.md5().hashString((String) data.get("user_id"), Charsets.UTF_8).toString());
                    data.put("is_valid", 0);
                    data.put("is_lock", 0);
                    data.put("pwd_error_count", 0);

                    SysUser sysUser = new SysUser();
                    sysUser.fromMap(data);
                    if (sysUser.insert()) {
                        if (data.get("sys_groups") != null) {
                            for (String groupId : (List<String>) data.get("sys_groups")) {
                                sysUser.add(SysGroup.findById(groupId));
                            }
                        }
                        return success(sysUser.getString("user_id"));
                    } else {
                        return fail("新增失敗，原因待查...");
                    }
                }
            });
        } catch (Exception e) {
            return fail(e.getMessage());
        }
    }

    @RequestMapping(value = "/read", method = GET)
    public RequestResult<List<Map>> read() {

        HttpSession session = request.getSession();
        String id = (String) session.getAttribute(AuthFilter.SESSION_LOGIN_KEY);

        if (id.equals("@st@STAdmin")) {
            return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(SysUser.findAll().include(SysGroup.class).toMaps());
                }
            });
        } else if (id.startsWith("@st@")) {
            return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(SysUser.where("user_id <> '@st@STAdmin'").include(SysGroup.class).toMaps());
                }
            });
        } else {
            return ActiveJdbc.oper(new Operation<RequestResult<List<Map>>>() {
                @Override
                public RequestResult<List<Map>> operate() {
                    return success(SysUser.where("user_id not like '@st@%'").include(SysGroup.class).toMaps());
                }
            });
        }
    }

    @RequestMapping(value = "/update", method = PUT)
    public RequestResult<String> update(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                SysUser sysUser = new SysUser();
                sysUser.fromMap(data);

                List<SysGroup> sysGroupList = sysUser.getAll(SysGroup.class);
                for (SysGroup sysGroup : sysGroupList) {
                    sysUser.remove(sysGroup);
                }
                if (data.get("sys_groups") != null) {
                    for (String sysGroupId : (List<String>) data.get("sys_groups")) {
                        sysUser.add(SysGroup.findById(sysGroupId));
                    }
                }

                if (sysUser.saveIt()) {
                    return success(sysUser.getString("user_id"));
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }

    @RequestMapping(value = "/delete", method = DELETE)
    public RequestResult<Void> delete(@RequestBody final Object[] idList) {
        return ActiveJdbc.operTx(new Operation<RequestResult<Void>>() {
            @Override
            public RequestResult<Void> operate() {
                int deleteAmount = SysUser.delete("user_id IN (" + Util.strSplitBy("?", ",", idList.length) + ")", idList);
                return success();
            }
        });
    }

    // 配合安捷 webview 回傳 deviceToken 存到 m_sys_user.user_address
    @RequestMapping(value = "/updatedevicetoken", method = PUT)
    public RequestResult<String> updateDeviceToken(@RequestBody final Map data) {
        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                if (data.get("user_address") == null) {
                    logger.info("未傳入deviceToken.");
                    return fail("未傳入deviceToken.");
                }
                logger.info("user_address: " + data.get("user_address").toString());
                data.put("modify_by", request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));
                data.put("modify_time", new Timestamp(System.currentTimeMillis()));
                SysUser sysUser = new SysUser();
                sysUser.fromMap(data);
                if (sysUser.saveIt()) {
                    return success(sysUser.getString("user_id"));
                } else {
                    return fail("修改失敗，原因待查...");
                }
            }
        });
    }

    public void setLoginInfo(String id, String lang, HttpServletRequest request, HttpServletResponse response) {
        logger.info("使用者登入: " + id);
        Cookie langCookie = new Cookie(COOKIE_LANG, lang);
        langCookie.setPath(request.getContextPath());
        response.addCookie(langCookie);
        request.getSession().setAttribute(AuthFilter.SESSION_LOGIN_KEY, id);
    }


    public int superpcbCheck(String id, String password) {
        String batTarget = System.getProperty(SysPropKey.ROOT_PATH) + "/app/Management/program/SuperpcbLogin";
        String runBatPath = batTarget + "/run.bat";
        String[] commands = new String[]{runBatPath, id, password};
        SuppcbLoginCmd loginCmd = new SuppcbLoginCmd(commands, null, new File(batTarget));
        SuppcbLoginCmd.ResponseData result = loginCmd.runCmd();
        return result.status;
    }

    public static class SuppcbLoginCmd {
        private String[] commands;
        private String[] envp;
        private File file;

        public SuppcbLoginCmd(String[] commands, String[] envp, File file) {
          this.commands = commands;
          this.envp = envp;
          this.file = file;
        }

        ResponseData runCmd() {
            try {
                ProcessBuilder pb = new ProcessBuilder(this.commands).directory(this.file).redirectErrorStream(true);
                Process proc = pb.start();
                ExecutorService executor = Executors.newCachedThreadPool();
                Callable<ResponseData> task = new Message(proc.getInputStream());
                Future<ResponseData> future = executor.submit(task);
                proc.waitFor();
                return future.get();
            } catch (IOException e) {
                e.printStackTrace();
            } catch (InterruptedException e) {
                e.printStackTrace();
            } catch (ExecutionException e) {
                e.printStackTrace();
            }
            return null;
        }

        static class Message implements Callable<ResponseData> {

            private InputStream is;
            static final String SEP = System.getProperty("line.separator");

            Message(InputStream is) {
                this.is = is;
            }

            @Override
            public ResponseData call() throws Exception {
                ResponseData responseData = null;
                StringBuilder sb = new StringBuilder();
                try {
                    BufferedReader br = new BufferedReader(new InputStreamReader(is, "UTF-8"));
                    String line = "";

                    while ((line = br.readLine()) != null) {
                        sb.append(line);
                        sb.append(SEP);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                } catch (Exception e) {
                    e.printStackTrace();
                }
                String respStr = sb.toString();
//                System.out.println(respStr);
                if (respStr.indexOf("success") > -1) {
                    return new ResponseData(0, "success");
                } else if (respStr.indexOf("fail") > -1) {
                    return new ResponseData(2004, "fail");
                }
                return new ResponseData(9999, "no_such_user");
            }

        }

        static class ResponseData<T> {
            int status;
            T data;

            ResponseData(int status, T data) {
                this.status = status;
                this.data = data;
            }

        }
    }

}
