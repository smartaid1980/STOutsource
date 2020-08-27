--
-- Dumping data for table `m_sys_auth_func`
--
delete from `m_sys_auth_func` where `auth_id` = 'sys_manager_auth';
	
/*!40000 ALTER TABLE `m_sys_auth_func` DISABLE KEYS */;
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- Management
 ('sys_manager_auth','02_manage_user','Management',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','05_manage_box_edit','Management',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','06_manage_machine_edit','Management',NOW(),'admin',NULL,NULL),

 -- HuangLiangUtilizationDataMaintenance
 ('sys_manager_auth','10_quality_detect_data_maintenance','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','20_factory_service_utilization_maintenance','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','30_sample_editor','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','40_quality_detect_unfilled_log','HuangLiangUtilizationDataMaintenance',NOW(),'admin',NULL,NULL),

 -- HuangLiangUtilization
 ('sys_manager_auth','10_daily','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','15_downtime_report','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','20_employee_utilization_by_machine','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','25_product_utilization','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','30_Quality_Utilization_by_Machine','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','35_quality_utilization_by_employee','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','40_quality_utilization_by_product','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','45_calibration_record_by_machine','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','50_calibration_record_by_product','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','55_employee_performance','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','60_customer_sample_analysis','HuangLiangUtilization',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','65_factory_service_utilization','HuangLiangUtilization',NOW(),'admin',NULL,NULL),

 -- HuangLiangMonitorApplication
 ('sys_manager_auth','02_plant_area_monitor','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','03_management_plant','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','04_manage_machine_light','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','05_unconnected_machine_macro_input','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','10_machine_status_query','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','20_part_count_merged','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','25_machine_status_history','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','30_download_raw_data','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','40_n6_grouper','HuangLiangMonitorApplication',NOW(),'admin',NULL,NULL),

 -- HuangLiangMapManagement
 ('sys_manager_auth','01_alarm_code','HuangLiangMapManagement',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','02_repair_item','HuangLiangMapManagement',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','03_exam_defective_cause','HuangLiangMapManagement',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','04_followup_work','HuangLiangMapManagement',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','05_repair_type','HuangLiangMapManagement',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','06_material_property','HuangLiangMapManagement',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','07_mtl_profile','HuangLiangMapManagement',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','08_mtl_location','HuangLiangMapManagement',NOW(),'admin',NULL,NULL),

-- HuangLiangMaterialTempStock
 ('sys_manager_auth','10_pending_iqc','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','20_pending_stock','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','30_pending_return','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','40_return_record','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','50_stock_record','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','60_material_stock','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),

 -- HuangLiangRepairManagement
 ('sys_manager_auth','4_4_1_repair_checkin','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','4_4_2_machine_prioprity','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','4_4_5_repair_assign','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','4_4_6_repair_log_maintenance','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','4_4_7_repair_alert','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','4_4_8_repair_log_query','HuangLiangRepairManagement',NOW(),'admin',NULL,NULL),

 -- HuangLiangDataUpload
 ('sys_manager_auth','10_employee_data_upload','HuangLiangDataUpload',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','20_ERP_data_upload','HuangLiangDataUpload',NOW(),'admin',NULL,NULL),

 -- HuangLiangDashboard
 ('sys_manager_auth','01_inner_dashboard','HuangLiangDashboard',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','02_outter_dashboard','HuangLiangDashboard',NOW(),'admin',NULL,NULL),

 -- HuangLiangCostingCenter
 ('sys_manager_auth','10_cnc_cost_count','HuangLiangCostingCenter',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','20_material_cost_count','HuangLiangCostingCenter',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','30_tool_cost_count','HuangLiangCostingCenter',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','40_order_cost_count','HuangLiangCostingCenter',NOW(),'admin',NULL,NULL),
 
 -- ProgTransmit
 ('sys_manager_auth','01_machines','ProgTransmit',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','01_machines_delete','ProgTransmit',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_auth_func` ENABLE KEYS */;