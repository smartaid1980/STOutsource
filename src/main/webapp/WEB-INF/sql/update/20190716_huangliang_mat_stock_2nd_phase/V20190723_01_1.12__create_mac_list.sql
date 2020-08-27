DROP TABLE IF EXISTS `a_huangliang_mac_list`;
CREATE TABLE `a_huangliang_mac_list` (
  `machine_id` VARCHAR(32) NOT NULL COMMENT '機台編號',
  `mac_type` VARCHAR(20) COMMENT '機型',
  `c_scrapsize` VARCHAR(20) COMMENT '走心殘材',
  `t_scrapsize` VARCHAR(20) COMMENT '走刀殘材',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立人',
  `create_time` DATETIME NOT NULL COMMENT '建立日期',
  `modify_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `modify_time` DATETIME NOT NULL COMMENT '修改日期',
  PRIMARY KEY(`machine_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;
