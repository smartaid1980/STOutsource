ALTER TABLE `m_plant` ADD COLUMN `plant_name` VARCHAR(45) BINARY AFTER `plant_id`;
Update `m_plant` SET `plant_name` = `plant_id` Where `plant_name` IS NULL;