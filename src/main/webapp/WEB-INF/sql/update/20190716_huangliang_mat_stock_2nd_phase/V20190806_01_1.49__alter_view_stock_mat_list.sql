DROP VIEW IF EXISTS `servcloud`.`a_huangliang_view_stock_mat_list`;
CREATE VIEW a_huangliang_view_stock_mat_list AS 
SELECT 
wmml.order_id,
wmml.machine_id,
wmml.wo_m_time,
wmml.m_mat_time,
wmml.po_no,
ms.mstock_name,
ms.sup_id,
ms.mat_code,
ms.mat_id,
ms.mat_length,
ms.mat_od,
ms.mat_color,
wmml.shelf_time,
vwmmwl.rework_size,
vwmmwl.product_pid,
wmml.use_piece,
wmml.use_qty,
wmml.use_remark,
s.sup_name,
ms.area,
ms.location,
ms.lot_mark,
ms.lock_qty,
ms.lock_piece

FROM a_huangliang_wo_m_mat_list AS wmml

LEFT JOIN a_huangliang_view_wo_m_mat_wo_list AS vwmmwl
ON wmml.order_id = vwmmwl.order_id AND
wmml.machine_id = vwmmwl.machine_id AND
wmml.wo_m_time = vwmmwl.wo_m_time AND
wmml.m_mat_time = vwmmwl.m_mat_time

LEFT JOIN a_huangliang_mat_stock AS ms
ON wmml.shelf_time = ms.shelf_time AND
wmml.mat_code = ms.mat_code

LEFT JOIN a_huangliang_supplier AS s
ON ms.sup_id = s.sup_id




