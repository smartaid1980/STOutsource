-- BackupQuery
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('BackupQuery','i18n_ServCloud_BackupQuery',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_backup_query','BackupQuery','i18n_ServCloud_10_BackupQuery','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('BackupQuery','20140918000001',NOW(),'admin');

 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
  ('sys_super_admin_auth','10_backup_query','BackupQuery',NOW(),'admin',NULL,NULL);