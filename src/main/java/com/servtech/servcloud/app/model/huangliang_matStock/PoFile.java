package com.servtech.servcloud.app.model.huangliang_matStock;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.*;

/**
 * Created by Eric Peng on 2018/10/29.
 */
@Table("a_huangliang_po_file")
@CompositePK({"mstock_name", "po_no", "sup_id", "mat_code"})
@BelongsTo(parent = Supplier.class, foreignKeyName = "sup_id")
public class PoFile extends Model {
    static {
        dateFormat("yyyy/MM/dd HH:mm:ss", "mstock_name", "po_no", "sup_id", "mat_code");
    }
}
