package com.servtech.servcloud.app.model.comoss;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

@Table("a_storage_material_schedule_thing")
@IdName("schedule_thing_id")
@BelongsTo(parent = ScheduleThing.class, foreignKeyName = "schedule_thing_id")
public class MaterialScheduleThing extends Model {
}
