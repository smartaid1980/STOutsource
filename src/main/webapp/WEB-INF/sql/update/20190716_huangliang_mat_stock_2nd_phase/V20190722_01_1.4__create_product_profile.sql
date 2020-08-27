DROP TABLE IF EXISTS `a_huangliang_product_profile`;
CREATE TABLE `a_huangliang_product_profile` (
  `mstock_name` VARCHAR(20) NOT NULL COMMENT '材料庫',
  `product_id` VARCHAR(30) NOT NULL COMMENT '管編',
  `product_pid` VARCHAR(50) COMMENT '圖號',
  `mat_id` VARCHAR(20) COMMENT '材料編碼',
  `mat_shape` VARCHAR(10) COMMENT '形狀',
  `mat_dim` DECIMAL(5,3) UNSIGNED COMMENT '外徑',
  `usage` DECIMAL(8,2) UNSIGNED COMMENT '單件用量',
  `process` VARCHAR(10) COMMENT '加工方式',
  `multiprogram` TINYINT UNSIGNED COMMENT '製程數',
  `def_runtime` DECIMAL(8,2) UNSIGNED COMMENT '預設標工',
  `def_mactype` VARCHAR(50) COMMENT '預設機型',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立人',
  `create_time` DATETIME NOT NULL COMMENT '建立日期',
  `modify_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `modify_time` DATETIME NOT NULL COMMENT '修改日期',
  PRIMARY KEY(`mstock_name`, `product_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;
