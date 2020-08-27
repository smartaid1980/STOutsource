INSERT INTO `m_sys_d_group` (`d_group_id`,`d_group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES 
 ('app_dashboard_group','輪播看板群組','2018-10-17 12:44:43','admindigi',NULL,NULL,0);

 INSERT INTO `m_sys_d_auth` (`d_auth_id`,`d_auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('sys_digiFAC_T1_app_dashboard_auth','輪播看板權限',0,NOW(),'@st@STAdmin',NULL,NULL,0);

INSERT INTO `m_sys_d_group_d_auth` (`d_group_id`,`d_auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
 ('app_dashboard_group','sys_digiFAC_T1_app_dashboard_auth',NULL,NULL,NULL,NULL);

 INSERT INTO `m_sys_user_d_group` (`user_id`,`d_group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
 ('@st@fae','app_dashboard_group',NULL,NULL,NULL,NULL),
 ('admindigi','app_dashboard_group',NULL,NULL,NULL,NULL),
 ('userdigi','app_dashboard_group',NULL,NULL,NULL,NULL);

 INSERT INTO `m_sys_d_auth_dashboard` (`d_auth_id`,`dashboard_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_digiFAC_T1_app_dashboard_auth','02_EquipList_0','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_dashboard_auth','compare_demo','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_dashboard_auth','04_Actual_Compare_Expected_Quantity_cosmos','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('sys_digiFAC_T1_app_dashboard_auth','00_StatusPieChart_cosmos','EquipMonitor',NOW(),'admin',NULL,NULL);
 
 