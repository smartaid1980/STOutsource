--
-- Dumping data for table `m_sys_user`
--

/*!40000 ALTER TABLE `m_sys_user` DISABLE KEYS */;
INSERT INTO `m_sys_user` (`user_id`,`user_pwd`,`user_name`,`user_email`,`user_phone`,`user_address`,`pwd_error_count`,`is_valid`,`is_lock`,`is_close`,`create_time`,`create_by`,`modify_time`,`modify_by`,`language`) VALUES 
--  ('lianshin','9ae1479f77b0fb12b61f225c275b4ac6','供應商-聯昕','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('11151','0f9447c0f2b0d49e7f24c4c2e6f3bda5','湘賀包裝','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('11243','e3c92f539bc17efbcc0c2e5229efa268','高鈺精密','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('11529','fcbc95ccdd551da181207c0c1400c655','聯東金屬','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('11567','8f065320a0ae71bd72bb0b981849ccff','御弘','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw'),
 ('11580','d15bd083398976892b54fcdb1d92b0fe','久大技研','','','',0,0,0,1,NOW(),'admin',NULL,NULL,'zh_tw');
/*!40000 ALTER TABLE `m_sys_user` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group`
--

/*!40000 ALTER TABLE `m_sys_group` DISABLE KEYS */;
INSERT INTO `m_sys_group` (`group_id`,`group_name`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
--  ('111333','聯昕科技',NOW(),'admin',NULL,NULL,0),
 ('11151','湘賀包裝',NOW(),'admin',NULL,NULL,0),
 ('11243','高鈺精密',NOW(),'admin',NULL,NULL,0),
 ('11529','聯東金屬',NOW(),'admin',NULL,NULL,0),
 ('11567','御弘',NOW(),'admin',NULL,NULL,0),
 ('11580','久大技研',NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_group` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_user_group`
--

/*!40000 ALTER TABLE `m_sys_user_group` DISABLE KEYS */;
INSERT INTO `m_sys_user_group` (`user_id`,`group_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
--  ('lianshin','111333',NOW(),'admin',NULL,NULL),
 ('11151','11151',NOW(),'admin',NULL,NULL),
 ('11243','11243',NOW(),'admin',NULL,NULL),
 ('11529','11529',NOW(),'admin',NULL,NULL),
 ('11567','11567',NOW(),'admin',NULL,NULL),
 ('11580','11580',NOW(),'admin',NULL,NULL);

--
-- Dumping data for table `m_sys_auth`
--

/*!40000 ALTER TABLE `m_sys_auth` DISABLE KEYS */;
INSERT INTO `m_sys_auth` (`auth_id`,`auth_name`,`is_open`,`create_time`,`create_by`,`modify_time`,`modify_by`,`is_close`) VALUES
 ('supplier_auth','供應商權限',0,NOW(),'admin',NULL,NULL,0);
/*!40000 ALTER TABLE `m_sys_auth` ENABLE KEYS */;

--
-- Dumping data for table `m_sys_group_auth`
--

/*!40000 ALTER TABLE `m_sys_group_auth` DISABLE KEYS */;
INSERT INTO `m_sys_group_auth` (`group_id`,`auth_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
--  ('111333','supplier_auth',NOW(),'admin',NULL,NULL),
 ('11151','supplier_auth',NOW(),'admin',NULL,NULL),
 ('11243','supplier_auth',NOW(),'admin',NULL,NULL),
 ('11529','supplier_auth',NOW(),'admin',NULL,NULL),
 ('11567','supplier_auth',NOW(),'admin',NULL,NULL),
 ('11580','supplier_auth',NOW(),'admin',NULL,NULL);
/*!40000 ALTER TABLE `m_sys_group_auth` ENABLE KEYS */;