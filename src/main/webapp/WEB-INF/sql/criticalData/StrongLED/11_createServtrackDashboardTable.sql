DROP TABLE IF EXISTS `a_strongled_group_line`;
CREATE TABLE `a_strongled_group_line` (
  `group_id` varchar(50) NOT NULL,
  `group_name` varchar(50) NOT NULL,
  `line_id` varchar(50) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`group_id`,`line_id`),
  KEY `FK_a_strongled_group_line_line_id` (`line_id`),
  CONSTRAINT `FK_a_strongled_group_line_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;