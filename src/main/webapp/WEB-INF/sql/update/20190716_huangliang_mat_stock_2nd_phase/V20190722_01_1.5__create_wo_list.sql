DROP TABLE IF EXISTS `a_huangliang_wo_list`;
CREATE TABLE `a_huangliang_wo_list` (
  `order_id` CHAR(11) NOT NULL COMMENT '訂單編號',
  `product_id` varchar(30) NOT NULL COMMENT '管編',
  `product_pid` VARCHAR(50) COMMENT '圖號',
  `customer_id` VARCHAR(10) COMMENT '客戶代碼',
  `order_qty` INT UNSIGNED NOT NULL COMMENT '訂單總量',
  `wo_pqty` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '生產總量',
  `wo_bqty` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '不良總量',
  `wo_mqty` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '派工總量',
  `exp_date` DATE DEFAULT NULL COMMENT '期望交期',
  `wo_status` TINYINT NOT NULL DEFAULT 0 COMMENT '生產指令狀態',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立人',
  `create_time` DATETIME NOT NULL COMMENT '建立日期',
  `modify_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `modify_time` DATETIME NOT NULL COMMENT '修改日期',
  PRIMARY KEY(`order_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;
