package com.servtech.servcloud.tank.bean;

import com.google.gson.Gson;

/**
 * Created by hubertlu on 2017/3/21.
 */
public class Packet {
    public int type;
    public String data;

    public static Packet from(String json) {
        return new Gson().fromJson(json, Packet.class);
    }
}
