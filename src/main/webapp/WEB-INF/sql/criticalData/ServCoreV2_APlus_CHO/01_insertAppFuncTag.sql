
-- APlusEquipMonitor
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('APlusEquipMonitor','機台監控(PLC)',1,'Machine monitor.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('00_overall','APlusEquipMonitor','i18n_ServCloud_Monitor_Overall','none'),
 ('00_overall_card','APlusEquipMonitor','i18n_ServCloud_Monitor_Overall_List','none'),
 ('00_overall_edit','APlusEquipMonitor','i18n_ServCloud_Monitor_Overall_Edit','none'),
 ('01_info_production_line','APlusEquipMonitor','i18n_ServCloud_Production_Line','none'),
 ('01_info_production_line_edit','APlusEquipMonitor','i18n_ServCloud_Production_Line_Edit','none'),
 ('02_plant_area_monitor_a_plus','APlusEquipMonitor','i18n_ServCloud_Plant_Area_Monitor','null'),
 ('03_management_plant','APlusEquipMonitor','i18n_ServCloud_Plant_Area_Management','null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('APlusEquipMonitor','20140918000001',NOW(),'admin');

 -- Management
 INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
  ('23_manage_a_plus_user_machine_param','Management','使用者機台參數設定','null'),
  ('24_manage_a_plus_template_machine_upload','Management','預設機台參數上傳','null');