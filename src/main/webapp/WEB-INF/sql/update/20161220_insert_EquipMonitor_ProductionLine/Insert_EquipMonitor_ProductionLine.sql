INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_info_production_line','EquipMonitor','i18n_ServCloud_Production_Line','none'),
 ('01_info_production_line_edit','EquipMonitor','i18n_ServCloud_Production_Line_Edit','none');

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_super_admin_auth','01_info_production_line','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','01_info_production_line_edit','EquipMonitor',NOW(),'admin',NULL,NULL);

 INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('02_single_measure','ToolUsed','i18n_ServCloud_ToolUsed','none');

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_super_admin_auth','02_single_measure','ToolUsed',NOW(),'admin',NULL,NULL);