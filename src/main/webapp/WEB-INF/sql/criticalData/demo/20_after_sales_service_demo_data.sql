-- 產品 AS

INSERT INTO `m_db_max_index` (`table_name`, `desc`, `max_index`) VALUES
("m_machine_alarm","用來記錄machine alarm pk最大值",0),
("a_alarm_clear_file","故障排除檔案上傳pk最大值",0),
("a_alarm_clear_step","故障排除步驟pk最大值",0);

INSERT INTO `a_aftersalesservice_cus_area` VALUES 
('CN', '大陸', 'admin', '2016-6-7 09:57:44', NULL, NULL),
('HK', '香港', 'admin', '2016-6-7 09:57:57', NULL, NULL),
('JP', '日本', 'admin', '2016-6-7 09:58:08', NULL, NULL),
('KR', '韓國', 'admin', '2016-6-7 09:59:17', NULL, NULL),
('TW', '台灣', 'admin', '2016-6-7 09:57:32', NULL, NULL),
('USA', '美國', 'admin', '2016-6-7 09:58:19', NULL, NULL);

INSERT INTO `a_aftersalesservice_cus_factor` VALUES 
('ST1', '科智1號代理商', 'admin', '2016-6-7 10:00:43', NULL, NULL),
('ST2', '科智2號代理商', 'admin', '2016-6-7 10:00:50', NULL, NULL),
('ST3', '科智3號代理商', 'admin', '2016-6-7 10:00:58', NULL, NULL),
('ST4', '科智4號代理商', 'admin', '2016-6-7 10:01:08', NULL, NULL),
('ST5', '科智5號代理商', 'admin', '2016-6-7 10:01:23', NULL, NULL);

INSERT INTO `a_aftersalesservice_cus_trade` VALUES 
('A', '農、林、漁、牧業', 'admin', '2016-6-7 09:45:24', 'admin', '2016-6-7 09:45:34'),
('B', '礦石業及土石採取業', 'admin', '2016-6-7 09:46:02', NULL, NULL),
('C', '製造業', 'admin', '2016-6-7 09:46:15', NULL, NULL),
('D', '電力及燃氣供應業', 'admin', '2016-6-7 09:47:03', NULL, NULL),
('E', '用水供應及污染整治業', 'admin', '2016-6-7 09:47:59', NULL, NULL),
('F', '營建工程業', 'admin', '2016-6-7 09:48:20', NULL, NULL),
('G', '批發及零售業', 'admin', '2016-6-7 09:48:41', NULL, NULL),
('H', '運輸及倉儲業', 'admin', '2016-6-7 09:49:21', NULL, NULL),
('I', '住宿及餐飲業', 'admin', '2016-6-7 09:49:45', NULL, NULL),
('J', '出版、影音製作、傳播及資通訊服務業', 'admin', '2016-6-7 09:50:47', NULL, NULL),
('K', '金融及保險業', 'admin', '2016-6-7 09:51:14', NULL, NULL),
('L', '不動產業', 'admin', '2016-6-7 09:51:47', NULL, NULL),
('M', '專業、科學及技術服務業', 'admin', '2016-6-7 09:52:26', NULL, NULL),
('N', '支援服務業', 'admin', '2016-6-7 09:53:26', NULL, NULL),
('O', '公共行政及國防；強制性社會安全', 'admin', '2016-6-7 09:54:10', NULL, NULL),
('P', '教育業', 'admin', '2016-6-7 09:54:25', NULL, NULL),
('Q', '醫療保健及社會工作服務業', 'admin', '2016-6-7 09:55:09', NULL, NULL),
('R', '藝術、娛樂及休閒服務業', 'admin', '2016-6-7 09:55:35', NULL, NULL),
('S', '其他服務業', 'admin', '2016-6-7 09:55:55', NULL, NULL);

INSERT INTO `a_aftersalesservice_cus_type` VALUES 
('T1', 'Type1', 'admin', '2016-6-7 09:42:16', NULL, NULL),
('T2', 'Type2', 'admin', '2016-6-7 09:42:23', NULL, NULL),
('T3', 'Type3', 'admin', '2016-6-7 09:42:30', NULL, NULL),
('T4', 'Type4', 'admin', '2016-6-7 09:57:12', NULL, NULL),
('T5', 'Type5', 'admin', '2016-6-7 09:57:22', NULL, NULL);


INSERT INTO `a_aftersalesservice_customer` VALUES 
('C001', '科智企業股份有限公司', '54685351', 'M', 'TW', '25622733', '25622763', '台北市中山區松江路76號5樓', 'Test1', 'ST1', 0, 'Boss', '00', '0939999999', 'servtech@servtech.com.tw', 'admin', '2016-6-7 10:04:04', NULL, NULL);

INSERT INTO `a_aftersalesservice_entity` VALUES 
('1', '藍屏', 'admin', '2016-6-7 10:08:01', NULL, NULL),
('2', '藍屏', 'admin', '2016-6-7 10:08:10', NULL, NULL),
('3', '藍屏', 'admin', '2016-6-7 10:08:20', NULL, NULL),
('4', '藍屏', 'admin', '2016-6-7 10:08:32', NULL, NULL),
('5', '藍屏', 'admin', '2016-6-7 10:08:41', NULL, NULL),
('6', '藍屏', 'admin', '2016-6-7 10:08:49', NULL, NULL);

INSERT INTO `a_aftersalesservice_entity_breakdown` VALUES 
('0x0001', '1', '不正確的函數', 'admin', '2016-6-7 10:09:26', NULL, NULL),
('0x0002', '2', '系統找不到指定的檔案', 'admin', '2016-6-7 10:09:52', NULL, NULL),
('0x0003', '3', '系統找不到指定的路徑', 'admin', '2016-6-7 10:10:08', NULL, NULL),
('0x0004', '4', '系統無法開啟檔案', 'admin', '2016-6-7 10:10:20', NULL, NULL),
('0x0005', '5', '拒絕存取', 'admin', '2016-6-7 10:10:33', NULL, NULL),
('0x0006', '6', '無效的代碼', 'admin', '2016-6-7 10:10:48', NULL, NULL);

INSERT INTO `a_aftersalesservice_entity_emp` VALUES 
('1', 'admin', 'admin', '2016-6-7 10:08:01', NULL, NULL),
('1', 'agent', 'admin', '2016-6-7 10:08:01', NULL, NULL),
('1', 'user', 'admin', '2016-6-7 10:08:01', NULL, NULL),
('2', 'admin', 'admin', '2016-6-7 10:08:10', NULL, NULL),
('2', 'agent', 'admin', '2016-6-7 10:08:10', NULL, NULL),
('2', 'user', 'admin', '2016-6-7 10:08:10', NULL, NULL),
('3', 'admin', 'admin', '2016-6-7 10:08:20', NULL, NULL),
('3', 'agent', 'admin', '2016-6-7 10:08:20', NULL, NULL),
('3', 'user', 'admin', '2016-6-7 10:08:20', NULL, NULL),
('4', 'admin', 'admin', '2016-6-7 10:08:32', NULL, NULL),
('4', 'agent', 'admin', '2016-6-7 10:08:32', NULL, NULL),
('4', 'user', 'admin', '2016-6-7 10:08:32', NULL, NULL),
('5', 'admin', 'admin', '2016-6-7 10:08:41', NULL, NULL),
('5', 'agent', 'admin', '2016-6-7 10:08:41', NULL, NULL),
('5', 'user', 'admin', '2016-6-7 10:08:41', NULL, NULL),
('6', 'admin', 'admin', '2016-6-7 10:08:49', NULL, NULL),
('6', 'agent', 'admin', '2016-6-7 10:08:49', NULL, NULL),
('6', 'user', 'admin', '2016-6-7 10:08:49', NULL, NULL);

INSERT INTO `a_aftersalesservice_material` VALUES 
('A0001', '螺絲A', 1000, '', 'admin', '2016-6-7 10:19:28', NULL, NULL),
('A0002', '螺絲B', 1000, '', 'admin', '2016-6-7 10:19:49', NULL, NULL),
('A0003', '螺絲C', 1000, '', 'admin', '2016-6-7 10:19:58', NULL, NULL),
('A0004', '螺絲D', 1000, '', 'admin', '2016-6-7 10:20:07', NULL, NULL),
('A0005', '螺絲E', 1000, '', 'admin', '2016-6-7 10:20:17', NULL, NULL);

INSERT INTO `a_aftersalesservice_product` VALUES 
('P01', 'App', NULL, 'admin', '2016-6-7 10:04:32', NULL, NULL),
('P02', 'Web', NULL, 'admin', '2016-6-7 10:04:40', NULL, NULL);

INSERT INTO `a_aftersalesservice_repair_kind` VALUES 
(1, '報修', 'admin', '2016-6-7 10:11:58', 'admin', '2016-6-7 10:12:22'),
(2, '保養', 'admin', '2016-6-7 10:12:46', NULL, NULL),
(3, '咨詢', 'admin', '2016-6-7 10:13:05', NULL, NULL),
(4, '客訴', 'admin', '2016-6-7 10:13:13', NULL, NULL);
