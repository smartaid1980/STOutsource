--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES

-- KuoChuan ServTrack
 ('servtrack_manager_auth','10_emp_performance','KuoChuanServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','20_emp_use','KuoChuanServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','30_oee','KuoChuanServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','40_device_use','KuoChuanServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','50_product_quality','KuoChuanServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','60_ng_quality','KuoChuanServTrack',NOW(),'admin',NULL,NULL),
 ('servtrack_manager_auth','70_move_record','KuoChuanServTrack',NOW(),'admin',NULL,NULL);
