package com.servtech.servcloud.app.model.storage;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_storage_work_op_material")
@CompositePK({"work_id", "op", "material_id"})
@BelongsTo(parent = Material.class, foreignKeyName = "material_id")
public class WorkOpMaterial extends Model {
}
