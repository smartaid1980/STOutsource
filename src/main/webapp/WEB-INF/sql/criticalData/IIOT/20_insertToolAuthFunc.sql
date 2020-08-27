
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES 
 ('sys_iiot_std_app_tool_auth','IIOT刀具權限',NULL,'2018-11-16 10:24:44','@st@stadmin',NULL,NULL,0);

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
('sys_iiot_std_app_tool_auth','01_tool_prepare_record','IIOTToolPrepareRecord',NULL,NULL,NULL,NULL),
 ('sys_iiot_std_app_tool_auth','01_tool_spec','IIOTToolManagement',NULL,NULL,NULL,NULL),
 ('sys_iiot_std_app_tool_auth','01_tool_used_resume','IIOTToolReport',NULL,NULL,NULL,NULL),
 ('sys_iiot_std_app_tool_auth','02_tool_holder','IIOTToolManagement',NULL,NULL,NULL,NULL),
 ('sys_iiot_std_app_tool_auth','02_tool_tracking','IIOTToolReport',NULL,NULL,NULL,NULL),
 ('sys_iiot_std_app_tool_auth','03_tool','IIOTToolManagement',NULL,NULL,NULL,NULL),
 ('sys_iiot_std_app_tool_auth','04_tool_prepare_list_import','IIOTToolManagement',NULL,NULL,NULL,NULL);

 /*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES 
 ('sys_iiot_app_tool_group','IIOT刀具群組','2018-11-16 10:25:27','@st@stadmin',NULL,NULL,0);

 INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
 ('sys_iiot_app_tool_group','sys_iiot_std_app_tool_auth',NULL,NULL,NULL,NULL);

 INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
 ('adminstd','sys_iiot_app_tool_group',NULL,NULL,NULL,NULL),
 ('userstd','sys_iiot_app_tool_group',NULL,NULL,NULL,NULL);
