package com.servtech.servcloud.app.model.aplus;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Eric Peng on 2018/10/11.
 */
@Table(value = "a_aplus_defect")
@CompositePK({"defect_number", "machine_id"})
public class APlusDefect extends Model {
}
