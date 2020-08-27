package com.servtech.servcloud.app.model.iiot;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Beata on 2019/12/18.
 */
@Table("a_iiot_ai_idle_update_list")
@CompositePK({ "machine_id", "start_time", "end_time"})
public class IiotAiIdleUpdateList extends Model {
}
