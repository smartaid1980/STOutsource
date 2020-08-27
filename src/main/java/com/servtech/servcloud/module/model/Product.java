package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Kevin Big Big on 2016/5/18.
 */

@Table("m_product")
@IdName("product_id")
public class Product extends Model {
}
