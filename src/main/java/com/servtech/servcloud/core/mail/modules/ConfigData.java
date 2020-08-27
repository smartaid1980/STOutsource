package com.servtech.servcloud.core.mail.modules;

/**
 * Created by Eric Peng on 2018/10/26.
 */
public class ConfigData {
    public String username;
    public String password;
    public String content;
    public String acceptMail;
    public String subject;
    public String templatePath;
    public String parseType = "parseType";
    public String host = "";
    public String port = "";

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getPort() {
        return port;
    }

    public void setPort(String port) {
        this.port = port;
    }

    public ConfigData(String username, String password, String acceptMail, String subject, String templatePath) {
        this.username = username;
        this.password = password;
        this.acceptMail = acceptMail;
        this.subject = subject;
        this.templatePath = templatePath;
    }

    @Override
    public String toString() {
        if(port.equals("") && host.equals("")){
            return String.format("%s\" \"%s\" \"%s\" \"%s\" \"%s\" \"%s\" \"%s",
                    username,
                    password,
                    content,
                    acceptMail,
                    subject,
                    templatePath,
                    parseType
            );
        }
        return String.format("%s\" \"%s\" \"%s\" \"%s\" \"%s\" \"%s\" \"%s\" \"%s\" \"%s",
                username,
                password,
                content,
                acceptMail,
                subject,
                templatePath,
                parseType,
                host,
                port
        );
    }
}
