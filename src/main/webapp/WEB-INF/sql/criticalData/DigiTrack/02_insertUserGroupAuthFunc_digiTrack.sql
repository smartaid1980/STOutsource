--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES

-- System administrator
 ('servtrack_admin_auth','11_tablet_authority','ServTrackManagement',NOW(),'admin',NULL,NULL),
 ('servtrack_admin_auth','02_manage_user','Management',NOW(),'admin',NULL,NULL),

-- Dispatcher
  ('servtrack_dispatcher_auth','21_process_maintain_strongled','ServTrackManagement',NOW(),'admin',NULL,NULL),
  ('servtrack_dispatcher_auth','22_product_op_maintain','ServTrackManagement',NOW(),'admin',NULL,NULL),
  ('servtrack_dispatcher_auth','23_shift_time_maintain','ServTrackManagement',NOW(),'admin',NULL,NULL),
  ('servtrack_dispatcher_auth','31_line_qrcode_print','ServTrackManagement',NOW(),'admin',NULL,NULL),
  ('servtrack_dispatcher_auth','32_work','ServTrackManagement',NOW(),'admin',NULL,NULL),
  ('servtrack_dispatcher_auth','33_work_op_qrcode_print','ServTrackManagement',NOW(),'admin',NULL,NULL),
  ('servtrack_dispatcher_auth','34_line_working_hour','ServTrackManagement',NOW(),'admin',NULL,NULL),

-- Servtrack
   ('servtrack_manager_auth','10_product_process_quality','ServTrack',NOW(),'admin',NULL,NULL),
   ('servtrack_manager_auth','20_work_quality','ServTrack',NOW(),'admin',NULL,NULL),
   ('servtrack_manager_auth','30_work_process','ServTrack',NOW(),'admin',NULL,NULL),
   ('servtrack_manager_auth','40_line_oee','ServTrack',NOW(),'admin',NULL,NULL),
   ('servtrack_manager_auth','50_line_oee_day','ServTrack',NOW(),'admin',NULL,NULL),
   ('servtrack_manager_auth','60_operating_performance_strongled','ServTrack',NOW(),'admin',NULL,NULL);
