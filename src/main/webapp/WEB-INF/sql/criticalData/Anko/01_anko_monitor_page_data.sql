-- add anko brand
INSERT INTO `m_cnc_brand` (`cnc_id`,`name`) VALUES
 ('Anko','Anko'),
 ('Hitachi','Hitachi');

-- update all machine brand to 'Anko'
UPDATE m_device_cnc_brand dcb SET dcb.cnc_id = 'Anko';

-- clear ori data
DELETE FROM `m_cnc_monitor_page`;
DELETE FROM `m_alarm`;
DELETE FROM `m_cnc_brand` WHERE `cnc_id` IN ('FANUC', 'Heidenhain', 'HURCO', 'INTEK', 'LNC', 'Siemens', 'SYNTEC');

-- add monitor page
INSERT INTO `m_cnc_monitor_page` (`cnc_id`,`page_id`) VALUES
 ('Anko','info_anko'),
 ('Anko','leave');

-- update
UPDATE m_device_cnc_brand dcb SET dcb.cnc_id = 'Anko';