--
-- Dumping data for table `m_sys_user`
--

/*!40000 ALTER TABLE `m_sys_user` DISABLE KEYS */;
INSERT INTO `m_sys_user` (`user_id`,`user_pwd`,`user_name`,`user_email`,`user_phone`,`user_address`,`pwd_error_count`,`is_valid`,`is_lock`,`is_close`,`create_time`,`create_by`,`modify_time`,`modify_by`,`language`) VALUES
 ('usertank','19ec0aa06c99086a9e11dcec9f6901f4','usertank','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('admintank','66159eddfca79f1ff9c523794a37ad5a','admintank','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw');
/*!40000 ALTER TABLE `m_sys_user` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group`
--

/*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES

 ('sys_product_std_app_alarm_group','standard version app alarm group',NOW(),'admin',NULL,NULL,0),
 -- ('sys_product_std_app_dashboard_group','standard version app dashboard group',NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_app_downtime_group','standard version app downtime group',NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_app_monitor_group','standard version app monitor group',NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_app_admin_group','standard version app admin group',NOW(),'admin',NULL,NULL,0),
 -- ('sys_product_std_app_progtransmit_group','standard version app program transmit group',NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_app_utilization_group','standard version app utilization group',NOW(),'admin',NULL,NULL,0);

/*!40000 ALTER TABLE `m_sys_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_user_group`
--

/*!40000 ALTER TABLE `m_sys_user_group` DISABLE KEYS */;
INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 
 ('usertank','sys_product_std_app_alarm_group',NOW(),'admin',NULL,NULL),
-- ('usertank','sys_product_std_app_dashboard_group',NOW(),'admin',NULL,NULL),
 ('usertank','sys_product_std_app_downtime_group',NOW(),'admin',NULL,NULL),
 ('usertank','sys_product_std_app_monitor_group',NOW(),'admin',NULL,NULL),
-- ('usertank','sys_product_std_app_progtransmit_group',NOW(),'admin',NULL,NULL),
 ('usertank','sys_product_std_app_utilization_group',NOW(),'admin',NULL,NULL),

 ('admintank','sys_product_std_app_alarm_group',NOW(),'admin',NULL,NULL),
-- ('admintank','sys_product_std_app_dashboard_group',NOW(),'admin',NULL,NULL),
 ('admintank','sys_product_std_app_downtime_group',NOW(),'admin',NULL,NULL),
 ('admintank','sys_product_std_app_monitor_group',NOW(),'admin',NULL,NULL),
-- ('admintank','sys_product_std_app_progtransmit_group',NOW(),'admin',NULL,NULL),
 ('admintank','sys_product_std_app_utilization_group',NOW(),'admin',NULL,NULL),

  
 ('admintank','sys_product_std_app_admin_group',NOW(),'admin',NULL,NULL);


--
-- Dumping data for table `m_sys_auth`
--

/*!40000 ALTER TABLE `m_sys_auth` DISABLE KEYS */;
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES

 ('sys_product_std_app_alarm_auth','standard version app alarm Auth',0,NOW(),'admin',NULL,NULL,0),
-- ('sys_product_std_app_dashboard_auth','standard version app dashboard Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_app_downtime_auth','standard version app downtime Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_app_monitor_auth','standard version app monitor Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_app_admin_auth','standard version app admin Auth',0,NOW(),'admin',NULL,NULL,0),
-- ('sys_product_std_app_progtransmit_auth','standard version app program transmit Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_app_utilization_auth','standard version app utilization Auth',0,NOW(),'admin',NULL,NULL,0);

/*!40000 ALTER TABLE `m_sys_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group_auth`
--

/*!40000 ALTER TABLE `m_sys_group_auth` DISABLE KEYS */;
INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_product_std_app_alarm_group','sys_product_std_app_alarm_auth',NOW(),'admin',NULL,NULL),
-- ('sys_product_std_app_dashboard_group','sys_product_std_app_dashboard_auth',NOW(),'admin',NULL,NULL),
 ('sys_product_std_app_downtime_group','sys_product_std_app_downtime_auth',NOW(),'admin',NULL,NULL),
 ('sys_product_std_app_monitor_group','sys_product_std_app_monitor_auth',NOW(),'admin',NULL,NULL),
 ('sys_product_std_app_admin_group','sys_product_std_app_admin_auth',NOW(),'admin',NULL,NULL),
-- ('sys_product_std_app_progtransmit_group','sys_product_std_app_progtransmit_auth',NOW(),'admin',NULL,NULL),
 ('sys_product_std_app_utilization_group','sys_product_std_app_utilization_auth',NOW(),'admin',NULL,NULL);

/*!40000 ALTER TABLE `m_sys_group_auth` ENABLE KEYS */;
