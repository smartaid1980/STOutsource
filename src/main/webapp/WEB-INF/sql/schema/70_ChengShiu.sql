-- MySQL Administrator dump 1.4
--
-- ------------------------------------------------------
-- Server version	5.5.43-log


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


--
-- Create schema servcloud
--

CREATE DATABASE IF NOT EXISTS servcloud;
USE servcloud;

--
-- Definition of table `a_chengshiu_agv`
--

DROP TABLE IF EXISTS `a_chengshiu_agv`;
CREATE TABLE `a_chengshiu_agv` (
  `agv_id` varchar(10) BINARY NOT NULL DEFAULT '' COMMENT 'AGV代碼',
  `agv_name` varchar(20) NOT NULL DEFAULT '' COMMENT 'AGV名稱',
  `type_id` varchar(1) BINARY NOT NULL DEFAULT '' COMMENT '類型(1=巡邏車,2=搬運車)',
  `ipcam_ip` varchar(100) NOT NULL DEFAULT '' COMMENT 'IPCam IP',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`agv_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='AGV';

--
-- Dumping data for table `a_chengshiu_agv`
--

/*!40000 ALTER TABLE `a_chengshiu_agv` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_agv` ENABLE KEYS */;


--
-- Definition of table `a_chengshiu_agv_rfid`
--

DROP TABLE IF EXISTS `a_chengshiu_agv_rfid`;
CREATE TABLE `a_chengshiu_agv_rfid` (
  `rfid_id` varchar(10) BINARY NOT NULL DEFAULT '' COMMENT 'RFID站點代碼',
  `local_id` varchar(1) BINARY NOT NULL DEFAULT '' COMMENT '類型',
  `is_open` varchar(1) NOT NULL DEFAULT 'Y' COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`rfid_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='AGV站點(RFID)';

--
-- Dumping data for table `a_chengshiu_agv_rfid`
--

/*!40000 ALTER TABLE `a_chengshiu_agv_rfid` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_agv_rfid` ENABLE KEYS */;


--
-- Definition of table `a_chengshiu_alarm`
--

DROP TABLE IF EXISTS `a_chengshiu_alarm`;
CREATE TABLE `a_chengshiu_alarm` (
  `alarm_id` varchar(10) BINARY NOT NULL DEFAULT '' COMMENT '警報代碼',
  `alarm_name` varchar(50) NOT NULL DEFAULT '' COMMENT '警報名稱',
  `is_open` varchar(1) NOT NULL DEFAULT '' COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`alarm_id`),
  KEY `IDX_ALARM_IS_OPEN` (`is_open`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='口罩機警報類別';


--
-- Definition of table `a_chengshiu_alert_log`
--

DROP TABLE IF EXISTS `a_chengshiu_alert_log`;
CREATE TABLE `a_chengshiu_alert_log` (
  `log_id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '通知代碼',
  `type_id` varchar(1) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '' COMMENT '提醒類別',
  `content` varchar(50) NOT NULL DEFAULT '' COMMENT '提醒內容',
  `machine_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '設備(機台)代碼，type=A, C, G',
  `alarm_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '警報代碼，type=G',
  `sensor_alarm_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '感測警報代碼，type=D',
  `rule_id` int(10) unsigned DEFAULT NULL COMMENT '流水號',
  `agv_id` varchar(10) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT 'AGV代碼，type=B',
  `rfid_id` varchar(10) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT 'rfid站點代碼',
  `item_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '原料單件號，type=C, E',
  `sensor_id` varchar(10) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '感測器代碼，type=D',
  `sensor_type` varchar(20) DEFAULT NULL COMMENT '感測器類型',
  `customer_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '商店代碼，type=F',
  `product_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '產品代碼',
  `value_act` float NOT NULL DEFAULT '0' COMMENT '實際數值，type=A, B, C, D, E, F',
  `value_est` float NOT NULL DEFAULT '0' COMMENT '應被觸發數值，type=A, B, C, D, F',
  `value_est_high` float DEFAULT NULL COMMENT '應被觸發數值，為警示上限值，type=D',
  `is_close` varchar(1) NOT NULL DEFAULT '' COMMENT '是否確認',
  `close_time` datetime DEFAULT NULL COMMENT '確認時間',
  `close_by` varchar(50) DEFAULT NULL COMMENT '關閉者',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`log_id`),
  KEY `FK_a_chengshiu_alert_log_machine_id` (`machine_id`),
  KEY `FK_a_chengshiu_alert_log_type_id` (`type_id`),
  KEY `FK_a_chengshiu_alert_log_alarm_id` (`alarm_id`),
  KEY `FK_a_chengshiu_alert_log_agv_id` (`agv_id`),
  KEY `FK_a_chengshiu_alert_log_rfid_id` (`rfid_id`),
  KEY `FK_a_chengshiu_alert_log_item_id` (`item_id`),
  KEY `FK_a_chengshiu_alert_log_sensor_id` (`sensor_id`),
  KEY `FK_a_chengshiu_alert_log_customer_id` (`customer_id`),
  KEY `FK_a_chengshiu_alert_log_product_id` (`product_id`),
  KEY `FK_a_chengshiu_alert_log_rule_id` (`rule_id`),
  CONSTRAINT `FK_a_chengshiu_alert_log_rule_id` FOREIGN KEY (`rule_id`) REFERENCES `a_chengshiu_ma_setting` (`rule_id`),
  CONSTRAINT `FK_a_chengshiu_alert_log_agv_id` FOREIGN KEY (`agv_id`) REFERENCES `a_chengshiu_agv` (`agv_id`),
  CONSTRAINT `FK_a_chengshiu_alert_log_alarm_id` FOREIGN KEY (`alarm_id`) REFERENCES `a_chengshiu_alarm` (`alarm_id`),
  CONSTRAINT `FK_a_chengshiu_alert_log_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `a_chengshiu_customer` (`customer_id`),
  CONSTRAINT `FK_a_chengshiu_alert_log_item_id` FOREIGN KEY (`item_id`) REFERENCES `a_chengshiu_material_item` (`item_id`),
  CONSTRAINT `FK_a_chengshiu_alert_log_machine_id` FOREIGN KEY (`machine_id`) REFERENCES `a_chengshiu_machine` (`machine_id`),
  CONSTRAINT `FK_a_chengshiu_alert_log_product_id` FOREIGN KEY (`product_id`) REFERENCES `a_chengshiu_product` (`product_id`),
  CONSTRAINT `FK_a_chengshiu_alert_log_rfid_id` FOREIGN KEY (`rfid_id`) REFERENCES `a_chengshiu_agv_rfid` (`rfid_id`),
  CONSTRAINT `FK_a_chengshiu_alert_log_sensor_id` FOREIGN KEY (`sensor_id`) REFERENCES `a_chengshiu_sensor` (`sensor_id`),
  CONSTRAINT `FK_a_chengshiu_alert_log_type_id` FOREIGN KEY (`type_id`) REFERENCES `a_chengshiu_alert_type` (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='提醒通知紀錄';

--
-- Dumping data for table `a_chengshiu_alert_log`
--

/*!40000 ALTER TABLE `a_chengshiu_alert_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_alert_log` ENABLE KEYS */;


--
-- Definition of table `a_chengshiu_alert_type`
--

DROP TABLE IF EXISTS `a_chengshiu_alert_type`;
CREATE TABLE `a_chengshiu_alert_type` (
  `type_id` varchar(1) BINARY NOT NULL DEFAULT '0' COMMENT '通知代碼',
  `type_name` varchar(50) NOT NULL DEFAULT '' COMMENT '提醒類別',
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='提醒類型';

--
-- Dumping data for table `a_chengshiu_alert_type`
--

/*!40000 ALTER TABLE `a_chengshiu_alert_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_alert_type` ENABLE KEYS */;


--
-- Definition of table `a_chengshiu_conversion_factor`
--

DROP TABLE IF EXISTS `a_chengshiu_conversion_factor`;
CREATE TABLE `a_chengshiu_conversion_factor` (
  `conv_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '轉換代碼',
  `conv_name` varchar(50) NOT NULL DEFAULT '' COMMENT '轉換名稱',
  `conv_factor` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '轉換係數',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`conv_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='轉換係數';


--
-- Definition of table `a_chengshiu_customer`
--

DROP TABLE IF EXISTS `a_chengshiu_customer`;
CREATE TABLE `a_chengshiu_customer` (
  `customer_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '客戶代號',
  `customer_name` varchar(50) NOT NULL DEFAULT '' COMMENT '客戶名稱',
  `telephone` varchar(20) NOT NULL DEFAULT '' COMMENT '聯絡電話',
  `address` varchar(100) NOT NULL DEFAULT '' COMMENT '收貨地址',
  `is_open` varchar(1) NOT NULL DEFAULT '' COMMENT '是否啟用',
  `group_id` varchar(45) BINARY NOT NULL DEFAULT '' COMMENT '群組',
  `create_by` varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`customer_id`),
  KEY `IDX_CUSTOMER_IS_OPEN` (`is_open`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='客戶資料';


--
-- Definition of table `a_chengshiu_demand2_order`
--

DROP TABLE IF EXISTS `a_chengshiu_demand2_order`;
CREATE TABLE `a_chengshiu_demand2_order` (
  `demand_id` varchar(10) BINARY NOT NULL DEFAULT '' COMMENT '需求單代碼',
  `reason_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '原因代碼',
  PRIMARY KEY (`demand_id`,`reason_id`),
  KEY `FK_DEMAND_REASON_reason_id` (`reason_id`),
  CONSTRAINT `FK_DEMAND_ORDER_reason_id` FOREIGN KEY (`demand_id`) REFERENCES `a_chengshiu_demand_order` (`demand_id`),
  CONSTRAINT `FK_DEMAND_REASON_demand_id` FOREIGN KEY (`reason_id`) REFERENCES `a_chengshiu_demand_reason` (`reason_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='需求單原因';

--
-- Dumping data for table `a_chengshiu_demand2_order`
--

/*!40000 ALTER TABLE `a_chengshiu_demand2_order` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_demand2_order` ENABLE KEYS */;


--
-- Definition of table `a_chengshiu_demand_order`
--

DROP TABLE IF EXISTS `a_chengshiu_demand_order`;
CREATE TABLE `a_chengshiu_demand_order` (
  `demand_id` varchar(10) BINARY NOT NULL DEFAULT '' COMMENT '需求單代碼',
  `product_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '產品代碼',
  `demand_quantity` int(11) NOT NULL DEFAULT '0' COMMENT '需求箱數',
  `not_done` int(11) NOT NULL DEFAULT '0' COMMENT '待生產箱數',
  `est_complete_date` date NOT NULL DEFAULT '0000-00-00' COMMENT '預計完工日',
  `act_complete_time` datetime DEFAULT NULL COMMENT '預計完工時間',
  `status_id` varchar(1) BINARY NOT NULL DEFAULT '0' COMMENT '需求單狀態(0=未轉工單 1=已轉工單、待生產 2=生產中 3=結案 9=取消)',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`demand_id`),
  KEY `FK_PRODUCT_product_id2` (`product_id`),
  KEY `IDX_DEMAND_ORDER_PRODUCT_ID` (`product_id`),
  KEY `IDX_DEMAND_ORDER_STATUS_ID` (`status_id`),
  CONSTRAINT `FK_demand_order_product_id` FOREIGN KEY (`product_id`) REFERENCES `a_chengshiu_product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='需求單';

--
-- Dumping data for table `a_chengshiu_demand_order`
--

/*!40000 ALTER TABLE `a_chengshiu_demand_order` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_demand_order` ENABLE KEYS */;


--
-- Definition of table `a_chengshiu_demand_reason`
--

DROP TABLE IF EXISTS `a_chengshiu_demand_reason`;
CREATE TABLE `a_chengshiu_demand_reason` (
  `reason_id` varchar(10) BINARY NOT NULL DEFAULT '' COMMENT '原因代碼',
  `reason_name` varchar(50) NOT NULL COMMENT '原因名稱',
  `is_open` varchar(1) NOT NULL DEFAULT '' COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`reason_id`),
  KEY `IDX_DEMAND_REASON_IS_OPEN` (`is_open`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='需求單開立原因';

--
-- Definition of table `a_chengshiu_line`
--

DROP TABLE IF EXISTS `a_chengshiu_line`;
CREATE TABLE `a_chengshiu_line` (
  `line_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '產線代碼',
  `line_name` varchar(50) NOT NULL DEFAULT '' COMMENT '產線名稱',
  `work_id` varchar(20) BINARY DEFAULT NULL COMMENT '當前進站工單',
  `is_open` varchar(1) NOT NULL DEFAULT '' COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`line_id`),
  KEY `IDX_LINE_WORK_ID` (`work_id`),
  KEY `IDX_LINE_IS_OPEN` (`is_open`),
  CONSTRAINT `FK_WORK_ORDER_work_id2` FOREIGN KEY (`work_id`) REFERENCES `a_chengshiu_work_order` (`work_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='產線';

--
-- Definition of table `a_chengshiu_ma_setting`
--

DROP TABLE IF EXISTS `a_chengshiu_ma_setting`;
CREATE TABLE `a_chengshiu_ma_setting` (
  `rule_id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '流水號',
  `rule_name` varchar(10) DEFAULT NULL COMMENT '保養規則名稱',
  `type` varchar(3) NOT NULL DEFAULT '' COMMENT '類型',
  `cycle` DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00 COMMENT '保養週期',
  `next_ma` int(10) DEFAULT NULL COMMENT '下次保養次數',
  `content` text NOT NULL COMMENT '保養內容',
  `is_open` varchar(1) NOT NULL DEFAULT '' COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`rule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='保養週期設定';

--
-- Dumping data for table `a_chengshiu_ma_setting`
--

/*!40000 ALTER TABLE `a_chengshiu_ma_setting` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_ma_setting` ENABLE KEYS */;

DROP TABLE IF EXISTS `a_chengshiu_ma_setting_agv`;
CREATE TABLE `a_chengshiu_ma_setting_agv` (
  `rule_id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '流水號',
  `machine_id` varchar(20) DEFAULT NULL COMMENT '設備代碼',
  `next_ma` int(10) DEFAULT NULL COMMENT '下次保養次數',
  `is_open` varchar(1) NOT NULL DEFAULT '' COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`rule_id`, `machine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='AGV保養週期設定';

--
-- Definition of table `a_chengshiu_machine`
--

DROP TABLE IF EXISTS `a_chengshiu_machine`;
CREATE TABLE `a_chengshiu_machine` (
  `machine_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '設備代碼',
  `machine_name` varchar(50) NOT NULL DEFAULT '' COMMENT '設備名稱',
  `line_id` varchar(20) BINARY DEFAULT NULL COMMENT '產線代碼',
  `type` varchar(3) NOT NULL DEFAULT '' COMMENT '類型',
  `is_open` varchar(1) NOT NULL DEFAULT '' COMMENT '是否啟用',
  `trace_id` varchar(20) BINARY DEFAULT NULL COMMENT '成品箱號',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`machine_id`),
  KEY `IDX_MACHINE_LINE_ID` (`line_id`),
  KEY `IDX_MACHINE_IS_OPEN` (`is_open`),
  CONSTRAINT `FK_LINE_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_chengshiu_line` (`line_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='設備';

--
-- Definition of table `a_chengshiu_machine_material`
--

DROP TABLE IF EXISTS `a_chengshiu_machine_material`;
CREATE TABLE `a_chengshiu_machine_material` (
  `machine_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '設備代碼',
  `material_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '原料代碼',
  `alert_refueling` int(10) unsigned NOT NULL DEFAULT 0 COMMENT '換料提醒(片)',
  `concur_usable` int(10) unsigned NOT NULL DEFAULT 1 COMMENT '設備同時可裝數量',
  `is_open` varchar(20) NOT NULL DEFAULT '' COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`machine_id`,`material_id`),
  KEY `FK_MATERIAL_material_id2` (`material_id`),
  KEY `IDX_MACHINE_MATERIAL_IS_OPEN` (`is_open`),
  CONSTRAINT `FK_MACHINE_machine_id2` FOREIGN KEY (`machine_id`) REFERENCES `a_chengshiu_machine` (`machine_id`),
  CONSTRAINT `FK_MATERIAL_material_id2` FOREIGN KEY (`material_id`) REFERENCES `a_chengshiu_material` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Definition of table `a_chengshiu_material`
--
DROP TABLE IF EXISTS `a_chengshiu_material`;
CREATE TABLE `a_chengshiu_material` (
  `material_id` varchar(10) BINARY NOT NULL DEFAULT '' COMMENT '原料代碼',
  `material_name` varchar(20) NOT NULL DEFAULT '' COMMENT '原料名稱',
  `material_spec` varchar(50) DEFAULT NULL COMMENT '原料規格',
  `default_pcs` int(10) NOT NULL DEFAULT '0' COMMENT '可使用片數',
  `alert_pcs` int(10) NOT NULL DEFAULT '0'COMMENT '提醒通知片數',
  `is_open` varchar(1) NOT NULL DEFAULT '0' COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`material_id`),
  KEY `IDX_MATERIAL_IS_OPEN` (`is_open`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='原料料號';

--
-- Definition of table `a_chengshiu_material_item`
--

DROP TABLE IF EXISTS `a_chengshiu_material_item`;
CREATE TABLE `a_chengshiu_material_item` (
  `item_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '原料單件號',
  `material_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '原料代碼',
  `machine_id` varchar(20) BINARY DEFAULT NULL COMMENT '設備代號',
  `mark_pcs` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '設備上料時累計數量',
  `usable_pcs` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '原料剩餘可用片數',
  `status_id` int(10)  NOT NULL DEFAULT '0' COMMENT '原料狀態(0=庫存 1=出庫未收料 2=設備旁待用 3=設備上 7=準備重新入庫 8=用罄 9=報廢)',
  `pstoring_id` varchar(20) BINARY DEFAULT NULL COMMENT '儲位代碼',
  `purchase_time` datetime DEFAULT NULL COMMENT '進貨日期',
  `exp_date` date DEFAULT NULL COMMENT '有效日期',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`item_id`),
  KEY `IDX_MATERIAL_ITEM_PURCHASE_TIME` (`purchase_time`),
  KEY `FK_MATERIAL_material_id` (`material_id`),
  KEY `FK_MACHINE_machine_id` (`machine_id`),
  CONSTRAINT `FK_MACHINE_machine_id` FOREIGN KEY (`machine_id`) REFERENCES `a_chengshiu_machine` (`machine_id`),
  CONSTRAINT `FK_MATERIAL_material_id` FOREIGN KEY (`material_id`) REFERENCES `a_chengshiu_material` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='原料單件';
--
-- Definition of table `a_chengshiu_order_shipping`
--

DROP TABLE IF EXISTS `a_chengshiu_order_shipping`;
CREATE TABLE `a_chengshiu_order_shipping` (
  `shipping_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '出貨代碼',
  `order_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '訂單代碼',
  `trace_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '成品箱號',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`shipping_id`,`trace_id`),
  KEY `IDX_ORDER_SHIPPING_TRACE_ID` (`trace_id`),
  KEY `FK_SALES_ORDER_order_id2` (`order_id`),
  CONSTRAINT `FK_a_chengshiu_order_shipping_order_id` FOREIGN KEY (`order_id`) REFERENCES `a_chengshiu_sales_order` (`order_id`),
  CONSTRAINT `FK_a_chengshiu_order_shipping_trace_id` FOREIGN KEY (`trace_id`) REFERENCES `a_chengshiu_trace` (`trace_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='訂單出貨紀錄';

--
-- Dumping data for table `a_chengshiu_order_shipping`
--

/*!40000 ALTER TABLE `a_chengshiu_order_shipping` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_order_shipping` ENABLE KEYS */;


--
-- Definition of table `a_chengshiu_product`
--

DROP TABLE IF EXISTS `a_chengshiu_product`;
CREATE TABLE `a_chengshiu_product` (
  `product_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '產品代碼',
  `product_name` varchar(20) NOT NULL DEFAULT '' COMMENT '產品名稱',
  `product_quality_sp` DECIMAL(5,2) NOT NULL DEFAULT '0' COMMENT '產品良率目標值',
  `buffer_stock` int(10) NOT NULL DEFAULT '0' COMMENT '安全存量(箱)',
  `booking_stock` int(10) NOT NULL DEFAULT '0' COMMENT '應出貨總數',
  `total_remander` int(10) NOT NULL DEFAULT '0' COMMENT '剩餘總數',
  `inventory` int(10) NOT NULL DEFAULT '0' COMMENT '庫存總數',
  `not_instorage` int(10) NOT NULL DEFAULT '0' COMMENT '未入庫總數',
  `usable_stock` int(10) NOT NULL DEFAULT '0' COMMENT '可用餘貨量',
  `is_open` varchar(1) NOT NULL DEFAULT '0' COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`product_id`),
  KEY `IDX_PRODUCT_IS_OPEN` (`is_open`),
  KEY `IDX_PRODUCT_BOOKING_STOCK` (`booking_stock`) USING BTREE,
  KEY `IDX_PRODUCT_TOTAL_REMANDER` (`total_remander`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='產品';

--
-- Definition of table `a_chengshiu_sales_order`
--

DROP TABLE IF EXISTS `a_chengshiu_sales_order`;
CREATE TABLE `a_chengshiu_sales_order` (
  `order_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '訂單代碼',
  `customer_id` varchar(20) BINARY DEFAULT NULL COMMENT '客戶(商店)',
  `total_quantity` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '訂單總箱數',
  `shipping_quantity` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '已出貨箱數',
  `not_done` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '未出貨箱數',
  `arrival_date` datetime NOT NULL COMMENT '預定到貨日',
  `shipping_date` datetime NOT NULL COMMENT '預定出貨日',
  `status_id` varchar(1) BINARY NOT NULL DEFAULT '0' COMMENT '訂單狀態(0=開立 2=結案 9=取消)',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`order_id`),
  KEY `FK_SALES_ORDER_customer_id` (`customer_id`),
  KEY `IDX_SALES_ORDER_ARRIVAL_DATE` (`arrival_date`),
  KEY `IDX_SALES_ORDER_SHIPPING_DATE` (`shipping_date`),
  KEY `IDX_SALES_ORDER_STATUS_ID` (`status_id`),
  CONSTRAINT `FK_CUSTOMER_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `a_chengshiu_customer` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='訂單';

--
-- Dumping data for table `a_chengshiu_sales_order`
--

/*!40000 ALTER TABLE `a_chengshiu_sales_order` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_sales_order` ENABLE KEYS */;


--
-- Definition of table `a_chengshiu_sales_order_details`
--

DROP TABLE IF EXISTS `a_chengshiu_sales_order_details`;
CREATE TABLE `a_chengshiu_sales_order_details` (
  `order_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '訂單代碼',
  `product_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '產品代碼',
  `order_quantity` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '訂購箱數',
  `shipping_quantity` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '已出貨箱數',
  `not_done` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '未出貨箱數',
  `status_id` varchar(1)  BINARY NOT NULL DEFAULT '0' COMMENT '細項狀態(0=開立 2=結案 9=取消)',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`order_id`,`product_id`),
  KEY `IDX_SALES_ORDER_ORDER_DETAILS_PRODUCT_ID` (`product_id`),
  KEY `IDX_SALES_ORDER_DETAILS_STATUS_ID` (`status_id`),
  CONSTRAINT `FK_PRODUCT_product_id` FOREIGN KEY (`product_id`) REFERENCES `a_chengshiu_product` (`product_id`),
  CONSTRAINT `FK_SALES_ORDER_order_id` FOREIGN KEY (`order_id`) REFERENCES `a_chengshiu_sales_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='訂單明細';

--
-- Dumping data for table `a_chengshiu_sales_order_details`
--

/*!40000 ALTER TABLE `a_chengshiu_sales_order_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_sales_order_details` ENABLE KEYS */;


--
-- Definition of table `a_chengshiu_sensor`
--

DROP TABLE IF EXISTS `a_chengshiu_sensor`;
CREATE TABLE `a_chengshiu_sensor` (
  `sensor_id` varchar(10) BINARY NOT NULL DEFAULT '' COMMENT '感測器編號',
  `sensor_name` varchar(20) NOT NULL DEFAULT '' COMMENT '感測器名稱',
  `local_id` varchar(1) BINARY NOT NULL DEFAULT '' COMMENT '位置',
  `agv_id` varchar(10) BINARY DEFAULT NULL COMMENT '巡邏車代碼',
  `type_id` varchar(10) BINARY NOT NULL DEFAULT '' COMMENT '類型',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`sensor_id`),
  KEY `FK_AGV_agv_id` (`agv_id`),
  KEY `FK_SENSOR_TYPE_type_id` (`type_id`),
  CONSTRAINT `FK_AGV_agv_id` FOREIGN KEY (`agv_id`) REFERENCES `a_chengshiu_agv` (`agv_id`),
  CONSTRAINT `FK_SENSOR_TYPE_type_id` FOREIGN KEY (`type_id`) REFERENCES `a_chengshiu_sensor_type` (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='感測器';

--
-- Dumping data for table `a_chengshiu_sensor`
--

/*!40000 ALTER TABLE `a_chengshiu_sensor` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_sensor` ENABLE KEYS */;

--
-- Definition of table `a_chengshiu_sensor_alarm`
--
DROP TABLE IF EXISTS `a_chengshiu_sensor_alarm`;
CREATE TABLE `a_chengshiu_sensor_alarm` (
  `alarm_id` varchar(10) BINARY NOT NULL COMMENT '警報代碼',
  `alarm_name` varchar(45) COMMENT '警報名稱',
  `type_id` varchar(20) BINARY NOT NULL COMMENT '感測器類型',
  `rule` varchar(100) NOT NULL COMMENT '規則',
  `create_by` varchar(50) NOT NULL COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`alarm_id`),
  CONSTRAINT `FK_a_chengshiu_sensor_alarm_1` FOREIGN KEY `FK_a_chengshiu_sensor_alarm_1` (`type_id`)
    REFERENCES `a_chengshiu_sensor_type` (`type_id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
)
ENGINE = InnoDB
COMMENT = '感測器警報';

--
-- Dumping data for table `a_chengshiu_sensor_alarm`
--

/*!40000 ALTER TABLE `a_chengshiu_sensor_alarm` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_sensor_alarm` ENABLE KEYS */;


DROP TABLE IF EXISTS `a_chengshiu_sensor_type`;
CREATE TABLE `a_chengshiu_sensor_type` (
  `type_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '感測器類型',
  `type_name` varchar(50) NOT NULL DEFAULT '' COMMENT '感測器類型名稱',
  `max_out` float DEFAULT NULL COMMENT '室外上限',
  `max_in` float DEFAULT NULL COMMENT '室內上限',
  `min_out` float DEFAULT NULL COMMENT '室外下限',
  `min_in` float DEFAULT NULL COMMENT '室內下限',
  `is_open` varchar(1) NOT NULL DEFAULT 'Y' COMMENT '是否啟用',  
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='感測器類型及警示值';

--
-- Dumping data for table `a_chengshiu_sensor_type`
--

/*!40000 ALTER TABLE `a_chengshiu_sensor_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_sensor_type` ENABLE KEYS */;

--
-- Definition of table `a_chengshiu_store_product`
--

DROP TABLE IF EXISTS `a_chengshiu_store_product`;
CREATE TABLE `a_chengshiu_store_product` (
  `customer_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '商店代碼',
  `product_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '產品代碼',
  `spot_pcs` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '現貨剩餘片數',
  `not_receive` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '未收貨片數',
  `sale_price` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '售出價格',
  `buffer_stock` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '安全存量(片)',
  `is_open` varchar(1) NOT NULL DEFAULT '' COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`customer_id`,`product_id`),
  KEY `IDX_STORE_PRODUCT_IS_OPEN` (`is_open`),
  CONSTRAINT `FK_CUSTOMER_customer_id2` FOREIGN KEY (`customer_id`) REFERENCES `a_chengshiu_customer` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='商店產品';

--
-- Dumping data for table `a_chengshiu_store_product`
--

/*!40000 ALTER TABLE `a_chengshiu_store_product` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_store_product` ENABLE KEYS */;


--
-- Definition of table `a_chengshiu_store_sales_record`
--

DROP TABLE IF EXISTS `a_chengshiu_store_sales_record`;
CREATE TABLE `a_chengshiu_store_sales_record` (
  `customer_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '商店代碼',
  `sale_time` datetime NOT NULL COMMENT '售出時間',
  `product_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '產品代碼',
  `quantity` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '銷售數量',
  `total` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '總價',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`customer_id`,`sale_time`,`product_id`),
  KEY `FK_STORE_PRODUCT_product_id` (`customer_id`,`product_id`),
  CONSTRAINT `FK_STORE_PRODUCT_product_id` FOREIGN KEY (`customer_id`, `product_id`) REFERENCES `a_chengshiu_store_product` (`customer_id`, `product_id`),
  CONSTRAINT `FK_STORE_customer_id3` FOREIGN KEY (`customer_id`) REFERENCES `a_chengshiu_customer` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='商店銷售紀錄';

--
-- Dumping data for table `a_chengshiu_store_sales_record`
--

/*!40000 ALTER TABLE `a_chengshiu_store_sales_record` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_store_sales_record` ENABLE KEYS */;


--
-- Definition of table `a_chengshiu_storing_area`
--

DROP TABLE IF EXISTS `a_chengshiu_storing_area`;
CREATE TABLE `a_chengshiu_storing_area` (
  `area_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '儲區代碼',
  `area_name` varchar(50) NOT NULL DEFAULT '' COMMENT '儲區名稱',
  `remark` varchar(50) DEFAULT NULL COMMENT '說明',
  `type` varchar(1) NOT NULL DEFAULT '' COMMENT '類型(P=product成品倉 M=material原料倉)',
  `in_out_type` varchar(1) NOT NULL DEFAULT '' COMMENT '出入庫類型(0=一般倉庫 1=流動式[一進一出])',
  `is_open` varchar(1) NOT NULL DEFAULT '' COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`area_id`),
  KEY `IDX_STORING_AREA_IS_OPEN` (`is_open`),
  KEY `IDX_STORING_AREA_IN_OUT_TYPE` (`in_out_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='儲區';

--
-- Definition of table `a_chengshiu_storing_shelf`
--

DROP TABLE IF EXISTS `a_chengshiu_storing_shelf`;
CREATE TABLE `a_chengshiu_storing_shelf` (
  `shelf_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '儲區代碼',
  `shelf_name` varchar(50) NOT NULL DEFAULT '' COMMENT '儲區名稱',
  `area_id` varchar(20) BINARY DEFAULT NULL COMMENT '儲區代碼',
  `remark` varchar(50) DEFAULT NULL COMMENT '說明',
  `is_open` varchar(1) NOT NULL DEFAULT '' COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`shelf_id`),
  KEY `IDX_STORING_SHELF_IS_OPEN` (`is_open`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='成品儲架';

--
-- Definition of table `a_chengshiu_storing`
--

DROP TABLE IF EXISTS `a_chengshiu_storing`;
CREATE TABLE `a_chengshiu_storing` (
  `pstoring_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '成品儲位代碼',
  `pstoring_name` varchar(20) NOT NULL DEFAULT '' COMMENT '成品儲位名稱',
  `status_id` varchar(1) BINARY NOT NULL DEFAULT '0' COMMENT '狀態，0=空 1=有存放物品 3=狀態為指定入庫、未入庫',
  `shelf_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '儲架代碼',
  `area_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '儲區代碼',
  `type_id` varchar(1) BINARY DEFAULT '' COMMENT '類型',
  `is_open` varchar(1) NOT NULL DEFAULT 'Y' COMMENT '是否啟用',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`pstoring_id`),
  KEY `IDX_STORING_IS_OPEN` (`is_open`)
  -- CONSTRAINT `FK_STORING_shelf_id` FOREIGN KEY (`shelf_id`) REFERENCES `a_chengshiu_storing_shelf` (`shelf_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='儲位';

--
-- Definition of table `a_chengshiu_trace`
--

DROP TABLE IF EXISTS `a_chengshiu_trace`;
CREATE TABLE `a_chengshiu_trace` (
  `trace_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '成品箱號',
  `product_id` varchar(20) BINARY DEFAULT NULL COMMENT '產品代碼',
  `status_id` varchar(1) BINARY NOT NULL DEFAULT '0' COMMENT '狀態(0=未完成 1=已完成、未入庫 2=已入庫 3=指定入庫、未入庫 4=出庫)',
  `inbox_pcs` int(10) unsigned DEFAULT NULL COMMENT '已裝籃片數',
  `boxing_time` datetime DEFAULT NULL COMMENT '裝箱完成時間',
  `pstoring_id` varchar(20) BINARY DEFAULT NULL COMMENT '儲位代碼',
  `customer_id` varchar(20) BINARY DEFAULT NULL COMMENT '商店代碼',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`trace_id`),
  KEY `IDX_TRACE_STATUS_ID` (`status_id`),
  KEY `FK_PRODUCT_product_id2` (`product_id`),
  CONSTRAINT `FK_PRODUCT_product_id2` FOREIGN KEY (`product_id`) REFERENCES `a_chengshiu_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='成品箱';

--
-- Dumping data for table `a_chengshiu_trace`
--

/*!40000 ALTER TABLE `a_chengshiu_trace` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_trace` ENABLE KEYS */;


--
-- Definition of table `a_chengshiu_trace_machine`
--

DROP TABLE IF EXISTS `a_chengshiu_trace_machine`;
CREATE TABLE `a_chengshiu_trace_machine` (
  `trace_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '成品箱號',
  `machine_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '設備代碼',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`trace_id`),
  KEY `FK_MARCHINE_machine_id` (`machine_id`),
  CONSTRAINT `FK_MARCHINE_machine_id` FOREIGN KEY (`machine_id`) REFERENCES `a_chengshiu_machine` (`machine_id`),
  CONSTRAINT `FK_TRACE_trace_id` FOREIGN KEY (`trace_id`) REFERENCES `a_chengshiu_trace` (`trace_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='成品設備追蹤';

--
-- Dumping data for table `a_chengshiu_trace_machine`
--

/*!40000 ALTER TABLE `a_chengshiu_trace_machine` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_trace_machine` ENABLE KEYS */;


--
-- Definition of table `a_chengshiu_trace_material`
--

DROP TABLE IF EXISTS `a_chengshiu_trace_material`;
CREATE TABLE `a_chengshiu_trace_material` (
  `trace_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '成品箱號',
  `item_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '原料單件號',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`trace_id`,`item_id`),
  KEY `IDX_TRACE_MATERIAL_ITEM_ID` (`item_id`),
  CONSTRAINT `FK_TRACE_trace_id2` FOREIGN KEY (`trace_id`) REFERENCES `a_chengshiu_trace` (`trace_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='成品原料追蹤';

--
-- Dumping data for table `a_chengshiu_trace_material`
--

/*!40000 ALTER TABLE `a_chengshiu_trace_material` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_trace_material` ENABLE KEYS */;


--
-- Definition of table `a_chengshiu_work_order`
--

DROP TABLE IF EXISTS `a_chengshiu_work_order`;
CREATE TABLE `a_chengshiu_work_order` (
  `work_id` varchar(20) BINARY NOT NULL COMMENT '工單代碼(W+YY+MM+流水號3碼)',
  `demand_id` varchar(20) BINARY NOT NULL COMMENT '需求單代碼',
  `est_quantity` int(11) NOT NULL COMMENT '預計完成箱數',
  `not_done_quantity` int(11) NOT NULL COMMENT '待生產箱數',
  `conv_factor` int(11) NOT NULL COMMENT '箱_片轉換係數',
  `est_pcs` int(11) NOT NULL COMMENT '預計完成片數',
  `input_pcs` int(11) NOT NULL COMMENT '累計實際投入',
  `output_pcs` int(11) NOT NULL COMMENT '累計實際產出',
  `ng_pcs` int(11) NOT NULL COMMENT '累計不良數',
  `ctn_pcs` int(11) NOT NULL COMMENT  '接續箱號暫存片數',
  `cmplt_pcs` int(11) NOT NULL COMMENT  '成品箱於本工單完成時累計加入',
  `est_date` date NOT NULL COMMENT '預計完工日',
  `status_id` varchar(1) BINARY NOT NULL DEFAULT '0' COMMENT '狀態(0=待生產 1=生產中 2=結案 9=取消)',
  `create_by` varchar(50) NOT NULL COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`work_id`),
  KEY `FK_work_order_demand_id` (`demand_id`),
  CONSTRAINT `FK_work_order_demand_id` FOREIGN KEY (`demand_id`) REFERENCES `a_chengshiu_demand_order` (`demand_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='工單';

--
-- Dumping data for table `a_chengshiu_work_order`
--

/*!40000 ALTER TABLE `a_chengshiu_work_order` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_chengshiu_work_order` ENABLE KEYS */;




/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;


DROP TABLE IF EXISTS `a_chengshiu_trace_work`;
CREATE TABLE  `a_chengshiu_trace_work` (
  `trace_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '成品箱號',
  `work_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '工單代碼',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL COMMENT '最後修改時間',
  PRIMARY KEY (`trace_id`,`work_id`),
  KEY `FK_a_chengshiu_trace_work_work_id` (`work_id`),
  CONSTRAINT `FK_a_chengshiu_trace_work_trace_id` FOREIGN KEY (`trace_id`) REFERENCES `a_chengshiu_trace` (`trace_id`),
  CONSTRAINT `FK_a_chengshiu_trace_work_work_id` FOREIGN KEY (`work_id`) REFERENCES `a_chengshiu_work_order` (`work_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT '成品工單追蹤';

DROP TABLE IF EXISTS `a_chengshiu_work_order_duration`;
CREATE TABLE `a_chengshiu_work_order_duration` (
  `work_id` varchar(20) BINARY NOT NULL DEFAULT '' COMMENT '工單代碼',
  `input_pcs` int(11) DEFAULT NULL COMMENT '實際投入',
  `output_pcs` int(11) DEFAULT NULL COMMENT '實際產出',
  `ng_pcs` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '不良數',
  `act_start_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '實際開始時間',
  `act_cple_time` datetime DEFAULT NULL COMMENT '實際完工時間',
  `status_id` varchar(1) BINARY NOT NULL DEFAULT '0' COMMENT '狀態(0=待生產 1=生產中 2=結案 9=取消)',
  `operator` varchar(50) DEFAULT NULL COMMENT '生產者',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '最後修改時間',
  PRIMARY KEY (`work_id`,`act_start_time`),
  CONSTRAINT `a_chengshiu_work_order_duration_work_id` FOREIGN KEY (`work_id`) REFERENCES `a_chengshiu_work_order` (`work_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='工單生產起訖時間';

DROP VIEW IF EXISTS `a_chengshiu_view_storing`;
CREATE VIEW a_chengshiu_view_storing AS
Select storing.*, area.type, area.in_out_type FROM
a_chengshiu_storing as storing
INNER JOIN
a_chengshiu_storing_shelf as shelf
on 
(
storing.is_open = shelf.is_open
AND 
storing.shelf_id = shelf.shelf_id
)
INNER JOIN
a_chengshiu_storing_area as area
on 
(
storing.shelf_id = shelf.shelf_id
AND
shelf.area_id = area.area_id
)
WHERE
storing.is_open='Y' AND shelf.is_open='Y' AND area.is_open='Y'