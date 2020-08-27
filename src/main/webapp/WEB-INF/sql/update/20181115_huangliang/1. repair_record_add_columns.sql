ALTER TABLE `a_huangliang_repair_record` 
 ADD COLUMN `n6` VARCHAR(45) NOT NULL DEFAULT '' AFTER `act_repair_emp_id`,
 ADD COLUMN `m523` VARCHAR(45) NOT NULL DEFAULT '' AFTER `n6`,
 ADD COLUMN `start_standard_second` VARCHAR(45) AFTER `m523`,
 ADD COLUMN `end_standard_second` VARCHAR(45) AFTER `start_standard_second`;