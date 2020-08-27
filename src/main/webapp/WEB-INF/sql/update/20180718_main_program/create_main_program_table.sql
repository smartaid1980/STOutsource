DROP TABLE IF EXISTS `m_main_program`;

CREATE TABLE .`m_main_program` (
  `version` INTEGER UNSIGNED NOT NULL DEFAULT 1,
  `pg_name` VARCHAR(45) NOT NULL DEFAULT '',
  `time` DOUBLE NOT NULL DEFAULT 0,
  PRIMARY KEY(`version`, `pg_name`)
)
ENGINE = InnoDB
COMMENT = '主程式運行時間';