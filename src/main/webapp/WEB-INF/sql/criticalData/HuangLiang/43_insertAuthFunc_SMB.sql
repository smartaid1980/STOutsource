--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- Management
 ('smb_auth','02_manage_user','Management',NOW(),'admin',NULL,NULL),
 ('smb_auth','05_manage_box_edit','Management',NOW(),'admin',NULL,NULL),
 ('smb_auth','06_manage_machine_edit','Management',NOW(),'admin',NULL,NULL),
 
 -- HuangLiangUtilizationDataMaintenance
 ('smb_auth','10_quality_detect_data_maintenance','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL),

 -- HuangLiangUtilization
 ('smb_auth','10_daily','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('smb_auth','20_employee_utilization_by_machine','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('smb_auth','40_quality_utilization_by_product','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('smb_auth','55_employee_performance','HuangLiangUtilization',NOW(),'admin',NULL,NULL),

 -- HuangLiangMonitorApplication
 ('smb_auth','30_download_raw_data','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),

 -- HuangLiangDashboard
 ('smb_auth','01_inner_dashboard','HuangLiangDashboard',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_auth_func` ENABLE KEYS */;