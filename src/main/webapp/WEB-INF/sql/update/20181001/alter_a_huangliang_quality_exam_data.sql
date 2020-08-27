ALTER TABLE `servcloud`.`a_huangliang_quality_exam_data` MODIFY COLUMN `date` DATETIME NOT NULL DEFAULT 0,
ADD COLUMN `repair_first_defectives` INTEGER UNSIGNED NOT NULL DEFAULT 0 AFTER `edit_group`,
ADD COLUMN `calibration_first_defectives INTEGER UNSIGNED NOT NULL DEFAULT 0 AFTER `repair_first_defective`;