package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Kevin Big Big on 2015/8/21.
 */
@Table("m_device_cnc_brand")
@IdName("device_id")
@BelongsToParents({
        @BelongsTo(foreignKeyName = "device_id", parent = Device.class),
        @BelongsTo(foreignKeyName = "cnc_id", parent = CncBrand.class),
})
public class DeviceCncBrand extends Model {
}
