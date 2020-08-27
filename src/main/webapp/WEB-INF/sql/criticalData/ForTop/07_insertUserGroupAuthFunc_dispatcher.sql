--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES

-- ServTrackManagement
 ('servtrack_dispatcher_auth','21_process_maintain','ServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_dispatcher_auth','22_product_op_maintain','ServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_dispatcher_auth','23_shift_time_maintain','ServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_dispatcher_auth','31_line_qrcode_print','ServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_dispatcher_auth','32_work','ServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_dispatcher_auth','33_work_op_qrcode_print','ServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_dispatcher_auth','34_line_working_hour','ServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_dispatcher_auth','50_basic_data_import','ServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_dispatcher_auth','60_work_data_import','ServTrackManagement',NOW(),'admin',NULL,NULL);

