package com.servtech.servcloud.tank.initializer;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.servtech.servcloud.core.util.SysPropKey;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.io.File;
import java.io.IOException;

/**
 * Created by hubertlu on 2017/3/20.
 */
public class RoleInitializer implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        File file = new File(System.getProperty(SysPropKey.CUST_PARAM_PATH), "serv_tank/role.txt");
        if (file.exists()) {
            try {
                String role = Files.toString(file, Charsets.UTF_8);
                if (role.toLowerCase().equals("tank")) {
                    System.setProperty(SysPropKey.SERVTANK_IS_TANK, "true");
                    return;
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        System.setProperty(SysPropKey.SERVTANK_IS_TANK, "false");
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        System.clearProperty(SysPropKey.SERVTANK_IS_TANK);
    }
}
