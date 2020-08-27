-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: servcloud
-- ------------------------------------------------------
-- Server version	5.5.43-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `a_huangliang_customer_priority`
--

DROP TABLE IF EXISTS `a_huangliang_customer_priority`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_customer_priority` (
  `customer_id` varchar(10) NOT NULL DEFAULT '',
  `customer_name` varchar(45) DEFAULT NULL,
  `priority` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_defect_code`
--

DROP TABLE IF EXISTS `a_huangliang_defect_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_defect_code` (
  `defect_code` varchar(5) NOT NULL,
  `defect_code_name` varchar(50) NOT NULL,
  `defect_type` varchar(50) NOT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`defect_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_downtime_code`
--

DROP TABLE IF EXISTS `a_huangliang_downtime_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_downtime_code` (
  `downtime_code` varchar(5) NOT NULL,
  `downtime_code_name` varchar(50) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`downtime_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_downtime_code_light_id`
--

DROP TABLE IF EXISTS `a_huangliang_downtime_code_light_id`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_downtime_code_light_id` (
  `downtime_code` varchar(5) NOT NULL,
  `light_id` varchar(45) NOT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`downtime_code`,`light_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_email_record`
--

DROP TABLE IF EXISTS `a_huangliang_email_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_email_record` (
  `mail_id` varchar(12) NOT NULL,
  `title` varchar(50) NOT NULL,
  `content` longtext NOT NULL,
  `type` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '1=> �N�� ��ΤM��ҥ~ĵ�� 2=>�N��w���w�sĵ��',
  `is_send` char(1) NOT NULL DEFAULT 'N' COMMENT 'Y=> �N��� N=> �N�� ����',
  `create_time` datetime NOT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`mail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_followup_work`
--

DROP TABLE IF EXISTS `a_huangliang_followup_work`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_followup_work` (
  `followup_work_id` varchar(5) NOT NULL,
  `followup_work_name` varchar(45) NOT NULL DEFAULT '',
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`followup_work_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_mac_list`
--

DROP TABLE IF EXISTS `a_huangliang_mac_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_mac_list` (
  `machine_id` varchar(32) NOT NULL COMMENT '機台編號',
  `mac_type` varchar(20) DEFAULT NULL COMMENT '機型',
  `c_scrapsize` varchar(20) DEFAULT NULL COMMENT '走心殘材',
  `t_scrapsize` varchar(20) DEFAULT NULL COMMENT '走刀殘材',
  `process_cost` decimal(8,2) NOT NULL DEFAULT '0.00' COMMENT '設備使用加工成本',
  `is_open` char(1) NOT NULL DEFAULT 'N' COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL COMMENT '建立人',
  `create_time` datetime NOT NULL COMMENT '建立日期',
  `modify_by` varchar(50) NOT NULL COMMENT '修改人',
  `modify_time` datetime NOT NULL COMMENT '修改日期',
  PRIMARY KEY (`machine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_machine_priority`
--

DROP TABLE IF EXISTS `a_huangliang_machine_priority`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_machine_priority` (
  `machine_id` varchar(32) NOT NULL,
  `priority` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY (`machine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_mat_length`
--

DROP TABLE IF EXISTS `a_huangliang_mat_length`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_mat_length` (
  `mat_length` varchar(20) NOT NULL DEFAULT '',
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL DEFAULT '',
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`mat_length`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_mat_location`
--

DROP TABLE IF EXISTS `a_huangliang_mat_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_mat_location` (
  `area` varchar(20) DEFAULT NULL,
  `location` varchar(20) NOT NULL,
  `mat_id` varchar(20) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`location`),
  KEY `FK_a_huangliang_mat_location_1` (`mat_id`),
  CONSTRAINT `FK_a_huangliang_mat_location_1` FOREIGN KEY (`mat_id`) REFERENCES `a_huangliang_mat_profile` (`mat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_mat_price_chg_log`
--

DROP TABLE IF EXISTS `a_huangliang_mat_price_chg_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_mat_price_chg_log` (
  `mat_id` varchar(20) NOT NULL COMMENT '材料編碼',
  `sup_id` varchar(20) NOT NULL COMMENT '廠商代碼',
  `previous_mat_price` decimal(8,2) unsigned DEFAULT NULL COMMENT '修改前單價',
  `changed_mat_price` decimal(8,2) unsigned DEFAULT NULL COMMENT '修改後單價',
  `remark` varchar(50) DEFAULT NULL COMMENT '備註',
  `create_by` varchar(50) NOT NULL COMMENT '建立人',
  `create_time` datetime NOT NULL COMMENT '建立日期',
  PRIMARY KEY (`mat_id`,`sup_id`,`create_time`),
  KEY `FK_a_huangliang_mat_price_chg_log_2` (`sup_id`),
  CONSTRAINT `FK_a_huangliang_mat_price_chg_log_1` FOREIGN KEY (`mat_id`) REFERENCES `a_huangliang_mat_profile` (`mat_id`),
  CONSTRAINT `FK_a_huangliang_mat_price_chg_log_2` FOREIGN KEY (`sup_id`) REFERENCES `a_huangliang_supplier` (`sup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_mat_price_list`
--

DROP TABLE IF EXISTS `a_huangliang_mat_price_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_mat_price_list` (
  `mat_id` varchar(20) NOT NULL COMMENT '材料編碼',
  `sup_id` varchar(20) NOT NULL COMMENT '廠商代碼',
  `mat_price` decimal(8,2) unsigned NOT NULL COMMENT '材料單價',
  `create_by` varchar(50) NOT NULL COMMENT '建立人',
  `create_time` datetime NOT NULL COMMENT '建立日期',
  `modify_by` varchar(50) NOT NULL COMMENT '修改人',
  `modify_time` datetime NOT NULL COMMENT '修改日期',
  PRIMARY KEY (`mat_id`,`sup_id`),
  KEY `FK_a_huangliang_mat_price_list_2` (`sup_id`),
  CONSTRAINT `FK_a_huangliang_mat_price_list_1` FOREIGN KEY (`mat_id`) REFERENCES `a_huangliang_mat_profile` (`mat_id`),
  CONSTRAINT `FK_a_huangliang_mat_price_list_2` FOREIGN KEY (`sup_id`) REFERENCES `a_huangliang_supplier` (`sup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_mat_profile`
--

DROP TABLE IF EXISTS `a_huangliang_mat_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_mat_profile` (
  `mat_id` varchar(20) NOT NULL COMMENT '材料編碼',
  `mat_type` varchar(20) NOT NULL COMMENT '類別',
  `mat_color` varchar(20) DEFAULT NULL COMMENT '上漆顏色',
  `is_open` varchar(1) NOT NULL COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL COMMENT '建立人',
  `create_time` datetime NOT NULL COMMENT '建立日期',
  `modify_by` varchar(50) NOT NULL COMMENT '修改人',
  `modify_time` datetime NOT NULL COMMENT '修改日期',
  `mat_sg` decimal(12,10) unsigned NOT NULL COMMENT '材料比重',
  `mat_colornumber` char(7) DEFAULT NULL COMMENT '顏色代碼',
  `mat_att` varchar(10) NOT NULL DEFAULT '' COMMENT '材料屬性',
  `mat_unit` varchar(10) NOT NULL DEFAULT '' COMMENT '計價單位',
  PRIMARY KEY (`mat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_mat_stock`
--

DROP TABLE IF EXISTS `a_huangliang_mat_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_mat_stock` (
  `mstock_name` varchar(20) NOT NULL DEFAULT '' COMMENT '資料庫名稱',
  `po_no` varchar(50) NOT NULL DEFAULT '' COMMENT '採購單號',
  `sup_id` varchar(20) NOT NULL DEFAULT '' COMMENT '廠商代碼',
  `mat_code` varchar(50) NOT NULL DEFAULT '' COMMENT '材料條碼',
  `mat_id` varchar(20) NOT NULL DEFAULT '' COMMENT '材料編碼',
  `mat_length` varchar(20) DEFAULT NULL COMMENT '材料長度',
  `mat_od` varchar(20) DEFAULT NULL COMMENT '材料外徑',
  `mat_color` varchar(10) DEFAULT NULL COMMENT '上漆顏色',
  `mat_price` varchar(20) DEFAULT NULL COMMENT '材料單價',
  `mat_price_ref_date` varchar(20) DEFAULT NULL COMMENT '材料單價參照日期',
  `mat_price_ref_sup_id` varchar(20) DEFAULT NULL COMMENT '材料單價參照廠商編碼',
  `area` varchar(20) NOT NULL DEFAULT '' COMMENT '上架區域代碼',
  `location` varchar(20) NOT NULL DEFAULT '' COMMENT '位置',
  `lot_mark` varchar(45) DEFAULT NULL COMMENT '儲位備註',
  `p_weight` varchar(45) DEFAULT NULL COMMENT '單支重量',
  `stock_piece` varchar(45) NOT NULL DEFAULT '' COMMENT '庫存支數',
  `mstock_qty` decimal(8,2) NOT NULL DEFAULT '0.00' COMMENT '庫存數量',
  `unit` varchar(10) NOT NULL DEFAULT 'KG' COMMENT '單位',
  `shelf_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '暫入上架時間',
  `temp_od` varchar(20) DEFAULT NULL COMMENT '暫入外徑',
  `temp_length` varchar(20) DEFAULT NULL COMMENT '暫入長度',
  `mstock_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '入庫時間',
  `mrp_bcode` varchar(45) DEFAULT NULL COMMENT 'MRP批號',
  `lock_qty` decimal(10,2) unsigned NOT NULL DEFAULT '0.00' COMMENT '派工數量鎖定。',
  `lock_piece` decimal(10,2) unsigned NOT NULL DEFAULT '0.00' COMMENT '派工支數鎖定。',
  `create_by` varchar(50) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `modify_by` varchar(50) NOT NULL DEFAULT '',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`shelf_time`,`mat_code`),
  KEY `FK_a_huangliang_mat_stock_2` (`mat_id`),
  KEY `FK_a_huangliang_mat_stock_3` (`location`),
  KEY `FK_a_huangliang_mat_stock_1` (`mstock_name`,`po_no`,`sup_id`,`mat_code`),
  CONSTRAINT `FK_a_huangliang_mat_stock_1` FOREIGN KEY (`mstock_name`, `po_no`, `sup_id`, `mat_code`) REFERENCES `a_huangliang_po_file` (`mstock_name`, `po_no`, `sup_id`, `mat_code`),
  CONSTRAINT `FK_a_huangliang_mat_stock_2` FOREIGN KEY (`mat_id`) REFERENCES `a_huangliang_mat_profile` (`mat_id`),
  CONSTRAINT `FK_a_huangliang_mat_stock_3` FOREIGN KEY (`location`) REFERENCES `a_huangliang_mat_location` (`location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='材料庫存檔';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_mat_stock_chg_log`
--

DROP TABLE IF EXISTS `a_huangliang_mat_stock_chg_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_mat_stock_chg_log` (
  `mstock_name` varchar(20) NOT NULL,
  `po_no` varchar(50) NOT NULL,
  `sup_id` varchar(20) NOT NULL,
  `mat_code` varchar(50) NOT NULL,
  `shelf_time` datetime NOT NULL,
  `location` varchar(20) NOT NULL,
  `chg_type` varchar(1) NOT NULL,
  `orig_qty` decimal(8,2) DEFAULT NULL,
  `chg_qty` decimal(8,2) DEFAULT NULL,
  `chg_reason` varchar(50) NOT NULL,
  `chg_time` datetime NOT NULL,
  `chg_by` varchar(50) NOT NULL,
  `orig_location` varchar(20) DEFAULT NULL,
  `chg_location` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`mstock_name`,`po_no`,`sup_id`,`mat_code`,`shelf_time`,`chg_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_non_production`
--

DROP TABLE IF EXISTS `a_huangliang_non_production`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_non_production` (
  `machine_id` varchar(45) NOT NULL DEFAULT '' COMMENT '機台編碼',
  `purpose` tinyint(4) unsigned NOT NULL DEFAULT '0' COMMENT '原因(1=維修保養、2=治具生產、3=樣品製作、0=其他)',
  `purpose_other` varchar(50) DEFAULT NULL COMMENT '其他原因內容',
  `exp_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '預計起始時間',
  `exp_edate` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '預計結束時間',
  `create_by` varchar(20) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(20) NOT NULL DEFAULT '' COMMENT '更新者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新時間',
  PRIMARY KEY (`machine_id`,`exp_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='非生產時間';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_notify_delay`
--

DROP TABLE IF EXISTS `a_huangliang_notify_delay`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_notify_delay` (
  `machine_id` varchar(32) NOT NULL,
  `notify_time` datetime NOT NULL,
  `group_id` varchar(45) NOT NULL,
  `alarm_time` datetime NOT NULL,
  `care_emp_id` varchar(200) NOT NULL,
  PRIMARY KEY (`machine_id`,`notify_time`,`group_id`),
  KEY `FK_a_huangliang_notify_delay_1` (`group_id`),
  CONSTRAINT `FK_a_huangliang_notify_delay_1` FOREIGN KEY (`group_id`) REFERENCES `m_sys_group` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_notify_frequent_log`
--

DROP TABLE IF EXISTS `a_huangliang_notify_frequent_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_notify_frequent_log` (
  `machine_id` varchar(32) NOT NULL,
  `notify_time` datetime NOT NULL,
  `group_id` varchar(45) NOT NULL,
  `notify_times` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`machine_id`,`notify_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_po_file`
--

DROP TABLE IF EXISTS `a_huangliang_po_file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_po_file` (
  `mstock_name` varchar(20) NOT NULL DEFAULT '' COMMENT '資料庫名稱',
  `po_no` varchar(50) NOT NULL DEFAULT '' COMMENT '採購單號',
  `sup_id` varchar(20) NOT NULL DEFAULT '' COMMENT '廠商代碼',
  `sup_name` varchar(50) NOT NULL DEFAULT '' COMMENT '廠商名稱',
  `mat_name` varchar(50) NOT NULL DEFAULT '' COMMENT '品名',
  `mat_code` varchar(40) NOT NULL DEFAULT '' COMMENT '材料條碼',
  `po_qty` decimal(8,2) NOT NULL DEFAULT '0.00' COMMENT '採購數量',
  `use_qty` decimal(8,2) unsigned NOT NULL DEFAULT '0.00' COMMENT '已領總數量 派工儲位明細狀態為完成：型態為領料、補料，加總該採購單材料派工儲位明細派工數量。型態為退庫，減去該採購單材料派工儲位明細派工數量。',
  `pass_qty` decimal(8,2) unsigned NOT NULL DEFAULT '0.00' COMMENT '累計入庫數量 庫存入庫=每次進貨數量加總(生管審核後加總)',
  `bind_qty` decimal(8,2) unsigned NOT NULL DEFAULT '0.00' COMMENT '綁定總數 綁定採購記錄：加總綁定數量至採購單-已綁定數量；生產指令結案：若綁定未領數量(生產指令採購單綁定數-已領數量)>0，則扣除該生產指令的綁定未領數量',
  `po_status` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '採購單狀態 0:可綁定／1:不可綁定。採購數-綁定總數=0，則採購單狀態為不可綁定。',
  `unit` varchar(10) NOT NULL DEFAULT '' COMMENT '單位',
  `po_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '採購日期',
  `shelf_qty` decimal(8,2) NOT NULL DEFAULT '0.00' COMMENT '已暫入上架數量',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '修改者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '修改時間',
  PRIMARY KEY (`mstock_name`,`po_no`,`sup_id`,`mat_code`),
  KEY `FK_a_huangliang_po_file_1` (`sup_id`),
  CONSTRAINT `FK_a_huangliang_po_file_1` FOREIGN KEY (`sup_id`) REFERENCES `a_huangliang_supplier` (`sup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='採購單暫入主檔';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_po_temp_stock`
--

DROP TABLE IF EXISTS `a_huangliang_po_temp_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_po_temp_stock` (
  `mstock_name` varchar(20) NOT NULL DEFAULT '' COMMENT '資料庫名稱',
  `po_no` varchar(50) NOT NULL DEFAULT '' COMMENT '採購單號',
  `sup_id` varchar(20) NOT NULL DEFAULT '' COMMENT '廠商代碼',
  `mat_code` varchar(50) NOT NULL DEFAULT '' COMMENT '材料條碼',
  `po_qty` decimal(8,2) unsigned NOT NULL DEFAULT '0.00' COMMENT '採購數量',
  `unit` varchar(10) NOT NULL DEFAULT '' COMMENT '單位',
  `mat_id` varchar(20) DEFAULT NULL COMMENT '材料編碼',
  `mat_length` varchar(20) DEFAULT NULL COMMENT '材料長度',
  `mat_od` varchar(10) DEFAULT NULL COMMENT '材料外徑',
  `mat_color` varchar(10) DEFAULT NULL COMMENT '上漆顏色',
  `shelf_piece` int(11) DEFAULT NULL COMMENT '上架數量-支',
  `p_weight` varchar(45) DEFAULT NULL COMMENT '單支重量。暫入上架：金屬-不可換算,使用者輸入11.23  (輸入單位為KG,小數2位);金屬-可換算由系統計算。入庫：金屬-可換算，驗料狀態為NG，依照NG項目檢驗值，重新計算單支重量',
  `mat_price` decimal(8,2) unsigned DEFAULT NULL COMMENT '材料單價',
  `mat_price_ref_date` varchar(20) NOT NULL DEFAULT '' COMMENT '材料單價參照日期',
  `mat_price_ref_sup_id` varchar(20) NOT NULL DEFAULT '' COMMENT '材料單價參照廠商編碼',
  `lot_mark` varchar(45) DEFAULT NULL COMMENT '儲位備註',
  `shelf_qty` decimal(8,2) unsigned DEFAULT NULL COMMENT '上架數量-KG',
  `area` varchar(20) NOT NULL DEFAULT '' COMMENT '上架區域代碼',
  `location` varchar(20) NOT NULL DEFAULT '' COMMENT '上架位置',
  `shelf_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '上架時間',
  `shelf_by` varchar(50) DEFAULT NULL COMMENT '上架人員',
  `iqc_result` varchar(10) DEFAULT NULL COMMENT '驗料狀態 OK/NG',
  `iqc_mat_id` varchar(10) DEFAULT NULL COMMENT '驗料項目-材料 OK/NG',
  `iqc_od` varchar(10) DEFAULT NULL COMMENT '驗料項目-外徑 OK/NG',
  `iqc_od_val` varchar(10) DEFAULT NULL COMMENT '外徑檢驗值。06.2',
  `iqc_length` varchar(10) DEFAULT NULL COMMENT '驗料項目-長度 OK/NG',
  `iqc_length_val` varchar(10) DEFAULT NULL COMMENT '長度檢驗值。2.6',
  `iqc_location` varchar(10) DEFAULT NULL COMMENT '驗料項目-位置 OK/NG',
  `iqc_qty` varchar(10) DEFAULT NULL COMMENT '驗料項目-重量 OK/NG',
  `iqc_quality` varchar(10) DEFAULT NULL COMMENT '驗料項目-品質 OK/NG',
  `iqc_ng_reason` varchar(60) DEFAULT NULL COMMENT '驗料NG原因',
  `iqc_time` datetime DEFAULT NULL COMMENT '驗料時間',
  `iqc_by` varchar(50) DEFAULT NULL COMMENT '驗料人員',
  `return_qty` decimal(8,2) unsigned DEFAULT NULL COMMENT '退料數量',
  `return_time` datetime DEFAULT NULL COMMENT '退料時間',
  `return_by` varchar(50) DEFAULT NULL COMMENT '退料人員',
  `mstock_qty` decimal(8,2) unsigned DEFAULT NULL COMMENT '入庫數量',
  `mstock_time` datetime DEFAULT NULL COMMENT '入庫時間',
  `mrp_bcode` varchar(45) DEFAULT NULL COMMENT 'MRP批號。入庫時取入庫時間日期加廠商編號為MRP批號',
  `mstock_by` varchar(50) DEFAULT NULL COMMENT '入庫人員',
  `status` varchar(1) NOT NULL DEFAULT '' COMMENT '單據狀態0:保留/1:待驗料/2:待入庫/3:待退料/4:已入庫/5:已退料',
  `shelf_pm_notice` varchar(1) NOT NULL DEFAULT 'N' COMMENT '上架通知-主管 Y:是/N:否，預設N',
  `shelf_qc_notice` varchar(1) NOT NULL DEFAULT 'N' COMMENT '驗料通知-主管 Y:是/N:否，預設N',
  `iqc_delay_notice` varchar(1) NOT NULL DEFAULT 'N' COMMENT '驗料延遲通知-品管主管 Y:是/N:否，預設N',
  `iqc_ok_notice` varchar(1) NOT NULL DEFAULT 'N' COMMENT '驗料合格通知-生管 Y:是/N:否，預設N',
  `iqc_ng_notice` varchar(1) NOT NULL DEFAULT 'N' COMMENT '驗料異常通知-生管 Y:是/N:否，預設N',
  `return_notice` varchar(1) NOT NULL DEFAULT 'N' COMMENT '退料通知-品管 Y:是/N:否，預設N',
  PRIMARY KEY (`mstock_name`,`po_no`,`sup_id`,`mat_code`,`location`,`shelf_time`),
  KEY `FK_a_huangliang_po_temp_stock_1` (`mat_id`),
  KEY `FK_a_huangliang_po_temp_stock_3` (`location`),
  CONSTRAINT `FK_a_huangliang_po_temp_stock_1` FOREIGN KEY (`mat_id`) REFERENCES `a_huangliang_mat_profile` (`mat_id`),
  CONSTRAINT `FK_a_huangliang_po_temp_stock_2` FOREIGN KEY (`mstock_name`, `po_no`, `sup_id`, `mat_code`) REFERENCES `a_huangliang_po_file` (`mstock_name`, `po_no`, `sup_id`, `mat_code`),
  CONSTRAINT `FK_a_huangliang_po_temp_stock_3` FOREIGN KEY (`location`) REFERENCES `a_huangliang_mat_location` (`location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='採購單記錄檔';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_product_profile`
--

DROP TABLE IF EXISTS `a_huangliang_product_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_product_profile` (
  `mstock_name` varchar(20) NOT NULL COMMENT '材料庫',
  `product_id` varchar(30) NOT NULL COMMENT '管編',
  `product_pid` varchar(50) DEFAULT NULL COMMENT '圖號',
  `mat_id` varchar(20) DEFAULT NULL COMMENT '材料編碼',
  `mat_shape` varchar(10) DEFAULT NULL COMMENT '形狀',
  `mat_dim` decimal(5,3) unsigned DEFAULT NULL COMMENT '外徑',
  `mat_usage` decimal(8,2) unsigned DEFAULT NULL COMMENT '單件用量',
  `process` varchar(10) DEFAULT NULL COMMENT '加工方式',
  `multiprogram` tinyint(3) unsigned DEFAULT NULL COMMENT '製程數',
  `def_runtime` decimal(8,2) unsigned DEFAULT NULL COMMENT '預設標工',
  `def_mactype` varchar(50) DEFAULT NULL COMMENT '預設機型',
  `create_by` varchar(50) NOT NULL COMMENT '建立人',
  `create_time` datetime NOT NULL COMMENT '建立日期',
  `modify_by` varchar(50) NOT NULL COMMENT '修改人',
  `modify_time` datetime NOT NULL COMMENT '修改日期',
  PRIMARY KEY (`mstock_name`,`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_production_scheduling`
--

DROP TABLE IF EXISTS `a_huangliang_production_scheduling`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_production_scheduling` (
  `order_id` char(11) NOT NULL DEFAULT '' COMMENT '訂單編號',
  `schedule_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '預排時間',
  `machine_id` varchar(45) NOT NULL DEFAULT '' COMMENT '機台編碼',
  `schedule_quantity` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '預排數量',
  `schedule_status` tinyint(4) unsigned NOT NULL DEFAULT '0' COMMENT '預排狀態(0:開立、1:確認派工、99:取消)',
  `exp_mdate` datetime DEFAULT NULL COMMENT '預計生產日',
  `exp_edate` datetime DEFAULT NULL COMMENT '預計完成日',
  `correction_time` tinyint(4) unsigned NOT NULL DEFAULT '8' COMMENT '校車時間預留',
  `buffer_time` tinyint(4) unsigned NOT NULL DEFAULT '24' COMMENT '緩衝時間預留',
  `prev_partcount_diff_ratio` varchar(45) DEFAULT NULL COMMENT '前次生產差異比例',
  `prev_efficiency_utilization` varchar(45) DEFAULT NULL COMMENT '前次生產效率稼動',
  `mat_control` varchar(1) NOT NULL DEFAULT 'Y' COMMENT '材料監控。Y/N',
  `m_ptime` decimal(8,2) unsigned DEFAULT NULL COMMENT '標工',
  `m_usage` decimal(8,2) DEFAULT NULL COMMENT '單件用量',
  `pg_seq` tinyint(3) unsigned DEFAULT NULL COMMENT '製程順序',
  `schedule_uncheck_notice` varchar(1) NOT NULL DEFAULT 'Y' COMMENT '預排未確認警示通知。Y/N',
  `create_by` varchar(20) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(20) NOT NULL DEFAULT '' COMMENT '更新者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新時間',
  PRIMARY KEY (`order_id`,`schedule_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='生產排程預排';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_quality_exam_data`
--

DROP TABLE IF EXISTS `a_huangliang_quality_exam_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_quality_exam_data` (
  `date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `employee_id` varchar(45) NOT NULL,
  `work_shift_name` varchar(45) NOT NULL,
  `machine_id` varchar(45) NOT NULL,
  `order_id` varchar(45) NOT NULL,
  `multi_process` varchar(45) NOT NULL,
  `examination_defective` int(10) unsigned DEFAULT NULL,
  `defective_reason` varchar(250) DEFAULT NULL,
  `examination_goods` int(10) unsigned DEFAULT NULL,
  `qc_partcount` int(10) unsigned DEFAULT NULL,
  `qc_defectives` varchar(45) DEFAULT NULL,
  `qc_goods` int(10) unsigned DEFAULT NULL,
  `edit_group` varchar(200) DEFAULT NULL,
  `repair_first_defectives` int(10) unsigned DEFAULT NULL,
  `calibration_first_defectives` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`date`,`employee_id`,`work_shift_name`,`machine_id`,`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_regulate_notify_log`
--

DROP TABLE IF EXISTS `a_huangliang_regulate_notify_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_regulate_notify_log` (
  `machine_id` varchar(32) NOT NULL DEFAULT '',
  `notify_time` datetime NOT NULL,
  `group_id` varchar(45) NOT NULL,
  `last_100_time` varchar(45) NOT NULL DEFAULT '',
  PRIMARY KEY (`machine_id`,`notify_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_repair_code`
--

DROP TABLE IF EXISTS `a_huangliang_repair_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_repair_code` (
  `repair_code` varchar(5) NOT NULL DEFAULT '',
  `repair_code_name` varchar(50) NOT NULL,
  `repair_type_id` varchar(50) NOT NULL DEFAULT '',
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`repair_code`),
  KEY `FK_a_huangliang_repair_code_1` (`repair_type_id`),
  CONSTRAINT `FK_a_huangliang_repair_code_1` FOREIGN KEY (`repair_type_id`) REFERENCES `a_huangliang_repair_type` (`repair_type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_repair_delay`
--

DROP TABLE IF EXISTS `a_huangliang_repair_delay`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_repair_delay` (
  `machine_id` varchar(32) NOT NULL,
  `notify_time` datetime NOT NULL,
  `group_id` varchar(45) NOT NULL,
  `alarm_time` datetime NOT NULL,
  `repair_emp_id` varchar(200) NOT NULL,
  PRIMARY KEY (`machine_id`,`notify_time`,`group_id`),
  KEY `FK_a_huangliang_repair_delay_1` (`group_id`),
  CONSTRAINT `FK_a_huangliang_repair_delay_1` FOREIGN KEY (`group_id`) REFERENCES `m_sys_group` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_repair_emp_check_in`
--

DROP TABLE IF EXISTS `a_huangliang_repair_emp_check_in`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_repair_emp_check_in` (
  `logically_date` date NOT NULL,
  `user_id` varchar(45) NOT NULL,
  `work_shift_name` varchar(10) NOT NULL,
  `check_in_tsp` datetime NOT NULL,
  `check_out_tsp` datetime DEFAULT NULL,
  `work_shift_start` datetime NOT NULL,
  `work_shift_end` datetime NOT NULL,
  `work_shift_check_in_start` datetime NOT NULL,
  `work_shift_check_in_end` datetime NOT NULL,
  `is_dispatch` int(1) NOT NULL,
  PRIMARY KEY (`logically_date`,`user_id`,`work_shift_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_repair_emp_status`
--

DROP TABLE IF EXISTS `a_huangliang_repair_emp_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_repair_emp_status` (
  `logically_date` date NOT NULL,
  `user_id` varchar(45) NOT NULL,
  `work_shift_name` varchar(10) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `machine_id` varchar(32) NOT NULL,
  `priority` tinyint(3) unsigned NOT NULL,
  `alarm_time` datetime NOT NULL,
  PRIMARY KEY (`logically_date`,`user_id`,`work_shift_name`,`start_time`),
  KEY `FK_a_huangliang_repair_emp_status_2` (`machine_id`,`alarm_time`),
  CONSTRAINT `FK_a_huangliang_repair_emp_status_1` FOREIGN KEY (`logically_date`, `user_id`, `work_shift_name`) REFERENCES `a_huangliang_repair_emp_check_in` (`logically_date`, `user_id`, `work_shift_name`),
  CONSTRAINT `FK_a_huangliang_repair_emp_status_2` FOREIGN KEY (`machine_id`, `alarm_time`) REFERENCES `a_huangliang_repair_record` (`machine_id`, `alarm_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_repair_item`
--

DROP TABLE IF EXISTS `a_huangliang_repair_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_repair_item` (
  `machine_id` varchar(32) NOT NULL,
  `alarm_time` datetime NOT NULL,
  `repair_code` varchar(5) NOT NULL,
  `count` int(5) DEFAULT NULL,
  `is_updated` int(1) DEFAULT '0',
  `create_by` varchar(50) DEFAULT NULL COMMENT '撱箇??',
  `create_time` datetime DEFAULT NULL COMMENT '撱箇????',
  PRIMARY KEY (`machine_id`,`alarm_time`,`repair_code`),
  CONSTRAINT `FK_a_huangliang_repair_item_1` FOREIGN KEY (`machine_id`, `alarm_time`) REFERENCES `a_huangliang_repair_record` (`machine_id`, `alarm_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_repair_record`
--

DROP TABLE IF EXISTS `a_huangliang_repair_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_repair_record` (
  `machine_id` varchar(32) NOT NULL,
  `alarm_time` datetime NOT NULL,
  `alarm_code` varchar(200) NOT NULL,
  `notify_time` datetime DEFAULT NULL,
  `work_shift` varchar(10) NOT NULL,
  `care_emp_id` varchar(200) NOT NULL,
  `dispatch_time` datetime DEFAULT NULL,
  `repair_emp_id` varchar(200) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `act_repair_emp_id` varchar(200) DEFAULT NULL,
  `n6` varchar(45) NOT NULL DEFAULT '',
  `m523` varchar(45) NOT NULL DEFAULT '',
  `start_standard_second` varchar(45) DEFAULT NULL,
  `end_standard_second` varchar(45) DEFAULT NULL,
  `tool_use_no` char(11) DEFAULT NULL,
  PRIMARY KEY (`machine_id`,`alarm_time`),
  KEY `FK_tool_use_no_idx` (`tool_use_no`),
  CONSTRAINT `FK_tool_use_no` FOREIGN KEY (`tool_use_no`) REFERENCES `a_huangliang_tool_mp_use` (`tool_use_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_repair_status`
--

DROP TABLE IF EXISTS `a_huangliang_repair_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_repair_status` (
  `machine_id` varchar(32) NOT NULL,
  `alarm_time` datetime NOT NULL,
  `start_time` datetime NOT NULL,
  `macro` varchar(10) NOT NULL,
  PRIMARY KEY (`machine_id`,`alarm_time`,`start_time`),
  CONSTRAINT `FK_a_huangliang_repair_status_1` FOREIGN KEY (`machine_id`, `alarm_time`) REFERENCES `a_huangliang_repair_record` (`machine_id`, `alarm_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_repair_type`
--

DROP TABLE IF EXISTS `a_huangliang_repair_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_repair_type` (
  `repair_type_id` varchar(5) NOT NULL,
  `repair_type_name` varchar(50) NOT NULL,
  `standard_second` int(10) unsigned DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`repair_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_sample_fill_manage_id`
--

DROP TABLE IF EXISTS `a_huangliang_sample_fill_manage_id`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_sample_fill_manage_id` (
  `timestamp` varchar(20) NOT NULL,
  `date` varchar(8) DEFAULT NULL,
  `machine_id` varchar(32) NOT NULL,
  `work_shift_name` varchar(45) NOT NULL,
  `employee_id` varchar(45) NOT NULL,
  `manage_id` varchar(45) DEFAULT NULL,
  `regulate_start_tsp` varchar(20) DEFAULT NULL,
  `produce_start_tsp` varchar(20) DEFAULT NULL,
  `produce_end_tsp` varchar(20) DEFAULT NULL,
  `regulate_pause_ms` int(11) DEFAULT NULL,
  `repair_pause_ms` int(11) DEFAULT '0',
  `produce_pause_ms` int(11) DEFAULT '0',
  `produce_oper_ms` int(11) DEFAULT '0',
  `part_count` int(10) DEFAULT '0',
  PRIMARY KEY (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_supplier`
--

DROP TABLE IF EXISTS `a_huangliang_supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_supplier` (
  `sup_id` varchar(20) NOT NULL,
  `sup_name` varchar(50) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`sup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_tool_buy`
--

DROP TABLE IF EXISTS `a_huangliang_tool_buy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_tool_buy` (
  `tsup_id` varchar(20) NOT NULL COMMENT '刀具廠商代碼',
  `tool_id` char(6) NOT NULL COMMENT '刀具編號',
  `buy_time` datetime NOT NULL COMMENT '進貨時間',
  `buy_qty` int(10) unsigned NOT NULL COMMENT '進貨數量',
  `unit_price` decimal(6,2) unsigned NOT NULL COMMENT '進貨單價',
  `total_cost` decimal(8,2) unsigned NOT NULL COMMENT '進貨總金額',
  `remark` varchar(100) DEFAULT NULL COMMENT '進貨備註',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `create_by` varchar(45) NOT NULL COMMENT '進貨人',
  `modify_time` datetime DEFAULT NULL COMMENT '修改時間',
  `modify_by` varchar(45) DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (`tsup_id`,`buy_time`,`tool_id`),
  KEY `FK_tool_id_idx` (`tool_id`),
  CONSTRAINT `FK_tool_buy_tool_id` FOREIGN KEY (`tool_id`) REFERENCES `a_huangliang_tool_profile` (`tool_id`),
  CONSTRAINT `FK_tool_buy_tsup_id` FOREIGN KEY (`tsup_id`) REFERENCES `a_huangliang_tool_supplier` (`tsup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_tool_location`
--

DROP TABLE IF EXISTS `a_huangliang_tool_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_tool_location` (
  `tool_location` char(6) NOT NULL COMMENT '儲位代碼；第一碼區域；第二碼堪用程度N / B；後四碼流水號',
  `tool_location_for` char(1) NOT NULL DEFAULT 'N' COMMENT '儲位刀具堪用程度；N：新刀；B：回收刀；預設N',
  `location_area` tinyint(4) DEFAULT NULL COMMENT '儲位區域；1：現場刀具庫；2：備用刀具室；3：場外借用',
  `is_open` char(1) NOT NULL DEFAULT 'Y' COMMENT '是否啟用',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `create_by` varchar(45) NOT NULL COMMENT '建立人',
  `modify_time` datetime DEFAULT NULL COMMENT '修改時間',
  `modify_by` varchar(45) DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (`tool_location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_tool_mp_his_list`
--

DROP TABLE IF EXISTS `a_huangliang_tool_mp_his_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_tool_mp_his_list` (
  `tool_history_no` char(11) NOT NULL COMMENT '刀具履歷編號',
  `tool_id` char(6) NOT NULL COMMENT '刀具編碼',
  `tool_use_for` varchar(10) NOT NULL COMMENT '領刀種類',
  `use_qty` int(10) unsigned DEFAULT NULL COMMENT '領刀數量',
  `tsup_id` varchar(20) DEFAULT NULL COMMENT '刀具廠商代碼',
  `uselist_remark` varchar(100) DEFAULT NULL COMMENT '領刀備註',
  `life_remark` varchar(100) DEFAULT NULL COMMENT '刀具壽命備註',
  `tool_use_no` char(11) DEFAULT NULL COMMENT '領刀單號',
  `status` tinyint(4) DEFAULT NULL COMMENT '狀態；0：建立；1：更換取消；99：取消未領',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `create_by` varchar(45) NOT NULL COMMENT '建立人',
  `modify_time` datetime DEFAULT NULL COMMENT '修改時間',
  `modify_by` varchar(45) DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (`tool_history_no`,`tool_id`,`tool_use_for`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_tool_mp_history`
--

DROP TABLE IF EXISTS `a_huangliang_tool_mp_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_tool_mp_history` (
  `tool_history_no` char(11) NOT NULL COMMENT '刀具履歷編號；2碼(PH) + 6碼(年月日) + 3碼(流水號) = 11碼',
  `order_id` char(11) DEFAULT NULL COMMENT '訂單編號；11碼',
  `machine_id` varchar(45) DEFAULT NULL COMMENT '機台編號',
  `tool_ptime` int(11) DEFAULT NULL COMMENT '加工秒數；單位秒',
  `main_chuck` varchar(45) DEFAULT NULL COMMENT '主夾頭；單位mm',
  `second_chuck` varchar(45) DEFAULT NULL COMMENT '副夾頭；單位mm',
  `program_name` varchar(45) DEFAULT NULL COMMENT '程式號碼',
  `program_seq` tinyint(4) DEFAULT '1' COMMENT '製程順序',
  `mat_code` varchar(45) DEFAULT NULL COMMENT '材料條碼',
  `produce_notice` varchar(45) DEFAULT NULL COMMENT '生產注意事項',
  `work_by` varchar(45) DEFAULT NULL COMMENT '校車人員',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `create_by` varchar(45) DEFAULT NULL COMMENT '建立人',
  `modify_time` datetime DEFAULT NULL COMMENT '修改時間',
  `modify_by` varchar(45) DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (`tool_history_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_tool_mp_list`
--

DROP TABLE IF EXISTS `a_huangliang_tool_mp_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_tool_mp_list` (
  `tool_use_no` char(11) NOT NULL DEFAULT '' COMMENT '領刀單號',
  `buy_time` datetime NOT NULL COMMENT '進貨時間',
  `tool_id` char(6) NOT NULL COMMENT '刀具編號',
  `tsup_id` varchar(20) NOT NULL COMMENT '刀具廠商代碼',
  `tool_location` char(6) NOT NULL COMMENT '儲位代碼',
  `tool_use_for` varchar(10) NOT NULL DEFAULT '' COMMENT '領刀種類；對應維修代碼100-299',
  `tool_status` char(1) DEFAULT NULL COMMENT '刀具堪用程度',
  `use_qty` int(10) unsigned DEFAULT NULL COMMENT '領刀數量',
  `use_cost` decimal(10,2) unsigned DEFAULT NULL COMMENT '使用成本',
  `uselist_remark` varchar(100) DEFAULT NULL COMMENT '領刀備註',
  `uselist_status` tinyint(3) unsigned DEFAULT '0' COMMENT '領刀明細狀態；0：建立；1：轎車使用後更換；99：取消；',
  `life_remark` varchar(100) DEFAULT NULL COMMENT '刀具壽命備註',
  `fix_for` tinyint(3) unsigned DEFAULT NULL COMMENT '維修種類；0：損壞更換；1：規格更換；',
  `fix_no` varchar(10) DEFAULT NULL COMMENT '維修代碼',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `create_by` varchar(45) NOT NULL COMMENT '建立人',
  `modify_time` datetime DEFAULT NULL COMMENT '修改時間',
  `modify_by` varchar(45) DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (`tool_use_no`,`buy_time`,`tool_id`,`tsup_id`,`tool_location`,`tool_use_for`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='量產領刀明細';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_tool_mp_use`
--

DROP TABLE IF EXISTS `a_huangliang_tool_mp_use`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_tool_mp_use` (
  `tool_use_no` char(11) NOT NULL COMMENT '領刀單號；prefix：固定兩碼"PT"；年月日：6碼；流水號：3碼；',
  `use_reason` tinyint(4) DEFAULT NULL COMMENT '領刀原因；11：量產校車；12：量產維修；',
  `order_id` char(11) DEFAULT NULL COMMENT '訂單編號',
  `machine_id` varchar(30) DEFAULT NULL COMMENT '機台編號',
  `tool_history_no` char(11) DEFAULT NULL COMMENT '刀具履歷編號',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `create_by` varchar(45) NOT NULL COMMENT '領刀 / 建立人員',
  PRIMARY KEY (`tool_use_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_tool_price`
--

DROP TABLE IF EXISTS `a_huangliang_tool_price`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_tool_price` (
  `tool_id` char(6) NOT NULL COMMENT '刀具編碼',
  `tsup_id` varchar(20) NOT NULL COMMENT '刀具廠商代碼',
  `tool_price` decimal(6,2) unsigned DEFAULT NULL COMMENT '單價',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `create_by` varchar(45) NOT NULL COMMENT '建立人',
  PRIMARY KEY (`tool_id`,`tsup_id`,`create_time`),
  KEY `FK_tsup_id_idx` (`tsup_id`),
  CONSTRAINT `FK_tool_price_tool_id` FOREIGN KEY (`tool_id`) REFERENCES `a_huangliang_tool_profile` (`tool_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tool_price_tsup_id` FOREIGN KEY (`tsup_id`) REFERENCES `a_huangliang_tool_supplier` (`tsup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_tool_profile`
--

DROP TABLE IF EXISTS `a_huangliang_tool_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_tool_profile` (
  `tool_id` char(6) NOT NULL COMMENT '刀具編碼',
  `tool_type` varchar(20) NOT NULL COMMENT '刀具類型',
  `tool_spec` varchar(45) NOT NULL COMMENT '刀具規格',
  `tool_ss` int(10) unsigned DEFAULT NULL COMMENT '安全庫存',
  `use_mark` varchar(100) DEFAULT NULL COMMENT '特殊用刀備註',
  `tool_newloc` char(6) DEFAULT NULL COMMENT '預設新刀儲位',
  `tool_recloc` char(6) DEFAULT NULL COMMENT '預設回收刀儲位',
  `is_open` char(1) NOT NULL COMMENT '是否啟用',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `create_by` varchar(45) NOT NULL COMMENT '建立人',
  `modify_time` datetime DEFAULT NULL COMMENT '修改時間',
  `modify_by` varchar(45) DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (`tool_id`),
  KEY `FK_tool_profile_tool_type_idx` (`tool_type`),
  KEY `FK_tool_profile_tool_newloc_idx` (`tool_newloc`),
  KEY `FK_tool_profile_tool_recloc_idx` (`tool_recloc`),
  CONSTRAINT `FK_tool_profile_tool_newloc` FOREIGN KEY (`tool_newloc`) REFERENCES `a_huangliang_tool_location` (`tool_location`),
  CONSTRAINT `FK_tool_profile_tool_recloc` FOREIGN KEY (`tool_recloc`) REFERENCES `a_huangliang_tool_location` (`tool_location`),
  CONSTRAINT `FK_tool_profile_tool_type` FOREIGN KEY (`tool_type`) REFERENCES `a_huangliang_tool_type` (`tool_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_tool_sp_his_list`
--

DROP TABLE IF EXISTS `a_huangliang_tool_sp_his_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_tool_sp_his_list` (
  `tool_history_no` char(11) NOT NULL COMMENT '刀具履歷編號',
  `tool_id` char(6) NOT NULL COMMENT '刀具編碼',
  `tool_use_for` varchar(10) NOT NULL COMMENT '領刀種類',
  `tsup_id` varchar(20) DEFAULT NULL COMMENT '刀具廠商代碼',
  `uselist_remark` varchar(100) DEFAULT NULL COMMENT '領刀備註',
  `life_remark` varchar(100) DEFAULT NULL COMMENT '刀具壽命備註',
  `tool_use_no` char(11) DEFAULT NULL COMMENT '領刀單號',
  `use_qty` int(10) unsigned DEFAULT NULL COMMENT '領刀數量',
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '狀態；0：建立；1:不適用更換取消、99: 歸還取消；',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `create_by` varchar(45) NOT NULL COMMENT '建立人',
  `modify_time` datetime DEFAULT NULL COMMENT '修改時間',
  `modify_by` varchar(45) DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (`tool_history_no`,`tool_id`,`tool_use_for`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='樣品刀具履歷明細';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_tool_sp_history`
--

DROP TABLE IF EXISTS `a_huangliang_tool_sp_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_tool_sp_history` (
  `tool_history_no` char(11) NOT NULL DEFAULT '' COMMENT '刀具履歷編號；2碼(SH) + 6碼(年月日) + 3碼(流水號) = 11碼',
  `mstock_name` varchar(20) NOT NULL DEFAULT '' COMMENT '資料庫名稱',
  `sample_id` varchar(30) DEFAULT NULL COMMENT '樣品管編',
  `sample_pid` varchar(50) NOT NULL COMMENT '樣品圖號',
  `machine_id` varchar(45) DEFAULT NULL COMMENT '機台編號',
  `tool_ptime` int(11) DEFAULT NULL COMMENT '加工秒數；單位秒',
  `main_chuck` varchar(45) DEFAULT NULL COMMENT '主夾頭；單位mm',
  `second_chuck` varchar(45) DEFAULT NULL COMMENT '副夾頭；單位mm',
  `program_name` varchar(45) DEFAULT NULL COMMENT '程式號碼',
  `program_seq` tinyint(4) DEFAULT '1' COMMENT '製程順序',
  `mat_code` varchar(45) DEFAULT NULL COMMENT '材料條碼',
  `work_by` varchar(45) DEFAULT NULL COMMENT '校車人員',
  `produce_notice` varchar(200) DEFAULT NULL COMMENT '生產注意事項',
  `process` varchar(10) DEFAULT NULL COMMENT '加工方式',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `create_by` varchar(45) DEFAULT NULL COMMENT '建立人',
  `modify_time` datetime DEFAULT NULL COMMENT '修改時間',
  `modify_by` varchar(45) DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (`tool_history_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='樣品刀具履歷';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_tool_sp_list`
--

DROP TABLE IF EXISTS `a_huangliang_tool_sp_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_tool_sp_list` (
  `tool_use_no` char(11) NOT NULL COMMENT '領刀單號',
  `buy_time` datetime NOT NULL COMMENT '進貨時間',
  `tool_id` char(6) NOT NULL COMMENT '刀具編號',
  `tsup_id` varchar(20) NOT NULL COMMENT '刀具廠商代碼',
  `tool_location` char(6) NOT NULL COMMENT '儲位代碼',
  `tool_use_for` varchar(10) NOT NULL COMMENT '領刀種類；對應維修代碼100-299',
  `tool_status` char(1) DEFAULT NULL COMMENT '刀具堪用程度',
  `use_qty` int(10) unsigned DEFAULT NULL COMMENT '領刀數量',
  `use_cost` decimal(10,2) unsigned DEFAULT NULL COMMENT '使用成本',
  `uselist_remark` varchar(100) DEFAULT NULL COMMENT '領刀備註',
  `uselist_status` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '領刀明細狀態；0：建立；1:不適用更換取消、99: 歸還取消；',
  `life_remark` varchar(100) DEFAULT NULL COMMENT '刀具壽命備註',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `create_by` varchar(45) NOT NULL COMMENT '建立人',
  `modify_time` datetime DEFAULT NULL COMMENT '修改時間',
  `modify_by` varchar(45) DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (`tool_use_no`,`buy_time`,`tool_id`,`tsup_id`,`tool_location`,`tool_use_for`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='其他領刀明細';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_tool_sp_use`
--

DROP TABLE IF EXISTS `a_huangliang_tool_sp_use`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_tool_sp_use` (
  `tool_use_no` char(11) NOT NULL COMMENT '領刀單號；S+T+年月日+流水號3碼',
  `use_reason` tinyint(4) DEFAULT NULL COMMENT '領刀原因；20:樣品、21:其他-治具、22:其他-其他',
  `mstock_name` varchar(20) NOT NULL DEFAULT '' COMMENT '材料庫名稱',
  `sample_id` varchar(30) DEFAULT NULL COMMENT '樣品管編',
  `sample_pid` varchar(50) DEFAULT NULL COMMENT '樣品圖號',
  `machine_id` varchar(30) DEFAULT NULL COMMENT '機台編號',
  `tool_history_no` char(11) DEFAULT NULL COMMENT '刀具履歷編號',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `create_by` varchar(45) NOT NULL COMMENT '領刀 / 建立人員',
  PRIMARY KEY (`tool_use_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='其他領刀單';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_tool_stock`
--

DROP TABLE IF EXISTS `a_huangliang_tool_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_tool_stock` (
  `buy_time` datetime NOT NULL COMMENT '進貨時間',
  `tsup_id` varchar(20) NOT NULL COMMENT '刀具廠商代碼',
  `tool_id` char(6) NOT NULL COMMENT '刀具編號',
  `tool_location` char(6) NOT NULL COMMENT '儲位代碼',
  `tool_status` char(1) NOT NULL DEFAULT 'N' COMMENT '刀具堪用程度',
  `tool_stock` int(10) unsigned DEFAULT NULL COMMENT '庫存數',
  `use_tqty` int(10) unsigned DEFAULT NULL COMMENT '領用總數',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `create_by` varchar(45) NOT NULL COMMENT '建立人',
  `modify_time` datetime DEFAULT NULL COMMENT '修改時間',
  `modify_by` varchar(45) DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (`buy_time`,`tsup_id`,`tool_id`,`tool_location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_tool_stock_chg`
--

DROP TABLE IF EXISTS `a_huangliang_tool_stock_chg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_tool_stock_chg` (
  `chg_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '異動時間',
  `buy_time` datetime NOT NULL COMMENT '進貨時間',
  `tsup_id` varchar(20) NOT NULL COMMENT '刀具廠商代碼',
  `tool_id` char(6) NOT NULL COMMENT '刀具編號',
  `tool_status` char(1) DEFAULT NULL COMMENT '刀具堪用程度',
  `tool_location` char(6) NOT NULL COMMENT '儲位代碼',
  `chg_type` tinyint(3) unsigned NOT NULL COMMENT '異動類型',
  `chg_qty` int(11) DEFAULT NULL COMMENT '異動數量',
  `new_location` char(6) DEFAULT NULL COMMENT '異動後儲位',
  `chg_remark` varchar(100) DEFAULT NULL COMMENT '異動備註',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `create_by` varchar(45) NOT NULL COMMENT '建立人',
  PRIMARY KEY (`chg_time`),
  KEY `FK_mat_stock_idx` (`buy_time`,`tsup_id`,`tool_id`,`tool_location`),
  KEY `FK_tool_location_idx` (`new_location`),
  CONSTRAINT `FK_tool_stock_chg_mat_stock` FOREIGN KEY (`buy_time`, `tsup_id`, `tool_id`, `tool_location`) REFERENCES `a_huangliang_tool_stock` (`buy_time`, `tsup_id`, `tool_id`, `tool_location`),
  CONSTRAINT `FK_tool_stock_chg_tool_location` FOREIGN KEY (`new_location`) REFERENCES `a_huangliang_tool_location` (`tool_location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_tool_supplier`
--

DROP TABLE IF EXISTS `a_huangliang_tool_supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_tool_supplier` (
  `tsup_id` varchar(20) NOT NULL COMMENT '刀具廠商代碼',
  `tsup_name` varchar(45) DEFAULT NULL COMMENT '刀具廠商名稱',
  `is_open` char(1) NOT NULL DEFAULT 'Y' COMMENT '是否啟用 Y / N',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `create_by` varchar(45) NOT NULL COMMENT '建立人',
  `modify_time` datetime DEFAULT NULL COMMENT '修改時間',
  `modify_by` varchar(45) DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (`tsup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_tool_type`
--

DROP TABLE IF EXISTS `a_huangliang_tool_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_tool_type` (
  `tool_type` varchar(20) NOT NULL COMMENT '刀具類型',
  `type_for` char(2) DEFAULT NULL COMMENT '成本分類；"01"：刀具；"02"：刀架',
  `type_rule` char(2) NOT NULL COMMENT '刀具編碼規則 兩位數字',
  `cost_pc` decimal(5,2) DEFAULT NULL COMMENT '回收成本比例',
  `is_cost` char(1) DEFAULT NULL COMMENT '是否計算成本',
  `is_open` char(1) DEFAULT NULL COMMENT '是否啟用',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `create_by` varchar(45) NOT NULL COMMENT '建立人',
  `modify_time` datetime DEFAULT NULL COMMENT '修改時間',
  `modify_by` varchar(45) DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (`tool_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_undispatch`
--

DROP TABLE IF EXISTS `a_huangliang_undispatch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_undispatch` (
  `machine_id` varchar(32) NOT NULL,
  `notify_time` datetime NOT NULL,
  `group_id` varchar(45) NOT NULL,
  `alarm_time` datetime NOT NULL,
  `alarm_code` varchar(200) NOT NULL,
  PRIMARY KEY (`machine_id`,`notify_time`,`group_id`),
  KEY `FK_a_huangliang_undispatch_1` (`group_id`),
  CONSTRAINT `FK_a_huangliang_undispatch_1` FOREIGN KEY (`group_id`) REFERENCES `m_sys_group` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_update_emp_delay`
--

DROP TABLE IF EXISTS `a_huangliang_update_emp_delay`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_update_emp_delay` (
  `machine_id` varchar(32) NOT NULL,
  `notify_time` datetime NOT NULL,
  `group_id` varchar(45) NOT NULL,
  `care_emp_id` varchar(200) NOT NULL,
  `delay_time` time NOT NULL,
  PRIMARY KEY (`machine_id`,`notify_time`,`group_id`),
  KEY `FK_a_huangliang_update_emp_delay_1` (`group_id`),
  CONSTRAINT `FK_a_huangliang_update_emp_delay_1` FOREIGN KEY (`group_id`) REFERENCES `m_sys_group` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_utilization_notify`
--

DROP TABLE IF EXISTS `a_huangliang_utilization_notify`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_utilization_notify` (
  `machine_id` varchar(32) NOT NULL,
  `notify_time` datetime NOT NULL,
  `group_id` varchar(45) NOT NULL,
  `production_eff` double NOT NULL,
  `quality_eff` double NOT NULL,
  PRIMARY KEY (`machine_id`,`notify_time`,`group_id`),
  KEY `FK_a_huangliang_utilization_notify_1` (`group_id`),
  CONSTRAINT `FK_a_huangliang_utilization_notify_1` FOREIGN KEY (`group_id`) REFERENCES `m_sys_group` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `a_huangliang_view_mat_mat_list_wo_list_mat_stock`
--

DROP TABLE IF EXISTS `a_huangliang_view_mat_mat_list_wo_list_mat_stock`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_mat_mat_list_wo_list_mat_stock`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_mat_mat_list_wo_list_mat_stock` AS SELECT 
 1 AS `order_id`,
 1 AS `product_id`,
 1 AS `finish_time`,
 1 AS `type`,
 1 AS `mat_code`,
 1 AS `mrp_bcode`,
 1 AS `shelf_time`,
 1 AS `po_no`,
 1 AS `use_qty`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_mat_status`
--

DROP TABLE IF EXISTS `a_huangliang_view_mat_status`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_mat_status`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_mat_status` AS SELECT 
 1 AS `order_id`,
 1 AS `machine_id`,
 1 AS `wo_m_time`,
 1 AS `m_qty`,
 1 AS `m_pqty`,
 1 AS `m_bqty`,
 1 AS `w_m_status`,
 1 AS `exp_mdate`,
 1 AS `exp_edate`,
 1 AS `act_mdate`,
 1 AS `act_edate`,
 1 AS `m_ptime`,
 1 AS `m_usage`,
 1 AS `pg_seq`,
 1 AS `mat_control`,
 1 AS `create_by`,
 1 AS `create_time`,
 1 AS `modify_by`,
 1 AS `modify_time`,
 1 AS `product_id`,
 1 AS `product_pid`,
 1 AS `customer_id`,
 1 AS `order_qty`,
 1 AS `wo_pqty`,
 1 AS `wo_bqty`,
 1 AS `wo_mqty`,
 1 AS `exp_date`,
 1 AS `wo_status`,
 1 AS `wo_list_create_time`,
 1 AS `wo_list_modify_time`,
 1 AS `wo_list_create_by`,
 1 AS `wo_list_modify_by`,
 1 AS `material_assign_count`,
 1 AS `m_mat_time`,
 1 AS `mstock_name`,
 1 AS `mat_code`,
 1 AS `mat_length`,
 1 AS `rework_size`,
 1 AS `shelf_time`,
 1 AS `location`,
 1 AS `item_status`,
 1 AS `m_mat_list_create_time`,
 1 AS `m_mat_list_modify_time`,
 1 AS `type`,
 1 AS `mac_type`,
 1 AS `mac_list_create_time`,
 1 AS `mac_list_modify_time`,
 1 AS `c_scrapsize`,
 1 AS `t_scrapsize`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_mat_stock_mat_stock_chg_log`
--

DROP TABLE IF EXISTS `a_huangliang_view_mat_stock_mat_stock_chg_log`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_mat_stock_mat_stock_chg_log`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_mat_stock_mat_stock_chg_log` AS SELECT 
 1 AS `mstock_name`,
 1 AS `po_no`,
 1 AS `sup_id`,
 1 AS `mat_code`,
 1 AS `shelf_time`,
 1 AS `location`,
 1 AS `chg_type`,
 1 AS `orig_qty`,
 1 AS `chg_qty`,
 1 AS `chg_reason`,
 1 AS `chg_time`,
 1 AS `chg_by`,
 1 AS `orig_location`,
 1 AS `chg_location`,
 1 AS `mat_color`,
 1 AS `mat_length`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_po_temp_stock_po_file`
--

DROP TABLE IF EXISTS `a_huangliang_view_po_temp_stock_po_file`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_po_temp_stock_po_file`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_po_temp_stock_po_file` AS SELECT 
 1 AS `mstock_name`,
 1 AS `po_no`,
 1 AS `sup_id`,
 1 AS `mat_code`,
 1 AS `po_qty`,
 1 AS `unit`,
 1 AS `mat_id`,
 1 AS `mat_length`,
 1 AS `mat_od`,
 1 AS `mat_color`,
 1 AS `shelf_piece`,
 1 AS `shelf_qty`,
 1 AS `area`,
 1 AS `location`,
 1 AS `shelf_time`,
 1 AS `shelf_by`,
 1 AS `iqc_result`,
 1 AS `iqc_mat_id`,
 1 AS `iqc_od`,
 1 AS `iqc_length`,
 1 AS `iqc_location`,
 1 AS `iqc_qty`,
 1 AS `iqc_quality`,
 1 AS `iqc_ng_reason`,
 1 AS `iqc_time`,
 1 AS `iqc_by`,
 1 AS `return_qty`,
 1 AS `return_time`,
 1 AS `return_by`,
 1 AS `mstock_qty`,
 1 AS `mstock_time`,
 1 AS `mstock_by`,
 1 AS `status`,
 1 AS `shelf_pm_notice`,
 1 AS `shelf_qc_notice`,
 1 AS `iqc_delay_notice`,
 1 AS `iqc_ok_notice`,
 1 AS `iqc_ng_notice`,
 1 AS `return_notice`,
 1 AS `mat_name`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_product_profile_tool_sp_history`
--

DROP TABLE IF EXISTS `a_huangliang_view_product_profile_tool_sp_history`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_product_profile_tool_sp_history`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_product_profile_tool_sp_history` AS SELECT 
 1 AS `product_id`,
 1 AS `product_pid`,
 1 AS `tool_history_no`,
 1 AS `mstock_name`,
 1 AS `sample_id`,
 1 AS `sample_pid`,
 1 AS `machine_id`,
 1 AS `tool_ptime`,
 1 AS `main_chuck`,
 1 AS `second_chuck`,
 1 AS `program_name`,
 1 AS `program_seq`,
 1 AS `mat_code`,
 1 AS `work_by`,
 1 AS `produce_notice`,
 1 AS `process`,
 1 AS `create_time`,
 1 AS `create_by`,
 1 AS `modify_time`,
 1 AS `modify_by`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_product_profile_wo_list`
--

DROP TABLE IF EXISTS `a_huangliang_view_product_profile_wo_list`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_product_profile_wo_list`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_product_profile_wo_list` AS SELECT 
 1 AS `mstock_name`,
 1 AS `product_id`,
 1 AS `product_pid`,
 1 AS `mat_id`,
 1 AS `mat_shape`,
 1 AS `mat_dim`,
 1 AS `mat_usage`,
 1 AS `process`,
 1 AS `multiprogram`,
 1 AS `def_runtime`,
 1 AS `def_mactype`,
 1 AS `create_by`,
 1 AS `create_time`,
 1 AS `modify_by`,
 1 AS `modify_time`,
 1 AS `order_id`,
 1 AS `customer_id`,
 1 AS `order_qty`,
 1 AS `wo_pqty`,
 1 AS `wo_bqty`,
 1 AS `wo_mqty`,
 1 AS `exp_date`,
 1 AS `wo_status`,
 1 AS `wo_list_create_time`,
 1 AS `wo_list_modify_time`,
 1 AS `wo_list_create_by`,
 1 AS `wo_list_modify_by`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_stock_mat_list`
--

DROP TABLE IF EXISTS `a_huangliang_view_stock_mat_list`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_stock_mat_list`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_stock_mat_list` AS SELECT 
 1 AS `order_id`,
 1 AS `machine_id`,
 1 AS `wo_m_time`,
 1 AS `m_mat_time`,
 1 AS `po_no`,
 1 AS `mstock_name`,
 1 AS `sup_id`,
 1 AS `mat_code`,
 1 AS `mat_id`,
 1 AS `mat_length`,
 1 AS `mat_od`,
 1 AS `mat_color`,
 1 AS `shelf_time`,
 1 AS `rework_size`,
 1 AS `product_pid`,
 1 AS `use_piece`,
 1 AS `use_qty`,
 1 AS `use_remark`,
 1 AS `sup_name`,
 1 AS `area`,
 1 AS `location`,
 1 AS `lot_mark`,
 1 AS `lock_qty`,
 1 AS `lock_piece`,
 1 AS `unit`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_tool_buy_profile_type_stock`
--

DROP TABLE IF EXISTS `a_huangliang_view_tool_buy_profile_type_stock`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_buy_profile_type_stock`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_tool_buy_profile_type_stock` AS SELECT 
 1 AS `tsup_id`,
 1 AS `tool_id`,
 1 AS `buy_time`,
 1 AS `buy_qty`,
 1 AS `unit_price`,
 1 AS `total_cost`,
 1 AS `remark`,
 1 AS `create_time`,
 1 AS `create_by`,
 1 AS `modify_time`,
 1 AS `modify_by`,
 1 AS `tool_location`,
 1 AS `tool_type`,
 1 AS `tool_spec`,
 1 AS `tool_newloc`,
 1 AS `type_for`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_tool_cost`
--

DROP TABLE IF EXISTS `a_huangliang_view_tool_cost`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_cost`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_tool_cost` AS SELECT 
 1 AS `tool_use_no`,
 1 AS `buy_time`,
 1 AS `tool_id`,
 1 AS `tsup_id`,
 1 AS `tool_location`,
 1 AS `tool_use_for`,
 1 AS `tool_status`,
 1 AS `use_qty`,
 1 AS `use_cost`,
 1 AS `uselist_remark`,
 1 AS `uselist_status`,
 1 AS `life_remark`,
 1 AS `fix_for`,
 1 AS `fix_no`,
 1 AS `create_time`,
 1 AS `create_by`,
 1 AS `modify_time`,
 1 AS `modify_by`,
 1 AS `tool_type`,
 1 AS `tool_spec`,
 1 AS `tool_profile_is_open`,
 1 AS `type_for`,
 1 AS `is_cost`,
 1 AS `tool_type_is_open`,
 1 AS `use_reason`,
 1 AS `order_id`,
 1 AS `machine_id`,
 1 AS `tool_history_no`,
 1 AS `product_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_tool_mp_history_tool_mp_his_list`
--

DROP TABLE IF EXISTS `a_huangliang_view_tool_mp_history_tool_mp_his_list`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_mp_history_tool_mp_his_list`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_tool_mp_history_tool_mp_his_list` AS SELECT 
 1 AS `tool_history_no`,
 1 AS `order_id`,
 1 AS `machine_id`,
 1 AS `tool_ptime`,
 1 AS `main_chuck`,
 1 AS `second_chuck`,
 1 AS `program_name`,
 1 AS `program_seq`,
 1 AS `mat_code`,
 1 AS `produce_notice`,
 1 AS `work_by`,
 1 AS `create_time`,
 1 AS `create_by`,
 1 AS `modify_time`,
 1 AS `modify_by`,
 1 AS `tool_id`,
 1 AS `tool_use_for`,
 1 AS `use_qty`,
 1 AS `tsup_id`,
 1 AS `uselist_remark`,
 1 AS `life_remark`,
 1 AS `tool_use_no`,
 1 AS `status`,
 1 AS `tool_type`,
 1 AS `tool_spec`,
 1 AS `use_mark`,
 1 AS `tool_ss`,
 1 AS `tool_newloc`,
 1 AS `tool_recloc`,
 1 AS `is_open`,
 1 AS `product_id`,
 1 AS `product_pid`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_tool_mp_use_tool_mp_history_wo_list`
--

DROP TABLE IF EXISTS `a_huangliang_view_tool_mp_use_tool_mp_history_wo_list`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_mp_use_tool_mp_history_wo_list`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_tool_mp_use_tool_mp_history_wo_list` AS SELECT 
 1 AS `tool_use_no`,
 1 AS `use_reason`,
 1 AS `order_id`,
 1 AS `machine_id`,
 1 AS `tool_history_no`,
 1 AS `create_time`,
 1 AS `create_by`,
 1 AS `tool_ptime`,
 1 AS `main_chuck`,
 1 AS `second_chuck`,
 1 AS `program_name`,
 1 AS `program_seq`,
 1 AS `mat_code`,
 1 AS `work_by`,
 1 AS `produce_notice`,
 1 AS `product_id`,
 1 AS `product_pid`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_tool_sp_history_tool_sp_his_list`
--

DROP TABLE IF EXISTS `a_huangliang_view_tool_sp_history_tool_sp_his_list`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_sp_history_tool_sp_his_list`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_tool_sp_history_tool_sp_his_list` AS SELECT 
 1 AS `tool_history_no`,
 1 AS `mstock_name`,
 1 AS `sample_id`,
 1 AS `sample_pid`,
 1 AS `machine_id`,
 1 AS `tool_ptime`,
 1 AS `main_chuck`,
 1 AS `second_chuck`,
 1 AS `program_name`,
 1 AS `program_seq`,
 1 AS `mat_code`,
 1 AS `work_by`,
 1 AS `produce_notice`,
 1 AS `process`,
 1 AS `create_time`,
 1 AS `create_by`,
 1 AS `modify_time`,
 1 AS `modify_by`,
 1 AS `tool_id`,
 1 AS `tool_use_for`,
 1 AS `use_qty`,
 1 AS `tsup_id`,
 1 AS `uselist_remark`,
 1 AS `life_remark`,
 1 AS `tool_use_no`,
 1 AS `status`,
 1 AS `tool_type`,
 1 AS `tool_spec`,
 1 AS `use_mark`,
 1 AS `tool_ss`,
 1 AS `tool_newloc`,
 1 AS `tool_recloc`,
 1 AS `is_open`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_tool_sp_use_tool_sp_history`
--

DROP TABLE IF EXISTS `a_huangliang_view_tool_sp_use_tool_sp_history`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_sp_use_tool_sp_history`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_tool_sp_use_tool_sp_history` AS SELECT 
 1 AS `tool_history_no`,
 1 AS `sample_id`,
 1 AS `sample_pid`,
 1 AS `tool_ptime`,
 1 AS `main_chuck`,
 1 AS `second_chuck`,
 1 AS `program_name`,
 1 AS `program_seq`,
 1 AS `mat_code`,
 1 AS `work_by`,
 1 AS `produce_notice`,
 1 AS `process`,
 1 AS `create_time`,
 1 AS `create_by`,
 1 AS `modify_time`,
 1 AS `modify_by`,
 1 AS `tool_use_no`,
 1 AS `mstock_name`,
 1 AS `use_reason`,
 1 AS `machine_id`,
 1 AS `use_create_by`,
 1 AS `use_create_time`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_tool_stock`
--

DROP TABLE IF EXISTS `a_huangliang_view_tool_stock`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_stock`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_tool_stock` AS SELECT 
 1 AS `tool_stock`,
 1 AS `tool_id`,
 1 AS `tsup_id`,
 1 AS `tool_location`,
 1 AS `use_mark`,
 1 AS `tool_type`,
 1 AS `tool_spec`,
 1 AS `tool_profile_is_open`,
 1 AS `type_for`,
 1 AS `tool_type_is_open`,
 1 AS `location_area`,
 1 AS `tool_status`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_tool_stock_profile_location`
--

DROP TABLE IF EXISTS `a_huangliang_view_tool_stock_profile_location`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_stock_profile_location`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_tool_stock_profile_location` AS SELECT 
 1 AS `buy_time`,
 1 AS `tsup_id`,
 1 AS `tool_id`,
 1 AS `tool_location`,
 1 AS `tool_status`,
 1 AS `tool_stock`,
 1 AS `use_tqty`,
 1 AS `create_time`,
 1 AS `create_by`,
 1 AS `modify_time`,
 1 AS `modify_by`,
 1 AS `chg_time`,
 1 AS `chg_tool_status`,
 1 AS `chg_type`,
 1 AS `chg_qty`,
 1 AS `new_location`,
 1 AS `chg_remark`,
 1 AS `tool_type`,
 1 AS `tool_spec`,
 1 AS `use_mark`,
 1 AS `tool_ss`,
 1 AS `tool_newloc`,
 1 AS `tool_recloc`,
 1 AS `profile_is_open`,
 1 AS `tool_location_for`,
 1 AS `location_area`,
 1 AS `location_is_open`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_tool_stock_sum`
--

DROP TABLE IF EXISTS `a_huangliang_view_tool_stock_sum`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_stock_sum`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_tool_stock_sum` AS SELECT 
 1 AS `tool_stock`,
 1 AS `tool_id`,
 1 AS `tsup_id`,
 1 AS `tool_location`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_tool_stock_tool_mp_list`
--

DROP TABLE IF EXISTS `a_huangliang_view_tool_stock_tool_mp_list`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_stock_tool_mp_list`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_tool_stock_tool_mp_list` AS SELECT 
 1 AS `tool_use_no`,
 1 AS `buy_time`,
 1 AS `tool_id`,
 1 AS `tsup_id`,
 1 AS `tool_location`,
 1 AS `tool_use_for`,
 1 AS `tool_status`,
 1 AS `use_qty`,
 1 AS `use_cost`,
 1 AS `uselist_remark`,
 1 AS `uselist_status`,
 1 AS `life_remark`,
 1 AS `fix_for`,
 1 AS `fix_no`,
 1 AS `create_time`,
 1 AS `create_by`,
 1 AS `modify_time`,
 1 AS `modify_by`,
 1 AS `tool_stock`,
 1 AS `use_tqty`,
 1 AS `tool_type`,
 1 AS `tool_spec`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_tool_stock_tool_profile`
--

DROP TABLE IF EXISTS `a_huangliang_view_tool_stock_tool_profile`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_stock_tool_profile`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_tool_stock_tool_profile` AS SELECT 
 1 AS `buy_time`,
 1 AS `tsup_id`,
 1 AS `tool_id`,
 1 AS `tool_location`,
 1 AS `tool_status`,
 1 AS `tool_stock`,
 1 AS `use_tqty`,
 1 AS `create_time`,
 1 AS `create_by`,
 1 AS `modify_time`,
 1 AS `modify_by`,
 1 AS `tool_type`,
 1 AS `tool_spec`,
 1 AS `use_mark`,
 1 AS `tool_ss`,
 1 AS `tool_newloc`,
 1 AS `tool_recloc`,
 1 AS `is_open`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_tool_stock_tool_profile_tool_location`
--

DROP TABLE IF EXISTS `a_huangliang_view_tool_stock_tool_profile_tool_location`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_stock_tool_profile_tool_location`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_tool_stock_tool_profile_tool_location` AS SELECT 
 1 AS `buy_time`,
 1 AS `tsup_id`,
 1 AS `tool_id`,
 1 AS `tool_location`,
 1 AS `tool_status`,
 1 AS `tool_stock`,
 1 AS `use_tqty`,
 1 AS `create_time`,
 1 AS `create_by`,
 1 AS `modify_time`,
 1 AS `modify_by`,
 1 AS `tool_type`,
 1 AS `tool_spec`,
 1 AS `use_mark`,
 1 AS `tool_ss`,
 1 AS `tool_newloc`,
 1 AS `tool_recloc`,
 1 AS `is_open`,
 1 AS `location_area`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_tool_stock_tool_sp_list`
--

DROP TABLE IF EXISTS `a_huangliang_view_tool_stock_tool_sp_list`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_stock_tool_sp_list`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_tool_stock_tool_sp_list` AS SELECT 
 1 AS `tool_use_no`,
 1 AS `buy_time`,
 1 AS `tool_id`,
 1 AS `tsup_id`,
 1 AS `tool_location`,
 1 AS `tool_use_for`,
 1 AS `tool_status`,
 1 AS `use_qty`,
 1 AS `use_cost`,
 1 AS `uselist_remark`,
 1 AS `uselist_status`,
 1 AS `life_remark`,
 1 AS `create_time`,
 1 AS `create_by`,
 1 AS `modify_time`,
 1 AS `modify_by`,
 1 AS `tool_stock`,
 1 AS `use_tqty`,
 1 AS `tool_type`,
 1 AS `tool_spec`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_wl_wms_wmm_wmml_ms`
--

DROP TABLE IF EXISTS `a_huangliang_view_wl_wms_wmm_wmml_ms`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_wl_wms_wmm_wmml_ms`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_wl_wms_wmm_wmml_ms` AS SELECT 
 1 AS `order_id`,
 1 AS `product_id`,
 1 AS `product_pid`,
 1 AS `customer_id`,
 1 AS `order_qty`,
 1 AS `wo_pqty`,
 1 AS `wo_bqty`,
 1 AS `wo_mqty`,
 1 AS `exp_date`,
 1 AS `wo_status`,
 1 AS `quote_seconds`,
 1 AS `quote_price`,
 1 AS `quoted_by`,
 1 AS `machine_id`,
 1 AS `wo_m_time`,
 1 AS `m_qty`,
 1 AS `m_pqty`,
 1 AS `m_bqty`,
 1 AS `w_m_status`,
 1 AS `exp_mdate`,
 1 AS `exp_edate`,
 1 AS `act_mdate`,
 1 AS `act_edate`,
 1 AS `m_ptime`,
 1 AS `m_usage`,
 1 AS `pg_seq`,
 1 AS `m_mat_time`,
 1 AS `type`,
 1 AS `rework_size`,
 1 AS `m_mat_status`,
 1 AS `delay_notice`,
 1 AS `approve_notice`,
 1 AS `approve_req`,
 1 AS `finish_time`,
 1 AS `shelf_time`,
 1 AS `mstock_name`,
 1 AS `po_no`,
 1 AS `mat_code`,
 1 AS `location`,
 1 AS `use_piece`,
 1 AS `use_qty`,
 1 AS `use_remark`,
 1 AS `fb_piece`,
 1 AS `fb_qty`,
 1 AS `use_cost`,
 1 AS `item_status`,
 1 AS `sup_id`,
 1 AS `mat_id`,
 1 AS `mat_length`,
 1 AS `mat_od`,
 1 AS `mat_color`,
 1 AS `mat_price`,
 1 AS `mat_price_ref_date`,
 1 AS `mat_price_ref_sup_id`,
 1 AS `area`,
 1 AS `lot_mark`,
 1 AS `p_weight`,
 1 AS `stock_piece`,
 1 AS `mstock_qty`,
 1 AS `unit`,
 1 AS `temp_od`,
 1 AS `temp_length`,
 1 AS `mstock_time`,
 1 AS `mrp_bcode`,
 1 AS `lock_qty`,
 1 AS `lock_piece`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_wms_wmm_wmml_ms`
--

DROP TABLE IF EXISTS `a_huangliang_view_wms_wmm_wmml_ms`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_wms_wmm_wmml_ms`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_wms_wmm_wmml_ms` AS SELECT 
 1 AS `order_id`,
 1 AS `machine_id`,
 1 AS `wo_m_time`,
 1 AS `m_qty`,
 1 AS `m_pqty`,
 1 AS `m_bqty`,
 1 AS `w_m_status`,
 1 AS `exp_mdate`,
 1 AS `exp_edate`,
 1 AS `act_mdate`,
 1 AS `act_edate`,
 1 AS `m_ptime`,
 1 AS `m_usage`,
 1 AS `pg_seq`,
 1 AS `m_mat_time`,
 1 AS `type`,
 1 AS `rework_size`,
 1 AS `m_mat_status`,
 1 AS `delay_notice`,
 1 AS `approve_notice`,
 1 AS `approve_req`,
 1 AS `finish_time`,
 1 AS `shelf_time`,
 1 AS `mstock_name`,
 1 AS `po_no`,
 1 AS `mat_code`,
 1 AS `location`,
 1 AS `use_piece`,
 1 AS `use_qty`,
 1 AS `use_remark`,
 1 AS `fb_piece`,
 1 AS `fb_qty`,
 1 AS `use_cost`,
 1 AS `item_status`,
 1 AS `sup_id`,
 1 AS `mat_id`,
 1 AS `mat_length`,
 1 AS `mat_od`,
 1 AS `mat_color`,
 1 AS `mat_price`,
 1 AS `mat_price_ref_date`,
 1 AS `mat_price_ref_sup_id`,
 1 AS `area`,
 1 AS `lot_mark`,
 1 AS `p_weight`,
 1 AS `stock_piece`,
 1 AS `mstock_qty`,
 1 AS `unit`,
 1 AS `temp_od`,
 1 AS `temp_length`,
 1 AS `mstock_time`,
 1 AS `mrp_bcode`,
 1 AS `lock_qty`,
 1 AS `lock_piece`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_wo_list_production_scheduling`
--

DROP TABLE IF EXISTS `a_huangliang_view_wo_list_production_scheduling`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_wo_list_production_scheduling`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_wo_list_production_scheduling` AS SELECT 
 1 AS `order_id`,
 1 AS `product_id`,
 1 AS `product_pid`,
 1 AS `customer_id`,
 1 AS `order_qty`,
 1 AS `wo_pqty`,
 1 AS `wo_bqty`,
 1 AS `wo_mqty`,
 1 AS `exp_date`,
 1 AS `wo_status`,
 1 AS `use_cost`,
 1 AS `quote_seconds`,
 1 AS `quote_price`,
 1 AS `quoted_by`,
 1 AS `create_by`,
 1 AS `create_time`,
 1 AS `modify_by`,
 1 AS `modify_time`,
 1 AS `schedule_time`,
 1 AS `machine_id`,
 1 AS `schedule_quantity`,
 1 AS `schedule_status`,
 1 AS `exp_mdate`,
 1 AS `exp_edate`,
 1 AS `correction_time`,
 1 AS `buffer_time`,
 1 AS `prev_partcount_diff_ratio`,
 1 AS `prev_efficiency_utilization`,
 1 AS `mat_control`,
 1 AS `m_ptime`,
 1 AS `m_usage`,
 1 AS `pg_seq`,
 1 AS `schedule_uncheck_notice`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_wo_m_mat_wo_list`
--

DROP TABLE IF EXISTS `a_huangliang_view_wo_m_mat_wo_list`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_wo_m_mat_wo_list`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_wo_m_mat_wo_list` AS SELECT 
 1 AS `order_id`,
 1 AS `machine_id`,
 1 AS `wo_m_time`,
 1 AS `m_mat_time`,
 1 AS `type`,
 1 AS `rework_size`,
 1 AS `m_mat_status`,
 1 AS `delay_notice`,
 1 AS `approve_notice`,
 1 AS `approve_req`,
 1 AS `finish_time`,
 1 AS `create_by`,
 1 AS `create_time`,
 1 AS `modify_by`,
 1 AS `modify_time`,
 1 AS `product_id`,
 1 AS `product_pid`,
 1 AS `customer_id`,
 1 AS `order_qty`,
 1 AS `wo_pqty`,
 1 AS `wo_bqty`,
 1 AS `wo_mqty`,
 1 AS `exp_date`,
 1 AS `wo_status`,
 1 AS `wo_list_create_time`,
 1 AS `wo_list_modify_time`,
 1 AS `wo_list_create_by`,
 1 AS `wo_list_modify_by`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_wo_m_mat_wo_m_mat_list_mat_stock`
--

DROP TABLE IF EXISTS `a_huangliang_view_wo_m_mat_wo_m_mat_list_mat_stock`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_wo_m_mat_wo_m_mat_list_mat_stock`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_wo_m_mat_wo_m_mat_list_mat_stock` AS SELECT 
 1 AS `order_id`,
 1 AS `machine_id`,
 1 AS `wo_m_time`,
 1 AS `m_mat_time`,
 1 AS `shelf_time`,
 1 AS `mstock_name`,
 1 AS `location`,
 1 AS `use_piece`,
 1 AS `use_qty`,
 1 AS `use_remark`,
 1 AS `fb_piece`,
 1 AS `fb_qty`,
 1 AS `item_status`,
 1 AS `m_mat_list_create_by`,
 1 AS `m_mat_list_create_time`,
 1 AS `m_mat_list_modify_by`,
 1 AS `m_mat_list_modify_time`,
 1 AS `type`,
 1 AS `rework_size`,
 1 AS `m_mat_status`,
 1 AS `delay_notice`,
 1 AS `approve_notice`,
 1 AS `approve_req`,
 1 AS `m_mat_create_time`,
 1 AS `m_mat_create_by`,
 1 AS `m_mat_modify_time`,
 1 AS `m_mat_modify_by`,
 1 AS `po_no`,
 1 AS `sup_id`,
 1 AS `mat_code`,
 1 AS `mat_id`,
 1 AS `mat_length`,
 1 AS `mat_od`,
 1 AS `mat_color`,
 1 AS `mat_price`,
 1 AS `mat_price_ref_date`,
 1 AS `mat_price_ref_sup_id`,
 1 AS `area`,
 1 AS `lot_mark`,
 1 AS `p_weight`,
 1 AS `stock_piece`,
 1 AS `mstock_qty`,
 1 AS `unit`,
 1 AS `temp_od`,
 1 AS `temp_length`,
 1 AS `mstock_time`,
 1 AS `mrp_bcode`,
 1 AS `lock_qty`,
 1 AS `lock_piece`,
 1 AS `mat_stock_create_by`,
 1 AS `mat_stock_create_time`,
 1 AS `mat_stock_modify_by`,
 1 AS `mat_stock_modify_time`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `a_huangliang_view_wo_m_status_wo_list`
--

DROP TABLE IF EXISTS `a_huangliang_view_wo_m_status_wo_list`;
/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_wo_m_status_wo_list`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `a_huangliang_view_wo_m_status_wo_list` AS SELECT 
 1 AS `order_id`,
 1 AS `machine_id`,
 1 AS `wo_m_time`,
 1 AS `m_qty`,
 1 AS `m_pqty`,
 1 AS `m_bqty`,
 1 AS `w_m_status`,
 1 AS `exp_mdate`,
 1 AS `exp_edate`,
 1 AS `act_mdate`,
 1 AS `act_edate`,
 1 AS `m_ptime`,
 1 AS `m_usage`,
 1 AS `pg_seq`,
 1 AS `mat_control`,
 1 AS `correction_time`,
 1 AS `buffer_time`,
 1 AS `create_by`,
 1 AS `create_time`,
 1 AS `modify_by`,
 1 AS `modify_time`,
 1 AS `product_id`,
 1 AS `product_pid`,
 1 AS `customer_id`,
 1 AS `order_qty`,
 1 AS `wo_pqty`,
 1 AS `wo_bqty`,
 1 AS `wo_mqty`,
 1 AS `exp_date`,
 1 AS `wo_status`,
 1 AS `wo_list_create_time`,
 1 AS `wo_list_modify_time`,
 1 AS `wo_list_create_by`,
 1 AS `wo_list_modify_by`,
 1 AS `material_assign_count`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `a_huangliang_wo_list`
--

DROP TABLE IF EXISTS `a_huangliang_wo_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_wo_list` (
  `order_id` char(11) NOT NULL DEFAULT '' COMMENT '訂單編號',
  `product_id` varchar(30) NOT NULL COMMENT '管編',
  `product_pid` varchar(50) DEFAULT NULL COMMENT '圖號',
  `customer_id` varchar(10) DEFAULT NULL COMMENT '客戶代碼',
  `order_qty` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '訂單總量',
  `wo_pqty` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '生產總量',
  `wo_bqty` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '不良總量',
  `wo_mqty` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '派工總量',
  `exp_date` date DEFAULT NULL COMMENT '期望交期',
  `wo_status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '生產指令狀態',
  `use_cost` decimal(12,2) DEFAULT NULL COMMENT '使用材料成本',
  `quote_seconds` decimal(8,2) unsigned NOT NULL DEFAULT '0.00' COMMENT '報價秒數',
  `quote_price` decimal(8,2) NOT NULL DEFAULT '0.00' COMMENT '單顆報價',
  `quoted_by` varchar(45) NOT NULL DEFAULT '' COMMENT '報價人員',
  `multiprogram` tinyint(2) unsigned NOT NULL DEFAULT '1',
  `create_by` varchar(50) NOT NULL COMMENT '建立人',
  `create_time` datetime NOT NULL COMMENT '建立日期',
  `modify_by` varchar(50) NOT NULL COMMENT '修改人',
  `modify_time` datetime NOT NULL COMMENT '修改日期',
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='生產指令';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_wo_list_chg_log`
--

DROP TABLE IF EXISTS `a_huangliang_wo_list_chg_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_wo_list_chg_log` (
  `order_id` char(11) NOT NULL COMMENT '訂單編號',
  `previous_wo_status` tinyint(4) DEFAULT NULL COMMENT '變更前生產指令狀態',
  `changed_wo_status` tinyint(4) DEFAULT NULL COMMENT '變更後生產指令狀態',
  `create_by` varchar(50) NOT NULL COMMENT '建立人',
  `create_time` datetime NOT NULL COMMENT '建立日期',
  PRIMARY KEY (`order_id`,`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_wo_m_mat`
--

DROP TABLE IF EXISTS `a_huangliang_wo_m_mat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_wo_m_mat` (
  `order_id` char(11) NOT NULL DEFAULT '' COMMENT '訂單編號',
  `machine_id` varchar(45) NOT NULL DEFAULT '' COMMENT '機台編號',
  `wo_m_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '機台派工時間',
  `m_mat_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '材料派工時間',
  `type` tinyint(3) unsigned NOT NULL DEFAULT '1' COMMENT '型態。1:領料/2:補料/3:退庫',
  `rework_size` varchar(45) DEFAULT NULL COMMENT '修尾尺寸',
  `m_mat_status` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '材料派工狀態。0:開立/1:領(退)料中/2:移入待審/9:已完成/99:取消',
  `delay_notice` char(1) NOT NULL DEFAULT 'N' COMMENT '延遲通知。Y/N',
  `approve_notice` char(1) NOT NULL DEFAULT 'N' COMMENT '審核通知。Y/N',
  `approve_req` char(1) NOT NULL DEFAULT 'N' COMMENT '審核需求。Y/N',
  `finish_time` datetime DEFAULT NULL COMMENT '派工完成時間',
  `create_by` varchar(45) NOT NULL DEFAULT '',
  `create_time` varchar(45) NOT NULL DEFAULT '',
  `modify_by` varchar(45) NOT NULL DEFAULT '',
  `modify_time` varchar(45) NOT NULL DEFAULT '',
  PRIMARY KEY (`order_id`,`machine_id`,`wo_m_time`,`m_mat_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='機台材料派工';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_wo_m_mat_list`
--

DROP TABLE IF EXISTS `a_huangliang_wo_m_mat_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_wo_m_mat_list` (
  `order_id` char(11) NOT NULL DEFAULT '' COMMENT '訂單編號',
  `machine_id` varchar(45) NOT NULL DEFAULT '' COMMENT '機台編號',
  `wo_m_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '機台派工時間',
  `m_mat_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '材料派工時間',
  `shelf_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '暫上架時間',
  `mstock_name` varchar(20) NOT NULL DEFAULT '' COMMENT '材料庫',
  `po_no` varchar(50) NOT NULL DEFAULT '' COMMENT '採購單號',
  `mat_code` varchar(50) NOT NULL DEFAULT '' COMMENT '材料條碼',
  `location` varchar(20) DEFAULT NULL COMMENT '位置',
  `use_piece` decimal(8,2) unsigned DEFAULT NULL COMMENT '派工支數',
  `use_qty` decimal(8,2) unsigned DEFAULT NULL COMMENT '派工重量',
  `use_remark` varchar(45) DEFAULT NULL COMMENT '派工備註',
  `fb_piece` decimal(8,2) unsigned DEFAULT NULL COMMENT '回饋支數',
  `fb_qty` decimal(8,2) unsigned DEFAULT NULL COMMENT '回饋重量',
  `use_cost` decimal(12,2) unsigned DEFAULT NULL COMMENT '使用成本。材料單價*派工數量',
  `item_status` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '項目狀態。0:開立/1:派工中/2:移料中/3:移料待審/9:完成/99:取消',
  `create_by` varchar(45) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `modify_by` varchar(45) NOT NULL DEFAULT '',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `sup_id` varchar(20) NOT NULL DEFAULT '' COMMENT '廠商代碼',
  PRIMARY KEY (`order_id`,`machine_id`,`wo_m_time`,`m_mat_time`,`shelf_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='機台材料派工儲位明細';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_wo_m_status`
--

DROP TABLE IF EXISTS `a_huangliang_wo_m_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_wo_m_status` (
  `order_id` char(11) NOT NULL DEFAULT '' COMMENT '訂單編號',
  `machine_id` varchar(45) NOT NULL DEFAULT '' COMMENT '機台編號',
  `wo_m_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '機台派工時間',
  `m_qty` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '派工數量',
  `m_pqty` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '已生產',
  `m_bqty` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '不良數。例檢不良Qty+ QC不良QTY',
  `w_m_status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '派工狀態。0:待上線/1:首次領料/2:生產中/3:下線/取消/9:結案/99:取消',
  `exp_mdate` datetime DEFAULT NULL COMMENT '預計生產日',
  `exp_edate` datetime DEFAULT NULL COMMENT '預計完成日。機台派工預計生產日期+派工數*標工',
  `act_mdate` datetime DEFAULT NULL COMMENT '實際生產日。機台首次按Macro521=100上線，更新實際生產日期',
  `act_edate` datetime DEFAULT NULL COMMENT '實際完工日。機台派工結案日期',
  `m_ptime` decimal(8,2) unsigned DEFAULT NULL COMMENT '標工。帶入管編基本檔資料',
  `m_usage` decimal(8,2) DEFAULT NULL COMMENT '單件用量。帶入管編基本檔資料',
  `pg_seq` tinyint(3) unsigned DEFAULT NULL COMMENT '製程順序',
  `mat_control` varchar(1) NOT NULL DEFAULT 'Y' COMMENT '材料監控。Y/N',
  `correction_time` tinyint(4) unsigned NOT NULL DEFAULT '8' COMMENT '校車時間預留',
  `buffer_time` tinyint(4) unsigned NOT NULL DEFAULT '24' COMMENT '緩衝時間預留',
  `create_by` varchar(45) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL,
  `modify_by` varchar(45) NOT NULL DEFAULT '',
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`order_id`,`machine_id`,`wo_m_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='生產指令機台派工';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_huangliang_wo_po_binding`
--

DROP TABLE IF EXISTS `a_huangliang_wo_po_binding`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_huangliang_wo_po_binding` (
  `order_id` char(11) NOT NULL DEFAULT '' COMMENT '訂單編號',
  `mstock_name` varchar(20) NOT NULL DEFAULT '' COMMENT '材料庫',
  `po_no` varchar(50) NOT NULL DEFAULT '' COMMENT '採購單',
  `sup_id` varchar(20) NOT NULL DEFAULT '' COMMENT '供應商',
  `mat_code` varchar(40) NOT NULL DEFAULT '' COMMENT '材料條碼',
  `bind_qty` decimal(8,2) unsigned NOT NULL DEFAULT '0.00' COMMENT '綁定數量',
  `use_qty` decimal(8,2) unsigned NOT NULL DEFAULT '0.00' COMMENT '已領數量',
  `w_p_status` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '綁定狀態。0:解除綁定/1:綁定，生產指令結案時將狀態改為解除綁定',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '維護者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '維護時間',
  PRIMARY KEY (`order_id`,`mstock_name`,`po_no`,`sup_id`,`mat_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='生產指令綁定採購單';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `a_huangliang_view_mat_mat_list_wo_list_mat_stock`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_mat_mat_list_wo_list_mat_stock`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_mat_mat_list_wo_list_mat_stock` AS select `m`.`order_id` AS `order_id`,`l`.`product_id` AS `product_id`,`m`.`finish_time` AS `finish_time`,`m`.`type` AS `type`,`ml`.`mat_code` AS `mat_code`,`ms`.`mrp_bcode` AS `mrp_bcode`,`ms`.`shelf_time` AS `shelf_time`,`ms`.`po_no` AS `po_no`,`ml`.`use_qty` AS `use_qty` from (((`a_huangliang_wo_m_mat` `m` join `a_huangliang_wo_m_mat_list` `ml` on(((`ml`.`order_id` = `m`.`order_id`) and (`ml`.`machine_id` = `m`.`machine_id`) and (`ml`.`wo_m_time` = `m`.`wo_m_time`) and (`ml`.`m_mat_time` = `m`.`m_mat_time`)))) join `a_huangliang_wo_list` `l` on((`m`.`order_id` = `l`.`order_id`))) join `a_huangliang_mat_stock` `ms` on(((`ml`.`shelf_time` = `ms`.`shelf_time`) and (`ml`.`mat_code` = `ms`.`mat_code`)))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_mat_status`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_mat_status`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_mat_status` AS select `w`.`order_id` AS `order_id`,`w`.`machine_id` AS `machine_id`,`w`.`wo_m_time` AS `wo_m_time`,`w`.`m_qty` AS `m_qty`,`w`.`m_pqty` AS `m_pqty`,`w`.`m_bqty` AS `m_bqty`,`w`.`w_m_status` AS `w_m_status`,`w`.`exp_mdate` AS `exp_mdate`,`w`.`exp_edate` AS `exp_edate`,`w`.`act_mdate` AS `act_mdate`,`w`.`act_edate` AS `act_edate`,`w`.`m_ptime` AS `m_ptime`,`w`.`m_usage` AS `m_usage`,`w`.`pg_seq` AS `pg_seq`,`w`.`mat_control` AS `mat_control`,`w`.`create_by` AS `create_by`,`w`.`create_time` AS `create_time`,`w`.`modify_by` AS `modify_by`,`w`.`modify_time` AS `modify_time`,`w`.`product_id` AS `product_id`,`w`.`product_pid` AS `product_pid`,`w`.`customer_id` AS `customer_id`,`w`.`order_qty` AS `order_qty`,`w`.`wo_pqty` AS `wo_pqty`,`w`.`wo_bqty` AS `wo_bqty`,`w`.`wo_mqty` AS `wo_mqty`,`w`.`exp_date` AS `exp_date`,`w`.`wo_status` AS `wo_status`,`w`.`wo_list_create_time` AS `wo_list_create_time`,`w`.`wo_list_modify_time` AS `wo_list_modify_time`,`w`.`wo_list_create_by` AS `wo_list_create_by`,`w`.`wo_list_modify_by` AS `wo_list_modify_by`,`w`.`material_assign_count` AS `material_assign_count`,`wm`.`m_mat_time` AS `m_mat_time`,`wm`.`mstock_name` AS `mstock_name`,`wm`.`mat_code` AS `mat_code`,`wm`.`mat_length` AS `mat_length`,`wm`.`rework_size` AS `rework_size`,`wm`.`shelf_time` AS `shelf_time`,`wm`.`location` AS `location`,`wm`.`item_status` AS `item_status`,`wm`.`m_mat_list_create_time` AS `m_mat_list_create_time`,`wm`.`m_mat_list_modify_time` AS `m_mat_list_modify_time`,`wm`.`type` AS `type`,`ml`.`mac_type` AS `mac_type`,`ml`.`create_time` AS `mac_list_create_time`,`ml`.`modify_time` AS `mac_list_modify_time`,`ml`.`c_scrapsize` AS `c_scrapsize`,`ml`.`t_scrapsize` AS `t_scrapsize` from ((`a_huangliang_view_wo_m_status_wo_list` `w` join `a_huangliang_view_wo_m_mat_wo_m_mat_list_mat_stock` `wm` on(((`w`.`machine_id` = `wm`.`machine_id`) and (`w`.`order_id` = `wm`.`order_id`) and (`w`.`wo_m_time` = `wm`.`wo_m_time`)))) join `a_huangliang_mac_list` `ml` on((`w`.`machine_id` = `ml`.`machine_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_mat_stock_mat_stock_chg_log`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_mat_stock_mat_stock_chg_log`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_mat_stock_mat_stock_chg_log` AS select `a`.`mstock_name` AS `mstock_name`,`a`.`po_no` AS `po_no`,`a`.`sup_id` AS `sup_id`,`a`.`mat_code` AS `mat_code`,`a`.`shelf_time` AS `shelf_time`,`a`.`location` AS `location`,`a`.`chg_type` AS `chg_type`,`a`.`orig_qty` AS `orig_qty`,`a`.`chg_qty` AS `chg_qty`,`a`.`chg_reason` AS `chg_reason`,`a`.`chg_time` AS `chg_time`,`a`.`chg_by` AS `chg_by`,`a`.`orig_location` AS `orig_location`,`a`.`chg_location` AS `chg_location`,`b`.`mat_color` AS `mat_color`,`b`.`mat_length` AS `mat_length` from (`a_huangliang_mat_stock_chg_log` `a` left join `a_huangliang_mat_stock` `b` on(((`a`.`mat_code` = `b`.`mat_code`) and (`a`.`shelf_time` = `b`.`shelf_time`)))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_po_temp_stock_po_file`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_po_temp_stock_po_file`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_po_temp_stock_po_file` AS select `a`.`mstock_name` AS `mstock_name`,`a`.`po_no` AS `po_no`,`a`.`sup_id` AS `sup_id`,`a`.`mat_code` AS `mat_code`,`a`.`po_qty` AS `po_qty`,`a`.`unit` AS `unit`,`a`.`mat_id` AS `mat_id`,`a`.`mat_length` AS `mat_length`,`a`.`mat_od` AS `mat_od`,`a`.`mat_color` AS `mat_color`,`a`.`shelf_piece` AS `shelf_piece`,`a`.`shelf_qty` AS `shelf_qty`,`a`.`area` AS `area`,`a`.`location` AS `location`,`a`.`shelf_time` AS `shelf_time`,`a`.`shelf_by` AS `shelf_by`,`a`.`iqc_result` AS `iqc_result`,`a`.`iqc_mat_id` AS `iqc_mat_id`,`a`.`iqc_od` AS `iqc_od`,`a`.`iqc_length` AS `iqc_length`,`a`.`iqc_location` AS `iqc_location`,`a`.`iqc_qty` AS `iqc_qty`,`a`.`iqc_quality` AS `iqc_quality`,`a`.`iqc_ng_reason` AS `iqc_ng_reason`,`a`.`iqc_time` AS `iqc_time`,`a`.`iqc_by` AS `iqc_by`,`a`.`return_qty` AS `return_qty`,`a`.`return_time` AS `return_time`,`a`.`return_by` AS `return_by`,`a`.`mstock_qty` AS `mstock_qty`,`a`.`mstock_time` AS `mstock_time`,`a`.`mstock_by` AS `mstock_by`,`a`.`status` AS `status`,`a`.`shelf_pm_notice` AS `shelf_pm_notice`,`a`.`shelf_qc_notice` AS `shelf_qc_notice`,`a`.`iqc_delay_notice` AS `iqc_delay_notice`,`a`.`iqc_ok_notice` AS `iqc_ok_notice`,`a`.`iqc_ng_notice` AS `iqc_ng_notice`,`a`.`return_notice` AS `return_notice`,`b`.`mat_name` AS `mat_name` from (`a_huangliang_po_temp_stock` `a` left join `a_huangliang_po_file` `b` on(((`a`.`mstock_name` = `b`.`mstock_name`) and (`a`.`po_no` = `b`.`po_no`) and (`a`.`sup_id` = `b`.`sup_id`) and (`a`.`mat_code` = `b`.`mat_code`)))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_product_profile_tool_sp_history`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_product_profile_tool_sp_history`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_product_profile_tool_sp_history` AS select `pp`.`product_id` AS `product_id`,`pp`.`product_pid` AS `product_pid`,`tsph`.`tool_history_no` AS `tool_history_no`,`tsph`.`mstock_name` AS `mstock_name`,`tsph`.`sample_id` AS `sample_id`,`tsph`.`sample_pid` AS `sample_pid`,`tsph`.`machine_id` AS `machine_id`,`tsph`.`tool_ptime` AS `tool_ptime`,`tsph`.`main_chuck` AS `main_chuck`,`tsph`.`second_chuck` AS `second_chuck`,`tsph`.`program_name` AS `program_name`,`tsph`.`program_seq` AS `program_seq`,`tsph`.`mat_code` AS `mat_code`,`tsph`.`work_by` AS `work_by`,`tsph`.`produce_notice` AS `produce_notice`,`tsph`.`process` AS `process`,`tsph`.`create_time` AS `create_time`,`tsph`.`create_by` AS `create_by`,`tsph`.`modify_time` AS `modify_time`,`tsph`.`modify_by` AS `modify_by` from (`a_huangliang_product_profile` `pp` left join `a_huangliang_tool_sp_history` `tsph` on((`pp`.`product_pid` = `tsph`.`sample_pid`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_product_profile_wo_list`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_product_profile_wo_list`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_product_profile_wo_list` AS select `a`.`mstock_name` AS `mstock_name`,`a`.`product_id` AS `product_id`,`a`.`product_pid` AS `product_pid`,`a`.`mat_id` AS `mat_id`,`a`.`mat_shape` AS `mat_shape`,`a`.`mat_dim` AS `mat_dim`,`a`.`mat_usage` AS `mat_usage`,`a`.`process` AS `process`,`a`.`multiprogram` AS `multiprogram`,`a`.`def_runtime` AS `def_runtime`,`a`.`def_mactype` AS `def_mactype`,`a`.`create_by` AS `create_by`,`a`.`create_time` AS `create_time`,`a`.`modify_by` AS `modify_by`,`a`.`modify_time` AS `modify_time`,`b`.`order_id` AS `order_id`,`b`.`customer_id` AS `customer_id`,`b`.`order_qty` AS `order_qty`,`b`.`wo_pqty` AS `wo_pqty`,`b`.`wo_bqty` AS `wo_bqty`,`b`.`wo_mqty` AS `wo_mqty`,`b`.`exp_date` AS `exp_date`,`b`.`wo_status` AS `wo_status`,`b`.`create_time` AS `wo_list_create_time`,`b`.`modify_time` AS `wo_list_modify_time`,`b`.`create_by` AS `wo_list_create_by`,`b`.`modify_by` AS `wo_list_modify_by` from (`a_huangliang_product_profile` `a` left join `a_huangliang_wo_list` `b` on((`a`.`product_id` = `b`.`product_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_stock_mat_list`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_stock_mat_list`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_stock_mat_list` AS select `wmml`.`order_id` AS `order_id`,`wmml`.`machine_id` AS `machine_id`,`wmml`.`wo_m_time` AS `wo_m_time`,`wmml`.`m_mat_time` AS `m_mat_time`,`wmml`.`po_no` AS `po_no`,`ms`.`mstock_name` AS `mstock_name`,`ms`.`sup_id` AS `sup_id`,`ms`.`mat_code` AS `mat_code`,`ms`.`mat_id` AS `mat_id`,`ms`.`mat_length` AS `mat_length`,`ms`.`mat_od` AS `mat_od`,`ms`.`mat_color` AS `mat_color`,`wmml`.`shelf_time` AS `shelf_time`,`vwmmwl`.`rework_size` AS `rework_size`,`vwmmwl`.`product_pid` AS `product_pid`,`wmml`.`use_piece` AS `use_piece`,`wmml`.`use_qty` AS `use_qty`,`wmml`.`use_remark` AS `use_remark`,`s`.`sup_name` AS `sup_name`,`ms`.`area` AS `area`,`ms`.`location` AS `location`,`ms`.`lot_mark` AS `lot_mark`,`ms`.`lock_qty` AS `lock_qty`,`ms`.`lock_piece` AS `lock_piece`,`ms`.`unit` AS `unit` from (((`a_huangliang_wo_m_mat_list` `wmml` left join `a_huangliang_view_wo_m_mat_wo_list` `vwmmwl` on(((`wmml`.`order_id` = `vwmmwl`.`order_id`) and (`wmml`.`machine_id` = `vwmmwl`.`machine_id`) and (`wmml`.`wo_m_time` = `vwmmwl`.`wo_m_time`) and (`wmml`.`m_mat_time` = `vwmmwl`.`m_mat_time`)))) left join `a_huangliang_mat_stock` `ms` on(((`wmml`.`shelf_time` = `ms`.`shelf_time`) and (`wmml`.`mat_code` = `ms`.`mat_code`)))) left join `a_huangliang_supplier` `s` on((`ms`.`sup_id` = `s`.`sup_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_tool_buy_profile_type_stock`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_buy_profile_type_stock`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_tool_buy_profile_type_stock` AS select `tb`.`tsup_id` AS `tsup_id`,`tb`.`tool_id` AS `tool_id`,`tb`.`buy_time` AS `buy_time`,`tb`.`buy_qty` AS `buy_qty`,`tb`.`unit_price` AS `unit_price`,`tb`.`total_cost` AS `total_cost`,`tb`.`remark` AS `remark`,`tb`.`create_time` AS `create_time`,`tb`.`create_by` AS `create_by`,`tb`.`modify_time` AS `modify_time`,`tb`.`modify_by` AS `modify_by`,`ts`.`tool_location` AS `tool_location`,`tp`.`tool_type` AS `tool_type`,`tp`.`tool_spec` AS `tool_spec`,`tp`.`tool_newloc` AS `tool_newloc`,`tt`.`type_for` AS `type_for` from (((`a_huangliang_tool_buy` `tb` left join `a_huangliang_tool_stock` `ts` on(((`tb`.`tsup_id` = `ts`.`tsup_id`) and (`tb`.`tool_id` = `ts`.`tool_id`) and (`tb`.`buy_time` = `ts`.`buy_time`)))) left join `a_huangliang_tool_profile` `tp` on((`tp`.`tool_id` = `tb`.`tool_id`))) left join `a_huangliang_tool_type` `tt` on((`tt`.`tool_type` = `tp`.`tool_type`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_tool_cost`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_cost`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_tool_cost` AS select `t1`.`tool_use_no` AS `tool_use_no`,`t1`.`buy_time` AS `buy_time`,`t1`.`tool_id` AS `tool_id`,`t1`.`tsup_id` AS `tsup_id`,`t1`.`tool_location` AS `tool_location`,`t1`.`tool_use_for` AS `tool_use_for`,`t1`.`tool_status` AS `tool_status`,`t1`.`use_qty` AS `use_qty`,`t1`.`use_cost` AS `use_cost`,`t1`.`uselist_remark` AS `uselist_remark`,`t1`.`uselist_status` AS `uselist_status`,`t1`.`life_remark` AS `life_remark`,`t1`.`fix_for` AS `fix_for`,`t1`.`fix_no` AS `fix_no`,`t1`.`create_time` AS `create_time`,`t1`.`create_by` AS `create_by`,`t1`.`modify_time` AS `modify_time`,`t1`.`modify_by` AS `modify_by`,`t2`.`tool_type` AS `tool_type`,`t2`.`tool_spec` AS `tool_spec`,`t2`.`is_open` AS `tool_profile_is_open`,`t3`.`type_for` AS `type_for`,`t3`.`is_cost` AS `is_cost`,`t3`.`is_open` AS `tool_type_is_open`,`t4`.`use_reason` AS `use_reason`,`t4`.`order_id` AS `order_id`,`t4`.`machine_id` AS `machine_id`,`t4`.`tool_history_no` AS `tool_history_no`,`t5`.`product_id` AS `product_id` from ((((`a_huangliang_tool_mp_list` `t1` join `a_huangliang_tool_profile` `t2` on((`t1`.`tool_id` = `t2`.`tool_id`))) join `a_huangliang_tool_type` `t3` on((`t2`.`tool_type` = `t3`.`tool_type`))) join `a_huangliang_tool_mp_use` `t4` on((`t4`.`tool_use_no` = `t1`.`tool_use_no`))) join `a_huangliang_wo_list` `t5` on((`t4`.`order_id` = `t5`.`order_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_tool_mp_history_tool_mp_his_list`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_mp_history_tool_mp_his_list`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_tool_mp_history_tool_mp_his_list` AS select `h`.`tool_history_no` AS `tool_history_no`,`h`.`order_id` AS `order_id`,`h`.`machine_id` AS `machine_id`,`h`.`tool_ptime` AS `tool_ptime`,`h`.`main_chuck` AS `main_chuck`,`h`.`second_chuck` AS `second_chuck`,`h`.`program_name` AS `program_name`,`h`.`program_seq` AS `program_seq`,`h`.`mat_code` AS `mat_code`,`h`.`produce_notice` AS `produce_notice`,`h`.`work_by` AS `work_by`,`h`.`create_time` AS `create_time`,`h`.`create_by` AS `create_by`,`h`.`modify_time` AS `modify_time`,`h`.`modify_by` AS `modify_by`,`hl`.`tool_id` AS `tool_id`,`hl`.`tool_use_for` AS `tool_use_for`,`hl`.`use_qty` AS `use_qty`,`hl`.`tsup_id` AS `tsup_id`,`hl`.`uselist_remark` AS `uselist_remark`,`hl`.`life_remark` AS `life_remark`,`hl`.`tool_use_no` AS `tool_use_no`,`hl`.`status` AS `status`,`p`.`tool_type` AS `tool_type`,`p`.`tool_spec` AS `tool_spec`,`p`.`use_mark` AS `use_mark`,`p`.`tool_ss` AS `tool_ss`,`p`.`tool_newloc` AS `tool_newloc`,`p`.`tool_recloc` AS `tool_recloc`,`p`.`is_open` AS `is_open`,`wl`.`product_id` AS `product_id`,`wl`.`product_pid` AS `product_pid` from (((`a_huangliang_tool_mp_history` `h` left join `a_huangliang_tool_mp_his_list` `hl` on((`h`.`tool_history_no` = `hl`.`tool_history_no`))) left join `a_huangliang_tool_profile` `p` on((`hl`.`tool_id` = `p`.`tool_id`))) left join `a_huangliang_wo_list` `wl` on((`h`.`order_id` = `wl`.`order_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_tool_mp_use_tool_mp_history_wo_list`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_mp_use_tool_mp_history_wo_list`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_tool_mp_use_tool_mp_history_wo_list` AS select `u`.`tool_use_no` AS `tool_use_no`,`u`.`use_reason` AS `use_reason`,`u`.`order_id` AS `order_id`,`u`.`machine_id` AS `machine_id`,`u`.`tool_history_no` AS `tool_history_no`,`u`.`create_time` AS `create_time`,`u`.`create_by` AS `create_by`,`mh`.`tool_ptime` AS `tool_ptime`,`mh`.`main_chuck` AS `main_chuck`,`mh`.`second_chuck` AS `second_chuck`,`mh`.`program_name` AS `program_name`,`mh`.`program_seq` AS `program_seq`,`mh`.`mat_code` AS `mat_code`,`mh`.`work_by` AS `work_by`,`mh`.`produce_notice` AS `produce_notice`,`wl`.`product_id` AS `product_id`,`wl`.`product_pid` AS `product_pid` from ((`a_huangliang_tool_mp_use` `u` left join `a_huangliang_tool_mp_history` `mh` on((`u`.`tool_history_no` = `mh`.`tool_history_no`))) left join `a_huangliang_wo_list` `wl` on((`mh`.`order_id` = `wl`.`order_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_tool_sp_history_tool_sp_his_list`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_sp_history_tool_sp_his_list`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_tool_sp_history_tool_sp_his_list` AS select `h`.`tool_history_no` AS `tool_history_no`,`h`.`mstock_name` AS `mstock_name`,`h`.`sample_id` AS `sample_id`,`h`.`sample_pid` AS `sample_pid`,`h`.`machine_id` AS `machine_id`,`h`.`tool_ptime` AS `tool_ptime`,`h`.`main_chuck` AS `main_chuck`,`h`.`second_chuck` AS `second_chuck`,`h`.`program_name` AS `program_name`,`h`.`program_seq` AS `program_seq`,`h`.`mat_code` AS `mat_code`,`h`.`work_by` AS `work_by`,`h`.`produce_notice` AS `produce_notice`,`h`.`process` AS `process`,`h`.`create_time` AS `create_time`,`h`.`create_by` AS `create_by`,`h`.`modify_time` AS `modify_time`,`h`.`modify_by` AS `modify_by`,`hl`.`tool_id` AS `tool_id`,`hl`.`tool_use_for` AS `tool_use_for`,`hl`.`use_qty` AS `use_qty`,`hl`.`tsup_id` AS `tsup_id`,`hl`.`uselist_remark` AS `uselist_remark`,`hl`.`life_remark` AS `life_remark`,`hl`.`tool_use_no` AS `tool_use_no`,`hl`.`status` AS `status`,`p`.`tool_type` AS `tool_type`,`p`.`tool_spec` AS `tool_spec`,`p`.`use_mark` AS `use_mark`,`p`.`tool_ss` AS `tool_ss`,`p`.`tool_newloc` AS `tool_newloc`,`p`.`tool_recloc` AS `tool_recloc`,`p`.`is_open` AS `is_open` from ((`a_huangliang_tool_sp_history` `h` left join `a_huangliang_tool_sp_his_list` `hl` on((`h`.`tool_history_no` = `hl`.`tool_history_no`))) left join `a_huangliang_tool_profile` `p` on((`hl`.`tool_id` = `p`.`tool_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_tool_sp_use_tool_sp_history`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_sp_use_tool_sp_history`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_tool_sp_use_tool_sp_history` AS select `h`.`tool_history_no` AS `tool_history_no`,`h`.`sample_id` AS `sample_id`,`h`.`sample_pid` AS `sample_pid`,`h`.`tool_ptime` AS `tool_ptime`,`h`.`main_chuck` AS `main_chuck`,`h`.`second_chuck` AS `second_chuck`,`h`.`program_name` AS `program_name`,`h`.`program_seq` AS `program_seq`,`h`.`mat_code` AS `mat_code`,`h`.`work_by` AS `work_by`,`h`.`produce_notice` AS `produce_notice`,`h`.`process` AS `process`,`h`.`create_time` AS `create_time`,`h`.`create_by` AS `create_by`,`h`.`modify_time` AS `modify_time`,`h`.`modify_by` AS `modify_by`,`u`.`tool_use_no` AS `tool_use_no`,`u`.`mstock_name` AS `mstock_name`,`u`.`use_reason` AS `use_reason`,`u`.`machine_id` AS `machine_id`,`u`.`create_by` AS `use_create_by`,`u`.`create_time` AS `use_create_time` from (`a_huangliang_tool_sp_use` `u` left join `a_huangliang_tool_sp_history` `h` on((`u`.`tool_history_no` = `h`.`tool_history_no`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_tool_stock`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_stock`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_tool_stock` AS select `s`.`tool_stock` AS `tool_stock`,`s`.`tool_id` AS `tool_id`,`s`.`tsup_id` AS `tsup_id`,`s`.`tool_location` AS `tool_location`,`tp`.`use_mark` AS `use_mark`,`tp`.`tool_type` AS `tool_type`,`tp`.`tool_spec` AS `tool_spec`,`tp`.`is_open` AS `tool_profile_is_open`,`tt`.`type_for` AS `type_for`,`tt`.`is_open` AS `tool_type_is_open`,`tl`.`location_area` AS `location_area`,`tl`.`tool_location_for` AS `tool_status` from (((`a_huangliang_view_tool_stock_sum` `s` join `a_huangliang_tool_profile` `tp` on((`s`.`tool_id` = `tp`.`tool_id`))) join `a_huangliang_tool_type` `tt` on((`tp`.`tool_type` = `tt`.`tool_type`))) join `a_huangliang_tool_location` `tl` on((`s`.`tool_location` = `tl`.`tool_location`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_tool_stock_profile_location`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_stock_profile_location`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_tool_stock_profile_location` AS select `ts`.`buy_time` AS `buy_time`,`ts`.`tsup_id` AS `tsup_id`,`ts`.`tool_id` AS `tool_id`,`ts`.`tool_location` AS `tool_location`,`ts`.`tool_status` AS `tool_status`,`ts`.`tool_stock` AS `tool_stock`,`ts`.`use_tqty` AS `use_tqty`,`ts`.`create_time` AS `create_time`,`ts`.`create_by` AS `create_by`,`ts`.`modify_time` AS `modify_time`,`ts`.`modify_by` AS `modify_by`,`tsc`.`chg_time` AS `chg_time`,`tsc`.`tool_status` AS `chg_tool_status`,`tsc`.`chg_type` AS `chg_type`,`tsc`.`chg_qty` AS `chg_qty`,`tsc`.`new_location` AS `new_location`,`tsc`.`chg_remark` AS `chg_remark`,`tp`.`tool_type` AS `tool_type`,`tp`.`tool_spec` AS `tool_spec`,`tp`.`use_mark` AS `use_mark`,`tp`.`tool_ss` AS `tool_ss`,`tp`.`tool_newloc` AS `tool_newloc`,`tp`.`tool_recloc` AS `tool_recloc`,`tp`.`is_open` AS `profile_is_open`,`tl`.`tool_location_for` AS `tool_location_for`,`tl`.`location_area` AS `location_area`,`tl`.`is_open` AS `location_is_open` from (((`a_huangliang_tool_stock` `ts` join `a_huangliang_tool_stock_chg` `tsc` on(((`ts`.`buy_time` = `tsc`.`buy_time`) and (`ts`.`tsup_id` = `tsc`.`tsup_id`) and (`ts`.`tool_id` = `tsc`.`tool_id`) and (`ts`.`tool_location` = `tsc`.`tool_location`)))) left join `a_huangliang_tool_profile` `tp` on((`ts`.`tool_id` = `tp`.`tool_id`))) left join `a_huangliang_tool_location` `tl` on((`ts`.`tool_location` = `tl`.`tool_location`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_tool_stock_sum`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_stock_sum`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_tool_stock_sum` AS select sum(`a_huangliang_tool_stock`.`tool_stock`) AS `tool_stock`,`a_huangliang_tool_stock`.`tool_id` AS `tool_id`,`a_huangliang_tool_stock`.`tsup_id` AS `tsup_id`,`a_huangliang_tool_stock`.`tool_location` AS `tool_location` from `a_huangliang_tool_stock` group by `a_huangliang_tool_stock`.`tool_id`,`a_huangliang_tool_stock`.`tsup_id`,`a_huangliang_tool_stock`.`tool_location` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_tool_stock_tool_mp_list`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_stock_tool_mp_list`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_tool_stock_tool_mp_list` AS select `tml`.`tool_use_no` AS `tool_use_no`,`tml`.`buy_time` AS `buy_time`,`tml`.`tool_id` AS `tool_id`,`tml`.`tsup_id` AS `tsup_id`,`tml`.`tool_location` AS `tool_location`,`tml`.`tool_use_for` AS `tool_use_for`,`tml`.`tool_status` AS `tool_status`,`tml`.`use_qty` AS `use_qty`,`tml`.`use_cost` AS `use_cost`,`tml`.`uselist_remark` AS `uselist_remark`,`tml`.`uselist_status` AS `uselist_status`,`tml`.`life_remark` AS `life_remark`,`tml`.`fix_for` AS `fix_for`,`tml`.`fix_no` AS `fix_no`,`tml`.`create_time` AS `create_time`,`tml`.`create_by` AS `create_by`,`tml`.`modify_time` AS `modify_time`,`tml`.`modify_by` AS `modify_by`,`ts`.`tool_stock` AS `tool_stock`,`ts`.`use_tqty` AS `use_tqty`,`tp`.`tool_type` AS `tool_type`,`tp`.`tool_spec` AS `tool_spec` from ((`a_huangliang_tool_mp_list` `tml` left join `a_huangliang_tool_stock` `ts` on(((`tml`.`buy_time` = `ts`.`buy_time`) and (`tml`.`tool_id` = `ts`.`tool_id`) and (`tml`.`tsup_id` = `ts`.`tsup_id`) and (`tml`.`tool_location` = `ts`.`tool_location`)))) left join `a_huangliang_tool_profile` `tp` on((`tml`.`tool_id` = `tp`.`tool_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_tool_stock_tool_profile`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_stock_tool_profile`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_tool_stock_tool_profile` AS select `ts`.`buy_time` AS `buy_time`,`ts`.`tsup_id` AS `tsup_id`,`ts`.`tool_id` AS `tool_id`,`ts`.`tool_location` AS `tool_location`,`ts`.`tool_status` AS `tool_status`,`ts`.`tool_stock` AS `tool_stock`,`ts`.`use_tqty` AS `use_tqty`,`ts`.`create_time` AS `create_time`,`ts`.`create_by` AS `create_by`,`ts`.`modify_time` AS `modify_time`,`ts`.`modify_by` AS `modify_by`,`tp`.`tool_type` AS `tool_type`,`tp`.`tool_spec` AS `tool_spec`,`tp`.`use_mark` AS `use_mark`,`tp`.`tool_ss` AS `tool_ss`,`tp`.`tool_newloc` AS `tool_newloc`,`tp`.`tool_recloc` AS `tool_recloc`,`tp`.`is_open` AS `is_open` from (`a_huangliang_tool_stock` `ts` left join `a_huangliang_tool_profile` `tp` on((`ts`.`tool_id` = `tp`.`tool_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_tool_stock_tool_profile_tool_location`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_stock_tool_profile_tool_location`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_tool_stock_tool_profile_tool_location` AS select `ts`.`buy_time` AS `buy_time`,`ts`.`tsup_id` AS `tsup_id`,`ts`.`tool_id` AS `tool_id`,`ts`.`tool_location` AS `tool_location`,`ts`.`tool_status` AS `tool_status`,`ts`.`tool_stock` AS `tool_stock`,`ts`.`use_tqty` AS `use_tqty`,`ts`.`create_time` AS `create_time`,`ts`.`create_by` AS `create_by`,`ts`.`modify_time` AS `modify_time`,`ts`.`modify_by` AS `modify_by`,`tp`.`tool_type` AS `tool_type`,`tp`.`tool_spec` AS `tool_spec`,`tp`.`use_mark` AS `use_mark`,`tp`.`tool_ss` AS `tool_ss`,`tp`.`tool_newloc` AS `tool_newloc`,`tp`.`tool_recloc` AS `tool_recloc`,`tp`.`is_open` AS `is_open`,`tl`.`location_area` AS `location_area` from ((`a_huangliang_tool_stock` `ts` left join `a_huangliang_tool_profile` `tp` on((`ts`.`tool_id` = `tp`.`tool_id`))) left join `a_huangliang_tool_location` `tl` on((`ts`.`tool_location` = `tl`.`tool_location`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_tool_stock_tool_sp_list`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_tool_stock_tool_sp_list`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_tool_stock_tool_sp_list` AS select `tml`.`tool_use_no` AS `tool_use_no`,`tml`.`buy_time` AS `buy_time`,`tml`.`tool_id` AS `tool_id`,`tml`.`tsup_id` AS `tsup_id`,`tml`.`tool_location` AS `tool_location`,`tml`.`tool_use_for` AS `tool_use_for`,`tml`.`tool_status` AS `tool_status`,`tml`.`use_qty` AS `use_qty`,`tml`.`use_cost` AS `use_cost`,`tml`.`uselist_remark` AS `uselist_remark`,`tml`.`uselist_status` AS `uselist_status`,`tml`.`life_remark` AS `life_remark`,`tml`.`create_time` AS `create_time`,`tml`.`create_by` AS `create_by`,`tml`.`modify_time` AS `modify_time`,`tml`.`modify_by` AS `modify_by`,`ts`.`tool_stock` AS `tool_stock`,`ts`.`use_tqty` AS `use_tqty`,`tp`.`tool_type` AS `tool_type`,`tp`.`tool_spec` AS `tool_spec` from ((`a_huangliang_tool_sp_list` `tml` left join `a_huangliang_tool_stock` `ts` on(((`tml`.`buy_time` = `ts`.`buy_time`) and (`tml`.`tool_id` = `ts`.`tool_id`) and (`tml`.`tsup_id` = `ts`.`tsup_id`) and (`tml`.`tool_location` = `ts`.`tool_location`)))) left join `a_huangliang_tool_profile` `tp` on((`tml`.`tool_id` = `tp`.`tool_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_wl_wms_wmm_wmml_ms`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_wl_wms_wmm_wmml_ms`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_wl_wms_wmm_wmml_ms` AS select `wl`.`order_id` AS `order_id`,`wl`.`product_id` AS `product_id`,`wl`.`product_pid` AS `product_pid`,`wl`.`customer_id` AS `customer_id`,`wl`.`order_qty` AS `order_qty`,`wl`.`wo_pqty` AS `wo_pqty`,`wl`.`wo_bqty` AS `wo_bqty`,`wl`.`wo_mqty` AS `wo_mqty`,`wl`.`exp_date` AS `exp_date`,`wl`.`wo_status` AS `wo_status`,`wl`.`quote_seconds` AS `quote_seconds`,`wl`.`quote_price` AS `quote_price`,`wl`.`quoted_by` AS `quoted_by`,`wms`.`machine_id` AS `machine_id`,`wms`.`wo_m_time` AS `wo_m_time`,`wms`.`m_qty` AS `m_qty`,`wms`.`m_pqty` AS `m_pqty`,`wms`.`m_bqty` AS `m_bqty`,`wms`.`w_m_status` AS `w_m_status`,`wms`.`exp_mdate` AS `exp_mdate`,`wms`.`exp_edate` AS `exp_edate`,`wms`.`act_mdate` AS `act_mdate`,`wms`.`act_edate` AS `act_edate`,`wms`.`m_ptime` AS `m_ptime`,`wms`.`m_usage` AS `m_usage`,`wms`.`pg_seq` AS `pg_seq`,`wmm`.`m_mat_time` AS `m_mat_time`,`wmm`.`type` AS `type`,`wmm`.`rework_size` AS `rework_size`,`wmm`.`m_mat_status` AS `m_mat_status`,`wmm`.`delay_notice` AS `delay_notice`,`wmm`.`approve_notice` AS `approve_notice`,`wmm`.`approve_req` AS `approve_req`,`wmm`.`finish_time` AS `finish_time`,`wmml`.`shelf_time` AS `shelf_time`,`wmml`.`mstock_name` AS `mstock_name`,`wmml`.`po_no` AS `po_no`,`wmml`.`mat_code` AS `mat_code`,`wmml`.`location` AS `location`,`wmml`.`use_piece` AS `use_piece`,`wmml`.`use_qty` AS `use_qty`,`wmml`.`use_remark` AS `use_remark`,`wmml`.`fb_piece` AS `fb_piece`,`wmml`.`fb_qty` AS `fb_qty`,`wmml`.`use_cost` AS `use_cost`,`wmml`.`item_status` AS `item_status`,`ms`.`sup_id` AS `sup_id`,`ms`.`mat_id` AS `mat_id`,`ms`.`mat_length` AS `mat_length`,`ms`.`mat_od` AS `mat_od`,`ms`.`mat_color` AS `mat_color`,`ms`.`mat_price` AS `mat_price`,`ms`.`mat_price_ref_date` AS `mat_price_ref_date`,`ms`.`mat_price_ref_sup_id` AS `mat_price_ref_sup_id`,`ms`.`area` AS `area`,`ms`.`lot_mark` AS `lot_mark`,`ms`.`p_weight` AS `p_weight`,`ms`.`stock_piece` AS `stock_piece`,`ms`.`mstock_qty` AS `mstock_qty`,`ms`.`unit` AS `unit`,`ms`.`temp_od` AS `temp_od`,`ms`.`temp_length` AS `temp_length`,`ms`.`mstock_time` AS `mstock_time`,`ms`.`mrp_bcode` AS `mrp_bcode`,`ms`.`lock_qty` AS `lock_qty`,`ms`.`lock_piece` AS `lock_piece` from ((((`a_huangliang_wo_list` `wl` join `a_huangliang_wo_m_status` `wms` on((`wl`.`order_id` = `wms`.`order_id`))) join `a_huangliang_wo_m_mat` `wmm` on(((`wms`.`order_id` = `wmm`.`order_id`) and (`wms`.`machine_id` = `wmm`.`machine_id`) and (`wms`.`wo_m_time` = `wmm`.`wo_m_time`)))) join `a_huangliang_wo_m_mat_list` `wmml` on(((`wmm`.`order_id` = `wmml`.`order_id`) and (`wmm`.`machine_id` = `wmml`.`machine_id`) and (`wmm`.`wo_m_time` = `wmml`.`wo_m_time`) and (`wmm`.`m_mat_time` = `wmml`.`m_mat_time`)))) join `a_huangliang_mat_stock` `ms` on(((`wmml`.`shelf_time` = `ms`.`shelf_time`) and (`wmml`.`mat_code` = `ms`.`mat_code`)))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_wms_wmm_wmml_ms`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_wms_wmm_wmml_ms`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_wms_wmm_wmml_ms` AS select `wms`.`order_id` AS `order_id`,`wms`.`machine_id` AS `machine_id`,`wms`.`wo_m_time` AS `wo_m_time`,`wms`.`m_qty` AS `m_qty`,`wms`.`m_pqty` AS `m_pqty`,`wms`.`m_bqty` AS `m_bqty`,`wms`.`w_m_status` AS `w_m_status`,`wms`.`exp_mdate` AS `exp_mdate`,`wms`.`exp_edate` AS `exp_edate`,`wms`.`act_mdate` AS `act_mdate`,`wms`.`act_edate` AS `act_edate`,`wms`.`m_ptime` AS `m_ptime`,`wms`.`m_usage` AS `m_usage`,`wms`.`pg_seq` AS `pg_seq`,`wmm`.`m_mat_time` AS `m_mat_time`,`wmm`.`type` AS `type`,`wmm`.`rework_size` AS `rework_size`,`wmm`.`m_mat_status` AS `m_mat_status`,`wmm`.`delay_notice` AS `delay_notice`,`wmm`.`approve_notice` AS `approve_notice`,`wmm`.`approve_req` AS `approve_req`,`wmm`.`finish_time` AS `finish_time`,`wmml`.`shelf_time` AS `shelf_time`,`wmml`.`mstock_name` AS `mstock_name`,`wmml`.`po_no` AS `po_no`,`wmml`.`mat_code` AS `mat_code`,`wmml`.`location` AS `location`,`wmml`.`use_piece` AS `use_piece`,`wmml`.`use_qty` AS `use_qty`,`wmml`.`use_remark` AS `use_remark`,`wmml`.`fb_piece` AS `fb_piece`,`wmml`.`fb_qty` AS `fb_qty`,(`ms`.`mat_price` * `wmml`.`use_qty`) AS `use_cost`,`wmml`.`item_status` AS `item_status`,`ms`.`sup_id` AS `sup_id`,`ms`.`mat_id` AS `mat_id`,`ms`.`mat_length` AS `mat_length`,`ms`.`mat_od` AS `mat_od`,`ms`.`mat_color` AS `mat_color`,`ms`.`mat_price` AS `mat_price`,`ms`.`mat_price_ref_date` AS `mat_price_ref_date`,`ms`.`mat_price_ref_sup_id` AS `mat_price_ref_sup_id`,`ms`.`area` AS `area`,`ms`.`lot_mark` AS `lot_mark`,`ms`.`p_weight` AS `p_weight`,`ms`.`stock_piece` AS `stock_piece`,`ms`.`mstock_qty` AS `mstock_qty`,`ms`.`unit` AS `unit`,`ms`.`temp_od` AS `temp_od`,`ms`.`temp_length` AS `temp_length`,`ms`.`mstock_time` AS `mstock_time`,`ms`.`mrp_bcode` AS `mrp_bcode`,`ms`.`lock_qty` AS `lock_qty`,`ms`.`lock_piece` AS `lock_piece` from (((`a_huangliang_wo_m_status` `wms` join `a_huangliang_wo_m_mat` `wmm` on(((`wms`.`order_id` = `wmm`.`order_id`) and (`wms`.`machine_id` = `wmm`.`machine_id`) and (`wms`.`wo_m_time` = `wmm`.`wo_m_time`)))) join `a_huangliang_wo_m_mat_list` `wmml` on(((`wmm`.`order_id` = `wmml`.`order_id`) and (`wmm`.`machine_id` = `wmml`.`machine_id`) and (`wmm`.`wo_m_time` = `wmml`.`wo_m_time`) and (`wmm`.`m_mat_time` = `wmml`.`m_mat_time`)))) join `a_huangliang_mat_stock` `ms` on(((`wmml`.`shelf_time` = `ms`.`shelf_time`) and (`wmml`.`mat_code` = `ms`.`mat_code`)))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_wo_list_production_scheduling`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_wo_list_production_scheduling`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_wo_list_production_scheduling` AS select `wl`.`order_id` AS `order_id`,`wl`.`product_id` AS `product_id`,`wl`.`product_pid` AS `product_pid`,`wl`.`customer_id` AS `customer_id`,`wl`.`order_qty` AS `order_qty`,`wl`.`wo_pqty` AS `wo_pqty`,`wl`.`wo_bqty` AS `wo_bqty`,`wl`.`wo_mqty` AS `wo_mqty`,`wl`.`exp_date` AS `exp_date`,`wl`.`wo_status` AS `wo_status`,`wl`.`use_cost` AS `use_cost`,`wl`.`quote_seconds` AS `quote_seconds`,`wl`.`quote_price` AS `quote_price`,`wl`.`quoted_by` AS `quoted_by`,`wl`.`create_by` AS `create_by`,`wl`.`create_time` AS `create_time`,`wl`.`modify_by` AS `modify_by`,`wl`.`modify_time` AS `modify_time`,`ps`.`schedule_time` AS `schedule_time`,`ps`.`machine_id` AS `machine_id`,`ps`.`schedule_quantity` AS `schedule_quantity`,`ps`.`schedule_status` AS `schedule_status`,`ps`.`exp_mdate` AS `exp_mdate`,`ps`.`exp_edate` AS `exp_edate`,`ps`.`correction_time` AS `correction_time`,`ps`.`buffer_time` AS `buffer_time`,`ps`.`prev_partcount_diff_ratio` AS `prev_partcount_diff_ratio`,`ps`.`prev_efficiency_utilization` AS `prev_efficiency_utilization`,`ps`.`mat_control` AS `mat_control`,`ps`.`m_ptime` AS `m_ptime`,`ps`.`m_usage` AS `m_usage`,`ps`.`pg_seq` AS `pg_seq`,`ps`.`schedule_uncheck_notice` AS `schedule_uncheck_notice` from (`a_huangliang_wo_list` `wl` left join `a_huangliang_production_scheduling` `ps` on((`ps`.`order_id` = `wl`.`order_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_wo_m_mat_wo_list`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_wo_m_mat_wo_list`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_wo_m_mat_wo_list` AS select `a`.`order_id` AS `order_id`,`a`.`machine_id` AS `machine_id`,`a`.`wo_m_time` AS `wo_m_time`,`a`.`m_mat_time` AS `m_mat_time`,`a`.`type` AS `type`,`a`.`rework_size` AS `rework_size`,`a`.`m_mat_status` AS `m_mat_status`,`a`.`delay_notice` AS `delay_notice`,`a`.`approve_notice` AS `approve_notice`,`a`.`approve_req` AS `approve_req`,`a`.`finish_time` AS `finish_time`,`a`.`create_by` AS `create_by`,`a`.`create_time` AS `create_time`,`a`.`modify_by` AS `modify_by`,`a`.`modify_time` AS `modify_time`,`b`.`product_id` AS `product_id`,`b`.`product_pid` AS `product_pid`,`b`.`customer_id` AS `customer_id`,`b`.`order_qty` AS `order_qty`,`b`.`wo_pqty` AS `wo_pqty`,`b`.`wo_bqty` AS `wo_bqty`,`b`.`wo_mqty` AS `wo_mqty`,`b`.`exp_date` AS `exp_date`,`b`.`wo_status` AS `wo_status`,`b`.`create_time` AS `wo_list_create_time`,`b`.`modify_time` AS `wo_list_modify_time`,`b`.`create_by` AS `wo_list_create_by`,`b`.`modify_by` AS `wo_list_modify_by` from (`a_huangliang_wo_m_mat` `a` left join `a_huangliang_wo_list` `b` on((`a`.`order_id` = `b`.`order_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_wo_m_mat_wo_m_mat_list_mat_stock`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_wo_m_mat_wo_m_mat_list_mat_stock`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_wo_m_mat_wo_m_mat_list_mat_stock` AS select `ml`.`order_id` AS `order_id`,`ml`.`machine_id` AS `machine_id`,`ml`.`wo_m_time` AS `wo_m_time`,`ml`.`m_mat_time` AS `m_mat_time`,`ml`.`shelf_time` AS `shelf_time`,`ml`.`mstock_name` AS `mstock_name`,`ml`.`location` AS `location`,`ml`.`use_piece` AS `use_piece`,`ml`.`use_qty` AS `use_qty`,`ml`.`use_remark` AS `use_remark`,`ml`.`fb_piece` AS `fb_piece`,`ml`.`fb_qty` AS `fb_qty`,`ml`.`item_status` AS `item_status`,`ml`.`create_by` AS `m_mat_list_create_by`,`ml`.`create_time` AS `m_mat_list_create_time`,`ml`.`modify_by` AS `m_mat_list_modify_by`,`ml`.`modify_time` AS `m_mat_list_modify_time`,`m`.`type` AS `type`,`m`.`rework_size` AS `rework_size`,`m`.`m_mat_status` AS `m_mat_status`,`m`.`delay_notice` AS `delay_notice`,`m`.`approve_notice` AS `approve_notice`,`m`.`approve_req` AS `approve_req`,`m`.`create_time` AS `m_mat_create_time`,`m`.`create_by` AS `m_mat_create_by`,`m`.`modify_time` AS `m_mat_modify_time`,`m`.`modify_by` AS `m_mat_modify_by`,`s`.`po_no` AS `po_no`,`s`.`sup_id` AS `sup_id`,`s`.`mat_code` AS `mat_code`,`s`.`mat_id` AS `mat_id`,`s`.`mat_length` AS `mat_length`,`s`.`mat_od` AS `mat_od`,`s`.`mat_color` AS `mat_color`,`s`.`mat_price` AS `mat_price`,`s`.`mat_price_ref_date` AS `mat_price_ref_date`,`s`.`mat_price_ref_sup_id` AS `mat_price_ref_sup_id`,`s`.`area` AS `area`,`s`.`lot_mark` AS `lot_mark`,`s`.`p_weight` AS `p_weight`,`s`.`stock_piece` AS `stock_piece`,`s`.`mstock_qty` AS `mstock_qty`,`s`.`unit` AS `unit`,`s`.`temp_od` AS `temp_od`,`s`.`temp_length` AS `temp_length`,`s`.`mstock_time` AS `mstock_time`,`s`.`mrp_bcode` AS `mrp_bcode`,`s`.`lock_qty` AS `lock_qty`,`s`.`lock_piece` AS `lock_piece`,`s`.`create_by` AS `mat_stock_create_by`,`s`.`create_time` AS `mat_stock_create_time`,`s`.`modify_by` AS `mat_stock_modify_by`,`s`.`modify_time` AS `mat_stock_modify_time` from ((`a_huangliang_wo_m_mat` `m` join `a_huangliang_wo_m_mat_list` `ml` on(((`m`.`order_id` = `ml`.`order_id`) and (`m`.`machine_id` = `ml`.`machine_id`) and (`m`.`wo_m_time` = `ml`.`wo_m_time`) and (`m`.`m_mat_time` = `ml`.`m_mat_time`)))) join `a_huangliang_mat_stock` `s` on(((`ml`.`shelf_time` = `s`.`shelf_time`) and (`ml`.`mat_code` = `s`.`mat_code`)))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `a_huangliang_view_wo_m_status_wo_list`
--

/*!50001 DROP VIEW IF EXISTS `a_huangliang_view_wo_m_status_wo_list`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `a_huangliang_view_wo_m_status_wo_list` AS select `a`.`order_id` AS `order_id`,`a`.`machine_id` AS `machine_id`,`a`.`wo_m_time` AS `wo_m_time`,`a`.`m_qty` AS `m_qty`,`a`.`m_pqty` AS `m_pqty`,`a`.`m_bqty` AS `m_bqty`,`a`.`w_m_status` AS `w_m_status`,`a`.`exp_mdate` AS `exp_mdate`,`a`.`exp_edate` AS `exp_edate`,`a`.`act_mdate` AS `act_mdate`,`a`.`act_edate` AS `act_edate`,`a`.`m_ptime` AS `m_ptime`,`a`.`m_usage` AS `m_usage`,`a`.`pg_seq` AS `pg_seq`,`a`.`mat_control` AS `mat_control`,`a`.`correction_time` AS `correction_time`,`a`.`buffer_time` AS `buffer_time`,`a`.`create_by` AS `create_by`,`a`.`create_time` AS `create_time`,`a`.`modify_by` AS `modify_by`,`a`.`modify_time` AS `modify_time`,`b`.`product_id` AS `product_id`,`b`.`product_pid` AS `product_pid`,`b`.`customer_id` AS `customer_id`,`b`.`order_qty` AS `order_qty`,`b`.`wo_pqty` AS `wo_pqty`,`b`.`wo_bqty` AS `wo_bqty`,`b`.`wo_mqty` AS `wo_mqty`,`b`.`exp_date` AS `exp_date`,`b`.`wo_status` AS `wo_status`,`b`.`create_time` AS `wo_list_create_time`,`b`.`modify_time` AS `wo_list_modify_time`,`b`.`create_by` AS `wo_list_create_by`,`b`.`modify_by` AS `wo_list_modify_by`,(select count(0) from `a_huangliang_wo_m_mat` `b` where ((`a`.`order_id` = `b`.`order_id`) and (`a`.`machine_id` = `b`.`machine_id`) and (`a`.`wo_m_time` = `b`.`wo_m_time`))) AS `material_assign_count` from (`a_huangliang_wo_m_status` `a` left join `a_huangliang_wo_list` `b` on((`a`.`order_id` = `b`.`order_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-11-20 18:07:02
