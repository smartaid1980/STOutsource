package com.servtech.servcloud.app.model.servtrack;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2017/6/16.
 */

@Table("a_servtrack_process_ng")
@CompositePK({ "process_code", "ng_code" })
@BelongsTo(parent = Process.class, foreignKeyName = "process_code")
public class ProcessNg extends Model {
}
