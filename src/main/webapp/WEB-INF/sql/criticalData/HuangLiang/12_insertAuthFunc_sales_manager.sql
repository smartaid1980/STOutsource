--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES

-- HuangLiangUtilizationDataMaintenance
 ('sales_manager','10_quality_detect_data_maintenance','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL),
 ('sales_manager','20_factory_service_utilization_maintenance','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL),

 -- HuangLiangUtilization
 ('sales_manager','10_daily','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sales_manager','15_downtime_report','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sales_manager','20_employee_utilization_by_machine','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sales_manager','25_product_utilization','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sales_manager','30_Quality_Utilization_by_Machine','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sales_manager','35_quality_utilization_by_employee','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sales_manager','40_quality_utilization_by_product','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sales_manager','45_calibration_record_by_machine','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sales_manager','50_calibration_record_by_product','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sales_manager','55_employee_performance','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sales_manager','60_customer_sample_analysis','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sales_manager','65_factory_service_utilization','HuangLiangUtilization',NOW(),'admin',NULL,NULL),

 -- HuangLiangMonitorApplication
 ('sales_manager','02_plant_area_monitor','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),
 ('sales_manager','03_management_plant','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),
 ('sales_manager','04_manage_machine_light','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),
 ('sales_manager','10_machine_status_query','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),
 ('sales_manager','20_part_count_merged','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),
 ('sales_manager','25_machine_status_history','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),
 ('sales_manager','30_download_raw_data','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),

 -- HuangLiangMapManagement
 ('sales_manager','01_alarm_code','HuangLiangMapManagement',NOW(),'admin',NULL,NULL),
 ('sales_manager','02_repair_item','HuangLiangMapManagement',NOW(),'admin',NULL,NULL),
 ('sales_manager','03_exam_defective_cause','HuangLiangMapManagement',NOW(),'admin',NULL,NULL),

 -- HuangLiangRepairManagement
 ('sales_manager','4_4_1_repair_checkin','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('sales_manager','4_4_2_machine_prioprity','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('sales_manager','4_4_5_repair_assign','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('sales_manager','4_4_6_repair_log_maintenance','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('sales_manager','4_4_7_repair_alert','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('sales_manager','4_4_8_repair_log_query','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),

 -- HuangLiangDataUpload
 ('sales_manager','10_employee_data_upload','HuangLiangDataUpload',NOW(),'admin',NULL,NULL),
 ('sales_manager','20_ERP_data_upload','HuangLiangDataUpload',NOW(),'admin',NULL,NULL),

 -- HuangLiangDashboard
 ('sales_manager','01_inner_dashboard','HuangLiangDashboard',NOW(),'admin',NULL,NULL),
 ('sales_manager','02_outter_dashboard','HuangLiangDashboard',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_auth_func` ENABLE KEYS */;