package com.servtech.servcloud.app.model.comoss;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2020/4/20.
 */
@Table("a_comoss_purchase_order")
@CompositePK({"pur_order_type", "pur_id", "serial_num"})
public class PurchaseOrder extends Model {
}
