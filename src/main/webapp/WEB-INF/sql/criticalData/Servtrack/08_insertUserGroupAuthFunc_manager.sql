--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES


-- Servtrack
 ('servtrack_manager_auth','10_product_process_quality','ServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','20_work_quality','ServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','30_work_process','ServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','40_line_oee','ServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','50_line_oee_day','ServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','51_line_use_day','ServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','60_operating_performance_strongled','ServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','70_tracking_no_move_out','ServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','71_invalid_line_status_no_end','ServTrack',NOW(),'admin',NULL,NULL),

 -- StrongLEDKPI
 ('servtrack_manager_auth','10_yield_rate_statistics','StrongLEDKPI',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','11_defective_reason_analysis','StrongLEDKPI',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','20_invalid_person_statistics','StrongLEDKPI',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','21_invalid_person_analysis','StrongLEDKPI',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','30_change_line_human_time_statistics','StrongLEDKPI',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','31_change_line_human_time_analysis','StrongLEDKPI',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','40_efficiency_statistics','StrongLEDKPI',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','41_efficiency_analysis','StrongLEDKPI',NOW(),'admin',NULL,NULL),
 
 -- Dashboard
 ('servtrack_manager_auth','20_servtrack','Dashboard',NOW(),'admin',NULL,NULL);