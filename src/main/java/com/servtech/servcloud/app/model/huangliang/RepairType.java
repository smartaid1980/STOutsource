package com.servtech.servcloud.app.model.huangliang;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Mike on 2018/10/03.
 */
@Table(value = "a_huangliang_repair_type")
@IdName(value = "repair_type_id")
public class RepairType extends Model {
}
