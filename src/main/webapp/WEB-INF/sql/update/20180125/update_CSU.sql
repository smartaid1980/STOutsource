DELETE FROM `m_app_info` WHERE `app_id` = 'CSUWareHouseSetting';

 -- CSU WareHouse Setting
INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('CSUWareHouseSetting','倉庫設定',1,'','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_storingAreaSetting','CSUWareHouseSetting','儲區管理','none'),
 ('20_flowingStoringAreaSetting','CSUWareHouseSetting','流動式儲區管理','none'),
 ('30_printStoringBarCode','CSUWareHouseSetting','列印儲位條碼','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('CSUWareHouseSetting','20140918000002',NOW(),'admin');

 INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 -- CSU WareHouse Setting
 ('@st@sys_super_admin_auth','10_storingAreaSetting','CSUWareHouseSetting',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','20_flowingStoringAreaSetting','CSUWareHouseSetting',NOW(),'admin',NULL,NULL),
 ('@st@sys_super_admin_auth','30_printStoringBarCode','CSUWareHouseSetting',NOW(),'admin',NULL,NULL);