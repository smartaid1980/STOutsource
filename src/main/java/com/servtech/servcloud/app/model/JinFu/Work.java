package com.servtech.servcloud.app.model.JinFu;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Kevin on 2019/12/31.
 */
@Table("a_jinfu_work")
@CompositePK({ "work_id", "product_id", "machine_id"})
public class Work extends Model {
}
