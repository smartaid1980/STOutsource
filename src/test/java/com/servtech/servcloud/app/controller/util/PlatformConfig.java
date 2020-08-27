package com.servtech.servcloud.app.controller.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.servtech.servcloud.core.filter.AuthFilter;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.mock.jndi.SimpleNamingContextBuilder;
import org.springframework.mock.web.MockHttpSession;

import javax.naming.NamingException;
import javax.sql.DataSource;

import static com.servtech.servcloud.core.util.SysPropKey.*;

/**
 * Created by Frank on 2019/5/7.
 */
public class PlatformConfig {
    static public void init() throws NamingException {
        System.setProperty(DB_JNDI_NAME, "java:comp/env/jdbc/servcloud");
        System.setProperty(WEB_ROOT_PATH, "C:\\Servtech\\Servolution\\Platform\\tomcat-8.0.50\\webapps\\");
        System.setProperty(ROOT_PATH, "C:\\Servtech\\Servolution\\Platform\\tomcat-8.0.50\\webapps\\ServCloud\\");
        System.setProperty(CUST_PARAM_PATH, "C:\\Servtech\\Servolution\\Platform\\cust_param\\");

        ClassPathXmlApplicationContext app =new ClassPathXmlApplicationContext("classpath:config/datasource-testcontext.xml");
        DataSource ds =(DataSource) app.getBean("dataSource");
        SimpleNamingContextBuilder builder =new SimpleNamingContextBuilder();
        builder.bind("java:comp/env/jdbc/servcloud", ds);
        builder.activate();
    }

    static public MockHttpSession getMockHttpSession() {
        MockHttpSession mockHttpSession = new MockHttpSession();
        mockHttpSession.setAttribute(AuthFilter.SESSION_LOGIN_KEY,"rd_test");
        return mockHttpSession;
    }

    public static String toPrettyFormat(String jsonString)
    {
        JsonParser parser = new JsonParser();
        JsonObject json = parser.parse(jsonString).getAsJsonObject();

        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        String prettyJson = gson.toJson(json);

        return prettyJson;
    }
}
