package com.servtech.servcloud.app.model.strongLED;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_strongled_bill_stock_out_detail")
@CompositePK({"bill_no", "bill_detail" ,"material_id"})
public class BillStockOutDetail extends Model {
}
