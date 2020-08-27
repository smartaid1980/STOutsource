package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Kevin Big Big on 2016/5/18.
 */

@Table("m_machine_type")
@IdName("machine_type_id")
@BelongsTo(foreignKeyName = "product_id", parent = Product.class)
public class MachineType extends Model {
}
