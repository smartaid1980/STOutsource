ALTER TABLE `m_ip_cam` ADD COLUMN `line_id` VARCHAR(45) DEFAULT '' AFTER `device_id`;
ALTER TABLE `m_ip_cam` MODIFY COLUMN `ip` VARCHAR(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL;
ALTER TABLE `m_ip_cam` MODIFY COLUMN `port` VARCHAR(10) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL;