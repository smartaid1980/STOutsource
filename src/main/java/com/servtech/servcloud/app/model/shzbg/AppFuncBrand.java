package com.servtech.servcloud.app.model.shzbg;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2018/6/26.
 */
@Table("m_app_func_brand")
@CompositePK({ "app_id", "func_id", "cnc_id"})
public class AppFuncBrand extends Model {
}
