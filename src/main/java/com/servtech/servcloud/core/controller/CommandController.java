package com.servtech.servcloud.core.controller;

import com.google.protobuf.Message;
import com.googlecode.protobuf.format.JsonFormat;
import com.servtech.servcloud.core.db.ActiveJdbc;
import com.servtech.servcloud.core.db.Operation;
import com.servtech.servcloud.core.mqtt.PBLean;
import com.servtech.servcloud.core.mqtt.PBLean.PBLeanMsg;
import com.servtech.servcloud.core.service.box.BoxCommanderFactory;
import com.servtech.servcloud.core.service.box.Type;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.module.model.Box;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.OutputStream;
import java.net.Socket;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import static com.servtech.servcloud.core.util.SysPropKey.LICENSE_DATE;
import static com.servtech.servcloud.core.util.SysPropKey.SERVCLOUD_ID;

/**
 * Created by Kevin Big Big on 2015/9/30.
 */
@RestController
@RequestMapping("/command")
public class CommandController {
    private static final Logger logger = LoggerFactory.getLogger(CommandController.class);
    private static final int BYTE_BUF_SIZE = 4096;

    //停止監控命令
    @RequestMapping(value = "/stop", method = RequestMethod.POST)
    public RequestResult<String> stop(@RequestParam(value="boxId") final String boxId,
                                      @RequestParam(value="machineId") final String machineId) {
        logger.info("stop command....");
        final String PLATFORM_ID = System.getProperty(SERVCLOUD_ID);

        if(isOverLicense()){//License過期惹，換頁不需要送stop命令
            return RequestResult.success("success");
        }

        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                PBLeanMsg msg = PBLeanMsg.newBuilder()
                        .setVersion("v1.0")
                        .setFrom(PLATFORM_ID + "_" + boxId)
                        .setTo(boxId)
                        .setMachine(machineId)
                        .setType(TargetType.CancelFetch.toString())
                        .build();
                //System.out.println(JsonFormat.printToString(msg));
                if(msg != null){
                    Box box = Box.findById(msg.getTo());
                    if((box != null)) {
                        if (sendCmd(box.getString("box_id"), box.getString("ip"), box.getInteger("port"), msg.toByteArray())) {
                            return RequestResult.success("success");
                        } else {
                            return RequestResult.fail("send command fail");
                        }
                    }else{
                        return RequestResult.fail("this box not exist");
                    }
                }else{
                    return RequestResult.fail("json2PbLeanMsg fail");
                }
            }
        });
    }

    @RequestMapping(value = "/cancelFetch", method = RequestMethod.GET)
    public RequestResult<String> cancelFetch(@RequestParam(value="machineId") final String machineId) {
        String failMsg = BoxCommanderFactory.v1_0().send(Type.CancelFetch, new Type[]{}, machineId, null);

        if (failMsg.isEmpty()) {
            return RequestResult.success("success");
        } else {
            return RequestResult.fail(failMsg);
        }
    }

    //送出監控命令 (直接透過json轉換，用來測試連線用)
    @RequestMapping(value = "/sendTest", method = RequestMethod.POST)
    public RequestResult<String> sendTest(@RequestParam(value="command") final String command,
                                          @RequestParam(value="boxId") final String boxId,
                                          @RequestParam(value="machineId") final String machineId,
                                          @RequestParam(value="ip") final String ip,
                                          @RequestParam(value="port") final Integer port) {
        logger.info("send command....");
        final String PLATFORM_ID = System.getProperty(SERVCLOUD_ID);

        System.out.println(command);
        System.out.println(boxId);
        System.out.println(machineId);
        System.out.println(ip);
        System.out.println(port);

        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                PBLeanMsg.Builder msgBuilder = json2PbLeanMsgBuilder(command);
                //使用box和platform設定mqtt名稱
                msgBuilder.setFrom(PLATFORM_ID + "_" + boxId).setTo(boxId).setMachine(machineId);
                //設定box response地點和類型
                msgBuilder.setReplies(0,
                        PBLean.Replies.newBuilder().setReply(PLATFORM_ID + "_" + boxId)
                                .setType(msgBuilder.getReplies(0).getType())
                );
                PBLeanMsg msg = msgBuilder.build();

                if (sendCmd(boxId, ip, port, msg.toByteArray())) {
                    return RequestResult.success("success");
                } else {
                    return RequestResult.fail("send command fail");
                }
            }
        });
    }

    //送出監控命令 (透過boxId和machineId設定，正式命令使用)
    @RequestMapping(value = "/sendByCmd", method = RequestMethod.POST)
    public RequestResult<String> sendByCmd(@RequestParam(value="command") final String command,
                                           @RequestParam(value="boxId") final String boxId,
                                           @RequestParam(value="machineId") final String machineId) {
        logger.info("send command....");
        final String PLATFORM_ID = System.getProperty(SERVCLOUD_ID);

        if(isOverLicense()){//License過期惹，不可以做監控
            return RequestResult.licenseMismatch("License expired!!");
        }

        return ActiveJdbc.operTx(new Operation<RequestResult<String>>() {
            @Override
            public RequestResult<String> operate() {
                PBLeanMsg.Builder msgBuilder = json2PbLeanMsgBuilder(command);
                //使用box和platform設定mqtt名稱
                msgBuilder.setFrom(PLATFORM_ID + "_" + boxId).setTo(boxId).setMachine(machineId);
                //設定box response地點和類型
                msgBuilder.setReplies(0,
                        PBLean.Replies.newBuilder().setReply(PLATFORM_ID + "_" + boxId)
                                .setType(msgBuilder.getReplies(0).getType())
                );
                PBLeanMsg msg = msgBuilder.build();
                if(msg != null){
                    Box box = Box.findById(msg.getTo());
                    if((box != null)) {
                        if (sendCmd(box.getString("box_id"), box.getString("ip"), box.getInteger("port"), msg.toByteArray())) {
                            return RequestResult.success("success");
                        } else {
                            return RequestResult.fail("send command fail");
                        }
                    }else{
                        return RequestResult.fail("this box not exist");
                    }
                }else{
                    return RequestResult.fail("json2PbLeanMsg fail");
                }
            }
        });
    }

    private boolean isOverLicense(){
        String licenseDateStr = System.getProperty(LICENSE_DATE);
        Date licenseDate = str2date(licenseDateStr + " 23:59:59", "yyyy-MM-dd HH:mm:ss");//到期日最後一天的23:59:59
        return (licenseDate.compareTo(new Date()) < 0);//過期?
    }

    public Date str2date(String date, String dateFormat){
        SimpleDateFormat format = new SimpleDateFormat(dateFormat);
        try {
            return format.parse(date);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return null;
    }

    //command轉換成Builder ()
    private PBLeanMsg.Builder json2PbLeanMsgBuilder(String command){
        Message.Builder builder = PBLeanMsg.newBuilder();
        try {
            JsonFormat.merge(command, builder);
        } catch (JsonFormat.ParseException e) {
            e.printStackTrace();
            logger.warn("send command JsonFormat fail: {}", e.getMessage());
            return null;
        }
        return (PBLeanMsg.Builder) builder;
    }

    //使用socket送命令給box (使用 protobuf byteArray)
    private boolean sendCmd(String boxId, String ip, int port, byte[] byteArray){
        boolean isSuccess = true;
        Socket socket = null;
        int bufSize = BYTE_BUF_SIZE;//一次寫入多少byte
        int byteArrayLength = byteArray.length;
        int writeCount = byteArrayLength / bufSize;//分幾次寫
        int byteRemain = byteArrayLength % bufSize;//剩餘的byte
        int off = 0;
        try {
            logger.info("send box: {}, ip: {}, port: {}, byteLength: {}, bufSize: {}, writeCount: {}, byteRemain: {}", boxId, ip, port, byteArrayLength, bufSize, writeCount, byteRemain);
            socket = new Socket(ip, port);
            OutputStream out = socket.getOutputStream();
            //out.write(byteArray);
            for(int count=0; count<writeCount; count++){
                out.write(byteArray, off, bufSize);
                off += bufSize;
            }
            if(byteRemain > 0){//最後有剩(不足buf的)
                out.write(byteArray, off, byteRemain);
            }
            out.flush();
            out.close();
        } catch (IOException e) {
            //e.printStackTrace();
            logger.warn("use socket send command fail!!, box: {}, ip: {}, port: {} exceptionMsg:{}"
                    , boxId, ip, port, e);
            isSuccess = false;
        }finally {
            if(socket != null){
                try {
                    socket.close();
                } catch (IOException e1) {
                    //e1.printStackTrace();
                    logger.warn("socket close fail: {}", e1);
                    isSuccess = false;
                }
            }
            return isSuccess;
        }
    }

    //box command type
    private enum TargetType{
        Register,
        Fetch,
        Storage,
        Analysis,
        CancelFetch,
        LoadResult,
        LogHistory,
        UpdateCommand,
        Write,
        RemoteCheck,
        Assign,
        Lock,
        DeviceStatus
    }
}


