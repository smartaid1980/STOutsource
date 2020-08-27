-- SA 測試用
INSERT INTO `m_sys_user` (`user_id`,`user_pwd`,`user_name`,`pwd_error_count`,`is_valid`,`is_lock`,`is_close`,`create_time`,`create_by`,`modify_time`,`modify_by`,`language`) VALUES
('aa', '4124bc0a9335c27f086f24ba207a4912', '業務助理', 0, 0, 0, 1, '2019-06-19 09:49:00', 'admin', NULL, NULL, 'zh'),
('EA', '5b344ac52a0192941b46a8bf252c859c', '副總助理', 0, 0, 0, 1, '2019-02-15 04:37:51', 'admin', NULL, NULL, 'zh'),
('pc', 'bc54f4d60f1cec0f9a6cb70e13f2127a', '採購', 0, 0, 0, 1, '2019-02-15 04:36:56', 'admin', NULL, NULL, 'zh'),
('presale', '9c3e4bd513ea0196122783851989badd', '售前', 0, 0, 0, 1, '2019-03-13 11:13:47', 'admin', NULL, NULL, 'zh'),
('rd', 'eeec033a2c4d56d7ba16b69358779091', '研發', 0, 0, 0, 1, '2019-02-15 04:36:34', 'admin', NULL, NULL, 'zh'),
('rdm', '4625809eb2690f70abd21c4a9aa6b2c7', '研發主管', 0, 0, 0, 1, '2019-03-21 15:30:19', 'admin', NULL, NULL, 'zh'),
('sales', '9ed083b1436e5f40ef984b28255eef18', '業務', 0, 0, 0, 1, '2019-02-15 04:36:25', 'admin', NULL, NULL, 'zh'),
('Fin', 'd79695776a5b40f7cadbee1f91a85c82', '財務', 0, 0, 0, 1, '2019-02-15 04:37:37', 'admin', NULL, NULL, 'zh');

INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('strongled_rd','研發',NOW(),'admin',NULL,NULL,0),
 ('strongled_account','業務',NOW(),'admin',NULL,NULL,0),
 ('strongled_procurement','採購',NOW(),'admin',NULL,NULL,0),
 ('strongled_financial','財務',NOW(),'admin',NULL,NULL,0),
 ('strongled_assistant','副總助理',NOW(),'admin',NULL,NULL,0),
 ('strongled_creator','建檔',NOW(),'admin',NULL,NULL,0),
 ('strongled_account_assistant','業務助理',NOW(),'admin',NULL,NULL,0),
 ('strongled_rd_leader','研發主管',NOW(),'admin',NULL,NULL,0),
 ('strongled_presale','售前',NOW(),'admin',NULL,NULL,0);

-- SA 測試用
 INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('rd','strongled_rd',NOW(),'admin',NULL,NULL),
 ('pc','strongled_procurement',NOW(),'admin',NULL,NULL),
 ('Fin','strongled_financial',NOW(),'admin',NULL,NULL),
 ('EA','strongled_assistant',NOW(),'admin',NULL,NULL),
 ('sales','strongled_account',NOW(),'admin',NULL,NULL),
 ('presale','strongled_presale',NOW(),'admin',NULL,NULL),
 ('rdm','strongled_rd_leader',NOW(),'admin',NULL,NULL),
 ('aa','strongled_account_assistant',NOW(),'admin',NULL,NULL);

INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('strongled_rd','研發',0,NOW(),'admin',NULL,NULL,0),
 ('strongled_account','業務',0,NOW(),'admin',NULL,NULL,0),
 ('strongled_procurement','採購',0,NOW(),'admin',NULL,NULL,0),
 ('strongled_financial','財務',0,NOW(),'admin',NULL,NULL,0),
 ('strongled_assistant','副總助理',0,NOW(),'admin',NULL,NULL,0),
 ('strongled_creator','建檔',0,NOW(),'admin',NULL,NULL,0),
 ('strongled_account_assistant','業務助理',0,NOW(),'admin',NULL,NULL,0),
 ('strongled_rd_leader','研發主管',0,NOW(),'admin',NULL,NULL,0),
 ('strongled_presale','售前',0,NOW(),'admin',NULL,NULL,0);
 
INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('strongled_rd','strongled_rd',NOW(),'admin',NULL,NULL),
 ('strongled_account','strongled_account',NOW(),'admin',NULL,NULL),
 ('strongled_procurement','strongled_procurement',NOW(),'admin',NULL,NULL),
 ('strongled_financial','strongled_financial',NOW(),'admin',NULL,NULL),
 ('strongled_assistant','strongled_assistant',NOW(),'admin',NULL,NULL),
 ('strongled_creator','strongled_creator',NOW(),'admin',NULL,NULL),
 ('strongled_account_assistant','strongled_account_assistant',NOW(),'admin',NULL,NULL),
 ('strongled_rd_leader','strongled_rd_leader',NOW(),'admin',NULL,NULL),
 ('strongled_presale','strongled_presale',NOW(),'admin',NULL,NULL);