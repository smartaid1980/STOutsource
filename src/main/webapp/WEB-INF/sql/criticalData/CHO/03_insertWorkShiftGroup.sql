--
-- Dumping data for table `m_work_shift_group`
--

DELETE FROM `m_work_shift_group` WHERE id = '1432286308143';

/*!40000 ALTER TABLE `m_work_shift_group` DISABLE KEYS */;
INSERT INTO `m_work_shift_group` (`id`,`type`,`group_name`,`description`) VALUES 
 (1432286308143,'weekday','一般班次','一般班次'),
 (1502330844495,'weekday','週一班次','週一班次');
/*!40000 ALTER TABLE `m_work_shift_group` ENABLE KEYS */;

--
-- Dumping data for table `m_work_shift_time`
--

/*!40000 ALTER TABLE `m_work_shift_time` DISABLE KEYS */;
INSERT INTO `m_work_shift_time` (`id`,`sequence`,`name`,`start`,`end`,`work_shift_group_id`) VALUES 
 (124,1,'早班','07:00:00','18:59:59',1432286308143),
 (125,2,'晚班','19:00:00','06:59:59',1432286308143),
 (126,1,'早班','08:00:00','18:59:59',1502330844495),
 (127,2,'晚班','19:00:00','06:59:59',1502330844495);
/*!40000 ALTER TABLE `m_work_shift_time` ENABLE KEYS */;

--
-- Dumping data for table `m_work_shift_child`
--

/*!40000 ALTER TABLE `m_work_shift_child` DISABLE KEYS */;
INSERT INTO `m_work_shift_child` (`id`,`weekday`,`date`,`work_shift_group_id`) VALUES 
 (166,0,NULL,1432286308143),
 (167,2,NULL,1432286308143),
 (168,3,NULL,1432286308143),
 (169,4,NULL,1432286308143),
 (170,5,NULL,1432286308143),
 (171,6,NULL,1432286308143),
 (172,1,NULL,1502330844495);
/*!40000 ALTER TABLE `m_work_shift_child` ENABLE KEYS */;
