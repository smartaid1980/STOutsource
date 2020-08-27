package com.servtech.servcloud.app.model.huangliang_matStock;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.*;

/**
 * Created by Eric Peng on 2018/10/29.
 */
@Table("a_huangliang_mat_stock")
@CompositePK({"mat_code","shelf_time"})
@BelongsToParents({
        @BelongsTo(parent = MatProfile.class, foreignKeyName = "mat_id"),
        @BelongsTo(parent = PoFile.class, foreignKeyName = "mstock_name"),
        @BelongsTo(parent = PoFile.class, foreignKeyName = "po_no"),
        @BelongsTo(parent = PoFile.class, foreignKeyName = "sup_id"),
        @BelongsTo(parent = PoFile.class, foreignKeyName = "mat_code"),
        @BelongsTo(parent = MatLocation.class, foreignKeyName = "location")
})
public class MatStock extends Model {
}
