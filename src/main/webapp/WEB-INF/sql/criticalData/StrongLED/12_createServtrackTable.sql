DROP TABLE IF EXISTS `a_servtrack_synctime_work_update`;
CREATE TABLE  `a_servtrack_synctime_work_update` (
  `sync_start` bigint(20) NOT NULL DEFAULT '0',
  `sync_end` bigint(20) DEFAULT NULL,
  `data_date` decimal(15,10) DEFAULT NULL,
  `sync_account` varchar(50) NOT NULL DEFAULT '',
  `create_by` varchar(50) NOT NULL DEFAULT '',
  `create_time` bigint(20) NOT NULL,
  `modify_by` varchar(50) NOT NULL DEFAULT '',
  `modify_time` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`sync_start`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_servtrack_synctime_work`;
CREATE TABLE  `a_servtrack_synctime_work` (
  `sync_start` bigint(20) NOT NULL DEFAULT '0',
  `sync_end` bigint(20) DEFAULT NULL,
  `data_date` varchar(10) DEFAULT NULL,
  `sync_account` varchar(50) NOT NULL DEFAULT '',
  `create_by` varchar(50) NOT NULL DEFAULT '',
  `create_time` bigint(20) NOT NULL,
  `modify_by` varchar(50) NOT NULL DEFAULT '',
  `modify_time` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`sync_start`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_servtrack_work_tracking_modify_record`;
CREATE TABLE  `a_servtrack_work_tracking_modify_record` (
  `modify_by` varchar(50) NOT NULL DEFAULT '',
  `modify_time` bigint(20) NOT NULL DEFAULT '0',
  `cust_field_1` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_2` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_3` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_4` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_5` varchar(50) NOT NULL DEFAULT '-1',
  PRIMARY KEY (`modify_time` ,`modify_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO a_servtrack_process (`process_code`,`process_name`,`process_quality`,`remark`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('01','貼片','90.00','','Y','ServtrackProcProdSync',NOW(),'admin',NOW()),
 ('02','插件','90.00',NULL,'Y','ServtrackProcProdSync',NOW(),'ServtrackProcProdSync',NOW()),
 ('03','焊接','90.00',NULL,'Y','ServtrackProcProdSync',NOW(),'ServtrackProcProdSync',NOW()),
 ('04','組裝','90.00','','Y','ServtrackProcProdSync',NOW(),'adminstd',NOW()),
 ('05','老化','90.00',NULL,'Y','ServtrackProcProdSync',NOW(),'ServtrackProcProdSync',NOW()),
 ('06','灌膠','90.00',NULL,'Y','ServtrackProcProdSync',NOW(),'ServtrackProcProdSync',NOW()),
 ('07','調試','90.00',NULL,'Y','ServtrackProcProdSync',NOW(),'ServtrackProcProdSync',NOW()),
 ('08','包裝','90.00',NULL,'Y','ServtrackProcProdSync',NOW(),'ServtrackProcProdSync',NOW()),
 ('09','其他','90.00',NULL,'Y','ServtrackProcProdSync',NOW(),'ServtrackProcProdSync',NOW()),
 ('ASB','demo_組裝','98.00','','Y','@st@fae',NOW(),'admin',NOW()),
 ('common_process','通用制程','100.00','系统基础数据','Y','adminstd',NOW(),'adminstd',NOW()),
 ('MK1','上海廠','90.00',NULL,'Y','ServtrackProcProdSync',NOW(),'ServtrackProcProdSync',NOW()),
 ('MK2','吳江廠','90.00',NULL,'Y','ServtrackProcProdSync',NOW(),'ServtrackProcProdSync',NOW()),
 ('MK3','系統集成','90.00',NULL,'Y','ServtrackProcProdSync',NOW(),'ServtrackProcProdSync',NOW()),
 ('MK4','委外加工','90.00',NULL,'Y','ServtrackProcProdSync',NOW(),'ServtrackProcProdSync',NOW()),
 ('MK5','產品處','90.00',NULL,'Y','ServtrackProcProdSync',NOW(),'ServtrackProcProdSync',NOW()),
 ('MK6','線材加工','90.00',NULL,'Y','ServtrackProcProdSync',NOW(),'ServtrackProcProdSync',NOW()),
 ('MK7','型材加工','90.00',NULL,'Y','ServtrackProcProdSync',NOW(),'ServtrackProcProdSync',NOW()),
 ('MK8','瀚睿加工','90.00',NULL,'Y','ServtrackProcProdSync',NOW(),'ServtrackProcProdSync',NOW()),
 ('PA','demo_包裝','100.00','','Y','@st@fae',NOW(),'admin',NOW()),
 ('PG','demo_灌胶','99.00','','Y','@st@fae',NOW(),'admin',NOW()),
 ('SMT','demo_貼片','99.00','','Y','@st@fae',NOW(),'admin',NOW()),
 ('SW','demo_點焊','98.00','','N','@st@fae',NOW(),'admin',NOW());

DROP TABLE IF EXISTS `a_strongled_work_op_mapping`;
CREATE TABLE `a_strongled_work_op_mapping` (
  `producer_id` varchar(10) NOT NULL DEFAULT '',
  `producer_name` varchar(10) NOT NULL,
  `process_code` varchar(10) NOT NULL,
  `remark` varchar(50) DEFAULT NULL,
  `is_open` varchar(1) DEFAULT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`producer_id`),
  KEY `FK_a_strongled_work_op_mapping_process_code` (`process_code`) USING BTREE,
  CONSTRAINT `FK_a_strongled_work_op_mapping_process_code` FOREIGN KEY (`process_code`) REFERENCES `a_servtrack_process` (`process_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `a_strongled_work_op_mapping` (`producer_id`,`producer_name`,`process_code`,`remark`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('01','(停用)上海廠(生產','MK1',NULL,'Y','admin','2019-07-30 14:42:43','admin','2019-07-30 14:42:43'),
 ('02','(停用)吳江廠(生產','MK2',NULL,'Y','admin','2019-07-30 14:42:43','admin','2019-07-30 14:42:43'),
 ('03','(停用)系統集成處','MK3',NULL,'Y','admin','2019-07-30 14:42:43','admin','2019-07-30 14:42:43'),
 ('04','委外加工廠商','MK4',NULL,'Y','admin','2019-07-30 14:42:43','admin','2019-07-30 14:42:43'),
 ('05','(停用)產品處','MK5',NULL,'Y','admin','2019-07-30 14:42:43','admin','2019-07-30 14:42:43'),
 ('06','SMT課','01',NULL,'Y','admin','2019-07-30 14:42:43','admin','2019-07-30 14:42:43'),
 ('07','加工課(線材)','MK6',NULL,'Y','admin','2019-07-30 14:42:43','admin','2019-07-30 14:42:43'),
 ('08','加工課(結構)','MK7',NULL,'Y','admin','2019-07-30 14:42:43','admin','2019-07-30 14:42:43'),
 ('09','焊接組裝課','03',NULL,'Y','admin','2019-07-30 14:42:43','admin','2019-07-30 14:42:43'),
 ('10','灌膠課','06',NULL,'Y','admin','2019-07-30 14:42:43','admin','2019-07-30 14:42:43'),
 ('11','包裝課','08',NULL,'Y','admin','2019-07-30 14:42:43','admin','2019-07-30 14:42:43'),
 ('12','系統課','MK3',NULL,'Y','admin','2019-07-30 14:42:43','admin','2019-07-30 14:42:43'),
 ('13','瀚睿課','MK8',NULL,'Y','admin','2019-07-30 14:42:43','admin','2019-07-30 14:42:43');

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

DROP TABLE IF EXISTS `a_strongled_invalid_line_status_log`;
CREATE TABLE  `a_strongled_invalid_line_status_log` (
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
DROP TABLE IF EXISTS `a_servtrack_product`;
CREATE TABLE  `a_servtrack_product` (
  `product_id` varchar(50) NOT NULL,
  `product_name` varchar(50) NOT NULL,
  `product_quality_sp` decimal(5,2) NOT NULL,
  `remark` varchar(50),
  `product_series` varchar(10),
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_servtrack_process_ng`;
CREATE TABLE  `a_servtrack_process_ng` (
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

DROP TABLE IF EXISTS `a_servtrack_work_tracking`;
CREATE TABLE  `a_servtrack_work_tracking` (
  `move_in` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `line_id` varchar(50) NOT NULL,
  `work_id` varchar(50) NOT NULL,
  `op` varchar(10) NOT NULL,
  `cust_field_1` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_2` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_3` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_4` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_5` varchar(50) NOT NULL DEFAULT '-1',
  `shift_day` date NOT NULL,
  `move_out` datetime DEFAULT NULL,
  `op_duration` decimal(10,4) DEFAULT NULL,
  `output` int(10) DEFAULT NULL,
  `go_quantity` int(10) DEFAULT NULL,
  `ng_quantity` int(10) DEFAULT NULL,
  `quality` decimal(5,2) DEFAULT NULL,
  `output_sp` decimal(10,0) DEFAULT NULL,
  `aval` decimal(5,2) DEFAULT NULL,
  `perf` decimal(5,2) DEFAULT NULL,
  `oee` decimal(5,2) DEFAULT NULL,
  `output_variance` int(10) DEFAULT NULL,
  `duration_variance` decimal(10,2) DEFAULT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  `shift_time` datetime DEFAULT NULL,
  PRIMARY KEY (`move_in`,`line_id`,`work_id`,`op`,`cust_field_1`,`cust_field_2`,`cust_field_3`,`cust_field_4`,`cust_field_5`),
  KEY `FK_a_servtrack_work_tracking_line_id` (`line_id`),
  KEY `FK_a_servtrack_work_tracking_work_id_op` (`work_id`,`op`),
  CONSTRAINT `FK_a_servtrack_work_tracking_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`),
  CONSTRAINT `FK_a_servtrack_work_tracking_work_id_op` FOREIGN KEY (`work_id`, `op`) REFERENCES `a_servtrack_work_op` (`work_id`, `op`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
SET FOREIGN_KEY_CHECKS=1;

DROP VIEW IF EXISTS `a_servtrack_view_work_op`;
CREATE VIEW a_servtrack_view_work_op AS
SELECT
w.*,
w_op.op,
w_op.qrcode_op,
w_op.std_hour,
p.product_name,
p.product_series,
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

DROP VIEW IF EXISTS `a_servtrack_view_tracking_kpi`;
CREATE VIEW a_servtrack_view_tracking_kpi AS
SELECT
wo.process_code,
wt.*

FROM a_servtrack_work_tracking wt

INNER JOIN
a_servtrack_work_op wo
on wt.work_id = wo.work_id and wt.op = wo.op;

DROP VIEW IF EXISTS `a_servtrack_view_tracking_ng_quality`;
CREATE VIEW a_servtrack_view_tracking_ng_quality AS
SELECT
wt.shift_day,
vwo.process_code,
vwo.process_name,
wtng.ng_code,
psng.ng_name,
wtng.ng_quantity,
wt.output,
vwo.product_name,
vwo.product_id,
vwo.product_series,
wt.line_id,
l.line_name

FROM a_servtrack_work_tracking_ng wtng

INNER JOIN
a_servtrack_process_ng psng
on psng.process_code = wtng.process_code and
psng.ng_code = wtng.ng_code

RIGHT JOIN
a_servtrack_work_tracking wt
on wtng.move_in = wt.move_in and
wtng.line_id = wt.line_id and
wtng.work_id = wt.work_id and
wtng.op = wt.op

INNER JOIN
a_servtrack_view_work_op vwo
on wt.work_id = vwo.work_id and wt.op = vwo.op

INNER JOIN
a_servtrack_line l
on l.line_id = wt.line_id;

DROP VIEW IF EXISTS `a_strongled_servtrack_view_tracking_invalid_log`;
CREATE VIEW a_strongled_servtrack_view_tracking_invalid_log AS
SELECT
TIMESTAMPDIFF(SECOND, ilsl.line_status_start,ilsl.line_status_end) AS invalid_duration_sec,
ilsl.line_status_start,
ilsl.line_status_end,
vwo.process_code,
vwo.process_name,
vwo.product_name,
vwo.product_id,
vwo.product_series,
vwo.std_hour,
wt.cust_field_2 AS no_operator,
ilsl.line_status,
ilsl.invalid_id,
ilsl.invalid_text,
ir.invalid_name,
ir.invalid_class,
ir.invalid_type,
ir.is_open,
ir.remark,
wt.*

FROM a_servtrack_work_tracking wt

INNER JOIN
a_servtrack_view_work_op vwo
on wt.work_id = vwo.work_id and wt.op = vwo.op

INNER JOIN
a_strongled_invalid_line_status_log ilsl
on ilsl.move_in = wt.move_in and
ilsl.line_id = wt.line_id and
ilsl.work_id = wt.work_id and
ilsl.op = wt.op

INNER JOIN
a_strongled_invalid_reason ir
on ilsl.invalid_id = ir.invalid_id;

DROP VIEW IF EXISTS `a_strongled_servtrack_view_invalidhour_uneff`;
CREATE VIEW a_strongled_servtrack_view_invalidhour_uneff AS
SELECT FORMAT(SUM(invalid_duration_sec * no_operator)/3600, 4) AS invalidhour_uneff, move_in, work_id, line_id, op
FROM a_strongled_servtrack_view_tracking_invalid_log where invalid_type = 0
group by move_in, work_id, line_id, op;

DROP VIEW IF EXISTS `a_strongled_servtrack_view_invalidhour_eff`;
CREATE VIEW a_strongled_servtrack_view_invalidhour_eff AS
SELECT FORMAT(SUM(invalid_duration_sec * no_operator)/3600, 4) AS invalidhour_eff, move_in, work_id, line_id, op
FROM a_strongled_servtrack_view_tracking_invalid_log where invalid_type =10 or invalid_type =11
group by move_in, work_id, line_id, op;

DROP VIEW IF EXISTS `a_strongled_servtrack_view_changeover_time`;
CREATE VIEW a_strongled_servtrack_view_changeover_time AS
SELECT FORMAT(SUM(invalid_duration_sec * no_operator)/3600, 4) AS changeover_time , move_in, work_id, line_id, op 
FROM a_strongled_servtrack_view_tracking_invalid_log where invalid_type = 11 
group by move_in, work_id, line_id, op;

DROP VIEW IF EXISTS `a_strongled_servtrack_view_efficiency`;
CREATE VIEW a_strongled_servtrack_view_efficiency AS
SELECT
iu.invalidhour_uneff,
ie.invalidhour_eff,
ROUND((wt.go_quantity * vwo.std_hour/60),4) AS std_workhour,
ROUND(((TIMESTAMPDIFF(SECOND, wt.move_in, wt.move_out) * wt.cust_field_2)/3600 - iu.invalidhour_uneff), 4) AS real_workhour,
ct.changeover_time,
vwo.product_id,
vwo.product_name,
vwo.product_series,
vwo.process_name,
vwo.process_code,
l.line_name,
wt.*

FROM a_servtrack_work_tracking wt
LEFT JOIN
a_strongled_servtrack_view_invalidhour_uneff iu
on iu.move_in = wt.move_in and
iu.line_id = wt.line_id and
iu.work_id = wt.work_id and
iu.op = wt.op

LEFT JOIN
a_strongled_servtrack_view_invalidhour_eff ie
on ie.move_in = wt.move_in and
ie.line_id = wt.line_id and
ie.work_id = wt.work_id and
ie.op = wt.op

LEFT JOIN
a_strongled_servtrack_view_changeover_time ct
on ct.move_in = wt.move_in and
ct.line_id = wt.line_id and
ct.work_id = wt.work_id and
ct.op = wt.op

INNER JOIN
a_servtrack_view_work_op vwo
on wt.work_id = vwo.work_id and wt.op = vwo.op

INNER JOIN
a_servtrack_line l
on l.line_id = wt.line_id;

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
wt.shift_time,
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

DROP VIEW IF EXISTS `a_strongled_servtrack_dashboard_view_only_tracking`;
CREATE VIEW a_strongled_servtrack_dashboard_view_only_tracking AS
SELECT vql.group_id,
vql.group_name,
vql.line_id,
t.move_in,
t.move_out,
t.work_id,
t.op,
t.output,
t.ng_quantity,
vwo.process_name,
vwo.product_name,
vql.line_name,
vql.is_open,
t.move_in AS t_move_in,
tnmo.move_in AS tnmo_move_in

FROM a_servtrack_work_tracking AS t
LEFT JOIN a_servtrack_tracking_no_move_out AS tnmo
ON t.move_in = tnmo.move_in AND
t.line_id = tnmo.line_id AND
t.work_id = tnmo.work_id AND
t.op = tnmo.op

INNER JOIN a_strongled_view_group_line vql
ON t.line_id = vql.line_id
INNER JOIN a_servtrack_view_work_op vwo
ON t.work_id = vwo.work_id
and t.op = vwo.op;

DROP VIEW IF EXISTS `a_strongled_servtrack_dashboard_view_tracking_no_move_out`;
CREATE VIEW a_strongled_servtrack_dashboard_view_tracking_no_move_out AS
SELECT vql.group_id,
vql.group_name,
vql.line_id,
tnmo.move_in,
t.move_out,
tnmo.op,
t.output,
t.ng_quantity,
tnmo.work_id,
vwo.process_name,
vwo.product_name,
vql.line_name,
vql.is_open,
tnmo.move_in AS tnmo_move_in,
t.move_out AS t_move_out

FROM a_servtrack_work_tracking t
RIGHT JOIN a_servtrack_tracking_no_move_out tnmo
ON t.move_in = tnmo.move_in AND
t.line_id = tnmo.line_id AND
t.work_id = tnmo.work_id AND
t.op = tnmo.op

INNER JOIN a_strongled_view_group_line vql
ON tnmo.line_id = vql.line_id
INNER JOIN a_servtrack_view_work_op vwo
ON tnmo.work_id = vwo.work_id
and tnmo.op = vwo.op;

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

LEFT JOIN
a_servtrack_product_op po
on w.product_id = po.product_id and
po.op = wo.op

INNER JOIN
a_servtrack_process ps
on ps.process_code = wo.process_code

GROUP BY w.product_id, wt.op, wt.shift_day;