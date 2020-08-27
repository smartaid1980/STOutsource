delete from m_app_info where app_id = 'MachineManagement';

delete from m_sys_func where app_id = 'Management' and func_id = '07_manage_machine_info';

update m_sys_func set func_id = '06_manage_machine_edit' where app_id = 'Management' and func_id = '09_manage_machine_limit';

update m_sys_func set func_name = 'i18n_ServCloud_Manage_Machine_Connection_Settings' where app_id = 'Management' and func_name = 'i18n_ServCloud_Manage_Machine_new';

update m_sys_func set func_name = 'i18n_ServCloud_Manage_Box' where app_id = 'Management' and func_name = 'i18n_ServCloud_Manage_Box_new';