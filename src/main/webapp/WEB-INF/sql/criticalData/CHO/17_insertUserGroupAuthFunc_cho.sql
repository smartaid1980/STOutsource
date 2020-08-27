--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
-- Aheadmaster
 ('product_std_user_auth','19_upload_input_simple','Aheadmaster',NOW(),'admin',NULL,NULL),

-- AheadmasterMyZone
 ('product_std_user_auth','01_my_zone_achievement_rate','AheadmasterMyZone',NOW(),'admin',NULL,NULL),
 ('product_std_user_auth','02_my_zone_yield_rate','AheadmasterMyZone',NOW(),'admin',NULL,NULL),
 ('product_std_user_auth','03_my_zone_efficiency_rate','AheadmasterMyZone',NOW(),'admin',NULL,NULL),
-- AheadmasterAchievementRate
 ('product_std_user_auth','01_achievement_rate','AheadmasterAchievementRate',NOW(),'admin',NULL,NULL),
-- AheadmasterYieldRate
 ('product_std_user_auth','01_yield_rate','AheadmasterYieldRate',NOW(),'admin',NULL,NULL),
-- AheadmasterEfficiencyRate
 ('product_std_user_auth','01_efficiency_rate','AheadmasterEfficiencyRate',NOW(),'admin',NULL,NULL),

-- CHODashboard
 ('product_std_user_auth','01_dashboard','CHODashboard',NOW(),'admin',NULL,NULL),
 ('sys_user_auth','01_dashboard','CHODashboard',NOW(),'admin',NULL,NULL),

-- Management
 ('product_std_user_auth','02_manage_user','Management',NOW(),'admin',NULL,NULL),
 ('product_std_user_auth','05_manage_box','Management',NOW(),'admin',NULL,NULL),
 ('product_std_user_auth','07_manage_machine_name','Management',NOW(),'admin',NULL,NULL),
 ('product_std_user_auth','11_manage_download_raw_data_cho','Management',NOW(),'admin',NULL,NULL),
 ('product_std_user_auth','21_manage_download_machine_yield_cho','Management',NOW(),'admin',NULL,NULL),

 -- EquipMonitor
 ('product_std_user_auth','02_plant_area_monitor_cho','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('product_std_user_auth','03_management_plant','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('sys_user_auth','02_plant_area_monitor_cho','EquipMonitor',NOW(),'admin',NULL,NULL),

  -- UtilizationStd
 ('product_std_user_auth','05_alarm_message','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('sys_user_auth','05_alarm_message','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('product_std_user_auth','10_daily_cho','UtilizationStd',NOW(),'admin',NULL,NULL);

/*!40000 ALTER TABLE `m_sys_auth_func` ENABLE KEYS */;
