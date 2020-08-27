DROP TABLE IF EXISTS `m_main_program`;
CREATE TABLE `m_main_program` (
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `pg_name` varchar(45) NOT NULL DEFAULT '',
  `run_program` varchar(45) NOT NULL,
  `time` double NOT NULL DEFAULT '0',
  `version` int(10) unsigned NOT NULL DEFAULT '1',
  `machine_id` varchar(45) NOT NULL,
  PRIMARY KEY (`version`,`pg_name`,`start_time`,`end_time`,`run_program`,`machine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='主程式運行時間';

DROP TABLE IF EXISTS `servcloud`.`a_shzbg_qc_record_auto_increment`;
CREATE TABLE  `servcloud`.`a_shzbg_qc_record_auto_increment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mold_id` varchar(50) NOT NULL DEFAULT '' COMMENT '模號',
  `part_id` varchar(50) NOT NULL DEFAULT '' COMMENT '零件號',
  `part_ed` varchar(50) NOT NULL DEFAULT '--' COMMENT '電極編號',
  `part_no` varchar(10) NOT NULL DEFAULT '' COMMENT '分件號',
  `work_id` varchar(50) NOT NULL DEFAULT '--' COMMENT '派工單號',
  `meas_datetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '測量時間',
  `machine_id` varchar(20) NOT NULL DEFAULT '' COMMENT '測量機台',
  `operator_id` varchar(20) NOT NULL DEFAULT '' COMMENT '測量員工',
  `points_ok_num` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '矢量ok點數',
  `points_tc_num` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '矢量tc點數',
  `points_ng_num` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '矢量ng點數',
  `part_result` varchar(2) NOT NULL DEFAULT '' COMMENT 'OK：合格 TC：特采 NG：不合格',
  `pnt_arry` text NOT NULL COMMENT '矢量點值',
  `temp` varchar(10) NOT NULL DEFAULT '0' COMMENT '溫度',
  `humidity` float NOT NULL DEFAULT '0' COMMENT '相對溼度',
  `nom_dev` float DEFAULT NULL COMMENT '標準間隙',
  `up_tol` float DEFAULT NULL COMMENT '間隙上公差',
  `low_tol` float DEFAULT NULL COMMENT '間隙下公差',
  `xy_max_dev` float NOT NULL DEFAULT '0' COMMENT '水平最大間隙',
  `xy_min_dev` float NOT NULL DEFAULT '0' COMMENT '水平最小間隙',
  `xy_ave_dev` float NOT NULL DEFAULT '0' COMMENT '水平平均間隙',
  `z_max_dev` float NOT NULL DEFAULT '0' COMMENT '高度最大間隙',
  `z_min_dev` float NOT NULL DEFAULT '0' COMMENT '高度最小間隙',
  `z_ave_dev` float NOT NULL DEFAULT '0' COMMENT '高度平均間隙',
  `flatness` float NOT NULL DEFAULT '0' COMMENT '平面度',
  `offset_x` float DEFAULT NULL COMMENT '電極x補正',
  `offset_y` float DEFAULT NULL COMMENT '電極y補正',
  `offset_z` float DEFAULT NULL COMMENT '電極z補正',
  `stylus_name` varchar(20) DEFAULT NULL COMMENT '測針組名',
  `tip_name` varchar(20) DEFAULT NULL COMMENT '測針名',
  `tip_dia` float DEFAULT NULL COMMENT '測針直徑',
  `used_temp_comp` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否使用了溫度補償 (1 or 0)',
  `create_by` varchar(50) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `modify_by` varchar(50) NOT NULL DEFAULT '',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;

DROP VIEW IF EXISTS `a_shzbg_qc_record`;
CREATE VIEW a_shzbg_qc_record AS 
SELECT * FROM a_shzbg_qc_record_auto_increment
WHERE create_time IN (
SELECT MAX(create_time)
FROM a_shzbg_qc_record_auto_increment
GROUP BY `mold_id`,`part_id`,`part_ed`,`part_no`,`work_id`,`meas_datetime`
)
ORDER BY `meas_datetime`

