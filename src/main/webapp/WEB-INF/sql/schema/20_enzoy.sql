DROP TABLE IF EXISTS `a_enzoy_work_macro_record`;
CREATE TABLE  `a_enzoy_work_macro_record` (
  `machine_id` varchar(32) NOT NULL,
  `ctl_datm` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `end_datetime` datetime DEFAULT NULL,
  `date` varchar(10) DEFAULT NULL,
  `logically_date` varchar(10) DEFAULT NULL,
  `work_shift_name` varchar(10) DEFAULT NULL,
  `macro` varchar(10) DEFAULT NULL,
  `macro_start_datetime` datetime DEFAULT NULL,
  `status` varchar(5) DEFAULT NULL,
  `creator` varchar(50) DEFAULT NULL,
  `create_datetime` datetime NOT NULL,
  PRIMARY KEY (`machine_id`,`ctl_datm`) USING BTREE,
  KEY `ctl_datm_index` (`ctl_datm`),
  KEY `machine_id_index` (`machine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;