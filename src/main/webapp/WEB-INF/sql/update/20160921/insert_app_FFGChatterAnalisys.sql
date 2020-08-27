-- FFGChatterAnalysis
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('FFGChatterAnalysis', 'i18n_ServCloud_FFGChatterAnalysis',1, 'FFG Chatter Analysis.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_chatter','FFGChatterAnalysis','i18n_ServCloud_FFGChatterAnalysis_chatter','null'),
 ('20_normal','FFGChatterAnalysis','i18n_ServCloud_FFGChatterAnalysis_normal','null');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('FFGChatterAnalysis','20140918000003',NOW(),'admin');