-- init motor status value
INSERT INTO `m_motor_status` (`motor_status_id`,`name`,`description`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES
 ('0','復位中',NULL,'admin',NOW(),NULL,NULL),
 ('1','停止中',NULL,'admin',NOW(),NULL,NULL),
 ('2','減速中',NULL,'admin',NOW(),NULL,NULL),
 ('3','恒速中',NULL,'admin',NOW(),NULL,NULL),
 ('4','加速中',NULL,'admin',NOW(),NULL,NULL),
 ('5','頻率為0時運行',NULL,'admin',NOW(),NULL,NULL),
 ('6','啟動中',NULL,'admin',NOW(),NULL,NULL),
 ('7','DB中',NULL,'admin',NOW(),NULL,NULL),
 ('8','過載限制中',NULL,'admin',NOW(),NULL,NULL);