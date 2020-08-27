DROP TABLE IF EXISTS `a_storage_zone`;
CREATE TABLE `a_storage_zone` (
  `zone_id` char(10) NOT NULL DEFAULT '' COMMENT '區域的編號；Z00000009 (Z+流水號)',
  `zone_org_id` varchar(10) DEFAULT NULL COMMENT '區域的原始編號',
  `zone_name` varchar(255) NOT NULL DEFAULT '' COMMENT '區域的名稱',
  `zone_desc` varchar(1024) DEFAULT NULL COMMENT '區域的描述',
  `zone_id_path` varchar(4096) DEFAULT NULL COMMENT '區域的編號路徑',
  `zone_name_path` varchar(4096) DEFAULT NULL COMMENT '區域的名稱路徑',
  `zone_x_len` int NOT NULL DEFAULT 0 COMMENT '區域的X軸長度',
  `zone_y_len` int NOT NULL DEFAULT 0 COMMENT '區域的Y軸長度',
  `create_by` varchar(20) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(20) NOT NULL DEFAULT '' COMMENT '更新者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新時間',
  PRIMARY KEY (`zone_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='區域';

DROP TABLE IF EXISTS `a_storage_store_type`;
CREATE TABLE `a_storage_store_type` (
  `store_type_id` int NOT NULL DEFAULT 0 COMMENT '庫類型的編號',
  `store_type_name` varchar(255) NOT NULL DEFAULT '' COMMENT '庫類型的名稱；盤|卷|管|個',
  `store_type_desc` varchar(1024) DEFAULT NULL COMMENT '庫類型的描述',
  `store_type_cell` int NOT NULL DEFAULT 0 COMMENT '1格有幾個間格；1盤?個|1卷?個|1管?個',
  `create_by` varchar(20) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(20) NOT NULL DEFAULT '' COMMENT '更新者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新時間',
  PRIMARY KEY (`store_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='庫的類型';

DROP TABLE IF EXISTS `a_storage_store`;
CREATE TABLE `a_storage_store` (
  `store_id` char(10) NOT NULL DEFAULT '' COMMENT '庫的編號；S00000009 (S+流水號)',
  `store_org_id` varchar(10) DEFAULT NULL COMMENT '庫的原始編號',
  `store_name` varchar(255) NOT NULL DEFAULT '' COMMENT '庫的名稱',
  `store_desc` varchar(1024) DEFAULT NULL COMMENT '庫的描述',
  `store_type_id` int NOT NULL DEFAULT 0 COMMENT '庫的類型',
  `store_grid_count` int NOT NULL DEFAULT 0 COMMENT '庫有幾格',
  `store_rule` varchar(4096) NOT NULL DEFAULT '' COMMENT '庫的規則；預設 {}',
  `zone_id` char(10) NOT NULL DEFAULT '' COMMENT '區域的編號；Z00000009 (Z+流水號)',
  `store_profile` varchar(4096) DEFAULT NULL COMMENT '庫的相關欄位',
  `sotre_reversed` varchar(4096) DEFAULT NULL COMMENT '庫的保留欄位',
  `create_by` varchar(20) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(20) NOT NULL DEFAULT '' COMMENT '更新者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新時間',
  PRIMARY KEY (`store_id`),
  KEY `FK_a_storage_store_store_type_id` (`store_type_id`),
  KEY `FK_a_storage_store_zone_id` (`zone_id`),
  CONSTRAINT `FK_a_storage_store_store_type_id` FOREIGN KEY (`store_type_id`) REFERENCES `a_storage_store_type` (`store_type_id`),
  CONSTRAINT `FK_a_storage_store_zone_id` FOREIGN KEY (`zone_id`) REFERENCES `a_storage_zone` (`zone_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='庫';

DROP TABLE IF EXISTS `a_storage_store_position`;
CREATE TABLE `a_storage_store_position` (
  `position_id` char(10) NOT NULL DEFAULT '' COMMENT '儲位的編號；P00000009 (P+流水號)',
  `position_org_id` varchar(10) DEFAULT NULL COMMENT '儲位的原始編號',
  `position_name` varchar(255) NOT NULL DEFAULT '' COMMENT '儲位的名稱',
  `store_id` char(10) NOT NULL DEFAULT '' COMMENT '庫的編號；S00000009 (S+流水號)',
  `store_grid_index` int NOT NULL DEFAULT 0 COMMENT '格的索引',
  `store_cell_index` int NOT NULL DEFAULT 0 COMMENT '格間的索引',
  `position_desc` varchar(1024) DEFAULT NULL COMMENT '儲位的描述',
  `create_by` varchar(20) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(20) NOT NULL DEFAULT '' COMMENT '更新者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新時間',
  PRIMARY KEY (`position_id`),
  KEY `FK_a_storage_store_position_store_id` (`store_id`),
  CONSTRAINT `FK_a_storage_store_position_store_id` FOREIGN KEY (`store_id`) REFERENCES `a_storage_store` (`store_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='儲位管理';

DROP TABLE IF EXISTS `servcloud`.`a_storage_thing`;
CREATE TABLE  `servcloud`.`a_storage_thing` (
  `thing_id` varchar(60) NOT NULL DEFAULT '' COMMENT '物品的編號；Material1809210123(material_id+年月日 +流水號4碼)',
  `thing_profile` varchar(4096) DEFAULT NULL COMMENT '物品的相關欄位',
  `thing_reversed` varchar(4096) DEFAULT NULL COMMENT '物品的保留欄位',
  `thing_cell` int(11) NOT NULL DEFAULT '1' COMMENT '物件占多少格間；預設1',
  `thing_unit` char(10) NOT NULL DEFAULT '' COMMENT '物件的單位；件/盤/個',
  `thing_pcs` int(11) NOT NULL DEFAULT '0' COMMENT '物件有多少個；1個單位多少pcs',
  `create_by` varchar(20) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(20) NOT NULL DEFAULT '' COMMENT '更新者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新時間',
  PRIMARY KEY (`thing_id`),
  KEY `Index_a_storage_thing_thing_cell` (`thing_cell`),
  KEY `Index_a_storage_thing_thing_unit` (`thing_unit`),
  KEY `Index_a_storage_thing_thing_profile` (`thing_profile`(255)),
  KEY `Index_a_storage_thing_create_by` (`create_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='物品';

DROP TABLE IF EXISTS `a_storage_store_thing_map`;
CREATE TABLE `a_storage_store_thing_map` (
  `store_id` char(10) NOT NULL DEFAULT '' COMMENT '庫的編號；S00000009 (S+流水號)',
  `grid_index` int NOT NULL DEFAULT 0 COMMENT '格的索引',
  `cell_start_index` int NOT NULL DEFAULT 0 COMMENT '隔間的開始索引',
  `cell_end_index` int NOT NULL DEFAULT 0 COMMENT '隔間的結束索引',
  `thing_cell` int NOT NULL DEFAULT 0 COMMENT '物品的佔隔間數',
  `thing_id` varchar(60) NOT NULL DEFAULT '' COMMENT '物品的編號；Material1809210123(material_id+年月日 +流水號4碼)',
  `thing_pcs` int NOT NULL DEFAULT 0 COMMENT '物品目前的數量',
  `create_by` varchar(20) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(20) NOT NULL DEFAULT '' COMMENT '更新者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新時間',
  PRIMARY KEY (`store_id`,`grid_index`,`cell_start_index`),
  KEY `FK_a_storage_store_thing_map_store_id` (`store_id`),
  KEY `FK_a_storage_store_thing_map_thing_id` (`thing_id`),
  CONSTRAINT `FK_a_storage_store_thing_map_store_id` FOREIGN KEY (`store_id`) REFERENCES `a_storage_store` (`store_id`),
  CONSTRAINT `FK_a_storage_store_thing_map_thing_id` FOREIGN KEY (`thing_id`) REFERENCES `a_storage_thing` (`thing_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='庫物品對應';

DROP TABLE IF EXISTS `a_storage_document`;
CREATE TABLE `a_storage_document` (
  `doc_id` char(10) NOT NULL DEFAULT '' COMMENT '單據的編號；D00000009 (D+流水號)',
  `doc_org_id` varchar(50) DEFAULT NULL COMMENT '單據的原始編號',
  `doc_name` varchar(255) NOT NULL DEFAULT '' COMMENT '單據的名稱',
  `doc_desc` varchar(1024) DEFAULT NULL COMMENT '單據的描述',
  `doc_profile` varchar(4096) DEFAULT NULL COMMENT '單據的相關欄位',
  `doc_reversed` varchar(4096) DEFAULT NULL COMMENT '單據的保留欄位',
  `create_by` varchar(20) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(20) NOT NULL DEFAULT '' COMMENT '更新者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新時間',
  PRIMARY KEY (`doc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='單據';

DROP TABLE IF EXISTS `a_storage_sender`;
CREATE TABLE `a_storage_sender` (
  `sender_id` char(10) NOT NULL DEFAULT '' COMMENT '傳送者的編號；N00000009 (N+流水號)',
  `sender_name` varchar(255) NOT NULL DEFAULT '' COMMENT '傳送者的名稱',
  `sender_desc` varchar(1024) DEFAULT NULL COMMENT '傳送者的描述',
  `sender_key` varchar(255) NOT NULL DEFAULT '' COMMENT '傳送者的KEY；唯一代號,ex:MAC Address',
  `sender_token` varchar(255) DEFAULT NULL COMMENT '傳送者的TOKEN',
  `sender_profile` varchar(4096) DEFAULT NULL COMMENT '傳送者的相關欄位',
  `sender_reversed` varchar(4096) DEFAULT NULL COMMENT '傳送者的保留欄位',
  `sender_enabled` char(1) NOT NULL DEFAULT 'Y' COMMENT '傳送者是否啟用；Y / N (預設: Y)',
  `create_by` varchar(20) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(20) NOT NULL DEFAULT '' COMMENT '更新者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新時間',
  PRIMARY KEY (`sender_id`),
  KEY `sender_key` (`sender_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='傳送者';

DROP TABLE IF EXISTS `a_storage_log`;
CREATE TABLE `a_storage_log` (
  `log_id` varchar(255) NOT NULL DEFAULT '' COMMENT '紀錄的編號；MAC Address',
  `log_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '紀錄的時間',
  `store_id` char(10) NOT NULL DEFAULT '' COMMENT '庫的編號',
  `store_grid_index` int NOT NULL DEFAULT 0 COMMENT '格的索引',
  `store_cell_index` int NOT NULL DEFAULT 0 COMMENT '格間的索引',
  `user_id` varchar(20) NOT NULL DEFAULT '' COMMENT '使用者的編號',
  `thing_id` varchar(60) NOT NULL DEFAULT '' COMMENT '物品的編號；Material1809210123(material_id+年月日 +流水號4碼)',
  `doc_id` char(10) DEFAULT NULL COMMENT '單據的編號',
  `sender_id` char(10) NOT NULL DEFAULT '' COMMENT '傳送者的編號',
  `log_type` int NOT NULL DEFAULT 0 COMMENT '進出類型；1(進) / 2(出)',
  `log_count` int NOT NULL DEFAULT 0 COMMENT '進出數量',
  `log_desc` varchar(4096) DEFAULT NULL COMMENT '紀錄的描述',
  `create_by` varchar(20) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(20) NOT NULL DEFAULT '' COMMENT '更新者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新時間',
  PRIMARY KEY (`log_id`, `log_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='進出紀錄';

DROP TABLE IF EXISTS `a_storage_employee`;
CREATE TABLE `a_storage_employee` (
  `emp_id` char(10) NOT NULL DEFAULT '' COMMENT '人員的編號；E00000009 (E+流水號)',
  `emp_org_id` varchar(20) DEFAULT NULL COMMENT '公司員工編號',
  `emp_name` varchar(255) NOT NULL DEFAULT '' COMMENT '人員的名稱',
  `emp_desc` varchar(1024) DEFAULT NULL COMMENT '人員的描述',
  `emp_profile` varchar(4096) DEFAULT NULL COMMENT '人員的相關欄位',
  `emp_reversed` varchar(4096) DEFAULT NULL COMMENT '人員的保留欄位',
  `create_by` varchar(20) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(20) NOT NULL DEFAULT '' COMMENT '更新者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新時間',
  PRIMARY KEY (`emp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='人員';

-- DROP TABLE IF EXISTS `a_storage_supplier`;
-- CREATE TABLE `a_storage_supplier` (
--   `supplier_id` char(25) NOT NULL DEFAULT '' COMMENT '供應商的編號',
--   `supplier_org_id` varchar(20) DEFAULT NULL COMMENT '公司供應商編號',
--   `supplier_name` varchar(255) NOT NULL DEFAULT '' COMMENT '供應商的名稱',
--   `supplier_desc` varchar(1024) DEFAULT NULL COMMENT '供應商的描述',
--   `supplier_profile` varchar(4096) DEFAULT NULL COMMENT '供應商的相關欄位',
--   `supplier_reversed` varchar(4096) DEFAULT NULL COMMENT '供應商的保留欄位',
--   `create_by` varchar(20) NOT NULL DEFAULT '' COMMENT '建立者',
--   `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
--   `modify_by` varchar(20) NOT NULL DEFAULT '' COMMENT '更新者',
--   `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新時間',
--   PRIMARY KEY (`supplier_id`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='供應商';

DROP TABLE IF EXISTS `a_storage_material`;
CREATE TABLE `a_storage_material` (
  `material_id` varchar(50) NOT NULL DEFAULT '' COMMENT '原料的編號',
  `material_name` varchar(255) NOT NULL DEFAULT '' COMMENT '原料的名稱',
  `material_desc` varchar(1024) DEFAULT NULL COMMENT '原料的描述',
  `material_profile` varchar(4096) DEFAULT NULL COMMENT '原料的相關欄位',
  `material_reversed` varchar(4096) DEFAULT NULL COMMENT '原料的保留欄位',
  `supplier_id` varchar(25) DEFAULT NULL COMMENT '供應商代碼',
  `store_type_id` int NOT NULL DEFAULT 0 COMMENT '適用的庫類型；預設0(表示通用)',
  `material_cell` int NOT NULL DEFAULT 1 COMMENT '原料占多少格間；預設1',
  `material_unit` char(10) NOT NULL DEFAULT '' COMMENT '原料的單位；件/盤/個',
  `material_pcs` int NOT NULL DEFAULT 0 COMMENT '原料有多少個；1個單位多少pcs',
  `create_by` varchar(20) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(20) NOT NULL DEFAULT '' COMMENT '更新者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新時間',
  PRIMARY KEY (`material_id`),
  KEY `FK_a_storage_material_store_type_id` (`store_type_id`),
  CONSTRAINT `FK_a_storage_material_store_type_id` FOREIGN KEY (`store_type_id`) REFERENCES `a_storage_store_type` (`store_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='原料';

DROP TABLE IF EXISTS `servcloud`.`a_storage_material_thing`;
CREATE TABLE  `servcloud`.`a_storage_material_thing` (
  `thing_id` varchar(60) NOT NULL DEFAULT '' COMMENT '物品的編號；Material1809210123(material_id+年月日 +流水號4碼)',
  `material_id` varchar(50) NOT NULL DEFAULT '' COMMENT '原料的編號',
  `material_sub` varchar(20) NOT NULL DEFAULT '0000' COMMENT '原料分項，無分項者預設0000=批號，同ERP.batchID批號',
  `remark` varchar(1024) DEFAULT NULL COMMENT '產品名稱，等同於 ERP.prodName AKA material_name',
  `bill_from` varchar(20) DEFAULT NULL COMMENT '來源單號=bill_no',
  `bill_detail` int(10) unsigned DEFAULT NULL COMMENT '來源細項=bill_detail',
  `code_no` int(10) unsigned DEFAULT NULL COMMENT '條碼序號',
  `column1` varchar(20) DEFAULT NULL COMMENT '保留',
  `column2` varchar(20) DEFAULT NULL COMMENT '保留',
  `column3` varchar(20) DEFAULT NULL COMMENT '保留',
  `delivery_date` varchar(8) DEFAULT NULL COMMENT '出廠日期=delivery_date',
  `exp_date` date DEFAULT NULL COMMENT '有效日期',
  `in_stock` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否入庫',
  `is_new` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否全新',
  `status` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '保留',
  `create_by` varchar(20) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(20) NOT NULL DEFAULT '' COMMENT '更新者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新時間',
  PRIMARY KEY (`thing_id`),
  KEY `FK_a_storage_material_thing_thing_id` (`thing_id`),
  KEY `FK_a_storage_material_thing_material_id` (`material_id`),
  KEY `Index_material_sub` (`material_sub`),
  KEY `Index_bill_from` (`bill_from`),
  KEY `Index_code_no` (`code_no`),
  CONSTRAINT `FK_a_storage_material_thing_thing_id` FOREIGN KEY (`thing_id`) REFERENCES `a_storage_thing` (`thing_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='原料物品對應';

DROP TABLE IF EXISTS `a_storage_work_op_material`;
CREATE TABLE `a_storage_work_op_material` (
  `work_id` varchar(50) NOT NULL DEFAULT '' COMMENT '派工單編號',
  `op` varchar(10) NOT NULL DEFAULT '' COMMENT '產品工序',
  `material_id` varchar(50) NOT NULL DEFAULT '' COMMENT '原料的編號',
  `use_qty` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT '使用量',
  `remark` varchar(1024) DEFAULT NULL COMMENT '備註',
  `create_by` varchar(20) NOT NULL DEFAULT '' COMMENT '建立者',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `modify_by` varchar(20) NOT NULL DEFAULT '' COMMENT '更新者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新時間',
  PRIMARY KEY (`work_id`,`op`,`material_id`),
  KEY `FK_a_storage_work_op_material_material_id` (`material_id`),
  CONSTRAINT `FK_a_storage_work_op_material_material_id` FOREIGN KEY (`material_id`) REFERENCES `a_storage_material` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='工單製程用料';

DROP TABLE IF EXISTS `a_storage_pickup`;
CREATE TABLE `a_storage_pickup` (
  `pickup_timestamp` char(17) NOT NULL,
  `work_order_no` varchar(255) NOT NULL,
  `sender_key` varchar(255) NOT NULL,
  `pickup_color` varchar(5) NOT NULL,
  `create_by` varchar(20) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(20) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`pickup_timestamp`,`work_order_no`),
  KEY `FK_a_storage_pickup_sender_key` (`sender_key`),
  CONSTRAINT `FK_a_storage_pickup_sender_key` FOREIGN KEY (`sender_key`) REFERENCES `a_storage_sender` (`sender_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_storage_pickup_log`;
CREATE TABLE `a_storage_pickup_log` (
  `pickup_timestamp` char(17) NOT NULL,
  `work_no` varchar(255) NOT NULL,
  `order_no` varchar(1024) NOT NULL,
  `sender_key` varchar(255) NOT NULL,
  `pickup_color` varchar(5) NOT NULL,
  `pickup_start_time` datetime NOT NULL,
  `pickup_end_time` datetime DEFAULT NULL,
  `create_by` varchar(20) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(20) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`pickup_timestamp`),
  KEY `FK_a_storage_pickup_log_sender_key` (`sender_key`),
  CONSTRAINT `FK_a_storage_pickup_log_sender_key` FOREIGN KEY (`sender_key`) REFERENCES `a_storage_sender` (`sender_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_storage_position_light_map`;
CREATE TABLE `a_storage_position_light_map` (
  `position_id` char(10) NOT NULL,
  `light_index` int(11) NOT NULL,
  `create_by` varchar(20) NOT NULL,
  `create_time` datetime NOT NULL,
  `modify_by` varchar(20) NOT NULL,
  `modify_time` datetime NOT NULL,
  PRIMARY KEY (`position_id`,`light_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_storage_piller_light_map`;
CREATE TABLE `a_storage_piller_light_map` (
  `map_id` varchar(50) NOT NULL,
  `light_id` int(11) DEFAULT NULL,
  `color` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`map_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `servcloud`.`a_strongled_bill_stock_in`;
CREATE TABLE  `servcloud`.`a_strongled_bill_stock_in` (
  `bill_no` varchar(20) NOT NULL COMMENT '單號= BillNO',
  `bill_date` varchar(8) NOT NULL COMMENT '單據日期= BillDate',
  `bill_detail` int(10) unsigned NOT NULL COMMENT '明細分項= PRowNO',
  `material_id` varchar(50) NOT NULL COMMENT '原料代碼= ProdID',
  `material_sub` varchar(20) NOT NULL COMMENT '原料分項 無分項者：預設”0000”= BatchID',
  `remark` varchar(200) DEFAULT NULL COMMENT '說明 = prodName，本案等同於產品名稱',
  `ware_id` varchar(20) NOT NULL COMMENT '倉別= WareID',
  `quantity` decimal(10,4) NOT NULL COMMENT '數量= PQuantity',
  `delivery_date` varchar(8) NOT NULL COMMENT '出廠日期= ProduceDate',
  `column_1` varchar(20) DEFAULT NULL COMMENT '預留欄位1',
  `column_2` varchar(20) DEFAULT NULL COMMENT '預留欄位2',
  `column_3` varchar(20) DEFAULT NULL COMMENT '預留欄位3',
  `column_4` varchar(20) DEFAULT NULL COMMENT '預留欄位4',
  `column_5` varchar(20) DEFAULT NULL COMMENT '預留欄位5',
  `status` int(10) unsigned NOT NULL COMMENT '狀態 Default: 0，表示未生成條碼1， 已生成條碼未入庫9，  已入庫',
  `create_by` varchar(20) NOT NULL COMMENT '建立者=userid',
  `create_time` bigint(20) unsigned NOT NULL COMMENT '建立時間=當地時間的長整數',
  `modify_by` varchar(20) NOT NULL COMMENT '更新者=userid',
  `modify_time` bigint(20) unsigned NOT NULL COMMENT '更新時間=當地時間的長整數',
  PRIMARY KEY (`bill_no`,`bill_detail`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `servcloud`.`a_strongled_synctime_stock_in`;
CREATE TABLE  `servcloud`.`a_strongled_synctime_stock_in` (
  `sync_start` datetime NOT NULL COMMENT '起始時間:點選更新進貨單時，及建立記錄',
  `sync_end` datetime DEFAULT NULL COMMENT '結束時間:確認更新完成，記錄更新完畢時間',
  `lastest_bill` varchar(20) DEFAULT NULL COMMENT '單號:最新一筆 BILL_STOCK_IN.bill_no',
  `sync_account` varchar(20) NOT NULL COMMENT '同步帳號 同userid',
  `create_by` varchar(20) NOT NULL COMMENT '建立者 同userid',
  `create_time` bigint(20) unsigned NOT NULL COMMENT '建立時間 當地時間的長整數',
  `modify_by` varchar(20) NOT NULL COMMENT '更新者 同userid',
  `modify_time` bigint(20) unsigned NOT NULL COMMENT '更新時間 當地時間的長整數',
  PRIMARY KEY (`sync_start`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE view a_storage_pickup_light_view
as
Select
light.light_index,
pickup.pickup_color,
position.position_id,
pickup.work_order_no,
position.store_id,
position.store_grid_index,
position.store_cell_index
From
a_storage_pickup as pickup,
a_storage_position_light_map as light,
a_storage_store_position as position,
a_storage_thing as thing,
a_storage_store_thing_map as thing_map
Where
     pickup.work_order_no = thing.thing_profile
 and thing.thing_id = thing_map.thing_id
 and thing_map.store_id = position.store_id
 and thing_map.grid_index = position.store_grid_index
 and thing_map.cell_start_index = position.store_cell_index
 and position.position_id = light.position_id;

DROP VIEW IF EXISTS `servcloud`.`a_storage_work_op_material_thing_view`;
create view a_storage_work_op_material_thing_view
as 
select 
work_op_material.work_id,
work_op_material.op,
work_op_material.material_id,
work_op_material.use_qty,
work_op_material.remark as work_op_material_remark,
material_thing.thing_id,
material_thing.exp_date,
material_thing.is_new,
material_thing.status,
material_thing.remark as material_thing_remark,
thing.thing_profile,
thing.thing_reversed,
thing.thing_cell,
thing.thing_unit,
thing.thing_pcs,
store_thing.store_id,
store_thing.grid_index,
store_thing.cell_start_index,
store_thing.cell_end_index,
(CAST(store_thing.cell_end_index as SIGNED) - CAST(thing.thing_cell as SIGNED)) as cell_index,
store_thing.thing_cell as store_thing_cell,
store_thing.thing_pcs as store_thing_pcs,
store.store_name,
store.store_desc,
store.store_grid_count,
store.zone_id
FROM a_storage_work_op_material as work_op_material 
LEFT JOIN a_storage_material_thing as material_thing
on work_op_material.material_id = material_thing.material_id
LEFT JOIN a_storage_thing as thing
on material_thing.thing_id = thing.thing_id
LEFT JOIN a_storage_store_thing_map as store_thing 
on thing.thing_id = store_thing.thing_id
LEFT JOIN a_storage_store as store
on store_thing.store_id = store.store_id;


DROP VIEW IF EXISTS `a_strongled_view_bill_stock_in_material_thing`;
CREATE VIEW a_strongled_view_bill_stock_in_material_thing AS
SELECT 
mt.thing_id,
mt.material_id,
mt.material_sub,
mt.remark,
mt.bill_from,
mt.code_no,
mt.column1,
mt.column2,
mt.column3,
mt.exp_date,
mt.is_new,
mt.status,
mt.in_stock,

bsi.bill_date,
bsi.ware_id,
bsi.quantity,
bsi.bill_detail,
bsi.delivery_date,
bsi.column_1,
bsi.column_2,
bsi.column_3,
bsi.column_4,
bsi.column_5,
bsi.status AS bill_status,

t.thing_cell,
t.thing_unit,
t.thing_pcs,
t.thing_profile,
t.thing_reversed

FROM a_storage_material_thing mt

INNER JOIN
a_storage_thing t
on mt.thing_id = t.thing_id

INNER JOIN
a_strongled_bill_stock_in bsi
on mt.bill_from = bsi.bill_no and
mt.bill_detail = bsi.bill_detail;

DROP VIEW IF EXISTS `a_strongled_view_material_thing_left_join_bill_stock_in`;
CREATE VIEW a_strongled_view_material_thing_left_join_bill_stock_in AS
SELECT
mt.thing_id,
mt.bill_from,
mt.code_no,
mt.column1,
mt.column2,
mt.column3,
mt.exp_date,
mt.is_new,
mt.status,
mt.in_stock,

bsi.material_id,
bsi.remark,
bsi.material_sub,
bsi.bill_date,
bsi.ware_id,
bsi.quantity,
bsi.bill_no,
bsi.bill_detail,
bsi.delivery_date,
bsi.column_1,
bsi.column_2,
bsi.column_3,
bsi.column_4,
bsi.column_5,
bsi.status AS bill_status,

t.thing_cell,
t.thing_unit,
t.thing_pcs,
t.thing_profile,
t.thing_reversed

FROM a_storage_material_thing mt

INNER JOIN
a_storage_thing t
on mt.thing_id = t.thing_id

RIGHT JOIN
a_strongled_bill_stock_in bsi
on mt.bill_from = bsi.bill_no and
mt.bill_detail = bsi.bill_detail;

DROP TABLE IF EXISTS `a_strongled_bill_stock_out_main`;
CREATE TABLE  `a_strongled_bill_stock_out_main` (
  `bill_no` varchar(20) NOT NULL COMMENT '= BillNO',
  `bill_date` varchar(20) NOT NULL COMMENT '= BillDate',
  `stock_out_date` varchar(20) NOT NULL COMMENT '= TakeMatDate',
  `remark` varchar(400) COMMENT '= MKOrdList',
  `ware_id` varchar(10) NOT NULL COMMENT '= WareID',
  `column_1` varchar(20),
  `column_2` varchar(20),
  `column_3` varchar(20),
  `column_4` varchar(20),
  `column_5` varchar(20),
  `status` INT(10) NOT NULL COMMENT '只有0(新增)跟2(鎖定)',
  `locked_by` varchar(20) NOT NULL COMMENT '同平板名稱',
  `create_by` varchar(20) NOT NULL,
  `create_time` BIGINT(20) NOT NULL,
  `modify_by` varchar(20) NOT NULL,
  `modify_time` BIGINT(20) NOT NULL,
  PRIMARY KEY (`bill_no`,`ware_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `a_strongled_bill_stock_out_detail`;
CREATE TABLE  `a_strongled_bill_stock_out_detail` (
  `bill_no` varchar(20) NOT NULL COMMENT '= BillNO',
  `bill_date` varchar(20) NOT NULL COMMENT '= BillDate',
  `bill_detail` int(10) unsigned NOT NULL COMMENT '明細分項= PRowNO',
  `material_id` varchar(50) NOT NULL COMMENT '原料代碼= ProdID',
  `material_sub` varchar(20) NOT NULL COMMENT '原料分項 無分項者：預設”0000”= BatchID',
  `remark` varchar(200) DEFAULT NULL COMMENT '說明 = prodName，本案等同於產品名稱',
  `ware_id` varchar(20) NOT NULL COMMENT '倉別= WareID',
  `quantity` decimal(10,4) NOT NULL COMMENT '數量= PQuantity',
  `delivery_date` varchar(8) NOT NULL COMMENT '出廠日期= ProduceDate',
  `for_work` varchar(50) COMMENT '使用工單= MKOrder',
  `column_1` varchar(20),
  `column_2` varchar(20),
  `column_3` varchar(20),
  `column_4` varchar(20),
  `column_5` varchar(20),
  `out_qty` DECIMAL(8,2) COMMENT '每次掃描出庫累加 a_material_thing.thing_pcs',
  `status` INT(10) NOT NULL COMMENT 'Default: 0，未出庫完畢 1，已出庫完畢',
  `create_by` varchar(20) NOT NULL,
  `create_time` BIGINT(20) NOT NULL,
  `modify_by` varchar(20) NOT NULL,
  `modify_time` BIGINT(20) NOT NULL,
  PRIMARY KEY (`bill_no`,`bill_detail`,`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP VIEW IF EXISTS `a_strongled_store_view_bill_stock_out_main_detail`;
CREATE VIEW a_strongled_store_view_bill_stock_out_main_detail AS
SELECT
m.bill_date as main_bill_date,
m.stock_out_date,
m.remark as main_remark,
m.ware_id as main_ware_id,
m.status as main_status,
d.*

FROM a_strongled_bill_stock_out_detail d

INNER JOIN a_strongled_bill_stock_out_main m
on d.bill_no = m.bill_no

where d.status = 0
group by d.bill_no;

DROP TABLE IF EXISTS `servcloud`.`a_strongled_synctime_stock_out`;
CREATE TABLE  `servcloud`.`a_strongled_synctime_stock_out` (
  `sync_start` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '起始時間:點選更新進貨單時，及建立記錄',
  `sync_end` bigint(20) unsigned DEFAULT NULL COMMENT '結束時間:確認更新完成，記錄更新完畢時間',
  `lastest_bill` varchar(20) DEFAULT NULL COMMENT '單號:最新一筆 BILL_STOCK_IN.bill_no',
  `sync_account` varchar(20) NOT NULL COMMENT '同步帳號 同userid',
  `create_by` varchar(20) NOT NULL COMMENT '建立者 同userid',
  `create_time` bigint(20) unsigned NOT NULL COMMENT '建立時間 當地時間的長整數',
  `modify_by` varchar(20) NOT NULL COMMENT '更新者 同userid',
  `modify_time` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '更新時間 當地時間的長整數',
  `remark` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`sync_start`),
  KEY `index` (`remark`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP VIEW IF EXISTS `servcloud`.`a_storage_pickup_piller_light_view`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `a_storage_pickup_piller_light_view` AS
select
`a_storage_piller_light_map`.`light_id` AS `light_index`
,`a_storage_piller_light_map`.`color` AS `pickup_color`
from `a_storage_piller_light_map`
where `a_storage_piller_light_map`.`map_id` in (select distinct `a_storage_pickup_light_view`.`store_id` from `a_storage_pickup_light_view`);
