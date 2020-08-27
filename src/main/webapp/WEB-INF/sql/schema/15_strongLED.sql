DROP TABLE IF EXISTS `a_strongled_demand_list`;
DROP TABLE IF EXISTS `a_strongled_demand_list`;
CREATE TABLE `a_strongled_demand_list` (
  `form_id` VARCHAR(40) NOT NULL COMMENT '需求單號',
  `product_id` VARCHAR(40) COMMENT '品號',
  `product_name` VARCHAR(120) COMMENT '品名',
  `seq_no` VARCHAR(11) COMMENT '序號',
  `cus_id` VARCHAR(10) COMMENT '客戶代碼',
  `form_type` VARCHAR(1) NOT NULL COMMENT '單據類型',
  `po_qty` NUMERIC(16,3) COMMENT '採購數量',
  `st_lead_time` DATE COMMENT '預交日(平台)',
  `st_po_time` DATE COMMENT '預計下單日',
  `description` VARCHAR(200) COMMENT '說明',
  `po_check` VARCHAR(1) COMMENT '是否已確認交期',
  `status` INT(2) NOT NULL COMMENT '詢價單狀態',
  `quote_status` INT(2) NOT NULL COMMENT '報價狀態',
  `mtl_cost` DECIMAL(10,4) COMMENT '材料成本',
  `produce_coef` DECIMAL(10,4) COMMENT '出廠利潤係數',
  `market_coef` DECIMAL(10,4) COMMENT '市場利潤係數',
  `quote` DECIMAL(10,4) COMMENT '報價',
  `close_time` DATETIME COMMENT '結案時間',
  `has_bom_list` BOOLEAN COMMENT '是否已展開物料',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  `modify_by` VARCHAR(50) COMMENT '最後修改者',
  `modify_time` DATETIME COMMENT '最後修改時間',
  PRIMARY KEY (`form_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='詢價單';

DROP TABLE IF EXISTS `a_strongled_inquiry_content`;
CREATE TABLE `a_strongled_inquiry_content` (
  `form_id` VARCHAR(20) COMMENT '詢價單編號',
  `series` VARCHAR(20) COMMENT '燈具系列',
  `model_number` VARCHAR(20) COMMENT '燈具型號',
  `lamp_length` VARCHAR(20) COMMENT '燈具長度',
  `lamp_bead_number` INT(5) COMMENT 'LED燈珠數',
  `lamp_type` INT(2) COMMENT '燈具類型',
  `composition` VARCHAR(20) COMMENT '組成方式',
  `composition_coef` VARCHAR(20) COMMENT '組成係數',
  `lamp_beads_composition` VARCHAR(20) COMMENT '燈珠組成',
  `light_brand` VARCHAR(150) COMMENT '品牌',
  `color_temperature` VARCHAR(20) COMMENT '色温值',
  `watt` VARCHAR(20) COMMENT '燈具功率',
  `control_way` VARCHAR(20) COMMENT '控制方式',
  `segmentation` VARCHAR(20) COMMENT '分段方式',
  `work_voltage` VARCHAR(20) COMMENT '工作電壓',
  `angle_claim` VARCHAR(20) COMMENT '發光角度',
  `lamp_color` VARCHAR(20) COMMENT '燈具外觀顏色',
  `power_cable_length` VARCHAR(20) COMMENT '電源線出線長度',
  `is_power_cable_waterproof` VARCHAR(1) COMMENT '電源線是否帶防水接頭',
  `signal_line_length` VARCHAR(20) COMMENT '信號線出線長度',
  `is_signal_line_waterproof` VARCHAR(1) COMMENT '信號線是否帶防水接頭',
  `is_merge_power_and_signal` VARCHAR(1) COMMENT '電源線與信號線是否合併',
  `power_cable_inout` VARCHAR(20) COMMENT '電源線進出線方式',
  `signal_line_inout` VARCHAR(20) COMMENT '信號線進出線方式',
  `concatenation` VARCHAR(20) COMMENT '燈具串接數量',
  `connection_cable_length` VARCHAR(20) COMMENT '連接線長度',
  `support` VARCHAR(20) COMMENT '支架選擇',
  `protect_class` VARCHAR(20) COMMENT '防護等級(IP)',
  `line_color` VARCHAR(20) COMMENT '纜線顏色',
  `glass_color` VARCHAR(20) COMMENT '玻璃外觀顏色',
  `light_barrier` VARCHAR(1) COMMENT '擋光板',
  `fall_prevention` VARCHAR(1) COMMENT '防墜落',
  `label` VARCHAR(100) COMMENT '通用標籤',
  `model` VARCHAR(20) COMMENT 'Model(編號)',
  `voltage` VARCHAR(20) COMMENT 'Voltage(電壓)',
  `power` VARCHAR(20) COMMENT 'Power(功率)',
  `ip` VARCHAR(20) COMMENT 'IP(防護等級)',
  `color` VARCHAR(20) COMMENT 'Color(色溫)',
  `angle` VARCHAR(20) COMMENT 'Angle(角度)',
  `is_support_ship` VARCHAR(1) COMMENT '支架是否安裝出貨',
  `is_pack_sample` VARCHAR(1) COMMENT '是否需有封樣樣品',
  `is_inst_manual` VARCHAR(1) COMMENT '是否需要安裝說明書',
  `is_pd_manual` VARCHAR(1) COMMENT '是否需要產品說明書',
  `is_pack_neutral` VARCHAR(1) COMMENT '包裝是否中性',
  `is_lamp_neutral` VARCHAR(1) COMMENT '燈具是否中性',
  `is_fall_prev` VARCHAR(1) COMMENT '是否要防墜落裝置',
  `is_plug_switch` VARCHAR(1) COMMENT '是否要國外規格插頭',
  `is_emc` VARCHAR(1) COMMENT '是否要過EMC',
  `other_claim` VARCHAR(100) COMMENT '其它要求內容',
  `is_quote` VARCHAR(1) COMMENT '是否已報價',
  `bom_file_path` VARCHAR(100) COMMENT '成本檔案路徑',
  `bom_file_name` VARCHAR(100) COMMENT '成本檔案名稱',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  `modify_by` VARCHAR(50) COMMENT '最後修改者',
  `modify_time` DATETIME COMMENT '最後修改時間',
  PRIMARY KEY(`form_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_material_list`;
CREATE TABLE `a_strongled_material_list` (
  `mtl_id` VARCHAR(50) NOT NULL COMMENT '物料編號',
  `mtl_name` VARCHAR(50) NOT NULL COMMENT '物料名稱（品名）',
  `mtl_type` VARCHAR(20) COMMENT '物料類型',
  `spec` VARCHAR(200) NOT NULL COMMENT '規格說明',
  `unit` VARCHAR(5) NOT NULL COMMENT '單位',
  `remark` VARCHAR(50) COMMENT '備註',
  `process` VARCHAR(50) COMMENT '工藝',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  `modify_by` VARCHAR(50) COMMENT '最後修改者',
  `modify_time` DATETIME COMMENT '最後修改時間',
  PRIMARY KEY(`mtl_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_rfq_material`;
CREATE TABLE `a_strongled_rfq_material` (
  `form_id` VARCHAR(20) NOT NULL COMMENT '詢價單編號',
  `mtl_id` VARCHAR(50) NOT NULL COMMENT '物料編號',
  `structure_id` VARCHAR(50) NOT NULL COMMENT '結構編號',  
  `std_qty` DECIMAL(10,4) NOT NULL COMMENT '標準用量',
  `taxed_price` DECIMAL(10,4) COMMENT '含稅單價',
  `erp_info` LONGTEXT NOT NULL COMMENT 'ERP介接資訊',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  `modify_by` VARCHAR(50) COMMENT '最後修改者',
  `modify_time` DATETIME COMMENT '最後修改時間',
  PRIMARY KEY(`mtl_id`, `form_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_quotation_log`;
CREATE TABLE `a_strongled_quotation_log` (
  `form_id` VARCHAR(20) NOT NULL COMMENT '詢價單編號',
  `quote` DECIMAL(10,4) NOT NULL COMMENT '報價',
  `remark` VARCHAR(50) NOT NULL COMMENT '備註',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  PRIMARY KEY(`create_time`, `form_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_request_discount_log`;
CREATE TABLE `a_strongled_request_discount_log` (
  `form_id` VARCHAR(20) NOT NULL COMMENT '詢價單編號',
  `reason` VARCHAR(50) NOT NULL COMMENT '請求原因',
  `quote` DECIMAL(10,4) NOT NULL COMMENT '報價',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  PRIMARY KEY(`create_time`, `form_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_print_quotation_log`;
CREATE TABLE `a_strongled_print_quotation_log` (
  `form_id` VARCHAR(20) NOT NULL COMMENT '詢價單編號',
  `quote` DECIMAL(10,4) NOT NULL COMMENT '報價',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  PRIMARY KEY(`form_id`, `create_time`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_rfq_columns`;
CREATE TABLE `a_strongled_rfq_columns` (
  `series` VARCHAR(20) NOT NULL COMMENT '燈具系列',
  `model` VARCHAR(20) NOT NULL COMMENT '燈具型號',
  `content` LONGTEXT NOT NULL COMMENT '欄位內容',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  `modify_by` VARCHAR(50) COMMENT '最後修改者',
  `modify_time` DATETIME COMMENT '最後修改時間',
  PRIMARY KEY(`model`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_rfq_status_log`;
CREATE TABLE `a_strongled_rfq_status_log` (
  `form_id` VARCHAR(20) NOT NULL COMMENT '詢價單編號',
  `changed_status` INT(2) COMMENT '更改後狀態',
  `previous_status` INT(2) COMMENT '更改前狀態',
  `changed_quote_status` INT(2) COMMENT '更改後報價狀態',
  `previous_quote_status` INT(2) COMMENT '更改前報價狀態',
  `deleted_data` LONGTEXT COMMENT '刪除的資料',
  `reason` VARCHAR(100) COMMENT '原因',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  PRIMARY KEY(`form_id`, `create_time`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_rfq_changed_log`;
CREATE TABLE `a_strongled_rfq_changed_log` (
  `form_id` VARCHAR(20) NOT NULL COMMENT '詢價單編號',
  `previous_data` LONGTEXT COMMENT '更改前資料',
  `reason` VARCHAR(100) COMMENT '修改原因',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  PRIMARY KEY(`form_id`, `create_time`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_material_module`;
CREATE TABLE `a_strongled_material_module` (
  `module_id` VARCHAR(20) NOT NULL COMMENT '模組編號',
  `mtl_id` VARCHAR(50) NOT NULL COMMENT '物料編號',
  `std_qty` DECIMAL(10,4) NOT NULL COMMENT '標準用量',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  `modify_by` VARCHAR(50) COMMENT '最後修改者',
  `modify_time` DATETIME COMMENT '最後修改時間',
  PRIMARY KEY(`module_id`, `mtl_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_material_module_rule`;
CREATE TABLE `a_strongled_material_module_rule` (
  `model_number` VARCHAR(20) NOT NULL COMMENT '燈具型號',
  `rule` LONGTEXT NOT NULL COMMENT '規則',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  `modify_by` VARCHAR(50) COMMENT '最後修改者',
  `modify_time` DATETIME COMMENT '最後修改時間',
  PRIMARY KEY(`model_number`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_project`;
CREATE TABLE `a_strongled_project` (
  `project_id` VARCHAR(20) NOT NULL COMMENT '項目編號',
  `project_name` VARCHAR(50) NOT NULL COMMENT '項目名稱',
  `cus_id` VARCHAR(10) NOT NULL COMMENT '客戶代碼',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  `modify_by` VARCHAR(50) COMMENT '最後修改者',
  `modify_time` DATETIME COMMENT '最後修改時間',
  PRIMARY KEY(`project_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_project_owner`;
CREATE TABLE `a_strongled_project_owner` (
  `project_id` VARCHAR(20) NOT NULL COMMENT '項目編號',
  `user_id` varchar(50) NOT NULL COMMENT '負責人',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  `modify_by` VARCHAR(50) COMMENT '最後修改者',
  `modify_time` DATETIME COMMENT '最後修改時間',
  PRIMARY KEY(`project_id`, `user_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_project_rfq`;
CREATE TABLE `a_strongled_project_rfq` (
  `project_id` VARCHAR(20) NOT NULL COMMENT '項目編號',
  `form_id` varchar(20) NOT NULL COMMENT '詢價單編號',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  `modify_by` VARCHAR(50) COMMENT '最後修改者',
  `modify_time` DATETIME COMMENT '最後修改時間',
  PRIMARY KEY(`project_id`, `form_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_product_structure`;
CREATE TABLE `a_strongled_product_structure` (
  `structure_id` VARCHAR(50) NOT NULL COMMENT '結構編號',
  `structure_name` VARCHAR(50) NOT NULL COMMENT '結構名稱(品名)',
  `structure_path` varchar(20) NOT NULL COMMENT '結構關係',
  `remark` varchar(50) COMMENT '說明',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  `modify_by` VARCHAR(50) COMMENT '最後修改者',
  `modify_time` DATETIME COMMENT '最後修改時間',
  PRIMARY KEY(`structure_id`),
  INDEX `idx_structure_path` (`structure_path` ASC)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_ps_mtl`;
CREATE TABLE `a_strongled_ps_mtl` (
  `structure_id` VARCHAR(50) NOT NULL COMMENT '結構編號',
  `mtl_id` VARCHAR(50) NOT NULL COMMENT '物料編號',
  `remark` varchar(50) COMMENT '說明',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  `modify_by` VARCHAR(50) COMMENT '最後修改者',
  `modify_time` DATETIME COMMENT '最後修改時間',
  PRIMARY KEY(`structure_id`, `mtl_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_rfq_material_edit_log`;
CREATE TABLE `a_strongled_rfq_material_edit_log` (
  `form_id` VARCHAR(20) NOT NULL COMMENT '詢價單編號',
  `mtl_id` VARCHAR(50) NOT NULL COMMENT '物料編號',
  `revise_type` INT(2) NOT NULL COMMENT '修改類型',
  `data_before_revised` LONGTEXT COMMENT '修改前資料',
  `create_by_role` varchar(20) NOT NULL COMMENT '角色',
  `create_by` VARCHAR(50) NOT NULL COMMENT '建立者',
  `create_time` DATETIME NOT NULL COMMENT '建立時間',
  PRIMARY KEY(`form_id`, `mtl_id`, `create_time`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

CREATE VIEW a_strongled_view_material_structure AS
SELECT pm.mtl_id, pm.structure_id, ps.structure_name, ps.structure_path, ml.mtl_name, ml.spec, ml.`process`, ml.unit, ml.remark
FROM a_strongled_ps_mtl pm 
JOIN a_strongled_product_structure ps ON pm.structure_id=ps.structure_id 
JOIN a_strongled_material_list ml ON pm.mtl_id=ml.mtl_id;

CREATE VIEW a_strongled_view_rfq_material_structure AS
SELECT rm.form_id, rm.std_qty, rm.taxed_price, rm.erp_info, ms.*
FROM a_strongled_rfq_material rm 
JOIN a_strongled_view_material_structure ms ON rm.structure_id=ms.structure_id AND rm.mtl_id=ms.mtl_id;

CREATE VIEW a_strongled_view_rfq_list AS
SELECT 
  `d`.`form_id`,
  `d`.`product_id`,
  `d`.`product_name`,
  `d`.`seq_no`,
  `d`.`cus_id`,
  `d`.`form_type`,
  `d`.`po_qty`,
  `d`.`st_lead_time`,
  `d`.`st_po_time`,
  `d`.`description`,
  `d`.`po_check`,
  `d`.`status`,
  `d`.`quote_status`,
  `d`.`mtl_cost`,
  `d`.`produce_coef`,
  `d`.`market_coef`,
  `d`.`quote`,
  `d`.`close_time`,
  `d`.`has_bom_list`,
  `d`.`create_by`,
  `d`.`create_time`,
  `d`.`modify_by`,
  `d`.`modify_time`,
  `i`.`series`,
  `i`.`model_number`,
  `i`.`lamp_length`,
  `i`.`lamp_bead_number`,
  `i`.`lamp_type`,
  `i`.`composition`,
  `i`.`composition_coef`,
  `i`.`lamp_beads_composition`,
  `i`.`light_brand`,
  `i`.`color_temperature`,
  `i`.`watt`,
  `i`.`control_way`,
  `i`.`segmentation`,
  `i`.`work_voltage`,
  `i`.`angle_claim`,
  `i`.`lamp_color`,
  `i`.`power_cable_length`,
  `i`.`is_power_cable_waterproof`,
  `i`.`signal_line_length`,
  `i`.`is_signal_line_waterproof`,
  `i`.`is_merge_power_and_signal`,
  `i`.`power_cable_inout`,
  `i`.`signal_line_inout`,
  `i`.`concatenation`,
  `i`.`connection_cable_length`,
  `i`.`support`,
  `i`.`protect_class`,
  `i`.`line_color`,
  `i`.`glass_color`,
  `i`.`light_barrier`,
  `i`.`fall_prevention`,
  `i`.`label`,
  `i`.`model`,
  `i`.`voltage`,
  `i`.`power`,
  `i`.`ip`,
  `i`.`color`,
  `i`.`angle`,
  `i`.`is_support_ship`,
  `i`.`is_pack_sample`,
  `i`.`is_inst_manual`,
  `i`.`is_pd_manual`,
  `i`.`is_pack_neutral`,
  `i`.`is_lamp_neutral`,
  `i`.`is_fall_prev`,
  `i`.`is_plug_switch`,
  `i`.`is_emc`,
  `i`.`other_claim`,
  `i`.`is_quote`,
  `i`.`bom_file_path`,
  `i`.`bom_file_name`,
  `p`.`project_id`
FROM a_strongled_demand_list AS d 
JOIN a_strongled_inquiry_content AS i 
ON d.form_id=i.form_id 
LEFT JOIN a_strongled_project_rfq AS p 
ON d.form_id=p.form_id;

-- CREATE VIEW a_strongled_view_rfq_material_structure AS
-- SELECT rm.*, ps.structure_name, ps.structure_path 
-- FROM a_strongled_rfq_material rm 
-- JOIN a_strongled_product_structure ps ON rm.structure_id=ps.structure_id;


-- CREATE VIEW a_strongled_view_rfq_mtl_structure AS 
-- SELECT rm.*, ml.mtl_name, ml.unit, ml.spec, ml.remark, ml.`process`, psm.structure_id, psm.structure_rel, ps.structure_name 
-- FROM a_strongled_rfq_material rm 
-- JOIN a_strongled_material_list ml 
-- ON rm.mtl_id=ml.mtl_id JOIN a_strongled_ps_mtl psm 
-- ON ml.mtl_id=psm.mtl_id JOIN a_strongled_product_structure ps 
-- ON psm.structure_id=ps.structure_id;

-- CREATE 
--     ALGORITHM = UNDEFINED 
--     DEFINER = `root`@`localhost` 
--     SQL SECURITY DEFINER
-- VIEW `a_strongled_view_rfq_material_recent_modify_time` AS
--     SELECT 
--         `a_strongled_rfq_material_edit_log`.`form_id` AS `form_id`,
--         `a_strongled_rfq_material_edit_log`.`mtl_id` AS `mtl_id`,
--         MAX(`a_strongled_rfq_material_edit_log`.`create_time`) AS `recent_create_time`
--     FROM
--         `a_strongled_rfq_material_edit_log`
--     GROUP BY `a_strongled_rfq_material_edit_log`.`mtl_id`;

-- CREATE 
--     ALGORITHM = UNDEFINED 
--     DEFINER = `root`@`localhost` 
--     SQL SECURITY DEFINER
-- VIEW `a_strongled_view_rfq_material_recent_log` AS
--     SELECT 
--         `gplog`.`form_id` AS `form_id`,
--         `gplog`.`mtl_id` AS `mtl_id`,
--         `gplog`.`recent_create_time` AS `recent_create_time`,
--         `l`.`data_before_revised` AS `data_before_revised`,
--         `l`.`revise_type` AS `revise_type`,
--         `l`.`create_by` AS `create_by`,
--         `l`.`create_by_role` AS `create_by_role`
--     FROM
--         (`a_strongled_view_rfq_material_recent_modify_time` `gplog`
--         LEFT JOIN `a_strongled_rfq_material_edit_log` `l` ON (((`gplog`.`form_id` = `l`.`form_id`)
--             AND (`gplog`.`mtl_id` = `l`.`mtl_id`)
--             AND (`gplog`.`recent_create_time` = `l`.`create_time`))));

-- CREATE 
--     ALGORITHM = UNDEFINED 
--     DEFINER = `root`@`localhost` 
--     SQL SECURITY DEFINER
-- VIEW `a_strongled_view_rfq_material_structue_log` AS
--     SELECT 
--         `rm`.`form_id` AS `form_id`,
--         `rm`.`mtl_id` AS `mtl_id`,
--         `rm`.`std_qty` AS `std_qty`,
--         `rm`.`taxed_price` AS `taxed_price`,
--         `rm`.`erp_info` AS `erp_info`,
--         `rm`.`create_by` AS `create_by`,
--         `rm`.`create_time` AS `create_time`,
--         `rm`.`modify_by` AS `modify_by`,
--         `rm`.`modify_time` AS `modify_time`,
--         `log`.`data_before_revised` AS `data_before_revised`,
--         `ml`.`mtl_name` AS `mtl_name`,
--         `ml`.`unit` AS `unit`,
--         `ml`.`spec` AS `spec`,
--         `ml`.`remark` AS `remark`,
--         `ml`.`process` AS `process`,
--         `psm`.`structure_id` AS `structure_id`,
--         `psm`.`structure_rel` AS `structure_rel`,
--         `ps`.`structure_name` AS `structure_name`
--     FROM
--         ((((`a_strongled_rfq_material` `rm`
--         LEFT JOIN `a_strongled_view_rfq_material_recent_log` `log` ON (((`rm`.`mtl_id` = `log`.`mtl_id`)
--             AND (`rm`.`form_id` = `log`.`form_id`))))
--         LEFT JOIN `a_strongled_material_list` `ml` ON ((`log`.`mtl_id` = `ml`.`mtl_id`)))
--         LEFT JOIN `a_strongled_ps_mtl` `psm` ON ((`ml`.`mtl_id` = `psm`.`mtl_id`)))
--         LEFT JOIN `a_strongled_product_structure` `ps` ON ((`psm`.`structure_id` = `ps`.`structure_id`)));


-- CREATE VIEW a_strongled_view_rfq_material_recent_log AS 
-- SELECT rm.*, log.*, ml.mtl_name, ml.unit, ml.spec, ml.remark, ml.`process`, psm.structure_id, psm.structure_rel, ps.structure_name 
-- FROM a_strongled_rfq_material rm
-- LEFT JOIN (SELECT gpLog.*, l.data_before_revised, l.revise_type, l.create_by, l.create_by_role FROM (SELECT form_id, mtl_id, max(create_time) recent_create_time FROM a_strongled_rfq_material_edit_log group by mtl_id) gpLog 
-- LEFT JOIN a_strongled_rfq_material_edit_log l ON gpLog.form_id=l.form_id AND gpLog.mtl_id=l.mtl_id AND gpLog.recent_create_time=l.create_time) log
-- ON rm.mtl_id=log.mtl_id AND rm.form_id=log.form_id
-- JOIN a_strongled_material_list ml 
-- ON rm.mtl_id=ml.mtl_id JOIN a_strongled_ps_mtl psm 
-- ON ml.mtl_id=psm.mtl_id JOIN a_strongled_product_structure ps 
-- ON psm.structure_id=ps.structure_id;

DROP VIEW IF EXISTS `servcloud`.`a_servtrack_view_nomoveout`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW  `servcloud`.`a_servtrack_view_nomoveout` AS select `a`.`move_in` AS `move_in`,`a`.`line_id` AS `line_id`,`a`.`work_id` AS `work_id`,`a`.`op` AS `op`,`a`.`cust_field_1` AS `cust_field_1`,`a`.`cust_field_2` AS `cust_field_2`,`a`.`cust_field_3` AS `cust_field_3`,`a`.`cust_field_4` AS `cust_field_4`,`a`.`cust_field_5` AS `cust_field_5`,`a`.`create_by` AS `create_by`,`a`.`create_time` AS `create_time`,`a`.`modify_by` AS `modify_by`,`a`.`modify_time` AS `modify_time`,`c`.`process_code` AS `process_code` from ((`a_servtrack_tracking_no_move_out` `a` left join `a_servtrack_work_tracking` `b` on(((`a`.`move_in` = `b`.`move_in`) and (`a`.`line_id` = `b`.`line_id`) and (`a`.`work_id` = `b`.`work_id`)))) join `a_servtrack_work_op` `c`) where (isnull(`b`.`move_in`) and (`a`.`work_id` = `c`.`work_id`) and (`a`.`op` = `c`.`op`));

