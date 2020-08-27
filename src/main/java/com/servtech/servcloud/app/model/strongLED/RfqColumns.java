package com.servtech.servcloud.app.model.strongLED;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

@Table("a_strongled_rfq_columns")
@IdName("model")
public class RfqColumns extends Model {
    // static {
    //     dateFormat("yyyy/MM/dd","st_lead_time");
    //     dateFormat("yyyy/MM/dd HH:mm:ss", "close_time", "create_time", "modify_time");
    // }
}
