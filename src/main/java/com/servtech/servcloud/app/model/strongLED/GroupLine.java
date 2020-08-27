package com.servtech.servcloud.app.model.strongLED;

import com.servtech.servcloud.app.model.servtrack.Line;
import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_strongled_group_line")
@CompositePK({"group_id", "line_id"})
@BelongsTo(parent = Line.class, foreignKeyName = "line_id")
public class GroupLine extends Model {
}
