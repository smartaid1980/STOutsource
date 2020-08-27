package com.servtech.servcloud.core.filter;

import com.google.common.base.Charsets;
import com.google.common.hash.Hashing;
import com.google.common.io.CharStreams;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.servtech.hippopotamus.*;
import com.servtech.hippopotamus.exception.NoSpaceException;
import com.servtech.servcloud.app.model.iiot.IiotSmartWatch;
import com.servtech.servcloud.app.model.servtrack.TabletAuthority;
import com.servtech.servcloud.app.model.storage.Sender;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.initializer.PlatformInitializer;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.controller.SysUserController;
import com.servtech.servcloud.module.model.SysGroup;
import com.servtech.servcloud.module.model.SysUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.*;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import static com.servtech.servcloud.core.initializer.PlatformInitializer.isValid;

/**
 * Created by Hubert
 * Datetime: 2015/7/7 下午 12:02
 *
 * Update by Raynard
 * Datetime: 2017/6/27 下午 4:50
 */
public class AuthFilter implements Filter {
    public static final Logger logger = LoggerFactory.getLogger(AuthFilter.class);
    public static final String SESSION_LOGIN_KEY = "userId";
    public static final String STKEY = "stkey";
    private String noLoginKey;
    private String[] excludePaths;
    private boolean onlyShowApiLog;
    private List<String> IGNORE_API_LIST = new ArrayList<String>(Arrays.asList("/api/mqttpool/data", "/api/enzoymacroeditor/getLatestWorkMacro", "/api/v3/servcore/macro-downtime/getLatestWorkMacro"));
    public  static final Map<String, String> REQUEST_MALEFACTOR_MAP = new HashMap<String, String>();
    private static String st_customer;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        noLoginKey = filterConfig.getInitParameter(STKEY);
        excludePaths = filterConfig.getInitParameter("excludePath").split(",");
        onlyShowApiLog = Boolean.parseBoolean(filterConfig.getInitParameter("onlyShowApiLog"));
        initMalefactor();
        initServtechConfig();
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {

        Guardian guardian = new Guardian(servletRequest, servletResponse);
        HttpServletRequest request = guardian.request;
        HttpServletResponse response = guardian.response;
        String requestPath = guardian.requestPath;
        Action action = guardian.action;
        if (guardian.doFilter()) {
            if (requestPath.equals("/index2.html") || requestPath.equals("/index3.html") || requestPath.equals("/")) {
                action.url = "/index.html";
                guardian.redirect(action);
            } else {
                filterChain.doFilter(servletRequest, servletResponse);
            }
        } else {
            if (requestPath.startsWith("/api")) {
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().print(guardian.requestResult.toJson());
            } else {
                if (!isValid) {
                    action = Action.VALIDATE;
                    guardian.redirect(action);
                } else if (guardian.isMalefactor()) {
                    action = Action.EXPIRED;
                    guardian.redirect(action);
                } else {
                    guardian.redirect(action);
                }
            }
        }
    }

    @Override
    public void destroy() {

    }

    private String getStkey(HttpServletRequest request) {
        if ("application/json".equals(request.getHeader("Content-Type"))) {
            try {
                String json = CharStreams.toString(request.getReader());
                JsonObject jsonObject = new Gson().fromJson(json, JsonObject.class);
                return jsonObject.getAsJsonPrimitive(STKEY).getAsString();

            } catch (Exception e) {
                logger.debug(e.getMessage(), e);
                return null;
            }
        }
        return request.getParameter(STKEY);
    }

    private String getAuthkey(HttpServletRequest request) {
        String contentType = request.getHeader("Content-Type");
        if (contentType != null) {
            if (contentType.indexOf("application/json") > -1) {
                try {
                    return request.getHeader("authkey");
                } catch (Exception e) {
                    logger.debug(e.getMessage(), e);
                    return null;
                }
            }
        } else if (request.getHeader("authkey") != null) {
            return request.getHeader("authkey");
        }
        return request.getParameter("authkey");
    }

    private String getTablet(HttpServletRequest request) {
        String contentType = request.getHeader("Content-Type");
        if (contentType != null) {
            if (contentType.indexOf("application/json") > -1) {
                try {
                    return request.getHeader("tablet");
                } catch (Exception e) {
                    logger.debug(e.getMessage(), e);
                    return null;
                }
            }
        } else if (request.getHeader("tablet") != null) {
            return request.getHeader("tablet");
        }
        return request.getParameter("tablet");
    }

    private String getWatch(HttpServletRequest request) {
        String contentType = request.getHeader("Content-Type");
        if (contentType != null) {
            if (contentType.indexOf("application/json") > -1) {
                try {
                    return request.getHeader("watch");
                } catch (Exception e) {
                    logger.debug(e.getMessage(), e);
                    return null;
                }
            }
        }
        return request.getParameter("watch");
    }

    private boolean validateAuthKey (final String tabletId, String uuid) {
        final String authkey = Hashing.md5().hashString(tabletId + uuid, Charsets.UTF_8).toString();
        return ActiveJdbc.oper(new Operation<Boolean>() {
            @Override
            public Boolean operate() {
                Integer count = TabletAuthority.count("id=? AND auth_key=? AND is_open=?", tabletId, authkey, "Y").intValue();
                if (count > 0) {
                    return true;
                } else {
                    return false;
                }
            }
        });

    }

    private boolean validateAuthKeyByStorage (final String tabletId, String uuid) {
        final String authkey = Hashing.md5().hashString(tabletId + uuid, Charsets.UTF_8).toString();
        return ActiveJdbc.oper(new Operation<Boolean>() {
            @Override
            public Boolean operate() {
                try {
                    Sender sender = Sender.findFirst("sender_key=? AND sender_token=? ORDER BY sender_id DESC ", tabletId, authkey);
                    if (sender != null && sender.getString("sender_enabled").toUpperCase().equals("Y")) {
                        return true;
                    } else {
                        return false;
                    }
                } catch (Exception e) {
                    //2019-04-23例外原因通常為沒有建大峽谷的a_storage_sender table
                    e.printStackTrace();
                    return false;
                }


//                Integer count = Sender.count("sender_key=? AND sender_token=? AND sender_enabled=? ORDER BY sender_id DESC ", tabletId, authkey, "Y").intValue();
//                if (count > 0) {
//                    return true;
//                } else {
//                    return false;
//                }
            }
        });

    }

    private boolean validateWatchAuthKey (final String watchId, String uuid) {
        final String authkey = Hashing.md5().hashString(watchId + uuid, Charsets.UTF_8).toString();
        return ActiveJdbc.oper(new Operation<Boolean>() {
            @Override
            public Boolean operate() {
                Integer count = IiotSmartWatch.count("watch_id=? AND auth_key=?", watchId, authkey).intValue();
                if (count > 0) {
                    return true;
                } else {
                    return false;
                }
            }
        });
    }



    private void log(String requestPath, String logMessage) {
        if (requestPath.endsWith(".html")) {
            logger.info(logMessage);
            return;
        }

        if (onlyShowApiLog) {
            if (requestPath.startsWith("/api") && !IGNORE_API_LIST.contains(requestPath)) {
                logger.info(logMessage);
            }
        } else {
            logger.info(logMessage);
        }
    }

    private class Guardian {
        HttpServletRequest request;
        HttpServletResponse response;
        String requestPath;
        String ipPort;
        Action action = Action.LOGIN;
        RequestResult requestResult = RequestResult.noLogin();


        public boolean doFilter() throws IOException {
            isAidc();
            isSuperPcb();
            return auth();
        }


        public void redirect(Action action) throws IOException {
            response.sendRedirect(getPrifix() + action.url);
        }

        public String getPrifix() {
            String url = request.getScheme() + "://" +
                    request.getServerName() + ":" +
                    request.getServerPort() +
                    request.getContextPath();
            return url;
        }

        public boolean deviceValidate() {
            String reg = "/system_validate.html";
            if (requestPath.equals(reg)) {
                return true;
            }
            if (isValid) {
                return true;
            } else {
                action = Action.VALIDATE;
                requestResult = RequestResult.noLogin();
                return false;
            }
        }

        public void isAidc() throws IOException {
            if (requestPath.equals("/index2.html")) {
                final String hanshiang = "aidc";
                String langTag = ActiveJdbc.oper(new Operation<String>() {
                    @Override
                    public String operate() {
                        SysUser sysUser = SysUser.findById(hanshiang);
                        if (sysUser == null) {
                            return "zh_tw";
                        }
                        return sysUser.getString("language");
                    }
                });
                Cookie langCookie = new Cookie(SysUserController.COOKIE_LANG, langTag);
                langCookie.setPath(request.getContextPath());
                response.addCookie(langCookie);
                request.getSession().setAttribute(SESSION_LOGIN_KEY, hanshiang);
            }
        }

        public void isSuperPcb() throws IOException {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
            String userId = request.getParameter("UID");
            String time = request.getParameter("TT");
            if (requestPath.equals("/index3.html") && userId != null && time != null && st_customer.equals("superpcb")) {
                try {
                    String decryptId = URLDecoder.decode(SuppcbKeyCrypt.deCode(userId), "UTF-8");
                    String decryptTT =  URLDecoder.decode(SuppcbKeyCrypt.deCode(time), "UTF-8");
                    Date loginDate = sdf.parse(decryptTT);
                    if (System.currentTimeMillis() - loginDate.getTime() > 60000) {
                        response.getWriter().write("Request is not valid");
                    } else {
                        boolean userIsExist = ActiveJdbc.oper(new Operation<Boolean>() {
                            @Override
                            public Boolean operate() {
                                SysUser sysUser = SysUser.findById(decryptId);
                                if (sysUser == null) {
                                    return false;
                                } else {
                                    return true;
                                }
                            }
                        });
                        if (!userIsExist) {
                            RequestResult<Boolean> createResult =  ActiveJdbc.operTx(new Operation<RequestResult<Boolean>>() {
                                @Override
                                public RequestResult<Boolean> operate() {
                                    Map<String, Object> data = new HashMap<>();
                                    data.put("user_id", decryptId);
                                    data.put("user_pwd", Hashing.md5().hashString((String) decryptId, Charsets.UTF_8).toString());
                                    data.put("user_name", decryptId);
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
                                    SysUser sysUser = new SysUser();
                                    sysUser.fromMap(data);
                                    if (sysUser.insert()) {
                                        sysUser.add(SysGroup.findById("superpcb_default_group"));
                                        return RequestResult.success(true);
                                    } else {
                                        return RequestResult.fail(false);
                                    }
                                }
                            });
                            if(createResult.getType() == 0) {
                                logger.info("使用者登入: " + decryptId);
                                Cookie langCookie = new Cookie(SysUserController.COOKIE_LANG, "zh_tw");
                                langCookie.setPath(request.getContextPath());
                                response.addCookie(langCookie);
                                request.getSession().setAttribute(SESSION_LOGIN_KEY, decryptId);
                            } else {
                                logger.info("使用者異常:" + decryptId);
                            }
                        } else {
                            logger.info("使用者登入: " + decryptId);
                            Cookie langCookie = new Cookie(SysUserController.COOKIE_LANG, "zh_tw");
                            langCookie.setPath(request.getContextPath());
                            response.addCookie(langCookie);
                            request.getSession().setAttribute(SESSION_LOGIN_KEY, decryptId);
                        }
                    }
                } catch (ParseException e) {
                    e.printStackTrace();
                }
            }
        }

        public boolean auth() {

            String stkey = getStkey(request);
            String authkey = getAuthkey(request);
            String tablet = getTablet(request);
            String watch = getWatch(request);
            HttpSession session = request.getSession(false);

            String userId = null;

            if (!deviceValidate()) {
                return false;
            }

            if (isMalefactor()) {
                return false;
            }

            if (session != null) {
                userId = (String) session.getAttribute(SESSION_LOGIN_KEY);
            }

            if (userId != null) { // 已登入
                log(requestPath, getLogMsg(userId, stkey));
                return true;
            }
            if (noLoginKey.equals(stkey)) { // 有附上 key 且匹配
                log(requestPath, getLogMsg(userId, stkey));
                return true;
            }
            if (tablet != null && authkey != null) {
                logger.info("tablet: " + tablet + ", authkey: " + authkey);
                if (validateAuthKey(tablet, authkey)) {
                    if (session == null);
                    session = request.getSession();
                    session.setAttribute(SESSION_LOGIN_KEY, tablet);
                    log(requestPath, getLogMsg(userId, stkey));
                    return true;
                }

                if (validateAuthKeyByStorage(tablet, authkey)) {
                    if (session == null);
                    session = request.getSession();
                    session.setAttribute(SESSION_LOGIN_KEY, tablet);
                    log(requestPath, getLogMsg(userId, stkey));
                    return true;
                }

            }
            if (watch != null && authkey != null) {
                if (validateWatchAuthKey(watch, authkey)) {
                    if (session == null);
                    session = request.getSession();
                    session.setAttribute(SESSION_LOGIN_KEY, watch);
                    log(requestPath, getLogMsg(userId, stkey));
                    return true;
                }
            }

            for (String excludePath : excludePaths) { // 該路徑是可任意存取無需驗證的
                if (excludePath.endsWith("/*")) {
                    if (requestPath.startsWith(excludePath.substring(0, excludePath.length() - 2))) {
                        log(requestPath, getLogMsg(userId, stkey));
                        return true;
                    }
                }
                if (excludePath.equals(requestPath)) {
                    log(requestPath, getLogMsg(userId, stkey));
                    return true;
                }
            }

            logger.info(ipPort + " - 無權限的請求: " + requestPath);
            return false;
        }

        public boolean isMalefactor() {
            if (requestPath.startsWith("/app/") && requestPath.endsWith(".html")) {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
                String date8Bits = sdf.format(new Date());
                String[] sp = requestPath.split("/");
                String path = "/" + sp[1] + "/" + sp[2] + "/" + sp[sp.length - 1];
                String prison_day = REQUEST_MALEFACTOR_MAP.get(path);
                if (prison_day == null) {
                    return false;
                } else {
                    if (prison_day.compareTo(date8Bits) >= 0) {
                        return false;
                    } else {
                        this.requestResult = RequestResult.unvalidate();
                        this.action = Action.EXPIRED;
                        return true;
                    }
                }

            } else if (requestPath.startsWith("/api/")) {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
                String date8Bits = sdf.format(new Date());
                String prison_day = REQUEST_MALEFACTOR_MAP.get(requestPath);
                if (prison_day == null) {
                    return false;
                } else {
                    if (prison_day.compareTo(date8Bits) >= 0) {
                        return false;
                    } else {
                        this.requestResult = RequestResult.unvalidate();
                        this.action = Action.APIEXPIRED;
                        return true;
                    }
                }
            } else {
                return false;
            }
        }


        public String getLogMsg(String userId, String stkey) {
            return ipPort + " - path: " + requestPath +
                    (userId == null ? "" : ", userId: " + userId) +
                    (stkey == null ? "" : " with stkey. ");
        }



        public Guardian(ServletRequest servletRequest, ServletResponse servletResponse) {
            this.request = (HttpServletRequest) servletRequest;
            this.response = (HttpServletResponse) servletResponse;
            this.requestPath = request.getRequestURI().substring(request.getContextPath().length());
            this.ipPort =  request.getRemoteAddr() + ":" + request.getRemotePort();
        }


    }

    enum Action {
        VALIDATE(0, "/system_validate.html?type=" + PlatformInitializer.type),
        EXPIRED(1, "/licenseexpired.html"),
        LOGIN(2, "/login.html"),
        APIEXPIRED(4, "");

        private Integer type;
        private String url;

        private Action (Integer type, String url) {
            this.type = type;
            this.url = url;
        }
        public void setUrl(String url) {
            this.url = url;
        }
    }

    private void initMalefactor() {
        File configFile = new File(System.getProperty(SysPropKey.ROOT_PATH), "WEB-INF/classes/hippo.xml");
        Hippo hippo = HippoFactory.getHippo(configFile);
        SimpleExhaler simpleExhaler = hippo.newSimpleExhaler();
        try {
            Future<SimpleExhalable> future = simpleExhaler.space("request_malefactor")
                    .index("malefactor", new String[] {"malefactor"})
                    .columns("role", "prison_day")
                    .exhale();

            SimpleExhalable simpleExhalable = future.get();
            List<Map<String, Atom>> resultList = simpleExhalable.toMapping();
            for (Map<String, Atom> map : resultList) {
                REQUEST_MALEFACTOR_MAP.put(map.get("role").asString(), map.get("prison_day").asString());
            }
        } catch (InterruptedException e) {
            logger.warn(e.getMessage());
            e.printStackTrace();
        } catch (ExecutionException e) {
            logger.warn(e.getMessage());
            e.printStackTrace();
        } catch (NoSpaceException e ) {

        }
    }

    private void initServtechConfig() {
        File jsFile = new File(System.getProperty(SysPropKey.ROOT_PATH), "js/servtech.config.js");
        if (jsFile.exists()) {
            try {
                InputStream is = new FileInputStream(jsFile);
                InputStreamReader isr = new InputStreamReader(is, "UTF-8");
                BufferedReader br = new BufferedReader(isr);
                StringBuilder sb = new StringBuilder();
                String line = null;
                while((line = br.readLine()) != null) {
                    sb.append(line);
                    sb.append(System.lineSeparator());
                }
                br.close();
                String jsonContent = sb.toString();
                String jsonStr = jsonContent.substring(jsonContent.indexOf("{"), jsonContent.indexOf("}") + 1);
                Gson gson = new Gson();
                Map<String, Object> map = gson.fromJson(jsonStr, Map.class);
                if (map.get("ST_CUSTOMER") != null) {
                    st_customer = map.get("ST_CUSTOMER").toString();
                } else {
                    st_customer = "---";
                }
            } catch (FileNotFoundException e) {
                e.printStackTrace();
                logger.warn(e.getMessage());
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }else {
            jsFile = new File(System.getProperty(SysPropKey.ROOT_PATH), "js/servtech.config.json");
            try {
                InputStream is = new FileInputStream(jsFile);
                InputStreamReader isr = new InputStreamReader(is, "UTF-8");
                BufferedReader br = new BufferedReader(isr);
                StringBuilder sb = new StringBuilder();
                String line = null;
                while((line = br.readLine()) != null) {
                    sb.append(line);
                }
                br.close();
                String jsonContent = sb.toString();
                Gson gson = new Gson();
                Map<String, Object> map = gson.fromJson(jsonContent, Map.class);
                if (map.get("ST_CUSTOMER") != null) {
                    st_customer = map.get("ST_CUSTOMER").toString();
                } else {
                    st_customer = "---";
                }
            } catch (FileNotFoundException e) {
                e.printStackTrace();
                logger.warn(e.getMessage());
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public static String getCustomer() {
        return st_customer;
    }


    static class SuppcbKeyCrypt {

        private static final String KEY = "SUPERPCB";
        private static final String IV = "Servtech";
        private static final byte[] TEMP_KEY = KEY.getBytes(StandardCharsets.UTF_8);
        private static final byte[] TEMP_IV = IV.getBytes(StandardCharsets.UTF_8);
        public static String deCode(String msg) {
            String result = null;
            try {
                byte[] md5HashKey = MessageDigest.getInstance("MD5").digest(TEMP_KEY);
                byte[] md5HashIv =  MessageDigest.getInstance("MD5").digest(TEMP_IV);

                Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
                cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(md5HashKey, "AES"), new IvParameterSpec(md5HashIv));
                byte[] decodeByte = Base64.getDecoder().decode(msg);
                byte[] resultBytes = cipher.doFinal(decodeByte);
                result = new String(resultBytes, StandardCharsets.UTF_8);
            } catch (NoSuchAlgorithmException e) {
                e.printStackTrace();
            } catch (NoSuchPaddingException e) {
                e.printStackTrace();
            } catch (InvalidAlgorithmParameterException e) {
                e.printStackTrace();
            } catch (InvalidKeyException e) {
                e.printStackTrace();
            } catch (BadPaddingException e) {
                e.printStackTrace();
            } catch (IllegalBlockSizeException e) {
                e.printStackTrace();
            }

            return result;
        }


        public static String enCode(String msg) {
            String result = null;
            try {
                byte[] md5HashKey = MessageDigest.getInstance("MD5").digest(TEMP_KEY);
                byte[] md5HashIv =  MessageDigest.getInstance("MD5").digest(TEMP_IV);
                byte[] dataBytes = msg.getBytes(StandardCharsets.UTF_8);

                Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
                cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(md5HashKey, "AES"), new IvParameterSpec(md5HashIv));
                byte[] dataEncrypt = cipher.doFinal(dataBytes);
                result = Base64.getEncoder().encodeToString(dataEncrypt);

            } catch (NoSuchAlgorithmException e) {
                e.printStackTrace();
            } catch (InvalidKeyException e) {
                e.printStackTrace();
            } catch (InvalidAlgorithmParameterException e) {
                e.printStackTrace();
            } catch (NoSuchPaddingException e) {
                e.printStackTrace();
            } catch (BadPaddingException e) {
                e.printStackTrace();
            } catch (IllegalBlockSizeException e) {
                e.printStackTrace();
            }
            return result;
        }
    }

}
