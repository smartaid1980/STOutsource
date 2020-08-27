package com.servtech.servcloud.app.model.enhancement;


import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_enhancement_work_tracking")
@CompositePK({ "machine_id", "work_id", "start_time"})
public class WorkTracking extends Model {

}
