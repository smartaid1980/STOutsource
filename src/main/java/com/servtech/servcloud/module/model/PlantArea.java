package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Kevin Big Big on 2015/8/17.
 */

@Table("m_plant_area")
@IdName("device_id")
@BelongsToParents({
        @BelongsTo(foreignKeyName = "device_id", parent = Device.class),
        @BelongsTo(foreignKeyName = "plant_id", parent = Plant.class),
})
public class PlantArea extends Model {
}
