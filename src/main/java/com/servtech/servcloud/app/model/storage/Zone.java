package com.servtech.servcloud.app.model.storage;


import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

@Table("a_storage_zone")
@IdName("zone_id")
public class Zone extends Model {
}
