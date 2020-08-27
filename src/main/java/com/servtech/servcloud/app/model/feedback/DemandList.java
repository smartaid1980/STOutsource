package com.servtech.servcloud.app.model.feedback;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_feedback_demand_list")
@CompositePK({"form_id", "seq_no", "sup_id"})
@BelongsTo(parent = Supplier.class, foreignKeyName = "sup_id")
public class DemandList extends Model {
    static {
        dateFormat("yyyy/MM/dd","st_lead_time");
        dateFormat("yyyy/MM/dd HH:mm:ss", "close_time", "create_time", "modify_time");
    }
}
