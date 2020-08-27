--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
-- EquipMonitor
 ('unit_user_auth','30_old_machine_list','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('unit_user_auth','31_old_machine_detail','EquipMonitor',NOW(),'admin',NULL,NULL),


-- Management
 ('unit_admin_auth','30_manage_unit_type','Management',NOW(),'admin',NULL,NULL),
 ('unit_admin_auth','31_manage_unit_param','Management',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_auth_func` ENABLE KEYS */;
