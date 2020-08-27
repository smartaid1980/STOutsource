DROP TABLE IF EXISTS `a_enhancement_idle_reason`;
CREATE TABLE `a_enhancement_idle_reason` (
  `idle_id` varchar(20) NOT NULL,
  `idle_reason` varchar(50) NOT NULL,
  `is_valid` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`idle_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_enhancement_idle_record`;
CREATE TABLE `a_enhancement_idle_record` (
  `machine_id` varchar(50) NOT NULL,
  `shift_date` date NOT NULL,
  `idle_id` varchar(50) NOT NULL,
  `status` varchar(20) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `tag` varchar(50) NOT NULL,
  PRIMARY KEY (`machine_id`,`start_time`,`shift_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_enhancement_machine`;
CREATE TABLE `a_enhancement_machine` (
  `machine_id` varchar(20) NOT NULL,
  `machine_name` varchar(50) NOT NULL,
  `cnc_brand` varchar(50) NOT NULL,
  `track_work` varchar(50) NOT NULL,
  `track_idle` varchar(50) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`machine_id`),
  KEY `FK_a_enhancement` (`cnc_brand`),
  CONSTRAINT `FK_a_enhancement` FOREIGN KEY (`cnc_brand`) REFERENCES `m_cnc_brand` (`cnc_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_a_enhancement_machine_machine_id` FOREIGN KEY (`machine_id`) REFERENCES `m_device` (`device_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_enhancement_process`;
CREATE TABLE `a_enhancement_process` (
  `process_code` varchar(10) NOT NULL,
  `process_name` varchar(50) NOT NULL,
  `process_quality` decimal(10,0) NOT NULL,
  `remark` varchar(50) DEFAULT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`process_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_enhancement_process_ng`;
CREATE TABLE `a_enhancement_process_ng` (
  `process_code` varchar(50) NOT NULL,
  `ng_code` varchar(50) NOT NULL,
  `ng_name` varchar(50) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  `remark` varchar(50) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`process_code`,`ng_code`),
  CONSTRAINT `FK_a_enhancement_process_ng_process_id` FOREIGN KEY (`process_code`) REFERENCES `a_enhancement_process` (`process_code`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_enhancement_product`;
CREATE TABLE `a_enhancement_product` (
  `product_id` varchar(20) NOT NULL,
  `product_name` varchar(50) NOT NULL,
  `product_quality_sp` decimal(10,0) NOT NULL,
  `remark` varchar(50) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_enhancement_product_op`;
CREATE TABLE `a_enhancement_product_op` (
  `product_id` varchar(50) NOT NULL,
  `op` varchar(50) NOT NULL,
  `process_code` varchar(50) NOT NULL,
  `std_hour` decimal(10,0) NOT NULL,
  `op_quality_sp` decimal(10,0) NOT NULL,
  `remark` varchar(50) DEFAULT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`product_id`,`op`),
  KEY `FK_a_enhancement_product_op_process_code` (`process_code`),
  CONSTRAINT `FK_a_enhancement_product_op_process_code` FOREIGN KEY (`process_code`) REFERENCES `a_enhancement_process` (`process_code`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_a_enhancement_product_op_product_id` FOREIGN KEY (`product_id`) REFERENCES `a_enhancement_product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_enhancement_shift_time`;
CREATE TABLE `a_enhancement_shift_time` (
  `shift_id` varchar(20) NOT NULL,
  `shift_name` varchar(50) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `sp_duration` decimal(10,0) NOT NULL,
  `op_the_shift` int(11) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`shift_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_enhancement_work_tracking`;
CREATE TABLE `a_enhancement_work_tracking` (
  `machine_id` varchar(50) NOT NULL,
  `work_id` varchar(50) NOT NULL,
  `op` varchar(20) NOT NULL,
  `shift_date` date NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `tag` varchar(1) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `process_id` varchar(50) NOT NULL,
  `std_time` float NOT NULL,
  `pcs_at_once` int(11) NOT NULL,
  `compensate` int(11) NOT NULL,
  `operator_id` varchar(50) NOT NULL,
  `count` int(11) NOT NULL,
  `ng_quantity` int(11) NOT NULL,
  `custom_1` varchar(50) NOT NULL,
  `custom_2` varchar(50) NOT NULL,
  `custom_3` varchar(50) NOT NULL,
  `custom_4` varchar(50) NOT NULL,
  `custom_5` varchar(50) NOT NULL,
  `custom_6` varchar(50) NOT NULL,
  `custom_7` varchar(50) NOT NULL,
  `custom_8` varchar(50) NOT NULL,
  `custom_9` varchar(50) NOT NULL,
  `custom_10` varchar(50) NOT NULL,
  PRIMARY KEY (`machine_id`,`work_id`,`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
