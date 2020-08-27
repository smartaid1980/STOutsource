INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
('sys_product_std_app_watch_group','手錶群組','2018-06-20 18:17:29','admin','2018-07-27 10:29:17','@st@STAdmin',0);

INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
('adminstd','sys_product_std_app_watch_group',NULL,NULL,NULL,NULL),
('userstd','sys_product_std_app_watch_group',NULL,NULL,NULL,NULL);

INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
('sys_product_std_app_watch_auth','standard version app watch Auth',0,'2018-06-20 18:17:29','admin',NULL,NULL,0);

INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_product_std_app_watch_group','sys_product_std_app_watch_auth',NULL,NULL,NULL,NULL);
 
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
('sys_product_std_app_watch_auth','01_alarm_log','IIOTAlarmLog','2018-10-24 15:44:15','@st@STAdmin',NULL,NULL),
('sys_product_std_app_watch_auth','01_device_management','IIOTDeviceWatchManagement','2018-10-24 15:45:14','@st@STAdmin',NULL,NULL),
('sys_product_std_app_watch_auth','02_device_idle_overtime_management','IIOTDeviceWatchManagement','2018-10-24 15:46:40','@st@STAdmin',NULL,NULL),
('sys_product_std_app_watch_auth','03_watch_management','IIOTDeviceWatchManagement','2018-10-24 15:47:41','@st@STAdmin',NULL,NULL);
