--
-- Dumping data for table `m_sys_user`
--

/*!40000 ALTER TABLE `m_sys_user` DISABLE KEYS */;
INSERT INTO `m_sys_user` (`user_id`,`user_pwd`,`user_name`,`user_email`,`user_phone`,`user_address`,`pwd_error_count`,`is_valid`,`is_lock`,`is_close`,`create_time`,`create_by`,`modify_time`,`modify_by`,`language`) VALUES
 ('userdigi','f93931d6c1080f2573409cd3c620565d','userdigi','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'en'),
 ('admindigi','5ad028bdbbb71c81f21b11b0a6e81499','admindigi','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'en');
/*!40000 ALTER TABLE `m_sys_user` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group`
--

/*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('sys_digiFAC_T1_app_alarm_group','digiFAC Type1 app alarm group',NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_dashboard_group','digiFAC Type1 app dashboard group',NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_downtime_group','digiFAC Type1 app downtime group',NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_monitor_group','digiFAC Type1 app monitor group',NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_admin_group','digiFAC Type1 app admin group',NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_progtransmit_group','digiFAC Type1 app program transmit group',NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_tool_manager_group','digiFAC Type1 app tool manager group',NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_enhancementManagement_group','digiFAC Type1 app enhancement management',NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_utilization_group','digiFAC Type1 app utilization group',NOW(),'admin',NULL,NULL,0),
 ('axis_feed_report_group','digiFAC Type1 app axis feed report group',NOW(),'admin',NULL,NULL,0),
 ('daily_production_info_group','digiFAC Type1 app daily production info group','2018-11-27 10:50:42','@st@STAdmin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_user_group`
--

/*!40000 ALTER TABLE `m_sys_user_group` DISABLE KEYS */;
INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('userdigi','sys_digiFAC_T1_app_alarm_group',NOW(),'admin',NULL,NULL),
 ('userdigi','sys_digiFAC_T1_app_dashboard_group',NOW(),'admin',NULL,NULL),
 ('userdigi','sys_digiFAC_T1_app_downtime_group',NOW(),'admin',NULL,NULL),
 ('userdigi','sys_digiFAC_T1_app_monitor_group',NOW(),'admin',NULL,NULL),
 ('userdigi','sys_digiFAC_T1_app_progtransmit_group',NOW(),'admin',NULL,NULL),
 ('userdigi','sys_digiFAC_T1_app_tool_manager_group',NOW(),'admin',NULL,NULL),
 ('userdigi','sys_digiFAC_T1_app_enhancementManagement_group',NOW(),'admin',NULL,NULL),
 ('userdigi','sys_digiFAC_T1_app_utilization_group',NOW(),'admin',NULL,NULL),
 ('userdigi','daily_production_info_group',NULL,NULL,NULL,NULL),
 ('userdigi','axis_feed_report_group',NULL,NULL,NULL,NULL),

 ('admindigi','daily_production_info_group',NULL,NULL,NULL,NULL),
 ('admindigi','sys_digiFAC_T1_app_alarm_group',NOW(),'admin',NULL,NULL),
 ('admindigi','sys_digiFAC_T1_app_dashboard_group',NOW(),'admin',NULL,NULL),
 ('admindigi','sys_digiFAC_T1_app_downtime_group',NOW(),'admin',NULL,NULL),
 ('admindigi','sys_digiFAC_T1_app_monitor_group',NOW(),'admin',NULL,NULL),
 ('admindigi','sys_digiFAC_T1_app_progtransmit_group',NOW(),'admin',NULL,NULL),
 ('admindigi','sys_digiFAC_T1_app_tool_manager_group',NOW(),'admin',NULL,NULL),
 ('admindigi','sys_digiFAC_T1_app_utilization_group',NOW(),'admin',NULL,NULL),
 ('admindigi','sys_digiFAC_T1_app_enhancementManagement_group',NOW(),'admin',NULL,NULL),
 ('admindigi','axis_feed_report_group',NOW(),'admin',NULL,NULL),
 
 ('admindigi','sys_digiFAC_T1_app_admin_group',NOW(),'admin',NULL,NULL);

--
-- Dumping data for table `m_sys_auth`
--

/*!40000 ALTER TABLE `m_sys_auth` DISABLE KEYS */;
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES

 ('sys_digiFAC_T1_app_alarm_auth','digiFAC Type1 app alarm Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_dashboard_auth','digiFAC Type1 app dashboard Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_downtime_auth','digiFAC Type1 app downtime Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_monitor_auth','digiFAC Type1 app monitor Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_admin_auth','digiFAC Type1 app admin Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_progtransmit_auth','digiFAC Type1 app program transmit Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_tool_manager_auth','digiFAC Type1 app tool manager Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_enhancementManagement_auth','digiFAC Type1 app enhancement management Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_utilization_auth','digiFAC Type1 app utilization Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_axis_feed_report_auth','digiFAC Type1 app axis feed report Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_digiFAC_T1_app_daily_production_info_auth','digiFAC Type1 app daily production info Auth',NULL,'2018-11-27 10:48:45','@st@STAdmin',NULL,NULL,0);
 


/*!40000 ALTER TABLE `m_sys_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group_auth`
--

/*!40000 ALTER TABLE `m_sys_group_auth` DISABLE KEYS */;
INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_digiFAC_T1_app_alarm_group','sys_digiFAC_T1_app_alarm_auth',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_dashboard_group','sys_digiFAC_T1_app_dashboard_auth',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_downtime_group','sys_digiFAC_T1_app_downtime_auth',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_monitor_group','sys_digiFAC_T1_app_monitor_auth',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_admin_group','sys_digiFAC_T1_app_admin_auth',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_progtransmit_group','sys_digiFAC_T1_app_progtransmit_auth',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_tool_manager_group','sys_digiFAC_T1_app_tool_manager_auth',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_enhancementManagement_group','sys_digiFAC_T1_app_enhancementManagement_auth',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_utilization_group','sys_digiFAC_T1_app_utilization_auth',NOW(),'admin',NULL,NULL),
 ('axis_feed_report_group','sys_digiFAC_T1_app_axis_feed_report_auth',NOW(),'admin',NULL,NULL),
 ('daily_production_info_group','sys_digiFAC_T1_app_daily_production_info_auth',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `m_sys_group_auth` ENABLE KEYS */;
