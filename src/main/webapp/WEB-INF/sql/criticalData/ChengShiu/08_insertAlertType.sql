--
-- Dumping data for table `a_chengshiu_alert_type`
--

/*!40000 ALTER TABLE `a_chengshiu_alert_type` DISABLE KEYS */;
INSERT INTO `a_chengshiu_alert_type` (`type_id`,`type_name`) VALUES 
 ('A','機台預防保養提醒'),
 ('B','AGV預防保養提醒'),
 ('C','機台原料倒數提醒'),
 ('D','環境偵測異常提醒'),
 ('E','原料出庫通知'),
 ('F','商店低於安全庫存'),
 ('G','口罩機警報');
/*!40000 ALTER TABLE `a_chengshiu_alert_type` ENABLE KEYS */;