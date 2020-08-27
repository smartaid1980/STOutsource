INSERT INTO `m_alarm` (`alarm_id`,`cnc_id`,`machine_type_id`,`alarm_status`,`description`,`source`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('1102','OTHER','OTHER','左後側壁噸位值,角度= 175度,工件疊片(衝壓點提前)警告','沖壓接觸工件的角度,沖壓噸位值高於標準模的監控值,顯示衝壓點提前,工件疊片',1,'admin','2016-05-23 17:42:11',NULL,NULL),
 ('113','OTHER','OTHER','左平衡氣缸無衝壓超上上限停機警告','',1,'admin','2016-05-23 17:41:24',NULL,NULL);

INSERT INTO `a_alarm_clear_file` (`file_id`,`file_name`,`file_desc`,`file_path`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('0000000001','模具.PNG','模具圖','/PLATFORM_MEDIA/alarm_clear_file/0000000001.PNG','admin','2016-05-23 18:37:32',NULL,NULL),
 ('0000000002','左後壁噸位值.PNG','左後壁噸位值','/PLATFORM_MEDIA/alarm_clear_file/0000000002.PNG','admin','2016-05-23 18:38:28',NULL,NULL),
 ('0000000003','左後壁噸位值_折線圖.PNG','左後壁噸位值_折線圖','/PLATFORM_MEDIA/alarm_clear_file/0000000003.PNG','admin','2016-05-23 18:38:52',NULL,NULL),
 ('0000000004','左後側噸位值.PNG','左後側噸位值','/PLATFORM_MEDIA/alarm_clear_file/0000000004.PNG','admin','2016-05-23 18:39:10',NULL,NULL),
 ('0000000005','功能設定.PNG','功能設定','/PLATFORM_MEDIA/alarm_clear_file/0000000005.PNG','admin','2016-05-23 18:39:26',NULL,NULL),
 ('0000000006','KV-AD40模組.PNG','KV-AD40模組','/PLATFORM_MEDIA/alarm_clear_file/0000000006.PNG','admin','2016-05-23 18:39:45',NULL,NULL),
 ('0000000007','keyence_AD40模組.PNG','keyence_AD40模組','/PLATFORM_MEDIA/alarm_clear_file/0000000007.PNG','admin','2016-05-23 18:40:01',NULL,NULL),
 ('0000000008','keyence_AD40.PNG','keyence_AD40','/PLATFORM_MEDIA/alarm_clear_file/0000000008.PNG','admin','2016-05-23 18:40:13',NULL,NULL),
 ('0000000009','模高.PNG','模高圖','/PLATFORM_MEDIA/alarm_clear_file/0000000009.PNG','admin','2016-05-23 18:40:48',NULL,NULL),
 ('0000000010','壓力值.PNG','壓力值','/PLATFORM_MEDIA/alarm_clear_file/0000000010.PNG','admin','2016-05-23 18:40:59',NULL,NULL),
 ('0000000011','Keyence AD40模組左平衡汽缸.PNG','Keyence AD40模組左平衡汽缸','/PLATFORM_MEDIA/alarm_clear_file/0000000011.PNG','admin','2016-05-23 18:51:36',NULL,NULL),
 ('0000000012','機台壓力閥位置.PNG','機台壓力閥位置','/PLATFORM_MEDIA/alarm_clear_file/0000000012.PNG','admin','2016-05-23 18:53:00',NULL,NULL),
 ('0000000013','機台壓力錶位置.PNG','機台壓力錶位置','/PLATFORM_MEDIA/alarm_clear_file/0000000013.PNG','admin','2016-05-23 18:53:12',NULL,NULL),
 ('0000000014','壓力閥.PNG','壓力閥','/PLATFORM_MEDIA/alarm_clear_file/0000000014.PNG','admin','2016-05-23 18:53:44',NULL,NULL),
 ('0000000015','左平衡壓力值.PNG','左平衡壓力值','/PLATFORM_MEDIA/alarm_clear_file/0000000015.PNG','admin','2016-05-23 19:15:13',NULL,NULL);
 
INSERT INTO `a_alarm_clear_step` (`step_id`,`alarm_id`,`cnc_id`,`machine_type_id`,`seq`,`type`,`step_desc`,`clear_desc`,`detect_rules`,`file_id_1`,`file_id_2`,`file_id_3`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('0000000001','1102','OTHER','OTHER',1,1,'模具上是否有多餘料件','將多餘料件移除',NULL,'0000000001',NULL,NULL,'admin','2016-05-23 18:41:53',NULL,NULL),
 ('0000000002','1102','OTHER','OTHER',2,1,'檢查平台左後側壁噸位上上限設定值在110(%)','重新設定正確上上限值',NULL,'0000000002','0000000003',NULL,'admin','2016-05-23 18:42:37',NULL,NULL),
 ('0000000003','1102','OTHER','OTHER',3,1,'檢查模高符合該模具高度','重新設定正確模高',NULL,'0000000005','0000000009',NULL,'admin','2016-05-23 18:43:15',NULL,NULL),
 ('0000000004','1102','OTHER','OTHER',4,1,'檢查平台壓力值與機台噸位值是否一致','校正平台噸位值與機台噸位值一致',NULL,'0000000004','0000000010',NULL,'admin','2016-05-23 18:43:57',NULL,NULL),
 ('0000000005','1102','OTHER','OTHER',5,1,'檢查keyence AD40模組亮紅燈(正常綠燈,異常紅燈)。(第一個KV-AD40模組)','更換左後側壁噸位值檢知',NULL,'0000000008','0000000007',NULL,'admin','2016-05-23 18:44:43',NULL,NULL),
 ('0000000006','1102','OTHER','OTHER',6,1,'檢查左後側壁噸位檢知於Keyence plc 檢知硬體迴路是否正常導通 (第一個KV-AD40模組, 第一腳位 C0 IO+)','更換左後側壁噸位線路',NULL,'0000000006',NULL,NULL,'admin','2016-05-23 18:45:14',NULL,NULL),
 ('0000000007','1102','OTHER','OTHER',7,1,'若以上方式皆無效,更換keyence AD40模組','聯絡協易服務人員',NULL,'0000000007',NULL,NULL,'admin','2016-05-23 18:45:41',NULL,NULL),
 ('0000000008','1102','OTHER','OTHER',8,1,'若更換模組也無效,聯絡服務人員','',NULL,NULL,NULL,NULL,'admin','2016-05-23 18:46:04',NULL,NULL),
 ('0000000009','113','OTHER','OTHER',1,1,'檢查壓力錶的左平衡氣缸壓力值是否大於平台設定值','更換壓力錶',NULL,'0000000013','0000000015',NULL,'admin','2016-05-23 19:20:21',NULL,NULL),
 ('0000000010','113','OTHER','OTHER',2,1,'檢查增壓閥是否作動','排除線圈信號短路或接錯IO',NULL,'0000000012','0000000014',NULL,'admin','2016-05-23 19:21:05',NULL,NULL),
 ('0000000011','113','OTHER','OTHER',3,1,'檢查增壓閥是否彈簧未復歸，導致持續增壓','更換增壓閥',NULL,'0000000012','0000000014',NULL,'admin','2016-05-23 19:21:57',NULL,NULL),
 ('0000000012','113','OTHER','OTHER',4,1,'檢查減壓閥是否沒有作動','排除線圈信號斷路或接錯IO',NULL,'0000000012','0000000014',NULL,'admin','2016-05-23 19:22:27',NULL,NULL),
 ('0000000013','113','OTHER','OTHER',5,1,'檢查Keyence AD40模組與左平衡氣缸檢知接線','排除檢知線斷路或接錯',NULL,'0000000011',NULL,NULL,'admin','2016-05-23 19:23:10',NULL,NULL),
 ('0000000014','113','OTHER','OTHER',6,1,'檢查左平衡氣缸檢知是否故障','更換左平衡氣缸檢知',NULL,'0000000006',NULL,NULL,'admin','2016-05-23 19:24:25',NULL,NULL),
 ('0000000015','113','OTHER','OTHER',7,1,'檢查Keyence AD40模組是否異常(正常綠燈,異常紅燈)','更換模組',NULL,'0000000007',NULL,NULL,'admin','2016-05-23 19:25:20',NULL,NULL),
 ('0000000016','113','OTHER','OTHER',8,1,'若更換模組也無效,聯絡服務人員','',NULL,NULL,NULL,NULL,'admin','2016-05-23 19:25:34',NULL,NULL);
 
INSERT INTO `m_machine_alarm` (`log_id`,`machine_id`,`alarm_id`,`cnc_id`,`machine_type_id`,`occur_time`,`occur_date`,`clear_status`,`clear_time`,`clear_date`,`result`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('0000000001','Machine01','1102','OTHER','OTHER','2016-05-23 18:56:46','2016-05-23',1,'2016-05-23 19:51:26','2016-05-23',NULL,'admin','2016-05-23 18:56:46','admin','2016-05-23 19:51:26'),
 ('0000000002','Machine01','1102','OTHER','OTHER','2016-05-23 19:51:43','2016-05-23',0,NULL,NULL,NULL,'admin','2016-05-23 19:51:43',NULL,NULL),
 ('0000000003','Machine01','113','OTHER','OTHER','2016-05-23 19:51:44','2016-05-23',0,NULL,NULL,NULL,'admin','2016-05-23 19:51:44',NULL,NULL),
 ('0000000004','Machine01','1102','OTHER','OTHER','2016-05-24 18:58:27','2016-05-24',1,'2016-05-24 18:58:42','2016-05-24',NULL,'admin','2016-05-24 18:58:27','admin','2016-05-24 18:58:42'),
 ('0000000005','Machine01','1102','OTHER','OTHER','2016-05-24 18:58:30','2016-05-24',0,NULL,NULL,NULL,'admin','2016-05-24 18:58:30',NULL,NULL),
 ('0000000006','Machine01','1102','OTHER','OTHER','2016-05-24 18:58:32','2016-05-24',1,'2016-05-24 18:58:55','2016-05-24',NULL,'admin','2016-05-24 18:58:32','admin','2016-05-24 18:58:55'),
 ('0000000007','Machine01','1102','OTHER','OTHER','2016-05-24 19:28:37','2016-05-24',0,NULL,NULL,NULL,'demo','2016-05-24 19:28:37',NULL,NULL),
 ('0000000008','Machine01','113','OTHER','OTHER','2016-05-24 19:28:39','2016-05-24',0,NULL,NULL,NULL,'demo','2016-05-24 19:28:39',NULL,NULL),
 ('0000000009','Machine01','1102','OTHER','OTHER','2016-05-24 19:28:42','2016-05-24',0,NULL,NULL,NULL,'demo','2016-05-24 19:28:42',NULL,NULL),
 ('0000000010','Machine01','113','OTHER','OTHER','2016-05-24 19:28:42','2016-05-24',0,NULL,NULL,NULL,'demo','2016-05-24 19:28:42',NULL,NULL),
 ('0000000011','Machine01','1102','OTHER','OTHER','2016-05-25 19:12:26','2016-05-25',0,NULL,NULL,NULL,'admin','2016-05-25 19:12:26',NULL,NULL),
 ('0000000012','Machine01','1102','OTHER','OTHER','2016-05-25 19:12:27','2016-05-25',1,'2016-05-25 19:13:15','2016-05-25',NULL,'admin','2016-05-25 19:12:27','admin','2016-05-25 19:13:15'),
 ('0000000013','Machine01','113','OTHER','OTHER','2016-05-25 19:12:29','2016-05-25',1,'2016-05-25 19:12:59','2016-05-25',NULL,'admin','2016-05-25 19:12:29','admin','2016-05-25 19:12:59'),
 ('0000000014','Machine01','113','OTHER','OTHER','2016-05-25 19:12:29','2016-05-25',1,'2016-05-25 19:12:40','2016-05-25',NULL,'admin','2016-05-25 19:12:29','admin','2016-05-25 19:12:40');
 
INSERT INTO `a_alarm_clear_log` (`clear_log_id`,`alarm_log_id`,`step_id`,`result`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 (1,'0000000001','0000000001','Y','admin','2016-05-23 19:51:19',NULL,NULL),
 (2,'0000000001','0000000002','Y','admin','2016-05-23 19:51:22',NULL,NULL),
 (3,'0000000001','0000000003','N','admin','2016-05-23 19:51:23',NULL,NULL),
 (4,'0000000004','0000000001','Y','admin','2016-05-24 18:58:38',NULL,NULL),
 (5,'0000000004','0000000002','Y','admin','2016-05-24 18:58:39',NULL,NULL),
 (6,'0000000004','0000000003','N','admin','2016-05-24 18:58:40',NULL,NULL),
 (7,'0000000006','0000000001','Y','admin','2016-05-24 18:58:54',NULL,NULL),
 (8,'0000000006','0000000002','N','admin','2016-05-24 18:58:54',NULL,NULL),
 (9,'0000000001','0000000001','Y','demo','2016-05-24 19:27:33',NULL,NULL),
 (10,'0000000001','0000000002','Y','demo','2016-05-24 19:27:34',NULL,NULL),
 (11,'0000000014','0000000009','Y','admin','2016-05-25 19:12:38',NULL,NULL),
 (12,'0000000014','0000000010','N','admin','2016-05-25 19:12:39',NULL,NULL),
 (13,'0000000013','0000000009','Y','admin','2016-05-25 19:12:55',NULL,NULL),
 (14,'0000000013','0000000010','Y','admin','2016-05-25 19:12:57',NULL,NULL),
 (15,'0000000013','0000000011','N','admin','2016-05-25 19:12:58',NULL,NULL),
 (16,'0000000012','0000000001','Y','admin','2016-05-25 19:13:11',NULL,NULL),
 (17,'0000000012','0000000002','N','admin','2016-05-25 19:13:13',NULL,NULL);