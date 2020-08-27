package com.servtech.servcloud.core.service.license;

import com.servtech.servcloud.core.service.license.impl.SyncLicenseMock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by Hubert
 * Datetime: 2016/3/14 上午 11:17
 */
public class SyncLicenseServiceFactory {
    private static final Logger log = LoggerFactory.getLogger(SyncLicenseServiceFactory.class);

    public static SyncLicenseService create(String classNameWithoutPackage) {
        String className = SyncLicenseMock.class.getPackage().getName() + ".SyncLicense" + classNameWithoutPackage;
        try {
            Class syncLicenseServiceImplClass = Class.forName(className);
            return (SyncLicenseService) syncLicenseServiceImplClass.newInstance();

        } catch (ClassCastException e) {
            log.warn("SyncLicenseService 初始化異常: " + e.getMessage(), e);
        } catch (ClassNotFoundException e) {
            log.warn("SyncLicenseService 初始化異常: " + e.getMessage(), e);
        } catch (InstantiationException e) {
            log.warn("SyncLicenseService 初始化異常: " + e.getMessage(), e);
        } catch (IllegalAccessException e) {
            log.warn("SyncLicenseService 初始化異常: " + e.getMessage(), e);
        } finally {
            log.debug("SyncLicenseService class name: " + className);
        }

        return new SyncLicenseMock();
    }

}
