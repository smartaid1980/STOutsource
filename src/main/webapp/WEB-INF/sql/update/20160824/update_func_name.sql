update m_sys_func set func_name = 'i18n_ServCloud_Tool_Monitor' where func_id = '01_plant_area_monitor_cycu';
update m_sys_func set func_name = 'i18n_ServCloud_Tool_Monitor_new' where func_id = '01_plant_area_monitor_cycu_subscribe';
update m_sys_func set func_name = 'i18n_ServCloud_Tool_Diagnosis_new' where func_id = '02_monitor_info_subscribe';

update m_sys_func set func_name = 'i18n_ServCloud_Manage_Machine_new' where func_id = '06_manage_machine' and app_id = 'Management';
update m_sys_func set func_name = 'i18n_ServCloud_Manage_Box_new' where func_id = '05_manage_box' and app_id = 'Management';

update m_sys_func set func_name = 'i18n_ServCloud_ManageWorkShift_daily' where func_id = '20_manage_shift' and app_id = 'ProductionDailyReport';