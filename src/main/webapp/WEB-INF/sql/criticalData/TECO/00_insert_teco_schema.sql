DROP TABLE IF EXISTS `servcloud`.`a_teco_servtrack_dept`;
CREATE TABLE  `servcloud`.`a_teco_servtrack_dept` (
  `dept_id` varchar(10) NOT NULL COMMENT '部門編號',
  `dept_name` varchar(50) NOT NULL COMMENT '部門名稱',
  `is_open` varchar(1) NOT NULL COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `servcloud`.`a_teco_servtrack_staff`;
CREATE TABLE  `servcloud`.`a_teco_servtrack_staff` (
  `staff_id` varchar(10) NOT NULL COMMENT '員工編號',
  `staff_name` varchar(50) NOT NULL COMMENT '員工姓名',
  `qrcod_staff` varchar(50) NOT NULL COMMENT '員編加密編碼',
  `dept_id` varchar(10) NOT NULL COMMENT '部門編號',
  `is_open` varchar(1) NOT NULL COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`staff_id`),
  KEY `FK_a_teco_servtrack_staff_dept_id` (`dept_id`),
  CONSTRAINT `FK_a_teco_servtrack_staff_dept_id` FOREIGN KEY (`dept_id`) REFERENCES `a_teco_servtrack_dept` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET foreign_key_checks = 0;

DROP TABLE IF EXISTS `servcloud`.`a_servtrack_work`;
CREATE TABLE  `servcloud`.`a_servtrack_work` (
  `work_id` varchar(50) NOT NULL COMMENT '派工單編號',
  `product_id` varchar(50) NOT NULL COMMENT '產品代碼',
  `wo_id` varchar(10) NOT NULL COMMENT '工號',
  `part_no` varchar(50) NOT NULL COMMENT '料號',
  `e_quantity` int(10) unsigned NOT NULL COMMENT '預估產量',
  `input` int(10) unsigned NOT NULL COMMENT '初始投入量',
  `status_id` int(10) unsigned NOT NULL COMMENT '狀態',
  `go_quantity` int(10) unsigned DEFAULT NULL COMMENT '良品數',
  `quality` decimal(5,2) DEFAULT NULL COMMENT '良率',
  `op_duration` varchar(10) DEFAULT NULL COMMENT '總生產時間(分)',
  `duration` varchar(15) DEFAULT NULL COMMENT '總日數',
  `remark` varchar(50) DEFAULT NULL COMMENT '備註',
  `create_by` varchar(50) NOT NULL COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`work_id`),
  KEY `FK_a_teco_servtrack_work_product_id` (`product_id`),
  CONSTRAINT `FK_a_teco_servtrack_work_product_id` FOREIGN KEY (`product_id`) REFERENCES `a_servtrack_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `servcloud`.`a_servtrack_work_op`;
CREATE TABLE  `servcloud`.`a_servtrack_work_op` (
  `work_id` varchar(50) NOT NULL,
  `op` varchar(10) NOT NULL,
  `process_code` varchar(50) NOT NULL,
  `qrcode_op` varchar(50) NOT NULL DEFAULT '',
  `std_hour` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `op_duration` decimal(10,4) DEFAULT NULL,
  `output` int(10) DEFAULT NULL,
  `go_quantity` int(10) DEFAULT NULL,
  `ng_quantity` int(10) DEFAULT NULL,
  `quality` decimal(5,2) DEFAULT NULL,
  `remark` varchar(50) DEFAULT NULL,
  `is_open` varchar(1) DEFAULT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  `work_start_time` date DEFAULT NULL COMMENT '預計開始日期',
  `work_end_time` date DEFAULT NULL COMMENT '預計完工日期',
  `work_sum` decimal(10,2) DEFAULT NULL COMMENT '預計工時合計',
  PRIMARY KEY (`work_id`,`op`),
  KEY `FK_a_servtrack_work_op_work_id` (`work_id`),
  KEY `FK_a_servtrack_work_op_process_code` (`process_code`),
  CONSTRAINT `FK_a_servtrack_work_op_process_code` FOREIGN KEY (`process_code`) REFERENCES `a_servtrack_process` (`process_code`),
  CONSTRAINT `FK_a_servtrack_work_op_work_id` FOREIGN KEY (`work_id`) REFERENCES `a_servtrack_work` (`work_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `servcloud`.`a_servtrack_tracking_no_move_out`;
CREATE TABLE  `servcloud`.`a_servtrack_tracking_no_move_out` (
  `move_in` datetime NOT NULL,
  `line_id` varchar(50) NOT NULL,
  `work_id` varchar(50) NOT NULL,
  `op` varchar(10) NOT NULL,
  `cust_field_1` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_2` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_3` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_4` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_5` varchar(50) NOT NULL DEFAULT '-1',
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  `shift_day` date NOT NULL,
  PRIMARY KEY (`move_in`,`line_id`,`work_id`,`op`,`cust_field_1`,`cust_field_2`,`cust_field_3`,`cust_field_4`,`cust_field_5`),
  KEY `FK_a_servtrack_tracking_no_move_out_line_id` (`line_id`),
  KEY `FK_a_servtrack_tracking_no_move_out_work_id_op` (`work_id`,`op`),
  CONSTRAINT `FK_a_servtrack_tracking_no_move_out_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`),
  CONSTRAINT `FK_a_servtrack_tracking_no_move_out_work_id_op` FOREIGN KEY (`work_id`, `op`) REFERENCES `a_servtrack_work_op` (`work_id`, `op`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET foreign_key_checks = 1;

DROP VIEW IF EXISTS `a_teco_servtrack_view_work_op`;
CREATE VIEW a_teco_servtrack_view_work_op AS
SELECT 
w.*, 
wo.op, 
wo.process_code, 
wo.std_hour, 
wo.work_start_time,
wo.work_end_time,
wo.work_sum,
ps.process_name
FROM a_servtrack_work w
INNER JOIN
a_servtrack_work_op wo
on w.work_id = wo.work_id
INNER JOIN
a_servtrack_process ps
on wo.process_code = ps.process_code;

DROP VIEW IF EXISTS `a_servtrack_view_work_processing_detail`;
CREATE VIEW a_servtrack_view_work_processing_detail AS
SELECT
tnmo.work_id,
tnmo.move_in,
tnmo.line_id,
tnmo.op,
l.line_name,
p.product_id,
p.product_name,
w.e_quantity,
w.input,
w.create_by,
w.create_time,
w.status_id,
wo.process_code,
ps.process_name,
lwh.shift_day,
u.user_name

FROM a_servtrack_work_tracking wt

RIGHT JOIN a_servtrack_tracking_no_move_out tnmo
ON wt.move_in = tnmo.move_in
AND wt.line_id = tnmo.line_id
AND wt.work_id = tnmo.work_id
AND wt.op = tnmo.op

LEFT JOIN
a_servtrack_line_working_hour lwh
on lwh.line_id = tnmo.line_id and
lwh.shift_day = tnmo.shift_day

INNER JOIN
a_servtrack_work w
on w.work_id = tnmo.work_id

INNER JOIN
a_servtrack_work_op wo
on wo.work_id = tnmo.work_id and
wo.op = tnmo.op

INNER JOIN
a_servtrack_product p
on p.product_id = w.product_id

LEFT JOIN
a_servtrack_product_op po
on w.product_id = po.product_id and
po.op = wo.op

RIGHT JOIN
a_servtrack_process ps
on ps.process_code = wo.process_code

INNER JOIN
a_servtrack_line l
on l.line_id = tnmo.line_id

INNER JOIN 
m_sys_user u 
on w.create_by = u.user_id

WHERE wt.work_id IS NULL AND tnmo.work_id IS NOT NULL;


