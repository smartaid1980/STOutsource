--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES

 -- 需求單查詢
 ('group_auth','10_search_demandlist','FeedbackDemandListManagement',NOW(),'admin',NULL,NULL),
 ('user_auth','10_search_demandlist','FeedbackDemandListManagement',NOW(),'admin',NULL,NULL),
 ('standard_auth','10_search_demandlist','FeedbackDemandListManagement',NOW(),'admin',NULL,NULL),
 ('quotation_auth','10_search_demandlist','FeedbackDemandListManagement',NOW(),'admin',NULL,NULL),
 ('confidential_auth','10_search_demandlist','FeedbackDemandListManagement',NOW(),'admin',NULL,NULL),

 -- 管理
 ('group_auth','02_manage_user','Management',NOW(),'admin',NULL,NULL),
 ('group_auth','03_manage_group','Management',NOW(),'admin',NULL,NULL);