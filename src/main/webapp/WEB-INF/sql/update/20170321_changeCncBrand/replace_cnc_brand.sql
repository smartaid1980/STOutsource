-- step 1: insert new cnc_brand
INSERT IGNORE INTO `m_cnc_brand` (`cnc_id`,`name`) VALUES
 ('FANUC_CNC_FOCAS','FANUC_CNC_FOCAS'),
 ('HEIDENHAIN_CNC_REMOTOOLS','HEIDENHAIN_CNC_REMOTOOLS'),
 ('HURCO_CNC_MODBUS','HURCO_CNC_MODBUS'),
 ('INTEK_CNC_PROTOCOL','INTEK_CNC_PROTOCOL'),
 ('LNC_CNC_SCIF','LNC_CNC_SCIF'),
 ('MITSUBISHI_CNC_EZNCCOM','MITSUBISHI_CNC_EZNCCOM'),
 ('SIEMENS_CNC_RPC','SIEMENS_CNC_RPC'),
 ('ITRI_CNC_GMCN','ITRI_CNC_GMCN'),
 ('SYNTEC_CNC_REMOTEAPI','SYNTEC_CNC_REMOTEAPI');
 
-- step 2: old brand update to new brand
UPDATE m_cnc_monitor_page SET cnc_id = 'FANUC_CNC_FOCAS'          WHERE cnc_id = 'FANUC';
UPDATE m_cnc_monitor_page SET cnc_id = 'HEIDENHAIN_CNC_REMOTOOLS' WHERE cnc_id = 'Heidenhain';
UPDATE m_cnc_monitor_page SET cnc_id = 'HURCO_CNC_MODBUS'         WHERE cnc_id = 'HURCO';
UPDATE m_cnc_monitor_page SET cnc_id = 'INTEK_CNC_PROTOCOL'       WHERE cnc_id = 'INTEK';
UPDATE m_cnc_monitor_page SET cnc_id = 'LNC_CNC_SCIF'             WHERE cnc_id = 'LNC';
UPDATE m_cnc_monitor_page SET cnc_id = 'MITSUBISHI_CNC_EZNCCOM'   WHERE cnc_id = 'Mitsubishi';
UPDATE m_cnc_monitor_page SET cnc_id = 'SIEMENS_CNC_RPC'          WHERE cnc_id = 'Siemens';
UPDATE m_cnc_monitor_page SET cnc_id = 'ITRI_CNC_GMCN'            WHERE cnc_id = 'ITRI';
UPDATE m_cnc_monitor_page SET cnc_id = 'SYNTEC_CNC_REMOTEAPI'     WHERE cnc_id = 'SYNTEC';

UPDATE m_device_cnc_brand SET cnc_id = 'FANUC_CNC_FOCAS'          WHERE cnc_id = 'FANUC'; 
UPDATE m_device_cnc_brand SET cnc_id = 'HEIDENHAIN_CNC_REMOTOOLS' WHERE cnc_id = 'Heidenhain'; 
UPDATE m_device_cnc_brand SET cnc_id = 'HURCO_CNC_MODBUS'         WHERE cnc_id = 'HURCO'; 
UPDATE m_device_cnc_brand SET cnc_id = 'INTEK_CNC_PROTOCOL'       WHERE cnc_id = 'INTEK'; 
UPDATE m_device_cnc_brand SET cnc_id = 'LNC_CNC_SCIF'             WHERE cnc_id = 'LNC'; 
UPDATE m_device_cnc_brand SET cnc_id = 'MITSUBISHI_CNC_EZNCCOM'   WHERE cnc_id = 'Mitsubishi'; 
UPDATE m_device_cnc_brand SET cnc_id = 'SIEMENS_CNC_RPC'          WHERE cnc_id = 'Siemens'; 
UPDATE m_device_cnc_brand SET cnc_id = 'ITRI_CNC_GMCN'            WHERE cnc_id = 'ITRI'; 
UPDATE m_device_cnc_brand SET cnc_id = 'SYNTEC_CNC_REMOTEAPI'     WHERE cnc_id = 'SYNTEC'; 

UPDATE m_alarm SET cnc_id = 'FANUC_CNC_FOCAS'          WHERE cnc_id = 'FANUC'; 
UPDATE m_alarm SET cnc_id = 'HEIDENHAIN_CNC_REMOTOOLS' WHERE cnc_id = 'Heidenhain';
UPDATE m_alarm SET cnc_id = 'HURCO_CNC_MODBUS'         WHERE cnc_id = 'HURCO'; 
UPDATE m_alarm SET cnc_id = 'INTEK_CNC_PROTOCOL'       WHERE cnc_id = 'INTEK'; 
UPDATE m_alarm SET cnc_id = 'LNC_CNC_SCIF'             WHERE cnc_id = 'LNC'; 
UPDATE m_alarm SET cnc_id = 'MITSUBISHI_CNC_EZNCCOM'   WHERE cnc_id = 'Mitsubishi';
UPDATE m_alarm SET cnc_id = 'SIEMENS_CNC_RPC'          WHERE cnc_id = 'Siemens'; 
UPDATE m_alarm SET cnc_id = 'ITRI_CNC_GMCN'            WHERE cnc_id = 'ITRI'; 
UPDATE m_alarm SET cnc_id = 'SYNTEC_CNC_REMOTEAPI'     WHERE cnc_id = 'SYNTEC'; 

-- step 3: delete old brand
DELETE FROM m_cnc_brand WHERE cnc_id IN ('FANUC', 'Heidenhain', 'HURCO', 'INTEK', 'LNC', 'Mitsubishi', 'Siemens', 'ITRI', 'SYNTEC');