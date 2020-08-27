package com.servtech.servcloud.core.db;

import com.servtech.servcloud.core.util.SysPropKey;
import org.javalite.activejdbc.Base;
import org.javalite.activejdbc.DBException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by Hubert
 * Datetime: 2015/7/6 下午 15:06
 */
public class ActiveJdbc {
    private static final Logger logger = LoggerFactory.getLogger(ActiveJdbc.class);

    public static final String jndiName;
    public static final String defaultTag = "default";

    static {
        jndiName = System.getProperty(SysPropKey.DB_JNDI_NAME);
    }

    public static void testConnect() {
        Base.open(jndiName);
        try {
            if (!Base.hasConnection()) {
                throw new RuntimeException("資料庫根本沒連線成功!");
            }
        } finally {
            try {
                Base.close();
            } catch (DBException e) {

            }
        }
    }

    public static <T> T oper(Operation<T> operation) {
        return oper(operation, defaultTag);
    }

    public static <T> T oper(Operation<T> operation, String tag) {
        Base.open(jndiName);
        logger.debug(tag + ": DB連線完成");
        try {
            T result = operation.operate();
            logger.debug(tag + ": DB操作成功");
            return result;
        } catch (DBException e) {
            logger.warn(tag + ": DB操作時發生例外(" + e.getMessage() + ")");
            throw e;
        } finally {
            Base.close();
        }
    }

    public static <T> T operTx(Operation<T> operation) {
        return operTx(operation, defaultTag);
    }

    public static <T> T operTx(Operation<T> operation, String tag) {
        Base.open(jndiName);
        logger.debug(tag + ": DB連線完成");
        Base.openTransaction();
        try {
            T result = operation.operate();
            Base.commitTransaction();
            logger.debug(tag + ": DB交易成功");
            return result;
        } catch (Exception e) {
            Base.rollbackTransaction();
            logger.warn(tag + ": DB交易時發生例外(" + e.getMessage() + ")");
            throw new RuntimeException(e);
        } finally {
            Base.close();
        }
    }

    public static <T> T operInformationSchema(Operation<T> operation) {
        Base.open("com.mysql.jdbc.Driver", "jdbc:mysql://localhost:53306/information_schema", "root", "servtechpwd");
        Base.openTransaction();
        try {
            T result = operation.operate();
            Base.commitTransaction();
            return result;
        } catch (Exception e) {
            Base.rollbackTransaction();
            throw new RuntimeException(e);
        } finally {
            Base.close();
        }

    }
}
