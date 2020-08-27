--
-- Dumping data for table `m_work_shift_group`
--

DELETE FROM `m_work_shift_group` WHERE id = '1432286308143';

/*!40000 ALTER TABLE `m_work_shift_group` DISABLE KEYS */;
INSERT INTO `m_work_shift_group` (`id`,`type`,`group_name`,`description`) VALUES 
 (1432286308143,'weekday','一般班次','預設班次');
/*!40000 ALTER TABLE `m_work_shift_group` ENABLE KEYS */;

--
-- Dumping data for table `m_work_shift_time`
--

/*!40000 ALTER TABLE `m_work_shift_time` DISABLE KEYS */;
INSERT INTO `m_work_shift_time` (`id`,`sequence`,`name`,`start`,`end`,`work_shift_group_id`) VALUES 
 (122,1,'整天','06:00:00','23:58:59',1432286308143);
/*!40000 ALTER TABLE `m_work_shift_time` ENABLE KEYS */;

--
-- Dumping data for table `m_work_shift_child`
--

/*!40000 ALTER TABLE `m_work_shift_child` DISABLE KEYS */;
INSERT INTO `m_work_shift_child` (`id`,`weekday`,`date`,`work_shift_group_id`) VALUES 
 (168,0,NULL,1432286308143),
 (169,1,NULL,1432286308143),
 (170,2,NULL,1432286308143),
 (171,3,NULL,1432286308143),
 (172,4,NULL,1432286308143),
 (173,5,NULL,1432286308143),
 (174,6,NULL,1432286308143);
/*!40000 ALTER TABLE `m_work_shift_child` ENABLE KEYS */;
