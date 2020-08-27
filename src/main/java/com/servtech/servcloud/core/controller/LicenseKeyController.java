package com.servtech.servcloud.core.controller;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.servtech.common.codec.RawDataCryptor;
import com.servtech.common.codec.RawDataCryptorFactory;
import com.servtech.common.codec.impl.KeyCategory;
import com.servtech.servcloud.core.service.license.SyncLicenseService;
import com.servtech.servcloud.core.service.license.SyncLicenseServiceFactory;
import com.servtech.servcloud.core.service.license.exception.UpdateException;
import com.servtech.servcloud.core.service.license.exception.ValidateException;
import com.servtech.servcloud.core.util.RequestResult;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletContext;
import java.io.File;
import java.io.IOException;

import static com.servtech.servcloud.core.util.SysPropKey.LICENSE_DATE;

/**
 * Created by Hubert
 * Datetime: 2016/2/3 下午 02:53
 */
@RestController
@RequestMapping("/license")
public class LicenseKeyController {
    private static Logger log = LoggerFactory.getLogger(LicenseKeyController.class);

    @Autowired
    private ServletContext servletContext;

    @RequestMapping(value = "validate", method = RequestMethod.GET)
    public RequestResult<String> validate(@RequestParam("code") String code) {
        log.info("驗證碼: " + code);

        try {
            SyncLicenseService syncLicenseService =
                    SyncLicenseServiceFactory.create(servletContext.getInitParameter("license"));
            syncLicenseService.validate(System.getProperty(SysPropKey.SERVCLOUD_ID), code);
        } catch (ValidateException e) {
            return RequestResult.fail(e.getMessage());
        } catch (Exception e) {
            return RequestResult.fail(e.getMessage());
        }

        return RequestResult.success("驗證成功!");
    }

    @RequestMapping(value = "update", method = RequestMethod.GET)
    public RequestResult<String> update() {
        try {
            SyncLicenseService syncLicenseService =
                    SyncLicenseServiceFactory.create(servletContext.getInitParameter("license"));
            syncLicenseService.update(System.getProperty(SysPropKey.SERVCLOUD_ID));
        } catch (UpdateException e) {
            return RequestResult.fail(e.getMessage());
        }

        return RequestResult.success(System.getProperty(SysPropKey.LICENSE_DATE));
    }

    @RequestMapping(value = "reloadKey", method = RequestMethod.GET)
    public RequestResult<String> refresh() {
        reloadKey();
        return RequestResult.success("License Key 重新讀取成功!!");
    }

    @RequestMapping(value = "updateIndicated", method = RequestMethod.POST)
    public RequestResult<String> updateIndicated(@RequestParam("file") MultipartFile file) {
        String oldKey = KeyCategory.Decode.key.getKey();

        try {
            byte[] newKeyBytes = file.getBytes();

            KeyCategory.Decode.key.refreshKey(new String(newKeyBytes));
            RawDataCryptor cryptor = RawDataCryptorFactory.getCryptor();
            String expiration = cryptor.expiration();

            Files.write(expiration, new File(System.getProperty(SysPropKey.ROOT_PATH), "license"), Charsets.UTF_8);
            System.setProperty(LICENSE_DATE, expiration);

            return RequestResult.success(expiration);

        } catch (Exception e) {
            KeyCategory.Decode.key.refreshKey(oldKey);

            return RequestResult.fail("update fail");
        }
    }

    private void reloadKey() {
        KeyCategory.Decode.key.loadKey();
        KeyCategory.Encode.key.loadKey();
        KeyCategory.EncodeDecode.key.loadKey();
    }

}
