--
-- Dumping data for table `m_sys_user`
--

/*!40000 ALTER TABLE `m_sys_user` DISABLE KEYS */;
INSERT INTO `m_sys_user` (`user_id`,`user_pwd`,`user_name`,`user_email`,`user_phone`,`user_address`,`pwd_error_count`,`is_valid`,`is_lock`,`is_close`,`create_time`,`create_by`,`modify_time`,`modify_by`,`language`) VALUES
 ('@st@STAdmin','ae493914c0b1818c822e7d405df5dd2c','superAdmin','','02-25622733','台北市中山區松江路76號5樓',0,0,0,1,NOW(),'@st@STAdmin',NULL,NULL,'zh_tw');
/*!40000 ALTER TABLE `m_sys_user` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group`
--

/*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('@st@sys_super_admin_group','系統超級管理員群組',NOW(),'@st@STAdmin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group_machine`
--

INSERT INTO `m_sys_group_machine` (`group_id`,`machine_id`,`create_time`,`create_by`) VALUES
 ('@st@sys_super_admin_group','{{MACHINE_ID}}',NOW(),'@st@STAdmin');

--
-- Dumping data for table `m_sys_user_group`
--

/*!40000 ALTER TABLE `m_sys_user_group` DISABLE KEYS */;
INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@STAdmin','@st@sys_super_admin_group',NOW(),'@st@STAdmin',NULL,NULL);

--
-- Dumping data for table `m_sys_auth`
--

/*!40000 ALTER TABLE `m_sys_auth` DISABLE KEYS */;
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('@st@sys_super_admin_auth','系統超級管理員權限',0,NOW(),'@st@STAdmin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group_auth`
--

/*!40000 ALTER TABLE `m_sys_group_auth` DISABLE KEYS */;
INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@sys_super_admin_group','@st@sys_super_admin_auth',NOW(),'@st@STAdmin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_group_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_d_group`
--

/*!40000 ALTER TABLE `m_sys_d_group` DISABLE KEYS */;
INSERT INTO `m_sys_d_group` (`d_group_id`,`d_group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('@st@sys_super_admin_group','系統超級管理員群組',NOW(),'@st@STAdmin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_d_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_user_d_group`
--

/*!40000 ALTER TABLE `m_sys_user_d_group` DISABLE KEYS */;
INSERT INTO `m_sys_user_d_group` (`user_id`,`d_group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@STAdmin','@st@sys_super_admin_group',NOW(),'@st@STAdmin',NULL,NULL);

--
-- Dumping data for table `m_sys_d_auth`
--

/*!40000 ALTER TABLE `m_sys_d_auth` DISABLE KEYS */;
INSERT INTO `m_sys_d_auth` (`d_auth_id`,`d_auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('@st@sys_super_admin_auth','系統超級管理員權限',0,NOW(),'@st@STAdmin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_d_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_d_group_d_auth`
--

/*!40000 ALTER TABLE `m_sys_d_group_d_auth` DISABLE KEYS */;
INSERT INTO `m_sys_d_group_d_auth` (`d_group_id`,`d_auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@sys_super_admin_group','@st@sys_super_admin_auth',NOW(),'@st@STAdmin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_d_group_d_auth` ENABLE KEYS */;