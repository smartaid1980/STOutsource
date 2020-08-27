--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
-- AlarmHistory
 ('product_std_user_auth','01_cncscanByCode','AlarmHistory',NOW(),'admin',NULL,NULL),
 ('product_std_user_auth','02_cncscanByMachine','AlarmHistory',NOW(),'admin',NULL,NULL),


-- Dashboard
 ('product_std_user_auth','01_dashboard','Dashboard',NOW(),'admin',NULL,NULL),


-- EquipMonitor
 ('product_std_user_auth','02_plant_area_monitor','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('product_std_admin_auth','03_management_plant','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('product_std_admin_auth','04_manage_machine_light','EquipMonitor',NOW(),'admin',NULL,NULL),


-- Management
 ('product_std_admin_auth','02_manage_user','Management',NOW(),'admin',NULL,NULL),
 ('product_std_admin_auth','08_manage_shift','Management',NOW(),'admin',NULL,NULL),
 ('product_std_admin_auth','16_manage_alarm','Management',NOW(),'admin',NULL,NULL),


-- ProgTransmit
 ('product_std_user_auth','01_machines','ProgTransmit',NOW(),'admin',NULL,NULL),
 ('product_std_user_auth','02_cnc_download','ProgTransmit',NOW(),'admin',NULL,NULL),
 ('product_std_user_auth','03_cnc_upload','ProgTransmit',NOW(),'admin',NULL,NULL),

-- FFG HeatCopensatory
 ('product_std_user_auth','10_FFG_heat_compensatoryCurrent','FFGHeatCompensatory',NOW(),'admin',NULL,NULL),
 ('product_std_user_auth','20_FFG_heat_compensatoryHistory','FFGHeatCompensatory',NOW(),'admin',NULL,NULL),

-- FFGChatterAnalysis
 ('product_std_user_auth','10_chatter','FFGChatterAnalysis',NOW(),'admin',NULL,NULL),
 ('product_std_user_auth','20_normal','FFGChatterAnalysis',NOW(),'admin',NULL,NULL),
 ('product_std_user_auth','30_merged','FFGChatterAnalysis',NOW(),'admin',NULL,NULL),

-- UtilizationStd
 ('product_std_user_auth','10_daily','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('product_std_user_auth','20_monthly','UtilizationStd',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_auth_func` ENABLE KEYS */;