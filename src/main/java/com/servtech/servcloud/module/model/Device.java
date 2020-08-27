package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Many2Many;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Hubert
 * Datetime: 2015/7/7 下午 03:10
 */
@Table("m_device")
@IdName("device_id")
@Many2Many(other = Box.class, join = "m_device_box", sourceFKName = "device_id", targetFKName = "box_id")
public class Device extends Model {
}
