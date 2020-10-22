INSERT INTO `m_tag_for_app_class` (`tag_id`,`tag_name`,`tag_parent`,`create_time`,`create_by`) VALUES
 ('20140918000001','Maintenance',NULL,NOW(),'admin'),
 ('20140918000002','Production',NULL,NOW(),'admin'),
 ('20140918000003','Tool',NULL,NOW(),'admin'),
 ('20140918000004','Prediction',NULL,NOW(),'admin'),
 ('20140918000005','Energy',NULL,NOW(),'admin'),
 ('20140918000999','Other',NULL,NOW(),'admin');


-- AchievementRate
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('AchievementRate','i18n_ServCloud_AchievementRate',1,'Achievement rate.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_achievement_rate','AchievementRate','i18n_ServCloud_AchievementRate','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('AchievementRate','20140918000002',NOW(),'admin');

 -- Aftersalesservice
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('AfterSalesService','i18n_ServCloud_After_Sales_Service',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_manage_customer_trade','AfterSalesService','i18n_ServCloud_01_Manage_Customer_Trade','none'),
 ('02_manage_customer_type','AfterSalesService','i18n_ServCloud_02_Manage_Customer_Type','none'),
 ('03_manage_customer_area','AfterSalesService','i18n_ServCloud_03_Manage_Customer_Area','none'),
 ('04_manage_customer_factor','AfterSalesService','i18n_ServCloud_04_Manage_Customer_Factor','none'),
 ('05_manage_customer','AfterSalesService','i18n_ServCloud_05_Manage_Customer','none'),
 ('06_manage_product','AfterSalesService','i18n_ServCloud_06_Manage_Product','none'),
 ('07_manage_machine_type','AfterSalesService','i18n_ServCloud_07_Manage_Machine_Type','none'),
 ('08_manage_entity','AfterSalesService','i18n_ServCloud_08_Manage_Entity','none'),
 ('09_manage_entity_breakdown','AfterSalesService','i18n_ServCloud_09_Manage_Entity_Breakdown','none'),
 ('10_manage_material','AfterSalesService','i18n_ServCloud_10_Manage_Material','none'),
 ('11_manage_repair_kind','AfterSalesService','i18n_ServCloud_11_Manage_Repair_Kind','none'),
 ('12_manage_repair_list','AfterSalesService','i18n_ServCloud_12_Manage_Repair_List','none'),
 ('13_manage_repair','AfterSalesService','i18n_ServCloud_13_Manage_Repair','none'),
 ('14_manage_repair_assign','AfterSalesService','i18n_ServCloud_14_Manage_Repair_Assign','none'),
 ('15_manage_repair_reply','AfterSalesService','i18n_ServCloud_15_Manage_Repair_Repay','none'),
 ('16_manage_repair_close','AfterSalesService','i18n_ServCloud_16_Manage_Repair_Close','none'),
 ('17_after_sales_service_report','AfterSalesService','i18n_ServCloud_17_Repair_Report','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('AfterSalesService','20140918000002',NOW(),'admin');

-- Aheadmaster
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('Aheadmaster','i18n_ServCloud_AHeadmaster',1,'Aheadmaster Management four reports.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('03_production_transition_diagram','Aheadmaster','i18n_ServCloud_Production_Transition_Diagram','null'),
 ('04_yield_transition_diagram','Aheadmaster','i18n_ServCloud_Yield_Transition_Diagram','null'),
 ('05_invalid_transition_diagram','Aheadmaster','i18n_ServCloud_Invalid_Transition_Diagram','null'),
 ('06_line_transition_diagram','Aheadmaster','i18n_ServCloud_Line_Transition_Diagram','null'),
 ('10_manage_map','Aheadmaster','i18n_ServCloud_Manage_Map','null'),
 ('12_transform_excel','Aheadmaster','i18n_ServCloud_Transform_Excel','null'),
 ('19_upload_input_simple','Aheadmaster','i18n_ServCloud_Upload_Daily_Report','null'),
 ('20_upload_input','Aheadmaster','i18n_ServCloud_Upload_Source','null'),
 ('20_pivot_report','Aheadmaster','i18n_ServCloud_Pivot','null'),
 ('21_customized_report','Aheadmaster','i18n_ServCloud_Pivot_Report','null'),
 ('22_pivot_report','Aheadmaster','i18n_ServCloud_Custom_Pivot','null'),
 ('30_dashboard','Aheadmaster','i18n_ServCloud_Dashboard','null'),
 ('98_production_daily_report','Aheadmaster','i18n_ServCloud_Production_Daily_Report','null'),
 ('99_transition_diagram','Aheadmaster','i18n_ServCloud_Transition_Diagram','null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('Aheadmaster','20140918000002',NOW(),'admin');


 -- AheadmasterMyZone
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('AheadmasterMyZone','i18n_ServCloud_Aheadmaster_My_Zone',1,'Dashboard.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_my_zone_achievement_rate','AheadmasterMyZone','i18n_ServCloud_My_Zone_Achievement_Rate','none'),
 ('02_my_zone_yield_rate','AheadmasterMyZone','i18n_ServCloud_My_Zone_Yield_Rate','none'),
 ('03_my_zone_efficiency_rate','AheadmasterMyZone','i18n_ServCloud_My_Zone_Efficiency_Rate','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('AheadmasterMyZone','20140918000999',NOW(),'admin');

 -- AheadmasterAchievementRate
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('AheadmasterAchievementRate','i18n_ServCloud_Aheadmaster_Achievement_Rate',1,'Dashboard.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_achievement_rate','AheadmasterAchievementRate','i18n_ServCloud_Aheadmaster_Achievement_Rate','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('AheadmasterAchievementRate','20140918000999',NOW(),'admin');

 -- AheadmasterYieldRate
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('AheadmasterYieldRate','i18n_ServCloud_Aheadmaster_Yield_Rate',1,'Dashboard.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_yield_rate','AheadmasterYieldRate','i18n_ServCloud_Aheadmaster_Yield_Rate','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('AheadmasterYieldRate','20140918000999',NOW(),'admin');

 -- AheadmasterEfficiencyRate
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('AheadmasterEfficiencyRate','i18n_ServCloud_Aheadmaster_Efficiency_Rate',1,'Dashboard.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_efficiency_rate','AheadmasterEfficiencyRate','i18n_ServCloud_Aheadmaster_Efficiency_Rate','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('AheadmasterEfficiencyRate','20140918000999',NOW(),'admin');

-- AlarmClear
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('AlarmClear','i18n_ServCloud_Alarm_Clear',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_alarm_clear','AlarmClear','i18n_ServCloud_Alarm_Clear_Guide','none'),
 ('01_alarm_clear_troubleshooting','AlarmClear','i18n_ServCloud_Alarm_Clear_Troubleshooting','none'),
 ('02_alarm_clear_log','AlarmClear','i18n_ServCloud_Alarm_Log','none'),
 ('02_clear_log_history','AlarmClear','i18n_ServCloud_Alarm_Log_History','none'),
 ('03_alarm_clear_edit','AlarmClear','i18n_ServCloud_Alarm_Clear_Edit','none'),
 ('03_alarm_clear_edit_setting_method','AlarmClear','i18n_ServCloud_Alarm_Clear_Edit_Setting_Method','none'),
 ('04_alarm_clear_file','AlarmClear','i18n_ServCloud_Alarm_Clear_File','none'),
 ('05_alarm_clear_statistics','AlarmClear','i18n_ServCloud_Alarm_Clear_Statistics','none'),
 ('06_manage_alarm','AlarmClear','i18n_ServCloud_Manage_Alarm','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('AlarmClear','20140918000002',NOW(),'admin');


-- AlarmHistory
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('AlarmHistory','i18n_ServCloud_AlarmHistory',1,'Provide error statistic reports, including error code and error lasting time for each devices in the factory.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_cncscanByCode_all_brand','AlarmHistory','i18n_ServCloud_10_Alarm_Statistic_by_Codes_all_brand','64345de5-9ce8-44af-ba0a-3a27c45f0ae7'),
 ('02_cncscanByMachine_all_brand','AlarmHistory','i18n_ServCloud_20_Alarm_Statisti_by_Machine_all_brand','4e851fb4-2ae6-42e5-bdd4-da653c4fb948'),
 ('01_cncscanByCode','AlarmHistory','i18n_ServCloud_10_Alarm_Statistic_by_Codes','64345de5-9ce8-44af-ba0a-3a27c45f0ae7'),
 ('02_cncscanByMachine','AlarmHistory','i18n_ServCloud_20_Alarm_Statisti_by_Machine','4e851fb4-2ae6-42e5-bdd4-da653c4fb948'),
 ('01_cncscanByCode_machine_type','AlarmHistory','i18n_ServCloud_10_Alarm_Statistic_by_Codes',NULL),
 ('02_cncscanByMachine_machine_type','AlarmHistory','i18n_ServCloud_20_Alarm_Statisti_by_Machine',NULL),
 ('03_cncscanByMachineDetail','AlarmHistory','i18n_ServCloud_30_Alarm_Statisti_by_Machine',NULL),
 ('10_cncscanByCode_anko','AlarmHistory','i18n_ServCloud_By_Code_Anko',NULL),
 ('20_cncscanByMachine_anko','AlarmHistory','i18n_ServCloud_By_Machine_Anko',NULL),
 ('30_cncscanByCode_aidc','AlarmHistory','i18n_ServCloud_30_Alarm_Statistic_by_Codes_aidc',NULL),
 ('40_cncscanByMachine_aidc','AlarmHistory','i18n_ServCloud_40_Alarm_Statisti_by_Machine_aidc',NULL),
 ('m10_alarm_history', 'AlarmHistory', '警报履历', 'null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('AlarmHistory','20140918000001',NOW(),'admin');

 -- APlusLineChart
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('APlusLineChart','曲線圖表',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_realtime_line_chart_base','APlusLineChart','即時曲線圖表','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('APlusLineChart','20140918000999',NOW(),'admin');

-- BackupQuery
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('BackupQuery','i18n_ServCloud_BackupQuery',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_backup_query','BackupQuery','i18n_ServCloud_10_BackupQuery','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('BackupQuery','20140918000001',NOW(),'admin');


-- BearingRULprediction
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('BearingRULprediction','i18n_ServCloud_BearingRULprediction',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_RUL_Prediction','BearingRULprediction','i18n_ServCloud_10_Machine_Status','22ad9245-9580-4309-9007-c8c91d440118'),
 ('02_Features','BearingRULprediction','i18n_ServCloud_20_Prediction_History_Query','021306e5-3623-41d9-86ad-90b231d8eb74');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('BearingRULprediction','20140918000004',NOW(),'admin');


-- CustomerService
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CustomerService','i18n_ServCloud_Customer_Service',1,'Provide agent information.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_agent_info','CustomerService','i18n_ServCloud_01_agent_info','none'),
 ('02_license_update','CustomerService','i18n_ServCloud_02_license_update','none'),
 ('30_log_download','CustomerService','i18n_ServCloud_30_Log_Download','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CustomerService','20140918000999',NOW(),'admin');

 -- CHODashboard
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CHODashboard','i18n_ServCloud_RotateDashboard',1,'Dashboard.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_dashboard','CHODashboard','i18n_ServCloud_RotateDashboard','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CHODashboard','20140918000999',NOW(),'admin');

-- Dashboard
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('Dashboard','i18n_ServCloud_RotateDashboard',1,'Dashboard','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_dashboard','Dashboard','i18n_ServCloud_RotateDashboard','none'),
 ('10_exhibitionUI','Dashboard','demo','none'),
 ('20_servtrack','Dashboard','i18n_ServCloud_RotateDashboard','none'),
 ('30_machine_monitor','Dashboard','i18n_ServCloud_MachineMonitor','none'),
 ('40_situation_room','Dashboard','i18n_ServCloud_SituationRoom','none'),
 ('41_situation_room_logic','Dashboard','i18n_ServCloud_SituationRoom_Logic','none'),
 ('45_production_schedule','Dashboard','i18n_ServCloud_Production_Schedule','none'),
 ('46_processing_progress','Dashboard','i18n_ServCloud_Processing_Progress','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('Dashboard','20140918000999',NOW(),'admin');


-- DispatchManagement
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('DispatchManagement','i18n_ServCloud_Dispatch_Management',1,'Provide dispatch management, file upload and record query.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_assignment_sheet','DispatchManagement','i18n_ServCloud_Dispatch_Upload','none'),
 ('02_upload_employee_aerowin','DispatchManagement','i18n_ServCloud_Upload_Employee_Aerowin','none'),
 ('03_assignment_different','DispatchManagement','i18n_ServCloud_Assignment_Different','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('DispatchManagement','20140918000002',NOW(),'admin');
 

 -- DowntimeAnalysisEnzoy
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('DowntimeAnalysisEnzoy','i18n_ServCloud_DowntimeAnalysisEnzoy',1,'Provide equipment downtime statistics by product identity and work sheet number. ','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_downtime_analysis','DowntimeAnalysisEnzoy','i18n_ServCloud_10_DowntimeAnalysis_Enzoy','null'),
 ('11_downtime_analysis_machineidle','DowntimeAnalysisEnzoy','i18n_ServCloud_11_DowntimeAnalysis_MachineIdle','null'),
 ('11_downtime_analysis_machineidle_cosmos','DowntimeAnalysisEnzoy','i18n_ServCloud_11_DowntimeAnalysis_MachineIdle_Cosmos','null'),
 ('12_downtime_analysis_macroidle_cosmos','DowntimeAnalysisEnzoy','i18n_ServCloud_12_DowntimeAnalysis_MacroIdle_Cosmos','null'),
 ('14_machine_idle_all_machine_cosmos','DowntimeAnalysisEnzoy','i18n_ServCloud_14_Machine_Idle_All_Machine_Cosmos','null'),
 ('12_downtime_analysis_orderquery','DowntimeAnalysisEnzoy','i18n_ServCloud_12_DowntimeAnalysis_OrderQuery','null'),
 ('13_downtime_analysis_orderidle','DowntimeAnalysisEnzoy','i18n_ServCloud_13_DowntimeAnalysis_OrderIdle','null'),
 ('20_downtime_analysis_by_product_id_Work_order','DowntimeAnalysisEnzoy','i18n_ServCloud_20_DowntimeAnalysis_by_workorder_Enzoy','null'),
 ('21_cosmos_machine_idle_web_macro','DowntimeAnalysisEnzoy','i18n_ServCloud_21_DowntimeAnalysis_MachineIdle_Webmacro','null'),
 ('22_cosmos_macro_idle_web_macro','DowntimeAnalysisEnzoy','i18n_ServCloud_22_DowntimeAnalysis_MacroIdle_Cosmos_Webmacro','null'),
 ('24_cosmos_machine_idle_all_web_macro','DowntimeAnalysisEnzoy','i18n_ServCloud_24_DowntimeAnalysis_MachineIdleAll_Webmacro','null'),
 ('40_work_macro_editor', 'DowntimeAnalysisEnzoy', 'i18n_ServCloud_40_WorkMacroEditor', 'none'),
 ('50_macro_json_edit', 'DowntimeAnalysisEnzoy', 'i18n_ServCloud_50_Macro_Json_Edit', 'none'),
 ('51_macro_json_edit_for_cosmos', 'DowntimeAnalysisEnzoy', 'i18n_ServCloud_51_Macro_Json_Edit_forCosmos', 'none'),
 ('30_idle_macro_editor','DowntimeAnalysisEnzoy','i18n_ServCloud_30_IdleMacroEditor','null'),
 ('60_machine_idle_period_editor', 'DowntimeAnalysisEnzoy', 'i18n_ServCloud_60_Idle_Time_Setting', 'none');

INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('DowntimeAnalysisEnzoy','20140918000002',NOW(),'admin');

-- EnhancementManagement
 INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('EnhancementManagement','EnhancementManagement',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_machine_management','EnhancementManagement','i18n_ServCloud_enhancement_10_info','none'),
 ('20_process_management','EnhancementManagement','i18n_ServCloud_enhancement_20_info','none'),
 ('21_process_ng_management','EnhancementManagement','i18n_ServCloud_enhancement_21_info','none'),
 ('30_product_management','EnhancementManagement','i18n_ServCloud_enhancement_30_info','none'),
 ('31_product_op_management','EnhancementManagement','i18n_ServCloud_enhancement_31_info','none'),
 ('40_idle_reason_management','EnhancementManagement','i18n_ServCloud_enhancement_40_info','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('EnhancementManagement','20140918000002',NOW(),'admin');


-- EquipMonitor
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('EquipMonitor','i18n_ServCloud_EquipMonitor',1,'Machine monitor.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('00_overall','EquipMonitor','i18n_ServCloud_Monitor_Overall','none'),
 ('00_overall_card','EquipMonitor','i18n_ServCloud_Monitor_Overall_List','none'),
 ('00_overall_edit','EquipMonitor','i18n_ServCloud_Monitor_Overall_Edit','none'),
 ('01_info_production_line','EquipMonitor','i18n_ServCloud_Production_Line','none'),
 ('01_info_production_line_edit','EquipMonitor','i18n_ServCloud_Production_Line_Edit','none'),
 ('02_all_plant_area_v1','EquipMonitor','i18n_ServCloud_All_Plant_Area','none'),
 ('02_all_plant_area','EquipMonitor','i18n_ServCloud_All_Plant_Area','none'),
 ('02_all_plant_area_edit','EquipMonitor','i18n_ServCloud_All_Plant_Area_Edit','none'),
 ('02_plant_area_edit','EquipMonitor','i18n_ServCloud_Plant_Area_Edit','none'),
 ('02_machine_edit','EquipMonitor','i18n_ServCloud_Machine_Edit','none'),
 ('02_plant_area_monitor','EquipMonitor','i18n_ServCloud_Plant_Area_Monitor','911e67e2-b3ad-4920-bd01-c4ead0fb9649'),
 ('02_plant_area_monitor_enzoy','EquipMonitor','i18n_ServCloud_Plant_Area_Monitor_Macro','null'),
 ('02_plant_area_monitor_anko','EquipMonitor','i18n_ServCloud_Plant_Area_Monitor_Anko','null'),
 ('02_plant_area_monitor_cho','EquipMonitor','i18n_ServCloud_Plant_Area_Monitor_Cho','null'),
 ('02_plant_area_monitor_hho','EquipMonitor','i18n_ServCloud_Plant_Area_Monitor_HHO','null'),
 ('02_plant_area_monitor_multi_brand','EquipMonitor','i18n_ServCloud_Plant_Area_Monitor_Multi_Brand','none'),
 ('03_management_plant','EquipMonitor','i18n_ServCloud_Plant_Area_Management','5d219d77-388d-443a-90bf-e6fa1ef7166c'),
 ('03_management_plant_area','EquipMonitor','i18n_ServCloud_Plant_Area_Management_Include_Name','none'),
 ('04_manage_machine_light','EquipMonitor','i18n_ServCloud_Number_Machine_Status_Management','b37d8377-ce7a-4453-903e-4e0eecda3fef'),
 ('05_management_section','EquipMonitor','i18n_ServCloud_Management_Section','none'),
 ('20_part_count_merged','EquipMonitor','i18n_ServCloud_Part_Count_Merged','null'),
 ('20_part_count_merged_servcore_v3','EquipMonitor','i18n_ServCloud_Part_Count_Merged_ServCore3.0','null'),
 ('25_machine_status_history','EquipMonitor','i18n_ServCloud_70_Machine_Status_History','null'),
 ('25_machine_status_history_v3','EquipMonitor','i18n_ServCloud_70_Machine_Status_History_downtime_code','null'),
 ('25_machine_status_history_all_brand','EquipMonitor','i18n_ServCloud_70_Machine_Status_History_all_brand','null'),
 ('30_old_machine_list','EquipMonitor','老舊機台監控','null'),
 ('31_old_machine_detail','EquipMonitor','機台細節','null'),
 ('50_machine_time_diffContent','EquipMonitor','i18n_ServCloud_Machine_Time_Diff_Query','null'),
 ('60_history_position_and_electric_current','EquipMonitor','i18n_ServCloud_Historical_Location_Current_Statistics','null'),
 ('m10_machine_status_summary', 'EquipMonitor', '机台状态总览', 'null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('EquipMonitor','20140918000001',NOW(),'admin');

-- FiveAxisMeasure
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('FiveAxisMeasure', 'i18n_ServCloud_FiveAxisMeasure',1, 'Five Axis Measurement.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('02_error_analysis','FiveAxisMeasure','i18n_ServCloud_Error_Analysis','null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('FiveAxisMeasure','20140918000002',NOW(),'admin');
 

-- FFGChatterAnalysis
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('FFGChatterAnalysis', 'i18n_ServCloud_FFGChatterAnalysis',1, 'FFG Chatter Analysis.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_chatter','FFGChatterAnalysis','i18n_ServCloud_FFGChatterAnalysis_chatter','null'),
 ('20_normal','FFGChatterAnalysis','i18n_ServCloud_FFGChatterAnalysis_normal','null'),
 ('30_merged','FFGChatterAnalysis','i18n_ServCloud_FFGChatterAnalysis_merged','null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('FFGChatterAnalysis','20140918000003',NOW(),'admin');


-- FFG HeatCopensatory
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('FFGHeatCompensatory', 'i18n_ServCloud_FFGHeatCompensatory',1, 'FFG HeatCompensatory.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_FFG_heat_compensatoryCurrent','FFGHeatCompensatory','i18n_ServCloud_FFGHeatCompensatory_Current','null'),
 ('20_FFG_heat_compensatoryHistory','FFGHeatCompensatory','i18n_ServCloud_FFGHeatCompensatory_History','null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('FFGHeatCompensatory','20140918000003',NOW(),'admin');

 -- FFG ProductionProcess
 INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('FFGProductionProcess', 'i18n_ServCloud_FFGProductionProcess',1, 'FFG ProductionProcess.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_FFG_production_process','FFGProductionProcess','i18n_ServCloud_FFGProductionProcess','null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('FFGProductionProcess','20140918000003',NOW(),'admin');

-- HeatCompensatory
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HeatCompensatory', 'i18n_ServCloud_Heat_Compensation',1,'Heat Compensation.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_heat_compensatory','HeatCompensatory','i18n_ServCloud_Heat_Compensation','null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HeatCompensatory','20140918000002',NOW(),'admin');


-- IPCam
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('IPCam', 'IP cam',1,'IP cam','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('90_ip_cam_grid','IPCam','i18n_ServCloud_Ip_Cam_Grid','null'),
 ('91_ip_cam_grid_demo','IPCam','i18n_ServCloud_Ip_Cam_Grid_Demo','null'),
 ('99_manage_ip_cam','IPCam','i18n_ServCloud_Manage_Ip_Cam','null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('IPCam','20140918000001',NOW(),'admin');


-- Juihua
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('Juihua','i18n_ServCloud_Juihua',1,'Management','1.0','2016-03-28 18:42:30','admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_order_to_month_plan','Juihua','i18n_ServCloud_Juihua_Order_To_Month_Plan','null'),
 ('01_order_to_month_plan_demo','Juihua','i18n_ServCloud_Juihua_Order_To_Month_Plan_Demo','null'),
 ('02_order_transform','Juihua','i18n_ServCloud_Juihua_Order_Transform','null'),
 ('03_supplier_give_material_amount','Juihua','i18n_ServCloud_Juihua_Supplier_Give_Material_Amount','null'),
 ('04_download_receive_material','Juihua','i18n_ServCloud_Juihua_Download_Receive_Material','null'),
 ('05_receive_material','Juihua','i18n_ServCloud_Juihua_Receive_Material','null'),
 ('06_supplier_name_setting','Juihua','i18n_ServCloud_Juihua_Supplier_Name_Settings','null'),
 ('07_supplier_deliver_setting','Juihua','i18n_ServCloud_Juihua_Supplier_Deliver_Settings','null'),
 ('08_supplier_trip_setting','Juihua','i18n_ServCloud_Juihua_Supplier_Trip_Settings','null'),
 ('09_query_no_received','Juihua','i18n_ServCloud_Juihua_Query_No_Received','null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('Juihua','20140918000002',NOW(),'admin');

 -- KuoChuan ServTrack
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('KuoChuanServTrack','i18n_ServCloud_Kuo_Chuan_ServTrack',1,'KuoChuanServTrack.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_emp_performance','KuoChuanServTrack','i18n_ServCloud_10_Emp_Performance','none'),
 ('20_emp_use','KuoChuanServTrack','i18n_ServCloud_20_Emp_Use','none'),
 ('30_oee','KuoChuanServTrack','i18n_ServCloud_30_Oee','none'),
 ('40_device_use','KuoChuanServTrack','i18n_ServCloud_40_Device_Use','none'),
 ('50_product_quality','KuoChuanServTrack','i18n_ServCloud_50_Product_Quality','none'),
 ('60_ng_quality','KuoChuanServTrack','i18n_ServCloud_60_Ng_Quality','none'),
 ('70_move_record','KuoChuanServTrack','i18n_ServCloud_70_Move_Record','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('KuoChuanServTrack','20140918000002',NOW(),'admin');

 -- KuoChuanServTrackManagement
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('KuoChuanServTrackManagement','i18n_ServCloud_Kuo_Chuan_ServTrack_Management',1,'KuoChuanServTrackManagement.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('20_process_maintain','KuoChuanServTrackManagement','i18n_ServCloud_20_Process_Maintain','none'),
 ('21_product_maintain','KuoChuanServTrackManagement','i18n_ServCloud_21_Product_Maintain','none'),
 ('22_device_maintain','KuoChuanServTrackManagement','i18n_ServCloud_22_Device_Maintain','none'),
 ('23_emp_maintain','KuoChuanServTrackManagement','i18n_ServCloud_23_Emp_Maintain','none'),
 ('31_work','KuoChuanServTrackManagement','i18n_ServCloud_31_Work','none'),
 ('32_invalid_device_qrcode_print','KuoChuanServTrackManagement','i18n_ServCloud_32_Invalid_Device_Qrcode_Print','none'),
 ('33_work_op_qrcode_print','KuoChuanServTrackManagement','i18n_ServCloud_33_Work_Op_Qrcode_Print','none'),
 ('40_time_clock_data_import','KuoChuanServTrackManagement','i18n_ServCloud_40_Time_Clock_Data_Import','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('KuoChuanServTrackManagement','20140918000002',NOW(),'admin');

-- Ladder
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('Ladder','i18n_ServCloud_Ladder',1,'Ladder','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_machine_list','Ladder','i18n_ServCloud_01_Machine_List','none'),
 ('02_ladder_monitor','Ladder','i18n_ServCloud_02_Ladder_Monitor','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('Ladder','20140918000001',NOW(),'admin');


-- Management
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('Management','i18n_ServCloud_Manage',1,'Management','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_manage_app','Management','i18n_ServCloud_Manage_Appware','a535b2d8-95aa-4181-a9ad-4d87f57e5d11'),
 ('02_manage_user','Management','i18n_ServCloud_Manage_User','771825b9-5e55-4164-b91b-484acf7a4080'),
 ('03_manage_group','Management','i18n_ServCloud_Manage_Group','a785fee8-9bdc-4a77-bfdb-83e531bc6978'),
 ('04_manage_auth','Management','i18n_ServCloud_Manage_Authorise','84ccb366-2b96-40b5-940b-7921af4d0da4'),
 ('05_manage_box','Management','i18n_ServCloud_Manage_Box','null'),
 ('05_manage_box_edit','Management','i18n_ServCloud_Manage_Box','null'),
 ('06_manage_machine','Management','i18n_ServCloud_Manage_Machine_Connection_Settings','null'),
 ('06_manage_machine_edit','Management','i18n_ServCloud_Manage_Machine_Connection_Settings','null'),
 ('07_manage_machine_name','Management','i18n_ServCloud_Manage_Machine_Name','59d3f80d-8080-4851-84e5-a09191736453'),
 ('07_manage_machine_name_edit','Management','i18n_ServCloud_Manage_Machine_Name','59d3f80d-8080-4851-84e5-a09191736453'),
 ('07_manage_machine_type','Management','i18n_ServCloud_Manage_Machine_Type','null'),
 ('08_manage_shift','Management','i18n_ServCloud_Manage_Work_Shift','cbadf723-a9ec-479e-ab5d-f0f3ed36d7f5'),
 ('09_manage_app_func_cnc_brand','Management','i18n_ServCloud_Manage_App_Func_Cnc_Brand','a535b2d8-95aa-4181-a9ad-4d87f57e5d11'),
 ('10_manage_macro','Management','i18n_ServCloud_Manage_Macro','e2e05a87-ce2a-460f-a3c0-c18d97ded614'),
 ('11_manage_download_raw_data','Management','i18n_ServCloud_Download_Raw_Data_Decode','99f64dda-de3e-47a3-8d7f-22664681774f'),
 ('11_manage_download_raw_data_cho','Management','i18n_ServCloud_Download_Raw_Data_Cho_Decode','null'),
 ('12_manage_line_type','Management','i18n_ServCloud_Manage_Line_Type','null'),
 ('12_manage_line_group','Management','i18n_ServCloud_Manage_Line_Group','null'),
 ('13_manage_cnc_brand','Management','i18n_ServCloud_Manage_Cnc_Brand','null'),
 ('14_manage_group_machine','Management','i18n_ServCloud_Manage_Machine_Group','null'),
 ('16_manage_alarm','Management','i18n_ServCloud_Manage_Alarm','null'),
 ('16_manage_alarm_anko','Management','i18n_ServCloud_Manage_Alarm_Anko','null'),
 ('14_manage_machine_editor','Management','i18n_ServCloud_Machine_Editor','null'),
 ('17_manage_axis_efficiency','Management','i18n_ServCloud_Manage_Axis_Efficiency','null'),
 ('17_manage_axis_efficiency_th','Management','i18n_ServCloud_Manage_Axis_Efficiency_TH','null'),
 ('18_manage_alarm_send_spacing','Management','i18n_ServCloud_Manage_Alarm_Send_Spacing','null'),
 ('18_manage_depart_machine_aerowin','Management','i18n_ServCloud_Manage_Depart_Machine_Aerowin','null'),
 ('18_manage_alarm_send_spacing_cosmos','Management','i18n_ServCloud_Manage_Alarm_Send_Spacing','null'),
 ('19_manage_mail','Management','i18n_ServCloud_Manage_Mail','null'),
 ('19_manage_mail_general','Management','i18n_ServCloud_Recipient_Mailbox_Management','null'),
 ('20_manage_report_email_sending_setting','Management','i18n_ServCloud_Manage_Mail_Server','null'),
 ('20_manage_host','Management','i18n_ServCloud_Manage_Host','null'),
 ('21_manage_download_machine_yield_cho','Management','i18n_ServCloud_Download_Machine_Yield_Cho','null'),
 ('22_manage_tool','Management','i18n_ServCloud_Manage_Tool','null'),
 ('25_manage_cnc_server_type','Management','i18n_ServCloud_Manage_CNC_Server_Type','null'),
 ('26_manage_machine_data_server','Management','i18n_ServCloud_Manage_Machine_Data_Server','null'),
 ('27_manage_dashboard','Management','i18n_ServCloud_Manage_Dashboard','null'),
 ('28_manage_dashboard_auth','Management','i18n_ServCloud_Manage_Dashboard_Authorise','null'),
 ('29_manage_dashboard_group','Management','i18n_ServCloud_Manage_Dashboard_Group','null'),
 ('30_manage_unit_type','Management','i18n_ServCloud_Manage_Unit_Type','null'),
 ('31_manage_unit_param','Management','i18n_ServCloud_Manage_Unit_Param','null'),
 ('32_manage_zebra_index','Management','32_管理Zebra index 參數','null'),
 ('33_jinfu_work_query','Management','i18n_ServCloud_Manage_Work_Query','null'),
 ('50_manage_download_treated','Management','i18n_ServCloud_Download_Treated_Data_Decode','null'),
 ('51_manage_download_source','Management','i18n_ServCloud_Download_Source_Data_Decode','null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('Management','20140918000002',NOW(),'admin');

INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('MachineStatusHistory', '机台历史状态', 1, '', '1.0', NOW(), 'admin', NOW(), 'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('m10_machine_status_history', 'MachineStatusHistory', '机台历史状态堆叠图', 'null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('MachineStatusHistory','20140918000002',NOW(),'admin');

-- Monitor
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('Monitor', 'i18n_ServCloud_Cutting_Alarm_Monitoring',1, 'Monitor','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_plant_area_monitor_cycu','Monitor','i18n_ServCloud_Tool_Monitor','null'),
 ('02_monitor_info','Monitor','i18n_ServCloud_Tool_Diagnosis','null'),
 ('01_plant_area_monitor_cycu_subscribe','Monitor','i18n_ServCloud_Tool_Monitor_new','null'),
 ('02_monitor_info_subscribe','Monitor','i18n_ServCloud_Tool_Diagnosis_new','null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('Monitor','20140918000002',NOW(),'admin');


-- MotorFaultDiagnosis
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('MotorFaultDiagnosis','i18n_ServCloud_MotorFaultDiagnosis',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_motor_list','MotorFaultDiagnosis','i18n_ServCloud_01_Motor_list','f1f588ca-4ffb-4de7-b590-ec373ceea4ed');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('MotorFaultDiagnosis','20140918000001',NOW(),'admin');

  -- OnMachineMeasurement
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('OnMachineMeasurement','i18n_ServCloud_OnMachineMeasurement',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_on_machine_measurement_results','OnMachineMeasurement','i18n_ServCloud_OnMachineMeasurementResults','none'),
 ('20_on_machine_measurement_historical_trends','OnMachineMeasurement','i18n_ServCloud_OnMachineMeasurementPositionHistoricalTrends','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('OnMachineMeasurement','20140918000002',NOW(),'admin');

-- ProgTransmit
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('ProgTransmit','i18n_ServCloud_ProgTransmit',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_machines','ProgTransmit','i18n_ServCloud_Machines','none'),
 ('01_machines_delete','ProgTransmit','02 機台列表(刪除CNC程式)','none'),
 ('02_cnc_download','ProgTransmit','i18n_ServCloud_Cnc_Download','none'),
 ('03_cnc_multi_delete','ProgTransmit','CNC程式刪除','none'),
 ('03_cnc_multi_upload','ProgTransmit','i18n_ServCloud_Cnc_Upload','none'),
 ('03_cnc_upload','ProgTransmit','i18n_ServCloud_Cnc_Upload','none'),
 ('03_fanuc_cnc_upload','ProgTransmit','i18n_ServCloud_Fanuc_Cnc_Upload','none'),
 ('05_fanuc_data_server','ProgTransmit','i18n_ServCloud_Fanuc_Data_Server','none'),
 ('06_cnc_program_command_logs','ProgTransmit','i18n_ServCloud_Fanuc_Log_Query','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('ProgTransmit','20140918000002',NOW(),'admin');

-- ProcessParam
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('ProcessParam','i18n_ServCloud_ProcessParam',1,'Process parameter.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_process_param','ProcessParam','i18n_ServCloud_ProcessParam','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('ProcessParam','20140918000002',NOW(),'admin');

-- ProductionDailyReport
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('ProductionDailyReport','i18n_ServCloud_ProductionDailyReport',1,'Provide part count statistics, daily utilization for every machine in the factory.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_daily_report','ProductionDailyReport','i18n_ServCloud_10_daily_report','none'),
 ('20_manage_shift','ProductionDailyReport','i18n_ServCloud_ManageWorkShift_daily','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('ProductionDailyReport','20140918000002',NOW(),'admin');

-- ProductionEfficiency
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('ProductionEfficiency','i18n_ServCloud_Production_Efficiency',1,'Provide production efficiency analysis and measure.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_operate_analysis','ProductionEfficiency','i18n_ServCloud_01_Operate_Analysis','none'),
 ('02_single_measure','ProductionEfficiency','i18n_ServCloud_02_Single_Measure','none'),
 ('03_process_rate_prediction','ProductionEfficiency','i18n_ServCloud_03_Process_Rate_Prediction','none'),
 ('04_machine_auto_reply','ProductionEfficiency','i18n_ServCloud_04_Machine_Auto_Reply','none'),
 ('05_main_axis_efficiency','ProductionEfficiency','i18n_ServCloud_05_Main_Axis_Efficiency','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('ProductionEfficiency','20140918000002',NOW(),'admin');

-- ServTrack
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('ServTrack','i18n_ServCloud_ServTrack',1,'ServTrack.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_product_process_quality','ServTrack','i18n_ServCloud_10_Product_Process_Quality','none'),
 ('20_work_quality','ServTrack','i18n_ServCloud_20_Work_Quality','none'),
 ('30_work_process','ServTrack','i18n_ServCloud_30_Work_Process','none'),
 ('30_work_process_jumpway','ServTrack','i18n_ServCloud_30_Work_Process','none'),
 ('30_work_process_teco','ServTrack','i18n_ServCloud_30_Work_Process','none'),
 ('40_line_oee','ServTrack','i18n_ServCloud_40_Line_Oee','none'),
 ('50_line_oee_day','ServTrack','i18n_ServCloud_50_Line_Oee_Day','none'),
 ('51_line_use_day','ServTrack','i18n_ServCloud_51_Line_Use_Day','none'),
 ('60_operating_performance','ServTrack','i18n_ServCloud_60_Operating_Performance','none'),
 ('60_operating_performance_teco','ServTrack','i18n_ServCloud_60_Operating_Performance','none'),
 ('60_operating_performance_strongled','ServTrack','i18n_ServCloud_60_Operating_Performance','none'),
 ('61_worktime_transfer_record','ServTrack','i18n_ServCloud_61_Worktime_Transfer_Record','none'),
 ('70_tracking_no_move_out','ServTrack','i18n_ServCloud_70_tracking_no_move_out','none'),
 ('71_invalid_line_status_no_end','ServTrack','i18n_ServCloud_71_invalid_line_status_no_end','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('ServTrack','20140918000002',NOW(),'admin');

 -- ServTrackManagement
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('ServTrackManagement','i18n_ServCloud_ServTrack_Management',1,'ServTrackManagement.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('11_tablet_authority','ServTrackManagement','i18n_ServCloud_11_Tablet_Authority','none'),
 ('20_invalid_reason_maintain_strongled','ServTrackManagement','i18n_ServCloud_20_invalid_reason_maintain_strongled','none'),
 ('21_process_maintain','ServTrackManagement','i18n_ServCloud_21_Process_Maintain','none'),
 ('21_process_maintain_strongled','ServTrackManagement','i18n_ServCloud_21_Process_Maintain','none'),
 ('22_product_op_maintain','ServTrackManagement','i18n_ServCloud_22_Product_Op_Maintain','none'),
 ('23_shift_time_maintain','ServTrackManagement','i18n_ServCloud_23_Shift_Time_Maintain','none'),
 ('24_staff_maintain_teco','ServTrackManagement','24_人員條碼列印','none'),
 ('31_line_qrcode_print','ServTrackManagement','i18n_ServCloud_31_Line_Qrcode_Print','none'),
 ('32_work','ServTrackManagement','i18n_ServCloud_32_Work','none'),
 ('33_work_op_qrcode_print','ServTrackManagement','i18n_ServCloud_33_Work_Op_Qrcode_Print','none'),
 ('34_line_working_hour','ServTrackManagement','i18n_ServCloud_34_Line_Working_Hour','none'),
 ('35_tracking_ng_fill_in_strongled','ServTrackManagement','i18n_ServCloud_35_tracking_ng_fill_in_strongled','none'),
 ('50_basic_data_import','ServTrackManagement','i18n_ServCloud_50_Basic_Data_Import','none'),
 ('60_work_data_import','ServTrackManagement','i18n_ServCloud_60_Work_Data_Import','none'),
 ('60_work_data_import_teco','ServTrackManagement','i18n_ServCloud_60_Work_Data_Import','none'),
 ('99_insert_and_clear_demo_data','ServTrackManagement','99 demo資料插入與清理','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('ServTrackManagement','20140918000002',NOW(),'admin');

-- ToolManagement
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('ToolManagement','i18n_ServCloud_ToolManagement',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_tool_status','ToolManagement','i18n_ServCloud_01_Tool_Status','none'),
 ('02_tool_compensate','ToolManagement','i18n_ServCloud_02_Tool_Compensate','none'),
 ('03_tool_history','ToolManagement','i18n_ServCloud_03_Tool_History','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('ToolManagement','20140918000003',NOW(),'admin');


-- ToolUsed
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('ToolUsed','i18n_ServCloud_ToolUsed',1,'Let user have a better control of tools usage time, remaining usage time, predicted recharge time.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_report','ToolUsed','i18n_ServCloud_01_Report','bcfc2986-8fc8-48f0-8cad-11467c70a65e'),
 ('01_single_measure','ToolUsed','i18n_ServCloud_01_Report','none'),
 ('01_single_measure_cosmos','ToolUsed','i18n_ServCloud_01_Report','none'),
 ('03_tool_usage_statistics_for_production','ToolUsed','i18n_ServCloud_03_Tool_Usage_Statistics_For_Production','none'),
 ('04_tool_log','ToolUsed','i18n_ServCloud_04_Tool_Log','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('ToolUsed','20140918000003',NOW(),'admin');


-- UtilizationStd
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('UtilizationStd','i18n_ServCloud_UtilizationStd',1,'Provide usage statistics, daily reports, schedule adjustment, chart display, product names, working program reaction management and custom reaction management for each devices in the factory.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('05_alarm_message','UtilizationStd','i18n_ServCloud_05_Alarm_Message','null'),
 ('05_main_axis_efficiency_th','UtilizationStd','i18n_ServCloud_05_Main_Axis_Efficiency_TH','none'),
 ('10_daily','UtilizationStd','i18n_ServCloud_10_DailUtilization','2d9827fd-5b40-4146-a87c-db66471fc7cc'),
 ('10_daily_MW','UtilizationStd','i18n_ServCloud_10_DailUtilization','null'),
 ('10_daily_enzoy','UtilizationStd','i18n_ServCloud_10_DailUtilization_Enzoy','null'),
 ('10_daily_anko','UtilizationStd','i18n_ServCloud_10_DailUtilization_Anko','null'),
 ('10_daily_cosmos','UtilizationStd','i18n_ServCloud_10_DailUtilization_Cosmos','null'),
 ('10_daily_cosmos_capacity','UtilizationStd','i18n_ServCloud_10_DailUtilization_Cosmos','null'),
 ('10_pony_daily_cosmos','UtilizationStd','i18n_ServCloud_10_DailUtilization_Cosmos_Pony','null'),
 ('10_daily_kuohwaoa','UtilizationStd','i18n_ServCloud_10_daily_kuohwaoa','null'),
 ('12_oee_cosmos','UtilizationStd','i18n_ServCloud_12_oee_cosmos','null'),
 ('20_monthly','UtilizationStd','i18n_ServCloud_20_Monthly_Utilization','815aa209-e008-4347-b0a2-4df379530dec'),
 ('20_monthly_MW','UtilizationStd','i18n_ServCloud_20_Monthly_Utilization','null'),
 ('20_monthly_cosmos','UtilizationStd','i18n_ServCloud_20_Monthly_Utilization','815aa209-e008-4347-b0a2-4df379530dec'),
 ('20_monthly_enzoy','UtilizationStd','i18n_ServCloud_20_Monthly_Utilization_Enzoy','null'),
 ('20_monthly_kuohwaoa','UtilizationStd','i18n_ServCloud_20_monthly_kuohwaoa','null'),
 ('25_yearly','UtilizationStd','i18n_ServCloud_25_Yearly_Utilization','null'),
 ('22_monthly_3.0','UtilizationStd','i18n_ServCloud_22_Monthly_Utilization','null'),
 ('30_product_information','UtilizationStd','i18n_ServCloud_30_Product_Information','null'),
 ('30_daily_production_info_cosmos','UtilizationStd','i18n_ServCloud_30_Daily_Product_Info','none'),
 ('30_edit_ng_quantity_by_cosmos','UtilizationStd','i18n_ServCloud_30_Edit_Quality_Cosmos','null'),
 ('31_shift_production_info_cosmos','UtilizationStd','i18n_ServCloud_31_Product_Information_By_Shift','null'),
 ('40_customer_manage','UtilizationStd','i18n_ServCloud_40_Customer_Management','949eab4c-a0af-4f82-8a56-0b69d5c1534c'),
 ('40_edit_idle_by_cosmos','UtilizationStd','i18n_ServCloud_40_Edit_Idle_Cosmos','null'),
 ('50_product_manage','UtilizationStd','i18n_ServCloud_50_Product_Management','38d0e7ea-f912-499a-8e8d-5dfa72e7081c'),
 ('70_device_status_statistic','UtilizationStd','i18n_ServCloud_70_Machine_Status_History','null'),
 ('80_product_tracking_aerowin','UtilizationStd','i18n_ServCloud_80_Product_Tracking_Aerowin','null'),
 ('90_product_daily_aerowin','UtilizationStd','i18n_ServCloud_90_Product_Daily_Aerowin','null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('UtilizationStd','20140918000002',NOW(),'admin');

 -- WorkPieceMeasurment
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('WorkPieceMeasurment','i18n_ServCloud_WorkPieceMeasurment',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_work_piece_measurment_report','WorkPieceMeasurment','i18n_ServCloud_WorkPieceMeasurment_Report','none'),
 ('20_the_dimensions_trend_tables','WorkPieceMeasurment','i18n_ServCloud_The_Dimensions_Trend_Tables','none'),
 ('30_yield_transition_diagrams','WorkPieceMeasurment','i18n_ServCloud_Yield_Transition_Diagrams','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('WorkPieceMeasurment','20140918000002',NOW(),'admin');

 -- ServTank Manager
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('ServTank','ServTankManager',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_servcore_config','ServTank','i18n_ServCloud_01_ServCore_Config','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('ServTankManager','20140918000002',NOW(),'admin');

 -- CSU Store
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUStore','i18n_ServCloud_CSUStore',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_storeProduct','CSUStore','商店產品設定','none'),
 ('20_sales','CSUStore','產品銷售','none'),
 ('30_salesReport','CSUStore','銷售報表','none'),
 ('40_orderManagement','CSUStore','商店訂單管理','none'),
 ('50_productSetting','CSUStore','商店庫存查詢','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUStore','20140918000002',NOW(),'admin');

 -- CSU Factory Order
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUFactoryOrder','i18n_ServCloud_CSUFactoryOrder',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_orderReceipt','CSUFactoryOrder','訂單管理','none'),
 ('20_orderManagement','CSUFactoryOrder','需求單開立','none'),
 ('30_store','CSUFactoryOrder','客戶商店設定','none'),
 ('40_productManagement','CSUFactoryOrder','產品設定','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUFactoryOrder','20140918000002',NOW(),'admin');
 
 -- CSU Production Demand And Manufacturing
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUProductionDemandAndManufacturing','生產製造',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_lineSetting','CSUProductionDemandAndManufacturing','產線設備設定','none'),
 ('20_productSetting','CSUProductionDemandAndManufacturing','成品箱管理','none'),
 ('30_demandOrderManagement','CSUProductionDemandAndManufacturing','需求單轉工單','none'),
 ('40_toBeProduced','CSUProductionDemandAndManufacturing','工單生產','none'),
 ('50_deviceSetting','CSUProductionDemandAndManufacturing','設備設定','none'),
 ('60_equipmentMonitoring','CSUProductionDemandAndManufacturing','i18n_ServCloud_CSUProductionDemandAndManufacturing_EquipmentMonitoring','none'),
 ('70_receivingAndRefueling','CSUProductionDemandAndManufacturing','收料與換料','none'),
 ('80_dailyWorkOrderYield','CSUProductionDemandAndManufacturing','工單良率','none'),
 ('90_maskMachineAlarmHistory','CSUProductionDemandAndManufacturing','口罩機警報履歷','none'),
 ('95_deviceMaintenanceSetting','CSUProductionDemandAndManufacturing','機台預防保養設定','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUProductionDemandAndManufacturing','20140918000002',NOW(),'admin');

 -- CSU Product Warehouse
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUProductWarehouse','i18n_ServCloud_CSUProductWarehouse',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_storageEstablish','CSUProductWarehouse','成品入庫','none'),
 ('20_warehousing','CSUProductWarehouse','成品出貨','none'),
 ('30_storageQuery','CSUProductWarehouse','成品儲位查詢與變更','none'),
 ('40_adjustStorageLocationManually','CSUProductWarehouse','成品儲位調整','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUProductWarehouse','20140918000002',NOW(),'admin');

 -- CSU Raw Material Warehouse
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSURawMaterialWarehouse','i18n_ServCloud_CSURawMaterialWarehouse',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_materialIDMaintain','CSURawMaterialWarehouse','原料料號維護','none'),
 ('20_materialItemIDMaintain','CSURawMaterialWarehouse','原料單件管理','none'),
 ('30_reciprocalSetting','CSURawMaterialWarehouse','原料生產倒數設定','none'),
 ('40_shipments','CSURawMaterialWarehouse','原料出庫','none'),
 ('50_remainingProductionInquiries','CSURawMaterialWarehouse','原料儲位查詢','none'),
 ('60_adjustStorageLocationManually','CSURawMaterialWarehouse','原料倉儲位調整','none'),
 ('70_storageQuery','CSURawMaterialWarehouse','原料剩餘產量查詢','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSURawMaterialWarehouse','20140918000002',NOW(),'admin');

 -- CSU Monitoring Report
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUMonitoringReport','環境監控',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_environmentalSensingMonitoring','CSUMonitoringReport','環境感測即時監控','none'),
 ('02_environmentalSensingAlertHistory','CSUMonitoringReport','感測器警報履歷','none'),
 ('03_environmentalSensingHistoricalData','CSUMonitoringReport','感測器歷史資料','none'),
 ('04_AGVRealTimeMonitoring','CSUMonitoringReport','i18n_ServCloud_CSUMonitoringReport_AGVRealTimeMonitoring','none'),
 ('05_accessControlSystemConnection','CSUMonitoringReport','i18n_ServCloud_CSUMonitoringReport_AccessControlSystemConnection','none'),
 ('06_fixedImageConnection','CSUMonitoringReport','i18n_ServCloud_CSUMonitoringReport_FixedImageConnection','none'),
 ('07_monitoringCenterSignIn','CSUMonitoringReport','i18n_ServCloud_CSUMonitoringReport_MonitoringCenterSignIn','none'),
 ('08_AGVMaintainSetting','CSUMonitoringReport','AGV保養設定','none'),
 ('50_manage_agv','CSUMonitoringReport','AGV列表','none'),
 ('51_manage_rfid','CSUMonitoringReport','RFID站點設定','none'),
 ('52_manage_sensor_type','CSUMonitoringReport','感測器類型設定','none'),
 ('53_manage_sensor','CSUMonitoringReport','感測器設定','none'),
 ('99_alertNotificationQuery','CSUMonitoringReport','提醒通知查詢','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUMonitoringReport','20140918000002',NOW(),'admin');

 -- CSU WareHouse Setting
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUWareHouseSetting','倉庫設定',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_storingAreaSetting','CSUWareHouseSetting','儲區管理','none'),
 ('20_flowingStoringAreaSetting','CSUWareHouseSetting','流動式儲區管理','none'),
 ('30_printStoringBarCode','CSUWareHouseSetting','列印儲位條碼','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUWareHouseSetting','20140918000002',NOW(),'admin');

  -- ServtrackSimulator
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('ServtrackSimulator','i18n_ServCloud_ServTrack_Simulator',1,'ServtrackSimulator.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('50_basic_data_import','ServtrackSimulator','i18n_ServCloud_50_Basic_Data_Import','none'),
 ('60_work_data_import','ServtrackSimulator','i18n_ServCloud_60_Work_Data_Import','none'),
 ('70_work_tracking_data_import','ServtrackSimulator','i18n_ServCloud_70_Work_Tracking_Data_Import','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('ServtrackSimulator','20140918000002',NOW(),'admin');

  -- Develop UI Tool
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('DevTool','DevTool',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('DevTool','20140918000002',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_form','DevTool','form editor','none'),
 ('90_manage_app','DevTool','管理APP','none'),
 ('91_manage_func','DevTool','管理FUNC','none');

   -- ReportEngine
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('ReportEngine','ReportEngine',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('ReportEngine','20140918000002',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_power_bi','ReportEngine','Report Engine','none');

  -- 3DCMM
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('3DCMM','i18n_ServCloud_3DCM',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('3DCMM','20140918000002',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_mould_testing_result','3DCMM','i18n_ServCloud_3DCM_10_mould_testing_result','none'),
 ('10_quality_inspections_report','3DCMM','i18n_ServCloud_3DCM_10_quality_inspections_report','none');

  -- Mold Management
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('MoldManagement','i18n_ServCloud_MoldManagement',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('MoldManagement','20140918000002',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_mold_progress','MoldManagement','i18n_ServCloud_MoldManagement_01_mold_progress','none'),
 ('02_item_working_status','MoldManagement','i18n_ServCloud_MoldManagement_02_item_working_status','none'),
 ('03_item_working_process','MoldManagement','i18n_ServCloud_MoldManagement_03_item_working_process','none'),
 ('04_item_malfunction_reason_track','MoldManagement','i18n_ServCloud_MoldManagement_04_item_malfunction_reason_track','none'),
 ('05_item_malfunction_feedback','MoldManagement','i18n_ServCloud_MoldManagement_05_item_malfunction_feedback','none'),
 ('10_dashboard','MoldManagement','i18n_ServCloud_MoldManagement_10_dashboard','none');

  -- Single Line Analysis
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('SingleLineAnalysis','i18n_ServCloud_Single_Line_Analysis',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('SingleLineAnalysis','20140918000002',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_single_line_program','SingleLineAnalysis','i18n_ServCloud_Execute_Single_Statistics','none'),
 ('20_set_program_time','SingleLineAnalysis','i18n_ServCloud_Set_Program_Time','none'),
 ('21_upload_run_program','SingleLineAnalysis','i18n_ServCloud_21_Upload_Run_Program','none');

 -- IiotWheelWearDetection
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('IiotWheelWearDetection','砂輪磨耗偵測系統',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('IiotWheelWearDetection','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('20_microphone_sensing','IiotWheelWearDetection','20 麥克風偵測','none'),
 ('10_ultrasonic_sensing','IiotWheelWearDetection','10 超音波感測','none'); 
 
 -- IIOT Machine Temperature Sensor 
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('IIOTMachineTemperatureSensor','機台溫度感測偵測',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('IIOTMachineTemperatureSensor','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_machine_temperature_sensor','IIOTMachineTemperatureSensor','10 機台溫度感測器偵測與收集模組','none');

 -- superpcb EquipMonitor
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('SuperpcbEquipMonitor','興普設備監控',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('SuperpcbEquipMonitor','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_plant_area','SuperpcbEquipMonitor','10 廠區監控','none'),
 ('30_management_plant_area','SuperpcbEquipMonitor','30 廠區設定','none');

 -- superpcb UtilizationStd
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('SuperpcbUtilizationStd','興普稼動管理',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('SuperpcbUtilizationStd','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_daily','SuperpcbUtilizationStd','i18n_ServCloud_10_DailUtilization','none'),
 ('20_monthly','SuperpcbUtilizationStd','i18n_ServCloud_20_Monthly_Utilization','none');

 -- iiot watch
 INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES 
('IIOTAlarmLog','告警通報',1,'','1.0','2018-10-24 15:40:43','@st@STAdmin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('IIOTAlarmLog','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES 
('01_alarm_log','IIOTAlarmLog','告警通報歷史查詢','none');

 INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES 
('IIOTDeviceWatchManagement','機台手錶管理',1,'','1.0','2018-10-24 15:38:53','@st@STAdmin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('IIOTDeviceWatchManagement','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES 
('01_device_management','IIOTDeviceWatchManagement','機台設備管理','none'),
('02_device_idle_overtime_management','IIOTDeviceWatchManagement','閒置超時時間設定','none'),
('03_watch_management','IIOTDeviceWatchManagement','智慧手錶管理','none');

 -- iiot watch tool
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES 
 ('IIOTToolManagement','i18n_ServCloud_Tool_Setting',1,'','1.0','2018-10-24 15:38:53','@st@STAdmin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('IIOTToolManagement','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES 
('01_tool_spec','IIOTToolManagement','i18n_ServCloud_01_Maintenance_Of_Tool_Spec','none'),
('02_tool_holder','IIOTToolManagement','i18n_ServCloud_02_Create_Tool_Chuck','none'),
('03_tool','IIOTToolManagement','i18n_ServCloud_03_Create_Tool','none'),
('04_tool_prepare_list_import','IIOTToolManagement','i18n_ServCloud_04_Upload_Tool_List','none');

 INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES 
('IIOTToolPrepareRecord','i18n_ServCloud_Tool_List_Record',1,'','1.0','2018-10-24 15:38:53','@st@STAdmin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('IIOTToolPrepareRecord','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES 
('01_tool_prepare_record','IIOTToolPrepareRecord','i18n_ServCloud_01_Edit_Tool_List','none');

 INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES 
('IIOTToolReport','i18n_ServCloud_Tool_Usage_Report',1,'','1.0','2018-10-24 15:38:53','@st@STAdmin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('IIOTToolReport','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES 
('01_tool_used_resume','IIOTToolReport','i18n_ServCloud_01_Tool_Usage_Record','none'),
('02_tool_tracking','IIOTToolReport','i18n_ServCloud_02_Tool_Usage_Move_I/O_Record','none');

INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES 
 ('IIOTToolStorageSystem','i18n_ServCloud_Tool_Storage_System',1,'','1.0','2018-10-24 15:38:53','@st@STAdmin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('IIOTToolStorageSystem','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES 
 ('01_tool_prepare_upload','IIOTToolStorageSystem','i18n_ServCloud_01_Tool_PrePare_Upload','none'),
 ('02_tool_storage_status','IIOTToolStorageSystem','i18n_ServCloud_02_Tool_Storage_Status','none'),
 ('03_repair_tool_prepare_upload','IIOTToolStorageSystem','i18n_ServCloud_03_Repair_Tool_Storage_Status','none'),
 ('10_tool_storage_location_query','IIOTToolStorageSystem','i18n_ServCloud_10_Storage_Location_Query','none');

INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES 
 ('IIOTMachineIdleIntelligentAnalysis','i18n_ServCloud_Machine_Idle_Intelligent_Analysis',1,'','1.0','2018-10-24 15:38:53','@st@STAdmin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('IIOTMachineIdleIntelligentAnalysis','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES 
 ('01_shift_idle_reason_statistics','IIOTMachineIdleIntelligentAnalysis','i18n_ServCloud_01_Shift_Idle_Reason_Statistics','none');

-- iiot network
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES 
('IIOTNetworkManagement','聯網管理',1,'','1.0','2018-10-24 15:40:43','@st@STAdmin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('IIOTNetworkManagement','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES 
('01_network_management','IIOTNetworkManagement','聯網管理','none');

INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES 
('IIOTNetworkMonitor','聯網監控',1,'','1.0','2018-10-24 15:40:43','@st@STAdmin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('IIOTNetworkMonitor','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES 
('01_network_monitor','IIOTNetworkMonitor','聯網監控','none');

 -- feedback Demand list
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('FeedbackDemandListManagement','i18n_ServCloud_Feedback_DemandList_Management',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('FeedbackDemandListManagement','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_search_demandlist','FeedbackDemandListManagement','i18n_ServCloud_10_Search_DemandList','none');
 
 -- QueryRFQ
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('QueryRFQ','i18n_ServCloud_Inquiry_inquiry',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('QueryRFQ','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_query_rfq','QueryRFQ','i18n_ServCloud_10_No_quote_inquiry_inquiry','none');

  -- StrongLED
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('StrongLED','i18n_ServCloud_Quick_Quote',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('StrongLED','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_query_rfq','StrongLED','i18n_ServCloud_10_Inquiry_inquiry','none'),
 ('11_rfq_detail','StrongLED','i18n_ServCloud_11_Inquiry_contents','none'),
 ('13_project_management','StrongLED','i18n_ServCloud_13_Item_List','none'),
 ('20_product_management','StrongLED','i18n_ServCloud_20_Management_Inquiry','none'),
 ('21_product_detail','StrongLED','i18n_ServCloud_21_Product_Content','none'),
 ('30_material_management','StrongLED','i18n_ServCloud_30_Material_Management','none'),
 ('40_rfq_column_management','StrongLED','i18n_ServCloud_40_Rfq_Field_Management','none'),
 ('50_material_module_management','StrongLED','i18n_ServCloud_50_Material_Management_Module','none'),
 ('60_material_module_rule_management','StrongLED','i18n_ServCloud_60_Material_Management_Module_Rules','none');


 -- strongLED Storage management
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('StrongLEDStorageManagement','i18n_ServCloud_Storage_Management',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('StrongLEDStorageManagement','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_manage_storage_structure','StrongLEDStorageManagement','i18n_ServCloud_10_Manage_Storage_Structure','none'),
 ('10_manage_storage','StrongLEDStorageManagement','i18n_ServCloud_10_Manage_Storage','none'),
 ('10_manage_zone','StrongLEDStorageManagement','i18n_ServCloud_10_Manage_Zone','none'),
 ('11_print_storage_qrcode','StrongLEDStorageManagement','i18n_ServCloud_11_Print_Storage_Qrcode','none'),
 ('12_create_material_qrcode','StrongLEDStorageManagement','i18n_ServCloud_12_Create_Material_Qrcode','none'),
 ('13_batch_purchase_order', 'StrongLEDStorageManagement', 'i18n_ServCloud_13_Purchase_Orders_Approved_Demolition', 'none'),
 ('20_manage_storage','StrongLEDStorageManagement','i18n_ServCloud_20_Manage_Storage','none'),
 ('20_manage_storage_rule','StrongLEDStorageManagement','i18n_ServCloud_20_Manage_Storage','none'),
 ('21_manage_storage_type','StrongLEDStorageManagement','i18n_ServCloud_21_Manage_Storage_Type','none'),
 ('22_manage_storage_position','StrongLEDStorageManagement','i18n_ServCloud_22_Manage_Storage_Position','none'),
 ('23_manage_position_light','StrongLEDStorageManagement','i18n_ServCloud_23_Manage_Position_Light','none'),
 ('24_manage_piller_light','StrongLEDStorageManagement','i18n_ServCloud_24_Manage_Piller_Light','none'),
 ('30_manage_thing','StrongLEDStorageManagement','i18n_ServCloud_30_Manage_Thing','none'),
 ('31_Storage_location_setting','StrongLEDStorageManagement','i18n_ServCloud_31_Storage_location_setting','none'),
 ('32_material_name_classification','StrongLEDStorageManagement','i18n_ServCloud_32_material_name_classification','none'),
 ('35_manage_material','StrongLEDStorageManagement','i18n_ServCloud_35_Manage_Material','none'),
 ('36_storage_material','StrongLEDStorageManagement','i18n_ServCloud_36_Storage_Material','none'),
 ('37_inquire_working_material','StrongLEDStorageManagement','i18n_ServCloud_37_Inquire_Working_Material','none'),
 ('37_inquire_material','StrongLEDStorageManagement','i18n_ServCloud_37_Inquire_Material','none'),
 ('38_inquire_material','StrongLEDStorageManagement','i18n_ServCloud_38_Inquire_Material','none'),
 ('39_manage_pickup','StrongLEDStorageManagement','i18n_ServCloud_39_Manage_Pickup','none'),
 ('39_manage_unlock','StrongLEDStorageManagement','i18n_ServCloud_39_Manage_Unlock','none'),
 ('40_manage_document','StrongLEDStorageManagement','i18n_ServCloud_40_Manage_Document','none'),
 ('50_manage_sender','StrongLEDStorageManagement','i18n_ServCloud_50_Manage_Sender','none'),
 ('60_manage_employee','StrongLEDStorageManagement','i18n_ServCloud_60_Manage_Employee','none'),
 ('65_manage_supplier','StrongLEDStorageManagement','i18n_ServCloud_65_Manage_Supplier','none'),
 ('70_pickup_dashboard','StrongLEDStorageManagement','i18n_ServCloud_70_Pickup_Dashboard','none');

 -- strongLED Report Management
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('StrongLEDReportManagement','i18n_ServCloud_Report_Management',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('StrongLEDReportManagement','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_access_query','StrongLEDReportManagement','i18n_ServCloud_10_Access_Query','none'),
 ('10_access_query_strongled','StrongLEDReportManagement','i18n_ServCloud_10_Access_Query','none'),
 ('13_comoss_return_query', 'StrongLEDReportManagement', 'i18n_ServCloud_13_Comoss_Return_Query', 'none'),
 ('20_item_inquiry','StrongLEDReportManagement','i18n_ServCloud_20_Item_Inquiry','none'),
 ('20_item_inquiry_strongled','StrongLEDReportManagement','i18n_ServCloud_20_Item_Inquiry','none'),
 ('20_item_inquiry_comoss','StrongLEDReportManagement','i18n_ServCloud_20_Item_Inquiry','none'),
 ('30_position_inquiry','StrongLEDReportManagement','i18n_ServCloud_30_Position_Inquiry','none'),
 ('30_position_inquiry_strongled','StrongLEDReportManagement','i18n_ServCloud_30_Position_Inquiry','none'),
 ('40_comoss_stock_out_main_edit','StrongLEDReportManagement','i18n_ServCloud_40_Comoss_Stock_Out_Main_Edit','none');

 -- strongLED Monitor management
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('StrongLEDMonitorManagement','i18n_ServCloud_Monitor_Management',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('StrongLEDMonitorManagement','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_zone','StrongLEDMonitorManagement','i18n_ServCloud_10_Zone','none'),
 ('10_zone_edit','StrongLEDMonitorManagement','i18n_ServCloud_10_Zone_Edit','none');

 -- strongLED Work management
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('StrongLEDWorkManagement','i18n_ServCloud_ServTrack_Management',1,'StrongLEDWorkManagement.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('11_tablet_authority','StrongLEDWorkManagement','i18n_ServCloud_11_Tablet_Authority','none'),
 ('21_process_maintain','StrongLEDWorkManagement','i18n_ServCloud_21_Process_Maintain','none'),
 ('22_product_op_maintain','StrongLEDWorkManagement','i18n_ServCloud_22_Product_Op_Maintain','none'),
 ('23_shift_time_maintain','StrongLEDWorkManagement','i18n_ServCloud_23_Shift_Time_Maintain','none'),
 ('24_staff_maintain','StrongLEDWorkManagement','24_人員條碼列印','none'),
 ('31_line_qrcode_print','StrongLEDWorkManagement','i18n_ServCloud_31_Line_Qrcode_Print','none'),
 ('32_work','StrongLEDWorkManagement','i18n_ServCloud_32_Work','none'),
 ('33_work_op_qrcode_print','StrongLEDWorkManagement','i18n_ServCloud_33_Work_Op_Qrcode_Print','none'),
 ('34_line_working_hour','StrongLEDWorkManagement','i18n_ServCloud_34_Line_Working_Hour','none'),
 ('50_basic_data_import','StrongLEDWorkManagement','i18n_ServCloud_50_Basic_Data_Import','none'),
 ('60_work_data_import','StrongLEDWorkManagement','i18n_ServCloud_60_Work_Data_Import','none'),
 ('60_work_data_import_teco','StrongLEDWorkManagement','i18n_ServCloud_60_Work_Data_Import','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('StrongLEDWorkManagement','20140918000002',NOW(),'admin');

 -- strongLED KPI
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('StrongLEDKPI','i18n_ServCloud_StrongLED_KPI',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('StrongLEDKPI','20140918000999',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_yield_rate_statistics','StrongLEDKPI','10_Yield_Rate_Statistics','none'),
 ('11_defective_reason_analysis','StrongLEDKPI','11_Defective_Reason_Analysis','none'),
 ('20_invalid_person_statistics','StrongLEDKPI','20_Invalid_Person_Statistics','none'),
 ('21_invalid_person_analysis','StrongLEDKPI','21_Invalid_Person_Analysis','none'),
 ('30_change_line_human_time_statistics','StrongLEDKPI','30_Change_Line_Human_Time_Statistics','none'),
 ('31_change_line_human_time_analysis','StrongLEDKPI','31_Change_Line_Human_Time_Analysis','none'),
 ('40_efficiency_statistics','StrongLEDKPI','40_Efficiency_Statistics','none'),
 ('41_efficiency_analysis','StrongLEDKPI','41_Efficiency_Analysis','none');

 -- dwg decoder
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('DWGDecoder','i18n_ServCloud_Intelligent_Deployment',1,'智能排配','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_dwg_decoder','DWGDecoder','i18n_ServCloud_Intelligent_Deployment','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('DWGDecoder','20140918000999',NOW(),'admin');