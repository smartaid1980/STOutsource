CREATE TABLE `a_aerowin_awmeswo` (
  `work_id` VARCHAR(20) NOT NULL,
  `op` INTEGER UNSIGNED NOT NULL,
  `op_name` TEXT,
  `quantity_esp` INTEGER UNSIGNED,
  `product_id` VARCHAR(20),
  `product_name` VARCHAR(100),
  `create_by` VARCHAR(50),
  `create_time` DATETIME,
  `modify_by` VARCHAR(50),
  `modify_time` DATETIME,
  PRIMARY KEY (`work_id`, `op`)
)
ENGINE = InnoDB;
