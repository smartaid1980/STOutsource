package com.servtech.servcloud.app.model.servtrack;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_servtrack_line")
@IdName("line_id")
public class Line extends Model {
}
