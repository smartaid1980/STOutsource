--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
-- AlarmHistory
 ('product_plus_user_auth','01_cncscanByCode','AlarmHistory',NOW(),'admin',NULL,NULL),
 ('product_plus_user_auth','02_cncscanByMachine','AlarmHistory',NOW(),'admin',NULL,NULL),


-- Dashboard
 ('product_plus_user_auth','01_dashboard','Dashboard',NOW(),'admin',NULL,NULL),


-- DispatchManagement
 ('product_plus_user_auth','01_assignment_sheet','DispatchManagement',NOW(),'admin',NULL,NULL),


-- DowntimeAnalysisEnzoy
 -- ('product_plus_user_auth','10_downtime_analysis','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL),
 ('product_plus_user_auth','11_downtime_analysis_machineidle','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL),




-- EquipMonitor
 ('product_plus_user_auth','02_plant_area_monitor','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('product_plus_admin_auth','03_management_plant','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('product_plus_admin_auth','04_manage_machine_light','EquipMonitor',NOW(),'admin',NULL,NULL),


-- IPCam
 ('product_plus_user_auth','90_ip_cam_grid','IPCam',NOW(),'admin',NULL,NULL),
 -- ('product_plus_auth','91_ip_cam_grid_demo','IPCam',NOW(),'admin',NULL,NULL),
 ('product_plus_user_auth','99_manage_ip_cam','IPCam',NOW(),'admin',NULL,NULL),


-- Ladder
 ('product_plus_user_auth','01_machine_list','Ladder',NOW(),'admin',NULL,NULL),
 ('product_plus_user_auth','02_ladder_monitor','Ladder',NOW(),'admin',NULL,NULL),


-- Management
 ('product_plus_admin_auth','02_manage_user','Management',NOW(),'admin',NULL,NULL),
 ('product_plus_admin_auth','08_manage_shift','Management',NOW(),'admin',NULL,NULL),
 ('product_plus_admin_auth','16_manage_alarm','Management',NOW(),'admin',NULL,NULL),
 ('product_plus_admin_auth','05_manage_box','Management',NOW(),'admin',NULL,NULL),
 ('product_plus_admin_auth','06_manage_machine_edit','Management',NOW(),'admin',NULL,NULL),
 ('product_plus_admin_auth','10_manage_macro','Management',NOW(),'admin',NULL,NULL),
 ('product_plus_admin_auth','14_manage_machine_editor','Management',NOW(),'admin',NULL,NULL),




-- ProgTransmit
 ('product_plus_user_auth','01_machines','ProgTransmit',NOW(),'admin',NULL,NULL),
 ('product_plus_user_auth','02_cnc_download','ProgTransmit',NOW(),'admin',NULL,NULL),
 ('product_plus_user_auth','03_cnc_upload','ProgTransmit',NOW(),'admin',NULL,NULL),
 

  -- ToolUsed
 ('product_plus_user_auth','01_single_measure','ToolUsed',NOW(),'admin',NULL,NULL),


-- UtilizationStd
 ('product_plus_user_auth','10_daily','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('product_plus_user_auth','20_monthly','UtilizationStd',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_auth_func` ENABLE KEYS */;
