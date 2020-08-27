CREATE VIEW a_huangliang_view_wo_m_mat_wo_list AS 
SELECT a.*, 
b.product_id ,
b.product_pid ,
b.customer_id ,
b.order_qty,
b.wo_pqty ,
b.wo_bqty ,
b.wo_mqty ,
b.exp_date ,
b.wo_status ,
b.create_time wo_list_create_time ,
b.modify_time wo_list_modify_time,
b.create_by wo_list_create_by,
b.modify_by wo_list_modify_by
FROM a_huangliang_wo_m_mat AS a 
LEFT JOIN a_huangliang_wo_list AS b 
ON a.order_id = b.order_id;