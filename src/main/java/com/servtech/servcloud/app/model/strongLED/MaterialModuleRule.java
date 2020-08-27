package com.servtech.servcloud.app.model.strongLED;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_strongled_material_module_rule")
@CompositePK({"model_number"})
public class MaterialModuleRule extends Model {
    // static {
    //     dateFormat("yyyy/MM/dd HH:mm:ss", "create_time", "modify_time");
    // }
}
