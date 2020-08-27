DROP TABLE IF EXISTS `a_kuochuan_servtrack_staff`;
CREATE TABLE  `a_kuochuan_servtrack_staff` (
  `staff_id` varchar(10) NOT NULL,
  `staff_name` varchar(50) NOT NULL,
  `staff_wage` int(10) NOT NULL,
  `qrcod_staff` varchar(50) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  `last_wage` int(10) NOT NULL,
  PRIMARY KEY (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_kuochuan_servtrack_product_type`;
CREATE TABLE  `a_kuochuan_servtrack_product_type` (
  `product_type_id` varchar(20) NOT NULL,
  `staff_id` varchar(10) NOT NULL,
  `remark` varchar(50) DEFAULT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`product_type_id`),
  KEY `a_kuochuan_servtrack_product_type_staff_id` (`staff_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_product_type_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `a_kuochuan_servtrack_staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_kuochuan_servtrack_product`;
CREATE TABLE  `a_kuochuan_servtrack_product` (
  `product_id` varchar(20) NOT NULL,
  `product_type_id` varchar(20) NOT NULL,
  PRIMARY KEY (`product_id`),
  KEY `FK_a_kuochuan_servtrack_product_product_type_id` (`product_type_id`) USING BTREE,
  KEY `FK_a_kuochuan_servtrack_product_product_id` (`product_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_product_product_id` FOREIGN KEY (`product_id`) REFERENCES `a_servtrack_product` (`product_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_product_product_type_id` FOREIGN KEY (`product_type_id`) REFERENCES `a_kuochuan_servtrack_product_type` (`product_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_kuochuan_servtrack_product_op`;
CREATE TABLE  `a_kuochuan_servtrack_product_op` (
  `product_id` varchar(20) NOT NULL DEFAULT '',
  `op` varchar(10) NOT NULL DEFAULT '',
  `process_step` varchar(10) NOT NULL DEFAULT '',
  PRIMARY KEY (`product_id`,`op`),
  KEY `FK_a_kuochuan_servtrack_product_op_product_id_op` (`product_id`,`op`) USING BTREE,
  CONSTRAINT `FK_a_kuochuan_servtrack_product_op_product_id_op` FOREIGN KEY (`product_id`, `op`) REFERENCES `a_servtrack_product_op` (`product_id`, `op`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_kuochuan_servtrack_shift_time_ab`;
CREATE TABLE  `a_kuochuan_servtrack_shift_time_ab` (
  `shift` varchar(1) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`shift`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_kuochuan_servtrack_unloading_time`;
CREATE TABLE  `a_kuochuan_servtrack_unloading_time` (
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `servcloud`.`a_kuochuan_servtrack_line`;
CREATE TABLE  `servcloud`.`a_kuochuan_servtrack_line` (
  `line_id` varchar(10) NOT NULL,
  `is_valid` varchar(1) NOT NULL,
  PRIMARY KEY (`line_id`),
  KEY `FK_a_kuochuan_servtrack_line_line_id` (`line_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_line_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_kuochuan_servtrack_punch_record_a`;
CREATE TABLE  `a_kuochuan_servtrack_punch_record_a` (
  `staff_id` varchar(10) NOT NULL,
  `shift_day` date NOT NULL,
  `punch_in` time NOT NULL,
  `punch_out` time NOT NULL,
  `late` varchar(1) NOT NULL,
  `leave_early` varchar(1) NOT NULL,
  `absent` varchar(1) NOT NULL,
  `day_off` varchar(1) NOT NULL,
  `off_start_1` time,
  `off_end_1` time,
  `off_start_2` time,
  `off_end_2` time,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`staff_id`,`shift_day`),
  KEY `a_kuochuan_servtrack_punch_record_a_staff_id` (`staff_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_punch_record_a_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `a_kuochuan_servtrack_staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_kuochuan_servtrack_punch_record_b`;
CREATE TABLE  `a_kuochuan_servtrack_punch_record_b` (
  `staff_id` varchar(10) NOT NULL,
  `shift_day` date NOT NULL,
  `punch_in` time NOT NULL,
  `punch_out` time NOT NULL,
  `late` varchar(1) NOT NULL,
  `leave_early` varchar(1) NOT NULL,
  `absent` varchar(1) NOT NULL,
  `day_off` varchar(1) NOT NULL,
  `off_start_1` time,
  `off_end_1` time,
  `off_start_2` time,
  `off_end_2` time,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`staff_id`,`shift_day`),
  KEY `a_kuochuan_servtrack_punch_record_b_staff_id` (`staff_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_punch_record_b_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `a_kuochuan_servtrack_staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_kuochuan_servtrack_should_work`;
CREATE TABLE  `a_kuochuan_servtrack_should_work` (
  `staff_id` varchar(10) NOT NULL,
  `shift_day` date NOT NULL,
  `working_start` time NOT NULL,
  `working_end` time NOT NULL,
  `working_hour` decimal(10,2) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`staff_id`,`shift_day`),
  KEY `FK_a_kuochuan_servtrack_should_work_staff_id` (`staff_id`) USING BTREE,
  CONSTRAINT `FK_a_kuochuan_servtrack_should_work_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `a_kuochuan_servtrack_staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `servcloud`.`a_kuochuan_servtrack_performance`;
CREATE TABLE  `servcloud`.`a_kuochuan_servtrack_performance` (
  `staff_id` varchar(10) NOT NULL,
  `shift_day` date NOT NULL,
  `move_in` datetime NOT NULL,
  `work_id` varchar(20) NOT NULL,
  `product_id` varchar(20) NOT NULL,
  `product_type_id` varchar(20) NOT NULL,
  `op` varchar(10) NOT NULL,
  `process_code` varchar(10) NOT NULL,
  `line_id` varchar(10) NOT NULL,
  `cost_move_in` datetime NOT NULL,
  `cost_move_out` datetime NOT NULL,
  `cost_duration` decimal(10,2) NOT NULL,
  `cost_real` decimal(10,2) NOT NULL,
  `cost_sp` decimal(10,2) NOT NULL,
  `cost_difference` decimal(10,2) NOT NULL,
  `go_quantity` int(10) NOT NULL,
  `quantity_sp` int(10) NOT NULL,
  `qua_difference` int(10) NOT NULL,
  `hour_difference` decimal(10,2) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`staff_id`,`move_in`,`work_id`,`line_id`),
  KEY `FK_a_kuochuan_servtrack_performance_staff_id` (`staff_id`),
  KEY `FK_a_kuochuan_servtrack_performance_product_id` (`product_id`),
  KEY `Index_a_kuochuan_servtrack_performance_shift_day` (`shift_day`),
  KEY `FK_a_kuochuan_servtrack_performance_work_id_op` (`work_id`,`op`),
  KEY `FK_a_kuochuan_servtrack_performance_product_type_id` (`product_type_id`),
  KEY `FK_a_kuochuan_servtrack_performance_process_code` (`process_code`),
  KEY `FK_a_kuochuan_servtrack_performance_line_id` (`line_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_performance_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_performance_process_code` FOREIGN KEY (`process_code`) REFERENCES `a_servtrack_process` (`process_code`),
  CONSTRAINT `FK_a_kuochuan_servtrack_performance_product_id` FOREIGN KEY (`product_id`) REFERENCES `a_servtrack_product` (`product_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_performance_product_type_id` FOREIGN KEY (`product_type_id`) REFERENCES `a_kuochuan_servtrack_product_type` (`product_type_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_performance_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `a_kuochuan_servtrack_staff` (`staff_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_performance_work_id_op` FOREIGN KEY (`work_id`, `op`) REFERENCES `a_servtrack_work_op` (`work_id`, `op`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `servcloud`.`a_kuochuan_servtrack_work_op`;
CREATE TABLE  `servcloud`.`a_kuochuan_servtrack_work_op` (
  `work_id` varchar(20) NOT NULL,
  `op` varchar(10) NOT NULL,
  `process_step` varchar(10) NOT NULL,
  PRIMARY KEY (`work_id`,`op`),
  KEY `FK_a_kuochuan_servtrack_work_id_op` (`work_id`,`op`),
  CONSTRAINT `FK_a_kuochuan_servtrack_work_id_op` FOREIGN KEY (`work_id`, `op`) REFERENCES `a_servtrack_work_op` (`work_id`, `op`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `servcloud`.`a_kuochuan_servtrack_work_tracking`;
CREATE TABLE  `servcloud`.`a_kuochuan_servtrack_work_tracking` (
  `move_in` datetime NOT NULL,
  `line_id` varchar(10) NOT NULL,
  `staff_id` varchar(10) NOT NULL,
  `work_id` varchar(20) NOT NULL,
  `op` varchar(10) NOT NULL,
  `process_code` varchar(10) NOT NULL,
  PRIMARY KEY (`move_in`,`line_id`,`staff_id`,`work_id`,`op`,`process_code`),
  KEY `FK_a_kuochuan_servtrack_work_tracking_move_in_line_id_work_id_op` (`move_in`,`line_id`,`work_id`,`op`),
  KEY `FK_a_kuochuan_servtrack_work_tracking_staff_id` (`staff_id`),
  KEY `FK_a_kuochuan_servtrack_work_tracking_process_code` (`process_code`),
  CONSTRAINT `FK_a_kuochuan_servtrack_work_tracking_move_in_line_id_work_id_op` FOREIGN KEY (`move_in`, `line_id`, `work_id`, `op`) REFERENCES `a_servtrack_work_tracking` (`move_in`, `line_id`, `work_id`, `op`),
  CONSTRAINT `FK_a_kuochuan_servtrack_work_tracking_process_code` FOREIGN KEY (`process_code`) REFERENCES `a_servtrack_process` (`process_code`),
  CONSTRAINT `FK_a_kuochuan_servtrack_work_tracking_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `a_kuochuan_servtrack_staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `servcloud`.`a_kuochuan_servtrack_work_tracking_ng`;
CREATE TABLE  `servcloud`.`a_kuochuan_servtrack_work_tracking_ng` (
  `move_in` datetime NOT NULL,
  `staff_id` varchar(10) NOT NULL,
  `line_id` varchar(10) NOT NULL,
  `work_id` varchar(20) NOT NULL,
  `op` varchar(10) NOT NULL,
  `process_code` varchar(10) NOT NULL,
  `ng_code` varchar(10) NOT NULL,
  PRIMARY KEY (`move_in`,`staff_id`,`line_id`,`work_id`,`op`,`process_code`,`ng_code`),
  KEY `FK_a_kuochuan_servtrack_work_tracking_ng_staff_id` (`staff_id`),
  KEY `FK_a_kuochuan_servtrack_m_l_w_o_p_n` (`move_in`,`line_id`,`work_id`,`op`,`process_code`,`ng_code`),
  CONSTRAINT `FK_a_kuochuan_servtrack_m_l_w_o_p_n` FOREIGN KEY (`move_in`, `line_id`, `work_id`, `op`, `process_code`, `ng_code`) REFERENCES `a_servtrack_work_tracking_ng` (`move_in`, `line_id`, `work_id`, `op`, `process_code`, `ng_code`),
  CONSTRAINT `FK_a_kuochuan_servtrack_work_tracking_ng_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `a_kuochuan_servtrack_staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP VIEW IF EXISTS `a_kuochuan_servtrack_view_product`;
CREATE VIEW a_kuochuan_servtrack_view_product AS
SELECT

kcp.product_type_id, 
p.product_id,
p.product_name, 
p.product_quality_sp, 
p.remark, 
p.is_open, 
p.create_by, 
p.create_time, 
p.modify_by, 
p.modify_time

FROM a_kuochuan_servtrack_product kcp

INNER JOIN
a_servtrack_product p
on p.product_id = kcp.product_id;

DROP VIEW IF EXISTS `a_kuochuan_servtrack_view_product_op`;
CREATE VIEW a_kuochuan_servtrack_view_product_op AS
SELECT
kcpo.process_step,
po.product_id, 
po.op, 
po.process_code, 
po.std_hour, 
po.op_quality_sp, 
po.remark, 
po.is_open, 
po.create_by, 
po.create_time, 
po.modify_by, 
po.modify_time

FROM a_kuochuan_servtrack_product_op kcpo

INNER JOIN
a_servtrack_product_op po
on po.product_id = kcpo.product_id and
po.op = kcpo.op;

DROP VIEW IF EXISTS `a_kuochuan_servtrack_view_line`;
CREATE VIEW a_kuochuan_servtrack_view_line AS
SELECT

l.line_id,
l.line_name,
l.qrcode_line,
l.oee_sp,
l.line_quality_sp,
l.perf_sp,
l.is_open,
kcl.is_valid,
l.modify_time

FROM a_kuochuan_servtrack_line kcl

INNER JOIN
a_servtrack_line l
on l.line_id = kcl.line_id;

DROP VIEW IF EXISTS `a_kuochuan_servtrack_view_work_op`;
CREATE VIEW a_kuochuan_servtrack_view_work_op AS
SELECT
wo.work_id,
wo.op,
wo.process_code,
kcwo.process_step,
wo.std_hour,
wo.qrcode_op,
wo.op_duration,
wo.output,
wo.go_quantity,
wo.ng_quantity,
wo.quality,
wo.remark,
wo.is_open,
w.status_id,
wo.create_by,
wo.create_time,
wo.modify_by,
wo.modify_time

FROM a_servtrack_work w 

INNER JOIN
a_kuochuan_servtrack_work_op kcwo
on kcwo.work_id = w.work_id

INNER JOIN
a_servtrack_work_op wo
on wo.work_id = kcwo.work_id and
wo.op = kcwo.op;

DROP VIEW IF EXISTS `a_kuochuan_servtrack_view_tracking_detail`;
CREATE VIEW a_kuochuan_servtrack_view_tracking_detail AS
SELECT 
p.product_id, 
ps.process_name,
ps.process_quality,
kcpt.product_type_id,
kcwo.process_step,
wt.cust_field_1 AS staff_id,
kcs.staff_name,
wo.std_hour,
wo.process_code,
po.op_quality_sp,
kcl.is_valid,
wt.*

FROM a_servtrack_work_tracking wt

INNER JOIN
a_kuochuan_servtrack_staff kcs
on kcs.staff_id = wt.cust_field_1

INNER JOIN
a_servtrack_work w
on w.work_id = wt.work_id

INNER JOIN
a_servtrack_work_op wo
on wo.work_id = wt.work_id and wo.op = wt.op

INNER JOIN
a_kuochuan_servtrack_work_op kcwo
on kcwo.work_id = wo.work_id and
kcwo.op = wo.op

INNER JOIN
a_servtrack_product p
on p.product_id = w.product_id

INNER JOIN
a_kuochuan_servtrack_product kcp
on kcp.product_id = p.product_id

INNER JOIN
a_servtrack_product_op po
on w.product_id = po.product_id and
po.op = wo.op

INNER JOIN
a_kuochuan_servtrack_product_type kcpt
on kcpt.product_type_id = kcp.product_type_id

INNER JOIN
a_servtrack_process ps
on ps.process_code = wt.cust_field_2

INNER JOIN
a_kuochuan_servtrack_line kcl
on kcl.line_id = wt.line_id;

DROP VIEW IF EXISTS `a_kuochuan_servtrack_view_emp_performance`;
CREATE VIEW a_kuochuan_servtrack_view_emp_performance AS
SELECT
kcpf.shift_day,
kcpf.staff_id,
kcs.staff_name,
kcpf.work_id, 
kcpf.product_id, 
kcpf.product_type_id,
kcpt.staff_id AS manger_id,
ps.process_name,
kcwo.process_step,
wo.std_hour,
l.line_name,
kcs.staff_wage,
kcpf.cost_duration,
kcpf.cost_real ,
kcpf.cost_sp,
kcpf.cost_difference,
kcpf.go_quantity,
kcpf.quantity_sp,
kcpf.qua_difference ,
kcpf.hour_difference 

FROM a_kuochuan_servtrack_performance kcpf

INNER JOIN
a_kuochuan_servtrack_staff kcs
on kcs.staff_id = kcpf.staff_id

INNER JOIN
a_servtrack_process ps
on ps.process_code = kcpf.process_code

INNER JOIN
a_servtrack_work_op wo
on wo.work_id = kcpf.work_id and
wo.op = kcpf.op

INNER JOIN
a_kuochuan_servtrack_work_op kcwo
on kcwo.work_id = kcpf.work_id and
kcwo.op = kcpf.op

INNER JOIN
a_kuochuan_servtrack_product_type kcpt
on kcpt.product_type_id = kcpf.product_type_id

INNER JOIN
a_servtrack_line l
on l.line_id = kcpf.line_id;

DROP VIEW IF EXISTS `a_kuochuan_servtrack_view_work_tracking`;
CREATE VIEW a_kuochuan_servtrack_view_work_tracking AS
SELECT 

kcwt.staff_id,
kcwt.process_code,
wt.*

FROM a_kuochuan_servtrack_work_tracking kcwt

INNER JOIN
a_servtrack_work_tracking wt
on kcwt.move_in = wt.move_in and
kcwt.line_id = wt.line_id and
kcwt.work_id = wt.work_id and
kcwt.staff_id = wt.cust_field_1 and
kcwt.process_code = wt.cust_field_2 and
kcwt.op = wt.op;

DROP VIEW IF EXISTS `a_kuochuan_servtrack_view_work_tracking_performance`;
CREATE VIEW a_kuochuan_servtrack_view_work_tracking_performance AS
SELECT 
wt.move_in,
wt.line_id,
wt.cust_field_1 AS staff_id,
wt.work_id,
wt.op,
wt.cust_field_2 AS process_code,
wt.shift_day,
wt.move_out,
wt.go_quantity,
wt.output,
wo.std_hour,
kcs.staff_wage,
l.is_valid,
kcp.product_id,
kcp.product_type_id

FROM a_servtrack_work_tracking wt

INNER JOIN
a_kuochuan_servtrack_line l
on l.line_id = wt.line_id

INNER JOIN
a_servtrack_work_op wo
on wo.work_id = wt.work_id and
wo.op = wt.op

INNER JOIN
a_kuochuan_servtrack_staff kcs
on kcs.staff_id = wt.cust_field_1

INNER JOIN
a_servtrack_work w
on w.work_id = wt.work_id

INNER JOIN
a_kuochuan_servtrack_product kcp
on kcp.product_id = w.product_id;


DROP VIEW IF EXISTS `a_kuochuan_servtrack_view_emp_use`;
CREATE VIEW a_kuochuan_servtrack_view_emp_use AS
SELECT 
wt.move_in,
wt.line_id,
wt.cust_field_1 AS staff_id,
wt.cust_field_2 AS process_code,
kcs.staff_name,
kcs.staff_wage,
wt.work_id,
wt.op,
wt.shift_day,
wt.move_out,
wt.go_quantity,
wt.output,
wt.op_duration,
wt.quality,
wt.output_sp,
wt.aval,
wt.perf, 
wo.std_hour,
wo.process_step,
l.is_valid,
l.line_name,
l.perf_sp,    
l.line_quality_sp, 
p.product_id,
p.product_type_id,
p.product_name,
kcsw.working_start,
kcsw.working_end,
kcsw.working_hour

FROM a_servtrack_work_tracking wt

INNER JOIN
a_kuochuan_servtrack_view_line l
on l.line_id = wt.line_id

INNER JOIN
a_kuochuan_servtrack_view_work_op wo
on wo.work_id = wt.work_id and
wo.op = wt.op

INNER JOIN
a_kuochuan_servtrack_staff kcs
on kcs.staff_id = wt.cust_field_1

INNER JOIN
a_servtrack_work w
on w.work_id = wt.work_id

INNER JOIN
a_kuochuan_servtrack_should_work kcsw
on kcsw.staff_id = kcs.staff_id and 
kcsw.shift_day = wt.shift_day

INNER JOIN
a_kuochuan_servtrack_view_product p
on p.product_id = w.product_id;

DROP VIEW IF EXISTS `a_kuochuan_servtrack_view_ng_quality`;
CREATE VIEW a_kuochuan_servtrack_view_ng_quality AS
SELECT 
p.product_id,
p.product_type_id,
p.product_name,
wt.op,
wt.cust_field_2 AS process_code,
ps.process_name,
ps.process_quality,
wt.output,
wt.go_quantity,
wt.ng_quantity,
wt.shift_day,
po.op_quality_sp

FROM a_servtrack_work_tracking wt

INNER JOIN
a_kuochuan_servtrack_view_work_op wo
on wo.work_id = wt.work_id and
wo.op = wt.op

INNER JOIN
a_servtrack_work w
on w.work_id = wt.work_id

INNER JOIN
a_kuochuan_servtrack_view_product p
on p.product_id = w.product_id

INNER JOIN
a_servtrack_process ps
on ps.process_code = wt.cust_field_2

INNER JOIN
a_servtrack_product_op po
on po.product_id = p.product_id and 
po.op = wt.op;

DROP VIEW IF EXISTS `a_kuochuan_servtrack_view_line_tracking`;
CREATE VIEW a_kuochuan_servtrack_view_line_tracking AS
SELECT 

wt.*,
l.line_quality_sp,
l.perf_sp,
l.is_valid,
l.is_open,
p.product_id,
p.product_name,
wo.process_step

FROM a_kuochuan_servtrack_view_work_tracking wt

INNER JOIN
a_kuochuan_servtrack_view_line l
on l.line_id = wt.line_id

INNER JOIN
a_kuochuan_servtrack_work_op wo
on wo.work_id = wt.work_id and
wo.op = wt.op

INNER JOIN
a_servtrack_work w
on w.work_id = wt.work_id

INNER JOIN
a_servtrack_product p
on p.product_id = w.product_id;
