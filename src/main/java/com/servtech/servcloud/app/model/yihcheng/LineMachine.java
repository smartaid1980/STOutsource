package com.servtech.servcloud.app.model.yihcheng;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Kevin on 2020/8/12.
 */
@Table("a_yihcheng_line_machine")
@CompositePK({"line_id", "machine_id"})
public class LineMachine extends Model {
}
