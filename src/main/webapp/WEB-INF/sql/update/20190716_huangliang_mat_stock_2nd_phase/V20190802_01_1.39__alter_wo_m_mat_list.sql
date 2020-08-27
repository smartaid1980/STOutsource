ALTER TABLE `servcloud`.`a_huangliang_wo_m_mat_list`
 MODIFY COLUMN `mstock_name` VARCHAR(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '材料庫',
 MODIFY COLUMN `po_no` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '採購單號',
 MODIFY COLUMN `mat_code` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '材料條碼',
 ADD COLUMN `sup_id` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '廠商代碼' AFTER `modify_time`;