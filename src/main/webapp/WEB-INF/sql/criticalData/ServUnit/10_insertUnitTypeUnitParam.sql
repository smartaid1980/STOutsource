--  disable FK cnc_id, 放全部廠牌的AlarmCode

insert into m_unit_type (type_id, type_name, create_by, create_time, modify_by, modify_time) values 
('punch0001', '沖壓機0001', 'admin', NOW(), 'admin', NOW()),
('punch0002', '沖壓機0002', 'admin', NOW(), 'admin', NOW());

insert into m_unit_param (param_id, type, param_name, sequence, comment, is_open, icon, icon_bgc, max, min, create_by, create_time, modify_by, modify_time) values 
('timestamp', 'punch0001', '資料更新時間', 1, '資料更新時間', 'Y', 'fa-clock-o', 'blue', null, null, 'admin', NOW(), 'admin', NOW()),
('status', 'punch0001', '沖壓機運行狀態', 1, '加工/閒置', 'Y', 'fa-gear', 'servkit.getMachineLightColor(value)', null, null, 'admin', NOW(), 'admin', NOW()),
('working_time', 'punch0001', '沖壓機今日作業時間 (ms)', 1, '自 00:00:00 起運行狀態為加工之累積時間', 'Y', 'fa-clock-o', 'blue', null, null, 'admin', NOW(), 'admin', NOW()),
('temperature_probe', 'punch0001', '曲軸溫度', 1, '曲軸溫度', 'Y', 'fa-fire', 'orange', 21, 20, 'admin', NOW(), 'admin', NOW()),
('current', 'punch0001', '沖壓機運行電流', 1, '沖壓機運行電流', 'Y', 'fa-flash', 'orange', 21, 20, 'admin', NOW(), 'admin', NOW()),
('light1_on_times', 'punch0001', '沖壓次數', 1, '沖壓次數', 'Y', 'fa-download', 'green', 21, 20, 'admin', NOW(), 'admin', NOW()),
('light2', 'punch0001', '防護罩是否被打開', 1, '防護罩是否被打開', 'Y', 'fa-check', 'purple', null, null, 'admin', NOW(), 'admin', NOW()),
('light2_last_on', 'punch0001', '皮帶最近檢查時刻', 1, '防護罩最近一次被打開的時間', 'Y', 'fa-clock-o', 'blue', null, null, 'admin', NOW(), 'admin', NOW()),
('light3', 'punch0001', '潤滑油蓋是否被打開', 1, '潤滑油蓋是否被打開', 'Y', 'fa-check', 'purple', null, null, 'admin', NOW(), 'admin', NOW()),
('light3_last_on', 'punch0001', '潤滑油最近檢查時刻', 1, '潤滑油最近一次被打開的時間', 'Y', 'fa-clock-o', 'blue', null, null, 'admin', NOW(), 'admin', NOW()),
('timestamp', 'punch0002', '資料更新時間', 1, '資料更新時間', 'Y', 'fa-gear', 'blue', null, null, 'admin', NOW(), 'admin', NOW()),
('status', 'punch0002', '沖壓機運行狀態', 1, '加工/閒置', 'Y', 'fa-gear', 'servkit.getMachineLightColor(value)', null, null, 'admin', NOW(), 'admin', NOW()),
('working_time', 'punch0002', '沖壓機今日作業時間 (ms)', 1, '自 00:00:00 起運行狀態為加工之累積時間', 'Y', 'fa-gear', 'blue', null, null, 'admin', NOW(), 'admin', NOW()),
('temperature_probe', 'punch0002', '曲軸溫度', 1, '曲軸溫度', 'Y', 'fa-fire', 'orange', 21, 20, 'admin', NOW(), 'admin', NOW()),
('current', 'punch0002', '沖壓機運行電流', 1, '沖壓機運行電流', 'Y', 'fa-gear', 'orange', 21, 20, 'admin', NOW(), 'admin', NOW()),
('light1_on_times', 'punch0002', '沖壓次數', 1, '沖壓次數', 'Y', 'fa-gear', 'green', 21, 20, 'admin', NOW(), 'admin', NOW()),
('light2', 'punch0002', '防護罩是否被打開', 1, '防護罩是否被打開', 'Y', 'fa-gear', 'purple', null, null, 'admin', NOW(), 'admin', NOW()),
('light2_last_on', 'punch0002', '皮帶最近檢查時刻', 1, '防護罩最近一次被打開的時間', 'Y', 'fa-gear', 'blue', null, null, 'admin', NOW(), 'admin', NOW()),
('light3', 'punch0002', '潤滑油蓋是否被打開', 1, '潤滑油蓋是否被打開', 'Y', 'fa-gear', 'purple', null, null, 'admin', NOW(), 'admin', NOW()),
('light3_last_on', 'punch0002', '潤滑油最近檢查時刻', 1, '潤滑油最近一次被打開的時間', 'Y', 'fa-gear', 'blue', null, null, 'admin', NOW(), 'admin', NOW());