package com.servtech.servcloud.app.model.enhancement;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_enhancement_idle_record")
@CompositePK({"machine_id", "shift_date", "start_time"})
public class IdleRecord extends Model {
}
