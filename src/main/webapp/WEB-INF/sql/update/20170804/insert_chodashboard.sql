 -- CHODashboard
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CHODashboard','i18n_ServCloud_RotateDashboard',1,'Dashboard.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_dashboard','CHODashboard','i18n_ServCloud_RotateDashboard','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CHODashboard','20140918000999',NOW(),'admin');

 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CHODashBoard
 ('sys_super_admin_auth','01_dashboard','CHODashboard',NOW(),'admin',NULL,NULL);