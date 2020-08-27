 -- HuangLiangDashboard
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HuangLiangDashboard','電子看板',1,'電子看板','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_inner_dashboard','HuangLiangDashboard','內部電子看板','none'),
 ('02_outter_dashboard','HuangLiangDashboard','外部電子看板','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HuangLiangDashboard','20140918000999',NOW(),'admin');

 -- HuangLiangDataUpload
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HuangLiangDataUpload','i18n_ServCloud_Data_Upload',1,'Data Upload.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_employee_data_upload','HuangLiangDataUpload','i18n_ServCloud_Employee_Data_Upload','none'),
 ('20_ERP_data_upload','HuangLiangDataUpload','i18n_ServCloud_ERP_Data_Upload','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HuangLiangDataUpload','20140918000002',NOW(),'admin');

 -- HuangLiangRepairManagement
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HuangLiangRepairManagement','機台維修管理',1,'Machine Maintenance Management','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('4_4_1_repair_checkin','HuangLiangRepairManagement','維修人員報到','none'),
 ('4_4_2_machine_prioprity','HuangLiangRepairManagement','機台重要性調整','none'),
 ('4_4_5_repair_assign','HuangLiangRepairManagement','機台維修手動派工','none'),
 ('4_4_6_repair_log_maintenance','HuangLiangRepairManagement','機台維修紀錄維護','none'),
 ('4_4_7_repair_alert','HuangLiangRepairManagement','維修通報紀錄','none'),
 ('4_4_8_repair_log_query','HuangLiangRepairManagement','機台維修紀錄','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HuangLiangRepairManagement','20140918000002',NOW(),'admin');

   -- HuangLiangMapManagement
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HuangLiangMapManagement','選單維護',1,'選單維護','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_alarm_code','HuangLiangMapManagement','故障代碼','none'),
 ('02_repair_item','HuangLiangMapManagement','維修項目','none'),
 ('03_exam_defective_cause','HuangLiangMapManagement','例檢不良原因','none'),
 ('04_followup_work','HuangLiangMapManagement','廠務稼動後續工程','none'),
 ('05_repair_type','HuangLiangMapManagement','維修類型','none'),
 ('06_material_property','HuangLiangMapManagement','材料屬性選單設定','none'),
 ('07_mtl_profile','HuangLiangMapManagement','材料設定','none'),
 ('08_mtl_location','HuangLiangMapManagement','材料庫位置設定','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HuangLiangMapManagement','20140918000002',NOW(),'admin');

  -- HuangLiangMonitorApplication
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HuangLiangMonitorApplication','監控應用服務',1,'Monitor Application','1.0',NOW(),'admin',NULL,NULL);
 INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES 
 ('02_plant_area_monitor','HuangLiangMonitorApplication','i18n_ServCloud_Plant_Area_Monitor','none'),
 ('03_management_plant','HuangLiangMonitorApplication','i18n_ServCloud_Plant_Area_Management','none'),
 ('04_manage_machine_light','HuangLiangMonitorApplication','i18n_ServCloud_Number_Machine_Status_Management','none'),
 ('05_unconnected_machine_macro_input','HuangLiangMonitorApplication','i18n_ServCloud_Unconnected_Machine_Macro_Input','none'),
 ('10_machine_status_query','HuangLiangMonitorApplication','機台狀態查詢','none'),
 ('20_part_count_merged','HuangLiangMonitorApplication','加工顆數查詢','none'),
 ('25_machine_status_history','HuangLiangMonitorApplication','機台歷史狀態查詢','none'),
 ('30_download_raw_data', 'HuangLiangMonitorApplication','設備原始資料下載(解碼)','none'),
 ('40_n6_grouper','HuangLiangMonitorApplication','N6歷史紀錄查詢','null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HuangLiangMonitorApplication','20140918000002',NOW(),'admin');

 -- HuangLiangUtilization
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HuangLiangUtilization','i18n_ServCloud_Utilization_Statistics',1,'Provide usage statistics, daily reports, schedule adjustment, chart display, product names, working program reaction management and custom reaction management for each devices in the factory.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_daily','HuangLiangUtilization','各機台日稼動率','none'),
 ('15_downtime_report','HuangLiangUtilization','無效時間分析','none'),
 ('20_employee_utilization_by_machine','HuangLiangUtilization','各機台顧車人員稼動率查詢','none'),
 ('25_product_utilization','HuangLiangUtilization','產品稼動率查詢','none'),
 ('30_Quality_Utilization_by_Machine','HuangLiangUtilization','各機台品質稼動率查詢','none'),
 ('35_quality_utilization_by_employee','HuangLiangUtilization','品質稼動率報表(人)','none'),
 ('40_quality_utilization_by_product','HuangLiangUtilization','產品品質稼動率查詢','none'),
 ('45_calibration_record_by_machine','HuangLiangUtilization','各機台校車紀錄查詢','none'),
 ('50_calibration_record_by_product','HuangLiangUtilization','產品校車時間查詢','none'),
 ('55_employee_performance','HuangLiangUtilization','顧車人員績效查詢','none'),
 ('60_customer_sample_analysis','HuangLiangUtilization','客戶樣本分析','none'),
 ('65_factory_service_utilization','HuangLiangUtilization','產品廠務部稼動紀錄表查詢', 'none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HuangLiangUtilization','20140918000002',NOW(),'admin');


 -- HuangLiangUtilizationDataMaintenance
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HuangLiangUtilizationDataMaintenance','稼動資料維護',1,'Utilization Data Maintenance','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_quality_detect_data_maintenance','HuangLiangUtilizationDataMaintenance','品質檢測數據維護','none'),
 ('20_factory_service_utilization_maintenance','HuangLiangUtilizationDataMaintenance','各機台廠務部稼動紀錄表維護','none'),
 ('30_sample_editor','HuangLiangUtilizationDataMaintenance','已生產樣品管編補填','none'),
 ('40_quality_detect_unfilled_log','HuangLiangUtilizationDataMaintenance','品質檢測數據未登打紀錄','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HuangLiangUtilizationDataMaintenance','20140918000002',NOW(),'admin');

 -- HuangLiangCostingCenter
 INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HuangLiangCostingCenter','成本計算中心',1,'成本計算','1.0',NOW(),'admin',NOW(),'admin');
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_cnc_cost_count','HuangLiangCostingCenter','CNC成本計算','none'),
 ('20_material_cost_count','HuangLiangCostingCenter','領料使用成本','none'),
 ('30_tool_cost_count','HuangLiangCostingCenter','刀具使用成本','none'),
 ('40_order_cost_count','HuangLiangCostingCenter','生產指令總成本','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HuangLiangCostingCenter','20140918000002',NOW(),'admin');

  -- HuangLiangMaterialTempStock
 INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HuangLiangMaterialTempStock','材料暫入模組',1,'Material Temperary Stock','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_pending_iqc','HuangLiangMaterialTempStock','待驗料紀錄查詢','none'),
 ('20_pending_stock','HuangLiangMaterialTempStock','待審入庫材料查詢','none'),
 ('30_pending_return','HuangLiangMaterialTempStock','待退材料查詢','none'),
 ('40_return_record','HuangLiangMaterialTempStock','退料記錄查詢','none'),
 ('50_stock_record','HuangLiangMaterialTempStock','材料入庫紀錄查詢','none'),
 ('60_material_stock','HuangLiangMaterialTempStock','材料庫存查詢','none'),
 ('70_material_stock_chg_log','HuangLiangMaterialTempStock','材料異動記錄查詢','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HuangLiangMaterialTempStock','20140918000002',NOW(),'admin');

 -- ProgTransmit
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('ProgTransmit','i18n_ServCloud_ProgTransmit',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_machines','ProgTransmit','i18n_ServCloud_Machines','none'),
 ('01_machines_delete','ProgTransmit','02 機台列表(刪除CNC程式)','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('ProgTransmit','20140918000002',NOW(),'admin');

 
 -- HuangLiangProductionSchedule
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HuangLiangProductionSchedule','i18n_ServCloud_Production_Scheduling',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_product_management','HuangLiangProductionSchedule','i18n_ServCloud_01_Product_Management','none'),
 ('02_work_order_status','HuangLiangProductionSchedule','i18n_ServCloud_02_Work_Order_Status','none'),
 ('03_machine_assignment','HuangLiangProductionSchedule','i18n_ServCloud_03_Machine_Assignment','none'),
 ('04_pre_scheduling','HuangLiangProductionSchedule','i18n_ServCloud_04_Pre_Scheduling','none'),
 ('05_machine_list_management','HuangLiangProductionSchedule','i18n_ServCloud_05_Machine_The_Ability_To_Set','none'),
 ('06_query_pre_scheduling','HuangLiangProductionSchedule','i18n_ServCloud_06_Query_Production_Scheduling','none'),
 ('07_query_day_off','HuangLiangProductionSchedule','i18n_ServCloud_07_Vacation_Days_The_Whole_Plant_Maintenance','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HuangLiangProductionSchedule','20140918000002',NOW(),'admin');

  -- HuangLiangMatCollectAndSupplement
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HuangLiangMatCollectAndSupplement','i18n_ServCloud_Material_Collect_And_Supplement',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_material_assignment_record','HuangLiangMatCollectAndSupplement','i18n_ServCloud_01_Material_Assignment_Record','none'),
 ('02_material_consumption_status','HuangLiangMatCollectAndSupplement','i18n_ServCloud_02_Material_Consumption_Status','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HuangLiangMatCollectAndSupplement','20140918000002',NOW(),'admin');

-- HuangLiangToolSetting
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HuangLiangToolSetting','i18n_ServCloud_Tool_Setting',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_tool_type_management','HuangLiangToolSetting','i18n_ServCloud_01_Tool_Type_Setting','none'),
 ('02_tool_location_management','HuangLiangToolSetting','i18n_ServCloud_02_Tool_Set_Storage_Spaces','none'),
 ('03_tool_supplier_management','HuangLiangToolSetting','i18n_ServCloud_03_Tool_Vendors_Set','none'),
 ('04_tool_management','HuangLiangToolSetting','i18n_ServCloud_04_Tools_Set','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HuangLiangToolSetting','20140918000002',NOW(),'admin');

-- HuangLiangToolStock
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HuangLiangToolStock','i18n_ServCloud_Tool_Purchase_And_Inventory_Records',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_tool_purchase_record','HuangLiangToolStock','i18n_ServCloud_01_Tool_Purchase_Records_Check','none'),
 ('02_tool_stock','HuangLiangToolStock','i18n_ServCloud_02_Stock_Search_Tool','none'),
 ('03_tool_stock_chg_log','HuangLiangToolStock','i18n_ServCloud_03_Tool_Inventory_Transaction_Record_Query','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HuangLiangToolStock','20140918000002',NOW(),'admin');

-- HuangLiangToolUse
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HuangLiangToolUse','i18n_ServCloud_Collar_Single_Blade_Management',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_mp_tool_use_management','HuangLiangToolUse','i18n_ServCloud_01_Production_Class_Collar_Single_Blade_Management','none'),
 ('02_sp_tool_use_management','HuangLiangToolUse','i18n_ServCloud_02_Other_Categories_Collar_Single_Blade_Management','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HuangLiangToolUse','20140918000002',NOW(),'admin');

 -- HuangLiangToolHistory
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HuangLiangToolHistory','i18n_ServCloud_Tool_History',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('01_mp_tool_history','HuangLiangToolHistory','i18n_ServCloud_01_Production_History_Tool','none'),
 ('02_sp_tool_history','HuangLiangToolHistory','i18n_ServCloud_02_Sample_Cutter_Resume','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HuangLiangToolHistory','20140918000002',NOW(),'admin');