DROP TABLE IF EXISTS `a_queryrfq_supplier`;
CREATE TABLE `a_queryrfq_supplier` (
  `sup_id` varchar(10) NOT NULL DEFAULT '' COMMENT '供應商代碼',
  `sup_shortname` varchar(30) NOT NULL DEFAULT '' COMMENT '供應商簡稱',
  `sup_name` varchar(80) NOT NULL DEFAULT '' COMMENT '供應商全名',
  `tax_id_no` varchar(20) DEFAULT NULL COMMENT '統一編號',
  `tel1` varchar(20) DEFAULT NULL COMMENT 'TEL(一)',
  `tel2` varchar(20) DEFAULT NULL COMMENT 'TEL(二)',
  `fax_no` varchar(20) DEFAULT NULL COMMENT 'FAX NO',
  `email` varchar(60) DEFAULT NULL COMMENT 'EMAIL',
  `manager` varchar(30) DEFAULT NULL COMMENT '負責人',
  `contact` varchar(30) DEFAULT NULL COMMENT '聯絡人',
  `address` varchar(255) DEFAULT NULL COMMENT '聯絡地址',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '最後修改時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改者',
  PRIMARY KEY (`sup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='供應商';

DROP TABLE IF EXISTS `a_queryrfq_po_list`;
CREATE TABLE `a_queryrfq_po_list` (
  `po_no` varchar(40) NOT NULL DEFAULT '' COMMENT '採購單號',
  `seq_no` varchar(5) NOT NULL DEFAULT '' COMMENT '序號',
  `po_time` date NOT NULL DEFAULT '0000-00-00' COMMENT '採購日期',
  `sup_id` varchar(10) NOT NULL DEFAULT '' COMMENT '廠商代碼',
  `item_id` varchar(40) NOT NULL DEFAULT '' COMMENT '品號',
  `item_name` varchar(120) NOT NULL DEFAULT '' COMMENT '品名',
  `item_spec` varchar(120) NOT NULL DEFAULT '' COMMENT '規格',
  `po_qty` numeric(16,3) NOT NULL DEFAULT '0' COMMENT '採購數量',
  `unit` varchar(10) NOT NULL DEFAULT '' COMMENT '單位',
  `lead_time` date DEFAULT NULL COMMENT '預交期',
  `orig_lead_time` date DEFAULT NULL COMMENT '原預交期',
  `cfm_lead_time` date DEFAULT NULL COMMENT '交期確認日',
  `is_close` varchar(1) NOT NULL DEFAULT '' COMMENT 'ERP結案碼(N:未結案, Y:已結案)',
  `create_date` date DEFAULT NULL COMMENT '新增時間',
  `modi_date` date DEFAULT NULL COMMENT '修改時間',
  PRIMARY KEY (`po_no`,`seq_no`),
  KEY `FK_a_queryrfq_po_list_sup_id` (`sup_id`),
  CONSTRAINT `FK_a_queryrfq_po_list_sup_id` FOREIGN KEY (`sup_id`) REFERENCES `a_queryrfq_supplier` (`sup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='採購單明細檔';

DROP TABLE IF EXISTS `a_queryrfq_demand_list`;
CREATE TABLE `a_queryrfq_demand_list` (
  `form_id` varchar(40) NOT NULL DEFAULT '' COMMENT '需求單號',
  `seq_no` varchar(5) NOT NULL DEFAULT '0001' COMMENT '序號',
  `sup_id` varchar(10) NOT NULL DEFAULT '' COMMENT '廠商代碼',
  `form_type` varchar(1) NOT NULL DEFAULT '' COMMENT '單據類型(0:採購單, 1:詢價單)',
  `st_lead_time` date DEFAULT NULL COMMENT '預交日(平台)',
  `po_check` varchar(1) DEFAULT NULL COMMENT '是否已確認交期(N:未確認, Y:已確認)',
  `is_close` varchar(1) NOT NULL DEFAULT '' COMMENT '是否結案(N:未結案, Y:已結案)',
  `close_time` datetime DEFAULT NULL COMMENT '結案時間',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者',
  `modify_time` datetime DEFAULT NULL COMMENT '最後修改時間',
  `modify_by` varchar(50) DEFAULT NULL COMMENT '最後修改者',
  PRIMARY KEY (`form_id`,`seq_no`,`sup_id`),
  KEY `FK_a_queryrfq_demand_list_sup_id` (`sup_id`),
  CONSTRAINT `FK_a_queryrfq_demand_list_sup_id` FOREIGN KEY (`sup_id`) REFERENCES `a_queryrfq_supplier` (`sup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='需求單';

DROP TABLE IF EXISTS `a_queryrfq_leadtime_chg_log`;
CREATE TABLE `a_queryrfq_leadtime_chg_log` (
  `form_id` varchar(40) NOT NULL DEFAULT '' COMMENT '需求單號',
  `seq_no` varchar(5) NOT NULL DEFAULT '0001' COMMENT '序號',
  `sup_id` varchar(10) NOT NULL DEFAULT '' COMMENT '廠商代碼',
  `orig_lead_time` date DEFAULT NULL COMMENT '異動前預交日',
  `chg_lead_time` date NOT NULL DEFAULT '0000-00-00' COMMENT '異動後預交日',
  `check_time` datetime DEFAULT NULL COMMENT '確認交期時間',
  `check_by` varchar(50) DEFAULT NULL COMMENT '確認交期人',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '建立時間',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '建立者(新增紀錄者或修改交期者)',
  PRIMARY KEY (`form_id`,`seq_no`,`sup_id`,`create_time`),
  KEY `FK_a_queryrfq_leadtime_chg_log_form_id_seq_no` (`form_id`,`seq_no`),
  KEY `FK_a_queryrfq_leadtime_chg_log_sup_id` (`sup_id`),
  CONSTRAINT `FK_a_queryrfq_leadtime_chg_log_form_id_seq_no` FOREIGN KEY (`form_id`,`seq_no`) REFERENCES `a_queryrfq_demand_list` (`form_id`,`seq_no`),
  CONSTRAINT `FK_a_queryrfq_leadtime_chg_log_sup_id` FOREIGN KEY (`sup_id`) REFERENCES `a_queryrfq_supplier` (`sup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='交期異動紀錄';

DROP TABLE IF EXISTS `a_queryrfq_questions`;
CREATE TABLE `a_queryrfq_questions` (
  `qu_id` varchar(7) NOT NULL DEFAULT '' COMMENT '加工問題單號',
  `form_id` varchar(40) NOT NULL DEFAULT '' COMMENT '需求單號',
  `seq_no` varchar(5) NOT NULL DEFAULT '' COMMENT '序號',
  `sup_id` varchar(10) NOT NULL DEFAULT '' COMMENT '廠商代碼',
  `class` varchar(1) NOT NULL DEFAULT '' COMMENT '問題等級(0:一般, 1:緊急)',
  `status` varchar(1) NOT NULL DEFAULT '' COMMENT '問題狀態(0:新問題, 1:進行中, 2:已取消, 3:已關閉)',
  `title` varchar(60) NOT NULL DEFAULT '' COMMENT '問題標題',
  `description` varchar(300) NOT NULL DEFAULT '' COMMENT '問題說明',
  `assign_to` varchar(50) NOT NULL DEFAULT '' COMMENT '目前被指派群組',
  `prev_assign_to` varchar(50) DEFAULT NULL COMMENT '上一站被指派群組',
  `is_classified` varchar(1) NOT NULL DEFAULT '' COMMENT '是否為機密問題(N:一般, Y:機密)',
  `create_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '新增時間',
  `create_by` varchar(50) NOT NULL DEFAULT '' COMMENT '新增人',
  `modify_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '最後修改時間',
  `modify_by` varchar(50) NOT NULL DEFAULT '' COMMENT '最後修改人',
  PRIMARY KEY (`qu_id`),
  KEY `FK_a_queryrfq_questions_form_id_seq_no` (`form_id`,`seq_no`),
  KEY `FK_a_queryrfq_questions_sup_id` (`sup_id`),
  CONSTRAINT `FK_a_queryrfq_questions_form_id_seq_no` FOREIGN KEY (`form_id`,`seq_no`) REFERENCES `a_queryrfq_demand_list` (`form_id`,`seq_no`),
  CONSTRAINT `FK_a_queryrfq_questions_sup_id` FOREIGN KEY (`sup_id`) REFERENCES `a_queryrfq_supplier` (`sup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='加工問題';

DROP TABLE IF EXISTS `a_queryrfq_questions_reply`;
CREATE TABLE `a_queryrfq_questions_reply` (
  `reply_id` varchar(10) NOT NULL DEFAULT '' COMMENT '回覆紀錄ID',
  `qu_id` varchar(7) NOT NULL DEFAULT '' COMMENT '加工問題單號',
  `reply_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '回覆時間',
  `reply_by` varchar(50) NOT NULL DEFAULT '' COMMENT '回覆人',
  `content` varchar(300) NOT NULL DEFAULT '' COMMENT '回覆內容',
  PRIMARY KEY (`reply_id`),
  KEY `a_queryrfq_questions_reply_qu_id` (`qu_id`),
  CONSTRAINT `a_queryrfq_questions_reply_qu_id` FOREIGN KEY (`qu_id`) REFERENCES `a_queryrfq_questions` (`qu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='問題回覆紀錄';

DROP TABLE IF EXISTS `a_queryrfq_questions_process_log`;
CREATE TABLE `a_queryrfq_questions_process_log` (
  `log_id` varchar(10) NOT NULL DEFAULT '' COMMENT '處理紀錄ID',
  `qu_id` varchar(7) NOT NULL DEFAULT '' COMMENT '加工問題單號',
  `process_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '處理時間',
  `process_by` varchar(50) NOT NULL DEFAULT '' COMMENT '處理人',
  `process_status` varchar(100) NOT NULL DEFAULT '' COMMENT '變更狀態',
  `assignment` varchar(100) DEFAULT NULL COMMENT '操作行為',
  PRIMARY KEY (`log_id`),
  KEY `a_queryrfq_questions_process_log_qu_id` (`qu_id`),
  CONSTRAINT `a_queryrfq_questions_process_log_qu_id` FOREIGN KEY (`qu_id`) REFERENCES `a_queryrfq_questions` (`qu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='問題處理紀錄';

DROP TABLE IF EXISTS `a_queryrfq_questions_file`;
CREATE TABLE `a_queryrfq_questions_file` (
  `file_id` varchar(10) NOT NULL DEFAULT '' COMMENT '附件ID',
  `qu_id` varchar(7) NOT NULL DEFAULT '' COMMENT '加工問題單號',
  `file_type` varchar(1) NOT NULL DEFAULT '' COMMENT '附件類型(0:一般, 1:報價)',
  `file_name` varchar(60) NOT NULL DEFAULT '' COMMENT '檔案名稱',
  `file_path` varchar(200) NOT NULL DEFAULT '' COMMENT '檔案路徑',
  `upload_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '上傳時間',
  `upload_by` varchar(50) NOT NULL DEFAULT '' COMMENT '上傳人',
  PRIMARY KEY (`file_id`),
  KEY `a_queryrfq_questions_file_qu_id` (`qu_id`),
  CONSTRAINT `a_queryrfq_questions_file_qu_id` FOREIGN KEY (`qu_id`) REFERENCES `a_queryrfq_questions` (`qu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='圖檔附件';

DROP TABLE IF EXISTS `a_queryrfq_questions_download_log`;
CREATE TABLE `a_queryrfq_questions_download_log` (
  `file_id` varchar(10) NOT NULL DEFAULT '' COMMENT '附件ID',
  `download_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '下載時間',
  `download_by` varchar(50) NOT NULL DEFAULT '' COMMENT '下載人',
  PRIMARY KEY (`file_id`,`download_time`),
  KEY `a_queryrfq_questions_download_log_file_id` (`file_id`),
  CONSTRAINT `a_queryrfq_questions_download_log_file_id` FOREIGN KEY (`file_id`) REFERENCES `a_queryrfq_questions_file` (`file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='附檔下載紀錄';

create view a_queryrfq_view_demand_questions
as 
select demand.*, 
question.class, 
question.status,
question.title,
question.description,
question.assign_to,
question.prev_assign_to,
question.is_classified,
polist.item_id
FROM
a_queryrfq_demand_list as demand
LEFT JOIN 
a_queryrfq_questions as question
on 
(demand.form_id = question.form_id AND demand.seq_no = question.seq_no AND demand.sup_id = question.sup_id)
LEFT JOIN
a_queryrfq_po_list as polist
on (demand.form_id = polist.po_no AND demand.seq_no = polist.seq_no AND demand.sup_id = polist.sup_id)