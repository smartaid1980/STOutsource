CREATE TABLE `a_aerowin_depart_machine` (
  `depart_id` VARCHAR(20) NOT NULL,
  `machine_id` VARCHAR(20) NOT NULL,
  `create_by` VARCHAR(50) NOT NULL,
  `create_time` DATETIME NOT NULL,
  `modify_by` VARCHAR(50),
  `modify_time` DATETIME,
  PRIMARY KEY (`depart_id`, `machine_id`)
)
ENGINE = InnoDB;

CREATE TABLE `a_aerowin_employee` (
  `ym` VARCHAR(6) NOT NULL,
  `emp_id` VARCHAR(20) NOT NULL,
  `emp_name` VARCHAR(20),
  `shift` VARCHAR(1),
  `shift_begin` VARCHAR(10),
  `shift_end` VARCHAR(10),
  `create_by` VARCHAR(50),
  `create_time` DATETIME,
  `modify_by` VARCHAR(50),
  `modify_time` DATETIME,
  PRIMARY KEY (`ym`, `emp_id`)
)
ENGINE = InnoDB;

CREATE TABLE `a_aerowin_product` (
  `product_id` VARCHAR(20) NOT NULL,
  `product_name` VARCHAR(100) NOT NULL,
  `create_by` VARCHAR(50),
  `create_time` DATETIME,
  `modify_by` VARCHAR(50),
  `modify_time` DATETIME,
  PRIMARY KEY (`product_id`)
)
ENGINE = InnoDB;

CREATE TABLE `a_aerowin_wip` (
  `shift_date` DATE NOT NULL,
  `work_id` VARCHAR(20) NOT NULL,
  `op` INTEGER UNSIGNED NOT NULL,
  `product_id` VARCHAR(20),
  `wip_status` VARCHAR(1),
  `go_no` INTEGER UNSIGNED,
  `ng_no` INTEGER UNSIGNED,
  `quantity` INTEGER UNSIGNED,
  `create_by` VARCHAR(50),
  `create_time` DATETIME,
  `modify_by` VARCHAR(50),
  `modify_time` DATETIME,
  PRIMARY KEY (`shift_date`, `work_id`, `op`),
  CONSTRAINT `FK_a_aerowin_wip_product_id` FOREIGN KEY `FK_a_aerowin_wip_product_id` (`product_id`)
    REFERENCES `a_aerowin_product` (`product_id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
)
ENGINE = InnoDB;

CREATE TABLE `a_aerowin_daily_report` (
  `shift_date` DATE NOT NULL,
  `shift` VARCHAR(1) NOT NULL,
  `emp_id` VARCHAR(20) NOT NULL,
  `machine_id` VARCHAR(10) NOT NULL,
  `depart_id` VARCHAR(20) NOT NULL,
  `work_id` VARCHAR(20) NOT NULL,
  `op` INTEGER UNSIGNED NOT NULL,
  `product_id` VARCHAR(20),
  `quantity_esp` INTEGER UNSIGNED,
  `quantity_in` INTEGER UNSIGNED,
  `go_no` INTEGER UNSIGNED,
  `ng_no` INTEGER UNSIGNED,
  `quantity_res` INTEGER UNSIGNED,
  `labor_hour` FLOAT,
  `labor_hour_real` FLOAT,
  `cus_pro` VARCHAR(20),
  `complete_pct` FLOAT,
  `time_begin` DATETIME,
  `time_begin_m` DATETIME,
  `time_end` DATETIME,
  `time_end_m` DATETIME,
  `create_by` VARCHAR(50),
  `create_time` DATETIME,
  `modify_by` VARCHAR(50),
  `modify_time` DATETIME,
  PRIMARY KEY (`shift_date`, `op`, `work_id`, `depart_id`, `machine_id`, `emp_id`),
  CONSTRAINT `FK_a_aerowin_daily_report_pro_id` FOREIGN KEY `FK_a_aerowin_daily_report_pro_id` (`product_id`)
    REFERENCES `a_aerowin_product` (`product_id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
)
ENGINE = InnoDB;
