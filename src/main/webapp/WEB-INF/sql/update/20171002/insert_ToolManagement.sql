DROP TABLE IF EXISTS `a_tool`;
CREATE TABLE  `a_tool` (
  `tool_id` char(14) NOT NULL DEFAULT '',
  `tool_name` varchar(45) NOT NULL DEFAULT '',
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `device_id` char(14) DEFAULT NULL,
  `tool_slot` varchar(45) DEFAULT NULL,
  `lifetime` varchar(45) DEFAULT NULL,
  `is_enable` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`tool_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='刀具的map';

DROP TABLE IF EXISTS `a_tool_log`;
CREATE TABLE  `a_tool_log` (
  `tool_id` char(14) NOT NULL DEFAULT '',
  `device_id` char(14) NOT NULL DEFAULT '',
  `tool_slot` varchar(45) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `create_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`tool_id`,`device_id`,`tool_slot`,`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='刀具放置機台刀槽的log';

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
('sys_super_admin_auth','25_yearly','UtilizationStd',NOW(),'admin',NULL,NULL),
('sys_super_admin_auth','22_manage_tool','Management',NOW(),'admin',NULL,NULL),
('sys_super_admin_auth','04_tool_log','ToolUsed',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
('25_yearly','UtilizationStd','i18n_ServCloud_25_Yearly_Utilization','null'),
('22_manage_tool','Management','i18n_ServCloud_Manage_Tool','null'),
('04_tool_log','ToolUsed','i18n_ServCloud_04_Tool_Log','none');