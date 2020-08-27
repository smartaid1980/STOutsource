package com.servtech.servcloud.app.model.yihcheng;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Kevin on 2020/8/7.
 */
@Table("a_yihcheng_work_tracking_mold")
@CompositePK({"move_in", "line_id", "work_id", "op", "mold_id"})
public class WorkTrackingMold extends Model {
}
