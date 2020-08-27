package com.servtech.servcloud.app.model.iiot;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_iiot_tool")
@CompositePK({ "tool_id" })
@BelongsToParents({
        @BelongsTo(parent = IiotToolErpSync.class, foreignKeyName = "tool_code")
})
public class IiotTool extends Model {
}
