package com.servtech.servcloud.app.model.enhancement;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.BelongsTo;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

@Table("a_enhancement_process_ng")
@CompositePK({"process_code", "ng_code"})
@BelongsTo(parent = Process.class, foreignKeyName = "process_code")
public class ProcessNg extends Model {
}
