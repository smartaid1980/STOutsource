--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES

-- HuangLiangUtilizationDataMaintenance
 ('process_manager_2','10_quality_detect_data_maintenance','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL),
 ('process_manager_2','20_factory_service_utilization_maintenance','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL),
 ('process_manager_2','30_sample_editor','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL),

 -- HuangLiangUtilization
 ('process_manager_2','10_daily','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('process_manager_2','15_downtime_report','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('process_manager_2','20_employee_utilization_by_machine','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('process_manager_2','25_product_utilization','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('process_manager_2','30_Quality_Utilization_by_Machine','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('process_manager_2','35_quality_utilization_by_employee','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('process_manager_2','40_quality_utilization_by_product','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('process_manager_2','45_calibration_record_by_machine','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('process_manager_2','50_calibration_record_by_product','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('process_manager_2','65_factory_service_utilization','HuangLiangUtilization',NOW(),'admin',NULL,NULL),

 -- HuangLiangRepairManagement
 ('process_manager_2','4_4_1_repair_checkin','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('process_manager_2','4_4_2_machine_prioprity','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('process_manager_2','4_4_6_repair_log_maintenance','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('process_manager_2','4_4_7_repair_alert','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('process_manager_2','4_4_8_repair_log_query','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),

 -- HuangLiangDataUpload
 ('process_manager_2','10_employee_data_upload','HuangLiangDataUpload',NOW(),'admin',NULL,NULL),

 -- HuangLiangDashboard
 ('process_manager_2','01_inner_dashboard','HuangLiangDashboard',NOW(),'admin',NULL,NULL),
 ('process_manager_2','02_outter_dashboard','HuangLiangDashboard',NOW(),'admin',NULL,NULL),
 
 -- ProgTransmit
 ('process_manager_2','01_machines','ProgTransmit',NOW(),'admin',NULL,NULL),
 ('process_manager_2','01_machines_delete','ProgTransmit',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_auth_func` ENABLE KEYS */;