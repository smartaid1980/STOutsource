package com.servtech.servcloud.app.model.alarm_clear;

import com.servtech.servcloud.module.model.MachineAlarm;
import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Kevin Big Big on 2016/5/13.
 */

@Table(value = "a_alarm_clear_log")
@IdName(value = "clear_log_id")
@BelongsToParents({
        @BelongsTo(foreignKeyName = "alarm_log_id", parent = MachineAlarm.class),
        @BelongsTo(foreignKeyName = "step_id", parent = AlarmClearStep.class),
})
public class AlarmClearLog extends Model {
}
