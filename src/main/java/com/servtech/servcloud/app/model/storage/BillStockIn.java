package com.servtech.servcloud.app.model.storage;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_strongled_bill_stock_in")
@CompositePK({"bill_no", "bill_detail"})
public class BillStockIn extends Model {}
