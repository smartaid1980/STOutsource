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
-- Definition of table `a_iiot_dept`
--

DROP TABLE IF EXISTS `a_iiot_dept`;
CREATE TABLE `a_iiot_dept` (
  `dept_id` varchar(20) NOT NULL,
  `dept_name` varchar(20) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  PRIMARY KEY (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_iiot_dept`
--

/*!40000 ALTER TABLE `a_iiot_dept` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_dept` ENABLE KEYS */;


--
-- Definition of table `a_iiot_dept_machine`
--

DROP TABLE IF EXISTS `a_iiot_dept_machine`;
CREATE TABLE  `a_iiot_dept_machine` (
  `machine_id` varchar(32) NOT NULL,
  `cnc_brand` varchar(50) NOT NULL,
  `dept_id` varchar(20) NOT NULL,
  `is_alarm_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  `group_id` varchar(20) NOT NULL,
  `machine_name` varchar(40) NOT NULL,
  `dept_name` varchar(20) NOT NULL,
  PRIMARY KEY (`machine_id`),
  KEY `FK_a_iiot_dept_machine_dept_id` (`dept_id`),
  KEY `FK_a_iiot_dept_machine_group_id` (`group_id`,`dept_id`),
  CONSTRAINT `FK_a_iiot_dept_machine_machine_id` FOREIGN KEY (`machine_id`) REFERENCES `m_device` (`device_id`),
  CONSTRAINT `FK_a_iiot_dept_machine_dept_id` FOREIGN KEY (`dept_id`) REFERENCES `a_iiot_dept` (`dept_id`),
  CONSTRAINT `FK_a_iiot_dept_machine_group_id` FOREIGN KEY (`group_id`) REFERENCES `a_iiot_dept_machine_gp` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_iiot_dept_machine`
--

/*!40000 ALTER TABLE `a_iiot_dept_machine` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_dept_machine` ENABLE KEYS */;


--
-- Definition of table `a_iiot_dept_machine_gp`
--

DROP TABLE IF EXISTS `a_iiot_dept_machine_gp`;
CREATE TABLE `a_iiot_dept_machine_gp` (
  `group_id` varchar(20) NOT NULL,
  `group_name` varchar(50) NOT NULL,
  `dept_id` varchar(20) NOT NULL,
  `dept_name` varchar(50) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`group_id`,`dept_id`),
  KEY `FK_a_iiot_dept_ machine_gp_dept_id` (`dept_id`),
  CONSTRAINT `FK_a_iiot_dept_ machine_gp_dept_id` FOREIGN KEY (`dept_id`) REFERENCES `a_iiot_dept` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_iiot_dept_machine_gp`
--

/*!40000 ALTER TABLE `a_iiot_dept_machine_gp` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_dept_machine_gp` ENABLE KEYS */;


--
-- Definition of table `a_iiot_machine_alarm_freq`
--

DROP TABLE IF EXISTS `a_iiot_machine_alarm_freq`;
CREATE TABLE `a_iiot_machine_alarm_freq` (
  `alarm_type` varchar(1) NOT NULL,
  `duration` int(10) unsigned NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`alarm_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_iiot_machine_alarm_freq`
--

/*!40000 ALTER TABLE `a_iiot_machine_alarm_freq` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_machine_alarm_freq` ENABLE KEYS */;


--
-- Definition of table `a_iiot_machine_alarm_log`
--

DROP TABLE IF EXISTS `a_iiot_machine_alarm_log`;
CREATE TABLE  `a_iiot_machine_alarm_log` (
  `alarm_log_id` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `alarm_start_time` datetime NOT NULL,
  `alarm_end_time` datetime DEFAULT NULL,
  `temp_alarm_end_time` datetime DEFAULT NULL,
  `machine_id` varchar(32) NOT NULL,
  `alarm_code` varchar(100) DEFAULT NULL,
  `alarm_content` varchar(300) DEFAULT NULL,
  `alarm_type` varchar(1) NOT NULL,
  `duration` varchar(10) NOT NULL,
  `is_succes` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`alarm_log_id`,`machine_id`),
  KEY `FK_a_iiot_machine_alarm_log_machine_id` (`machine_id`),
  KEY `FK_a_iiot_machine_alarm_log_alarm_type` (`alarm_type`),
  CONSTRAINT `FK_a_iiot_machine_alarm_log_machine_id` FOREIGN KEY (`machine_id`) REFERENCES `m_device` (`device_id`),
  CONSTRAINT `FK_a_iiot_machine_alarm_log_alarm_type` FOREIGN KEY (`alarm_type`) REFERENCES `a_iiot_machine_alarm_freq` (`alarm_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
--
-- Dumping data for table `a_iiot_machine_alarm_log`
--

/*!40000 ALTER TABLE `a_iiot_machine_alarm_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_machine_alarm_log` ENABLE KEYS */;


--
-- Definition of table `a_iiot_machine_tool_record`
--

DROP TABLE IF EXISTS `a_iiot_machine_tool_record`;
CREATE TABLE `a_iiot_machine_tool_record` (
  `machine_name` varchar(20) NOT NULL,
  `work_date` datetime NOT NULL,
  `nc_name` varchar(50) NOT NULL,
  `tool_no` varchar(10) NOT NULL,
  `work_start_time` datetime NOT NULL,
  `work_end_time` datetime NOT NULL,
  `cutting_time` varchar(10) NOT NULL,
  PRIMARY KEY (`machine_name`,`work_date`,`nc_name`,`tool_no`),
  KEY `FK_a_iiot_machine_tool_record_tool_no` (`nc_name`,`tool_no`),
  CONSTRAINT `FK_a_iiot_machine_tool_record_tool_no` FOREIGN KEY (`nc_name`, `tool_no`) REFERENCES `a_iiot_tool_nc_list` (`nc_name`, `tool_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_iiot_machine_tool_record`
--

/*!40000 ALTER TABLE `a_iiot_machine_tool_record` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_machine_tool_record` ENABLE KEYS */;


--
-- Definition of table `a_iiot_smart_watch`
--

DROP TABLE IF EXISTS `a_iiot_smart_watch`;
CREATE TABLE `a_iiot_smart_watch` (
  `watch_id` varchar(20) NOT NULL,
  `watch_name` varchar(50) NOT NULL,
  `auth_key` varchar(50) DEFAULT NULL,
  `dept_id` varchar(20) NOT NULL,
  `dept_name` varchar(50) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`watch_id`),
  KEY `FK_a_iiot_smart_watch_dept_id` (`dept_id`),
  CONSTRAINT `FK_a_iiot_smart_watch_dept_id` FOREIGN KEY (`dept_id`) REFERENCES `a_iiot_dept` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_iiot_smart_watch`
--

/*!40000 ALTER TABLE `a_iiot_smart_watch` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_smart_watch` ENABLE KEYS */;


--
-- Definition of table `a_iiot_system_job_log`
--

DROP TABLE IF EXISTS `a_iiot_system_job_log`;
CREATE TABLE `a_iiot_system_job_log` (
  `system_job_id` varchar(50) NOT NULL,
  `end_time` datetime NOT NULL,
  PRIMARY KEY (`system_job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_iiot_system_job_log`
--

/*!40000 ALTER TABLE `a_iiot_system_job_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_system_job_log` ENABLE KEYS */;


--
-- Definition of table `a_iiot_tool`
--

DROP TABLE IF EXISTS `a_iiot_tool`;
CREATE TABLE `a_iiot_tool` (
  `tool_id` varchar(50) NOT NULL,
  `tool_code` varchar(20) NOT NULL,
  `tool_spec` varchar(20) NOT NULL,
  `tool_type` varchar(50) NOT NULL,
  `use_life_hr` decimal(6,1) DEFAULT NULL,
  `alarm_life_hr` decimal(6,1) DEFAULT NULL,
  `work_sum` varchar(10) NOT NULL,
  `tool_status` varchar(1) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`tool_id`),
  KEY `FK_a_iiot_tool_tool_code` (`tool_code`),
  CONSTRAINT `FK_a_iiot_tool_tool_code` FOREIGN KEY (`tool_code`) REFERENCES `a_iiot_tool_erp_sync` (`tool_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_iiot_tool`
--

/*!40000 ALTER TABLE `a_iiot_tool` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_tool` ENABLE KEYS */;


--
-- Definition of table `a_iiot_tool_erp_sync`
--

DROP TABLE IF EXISTS `a_iiot_tool_erp_sync`;
CREATE TABLE `a_iiot_tool_erp_sync` (
  `tool_code` varchar(20) NOT NULL,
  `tool_spec` varchar(20) NOT NULL,
  `tool_type` varchar(50) NOT NULL,
  `use_life_hr` decimal(6,1) unsigned DEFAULT NULL,
  `alarm_life_hr` decimal(6,1) DEFAULT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`tool_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_iiot_tool_erp_sync`
--

/*!40000 ALTER TABLE `a_iiot_tool_erp_sync` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_tool_erp_sync` ENABLE KEYS */;


--
-- Definition of table `a_iiot_tool_holder`
--

DROP TABLE IF EXISTS `a_iiot_tool_holder`;
CREATE TABLE `a_iiot_tool_holder` (
  `holder_code` varchar(10) NOT NULL,
  `holder_name` varchar(20) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`holder_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_iiot_tool_holder`
--

/*!40000 ALTER TABLE `a_iiot_tool_holder` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_tool_holder` ENABLE KEYS */;


--
-- Definition of table `a_iiot_tool_holder_list`
--

DROP TABLE IF EXISTS `a_iiot_tool_holder_list`;
CREATE TABLE `a_iiot_tool_holder_list` (
  `holder_id` varchar(10) NOT NULL,
  `dept_id` varchar(20) NOT NULL,
  `holder_code` varchar(10) NOT NULL,
  `is_open` varchar(1) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`holder_id`,`dept_id`),
  KEY `FK_a_iiot_tool_holder_list_dept_id` (`dept_id`),
  KEY `FK_a_iiot_tool_holder_list_holder_code` (`holder_code`),
  CONSTRAINT `FK_a_iiot_tool_holder_list_dept_id` FOREIGN KEY (`dept_id`) REFERENCES `a_iiot_dept` (`dept_id`),
  CONSTRAINT `FK_a_iiot_tool_holder_list_holder_code` FOREIGN KEY (`holder_code`) REFERENCES `a_iiot_tool_holder` (`holder_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_iiot_tool_holder_list`
--

/*!40000 ALTER TABLE `a_iiot_tool_holder_list` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_tool_holder_list` ENABLE KEYS */;


--
-- Definition of table `a_iiot_tool_nc`
--

DROP TABLE IF EXISTS `a_iiot_tool_nc`;
CREATE TABLE `a_iiot_tool_nc` (
  `nc_name` varchar(50) NOT NULL,
  `file_create_time` datetime NOT NULL,
  `upload_by` varchar(50) NOT NULL,
  `upload_time` datetime NOT NULL,
  PRIMARY KEY (`nc_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_iiot_tool_nc`
--

/*!40000 ALTER TABLE `a_iiot_tool_nc` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_tool_nc` ENABLE KEYS */;


--
-- Definition of table `a_iiot_tool_nc_list`
--

DROP TABLE IF EXISTS `a_iiot_tool_nc_list`;
CREATE TABLE  `a_iiot_tool_nc_list` (
  `nc_name` varchar(50) NOT NULL,
  `tool_no` varchar(10) NOT NULL,
  `compensation` varchar(10) NOT NULL,
  `tool_spec` varchar(20) NOT NULL,
  `tool_type` varchar(20) NOT NULL,
  `tool_code` varchar(20) NOT NULL,
  `tool_length` varchar(20) NOT NULL,
  `holder_type` varchar(20) NOT NULL,
  PRIMARY KEY (`nc_name`,`tool_no`),
  KEY `FK_a_iiot_tool_nc_list_tool_code` (`tool_code`),
  KEY `FK_a_iiot_tool_nc_list_nc_name` (`nc_name`),
  CONSTRAINT `FK_a_iiot_tool_nc_list_nc_name` FOREIGN KEY (`nc_name`) REFERENCES `a_iiot_tool_nc` (`nc_name`),
  CONSTRAINT `FK_a_iiot_tool_nc_list_tool_code` FOREIGN KEY (`tool_code`) REFERENCES `a_iiot_tool_erp_sync` (`tool_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_iiot_tool_nc_list`
--

/*!40000 ALTER TABLE `a_iiot_tool_nc_list` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_tool_nc_list` ENABLE KEYS */;


--
-- Definition of table `a_iiot_tool_prep`
--

DROP TABLE IF EXISTS `a_iiot_tool_prep`;
CREATE TABLE `a_iiot_tool_prep` (
  `tool_prep_id` datetime NOT NULL,
  `nc_name` varchar(50) NOT NULL,
  `status` int(10) unsigned NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`tool_prep_id`),
  KEY `FK_a_iiot_tool_prep_nc_name` (`nc_name`),
  CONSTRAINT `FK_a_iiot_tool_prep_nc_name` FOREIGN KEY (`nc_name`) REFERENCES `a_iiot_tool_nc` (`nc_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_iiot_tool_prep`
--

/*!40000 ALTER TABLE `a_iiot_tool_prep` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_tool_prep` ENABLE KEYS */;


--
-- Definition of table `a_iiot_tool_prep_list`
--

DROP TABLE IF EXISTS `a_iiot_tool_prep_list`;
CREATE TABLE  `a_iiot_tool_prep_list` (
  `tool_prep_id` datetime NOT NULL,
  `nc_name` varchar(50) NOT NULL,
  `tool_no` varchar(10) NOT NULL,
  `compensation` varchar(10) NOT NULL,
  `tool_spec` varchar(20) NOT NULL,
  `tool_type` varchar(20) NOT NULL,
  `tool_code` varchar(20) NOT NULL,
  `tool_length` varchar(20) NOT NULL,
  `holder_type` varchar(20) NOT NULL,
  `dept_id` varchar(20) NOT NULL,
  `tool_id` varchar(50) DEFAULT NULL,
  `holder_id` varchar(10) DEFAULT NULL,
  `memo` varchar(100) DEFAULT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`tool_prep_id`,`nc_name`,`tool_no`),
  KEY `FK_a_iiot_tool_prep_list_nc_name` (`nc_name`),
  KEY `FK_a_iiot_tool_prep_list_tool_code` (`tool_code`),
  KEY `FK_a_iiot_tool_prep_list_tool_id` (`tool_id`),
  KEY `FK_a_iiot_tool_prep_list_dept_id_holder_id` (`holder_id`,`dept_id`),
  CONSTRAINT `FK_a_iiot_tool_prep_list_dept_id_holder_id` FOREIGN KEY (`holder_id`, `dept_id`) REFERENCES `a_iiot_tool_holder_list` (`holder_id`, `dept_id`),
  CONSTRAINT `FK_a_iiot_tool_prep_list_nc_name` FOREIGN KEY (`nc_name`) REFERENCES `a_iiot_tool_nc` (`nc_name`),
  CONSTRAINT `FK_a_iiot_tool_prep_list_tool_code` FOREIGN KEY (`tool_code`) REFERENCES `a_iiot_tool_erp_sync` (`tool_code`),
  CONSTRAINT `FK_a_iiot_tool_prep_list_tool_id` FOREIGN KEY (`tool_id`) REFERENCES `a_iiot_tool` (`tool_id`),
  CONSTRAINT `FK_a_iiot_tool_prep_list_tool_prep_id` FOREIGN KEY (`tool_prep_id`) REFERENCES `a_iiot_tool_prep` (`tool_prep_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



--
-- Dumping data for table `a_iiot_tool_prep_list`
--

/*!40000 ALTER TABLE `a_iiot_tool_prep_list` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_tool_prep_list` ENABLE KEYS */;


--
-- Definition of table `a_iiot_tool_tracking`
--

DROP TABLE IF EXISTS `a_iiot_tool_tracking`;
CREATE TABLE  `a_iiot_tool_tracking` (
  `move_in` datetime NOT NULL,
  `machine_id` varchar(20) NOT NULL,
  `nc_name` varchar(50) NOT NULL,
  `tool_prep_id` datetime NOT NULL,
  `work_barcode` varchar(50) DEFAULT NULL,
  `tool_no` varchar(10) NOT NULL,
  `tool_id` varchar(50) NOT NULL,
  `dept_id` varchar(20) NOT NULL,
  `holder_id` varchar(10) NOT NULL,
  `move_out` datetime DEFAULT NULL,
  `create_by` varchar(45) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(45) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`move_in`,`machine_id`,`nc_name`,`tool_prep_id`,`tool_no`),
  KEY `FK_a_iiot_tool_tracking_tool_id` (`tool_id`),
  KEY `FK_a_iiot_tool_tracking_holder_id` (`holder_id`),
  KEY `FK_a_iiot_tool_tracking_dept_id` (`dept_id`),
  KEY `FK_a_iiot_tool_tracking_tool_prep_id_nc_name_tool_no` (`tool_prep_id`,`nc_name`,`tool_no`),
  CONSTRAINT `FK_a_iiot_tool_tracking_tool_prep_id_nc_name_tool_no` FOREIGN KEY (`tool_prep_id`, `nc_name`, `tool_no`) REFERENCES `a_iiot_tool_prep_list` (`tool_prep_id`, `nc_name`, `tool_no`),
  CONSTRAINT `FK_a_iiot_tool_tracking_dept_id` FOREIGN KEY (`dept_id`) REFERENCES `a_iiot_dept` (`dept_id`),
  CONSTRAINT `FK_a_iiot_tool_tracking_holder_id` FOREIGN KEY (`holder_id`) REFERENCES `a_iiot_tool_holder_list` (`holder_id`),
  CONSTRAINT `FK_a_iiot_tool_tracking_tool_id` FOREIGN KEY (`tool_id`) REFERENCES `a_iiot_tool` (`tool_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Dumping data for table `a_iiot_tool_tracking`
--

/*!40000 ALTER TABLE `a_iiot_tool_tracking` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_tool_tracking` ENABLE KEYS */;


--
-- Definition of table `a_iiot_tool_tracking_chg`
--

DROP TABLE IF EXISTS `a_iiot_tool_tracking_chg`;
CREATE TABLE  `a_iiot_tool_tracking_chg` (
  `move_in` datetime NOT NULL,
  `machine_id` varchar(32) NOT NULL,
  `nc_name` varchar(50) NOT NULL,
  `tool_prep_id` datetime NOT NULL,
  `work_barcode` varchar(50) DEFAULT NULL,
  `tool_no` varchar(10) NOT NULL,
  `tool_id` varchar(50) NOT NULL,
  `dept_id` varchar(20) NOT NULL,
  `holder_id` varchar(10) NOT NULL,
  `chg_tool_id` varchar(50) NOT NULL,
  `chg_holder_id` varchar(10) NOT NULL,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `chg_dept_id` varchar(20) NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`move_in`,`machine_id`,`nc_name`,`tool_prep_id`,`tool_no`) USING BTREE,
  KEY `FK_a_iiot_tool_tracking_chg_tool_id` (`tool_id`),
  KEY `FK_a_iiot_tool_tracking_chg_holder_id` (`holder_id`),
  KEY `FK_a_iiot_tool_tracking_chg_dept_id` (`dept_id`),
  KEY `FK_a_iiot_tool_tracking_chg_tool_prep_id_nc_name_tool_no` (`tool_prep_id`,`nc_name`,`tool_no`),
  CONSTRAINT `FK_a_iiot_tool_tracking_chg_tool_prep_id_nc_name_tool_no` FOREIGN KEY (`tool_prep_id`, `nc_name`, `tool_no`) REFERENCES `a_iiot_tool_prep_list` (`tool_prep_id`, `nc_name`, `tool_no`),
  CONSTRAINT `FK_a_iiot_tool_tracking_chg_dept_id` FOREIGN KEY (`dept_id`) REFERENCES `a_iiot_dept` (`dept_id`),
  CONSTRAINT `FK_a_iiot_tool_tracking_chg_holder_id` FOREIGN KEY (`holder_id`) REFERENCES `a_iiot_tool_holder_list` (`holder_id`),
  CONSTRAINT `FK_a_iiot_tool_tracking_chg_tool_id` FOREIGN KEY (`tool_id`) REFERENCES `a_iiot_tool` (`tool_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
--
-- Dumping data for table `a_iiot_tool_tracking_chg`
--

/*!40000 ALTER TABLE `a_iiot_tool_tracking_chg` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_tool_tracking_chg` ENABLE KEYS */;


--
-- Definition of table `a_iiot_watch_push_log`
--

DROP TABLE IF EXISTS `a_iiot_watch_push_log`;
CREATE TABLE  `a_iiot_watch_push_log` (
  `alarm_push_time` datetime NOT NULL,
  `alarm_log_id` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `alarm_start_time` datetime NOT NULL,
  `alarm_end_time` datetime DEFAULT NULL,
  `machine_id` varchar(32) NOT NULL,
  `alarm_code` varchar(100) DEFAULT NULL,
  `watch_id` varchar(20) NOT NULL,
  PRIMARY KEY (`alarm_push_time`,`alarm_log_id`,`machine_id`),
  KEY `FK_a_iiot_watch_push_log_alarm_log_id` (`alarm_log_id`),
  KEY `FK_a_iiot_watch_push_log_machine_id` (`machine_id`),
  KEY `FK_a_iiot_watch_push_log_watch_id` (`watch_id`),
  CONSTRAINT `FK_a_iiot_watch_push_log_machine_id` FOREIGN KEY (`machine_id`) REFERENCES `m_device` (`device_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_a_iiot_watch_push_log_alarm_log_id` FOREIGN KEY (`alarm_log_id`) REFERENCES `a_iiot_machine_alarm_log` (`alarm_log_id`),
  CONSTRAINT `FK_a_iiot_watch_push_log_watch_id` FOREIGN KEY (`watch_id`) REFERENCES `a_iiot_smart_watch` (`watch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_iiot_watch_push_log`
--

/*!40000 ALTER TABLE `a_iiot_watch_push_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_watch_push_log` ENABLE KEYS */;

DROP TABLE IF EXISTS `a_iiot_machine_tool_merge_record`;
CREATE TABLE  `a_iiot_machine_tool_merge_record` (
  `machine_id` varchar(32) NOT NULL,
  `work_date` date NOT NULL,
  `nc_name` varchar(50) NOT NULL,
  `tool_no` varchar(10) NOT NULL,
  `work_start_time` datetime NOT NULL,
  `work_end_time` datetime NOT NULL,
  `cutting_time` varchar(30) NOT NULL,
  `holder_id` varchar(10) NOT NULL,
  `dept_id` varchar(20) NOT NULL,
  `tool_id` varchar(50) NOT NULL,
  `work_barcode` varchar(50),
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`machine_id`,`work_date`,`nc_name`,`tool_no`,`work_start_time`,`tool_id`,`dept_id`,`holder_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*!40000 ALTER TABLE `a_iiot_machine_tool_merge_record` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_machine_tool_merge_record` ENABLE KEYS */;
--
-- Definition of table `a_iiot_tool_shelf`
--
DROP TABLE IF EXISTS `a_iiot_tool_shelf`;
CREATE TABLE  `a_iiot_tool_shelf` (
  `shelf_id` varchar(10) NOT NULL,
  `layer_id` varchar(10) NOT NULL,
  `position_id` varchar(10) NOT NULL,
  `status` int(10) NOT NULL,
  `move_in` datetime,
  `move_out` datetime,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`shelf_id`,`layer_id`,`position_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
--
-- Dumping data for table `a_iiot_tool_shelf`
--

/*!40000 ALTER TABLE `a_iiot_tool_shelf` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_tool_shelf` ENABLE KEYS */;


--
-- Definition of table `a_iiot_tool_on_store`
--
DROP TABLE IF EXISTS `a_iiot_tool_on_store`;
CREATE TABLE  `a_iiot_tool_on_store` (
  `move_in` datetime NOT NULL,
  `machine_id` varchar(32) NOT NULL,
  `nc_name` varchar(50) NOT NULL,
  `shelf_id` varchar(10) NOT NULL,
  `layer_id` varchar(10) NOT NULL,
  `position_id` varchar(10) NOT NULL,
  `tool_no` varchar(10) NOT NULL,
  `mapping_time` datetime,
  `tool_prep_id` datetime,
  `tool_id` varchar(50),
  `work_barcode` varchar(50),
  `move_out` datetime,
  `move_in_by` int(10),
  `move_out_by` int(10),
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`move_in`,`shelf_id`,`layer_id`,`position_id`),
  KEY `FK_a_iiot_tool_on_store_tool_id` (`tool_id`),
  KEY `FK_a_iiot_tool_on_store_machine_id` (`machine_id`),
  KEY `FK_a_iiot_tool_on_store_nc_name` (`nc_name`),
  KEY `FK_a_iiot_tool_on_store_tool_prep_id` (`tool_prep_id`),
  KEY `FK_a_iiot_tool_on_store_shelf_id_layer_id_position_id` (`shelf_id`,`layer_id`,`position_id`),
  CONSTRAINT `FK_a_iiot_tool_on_store_tool_id` FOREIGN KEY (`tool_id`) REFERENCES `a_iiot_tool` (`tool_id`),
  CONSTRAINT `FK_a_iiot_tool_on_store_machine_id` FOREIGN KEY (`machine_id`) REFERENCES `m_device` (`device_id`),
  CONSTRAINT `FK_a_iiot_tool_on_store_nc_name` FOREIGN KEY (`nc_name`) REFERENCES `a_iiot_tool_nc` (`nc_name`),
  CONSTRAINT `FK_a_iiot_tool_on_store_tool_prep_id` FOREIGN KEY (`tool_prep_id`) REFERENCES `a_iiot_tool_prep` (`tool_prep_id`),
  CONSTRAINT `FK_a_iiot_tool_on_store_shelf_id_layer_id_position_id` FOREIGN KEY (`shelf_id`, `layer_id`, `position_id`) REFERENCES `a_iiot_tool_shelf` (`shelf_id`, `layer_id`, `position_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
--
-- Dumping data for table `a_iiot_tool_on_store`
--
/*!40000 ALTER TABLE `a_iiot_tool_on_store` DISABLE KEYS */;
/*!40000 ALTER TABLE `a_iiot_tool_on_store` ENABLE KEYS */;
--
-- Definition of table `a_iiot_tool_on_store`
--

DROP TABLE IF EXISTS `a_iiot_tool_tracking_no_tool`;
CREATE TABLE  `a_iiot_tool_tracking_no_tool` (
  `move_in` datetime NOT NULL,
  `machine_id` varchar(32) NOT NULL,
  `nc_name` varchar(50) NOT NULL,
  `tool_no` varchar(10) NOT NULL,
  `move_out` datetime,
  `create_by` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`move_in`,`machine_id`,`nc_name`,`tool_no`),
  KEY `FK_a_iiot_tool_tracking_no_tool_nc_name` (`nc_name`),
  CONSTRAINT `FK_a_iiot_tool_tracking_no_tool_nc_name` FOREIGN KEY (`nc_name`) REFERENCES `a_iiot_tool_nc` (`nc_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `a_iiot_tool_tracking_no_tool`
--

--
-- Definition of table `a_iiot_tool_shelf`
--
DROP TABLE IF EXISTS `a_iiot_tool_shelf_modify_record`;
CREATE TABLE  `a_iiot_tool_shelf_modify_record` (
  `shelf_id` varchar(10) NOT NULL,
  `layer_id` varchar(10) NOT NULL,
  `position_id` varchar(10) NOT NULL,
  `status` int(10) NOT NULL,
  `modify_by` varchar(50) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`shelf_id`,`layer_id`,`position_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
--
-- Dumping data for table `a_iiot_tool_shelf`
--

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;

DROP VIEW IF EXISTS `a_iiot_view_watch_dept_machine`;
CREATE VIEW a_iiot_view_watch_dept_machine AS
SELECT
sw.watch_id,
sw.watch_name,
sw.dept_id,
sw.is_open AS watch_is_open,
d.dept_name,
d.is_open AS dept_is_open,
dm.is_alarm_open,
dm.machine_id,
md.device_name AS machine_name

FROM a_iiot_smart_watch sw
INNER JOIN
a_iiot_dept d
on sw.dept_id = d.dept_id

INNER JOIN
a_iiot_dept_machine dm
on d.dept_id = dm.dept_id

INNER JOIN
m_device md
on dm.machine_id = md.device_id;

DROP VIEW IF EXISTS `a_iiot_view_tool_prep_list`;
CREATE VIEW a_iiot_view_tool_prep_list AS
SELECT
tpl.*,
tp.status

FROM a_iiot_tool_prep_list tpl
INNER JOIN
a_iiot_tool_prep tp
on tpl.tool_prep_id = tp.tool_prep_id;


DROP VIEW IF EXISTS `a_iiot_view_machine`;
CREATE VIEW a_iiot_view_machine AS
SELECT
md.modify_time,
md.device_name AS machine_name,
md.device_id AS machine_id

FROM m_device md;

DROP VIEW IF EXISTS `a_iiot_view_tool_prep_modify_time`;
CREATE VIEW a_iiot_view_tool_prep_modify_time AS
SELECT
tpl.tool_prep_id,
tpl.nc_name,
tpl.create_time,
max(tpl.modify_time) AS modify_time,
tp.status
FROM a_iiot_tool_prep_list tpl
INNER JOIN
a_iiot_tool_prep tp
on tpl.tool_prep_id = tp.tool_prep_id
group by tpl.tool_prep_id;

DROP VIEW IF EXISTS `a_iiot_view_tool_shelf_tool_on_store`;
CREATE VIEW a_iiot_view_tool_shelf_tool_on_store AS
SELECT
tos.*,
ts.status,
ts.move_in as tool_shelf_move_in,
ts.move_out as tool_shelf_move_out
FROM a_iiot_tool_shelf as ts
LEFT JOIN a_iiot_tool_on_store as tos
on ts.shelf_id = tos.shelf_id
and ts.layer_id = tos.layer_id
and ts.position_id = tos.position_id
and ts.move_in = tos.move_in;

DROP VIEW IF EXISTS `a_iiot_view_tool_on_store_tool_shelf`;
CREATE VIEW a_iiot_view_tool_on_store_tool_shelf AS
SELECT
tos.*,
ts.status,
ts.move_in as tool_shelf_move_in,
ts.move_out as tool_shelf_move_out
FROM a_iiot_tool_on_store as tos
LEFT JOIN a_iiot_tool_shelf as ts
on ts.shelf_id = tos.shelf_id
and ts.layer_id = tos.layer_id
and ts.position_id = tos.position_id
and ts.move_in = tos.move_in;

DROP VIEW IF EXISTS `a_iiot_view_tool_shelf_tool_on_store_modify_record`;
CREATE VIEW a_iiot_view_tool_shelf_tool_on_store_modify_record AS
SELECT
tos.*,
ts.status,
ts.move_in as tool_shelf_move_in,
ts.move_out as tool_shelf_move_out,
tsmr.status as modify_status,
tsmr.modify_by as record_modify_by,
tsmr.modify_time as record_modify_time
FROM a_iiot_tool_shelf as ts
LEFT JOIN a_iiot_tool_on_store as tos
on ts.shelf_id = tos.shelf_id
and ts.layer_id = tos.layer_id
and ts.position_id = tos.position_id
and ts.move_in = tos.move_in
LEFT JOIN a_iiot_tool_shelf_modify_record as tsmr
on tsmr.shelf_id = tos.shelf_id
and tsmr.layer_id = tos.layer_id

and tsmr.position_id = tos.position_id;

DROP TABLE IF EXISTS `a_iiot_tool_analysis`;
CREATE TABLE  `a_iiot_tool_analysis` (
  `tool_id` varchar(50) NOT NULL DEFAULT '',
  `tool_analysis` varchar(10) NOT NULL DEFAULT '0',
  `create_by` varchar(50) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(50) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`tool_id`),
  CONSTRAINT `FK_a_iiot_tool_analysis_tool_id` FOREIGN KEY (`tool_id`) REFERENCES `a_iiot_tool` (`tool_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `servcloud`.`a_iiot_ai_idle_update_list`;
CREATE TABLE  `servcloud`.`a_iiot_ai_idle_update_list` (
  `machine_id` varchar(50) NOT NULL DEFAULT '',
  `start_time` varchar(20) NOT NULL DEFAULT '',
  `end_time` varchar(20) NOT NULL DEFAULT '',
  `invalid_macro` varchar(5) NOT NULL DEFAULT '',
  `create_by` varchar(45) NOT NULL DEFAULT '',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `modify_by` varchar(45) NOT NULL DEFAULT '',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`machine_id`,`start_time`,`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP VIEW IF EXISTS `a_iiot_view_tool_analysis`;
CREATE VIEW a_iiot_view_tool_analysis AS
SELECT
ta.tool_analysis,
t.*
FROM a_iiot_tool as t
LEFT JOIN a_iiot_tool_analysis as ta
on t.tool_id = ta.tool_id;