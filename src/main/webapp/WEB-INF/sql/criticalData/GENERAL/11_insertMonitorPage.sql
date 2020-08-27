INSERT IGNORE INTO  `m_monitor_page` (`page_id`,`name`,`html_file_name`) VALUES
 ('alarm_history','Alarm 履歷','02_alarm_history.html'),
 ('alarm_msg','Alarm 訊息','05_alarm_msg.html'),
 ('controller_info','控制器資訊','08_controller_info.html'),
 ('info','主要資訊','01_info.html'),
 ('info_anko','主要資訊(安口)','01_info_anko.html'),
 ('info_dashboard','綜合資訊','01_info_dashboard.html'),
 ('leave','離開','11_leave.html'),
 ('msg_msg',' Message 訊息','10_msg_msg.html'),
 ('msg_resume','Message 履歷','09_msg_resume.html'),
 ('operation_history','操作履歷','03_operation_history.html'),
 ('pmc_msg','PMC 訊息','04_pmc_msg.html');

INSERT IGNORE INTO `m_cnc_brand` (`cnc_id`,`name`) VALUES
 ('FANUC_CNC_FOCAS','FANUC_CNC_FOCAS'),
 ('HEIDENHAIN_CNC_REMOTOOLS','HEIDENHAIN_CNC_REMOTOOLS'),
 ('HURCO_CNC_MODBUS','HURCO_CNC_MODBUS'),
 ('INTEK_CNC_PROTOCOL','INTEK_CNC_PROTOCOL'),
 ('LNC_CNC_SCIF','LNC_CNC_SCIF'),
 ('MITSUBISHI_CNC_EZNCCOM','MITSUBISHI_CNC_EZNCCOM'),
 ('SIEMENS_CNC_RPC','SIEMENS_CNC_RPC'),
 ('ITRI_CNC_GMCN','ITRI_CNC_GMCN'),
 ('SYNTEC_CNC_REMOTEAPI','SYNTEC_CNC_REMOTEAPI'),
 ('INDICATORLAMP_FILE','INDICATORLAMP_FILE'),
 ('INDICATORLAMP_ICP_TET_PD6','INDICATORLAMP_ICP_TET_PD6'),
 ('REALTIME','REALTIME');

INSERT IGNORE INTO `m_cnc_monitor_page` (`cnc_id`,`page_id`) VALUES
 ('FANUC_CNC_FOCAS','alarm_history'),
 ('FANUC_CNC_FOCAS','alarm_msg'),
 ('FANUC_CNC_FOCAS','controller_info'),
 ('FANUC_CNC_FOCAS','info'),
 ('HEIDENHAIN_CNC_REMOTOOLS','info'),
 ('HURCO_CNC_MODBUS','info'),
 ('INTEK_CNC_PROTOCOL','info'),
 ('LNC_CNC_SCIF','info'),
 ('MITSUBISHI_CNC_EZNCCOM','info'),
 ('SIEMENS_CNC_RPC','info'),
 ('SYNTEC_CNC_REMOTEAPI','info'),
 ('ITRI_CNC_GMCN','info'),
 ('FANUC_CNC_FOCAS','leave'),
 ('HEIDENHAIN_CNC_REMOTOOLS','leave'),
 ('HURCO_CNC_MODBUS','leave'),
 ('INTEK_CNC_PROTOCOL','leave'),
 ('LNC_CNC_SCIF','leave'),
 ('MITSUBISHI_CNC_EZNCCOM','leave'),
 ('SIEMENS_CNC_RPC','leave'),
 ('SYNTEC_CNC_REMOTEAPI','leave'),
 ('ITRI_CNC_GMCN','leave'),
 ('FANUC_CNC_FOCAS','msg_msg'),
 ('FANUC_CNC_FOCAS','msg_resume'),
 ('FANUC_CNC_FOCAS','operation_history'),
 ('FANUC_CNC_FOCAS','pmc_msg'),
 ('INDICATORLAMP_FILE','leave'),
 ('INDICATORLAMP_ICP_TET_PD6','leave');


 INSERT IGNORE INTO `m_device_cnc_brand` (`device_id`,`cnc_id`) VALUES
 ('{{MACHINE_ID}}','FANUC_CNC_FOCAS');