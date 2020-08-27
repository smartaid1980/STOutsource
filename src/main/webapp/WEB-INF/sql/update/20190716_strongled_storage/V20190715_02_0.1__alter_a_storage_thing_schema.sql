ALTER TABLE `servcloud`.`a_storage_thing` DROP COLUMN `thing_org_id`,
 DROP COLUMN `thing_name`,
 DROP COLUMN `thing_desc`,
 DROP COLUMN `store_type_id`
, DROP INDEX `FK_a_storage_thing_store_type_id`,
 ADD INDEX `Index_a_storage_thing_thing_cell`(`thing_cell`),
 ADD INDEX `Index_a_storage_thing_thing_unit`(`thing_unit`),
 ADD INDEX `Index_a_storage_thing_thing_profile`(`thing_profile`),
 ADD INDEX `Index_a_storage_thing_create_by`(`create_by`),
 DROP FOREIGN KEY `FK_a_storage_thing_store_type_id`;
