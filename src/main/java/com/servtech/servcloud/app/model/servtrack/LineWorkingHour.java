package com.servtech.servcloud.app.model.servtrack;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/20.
 */
@Table("a_servtrack_line_working_hour")
@CompositePK({ "line_id", "shift_day" })
@BelongsTo(parent = Line.class, foreignKeyName = "line_id")
public class LineWorkingHour extends Model {
}
