package com.servtech.servcloud.app.model.strongLED;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_strongled_rfq_material_edit_log")
@CompositePK({"form_id", "mtl_id", "create_time"})
public class RfqMaterialEditLog extends Model {
}
