package com.servtech.servcloud.app.model.huangliang;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Hubert
 * Datetime: 2016/7/25 下午 02:10
 */
@Table(value = "a_huangliang_machine_priority")
@IdName(value = "machine_id")
public class MachinePriority extends Model {
}
