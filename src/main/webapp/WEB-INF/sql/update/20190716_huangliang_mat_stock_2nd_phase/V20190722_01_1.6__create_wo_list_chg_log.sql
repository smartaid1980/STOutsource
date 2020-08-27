DROP TABLE IF EXISTS `a_huangliang_wo_list_chg_log`;
CREATE TABLE `a_huangliang_wo_list_chg_log` (
  `order_id` CHAR(11) NOT NULL COMMENT '訂單編號',
  `previous_wo_status` TINYINT COMMENT '變更前生產指令狀態',
  `changed_wo_status` TINYINT COMMENT '變更後生產指令狀態',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立人',
  `create_time` DATETIME NOT NULL COMMENT '建立日期',
  PRIMARY KEY(`order_id`, `create_time`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;
