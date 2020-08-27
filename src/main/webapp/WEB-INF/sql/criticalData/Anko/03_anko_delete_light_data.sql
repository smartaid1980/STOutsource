-- delete idle AND change light
DELETE FROM `m_device_light` WHERE `light_id` IN ('12', '14');
UPDATE `m_device_light` SET `light_name` = '停止' WHERE light_id = '0';
UPDATE `m_device_light` SET `light_name` = '運轉中' WHERE light_id = '11';
UPDATE `m_device_light` SET `light_name` = '異常' WHERE light_id = '13';