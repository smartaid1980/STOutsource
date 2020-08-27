--
-- Table structure for table `a_huangliang_downtime_code_light_id`
--

DROP TABLE IF EXISTS `a_huangliang_downtime_code_light_id`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_downtime_code_light_id` (
  `downtime_code` varchar(5) NOT NULL,
  `light_id` varchar(45) NOT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`downtime_code`,`light_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

-- init repair code value
INSERT INTO `a_huangliang_downtime_code_light_id` (`downtime_code`,`light_id`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES
 ('100','11','admin',NOW(),NULL,NULL),
 ('101','12','admin',NOW(),NULL,NULL),
 ('101','13','admin',NOW(),NULL,NULL),
 ('102','12','admin',NOW(),NULL,NULL),
 ('102','13','admin',NOW(),NULL,NULL),
 ('103','12','admin',NOW(),NULL,NULL),
 ('104','12','admin',NOW(),NULL,NULL),
 ('105','12','admin',NOW(),NULL,NULL),
 ('106','0','admin',NOW(),NULL,NULL),
 ('110','12','admin',NOW(),NULL,NULL),
 ('110','0','admin',NOW(),NULL,NULL),

 ('200','12','admin',NOW(),NULL,NULL),
 ('200','13','admin',NOW(),NULL,NULL),
 ('201','12','admin',NOW(),NULL,NULL),
 ('202','12','admin',NOW(),NULL,NULL),
 ('203','12','admin',NOW(),NULL,NULL),
 ('204','11','admin',NOW(),NULL,NULL),
 ('204','12','admin',NOW(),NULL,NULL),
 ('205','12','admin',NOW(),NULL,NULL),
 ('206','12','admin',NOW(),NULL,NULL),
 ('206','13','admin',NOW(),NULL,NULL),
 ('207','12','admin',NOW(),NULL,NULL),
 ('208','12','admin',NOW(),NULL,NULL),
 ('209','12','admin',NOW(),NULL,NULL),
 ('210','12','admin',NOW(),NULL,NULL),
 ('211','12','admin',NOW(),NULL,NULL),
 ('212','12','admin',NOW(),NULL,NULL),
 ('213','12','admin',NOW(),NULL,NULL),
 ('214','12','admin',NOW(),NULL,NULL),
 ('215','12','admin',NOW(),NULL,NULL),
 ('216','0','admin',NOW(),NULL,NULL),

 ('300','12','admin',NOW(),NULL,NULL),
 ('300','13','admin',NOW(),NULL,NULL),
 ('301','11','admin',NOW(),NULL,NULL),
 ('301','12','admin',NOW(),NULL,NULL),
 ('302','12','admin',NOW(),NULL,NULL),
 ('303','12','admin',NOW(),NULL,NULL),
 ('303','13','admin',NOW(),NULL,NULL),
 ('304','12','admin',NOW(),NULL,NULL),
 ('305','12','admin',NOW(),NULL,NULL),
 ('306','0','admin',NOW(),NULL,NULL);