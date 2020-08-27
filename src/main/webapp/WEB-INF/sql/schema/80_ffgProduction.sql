DROP TABLE IF EXISTS `a_ffg_production_mode`;
CREATE TABLE `a_ffg_production_mode` (
  `timestamp` varchar(20) NOT NULL,
  `mode` varchar(1) NOT NULL,
  PRIMARY KEY (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_ffg_production_process`;
CREATE TABLE `a_ffg_production_process` (
  `product_id` varchar(50) NOT NULL,
  `timestamp` varchar(20) NOT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
