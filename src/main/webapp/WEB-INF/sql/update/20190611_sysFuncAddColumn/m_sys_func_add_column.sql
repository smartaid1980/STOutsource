ALTER TABLE `m_sys_func` ADD COLUMN `description` VARCHAR(1024) NOT NULL DEFAULT '' AFTER `hash`;
ALTER TABLE `m_sys_func` ADD COLUMN `author` VARCHAR(128) NOT NULL DEFAULT '' AFTER `description`;