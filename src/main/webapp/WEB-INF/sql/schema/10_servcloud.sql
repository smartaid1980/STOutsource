-- MySQL dump 10.13  Distrib 5.5.43, for Win32 (x86)
--
-- Host: localhost    Database: servcloud
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
-- Table structure for table `a_aftersalesservice_cus_area`
--

DROP TABLE IF EXISTS `a_aftersalesservice_cus_type`;
CREATE TABLE `a_aftersalesservice_cus_type`(
  `cus_type_id` varchar(10) NOT NULL COMMENT '客戶屬性代碼',
  `cus_type_name` varchar(50) NOT NULL COMMENT '客戶屬性',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`cus_type_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- ----------------------------
-- Records of CUS_TYPE
-- ----------------------------

-- ----------------------------
-- Table structure for `CUS_AREA` 客戶地區
-- ----------------------------
DROP Table IF EXISTS `a_aftersalesservice_cus_area`;
CREATE Table `a_aftersalesservice_cus_area`(
  `area_id` varchar(10) NOT NULL COMMENT '地區代碼',
  `area_name` varchar(50) NOT NULL COMMENT '地區名稱',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`area_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- ----------------------------
-- Records of CUS_AREA
-- ----------------------------

-- ----------------------------
-- Table structure for `CUS_TRADE` 客戶行業別
-- ----------------------------
DROP Table IF EXISTS `a_aftersalesservice_cus_trade`;
CREATE Table `a_aftersalesservice_cus_trade`(
  `trade_id` varchar(10) NOT NULL COMMENT '行業別代碼',
  `trade_name`  varchar(50) NOT NULL COMMENT '行業別名稱',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`trade_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- ----------------------------
-- Records of CUS_TRADE
-- ----------------------------
-- ----------------------------
-- Table structure for `CUS_FACTOR` 代理商
-- ----------------------------
DROP Table IF EXISTS `a_aftersalesservice_cus_factor`;
CREATE Table `a_aftersalesservice_cus_factor`(
  `factor_id` varchar(10) NOT NULL COMMENT '代理商代碼',
  `factor_name` varchar(50) NOT NULL COMMENT '代理商名稱',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`factor_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- ----------------------------
-- Records of CUS_FACTOR
-- ----------------------------

-- ----------------------------
-- Table structure for `CUSTOMER` 客戶資料
-- ----------------------------
DROP Table IF EXISTS `a_aftersalesservice_customer`;
CREATE Table `a_aftersalesservice_customer`(
  `cus_id` varchar(10) NOT NULL COMMENT '客戶代碼',
  `cus_name`  varchar(100)  NOT NULL COMMENT '客戶名稱',
  `uni_no`  varchar(20) DEFAULT NULL COMMENT '統一代碼',
  `trade_id` varchar(10) DEFAULT NULL COMMENT '行業別',
  `area_id` varchar(10) DEFAULT NULL COMMENT '地區代碼',
  `phone` varchar(30) DEFAULT NULL COMMENT '電話',
  `fax` varchar(30) DEFAULT NULL COMMENT '傳真',
  `address` varchar(50) DEFAULT NULL COMMENT '地址',
  `sales_id`  varchar(20) DEFAULT NULL COMMENT '負責業務',
  `factor_id` varchar(10) DEFAULT NULL COMMENT '負責代理商',
  `payment_goods` int(11) DEFAULT NULL COMMENT '累積未收款',
  `contact_name`  varchar(10) DEFAULT NULL COMMENT '連絡人',
  `ext_phone` varchar(10) DEFAULT NULL COMMENT '連絡人分機',
  `cell_phone`  varchar(20) DEFAULT NULL COMMENT '連絡人手機',
  `email` varchar(50) DEFAULT NULL COMMENT '連絡人 e-mail',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`cus_id`),
  CONSTRAINT `FK_customer_1` FOREIGN KEY (`trade_id`) REFERENCES `a_aftersalesservice_cus_trade` (`trade_id`),
  CONSTRAINT `FK_customer_2` FOREIGN KEY (`area_id`) REFERENCES `a_aftersalesservice_cus_area` (`area_id`),
  CONSTRAINT `FK_customer_3` FOREIGN KEY (`factor_id`) REFERENCES `a_aftersalesservice_cus_factor` (`factor_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- ----------------------------
-- Records of CUSTOMER
-- ----------------------------

-- ----------------------------
-- Table structure for `PRODUCT` 產品別
-- ----------------------------
DROP Table IF EXISTS `a_aftersalesservice_product`;
CREATE Table `a_aftersalesservice_product`(
  `product_id`  varchar(10) NOT NULL COMMENT '產品別代碼',
  `product_name`  varchar(50) NOT NULL COMMENT '產品別名稱',
  `product_desc`  varchar(500) DEFAULT NULL COMMENT '產品別說明',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`product_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- ----------------------------
-- Records of PRODUCT
-- ----------------------------


-- ----------------------------
-- Table structure for `MACHINE_TYPE` 機種
-- ----------------------------
DROP Table IF EXISTS `a_aftersalesservice_machine_type`;
CREATE Table `a_aftersalesservice_machine_type`(
  `machine_type_id` varchar(10) NOT NULL COMMENT '機種',
  `product_id`  varchar(10) NOT NULL COMMENT '產品別代碼',
  `type_name` varchar(50) DEFAULT NULL COMMENT '機種名稱',
  `type_desc` varchar(500) DEFAULT NULL COMMENT '機種說明',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`machine_type_id`),
  CONSTRAINT `FK_machine_type` FOREIGN KEY (`product_id`) REFERENCES `a_aftersalesservice_product` (`product_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- ----------------------------
-- Records of MACHINE_TYPE
-- ----------------------------


-- ----------------------------
-- Table structure for `MACHINE` 機台
-- ----------------------------
DROP Table IF EXISTS `a_aftersalesservice_machine`;
CREATE Table `a_aftersalesservice_machine`(
  `machine_id`  varchar(32) NOT NULL COMMENT '機台',
  `machine_name`  varchar(50) NOT NULL COMMENT '機台名稱',
  `cus_id`  varchar(10) DEFAULT NULL COMMENT '客戶代碼',
  `area_id` varchar(10) DEFAULT NULL COMMENT '交貨地點',
  `machine_desc` varchar(500) DEFAULT NULL COMMENT '規格',
  `install_date` datetime DEFAULT NULL COMMENT '安裝日期',
  `is_second` varchar(1)  DEFAULT NULL COMMENT '中古機',
  `is_monitor`  varchar(1)  DEFAULT NULL COMMENT '允許監控',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`machine_id`),
  CONSTRAINT `FK_machine_1` FOREIGN KEY (`machine_id`) REFERENCES `m_device` (`device_id`),
  CONSTRAINT `FK_machine_2` FOREIGN KEY (`cus_id`) REFERENCES `a_aftersalesservice_customer` (`cus_id`),
  CONSTRAINT `FK_machine_3` FOREIGN KEY (`area_id`) REFERENCES `a_aftersalesservice_cus_area` (`area_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of MACHINE
-- ----------------------------


-- ----------------------------
-- Table structure for `ENTITY` 問題類別
-- ----------------------------
DROP Table IF EXISTS `a_aftersalesservice_entity`;
CREATE Table `a_aftersalesservice_entity`(
  `entity_id`  varchar(10) NOT NULL COMMENT '問題類別',
  `entity_name`  varchar(50) NOT NULL COMMENT '類別名稱',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`entity_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- ----------------------------
-- Records of ENTITY
-- ----------------------------

-- ----------------------------
-- Table structure for `ENTITY_EMP` 問題類別可維修工程師
-- ----------------------------
DROP Table IF EXISTS `a_aftersalesservice_entity_emp`;
CREATE Table `a_aftersalesservice_entity_emp`(
  `entity_id`  varchar(10) NOT NULL COMMENT '問題類別',
  `user_id`  varchar(45) NOT NULL COMMENT '使用者帳號',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`entity_id`,`user_id`),
  CONSTRAINT `FK_entity_emp_1` FOREIGN KEY (`entity_id`) REFERENCES `a_aftersalesservice_entity` (`entity_id`),
  CONSTRAINT `FK_entity_emp_2` FOREIGN KEY (`user_id`) REFERENCES `m_sys_user` (`user_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- ----------------------------
-- Records of ENTITY_EMP
-- ----------------------------


-- ----------------------------
-- Table structure for `ENTITY_BREAKDOWN` 問題項目
-- ----------------------------
DROP Table IF EXISTS `a_aftersalesservice_entity_breakdown`;
CREATE Table `a_aftersalesservice_entity_breakdown`(
  `breakdown_id`  varchar(20) NOT NULL COMMENT '問題代碼',
  `entity_id`  varchar(10) NOT NULL COMMENT '問題類別',
  `breakdown_name`  varchar(50) NOT NULL COMMENT '問題名稱',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`breakdown_id`),
  CONSTRAINT `FK_entity_breakdown` FOREIGN KEY (`entity_id`) REFERENCES `a_aftersalesservice_entity` (`entity_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- ----------------------------
-- Records of ENTITY_BREAKDOWN
-- ----------------------------


-- ----------------------------
-- Table structure for `MATERIAL` 料件
-- ----------------------------
DROP Table IF EXISTS `a_aftersalesservice_material`;
CREATE Table `a_aftersalesservice_material`(
  `material_id`  varchar(10) NOT NULL COMMENT '料件代碼',
  `material_name` varchar(50) NOT NULL COMMENT '料件名稱',
  `price` float DEFAULT NULL COMMENT '價格',
  `material_desc` varchar(500) DEFAULT NULL COMMENT '說明',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`material_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of MATERIAL
-- ----------------------------

-- ----------------------------
-- Table structure for `REPAIR_KIND` 客訴單類型
-- ----------------------------
DROP Table IF EXISTS `a_aftersalesservice_repair_kind`;
CREATE Table `a_aftersalesservice_repair_kind`(
  `kind_id`  int(11) NOT NULL COMMENT '類型代碼',
  `kind_name` varchar(50) NOT NULL COMMENT '類型名稱',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`kind_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of REPAIR_KIND
-- ----------------------------

-- ----------------------------
-- Table structure for `REPAIR` 客訴單
-- ----------------------------
SET FOREIGN_KEY_CHECKS=0;

DROP Table IF EXISTS `a_aftersalesservice_repair`;
CREATE Table `a_aftersalesservice_repair`(
  `repair_id` int(11) NOT NULL COMMENT '客訴單代碼' AUTO_INCREMENT,
  `kind_id`  int(11) NOT NULL COMMENT '類型代碼',
  `cus_id`  varchar(10) NOT NULL COMMENT '客戶代碼',
  `machine_id` varchar(32) DEFAULT NULL COMMENT '機號',
  `breakdown_id` varchar(20) DEFAULT NULL COMMENT '問題代碼',
  `status_id`  int(11) DEFAULT NULL COMMENT '狀態(0=未派工，1=已派工未回報，2=處理中，3=結案)',
  `emergency`  int(11) DEFAULT NULL COMMENT '緊急度(0=一般，1=高，2=低)',
  `break_note` text DEFAULT NULL COMMENT '故障內容紀錄',
  `alarm_id` varchar(200) DEFAULT NULL COMMENT '故障代碼',
  `cus_reply` varchar(20) DEFAULT NULL COMMENT '反應人',
  `phone` varchar(20) DEFAULT NULL COMMENT '電話',
  `ext_phone` varchar(20) DEFAULT NULL COMMENT '分機',
  `address` varchar(50) DEFAULT NULL COMMENT '維修地址',
  `fax` varchar(20) DEFAULT NULL COMMENT '傳真',
  `cell_phone` varchar(20) DEFAULT NULL COMMENT '手機',
  `email` varchar(50) DEFAULT NULL COMMENT 'e-mail',
  `assign_time` datetime DEFAULT NULL COMMENT '派工時間',
  `close_time` datetime DEFAULT NULL COMMENT '結案時間',
  `close_remark` varchar(500) DEFAULT NULL COMMENT '結案說明',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`repair_id`),
  CONSTRAINT `FK_rpeair_1` FOREIGN KEY (`kind_id`) REFERENCES `a_aftersalesservice_repair_kind` (`kind_id`),
  CONSTRAINT `FK_rpeair_2` FOREIGN KEY (`cus_id`) REFERENCES `a_aftersalesservice_customer` (`cus_id`),
  CONSTRAINT `FK_rpeair_3` FOREIGN KEY (`machine_id`) REFERENCES `m_device` (`device_id`),
  CONSTRAINT `FK_rpeair_4` FOREIGN KEY (`breakdown_id`) REFERENCES `a_aftersalesservice_entity_breakdown` (`breakdown_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- CONSTRAINT `FK_rpeair_5` FOREIGN KEY (`alarm_id`) REFERENCES `a_aftersalesservice_alarm` (`alarm_id`)
-- ----------------------------
-- Records of REPAIR
-- ----------------------------

-- ----------------------------
-- Table structure for `REPAIR_ASSIGN` 客訴單派工
-- ----------------------------
SET FOREIGN_KEY_CHECKS=0;

DROP Table IF EXISTS `a_aftersalesservice_repair_assign`;
CREATE Table `a_aftersalesservice_repair_assign`(
  `assign_id`  int(11) NOT NULL COMMENT '派工單代碼' AUTO_INCREMENT,
  `repair_id` int(11) NOT NULL COMMENT '客訴單代碼',
  `order_date` datetime DEFAULT NULL COMMENT '預約前往日期',
  `recommend` varchar(500) DEFAULT NULL COMMENT '派工建議',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`assign_id`),
  CONSTRAINT `FK_repair_assign` FOREIGN KEY (`repair_id`) REFERENCES `a_aftersalesservice_repair` (`repair_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- ----------------------------
-- Records of  REPAIR_ASSIGN
-- ----------------------------

-- ----------------------------
-- Table structure for `REPAIR_ASSIGN_EMP` 客訴單派工人員
-- ----------------------------
DROP Table IF EXISTS `a_aftersalesservice_repair_assign_emp`;
CREATE Table `a_aftersalesservice_repair_assign_emp` (
  `assign_id` int(11) NOT NULL COMMENT '派工單代碼',
  `emp_id` varchar(45) NOT NULL COMMENT '服務人員編號',
  PRIMARY KEY (`assign_id`,`emp_id`),
  CONSTRAINT `FK_repair_assign_emp_1` FOREIGN KEY (`assign_id`) REFERENCES `a_aftersalesservice_repair_assign` (`assign_id`),
  CONSTRAINT `FK_repair_assign_emp_2` FOREIGN KEY (`emp_id`) REFERENCES `m_sys_user` (`user_id`)



) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- ----------------------------
-- Records of REPAIR_ASSIGN_EMP
-- ----------------------------

-- ----------------------------
-- Table structure for `REPAIR_REPAY` 叫修單回報
-- ----------------------------
DROP Table IF EXISTS `a_aftersalesservice_repair_repay`;
CREATE Table `a_aftersalesservice_repair_repay`(
  `reply_id`  int(11) NOT NULL AUTO_INCREMENT COMMENT '回報代碼',
  `assign_id` int(11) NOT NULL COMMENT '派工單代碼',
  `maintain_time` datetime DEFAULT NULL COMMENT '維修時間',
  `repay_note` text DEFAULT NULL COMMENT '維修內容',
  `result` int(11) DEFAULT NULL COMMENT '處理結果(0=處理中，1=處理完成)',
  `alarm_log_id` varchar(10) DEFAULT NULL COMMENT '故障排除指引',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`reply_id`),
  CONSTRAINT `FK_repair_repay` FOREIGN KEY (`assign_id`) REFERENCES `a_aftersalesservice_repair_assign` (`assign_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of REPAIR_REPAY
-- ----------------------------

-- ----------------------------
-- Table structure for `REPAIR_MATERIAL` 客訴單購料
-- ----------------------------
DROP Table IF EXISTS `a_aftersalesservice_repair_material`;
CREATE Table `a_aftersalesservice_repair_material`(
  `rm_id`  int(11) NOT NULL AUTO_INCREMENT COMMENT '維修購料代碼',
  `repair_id` int(11) NOT NULL COMMENT '客訴單代碼',
  `material_id` varchar(10) NOT NULL COMMENT '料件代碼',
  `amount` int(11) DEFAULT NULL COMMENT '數量',
  `discount` float DEFAULT NULL COMMENT '折扣',
  `price` float DEFAULT NULL COMMENT '總價',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`rm_id`),
  CONSTRAINT `FK_repair_material_1` FOREIGN KEY (`repair_id`) REFERENCES `a_aftersalesservice_repair` (`repair_id`),
  CONSTRAINT `FK_repair_material_2` FOREIGN KEY (`material_id`) REFERENCES `a_aftersalesservice_material` (`material_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of REPAIR_MATERIAL
-- ----------------------------

CREATE VIEW a_aftersalesservice_view_repair_repay AS 
SELECT list.repair_id,list.alarm_id,list.break_note,list.kind_id,list.emergency,list.create_time,list.cus_id,list.machine_id,list.breakdown_id,assign.assign_id,assign.order_date,list.status_id,list.create_by,emp.emp_id

from  a_aftersalesservice_repair list
inner join 
a_aftersalesservice_repair_assign assign 
on list.repair_id = assign.repair_id
inner JOIN a_aftersalesservice_repair_assign_emp emp
on assign.assign_id = emp.assign_id ;

create VIEW a_aftersalesservice_view_repair_material as  select a.rm_id,a.repair_id,a.material_id,b.material_name,b.price,a.amount,a.discount,a.price as total,a.create_time from a_aftersalesservice_repair_material a , a_aftersalesservice_material b
where a.material_id = b.material_id ;

create view a_aftersalesservice_view_repair_log as  select  b.repair_id,b.order_date,b.recommend,a.maintain_time,a.result,a.repay_note,a.create_by as repay from 
a_aftersalesservice_repair_repay a INNER JOIN  a_aftersalesservice_repair_assign b  on a.assign_id=b.assign_id;





DROP TABLE IF EXISTS `a_alarm_clear_file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_alarm_clear_file` (
  `file_id` varchar(10) NOT NULL,
  `file_name` varchar(50) NOT NULL,
  `file_desc` varchar(100) DEFAULT NULL,
  `file_path` varchar(100) DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_alarm_clear_log`
--

DROP TABLE IF EXISTS `a_alarm_clear_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_alarm_clear_log` (
  `clear_log_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `alarm_log_id` varchar(10) NOT NULL,
  `step_id` varchar(10) NOT NULL,
  `result` varchar(1) NOT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`clear_log_id`),
  KEY `FK_a_alarm_clear_log_alarm_log_id` (`alarm_log_id`),
  KEY `FK_a_alarm_clear_log_step_id` (`step_id`),
  CONSTRAINT `FK_a_alarm_clear_log_alarm_log_id` FOREIGN KEY (`alarm_log_id`) REFERENCES `m_machine_alarm` (`log_id`),
  CONSTRAINT `FK_a_alarm_clear_log_step_id` FOREIGN KEY (`step_id`) REFERENCES `a_alarm_clear_step` (`step_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_alarm_clear_step`
--

DROP TABLE IF EXISTS `a_alarm_clear_step`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_alarm_clear_step` (
  `step_id` varchar(10) NOT NULL,
  `alarm_id` varchar(200) NOT NULL,
  `cnc_id` varchar(45) NOT NULL,
  `machine_type_id` varchar(128) NOT NULL DEFAULT 'OTHER',
  `seq` int(10) unsigned DEFAULT NULL,
  `type` int(10) unsigned DEFAULT NULL,
  `step_desc` varchar(100) DEFAULT NULL,
  `clear_desc` varchar(100) DEFAULT NULL,
  `detect_rules` varchar(500) DEFAULT NULL,
  `file_id_1` varchar(10) DEFAULT NULL,
  `file_id_2` varchar(10) DEFAULT NULL,
  `file_id_3` varchar(10) DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`step_id`),
  KEY `FK_a_alarm_clear_step_alarm_id` (`alarm_id`,`cnc_id`),
  KEY `FK_a_alarm_clear_step_file_id_1` (`file_id_1`),
  KEY `FK_a_alarm_clear_step_file_id_2` (`file_id_2`),
  KEY `FK_a_alarm_clear_step_file_id_3` (`file_id_3`),
  KEY `FK_a_alarm_clear_step_alarm` (`alarm_id`,`cnc_id`,`machine_type_id`),
  CONSTRAINT `FK_a_alarm_clear_step_alarm` FOREIGN KEY (`alarm_id`, `cnc_id`, `machine_type_id`) REFERENCES `m_alarm` (`alarm_id`, `cnc_id`, `machine_type_id`),
  CONSTRAINT `FK_a_alarm_clear_step_file_id_1` FOREIGN KEY (`file_id_1`) REFERENCES `a_alarm_clear_file` (`file_id`),
  CONSTRAINT `FK_a_alarm_clear_step_file_id_2` FOREIGN KEY (`file_id_2`) REFERENCES `a_alarm_clear_file` (`file_id`),
  CONSTRAINT `FK_a_alarm_clear_step_file_id_3` FOREIGN KEY (`file_id_3`) REFERENCES `a_alarm_clear_file` (`file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
create view a_aftersalesservice_view_alarm_log as select a.alarm_log_id,a.step_id,a.result,b.alarm_id,b.step_id asclear_step,b.step_desc,b.clear_desc from a_alarm_clear_log a inner join a_alarm_clear_step b on a.step_id=b.step_id ;

DROP TABLE IF EXISTS `a_cosmos_mail_recipient`;
CREATE TABLE  `a_cosmos_mail_recipient` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `recipients` mediumtext NOT NULL COMMENT '收件者',
  `title` varchar(300) DEFAULT NULL COMMENT '標題',
  `content` mediumtext COMMENT '內文',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8 COMMENT='cosmos自動寄送報表收件者';

DROP TABLE IF EXISTS `a_cosmos_mail_server`;
CREATE TABLE  `a_cosmos_mail_server` (
  `mail_server_ip` varchar(45) NOT NULL DEFAULT '',
  `port` int(10) unsigned NOT NULL,
  `account` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  PRIMARY KEY (`mail_server_ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='cosmos自動寄送報表';


DROP Table IF EXISTS `a_productionefficiency_axis_efficiency`;
CREATE Table `a_productionefficiency_axis_efficiency`(
  `machine_id` varchar(32) NOT NULL COMMENT '機台識別碼',
  `machine_name`  varchar(40)  NOT NULL COMMENT '機台名稱',
  `axis_upper_limit`  int(11)  NOT NULL COMMENT '主軸上限門檻值',
  `feed_upper_limit` int(11)   NOT NULL COMMENT '進給率上限門檻值',
  `re_time_limit` int(11) NOT NULL COMMENT '倒數門檻值',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`machine_id`),
  CONSTRAINT `FK_axis_efficiency_1` FOREIGN KEY (`machine_id`) REFERENCES `m_device` (`device_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `a_productionefficiency_mail`;
CREATE TABLE `a_productionefficiency_mail` (
  `group_minute` int(12) NOT NULL COMMENT '累積時間',
  `mail_address` varchar(65535) NOT NULL COMMENT '通知人',
  PRIMARY KEY (`group_minute`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



DROP TABLE IF EXISTS `a_productionefficiency_send_spacing`;
CREATE TABLE `a_productionefficiency_send_spacing` (
  `upper_limit_spacing` int(11) NOT NULL COMMENT '門檻值異常發送間隔',
  `alarm_spacing` int(11) NOT NULL COMMENT '警報發送間隔', 
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間'
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- Table structure for table `a_tag_for_tool`
--

DROP TABLE IF EXISTS `a_tag_for_tool`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_tag_for_tool` (
  `tag_id` char(14) NOT NULL,
  `tag_name` varchar(45) NOT NULL,
  `tag_parent` char(14) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`tag_id`),
  KEY `FK_tag_1` (`tag_parent`),
  CONSTRAINT `a_tag_for_tool_ibfk_1` FOREIGN KEY (`tag_parent`) REFERENCES `a_tag_for_tool` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_tool`
--

DROP TABLE IF EXISTS `a_tool`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE  `a_tool` (
  `tool_id` char(14) NOT NULL DEFAULT '',
  `tool_name` varchar(45) NOT NULL DEFAULT '',
  `device_id` varchar(32) DEFAULT NULL,
  `tool_slot` varchar(45) DEFAULT NULL,
  `lifetime` varchar(45) DEFAULT NULL,
  `is_enable` int(10) unsigned NOT NULL DEFAULT '0',
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`tool_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='刀具的map';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_tool_log`
--

DROP TABLE IF EXISTS `a_tool_log`;
CREATE TABLE  `a_tool_log` (
  `tool_id` char(14) NOT NULL DEFAULT '',
  `device_id` char(32) NOT NULL DEFAULT '',
  `tool_slot` varchar(45) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `create_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`tool_id`,`device_id`,`tool_slot`,`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='刀具放置機台刀槽的log';

--
-- Table structure for table `a_tool_tag`
--

DROP TABLE IF EXISTS `a_tool_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_tool_tag` (
  `tool_id` char(14) NOT NULL,
  `tag_id` char(14) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`tool_id`,`tag_id`),
  KEY `FK_tool_tag_tool_id` (`tool_id`),
  KEY `FK_tool_tag_tag_id` (`tag_id`),
  CONSTRAINT `FK_tool_tag_tag_id` FOREIGN KEY (`tag_id`) REFERENCES `a_tag_for_tool` (`tag_id`),
  CONSTRAINT `FK_tool_tag_tool_id` FOREIGN KEY (`tool_id`) REFERENCES `a_tool` (`tool_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_utilization_customer`
--

DROP TABLE IF EXISTS `a_utilization_customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_utilization_customer` (
  `customer_id` varchar(45) NOT NULL,
  `customer_name` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `a_utilization_product`
--

DROP TABLE IF EXISTS `a_utilization_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `a_utilization_product` (
  `process_id` varchar(45) NOT NULL,
  `product_name` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`process_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `a_work_macro_record`;
CREATE TABLE  `a_work_macro_record` (
  `machine_id` varchar(32) NOT NULL,
  `macro_create_time` bigint(14) unsigned NOT NULL DEFAULT '0',
  `macro` varchar(10) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`machine_id`,`macro_create_time`) USING BTREE,
  KEY `machine_id_index` (`machine_id`),
  KEY `marco_create_time_index` (`macro_create_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `a_work_macro_record_log`;
CREATE TABLE  `a_work_macro_record_log` (
  `machine_id`  varchar(32) NOT NULL,
  `macro_create_time` bigint(14) unsigned NOT NULL DEFAULT '0',
  `type` varchar(10) NOT NULL,
  `macro_after` varchar(10),
  `create_time` datetime NOT NULL,
  `create_by` varchar(50) NOT NULL,
  PRIMARY KEY (`machine_id`, `macro_create_time`, `create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `m_alarm`
--

DROP TABLE IF EXISTS `m_alarm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_alarm` (
  `alarm_id` varchar(200) NOT NULL,
  `cnc_id` varchar(45) NOT NULL,
  `machine_type_id` varchar(128) NOT NULL DEFAULT 'OTHER',
  `alarm_status` varchar(200) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `source` int(10) unsigned NOT NULL DEFAULT '0',
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`alarm_id`,`cnc_id`,`machine_type_id`) USING BTREE,
  KEY `FK_m_alarm_cnc_id` (`cnc_id`),
  KEY `FK_m_alarm_machine_type_id` (`machine_type_id`),
  CONSTRAINT `FK_m_alarm_cnc_id` FOREIGN KEY (`cnc_id`) REFERENCES `m_cnc_brand` (`cnc_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_m_alarm_machine_type_id` FOREIGN KEY (`machine_type_id`) REFERENCES `m_machine_type` (`machine_type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_app_class_tag`
--

DROP TABLE IF EXISTS `m_app_class_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_app_class_tag` (
  `app_id` varchar(45) NOT NULL,
  `tag_id` varchar(14) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`app_id`,`tag_id`),
  KEY `FK_tag_for_app_class_tag_id` (`tag_id`),
  CONSTRAINT `FK_tag_for_app_class_tag_id` FOREIGN KEY (`tag_id`) REFERENCES `m_tag_for_app_class` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_app_execute_log`
--

DROP TABLE IF EXISTS `m_app_execute_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_app_execute_log` (
  `log_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `app_id` varchar(45) NOT NULL,
  `execute_id` varchar(45) NOT NULL,
  `execute_start_time` datetime NOT NULL,
  `execute_stop_time` datetime NOT NULL,
  `execute_by` varchar(45) NOT NULL,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_app_info`
--

DROP TABLE IF EXISTS `m_app_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_app_info` (
  `app_id` varchar(45) NOT NULL,
  `app_name` varchar(100) NOT NULL,
  `app_type` int(10) unsigned NOT NULL,
  `description` varchar(9999) NOT NULL,
  `version` varchar(45) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(100) DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  `update_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`app_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_app_update_log`
--

DROP TABLE IF EXISTS `m_app_update_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_app_update_log` (
  `log_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `app_id` varchar(45) NOT NULL,
  `update_time` datetime NOT NULL,
  `update_by` varchar(45) NOT NULL,
  PRIMARY KEY (`log_id`) USING BTREE,
  KEY `FK_app_update_log_app_id` (`app_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_box`
--

DROP TABLE IF EXISTS `m_box`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_box` (
  `box_id` varchar(28) NOT NULL,
  `ip` varchar(40) DEFAULT NULL,
  `port` varchar(10) DEFAULT NULL,
  `box_mac` varchar(40) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`box_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_box_download_log`
--

DROP TABLE IF EXISTS `m_box_download_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_box_download_log` (
  `log_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `box_id` varchar(45) NOT NULL,
  `download_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `download_by` varchar(45) NOT NULL,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_cnc_brand`
--

DROP TABLE IF EXISTS `m_cnc_brand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_cnc_brand` (
  `cnc_id` varchar(45) NOT NULL,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`cnc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_cnc_monitor_page`
--

DROP TABLE IF EXISTS `m_cnc_monitor_page`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_cnc_monitor_page` (
  `cnc_id` varchar(45) NOT NULL,
  `page_id` varchar(45) NOT NULL,
  PRIMARY KEY (`cnc_id`,`page_id`),
  KEY `FK_m_cnc_monitor_page_page_id` (`page_id`),
  CONSTRAINT `FK_m_cnc_monitor_page_cnc_id` FOREIGN KEY (`cnc_id`) REFERENCES `m_cnc_brand` (`cnc_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_m_cnc_monitor_page_page_id` FOREIGN KEY (`page_id`) REFERENCES `m_monitor_page` (`page_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_db_max_index`
--

DROP TABLE IF EXISTS `m_db_max_index`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_db_max_index` (
  `table_name` varchar(30) NOT NULL,
  `desc` varchar(70) NOT NULL,
  `max_index` int(10) unsigned NOT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`table_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_device`
--

DROP TABLE IF EXISTS `m_device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_device` (
  `device_id` varchar(32) NOT NULL,
  `device_name` varchar(40) NOT NULL,
  `ip` varchar(40) DEFAULT NULL,
  `device_mac` varchar(40) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `gps` varchar(45) DEFAULT NULL,
  `lean_id` varchar(45) DEFAULT NULL,
  `port` varchar(10) DEFAULT NULL,
  `device_type` varchar(128) DEFAULT 'OTHER',
  `plant_area` varchar(45) DEFAULT NULL,
  `is_real_data` int(10) unsigned NOT NULL DEFAULT '1',
  `demo_status` varchar(3) NOT NULL DEFAULT '11',
  PRIMARY KEY (`device_id`),
  KEY `FK_m_device_1` (`plant_area`),
  KEY `FK_m_device_machine_type_id` (`device_type`),
  CONSTRAINT `FK_m_device_plant_area` FOREIGN KEY (`plant_area`) REFERENCES `m_plant_area` (`plant_id`) ON DELETE SET NULL,
  CONSTRAINT `FK_m_device_machine_type_id` FOREIGN KEY (`device_type`) REFERENCES `m_machine_type` (`machine_type_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_device_box`
--

DROP TABLE IF EXISTS `m_device_box`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_device_box` (
  `device_id` varchar(32) NOT NULL,
  `box_id` varchar(28) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`device_id`,`box_id`),
  KEY `FK_device_box_box_id` (`box_id`),
  CONSTRAINT `FK_device_box_box_id` FOREIGN KEY (`box_id`) REFERENCES `m_box` (`box_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_device_box_device_id` FOREIGN KEY (`device_id`) REFERENCES `m_device` (`device_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_device_cnc_brand`
--

DROP TABLE IF EXISTS `m_device_cnc_brand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_device_cnc_brand` (
  `device_id` varchar(32) NOT NULL,
  `cnc_id` varchar(45) NOT NULL,
  PRIMARY KEY (`device_id`),
  KEY `FK_m_device_cnc_brand_cnc_id` (`cnc_id`),
  CONSTRAINT `FK_m_device_cnc_brand_cnc_id` FOREIGN KEY (`cnc_id`) REFERENCES `m_cnc_brand` (`cnc_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_m_device_cnc_brand_device_id` FOREIGN KEY (`device_id`) REFERENCES `m_device` (`device_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_device_light`
--

DROP TABLE IF EXISTS `m_device_light`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_device_light` (
  `light_id` varchar(45) NOT NULL,
  `light_name` varchar(45) DEFAULT NULL,
  `color` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`light_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_device_section`
--

DROP TABLE IF EXISTS `m_device_section`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_device_section` (
  `device_id` varchar(32) NOT NULL,
  `section_id` varchar(28) NOT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`device_id`,`section_id`),
  KEY `FK_device_section_secton_id` (`section_id`),
  CONSTRAINT `FK_device_section_section_id` FOREIGN KEY (`section_id`) REFERENCES `m_section` (`section_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_device_section_device_id` FOREIGN KEY (`device_id`) REFERENCES `m_device` (`device_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_device_tag`
--

DROP TABLE IF EXISTS `m_device_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_device_tag` (
  `device_id` varchar(32) NOT NULL,
  `tag_id` char(14) NOT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  PRIMARY KEY (`device_id`,`tag_id`),
  KEY `FK_device_tag_2` (`tag_id`),
  CONSTRAINT `FK_device_tag_1` FOREIGN KEY (`device_id`) REFERENCES `m_device` (`device_id`),
  CONSTRAINT `FK_device_tag_2` FOREIGN KEY (`tag_id`) REFERENCES `m_tag_for_device` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_ip_cam`
--

DROP TABLE IF EXISTS `m_ip_cam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE  `m_ip_cam` (
  `ip_cam_id` varchar(20) NOT NULL,
  `ip` varchar(100) DEFAULT NULL,
  `user_name` varchar(45) DEFAULT '',
  `password` varchar(45) DEFAULT '',
  `device_id` varchar(32) DEFAULT '',
  `line_id` varchar(45) DEFAULT '',
  `plant_id` varchar(45) DEFAULT NULL,
  `sequence` varchar(5) DEFAULT '0',
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ip_cam_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_jia_day_setting`
--

DROP TABLE IF EXISTS `m_jia_day_setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_jia_day_setting` (
  `start_time_hour` varchar(2) NOT NULL,
  `start_time_min` varchar(2) NOT NULL,
  `end_time_hour` varchar(2) NOT NULL,
  `end_time_min` varchar(2) NOT NULL,
  `non_stop` varchar(1) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(40) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(40) DEFAULT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_jia_schedule_time`
--

DROP TABLE IF EXISTS `m_jia_schedule_time`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_jia_schedule_time` (
  `device_id` varchar(32) NOT NULL,
  `last_time` varchar(14) NOT NULL,
  PRIMARY KEY (`device_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_jia_stroke`
--

DROP TABLE IF EXISTS `m_jia_stroke`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_jia_stroke` (
  `stroke_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `stroke_name` varchar(100) NOT NULL,
  PRIMARY KEY (`stroke_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_jia_work_frequency`
--

DROP TABLE IF EXISTS `m_jia_work_frequency`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_jia_work_frequency` (
  `work_num` int(11) NOT NULL AUTO_INCREMENT,
  `work_name` varchar(20) NOT NULL,
  `start_time` varchar(4) NOT NULL,
  `end_time` varchar(4) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(40) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`work_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_line_machine`
--

DROP TABLE IF EXISTS `m_line_machine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_line_machine` (
  `line_id` varchar(45) NOT NULL,
  `line_name` varchar(45) NOT NULL,
  `machine_seq` int(10) NOT NULL,
  `type_id` varchar(45) NOT NULL,
  `op_seq` int(10) NOT NULL,
  `machine_id` varchar(32) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `create_from` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_from` varchar(45) DEFAULT NULL,
  `is_close` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`line_id`,`machine_seq`,`type_id`,`op_seq`),
  KEY `FK_m_line_machine_1` (`machine_id`),
  KEY `FK_m_line_machine_2` (`type_id`,`op_seq`),
  CONSTRAINT `FK_m_line_machine_1` FOREIGN KEY (`machine_id`) REFERENCES `m_device` (`device_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_m_line_machine_2` FOREIGN KEY (`type_id`, `op_seq`) REFERENCES `m_line_type` (`type_id`, `op_seq`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_line_type`
--

DROP TABLE IF EXISTS `m_line_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_line_type` (
  `type_id` varchar(45) NOT NULL,
  `type_name` varchar(45) NOT NULL,
  `op_seq` int(10) NOT NULL,
  `op_name` varchar(45) NOT NULL,
  `op_desc` varchar(45) DEFAULT NULL,
  `machine_num` int(10) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `is_close` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`type_id`,`op_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_machine_alarm`
--

DROP TABLE IF EXISTS `m_machine_alarm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_machine_alarm` (
  `log_id` varchar(10) NOT NULL,
  `machine_id` varchar(32) NOT NULL,
  `alarm_id` varchar(200) NOT NULL,
  `cnc_id` varchar(45) NOT NULL,
  `machine_type_id` varchar(128) NOT NULL DEFAULT 'OTHER',
  `occur_time` datetime NOT NULL,
  `occur_date` date DEFAULT NULL,
  `clear_status` int(10) unsigned NOT NULL,
  `clear_time` datetime DEFAULT NULL,
  `clear_date` date DEFAULT NULL,
  `result` varchar(100) DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `FK_device_alarm_alarm_id` (`alarm_id`,`cnc_id`),
  KEY `FK_m_device_alarm_alarm_id` (`alarm_id`,`cnc_id`,`machine_type_id`),
  KEY `FK_device_alarm_device_id` (`machine_id`) USING BTREE,
  CONSTRAINT `FK_device_alarm_device_id` FOREIGN KEY (`machine_id`) REFERENCES `m_device` (`device_id`),
  CONSTRAINT `FK_m_device_alarm_alarm_id` FOREIGN KEY (`alarm_id`, `cnc_id`, `machine_type_id`) REFERENCES `m_alarm` (`alarm_id`, `cnc_id`, `machine_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='故障排除用，機台警報log';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_machine_type`
--

DROP TABLE IF EXISTS `m_machine_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_machine_type` (
  `machine_type_id` varchar(128) NOT NULL,
  `product_id` varchar(10) NOT NULL,
  `type_name` varchar(50) DEFAULT NULL,
  `type_desc` varchar(500) DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`machine_type_id`),
  KEY `FK_m_machine_type_product_id` (`product_id`),
  CONSTRAINT `FK_m_machine_type_product_id` FOREIGN KEY (`product_id`) REFERENCES `m_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_monitor_page`
--

DROP TABLE IF EXISTS `m_monitor_page`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_monitor_page` (
  `page_id` varchar(45) NOT NULL,
  `name` varchar(45) NOT NULL,
  `html_file_name` varchar(45) NOT NULL,
  PRIMARY KEY (`page_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_motor_status`
--

DROP TABLE IF EXISTS `m_motor_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_motor_status` (
  `motor_status_id` varchar(5) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`motor_status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_plant`
--

DROP TABLE IF EXISTS `m_plant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_plant` (
  `plant_id` varchar(45) NOT NULL,
  `plant_name` varchar(45) NOT NULL,
  `row_length` int(10) unsigned NOT NULL,
  `column_length` int(10) unsigned NOT NULL,
  `row_head` text NOT NULL,
  `column_head` text NOT NULL,
  PRIMARY KEY (`plant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_plant_area`
--

DROP TABLE IF EXISTS `m_plant_area`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_plant_area` (
  `device_id` varchar(32) NOT NULL,
  `plant_id` varchar(45) NOT NULL,
  `row_index` int(10) unsigned NOT NULL,
  `column_index` int(10) unsigned NOT NULL,
  PRIMARY KEY (`device_id`) USING BTREE,
  KEY `FK_m_plant_area_plant_id` (`plant_id`),
  CONSTRAINT `FK_m_plant_area_device_id` FOREIGN KEY (`device_id`) REFERENCES `m_device` (`device_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_m_plant_area_plant_id` FOREIGN KEY (`plant_id`) REFERENCES `m_plant` (`plant_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_product`
--

DROP TABLE IF EXISTS `m_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_product` (
  `product_id` varchar(10) NOT NULL,
  `product_name` varchar(50) NOT NULL,
  `product_desc` varchar(500) DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_schedule_job`
--

DROP TABLE IF EXISTS `m_schedule_job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_schedule_job` (
  `job_group_name` varchar(45) NOT NULL,
  `job_name` varchar(45) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('Running','Waiting','None','Error') NOT NULL,
  `prev_execute` datetime DEFAULT NULL,
  `next_execute` datetime DEFAULT NULL,
  PRIMARY KEY (`job_group_name`,`job_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_schedule_trigger`
--

DROP TABLE IF EXISTS `m_schedule_trigger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_schedule_trigger` (
  `trigger_group_name` varchar(45) NOT NULL,
  `trigger_name` varchar(45) NOT NULL,
  `job_group_name` varchar(45) NOT NULL,
  `job_name` varchar(45) NOT NULL,
  `schedule_time` varchar(45) NOT NULL,
  `is_open` enum('Y','N') NOT NULL,
  `prev_execute` datetime DEFAULT NULL,
  `next_execute` datetime DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `app_dir` varchar(45) NOT NULL,
  `bat_dir` varchar(45) NOT NULL,
  PRIMARY KEY (`trigger_group_name`,`trigger_name`),
  KEY `FK_schedule_job_idx` (`job_group_name`,`job_name`),
  CONSTRAINT `FK_schedule_job` FOREIGN KEY (`job_group_name`, `job_name`) REFERENCES `m_schedule_job` (`job_group_name`, `job_name`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_serv_market`
--

DROP TABLE IF EXISTS `m_section`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_section` (
  `section_id` varchar(28) NOT NULL,
  `section_name` varchar(100) NOT NULL,
  `position_top` varchar(10) NOT NULL DEFAULT '0' comment '全廠監控頁面工段的top',
  `position_left` varchar(10) NOT NULL DEFAULT '0' comment '全廠監控頁面工段的left',
  `max` int(10) NOT NULL DEFAULT 100 comment 'demo的最大值',
  `min` int(10) NOT NULL DEFAULT 0 comment 'demo的最小值',
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`section_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_serv_market`
--

DROP TABLE IF EXISTS `m_serv_market`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_serv_market` (
  `app_id` varchar(45) NOT NULL,
  `app_name` varchar(100) NOT NULL,
  `version` varchar(45) NOT NULL,
  `description` varchar(3000) NOT NULL,
  `author` varchar(45) NOT NULL,
  `download_count` int(10) unsigned NOT NULL,
  `icon_path` varchar(255) NOT NULL,
  `pictures_path` varchar(255) NOT NULL,
  `app_file_path` varchar(255) NOT NULL,
  `create_by` varchar(45) NOT NULL,
  `create_time` datetime NOT NULL,
  `update_by` varchar(45) DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  `priority` int(10) unsigned NOT NULL,
  PRIMARY KEY (`app_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_auth`
--

DROP TABLE IF EXISTS `m_sys_auth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_auth` (
  `auth_id` varchar(45) NOT NULL,
  `auth_name` varchar(45) NOT NULL,
  `is_open` int(10) unsigned DEFAULT NULL COMMENT '?臬?',
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `is_close` int(10) unsigned NOT NULL,
  PRIMARY KEY (`auth_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_auth_func`
--

DROP TABLE IF EXISTS `m_sys_auth_func`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_auth_func` (
  `auth_id` varchar(45) NOT NULL,
  `func_id` varchar(45) NOT NULL,
  `app_id` varchar(45) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`auth_id`,`func_id`,`app_id`),
  KEY `_idx` (`auth_id`),
  KEY `d_idx` (`func_id`),
  KEY `FK_sys_auth_func_func_id_idx` (`func_id`,`app_id`),
  CONSTRAINT `FK_sys_auth_func_auth_id` FOREIGN KEY (`auth_id`) REFERENCES `m_sys_auth` (`auth_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_sys_auth_func_func_id` FOREIGN KEY (`func_id`, `app_id`) REFERENCES `m_sys_func` (`func_id`, `app_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_d_auth`
--

DROP TABLE IF EXISTS `m_sys_d_auth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_d_auth` (
  `d_auth_id` varchar(45) NOT NULL,
  `d_auth_name` varchar(45) NOT NULL,
  `is_open` int(10) unsigned DEFAULT NULL COMMENT '?臬?',
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `is_close` int(10) unsigned NOT NULL,
  PRIMARY KEY (`d_auth_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_d_auth_dashboard`
--

DROP TABLE IF EXISTS `m_sys_d_auth_dashboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_d_auth_dashboard` (
  `d_auth_id` varchar(45) NOT NULL,
  `dashboard_id` varchar(45) NOT NULL,
  `app_id` varchar(45) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`d_auth_id`,`dashboard_id`,`app_id`),
  KEY `_idx` (`d_auth_id`),
  KEY `d_idx` (`dashboard_id`),
  KEY `FK_sys_d_auth_dashboard_dashboard_id_idx` (`dashboard_id`,`app_id`),
  CONSTRAINT `FK_sys_d_auth_dashboard_d_auth_id` FOREIGN KEY (`d_auth_id`) REFERENCES `m_sys_d_auth` (`d_auth_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_sys_d_auth_dashboard_dashboard_id` FOREIGN KEY (`dashboard_id`, `app_id`) REFERENCES `m_sys_dashboard` (`dashboard_id`, `app_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_d_group`
--

DROP TABLE IF EXISTS `m_sys_d_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_d_group` (
  `d_group_id` varchar(45) NOT NULL,
  `d_group_name` varchar(45) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(40) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(40) DEFAULT NULL,
  `is_close` int(10) unsigned NOT NULL,
  PRIMARY KEY (`d_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_d_group_d_auth`
--

DROP TABLE IF EXISTS `m_sys_d_group_d_auth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_d_group_d_auth` (
  `d_group_id` varchar(45) NOT NULL,
  `d_auth_id` varchar(45) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`d_group_id`,`d_auth_id`) USING BTREE,
  KEY `FK_sys_d_role_func_1` (`d_auth_id`),
  CONSTRAINT `FK_sys_d_group_func_d_group_id` FOREIGN KEY (`d_group_id`) REFERENCES `m_sys_d_group` (`d_group_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_sys_d_role_func_1` FOREIGN KEY (`d_auth_id`) REFERENCES `m_sys_d_auth` (`d_auth_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_dashboard`
--

DROP TABLE IF EXISTS `m_sys_dashboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_dashboard` (
  `dashboard_id` varchar(45) NOT NULL,
  `app_id` varchar(45) NOT NULL,
  `dashboard_name` text NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`dashboard_id`,`app_id`),
  KEY `FK_sys_dashboard_app_id_idx` (`app_id`),
  CONSTRAINT `FK_sys_dashboard_app_id` FOREIGN KEY (`app_id`) REFERENCES `m_app_info` (`app_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_employee`
--

DROP TABLE IF EXISTS `m_sys_employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_employee` (
  `employee_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `employee_name` varchar(45) NOT NULL,
  PRIMARY KEY (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_func`
--

DROP TABLE IF EXISTS `m_sys_func`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_func` (
  `func_id` varchar(45) NOT NULL,
  `app_id` varchar(45) NOT NULL,
  `func_name` text NOT NULL,
  `hash` varchar(45) NOT NULL,
  `description` varchar(1024) NOT NULL DEFAULT '',
  `author` varchar(128) NOT NULL DEFAULT '',
  PRIMARY KEY (`func_id`,`app_id`),
  KEY `FK_sys_func_app_id_idx` (`app_id`),
  CONSTRAINT `FK_sys_func_app_id` FOREIGN KEY (`app_id`) REFERENCES `m_app_info` (`app_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_group`
--

DROP TABLE IF EXISTS `m_sys_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_group` (
  `group_id` varchar(45) NOT NULL,
  `group_name` varchar(45) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(40) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(40) DEFAULT NULL,
  `is_close` int(10) unsigned NOT NULL,
  PRIMARY KEY (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_group_auth`
--

DROP TABLE IF EXISTS `m_sys_group_auth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_group_auth` (
  `group_id` varchar(45) NOT NULL,
  `auth_id` varchar(45) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`group_id`,`auth_id`) USING BTREE,
  KEY `FK_sys_role_func_1` (`auth_id`),
  CONSTRAINT `FK_sys_group_func_group_id` FOREIGN KEY (`group_id`) REFERENCES `m_sys_group` (`group_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_sys_role_func_1` FOREIGN KEY (`auth_id`) REFERENCES `m_sys_auth` (`auth_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_group_machine`
--

DROP TABLE IF EXISTS `m_sys_group_machine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_group_machine` (
  `group_id` varchar(45) NOT NULL,
  `machine_id` varchar(32) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`group_id`,`machine_id`) USING BTREE,
  KEY `machine_id` (`machine_id`) USING BTREE,
  CONSTRAINT `FK_m_sys_group_machine_group_id` FOREIGN KEY (`group_id`) REFERENCES `m_sys_group` (`group_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_m_sys_group_machine_machine_id` FOREIGN KEY (`machine_id`) REFERENCES `m_device` (`device_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='群組機台綁定';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_log_email`
--

DROP TABLE IF EXISTS `m_sys_log_email`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_log_email` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `status` varchar(15) NOT NULL,
  `from_email` varchar(100) NOT NULL,
  `to_email` longtext NOT NULL,
  `email_title` varchar(200) NOT NULL,
  `email_content` longtext NOT NULL,
  `create_by` varchar(45) NOT NULL,
  `create_time` datetime NOT NULL,
  `message` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_log_exception`
--

DROP TABLE IF EXISTS `m_sys_log_exception`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_log_exception` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `create_time` datetime NOT NULL,
  `exception` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_log_login`
--

DROP TABLE IF EXISTS `m_sys_log_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_log_login` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` varchar(45) DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `action` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_sys_log_login_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_user`
--

DROP TABLE IF EXISTS `m_sys_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_user` (
  `user_id` varchar(45) NOT NULL,
  `user_pwd` varchar(32) NOT NULL,
  `user_name` varchar(45) NOT NULL,
  `user_email` varchar(100) DEFAULT NULL,
  `user_phone` varchar(30) DEFAULT NULL,
  `user_address` varchar(200) DEFAULT NULL,
  `pwd_error_count` int(10) unsigned NOT NULL,
  `is_valid` int(10) unsigned NOT NULL,
  `is_lock` int(10) unsigned NOT NULL,
  `is_close` int(10) unsigned NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `language` varchar(10) NOT NULL DEFAULT 'en',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_user_d_group`
--

DROP TABLE IF EXISTS `m_sys_user_d_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_user_d_group` (
  `user_id` varchar(45) NOT NULL,
  `d_group_id` varchar(45) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`user_id`,`d_group_id`),
  KEY `FK_sys_user_d_group_d_group_id` (`d_group_id`),
  CONSTRAINT `FK_sys_user_d_group_d_group_id` FOREIGN KEY (`d_group_id`) REFERENCES `m_sys_d_group` (`d_group_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_sys_user_d_group_user_id` FOREIGN KEY (`user_id`) REFERENCES `m_sys_user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_sys_user_group`
--

DROP TABLE IF EXISTS `m_sys_user_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_sys_user_group` (
  `user_id` varchar(45) NOT NULL,
  `group_id` varchar(45) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`user_id`,`group_id`),
  KEY `FK_sys_user_group_group_id` (`group_id`),
  CONSTRAINT `FK_sys_user_group_group_id` FOREIGN KEY (`group_id`) REFERENCES `m_sys_group` (`group_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_sys_user_group_user_id` FOREIGN KEY (`user_id`) REFERENCES `m_sys_user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_tag_for_app_class`
--

DROP TABLE IF EXISTS `m_tag_for_app_class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_tag_for_app_class` (
  `tag_id` varchar(14) NOT NULL,
  `tag_name` varchar(45) NOT NULL,
  `tag_parent` varchar(14) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`tag_id`),
  KEY `tag_parent` (`tag_parent`),
  CONSTRAINT `m_tag_for_app_class_ibfk_1` FOREIGN KEY (`tag_parent`) REFERENCES `m_tag_for_app_class` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_tag_for_device`
--

DROP TABLE IF EXISTS `m_tag_for_device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_tag_for_device` (
  `tag_id` char(14) NOT NULL,
  `tag_name` varchar(45) NOT NULL,
  `tag_parent` char(14) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `create_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`tag_id`),
  KEY `tag_parent` (`tag_parent`),
  CONSTRAINT `m_tag_for_device_ibfk_1` FOREIGN KEY (`tag_parent`) REFERENCES `m_tag_for_device` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_unit_type`
--
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_work_shift_child`
--

DROP TABLE IF EXISTS `m_work_shift_child`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_work_shift_child` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `weekday` int(10) unsigned DEFAULT NULL,
  `date` date DEFAULT NULL,
  `work_shift_group_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_m_work_shift_child_1` (`work_shift_group_id`),
  CONSTRAINT `FK_m_work_shift_child_1` FOREIGN KEY (`work_shift_group_id`) REFERENCES `m_work_shift_group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_work_shift_group`
--

DROP TABLE IF EXISTS `m_work_shift_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_work_shift_group` (
  `id` bigint(20) unsigned NOT NULL,
  `type` varchar(10) NOT NULL,
  `group_name` varchar(45) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `m_work_shift_time`
--

DROP TABLE IF EXISTS `m_work_shift_time`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `m_work_shift_time` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `sequence` int(10) unsigned NOT NULL,
  `name` varchar(10) NOT NULL,
  `start` time NOT NULL,
  `end` time NOT NULL,
  `work_shift_group_id` bigint(20) unsigned NOT NULL,
   `is_open` varchar(2) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `FK_m_work_shift_1` (`work_shift_group_id`),
  CONSTRAINT `FK_m_work_shift_1` FOREIGN KEY (`work_shift_group_id`) REFERENCES `m_work_shift_group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

DROP Table IF EXISTS `a_management_axis_efficiency`;
CREATE Table `a_management_axis_efficiency`(
  `machine_id` varchar(32) NOT NULL COMMENT '機台識別碼',
  `machine_name`  varchar(40)  NOT NULL COMMENT '機台名稱',
  `axis_upper_limit`  int(11)  NOT NULL COMMENT '主軸上限門檻值',
  `feed_upper_limit` int(11)   NOT NULL COMMENT '進給率上限門檻值',
  `create_by` varchar(50) DEFAULT NULL COMMENT '建立者',
  `create_time` datetime DEFAULT NULL COMMENT '建立時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`machine_id`),
  CONSTRAINT `FK_management_axis_efficiency_1` FOREIGN KEY (`machine_id`) REFERENCES `m_device` (`device_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `a_file_manage_type`;
CREATE TABLE `a_file_manage_type` (
  `server_type` varchar(50) NOT NULL,
  `server_name` varchar(50) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`server_type`),
  KEY `server_type` (`server_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `a_file_manage_machine`;
CREATE TABLE `a_file_manage_machine` (
  `machine_id` varchar(32) NOT NULL,
  `server_type` varchar(50) NOT NULL,
  `server_ip` varchar(50) NOT NULL,
  `server_port` int(5) NOT NULL,
  `account` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`machine_id`),
  KEY `FK_server_type` (`server_type`),
  CONSTRAINT `FK_server_type` FOREIGN KEY (`server_type`) REFERENCES `a_file_manage_type` (`server_type`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_machine_id` FOREIGN KEY (`machine_id`) REFERENCES `m_device` (`device_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `m_pivot_report`;
CREATE TABLE `m_pivot_report` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL DEFAULT '',
  `desc` VARCHAR(255),
  `pivot_condition` VARCHAR(255) NOT NULL DEFAULT '',
  `space` VARCHAR(45) NOT NULL DEFAULT '',
  `index_value` VARCHAR(255) NOT NULL DEFAULT '',
  PRIMARY KEY(`id`)
)
ENGINE = InnoDB
COMMENT = '自訂樞紐分析報表';

DROP TABLE IF EXISTS `m_app_func_brand`;
CREATE TABLE  `m_app_func_brand` (
  `app_id` varchar(45) NOT NULL DEFAULT '',
  `func_id` varchar(45) NOT NULL DEFAULT '',
  `cnc_id` varchar(45) NOT NULL DEFAULT '',
  `not_default_key` varchar(45),
  `create_by` varchar(50) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `modify_by` varchar(50) NOT NULL DEFAULT '',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`app_id`,`func_id`,`cnc_id`),
  KEY `FK_m_app_func_brand_cnc_id` (`cnc_id`),
  KEY `FK_m_app_func_brand_device_app_func_id` (`func_id`,`app_id`) USING BTREE,
  CONSTRAINT `FK_m_app_func_brand_device_app_func_id` FOREIGN KEY (`func_id`, `app_id`) REFERENCES `m_sys_func` (`func_id`, `app_id`),
  CONSTRAINT `FK_m_app_func_brand_cnc_id` FOREIGN KEY (`cnc_id`) REFERENCES `m_cnc_brand` (`cnc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP VIEW IF EXISTS `m_view_device_cnc_brand`;
CREATE VIEW m_view_device_cnc_brand AS 
SELECT 
afb.app_id,
afb.func_id,
afb.not_default_key,
dcb.cnc_id,
cb.name,
dcb.device_id,
d.device_name,
pa.plant_id,
pa.row_index,
pa.column_index,
db.box_id

FROM m_app_func_brand afb

INNER JOIN
m_device_cnc_brand dcb
on dcb.cnc_id = afb.cnc_id

INNER JOIN
m_device d
on dcb.device_id = d.device_id

INNER JOIN
m_cnc_brand cb
on afb.cnc_id = cb.cnc_id

LEFT JOIN
m_plant_area pa
on d.device_id = pa.device_id

INNER JOIN
m_device_box db
on d.device_id = db.device_id;

DROP VIEW IF EXISTS `v_machine_plant_area`;
CREATE VIEW v_machine_plant_area AS 
SELECT
`d`.`device_id` AS `device_id`,
`d`.`device_name` AS `device_name`,
`p`.`plant_id` AS `plant_id`,
`p`.`row_index` AS `row_index`,
`p`.`column_index` AS `column_index`
FROM (`m_device` `d` JOIN `m_plant_area` `p`)
WHERE (`p`.`device_id` = `d`.`device_id`);

DROP TABLE IF EXISTS `m_sys_log`;
CREATE TABLE  `m_sys_log` (
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ip` varchar(50) NOT NULL,
  `port` varchar(50) NOT NULL,
  `api` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `hour` varchar(50) NOT NULL,
  `date_hour` varchar(50) NOT NULL,
  `func` varchar(50) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`timestamp`,`ip`,`port`,`api`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP VIEW IF EXISTS `a_downtime_view_program_comment_product`;
CREATE VIEW a_downtime_view_program_comment_product AS 
SELECT 
p.product_id,
p.product_name
FROM m_product p;