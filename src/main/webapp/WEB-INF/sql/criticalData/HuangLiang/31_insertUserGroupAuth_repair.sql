--
-- Dumping data for table `m_sys_user`
--

/*!40000 ALTER TABLE `m_sys_user` DISABLE KEYS */;
INSERT INTO `m_sys_user` (`user_id`,`user_pwd`,`user_name`,`user_email`,`user_phone`,`user_address`,`pwd_error_count`,`is_valid`,`is_lock`,`is_close`,`create_time`,`create_by`,`modify_time`,`modify_by`,`language`) VALUES 
 ('00121','71256bc770baff6ea06d91e8bd151d65','顏立人','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00191','b1eb6136e33d81bba8696058c42c43b7','姚宗榮','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00231','d325f96dccbcabcfdff5719e2bd74fbf','楊智超','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00281','8eae4aff9676c2d9b627f366bcea47fa','賴文斌','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00371','67e29c3e3a0904d658a8925f61773567','李家進','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00501','0f2b06147b2cddea3980d6132e7a138f','蔡鈞祐','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00551','a26cda3caed05a1a79d2518584ba55ad','簡天倫','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00581','c0799f628c0c034cb166bd6d6c22b0df','吳政穎','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00601','289e8fb055b10b3bae43bd4084a8ce13','柯文迪','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('00701','df7dd09c252b7ba295b25a99eccda9df','孫金億','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('01641','52fa28b3118354ff27eaeff9370e5e29','張植信','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw');
 /*!40000 ALTER TABLE `m_sys_user` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group`
--

/*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES 
 ('repair','維修人員',NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_user_group`
--

/*!40000 ALTER TABLE `m_sys_user_group` DISABLE KEYS */;
INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('00121','repair',NOW(),'admin',NULL,NULL),
 ('00191','repair',NOW(),'admin',NULL,NULL),
 ('00231','repair',NOW(),'admin',NULL,NULL),
 ('00281','repair',NOW(),'admin',NULL,NULL),
 ('00371','repair',NOW(),'admin',NULL,NULL),
 ('00501','repair',NOW(),'admin',NULL,NULL),
 ('00551','repair',NOW(),'admin',NULL,NULL),
 ('00581','repair',NOW(),'admin',NULL,NULL),
 ('00601','repair',NOW(),'admin',NULL,NULL),
 ('00701','repair',NOW(),'admin',NULL,NULL),
 ('01641','repair',NOW(),'admin',NULL,NULL);

--
-- Dumping data for table `m_sys_auth`
--

/*!40000 ALTER TABLE `m_sys_auth` DISABLE KEYS */;
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('repair','維修人員',0,NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group_auth`
--

/*!40000 ALTER TABLE `m_sys_group_auth` DISABLE KEYS */;
INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('repair','repair',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_group_auth` ENABLE KEYS */;
