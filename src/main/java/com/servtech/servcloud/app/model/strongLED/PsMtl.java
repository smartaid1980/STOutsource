package com.servtech.servcloud.app.model.strongLED;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_strongled_ps_mtl")
@CompositePK({"structure_id", "mtl_id"})
public class PsMtl extends Model {
}
