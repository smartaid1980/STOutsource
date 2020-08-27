CREATE TABLE `a_aerowin_table_last_id` (
  `table_name` VARCHAR(50) NOT NULL,
  `last_id` INTEGER UNSIGNED DEFAULT 0,
  `description` VARCHAR(100),
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`table_name`)
)
ENGINE = InnoDB;