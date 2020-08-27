--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- HuangLiangUtilization
 ('rd_regulate','45_calibration_record_by_machine','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('rd_regulate','50_calibration_record_by_product','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('rd_regulate','60_customer_sample_analysis','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('rd_regulate','65_factory_service_utilization','HuangLiangUtilization',NOW(),'admin',NULL,NULL),

 -- HuangLiangUtilizationDataMaintenance
 ('rd_regulate','20_factory_service_utilization_maintenance','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL),
 ('rd_regulate','30_sample_editor','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL),

  -- HuangLiangRepairManagement
 ('rd_regulate','4_4_6_repair_log_maintenance','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 
 -- ProgTransmit
 ('rd_regulate','01_machines','ProgTransmit',NOW(),'admin',NULL,NULL),
 ('rd_regulate','01_machines_delete','ProgTransmit',NOW(),'admin',NULL,NULL);

/*!40000 ALTER TABLE `m_sys_auth_func` ENABLE KEYS */;