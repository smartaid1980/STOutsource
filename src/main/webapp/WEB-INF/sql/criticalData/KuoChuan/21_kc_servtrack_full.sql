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
-- Definition of table `a_kuochuan_servtrack_line`
--

DROP TABLE IF EXISTS `a_kuochuan_servtrack_line`;
CREATE TABLE `a_kuochuan_servtrack_line` (
  `line_id` varchar(10) NOT NULL,
  `is_valid` varchar(1) NOT NULL,
  PRIMARY KEY (`line_id`),
  KEY `FK_a_kuochuan_servtrack_line_line_id` (`line_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_line_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_kuochuan_servtrack_line`
--

/*!40000 ALTER TABLE `a_kuochuan_servtrack_line` DISABLE KEYS */;
INSERT INTO `a_kuochuan_servtrack_line` (`line_id`,`is_valid`) VALUES 
 ('01','N'),
 ('line01','Y'),
 ('line02','Y');
/*!40000 ALTER TABLE `a_kuochuan_servtrack_line` ENABLE KEYS */;


--
-- Definition of table `a_kuochuan_servtrack_performance`
--

DROP TABLE IF EXISTS `a_kuochuan_servtrack_performance`;
CREATE TABLE `a_kuochuan_servtrack_performance` (
  `staff_id` varchar(10) NOT NULL,
  `shift_day` date NOT NULL,
  `move_in` datetime NOT NULL,
  `work_id` varchar(20) NOT NULL,
  `product_id` varchar(20) NOT NULL,
  `product_type_id` varchar(20) NOT NULL,
  `op` varchar(10) NOT NULL,
  `process_code` varchar(10) NOT NULL,
  `line_id` varchar(10) NOT NULL,
  `cost_move_in` datetime NOT NULL,
  `cost_move_out` datetime NOT NULL,
  `cost_duration` decimal(10,2) NOT NULL,
  `cost_real` decimal(10,2) NOT NULL,
  `cost_sp` decimal(10,2) NOT NULL,
  `cost_difference` decimal(10,2) NOT NULL,
  `go_quantity` int(10) NOT NULL,
  `quantity_sp` int(10) NOT NULL,
  `qua_difference` int(10) NOT NULL,
  `hour_difference` decimal(10,2) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`staff_id`,`move_in`,`work_id`,`line_id`),
  KEY `FK_a_kuochuan_servtrack_performance_staff_id` (`staff_id`),
  KEY `FK_a_kuochuan_servtrack_performance_product_id` (`product_id`),
  KEY `Index_a_kuochuan_servtrack_performance_shift_day` (`shift_day`),
  KEY `FK_a_kuochuan_servtrack_performance_work_id_op` (`work_id`,`op`),
  KEY `FK_a_kuochuan_servtrack_performance_product_type_id` (`product_type_id`),
  KEY `FK_a_kuochuan_servtrack_performance_process_code` (`process_code`),
  KEY `FK_a_kuochuan_servtrack_performance_line_id` (`line_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_performance_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_performance_process_code` FOREIGN KEY (`process_code`) REFERENCES `a_servtrack_process` (`process_code`),
  CONSTRAINT `FK_a_kuochuan_servtrack_performance_product_id` FOREIGN KEY (`product_id`) REFERENCES `a_servtrack_product` (`product_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_performance_product_type_id` FOREIGN KEY (`product_type_id`) REFERENCES `a_kuochuan_servtrack_product_type` (`product_type_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_performance_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `a_kuochuan_servtrack_staff` (`staff_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_performance_work_id_op` FOREIGN KEY (`work_id`, `op`) REFERENCES `a_servtrack_work_op` (`work_id`, `op`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_kuochuan_servtrack_performance`
--

/*!40000 ALTER TABLE `a_kuochuan_servtrack_performance` DISABLE KEYS */;
INSERT INTO `a_kuochuan_servtrack_performance` (`staff_id`,`shift_day`,`move_in`,`work_id`,`product_id`,`product_type_id`,`op`,`process_code`,`line_id`,`cost_move_in`,`cost_move_out`,`cost_duration`,`cost_real`,`cost_sp`,`cost_difference`,`go_quantity`,`quantity_sp`,`qua_difference`,`hour_difference`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('PTest01','2017-08-01','2017-08-01 08:04:00','KC170801','KC_DH9003','KC','11','TESTStampi','line01','2017-08-01 08:00:00','2017-08-01 09:02:30','1.04','0.65','0.56','-0.10',319,374,-55,'-0.16','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest01','2017-08-01','2017-08-01 09:08:00','KC170801','KC_DH9003','KC','11','TESTStampi','line01','2017-08-01 09:02:30','2017-08-01 10:00:00','0.96','0.69','0.56','-0.13',279,344,-65,'-0.18','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest01','2017-08-01','2017-08-01 10:08:00','KC170801','KC_DH9003','KC','11','TESTStampi','line01','2017-08-01 10:10:00','2017-08-01 12:00:00','1.83','0.61','0.56','-0.05',603,659,-56,'-0.16','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest01','2017-08-01','2017-08-01 13:04:00','KC170801','KC_DH9003','KC','12','TESTStampi','line01','2017-08-01 13:00:00','2017-08-01 15:00:00','2.00','1.08','0.56','-0.52',371,719,-348,'-0.97','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest01','2017-08-01','2017-08-01 15:14:00','INVALID_WORK','invalid_work','invalid','00','invalid','01','2017-08-01 15:10:00','2017-08-01 17:20:00','2.17','0.00','0.00','0.00',0,0,0,'0.00','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest02','2017-08-01','2017-08-01 13:04:00','INVALID_WORK','invalid_work','invalid','00','invalid','01','2017-08-01 08:00:00','2017-08-01 15:00:00','5.83','0.00','0.00','0.00',0,0,0,'0.00','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest02','2017-08-01','2017-08-01 15:11:00','KC170801','KC_DH9003','KC','12','TESTStampi','line01','2017-08-01 15:10:00','2017-08-01 17:20:00','2.17','1.03','0.56','-0.47',421,779,-358,'-1.00','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest02','2017-08-01','2017-08-01 18:02:00','KC170801','KC_DH9003','KC','12','TESTStampi','line01','2017-08-01 18:00:00','2017-08-01 20:00:00','2.00','0.98','0.56','-0.42',409,719,-310,'-0.86','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest02','2017-08-01','2017-08-01 20:13:00','KC170801','KC_DH9003','KC','13','TestB','line01','2017-08-01 20:10:00','2017-08-01 21:59:59','1.83','0.31','0.28','-0.03',1201,1320,-119,'-0.17','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest03','2017-08-01','2017-08-01 08:04:00','OS170801','AP-FDT1083PU','OS','11','TESTStampi','line02','2017-08-01 08:00:00','2017-08-01 10:00:00','2.00','0.58','0.56','-0.02',690,719,-29,'-0.08','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest03','2017-08-01','2017-08-01 10:10:00','OS170801','AP-FDT1083PU','OS','11','TESTStampi','line02','2017-08-01 10:10:00','2017-08-01 12:00:00','1.83','0.56','0.56','-0.01',650,659,-9,'-0.03','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest03','2017-08-01','2017-08-01 13:04:00','OS170801','AP-FDT1083PU','OS','12','TESTStampi','line02','2017-08-01 13:00:00','2017-08-01 14:10:00','1.17','0.78','0.56','-0.22',300,419,-119,'-0.33','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest03','2017-08-01','2017-08-01 14:10:00','INVALID_WORK','invalid_work','invalid','00','invalid','01','2017-08-01 14:10:00','2017-08-01 15:00:00','0.83','0.00','0.00','0.00',0,0,0,'0.00','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest03','2017-08-01','2017-08-01 15:14:00','OS170801','AP-FDT1083PU','OS','12','TESTStampi','line02','2017-08-01 15:10:00','2017-08-01 17:20:00','2.17','0.72','0.56','-0.17',600,779,-179,'-0.50','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest03','2017-08-01','2017-08-01 18:02:00','OS170801','AP-FDT1083PU','OS','12','TESTStampi','line02','2017-08-01 18:00:00','2017-08-01 19:20:00','1.33','0.61','0.56','-0.05',440,479,-39,'-0.11','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest03','2017-08-01','2017-08-01 19:25:00','OS170801','AP-FDT1083PU','OS','13','TestB','line02','2017-08-01 19:20:00','2017-08-01 20:00:00','0.67','0.70','0.28','-0.42',190,480,-290,'-0.40','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest03','2017-08-01','2017-08-01 20:13:00','OS170801','AP-FDT1083PU','OS','13','TestB','line02','2017-08-01 20:10:00','2017-08-01 21:59:59','1.83','0.32','0.28','-0.04',1150,1320,-170,'-0.24','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01');
/*!40000 ALTER TABLE `a_kuochuan_servtrack_performance` ENABLE KEYS */;


--
-- Definition of table `a_kuochuan_servtrack_product`
--

DROP TABLE IF EXISTS `a_kuochuan_servtrack_product`;
CREATE TABLE `a_kuochuan_servtrack_product` (
  `product_id` varchar(20) NOT NULL,
  `product_type_id` varchar(20) NOT NULL,
  PRIMARY KEY (`product_id`),
  KEY `FK_a_kuochuan_servtrack_product_product_type_id` (`product_type_id`) USING BTREE,
  KEY `FK_a_kuochuan_servtrack_product_product_id` (`product_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_product_product_id` FOREIGN KEY (`product_id`) REFERENCES `a_servtrack_product` (`product_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_product_product_type_id` FOREIGN KEY (`product_type_id`) REFERENCES `a_kuochuan_servtrack_product_type` (`product_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_kuochuan_servtrack_product`
--

/*!40000 ALTER TABLE `a_kuochuan_servtrack_product` DISABLE KEYS */;
INSERT INTO `a_kuochuan_servtrack_product` (`product_id`,`product_type_id`) VALUES 
 ('invalid_work','invalid'),
 ('KC_DH9003','KC'),
 ('KC_DH9004','KC'),
 ('AP-FDT1083PU','OS');
/*!40000 ALTER TABLE `a_kuochuan_servtrack_product` ENABLE KEYS */;


--
-- Definition of table `a_kuochuan_servtrack_product_op`
--

DROP TABLE IF EXISTS `a_kuochuan_servtrack_product_op`;
CREATE TABLE `a_kuochuan_servtrack_product_op` (
  `product_id` varchar(20) NOT NULL DEFAULT '',
  `op` varchar(10) NOT NULL DEFAULT '',
  `process_step` varchar(10) NOT NULL DEFAULT '',
  PRIMARY KEY (`product_id`,`op`),
  KEY `FK_a_kuochuan_servtrack_product_op_product_id_op` (`product_id`,`op`) USING BTREE,
  CONSTRAINT `FK_a_kuochuan_servtrack_product_op_product_id_op` FOREIGN KEY (`product_id`, `op`) REFERENCES `a_servtrack_product_op` (`product_id`, `op`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_kuochuan_servtrack_product_op`
--

/*!40000 ALTER TABLE `a_kuochuan_servtrack_product_op` DISABLE KEYS */;
INSERT INTO `a_kuochuan_servtrack_product_op` (`product_id`,`op`,`process_step`) VALUES 
 ('AP-FDT1083PU','11','A-1'),
 ('AP-FDT1083PU','12','A-2'),
 ('AP-FDT1083PU','13','A-3'),
 ('AP-FDT1083PU','21','B-1'),
 ('KC_DH9003','11','A-1'),
 ('KC_DH9003','12','A-2'),
 ('KC_DH9003','13','A-3'),
 ('KC_DH9004','11','A-1'),
 ('KC_DH9004','12','A-2'),
 ('KC_DH9004','13','A-3');
/*!40000 ALTER TABLE `a_kuochuan_servtrack_product_op` ENABLE KEYS */;


--
-- Definition of table `a_kuochuan_servtrack_product_type`
--

DROP TABLE IF EXISTS `a_kuochuan_servtrack_product_type`;
CREATE TABLE `a_kuochuan_servtrack_product_type` (
  `product_type_id` varchar(20) NOT NULL,
  `staff_id` varchar(10) NOT NULL,
  `remark` varchar(50) DEFAULT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`product_type_id`),
  KEY `a_kuochuan_servtrack_product_type_staff_id` (`staff_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_product_type_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `a_kuochuan_servtrack_staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_kuochuan_servtrack_product_type`
--

/*!40000 ALTER TABLE `a_kuochuan_servtrack_product_type` DISABLE KEYS */;
INSERT INTO `a_kuochuan_servtrack_product_type` (`product_type_id`,`staff_id`,`remark`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('invalid','90060',NULL,'Y','default','2017-08-01 07:59:00','default','2017-08-01 07:59:00'),
 ('KC','90060',NULL,'Y','default','2017-08-01 07:59:00','default','2017-08-01 07:59:00'),
 ('OS','1060803',NULL,'Y','default','2017-08-01 07:59:00','default','2017-08-01 07:59:00');
/*!40000 ALTER TABLE `a_kuochuan_servtrack_product_type` ENABLE KEYS */;


--
-- Definition of table `a_kuochuan_servtrack_punch_record_a`
--

DROP TABLE IF EXISTS `a_kuochuan_servtrack_punch_record_a`;
CREATE TABLE `a_kuochuan_servtrack_punch_record_a` (
  `staff_id` varchar(10) NOT NULL,
  `shift_day` date NOT NULL,
  `punch_in` time NOT NULL,
  `punch_out` time NOT NULL,
  `late` varchar(1) NOT NULL,
  `leave_early` varchar(1) NOT NULL,
  `absent` varchar(1) NOT NULL,
  `day_off` varchar(1) NOT NULL,
  `off_start_1` time DEFAULT NULL,
  `off_end_1` time DEFAULT NULL,
  `off_start_2` time DEFAULT NULL,
  `off_end_2` time DEFAULT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`staff_id`,`shift_day`),
  KEY `a_kuochuan_servtrack_punch_record_a_staff_id` (`staff_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_punch_record_a_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `a_kuochuan_servtrack_staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_kuochuan_servtrack_punch_record_a`
--

/*!40000 ALTER TABLE `a_kuochuan_servtrack_punch_record_a` DISABLE KEYS */;
INSERT INTO `a_kuochuan_servtrack_punch_record_a` (`staff_id`,`shift_day`,`punch_in`,`punch_out`,`late`,`leave_early`,`absent`,`day_off`,`off_start_1`,`off_end_1`,`off_start_2`,`off_end_2`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('1060803','2017-08-01','08:00:00','17:29:59','0','0','0','0',NULL,NULL,NULL,NULL,'dispatcher','2017-09-01 09:56:04','dispatcher','2017-09-01 09:56:04'),
 ('90060','2017-08-01','08:00:00','17:29:59','0','0','0','0',NULL,NULL,NULL,NULL,'dispatcher','2017-09-01 09:56:04','dispatcher','2017-09-01 09:56:04'),
 ('PTest01','2017-08-01','08:00:00','17:29:59','1','0','0','0',NULL,NULL,NULL,NULL,'dispatcher','2017-09-01 09:56:04','dispatcher','2017-09-01 09:56:04'),
 ('PTest02','2017-08-01','08:00:00','17:29:59','0','0','1','0',NULL,NULL,NULL,NULL,'dispatcher','2017-09-01 09:56:04','dispatcher','2017-09-01 09:56:04'),
 ('PTest03','2017-08-01','08:00:00','17:29:59','0','0','0','0',NULL,NULL,NULL,NULL,'dispatcher','2017-09-01 09:56:04','dispatcher','2017-09-01 09:56:04');
/*!40000 ALTER TABLE `a_kuochuan_servtrack_punch_record_a` ENABLE KEYS */;


--
-- Definition of table `a_kuochuan_servtrack_punch_record_b`
--

DROP TABLE IF EXISTS `a_kuochuan_servtrack_punch_record_b`;
CREATE TABLE `a_kuochuan_servtrack_punch_record_b` (
  `staff_id` varchar(10) NOT NULL,
  `shift_day` date NOT NULL,
  `punch_in` time NOT NULL,
  `punch_out` time NOT NULL,
  `late` varchar(1) NOT NULL,
  `leave_early` varchar(1) NOT NULL,
  `absent` varchar(1) NOT NULL,
  `day_off` varchar(1) NOT NULL,
  `off_start_1` time DEFAULT NULL,
  `off_end_1` time DEFAULT NULL,
  `off_start_2` time DEFAULT NULL,
  `off_end_2` time DEFAULT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`staff_id`,`shift_day`),
  KEY `a_kuochuan_servtrack_punch_record_b_staff_id` (`staff_id`),
  CONSTRAINT `FK_a_kuochuan_servtrack_punch_record_b_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `a_kuochuan_servtrack_staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_kuochuan_servtrack_punch_record_b`
--

/*!40000 ALTER TABLE `a_kuochuan_servtrack_punch_record_b` DISABLE KEYS */;
INSERT INTO `a_kuochuan_servtrack_punch_record_b` (`staff_id`,`shift_day`,`punch_in`,`punch_out`,`late`,`leave_early`,`absent`,`day_off`,`off_start_1`,`off_end_1`,`off_start_2`,`off_end_2`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('90060','2017-08-01','18:00:00','21:59:59','0','0','0','0',NULL,NULL,NULL,NULL,'dispatcher','2017-09-01 09:56:11','dispatcher','2017-09-01 09:56:11'),
 ('PTest02','2017-08-01','18:00:00','21:59:59','0','0','0','0',NULL,NULL,NULL,NULL,'dispatcher','2017-09-01 09:56:11','dispatcher','2017-09-01 09:56:11'),
 ('PTest03','2017-08-01','18:00:00','21:59:59','0','0','0','0',NULL,NULL,NULL,NULL,'dispatcher','2017-09-01 09:56:11','dispatcher','2017-09-01 09:56:11');
/*!40000 ALTER TABLE `a_kuochuan_servtrack_punch_record_b` ENABLE KEYS */;


--
-- Definition of table `a_kuochuan_servtrack_shift_time_ab`
--

DROP TABLE IF EXISTS `a_kuochuan_servtrack_shift_time_ab`;
CREATE TABLE `a_kuochuan_servtrack_shift_time_ab` (
  `shift` varchar(1) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`shift`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_kuochuan_servtrack_shift_time_ab`
--

/*!40000 ALTER TABLE `a_kuochuan_servtrack_shift_time_ab` DISABLE KEYS */;
INSERT INTO `a_kuochuan_servtrack_shift_time_ab` (`shift`,`start_time`,`end_time`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('A','08:00:00','17:29:59','default','2017-08-23 14:00:00','default','2017-08-23 14:00:00'),
 ('B','18:00:00','21:59:59','default','2017-08-23 14:00:00','default','2017-08-23 14:00:00');
/*!40000 ALTER TABLE `a_kuochuan_servtrack_shift_time_ab` ENABLE KEYS */;


--
-- Definition of table `a_kuochuan_servtrack_should_work`
--

DROP TABLE IF EXISTS `a_kuochuan_servtrack_should_work`;
CREATE TABLE `a_kuochuan_servtrack_should_work` (
  `staff_id` varchar(10) NOT NULL,
  `shift_day` date NOT NULL,
  `working_start` time NOT NULL,
  `working_end` time NOT NULL,
  `working_hour` decimal(10,2) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`staff_id`,`shift_day`),
  KEY `FK_a_kuochuan_servtrack_should_work_staff_id` (`staff_id`) USING BTREE,
  CONSTRAINT `FK_a_kuochuan_servtrack_should_work_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `a_kuochuan_servtrack_staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_kuochuan_servtrack_should_work`
--

/*!40000 ALTER TABLE `a_kuochuan_servtrack_should_work` DISABLE KEYS */;
INSERT INTO `a_kuochuan_servtrack_should_work` (`staff_id`,`shift_day`,`working_start`,`working_end`,`working_hour`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('1060803','2017-08-01','08:00:00','17:29:59','8.00','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('90060','2017-08-01','08:00:00','21:59:59','11.83','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest01','2017-08-01','08:00:00','17:29:59','8.00','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest02','2017-08-01','08:00:00','21:59:59','11.83','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01'),
 ('PTest03','2017-08-01','08:00:00','21:59:59','11.83','servtrack','2017-09-01 10:05:01','servtrack','2017-09-01 10:05:01');
/*!40000 ALTER TABLE `a_kuochuan_servtrack_should_work` ENABLE KEYS */;


--
-- Definition of table `a_kuochuan_servtrack_staff`
--

DROP TABLE IF EXISTS `a_kuochuan_servtrack_staff`;
CREATE TABLE `a_kuochuan_servtrack_staff` (
  `staff_id` varchar(10) NOT NULL,
  `staff_name` varchar(50) NOT NULL,
  `staff_wage` int(10) NOT NULL,
  `qrcod_staff` varchar(50) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  `last_wage` int(10) NOT NULL,
  PRIMARY KEY (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_kuochuan_servtrack_staff`
--

/*!40000 ALTER TABLE `a_kuochuan_servtrack_staff` DISABLE KEYS */;
INSERT INTO `a_kuochuan_servtrack_staff` (`staff_id`,`staff_name`,`staff_wage`,`qrcod_staff`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`,`last_wage`) VALUES 
 ('1060803','陳瑤琴',300,'810e5decf6a0443b97e146e20d2b3a48','Y','default','2017-08-24 17:58:18','default','2017-08-24 17:58:18',-1),
 ('90060','黃政賢',300,'e1b44284fbd642dba5d62c741a6a2152','Y','default','2017-08-24 17:58:08','default','2017-08-24 17:58:08',-1),
 ('PTest01','許香香',200,'22dc40043fa84506b2556f4d89e20fd1','Y','dispatcher','2017-08-31 14:50:21','dispatcher','2017-08-31 14:50:21',-1),
 ('PTest02','陳小小',200,'9d17529f09b2437ab422d1cd7b1bce07','Y','dispatcher','2017-08-31 14:50:34','dispatcher','2017-08-31 14:50:34',-1),
 ('PTest03','高文城',200,'6983371231a645bd921513d864106c8e','Y','dispatcher','2017-08-31 14:50:48','dispatcher','2017-08-31 14:50:48',-1);
/*!40000 ALTER TABLE `a_kuochuan_servtrack_staff` ENABLE KEYS */;


--
-- Definition of table `a_kuochuan_servtrack_unloading_time`
--

DROP TABLE IF EXISTS `a_kuochuan_servtrack_unloading_time`;
CREATE TABLE `a_kuochuan_servtrack_unloading_time` (
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_kuochuan_servtrack_unloading_time`
--

/*!40000 ALTER TABLE `a_kuochuan_servtrack_unloading_time` DISABLE KEYS */;
INSERT INTO `a_kuochuan_servtrack_unloading_time` (`start_time`,`end_time`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('10:00:00','10:10:00','default','2017-08-23 14:00:00','default','2017-08-23 14:00:00'),
 ('12:00:00','13:00:00','default','2017-08-23 14:00:00','default','2017-08-23 14:00:00'),
 ('15:00:00','15:10:00','default','2017-08-23 14:00:00','default','2017-08-23 14:00:00'),
 ('17:20:00','18:00:00','default','2017-08-23 14:00:00','default','2017-08-23 14:00:00'),
 ('20:00:00','20:10:00','default','2017-08-23 14:00:00','default','2017-08-23 14:00:00');
/*!40000 ALTER TABLE `a_kuochuan_servtrack_unloading_time` ENABLE KEYS */;


--
-- Definition of table `a_kuochuan_servtrack_work_op`
--

DROP TABLE IF EXISTS `a_kuochuan_servtrack_work_op`;
CREATE TABLE `a_kuochuan_servtrack_work_op` (
  `work_id` varchar(20) NOT NULL,
  `op` varchar(10) NOT NULL,
  `process_step` varchar(10) NOT NULL,
  PRIMARY KEY (`work_id`,`op`),
  KEY `FK_a_kuochuan_servtrack_work_id_op` (`work_id`,`op`),
  CONSTRAINT `FK_a_kuochuan_servtrack_work_id_op` FOREIGN KEY (`work_id`, `op`) REFERENCES `a_servtrack_work_op` (`work_id`, `op`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_kuochuan_servtrack_work_op`
--

/*!40000 ALTER TABLE `a_kuochuan_servtrack_work_op` DISABLE KEYS */;
INSERT INTO `a_kuochuan_servtrack_work_op` (`work_id`,`op`,`process_step`) VALUES 
 ('INVALID_WORK','00','invalid'),
 ('KC170801','11','A-1'),
 ('KC170801','12','A-2'),
 ('KC170801','13','A-3'),
 ('KC170802','11','A-1'),
 ('KC170802','12','A-2'),
 ('KC170802','13','A-3'),
 ('OS170801','11','A-1'),
 ('OS170801','12','A-2'),
 ('OS170801','13','A-3'),
 ('OS170801','21','B-1'),
 ('OS170802','11','A-1'),
 ('OS170802','12','A-2'),
 ('OS170802','13','A-3'),
 ('OS170802','21','B-1');
/*!40000 ALTER TABLE `a_kuochuan_servtrack_work_op` ENABLE KEYS */;


--
-- Definition of table `a_kuochuan_servtrack_work_tracking`
--

DROP TABLE IF EXISTS `a_kuochuan_servtrack_work_tracking`;
CREATE TABLE `a_kuochuan_servtrack_work_tracking` (
  `move_in` datetime NOT NULL,
  `line_id` varchar(10) NOT NULL,
  `staff_id` varchar(10) NOT NULL,
  `work_id` varchar(20) NOT NULL,
  `op` varchar(10) NOT NULL,
  `process_code` varchar(10) NOT NULL,
  PRIMARY KEY (`move_in`,`line_id`,`staff_id`,`work_id`,`op`,`process_code`),
  KEY `FK_a_kuochuan_servtrack_work_tracking_move_in_line_id_work_id_op` (`move_in`,`line_id`,`work_id`,`op`),
  KEY `FK_a_kuochuan_servtrack_work_tracking_staff_id` (`staff_id`),
  KEY `FK_a_kuochuan_servtrack_work_tracking_process_code` (`process_code`),
  CONSTRAINT `FK_a_kuochuan_servtrack_work_tracking_move_in_line_id_work_id_op` FOREIGN KEY (`move_in`, `line_id`, `work_id`, `op`) REFERENCES `a_servtrack_work_tracking` (`move_in`, `line_id`, `work_id`, `op`),
  CONSTRAINT `FK_a_kuochuan_servtrack_work_tracking_process_code` FOREIGN KEY (`process_code`) REFERENCES `a_servtrack_process` (`process_code`),
  CONSTRAINT `FK_a_kuochuan_servtrack_work_tracking_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `a_kuochuan_servtrack_staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_kuochuan_servtrack_work_tracking`
--

/*!40000 ALTER TABLE `a_kuochuan_servtrack_work_tracking` DISABLE KEYS */;
INSERT INTO `a_kuochuan_servtrack_work_tracking` (`move_in`,`line_id`,`staff_id`,`work_id`,`op`,`process_code`) VALUES 
 ('2017-08-01 08:04:00','line01','PTest01','KC170801','11','TESTStampi'),
 ('2017-08-01 09:08:00','line01','PTest01','KC170801','11','TESTStampi'),
 ('2017-08-01 10:08:00','line01','PTest01','KC170801','11','TESTStampi'),
 ('2017-08-01 13:04:00','line01','PTest01','KC170801','12','TESTStampi'),
 ('2017-08-01 15:14:00','01','PTest01','INVALID_WORK','00','invalid'),
 ('2017-08-01 13:04:00','01','PTest02','INVALID_WORK','00','invalid'),
 ('2017-08-01 15:11:00','line01','PTest02','KC170801','12','TESTStampi'),
 ('2017-08-01 18:02:00','line01','PTest02','KC170801','12','TESTStampi'),
 ('2017-08-01 20:13:00','line01','PTest02','KC170801','13','TestB'),
 ('2017-08-01 08:04:00','line02','PTest03','OS170801','11','TESTStampi'),
 ('2017-08-01 10:10:00','line02','PTest03','OS170801','11','TESTStampi'),
 ('2017-08-01 13:04:00','line02','PTest03','OS170801','12','TESTStampi'),
 ('2017-08-01 14:10:00','01','PTest03','INVALID_WORK','00','invalid'),
 ('2017-08-01 15:14:00','line02','PTest03','OS170801','12','TESTStampi'),
 ('2017-08-01 18:02:00','line02','PTest03','OS170801','12','TESTStampi'),
 ('2017-08-01 19:25:00','line02','PTest03','OS170801','13','TestB'),
 ('2017-08-01 20:13:00','line02','PTest03','OS170801','13','TestB');
/*!40000 ALTER TABLE `a_kuochuan_servtrack_work_tracking` ENABLE KEYS */;


--
-- Definition of table `a_kuochuan_servtrack_work_tracking_ng`
--

DROP TABLE IF EXISTS `a_kuochuan_servtrack_work_tracking_ng`;
CREATE TABLE `a_kuochuan_servtrack_work_tracking_ng` (
  `move_in` datetime NOT NULL,
  `staff_id` varchar(10) NOT NULL,
  `line_id` varchar(10) NOT NULL,
  `work_id` varchar(20) NOT NULL,
  `op` varchar(10) NOT NULL,
  `process_code` varchar(10) NOT NULL,
  `ng_code` varchar(10) NOT NULL,
  PRIMARY KEY (`move_in`,`staff_id`,`line_id`,`work_id`,`op`,`process_code`,`ng_code`),
  KEY `FK_a_kuochuan_servtrack_work_tracking_ng_staff_id` (`staff_id`),
  KEY `FK_a_kuochuan_servtrack_m_l_w_o_p_n` (`move_in`,`line_id`,`work_id`,`op`,`process_code`,`ng_code`),
  CONSTRAINT `FK_a_kuochuan_servtrack_m_l_w_o_p_n` FOREIGN KEY (`move_in`, `line_id`, `work_id`, `op`, `process_code`, `ng_code`) REFERENCES `a_servtrack_work_tracking_ng` (`move_in`, `line_id`, `work_id`, `op`, `process_code`, `ng_code`),
  CONSTRAINT `FK_a_kuochuan_servtrack_work_tracking_ng_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `a_kuochuan_servtrack_staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_kuochuan_servtrack_work_tracking_ng`
--

/*!40000 ALTER TABLE `a_kuochuan_servtrack_work_tracking_ng` DISABLE KEYS */;
INSERT INTO `a_kuochuan_servtrack_work_tracking_ng` (`move_in`,`staff_id`,`line_id`,`work_id`,`op`,`process_code`,`ng_code`) VALUES 
 ('2017-08-01 08:04:00','PTest01','line01','KC170801','11','TESTStampi','04'),
 ('2017-08-01 09:08:00','PTest01','line01','KC170801','11','TESTStampi','03'),
 ('2017-08-01 10:08:00','PTest01','line01','KC170801','11','TESTStampi','02'),
 ('2017-08-01 10:08:00','PTest01','line01','KC170801','11','TESTStampi','03'),
 ('2017-08-01 10:08:00','PTest01','line01','KC170801','11','TESTStampi','04'),
 ('2017-08-01 08:04:00','PTest03','line02','OS170801','11','TESTStampi','03'),
 ('2017-08-01 19:25:00','PTest03','line02','OS170801','13','TestB','01');
/*!40000 ALTER TABLE `a_kuochuan_servtrack_work_tracking_ng` ENABLE KEYS */;


--
-- Definition of table `a_servtrack_line`
--

DROP TABLE IF EXISTS `a_servtrack_line`;
CREATE TABLE `a_servtrack_line` (
  `line_id` varchar(10) NOT NULL,
  `line_name` varchar(50) NOT NULL,
  `qrcode_line` varchar(50) NOT NULL,
  `oee_sp` decimal(5,2) DEFAULT NULL,
  `line_quality_sp` decimal(5,2) DEFAULT NULL,
  `perf_sp` decimal(5,2) DEFAULT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`line_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_servtrack_line`
--

/*!40000 ALTER TABLE `a_servtrack_line` DISABLE KEYS */;
INSERT INTO `a_servtrack_line` (`line_id`,`line_name`,`qrcode_line`,`oee_sp`,`line_quality_sp`,`perf_sp`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('01','製二課','3e658b18112b4c6e955a90373374bfd5',NULL,NULL,NULL,'Y','dispatcher','2017-08-31 14:49:53','dispatcher','2017-08-31 14:49:53'),
 ('line01','01線','50ee101a9e994fd0afe83c162efd7ca4','90.00','95.00','95.00','Y','dispatcher','2017-08-31 16:33:46','dispatcher','2017-08-31 16:33:46'),
 ('line02','02線','610ac9ea80b54e6b9f9ce59d7118ceab','90.00','95.00','95.00','Y','dispatcher','2017-08-31 16:34:05','dispatcher','2017-08-31 16:34:05');
/*!40000 ALTER TABLE `a_servtrack_line` ENABLE KEYS */;


--
-- Definition of table `a_servtrack_line_oee`
--

DROP TABLE IF EXISTS `a_servtrack_line_oee`;
CREATE TABLE `a_servtrack_line_oee` (
  `shift_day` date NOT NULL,
  `line_id` varchar(10) NOT NULL,
  `op_duration` decimal(10,2) DEFAULT NULL,
  `output_sp` decimal(10,0) DEFAULT NULL,
  `output` int(10) DEFAULT NULL,
  `go_quantity` int(10) DEFAULT NULL,
  `ng_quantity` int(10) DEFAULT NULL,
  `quality` decimal(5,2) DEFAULT NULL,
  `aval` decimal(5,2) DEFAULT NULL,
  `oee` decimal(5,2) DEFAULT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`shift_day`,`line_id`),
  KEY `a_servtrack_line_oee_line_id` (`line_id`),
  CONSTRAINT `a_servtrack_line_oee_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_servtrack_line_oee`
--

/*!40000 ALTER TABLE `a_servtrack_line_oee` DISABLE KEYS */;
INSERT INTO `a_servtrack_line_oee` (`shift_day`,`line_id`,`op_duration`,`output_sp`,`output`,`go_quantity`,`ng_quantity`,`quality`,`aval`,`oee`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('2017-08-01','line01','682.00','4722',3752,3603,149,'96.03','96.05','67.40','dispatcher','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01','line02','610.00','4441',4040,4020,20,'99.50','85.90','78.24','dispatcher','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01');
/*!40000 ALTER TABLE `a_servtrack_line_oee` ENABLE KEYS */;


--
-- Definition of table `a_servtrack_line_working_hour`
--

DROP TABLE IF EXISTS `a_servtrack_line_working_hour`;
CREATE TABLE `a_servtrack_line_working_hour` (
  `line_id` varchar(10) NOT NULL,
  `shift_day` date NOT NULL,
  `duration_sp` decimal(4,2) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`line_id`,`shift_day`),
  KEY `FK_a_servtrack_line_working_hour_line_id` (`line_id`),
  CONSTRAINT `FK_a_servtrack_line_working_hour_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_servtrack_line_working_hour`
--

/*!40000 ALTER TABLE `a_servtrack_line_working_hour` DISABLE KEYS */;
INSERT INTO `a_servtrack_line_working_hour` (`line_id`,`shift_day`,`duration_sp`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('line01','2017-08-01','11.83','dispatcher','2017-09-01 09:56:04','dispatcher','2017-09-01 09:56:04'),
 ('line02','2017-08-01','11.83','dispatcher','2017-09-01 09:56:04','dispatcher','2017-09-01 09:56:04');
/*!40000 ALTER TABLE `a_servtrack_line_working_hour` ENABLE KEYS */;


--
-- Definition of table `a_servtrack_process`
--

DROP TABLE IF EXISTS `a_servtrack_process`;
CREATE TABLE `a_servtrack_process` (
  `process_code` varchar(10) NOT NULL,
  `process_name` varchar(50) NOT NULL,
  `process_quality` decimal(5,2) NOT NULL,
  `remark` varchar(50) DEFAULT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`process_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_servtrack_process`
--

/*!40000 ALTER TABLE `a_servtrack_process` DISABLE KEYS */;
INSERT INTO `a_servtrack_process` (`process_code`,`process_name`,`process_quality`,`remark`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('invalid','invalid','0.00','','Y','default','2017-08-24 19:05:27','default','2017-08-24 19:05:27'),
 ('TestB','點焊B','95.00','','Y','dispatcher','2017-08-31 14:41:18','dispatcher','2017-08-31 14:41:18'),
 ('TESTStampi','沖壓Stamping','95.00','','Y','dispatcher','2017-08-31 14:40:10','dispatcher','2017-08-31 14:40:10');
/*!40000 ALTER TABLE `a_servtrack_process` ENABLE KEYS */;


--
-- Definition of table `a_servtrack_process_ng`
--

DROP TABLE IF EXISTS `a_servtrack_process_ng`;
CREATE TABLE `a_servtrack_process_ng` (
  `process_code` varchar(10) NOT NULL,
  `ng_code` varchar(10) NOT NULL,
  `ng_name` varchar(50) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  `remark` varchar(50) DEFAULT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`process_code`,`ng_code`),
  KEY `FK_a_servtrack_process_ng_process_code` (`process_code`),
  CONSTRAINT `FK_a_servtrack_process_ng_process_code` FOREIGN KEY (`process_code`) REFERENCES `a_servtrack_process` (`process_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_servtrack_process_ng`
--

/*!40000 ALTER TABLE `a_servtrack_process_ng` DISABLE KEYS */;
INSERT INTO `a_servtrack_process_ng` (`process_code`,`ng_code`,`ng_name`,`is_open`,`remark`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('TestB','01','髒汙','Y','','dispatcher','2017-08-31 14:52:16','dispatcher','2017-08-31 14:52:16'),
 ('TestB','02','脫落','Y','','dispatcher','2017-08-31 14:52:23','dispatcher','2017-08-31 14:52:23'),
 ('TestB','03','其他','Y','','dispatcher','2017-08-31 14:52:30','dispatcher','2017-08-31 14:52:30'),
 ('TESTStampi','01','破裂','Y','','dispatcher','2017-08-31 14:51:27','dispatcher','2017-08-31 14:51:27'),
 ('TESTStampi','02','毛邊','Y','','dispatcher','2017-08-31 14:51:35','dispatcher','2017-08-31 14:51:35'),
 ('TESTStampi','03','變形','Y','','dispatcher','2017-08-31 14:51:42','dispatcher','2017-08-31 14:51:42'),
 ('TESTStampi','04','尺寸不良','Y','','dispatcher','2017-08-31 14:51:51','dispatcher','2017-08-31 14:51:51'),
 ('TESTStampi','05','其他','Y','','dispatcher','2017-08-31 14:52:00','dispatcher','2017-08-31 14:52:00');
/*!40000 ALTER TABLE `a_servtrack_process_ng` ENABLE KEYS */;


--
-- Definition of table `a_servtrack_product`
--

DROP TABLE IF EXISTS `a_servtrack_product`;
CREATE TABLE `a_servtrack_product` (
  `product_id` varchar(20) NOT NULL,
  `product_name` varchar(50) NOT NULL,
  `product_quality_sp` decimal(5,2) NOT NULL,
  `remark` varchar(50) DEFAULT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_servtrack_product`
--

/*!40000 ALTER TABLE `a_servtrack_product` DISABLE KEYS */;
INSERT INTO `a_servtrack_product` (`product_id`,`product_name`,`product_quality_sp`,`remark`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('AP-FDT1083PU','AP-FDT1083PU','90.00','','Y','dispatcher','2017-08-31 14:42:03','dispatcher','2017-08-31 14:42:03'),
 ('invalid_work','invalid_work','0.00','','Y','default','2017-08-24 19:05:51','default','2017-08-24 19:05:51'),
 ('KC_DH9003','KC_DH9003','90.00','','Y','dispatcher','2017-08-31 14:41:48','dispatcher','2017-08-31 14:41:48'),
 ('KC_DH9004','KC_DH9004','90.00','','Y','dispatcher','2017-08-31 16:32:19','dispatcher','2017-08-31 16:32:19');
/*!40000 ALTER TABLE `a_servtrack_product` ENABLE KEYS */;


--
-- Definition of table `a_servtrack_product_op`
--

DROP TABLE IF EXISTS `a_servtrack_product_op`;
CREATE TABLE `a_servtrack_product_op` (
  `product_id` varchar(20) NOT NULL,
  `op` varchar(10) NOT NULL,
  `process_code` varchar(10) NOT NULL,
  `std_hour` decimal(10,4) NOT NULL,
  `op_quality_sp` decimal(5,2) NOT NULL,
  `remark` varchar(50) DEFAULT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`product_id`,`op`),
  KEY `FK_a_servtrack_product_op_product_id` (`product_id`),
  KEY `FK_a_servtrack_product_op_process_code` (`process_code`),
  CONSTRAINT `FK_a_servtrack_product_op_product_id` FOREIGN KEY (`product_id`) REFERENCES `a_servtrack_product` (`product_id`),
  CONSTRAINT `FK_a_servtrack_product_op_process_code` FOREIGN KEY (`process_code`) REFERENCES `a_servtrack_process` (`process_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_servtrack_product_op`
--

/*!40000 ALTER TABLE `a_servtrack_product_op` DISABLE KEYS */;
INSERT INTO `a_servtrack_product_op` (`product_id`,`op`,`process_code`,`std_hour`,`op_quality_sp`,`remark`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('AP-FDT1083PU','11','TESTStampi','0.1667','95.00','','Y','dispatcher','2017-08-31 14:44:53','dispatcher','2017-08-31 14:44:53'),
 ('AP-FDT1083PU','12','TESTStampi','0.1667','95.00','','Y','dispatcher','2017-08-31 14:45:09','dispatcher','2017-08-31 14:45:09'),
 ('AP-FDT1083PU','13','TestB','0.0833','100.00','','Y','dispatcher','2017-08-31 14:45:27','dispatcher','2017-08-31 14:45:27'),
 ('AP-FDT1083PU','21','TESTStampi','0.1667','95.00','','Y','dispatcher','2017-08-31 14:45:48','dispatcher','2017-08-31 14:45:48'),
 ('KC_DH9003','11','TESTStampi','0.1667','95.00','','Y','dispatcher','2017-08-31 14:43:34','dispatcher','2017-08-31 14:43:34'),
 ('KC_DH9003','12','TESTStampi','0.1667','95.00','','Y','dispatcher','2017-08-31 14:43:51','dispatcher','2017-08-31 14:43:51'),
 ('KC_DH9003','13','TestB','0.0833','100.00','','Y','dispatcher','2017-08-31 14:44:12','dispatcher','2017-08-31 14:44:12'),
 ('KC_DH9004','11','TESTStampi','0.1667','95.00','','Y','dispatcher','2017-08-31 16:34:20','dispatcher','2017-08-31 16:34:20'),
 ('KC_DH9004','12','TESTStampi','0.1667','95.00','','Y','dispatcher','2017-08-31 16:36:15','dispatcher','2017-08-31 16:36:15'),
 ('KC_DH9004','13','TestB','0.0833','100.00','','Y','dispatcher','2017-08-31 16:36:41','dispatcher','2017-08-31 16:36:41');
/*!40000 ALTER TABLE `a_servtrack_product_op` ENABLE KEYS */;


--
-- Definition of table `a_servtrack_shift_time`
--

DROP TABLE IF EXISTS `a_servtrack_shift_time`;
CREATE TABLE `a_servtrack_shift_time` (
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `duration_sp` decimal(4,2) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_servtrack_shift_time`
--

/*!40000 ALTER TABLE `a_servtrack_shift_time` DISABLE KEYS */;
INSERT INTO `a_servtrack_shift_time` (`start_time`,`end_time`,`duration_sp`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('08:00:00','21:59:59','11.83','default','2017-06-01 08:00:00','default','2017-06-01 08:00:00');
/*!40000 ALTER TABLE `a_servtrack_shift_time` ENABLE KEYS */;


--
-- Definition of table `a_servtrack_tablet_authority`
--

DROP TABLE IF EXISTS `a_servtrack_tablet_authority`;
CREATE TABLE `a_servtrack_tablet_authority` (
  `id` varchar(32) NOT NULL,
  `name` varchar(20) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  `auth_key` varchar(50) DEFAULT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_servtrack_tablet_authority`
--

/*!40000 ALTER TABLE `a_servtrack_tablet_authority` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_servtrack_tablet_authority` ENABLE KEYS */;


--
-- Definition of table `a_servtrack_tracking_no_move_out`
--

DROP TABLE IF EXISTS `a_servtrack_tracking_no_move_out`;
CREATE TABLE `a_servtrack_tracking_no_move_out` (
  `move_in` datetime NOT NULL,
  `line_id` varchar(10) NOT NULL,
  `work_id` varchar(20) NOT NULL,
  `op` varchar(10) NOT NULL,
  `cust_field_1` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_2` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_3` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_4` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_5` varchar(50) NOT NULL DEFAULT '-1',
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`move_in`,`line_id`,`work_id`,`op`,`cust_field_1`,`cust_field_2`,`cust_field_3`,`cust_field_4`,`cust_field_5`),
  KEY `FK_a_servtrack_tracking_no_move_out_line_id` (`line_id`),
  KEY `FK_a_servtrack_tracking_no_move_out_work_id_op` (`work_id`,`op`),
  CONSTRAINT `FK_a_servtrack_tracking_no_move_out_work_id_op` FOREIGN KEY (`work_id`, `op`) REFERENCES `a_servtrack_work_op` (`work_id`, `op`),
  CONSTRAINT `FK_a_servtrack_tracking_no_move_out_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_servtrack_tracking_no_move_out`
--

/*!40000 ALTER TABLE `a_servtrack_tracking_no_move_out` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_servtrack_tracking_no_move_out` ENABLE KEYS */;


--
-- Definition of table `a_servtrack_work`
--

DROP TABLE IF EXISTS `a_servtrack_work`;
CREATE TABLE `a_servtrack_work` (
  `work_id` varchar(20) NOT NULL,
  `product_id` varchar(20) NOT NULL,
  `e_quantity` int(10) NOT NULL,
  `input` int(10) NOT NULL,
  `status_id` int(10) NOT NULL,
  `go_quantity` int(10) DEFAULT NULL,
  `quality` decimal(5,2) DEFAULT NULL,
  `op_duration` time DEFAULT NULL,
  `duration` varchar(15) DEFAULT NULL,
  `remark` varchar(50) DEFAULT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`work_id`),
  KEY `FK_a_servtrack_work_product_id` (`product_id`),
  CONSTRAINT `FK_a_servtrack_work_product_id` FOREIGN KEY (`product_id`) REFERENCES `a_servtrack_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_servtrack_work`
--

/*!40000 ALTER TABLE `a_servtrack_work` DISABLE KEYS */;
INSERT INTO `a_servtrack_work` (`work_id`,`product_id`,`e_quantity`,`input`,`status_id`,`go_quantity`,`quality`,`op_duration`,`duration`,`remark`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('INVALID_WORK','invalid_work',0,0,1,NULL,NULL,NULL,NULL,'','default','2017-08-01 07:55:00','default','2017-08-24 19:07:02'),
 ('KC170801','KC_DH9003',1300,1350,1,NULL,NULL,NULL,NULL,'','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 14:52:58'),
 ('KC170802','KC_DH9003',1300,1320,0,NULL,NULL,NULL,NULL,'','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 17:43:10'),
 ('OS170801','AP-FDT1083PU',1300,1350,1,NULL,NULL,NULL,NULL,'','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 14:53:29'),
 ('OS170802','AP-FDT1083PU',1100,1050,0,NULL,NULL,NULL,NULL,'','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 18:07:46');
/*!40000 ALTER TABLE `a_servtrack_work` ENABLE KEYS */;


--
-- Definition of table `a_servtrack_work_op`
--

DROP TABLE IF EXISTS `a_servtrack_work_op`;
CREATE TABLE `a_servtrack_work_op` (
  `work_id` varchar(20) NOT NULL,
  `op` varchar(10) NOT NULL,
  `process_code` varchar(10) NOT NULL,
  `qrcode_op` varchar(50) NOT NULL DEFAULT '',
  `std_hour` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `op_duration` decimal(10,2) DEFAULT NULL,
  `output` int(10) DEFAULT NULL,
  `go_quantity` int(10) DEFAULT NULL,
  `ng_quantity` int(10) DEFAULT NULL,
  `quality` decimal(5,2) DEFAULT NULL,
  `remark` varchar(50) DEFAULT NULL,
  `is_open` varchar(1) DEFAULT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`work_id`,`op`),
  KEY `FK_a_servtrack_work_op_work_id` (`work_id`),
  KEY `FK_a_servtrack_work_op_process_code` (`process_code`),
  CONSTRAINT `FK_a_servtrack_work_op_process_code` FOREIGN KEY (`process_code`) REFERENCES `a_servtrack_process` (`process_code`),
  CONSTRAINT `FK_a_servtrack_work_op_work_id` FOREIGN KEY (`work_id`) REFERENCES `a_servtrack_work` (`work_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_servtrack_work_op`
--

/*!40000 ALTER TABLE `a_servtrack_work_op` DISABLE KEYS */;
INSERT INTO `a_servtrack_work_op` (`work_id`,`op`,`process_code`,`qrcode_op`,`std_hour`,`op_duration`,`output`,`go_quantity`,`ng_quantity`,`quality`,`remark`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('INVALID_WORK','00','invalid','8d6e12d13c7742448a6bd953bfd66e77','0.0000',NULL,NULL,NULL,NULL,NULL,'','Y','default','2017-08-01 07:55:00','STAdmin','2017-08-29 14:33:28'),
 ('KC170801','11','TESTStampi','6814a1bb551c48239f20d7d88b5bf1f4','0.1667',NULL,NULL,NULL,NULL,NULL,'','Y','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 14:52:58'),
 ('KC170801','12','TESTStampi','15c6bbb2d91145868153328c06ad4cd1','0.1667',NULL,NULL,NULL,NULL,NULL,'','Y','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 14:52:58'),
 ('KC170801','13','TestB','1619cf1c2ead467eb31b649ee0dd0269','0.0833',NULL,NULL,NULL,NULL,NULL,'','Y','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 14:52:58'),
 ('KC170802','11','TESTStampi','24cf5b7bcdee47c8a1c4ba531e8da19b','0.1667',NULL,NULL,NULL,NULL,NULL,'','Y','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 14:53:14'),
 ('KC170802','12','TESTStampi','1de3a34c9e7a4722a9cc6fc3f8accc22','0.1667',NULL,NULL,NULL,NULL,NULL,'','Y','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 14:53:14'),
 ('KC170802','13','TestB','7a55ca32e96e4f4b86f0d7b3371fb69f','0.0833',NULL,NULL,NULL,NULL,NULL,'','Y','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 14:53:14'),
 ('OS170801','11','TESTStampi','672d707287a54937b164bbd1b33af55b','0.1667',NULL,NULL,NULL,NULL,NULL,'','Y','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 14:53:29'),
 ('OS170801','12','TESTStampi','7545864b106d4e32b3dace525088ddf5','0.1667',NULL,NULL,NULL,NULL,NULL,'','Y','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 14:53:29'),
 ('OS170801','13','TestB','997855c3b2e84c38acbe5022522e78c6','0.0833',NULL,NULL,NULL,NULL,NULL,'','Y','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 14:53:29'),
 ('OS170801','21','TESTStampi','76e6033c35354bcebe6888d65ea31bfb','0.1667',NULL,NULL,NULL,NULL,NULL,'','Y','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 14:53:29'),
 ('OS170802','11','TESTStampi','51ec3da5d44b485c901d28e107335f12','0.1667',NULL,NULL,NULL,NULL,NULL,'','Y','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 18:07:46'),
 ('OS170802','12','TESTStampi','2bc92a5e2de245808dc85fd952cc2c84','0.1667',NULL,NULL,NULL,NULL,NULL,'','Y','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 18:07:46'),
 ('OS170802','13','TestB','f5d0cf30f92f4966bfd072def1192f64','0.0833',NULL,NULL,NULL,NULL,NULL,'','Y','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 18:07:46'),
 ('OS170802','21','TESTStampi','126e63fcc61744819f2095409476016f','0.1667',NULL,NULL,NULL,NULL,NULL,'','Y','dispatcher','2017-08-01 07:55:00','dispatcher','2017-08-31 18:07:46');
/*!40000 ALTER TABLE `a_servtrack_work_op` ENABLE KEYS */;


--
-- Definition of table `a_servtrack_work_tracking`
--

DROP TABLE IF EXISTS `a_servtrack_work_tracking`;
CREATE TABLE `a_servtrack_work_tracking` (
  `move_in` datetime NOT NULL,
  `line_id` varchar(10) NOT NULL,
  `work_id` varchar(20) NOT NULL,
  `op` varchar(10) NOT NULL,
  `cust_field_1` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_2` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_3` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_4` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_5` varchar(50) NOT NULL DEFAULT '-1',
  `shift_day` date NOT NULL,
  `move_out` datetime DEFAULT NULL,
  `op_duration` decimal(10,4) DEFAULT NULL,
  `output` int(10) DEFAULT NULL,
  `go_quantity` int(10) DEFAULT NULL,
  `ng_quantity` int(10) DEFAULT NULL,
  `quality` decimal(5,2) DEFAULT NULL,
  `output_sp` decimal(10,0) DEFAULT NULL,
  `aval` decimal(5,2) DEFAULT NULL,
  `perf` decimal(5,2) DEFAULT NULL,
  `oee` decimal(5,2) DEFAULT NULL,
  `output_variance` int(10) DEFAULT NULL,
  `duration_variance` decimal(10,2) DEFAULT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`move_in`,`line_id`,`work_id`,`op`,`cust_field_1`,`cust_field_2`,`cust_field_3`,`cust_field_4`,`cust_field_5`),
  KEY `FK_a_servtrack_work_tracking_line_id` (`line_id`),
  KEY `FK_a_servtrack_work_tracking_work_id_op` (`work_id`,`op`),
  CONSTRAINT `FK_a_servtrack_work_tracking_work_id_op` FOREIGN KEY (`work_id`, `op`) REFERENCES `a_servtrack_work_op` (`work_id`, `op`),
  CONSTRAINT `FK_a_servtrack_work_tracking_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_servtrack_work_tracking`
--

/*!40000 ALTER TABLE `a_servtrack_work_tracking` DISABLE KEYS */;
INSERT INTO `a_servtrack_work_tracking` (`move_in`,`line_id`,`work_id`,`op`,`cust_field_1`,`cust_field_2`,`cust_field_3`,`cust_field_4`,`cust_field_5`,`shift_day`,`move_out`,`op_duration`,`output`,`go_quantity`,`ng_quantity`,`quality`,`output_sp`,`aval`,`perf`,`oee`,`output_variance`,`duration_variance`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('2017-08-01 08:04:00','line01','KC170801','11','PTest01','TESTStampi','-1','-1','-1','2017-08-01','2017-08-01 08:57:00','53.0000',330,319,11,'96.67','317','7.46','100.33','7.23',2,'0.18','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01 08:04:00','line02','OS170801','11','PTest03','TESTStampi','-1','-1','-1','2017-08-01','2017-08-01 09:59:00','115.0000',700,690,10,'98.57','689','16.20','100.02','15.97',1,'0.02','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01 09:08:00','line01','KC170801','11','PTest01','TESTStampi','-1','-1','-1','2017-08-01','2017-08-01 09:59:00','51.0000',320,279,41,'87.19','305','7.18','91.19','5.70',-26,'-4.49','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01 10:08:00','line01','KC170801','11','PTest01','TESTStampi','-1','-1','-1','2017-08-01','2017-08-01 11:59:00','111.0000',700,603,97,'86.14','665','15.63','90.56','12.19',-62,'-10.48','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01 10:10:00','line02','OS170801','11','PTest03','TESTStampi','-1','-1','-1','2017-08-01','2017-08-01 11:59:00','109.0000',650,650,0,'100.00','653','15.35','99.41','15.25',-3,'-0.65','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01 13:04:00','01','INVALID_WORK','00','PTest02','invalid','-1','-1','-1','2017-08-01','2017-08-01 14:57:00','113.0000',0,0,0,'0.00','0','0.00','0.00','0.00',0,'-113.00','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01 13:04:00','line01','KC170801','12','PTest01','TESTStampi','-1','-1','-1','2017-08-01','2017-08-01 14:58:00','114.0000',371,371,0,'100.00','683','16.06','54.25','8.71',-312,'-52.15','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01 13:04:00','line02','OS170801','12','PTest03','TESTStampi','-1','-1','-1','2017-08-01','2017-08-01 13:57:00','53.0000',300,300,0,'100.00','317','7.46','94.36','7.03',-17,'-2.99','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01 14:10:00','01','INVALID_WORK','00','PTest03','invalid','-1','-1','-1','2017-08-01','2017-08-01 14:57:00','47.0000',0,0,0,'0.00','0','0.00','0.00','0.00',0,'-47.00','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01 15:11:00','line01','KC170801','12','PTest02','TESTStampi','-1','-1','-1','2017-08-01','2017-08-01 17:21:00','130.0000',421,421,0,'100.00','779','18.31','53.99','9.88',-358,'-59.82','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01 15:14:00','01','INVALID_WORK','00','PTest01','invalid','-1','-1','-1','2017-08-01','2017-08-01 17:13:00','119.0000',0,0,0,'0.00','0','0.00','0.00','0.00',0,'-119.00','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01 15:14:00','line02','OS170801','12','PTest03','TESTStampi','-1','-1','-1','2017-08-01','2017-08-01 17:23:00','129.0000',600,600,0,'100.00','773','18.17','77.53','14.08',-173,'-28.98','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01 18:02:00','line01','KC170801','12','PTest02','TESTStampi','-1','-1','-1','2017-08-01','2017-08-01 19:59:00','117.0000',409,409,0,'100.00','701','16.48','58.27','9.60',-292,'-48.82','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01 18:02:00','line02','OS170801','12','PTest03','TESTStampi','-1','-1','-1','2017-08-01','2017-08-01 19:15:00','73.0000',440,440,0,'100.00','437','10.28','100.48','10.32',3,'0.35','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01 19:25:00','line02','OS170801','13','PTest03','TestB','-1','-1','-1','2017-08-01','2017-08-01 19:58:00','33.0000',200,190,10,'95.00','396','4.64','47.96','2.11',-206,'-17.17','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01 20:13:00','line01','KC170801','13','PTest02','TestB','-1','-1','-1','2017-08-01','2017-08-01 21:59:00','106.0000',1201,1201,0,'100.00','1272','14.93','94.38','14.09',-71,'-5.96','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01'),
 ('2017-08-01 20:13:00','line02','OS170801','13','PTest03','TestB','-1','-1','-1','2017-08-01','2017-08-01 21:51:00','98.0000',1150,1150,0,'100.00','1176','13.80','97.75','13.48',-26,'-2.20','JESSIE','2017-09-01 10:05:01','JESSIE','2017-09-01 10:05:01');
/*!40000 ALTER TABLE `a_servtrack_work_tracking` ENABLE KEYS */;


--
-- Definition of table `a_servtrack_work_tracking_ng`
--

DROP TABLE IF EXISTS `a_servtrack_work_tracking_ng`;
CREATE TABLE `a_servtrack_work_tracking_ng` (
  `move_in` datetime NOT NULL,
  `line_id` varchar(10) NOT NULL,
  `work_id` varchar(20) NOT NULL,
  `op` varchar(10) NOT NULL,
  `process_code` varchar(10) NOT NULL,
  `ng_code` varchar(10) NOT NULL,
  `cust_field_1` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_2` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_3` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_4` varchar(50) NOT NULL DEFAULT '-1',
  `cust_field_5` varchar(50) NOT NULL DEFAULT '-1',
  `ng_quantity` int(10) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`move_in`,`line_id`,`work_id`,`op`,`process_code`,`ng_code`,`cust_field_1`,`cust_field_2`,`cust_field_3`,`cust_field_4`,`cust_field_5`),
  KEY `FK_a_servtrack_work_tracking_ng_move_in` (`move_in`),
  KEY `FK_a_servtrack_work_tracking_ng_line_id` (`line_id`),
  KEY `FK_a_servtrack_work_tracking_ng_work_id_op` (`work_id`,`op`),
  KEY `FK_a_servtrack_work_tracking_ng_process_code_ng_code` (`process_code`,`ng_code`),
  CONSTRAINT `FK_a_servtrack_work_tracking_ng_move_in` FOREIGN KEY (`move_in`) REFERENCES `a_servtrack_work_tracking` (`move_in`),
  CONSTRAINT `FK_a_servtrack_work_tracking_ng_line_id` FOREIGN KEY (`line_id`) REFERENCES `a_servtrack_line` (`line_id`),
  CONSTRAINT `FK_a_servtrack_work_tracking_ng_work_id_op` FOREIGN KEY (`work_id`, `op`) REFERENCES `a_servtrack_work_op` (`work_id`, `op`),
  CONSTRAINT `FK_a_servtrack_work_tracking_ng_process_code_ng_code` FOREIGN KEY (`process_code`, `ng_code`) REFERENCES `a_servtrack_process_ng` (`process_code`, `ng_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_servtrack_work_tracking_ng`
--

/*!40000 ALTER TABLE `a_servtrack_work_tracking_ng` DISABLE KEYS */;
INSERT INTO `a_servtrack_work_tracking_ng` (`move_in`,`line_id`,`work_id`,`op`,`process_code`,`ng_code`,`cust_field_1`,`cust_field_2`,`cust_field_3`,`cust_field_4`,`cust_field_5`,`ng_quantity`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('2017-08-01 08:04:00','line01','KC170801','11','TESTStampi','04','PTest01','-1','-1','-1','-1',11,'JESSIE','2017-08-01 08:00:00','JESSIE','2017-08-01 08:00:00'),
 ('2017-08-01 08:04:00','line02','OS170801','11','TESTStampi','03','PTest03','-1','-1','-1','-1',10,'JESSIE','2017-08-01 08:00:00','JESSIE','2017-08-01 08:00:00'),
 ('2017-08-01 09:08:00','line01','KC170801','11','TESTStampi','03','PTest01','-1','-1','-1','-1',41,'JESSIE','2017-08-01 08:00:00','JESSIE','2017-08-01 08:00:00'),
 ('2017-08-01 10:08:00','line01','KC170801','11','TESTStampi','02','PTest01','-1','-1','-1','-1',53,'JESSIE','2017-08-01 08:00:00','JESSIE','2017-08-01 08:00:00'),
 ('2017-08-01 10:08:00','line01','KC170801','11','TESTStampi','03','PTest01','-1','-1','-1','-1',17,'JESSIE','2017-08-01 08:00:00','JESSIE','2017-08-01 08:00:00'),
 ('2017-08-01 10:08:00','line01','KC170801','11','TESTStampi','04','PTest01','-1','-1','-1','-1',27,'JESSIE','2017-08-01 08:00:00','JESSIE','2017-08-01 08:00:00'),
 ('2017-08-01 19:25:00','line02','OS170801','13','TestB','01','PTest03','-1','-1','-1','-1',10,'JESSIE','2017-08-01 08:00:00','JESSIE','2017-08-01 08:00:00');
/*!40000 ALTER TABLE `a_servtrack_work_tracking_ng` ENABLE KEYS */;




/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
