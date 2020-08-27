package com.servtech.servcloud.core.initializer;

import com.servtech.servcloud.core.util.Language;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

/**
 * Created by Hubert
 * Datetime: 2015/7/10 下午 01:31
 */
public class LanguageInitializer implements ServletContextListener {
    private Logger logger = LoggerFactory.getLogger(LanguageInitializer.class);

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        logger.info(Language.eachLangCount());
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
    }

}
