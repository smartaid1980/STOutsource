--
-- Dumping data for table `m_box`
--

/*!40000 ALTER TABLE `m_box` DISABLE KEYS */;
INSERT INTO `m_box` (`box_id`,`ip`,`port`,`box_mac`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
 ('{{BOX_ID}}','127.0.0.1','52009','',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_box` ENABLE KEYS */;

--
-- Dumping data for table `m_device`
--

/*!40000 ALTER TABLE `m_device` DISABLE KEYS */;
INSERT INTO `m_device` (`device_id`,`device_name`,`ip`,`device_mac`,`create_time`,`create_by`,`modify_time`,`modify_by`,`gps`,`lean_id`,`port`,`plant_area`,`is_real_data`) VALUES
 ('{{MACHINE_ID}}','{{MACHINE_ID}}','','',NOW(),'admin',NULL,NULL,NULL,NULL,NULL,NULL,1);

/*!40000 ALTER TABLE `m_device` ENABLE KEYS */;

--
-- Dumping data for table `m_device_box`
--

/*!40000 ALTER TABLE `m_device_box` DISABLE KEYS */;
INSERT INTO `m_device_box` (`device_id`,`box_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES 
 ('{{MACHINE_ID}}','{{BOX_ID}}',NOW(),'admin',NULL,NULL);

/*!40000 ALTER TABLE `m_device_box` ENABLE KEYS */;

--
-- Dumping data for table `m_plant`
--

/*!40000 ALTER TABLE `m_plant` DISABLE KEYS */;
INSERT INTO `m_plant` (`plant_id`,`plant_name`,`row_length`,`column_length`,`row_head`,`column_head`) VALUES 
 ('Zone01','Zone01',5,6,'[\"\",\"\",\"\",\"\"]','[\"\",\"\",\"\",\"\",\"\"]');
/*!40000 ALTER TABLE `m_plant` ENABLE KEYS */;

--
-- Dumping data for table `m_plant_area`
--

/*!40000 ALTER TABLE `m_plant_area` DISABLE KEYS */;
INSERT INTO `m_plant_area` (`device_id`,`plant_id`,`row_index`,`column_index`) VALUES 
 ('{{MACHINE_ID}}','Zone01','{{ROW_INDEX}}','{{SEQUENCE}}');
/*!40000 ALTER TABLE `m_plant_area` ENABLE KEYS */;


