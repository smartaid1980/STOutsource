ALTER TABLE `servcloud`.`a_huangliang_mat_profile` 
ADD COLUMN `mat_colornumber` CHAR(7) NULL COMMENT '顏色代碼' AFTER `mat_sg`,
ADD COLUMN `mat_att` VARCHAR(10) NOT NULL DEFAULT '' COMMENT '材料屬性' AFTER `mat_colornumber`,
ADD COLUMN `mat_unit` VARCHAR(10) NOT NULL DEFAULT '' COMMENT '計價單位' AFTER `mat_att`,
CHANGE COLUMN `mat_id` `mat_id` VARCHAR(20) NOT NULL COMMENT '材料編碼' ,
CHANGE COLUMN `mat_type` `mat_type` VARCHAR(20) NOT NULL COMMENT '類別' ,
CHANGE COLUMN `mat_color` `mat_color` VARCHAR(20) NULL DEFAULT NULL COMMENT '上漆顏色' ,
CHANGE COLUMN `mat_sg` `mat_sg` DECIMAL(12,10) NULL DEFAULT NULL COMMENT '材料比重' ,
CHANGE COLUMN `is_open` `is_open` VARCHAR(1) NOT NULL COMMENT '是否啟用' ,
CHANGE COLUMN `create_by` `create_by` VARCHAR(50) NOT NULL COMMENT '建立人' ,
CHANGE COLUMN `create_time` `create_time` DATETIME NOT NULL COMMENT '建立日期' ,
CHANGE COLUMN `modify_by` `modify_by` VARCHAR(50) NOT NULL COMMENT '修改人' ,
CHANGE COLUMN `modify_time` `modify_time` DATETIME NOT NULL COMMENT '修改日期' ;
