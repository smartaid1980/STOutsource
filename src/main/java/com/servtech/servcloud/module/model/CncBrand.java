package com.servtech.servcloud.module.model;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Many2Many;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by Kevin Big Big on 2015/8/21.
 */
@Table("m_cnc_brand")
@IdName("cnc_id")
@Many2Many(other = MonitorPage.class, join = "m_cnc_monitor_page", sourceFKName = "cnc_id", targetFKName = "page_id")
public class CncBrand extends Model {
}
