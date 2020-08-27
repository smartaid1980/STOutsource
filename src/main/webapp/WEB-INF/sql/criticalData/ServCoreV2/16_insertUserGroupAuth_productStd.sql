--
-- Dumping data for table `m_sys_user`
--

/*!40000 ALTER TABLE `m_sys_user` DISABLE KEYS */;
INSERT INTO `m_sys_user` (`user_id`,`user_pwd`,`user_name`,`user_email`,`user_phone`,`user_address`,`pwd_error_count`,`is_valid`,`is_lock`,`is_close`,`create_time`,`create_by`,`modify_time`,`modify_by`,`language`) VALUES
 ('@st@demo','58b6794415c781726a95e908d734a2dd','demo_pm','service@servtech.com.tw',NULL,NULL,0,0,0,1,NULL,NULL,NULL,NULL,'zh_tw'),
 ('@st@test','699d02a1906366cd48efc72838c00d2b','fae_test','service@servtech.com.tw',NULL,NULL,0,0,0,1,NULL,NULL,NULL,NULL,'zh_tw'),
 ('userstd','556540ce7ab9e3742f0c0189d243f858','userstd','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('adminstd','0167149a4094f5f41b64e8eaa11da663','adminstd','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw');
/*!40000 ALTER TABLE `m_sys_user` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group`
--

/*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES

 ('sys_product_std_app_alarm_group','standard version app alarm group',NOW(),'admin',NULL,NULL,0),
 -- ('sys_product_std_app_dashboard_group','standard version app dashboard group',NOW(),'admin',NULL,NULL,0),
--  ('sys_product_std_app_dashboard_demo_group','standard version app dashboard demo group',NOW(),'admin',NULL,NULL,0),
--  ('sys_app_func_bind_brand_group','standard version app func bind brand group',NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_app_monitor_group','standard version app monitor group',NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_app_admin_group','standard version app admin group',NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_app_progtransmit_group','standard version app program transmit group',NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_app_utilization_group','standard version app utilization group',NOW(),'admin',NULL,NULL,0);

/*!40000 ALTER TABLE `m_sys_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_user_group`
--

/*!40000 ALTER TABLE `m_sys_user_group` DISABLE KEYS */;
INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@test','sys_product_std_app_alarm_group',NOW(),'admin',NULL,NULL),
 ('@st@test','sys_product_std_app_monitor_group',NOW(),'admin',NULL,NULL),
 ('@st@test','sys_product_std_app_progtransmit_group',NOW(),'admin',NULL,NULL),
 ('@st@test','sys_product_std_app_utilization_group',NOW(),'admin',NULL,NULL),
--  ('@st@test','sys_product_std_app_dashboard_demo_group',NOW(),'admin',NULL,NULL),
 ('@st@test','sys_product_std_app_admin_group',NOW(),'admin',NULL,NULL),
--  ('@st@test','sys_app_func_bind_brand_group',NOW(),'admin',NULL,NULL),

 ('@st@demo','sys_product_std_app_alarm_group',NOW(),'admin',NULL,NULL),
 ('@st@demo','sys_product_std_app_monitor_group',NOW(),'admin',NULL,NULL),
 ('@st@demo','sys_product_std_app_progtransmit_group',NOW(),'admin',NULL,NULL),
 ('@st@demo','sys_product_std_app_utilization_group',NOW(),'admin',NULL,NULL),
 ('@st@demo','sys_product_std_app_admin_group',NOW(),'admin',NULL,NULL),
--  ('@st@demo','sys_product_std_app_dashboard_demo_group',NOW(),'admin',NULL,NULL),

/* ('@st@sa','sys_product_std_app_alarm_group',NOW(),'admin',NULL,NULL),
 ('@st@sa','sys_product_std_app_monitor_group',NOW(),'admin',NULL,NULL),
 ('@st@sa','sys_product_std_app_progtransmit_group',NOW(),'admin',NULL,NULL),
 ('@st@sa','sys_product_std_app_utilization_group',NOW(),'admin',NULL,NULL),
 ('@st@sa','sys_product_std_app_admin_group',NOW(),'admin',NULL,NULL),
*/
 ('userstd','sys_product_std_app_alarm_group',NOW(),'admin',NULL,NULL),
 -- ('userstd','sys_product_std_app_dashboard_group',NOW(),'admin',NULL,NULL),
 ('userstd','sys_product_std_app_monitor_group',NOW(),'admin',NULL,NULL),
 ('userstd','sys_product_std_app_progtransmit_group',NOW(),'admin',NULL,NULL),
 ('userstd','sys_product_std_app_utilization_group',NOW(),'admin',NULL,NULL),

 ('adminstd','sys_product_std_app_alarm_group',NOW(),'admin',NULL,NULL),
 -- ('adminstd','sys_product_std_app_dashboard_group',NOW(),'admin',NULL,NULL),
 ('adminstd','sys_product_std_app_monitor_group',NOW(),'admin',NULL,NULL),
 ('adminstd','sys_product_std_app_progtransmit_group',NOW(),'admin',NULL,NULL),
 ('adminstd','sys_product_std_app_utilization_group',NOW(),'admin',NULL,NULL),

  
 ('adminstd','sys_product_std_app_admin_group',NOW(),'admin',NULL,NULL);


--
-- Dumping data for table `m_sys_auth`
--

/*!40000 ALTER TABLE `m_sys_auth` DISABLE KEYS */;
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES

 ('sys_product_std_app_alarm_auth','standard version app alarm Auth',0,NOW(),'admin',NULL,NULL,0),
--  ('sys_product_std_app_dashboard_demo_auth','standard version app dashboard demo Auth',0,NOW(),'admin',NULL,NULL,0),
--  ('sys_app_func_bind_brand_auth','standard version app func bind brand Auth',0,NOW(),'admin',NULL,NULL,0),
 -- ('sys_product_std_app_dashboard_auth','standard version app dashboard Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_app_monitor_auth','standard version app monitor Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_app_admin_auth','standard version app admin Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_app_progtransmit_auth','standard version app program transmit Auth',0,NOW(),'admin',NULL,NULL,0),
 ('sys_product_std_app_utilization_auth','standard version app utilization Auth',0,NOW(),'admin',NULL,NULL,0);

/*!40000 ALTER TABLE `m_sys_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group_auth`
--

/*!40000 ALTER TABLE `m_sys_group_auth` DISABLE KEYS */;
INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_product_std_app_alarm_group','sys_product_std_app_alarm_auth',NOW(),'admin',NULL,NULL),
-- ('sys_product_std_app_dashboard_group','sys_product_std_app_dashboard_auth',NOW(),'admin',NULL,NULL),
--  ('sys_product_std_app_dashboard_demo_group','sys_product_std_app_dashboard_demo_auth',NOW(),'admin',NULL,NULL),
--  ('sys_app_func_bind_brand_group','sys_app_func_bind_brand_auth',NULL,NULL,NULL,NULL),
 ('sys_product_std_app_monitor_group','sys_product_std_app_monitor_auth',NOW(),'admin',NULL,NULL),
 ('sys_product_std_app_admin_group','sys_product_std_app_admin_auth',NOW(),'admin',NULL,NULL),
 ('sys_product_std_app_progtransmit_group','sys_product_std_app_progtransmit_auth',NOW(),'admin',NULL,NULL),
 ('sys_product_std_app_utilization_group','sys_product_std_app_utilization_auth',NOW(),'admin',NULL,NULL);

/*!40000 ALTER TABLE `m_sys_group_auth` ENABLE KEYS */;
