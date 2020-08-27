package com.servtech.servcloud.app.model.strongLED;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_strongled_product_structure")
@CompositePK({"structure_id"})
public class ProductStructure extends Model {
}
