
INSERT INTO `m_device_cnc_brand` (`device_id`,`cnc_id`) VALUES
  ('_FOXCONNP01D01M026','CHMER_EDM_UDP'),
 ('_FOXCONNP01D01M027','CHMER_EDM_UDP'),
 ('_FOXCONNP01D01M005','FANUC_CNC_FOCAS'),
 ('_FOXCONNP01D01M006','FANUC_CNC_FOCAS'),
 ('_FOXCONNP01D01M028','HEXAGON_CMM_DMIS'),
 ('_FOXCONNP01D01M029','HEXAGON_CMM_DMIS'),
 ('_FOXCONNP01D01M051','JL_GRINDER_B'),
 ('_FOXCONNP01D01M031','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M032','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M033','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M034','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M035','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M036','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M037','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M038','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M039','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M040','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M041','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M042','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M043','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M044','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M045','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M046','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M047','JL_GRINDER_HM'),
 ('_FOXCONNP01D01M048','JL_GRINDER_M'),
 ('_FOXCONNP01D01M049','JL_GRINDER_M'),
 ('_FOXCONNP01D01M050','JL_GRINDER_M'),
 ('_FOXCONNP01D01M001','MAKINO_CNC_FOCAS'),
 ('_FOXCONNP01D01M002','MAKINO_CNC_FOCAS'),
 ('_FOXCONNP01D01M003','MAKINO_CNC_FOCAS'),
 ('_FOXCONNP01D01M004','MAKINO_CNC_FOCAS'),
 ('_FOXCONNP01D01M007','MAKINO_CNC_FOCAS'),
 ('_FOXCONNP01D01M017','MAKINO_EDM_MEL'),
 ('_FOXCONNP01D01M018','MAKINO_EDM_MEL'),
 ('_FOXCONNP01D01M019','MAKINO_EDM_MEL'),
 ('_FOXCONNP01D01M020','MAKINO_EDM_MEL'),
 ('_FOXCONNP01D01M021','MAKINO_EDM_MEL'),
 ('_FOXCONNP01D01M022','MAKINO_EDM_MEL'),
 ('_FOXCONNP01D01M023','MAKINO_EDM_MEL'),
 ('_FOXCONNP01D01M024','MAKINO_EDM_MEL'),
 ('_FOXCONNP01D01M025','MAKINO_EDM_MEL'),
 ('_FOXCONNP01D01M052','QJ_MILL_B'),
 ('_FOXCONNP01D01M053','QJ_MILL_B'),
 ('_FOXCONNP01D01M054','QJ_MILL_B'),
 ('_FOXCONNP01D01M055','QJ_MILL_B'),
 ('_FOXCONNP01D01M056','QJ_MILL_B'),
 ('_FOXCONNP01D01M057','QJ_MILL_B'),
 ('_FOXCONNP01D01M058','QJ_MILL_B'),
 ('_FOXCONNP01D01M059','QJ_MILL_B'),
 ('_FOXCONNP01D01M060','QJ_MILL_B'),
 ('_FOXCONNP01D01M008','SODICK_EDM_MC'),
 ('_FOXCONNP01D01M009','SODICK_EDM_MC'),
 ('_FOXCONNP01D01M010','SODICK_EDM_MC'),
 ('_FOXCONNP01D01M011','SODICK_EDM_MC'),
 ('_FOXCONNP01D01M012','SODICK_EDM_MC'),
 ('_FOXCONNP01D01M013','SODICK_EDM_MC'),
 ('_FOXCONNP01D01M014','SODICK_EDM_MC'),
 ('_FOXCONNP01D01M015','SODICK_EDM_MC'),
 ('_FOXCONNP01D01M016','SODICK_EDM_MC'),
 ('_FOXCONNP01D01M030','SODICK_EDM_MC')
ON DUPLICATE KEY UPDATE 
`device_id` = VALUES(`device_id`),
`cnc_id` = VALUES(`cnc_id`);

 