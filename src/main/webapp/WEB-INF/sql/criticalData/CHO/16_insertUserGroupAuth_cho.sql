--
-- Dumping data for table `m_sys_user`
--

/*!40000 ALTER TABLE `m_sys_user` DISABLE KEYS */;
INSERT INTO `m_sys_user` (`user_id`,`user_pwd`,`user_name`,`user_email`,`user_phone`,`user_address`,`pwd_error_count`,`is_valid`,`is_lock`,`is_close`,`create_time`,`create_by`,`modify_time`,`modify_by`,`language`) VALUES
 ('choadmin','5e56671b368d2b34e2a22546c4a6c8f9','choadmin','','','',0,0,0,1,'2016-11-02 14:54:07','adminstd','2016-11-03 15:20:31','choadmin','zh_tw'),
 ('chouser','4e87f5a10b7a4761c8e8c3ee6359859e','chouser','','','',0,0,0,1,'2016-11-02 14:54:33','adminstd',NULL,NULL,'zh_tw');
/*!40000 ALTER TABLE `m_sys_user` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group`
--

/*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('sys_product_std_admin_group','標準版產品管理者群組','2016-10-23 16:47:04','admin','2016-11-02 15:00:03','STAdmin',0),
 ('sys_product_std_user_group','標準版產品一般使用者群組','2016-10-23 16:47:04','admin','2016-11-02 14:59:48','STAdmin',0);
/*!40000 ALTER TABLE `m_sys_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_user_group`
--

/*!40000 ALTER TABLE `m_sys_user_group` DISABLE KEYS */;
INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('choadmin','sys_product_std_admin_group',NOW(),'admin',NULL,NULL),
 ('choadmin','sys_product_std_user_group',NOW(),'admin',NULL,NULL),
 ('chouser','sys_product_std_user_group',NOW(),'admin',NULL,NULL);

--
-- Dumping data for table `m_sys_auth`
--

/*!40000 ALTER TABLE `m_sys_auth` DISABLE KEYS */;
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('product_std_user_auth','標準版產品使用者',0,'2016-10-23 16:47:04','admin','2016-12-19 12:39:59','STAdmin',0),
 ('sys_user_auth','一般使用者權限',0,'2016-10-23 16:46:55','admin','2016-11-02 14:52:23','STAdmin',0);
/*!40000 ALTER TABLE `m_sys_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group_auth`
--

/*!40000 ALTER TABLE `m_sys_group_auth` DISABLE KEYS */;
INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_product_std_admin_group','product_std_user_auth',NOW(),'admin',NULL,NULL),
 ('sys_product_std_admin_group','sys_user_auth',NOW(),'admin',NULL,NULL),
 ('sys_product_std_user_group','sys_user_auth',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_group_auth` ENABLE KEYS */;
