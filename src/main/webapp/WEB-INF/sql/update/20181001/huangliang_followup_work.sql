-- create table followup_work
DROP TABLE IF EXISTS `a_huangliang_followup_work`;
CREATE TABLE `a_huangliang_followup_work` (
  `followup_work_id` varchar(5) NOT NULL,
  `followup_work_name` VARCHAR(45) NOT NULL DEFAULT '',
  `create_by` VARCHAR(45) DEFAULT NULL,
  `create_time` DATETIME DEFAULT NULL,
  `modify_by` VARCHAR(45) DEFAULT NULL,
  `modify_time` DATETIME DEFAULT NULL,
  PRIMARY KEY(`followup_work_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;


-- init follow-up work value
INSERT INTO `a_huangliang_followup_work` (`followup_work_id`,`followup_work_name`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES
  ('101','大略清洗','admin',NOW(),NULL,NULL),
  ('102','磁針','admin',NOW(),NULL,NULL),
  ('103','超音波','admin',NOW(),NULL,NULL),
  ('104','震動研磨(研磨石、鋼珠)','admin',NOW(),NULL,NULL),
  ('105','二次加工','admin',NOW(),NULL,NULL),
  ('106','防銹油','admin',NOW(),NULL,NULL),
  ('107','全檢組(外觀、毛邊)','admin',NOW(),NULL,NULL),
  ('108','淬盤','admin',NOW(),NULL,NULL),
  ('109','洗淨','admin',NOW(),NULL,NULL),
  ('110','入庫','admin',NOW(),NULL,NULL)
