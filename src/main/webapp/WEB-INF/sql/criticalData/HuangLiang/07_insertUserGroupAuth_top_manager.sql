--
-- Dumping data for table `m_sys_user`
--

/*!40000 ALTER TABLE `m_sys_user` DISABLE KEYS */;
INSERT INTO `m_sys_user` (`user_id`,`user_pwd`,`user_name`,`user_email`,`user_phone`,`user_address`,`pwd_error_count`,`is_valid`,`is_lock`,`is_close`,`create_time`,`create_by`,`modify_time`,`modify_by`,`language`) VALUES
 ('00011','85cf77b36c41e3f038dd4883f71bca2f','薛欉','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00031','9cfb5f23ee109818209226896f626430','張成勤','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00051','cee32a9d33c356e8074247f817690fca','林國賓','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00071','185d0aca65e6cd93f367816f832435b6','張金瓊','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00101','d7237b047f3987b7aa9a7741e539ce76','蘇蒼恩','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00111','f9405b0a9a1bbde9adcb9ec6e2048769','蘇靜雯','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00711','3e70fb332eaf9235a1cd69c7f3505e0c','李仁貴','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('01121','09cebede4af0d4132c15c26dab7f641c','李仁義','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('01431','9473a158bc3d0a2be5ea7f871e06284b','薛仲貴','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw');
 /*!40000 ALTER TABLE `m_sys_user` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group`
--

/*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES 
 ('top_manager','高階主管群組',NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_user_group`
--

/*!40000 ALTER TABLE `m_sys_user_group` DISABLE KEYS */;
INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('00011','top_manager',NOW(),'admin',NULL,NULL),
 ('00031','top_manager',NOW(),'admin',NULL,NULL),
 ('00051','top_manager',NOW(),'admin',NULL,NULL),
 ('00071','top_manager',NOW(),'admin',NULL,NULL),
 ('00101','top_manager',NOW(),'admin',NULL,NULL),
 ('00111','top_manager',NOW(),'admin',NULL,NULL),
 ('00711','top_manager',NOW(),'admin',NULL,NULL),
 ('01121','top_manager',NOW(),'admin',NULL,NULL),
 ('01431','top_manager',NOW(),'admin',NULL,NULL);

--
-- Dumping data for table `m_sys_auth`
--

/*!40000 ALTER TABLE `m_sys_auth` DISABLE KEYS */;
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('top_manager','高階主管',0,NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group_auth`
--

/*!40000 ALTER TABLE `m_sys_group_auth` DISABLE KEYS */;
INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('top_manager','top_manager',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_group_auth` ENABLE KEYS */;
