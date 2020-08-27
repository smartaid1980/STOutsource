ALTER TABLE `m_ip_cam` DROP COLUMN `port`,
 ADD COLUMN `plant_id` VARCHAR(45) AFTER `line_id`;
