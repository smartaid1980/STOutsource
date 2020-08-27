DROP TABLE IF EXISTS `a_huangliang_mat_price_chg_log`;
CREATE TABLE `a_huangliang_mat_price_chg_log` (
  `mat_id` varchar(20) NOT NULL COMMENT '材料編碼',
  `sup_id` varchar(20) NOT NULL COMMENT '廠商代碼',
  `previous_mat_price` decimal(8, 2) UNSIGNED COMMENT '修改前單價',
  `changed_mat_price` decimal(8, 2) UNSIGNED COMMENT '修改後單價',
  `remark` varchar(50) COMMENT '備註',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立人',
  `create_time` DATETIME NOT NULL COMMENT '建立日期',
  PRIMARY KEY(`mat_id`, `sup_id`, `create_time`),
  CONSTRAINT `FK_a_huangliang_mat_price_chg_log_1` FOREIGN KEY (`mat_id`) REFERENCES `a_huangliang_mat_profile` (`mat_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_a_huangliang_mat_price_chg_log_2` FOREIGN KEY (`sup_id`) REFERENCES `a_huangliang_supplier` (`sup_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET=utf8;
