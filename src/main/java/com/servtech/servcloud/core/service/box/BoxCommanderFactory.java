package com.servtech.servcloud.core.service.box;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.googlecode.protobuf.format.JsonFormat;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.mqtt.PBLean;
import com.servtech.servcloud.core.util.SysPropKey;
import com.servtech.servcloud.module.model.Box;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.net.Socket;
import java.util.List;

/**
 * Created by Hubert
 * Datetime: 2016/6/30 下午 02:41
 */
public class BoxCommanderFactory {

    private static final Logger log = LoggerFactory.getLogger(BoxCommanderFactory.class);

    public static final BoxCommander v1_0() {
        return new DefaultBoxCommander("v1.0");
    }

    private static class DefaultBoxCommander implements BoxCommander {
        private String version;
        private Box box;
        private String platformId = System.getProperty(SysPropKey.SERVCLOUD_ID);

        public DefaultBoxCommander(String version) {
            this.version = version;
            this.box = ActiveJdbc.oper(new Operation<Box>() {
                @Override
                public Box operate() {
                    List<Box> boxList = Box.findAll();
                    if (!boxList.isEmpty()) {
                        return boxList.get(0);
                    }
                    throw new RuntimeException("資料庫中連一個 box 都沒有哦，呵呵嘻嘻哈哈哈！");
                }
            });
        }

        @Override
        public String send(Type sendType, Type[] repliesType, String machineId, String jsonCommand) {

            String failMsg = "";
            String boxId = this.box.get("box_id").toString();

            StringBuilder repliesJsonBuilder = new StringBuilder("[");
            String comma = "";
            for (Type type : repliesType) {
                repliesJsonBuilder
                        .append(comma)
                        .append("{")
                        .append("\"type\":\"").append(type.toString()).append("\",")
                        .append("\"reply\":\"").append(this.platformId).append("_").append(boxId).append("\"")
                        .append("}");
                comma = ",";
            }
            repliesJsonBuilder.append("]");

            String protoBufJson = "{" +
                    "\n  \"version\":\"" + this.version + "\"" +
                    ",\n  \"from\":\"" + this.platformId + "_" + boxId + "\"" +
                    ",\n  \"to\":\"" + boxId + "\"" +
                    ",\n  \"type\":\"" + sendType.toString() + "\"" +
                    (repliesJsonBuilder.length() == 2 ? "" : ",\n  \"replies\":" + repliesJsonBuilder.toString()) +
                    ",\n  \"machine\":\"" + machineId + "\"" +
                    (jsonCommand == null || jsonCommand.isEmpty() ? "" : ",\n  \"command\":" + jsonCommand) +
                    "\n}";

            PBLean.PBLeanMsg.Builder pbLeanMsgBuilder = PBLean.PBLeanMsg.newBuilder();
            try {
                JsonFormat.merge(protoBufJson, pbLeanMsgBuilder);
            } catch (JsonFormat.ParseException e) {
                log.debug("===================================");
                log.debug(protoBufJson);
                log.debug("===================================");

                failMsg = "BoxCommander format protobuf error...";
                log.warn(this.toString() + " " + failMsg, e);

                return failMsg;
            }

            try {
                String boxIp = box.get("ip").toString();
                int boxPort = Integer.parseInt(box.get("port").toString());
                byte[] msgBytes = pbLeanMsgBuilder.build().toByteArray();

                log.info("BoxCommander send " + boxIp + ":" + boxPort + " - " + sendType.toString() + " - " + machineId);
                sendBySocket(boxIp, boxPort, msgBytes);

            } catch (IOException e) {

                failMsg = "BoxCommander socket send error...";
                log.warn(this.toString() + " " + failMsg, e);

                return failMsg;
            }

            return failMsg;
        }

        private static void sendBySocket(String ip, int port, byte[] byteArray) throws IOException {
            Socket socket = null;
            try {
                socket = new Socket(ip, port);
                OutputStream out = socket.getOutputStream();
                out.write(byteArray);
                out.flush();
            } finally {
                if (socket != null) {
                    try {
                        socket.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }

        @Override
        public String toString() {
            return "["+ version + ", " + box.get("box_id") + "/" + box.get("ip") + ":" + box.get("port") + ", " + platformId + "]";
        }
    }

    public static void main(String[] args) throws IOException {
        String pb = Files.toString(new File("C:/Users/hubertlu/Desktop/pb.json"), Charsets.UTF_8);

        PBLean.PBLeanMsg.Builder pbLeanMsgBuilder = PBLean.PBLeanMsg.newBuilder();
        JsonFormat.merge(pb, pbLeanMsgBuilder);

        PBLean.PBLeanMsg msg = pbLeanMsgBuilder.build();
        System.out.println(msg.getVersion());
        System.out.println(msg.getType());
        System.out.println(msg.getFrom());
        System.out.println(msg.getTo());
        System.out.println(msg.getCommand().getName());

        System.out.println(JsonFormat.printToString(msg));

        DefaultBoxCommander.sendBySocket("192.168.1.214", 52009, msg.toByteArray());
    }
}
