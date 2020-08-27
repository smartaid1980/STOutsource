package com.servtech.servcloud.app.model.chengshiu;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/10/13.
 */
@Table("a_chengshiu_sensor")
@IdName("sensor_id")
@BelongsTo(parent = SensorType.class, foreignKeyName = "type_id")
public class Sensor extends Model {
}

