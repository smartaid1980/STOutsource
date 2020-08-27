--
-- Dumping data for table `m_device`
--

/*!40000 ALTER TABLE `m_device` DISABLE KEYS */;

 INSERT IGNORE INTO `m_device` (`device_id`,`device_name`,`ip`,`device_mac`,`create_time`,`create_by`,`modify_time`,`modify_by`,`gps`,`lean_id`,`port`,`plant_area`) VALUES
 ('Machine01','Machine01','','',NOW(),'admin',NULL,NULL,NULL,NULL,NULL,NULL),
 ('Machine02','Machine02','','',NOW(),'admin',NULL,NULL,NULL,NULL,NULL,NULL),
 ('Machine03','Machine03','','',NOW(),'admin',NULL,NULL,NULL,NULL,NULL,NULL),
 ('Machine04','Machine04','','',NOW(),'admin',NULL,NULL,NULL,NULL,NULL,NULL),
 ('Machine05','Machine05','','',NOW(),'admin',NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `m_device` ENABLE KEYS */;

--
-- Dumping data for table `m_plant`
--

/*!40000 ALTER TABLE `m_plant` DISABLE KEYS */;
INSERT IGNORE INTO `m_plant` (`plant_id`,`plant_name`,`row_length`,`column_length`,`row_head`,`column_head`) VALUES 
 ('Zone demo','Zone demo',2,6,'[\"\"]','[\"\",\"\",\"\",\"\",\"\"]');
/*!40000 ALTER TABLE `m_plant` ENABLE KEYS */;

--
-- Dumping data for table `m_plant_area`
--

/*!40000 ALTER TABLE `m_plant_area` DISABLE KEYS */;

 INSERT IGNORE INTO `m_plant_area` (`device_id`,`plant_id`,`row_index`,`column_index`) VALUES 
 ('Machine01','Zone demo',1,'1'),
 ('Machine02','Zone demo',1,'2'),
 ('Machine03','Zone demo',1,'3'),
 ('Machine04','Zone demo',1,'4'),
 ('Machine05','Zone demo',1,'5');
/*!40000 ALTER TABLE `m_plant_area` ENABLE KEYS */;


