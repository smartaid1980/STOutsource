 -- SuperpcbEquipMonitor
INSERT INTO `m_sys_dashboard` (`dashboard_id`,`app_id`,`dashboard_name`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('10_plant_area','SuperpcbEquipMonitor','i18n_ServCloud_Monitoring_All_Zone',NOW(),'admin',NULL,NULL),
 ('20_DI_exposure_machine','SuperpcbEquipMonitor','i18n_ServCloud_DI_Exposure_Machine',NOW(),'admin',NULL,NULL),
 ('20_outer_layer_treatment','SuperpcbEquipMonitor','i18n_ServCloud_Outer_Layer_Treatment',NOW(),'admin',NULL,NULL);
 INSERT INTO `m_sys_d_auth_dashboard` (`d_auth_id`,`dashboard_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@sys_super_admin_auth','10_plant_area','SuperpcbEquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_DI_exposure_machine','SuperpcbEquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_outer_layer_treatment','SuperpcbEquipMonitor',NOW(),'admin',NULL,NULL);

 -- SuperpcbUtilizationStd
INSERT INTO `m_sys_dashboard` (`dashboard_id`,`app_id`,`dashboard_name`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('10_utilization','SuperpcbUtilizationStd','即時稼動率',NOW(),'admin',NULL,NULL);
 INSERT INTO `m_sys_d_auth_dashboard` (`d_auth_id`,`dashboard_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@sys_super_admin_auth','10_utilization','SuperpcbUtilizationStd',NOW(),'admin',NULL,NULL);