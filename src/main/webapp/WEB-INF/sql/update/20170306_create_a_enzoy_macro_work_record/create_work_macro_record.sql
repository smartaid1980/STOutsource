DROP TABLE IF EXISTS `a_enzoy_work_macro_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE  `a_enzoy_work_macro_record` (
  `machine_id` varchar(32) NOT NULL,
  `ctl_datm` DATETIME DEFAULT NULL,  
  `end_datetime` DATETIME DEFAULT NULL,
  `date` varchar(10) DEFAULT NULL,
  `logically_date` varchar(10) DEFAULT NULL,
  `work_shift_name` varchar(10) DEFAULT NULL,
  `macro` varchar(10) DEFAULT NULL,
  `macro_start_datetime` DATETIME DEFAULT NULL,
  `status` varchar(5) DEFAULT NULL,
  `creator` varchar(50) DEFAULT NULL,
  `create_datetime` DATETIME NOT NULL,
  PRIMARY KEY (`machine_id`, `ctl_datm`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;