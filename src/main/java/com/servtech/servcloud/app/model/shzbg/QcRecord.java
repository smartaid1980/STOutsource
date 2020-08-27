package com.servtech.servcloud.app.model.shzbg;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Frank on 2018/6/26.
 */
@Table("a_shzbg_qc_record")
@CompositePK({ "meas_time", "item_id", "part_id", "mold_id", "work_id", "machine_id", "operator", "electrode_id" })
public class QcRecord extends Model {
}
