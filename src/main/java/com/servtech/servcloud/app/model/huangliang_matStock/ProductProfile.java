package com.servtech.servcloud.app.model.huangliang_matStock;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.*;

@Table("a_huangliang_product_profile")
@CompositePK({"mstock_name","product_id"})
public class ProductProfile extends Model {
}
