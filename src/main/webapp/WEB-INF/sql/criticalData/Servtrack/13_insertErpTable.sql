DROP TABLE IF EXISTS `servcloud`.`a_servtrack_process_erp`;
CREATE TABLE  `servcloud`.`a_servtrack_process_erp` (
  `process_code` varchar(50) NOT NULL DEFAULT '' COMMENT '製程代碼',
  `process_name` varchar(50) NOT NULL DEFAULT '' COMMENT '製程名稱',
  `remark` varchar(200) DEFAULT NULL COMMENT '說明',
  `create_time_ERP` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '中介DB建立時間',
  `modify_time_ERP` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '中介DB最後修改時間',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '最後修改時間',
  PRIMARY KEY (`process_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `servcloud`.`a_servtrack_product_erp`;
CREATE TABLE  `servcloud`.`a_servtrack_product_erp` (
  `product_id` varchar(50) NOT NULL DEFAULT '' COMMENT '產品代碼',
  `product_name` varchar(50) NOT NULL DEFAULT '' COMMENT '產品名稱',
  `remark` varchar(200) DEFAULT NULL COMMENT '說明',
  `create_time_ERP` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '中介DB建立時間',
  `modify_time_ERP` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '中介DB最後修改時間',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '最後修改時間',
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `servcloud`.`a_servtrack_work_erp`;
CREATE TABLE  `servcloud`.`a_servtrack_work_erp` (
  `work_id` varchar(50) NOT NULL DEFAULT '' COMMENT '派工單編號',
  `product_id` varchar(50) NOT NULL DEFAULT '' COMMENT '產品代碼',
  `e_quantity` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '預估產量',
  `status_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '狀態',
  `remark` varchar(200) DEFAULT NULL COMMENT '備註',
  `create_time_ERP` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '中介DB建立時間',
  `modify_time_ERP` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '中介DB最後修改時間',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '最後修改時間',
  PRIMARY KEY (`work_id`),
  KEY `FK_a_servtrack_work_erp_product_id` (`product_id`),
  CONSTRAINT `FK_a_servtrack_work_erp_product_id` FOREIGN KEY (`product_id`) REFERENCES `a_servtrack_product_erp` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `servcloud`.`a_servtrack_work_op_erp`;
CREATE TABLE  `servcloud`.`a_servtrack_work_op_erp` (
  `work_id` varchar(50) NOT NULL DEFAULT '' COMMENT '派工單編號',
  `op` varchar(10) NOT NULL DEFAULT '' COMMENT '產品工序',
  `process_code` varchar(50) NOT NULL DEFAULT '' COMMENT '製程代碼',
  `std_hour` decimal(10,0) NOT NULL DEFAULT '0' COMMENT '單件標工(分)',
  `remark` varchar(200) DEFAULT NULL COMMENT '備註',
  `status_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '狀態',
  `create_time_ERP` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '中介DB建立時間',
  `modify_time_ERP` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '中介DB最後修改時間',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '最後修改時間',
  PRIMARY KEY (`work_id`,`op`),
  KEY `FK_a_servtrack_work_op_erp_process_code` (`process_code`),
  CONSTRAINT `FK_a_servtrack_work_op_erp_process_code` FOREIGN KEY (`process_code`) REFERENCES `a_servtrack_process_erp` (`process_code`),
  CONSTRAINT `FK_a_servtrack_work_op_erp_work_id` FOREIGN KEY (`work_id`) REFERENCES `a_servtrack_work_erp` (`work_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;