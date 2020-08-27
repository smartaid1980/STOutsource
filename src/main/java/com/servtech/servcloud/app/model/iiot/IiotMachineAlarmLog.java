package com.servtech.servcloud.app.model.iiot;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_iiot_machine_alarm_log")
@CompositePK({ "alarm_log_id", "machine_id" })
@BelongsToParents({
        @BelongsTo(parent = IiotDeptMachine.class, foreignKeyName = "machine_id"),
        @BelongsTo(parent = IiotMachineAlarmFreq.class, foreignKeyName = "alarm_type")
})
public class IiotMachineAlarmLog extends Model {
}
