package com.servtech.servcloud.module.service.sql;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

import static com.servtech.servcloud.core.util.SysPropKey.CUST_PARAM_PATH;

public class DatabaseJdbc {
    private static final Logger log = LoggerFactory.getLogger(DatabaseJdbc.class);

    private Connection conn;

    Properties props = new Properties();
    File file = new File(System.getProperty(CUST_PARAM_PATH), "otherSql/db.properties");

    public boolean connection() {
        boolean isSuccess = true;
        try {
            props.load(new FileInputStream(file));
            String driver = props.getProperty("SQL_DRIVER");
            String jdbc = props.getProperty("SQL_JDBC");
            String dbName = "databaseName=" + props.getProperty("SQL_DB");
            String connUrl = jdbc + ";" + dbName;
            String user = props.getProperty("SQL_USER");
            String password = props.getProperty("SQL_PASS");

            Class.forName(driver);
            conn = DriverManager.getConnection(connUrl, user, password);

        } catch (SQLException e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            log.error(sw.toString());
            e.printStackTrace();
            isSuccess = false;
        } catch (FileNotFoundException e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            log.error(sw.toString());
            e.printStackTrace();
            isSuccess = false;
        } catch (IOException e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            log.error(sw.toString());
            e.printStackTrace();
            isSuccess = false;
        } catch (ClassNotFoundException e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            log.error(sw.toString());
            e.printStackTrace();
            isSuccess = false;
        }
        return isSuccess;
    }

    public void close() {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    public Connection getConn() {
        return conn;
    }
}
