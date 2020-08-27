package com.servtech.servcloud.app.model.chengshiu;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2017/11/9.
 */
@Table("a_chengshiu_line")
@IdName("line_id")
@BelongsTo(parent = WorkOrder.class, foreignKeyName = "work_id")
public class Line extends Model{
}
