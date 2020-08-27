package com.servtech.servcloud.app.model.huangliang_matStock;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_huangliang_wo_po_binding")
@CompositePK({"order_id", "mstock_name", "po_no", "sup_id", "mat_code"})
public class WoPoBinding extends Model {
}
