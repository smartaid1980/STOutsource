update m_sys_func set func_name = '區域機台監視' where func_id = '02_plant_area_monitor' and app_id = 'HuangLiangMonitorApplication';
update m_sys_func set func_name = '機台歷史狀態圖' where func_id = '25_machine_status_history' and app_id = 'HuangLiangMonitorApplication';
update m_sys_func set func_name = '原始資料查詢' where func_id = '30_download_raw_data' and app_id = 'HuangLiangMonitorApplication';
update m_sys_func set func_name = 'Marco數值監控服務' where func_id = '10_machine_status_query' and app_id = 'HuangLiangMonitorApplication';

update m_app_info set app_name = '稼動管理應用服務' where app_id = 'HuangLiangUtilization';
update m_sys_func set func_name = '各機台品質稼動率' where func_id = '30_Quality_Utilization_by_Machine' and app_id = 'HuangLiangUtilization';
update m_sys_func set func_name = '品質稼動率報表' where func_id = '35_quality_utilization_by_employee' and app_id = 'HuangLiangUtilization';
update m_sys_func set func_name = '產品品質稼動率' where func_id = '40_quality_utilization_by_product' and app_id = 'HuangLiangUtilization';

update m_sys_func set func_name = '機台當下廠務部稼動紀錄表' where func_id = '20_factory_service_utilization_maintenance' and app_id = 'HuangLiangUtilizationDataMaintenance';

update m_app_info set app_name = '機台維護管理' where app_id = 'HuangLiangRepairManagement';
update m_sys_func set func_name = '機台重要性調整' where func_id = '4_4_2_machine_prioprity' and app_id = 'HuangLiangRepairManagement';
update m_sys_func set func_name = '維修通報記錄' where func_id = '4_4_7_repair_alert' and app_id = 'HuangLiangRepairManagement';
update m_sys_func set func_name = '機台故障記錄' where func_id = '4_4_8_repair_log_query' and app_id = 'HuangLiangRepairManagement';

update m_app_info set app_name = '資料上傳服務' where app_id = 'HuangLiangDataUpload';
update m_sys_func set func_name = '顧車人員名單轉入' where func_id = '10_employee_data_upload' and app_id = 'HuangLiangDataUpload';
update m_sys_func set func_name = '生產資料轉入' where func_id = '20_ERP_data_upload' and app_id = 'HuangLiangDataUpload';