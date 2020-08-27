 INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('09_manage_machine_all','Management','i18n_ServCloud_Manage_Machine_Connection_Settings','null'),
 ('09_manage_machine_limit','Management','i18n_ServCloud_Manage_Machine_Connection_Settings','null');


 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_super_admin_auth','09_manage_machine_all','Management',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','09_manage_machine_limit','Management',NOW(),'admin',NULL,NULL);

 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_admin_auth','09_manage_machine_limit','Management',NOW(),'admin',NULL,NULL);

 delete FROM m_sys_func where app_id = 'Management' and func_id = '09_manage_schedule';