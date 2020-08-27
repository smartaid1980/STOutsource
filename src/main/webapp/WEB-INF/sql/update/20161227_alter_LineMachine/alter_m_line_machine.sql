ALTER TABLE `servcloud`.`m_line_machine` MODIFY COLUMN `is_close` INT(1) NOT NULL DEFAULT 0;

ALTER TABLE `servcloud`.`m_line_machine`
 DROP FOREIGN KEY `FK_m_line_machine_2`;

ALTER TABLE `servcloud`.`m_line_machine` ADD CONSTRAINT `FK_m_line_machine_2` FOREIGN KEY `FK_m_line_machine_2` (`type_id`, `op_seq`)
    REFERENCES `m_line_type` (`type_id`, `op_seq`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;
