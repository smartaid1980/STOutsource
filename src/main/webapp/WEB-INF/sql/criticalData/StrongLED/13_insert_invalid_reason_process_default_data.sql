DROP TABLE IF EXISTS `a_strongled_invalid_reason`;
CREATE TABLE  `a_strongled_invalid_reason` (
  `invalid_id` varchar(10) NOT NULL DEFAULT '99' COMMENT '無效原因代碼',
  `invalid_name` varchar(50) NOT NULL COMMENT '無效原因名稱',
  `invalid_class` int(10) unsigned NOT NULL COMMENT '無效原因類別 0:共用類型1:製程專用',
  `invalid_type` int(10) unsigned NOT NULL COMMENT '無效原因類型 0:（必要無效）算入工單 1:（非必要無效）不算入工單',
  `process_code` varchar(50) NOT NULL COMMENT '製程代碼',
  `is_open` varchar(1) NOT NULL COMMENT '是否啟用Y=是,N=否',
  `remark` varchar(50) DEFAULT NULL COMMENT '備註',
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`invalid_id`) USING BTREE,
  KEY `FK_a_strongled_invalid_reason_process_code` (`process_code`),
  CONSTRAINT `FK_a_strongled_invalid_reason_process_code` FOREIGN KEY (`process_code`) REFERENCES `a_servtrack_process` (`process_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `a_strongled_invalid_reason` (`invalid_id`,`invalid_name`,`invalid_class`,`invalid_type`,`process_code`,`is_open`,`remark`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('99','其他',0,0,'common_process','Y','','adminstd',NOW(),'adminstd',NOW());
