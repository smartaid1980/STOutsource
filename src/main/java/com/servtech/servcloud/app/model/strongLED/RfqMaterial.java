package com.servtech.servcloud.app.model.strongLED;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_strongled_rfq_material")
@CompositePK({"form_id", "mtl_id"})
public class RfqMaterial extends Model {
    // static {
    //     dateFormat("yyyy/MM/dd HH:mm:ss", "create_time", "modify_time");
    // }
}
