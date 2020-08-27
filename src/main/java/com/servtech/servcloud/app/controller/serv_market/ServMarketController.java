package com.servtech.servcloud.app.controller.serv_market;

import com.google.gson.Gson;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.Cookie;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.service.app.AppUploadService;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.http.*;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.client.utils.HttpClientUtils;
import org.apache.http.client.methods.*;
import org.apache.http.impl.client.BasicCookieStore;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.springframework.web.bind.annotation.RequestMethod.*;
import static com.servtech.servcloud.core.util.RequestResult.*;

/**
 * Created by Vincent on 2015/7/20.
 */
@Controller
@RequestMapping("/app/servmarket")
public class ServMarketController {

    final static String SESSION_CLIENT_AGENT = "CLIENT_AGENT";

    final static String SESSION_PROGRESS_STATUS = "PROGRESS_STATUS";

    @Value("${market.host}")
    private String marketHost = "http://localhost:8082/ServMarket/";

    @Autowired private HttpServletRequest request;

    @Autowired
    @Qualifier("zipAppUploadService")
    private AppUploadService appUploadService;

    /* local */
    @RequestMapping(value = "listinstallapps", method = GET)
    @ResponseBody RequestResult<List<Map>> listInstallApps() {
        return success();
    }

    /* connect to market */

    @RequestMapping(value = "login", method = POST)
    @ResponseBody
    RequestResult<String> login(@RequestParam("id") String id, @RequestParam("password") String password,
                                HttpSession session) {
        String resp = null;
        try {
            System.out.println("===== client:" + marketHost + " =====");
            doLogin(id, password, session);
        } catch (IOException e) {
//            e.printStackTrace();
            return fail(e.getMessage());
        }
        return success(resp);
    }

    @RequestMapping(value = "listapps", method = GET)
    @ResponseBody
    RequestResult<String> listApps(HttpSession session) {
        MarketClientAgent client = (MarketClientAgent) session.getAttribute(SESSION_CLIENT_AGENT);

        String langTag = Cookie.get(request, "lang");
        List params = null;
        params = client.buildParam("lang", langTag, params);

        byte[] bytes;
        String result;
        Gson gson = new Gson();
        try {
            bytes = client.get("/rest/api/market/listapps", params);
            result = new String(bytes, "utf-8");
            Map<String, Object> map = gson.fromJson(result, Map.class);
            Map<String, Object> data = (Map<String, Object>) map.get("data");
            data.put("host", marketHost);
            result = gson.toJson(data);
        } catch (IOException e) {
//            e.printStackTrace();
            return fail(e.getMessage());
        }
        return success(result);
    }

    @RequestMapping(value = "listmyapps", method = GET)
    @ResponseBody
    RequestResult<String> listMyApps(HttpSession session) {
        MarketClientAgent client = (MarketClientAgent) session.getAttribute(SESSION_CLIENT_AGENT);

        String langTag = Cookie.get(request, "lang");
        List params = null;
        params = client.buildParam("lang", langTag, params);

        byte[] bytes;
        String result;
        try {
            bytes = client.get("/rest/api/market/listuserapps", params);
        } catch (IOException e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }
        return success(new String(bytes));
    }

    @RequestMapping(value = "order", method = POST)
    @ResponseBody
    RequestResult<String> order(@RequestParam("appId") String appId,
                                @RequestParam("monthAmount") String monthAmount,
                                @RequestParam("machineAmount") String machineAmount,
                                HttpSession session) {
        MarketClientAgent client = (MarketClientAgent) session.getAttribute(SESSION_CLIENT_AGENT);

        String url = "/rest/api/market/order";
        List params = null;
        params = client.buildParam("appId", appId, params);
        params = client.buildParam("monthAmount", monthAmount, params);
        params = client.buildParam("machineAmount", machineAmount, params);

        byte[] bytes;
        try {
            bytes = client.post(url, params);
        } catch (IOException e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }

        return success(new String(bytes));
    }

    @RequestMapping(value = "listmyorders", method = GET)
    @ResponseBody
    RequestResult<String> listMyOrders(HttpSession session) {
        MarketClientAgent client = (MarketClientAgent) session.getAttribute(SESSION_CLIENT_AGENT);
        byte[] bytes;
        try {
            bytes = client.get("/rest/api/market/listuserorders");
        } catch (IOException e) {
            return fail(e.getMessage());
        }
        return success(new String(bytes));
    }

    @RequestMapping(value = "install", method = GET)
    @ResponseBody
    RequestResult<String> install(@RequestParam("appId") String appId,
                                  @RequestParam("version") String version,
                                  HttpSession session) throws IOException {

        Progress progress = new Progress(100);
        session.setAttribute(SESSION_PROGRESS_STATUS, progress);

        String uploader = (String) request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY);

        MarketClientAgent client = (MarketClientAgent) session.getAttribute(SESSION_CLIENT_AGENT);

        File apRootDir = new File(System.getProperty(SysPropKey.ROOT_PATH));
        File tmpDir = new File(apRootDir, "_tmp");
        File file = new File(tmpDir, appId + ".zip");

        if (!tmpDir.exists()) {
            FileUtils.forceMkdir(tmpDir);
        }

        String url = "/rest/api/market/download";
        List params = null;
        params = client.buildParam("appId", appId, params);
        params = client.buildParam("version", version, params);

        progress.update(10);
//        byte[] bytes;
        try {
            // download file
            file = client.download(url, params, file.getAbsolutePath());
            progress.update(60);
            // install
            appUploadService.setUploader(uploader);
            appUploadService.upload(file);
            progress.update(90);

            if (file.exists()) {
                file.delete();
            }

            progress.update(100);

        } catch (Exception e) {
            e.printStackTrace();
            return fail(e.getMessage());
        }

        return success();
    }

    @RequestMapping(value = "progress", method = GET)
    @ResponseBody
    RequestResult<String> progress(HttpSession session) {
        double result = 0;
        Object obj = session.getAttribute(SESSION_PROGRESS_STATUS);
        if (obj != null) {
            result = ((Progress) obj).getResult();
        }
        return success(String.valueOf(result));
    }


    public static void main(String[] args) throws Throwable {
        MarketClientAgent agent = new ServMarketController().new MarketClientAgent();
        agent.open();
        agent.login("admin", "123");
        System.out.println(new String(agent.get("/rest/api/market/listuserorders")));
        agent.close();
    }

    String doLogin(String id, String password, HttpSession session) throws IOException {
        MarketClientAgent client = null;
        if (session.getAttribute(SESSION_CLIENT_AGENT) == null) {
            client = new MarketClientAgent();
            session.setAttribute(SESSION_CLIENT_AGENT, client);
        } else {
            client = (MarketClientAgent) session.getAttribute(SESSION_CLIENT_AGENT);
        }

        client.open();

        String url = "/rest/api/market/login";
        List params = null;
        params = client.buildParam("id", id, params);
        params = client.buildParam("password", password, params);

        return new String(client.post(url, params));
    }

    class MarketClientAgent {

        HttpClient client;

        HttpClientContext context;


        /* api */

        public void login(String id, String password) {
            String response = null;
            String url = "/rest/api/market/login";
            List params = null;
            params = buildParam("id", id, params);
            params = buildParam("password", password, params);

            try {
                response = new String(post(url, params));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

//        public String listApps() {
//            List list = null;
//            return listApps(list);
//        }

//        public String listApps(String tag) {
//            List<String> tags = new ArrayList<String>();
//            tags.add(tag);
//            return listApps(tags);
//        }

//        public String listApps(List<String> tags) {
//            String response = null;
//            String url = url("/rest/api/market/listapps");
//            List params = null;
//            if (tags != null) {
//                for (String tag : tags) {
//                    params = buildParam("tagId", tag, params);
//                }
//            }
//            try {
//                response = new String(get(url, params));
//            } catch ( IOException ioe ) {
//                ioe.printStackTrace();
//            }
//            return response;
//        }

//        public String listUserApps() {
//            List list = null;
//            return listUserApps(list);
//        }

//        public String listUserApps(String tag) {
//            List<String> tags = new ArrayList<String>();
//            tags.add(tag);
//            return listUserApps(tags);
//        }

//        public String listUserApps(List<String> tags) {
//            String response = null;
//            String url = url("/rest/api/market/listuserapps");
//            List params = null;
//            if (tags != null) {
//                for (String tag : tags) {
//                    params = buildParam("tagId", tag, params);
//                }
//            }
//            try {
//                response = new String(get(url, params));
//            } catch ( IOException ioe ) {
//                ioe.printStackTrace();
//            }
//            return response;
//        }

//        public String listUserOrders() {
//            String response = null;
//            String url = url("/rest/api/market/listuserorders");
//            try {
//                response = new String(get(url));
//            } catch ( IOException ioe ) {
//                ioe.printStackTrace();
//            }
//            return response;
//        }

//        public String order(String appId, String monthAmount, String machineAmount) {
//            String response = null;
//            String url = url("/rest/api/market/order");
//            List params = null;
//            params = buildParam("appId", appId, params);
//            params = buildParam("monthAmount", monthAmount, params);
//            params = buildParam("machineAmount", machineAmount, params);
//            try {
//                response = new String(post(url, params));
//            } catch ( IOException ioe ) {
//                ioe.printStackTrace();
//            }
//            return response;
//        }



        /* kernel */

        public void open() {
            if (client == null) {
                client = HttpClients.createDefault();
                context = HttpClientContext.create();
                context.setCookieStore(new BasicCookieStore());
            }
        }

        public String url(String path) {
            if (marketHost.endsWith("/")) {
                marketHost = marketHost.substring(0, marketHost.length() - 1);
            }
            if (!path.startsWith("/")) {
                path = "/" + path;
            }
            return marketHost + path;
        }

        public byte[] get(String url) throws IOException {
            return get(url, null);
        }

        public byte[] get(String url, List params) throws IOException {
            if (params != null) {
                for (int i = 0; i < params.size(); i++) {
                    NameValuePair nvp = (NameValuePair) params.get(i);
                    url += (url.indexOf("?") == -1 ? "?" : "&") + nvp.getName() + "=" + nvp.getValue();
                }
            }
            url = url(url);
            System.out.println("GET: " + url);
            HttpGet get = new HttpGet(url);
            HttpResponse response = client.execute(get, context);

            return EntityUtils.toByteArray(response.getEntity());
        }

        public byte[] post(String url) throws IOException {
            return post(url, null);
        }

        public byte[] post(String url, List params) throws IOException {
            url = url(url);
            HttpPost post = new HttpPost(url);
            if (params != null) {
                post.setEntity(new UrlEncodedFormEntity(params));
            }

            HttpResponse response = client.execute(post, context);

            return EntityUtils.toByteArray(response.getEntity());
        }

        public File download(String url, List params, String filepath) throws IOException {

            File file = new File(filepath);

            if (params != null) {
                for (int i = 0; i < params.size(); i++) {
                    NameValuePair nvp = (NameValuePair) params.get(i);
                    url += (url.indexOf("?") == -1 ? "?" : "&") + nvp.getName() + "=" + nvp.getValue();
                }
            }
            url = url(url);
            System.out.println("DOWNLOAD: " + url);
            HttpGet get = new HttpGet(url);

            HttpResponse response = client.execute(get, context);
            HttpEntity entity = response.getEntity();

            if (entity != null) {
                InputStream inputStream = entity.getContent();
                OutputStream outputStream = new FileOutputStream(file);

                IOUtils.copy(inputStream, outputStream);
                inputStream.close();
                outputStream.close();
            }
            return file;
        }

        public List buildParam(String key, String value, List list) {
            if (list == null) {
                list = new ArrayList<NameValuePair>();
            }
            list.add(new BasicNameValuePair(key, value));
            return list;
        }

        public void close() {
            if (client != null) {
                HttpClientUtils.closeQuietly(client);
                client = null;
            }
        }
    }

}
