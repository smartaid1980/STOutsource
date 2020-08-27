
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES 
 ('sys_iiot_std_app_network_auth','聯網權限',NULL,'2018-11-16 10:24:44','@st@stadmin',NULL,NULL,0);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
('sys_iiot_std_app_network_auth','01_network_management','IIOTNetworkManagement',NULL,NULL,NULL,NULL),
 ('sys_iiot_std_app_network_auth','01_network_monitor','IIOTNetworkMonitor',NULL,NULL,NULL,NULL);

 /*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES 
 ('sys_iiot_app_network_group','IIOT聯網群組','2018-11-16 10:25:27','@st@stadmin',NULL,NULL,0);

 INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
 ('sys_iiot_app_network_group','sys_iiot_std_app_network_auth',NULL,NULL,NULL,NULL);

 INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
 ('adminstd','sys_iiot_app_network_group',NULL,NULL,NULL,NULL),
 ('userstd','sys_iiot_app_network_group',NULL,NULL,NULL,NULL);
