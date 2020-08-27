package com.servtech.servcloud.app.controller.dashboard;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.Cookie;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.core.util.Util;
import com.servtech.servcloud.module.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.Writer;
import java.lang.reflect.Type;
import java.util.*;

/**
 * Created by Hubert
 * Datetime: 2016/4/13 下午 06:16
 */
@RestController
@RequestMapping("/dashboard")
public class DashBoardController {
    private static final Logger log = LoggerFactory.getLogger(DashBoardController.class);
    public static final String VIEW_HTML = "view.html";
    public static final String PARAMETER_JSON = "parameter.json";
    public static final String DIRECTOR_JS = "director.js";

    @Autowired
    private HttpServletRequest request;

    @RequestMapping(value = "/getAuthWidgetView", method = RequestMethod.GET)
    public RequestResult<?> getAuthWidgetView() {
        DashboardList appIdDashboardIdSet = getAppIdAndDashboardId();
        Set<String> appIdSet = getUserAuthAppId();

        List<WidgetView> result = new ArrayList<WidgetView>();
        if (appIdDashboardIdSet.exists) {
            if (appIdDashboardIdSet.data != null) {
                for (AppDashboard appDashboard : appIdDashboardIdSet.data) {
                    List<WidgetView> widgetViewsByApp = getAppWidgetViews(appDashboard.appId, appDashboard.dashboardId);
                    if (widgetViewsByApp != null) {
                        result.addAll(widgetViewsByApp);
                    }
                }
            } else {
                return RequestResult.fail("無輪播看板資料，請先綁定輪播看板權限或群組");
            }
        } else {
            for (Object appId : appIdSet) {
                List<WidgetView> widgetViewsByApp = getAppWidgetViews(appId.toString(), null);
                if (widgetViewsByApp != null) {
                    result.addAll(widgetViewsByApp);
                }
            }
        }
        return RequestResult.success(result);
    }

    @RequestMapping(value = "/getDirectorFunction", method = RequestMethod.GET)
    public void getDirectorFunction(HttpServletResponse response) throws IOException {
        Map<String, String> directorJsMap = ActiveJdbc.oper(new Operation<Map<String, String>>() {
            @Override
            public Map<String, String> operate() {
                Set appIdSet = SysAuthFunc.findAll().collectDistinct("app_id");
                Map<String, String> result = new LinkedHashMap<String, String>();
                for (Object appId : appIdSet) {
                    putDirectorsIntoMap(appId.toString(), result);
                }
                return result;
            }
        });

        StringBuilder sb = new StringBuilder("window.dashboardDirectors = {");
        String comma = "";
        String changeLine = System.getProperty("line.separator");
        for (Map.Entry<String, String> entry : directorJsMap.entrySet()) {
            sb.append(comma).append(changeLine)
                    .append(entry.getKey()).append(":").append(entry.getValue());
            comma = ",";
        }
        sb.append(changeLine).append("};");

        response.setContentType("application/javascript");
        Writer writer = response.getWriter();
        writer.write(sb.toString());
        writer.close();
    }

    private Set<String> getUserAuthAppId() {
        return ActiveJdbc.oper(new Operation<Set<String>>() {
            @Override
            public Set<String> operate() {
                SysUser sysUser = SysUser.findById(request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));

                List<SysGroup> sysGroupList = sysUser.getAll(SysGroup.class);

                Set<String> sysAuthIdSet = new HashSet<String>();

                for (SysGroup sysGroup : sysGroupList) {
                    sysAuthIdSet.addAll(sysGroup.getAll(SysAuth.class).collect("auth_id"));
                }

                String query = "auth_id IN (" + Util.strSplitBy("?", ",", sysAuthIdSet.size()) + ")";

                return SysAuthFunc.find(query, sysAuthIdSet.toArray(new Object[sysAuthIdSet.size()])).collectDistinct("app_id");
            }
        });
    }

    private DashboardList getAppIdAndDashboardId() {
        return ActiveJdbc.oper(new Operation<DashboardList>() {
            @Override
            public DashboardList operate() {
                DashboardList dashboardListData = new DashboardList();
                SysUser sysUser = SysUser.findById(request.getSession().getAttribute(AuthFilter.SESSION_LOGIN_KEY));

                try {
                    List<SysDGroup> sysDGroupList = sysUser.getAll(SysDGroup.class);

                    Set<String> sysDAuthIdSet = new HashSet<String>();
                    List<AppDashboard> appIdDashboardSet = new ArrayList<AppDashboard>();

                    for (SysDGroup sysDGroup : sysDGroupList) {
                        sysDAuthIdSet.addAll(sysDGroup.getAll(SysDAuth.class).collect("d_auth_id"));
                    }
                    if (sysDAuthIdSet.size() > 0) {
                        String query = "SELECT DISTINCT app_id, dashboard_id FROM m_sys_d_auth_dashboard WHERE d_auth_id IN (" + Util.strSplitBy("?", ",", sysDAuthIdSet.size()) + ") ORDER BY app_id ASC, dashboard_id ASC";
                        List<SysDAuthDashboard> sysDAuthDashboards = SysDAuthDashboard.findBySQL(query, sysDAuthIdSet.toArray(new Object[sysDAuthIdSet.size()]));
                        for (SysDAuthDashboard sysDAuthDashboard : sysDAuthDashboards) {
                            System.out.println(sysDAuthDashboard.get("app_id").toString() + "    " + sysDAuthDashboard.get("dashboard_id").toString());
                            AppDashboard appDashboard = new AppDashboard();
                            appDashboard.appId = sysDAuthDashboard.get("app_id").toString();
                            appDashboard.dashboardId = sysDAuthDashboard.get("dashboard_id").toString();
                            appIdDashboardSet.add(appDashboard);
                        }
                        dashboardListData.data = appIdDashboardSet;
                    }
                } catch (Exception e) {
                    dashboardListData.exists = false;
                    log.warn(e.getMessage());
                }
                return dashboardListData;
            }
        });
    }

    private List<WidgetView> getAppWidgetViews(String appId, String dashboardId) {
        File dashboardDir = new File(System.getProperty(SysPropKey.ROOT_PATH), "app/" + appId + "/dashboard");
        Type parameterType = new TypeToken<Map<String, Object>>() {
        }.getType();
        String langTag = Cookie.get(request, "lang");

        if (dashboardDir.exists()) {
            List<WidgetView> result = new ArrayList<WidgetView>();
            if (dashboardId != null) {
                File widgetDir = new File(dashboardDir, dashboardId);
                if (!widgetDir.isDirectory()) {
                    log.warn(appId + "/dashboard directory cannot include file...");
                    return null;
                }

                File viewFile = new File(widgetDir, langTag + "/" + VIEW_HTML);
                File parameterFile = new File(widgetDir, langTag + "/" + PARAMETER_JSON);
                WidgetView widgetView = new WidgetView();

                if (viewFile.exists() && parameterFile.exists()) {
                    try {
                        widgetView.parameter = new Gson().fromJson(Files.toString(parameterFile, Charsets.UTF_8), parameterType);
                        widgetView.parameter.put("appId", appId);
                        widgetView.parameter.put("widgetId", getWidgetId(appId, widgetDir.getName()));
                        if (dashboardId != null) {
                            widgetView.parameter.put("dashboardId", dashboardId);
                        }
                    } catch (JsonSyntaxException e) {
                        log.warn(appId + " parameter.json have json syntax problem.");
                    } catch (IOException e) {
                        log.warn(appId + " parameter.json have something problem.");
                    }

                    try {
                        widgetView.view = Files.toString(viewFile, Charsets.UTF_8);
                    } catch (IOException e) {
                        log.warn(appId + " view.html have something problem.");
                    }
                    result.add(widgetView);
                } else {
                    log.warn(appId + " - " + widgetDir.getName() + " must have \"view.html\", \"parameter.json\" and \"director.js\"");
                }
                return result;
            } else {
                File[] widgets = dashboardDir.listFiles();
                if (widgets != null) {
                    for (File widgetDir : widgets) {
                        if (!widgetDir.isDirectory()) {
                            log.warn(appId + "/dashboard directory cannot include file...");
                            return null;
                        }

                        File viewFile = new File(widgetDir, langTag + "/" + VIEW_HTML);
                        File parameterFile = new File(widgetDir, langTag + "/" + PARAMETER_JSON);
                        WidgetView widgetView = new WidgetView();

                        if (viewFile.exists() && parameterFile.exists()) {
                            try {
                                widgetView.parameter = new Gson().fromJson(Files.toString(parameterFile, Charsets.UTF_8), parameterType);
                                widgetView.parameter.put("appId", appId);
                                widgetView.parameter.put("widgetId", getWidgetId(appId, widgetDir.getName()));
                            } catch (JsonSyntaxException e) {
                                log.warn(appId + " parameter.json have json syntax problem.");
                                continue;
                            } catch (IOException e) {
                                log.warn(appId + " parameter.json have something problem.");
                                continue;
                            }

                            try {
                                widgetView.view = Files.toString(viewFile, Charsets.UTF_8);
                            } catch (IOException e) {
                                log.warn(appId + " view.html have something problem.");
                                continue;
                            }
                            result.add(widgetView);
                        } else {
                            log.warn(appId + " - " + widgetDir.getName() + " must have \"view.html\", \"parameter.json\" and \"director.js\"");
                        }
                    }

                    return result;
                } else {
                    return null;
                }
            }
        } else {
            return null;
        }
    }

    private void putDirectorsIntoMap(String appId, Map<String, String> directorsMap) {
        String langTag = Cookie.get(request, "lang");

        File dashboardDir = new File(System.getProperty(SysPropKey.ROOT_PATH), "app/" + appId + "/dashboard");
        if (dashboardDir.exists()) {
            File[] widgets = dashboardDir.listFiles();
            if (widgets != null) {
                for (File widgetDir : widgets) {
                    if (!widgetDir.isDirectory()) {
                        log.warn(appId + "/dashboard directory cannot include file...");
                        break;
                    }

                    File directorJsFile = new File(widgetDir, langTag + "/" + DIRECTOR_JS);
                    String key = getWidgetId(appId, widgetDir.getName());
                    if (directorJsFile.exists()) {
                        try {
                            directorsMap.put(key, Files.toString(directorJsFile, Charsets.UTF_8));
                        } catch (IOException e) {
                            log.warn(appId + " director.js read error: " + e.getMessage(), e);
                        }
                    } else {
                        log.warn(appId + " - " + widgetDir.getName() + " must have \"director.js\"");
                    }
                }
            }
        }
    }

    private String getWidgetId(String appId, String dirName) {
        return appId + "_" + dirName;
    }

    public static class WidgetView {
        Map<String, Object> parameter;
        String view;
    }

    public static class AppDashboard {
        String appId;
        String dashboardId;
    }

    public static class DashboardList {
        boolean exists = true;
        List<AppDashboard> data;
    }
}
