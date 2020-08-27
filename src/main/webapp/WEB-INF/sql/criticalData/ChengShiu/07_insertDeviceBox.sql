INSERT INTO `m_box` (`box_id`,`ip`,`port`,`box_mac`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
--  ('CSUD01','127.0.0.1','52009','',NOW(),'admin',NULL,NULL),
 ('CSUD02','127.0.0.1','52009','',NOW(),'admin',NULL,NULL),
 ('CSUD03','127.0.0.1','52009','',NOW(),'admin',NULL,NULL),
 ('CSUD04','127.0.0.1','52009','',NOW(),'admin',NULL,NULL),
 ('CSUD05','127.0.0.1','52009','',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_box` ENABLE KEYS */;

--
-- Dumping data for table `m_device`
--

/*!40000 ALTER TABLE `m_device` DISABLE KEYS */;
INSERT INTO `m_device` (`device_id`,`device_name`,`ip`,`device_mac`,`create_time`,`create_by`,`modify_time`,`modify_by`,`gps`,`lean_id`,`port`,`plant_area`,`is_real_data`) VALUES
 ('CSU_ENV','CSU_ENV','','',NOW(),'admin',NULL,NULL,NULL,NULL,NULL,NULL,1),
 ('CSU_PL1','壓合機','','',NOW(),'admin',NULL,NULL,NULL,NULL,NULL,NULL,1),
 ('CSU_PL2','貼耳機','','',NOW(),'admin',NULL,NULL,NULL,NULL,NULL,NULL,1),
 ('CSU_PL3','包裝機','','',NOW(),'admin',NULL,NULL,NULL,NULL,NULL,NULL,1),
 ('CSU_PL4','裝籃機','','',NOW(),'admin',NULL,NULL,NULL,NULL,NULL,NULL,1),
 ('CSU_AGVA','AGVA','','',NOW(),'admin',NULL,NULL,NULL,NULL,NULL,NULL,1),
 ('CSU_AGVB','AGVB','','',NOW(),'admin',NULL,NULL,NULL,NULL,NULL,NULL,1);

/*!40000 ALTER TABLE `m_device` ENABLE KEYS */;

--
-- Dumping data for table `m_device_box`
--

/*!40000 ALTER TABLE `m_device_box` DISABLE KEYS */;
INSERT INTO `m_device_box` (`device_id`,`box_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
 ('CSU_ENV','CSUD01',NOW(),'admin',NULL,NULL),
 ('CSU_PL1','CSUD02',NOW(),'admin',NULL,NULL),
 ('CSU_PL2','CSUD02',NOW(),'admin',NULL,NULL),
 ('CSU_PL3','CSUD02',NOW(),'admin',NULL,NULL),
 ('CSU_PL4','CSUD03',NOW(),'admin',NULL,NULL),
 ('CSU_AGVA','CSUD04',NOW(),'admin',NULL,NULL),
 ('CSU_AGVB','CSUD05',NOW(),'admin',NULL,NULL);