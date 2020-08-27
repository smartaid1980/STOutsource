package com.servtech.servcloud.app.model.chengshiu;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2017/11/14.
 */
@Table("a_chengshiu_material_item")
@IdName("item_id")
@BelongsToParents({
        @BelongsTo(parent = Material.class, foreignKeyName = "material_id"),
        @BelongsTo(parent = Machine.class, foreignKeyName = "machine_id")
})
public class MaterialItem extends Model {
}
