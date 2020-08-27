ALTER TABLE `m_plant_area`
 DROP FOREIGN KEY `FK_m_plant_area_plant_id`;

ALTER TABLE `m_plant_area` ADD CONSTRAINT `FK_m_plant_area_plant_id` FOREIGN KEY `FK_m_plant_area_plant_id` (`plant_id`)
    REFERENCES `m_plant` (`plant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE `m_plant_area`
 DROP FOREIGN KEY `FK_m_plant_area_device_id`;

ALTER TABLE `m_plant_area` ADD CONSTRAINT `FK_m_plant_area_device_id` FOREIGN KEY `FK_m_plant_area_device_id` (`device_id`)
    REFERENCES `m_device` (`device_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;