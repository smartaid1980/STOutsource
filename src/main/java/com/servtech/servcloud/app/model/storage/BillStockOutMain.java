package com.servtech.servcloud.app.model.storage;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_strongled_bill_stock_out_main")
@CompositePK({"bill_no", "ware_id"})
public class BillStockOutMain extends Model {}
