--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES

-- KuoChuanServTrackManagement
 ('servtrack_dispatcher_auth','20_process_maintain','KuoChuanServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_dispatcher_auth','21_product_maintain','KuoChuanServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_dispatcher_auth','22_device_maintain','KuoChuanServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_dispatcher_auth','23_emp_maintain','KuoChuanServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_dispatcher_auth','31_work','KuoChuanServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_dispatcher_auth','32_invalid_device_qrcode_print','KuoChuanServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_dispatcher_auth','33_work_op_qrcode_print','KuoChuanServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_dispatcher_auth','40_time_clock_data_import','KuoChuanServTrackManagement',NOW(),'admin',NULL,NULL);
