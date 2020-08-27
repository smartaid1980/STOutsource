--
-- Dumping data for table `m_sys_user`
--
delete from `m_sys_user` where `user_id` = 'admin';

/*!40000 ALTER TABLE `m_sys_user` DISABLE KEYS */;
INSERT INTO `m_sys_user` (`user_id`,`user_pwd`,`user_name`,`user_email`,`user_phone`,`user_address`,`pwd_error_count`,`is_valid`,`is_lock`,`is_close`,`create_time`,`create_by`,`modify_time`,`modify_by`,`language`) VALUES
 ('admin','2e12cdb953cc4e1e76fe531283b0484f','系統管理員','admin@servtech.com.tw','02-25861855','台北市中山區松江路76號5樓',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('huangliang','3f35401f60e38bfd0a52a87636419643','皇亮管理者','jimmy_song@huangliang.com','07-6166666 #171','高雄市燕巢區安林五街10號',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw');
 /*!40000 ALTER TABLE `m_sys_user` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group`
--
delete from `m_sys_group` where `group_id` = 'sys_manager_group';

/*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('sys_manager_group','系統管理員群組',NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_user_group`
--

/*!40000 ALTER TABLE `m_sys_user_group` DISABLE KEYS */;
INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('admin','sys_manager_group',NOW(),'admin',NULL,NULL),
 ('huangliang','sys_manager_group',NOW(),'admin',NULL,NULL);

--
-- Dumping data for table `m_sys_auth`
--
delete from `m_sys_auth` where `auth_id` = 'sys_manager_auth';

/*!40000 ALTER TABLE `m_sys_auth` DISABLE KEYS */;
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('sys_manager_auth','系統管理員',0,NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group_auth`
--

/*!40000 ALTER TABLE `m_sys_group_auth` DISABLE KEYS */;
INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_manager_group','sys_manager_auth',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_group_auth` ENABLE KEYS */;
