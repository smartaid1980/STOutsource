INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('40_n6_grouper','HuangLiangMonitorApplication','N6歷史紀錄查詢','null');

 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
  ('sys_manager_auth','40_n6_grouper','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),
  ('sys_super_admin_auth','40_n6_grouper','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL);