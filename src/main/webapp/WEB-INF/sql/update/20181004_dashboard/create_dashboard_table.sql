--
-- Table structure for table `m_sys_dashboard`
--

DROP TABLE IF EXISTS `m_sys_dashboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_dashboard` (
  `dashboard_id` varchar(45) NOT NULL,
  `app_id` varchar(45) NOT NULL,
  `dashboard_name` text NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`dashboard_id`,`app_id`),
  KEY `FK_sys_dashboard_app_id_idx` (`app_id`),
  CONSTRAINT `FK_sys_dashboard_app_id` FOREIGN KEY (`app_id`) REFERENCES `m_app_info` (`app_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_auth_dashboard`
--

DROP TABLE IF EXISTS `m_sys_auth_dashboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_auth_dashboard` (
  `auth_id` varchar(45) NOT NULL,
  `dashboard_id` varchar(45) NOT NULL,
  `app_id` varchar(45) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`auth_id`,`dashboard_id`,`app_id`),
  KEY `_idx` (`auth_id`),
  KEY `d_idx` (`dashboard_id`),
  KEY `FK_sys_auth_dashboard_dashboard_id_idx` (`dashboard_id`,`app_id`),
  CONSTRAINT `FK_sys_auth_dashboard_auth_id` FOREIGN KEY (`auth_id`) REFERENCES `m_sys_auth` (`auth_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_sys_auth_dashboard_dashboard_id` FOREIGN KEY (`dashboard_id`, `app_id`) REFERENCES `m_sys_dashboard` (`dashboard_id`, `app_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;