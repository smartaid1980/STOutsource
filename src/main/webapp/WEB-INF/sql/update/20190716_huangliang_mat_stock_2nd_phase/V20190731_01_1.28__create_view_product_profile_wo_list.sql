CREATE VIEW a_huangliang_view_product_profile_wo_list AS
SELECT a.*, 
b.order_id ,
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
FROM a_huangliang_product_profile  AS a 
LEFT JOIN a_huangliang_wo_list AS b 
ON a.product_id = b.product_id;