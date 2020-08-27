package com.servtech.servcloud.app.model.strongLED;

import com.servtech.servcloud.app.model.servtrack.Process;
import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_strongled_invalid_reason")
@CompositePK({"invalid_id"})
@BelongsTo(parent = Process.class, foreignKeyName = "process_code")
public class InvalidReason extends Model {
}
