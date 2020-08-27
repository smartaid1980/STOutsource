package com.servtech.servcloud.app.model.feedback;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.*;

@Table("a_feedback_questions")
@IdName("qu_id")
@BelongsToParents({
        @BelongsTo(parent = DemandList.class, foreignKeyName = "form_id"),
        @BelongsTo(parent = DemandList.class, foreignKeyName = "seq_no"),
        @BelongsTo(parent = Supplier.class, foreignKeyName = "sup_id")
})
public class Questions extends Model {
    static {
        dateFormat("yyyy/MM/dd HH:mm:ss","create_time", "modify_time");
    }
}
