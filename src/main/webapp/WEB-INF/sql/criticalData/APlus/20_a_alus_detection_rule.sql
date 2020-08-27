CREATE TABLE `a_aplus_detection_type` (
  `type_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `machine_id` VARCHAR(32) NOT NULL,
  `type_name` VARCHAR(10) NOT NULL,
  `create_by` VARCHAR(50) NOT NULL,
  `create_time` TIMESTAMP,
  `modify_by` VARCHAR(50),
  `modify_time` TIMESTAMP,
  PRIMARY KEY (`type_id`, `machine_id`),
  CONSTRAINT `FK_a_aplus_detection_type_machine_id` FOREIGN KEY `FK_a_aplus_detection_type_machine_id` (`machine_id`)
    REFERENCES `m_device` (`device_id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
)
ENGINE = InnoDB;

CREATE TABLE `a_aplus_detection_rule` (
  `alarm_id` VARCHAR(10) NOT NULL,
  `machine_id` VARCHAR(32) NOT NULL,
  `type_id` INTEGER UNSIGNED NOT NULL,
  `title` VARCHAR(50) NOT NULL,
  `_desc` VARCHAR(200),
  `_condition` VARCHAR(50),
  `condition_rule` VARCHAR(300),
  `condition_valid` VARCHAR(1) NOT NULL,
  `detect` VARCHAR(200),
  `detect_rule` VARCHAR(200),
  `is_valid` VARCHAR(1),
  `create_by` VARCHAR(50),
  `create_time` TIMESTAMP,
  `modify_by` VARCHAR(50),
  `modify_time` TIMESTAMP,
  PRIMARY KEY (`alarm_id`, `machine_id`),
  CONSTRAINT `FK_a_aplus_detection_rule_machine_id` FOREIGN KEY `FK_a_aplus_detection_rule_machine_id` (`machine_id`)
    REFERENCES `m_device` (`device_id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `FK_a_aplus_detection_rule_type_id` FOREIGN KEY `FK_a_aplus_detection_rule_type_id` (`type_id`)
    REFERENCES `a_aplus_detection_type` (`type_id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
)
ENGINE = InnoDB;

CREATE TABLE `a_aplus_alarm_log` (
  `alarm_log` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
  `alarm_id` VARCHAR(10) NOT NULL,
  `machine_id` VARCHAR(32) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `depiction` VARCHAR(500),
  `source` INTEGER UNSIGNED NOT NULL,
  `detection_result` VARCHAR(200),
  `create_by` VARCHAR(50),
  `create_time` TIMESTAMP,
  `modify_by` VARCHAR(50),
  `modify_time` TIMESTAMP,
  PRIMARY KEY (`alarm_log`),
  CONSTRAINT `FK_a_aplus_alarm_log_alarm_and_machine_id` FOREIGN KEY `FK_a_aplus_alarm_log_alarm_and_machine_id` (`alarm_id`, `machine_id`)
    REFERENCES `a_aplus_detection_rule` (`alarm_id`, `machine_id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
)
ENGINE = InnoDB;

CREATE TABLE `a_aplus_alarm_clear_item` (
  `alarm_id` VARCHAR(10) NOT NULL,
  `machine_id` VARCHAR(32) NOT NULL,
  `step` INTEGER UNSIGNED NOT NULL,
  `step_desc` VARCHAR(300) NOT NULL,
  `create_by` VARCHAR(50),
  `create_time` TIMESTAMP,
  `modify_by` VARCHAR(50),
  `modify_time` TIMESTAMP,
  PRIMARY KEY (`alarm_id`, `machine_id`, `step`),
  CONSTRAINT `FK_a_plus_alarm_clear_item_alarm_and_machine_id` FOREIGN KEY `FK_a_plus_alarm_clear_item_alarm_and_machine_id` (`alarm_id`, `machine_id`)
    REFERENCES `a_aplus_detection_rule` (`alarm_id`, `machine_id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
)
ENGINE = InnoDB;
