CREATE TABLE `servcloud`.`a_aplus_defect` (
  `defect_number` VARCHAR(45) NOT NULL,
  `machine_id` VARCHAR(32) NOT NULL,
  `defect_type` VARCHAR(45) NOT NULL,
  `cause_factor` VARCHAR(45) NOT NULL,
  `defect_caption` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`defect_number`, `machine_id`),
  CONSTRAINT `FK_a_aplus_defect_1` FOREIGN KEY `FK_a_aplus_defect_1` (`machine_id`)
    REFERENCES `m_device` (`device_id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
)
ENGINE = InnoDB;


CREATE TABLE `a_aplus_defect_history` (
  `defect_number` VARCHAR(45) NOT NULL,
  `machine_id` VARCHAR(32) NOT NULL,
  `occur_timestamp` VARCHAR(45) NOT NULL,
  `defect_count` INTEGER UNSIGNED NOT NULL,
  PRIMARY KEY (`defect_number`),
  CONSTRAINT `FK_a_aplus_defect_history_1` FOREIGN KEY `FK_a_aplus_defect_history_1` (`defect_number`)
    REFERENCES `a_aplus_defect` (`defect_number`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `FK_a_aplus_defect_history_2` FOREIGN KEY `FK_a_aplus_defect_history_2` (`machine_id`)
    REFERENCES `m_device` (`device_id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
)
ENGINE = InnoDB;

ALTER TABLE `a_aplus_defect_history` DROP PRIMARY KEY,
 ADD PRIMARY KEY  USING BTREE(`defect_number`, `machine_id`);

 ALTER TABLE `a_aplus_defect_history` DROP PRIMARY KEY,
  ADD PRIMARY KEY  USING BTREE(`defect_number`, `machine_id`, `occur_timestamp`);

  ALTER TABLE `a_aplus_defect_history` MODIFY COLUMN `defect_number` VARCHAR(45) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
   MODIFY COLUMN `occur_timestamp` DATETIME NOT NULL DEFAULT 0;
