DROP VIEW IF EXISTS `a_huangliang_view_wo_m_mat_wo_m_mat_list_mat_stock`;
CREATE VIEW a_huangliang_view_wo_m_mat_wo_m_mat_list_mat_stock AS
SELECT ml.order_id,
ml.machine_id,
ml.wo_m_time,
ml.m_mat_time,
ml.shelf_time,
ml.mstock_name,
ml.location,
ml.use_piece,
ml.use_qty,
ml.use_remark,
ml.fb_piece,
ml.fb_qty,
ml.item_status,
ml.create_by m_mat_list_create_by,
ml.create_time m_mat_list_create_time,
ml.modify_by m_mat_list_modify_by,
ml.modify_time m_mat_list_modify_time,
m.type,
m.rework_size,
m.m_mat_status,
m.delay_notice,
m.approve_notice,
m.approve_req,
m.create_time m_mat_create_time,
m.create_by m_mat_create_by,
m.modify_time m_mat_modify_time,
m.modify_by m_mat_modify_by,
s.po_no,
s.sup_id,
s.mat_code,
s.mat_id,
s.mat_length,
s.mat_od,
s.mat_color,
s.mat_price,
s.mat_price_ref_date,
s.mat_price_ref_sup_id,
s.area,
s.lot_mark,
s.p_weight,
s.stock_piece,
s.mstock_qty,
s.unit,
s.temp_od,
s.temp_length,
s.mstock_time,
s.mrp_bcode,
s.lock_qty,
s.lock_piece,
s.create_by mat_stock_create_by,
s.create_time mat_stock_create_time,
s.modify_by mat_stock_modify_by,
s.modify_time mat_stock_modify_time
FROM a_huangliang_wo_m_mat AS m
INNER JOIN a_huangliang_wo_m_mat_list AS ml
ON m.order_id = ml.order_id
and m.machine_id = ml.machine_id
and m.wo_m_time = ml.wo_m_time
and m.m_mat_time = ml.m_mat_time

INNER JOIN a_huangliang_mat_stock AS s
ON ml.shelf_time = s.shelf_time