package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.*;

@Table("m_device_section")
@IdName("device_id")
@BelongsToParents({
        @BelongsTo(foreignKeyName = "device_id", parent = Device.class),
        @BelongsTo(foreignKeyName = "section_id", parent = WorkSection.class),
})
public class DeviceWorkSection extends Model {
}
