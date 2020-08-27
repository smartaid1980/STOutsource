package com.servtech.servcloud.app.model.yihcheng;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Kevin on 2020/8/7.
 */
@Table("a_yihcheng_line_shift_time")
@CompositePK({"line_id", "shift_day", "sequence"})
public class LineShiftTime extends Model {
}
