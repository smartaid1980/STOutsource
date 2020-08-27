package com.servtech.servcloud.core.service.box;

/**
 * Created by Hubert
 * Datetime: 2016/6/30 下午 02:39
 */
public interface BoxCommander {

    /**
     * 以 protobuf 送訊息給 box
     *
     * @param sendType protobuf 中的 type
     * @param repliesType protobuf 中 replies 的 type
     * @param machineId protobuf 中的 machine
     * @param jsonCommand protobuf 中的 command
     *
     * @return 失敗訊息，若成功則為空字串
     */
    String send(Type sendType, Type[] repliesType, String machineId, String jsonCommand);
}
