package com.servtech.servcloud.app.model.feedback;


import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.IdName;
import org.javalite.activejdbc.annotations.Table;

@Table(value = "a_feedback_supplier")
@IdName("sup_id")
public class Supplier extends Model {
    static {
        dateFormat("yyyy/MM/dd HH:mm:ss", "create_time", "modify_time");
    }
}

