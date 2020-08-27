DROP TABLE IF EXISTS `a_huangliang_repair_type`;
CREATE TABLE `a_huangliang_repair_type`
(
  `repair_type_id` varchar(5) NOT NULL,
  `repair_type_name` varchar(50) NOT NULL,
  `standard_second` INTEGER UNSIGNED,
  `create_by` varchar(45) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_by` varchar(45) DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY(`repair_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `servcloud`.`a_huangliang_repair_code` MODIFY COLUMN `repair_code` VARCHAR(5) CHARACTER
SET utf8
COLLATE utf8_general_ci NOT NULL DEFAULT '',
 CHANGE COLUMN `repair_type` `repair_type_id` VARCHAR(50) CHARACTER
SET utf8
COLLATE utf8_general_ci NOT NULL DEFAULT '',
ADD CONSTRAINT `FK_a_huangliang_repair_code_1` FOREIGN KEY `FK_a_huangliang_repair_code_1`(`repair_type`)
    REFERENCES `a_huangliang_repair_type`(`repair_type_id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

DROP TABLE IF EXISTS `servcloud`.`a_huangliang_repair_code`;
CREATE TABLE  `servcloud`.`a_huangliang_repair_code` (
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


--
-- Table structure for table `a_huangliang_repair_code`
--
-- init repair code value
INSERT INTO `a_huangliang_repair_code` (`repair_code`,`repair_code_name`,`repair_type_id`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES
 ('101','切刀','101','admin',NOW(),NULL,NULL),
 ('102','切刀_刀片','101','admin',NOW(),NULL,NULL),
 ('103','修刀','101','admin',NOW(),NULL,NULL),
 ('104','修刀_刀片','101','admin',NOW(),NULL,NULL),
 ('105','前修刀','101','admin',NOW(),NULL,NULL),
 ('106','前修刀_刀片','101','admin',NOW(),NULL,NULL),
 ('107','後修刀','101','admin',NOW(),NULL,NULL),
 ('108','後修刀_刀片','102','admin',NOW(),NULL,NULL),
 ('109','插溝刀','102','admin',NOW(),NULL,NULL),
 ('110','插溝刀_刀片','102','admin',NOW(),NULL,NULL),
 ('111','外粗車','102','admin',NOW(),NULL,NULL),
 ('112','外粗車_刀片','102','admin',NOW(),NULL,NULL),
 ('113','外精車','102','admin',NOW(),NULL,NULL),
 ('114','外精車_刀片','102','admin',NOW(),NULL,NULL),
 ('115','外牙刀','103','admin',NOW(),NULL,NULL),
 ('116','外牙刀_刀片','103','admin',NOW(),NULL,NULL),
 ('117','內牙刀','103','admin',NOW(),NULL,NULL),
 ('118','內牙刀_刀片','103','admin',NOW(),NULL,NULL),
 ('119','內孔刀','103','admin',NOW(),NULL,NULL),
 ('120','內孔刀_刀片','103','admin',NOW(),NULL,NULL),
 ('121','內孔插溝刀','104','admin',NOW(),NULL,NULL),
 ('122','內孔插溝刀_刀片','104','admin',NOW(),NULL,NULL),
 ('123','前內孔刀','104','admin',NOW(),NULL,NULL),
 ('124','前內孔刀_刀片','104','admin',NOW(),NULL,NULL),
 ('125','後內孔刀','104','admin',NOW(),NULL,NULL),
 ('126','後內孔刀_刀片','105','admin',NOW(),NULL,NULL),
 ('127','粗插刀','105','admin',NOW(),NULL,NULL),
 ('128','粗插刀_刀片','105','admin',NOW(),NULL,NULL),

 ('201','鑽頭','106','admin',NOW(),NULL,NULL),
 ('202','中心鑽','106','admin',NOW(),NULL,NULL),
 ('203','螺絲功','106','admin',NOW(),NULL,NULL),
 ('204','銑刀','106','admin',NOW(),NULL,NULL),
 ('205','偏心中心鑽','106','admin',NOW(),NULL,NULL),
 ('206','偏心鑽','107','admin',NOW(),NULL,NULL),
 ('207','偏心攻牙','107','admin',NOW(),NULL,NULL),
 ('208','精銑刀','108','admin',NOW(),NULL,NULL),
 ('209','粗銑刀','109','admin',NOW(),NULL,NULL),
 ('210','側鑽','109','admin',NOW(),NULL,NULL),
 ('211','側中心鑽','109','admin',NOW(),NULL,NULL),
 ('212','球銑刀','110','admin',NOW(),NULL,NULL),
 ('213','R刀','110','admin',NOW(),NULL,NULL),
 ('214','圓鼻銑刀','111','admin',NOW(),NULL,NULL),
 ('215','圓鋸片','111','admin',NOW(),NULL,NULL),
 ('216','T型銑刀','111','admin',NOW(),NULL,NULL),
 ('217','管刀','112','admin',NOW(),NULL,NULL),
 ('218','成型鑽','112','admin',NOW(),NULL,NULL);

 INSERT INTO `a_huangliang_repair_type` (`repair_type_id`,`repair_type_name`,`standard_second`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES
  ('101','種類1','15','admin',NOW(),NULL,NULL),
  ('102','種類2','20','admin',NOW(),NULL,NULL),
  ('103','種類3','25','admin',NOW(),NULL,NULL),
  ('104','種類4','30','admin',NOW(),NULL,NULL),
  ('105','種類5','35','admin',NOW(),NULL,NULL),
  ('106','種類6','40','admin',NOW(),NULL,NULL),
  ('107','種類7','45','admin',NOW(),NULL,NULL),
  ('108','種類8','50','admin',NOW(),NULL,NULL),
  ('109','種類9','55','admin',NOW(),NULL,NULL),
  ('110','種類10','60','admin',NOW(),NULL,NULL),
  ('111','種類11','65','admin',NOW(),NULL,NULL),
  ('112','種類12','70','admin',NOW(),NULL,NULL);