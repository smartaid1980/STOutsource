CREATE TABLE  `servcloud`.`a_strongled_synctime_stock_in` (
  `sync_start` datetime NOT NULL COMMENT '起始時間:點選更新進貨單時，及建立記錄',
  `sync_end` datetime DEFAULT NULL COMMENT '結束時間:確認更新完成，記錄更新完畢時間',
  `lastest_bill` varchar(20) DEFAULT NULL COMMENT '單號:最新一筆 BILL_STOCK_IN.bill_no',
  `sync_account` varchar(20) NOT NULL COMMENT '同步帳號 同userid',
  `create_by` varchar(20) NOT NULL COMMENT '建立者 同userid',
  `create_time` bigint(20) unsigned NOT NULL COMMENT '建立時間 當地時間的長整數',
  `modify_by` varchar(20) NOT NULL COMMENT '更新者 同userid',
  `modify_time` bigint(20) unsigned NOT NULL COMMENT '更新時間 當地時間的長整數',
  PRIMARY KEY (`sync_start`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;