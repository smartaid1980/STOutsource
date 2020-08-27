package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.*;

/**
 * Created by Jenny
 * Datetime: 2018/5/15 下午 04:23
 */
@Table("m_unit_param")
@CompositePK({ "param_id", "type" })
//@BelongsToParents({
//        @BelongsTo(foreignKeyName = "type_id", parent = UnitType.class)
//})
public class UnitParam extends Model {
}
