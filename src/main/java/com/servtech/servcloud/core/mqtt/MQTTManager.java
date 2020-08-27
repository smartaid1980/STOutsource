package com.servtech.servcloud.core.mqtt;

import com.google.common.cache.*;
import com.google.common.collect.Maps;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.Box;
import org.fusesource.hawtbuf.Buffer;
import org.fusesource.hawtbuf.UTF8Buffer;
import org.fusesource.mqtt.client.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.lang.reflect.Type;
import java.net.URISyntaxException;
import java.nio.charset.Charset;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.*;

import static com.servtech.servcloud.core.util.SysPropKey.*;

/**
 * Created by Hubert
 * Datetime: 2015/8/6 上午 09:27
 */
public class MQTTManager {
    private static final Logger log = LoggerFactory.getLogger(MQTTManager.class);

    private static Topic[] topics;
    private static MQTT mqtt;
    private static CallbackConnection mqttConnection;
    private static String deviceStatusTopic;

    private static boolean connected = false;

    private static final String ALARM_ON_MESSAGE = "com.servtech.servcloud.app.controller.aplus.AlarmDiagnosisController";
    private static final boolean USE_DEVICE_STATUS_OBSERVER = true;
    private static int cache_second = getSecondTime();

    /**
     * mqtt 收到的資料會是由 google protobuf 定義的格式轉成的 byte
     * 訊息格式在專案底下的 protobuf/LeanMsg.proto
     * <p>
     * 除此之外，topic 為 sd_ 開頭的是沙丁魚送的
     * 請參造沙丁魚的推送格式
     * <p>
     * 此 cache 外層的 key 是訊息 type
     * 內層的 key 是機台編號
     */
    private static final LoadingCache<String, Cache<String, CacheBean>> cache =
            CacheBuilder.newBuilder()
                    .expireAfterAccess(1, TimeUnit.MINUTES)
                    .build(new CacheLoader<String, Cache<String, CacheBean>>() {
                        @Override
                        public Cache<String, CacheBean> load(String key) throws Exception {
                            return CacheBuilder.newBuilder()
                                    .expireAfterWrite(cache_second, TimeUnit.SECONDS)
                                    .build();
                        }
                    });

    public static int getSecondTime() {
        int second = 10;
        File file = new File(System.getProperty(SysPropKey.CUST_PARAM_PATH), "param/cache_bean.json");
        FileReader fr = null;
        if (file.exists()) {
            try {
                fr = new FileReader(file);
                Map<String, Double> map = new Gson().fromJson(fr, Map.class);
                if (map.get("destroy_second") != null) {
                    second = map.get("destroy_second").intValue();
                }
                fr.close();
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        log.info("CacheBean Destroy Second: " + second);
        return second;
    }

    public static void connect() {
        mqtt = new MQTT();
        buildTopics();

        try {
            mqtt.setHost("tcp://" + System.getProperty(MQTT_IP) + ":" + System.getProperty(MQTT_PORT));
        } catch (URISyntaxException e) {
            log.warn("mqtt host 不能這樣設定: " + "tcp://" + System.getProperty(MQTT_IP) + ":" + System.getProperty(MQTT_PORT), e);
        }
        mqtt.setClientId("ServCloud_" + System.getProperty(SERVCLOUD_ID) + "_" + new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

        mqttConnection = mqtt.callbackConnection();
        mqttConnection.listener(new Listener() {
            @Override
            public void onConnected() {
                connected = true;
                log.info("MQTT 保持連線中...");
            }

            @Override
            public void onDisconnected() {
                connected = false;
                log.warn("MQTT 斷線了...");
            }

            @Override
            public void onPublish(UTF8Buffer topic, Buffer body, Runnable ack) {
                connected = true;

                String topicName = topic.toString();

                try {
                    if (!topicName.startsWith("sd_")) {
                        CacheBean cacheBean = CacheBeanFactory.create(topicName, body.toByteArray());
                        cache.getUnchecked(cacheBean.getType()).put(cacheBean.getMachineId(), cacheBean);
                        log.debug(topicName + " - " + cacheBean.getType() + " - " + cacheBean.getMachineId() + " 入陣，謝主隆恩!!!");

                        //暫時用來做alarm診斷
                        if (USE_DEVICE_STATUS_OBSERVER && cacheBean.getType().equals("DeviceStatus")) {
                            Class<DeviceStatusObserver> clazz = (Class<DeviceStatusObserver>) Class.forName(ALARM_ON_MESSAGE);
                            DeviceStatusObserver deviceStatusObserver = clazz.newInstance();
                            deviceStatusObserver.onMessage(cacheBean);
                        }
                        // 沙丁魚的
                    } else {
                        List<CacheBean> cacheBeans = CacheBeanFactory.createFromSardine(topicName, body.toByteArray());
                        for (CacheBean cacheBean : cacheBeans) {
                            cache.getUnchecked(cacheBean.getType()).put(cacheBean.getMachineId(), cacheBean);
                        }
                        log.debug(topicName + " - " + topicName + " - " + cacheBeans.size() + "筆入陣，謝主隆恩!!!");
                    }


                } catch (Exception e) {
                    log.warn(e.getMessage(), e);

                } finally {
                    ack.run();
                }
            }

            @Override
            public void onFailure(Throwable e) {
                connected = false;

                log.warn("MQTT onFailure...", e);
            }
        });


        mqttConnection.connect(new Callback<Void>() {
            @Override
            public void onSuccess(Void value) {
                connected = true;
                log.info("ActiveMQ MQTT: " + mqtt.getHost() + " - 連線成功!");

                mqttConnection.subscribe(topics, new Callback<byte[]>() {
                    @Override
                    public void onSuccess(byte[] value) {
                        log.info(mqtt.getHost() + " 訂閱成功!");
                        for (Topic topic : topics) {
                            log.info("Topic: " + topic.name().toString() + " - " + topic.qos().toString());
                        }
                    }

                    @Override
                    public void onFailure(Throwable e) {
                        log.warn(mqtt.getHost() + " 訂閱失敗!", e);
                    }
                });
            }

            @Override
            public void onFailure(Throwable e) {
                connected = false;
                log.warn("ActiveMQ MQTT: " + mqtt.getHost() + " - 連線失敗!", e);
            }
        });

    }

    public static void reconnect() {
        mqttConnection.disconnect(new Callback<Void>() {
            @Override
            public void onSuccess(Void value) {
                log.info("ActiveMQ MQTT: " + mqtt.getHost() + " 斷線成功!");
                connect();
            }

            @Override
            public void onFailure(Throwable e) {
                log.warn("ActiveMQ MQTT: " + mqtt.getHost() + " - 斷線失敗!", e);
                connect();
            }
        });

    }

    public static void disconnect() {
        mqttConnection.disconnect(new Callback<Void>() {
            @Override
            public void onSuccess(Void value) {
                log.info("ActiveMQ MQTT: " + mqtt.getHost() + " 斷線成功!");
            }

            @Override
            public void onFailure(Throwable e) {
                log.warn("ActiveMQ MQTT: " + mqtt.getHost() + " - 斷線失敗!", e);
            }
        });
    }

    public static boolean isConnected() {
        return connected;
    }

    public static String getDeviceStatusTopic() {
        return deviceStatusTopic;
    }

    public static Map<String, Map<String, CacheBean>> get(final Map<String, List<String>> typeMapMachines) {
        return Maps.transformEntries(typeMapMachines, new Maps.EntryTransformer<String, List<String>, Map<String, CacheBean>>() {
            @Override
            public Map<String, CacheBean> transformEntry(String type, List<String> machines) {
                Cache<String, CacheBean> machineCache = cache.getIfPresent(type);
                if (machineCache == null) {
                    return Collections.EMPTY_MAP;
                }
                return machineCache.getAllPresent(machines);
            }
        });
    }

    private static void buildTopics() {
        final String platformId = System.getProperty(SERVCLOUD_ID);

        // ServCloudId_ServBoxId
        List<Topic> newTopics = ActiveJdbc.oper(new Operation<List<Topic>>() {
            @Override
            public List<Topic> operate() {
                List<String> boxIds = Box.findAll().collect("box_id");

                List<Topic> result = new ArrayList<Topic>();
                for (String boxId : boxIds) {
                    String topicName = platformId + "_" + boxId;
                    result.add(new Topic(topicName, QoS.AT_MOST_ONCE));
                }
                return result;
            }
        });
        if (!newTopics.isEmpty()) {
            deviceStatusTopic = newTopics.get(0).name().toString();
        }

        // mqtt_topics.json 中的
        newTopics.addAll(customizeMqttTopics("mqtt_topics.json"));

        // 沙丁魚的
        newTopics.addAll(customizeMqttTopics("sardine_topics.json"));

        // 更新
        topics = new Topic[newTopics.size()];
        newTopics.toArray(topics);
    }

    public static List<Topic> customizeMqttTopics(String fileName) {
        List<Topic> result = new ArrayList<Topic>();

        FileReader reader = null;
        try {
            reader = new FileReader(new File(System.getProperty(CUST_PARAM_PATH), "param/" + fileName));
            Gson gson = new Gson();
            Type type = new TypeToken<List<String>>() {
            }.getType();
            List<String> formatTopics = gson.fromJson(reader, type);

            for (String formatTopic : formatTopics) {
                result.add(new Topic(formatTopic, QoS.AT_MOST_ONCE));
            }

        } catch (Exception e) {
            log.warn("cust_param/param/" + fileName + " 讀取有問題...", e);

        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        return result;
    }

    public static boolean publish(String payload, String topic) {
        MQTT mqtt = new MQTT();

        try {
            mqtt.setHost("tcp://" + System.getProperty(MQTT_IP) + ":" + System.getProperty(MQTT_PORT));
        } catch (URISyntaxException e) {
            log.warn("mqtt host 不能這樣設定: " + "tcp://" + System.getProperty(MQTT_IP)
                    + ":" + System.getProperty(MQTT_PORT), e);
        }
        mqtt.setClientId("ServCloud_Publisher_" + System.getProperty(SERVCLOUD_ID)
                + "_" + new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

        CallbackConnection conn = mqtt.callbackConnection();

        conn.connect(new Callback<Void>() {
            @Override
            public void onSuccess(Void value) {
                log.info("ActiveMQ MQTT: " + mqtt.getHost() + "ServCloud_Publisher_ - 連線成功!");
            }

            @Override
            public void onFailure(Throwable e) {
                connected = false;
                log.warn("ActiveMQ MQTT: " + mqtt.getHost() + "ServCloud_Publisher_ - 連線失敗!", e);
            }
        });
        conn.publish(topic, payload.getBytes(Charset.forName("utf-8")), QoS.AT_MOST_ONCE, false, new Callback<Void>() {
            @Override
            public void onSuccess(Void value) {
                log.info("publish success");
                conn.disconnect(new Callback<Void>(){

                    @Override
                    public void onSuccess(Void value) {
                        log.info("kill success");
                    }

                    @Override
                    public void onFailure(Throwable value) {
                        log.info("kill success");
                    }
                });
            }
            @Override
            public void onFailure(Throwable value) {
                log.info("publish fail");
                conn.disconnect(new Callback<Void>(){

                    @Override
                    public void onSuccess(Void value) {
                        log.info("kill success");
                    }

                    @Override
                    public void onFailure(Throwable value) {
                        log.info("kill success");
                    }
                });

            }
        });

        return true;
    }
}
