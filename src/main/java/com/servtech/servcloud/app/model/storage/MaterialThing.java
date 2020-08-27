package com.servtech.servcloud.app.model.storage;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.*;

@Table("a_storage_material_thing")
@IdName("thing_id")
@BelongsTo(parent = Thing.class, foreignKeyName = "thing_id")
public class MaterialThing extends Model {
}
