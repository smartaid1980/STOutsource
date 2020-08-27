 -- AchievementRate
INSERT INTO `m_sys_dashboard` (`dashboard_id`,`app_id`,`dashboard_name`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('achievement_rate','AchievementRate','i18n_ServCloud_AchievementRate',NOW(),'admin',NULL,NULL);
 INSERT INTO `m_sys_d_auth_dashboard` (`d_auth_id`,`dashboard_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@sys_super_admin_auth','achievement_rate','AchievementRate',NOW(),'admin',NULL,NULL);
 
 -- Aheadmaster
INSERT INTO `m_sys_dashboard` (`dashboard_id`,`app_id`,`dashboard_name`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('InvalidTransitionDiagram','Aheadmaster','i18n_ServCloud_invalidTrend',NOW(),'admin',NULL,NULL),
 ('ProductionTransitionDiagram','Aheadmaster','i18n_ServCloud_Production_Transition_Diagram',NOW(),'admin',NULL,NULL),
 ('YieldTransitionDiagram','Aheadmaster','i18n_ServCloud_Yield_Transition_Diagram',NOW(),'admin',NULL,NULL);
 INSERT INTO `m_sys_d_auth_dashboard` (`d_auth_id`,`dashboard_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@sys_super_admin_auth','InvalidTransitionDiagram','Aheadmaster',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','ProductionTransitionDiagram','Aheadmaster',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','YieldTransitionDiagram','Aheadmaster',NOW(),'admin',NULL,NULL);
 
 -- EquipMonitor
INSERT INTO `m_sys_dashboard` (`dashboard_id`,`app_id`,`dashboard_name`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('01_StatusPieChart','EquipMonitor','i18n_ServCloud_Status',NOW(),'admin',NULL,NULL),
 ('02_EquipList_0','EquipMonitor','i18n_ServCloud_Machine_List',NOW(),'admin',NULL,NULL),
 ('03_EquipList_PureComment','EquipMonitor','i18n_ServCloud_Machine_List',NOW(),'admin',NULL,NULL),
 ('04_Actual_Compare_Expected_Quantity_cosmos','EquipMonitor','i18n_ServCloud_Machine_List',NOW(),'admin',NULL,NULL),
 ('00_StatusPieChart_cosmos','EquipMonitor','i18n_ServCloud_Status',NOW(),'admin',NULL,NULL),
 ('StatusTable','EquipMonitor','機台狀態表',NOW(),'admin',NULL,NULL);
 INSERT INTO `m_sys_d_auth_dashboard` (`d_auth_id`,`dashboard_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@sys_super_admin_auth','01_StatusPieChart','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_EquipList_0','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','03_EquipList_PureComment','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','04_Actual_Compare_Expected_Quantity_cosmos','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','00_StatusPieChart_cosmos','EquipMonitor',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','StatusTable','EquipMonitor',NOW(),'admin',NULL,NULL);

 -- IiotWheelWearDetection
INSERT INTO `m_sys_dashboard` (`dashboard_id`,`app_id`,`dashboard_name`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('process_param','IiotWheelWearDetection','i18n_ServCloud_ProcessParam',NOW(),'admin',NULL,NULL);
 INSERT INTO `m_sys_d_auth_dashboard` (`d_auth_id`,`dashboard_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@sys_super_admin_auth','process_param','IiotWheelWearDetection',NOW(),'admin',NULL,NULL);
 
 -- OnMachineMeasurement
INSERT INTO `m_sys_dashboard` (`dashboard_id`,`app_id`,`dashboard_name`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('OnMachineMeasurement','OnMachineMeasurement','機上量測',NOW(),'admin',NULL,NULL);
 INSERT INTO `m_sys_d_auth_dashboard` (`d_auth_id`,`dashboard_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@sys_super_admin_auth','OnMachineMeasurement','OnMachineMeasurement',NOW(),'admin',NULL,NULL);

 -- ProcessParam
INSERT INTO `m_sys_dashboard` (`dashboard_id`,`app_id`,`dashboard_name`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('process_param','ProcessParam','i18n_ServCloud_ProcessParam',NOW(),'admin',NULL,NULL);
 INSERT INTO `m_sys_d_auth_dashboard` (`d_auth_id`,`dashboard_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@sys_super_admin_auth','process_param','ProcessParam',NOW(),'admin',NULL,NULL);

 -- ToolManagement
INSERT INTO `m_sys_dashboard` (`dashboard_id`,`app_id`,`dashboard_name`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('01_center_system','ToolManagement','i18n_ServCloud_Tool_Status',NOW(),'admin',NULL,NULL),
 ('02_order_machine','ToolManagement','i18n_ServCloud_Tool_Status',NOW(),'admin',NULL,NULL);
 INSERT INTO `m_sys_d_auth_dashboard` (`d_auth_id`,`dashboard_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@sys_super_admin_auth','01_center_system','ToolManagement',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','02_order_machine','ToolManagement',NOW(),'admin',NULL,NULL);

 -- UtilizationStd
INSERT INTO `m_sys_dashboard` (`dashboard_id`,`app_id`,`dashboard_name`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('01_oee_ring','UtilizationStd','i18n_ServCloud_Utilization',NOW(),'admin',NULL,NULL),
 ('compare_demo','UtilizationStd','i18n_ServCloud_DailyUtilization',NOW(),'admin',NULL,NULL);
 INSERT INTO `m_sys_d_auth_dashboard` (`d_auth_id`,`dashboard_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@sys_super_admin_auth','01_oee_ring','UtilizationStd',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','compare_demo','UtilizationStd',NOW(),'admin',NULL,NULL);
 
 -- WorkPieceMeasurment
INSERT INTO `m_sys_dashboard` (`dashboard_id`,`app_id`,`dashboard_name`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('YieldTransitionDiagram','WorkPieceMeasurment','i18n_ServCloud_Yield_Transition_Diagram',NOW(),'admin',NULL,NULL);
 INSERT INTO `m_sys_d_auth_dashboard` (`d_auth_id`,`dashboard_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('@st@sys_super_admin_auth','YieldTransitionDiagram','WorkPieceMeasurment',NOW(),'admin',NULL,NULL);