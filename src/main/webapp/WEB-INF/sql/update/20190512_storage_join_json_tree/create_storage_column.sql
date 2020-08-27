ALTER TABLE `a_storage_zone` ADD COLUMN `zone_org_id` VARCHAR(10) BINARY AFTER `zone_id`;
Update `a_storage_zone` SET `zone_org_id` = `zone_id` Where `zone_org_id` IS NULL;

ALTER TABLE `a_storage_zone` ADD COLUMN `zone_id_path` VARCHAR(4096) BINARY AFTER `zone_desc`;

ALTER TABLE `a_storage_zone` ADD COLUMN `zone_name_path` VARCHAR(4096) BINARY AFTER `zone_id_path`;

ALTER TABLE `a_storage_store` ADD COLUMN `store_org_id` VARCHAR(10) BINARY AFTER `store_id`;
Update `a_storage_store` SET `store_org_id` = `store_id` Where `store_org_id` IS NULL;

ALTER TABLE `a_storage_store_position` ADD COLUMN `position_org_id` VARCHAR(10) BINARY AFTER `position_id`;
Update `a_storage_store_position` SET `position_org_id` = `position_id` Where `position_org_id` IS NULL;