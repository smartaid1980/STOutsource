ALTER TABLE `servcloud`.`a_huangliang_mat_stock` MODIFY COLUMN `mat_price` VARCHAR(20) CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '材料單價',
 MODIFY COLUMN `mat_price_ref_date` VARCHAR(20) CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '材料單價參照日期',
 MODIFY COLUMN `mat_price_ref_sup_id` VARCHAR(20) CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '材料單價參照廠商編碼';