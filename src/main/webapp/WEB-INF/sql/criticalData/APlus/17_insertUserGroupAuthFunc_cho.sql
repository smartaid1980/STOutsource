--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
-- APlusAlarmDiagnosis
('a_plus_user_auth','01_alarm_diagnosis','APlusAlarmDiagnosis',NOW(),'admin',NULL,NULL),
('a_plus_user_auth','02_alarm_log','APlusAlarmDiagnosis',NOW(),'admin',NULL,NULL),

 -- APlusEquipMonitor
 ('a_plus_user_auth','00_overall','APlusEquipMonitor',NOW(),'admin',NULL,NULL),
 ('a_plus_user_auth','00_overall_card','APlusEquipMonitor',NOW(),'admin',NULL,NULL),
 ('a_plus_user_auth','00_overall_edit','APlusEquipMonitor',NOW(),'admin',NULL,NULL),
 ('a_plus_user_auth','01_info_production_line','APlusEquipMonitor',NOW(),'admin',NULL,NULL),
 ('a_plus_user_auth','01_info_production_line_edit','APlusEquipMonitor',NOW(),'admin',NULL,NULL),
 ('a_plus_user_auth','02_plant_area_monitor_a_plus','APlusEquipMonitor',NOW(),'admin',NULL,NULL),
 ('a_plus_user_auth','03_management_plant','APlusEquipMonitor',NOW(),'admin',NULL,NULL),

 -- APlusLineChart
 ('a_plus_user_auth','01_realtime_line_chart','APlusLineChart',NOW(),'admin',NULL,NULL),
 ('a_plus_user_auth','02_history_line_chart','APlusLineChart',NOW(),'admin',NULL,NULL),
 ('a_plus_user_auth','03_spc','APlusLineChart',NOW(),'admin',NULL,NULL),
 
  -- APlusUtilizationStd
 ('a_plus_user_auth','10_daily','APlusUtilizationStd',NOW(),'admin',NULL,NULL),
 ('a_plus_user_auth','70_device_status_statistic','APlusUtilizationStd',NOW(),'admin',NULL,NULL),

   -- Management
  ('a_plus_user_auth','23_manage_a_plus_user_machine_param','Management',NOW(),'admin',NULL,NULL),
  ('a_plus_user_auth','24_manage_a_plus_template_machine_upload','Management',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_auth_func` ENABLE KEYS */;
