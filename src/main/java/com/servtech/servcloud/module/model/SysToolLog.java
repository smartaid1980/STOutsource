package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Many2Many;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by BeataTseng on 2017/9/28.
 */
@Table("a_tool_log")
@IdName("tool_id")
public class SysToolLog extends Model {
}
