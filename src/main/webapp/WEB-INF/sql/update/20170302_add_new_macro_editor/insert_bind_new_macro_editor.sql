INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('40_work_macro_editor','DowntimeAnalysisEnzoy','i18n_ServCloud_40_WorkMacroEditor','null');

 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
 ('sys_achb_auth','40_work_macro_editor','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL),
 ('sys_admin_auth','40_work_macro_editor','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','40_work_macro_editor','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL),
 ('sys_user_auth','40_work_macro_editor','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL);