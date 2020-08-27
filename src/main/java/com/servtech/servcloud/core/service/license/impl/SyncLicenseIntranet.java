package com.servtech.servcloud.core.service.license.impl;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.servtech.common.codec.impl.KeyCategory;
import com.servtech.servcloud.core.service.license.SyncLicenseService;
import com.servtech.servcloud.core.service.license.exception.UpdateException;
import com.servtech.servcloud.core.service.license.exception.ValidateException;
import com.servtech.servcloud.core.util.SysPropKey;

import java.io.*;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Hubert
 * Datetime: 2016/4/20 上午 11:25
 */
public class SyncLicenseIntranet implements SyncLicenseService {
    @Override
    public void validate(String servcloudId, String code) throws ValidateException {
        try {
            refreshKey();
        } catch (Exception e) {
            e.printStackTrace();
            throw new ValidateException(e.getMessage());
        }
    }

    @Override
    public void update(String servcloudId) throws UpdateException {
        try {
            refreshKey();
        } catch (Exception e) {
            e.printStackTrace();
            throw new UpdateException(e.getMessage());
        }
    }

    private List<String> socketToIntranet() {
        Socket socket = null;
        BufferedReader reader = null;

        try {
            socket = new Socket("192.168.130.115", 6666);
            reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));

            List<String> lines = new ArrayList<String>();
            String line;

            while ((line = reader.readLine()) != null) {
                lines.add(line);
            }

            return lines;
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (reader != null) {
                    reader.close();
                }
                if (socket != null) {
                    socket.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        throw new RuntimeException("掛彩...");
    }

    private void refreshKey() throws IOException {
        List<String> keyWithDate = socketToIntranet();

        if (keyWithDate.size() == 4) {
            String date = keyWithDate.get(0);
            Files.write(date, new File(System.getProperty(SysPropKey.ROOT_PATH), "license"), Charsets.UTF_8);
            System.setProperty(SysPropKey.LICENSE_DATE, date);

            KeyCategory.Decode.key.refreshKey(keyWithDate.get(1));
            KeyCategory.Encode.key.refreshKey(keyWithDate.get(2));
            KeyCategory.EncodeDecode.key.refreshKey(keyWithDate.get(3));
        } else {
            throw new RuntimeException("內網 key server 竟然不是給四行...");
        }
    }

}
