package com.servtech.servcloud.app.model.after_sales_service;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2016/5/17.
 */
@Table("a_aftersalesservice_repair_material")
@IdName("rm_id")
@BelongsToParents({
        @BelongsTo(parent = RepairRepay.class,foreignKeyName = "repair_id"),
        @BelongsTo(parent = Material.class,foreignKeyName = "material_id")
})
public class RepairMaterial extends Model {
}
