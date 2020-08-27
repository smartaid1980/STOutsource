package com.servtech.servcloud.app.model.huangliang_matStock;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Eric Peng on 2018/10/29.
 */
@Table("a_huangliang_mat_stock_chg_log")
@CompositePK({"mstock_name","po_no","sup_id","mat_code","shelf_time","chg_time"})
public class MatStockChangeLog extends Model {
}
