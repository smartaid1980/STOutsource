-- DROP TABLE IF EXISTS `a_servtrack_shift_time`;
-- DROP TABLE IF EXISTS `a_servtrack_line_oee`;
-- DROP TABLE IF EXISTS `a_servtrack_work_tracking_ng`;
-- DROP TABLE IF EXISTS `a_servtrack_tablet_authority`;
-- DROP TABLE IF EXISTS `a_servtrack_line_working_hour`;
-- DROP TABLE IF EXISTS `a_servtrack_work_tracking`;
-- DROP TABLE IF EXISTS `a_servtrack_work_op`;
-- DROP TABLE IF EXISTS `a_servtrack_work`;
-- DROP TABLE IF EXISTS `a_servtrack_line`;
-- DROP TABLE IF EXISTS `a_servtrack_product_op`;
-- DROP TABLE IF EXISTS `a_servtrack_product`;
-- DROP TABLE IF EXISTS `a_servtrack_process_ng`;
-- DROP TABLE IF EXISTS `a_servtrack_process`;

DROP TABLE IF EXISTS `a_servtrack_process`;
CREATE TABLE  `a_servtrack_process` (
  `process_code` varchar(50) NOT NULL,
  `process_name` varchar(50) NOT NULL,
  `process_quality` decimal(5,2) NOT NULL,
  `remark` varchar(50),
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`process_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_servtrack_process_ng`;
CREATE TABLE  `a_servtrack_process_ng` (
  `process_code` varchar(50) NOT NULL,
  `ng_code` varchar(50) NOT NULL,
  `ng_name` varchar(50) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  `remark` varchar(50),
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`process_code`,`ng_code`),
  KEY `FK_a_servtrack_process_ng_process_code` (`process_code`),
  CONSTRAINT `FK_a_servtrack_process_ng_process_code` FOREIGN KEY (`process_code`) REFERENCES `a_servtrack_process` (`process_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_servtrack_product`;
CREATE TABLE  `a_servtrack_product` (
  `product_id` varchar(50) NOT NULL,
  `product_name` varchar(50) NOT NULL,
  `product_quality_sp` decimal(5,2) NOT NULL,
  `remark` varchar(50),
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_servtrack_product_op`;
CREATE TABLE  `a_servtrack_product_op` (
  `product_id` varchar(50) NOT NULL,
  `op` varchar(10) NOT NULL,
  `process_code` varchar(50) NOT NULL,
  `std_hour` decimal(10,4) NOT NULL,
  `op_quality_sp` decimal(5,2) NOT NULL,
  `remark` varchar(50),
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`product_id`,`op`),
  KEY `FK_a_servtrack_product_op_product_id` (`product_id`),
  KEY `FK_a_servtrack_product_op_process_code` (`process_code`),
  CONSTRAINT `FK_a_servtrack_product_op_product_id` FOREIGN KEY (`product_id`) REFERENCES `a_servtrack_product` (`product_id`),
  CONSTRAINT `FK_a_servtrack_product_op_process_code` FOREIGN KEY (`process_code`) REFERENCES `a_servtrack_process` (`process_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_servtrack_shift_time`;
CREATE TABLE  `a_servtrack_shift_time` (
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `duration_sp` decimal(4,2) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_servtrack_line`;
CREATE TABLE  `a_servtrack_line` (
  `line_id` varchar(50) NOT NULL,
  `line_name` varchar(50) NOT NULL,
  `qrcode_line` varchar(50) NOT NULL,
  `oee_sp` decimal(5,2),
  `line_quality_sp` decimal(5,2),
  `perf_sp` decimal(5,2),
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`line_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_servtrack_line_working_hour`;
CREATE TABLE  `a_servtrack_line_working_hour` (
  `line_id` varchar(50) NOT NULL,
  `shift_day` date NOT NULL,
  `duration_sp` decimal(4,2) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`line_id`,`shift_day`),
  KEY `FK_a_servtrack_line_working_hour_line_id` (`line_id`),
  CONSTRAINT `FK_a_servtrack_line_working_hour_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_servtrack_work`;
CREATE TABLE  `a_servtrack_work` (
  `work_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `e_quantity` int(10) NOT NULL,
  `input` int(10) NOT NULL,
  `status_id` int(10) NOT NULL,
  `go_quantity` int(10),
  `quality` decimal(5,2),
  `op_duration` varchar(10),
  `duration` varchar(15),
  `remark` varchar(50),
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`work_id`),
  KEY `FK_a_servtrack_work_product_id` (`product_id`),
  CONSTRAINT `FK_a_servtrack_work_product_id` FOREIGN KEY (`product_id`) REFERENCES `a_servtrack_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_servtrack_work_op`;
CREATE TABLE  `a_servtrack_work_op` (
  `work_id` varchar(50) NOT NULL,
  `op` varchar(10) NOT NULL,
  `process_code` varchar(50) NOT NULL,
  `qrcode_op` varchar(50) NOT NULL DEFAULT '',
  `std_hour` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `op_duration` decimal(10,4),
  `output` int(10),
  `go_quantity` int(10),
  `ng_quantity` int(10),
  `quality` decimal(5,2),
  `remark` varchar(50),
  `is_open` varchar(1),
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`work_id`,`op`),
  KEY `FK_a_servtrack_work_op_work_id` (`work_id`),
  KEY `FK_a_servtrack_work_op_process_code` (`process_code`),
  CONSTRAINT `FK_a_servtrack_work_op_work_id` FOREIGN KEY (`work_id`) REFERENCES `a_servtrack_work` (`work_id`),
  CONSTRAINT `FK_a_servtrack_work_op_process_code` FOREIGN KEY (`process_code`) REFERENCES `a_servtrack_process` (`process_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_servtrack_work_tracking`;
CREATE TABLE  `a_servtrack_work_tracking` (
  `move_in` datetime NOT NULL,
  `line_id` varchar(50) NOT NULL,
  `work_id` varchar(50) NOT NULL,
  `op` varchar(10) NOT NULL,
  `cust_field_1` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_2` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_3` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_4` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_5` varchar(50) NOT NULL DEFAULT '-1',
  `shift_day` date NOT NULL,
  `move_out` datetime,
  `op_duration` decimal(10,4),
  `output` int(10),
  `go_quantity` int(10),
  `ng_quantity` int(10),
  `quality` decimal(5,2),
  `output_sp` decimal(10,0),
  `aval` decimal(5,2),
  `perf` decimal(5,2),
  `oee` decimal(5,2),
  `output_variance` int(10),
  `duration_variance` decimal(10,2),
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,

  PRIMARY KEY (`move_in`,`line_id`,`work_id`,`op`,`cust_field_1`,`cust_field_2`,`cust_field_3`,`cust_field_4`,`cust_field_5`),
  KEY `FK_a_servtrack_work_tracking_line_id` (`line_id`),
  KEY `FK_a_servtrack_work_tracking_work_id_op` (`work_id`,`op`),
  CONSTRAINT `FK_a_servtrack_work_tracking_work_id_op` FOREIGN KEY (`work_id`, `op`) REFERENCES `a_servtrack_work_op` (`work_id`, `op`),
  CONSTRAINT `FK_a_servtrack_work_tracking_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_servtrack_work_tracking_ng`;
CREATE TABLE  `a_servtrack_work_tracking_ng` (
  `move_in` datetime NOT NULL,
  `line_id` varchar(50) NOT NULL,
  `work_id` varchar(50) NOT NULL,
  `op` varchar(10) NOT NULL,
  `process_code` varchar(50) NOT NULL,
  `ng_code` varchar(50) NOT NULL,
  `cust_field_1` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_2` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_3` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_4` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_5` varchar(50) NOT NULL DEFAULT '-1',
  `ng_quantity` int(10) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`move_in`,`line_id`,`work_id`,`op`,`process_code`,`ng_code`,`cust_field_1`,`cust_field_2`,`cust_field_3`,`cust_field_4`,`cust_field_5`),
  KEY `FK_a_servtrack_work_tracking_ng_move_in` (`move_in`),
  KEY `FK_a_servtrack_work_tracking_ng_line_id` (`line_id`),
  KEY `FK_a_servtrack_work_tracking_ng_work_id_op` (`work_id`,`op`),
  KEY `FK_a_servtrack_work_tracking_ng_process_code_ng_code` (`process_code`,`ng_code`),
  CONSTRAINT `FK_a_servtrack_work_tracking_ng_move_in` FOREIGN KEY (`move_in`) REFERENCES `a_servtrack_work_tracking` (`move_in`),
  CONSTRAINT `FK_a_servtrack_work_tracking_ng_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`),
  CONSTRAINT `FK_a_servtrack_work_tracking_ng_work_id_op` FOREIGN KEY (`work_id`,`op`) REFERENCES `a_servtrack_work_op` (`work_id`,`op`),
  CONSTRAINT `FK_a_servtrack_work_tracking_ng_process_code_ng_code` FOREIGN KEY (`process_code`,`ng_code`) REFERENCES `a_servtrack_process_ng` (`process_code`,`ng_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_servtrack_line_oee`;
CREATE TABLE  `a_servtrack_line_oee` (
  `shift_day` date NOT NULL,
  `line_id` varchar(50) NOT NULL,
  `op_duration` decimal(10,2),
  `output_sp` decimal(10,0),
  `output` int(10),
  `go_quantity` int(10),
  `ng_quantity` int(10),
  `quality` decimal(5,2),
  `aval` decimal(5,2),
  `oee` decimal(5,2),
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`shift_day`,`line_id`),
  KEY `a_servtrack_line_oee_line_id` (`line_id`),
  CONSTRAINT `a_servtrack_line_oee_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_servtrack_tablet_authority`;
CREATE TABLE  `a_servtrack_tablet_authority` (
  `id` varchar(32) NOT NULL,
  `name` varchar(20) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  `auth_key` varchar(50),
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_servtrack_tracking_no_move_out`;
CREATE TABLE  `a_servtrack_tracking_no_move_out` (
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
  PRIMARY KEY (`move_in`,`line_id`,`work_id`,`op`,`cust_field_1`,`cust_field_2`,`cust_field_3`,`cust_field_4`,`cust_field_5`),
  KEY `FK_a_servtrack_tracking_no_move_out_line_id` (`line_id`),
  KEY `FK_a_servtrack_tracking_no_move_out_work_id_op` (`work_id`,`op`),
  CONSTRAINT `FK_a_servtrack_tracking_no_move_out_work_id_op` FOREIGN KEY (`work_id`, `op`) REFERENCES `a_servtrack_work_op` (`work_id`, `op`),
  CONSTRAINT `FK_a_servtrack_tracking_no_move_out_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP VIEW IF EXISTS `a_servtrack_view_work`;
CREATE VIEW a_servtrack_view_work AS
SELECT w.work_id, w.product_id, p.product_name, w.e_quantity, w.input, w.create_time, u.user_id, u.user_name, t.move_in, tnmo.move_in AS move_in_without_out, w.status_id, w.remark 
FROM a_servtrack_work w
INNER JOIN
a_servtrack_product p
on w.product_id = p.product_id
INNER JOIN 
m_sys_user u 
on w.create_by = u.user_id
LEFT JOIN
a_servtrack_work_tracking t
on w.work_id = t.work_id
LEFT JOIN
a_servtrack_tracking_no_move_out tnmo
on w.work_id = tnmo.work_id;

DROP VIEW IF EXISTS `a_servtrack_view_work_op`;
CREATE VIEW a_servtrack_view_work_op AS
SELECT
w.*,
w_op.op, 
w_op.qrcode_op,
w_op.std_hour,
p.product_name,
ps.process_name, 
ps.process_code 
FROM a_servtrack_work AS w, 
a_servtrack_product AS p, 
a_servtrack_work_op AS w_op, 
a_servtrack_process AS ps
WHERE  w.product_id = p.product_id 
  AND  w.work_id = w_op.work_id
  AND  w_op.process_code = ps.process_code
ORDER BY work_id, op ASC;

DROP VIEW IF EXISTS `a_servtrack_view_processng`;
CREATE VIEW a_servtrack_view_processng AS 
SELECT ps.process_name,ps.process_code,png.ng_code,png.ng_name,png.modify_time,png.is_open
FROM a_servtrack_process AS ps,a_servtrack_process_ng AS png
WHERE  ps.process_code = png.process_code
ORDER BY process_code,ng_code ASC;

DROP VIEW IF EXISTS `a_servtrack_view_work_quality`;
CREATE VIEW a_servtrack_view_work_quality AS 
SELECT 
w.work_id, 
w.product_id, 
p.product_name, 
w.input, 
w.status_id, 
w.go_quantity, 
w.quality, 
p.product_quality_sp, 
w.op_duration,
w.duration, 
wt.shift_day
FROM a_servtrack_work_tracking wt

RIGHT JOIN
a_servtrack_work w
on w.work_id = wt.work_id

INNER JOIN
a_servtrack_product p
on p.product_id = w.product_id;


DROP VIEW IF EXISTS `a_servtrack_view_tracking_detail`;
CREATE VIEW a_servtrack_view_tracking_detail AS
SELECT
wt.move_in,
wt.move_out,
wt.line_id,
wt.work_id,
wt.op,
wt.shift_day,
wt.output,
wt.op_duration,
wt.go_quantity,
wt.ng_quantity,
wt.quality,
wt.output_sp,
wt.aval,
wt.perf,
wt.oee,
wt.output_variance,
wt.duration_variance,
wt.cust_field_1,
wt.cust_field_2,
wt.cust_field_3,
wt.cust_field_4,
wt.cust_field_5,
wt.modify_by,
wt.modify_time,
vwo.product_id,
vwo.status_id,
vwo.e_quantity,
vwo.input,
vwo.remark,
vwo.create_by,
vwo.create_time,
vwo.duration AS work_duration,
vwo.go_quantity AS work_go_quantity,
vwo.product_name,
vwo.process_code,
vwo.process_name,
vwo.std_hour,
l.oee_sp,
l.line_name,
l.perf_sp,
l.line_quality_sp,
u.user_id,
u.user_name,
po.op_quality_sp,
lwh.duration_sp

FROM a_servtrack_work_tracking wt

INNER JOIN
a_servtrack_view_work_op vwo
on wt.work_id = vwo.work_id and wt.op = vwo.op

INNER JOIN
a_servtrack_line l
on l.line_id = wt.line_id

INNER JOIN
m_sys_user u
on vwo.create_by = u.user_id

LEFT JOIN
a_servtrack_product_op po
on vwo.product_id = po.product_id and
po.op = vwo.op

LEFT JOIN
a_servtrack_line_working_hour lwh
on lwh.line_id = wt.line_id and
lwh.shift_day = wt.shift_day;


DROP VIEW IF EXISTS `a_servtrack_view_tracking_ng`;
CREATE VIEW a_servtrack_view_tracking_ng AS
SELECT 
wtng.move_in, 
wtng.line_id,
wtng.work_id, 
wtng.op, 
wtng.process_code,
wtng.ng_code,
wtng.ng_quantity,
psng.ng_name,
vwo.process_name,
vwo.product_name,
vwo.product_id,
wt.shift_day, 
wt.move_out

FROM a_servtrack_work_tracking_ng wtng

INNER JOIN
a_servtrack_view_work_op vwo
on wtng.work_id = vwo.work_id and wtng.op = vwo.op

INNER JOIN
a_servtrack_process_ng psng
on psng.process_code = wtng.process_code and
psng.ng_code = wtng.ng_code

INNER JOIN
a_servtrack_work_tracking wt
on wtng.move_in = wt.move_in and 
wtng.line_id = wt.line_id and 
wtng.work_id = wt.work_id and
wtng.op = wt.op;

DROP VIEW IF EXISTS `a_servtrack_view_process_quality`;
CREATE VIEW a_servtrack_view_process_quality AS
SELECT 
w.product_id, 
p.product_name, 
wt.op, 
wo.process_code, 
ps.process_name, 
SUM(wt.output) AS output, 
SUM(wt.go_quantity) AS go_quantity, 
SUM(wt.ng_quantity) AS ng_quantity, 
po.op_quality_sp,
wt.shift_day

FROM a_servtrack_work_tracking wt

INNER JOIN
a_servtrack_work w
on w.work_id = wt.work_id

INNER JOIN
a_servtrack_work_op wo
on wo.work_id = wt.work_id and wo.op = wt.op

INNER JOIN
a_servtrack_product p
on p.product_id = w.product_id

INNER JOIN
a_servtrack_product_op po
on w.product_id = po.product_id and
po.op = wo.op

INNER JOIN
a_servtrack_process ps
on ps.process_code = wo.process_code

GROUP BY w.product_id, wt.op, wt.shift_day;

DROP VIEW IF EXISTS `a_servtrack_view_day_detail`;
CREATE VIEW a_servtrack_view_day_detail AS
SELECT
lo.shift_day,
lo.line_id,
wo.process_code,
l.line_name, 
l.oee_sp,
l.line_quality_sp,
l.perf_sp,
lo.op_duration,
lo.output_sp,
lo.output,
lo.go_quantity,
lo.quality,
lo.aval,
lo.oee

FROM a_servtrack_work_tracking wt

INNER JOIN
a_servtrack_work_op wo
on wo.work_id = wt.work_id and
wo.op = wt.op

RIGHT JOIN
a_servtrack_line_oee lo
on lo.shift_day = wt.shift_day and 
lo.line_id = wt.line_id

INNER JOIN
a_servtrack_line l
on l.line_id = lo.line_id;