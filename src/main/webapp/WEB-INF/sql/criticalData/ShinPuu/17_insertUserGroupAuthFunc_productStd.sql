--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
-- fae測試
('@st@sys_maintain_auth','02_machine_edit','EquipMonitor',NULL,NULL,NULL,NULL),
('@st@sys_maintain_auth','02_manage_user','Management',NULL,NULL,NULL,NULL),
('@st@sys_maintain_auth','02_plant_area_edit','EquipMonitor',NULL,NULL,NULL,NULL),
('@st@sys_maintain_auth','03_manage_group','Management',NULL,NULL,NULL,NULL),
('@st@sys_maintain_auth','04_manage_auth','Management',NULL,NULL,NULL,NULL),
('@st@sys_maintain_auth','05_manage_box_edit','Management',NULL,NULL,NULL,NULL),
('@st@sys_maintain_auth','06_manage_machine_edit','Management',NULL,NULL,NULL,NULL),
('@st@sys_maintain_auth','11_manage_download_raw_data','Management',NULL,NULL,NULL,NULL),

-- 全廠牌
('adminstd_all_brand_test','01_cncscanByCode_all_brand','AlarmHistory',NULL,NULL,NULL,NULL),
('adminstd_all_brand_test','02_cncscanByMachine_all_brand','AlarmHistory',NULL,NULL,NULL,NULL),
('adminstd_all_brand_test','09_manage_app_func_cnc_brand','Management',NULL,NULL,NULL,NULL),
('adminstd_all_brand_test','25_machine_status_history_all_brand','EquipMonitor',NULL,NULL,NULL,NULL),

-- dmeo
('sys_demo_auth','02_all_plant_area','EquipMonitor',NULL,NULL,NULL,NULL),
('sys_demo_auth','02_plant_area_monitor_multi_brand','EquipMonitor',NULL,NULL,NULL,NULL),
('sys_demo_auth','25_machine_status_history','EquipMonitor',NULL,NULL,NULL,NULL),
('sys_demo_auth','60_history_position_and_electric_current','EquipMonitor',NULL,NULL,NULL,NULL),

-- 系統設定
('sys_product_std_app_admin_auth','02_manage_user','Management',NULL,NULL,NULL,NULL),
('sys_product_std_app_admin_auth','07_manage_machine_name','Management',NULL,NULL,NULL,NULL),
('sys_product_std_app_admin_auth','08_manage_shift','Management',NULL,NULL,NULL,NULL),
('sys_product_std_app_admin_auth','11_manage_download_raw_data','Management',NULL,NULL,NULL,NULL),
('sys_product_std_app_admin_auth','16_manage_alarm','Management',NULL,NULL,NULL,NULL),
('sys_product_std_app_admin_auth','03_management_plant','EquipMonitor',NULL,NULL,NULL,NULL),

-- 警報履歷
('sys_product_std_app_alarm_auth','01_cncscanByCode','AlarmHistory','2018-06-20 18:17:30','admin',NULL,NULL),
('sys_product_std_app_alarm_auth','02_cncscanByMachine','AlarmHistory','2018-06-20 18:17:30','admin',NULL,NULL),

-- 三次元
('sys_product_std_app_JJF','10_mould_testing_result','3DCMM',NULL,NULL,NULL,NULL),
('sys_product_std_app_JJF','10_quality_inspections_report','3DCMM',NULL,NULL,NULL,NULL),

-- 模具管理
('sys_product_std_app_mold','01_mold_progress','MoldManagement',NULL,NULL,NULL,NULL),
('sys_product_std_app_mold','02_item_working_status','MoldManagement',NULL,NULL,NULL,NULL),
('sys_product_std_app_mold','03_item_working_process','MoldManagement',NULL,NULL,NULL,NULL),
('sys_product_std_app_mold','04_item_malfunction_reason_track','MoldManagement',NULL,NULL,NULL,NULL),
('sys_product_std_app_mold','05_item_malfunction_feedback','MoldManagement',NULL,NULL,NULL,NULL),
('sys_product_std_app_mold','10_dashboard','MoldManagement',NULL,NULL,NULL,NULL),

-- 監控
('sys_product_std_app_monitor_auth','02_all_plant_area','EquipMonitor',NULL,NULL,NULL,NULL),
('sys_product_std_app_monitor_auth','02_plant_area_monitor_multi_brand','EquipMonitor',NULL,NULL,NULL,NULL),
('sys_product_std_app_monitor_auth','25_machine_status_history','EquipMonitor',NULL,NULL,NULL,NULL),
('sys_product_std_app_monitor_auth','60_history_position_and_electric_current','EquipMonitor',NULL,NULL,NULL,NULL),

-- 程式上下傳
('sys_product_std_app_progtransmit_auth','01_machines','ProgTransmit','2018-06-20 18:17:30','admin',NULL,NULL),
('sys_product_std_app_progtransmit_auth','02_cnc_download','ProgTransmit','2018-06-20 18:17:30','admin',NULL,NULL),
('sys_product_std_app_progtransmit_auth','03_cnc_upload','ProgTransmit','2018-06-20 18:17:30','admin',NULL,NULL),

-- 單節
('sys_product_std_app_single_auth','01_single_line_program','SingleLineAnalysis',NULL,NULL,NULL,NULL),
('sys_product_std_app_single_auth','20_set_program_time','SingleLineAnalysis',NULL,NULL,NULL,NULL),

-- 稼動
('sys_product_std_app_utilization_auth','10_daily','UtilizationStd','2018-06-20 18:17:30','admin',NULL,NULL),
('sys_product_std_app_utilization_auth','20_monthly','UtilizationStd','2018-06-20 18:17:30','admin',NULL,NULL);
