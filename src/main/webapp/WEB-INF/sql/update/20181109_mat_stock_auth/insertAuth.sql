-- 材料庫權限
-- 系統管理員(MIS)
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 --HuangLiangMaterialTempStock
 ('sys_manager_auth','10_pending_iqc','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','20_pending_stock','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','30_pending_return','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','40_return_record','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','50_stock_record','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('sys_manager_auth','60_material_stock','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL);

-- 廠務
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
--HuangLiangMaterialTempStock
('material_stock_factory_service','10_pending_iqc','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
('material_stock_factory_service','20_pending_stock','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
('material_stock_factory_service','30_pending_return','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
('material_stock_factory_service','40_return_record','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
('material_stock_factory_service','60_material_stock','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL);

-- 品管
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
--HuangLiangMaterialTempStock
('material_stock_quality_control','10_pending_iqc','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
('material_stock_quality_control','30_pending_return','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
('material_stock_quality_control','40_return_record','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL);

-- 生管
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 --HuangLiangMaterialTempStock
 ('material_stock_production_management','10_pending_iqc','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('material_stock_production_management','20_pending_stock','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('material_stock_production_management','30_pending_return','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('material_stock_production_management','40_return_record','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('material_stock_production_management','50_stock_record','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('material_stock_production_management','60_material_stock','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL);

 -- 品管主管
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 --HuangLiangMaterialTempStock
 ('material_stock_quality_control_manager','10_pending_iqc','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL);

 -- 高階主管
INSERT INTO `m_sys_auth_func` (`auth_id`,`func_id`,`app_id`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 --HuangLiangMaterialTempStock
 ('top_manager','10_pending_iqc','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('top_manager','20_pending_stock','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('top_manager','30_pending_return','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('top_manager','40_return_record','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('top_manager','50_stock_record','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL),
 ('top_manager','60_material_stock','HuangLiangMaterialTempStock',NOW(),'admin',NULL,NULL);