
INSERT INTO `m_box` (`box_id`,`ip`,`port`,`box_mac`,`create_time`,`create_by`,`modify_time`,`modify_by`) VALUES
 ('FOXCONNP02D01','127.0.0.1','52009','','2018-06-20 17:42:47','admin','2018-06-21 14:55:10','@st@STAdmin'),
 ('FOXCONNP02D02','','','','2018-06-21 14:55:25','@st@STAdmin',NULL,NULL),
 ('FOXCONNP02D03','127.0.0.1','52009','','2018-06-21 14:56:00','@st@STAdmin',NULL,NULL)
ON DUPLICATE KEY UPDATE 
`box_id` = VALUES(`box_id`),
`ip` = VALUES(`ip`),
`port` = VALUES(`port`),
`box_mac` = VALUES(`box_mac`),
`create_time` = VALUES(`create_time`),
`create_by` = VALUES(`create_by`),
`modify_time` = VALUES(`modify_time`),
`modify_by` = VALUES(`modify_by`);

