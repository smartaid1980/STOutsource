--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
-- HuangLiangUtilization
('leader','65_factory_service_utilization','HuangLiangUtilization',NOW(),'admin',NULL,NULL),

-- HuangLiangUtilizationDataMaintenance
('leader','20_factory_service_utilization_maintenance','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL),
('leader','10_quality_detect_data_maintenance','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL),

-- HuangLiangRepairManagement
('leader','4_4_6_repair_log_maintenance','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_auth_func` ENABLE KEYS */;