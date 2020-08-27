--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES


-- Servtrack
 ('servtrack_manager_auth','10_product_process_quality','ServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','20_work_quality','ServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','30_work_process_teco','ServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','40_line_oee','ServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','50_line_oee_day','ServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','51_line_use_day','ServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','60_operating_performance_teco','ServTrack',NOW(),'admin',NULL,NULL);