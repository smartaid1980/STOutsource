package com.servtech.servcloud.app.model.huangliang_matStock;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_huangliang_wo_m_status")
@CompositePK({"order_id", "machine_id", "wo_m_time"})
public class WoMStatus extends Model {
}
