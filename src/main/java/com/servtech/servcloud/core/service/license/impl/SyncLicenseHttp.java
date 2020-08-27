package com.servtech.servcloud.core.service.license.impl;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import com.servtech.common.codec.impl.KeyCategory;
import com.servtech.servcloud.core.service.license.SyncLicenseService;
import com.servtech.servcloud.core.service.license.exception.UpdateException;
import com.servtech.servcloud.core.service.license.exception.ValidateException;
import com.servtech.servcloud.core.util.SysPropKey;
import org.javalite.http.Http;
import org.javalite.http.Post;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Hubert
 * Datetime: 2016/3/3 上午 09:34
 */
public class SyncLicenseHttp implements SyncLicenseService {
    private static final Logger log = LoggerFactory.getLogger(SyncLicenseHttp.class);

    @Override
    public void validate(String servcloudId, String code) throws ValidateException {

        String requestJson = RequestPacket.forValidateAsJson(servcloudId, code);
        Post post = Http.post(System.getProperty(SysPropKey.SERV_CUSTOMER_HOST) + "/rest/api/checklicence", requestJson);
        post.header("Content-Type", "application/json");

        String responseJson = post.text();

        if (isSuccess(responseJson)) {
            ResponseSuccessPacket responsePacket = new Gson().fromJson(responseJson, ResponseSuccessPacket.class);
            try {
                responsePacket.refreshLicense();
            } catch (Exception e) {
                throw new ValidateException(e.getMessage());
            }
        } else {
            ResponseFailPacket responsePacket = new Gson().fromJson(responseJson, ResponseFailPacket.class);
            throw new ValidateException(responsePacket.data);
        }

    }

    @Override
    public void update(String servcloudId) throws UpdateException {
        String requestJson = RequestPacket.forUpdateAsJson(servcloudId);
        Post post = Http.post(System.getProperty(SysPropKey.SERV_CUSTOMER_HOST) + "/rest/api/checkkeyupdate", requestJson);
        post.header("Content-Type", "application/json");

        String responseJson = post.text();

        if (isSuccess(responseJson)) {
            ResponseSuccessPacket responsePacket = new Gson().fromJson(responseJson, ResponseSuccessPacket.class);
            try {
                responsePacket.refreshLicense();
            } catch (Exception e) {
                throw new UpdateException(e.getMessage());
            }
        } else {
            ResponseFailPacket responsePacket = new Gson().fromJson(responseJson, ResponseFailPacket.class);
            throw new UpdateException(responsePacket.data);
        }
    }

    private static class RequestPacket {
        String platformId;
        String licence;
        String deviceCode;
        List<String> key;

        static String forValidateAsJson(String platformId, String license) {
            RequestPacket requestPacket = new RequestPacket();
            requestPacket.platformId = platformId;
            requestPacket.licence = license;
            requestPacket.deviceCode = getMacAddress();
            return new Gson().toJson(requestPacket);
        }

        static String forUpdateAsJson(String platformId) {
            RequestPacket requestPacket = new RequestPacket();
            requestPacket.platformId = platformId;
            requestPacket.deviceCode = getMacAddress();
            requestPacket.key = new ArrayList<String>();

            // 一定得要按照這個順序
            requestPacket.key.add(KeyCategory.Decode.key.getKey());
            requestPacket.key.add(KeyCategory.Encode.key.getKey());
            requestPacket.key.add(KeyCategory.EncodeDecode.key.getKey());

            return new Gson().toJson(requestPacket);
        }
    }

    private static class ResponseSuccessPacket {
        int number;
        ResponseData data;

        void refreshLicense() throws Exception {
            data.refreshLicense();
        }
    }

    private static class ResponseFailPacket {
        int number;
        String data;
    }

    private static class ResponseData {
        String expirationDate;
        List<String> key;

        boolean isUpToDate() {
            return expirationDate == null;
        }

        void refreshLicense() throws Exception {
            if (isUpToDate()) {
                log.info("合約未更新!!");
                return;
            }

            if (key == null || key.size() < 3) {
                log.warn("key error size: " + key.size());
                throw new Exception("License sync error - response packet error");
            }

            // license 檔案
            String licenseDateContent = expirationDate.substring(0, 4) + "-" + expirationDate.substring(4, 6) + "-" + expirationDate.substring(6, 8);
            try {
                Files.write(licenseDateContent, new File(System.getProperty(SysPropKey.ROOT_PATH), "license"), Charsets.UTF_8);
                System.setProperty(SysPropKey.LICENSE_DATE, licenseDateContent);
                log.info("新合約: " + licenseDateContent);
            } catch (IOException e) {
                log.warn("更新 license 檔案有誤: " + e.getMessage(), e);
                throw new Exception("License update error!!");
            }

            // 3 把金鑰
            KeyCategory.Decode.key.refreshKey(key.get(0));
            KeyCategory.Encode.key.refreshKey(key.get(1));
            KeyCategory.EncodeDecode.key.refreshKey(key.get(2));
        }
    }

    private boolean isSuccess(String responseJson) {
        try {
            JsonParser jsonParser = new JsonParser();
            JsonObject jsonObject = (JsonObject) jsonParser.parse(responseJson);
            return jsonObject.get("number").getAsInt() == 0;
        } catch (JsonSyntaxException e) {
            log.warn(e.getMessage(), e);
            return false;
        }
    }

    private static String getMacAddress() {
        try {
            InetAddress ip = InetAddress.getLocalHost();
            NetworkInterface network = NetworkInterface.getByInetAddress(ip);
            byte[] mac = network.getHardwareAddress();

            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < mac.length; i++) {
                sb.append(String.format("%02X%s", mac[i], (i < mac.length - 1) ? "-" : ""));
            }
            return sb.toString();

        } catch (SocketException e) {
            log.warn(e.getMessage(), e);
            throw new RuntimeException("MAC address get error: " + e.getMessage());
        } catch (UnknownHostException e) {
            log.warn(e.getMessage(), e);
            throw new RuntimeException("MAC address get error: " + e.getMessage());
        }
    }

}
