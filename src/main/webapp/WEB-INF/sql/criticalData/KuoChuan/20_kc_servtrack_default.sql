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
 ('invalid_work','invalid');
/*!40000 ALTER TABLE `a_kuochuan_servtrack_product` ENABLE KEYS */;


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
 ('90060','黃政賢',300,'e1b44284fbd642dba5d62c741a6a2152','Y','default','2017-08-24 17:58:08','default','2017-08-24 17:58:08',-1),
 ('1234567','陳瑤琴',300,'810e5decf6a0443b97e146e20d2b3a48','Y','default','2017-08-24 17:58:18','default','2017-08-24 17:58:18',-1);
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
 ('INVALID_WORK','00','invalid');
/*!40000 ALTER TABLE `a_kuochuan_servtrack_work_op` ENABLE KEYS */;


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
 ('invalid','invalid','0.00','','Y','default','2017-08-24 19:05:27','default','2017-08-24 19:05:27');
/*!40000 ALTER TABLE `a_servtrack_process` ENABLE KEYS */;


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
 ('invalid_work','invalid_work','0.00','','Y','default','2017-08-24 19:05:51','default','2017-08-24 19:05:51');
/*!40000 ALTER TABLE `a_servtrack_product` ENABLE KEYS */;


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
 ('INVALID_WORK','invalid_work',0,0,0,NULL,NULL,NULL,NULL,'','default','2017-08-24 19:07:02','default','2017-08-24 19:07:02');
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
  ('INVALID_WORK','00','invalid','8d6e12d13c7742448a6bd953bfd66e77','0.0000',NULL,NULL,NULL,NULL,NULL,'','Y','default','2017-08-29 14:33:28','STAdmin','2017-08-29 14:33:28');
/*!40000 ALTER TABLE `a_servtrack_work_op` ENABLE KEYS */;




/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
