INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
('07_manage_machine_type','Management','i18n_ServCloud_Manage_Machine_Type','null');

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
('@st@sys_super_admin_auth','07_manage_machine_type','Management',NOW(),'admin',NULL,NULL);

ALTER TABLE `m_machine_type` MODIFY COLUMN `machine_type_id` VARCHAR(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '';

ALTER TABLE `m_alarm` MODIFY COLUMN `machine_type_id` VARCHAR(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'OTHER';

ALTER TABLE `m_device` MODIFY COLUMN `device_type` VARCHAR(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT 'OTHER';

ALTER TABLE `m_machine_alarm` MODIFY COLUMN `machine_type_id` VARCHAR(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'OTHER';

ALTER TABLE `a_alarm_clear_step` MODIFY COLUMN `machine_type_id` VARCHAR(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'OTHER';