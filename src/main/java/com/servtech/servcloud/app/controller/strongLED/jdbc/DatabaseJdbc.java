package com.servtech.servcloud.app.controller.strongLED.jdbc;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DatabaseJdbc {
    private static final Logger log = LoggerFactory.getLogger(DatabaseJdbc.class);

    private Connection conn;

    Properties props = new Properties();
    File file = new File("C:\\Servtech\\Servolution\\Platform\\cust_param\\strongled\\db.properties");

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
            e.printStackTrace();
            isSuccess = false;
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            isSuccess = false;
        } catch (IOException e) {
            e.printStackTrace();
            isSuccess = false;
        } catch (ClassNotFoundException e) {
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
