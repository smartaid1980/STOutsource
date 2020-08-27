--
-- Dumping data for table `a_chengshiu_alarm`
--

/*!40000 ALTER TABLE `a_chengshiu_alarm` DISABLE KEYS */;
INSERT INTO `a_chengshiu_alarm` (`alarm_id`,`alarm_name`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('M1-M21_01','翻轉堵塞','Y','admin',NOW(),'admin',NOW()),
 ('M1-M21_02','蓄料堵塞','Y','admin',NOW(),'admin',NOW()),
 ('M1-M21_03','下壓堵塞','Y','admin',NOW(),'admin',NOW()),
 ('M1-M21_04','蓄料逾時','Y','admin',NOW(),'admin',NOW()),
 ('M1_10','超音波過載','Y','admin',NOW(),'admin',NOW()),
 ('M1_21','料捲缺料','Y','admin',NOW(),'admin',NOW()),
 ('M21_21','耳帶缺料','Y','admin',NOW(),'admin',NOW()),
 ('M21_22','邊帶缺料','Y','admin',NOW(),'admin',NOW()),
 ('M31_10','包裝機故障','Y','admin',NOW(),'admin',NOW());
/*!40000 ALTER TABLE `a_chengshiu_alarm` ENABLE KEYS */;

--
-- Dumping data for table `a_chengshiu_conversion_factor`
--

/*!40000 ALTER TABLE `a_chengshiu_conversion_factor` DISABLE KEYS */;
INSERT INTO `a_chengshiu_conversion_factor` (`conv_id`,`conv_name`,`conv_factor`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('box_to_pcs','箱_片轉換係數',50,'admin',NOW(),'admin',NOW());
/*!40000 ALTER TABLE `a_chengshiu_conversion_factor` ENABLE KEYS */;

--
-- Dumping data for table `a_chengshiu_customer`
--

/*!40000 ALTER TABLE `a_chengshiu_customer` DISABLE KEYS */;
-- INSERT INTO `a_chengshiu_customer` (`customer_id`,`customer_name`,`telephone`,`address`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
--  ('storeA','商店A','0912345678','正修科大A棟','Y','admin',NOW(),'admin',NOW()),
--  ('storeB','商店B','0912876543','正修科大B棟','Y','admin',NOW(),'admin',NOW()),
--  ('storeC','商店C','0912888888','正修科大C棟','Y','admin',NOW(),'admin',NOW());
/*!40000 ALTER TABLE `a_chengshiu_customer` ENABLE KEYS */;

--
-- Dumping data for table `a_chengshiu_demand_reason`
--

/*!40000 ALTER TABLE `a_chengshiu_demand_reason` DISABLE KEYS */;
INSERT INTO `a_chengshiu_demand_reason` (`reason_id`,`reason_name`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('1','訂單數量不足','Y','admin',NOW(),'admin',NOW()),
 ('2','低於安全存量','Y','admin',NOW(),'admin',NOW());
/*!40000 ALTER TABLE `a_chengshiu_demand_reason` ENABLE KEYS */;


--
-- Dumping data for table `a_chengshiu_line`
--

/*!40000 ALTER TABLE `a_chengshiu_line` DISABLE KEYS */;
INSERT INTO `a_chengshiu_line` (`line_id`,`line_name`,`work_id`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('demo_line','口罩示範線',NULL,'Y','admin',NOW(),'admin',NOW());
/*!40000 ALTER TABLE `a_chengshiu_line` ENABLE KEYS */;


--
-- Dumping data for table `a_chengshiu_machine`
--

/*!40000 ALTER TABLE `a_chengshiu_machine` DISABLE KEYS */;
INSERT INTO `a_chengshiu_machine` (`machine_id`,`machine_name`,`line_id`,`type`,`is_open`,`trace_id`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('CSU_PL1','壓合機','demo_line','M1','Y',NULL,'admin',NOW(),'admin',NOW()),
 ('CSU_PL2','貼耳機','demo_line','M21','Y',NULL,'admin',NOW(),'admin',NOW()),
 ('CSU_PL3','包裝機','demo_line','M31','Y',NULL,'admin',NOW(),'admin',NOW()),
 ('CSU_PL4','裝籃機','demo_line','M41','Y',NULL,'admin',NOW(),'admin',NOW());
--  ('CSU_AGVA','AGVA',NULL,'A','Y',NULL,'admin',NOW(),'admin',NOW()),
--  ('CSU_AGVB','AGVB',NULL,'A','Y',NULL,'admin',NOW(),'admin',NOW());
/*!40000 ALTER TABLE `a_chengshiu_machine` ENABLE KEYS */;


--
-- Dumping data for table `a_chengshiu_material`
--

/*!40000 ALTER TABLE `a_chengshiu_material` DISABLE KEYS */;
INSERT INTO `a_chengshiu_material` (`material_id`,`material_name`,`material_spec`,`default_pcs`,`alert_pcs`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('PP','外層布面','1500M/卷',8500,1000,'Y','admin',NOW(),'admin',NOW()),
 ('MB','中層布面','1500M/卷',8500,1000,'Y','admin',NOW(),'admin',NOW()),
 ('ES','內層布面','3000M/卷',17000,1000,'Y','admin',NOW(),'admin',NOW()),
 ('NW','鼻帶','500M/KG',5000,1000,'Y','admin',NOW(),'admin',NOW()),
 ('EW','邊條','800M/卷',8000,1000,'Y','admin',NOW(),'admin',NOW()),
 ('PC','包材','240*1500M/R',6800,1000,'Y','admin',NOW(),'admin',NOW());
/*!40000 ALTER TABLE `a_chengshiu_material` ENABLE KEYS */;


--
-- Dumping data for table `a_chengshiu_material_item`
--

/*!40000 ALTER TABLE `a_chengshiu_material_item` DISABLE KEYS */;
INSERT INTO `a_chengshiu_material_item` (`item_id`,`material_id`,`machine_id`,`mark_pcs`,`usable_pcs`,`status_id`,`pstoring_id`,`purchase_time`,`exp_date`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('PP_20180301','PP','CSU_PL1',0,500,3,NULL,'2018-03-01 15:33:11',NULL,'admin',NOW(),'admin',NOW()),
 ('MB_20180301','MB','CSU_PL1',0,5000,3,NULL,'2018-03-01 15:33:11',NULL,'admin',NOW(),'admin',NOW()),
 ('ES_20180301','ES','CSU_PL1',0,5000,3,NULL,'2018-03-01 15:33:11',NULL,'admin',NOW(),'admin',NOW()),
 ('NW_20180301','NW','CSU_PL1',0,5000,3,NULL,'2018-03-01 15:33:11',NULL,'admin',NOW(),'admin',NOW()),
 ('EW_20180301','EW','CSU_PL2',0,5000,3,NULL,'2018-03-01 15:33:11',NULL,'admin',NOW(),'admin',NOW()),
 ('EW_20180302','EW','CSU_PL2',0,5000,3,NULL,'2018-03-01 15:33:11',NULL,'admin',NOW(),'admin',NOW()),
 ('PC_20180301','PC','CSU_PL3',0,5000,3,NULL,'2018-03-01 15:33:11',NULL,'admin',NOW(),'admin',NOW());
/*!40000 ALTER TABLE `a_chengshiu_material_item` ENABLE KEYS */;


--
-- Dumping data for table `a_chengshiu_material_item`
--

/*!40000 ALTER TABLE `a_chengshiu_material_item` DISABLE KEYS */;
INSERT INTO `a_chengshiu_machine_material` (`machine_id`,`material_id`,`alert_refueling`,`concur_usable`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('CSU_PL1','PP',100,1,'Y','admin',NOW(),'admin',NOW()),
 ('CSU_PL1','MB',100,1,'Y','admin',NOW(),'admin',NOW()),
 ('CSU_PL1','ES',100,1,'Y','admin',NOW(),'admin',NOW()),
 ('CSU_PL1','NW',100,1,'Y','admin',NOW(),'admin',NOW()),
 ('CSU_PL2','EW',100,1,'Y','admin',NOW(),'admin',NOW()),
 ('CSU_PL3','PC',100,1,'Y','admin',NOW(),'admin',NOW());
/*!40000 ALTER TABLE `a_chengshiu_material_item` ENABLE KEYS */;


--
-- Dumping data for table `a_chengshiu_product`
--

/*!40000 ALTER TABLE `a_chengshiu_product` DISABLE KEYS */;
INSERT INTO `a_chengshiu_product` (`product_id`,`product_name`,`product_quality_sp`,`buffer_stock`,`booking_stock`,`total_remander`,`inventory`,`not_instorage`,`usable_stock`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('maskB01','口罩B01(藍)',90.0,2,0,0,0,0,0,'Y','admin',NOW(),'admin',NOW());
-- ('G01','口罩G01(綠)',2,0,0,0,0,0,'Y','admin',NOW(),'admin',NOW());
/*!40000 ALTER TABLE `a_chengshiu_product` ENABLE KEYS */;



--
-- Dumping data for table `a_chengshiu_storing`
--

/*!40000 ALTER TABLE `a_chengshiu_storing` DISABLE KEYS */;
INSERT INTO `a_chengshiu_storing` (`pstoring_id`,`pstoring_name`,`status_id`,`shelf_id`,`area_id`,`type_id`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('G_PL401()','A_H','0','A_WAY','CSU_DEMO','H','Y','admin',NOW(),'admin',NOW()),
 ('G_PL402()','A_L','0','A_WAY','CSU_DEMO','L','Y','admin',NOW(),'admin',NOW()),
 ('G_PL403()','B_H','0','B_WAY','CSU_DEMO','H','Y','admin',NOW(),'admin',NOW()),
 ('G_PL404()','B_L','0','B_WAY','CSU_DEMO','L','Y','admin',NOW(),'admin',NOW()),
 ('G_PL405()','C_H','0','C_WAY','CSU_DEMO','H','Y','admin',NOW(),'admin',NOW()),
 ('G_PL406()','C_L','0','C_WAY','CSU_DEMO','L','Y','admin',NOW(),'admin',NOW());
/*!40000 ALTER TABLE `a_chengshiu_storing` ENABLE KEYS */;



--
-- Dumping data for table `a_chengshiu_storing_area`
--

/*!40000 ALTER TABLE `a_chengshiu_storing_area` DISABLE KEYS */;
INSERT INTO `a_chengshiu_storing_area` (`area_id`,`area_name`,`remark`,`type`,`in_out_type`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('CSU_DEMO','正修成品示範區',NULL,'P','1','Y','admin',NOW(),'admin',NOW());
/*!40000 ALTER TABLE `a_chengshiu_storing_area` ENABLE KEYS */;


--
-- Dumping data for table `a_chengshiu_storing_shelf`
--

/*!40000 ALTER TABLE `a_chengshiu_storing_shelf` DISABLE KEYS */;
INSERT INTO `a_chengshiu_storing_shelf` (`shelf_id`,`shelf_name`,`area_id`,`remark`,`is_open`,`create_by`,`create_time`,`modify_by`,`modify_time`) VALUES 
 ('A_WAY','成品A道','CSU_DEMO',NULL,'Y','admin',NOW(),'admin',NOW()),
 ('B_WAY','成品B道','CSU_DEMO',NULL,'Y','admin',NOW(),'admin',NOW()),
 ('C_WAY','成品C道','CSU_DEMO',NULL,'Y','admin',NOW(),'admin',NOW());
/*!40000 ALTER TABLE `a_chengshiu_storing_shelf` ENABLE KEYS */;
