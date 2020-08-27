CREATE VIEW a_huangliang_view_mat_stock_mat_stock_chg_log AS
SELECT a.*, 
b.mat_color ,
b.mat_length
FROM a_huangliang_mat_stock_chg_log  AS a 
LEFT JOIN a_huangliang_mat_stock AS b 
ON a.mat_code = b.mat_code AND a.shelf_time = b.shelf_time;