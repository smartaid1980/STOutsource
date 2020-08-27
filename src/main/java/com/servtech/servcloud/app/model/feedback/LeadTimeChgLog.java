package com.servtech.servcloud.app.model.feedback;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_feedback_leadtime_chg_log")
@CompositePK({"form_id", "seq_no", "sup_id", "create_time"})
@BelongsToParents({
        @BelongsTo(parent = DemandList.class, foreignKeyName = "form_id"),
        @BelongsTo(parent = DemandList.class, foreignKeyName = "seq_no"),
        @BelongsTo(parent = Supplier.class, foreignKeyName = "sup_id")
})
public class LeadTimeChgLog extends Model {
    static {
        dateFormat("yyyy/MM/dd", "orig_lead_time", "chg_lead_time");
        dateFormat("yyyy/MM/dd HH:mm:ss", "check_by", "create_time");
    }
}
