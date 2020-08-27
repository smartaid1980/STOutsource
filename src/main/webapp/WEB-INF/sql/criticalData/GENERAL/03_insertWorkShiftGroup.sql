--
-- Dumping data for table `m_work_shift_group`
--

/*!40000 ALTER TABLE `m_work_shift_group` DISABLE KEYS */;
INSERT INTO `m_work_shift_group` (`id`,`type`,`group_name`,`description`) VALUES 
 (1432286308143,'weekday','General','Default');
/*!40000 ALTER TABLE `m_work_shift_group` ENABLE KEYS */;

--
-- Dumping data for table `m_work_shift_time`
--

/*!40000 ALTER TABLE `m_work_shift_time` DISABLE KEYS */;
INSERT INTO `m_work_shift_time` (`id`,`sequence`,`name`,`start`,`end`,`work_shift_group_id`,`is_open`) VALUES 
 (117,1,'A','08:00:00','15:59:59',1432286308143,1),
 (118,3,'C','00:00:00','07:59:59',1432286308143,1),
 (119,2,'B','16:00:00','23:59:59',1432286308143,1);
/*!40000 ALTER TABLE `m_work_shift_time` ENABLE KEYS */;

--
-- Dumping data for table `m_work_shift_child`
--

/*!40000 ALTER TABLE `m_work_shift_child` DISABLE KEYS */;
INSERT INTO `m_work_shift_child` (`id`,`weekday`,`date`,`work_shift_group_id`) VALUES 
 (147,6,NULL,1432286308143),
 (148,2,NULL,1432286308143),
 (149,1,NULL,1432286308143),
 (150,3,NULL,1432286308143),
 (151,0,NULL,1432286308143),
 (152,5,NULL,1432286308143),
 (153,4,NULL,1432286308143);
/*!40000 ALTER TABLE `m_work_shift_child` ENABLE KEYS */;
