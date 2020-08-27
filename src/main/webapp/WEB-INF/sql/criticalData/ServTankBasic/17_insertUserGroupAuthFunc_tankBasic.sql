--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
-- AlarmHistory
 ('sys_product_std_app_alarm_auth','01_cncscanByCode','AlarmHistory',NOW(),'admin',NULL,NULL),
 ('sys_product_std_app_alarm_auth','02_cncscanByMachine','AlarmHistory',NOW(),'admin',NULL,NULL),


-- Dashboard
-- ('sys_product_std_app_dashboard_auth','01_dashboard','Dashboard',NOW(),'admin',NULL,NULL),


-- EquipMonitor
 ('sys_product_std_app_monitor_auth','02_plant_area_monitor','EquipMonitor',NOW(),'admin',NULL,NULL),
-- ('sys_product_std_app_monitor_auth','03_management_plant','EquipMonitor',NOW(),'admin',NULL,NULL),
-- ('sys_product_std_app_monitor_auth','04_manage_machine_light','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('sys_product_std_app_monitor_auth','25_machine_status_history','EquipMonitor',NOW(),'admin',NULL,NULL),




 -- MachineManagement
-- ('product_std_admin_auth','05_manage_box','MachineManagement',NOW(),'admin',NULL,NULL),
-- ('product_std_admin_auth','10_manage_machine','MachineManagement',NOW(),'admin',NULL,NULL),
-- ('product_std_admin_auth','14_manage_machine_editor','MachineManagement',NOW(),'admin',NULL,NULL),


-- Management
 ('sys_product_std_app_admin_auth','02_manage_user','Management',NOW(),'admin',NULL,NULL),
 -- ('sys_product_std_app_admin_auth','08_manage_shift','Management',NOW(),'admin',NULL,NULL),
 ('sys_product_std_app_admin_auth','16_manage_alarm','Management',NOW(),'admin',NULL,NULL),
 ('sys_product_std_app_admin_auth','05_manage_box','Management',NOW(),'admin',NULL,NULL),
-- ('sys_product_std_app_admin_auth','07_manage_machine_info','Management',NOW(),'admin',NULL,NULL),
 ('sys_product_std_app_admin_auth','20_manage_host','Management',NOW(),'admin',NULL,NULL),
 -- ('sys_product_std_app_admin_auth','10_manage_macro','Management',NOW(),'admin',NULL,NULL),
 -- ('sys_product_std_app_admin_auth','14_manage_machine_editor','Management',NOW(),'admin',NULL,NULL),
 -- ('sys_product_std_app_admin_auth','11_manage_download_raw_data_beforeDate','Management',NOW(),'admin',NULL,NULL),

 -- ServTankManager
 ('sys_product_std_app_admin_auth','01_servcore_config','ServTank',NOW(),'admin',NULL,NULL),

-- CustomerService
 ('sys_product_std_app_admin_auth','30_log_download','CustomerService',NOW(),'admin',NULL,NULL),

-- ProgTransmit
--  ('sys_product_std_app_progtransmit_auth','01_machines','ProgTransmit',NOW(),'admin',NULL,NULL),
-- ('sys_product_std_app_progtransmit_auth','02_cnc_download','ProgTransmit',NOW(),'admin',NULL,NULL),
-- ('sys_product_std_app_progtransmit_auth','03_cnc_upload','ProgTransmit',NOW(),'admin',NULL,NULL),


-- BackupQuery
 ('sys_product_std_app_admin_auth','10_backup_query','BackupQuery',NOW(),'admin',NULL,NULL),

-- UtilizationStd
 ('sys_product_std_app_utilization_auth','10_daily','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('sys_product_std_app_utilization_auth','20_monthly','UtilizationStd',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_auth_func` ENABLE KEYS */;
