 -- CSU Store
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUStore','i18n_ServCloud_CSUStore',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_sales','CSUStore','i18n_ServCloud_CSUStore_Sales','none'),
 ('02_salesReport','CSUStore','i18n_ServCloud_CSUStore_Sales_Report','none'),
 ('03_orderManagement','CSUStore','i18n_ServCloud_CSUStore_Order_Management','none'),
 ('04_productSetting','CSUStore','i18n_ServCloud_CSUStore_Product_Setting','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUStore','20140918000002',NOW(),'admin');

 -- CSU Raw Material Storage Management
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSURawMaterialStorageManagement','i18n_ServCloud_CSURawMaterialStorageManagement',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_shipments','CSURawMaterialStorageManagement','i18n_ServCloud_CSURawMaterialStorageManagement_Shipments','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSURawMaterialStorageManagement','20140918000002',NOW(),'admin');

 -- CSU Product Warehouse Management
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUProductWarehouseManagement','i18n_ServCloud_CSUProductWarehouseManagement',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_automaticallyReceiveOrders','CSUProductWarehouseManagement','i18n_ServCloud_CSUProductWarehouseManagement_AutomaticallyReceiveOrders','none'),
 ('02_printCaseNumber','CSUProductWarehouseManagement','i18n_ServCloud_CSUProductWarehouseManagement_PrintCaseNumber','none'),
 ('03_warehousing','CSUProductWarehouseManagement','i18n_ServCloud_CSUProductWarehouseManagement_Warehousing','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUSCSUProductWarehouseManagementtore','20140918000002',NOW(),'admin');

 -- CSU Working Center
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUWorkingCenter','i18n_ServCloud_CSUWorkingCenter',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_demandOrderToWorkOrder','CSUWorkingCenter','i18n_ServCloud_CSUWorkingCenter_DemandOrderToWorkOrder','none'),
 ('02_chooseProduceWorkOrders','CSUWorkingCenter','i18n_ServCloud_CSUWorkingCenter_ChooseProduceWorkOrders','none'),
 ('03_productionCountdown','CSUWorkingCenter','i18n_ServCloud_CSUWorkingCenter_ProductionCountdown','none'),
 ('04_preventiveMaintenanceSettings','CSUWorkingCenter','i18n_ServCloud_CSUWorkingCenter_PreventiveMaintenanceSettings','none'),
 ('05_workOrderYieldStatistics','CSUWorkingCenter','i18n_ServCloud_CSUWorkingCenter_WorkOrderYieldStatistics','none'),
 ('06_receivingAndRefueling','CSUWorkingCenter','i18n_ServCloud_CSUWorkingCenter_ReceivingAndRefueling','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUWorkingCenter','20140918000002',NOW(),'admin');

 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CSU Store
 ('sys_super_admin_auth','01_sales','CSUStore',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','02_salesReport','CSUStore',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','03_orderManagement','CSUStore',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','04_productSetting','CSUStore',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CSU Raw Material Storage Management
 ('sys_super_admin_auth','01_shipments','CSURawMaterialStorageManagement',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CSU Product Warehouse Management
 ('sys_super_admin_auth','01_automaticallyReceiveOrders','CSUProductWarehouseManagement',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','02_printCaseNumber','CSUProductWarehouseManagement',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','03_warehousing','CSUProductWarehouseManagement',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CSU Working Center
 ('sys_super_admin_auth','01_demandOrderToWorkOrder','CSUWorkingCenter',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','02_chooseProduceWorkOrders','CSUWorkingCenter',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','03_productionCountdown','CSUWorkingCenter',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','04_preventiveMaintenanceSettings','CSUWorkingCenter',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','05_workOrderYieldStatistics','CSUWorkingCenter',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','06_receivingAndRefueling','CSUWorkingCenter',NOW(),'admin',NULL,NULL);