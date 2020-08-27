
DROP TABLE IF EXISTS `a_huangliang_mat_length`;
CREATE TABLE `a_huangliang_mat_length` (
  `mat_length` varchar(20) NOT NULL,
  `is_open` VARCHAR(1) NOT NULL,
  `create_by` VARCHAR(50) NOT NULL,
  `create_time` DATETIME NOT NULL,
  `modify_by` VARCHAR(50) NOT NULL,
  `modify_time` DATETIME NOT NULL,
  PRIMARY KEY(`mat_length`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_huangliang_mat_profile`;
CREATE TABLE `a_huangliang_mat_profile` (
  `mat_id` varchar(20) NOT NULL,
  `mat_type` varchar(20) NOT NULL,
  `mat_color` varchar(20),
  `mat_sg` DECIMAL(12,10),
  `is_open` VARCHAR(1) NOT NULL,
  `create_by` VARCHAR(50) NOT NULL,
  `create_time` DATETIME NOT NULL,
  `modify_by` VARCHAR(50) NOT NULL,
  `modify_time` DATETIME NOT NULL,
  PRIMARY KEY(`mat_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_huangliang_mat_location`;
CREATE TABLE `a_huangliang_mat_location` (
  `area` varchar(20) NOT NULL,
  `location` varchar(20) NOT NULL,
  `mat_id` varchar(20) NOT NULL,
  `is_open` VARCHAR(1) NOT NULL,
  `create_by` VARCHAR(50) NOT NULL,
  `create_time` DATETIME NOT NULL,
  `modify_by` VARCHAR(50) NOT NULL,
  `modify_time` DATETIME NOT NULL,
  PRIMARY KEY(`area`,`location`),
  CONSTRAINT `FK_a_huangliang_mat_location_1` FOREIGN KEY (`mat_id`) REFERENCES `a_huangliang_mat_profile` (`mat_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_huangliang_supplier`;
CREATE TABLE `a_huangliang_supplier` (
  `sup_id` VARCHAR(20) NOT NULL,
  `sup_name` VARCHAR(50) NOT NULL,
  `create_by` VARCHAR(50) NOT NULL,
  `create_time` DATETIME NOT NULL,
  `modify_by` VARCHAR(50) NOT NULL,
  `modify_time` DATETIME NOT NULL,
  PRIMARY KEY(`sup_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_huangliang_po_file`;
CREATE TABLE `a_huangliang_po_file` (
  `mstock_name` VARCHAR(20) NOT NULL,
  `po_no` VARCHAR(50) NOT NULL,
  `sup_id` VARCHAR(20) NOT NULL,
  `sup_name` VARCHAR(50) NOT NULL,
  `mat_name` VARCHAR(50) NOT NULL,
  `mat_code` VARCHAR(40) NOT NULL,
  `po_qty` DECIMAL(8,2) NOT NULL,
  `unit` VARCHAR(10) NOT NULL,
  `po_time` DATETIME NOT NULL,
  `shelf_qty` DECIMAL(8,2) NOT NULL,
  `create_by` VARCHAR(50) NOT NULL,
  `create_time` DATETIME NOT NULL,
  `modify_by` VARCHAR(50) NOT NULL,
  `modify_time` DATETIME NOT NULL,
  PRIMARY KEY(`mstock_name`,`po_no`,`sup_id`,`mat_code`),
  CONSTRAINT `FK_a_huangliang_po_file_1` FOREIGN KEY (`sup_id`) REFERENCES `a_huangliang_supplier` (`sup_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_huangliang_po_temp_stock`;
CREATE TABLE `a_huangliang_po_temp_stock` (
  `mstock_name` VARCHAR(20) NOT NULL,
  `po_no` VARCHAR(50) NOT NULL,
  `sup_id` VARCHAR(20) NOT NULL,
  `mat_code` VARCHAR(50) NOT NULL,
  `po_qty` DECIMAL(8,2) NOT NULL,
  `unit` VARCHAR(10) NOT NULL,
  `mat_id` VARCHAR(20),
  `mat_length` VARCHAR(20),
  `mat_od` VARCHAR(10),
  `mat_color` VARCHAR(10),
  `shelf_piece` INTEGER,
  `shelf_qty` DECIMAL(8,2),
  `area` varchar(20) NOT NULL,
  `location` VARCHAR(20) NOT NULL,
  `shelf_time` DATETIME NOT NULL,
  `shelf_by` VARCHAR(50),
  `iqc_result` VARCHAR(10),
  `iqc_mat_id` VARCHAR(10),
  `iqc_od` VARCHAR(10),
  `iqc_length` VARCHAR(10),
  `iqc_location` VARCHAR(10),
  `iqc_qty` VARCHAR(10),
  `iqc_quality` VARCHAR(10),
  `iqc_ng_reason` VARCHAR(60),
  `iqc_time` DATETIME,
  `iqc_by` VARCHAR(50),
  `return_qty` DECIMAL(8,2),
  `return_time` DATETIME,
  `return_by` VARCHAR(50),
  `mstock_qty` DECIMAL(8,2),
  `mstock_time` DATETIME,
  `mstock_by` VARCHAR(50),
  `status` VARCHAR(1) NOT NULL,
  `shelf_pm_notice` VARCHAR(1) NOT NULL DEFAULT 'N',
  `shelf_qc_notice` VARCHAR(1) NOT NULL DEFAULT 'N',
  `iqc_delay_notice` VARCHAR(1) NOT NULL DEFAULT 'N',
  `iqc_ok_notice` VARCHAR(1) NOT NULL DEFAULT 'N',
  `iqc_ng_notice` VARCHAR(1) NOT NULL DEFAULT 'N',
  `return_notice` VARCHAR(1) NOT NULL DEFAULT 'N',
  PRIMARY KEY(`mstock_name`,`po_no`,`sup_id`,`mat_code`,`location`,`shelf_time`),
  CONSTRAINT `FK_a_huangliang_po_temp_stock_1` FOREIGN KEY (`mat_id`) REFERENCES `a_huangliang_mat_profile` (`mat_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_a_huangliang_po_temp_stock_2` FOREIGN KEY (`mstock_name`, `po_no`, `sup_id`, `mat_code`) REFERENCES `a_huangliang_po_file` (`mstock_name`, `po_no`, `sup_id`, `mat_code`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_a_huangliang_po_temp_stock_3` FOREIGN KEY (`area`, `location`) REFERENCES `a_huangliang_mat_location` (`area`, `location`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_huangliang_mat_stock`;
CREATE TABLE `a_huangliang_mat_stock` (
  `mstock_name` VARCHAR(20) NOT NULL,
  `po_no` VARCHAR(50) NOT NULL,
  `sup_id` VARCHAR(20) NOT NULL,
  `mat_code` VARCHAR(50) NOT NULL,
  `mat_id` VARCHAR(20) NOT NULL,
  `mat_length` VARCHAR(20) NOT NULL,
  `mat_od` VARCHAR(10) NOT NULL,
  `mat_color` VARCHAR(10) NOT NULL,
  `area` varchar(20) NOT NULL,
  `location` VARCHAR(20) NOT NULL,
  `mstock_qty` DECIMAL(8,2) NOT NULL,
  `unit` VARCHAR(10) NOT NULL,
  `shelf_time` DATETIME NOT NULL,
  `mstock_time` DATETIME NOT NULL,
  `create_by` VARCHAR(50) NOT NULL,
  `create_time` DATETIME NOT NULL,
  `modify_by` VARCHAR(50) NOT NULL,
  `modify_time` DATETIME NOT NULL,

  PRIMARY KEY(`mstock_name`,`po_no`,`sup_id`,`mat_code`,`location`,`shelf_time`),
  CONSTRAINT `FK_a_huangliang_mat_stock_1` FOREIGN KEY (`mstock_name`, `po_no`, `sup_id`, `mat_code`) REFERENCES `a_huangliang_po_file` (`mstock_name`, `po_no`, `sup_id`, `mat_code`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_a_huangliang_mat_stock_2` FOREIGN KEY (`mat_id`) REFERENCES `a_huangliang_mat_profile` (`mat_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_a_huangliang_mat_stock_3` FOREIGN KEY (`area`, `location`) REFERENCES `a_huangliang_mat_location` (`area`, `location`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_huangliang_mat_stock_chg_log`;
CREATE TABLE `a_huangliang_mat_stock_chg_log` (
  `mstock_name` VARCHAR(20) NOT NULL,
  `po_no` VARCHAR(50) NOT NULL,
  `sup_id` VARCHAR(20) NOT NULL,
  `mat_code` VARCHAR(50) NOT NULL,
  `shelf_time` DATETIME NOT NULL,
  `location` VARCHAR(20) NOT NULL,
  `chg_type` VARCHAR(1) NOT NULL,
  `orig_qty` DECIMAL(8,2),
  `chg_qty` DECIMAL(8,2),
  `chg_reason` VARCHAR(50) NOT NULL,
  `chg_time` DATETIME NOT NULL,
  `chg_by` VARCHAR(50) NOT NULL,
  `orig_location` VARCHAR(20),
  `chg_location` VARCHAR(20),

  PRIMARY KEY(`mstock_name`,`po_no`,`sup_id`,`mat_code`,`shelf_time`,`chg_time`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;


INSERT INTO `a_huangliang_mat_profile` (`mat_id`,`mat_type`,`mat_color`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES
 ('通用','N/A','N/A','Y','admin',NOW(),'admin',NOW());
 
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('06_material_property','HuangLiangMapManagement','材料屬性選單設定','none'),
 ('07_material_profile','HuangLiangMapManagement','材料設定','none'),
 ('08_material_location','HuangLiangMapManagement','材料庫位置設定','none');

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_manager_auth','06_material_property','HuangLiangMapManagement',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','07_material_profile','HuangLiangMapManagement',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','08_material_location','HuangLiangMapManagement',NOW(),'admin',NULL,NULL);

-- HuangLiangMaterialTempStock
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('HuangLiangMaterialTempStock','材料暫入模組',1,'Material Temperary Stock','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_pending_iqc','HuangLiangMaterialTempStock','待驗料紀錄查詢','none'),
 ('20_pending_stock','HuangLiangMaterialTempStock','待審入庫材料查詢','none'),
 ('30_pending_return','HuangLiangMaterialTempStock','待退材料查詢','none'),
 ('40_return_record','HuangLiangMaterialTempStock','退料記錄查詢','none'),
 ('50_stock_record','HuangLiangMaterialTempStock','材料入庫紀錄查詢','none'),
 ('60_material_stock','HuangLiangMaterialTempStock','材料庫存查詢','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('HuangLiangMaterialTempStock','20140918000002',NOW(),'admin');
 
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_manager_auth','10_pending_iqc','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','20_pending_stock','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','30_pending_return','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','40_return_record','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','50_stock_record','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','60_material_stock','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL);


--測試資料
--mrp匯入
INSERT INTO `a_huangliang_po_file` (`mstock_name`, `po_no`, `sup_id`, `sup_name`, `mat_name`, `mat_code`, `po_qty`, `unit`, `po_time`, `shelf_qty`, `create_by`, `create_time`, `modify_by`, `modify_time`) VALUES 
  ('五金','2018102901','181001','一','品名','M-1144-C.06.0',50,'KG','2018/10/29 12:00:00',0,'admin','2018/10/29 12:00:00','admin','2018/10/29 12:00:00'),
  ('五金','2018102902','181002','二','品名','M-C3602-C.06.0',50,'KG','2018/10/29 12:00:00',0,'admin','2018/10/29 12:00:00','admin','2018/10/29 12:00:00'),
  ('五金','2018102903','181001','一','品名','M-C3602-C.08.0',50,'KG','2018/10/29 12:00:00',0,'admin','2018/10/29 12:00:00','admin','2018/10/29 12:00:00'),
  ('五金','2018102904','181001','一','品名','M-1144-C.10.0',50,'KG','2018/10/29 12:00:00',0,'admin','2018/10/29 12:00:00','admin','2018/10/29 12:00:00'),
  ('五金','2018102905','181002','二','品名','M-1144-C.09.0',30,'KG','2018/10/29 12:00:00',0,'admin','2018/10/29 12:00:00','admin','2018/10/29 12:00:00'),
  ('五金','2018102906','181003','三','品名','M-A6061T6-C.06.0',30,'KG','2018/10/29 12:00:00',0,'admin','2018/10/29 12:00:00','admin','2018/10/29 12:00:00'),
  ('GOLF','2018102907','181002','二','品名','M-1144-C.06.0',30,'KG','2018/10/29 12:00:00',0,'admin','2018/10/29 12:00:00','admin','2018/10/29 12:00:00'),
  ('GOLF','2018102908','181004','四','品名','M-C3602-C.15.0',20,'KG','2018/10/29 12:00:00',0,'admin','2018/10/29 12:00:00','admin','2018/10/29 12:00:00'),
  ('GOLF','2018102909','181004','四','品名','M-C3602-C.11.0',20,'KG','2018/10/29 12:00:00',0,'admin','2018/10/29 12:00:00','admin','2018/10/29 12:00:00'),
  ('GOLF','2018102910','181001','一','品名','M-1144-C.06.0',20,'KG','2018/10/29 12:00:00',0,'admin','2018/10/29 12:00:00','admin','2018/10/29 12:00:00'),
  ('GOLF','2018102911','181001','一','品名','M-1144-C.08.0',60,'KG','2018/10/29 12:00:00',0,'admin','2018/10/29 12:00:00','admin','2018/10/29 12:00:00'),
  ('GOLF','2018102912','181001','一','品名','M-A6061T6-C.06.0',60,'KG','2018/10/29 12:00:00',0,'admin','2018/10/29 12:00:00','admin','2018/10/29 12:00:00');
--材料暫入
INSERT INTO `a_huangliang_po_temp_stock` (`mstock_name`, `po_no`, `sup_id`, `mat_code`, `po_qty`, `unit`, `mat_id`, `mat_length`, `mat_od`, `mat_color`, `shelf_qty`, `area`, `location`, `shelf_time`, `shelf_by`, `status`) VALUES
  ('五金','2018102901','181001','M-1144-C.06.0',50,'KG','1144','1.5m','C.06.0','黃',30,'1A','A1','2018/10/29 18:00:00','9527','1'),
  ('五金','2018102902','181002','M-C3602-C.06.0',50,'KG','C3602','2m','C.06.0','綠',30,'1A','A3','2018/10/29 18:00:00','9527','1'),
  ('GOLF','2018102907','181002','M-1144-C.06.0',30,'KG','1144','1.5m','C.06.0','黃',20,'1A','A1','2018/10/29 18:00:00','9527','1'),
  ('GOLF','2018102908','181004','M-C3602-C.15.0',20,'KG','C3602','2m','C.15.0','綠',20,'1A','A3','2018/10/29 18:00:00','9527','1'),
  ('五金','2018102901','181001','M-1144-C.06.0',50,'KG','1144','1.5m','C.06.0','黃',20,'1A','A1','2018/10/31 18:00:00','8081','1'),
  ('五金','2018102902','181002','M-C3602-C.06.0',50,'KG','C3602','2m','C.06.0','綠',20,'1A','A3','2018/10/31 18:00:00','8081','1'),
  ('GOLF','2018102907','181002','M-1144-C.06.0',30,'KG','1144','1.5m','C.06.0','黃',10,'1A','A1','2018/10/31 18:00:00','8081','1'),
  ('五金','2018102903','181001','M-C3602-C.08.0',50,'KG','C3602','1.5m','C.08.0','綠',40,'1A','A3','2018/10/29 18:00:00','7096','1'),
  ('五金','2018102904','181001','M-1144-C.10.0',50,'KG','1144','1.5m','C.10.0','黃',30,'1A','A1','2018/10/29 18:00:00','7096','1'),
  ('五金','2018102905','181002','M-1144-C.09.0',30,'KG','1144','1.5m','C.09.0','黃',30,'1A','A1','2018/10/29 18:00:00','7096','1'),
  ('五金','2018102906','181003','M-A6061T6-C.06.0',30,'KG','A6061T6','1.5m','C.06.0','藍',30,'1A','A4','2018/10/29 18:00:00','7096','1'),
  ('五金','2018102903','181001','M-C3602-C.08.0',50,'KG','C3602','1.5m','C.08.0','綠',10,'1A','A3','2018/10/30 18:00:00','9527','1'),
  ('五金','2018102904','181001','M-1144-C.10.0',50,'KG','1144','1.5m','C.10.0','黃',20,'1A','A1','2018/10/30 18:00:00','9527','1'),
--驗料
UPDATE `a_huangliang_po_temp_stock` SET 
  `iqc_result` = 'NG',
  `iqc_mat_id` = 'OK',
  `iqc_od` = 'OK',
  `iqc_length` = 'OK',
  `iqc_location` = 'OK',
  `iqc_qty` = 'OK',
  `iqc_quality` = 'NG',
  `iqc_ng_reason` = '品質不好',
  `iqc_time` = '2018/10/31 19:00:00',
  `iqc_by` = '3010',
  `status` = '2'
 WHERE 
  `mstock_name` = '五金' AND
  `po_no` = '2018102902' AND
  `sup_id` = '181002' AND
  `mat_code` = 'M-C3602-C.06.0' AND
  `location` = 'A3' AND
  `shelf_time` = '2018/10/31 18:00:00';

UPDATE `a_huangliang_po_temp_stock` SET 
  `iqc_result` = 'NG',
  `iqc_mat_id` = 'OK',
  `iqc_od` = 'OK',
  `iqc_length` = 'NG',
  `iqc_location` = 'OK',
  `iqc_qty` = 'OK',
  `iqc_quality` = 'OK',
  `iqc_ng_reason` = '長度太短',
  `iqc_time` = '2018/10/31 19:30:00',
  `iqc_by` = '3010',
  `status` = '2'
 WHERE 
  `mstock_name` = 'GOLF' AND
  `po_no` = '2018102907' AND
  `sup_id` = '181002' AND
  `mat_code` = 'M-1144-C.06.0' AND
  `location` = 'A1' AND
  `shelf_time` = '2018/10/31 18:00:00';

UPDATE `a_huangliang_po_temp_stock` SET 
  `iqc_result` = 'OK',
  `iqc_mat_id` = 'OK',
  `iqc_od` = 'OK',
  `iqc_length` = 'OK',
  `iqc_location` = 'OK',
  `iqc_qty` = 'OK',
  `iqc_quality` = 'OK',
  `iqc_ng_reason` = '---',
  `iqc_time` = '2018/10/31 20:00:00',
  `iqc_by` = '3010',
  `status` = '2'
 WHERE 
  `mstock_name` = '五金' AND
  `po_no` = '2018102903' AND
  `sup_id` = '181001' AND
  `mat_code` = 'M-C3602-C.08.0' AND
  `location` = 'A3' AND
  `shelf_time` = '2018/10/29 18:00:00';

UPDATE `a_huangliang_po_temp_stock` SET 
  `iqc_result` = 'OK',
  `iqc_mat_id` = 'OK',
  `iqc_od` = 'OK',
  `iqc_length` = 'OK',
  `iqc_location` = 'OK',
  `iqc_qty` = 'OK',
  `iqc_quality` = 'OK',
  `iqc_ng_reason` = '---',
  `iqc_time` = '2018/10/31 20:00:00',
  `iqc_by` = '3010',
  `status` = '2'
 WHERE 
  `mstock_name` = 'GOLF' AND
  `po_no` = '2018102907' AND
  `sup_id` = '181002' AND
  `mat_code` = 'M-1144-C.06.0' AND
  `location` = 'A1' AND
  `shelf_time` = '2018/10/29 18:00:00';
--入庫
UPDATE `a_huangliang_po_temp_stock` SET 
  `mstock_qty` = 40,
  `mstock_by` = 'huangliang',
  `mstock_time` = '2018/10/31 17:04:44',
  `status` = '4'
 WHERE 
  `mstock_name` = '五金' AND
  `po_no` = '2018102903' AND
  `sup_id` = '181001' AND
  `mat_code` = 'M-C3602-C.08.0' AND
  `location` = 'A3' AND
  `shelf_time` = '2018/10/29 18:00:00';
  
CREATE VIEW a_huangliang_view_po_temp_stock_po_file AS 
SELECT a.*, b.mat_name 
FROM a_huangliang_po_temp_stock AS a 
LEFT JOIN a_huangliang_po_file AS b 
ON a.mstock_name = b.mstock_name 
AND a.po_no = b.po_no 
AND a.sup_id = b.sup_id 
AND a.mat_code = b.mat_code;


INSERT INTO `a_huangliang_po_temp_stock` (`mstock_name`, `po_no`, `sup_id`, `mat_code`, `po_qty`, `unit`, `mat_id`, `mat_length`, `mat_od`, `mat_color`, `shelf_qty`, `area`, `location`, `shelf_time`, `shelf_by`, `status`) VALUES
  ('GOLF','181002001P','D201-2','M-SUS303-C-17.0',63.40,'KG','SUS303','1.5m','C.17.0','黑',30.00,'1A','A009',NOW(),'huangliang','1');
UPDATE `a_huangliang_po_temp_stock` SET 
  `iqc_result` = 'NG',
  `iqc_mat_id` = 'OK',
  `iqc_od` = 'OK',
  `iqc_length` = 'OK',
  `iqc_location` = 'OK',
  `iqc_qty` = 'OK',
  `iqc_quality` = 'NG',
  `iqc_ng_reason` = '品質不好',
  `iqc_time` = NOW(),
  `iqc_by` = 'huangliang',
  `status` = '2'
 WHERE 
  `mstock_name` = 'GOLF' AND
  `po_no` = '181002001P' AND
  `sup_id` = 'D201-2' AND
  `mat_code` = 'M-SUS303-C-17.0' AND
  `location` = 'A009' AND
  `shelf_time` = '2018/11/07 16:51:01';
2018/10/30 18:00:00	五金	2018102904	181001	M-1144-C.10.0	C.10.0	1.5m	黃	A1	20	9527
INSERT INTO `a_huangliang_po_temp_stock` (`mstock_name`, `po_no`, `sup_id`, `mat_code`, `po_qty`, `unit`, `mat_id`, `mat_length`, `mat_od`, `mat_color`, `shelf_qty`, `area`, `location`, `shelf_time`, `shelf_by`, `status`) VALUES
  ('五金','2018102904','181001','M-1144-C.10.0',50,'KG','1144','1.5m','C.10.0','黃',20.00,'1A','A1',NOW(),'huangliang','1');
  181001007P po_no
D615  sup_id
M-A6061T6-C-33.0 mat_code
  UPDATE `a_huangliang_po_temp_stock` SET 
  `iqc_result` = 'NG',
  `iqc_mat_id` = 'OK',
  `iqc_od` = 'OK',
  `iqc_length` = 'OK',
  `iqc_location` = 'OK',
  `iqc_qty` = 'OK',
  `iqc_quality` = 'NG',
  `iqc_ng_reason` = '品質不好',
  `iqc_time` = NOW(),
  `iqc_by` = 'huangliang',
  `status` = '2'
 WHERE 
  `mstock_name` = '五金' AND
  `po_no` = '2018102904' AND
  `sup_id` = '181001' AND
  `mat_code` = 'M-1144-C-10.0' AND
  `location` = 'A1' AND
  `shelf_time` = '2018/10/30 18:00:00';


INSERT INTO `a_huangliang_mat_location` ( `area`,`location`,`mat_id`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES
("1A","A001","A6061T6","Y","huangliang","2018-11-07 16:04:43","huangliang","2018-11-07 16:04:43"),
("1A","A002","A6061T6","Y","huangliang","2018-11-07 16:04:43","huangliang","2018-11-07 16:04:43"),
("1A","A003","A6061T6","Y","huangliang","2018-11-07 16:04:43","huangliang","2018-11-07 16:04:43"),
("1A","A004","A6061T6","Y","huangliang","2018-11-07 16:04:43","huangliang","2018-11-07 16:04:43"),
("1A","A005","A6061T6","Y","huangliang","2018-11-07 16:04:43","huangliang","2018-11-07 16:04:43"),
("1A","A006","A6061T6","Y","huangliang","2018-11-07 16:04:43","huangliang","2018-11-07 16:04:43"),
("1A","A007","A6061T6","Y","huangliang","2018-11-07 16:04:43","huangliang","2018-11-07 16:04:43"),
("1A","A008","A6061T6","Y","huangliang","2018-11-07 16:04:43","huangliang","2018-11-07 16:04:43"),
("1A","A009","SUS303","Y","huangliang","2018-11-07 16:36:30","huangliang","2018-11-07 16:36:30"),
("1A","A010","通用","Y","huangliang","2018-11-08 11:29:03","huangliang","2018-11-08 11:29:03");

INSERT INTO `a_huangliang_po_temp_stock` ( `mstock_name`,`po_no`,`sup_id`,`mat_code`,`po_qty`,`unit`,`mat_id`,`mat_length`,`mat_od`,`mat_color`,`shelf_qty`,`area`,`location`,`shelf_time`,`shelf_by`,`iqc_result`,`iqc_mat_id`,`iqc_od`,`iqc_length`,`iqc_location`,`iqc_qty`,`iqc_quality`,`iqc_ng_reason`,`iqc_time`,`iqc_by`,`return_qty`,`return_time`,`return_by`,`mstock_qty`,`mstock_time`,`mstock_by`,`status`,`shelf_pm_notice`,`shelf_qc_notice`,`iqc_delay_notice`,`iqc_ok_notice`,`iqc_ng_notice`,`return_notice`) VALUES
("GOLF","181002001P","D201-2","M-SUS303-C-17.0",63.40,"KG","SUS303","1500mm","C.17.0","黑",30.00,"1A","A009","2018-11-07 16:51:01","huangliang","NG","OK","OK","OK","OK","OK","NG","品質不好","2018-11-07 16:57:04","huangliang",30.00,"2018-11-07 17:04:17","huangliang","","","","5","N","N","N","N","N","N");

INSERT INTO `a_huangliang_mat_stock` ( `mstock_name`,`po_no`,`sup_id`,`mat_code`,`mat_id`,`mat_length`,`mat_od`,`mat_color`,`area`,`location`,`mstock_qty`,`unit`,`shelf_time`,`mstock_time`,`create_by`,`create_time`,`modify_by`,`modify_time` ) VALUES
("五金","181001007P","D615","M-A6061T6-C-33.0","A6061T6","1500mm","C-51.0","紅","1A","A003",154.36,"KG","2018-11-06 12:55:00","2018-11-07 14:55:00","huangliang","2018-11-08 14:05:19","huangliang","2018-11-08 14:05:19"),
("五金","181005002P","D701","M-A6061T6-C-18.0","A6061T6","1500mm","C-51.0","紅","1A","A004",158.00,"KG","2018-11-06 12:55:00","2018-11-07 14:55:00","huangliang","2018-11-08 14:05:19","huangliang","2018-11-08 14:05:19");


