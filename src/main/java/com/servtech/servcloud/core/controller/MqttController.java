package com.servtech.servcloud.core.controller;

import com.google.common.base.Function;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.mqtt.CacheBean;
import com.servtech.servcloud.core.mqtt.MQTTManager;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.model.Box;
import org.fusesource.mqtt.client.QoS;
import org.fusesource.mqtt.client.Topic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.servtech.servcloud.core.util.SysPropKey.SERVCLOUD_ID;

/**
 * Created by Hubert
 * Datetime: 2015/8/6 上午 10:57
 */
@RestController
@RequestMapping("/mqttpool")
public class MqttController {
    private static final Logger log = LoggerFactory.getLogger(MqttController.class);

    @RequestMapping(value = "/data", method = RequestMethod.POST)
    public RequestResult<Map<String, Map<String, String>>> data(@RequestBody Map<String, List<String>> types) {

        Map<String, Map<String, String>> result =
            Maps.transformValues(MQTTManager.get(types), new Function<Map<String, CacheBean>, Map<String, String>>() {
                @Override
                public Map<String, String> apply(Map<String, CacheBean> boxMessageGroupByMachine) {
                return Maps.transformValues(boxMessageGroupByMachine, new Function<CacheBean, String>() {
                    @Override
                    public String apply(CacheBean cacheBean) {
                    return cacheBean.asJson();
                    }
                });
                }
            });
        return RequestResult.success(result);
    }

    @RequestMapping(value = "/reconnect")
    public RequestResult<Void> reconnect() {
        MQTTManager.reconnect();
        return RequestResult.success();
    }

    @RequestMapping(value = "/connected")
    public RequestResult<Void> isConnected() {
        if (MQTTManager.isConnected()) {
            return RequestResult.success();
        }
        return RequestResult.fail(null);
    }

    @RequestMapping(value = "/protobufTopic")
    public RequestResult<String> protobufTopic() {
        final String platformId = System.getProperty(SERVCLOUD_ID);

        return ActiveJdbc.oper(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                List<String> boxIds = Box.findAll().collect("box_id");

                List<Topic> result = new ArrayList<Topic>();
                for (String boxId : boxIds) {
                    String topicName = platformId + "_" + boxId;
                    return RequestResult.success(topicName);
                }
                return RequestResult.fail("There is no box id in database...");
            }
        });
    }

    @RequestMapping(value = "/topics")
    public RequestResult<List<String>> topics() {
        List<Topic> mqttTopics = MQTTManager.customizeMqttTopics("mqtt_topics.json");
        List<Topic> sardineTopics = MQTTManager.customizeMqttTopics("sardine_topics.json");
        List<String> result = new ArrayList<String>();

        result.addAll(Lists.transform(mqttTopics, new Function<Topic, String>() {
            @Override
            public String apply(Topic topic) {
                return topic.name().toString();
            }
        }));
        result.addAll(Lists.transform(sardineTopics, new Function<Topic, String>() {
            @Override
            public String apply(Topic topic) {
                return topic.name().toString();
            }
        }));

        return RequestResult.success(result);
    }
}
