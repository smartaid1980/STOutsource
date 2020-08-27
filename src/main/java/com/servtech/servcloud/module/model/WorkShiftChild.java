package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by hubert on 2015/7/26.
 */
@Table("m_work_shift_child")
@IdName("id")
@BelongsTo(parent = WorkShiftGroup.class, foreignKeyName = "work_shift_group_id")
public class WorkShiftChild extends Model {
    static {
        dateFormat("yyyy/MM/dd", "date");
    }
}
