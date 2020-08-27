--
-- Dumping data for table `m_sys_user`
--

/*!40000 ALTER TABLE `m_sys_user` DISABLE KEYS */;
INSERT INTO `m_sys_user` (`user_id`,`user_pwd`,`user_name`,`user_email`,`user_phone`,`user_address`,`pwd_error_count`,`is_valid`,`is_lock`,`is_close`,`create_time`,`create_by`,`modify_time`,`modify_by`,`language`) VALUES 
 ('Eric','77dcd555f38b965d220a13a3bb080260','採購主管','eric@fb.com.tw','02-538-4900','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('julia','c2e285cb33cecdbeb83d2189e983a8c0','侯小姐','Julia@fb.com.tw','02-538-4900','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('Joe','3a368818b7341d48660e8dd6c5a77dbe','喬先生','joe@fb.com.tw','02-538-4900','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('Geo','22efe938b50b35a563efae8206061af1','江副理','geo@fb.com.tw','02-538-4900','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw');
/*!40000 ALTER TABLE `m_sys_user` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group`
--

/*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('admin_group','管理員群組',NOW(),'admin',NULL,NULL,0),
 ('classified_group','機密群組',NOW(),'admin',NULL,NULL,0),
 ('po_group','採購群組',NOW(),'admin',NULL,NULL,0),
 ('mis_group','資訊群組',NOW(),'admin',NULL,NULL,0),
 ('pe_group','工程群組',NOW(),'admin',NULL,NULL,0),
 ('qc_group','品保群組',NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_user_group`
--

/*!40000 ALTER TABLE `m_sys_user_group` DISABLE KEYS */;
INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('Eric','admin_group',NOW(),'admin',NULL,NULL),
 ('Eric','classified_group',NOW(),'admin',NULL,NULL),
 ('Geo','admin_group',NOW(),'admin',NULL,NULL),
 ('julia','po_group',NOW(),'admin',NULL,NULL),
 ('Eric','po_group',NOW(),'admin',NULL,NULL),
 ('Joe','po_group',NOW(),'admin',NULL,NULL),
 ('Geo','mis_group',NOW(),'admin',NULL,NULL);

--
-- Dumping data for table `m_sys_auth`
--

/*!40000 ALTER TABLE `m_sys_auth` DISABLE KEYS */;
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('group_auth','管理群組',0,NOW(),'admin',NULL,NULL,0),
 ('user_auth','管理使用者',0,NOW(),'admin',NULL,NULL,0),
 ('standard_auth','基本權限',0,NOW(),'admin',NULL,NULL,0),
 ('quotation_auth','報價權限',0,NOW(),'admin',NULL,NULL,0),
 ('confidential_auth','機密權限',0,NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group_auth`
--

/*!40000 ALTER TABLE `m_sys_group_auth` DISABLE KEYS */;
INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('admin_group','group_auth',NOW(),'admin',NULL,NULL),
 ('admin_group','user_auth',NOW(),'admin',NULL,NULL),
 ('admin_group','standard_auth',NOW(),'admin',NULL,NULL),
 ('classified_group','standard_auth',NOW(),'admin',NULL,NULL),
 ('classified_group','confidential_auth',NOW(),'admin',NULL,NULL),
 ('po_group','standard_auth',NOW(),'admin',NULL,NULL),
 ('po_group','quotation_auth',NOW(),'admin',NULL,NULL),
 ('mis_group','group_auth',NOW(),'admin',NULL,NULL),
 ('mis_group','user_auth',NOW(),'admin',NULL,NULL),
 ('mis_group','standard_auth',NOW(),'admin',NULL,NULL),
 ('pe_group','standard_auth',NOW(),'admin',NULL,NULL),
 ('qc_group','standard_auth',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_group_auth` ENABLE KEYS */;