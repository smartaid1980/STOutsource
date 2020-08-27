package com.servtech.servcloud.app.model.comoss;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_storage_bill_no_pickup")
@CompositePK({"bill_detail_no", "sender_key", "position_id"})
public class BillNoPickUp extends Model {
}
