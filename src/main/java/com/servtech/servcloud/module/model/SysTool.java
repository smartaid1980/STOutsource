package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.*;

/**
 * Created by BeataTseng on 2017/9/21.
 */
@Table("a_tool")
@IdName("tool_id")
@Many2Many(other = SysToolLog.class, join = "a_tool_log", sourceFKName = "device_id", targetFKName = "tool_id")
public class SysTool extends Model {
}
