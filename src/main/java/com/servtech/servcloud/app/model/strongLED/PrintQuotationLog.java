package com.servtech.servcloud.app.model.strongLED;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_strongled_print_quotation_log")
@CompositePK({"form_id", "create_time"})
public class PrintQuotationLog extends Model {
    // static {
    //     dateFormat("yyyy/MM/dd HH:mm:ss", "create_time", "modify_time");
    // }
}
