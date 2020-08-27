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
INSERT INTO `a_iiot_dept` (`dept_id`,`dept_name`,`is_open`) VALUES 
 ('G1','金屬一課','Y'),
 ('G2','金屬二課','Y'),
 ('G3','金屬三課','Y');
/*!40000 ALTER TABLE `a_iiot_dept` ENABLE KEYS */;


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
INSERT INTO `a_iiot_dept_machine_gp` (`group_id`,`group_name`,`dept_id`,`dept_name`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('G1_1','G1預設群組','G1','金屬一課','Y','test','2018-10-10 10:10:10','test','2018-10-10 10:10:10'),
 ('G2_1','G2預設群組','G2','金屬二課','Y','test','2018-10-10 10:10:10','test','2018-10-10 10:10:10'),
 ('G3_1','G3預設群組','G3','金屬三課','Y','test','2018-10-10 10:10:10','test','2018-10-10 10:10:10');
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
INSERT INTO `a_iiot_machine_alarm_freq` (`alarm_type`,`duration`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('1',3,'system','2018-10-10 10:10:10','system','2018-10-10 10:10:10'),
 ('2',30,'system','2018-10-10 10:10:10','@st@STAdmin','2018-10-25 16:45:45'),
 ('3',0,'system','2018-10-10 10:10:10','system','2018-10-10 10:10:10');
/*!40000 ALTER TABLE `a_iiot_machine_alarm_freq` ENABLE KEYS */;

INSERT INTO `a_iiot_tool_erp_sync` (`tool_code`,`tool_spec`,`tool_type`,`use_life_hr`,`alarm_life_hr`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES
 ('99', '', '' ,NULL,NULL,'system','2018-10-29 08:00:00','system','2018-10-29 08:00:00');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
