DROP VIEW IF EXISTS `servcloud`.`a_storage_work_op_material_thing_view`;
create view a_storage_work_op_material_thing_view
as 
select 
work_op_material.work_id,
work_op_material.op,
work_op_material.material_id,
work_op_material.use_qty,
work_op_material.remark as work_op_material_remark,
material_thing.thing_id,
material_thing.exp_date,
material_thing.is_new,
material_thing.status,
material_thing.remark as material_thing_remark,
thing.thing_profile,
thing.thing_reversed,
thing.thing_cell,
thing.thing_unit,
thing.thing_pcs,
store_thing.store_id,
store_thing.grid_index,
store_thing.cell_start_index,
store_thing.cell_end_index,
(CAST(store_thing.cell_end_index as SIGNED) - CAST(thing.thing_cell as SIGNED)) as cell_index,
store_thing.thing_cell as store_thing_cell,
store_thing.thing_pcs as store_thing_pcs,
store.store_name,
store.store_desc,
store.store_grid_count,
store.zone_id
FROM a_storage_work_op_material as work_op_material 
LEFT JOIN a_storage_material_thing as material_thing
on work_op_material.material_id = material_thing.material_id
LEFT JOIN a_storage_thing as thing
on material_thing.thing_id = thing.thing_id
LEFT JOIN a_storage_store_thing_map as store_thing 
on thing.thing_id = store_thing.thing_id
LEFT JOIN a_storage_store as store
on store_thing.store_id = store.store_id