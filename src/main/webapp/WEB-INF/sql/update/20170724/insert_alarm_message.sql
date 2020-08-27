INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('05_alarm_message','UtilizationStd','i18n_ServCloud_05_Alarm_Message','null');

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_super_admin_auth','05_alarm_message','UtilizationStd',NOW(),'admin',NULL,NULL);