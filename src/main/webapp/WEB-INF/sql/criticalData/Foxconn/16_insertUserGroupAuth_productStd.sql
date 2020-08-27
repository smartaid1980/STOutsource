--
-- Dumping data for table `m_sys_user`
--

/*!40000 ALTER TABLE `m_sys_user` DISABLE KEYS */;
INSERT INTO `m_sys_user` (`user_id`,`user_pwd`,`user_name`,`user_email`,`user_phone`,`user_address`,`pwd_error_count`,`is_valid`,`is_lock`,`is_close`,`create_time`,`create_by`,`modify_time`,`modify_by`,`language`) VALUES
 ('@st@demo','58b6794415c781726a95e908d734a2dd','demo_pm','service@servtech.com.tw',NULL,NULL,0,0,0,1,NULL,NULL,NULL,NULL,'zh'),
 ('@st@test','699d02a1906366cd48efc72838c00d2b','fae_test','service@servtech.com.tw',NULL,NULL,0,0,0,1,NULL,NULL,NULL,NULL,'zh'),
 ('userstd','556540ce7ab9e3742f0c0189d243f858','userstd','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh'),
 ('adminstd','0167149a4094f5f41b64e8eaa11da663','adminstd','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh');
/*!40000 ALTER TABLE `m_sys_user` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group`
--

/*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES

 -- ('sys_product_std_app_dashboard_group','standard version app dashboard group',NOW(),'admin',NULL,NULL,0),
('@st@demo_group','st_demo_group','2018-07-27 09:48:00','@st@STAdmin','2018-07-27 09:59:49','@st@STAdmin',0),
('@st@maintain_group','st_fae_gtroup','2018-07-27 10:22:09','@st@STAdmin','2018-07-27 10:26:37','@st@STAdmin',0),
('sys_product_std_app_admin_group','管理员群组','2018-06-20 18:17:29','admin','2018-07-27 10:29:17','@st@STAdmin',0),
('sys_product_std_app_alarm_group','警报报表群组','2018-06-20 18:17:29','admin','2018-07-27 10:29:40','@st@STAdmin',0),
('sys_product_std_app_JJF_group','三次元报表群组','2018-07-13 20:25:00','@st@STAdmin','2018-07-27 10:30:00','@st@STAdmin',0),
('sys_product_std_app_monitor_group','监控群组','2018-06-20 18:17:29','admin','2018-07-27 10:27:58','@st@STAdmin',0),
('sys_product_std_app_progtransmit_group','程序上下传群组','2018-06-20 18:17:29','admin','2018-07-27 10:28:30','@st@STAdmin',0),
('sys_product_std_app_utilization_group','稼动报表群组','2018-06-20 18:17:29','admin','2018-07-27 10:28:52','@st@STAdmin',0);

/*!40000 ALTER TABLE `m_sys_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_user_group`
--

/*!40000 ALTER TABLE `m_sys_user_group` DISABLE KEYS */;
INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
('@st@demo','@st@demo_group',NULL,NULL,NULL,NULL),
('@st@fae','@st@maintain_group',NULL,NULL,NULL,NULL),
('@st@fae','sys_product_std_app_JJF_group',NULL,NULL,NULL,NULL),
('@st@fae','sys_product_std_app_monitor_group',NULL,NULL,NULL,NULL),
('@st@test','@st@maintain_group',NULL,NULL,NULL,NULL),
('adminstd','sys_product_std_app_admin_group',NULL,NULL,NULL,NULL),
('adminstd','sys_product_std_app_alarm_group',NULL,NULL,NULL,NULL),
('adminstd','sys_product_std_app_JJF_group',NULL,NULL,NULL,NULL),
('adminstd','sys_product_std_app_monitor_group',NULL,NULL,NULL,NULL),
('adminstd','sys_product_std_app_progtransmit_group',NULL,NULL,NULL,NULL),
('adminstd','sys_product_std_app_utilization_group',NULL,NULL,NULL,NULL),
('userstd','sys_product_std_app_alarm_group',NULL,NULL,NULL,NULL),
('userstd','sys_product_std_app_JJF_group',NULL,NULL,NULL,NULL),
('userstd','sys_product_std_app_monitor_group',NULL,NULL,NULL,NULL),
('userstd','sys_product_std_app_progtransmit_group',NULL,NULL,NULL,NULL),
('userstd','sys_product_std_app_utilization_group',NULL,NULL,NULL,NULL);


--
-- Dumping data for table `m_sys_auth`
--

/*!40000 ALTER TABLE `m_sys_auth` DISABLE KEYS */;
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES

('@st@sys_maintain_auth','maintain',NULL,'2018-07-27 09:41:22','@st@STAdmin','2018-07-27 16:38:21','@st@STAdmin',0),
('adminstd_all_brand_test','所有廠牌測試',NULL,'2018-07-19 12:20:32','@st@STAdmin','2018-07-19 13:43:56','@st@STAdmin',0),
('sys_demo_auth','demo',NULL,'2018-07-13 20:38:50','@st@STAdmin',NULL,NULL,0),
('sys_product_std_app_admin_auth','standard version app admin Auth',0,'2018-06-20 18:17:29','admin','2018-07-31 10:51:59','@st@STAdmin',0),
('sys_product_std_app_alarm_auth','standard version app alarm Auth',0,'2018-06-20 18:17:29','admin',NULL,NULL,0),
('sys_product_std_app_JJF','	standard version app admin Auth for JJF',NULL,'2018-06-29 16:45:49','@st@STAdmin','2018-07-13 20:18:42','@st@STAdmin',0),
('sys_product_std_app_mold','模具管理權限',NULL,'2018-07-04 14:14:03','@st@STAdmin','2018-07-13 20:17:06','@st@STAdmin',0),
('sys_product_std_app_monitor_auth','standard version app monitor Auth',0,'2018-06-20 18:17:29','admin','2018-07-16 16:49:16','@st@STAdmin',0),
('sys_product_std_app_progtransmit_auth','standard version app program transmit Auth',0,'2018-06-20 18:17:29','admin',NULL,NULL,0),
('sys_product_std_app_single_auth','Standard version single auth',NULL,'2018-07-13 17:41:59','@st@STAdmin','2018-07-30 11:29:46','@st@STAdmin',0),
('sys_product_std_app_utilization_auth','standard version app utilization Auth',0,'2018-06-20 18:17:29','admin',NULL,NULL,0);

/*!40000 ALTER TABLE `m_sys_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group_auth`
--

/*!40000 ALTER TABLE `m_sys_group_auth` DISABLE KEYS */;
INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
('@st@demo_group','sys_demo_auth',NULL,NULL,NULL,NULL),
('@st@demo_group','sys_product_std_app_alarm_auth',NULL,NULL,NULL,NULL),
('@st@demo_group','sys_product_std_app_JJF',NULL,NULL,NULL,NULL),
('@st@demo_group','sys_product_std_app_mold',NULL,NULL,NULL,NULL),
('@st@demo_group','sys_product_std_app_monitor_auth',NULL,NULL,NULL,NULL),
('@st@demo_group','sys_product_std_app_progtransmit_auth',NULL,NULL,NULL,NULL),
('@st@demo_group','sys_product_std_app_single_auth',NULL,NULL,NULL,NULL),
('@st@demo_group','sys_product_std_app_utilization_auth',NULL,NULL,NULL,NULL),
('@st@demo_group','sys_product_std_app_admin_auth',NULL,NULL,NULL,NULL),
('@st@maintain_group','@st@sys_maintain_auth',NULL,NULL,NULL,NULL),
('@st@maintain_group','adminstd_all_brand_test',NULL,NULL,NULL,NULL),
('@st@maintain_group','sys_product_std_app_admin_auth',NULL,NULL,NULL,NULL),
('@st@maintain_group','sys_product_std_app_alarm_auth',NULL,NULL,NULL,NULL),
('@st@maintain_group','sys_product_std_app_JJF',NULL,NULL,NULL,NULL),
('@st@maintain_group','sys_product_std_app_mold',NULL,NULL,NULL,NULL),
('@st@maintain_group','sys_product_std_app_monitor_auth',NULL,NULL,NULL,NULL),
('@st@maintain_group','sys_product_std_app_progtransmit_auth',NULL,NULL,NULL,NULL),
('@st@maintain_group','sys_product_std_app_single_auth',NULL,NULL,NULL,NULL),
('@st@maintain_group','sys_product_std_app_utilization_auth',NULL,NULL,NULL,NULL),
('sys_product_std_app_admin_group','sys_product_std_app_admin_auth',NULL,NULL,NULL,NULL),
('sys_product_std_app_alarm_group','sys_product_std_app_alarm_auth',NULL,NULL,NULL,NULL),
('sys_product_std_app_JJF_group','sys_product_std_app_JJF',NULL,NULL,NULL,NULL),
('sys_product_std_app_monitor_group','sys_product_std_app_monitor_auth',NULL,NULL,NULL,NULL),
('sys_product_std_app_progtransmit_group','sys_product_std_app_progtransmit_auth',NULL,NULL,NULL,NULL),
('sys_product_std_app_utilization_group','sys_product_std_app_utilization_auth',NULL,NULL,NULL,NULL);

/*!40000 ALTER TABLE `m_sys_group_auth` ENABLE KEYS */;
