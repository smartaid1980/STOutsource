delete from m_app_info where app_id = 'MachineManagement';
delete from m_sys_func where app_id = 'Management' and func_id = '07_manage_machine_info';
delete FROM m_sys_func where app_id = 'Management' and func_id = '09_manage_schedule';

 INSERT IGNORE INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('05_manage_box_edit','Management','i18n_ServCloud_Manage_Box','null'),
 ('06_manage_machine','Management','i18n_ServCloud_Manage_Machine_Connection_Settings','null'),
 ('06_manage_machine_edit','Management','i18n_ServCloud_Manage_Machine_Connection_Settings','null');

 INSERT IGNORE INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_super_admin_auth','06_manage_machine','Management',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','06_manage_machine_edit','Management',NOW(),'admin',NULL,NULL);

 INSERT IGNORE INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_product_std_app_admin_auth','05_manage_box_edit','Management',NOW(),'admin',NULL,NULL),
 ('sys_product_std_app_admin_auth','06_manage_machine_edit','Management',NOW(),'admin',NULL,NULL);

update m_sys_func set func_name = 'i18n_ServCloud_Manage_Box' where app_id = 'Management' and func_name = 'i18n_ServCloud_Manage_Box_new';
update m_sys_func set func_name = 'i18n_ServCloud_Manage_Machine_Connection_Settings' where app_id = 'Management' and func_name = 'i18n_ServCloud_Manage_Machine_new';