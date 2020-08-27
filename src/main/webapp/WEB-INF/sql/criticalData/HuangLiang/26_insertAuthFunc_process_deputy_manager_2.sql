--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- HuangLiangUtilization
 ('process_deputy_manager_2','65_factory_service_utilization','HuangLiangUtilization',NOW(),'admin',NULL,NULL),

 -- HuangLiangRepairManagement
 ('process_deputy_manager_2','4_4_1_repair_checkin','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('process_deputy_manager_2','4_4_2_machine_prioprity','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('process_deputy_manager_2','4_4_6_repair_log_maintenance','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('process_deputy_manager_2','4_4_7_repair_alert','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('process_deputy_manager_2','4_4_8_repair_log_query','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),

  -- HuangLiangUtilizationDataMaintenance
 ('process_deputy_manager_2','10_quality_detect_data_maintenance','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL),
 ('process_deputy_manager_2','20_factory_service_utilization_maintenance','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL), 
 ('process_deputy_manager_2','30_sample_editor','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL),

  -- HuangLiangDataUpload
 ('process_deputy_manager_2','10_employee_data_upload','HuangLiangDataUpload',NOW(),'admin',NULL,NULL),

 -- HuangLiangMonitorApplication
 ('process_deputy_manager_2','10_machine_status_query','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),
 
 -- ProgTransmit
 ('process_deputy_manager_2','01_machines','ProgTransmit',NOW(),'admin',NULL,NULL),
 ('process_deputy_manager_2','01_machines_delete','ProgTransmit',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_auth_func` ENABLE KEYS */;