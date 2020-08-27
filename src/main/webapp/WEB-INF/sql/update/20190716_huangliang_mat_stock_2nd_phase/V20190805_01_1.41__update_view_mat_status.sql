DROP VIEW IF EXISTS `a_huangliang_view_mat_status`;
CREATE VIEW a_huangliang_view_mat_status AS
SELECT w.*,
wm.m_mat_time,
wm.mstock_name,
wm.mat_code,
wm.mat_length,
wm.rework_size,
ml.c_scrapsize,
ml.t_scrapsize
FROM a_huangliang_view_wo_m_status_wo_list AS w
INNER JOIN a_huangliang_view_wo_m_mat_wo_m_mat_list_mat_stock AS wm
ON w.machine_id = wm.machine_id
AND w.order_id = wm.order_id

INNER JOIN a_huangliang_mac_list AS ml
ON w.machine_id = ml.machine_id