--
-- Table structure for table `a_huangliang_downtime_code`
--
-- init downtime code value
INSERT INTO `a_huangliang_downtime_code` (`downtime_code`,`downtime_code_name`,`description`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES
 ('100','量產中',NULL,'admin',NOW(),NULL,NULL),
 ('101','故障待修',NULL,'admin',NOW(),NULL,NULL),
 ('102','機台預備(週一)',NULL,'admin',NOW(),NULL,NULL),
 ('103','待機中',NULL,'admin',NOW(),NULL,NULL),
 ('104','待料中',NULL,'admin',NOW(),NULL,NULL),
 ('105','洗夾頭',NULL,'admin',NOW(),NULL,NULL),
 ('106','離線時間',NULL,'admin',NOW(),NULL,NULL),
 ('110','休假待機',NULL,'admin',NOW(),NULL,NULL),

 ('200','維修中',NULL,'admin',NOW(),NULL,NULL),
 ('201','待刀具',NULL,'admin',NOW(),NULL,NULL),
 ('202','夾治具問題',NULL,'admin',NOW(),NULL,NULL),
 ('203','更換刀具',NULL,'admin',NOW(),NULL,NULL),
 ('204','待首件檢查',NULL,'admin',NOW(),NULL,NULL),
 ('205','刀具研磨',NULL,'admin',NOW(),NULL,NULL),
 ('206','待機械商維修',NULL,'admin',NOW(),NULL,NULL),
 ('207','夾治具問題、更換刀具、刀具研磨',NULL,'admin',NOW(),NULL,NULL),
 ('208','夾治具問題、更換刀具',NULL,'admin',NOW(),NULL,NULL),
 ('209','夾治具問題、刀具研磨',NULL,'admin',NOW(),NULL,NULL),
 ('210','更換刀具、刀具研磨',NULL,'admin',NOW(),NULL,NULL),
 ('211','修改程式',NULL,'admin',NOW(),NULL,NULL),
 ('212','補正尺寸',NULL,'admin',NOW(),NULL,NULL),
 ('213','料機故障排除',NULL,'admin',NOW(),NULL,NULL),
 ('214','設備故障排除',NULL,'admin',NOW(),NULL,NULL),
 ('215','暫停',NULL,'admin',NOW(),NULL,NULL),
 ('216','離線時間',NULL,'admin',NOW(),NULL,NULL),
 
 ('300','改車中',NULL,'admin',NOW(),NULL,NULL),
 ('301','待首件檢查',NULL,'admin',NOW(),NULL,NULL),
 ('302','機台清洗',NULL,'admin',NOW(),NULL,NULL),
 ('303','待廠商測試',NULL,'admin',NOW(),NULL,NULL),
 ('304','支援維修  ',NULL,'admin',NOW(),NULL,NULL),
 ('305','暫停',NULL,'admin',NOW(),NULL,NULL),
 ('306','離線時間',NULL,'admin',NOW(),NULL,NULL);