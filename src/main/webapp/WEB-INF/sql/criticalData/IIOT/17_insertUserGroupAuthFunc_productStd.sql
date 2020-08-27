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
('@st@sys_maintain_auth','10_exhibitionUI','Dashboard',NULL,NULL,NULL,NULL),

-- 全廠牌
('adminstd_all_brand_test_auth','01_cncscanByCode_all_brand','AlarmHistory',NULL,NULL,NULL,NULL),
('adminstd_all_brand_test_auth','02_cncscanByMachine_all_brand','AlarmHistory',NULL,NULL,NULL,NULL),
('adminstd_all_brand_test_auth','09_manage_app_func_cnc_brand','Management',NULL,NULL,NULL,NULL),
('adminstd_all_brand_test_auth','25_machine_status_history_all_brand','EquipMonitor',NULL,NULL,NULL,NULL),

-- dmeo
('sys_demo_auth','02_all_plant_area','EquipMonitor',NULL,NULL,NULL,NULL),
('sys_demo_auth','02_plant_area_monitor_multi_brand','EquipMonitor',NULL,NULL,NULL,NULL),
('sys_demo_auth','25_machine_status_history','EquipMonitor',NULL,NULL,NULL,NULL),
('sys_demo_auth','60_history_position_and_electric_current','EquipMonitor',NULL,NULL,NULL,NULL),
('sys_demo_auth','10_exhibitionUI','Dashboard',NULL,NULL,NULL,NULL),

-- 系統設定
('sys_product_std_app_admin_auth','02_manage_user','Management',NULL,NULL,NULL,NULL),
('sys_product_std_app_admin_auth','03_management_plant','EquipMonitor',NULL,NULL,NULL,NULL),
('sys_product_std_app_admin_auth','07_manage_machine_name','Management',NULL,NULL,NULL,NULL),
('sys_product_std_app_admin_auth','08_manage_shift','Management',NULL,NULL,NULL,NULL),
('sys_product_std_app_admin_auth','11_manage_download_raw_data','Management',NULL,NULL,NULL,NULL),
('sys_product_std_app_admin_auth','16_manage_alarm','Management',NULL,NULL,NULL,NULL),

-- 警報履歷
('sys_product_std_app_alarm_auth','01_cncscanByCode','AlarmHistory','2018-06-20 18:17:30','admin',NULL,NULL),
('sys_product_std_app_alarm_auth','02_cncscanByMachine','AlarmHistory','2018-06-20 18:17:30','admin',NULL,NULL),

-- 監控
('sys_product_std_app_monitor_auth','02_all_plant_area','EquipMonitor',NULL,NULL,NULL,NULL),
('sys_product_std_app_monitor_auth','02_plant_area_monitor_multi_brand','EquipMonitor',NULL,NULL,NULL,NULL),
('sys_product_std_app_monitor_auth','25_machine_status_history','EquipMonitor',NULL,NULL,NULL,NULL),
('sys_product_std_app_monitor_auth','60_history_position_and_electric_current','EquipMonitor',NULL,NULL,NULL,NULL),

-- 曲線圖
('sys_product_std_app_monitor_auth','01_realtime_line_chart_base2','APlusLineChart',NULL,NULL,NULL,NULL),

-- 電流圖
('sys_product_std_app_monitor_auth','05_current_line_chart_base','APlusLineChart',NULL,NULL,NULL,NULL),

-- 程式上下傳
('sys_product_std_app_progtransmit_auth','01_machines','ProgTransmit','2018-06-20 18:17:30','admin',NULL,NULL),
('sys_product_std_app_progtransmit_auth','02_cnc_download','ProgTransmit','2018-06-20 18:17:30','admin',NULL,NULL),
('sys_product_std_app_progtransmit_auth','03_cnc_upload','ProgTransmit','2018-06-20 18:17:30','admin',NULL,NULL),

-- 稼動
('sys_product_std_app_utilization_auth','10_daily','UtilizationStd','2018-06-20 18:17:30','admin',NULL,NULL),
('sys_product_std_app_utilization_auth','20_monthly','UtilizationStd','2018-06-20 18:17:30','admin',NULL,NULL);
