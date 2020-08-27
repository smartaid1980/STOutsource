 INSERT INTO `m_app_info` (`app_id`,`app_name`,`app_type`,`description`,`version`,`create_time`,`create_by`,`update_time`,`update_by`) VALUES
 ('ServPad','i18n_ServCloud_ServPad',1,'ServPad.','1.0',NOW(),'admin',NULL,NULL);
INSERT INTO `m_sys_func` (`func_id`,`app_id`,`func_name`,`hash`) VALUES
 ('10_product_yield_rate','ServPad','i18n_ServCloud_10_Product_Yield_Rate','none'),
 ('20_quality_of_dispatch_list_by_product','ServPad','i18n_ServCloud_20_Quality_Of_Dispatch_List_By_Product','none'),
 ('30_quality_by_dispatch_list','ServPad','i18n_ServCloud_30_Quality_By_Dispatch_List','none'),
 ('40_oee_by_production_line','ServPad','i18n_ServCloud_40_Oee_By_Production_Line','none'),
 ('50_efficiency_of_dispatch_list_by_production_line','ServPad','i18n_ServCloud_50_Efficiency_Of_Dispatch_List_By_Production_Line','none'),
 ('60_operating_performance','ServPad','i18n_ServCloud_60_Operating_Performance','none');
INSERT INTO `m_app_class_tag` (`app_id`,`tag_id`,`create_time`,`create_by`) VALUES
 ('ServPad','20140918000002',NOW(),'admin');

INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('sys_super_admin_auth','10_product_yield_rate','ServPad',NOW(),NULL,NULL,NULL),
 ('sys_super_admin_auth','20_quality_of_dispatch_list_by_product','ServPad',NOW(),NULL,NULL,NULL),
 ('sys_super_admin_auth','30_quality_by_dispatch_list','ServPad',NOW(),NULL,NULL,NULL),
 ('sys_super_admin_auth','40_oee_by_production_line','ServPad',NOW(),NULL,NULL,NULL),
 ('sys_super_admin_auth','50_efficiency_of_dispatch_list_by_production_line','ServPad',NOW(),NULL,NULL,NULL),
 ('sys_super_admin_auth','60_operating_performance','ServPad',NOW(),NULL,NULL,NULL);