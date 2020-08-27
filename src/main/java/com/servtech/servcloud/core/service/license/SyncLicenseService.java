package com.servtech.servcloud.core.service.license;

import com.servtech.servcloud.core.service.license.exception.UpdateException;
import com.servtech.servcloud.core.service.license.exception.ValidateException;

/**
 * Created by Hubert
 * Datetime: 2016/2/15 上午 10:36
 */
public interface SyncLicenseService {
    void validate(String servcloudId, String code) throws ValidateException;
    void update(String servcloudId) throws UpdateException;
}
