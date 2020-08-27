--
-- Dumping data for table `m_sys_user`
--

/*!40000 ALTER TABLE `m_sys_user` DISABLE KEYS */;
INSERT INTO `m_sys_user` (`user_id`,`user_pwd`,`user_name`,`user_email`,`user_phone`,`user_address`,`pwd_error_count`,`is_valid`,`is_lock`,`is_close`,`create_time`,`create_by`,`modify_time`,`modify_by`,`language`) VALUES
 ('00611','6e8f9d3a803a189ec63065c5d4672b26','蘇柏璋','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00721','3b69a3098d4bc2f249430040a611f324','林達明','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00731','b15246d8d80a34f165ff63345b62dd2d','陳南通','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00791','371864671c8667da786551bb7645562e','崔華珊','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00841','132b50fea3ee84b4c1b036c587ab80ab','張益誌','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00991','c750aed382089ae5f8188db413b74b72','林威宇','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('01091','62f1ab511530657b53d5b1563a0cf8a7','賴則翔','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw');
 /*!40000 ALTER TABLE `m_sys_user` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group`
--

/*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES 
 ('leader','組長',NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_user_group`
--

/*!40000 ALTER TABLE `m_sys_user_group` DISABLE KEYS */;
INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('00611','leader',NOW(),'admin',NULL,NULL),
 ('00721','leader',NOW(),'admin',NULL,NULL),
 ('00731','leader',NOW(),'admin',NULL,NULL),
 ('00791','leader',NOW(),'admin',NULL,NULL),
 ('00841','leader',NOW(),'admin',NULL,NULL),
 ('00991','leader',NOW(),'admin',NULL,NULL),
 ('01091','leader',NOW(),'admin',NULL,NULL);

--
-- Dumping data for table `m_sys_auth`
--

/*!40000 ALTER TABLE `m_sys_auth` DISABLE KEYS */;
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('leader','組長',0,NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group_auth`
--

/*!40000 ALTER TABLE `m_sys_group_auth` DISABLE KEYS */;
INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('leader','leader',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_group_auth` ENABLE KEYS */;
