ALTER TABLE `servcloud`.`a_huangliang_po_temp_stock`
 MODIFY COLUMN `iqc_od_val` VARCHAR(10) CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '外徑檢驗值。06.2',
 MODIFY COLUMN `iqc_length_val` VARCHAR(10) COMMENT '長度檢驗值。2.6';