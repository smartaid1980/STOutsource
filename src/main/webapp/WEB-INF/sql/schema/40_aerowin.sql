--
-- Table structure for table `a_aerowin_awmes`
--
DROP TABLE IF EXISTS `a_aerowin_awmes`;

CREATE TABLE `a_aerowin_awmes` (
  `id` int(10) unsigned NOT NULL,
  `work_id` varchar(40) NOT NULL,
  `op` bigint(20) unsigned NOT NULL,
  `product_id` varchar(40) NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `cus_pro` varchar(200) NOT NULL,
  `status` varchar(100) NOT NULL,
  `quantity_esp` bigint(20) unsigned NOT NULL,
  `go_no` bigint(20) unsigned NOT NULL,
  `ng_no` bigint(20) unsigned NOT NULL,
  `machine_id` varchar(100) NOT NULL,
  `machine_name` varchar(200) NOT NULL,
  `emp_id` varchar(20) NOT NULL,
  `depart_id` varchar(200) NOT NULL,
  `mes_time` datetime NOT NULL,
  `shift_date` date DEFAULT NULL,
  `create_by` varchar(50) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(50) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `a_aerowin_awmeswo`
--
DROP TABLE IF EXISTS `a_aerowin_awmeswo`;

CREATE TABLE `a_aerowin_awmeswo` (
  `work_id` varchar(40) NOT NULL,
  `op` bigint(20) unsigned NOT NULL,
  `op_name` text,
  `quantity_esp` bigint(20) unsigned DEFAULT NULL,
  `product_id` varchar(40) DEFAULT NULL,
  `product_name` varchar(200) DEFAULT NULL,
  `create_by` varchar(50) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(50) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`work_id`,`op`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `a_aerowin_employee`
--
DROP TABLE IF EXISTS `a_aerowin_employee`;

CREATE TABLE `a_aerowin_employee` (
  `ym` varchar(6) NOT NULL,
  `emp_id` varchar(20) NOT NULL,
  `emp_name` varchar(20) DEFAULT NULL,
  `shift` varchar(1) DEFAULT NULL,
  `shift_begin` varchar(10) DEFAULT NULL,
  `shift_end` varchar(10) DEFAULT NULL,
  `create_by` varchar(50) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(50) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`ym`,`emp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `a_aerowin_product`
--
DROP TABLE IF EXISTS `a_aerowin_product`;

CREATE TABLE `a_aerowin_product` (
  `product_id` varchar(40) NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `create_by` varchar(50) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(50) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `a_aerowin_table_last_id`
--
DROP TABLE IF EXISTS `a_aerowin_table_last_id`;

CREATE TABLE `a_aerowin_table_last_id` (
  `table_name` varchar(50) NOT NULL,
  `last_id` int(10) unsigned DEFAULT '0',
  `description` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`table_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `a_aerowin_depart_machine`
--
DROP TABLE IF EXISTS `a_aerowin_depart_machine`;

CREATE TABLE `a_aerowin_depart_machine` (
  `depart_id` varchar(200) NOT NULL,
  `machine_id` varchar(20) NOT NULL,
  `create_by` varchar(50) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(50) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`depart_id`,`machine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Table structure for table `a_aerowin_wip`
--
DROP TABLE IF EXISTS `a_aerowin_wip`;

CREATE TABLE `a_aerowin_wip` (
  `shift_date` date NOT NULL,
  `work_id` varchar(40) NOT NULL,
  `op` bigint(20) unsigned NOT NULL,
  `product_id` varchar(40) DEFAULT NULL,
  `wip_status` varchar(1) DEFAULT NULL,
  `go_no` bigint(20) unsigned DEFAULT NULL,
  `ng_no` bigint(20) unsigned DEFAULT NULL,
  `total_no` bigint(20) unsigned DEFAULT NULL,
  `quantity` bigint(20) unsigned DEFAULT NULL,
  `quantity_esp` bigint(20) unsigned DEFAULT NULL,
  `create_by` varchar(50) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(50) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`shift_date`,`work_id`,`op`),
  KEY `FK_a_aerowin_wip_product_id` (`product_id`),
  CONSTRAINT `FK_a_aerowin_wip_product_id` FOREIGN KEY (`product_id`) REFERENCES `a_aerowin_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `a_aerowin_daily_report`
--
DROP TABLE IF EXISTS `a_aerowin_daily_report`;

CREATE TABLE `a_aerowin_daily_report` (
  `shift_date` date NOT NULL,
  `shift` varchar(1) NOT NULL,
  `emp_id` varchar(20) NOT NULL,
  `emp_name` varchar(20) DEFAULT NULL,
  `machine_id` varchar(100) NOT NULL,
  `machine_name` varchar(200) DEFAULT NULL,
  `depart_id` varchar(200) NOT NULL,
  `work_id` varchar(40) NOT NULL,
  `op` bigint(20) unsigned NOT NULL,
  `product_id` varchar(40) DEFAULT NULL,
  `quantity_esp` bigint(20) unsigned DEFAULT NULL,
  `quantity_in` bigint(20) unsigned DEFAULT NULL,
  `go_no` bigint(20) unsigned DEFAULT NULL,
  `ng_no` bigint(20) unsigned DEFAULT NULL,
  `quantity_res` bigint(20) unsigned DEFAULT NULL,
  `labor_hour` float DEFAULT NULL,
  `labor_hour_real` float DEFAULT NULL,
  `cus_pro` varchar(200) DEFAULT NULL,
  `complete_pct` float DEFAULT NULL,
  `time_begin` datetime DEFAULT NULL,
  `time_begin_m` datetime DEFAULT NULL,
  `time_end` datetime DEFAULT NULL,
  `time_end_m` datetime DEFAULT NULL,
  `create_by` varchar(50) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(50) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`shift_date`,`op`,`work_id`,`depart_id`,`machine_id`,`emp_id`),
  KEY `FK_a_aerowin_daily_report_pro_id` (`product_id`),
  CONSTRAINT `FK_a_aerowin_daily_report_pro_id` FOREIGN KEY (`product_id`) REFERENCES `a_aerowin_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
