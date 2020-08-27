DROP TABLE IF EXISTS `a_cosmos_program_production`;
CREATE TABLE  `servcloud`.`a_cosmos_program_production` (
  `date` date NOT NULL,
  `work_shift` varchar(10) NOT NULL,
  `machine_id` varchar(32) NOT NULL,
  `program_name` varchar(50) NOT NULL,
  `operator_id` varchar(50) NOT NULL,
  `order_no` varchar(20) NOT NULL,
  `part_no` varchar(20) NOT NULL,
  `db_operator_id` varchar(50) NOT NULL,
  `db_order_no` varchar(20) NOT NULL,
  `db_part_no` varchar(20) NOT NULL,
  `cycle_time` int(10) NOT NULL,
  `ng_quantity` int(10) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`date`,`work_shift`,`machine_id`,`program_name`,`operator_id`,`order_no`,`part_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
