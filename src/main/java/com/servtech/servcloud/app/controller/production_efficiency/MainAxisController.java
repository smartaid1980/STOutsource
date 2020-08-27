package com.servtech.servcloud.app.controller.production_efficiency;

import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.filter.AuthFilter;
import com.servtech.servcloud.core.util.RequestResult;
import org.fusesource.mqtt.client.BlockingConnection;
import org.fusesource.mqtt.client.MQTT;
import org.fusesource.mqtt.client.QoS;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.net.URISyntaxException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

import static com.servtech.servcloud.core.util.RequestResult.fail;
import static com.servtech.servcloud.core.util.RequestResult.success;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

/**
 * Created by Raynard on 2016/7/29.
 */

@RestController
@RequestMapping("/productionefficiency/mainaxis")
public class MainAxisController {

    private final Logger logger = LoggerFactory.getLogger(MainAxisController.class);

    @Autowired
    private HttpServletRequest request;
    @Autowired
    private HttpServletResponse response;

    @RequestMapping(value = "/test", method = POST)
    public RequestResult<String> test() {
        try {
//            String topicName ="C:/platform_server/tomcat-6.0.37/webapps/platform_trial";
            String topicName = "mainAxisMessage";
            MQTT mqtt = new MQTT();
            mqtt.setHost("mobile.servtech.com.tw",1883);
            mqtt.setClientId(topicName + new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date()));
            BlockingConnection connection = mqtt.blockingConnection();
            connection.connect();
            String pushResult = "Axis Error Test!";
            connection.publish(topicName, pushResult.getBytes(), QoS.AT_MOST_ONCE, false);


        } catch (URISyntaxException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return  success("ok");
    }


}
