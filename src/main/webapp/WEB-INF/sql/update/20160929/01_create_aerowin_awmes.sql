CREATE TABLE `a_aerowin_awmes` (
  `id` INTEGER UNSIGNED NOT NULL,
  `work_id` VARCHAR(20) NOT NULL,
  `op` INTEGER UNSIGNED NOT NULL,
  `product_id` VARCHAR(20) NOT NULL,
  `product_name` VARCHAR(100) NOT NULL,
  `cus_pro` VARCHAR(20) NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `quantity_esp` INTEGER UNSIGNED NOT NULL,
  `go_no` INTEGER UNSIGNED NOT NULL,
  `ng_no` INTEGER UNSIGNED NOT NULL,
  `machine_id` VARCHAR(10) NOT NULL,
  `machine_name` VARCHAR(100) NOT NULL,
  `emp_id` VARCHAR(20) NOT NULL,
  `depart_id` VARCHAR(20) NOT NULL,
  `mes_time` DATETIME NOT NULL,
  `create_by` VARCHAR(50),
  `create_time` DATETIME,
  `modify_by` VARCHAR(50),
  `modify_time` DATETIME,
  PRIMARY KEY (`id`)
)
ENGINE = InnoDB;
