ALTER TABLE `m_alarm` 
DROP FOREIGN KEY `FK_m_alarm_cnc_id`;
ALTER TABLE `m_alarm` 
ADD CONSTRAINT `FK_m_alarm_cnc_id` FOREIGN KEY `FK_m_alarm_cnc_id` (`cnc_id`)
    REFERENCES `m_cnc_brand` (`cnc_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE `m_alarm` 
DROP FOREIGN KEY `FK_m_alarm_machine_type_id`;
ALTER TABLE `m_alarm` 
ADD CONSTRAINT `FK_m_alarm_machine_type_id` FOREIGN KEY `FK_m_alarm_machine_type_id` (`machine_type_id`)
    REFERENCES `m_machine_type` (`machine_type_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE `m_cnc_monitor_page`
DROP FOREIGN KEY `FK_m_cnc_monitor_page_cnc_id`;
ALTER TABLE `m_cnc_monitor_page` 
ADD CONSTRAINT `FK_m_cnc_monitor_page_cnc_id` FOREIGN KEY `FK_m_cnc_monitor_page_cnc_id` (`cnc_id`)
    REFERENCES `m_cnc_brand` (`cnc_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE `m_device`
 DROP FOREIGN KEY `FK_m_device_machine_type_id`;
ALTER TABLE `m_device` ADD CONSTRAINT `FK_m_device_machine_type_id` FOREIGN KEY `FK_m_device_machine_type_id` (`device_type`)
    REFERENCES `m_machine_type` (`machine_type_id`)
    ON DELETE SET NULL
    ON UPDATE RESTRICT;

ALTER TABLE `m_device_cnc_brand`
DROP FOREIGN KEY `FK_m_device_cnc_brand_cnc_id`;
ALTER TABLE `m_device_cnc_brand` 
ADD CONSTRAINT `FK_m_device_cnc_brand_cnc_id` FOREIGN KEY `FK_m_device_cnc_brand_cnc_id` (`cnc_id`)
    REFERENCES `m_cnc_brand` (`cnc_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;
