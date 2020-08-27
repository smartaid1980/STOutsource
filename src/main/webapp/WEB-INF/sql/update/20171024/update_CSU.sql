DELETE FROM `m_app_info` WHERE `app_id` = 'CSUStore';
DELETE FROM `m_app_info` WHERE `app_id` = 'CSURawMaterialStorageManagement';
DELETE FROM `m_app_info` WHERE `app_id` = 'CSUProductWarehouseManagement';
DELETE FROM `m_app_info` WHERE `app_id` = 'CSUWorkingCenter';
DELETE FROM `m_app_info` WHERE `app_id` = 'CSUMonitoringCenter';

 -- CSU Store
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUStore','i18n_ServCloud_CSUStore',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_sales','CSUStore','i18n_ServCloud_CSUStore_Sales','none'),
 ('02_salesReport','CSUStore','i18n_ServCloud_CSUStore_SalesReport','none'),
 ('03_orderManagement','CSUStore','i18n_ServCloud_CSUStore_OrderManagement','none'),
 ('04_productSetting','CSUStore','i18n_ServCloud_CSUStore_ProductSetting','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUStore','20140918000002',NOW(),'admin');

 -- CSU Factory Order
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUFactoryOrder','i18n_ServCloud_CSUFactoryOrder',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_orderReceipt','CSUFactoryOrder','i18n_ServCloud_CSUFactoryOrder_OrderReceipt','none'),
 ('02_orderManagement','CSUFactoryOrder','i18n_ServCloud_CSUFactoryOrder_OrderManagement','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUFactoryOrder','20140918000002',NOW(),'admin');
 
 -- CSU Production Demand And Manufacturing
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUProductionDemandAndManufacturing','i18n_ServCloud_CSUProductionDemandAndManufacturing',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_demandOrderManagement','CSUProductionDemandAndManufacturing','i18n_ServCloud_CSUProductionDemandAndManufacturing_DemandOrderManagement','none'),
 ('02_toBeProduced','CSUProductionDemandAndManufacturing','i18n_ServCloud_CSUProductionDemandAndManufacturing_ToBeProduced','none'),
 ('03_dailyWorkOrderYield','CSUProductionDemandAndManufacturing','i18n_ServCloud_CSUProductionDemandAndManufacturing_DailyWorkOrderYield','none'),
 ('04_deviceSetting','CSUProductionDemandAndManufacturing','i18n_ServCloud_CSUProductionDemandAndManufacturing_DeviceSetting','none'),
 ('05_equipmentMonitoring','CSUProductionDemandAndManufacturing','i18n_ServCloud_CSUProductionDemandAndManufacturing_EquipmentMonitoring','none'),
 ('06_receivingAndRefueling','CSUProductionDemandAndManufacturing','i18n_ServCloud_CSUProductionDemandAndManufacturing_ReceivingAndRefueling','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUProductionDemandAndManufacturing','20140918000002',NOW(),'admin');

 -- CSU Product Warehouse
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUProductWarehouse','i18n_ServCloud_CSUProductWarehouse',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_productSetting','CSUProductWarehouse','i18n_ServCloud_CSUProductWarehouse_ProductSetting','none'),
 ('02_storageEstablish','CSUProductWarehouse','i18n_ServCloud_CSUProductWarehouse_StorageEstablish','none'),
 ('03_warehousing','CSUProductWarehouse','i18n_ServCloud_CSUProductWarehouse_Warehousing','none'),
 ('04_storageQuery','CSUProductWarehouse','i18n_ServCloud_CSUProductWarehouse_StorageQuery','none'),
 ('05_adjustStorageLocationManually','CSUProductWarehouse','i18n_ServCloud_CSUProductWarehouse_AdjustStorageLocationManually','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUProductWarehouse','20140918000002',NOW(),'admin');

 -- CSU Raw Material Warehouse
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSURawMaterialWarehouse','i18n_ServCloud_CSURawMaterialWarehouse',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_buildBarCode','CSURawMaterialWarehouse','i18n_ServCloud_CSURawMaterialWarehouse_BuildBarCode','none'),
 ('02_warehousing','CSURawMaterialWarehouse','i18n_ServCloud_CSURawMaterialWarehouse_Warehousing','none'),
 ('03_shipments','CSURawMaterialWarehouse','i18n_ServCloud_CSURawMaterialWarehouse_Shipments','none'),
 ('04_adjustStorageLocationManually','CSURawMaterialWarehouse','i18n_ServCloud_CSURawMaterialWarehouse_AdjustStorageLocationManually','none'),
 ('05_storageQuery','CSURawMaterialWarehouse','i18n_ServCloud_CSURawMaterialWarehouse_StorageQuery','none'),
 ('06_remainingProductionInquiries','CSURawMaterialWarehouse','i18n_ServCloud_CSURawMaterialWarehouse_RemainingProductionInquiries','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSURawMaterialWarehouse','20140918000002',NOW(),'admin');

 -- CSU Monitoring Report
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUMonitoringReport','i18n_ServCloud_CSUMonitoringReport',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_environmentalSensingMonitoring','CSUMonitoringReport','i18n_ServCloud_CSUMonitoringReport_EnvironmentalSensingMonitoring','none'),
 ('02_environmentalSensingAlertHistory','CSUMonitoringReport','i18n_ServCloud_CSUMonitoringReport_EnvironmentalSensingAlertHistory','none'),
 ('03_environmentalSensingHistoricalData','CSUMonitoringReport','i18n_ServCloud_CSUMonitoringReport_EnvironmentalSensingHistoricalData','none'),
 ('04_AGVRealTimeMonitoring','CSUMonitoringReport','i18n_ServCloud_CSUMonitoringReport_AGVRealTimeMonitoring','none'),
 ('05_accessControlSystemConnection','CSUMonitoringReport','i18n_ServCloud_CSUMonitoringReport_AccessControlSystemConnection','none'),
 ('06_fixedImageConnection','CSUMonitoringReport','i18n_ServCloud_CSUMonitoringReport_FixedImageConnection','none'),
 ('07_monitoringCenterSignIn','CSUMonitoringReport','i18n_ServCloud_CSUMonitoringReport_MonitoringCenterSignIn','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUMonitoringReport','20140918000002',NOW(),'admin');

 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CSU Store
 ('sys_super_admin_auth','01_sales','CSUStore',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','02_salesReport','CSUStore',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','03_orderManagement','CSUStore',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','04_productSetting','CSUStore',NOW(),'admin',NULL,NULL);

 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CSU Factory Order
 ('sys_super_admin_auth','01_orderReceipt','CSUFactoryOrder',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','02_orderManagement','CSUFactoryOrder',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CSU Production Demand And Manufacturing
 ('sys_super_admin_auth','01_demandOrderManagement','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','02_toBeProduced','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','03_dailyWorkOrderYield','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','04_deviceSetting','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','05_equipmentMonitoring','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','06_receivingAndRefueling','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CSU Product Warehouse
 ('sys_super_admin_auth','01_productSetting','CSUProductWarehouse',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','02_storageEstablish','CSUProductWarehouse',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','03_warehousing','CSUProductWarehouse',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','04_storageQuery','CSUProductWarehouse',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','05_adjustStorageLocationManually','CSUProductWarehouse',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CSU Raw Material Warehouse
 ('sys_super_admin_auth','01_buildBarCode','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','02_warehousing','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','03_shipments','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','04_adjustStorageLocationManually','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','05_storageQuery','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','06_remainingProductionInquiries','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CSU Monitoring Report
 ('sys_super_admin_auth','01_environmentalSensingMonitoring','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','02_environmentalSensingAlertHistory','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','03_environmentalSensingHistoricalData','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','04_AGVRealTimeMonitoring','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','05_accessControlSystemConnection','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','06_fixedImageConnection','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','07_monitoringCenterSignIn','CSUMonitoringReport',NOW(),'admin',NULL,NULL);