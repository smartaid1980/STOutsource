INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('30_manage_unit_type','Management','i18n_ServCloud_Manage_Unit_Type','null'),
 ('31_manage_unit_param','Management','i18n_ServCloud_Manage_Unit_Param','null');

 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_super_admin_auth','30_manage_unit_type','Management',NOW(),'admin',NULL,NULL),
 ('sys_super_admin_auth','31_manage_unit_param','Management',NOW(),'admin',NULL,NULL),
 ('sys_product_servunit','30_manage_unit_type','Management',NOW(),'admin',NULL,NULL),
 ('sys_product_servunit','31_manage_unit_param','Management',NOW(),'admin',NULL,NULL);

 DROP TABLE IF EXISTS `m_unit_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_unit_type` (
  `type_id` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '機種編號',
  `type_name` VARCHAR(45) NOT NULL DEFAULT '' COMMENT '機種名稱',
  `create_by` VARCHAR(45) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` DATETIME COMMENT '建立時間',
  `modify_by` VARCHAR(45) NOT NULL DEFAULT '' COMMENT '修改者',
  `modify_time` DATETIME COMMENT '修改時間',
  PRIMARY KEY(`type_id`)
) ENGINE = InnoDB  DEFAULT CHARSET=utf8 COMMENT = 'ServUnit 機台種類主表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_unit_param`
--
DROP TABLE IF EXISTS `m_unit_param`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE  `m_unit_param` (
  `param_id` varchar(45) NOT NULL DEFAULT '' COMMENT '參數編號',
  `param_name` varchar(45) NOT NULL DEFAULT '' COMMENT '參數名稱',
  `type` varchar(45) NOT NULL DEFAULT '' COMMENT '機台種類(沖床1...)',
  `sequence` int(10) unsigned NOT NULL DEFAULT '1' COMMENT '排序(由小到大)',
  `comment` varchar(45) DEFAULT NULL COMMENT '說明',
  `is_open` varchar(1) NOT NULL DEFAULT 'Y' COMMENT '是否啟用',
  `icon` varchar(45) NOT NULL DEFAULT 'fa-gear' COMMENT 'icon',
  `icon_bgc` varchar(45) NOT NULL DEFAULT 'blue' COMMENT 'icon背景顏色',
  `max` float COMMENT '上限',
  `min` float COMMENT '下限',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '修改者',
  `modify_time` datetime COMMENT '修改時間',
  PRIMARY KEY (`param_id`,`type`),
  KEY `FK_m_unit_param_type` (`type`),
  CONSTRAINT `FK_m_unit_param_type` FOREIGN KEY (`type`) REFERENCES `m_unit_type` (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='ServUnit 參數設定';

--  disable FK cnc_id, 放全部廠牌的AlarmCode

insert into m_unit_type (type_id, type_name, create_by, create_time, modify_by, modify_time) values 
('punch0001', '沖壓機0001', 'admin', NOW(), 'admin', NOW()),
('punch0002', '沖壓機0002', 'admin', NOW(), 'admin', NOW());

insert into m_unit_param (param_id, type, param_name, sequence, comment, is_open, icon, icon_bgc, max, min, create_by, create_time, modify_by, modify_time) values 
('timestamp', 'punch0001', '資料更新時間', 1, '資料更新時間', 'Y', 'fa-clock-o', 'blue', null, null, 'admin', NOW(), 'admin', NOW()),
('status', 'punch0001', '沖壓機運行狀態', 1, '加工/閒置', 'Y', 'fa-gear', 'servkit.getMachineLightColor(value)', null, null, 'admin', NOW(), 'admin', NOW()),
('working_time', 'punch0001', '沖壓機今日作業時間 (ms)', 1, '自 00:00:00 起運行狀態為加工之累積時間', 'Y', 'fa-clock-o', 'blue', null, null, 'admin', NOW(), 'admin', NOW()),
('temperature_probe', 'punch0001', '曲軸溫度', 1, '曲軸溫度', 'Y', 'fa-fire', 'orange', 21, 20, 'admin', NOW(), 'admin', NOW()),
('current', 'punch0001', '沖壓機運行電流', 1, '沖壓機運行電流', 'Y', 'fa-flash', 'orange', 21, 20, 'admin', NOW(), 'admin', NOW()),
('light1_on_times', 'punch0001', '沖壓次數', 1, '沖壓次數', 'Y', 'fa-download', 'green', 21, 20, 'admin', NOW(), 'admin', NOW()),
('light2', 'punch0001', '防護罩是否被打開', 1, '防護罩是否被打開', 'Y', 'fa-check', 'purple', null, null, 'admin', NOW(), 'admin', NOW()),
('light2_last_on', 'punch0001', '皮帶最近檢查時刻', 1, '防護罩最近一次被打開的時間', 'Y', 'fa-clock-o', 'blue', null, null, 'admin', NOW(), 'admin', NOW()),
('light3', 'punch0001', '潤滑油蓋是否被打開', 1, '潤滑油蓋是否被打開', 'Y', 'fa-check', 'purple', null, null, 'admin', NOW(), 'admin', NOW()),
('light3_last_on', 'punch0001', '潤滑油最近檢查時刻', 1, '潤滑油最近一次被打開的時間', 'Y', 'fa-clock-o', 'blue', null, null, 'admin', NOW(), 'admin', NOW()),
('timestamp', 'punch0002', '資料更新時間', 1, '資料更新時間', 'Y', 'fa-gear', 'blue', null, null, 'admin', NOW(), 'admin', NOW()),
('status', 'punch0002', '沖壓機運行狀態', 1, '加工/閒置', 'Y', 'fa-gear', 'servkit.getMachineLightColor(value)', null, null, 'admin', NOW(), 'admin', NOW()),
('working_time', 'punch0002', '沖壓機今日作業時間 (ms)', 1, '自 00:00:00 起運行狀態為加工之累積時間', 'Y', 'fa-gear', 'blue', null, null, 'admin', NOW(), 'admin', NOW()),
('temperature_probe', 'punch0002', '曲軸溫度', 1, '曲軸溫度', 'Y', 'fa-fire', 'orange', 21, 20, 'admin', NOW(), 'admin', NOW()),
('current', 'punch0002', '沖壓機運行電流', 1, '沖壓機運行電流', 'Y', 'fa-gear', 'orange', 21, 20, 'admin', NOW(), 'admin', NOW()),
('light1_on_times', 'punch0002', '沖壓次數', 1, '沖壓次數', 'Y', 'fa-gear', 'green', 21, 20, 'admin', NOW(), 'admin', NOW()),
('light2', 'punch0002', '防護罩是否被打開', 1, '防護罩是否被打開', 'Y', 'fa-gear', 'purple', null, null, 'admin', NOW(), 'admin', NOW()),
('light2_last_on', 'punch0002', '皮帶最近檢查時刻', 1, '防護罩最近一次被打開的時間', 'Y', 'fa-gear', 'blue', null, null, 'admin', NOW(), 'admin', NOW()),
('light3', 'punch0002', '潤滑油蓋是否被打開', 1, '潤滑油蓋是否被打開', 'Y', 'fa-gear', 'purple', null, null, 'admin', NOW(), 'admin', NOW()),
('light3_last_on', 'punch0002', '潤滑油最近檢查時刻', 1, '潤滑油最近一次被打開的時間', 'Y', 'fa-gear', 'blue', null, null, 'admin', NOW(), 'admin', NOW());