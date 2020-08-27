package com.servtech.servcloud.app.model.after_sales_service;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2016/5/16.
 */
@Table("a_aftersalesservice_entity_breakdown")
@IdName("breakdown_id")
@BelongsTo(parent = Entity.class,foreignKeyName = "entity_id")
public class EntityBreakdown extends Model {
}
