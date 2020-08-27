--
-- Dumping data for table `m_sys_user`
--

/*!40000 ALTER TABLE `m_sys_user` DISABLE KEYS */;
INSERT INTO `m_sys_user` (`user_id`,`user_pwd`,`user_name`,`user_email`,`user_phone`,`user_address`,`pwd_error_count`,`is_valid`,`is_lock`,`is_close`,`create_time`,`create_by`,`modify_time`,`modify_by`,`language`) VALUES
 ('userstd','556540ce7ab9e3742f0c0189d243f858','userstd','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('adminstd','0167149a4094f5f41b64e8eaa11da663','adminstd','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw');
/*!40000 ALTER TABLE `m_sys_user` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group`
--

/*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('sys_product_std_user_group','標準版產品一般使用者群組',NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_admin_group','標準版產品管理者群組',NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_user_group`
--

/*!40000 ALTER TABLE `m_sys_user_group` DISABLE KEYS */;
INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('userstd','sys_product_std_user_group',NOW(),'admin',NULL,NULL),
 ('adminstd','sys_product_std_admin_group',NOW(),'admin',NULL,NULL);

--
-- Dumping data for table `m_sys_auth`
--

/*!40000 ALTER TABLE `m_sys_auth` DISABLE KEYS */;
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('product_std_user_auth','標準版產品使用者',0,NOW(),'admin',NULL,NULL,0),
 ('product_std_admin_auth','標準版產品管理者',0,NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group_auth`
--

/*!40000 ALTER TABLE `m_sys_group_auth` DISABLE KEYS */;
INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_product_std_user_group','product_std_user_auth',NOW(),'admin',NULL,NULL),
 ('sys_product_std_admin_group','product_std_user_auth',NOW(),'admin',NULL,NULL),
 ('sys_product_std_admin_group','product_std_admin_auth',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_group_auth` ENABLE KEYS */;
