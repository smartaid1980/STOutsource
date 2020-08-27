--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES

 -- CSU Store
 ('chengshiu_store_auth','10_storeProduct','CSUStore',NOW(),'admin',NULL,NULL),
 ('chengshiu_store_auth','20_sales','CSUStore',NOW(),'admin',NULL,NULL),
 ('chengshiu_store_auth','30_salesReport','CSUStore',NOW(),'admin',NULL,NULL),
 ('chengshiu_store_auth','40_orderManagement','CSUStore',NOW(),'admin',NULL,NULL),
 ('chengshiu_store_auth','50_productSetting','CSUStore',NOW(),'admin',NULL,NULL);