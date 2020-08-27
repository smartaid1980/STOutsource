DROP TABLE IF EXISTS `a_huangliang_regulate_notify_log`;
CREATE TABLE  `a_huangliang_regulate_notify_log` (
  `machine_id` varchar(32) NOT NULL DEFAULT '',
  `notify_time` datetime NOT NULL,
  `group_id` varchar(45) NOT NULL,
  `last_100_time` varchar(45) NOT NULL DEFAULT '',
  PRIMARY KEY (`machine_id`,`notify_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_huangliang_notify_frequent_log`;
CREATE TABLE `a_huangliang_notify_frequent_log` (
  `machine_id` VARCHAR(32) NOT NULL,
  `notify_time` DATETIME NOT NULL,
  `group_id` VARCHAR(45) NOT NULL,
  `notify_times` VARCHAR(256),
  PRIMARY KEY (`machine_id`,`notify_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;