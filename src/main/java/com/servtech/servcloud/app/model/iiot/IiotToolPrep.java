package com.servtech.servcloud.app.model.iiot;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */
@Table("a_iiot_tool_prep")
@CompositePK({ "tool_prep_id" })
@BelongsToParents({
        @BelongsTo(parent = IiotToolNc.class, foreignKeyName = "nc_name")
})
public class IiotToolPrep extends Model {
}
