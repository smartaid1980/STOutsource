--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES

-- AlarmHistory
 ('sys_digiFAC_T1_app_alarm_auth','01_cncscanByCode','AlarmHistory',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_alarm_auth','02_cncscanByMachine','AlarmHistory',NOW(),'admin',NULL,NULL),

-- CustomerService
 ('sys_digiFAC_T1_app_admin_auth','02_license_update','CustomerService',NOW(),'admin',NULL,NULL),

-- Dashboard
 ('sys_digiFAC_T1_app_dashboard_auth','01_dashboard','Dashboard',NOW(),'admin',NULL,NULL),

-- DowntimeAnalysisEnzoy
 ('sys_digiFAC_T1_app_downtime_auth','11_downtime_analysis_machineidle_cosmos','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_downtime_auth','12_downtime_analysis_macroidle_cosmos','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_downtime_auth','14_machine_idle_all_machine_cosmos','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_downtime_auth','51_macro_json_edit_for_cosmos','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL),

-- EquipMonitor
 ('sys_digiFAC_T1_app_monitor_auth','02_plant_area_monitor','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_monitor_auth','03_management_plant','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_monitor_auth','04_manage_machine_light','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_monitor_auth','20_part_count_merged','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_monitor_auth','25_machine_status_history_v3','EquipMonitor',NOW(),'admin',NULL,NULL),

-- Management
 ('sys_digiFAC_T1_app_admin_auth','02_manage_user','Management',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_admin_auth','05_manage_box','Management',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_admin_auth','06_manage_machine_edit','Management',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_admin_auth','08_manage_shift','Management',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_admin_auth','10_manage_macro','Management',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_admin_auth','11_manage_download_raw_data','Management',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_admin_auth','16_manage_alarm','Management',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_admin_auth','17_manage_axis_efficiency_th','Management',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_admin_auth','18_manage_alarm_send_spacing_cosmos','Management',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_admin_auth','19_manage_mail','Management',NOW(),'admin',NULL,NULL),

-- ProgTransmit
 ('sys_digiFAC_T1_app_progtransmit_auth','01_machines','ProgTransmit',NOW(),'admin',NULL,NULL),

-- ToolUsed
 ('sys_digiFAC_T1_app_tool_manager_auth','01_single_measure_cosmos','ToolUsed',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_tool_manager_auth','03_tool_usage_statistics_for_production','ToolUsed',NOW(),'admin',NULL,NULL),

-- UtilizationStd
 ('sys_digiFAC_T1_app_utilization_auth','05_main_axis_efficiency_th','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_utilization_auth','10_daily_cosmos_capacity','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_utilization_auth','12_oee_cosmos','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_utilization_auth','22_monthly_3.0','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_utilization_auth','30_daily_production_info_cosmos','UtilizationStd',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_auth_func` ENABLE KEYS */;