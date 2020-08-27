DELETE FROM `m_app_info` WHERE `app_id` = 'CSUStore';
DELETE FROM `m_app_info` WHERE `app_id` = 'CSUFactoryOrder';
DELETE FROM `m_app_info` WHERE `app_id` = 'CSUProductionDemandAndManufacturing';
DELETE FROM `m_app_info` WHERE `app_id` = 'CSUProductWarehouse';
DELETE FROM `m_app_info` WHERE `app_id` = 'CSURawMaterialWarehouse';

 -- CSU Store
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUStore','i18n_ServCloud_CSUStore',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_storeProduct','CSUStore','商店產品設定','none'),
 ('20_sales','CSUStore','產品銷售','none'),
 ('30_salesReport','CSUStore','銷售報表','none'),
 ('40_orderManagement','CSUStore','商店訂單管理','none'),
 ('50_productSetting','CSUStore','商店庫存查詢','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUStore','20140918000002',NOW(),'admin');

 -- CSU Factory Order
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUFactoryOrder','i18n_ServCloud_CSUFactoryOrder',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_orderReceipt','CSUFactoryOrder','訂單管理','none'),
 ('20_orderManagement','CSUFactoryOrder','需求單開立','none'),
 ('30_store','CSUFactoryOrder','客戶商店設定','none'),
 ('40_productManagement','CSUFactoryOrder','產品設定','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUFactoryOrder','20140918000002',NOW(),'admin');
 
 -- CSU Production Demand And Manufacturing
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUProductionDemandAndManufacturing','生產製造',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_lineSetting','CSUProductionDemandAndManufacturing','產線設備設定','none'),
 ('20_productSetting','CSUProductionDemandAndManufacturing','成品箱管理','none'),
 ('30_demandOrderManagement','CSUProductionDemandAndManufacturing','需求單轉工單','none'),
 ('40_toBeProduced','CSUProductionDemandAndManufacturing','工單生產','none'),
 ('50_deviceSetting','CSUProductionDemandAndManufacturing','設備設定','none'),
 ('60_equipmentMonitoring','CSUProductionDemandAndManufacturing','i18n_ServCloud_CSUProductionDemandAndManufacturing_EquipmentMonitoring','none'),
 ('70_receivingAndRefueling','CSUProductionDemandAndManufacturing','收料與換料','none'),
 ('80_dailyWorkOrderYield','CSUProductionDemandAndManufacturing','工單良率','none'),
 ('90_maskMachineAlarmHistory','CSUProductionDemandAndManufacturing','口罩機警報履歷','none'),
 ('95_deviceMaintenanceSetting','CSUProductionDemandAndManufacturing','機台預防保養設定','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUProductionDemandAndManufacturing','20140918000002',NOW(),'admin');

 -- CSU Product Warehouse
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUProductWarehouse','i18n_ServCloud_CSUProductWarehouse',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_storageEstablish','CSUProductWarehouse','成品入庫','none'),
 ('20_warehousing','CSUProductWarehouse','成品出貨','none'),
 ('30_storageQuery','CSUProductWarehouse','成品儲位查詢與變更','none'),
 ('40_adjustStorageLocationManually','CSUProductWarehouse','成品儲位調整','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUProductWarehouse','20140918000002',NOW(),'admin');

 -- CSU Raw Material Warehouse
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSURawMaterialWarehouse','i18n_ServCloud_CSURawMaterialWarehouse',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_materialIDMaintain','CSURawMaterialWarehouse','原料料號維護','none'),
 ('20_materialItemIDMaintain','CSURawMaterialWarehouse','原料單件管理','none'),
 ('30_reciprocalSetting','CSURawMaterialWarehouse','原料生產倒數設定','none'),
 ('40_shipments','CSURawMaterialWarehouse','原料出庫','none'),
 ('50_remainingProductionInquiries','CSURawMaterialWarehouse','原料儲位查詢','none'),
 ('60_adjustStorageLocationManually','CSURawMaterialWarehouse','原料倉儲位調整','none'),
 ('70_storageQuery','CSURawMaterialWarehouse','原料剩餘產量查詢','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSURawMaterialWarehouse','20140918000002',NOW(),'admin');


INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CSU Store
 ('@st@sys_super_admin_auth','10_storeProduct','CSUStore',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_sales','CSUStore',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','30_salesReport','CSUStore',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','40_orderManagement','CSUStore',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','50_productSetting','CSUStore',NOW(),'admin',NULL,NULL);

 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CSU Factory Order
 ('@st@sys_super_admin_auth','10_orderReceipt','CSUFactoryOrder',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_orderManagement','CSUFactoryOrder',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','30_store','CSUFactoryOrder',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','40_productManagement','CSUFactoryOrder',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CSU Production Demand And Manufacturing
 ('@st@sys_super_admin_auth','10_lineSetting','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_productSetting','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','30_demandOrderManagement','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','40_toBeProduced','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','50_deviceSetting','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','60_equipmentMonitoring','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','70_receivingAndRefueling','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','80_dailyWorkOrderYield','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','90_maskMachineAlarmHistory','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','95_deviceMaintenanceSetting','CSUProductionDemandAndManufacturing',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CSU Product Warehouse
 ('@st@sys_super_admin_auth','10_storageEstablish','CSUProductWarehouse',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_warehousing','CSUProductWarehouse',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','30_storageQuery','CSUProductWarehouse',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','40_adjustStorageLocationManually','CSUProductWarehouse',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CSU Raw Material Warehouse
 ('@st@sys_super_admin_auth','10_materialIDMaintain','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_materialItemIDMaintain','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','30_reciprocalSetting','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','40_shipments','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','50_remainingProductionInquiries','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','60_adjustStorageLocationManually','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','70_storageQuery','CSURawMaterialWarehouse',NOW(),'admin',NULL,NULL);