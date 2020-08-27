--
-- Dumping data for table `m_sys_auth_func`
--

/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- AchievementRate
 ('@st@sys_super_admin_auth','10_achievement_rate','AchievementRate',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- Aftersalesservice
 ('@st@sys_super_admin_auth','01_manage_customer_trade','AfterSalesService',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_manage_customer_type','AfterSalesService',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','03_manage_customer_area','AfterSalesService',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','04_manage_customer_factor','AfterSalesService',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','05_manage_customer','AfterSalesService',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','06_manage_product','AfterSalesService',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','07_manage_machine_type','AfterSalesService',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','08_manage_entity','AfterSalesService',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','09_manage_entity_breakdown','AfterSalesService',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','10_manage_material','AfterSalesService',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','11_manage_repair_kind','AfterSalesService',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','12_manage_repair_list','AfterSalesService',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','13_manage_repair','AfterSalesService',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','14_manage_repair_assign','AfterSalesService',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','15_manage_repair_reply','AfterSalesService',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','16_manage_repair_close','AfterSalesService',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','17_after_sales_service_report','AfterSalesService',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- Aheadmaster
 ('@st@sys_super_admin_auth','03_production_transition_diagram','Aheadmaster',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','04_yield_transition_diagram','Aheadmaster',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','05_invalid_transition_diagram','Aheadmaster',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','06_line_transition_diagram','Aheadmaster',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','10_manage_map','Aheadmaster',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','12_transform_excel','Aheadmaster',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','19_upload_input_simple','Aheadmaster',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_upload_input','Aheadmaster',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_pivot_report','Aheadmaster',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','21_customized_report','Aheadmaster',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','22_pivot_report','Aheadmaster',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','30_dashboard','Aheadmaster',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','98_production_daily_report','Aheadmaster',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','99_transition_diagram','Aheadmaster',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- AlarmHistory
 ('@st@sys_super_admin_auth','01_cncscanByCode','AlarmHistory',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_cncscanByMachine','AlarmHistory',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','10_cncscanByCode_anko','AlarmHistory',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_cncscanByMachine_anko','AlarmHistory',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','01_cncscanByCode_machine_type','AlarmHistory',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_cncscanByMachine_machine_type','AlarmHistory',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','03_cncscanByMachineDetail','AlarmHistory',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- BackupQuery
  ('@st@sys_super_admin_auth','10_backup_query','BackupQuery',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- BearingRULprediction
 ('@st@sys_super_admin_auth','01_RUL_Prediction','BearingRULprediction',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_Features','BearingRULprediction',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CustomerService
 ('@st@sys_super_admin_auth','01_agent_info','CustomerService',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','02_license_update','CustomerService',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','30_log_download','CustomerService',NOW(),NULL,NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CHODashBoard
 ('@st@sys_super_admin_auth','01_dashboard','CHODashboard',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- DashBoard
 ('@st@sys_super_admin_auth','01_dashboard','Dashboard',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','10_exhibitionUI','Dashboard',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_servtrack','Dashboard',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- DispatchManagement
 ('@st@sys_super_admin_auth','01_assignment_sheet','DispatchManagement',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','03_assignment_different','DispatchManagement',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- DowntimeAnalysisEnzoy
 ('@st@sys_super_admin_auth','10_downtime_analysis','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_downtime_analysis_by_product_id_Work_order','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','30_idle_macro_editor','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','21_cosmos_machine_idle_web_macro','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','22_cosmos_macro_idle_web_macro','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','24_cosmos_machine_idle_all_web_macro','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','40_work_macro_editor','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','51_macro_json_edit_for_cosmos','DowntimeAnalysisEnzoy',NOW(),'admin',NULL,NULL);
 
 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- Enhancement
 ('@st@sys_super_admin_auth','10_machine_management','EnhancementManagement',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_process_management','EnhancementManagement',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','21_process_ng_management','EnhancementManagement',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','30_product_management','EnhancementManagement',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','31_product_op_management','EnhancementManagement',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','40_idle_reason_management','EnhancementManagement',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- EquipMonitor
 ('@st@sys_super_admin_auth','00_overall','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','00_overall_card','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','00_overall_edit','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','01_info_production_line','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','01_info_production_line_edit','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_all_plant_area','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_all_plant_area_edit','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_machine_edit','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_plant_area_edit','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_plant_area_monitor','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_plant_area_monitor_enzoy','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_plant_area_monitor_anko','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','03_management_plant_area','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','04_manage_machine_light','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','05_management_section','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_part_count_merged','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','30_old_machine_list','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','31_old_machine_detail','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','50_machine_time_diffContent','EquipMonitor',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- FiveAxisMeasure
 ('@st@sys_super_admin_auth','02_error_analysis','FiveAxisMeasure',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
  -- FFGChatterAnalysis
 ('@st@sys_super_admin_auth','10_chatter','FFGChatterAnalysis',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_normal','FFGChatterAnalysis',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','30_merged','FFGChatterAnalysis',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- HeatCompensatory
 ('@st@sys_super_admin_auth','01_heat_compensatory','HeatCompensatory',NOW(),'admin',NULL,NULL);

 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- FFGProductionProcess
 ('@st@sys_super_admin_auth','10_FFG_production_process','FFGProductionProcess',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- IP CAM
 ('@st@sys_super_admin_auth','90_ip_cam_grid','IPCam',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','91_ip_cam_grid_demo','IPCam',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','99_manage_ip_cam','IPCam',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- Juihua
 ('@st@sys_super_admin_auth','01_order_to_month_plan','Juihua',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','01_order_to_month_plan_demo','Juihua',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_order_transform','Juihua',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','03_supplier_give_material_amount','Juihua',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','04_download_receive_material','Juihua',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','05_receive_material','Juihua',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','06_supplier_name_setting','Juihua',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','07_supplier_deliver_setting','Juihua',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','08_supplier_trip_setting','Juihua',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','09_query_no_received','Juihua',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
-- KuoChuanServTrack
 ('@st@sys_super_admin_auth','10_emp_performance','KuoChuanServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','20_emp_use','KuoChuanServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','30_oee','KuoChuanServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','40_device_use','KuoChuanServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','50_product_quality','KuoChuanServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','60_ng_quality','KuoChuanServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','70_move_record','KuoChuanServTrack',NOW(),NULL,NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- KuoChuanServTrackManagement
 ('@st@sys_super_admin_auth','20_process_maintain','KuoChuanServTrackManagement',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','21_product_maintain','KuoChuanServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','22_device_maintain','KuoChuanServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','23_emp_maintain','KuoChuanServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','31_work','KuoChuanServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','32_invalid_device_qrcode_print','KuoChuanServTrackManagement',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','33_work_op_qrcode_print','KuoChuanServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','40_time_clock_data_import','KuoChuanServTrackManagement',NOW(),NULL,NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- Ladder
 ('@st@sys_super_admin_auth','01_machine_list','Ladder',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_ladder_monitor','Ladder',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- Management
 ('@st@sys_super_admin_auth','01_manage_app','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_manage_user','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','03_manage_group','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','04_manage_auth','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','05_manage_box','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','06_manage_machine','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','07_manage_machine_name','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','07_manage_machine_type','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','08_manage_shift','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','09_manage_app_func_cnc_brand','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','10_manage_macro','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','11_manage_download_raw_data','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','12_manage_line_type','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','13_manage_cnc_brand','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','14_manage_group_machine','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','16_manage_alarm','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','16_manage_alarm_anko','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','18_manage_alarm_send_spacing_cosmos','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','19_manage_mail','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','19_manage_mail_general','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_manage_report_email_sending_setting','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_manage_host','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','22_manage_tool','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','25_manage_cnc_server_type','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','26_manage_machine_data_server','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','27_manage_dashboard','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','28_manage_dashboard_auth','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','29_manage_dashboard_group','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','30_manage_unit_type','Management',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','31_manage_unit_param','Management',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- Monitor
 ('@st@sys_super_admin_auth','01_plant_area_monitor_cycu','Monitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_monitor_info','Monitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','01_plant_area_monitor_cycu_subscribe','Monitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_monitor_info_subscribe','Monitor',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- ProgTransmit
 ('@st@sys_super_admin_auth','01_machines','ProgTransmit',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_cnc_download','ProgTransmit',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','03_cnc_upload','ProgTransmit',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','03_fanuc_cnc_upload','ProgTransmit',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','05_fanuc_data_server','ProgTransmit',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','06_cnc_program_command_logs','ProgTransmit',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- MotorFaultDiagnosis
 ('@st@sys_super_admin_auth','01_motor_list','MotorFaultDiagnosis',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- OnMachineMeasurement
 ('@st@sys_super_admin_auth','10_on_machine_measurement_results','OnMachineMeasurement',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_on_machine_measurement_historical_trends','OnMachineMeasurement',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- ProcessParam
 ('@st@sys_super_admin_auth','10_process_param','ProcessParam',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
-- ProductionDailyReport
 ('@st@sys_super_admin_auth','10_daily_report','ProductionDailyReport',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','20_manage_shift','ProductionDailyReport',NOW(),NULL,NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
-- ProductionEfficiency
 ('@st@sys_super_admin_auth','01_operate_analysis','ProductionEfficiency',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','02_single_measure','ProductionEfficiency',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','03_process_rate_prediction','ProductionEfficiency',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','04_machine_auto_reply','ProductionEfficiency',NOW(),NULL,NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
-- ServTrack
 ('@st@sys_super_admin_auth','10_product_process_quality','ServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','20_work_quality','ServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','30_work_process','ServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','30_work_process_jumpway','ServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','40_line_oee','ServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','50_line_oee_day','ServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','51_line_use_day','ServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','60_operating_performance','ServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','60_operating_performance_teco','ServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','60_operating_performance_strongled','ServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','70_tracking_no_move_out','ServTrack',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','71_invalid_line_status_no_end','ServTrack',NOW(),NULL,NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- ServTrackManagement
 ('@st@sys_super_admin_auth','11_tablet_authority','ServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','20_invalid_reason_maintain_strongled','ServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','21_process_maintain','ServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','21_process_maintain_strongled','ServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','22_product_op_maintain','ServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','23_shift_time_maintain','ServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','24_staff_maintain_teco','ServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','31_line_qrcode_print','ServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','32_work','ServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','33_work_op_qrcode_print','ServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','34_line_working_hour','ServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','35_tracking_ng_fill_in_strongled','ServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','50_basic_data_import','ServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','60_work_data_import','ServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','60_work_data_import_teco','ServTrackManagement',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','99_insert_and_clear_demo_data','ServTrackManagement',NOW(),NULL,NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- ToolManagement
 ('@st@sys_super_admin_auth','01_tool_status','ToolManagement',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_tool_compensate','ToolManagement',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','03_tool_history','ToolManagement',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- ToolUsed
 ('@st@sys_super_admin_auth','01_report','ToolUsed',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','01_single_measure','ToolUsed',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','01_single_measure_cosmos','ToolUsed',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','03_tool_usage_statistics_for_production','ToolUsed',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','04_tool_log','ToolUsed',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- UtilizationStd
 ('@st@sys_super_admin_auth','05_alarm_message','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','10_daily','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','10_daily_enzoy','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','10_daily_anko','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','10_daily_cosmos','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','10_daily_cosmos_capacity','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','10_daily_kuohwaoa','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','10_pony_daily_cosmos','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','12_oee_cosmos','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_monthly','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_monthly_kuohwaoa','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_monthly_enzoy','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','25_yearly','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','30_product_information','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','30_daily_production_info_cosmos','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','30_edit_ng_quantity_by_cosmos','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','40_edit_idle_by_cosmos','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','40_customer_manage','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','50_product_manage','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','70_device_status_statistic','UtilizationStd',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- WorkPieceMeasurment
 ('@st@sys_super_admin_auth','10_work_piece_measurment_report','WorkPieceMeasurment',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_the_dimensions_trend_tables','WorkPieceMeasurment',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','30_yield_transition_diagrams','WorkPieceMeasurment',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- AlarmClear
 ('@st@sys_super_admin_auth','01_alarm_clear','AlarmClear',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','01_alarm_clear_troubleshooting','AlarmClear',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_alarm_clear_log','AlarmClear',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_clear_log_history','AlarmClear',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','03_alarm_clear_edit','AlarmClear',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','03_alarm_clear_edit_setting_method','AlarmClear',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','04_alarm_clear_file','AlarmClear',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','05_alarm_clear_statistics','AlarmClear',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','06_manage_alarm','AlarmClear',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
  -- ServTank Manager
 ('@st@sys_super_admin_auth', '01_servcore_config','ServTank',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- Develop UI tool
 ('@st@sys_super_admin_auth','01_form','DevTool',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','90_manage_app','DevTool',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','91_manage_func','DevTool',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_auth_func` ENABLE KEYS */;

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- ServtrackSimulator
 ('@st@sys_super_admin_auth','50_basic_data_import','ServtrackSimulator',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','60_work_data_import','ServtrackSimulator',NOW(),NULL,NULL,NULL),
 ('@st@sys_super_admin_auth','70_work_tracking_data_import','ServtrackSimulator',NOW(),NULL,NULL,NULL);

 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- ReportEngine
 ('@st@sys_super_admin_auth','10_power_bi','ReportEngine',NOW(),'admin',NULL,NULL);

 -- Single Line Analysis
 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@sys_super_admin_auth','01_single_line_program','SingleLineAnalysis',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_set_program_time','SingleLineAnalysis',NOW(),'admin',NULL,NULL);

-- IiotWheelWearDetection
 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@sys_super_admin_auth','10_ultrasonic_sensing','IiotWheelWearDetection',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_microphone_sensing','IiotWheelWearDetection',NOW(),'admin',NULL,NULL);

 -- Machine Temperature Sensor
 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@sys_super_admin_auth','10_machine_temperature_sensor','IIOTMachineTemperatureSensor',NOW(),'admin',NULL,NULL);

-- IIOT watch
 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
('@st@sys_super_admin_auth','01_alarm_log','IIOTAlarmLog','2018-10-24 15:44:15','@st@STAdmin',NULL,NULL),
('@st@sys_super_admin_auth','01_device_management','IIOTDeviceWatchManagement','2018-10-24 15:45:14','@st@STAdmin',NULL,NULL),
('@st@sys_super_admin_auth','02_device_idle_overtime_management','IIOTDeviceWatchManagement','2018-10-24 15:46:40','@st@STAdmin',NULL,NULL),
('@st@sys_super_admin_auth','03_watch_management','IIOTDeviceWatchManagement','2018-10-24 15:47:41','@st@STAdmin',NULL,NULL);


-- IIOT tool
 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
('@st@sys_super_admin_auth','01_tool_spec','IIOTToolManagement','2018-10-24 15:44:15','@st@STAdmin',NULL,NULL),
('@st@sys_super_admin_auth','02_tool_holder','IIOTToolManagement','2018-10-24 15:45:14','@st@STAdmin',NULL,NULL),
('@st@sys_super_admin_auth','03_tool','IIOTToolManagement','2018-10-24 15:46:40','@st@STAdmin',NULL,NULL),
('@st@sys_super_admin_auth','04_tool_prepare_list_import','IIOTToolManagement','2018-10-24 15:44:15','@st@STAdmin',NULL,NULL),
('@st@sys_super_admin_auth','01_tool_prepare_record','IIOTToolPrepareRecord','2018-10-24 15:45:14','@st@STAdmin',NULL,NULL),
('@st@sys_super_admin_auth','01_tool_used_resume','IIOTToolReport','2018-10-24 15:46:40','@st@STAdmin',NULL,NULL),
('@st@sys_super_admin_auth','02_tool_tracking','IIOTToolReport','2018-10-24 15:47:41','@st@STAdmin',NULL,NULL);

-- IIOT network
 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
('@st@sys_super_admin_auth','01_network_management','IIOTNetworkManagement','2018-10-24 15:44:15','@st@STAdmin',NULL,NULL),
('@st@sys_super_admin_auth','01_network_monitor','IIOTNetworkMonitor','2018-10-24 15:45:14','@st@STAdmin',NULL,NULL);
