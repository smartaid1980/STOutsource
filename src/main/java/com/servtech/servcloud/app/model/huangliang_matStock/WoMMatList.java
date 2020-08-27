package com.servtech.servcloud.app.model.huangliang_matStock;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.*;

/**
 * Created by Jenny on 2019/07/25.
 */
@Table("a_huangliang_wo_m_mat_list")
@CompositePK({"order_id","machine_id","wo_m_time","m_mat_time","shelf_time"})
public class WoMMatList extends Model {}
