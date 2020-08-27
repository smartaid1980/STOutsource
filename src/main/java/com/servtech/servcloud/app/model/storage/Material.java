package com.servtech.servcloud.app.model.storage;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

@Table("a_storage_material")
@IdName("material_id")
@BelongsTo(parent = StoreType.class, foreignKeyName = "store_type_id")
public class Material extends Model {
}
