package com.servtech.servcloud.app.model.yihcheng;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Kevin on 2020/8/7.
 */
@Table("a_yihcheng_invalid_line_status_log")
@CompositePK({"move_in", "line_id", "work_id", "op", "line_status_start"})
public class InvalidLineStatusLog extends Model {
}
