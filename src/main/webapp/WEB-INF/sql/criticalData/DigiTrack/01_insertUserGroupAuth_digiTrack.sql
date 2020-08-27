--
-- Dumping data for table `m_sys_user`
--

/*!40000 ALTER TABLE `m_sys_user` DISABLE KEYS */;
INSERT INTO `m_sys_user` (`user_id`,`user_pwd`,`user_name`,`user_email`,`user_phone`,`user_address`,`pwd_error_count`,`is_valid`,`is_lock`,`is_close`,`create_time`,`create_by`,`modify_time`,`modify_by`,`language`) VALUES 
 ('admin','21232f297a57a5a743894a0e4a801fc3','admin','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'en'),
 ('manager','1d0258c2440a8d19e716292b231e3190','manager','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'en'),
 ('dispatcher','88d80b2cd970564d2ff87ae63dc2ba13','dispatcher','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'en');
/*!40000 ALTER TABLE `m_sys_user` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group`
--

/*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('sys_servtrack_admin_group','ServTrack system management',NOW(),'admin',NULL,NULL,0),
 ('sys_servtrack_manager_group','ServTrack report',NOW(),'admin',NULL,NULL,0),
 ('sys_servtrack_dispatcher_group','ServTrack dispatch',NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_user_group`
--

/*!40000 ALTER TABLE `m_sys_user_group` DISABLE KEYS */;
INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('admin','sys_servtrack_admin_group',NOW(),'admin',NULL,NULL),
 ('admin','sys_servtrack_manager_group',NOW(),'admin',NULL,NULL),
 ('admin','sys_servtrack_dispatcher_group',NOW(),'admin',NULL,NULL),
 ('manager','sys_servtrack_manager_group',NOW(),'admin',NULL,NULL),
 ('dispatcher','sys_servtrack_dispatcher_group',NOW(),'admin',NULL,NULL);
--
-- Dumping data for table `m_sys_auth`
--

/*!40000 ALTER TABLE `m_sys_auth` DISABLE KEYS */;
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('servtrack_admin_auth','System administrator',0,NOW(),'admin',NULL,NULL,0),
 ('servtrack_manager_auth','Manager',0,NOW(),'admin',NULL,NULL,0),
 ('servtrack_dispatcher_auth','Dispatcher',0,NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group_auth`
--

/*!40000 ALTER TABLE `m_sys_group_auth` DISABLE KEYS */;
INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_servtrack_admin_group','servtrack_admin_auth',NOW(),'admin',NULL,NULL),
 ('sys_servtrack_manager_group','servtrack_manager_auth',NOW(),'admin',NULL,NULL),
 ('sys_servtrack_dispatcher_group','servtrack_dispatcher_auth',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_group_auth` ENABLE KEYS */;