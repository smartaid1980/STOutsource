--
-- Dumping data for table `m_sys_d_auth`
--

/*!40000 ALTER TABLE `m_sys_d_auth` DISABLE KEYS */;
INSERT INTO `m_sys_d_auth` (`d_auth_id`,`d_auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('sys_admin_auth','system admin auth',0,NOW(),'@st@STAdmin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_d_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_d_group`
--

/*!40000 ALTER TABLE `m_sys_d_group` DISABLE KEYS */;
INSERT INTO `m_sys_d_group` (`d_group_id`,`d_group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('sys_admin_group','system admin group',NOW(),'@st@STAdmin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_d_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_d_group_d_auth`
--

/*!40000 ALTER TABLE `m_sys_d_group_d_auth` DISABLE KEYS */;
INSERT INTO `m_sys_d_group_d_auth` (`d_group_id`,`d_auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_admin_group','sys_admin_auth',NOW(),'@st@STAdmin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_d_group_d_auth` ENABLE KEYS */;

INSERT INTO `m_sys_d_auth_dashboard` (`d_auth_id`,`dashboard_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_admin_auth','01_StatusPieChart','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('sys_admin_auth','02_EquipList_0','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('sys_admin_auth','04_Actual_Compare_Expected_Quantity_cosmos','EquipMonitor',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_d_auth_dashboard` (`d_auth_id`,`dashboard_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_admin_auth','compare_demo','UtilizationStd',NOW(),'admin',NULL,NULL);