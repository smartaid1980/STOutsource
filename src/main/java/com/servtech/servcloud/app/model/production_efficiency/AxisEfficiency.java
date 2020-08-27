package com.servtech.servcloud.app.model.production_efficiency;


import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Raynard on 2016/9/12.
 *主軸轉速 部份
 */
@Table("a_productionefficiency_axis_efficiency")
@IdName("machine_id")
public class AxisEfficiency extends Model{
}
