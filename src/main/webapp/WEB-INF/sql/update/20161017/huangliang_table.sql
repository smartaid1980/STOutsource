CREATE TABLE `servcloud`.`a_huangliang_utilization_notify` (
  `machine_id` VARCHAR(32) NOT NULL,
  `notify_time` DATETIME NOT NULL,
  `group_id` VARCHAR(45) NOT NULL,
  `production_eff` DOUBLE NOT NULL,
  `quality_eff` DOUBLE NOT NULL,
  PRIMARY KEY (`machine_id`,`notify_time`,`group_id`),
  KEY `FK_a_huangliang_utilization_notify_1` (`group_id`),
  CONSTRAINT `FK_a_huangliang_utilization_notify_1` FOREIGN KEY (`group_id`) REFERENCES `m_sys_group` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
