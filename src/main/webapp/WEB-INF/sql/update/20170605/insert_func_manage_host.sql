INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
('20_manage_host','Management','i18n_ServCloud_Manage_Host','null');

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
('sys_super_admin_auth','20_manage_host','Management',NOW(),'admin',NULL,NULL);