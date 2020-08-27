ALTER TABLE `servcloud`.`a_huangliang_wo_m_mat_list`
 ADD COLUMN `use_cost` DECIMAL(12,2) UNSIGNED COMMENT '使用成本。材料單價*派工數量' AFTER `fb_qty`;