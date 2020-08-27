package com.servtech.servcloud.core.util;

import com.servtech.servcloud.core.exception.LeanConfigException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.*;
import java.io.File;
import java.io.IOException;

/**
 * Created by Hubert
 * Datetime: 2015/7/15 上午 09:38
 */
public class LeanConfigParam {
    private static final Logger log = LoggerFactory.getLogger(LeanConfigParam.class);

    public static LeanConfig getLeanConfig() throws LeanConfigException {
        File file = getFile();
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        try {
            DocumentBuilder db = dbf.newDocumentBuilder();
            Document doc = db.parse(file);
            XPathFactory xPathfactory = XPathFactory.newInstance();
            XPath xpath = xPathfactory.newXPath();
            XPathExpression leanIdXPath = xpath.compile("/lean/mainLean/id/text()");
            XPathExpression mqttIpXPath = xpath.compile("/lean/mainLean/ip/text()");
            XPathExpression mqttPortXPath = xpath.compile("/lean/mainLean/port/text()");

            return new LeanConfig(leanIdXPath.evaluate(doc), mqttIpXPath.evaluate(doc), mqttPortXPath.evaluate(doc));

        } catch (ParserConfigurationException e) {
            log.warn("leanConfig.xml 檔案讀取錯誤...", e);
            throw new LeanConfigException(e.getMessage());

        } catch (SAXException e) {
            log.warn("leanConfig.xml 檔案讀取錯誤...", e);
            throw new LeanConfigException(e.getMessage());

        } catch (IOException e) {
            log.warn("leanConfig.xml 檔案讀取錯誤...", e);
            throw new LeanConfigException(e.getMessage());

        } catch (XPathExpressionException e) {
            log.warn("leanConfig.xml 檔案讀取錯誤...", e);
            throw new LeanConfigException(e.getMessage());
        }

    }

    public static File getFile() {
        return new File(System.getProperty(SysPropKey.ROOT_PATH), "WEB-INF/classes/META-INF/core/config/leanConfig.xml");
    }

    public static class LeanConfig {
        public final String id;
        public final String ip;
        public final String port;

        LeanConfig(String id, String ip, String port) {
            this.id = id;
            this.ip = ip;
            this.port = port;
        }
    }

}
