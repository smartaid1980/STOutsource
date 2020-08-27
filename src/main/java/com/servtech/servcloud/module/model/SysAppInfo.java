package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Many2Many;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Hubert
 * Datetime: 2015/7/9 上午 11:43
 */
@Table("m_app_info")
@IdName("app_id")
@Many2Many(other = TagForApp.class, join = "m_app_class_tag", sourceFKName = "app_id", targetFKName = "tag_id")
public class SysAppInfo extends Model {
}
