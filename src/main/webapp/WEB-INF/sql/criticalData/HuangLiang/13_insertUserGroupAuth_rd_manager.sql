--
-- Dumping data for table `m_sys_user`
--

/*!40000 ALTER TABLE `m_sys_user` DISABLE KEYS */;
INSERT INTO `m_sys_user` (`user_id`,`user_pwd`,`user_name`,`user_email`,`user_phone`,`user_address`,`pwd_error_count`,`is_valid`,`is_lock`,`is_close`,`create_time`,`create_by`,`modify_time`,`modify_by`,`language`) VALUES
 ('00151','fb1907d20c52617bff0c6374b55a50d5','薛正立','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw');
/*!40000 ALTER TABLE `m_sys_user` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group`
--

/*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES 
 ('rd_manager','研發副理群組',NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_user_group`
--

/*!40000 ALTER TABLE `m_sys_user_group` DISABLE KEYS */;
INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('00151','rd_manager',NOW(),'admin',NULL,NULL);

--
-- Dumping data for table `m_sys_auth`
--

/*!40000 ALTER TABLE `m_sys_auth` DISABLE KEYS */;
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('rd_manager','研發副理',0,NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group_auth`
--

/*!40000 ALTER TABLE `m_sys_group_auth` DISABLE KEYS */;
INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('rd_manager','rd_manager',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_group_auth` ENABLE KEYS */;
