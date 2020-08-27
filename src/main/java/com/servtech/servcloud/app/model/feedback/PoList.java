package com.servtech.servcloud.app.model.feedback;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_feedback_po_list")
@CompositePK({"po_no", "seq_no"})
@BelongsTo(parent = Supplier.class, foreignKeyName = "sup_id")
public class PoList extends Model {
    static {
        dateFormat("yyyy/MM/dd", "lead_time", "orig_lead_time", "cfm_lead_time", "create_date", "modi_date");
    }
}
