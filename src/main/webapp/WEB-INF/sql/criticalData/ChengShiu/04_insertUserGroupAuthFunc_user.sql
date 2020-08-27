--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES

 -- CSU Store
 ('chengshiu_user_auth','10_storeProduct','CSUStore',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','20_sales','CSUStore',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','30_salesReport','CSUStore',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','40_orderManagement','CSUStore',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','50_productSetting','CSUStore',NOW(),'admin',NULL,NULL),

 -- CSU Factory Order
 ('chengshiu_user_auth','10_orderReceipt','CSUFactoryOrder',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','20_orderManagement','CSUFactoryOrder',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','30_store','CSUFactoryOrder',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','40_productManagement','CSUFactoryOrder',NOW(),'admin',NULL,NULL),

 -- CSU Production Demand And Manufacturing
 ('chengshiu_user_auth','10_lineSetting','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','20_productSetting','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','30_demandOrderManagement','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','40_toBeProduced','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','50_deviceSetting','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','60_equipmentMonitoring','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','70_receivingAndRefueling','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','80_dailyWorkOrderYield','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','90_maskMachineAlarmHistory','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','95_deviceMaintenanceSetting','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),

 -- CSU Product Warehouse
 ('chengshiu_user_auth','10_storageEstablish','CSUProductWarehouse',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','20_warehousing','CSUProductWarehouse',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','30_storageQuery','CSUProductWarehouse',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','40_adjustStorageLocationManually','CSUProductWarehouse',NOW(),'admin',NULL,NULL),

 -- CSU Raw Material Warehouse
 ('chengshiu_user_auth','10_materialIDMaintain','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','20_materialItemIDMaintain','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','30_reciprocalSetting','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','40_shipments','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','50_remainingProductionInquiries','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','60_adjustStorageLocationManually','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','70_storageQuery','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),

-- CSUMonitoringReport
 ('chengshiu_user_auth','01_environmentalSensingMonitoring','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','02_environmentalSensingAlertHistory','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','03_environmentalSensingHistoricalData','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','04_AGVRealTimeMonitoring','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','05_accessControlSystemConnection','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','06_fixedImageConnection','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
-- ('chengshiu_user_auth','07_monitoringCenterSignIn','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','08_AGVMaintainSetting','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','50_manage_agv','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','51_manage_rfid','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','52_manage_sensor_type','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','53_manage_sensor','CSUMonitoringReport',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','99_alertNotificationQuery','CSUMonitoringReport',NOW(),'admin',NULL,NULL),

 -- CSU WareHouse Setting
 ('chengshiu_user_auth','10_storingAreaSetting','CSUWareHouseSetting',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','20_flowingStoringAreaSetting','CSUWareHouseSetting',NOW(),'admin',NULL,NULL),
 ('chengshiu_user_auth','30_printStoringBarCode','CSUWareHouseSetting',NOW(),'admin',NULL,NULL);