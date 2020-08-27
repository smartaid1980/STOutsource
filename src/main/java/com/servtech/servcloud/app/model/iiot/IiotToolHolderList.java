package com.servtech.servcloud.app.model.iiot;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_iiot_tool_holder_list")
@CompositePK({ "holder_id", "dept_id" })
@BelongsToParents({
        @BelongsTo(parent = IiotDept.class, foreignKeyName = "dept_id"),
        @BelongsTo(parent = IiotToolHolder.class, foreignKeyName = "holder_code")
})
public class IiotToolHolderList extends Model {
}
