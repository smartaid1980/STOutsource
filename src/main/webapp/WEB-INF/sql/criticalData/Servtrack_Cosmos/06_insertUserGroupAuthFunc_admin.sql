--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES


-- ServTrackManagement
 ('servtrack_admin_auth','11_tablet_authority','ServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_admin_auth','12_manage_line_group','Management',NOW(),'admin',NULL,NULL),
 ('servtrack_admin_auth','02_manage_user','Management',NOW(),'admin',NULL,NULL);
