DROP TABLE IF EXISTS `m_sys_group_machine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_group_machine` (
  `group_id` varchar(45) NOT NULL,
  `machine_id` varchar(32) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`group_id`,`machine_id`) USING BTREE,
  KEY `machine_id` (`machine_id`) USING BTREE,
  CONSTRAINT `FK_m_sys_group_machine_group_id` FOREIGN KEY (`group_id`) REFERENCES `m_sys_group` (`group_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_m_sys_group_machine_machine_id` FOREIGN KEY (`machine_id`) REFERENCES `m_device` (`device_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='群組機台綁定';
/*!40101 SET character_set_client = @saved_cs_client */;