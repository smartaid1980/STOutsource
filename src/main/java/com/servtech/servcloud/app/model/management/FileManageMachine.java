package com.servtech.servcloud.app.model.management;

import com.servtech.servcloud.module.model.Device;
import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.BelongsToParents;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2018/2/2.
 */
@Table("a_file_manage_machine")
@IdName("machine_id")
@BelongsToParents({
        @BelongsTo(parent = Device.class, foreignKeyName = "device_id"),
        @BelongsTo(parent = FileManageType.class, foreignKeyName = "server_type")
})
public class FileManageMachine extends Model {
}
