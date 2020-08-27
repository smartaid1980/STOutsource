package com.servtech.servcloud.core.initializer;

import com.servtech.servcloud.core.db.ActiveJdbc;
import org.javalite.activejdbc.DBException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

/**
 * Created by Hubert
 * Datetime: 2015/7/6 下午 15:02
 */
public class DatabaseInitializer implements ServletContextListener {
    private Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        try {
            ActiveJdbc.testConnect();
            logger.info("資料庫連線成功!");
        } catch (DBException e) {
            logger.warn("資料庫連線有問題 - " + e.getMessage(), e);
        } catch (Exception e) {
            logger.warn(e.getMessage(), e);
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
    }
}
