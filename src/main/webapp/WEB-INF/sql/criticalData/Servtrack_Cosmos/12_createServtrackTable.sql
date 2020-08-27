DROP TABLE IF EXISTS `servcloud`.`a_strongled_invalid_reason`;
CREATE TABLE  `servcloud`.`a_strongled_invalid_reason` (
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

DROP TABLE IF EXISTS `servcloud`.`a_strongled_invalid_line_status_log`;
CREATE TABLE  `servcloud`.`a_strongled_invalid_line_status_log` (
  `move_in` datetime NOT NULL,
  `line_id` varchar(50) NOT NULL,
  `work_id` varchar(50) NOT NULL,
  `op` varchar(10) NOT NULL,
  `cust_field_1` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_2` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_3` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_4` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_5` varchar(50) NOT NULL DEFAULT '-1',
  `line_status` int(10) unsigned NOT NULL COMMENT '''1 : 執行中2：暫停中''',
  `line_status_start` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `line_status_end` datetime DEFAULT NULL,
  `invalid_id` varchar(20) DEFAULT NULL COMMENT '無效原因代碼',
  `invalid_text` varchar(50) DEFAULT NULL COMMENT '無效原因說明',
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`move_in`,`line_id`,`work_id`,`op`,`cust_field_1`,`cust_field_2`,`cust_field_3`,`cust_field_4`,`cust_field_5`,`line_status_start`) USING BTREE,
  KEY `FK_a_strongled_invalid_line_status_log_line_id` (`line_id`),
  KEY `FK_a_strongled_invalid_line_status_log_work_id_op` (`work_id`,`op`),
  CONSTRAINT `FK_a_strongled_invalid_line_status_log_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`),
  CONSTRAINT `FK_a_strongled_invalid_line_status_log_work_id_op` FOREIGN KEY (`work_id`, `op`) REFERENCES `a_servtrack_work_op` (`work_id`, `op`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `servcloud`.`a_servtrack_process_ng`;
CREATE TABLE  `servcloud`.`a_servtrack_process_ng` (
  `process_code` varchar(50) NOT NULL,
  `ng_code` varchar(50) NOT NULL,
  `ng_name` varchar(50) NOT NULL,
  `ng_type` varchar(1) NOT NULL DEFAULT '2',
  `is_open` varchar(1) NOT NULL,
  `remark` varchar(50) DEFAULT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`process_code`,`ng_code`),
  KEY `FK_a_servtrack_process_ng_process_code` (`process_code`),
  CONSTRAINT `FK_a_servtrack_process_ng_process_code` FOREIGN KEY (`process_code`) REFERENCES `a_servtrack_process` (`process_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
SET FOREIGN_KEY_CHECKS=1;

DROP VIEW IF EXISTS `a_servtrack_view_processng`;
CREATE VIEW a_servtrack_view_processng AS
SELECT ps.process_name,ps.process_code,png.ng_code,png.ng_name,png.modify_time,png.is_open,png.ng_type
FROM a_servtrack_process AS ps,a_servtrack_process_ng AS png
WHERE  ps.process_code = png.process_code
ORDER BY process_code,ng_code ASC;

DROP VIEW IF EXISTS `a_strongled_dashboard_view_invalid_line_status_log`;
CREATE VIEW a_strongled_dashboard_view_invalid_line_status_log AS
SELECT
ilsl.invalid_text as invalid_name,
ilsl.line_status,
ilsl.line_status_start,
ilsl.line_status_end,
ilsl.line_id,
ilsl.create_by,
l.is_open,
gl.group_id,
gl.group_name

FROM a_strongled_invalid_line_status_log ilsl

INNER JOIN
a_servtrack_line l
on l.line_id = ilsl.line_id

INNER JOIN
a_strongled_group_line gl
ON ilsl.line_id = gl.line_id;

DROP VIEW IF EXISTS `a_strongled_view_group_line`;
CREATE VIEW a_strongled_view_group_line AS
SELECT
ql.group_id, 
ql.group_name, 
ql.line_id, 
l.line_name, 
l.is_open 

FROM a_strongled_group_line ql

INNER JOIN
a_servtrack_line l
on ql.line_id = l.line_id;

DROP VIEW IF EXISTS `a_strongled_view_invalid_line_status_log_detail`;
CREATE VIEW a_strongled_view_invalid_line_status_log_detail AS
SELECT
substr(ilsl.line_status_start,1,10) AS natural_date,
ilsl.line_id,
ir.invalid_class,
ir.process_code,
ir.invalid_name,
ilsl.create_by,
ilsl.line_status_start,
ilsl.line_status_end

FROM a_strongled_invalid_line_status_log ilsl

INNER JOIN
a_strongled_invalid_reason ir
ON ir.invalid_id = ilsl.invalid_id;

DROP VIEW IF EXISTS `servcloud`.`a_servtrack_view_nomoveout`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW  `servcloud`.`a_servtrack_view_nomoveout` AS select `a`.`move_in` AS `move_in`,`a`.`line_id` AS `line_id`,`a`.`work_id` AS `work_id`,`a`.`op` AS `op`,`a`.`cust_field_1` AS `cust_field_1`,`a`.`cust_field_2` AS `cust_field_2`,`a`.`cust_field_3` AS `cust_field_3`,`a`.`cust_field_4` AS `cust_field_4`,`a`.`cust_field_5` AS `cust_field_5`,`a`.`create_by` AS `create_by`,`a`.`create_time` AS `create_time`,`a`.`modify_by` AS `modify_by`,`a`.`modify_time` AS `modify_time`,`c`.`process_code` AS `process_code` from ((`a_servtrack_tracking_no_move_out` `a` left join `a_servtrack_work_tracking` `b` on(((`a`.`move_in` = `b`.`move_in`) and (`a`.`line_id` = `b`.`line_id`) and (`a`.`work_id` = `b`.`work_id`)))) join `a_servtrack_work_op` `c`) where (isnull(`b`.`move_in`) and (`a`.`work_id` = `c`.`work_id`) and (`a`.`op` = `c`.`op`));