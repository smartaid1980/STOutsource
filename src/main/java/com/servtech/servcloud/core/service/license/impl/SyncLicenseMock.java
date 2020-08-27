package com.servtech.servcloud.core.service.license.impl;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.servtech.servcloud.core.service.license.SyncLicenseService;
import com.servtech.servcloud.core.service.license.exception.UpdateException;
import com.servtech.servcloud.core.service.license.exception.ValidateException;
import com.servtech.servcloud.core.util.SysPropKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Random;
import java.util.concurrent.TimeUnit;

/**
 * Created by Hubert
 * Datetime: 2016/2/15 上午 10:37
 */
public class SyncLicenseMock implements SyncLicenseService {
    private static Logger log = LoggerFactory.getLogger(SyncLicenseMock.class);

    @Override
    public void validate(String servcloudId, String code) throws ValidateException {
        try {
            TimeUnit.SECONDS.sleep(3);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        if (!code.equals("servtech")) {
            throw new ValidateException("Mock 版本驗證碼為「servtech」");
        }

        String licenseDate = new SimpleDateFormat("yyyy-MM-dd").format(randomDate());
        try {
            Files.write(licenseDate, new File(System.getProperty(SysPropKey.ROOT_PATH), "license"), Charsets.UTF_8);
            System.setProperty(SysPropKey.LICENSE_DATE, licenseDate);
            log.info("骰中日期: " + System.getProperty(SysPropKey.LICENSE_DATE));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void update(String servcloudId) throws UpdateException {
        try {
            TimeUnit.SECONDS.sleep(3);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        String licenseDate = new SimpleDateFormat("yyyy-MM-dd").format(randomDate());
        try {
            Files.write(licenseDate, new File(System.getProperty(SysPropKey.ROOT_PATH), "license"), Charsets.UTF_8);
            System.setProperty(SysPropKey.LICENSE_DATE, licenseDate);
            log.info("骰中日期: " + System.getProperty(SysPropKey.LICENSE_DATE));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private Date randomDate() {
        Random random = new Random(System.currentTimeMillis());
        Calendar c = Calendar.getInstance();
        c.setTime(new Date());
        c.add(Calendar.DAY_OF_MONTH, random.nextInt(30));
        return c.getTime();
    }
}
