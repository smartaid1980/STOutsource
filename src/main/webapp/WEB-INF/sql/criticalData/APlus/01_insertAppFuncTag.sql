 -- APlusAlarmDiagnosis
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('APlusAlarmDiagnosis','故障診斷',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_alarm_diagnosis','APlusAlarmDiagnosis','故障診斷','none'),
 ('02_alarm_log','APlusAlarmDiagnosis','故障診斷紀錄查詢','none');
 INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
  ('APlusAlarmDiagnosis','20140918000004',NOW(),'admin');

  -- APlusDefect
  INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
   ('APlusDefect','缺陷品學習資料庫',1,'','1.0',NOW(),'admin',NULL,NULL);
  INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
   ('01_defect_and_machine_statistic','APlusDefect','缺陷類別與設備關聯統計報表','null'),
   ('02_defect_and_related_statistic','APlusDefect','設備與缺陷類別關聯分析報表','null');
  INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
   ('APlusDefect','20140918000004',NOW(),'admin');

-- APlusEquipMonitor
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('APlusEquipMonitor','機台監控',1,'Machine monitor.','1.0',NOW(),'admin',NULL,NULL);
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

 -- APlusLineChart
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('APlusLineChart','曲線圖表',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_realtime_line_chart','APlusLineChart','即時曲線圖','none'),
 ('02_history_line_chart','APlusLineChart','歷史曲線圖','none'),
 ('03_spc','APlusLineChart','SPC','none');
 INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
  ('APlusLineChart','20140918000003',NOW(),'admin');

-- APlusUtilizationStd
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('APlusUtilizationStd','使用率',1,'Provide usage statistics, daily reports, schedule adjustment, chart display, product names, working program reaction management and custom reaction management for each devices in the factory.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_daily','APlusUtilizationStd','日稼動率報表','null'),
 ('70_device_status_statistic','APlusUtilizationStd','機台歷史狀態查詢','null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('APlusUtilizationStd','20140918000002',NOW(),'admin');

 -- Management
 INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
  ('23_manage_a_plus_user_machine_param','Management','使用者機台參數設定','null'),
  ('24_manage_a_plus_template_machine_upload','Management','預設機台參數上傳','null');