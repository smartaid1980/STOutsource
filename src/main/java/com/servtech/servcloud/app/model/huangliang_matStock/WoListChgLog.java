package com.servtech.servcloud.app.model.huangliang_matStock;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_huangliang_wo_list_chg_log")
@CompositePK({"order_id", "create_time"})
public class WoListChgLog extends Model {
}
