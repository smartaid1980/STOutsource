DROP TABLE IF EXISTS `a_huangliang_mat_price_list`;
CREATE TABLE `a_huangliang_mat_price_list` (
  `mat_id` varchar(20) NOT NULL COMMENT '材料編碼',
  `sup_id` varchar(20) NOT NULL COMMENT '廠商代碼',
  `mat_price` decimal(8, 2) UNSIGNED NOT NULL COMMENT '材料單價',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立人',
  `create_time` DATETIME NOT NULL COMMENT '建立日期',
  `modify_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `modify_time` DATETIME NOT NULL COMMENT '修改日期',
  PRIMARY KEY(`mat_id`, `sup_id`),
  CONSTRAINT `FK_a_huangliang_mat_price_list_1` FOREIGN KEY (`mat_id`) REFERENCES `a_huangliang_mat_profile` (`mat_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_a_huangliang_mat_price_list_2` FOREIGN KEY (`sup_id`) REFERENCES `a_huangliang_supplier` (`sup_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET=utf8;
