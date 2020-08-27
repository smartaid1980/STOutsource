DROP VIEW IF EXISTS `a_strongled_view_bill_stock_in_material_thing`;
CREATE VIEW a_strongled_view_bill_stock_in_material_thing AS
SELECT 
mt.thing_id,
mt.material_id,
mt.material_sub,
mt.remark,
mt.bill_from,
mt.code_no,
mt.column1,
mt.column2,
mt.column3,
mt.exp_date,
mt.is_new,
mt.status,
mt.in_stock,

bsi.bill_date,
bsi.ware_id,
bsi.quantity,
bsi.bill_detail,
bsi.delivery_date,
bsi.column_1,
bsi.column_2,
bsi.column_3,
bsi.column_4,
bsi.column_5,
bsi.status AS bill_status,

t.thing_cell,
t.thing_unit,
t.thing_pcs,
t.thing_profile,
t.thing_reversed

FROM a_storage_material_thing mt

INNER JOIN
a_storage_thing t
on mt.thing_id = t.thing_id

INNER JOIN
a_strongled_bill_stock_in bsi
on mt.bill_from = bsi.bill_no and
mt.bill_detail = bsi.bill_detail;