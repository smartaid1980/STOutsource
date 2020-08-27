DROP TABLE IF EXISTS `a_monitor_cycu`;
CREATE TABLE `a_monitor_cycu` (
  `device_id` VARCHAR(200) NOT NULL,
  `box_id` VARCHAR(28),
  `diagnose` INTEGER UNSIGNED,
  `diagnose_detail` VARCHAR(45),
  `diagnose_status` VARCHAR(45),
  `time_of_occurrence` DATETIME,
  PRIMARY KEY (`device_id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_monitor_cycu_history`;
CREATE TABLE `a_monitor_cycu_history` (
  `serial_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `device_id` varchar(200) NOT NULL,
  `change_time` datetime NOT NULL,
  `type` varchar(45) DEFAULT NULL,
  `current_status` varchar(45) NOT NULL,
  `pre_status` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`serial_id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8;