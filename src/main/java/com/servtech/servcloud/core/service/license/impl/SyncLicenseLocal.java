package com.servtech.servcloud.core.service.license.impl;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.servtech.common.codec.RawDataCryptorFactory;
import com.servtech.common.codec.impl.KeyCategory;
import com.servtech.servcloud.core.service.license.SyncLicenseService;
import com.servtech.servcloud.core.service.license.exception.UpdateException;
import com.servtech.servcloud.core.service.license.exception.ValidateException;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;

/**
 * Created by Hubert
 * Datetime: 2016/3/14 下午 12:03
 */
public class SyncLicenseLocal implements SyncLicenseService {
    private static final Logger log = LoggerFactory.getLogger(SyncLicenseLocal.class);

    @Override
    public void validate(String servcloudId, String code) throws ValidateException {
        if (!code.equals("servtech")) {
            throw new ValidateException("驗證碼為「servtech」");
        }

        String licenseDate = System.getProperty(SysPropKey.LICENSE_DATE);
        if (licenseDate == null || licenseDate.isEmpty()) {
            throw new ValidateException("合約日期並未設定");
        }

        if (KeyCategory.Decode.key.getKey().length() == 0) {
            throw new ValidateException("缺少 key " + KeyCategory.Decode.key.getMode() + "...");
        }

        if (KeyCategory.Encode.key.getKey().length() == 0) {
            throw new ValidateException("缺少 key " + KeyCategory.Encode.key.getMode() + "...");
        }

        if (KeyCategory.EncodeDecode.key.getKey().length() == 0) {
            throw new ValidateException("缺少 key " + KeyCategory.EncodeDecode.key.getMode() + "...");
        }
    }

    @Override
    public void update(String servcloudId) throws UpdateException {
        KeyCategory.Decode.key.loadKey();
        KeyCategory.Encode.key.loadKey();
        KeyCategory.EncodeDecode.key.loadKey();

        String licenseDate = RawDataCryptorFactory.getCryptor().expiration();
        System.setProperty(SysPropKey.LICENSE_DATE, licenseDate);
        log.info("合約更新日期: " + System.getProperty(SysPropKey.LICENSE_DATE));
    }
}
