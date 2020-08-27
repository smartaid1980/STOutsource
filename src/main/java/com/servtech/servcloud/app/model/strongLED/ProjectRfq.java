package com.servtech.servcloud.app.model.strongLED;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_strongled_project_rfq")
@CompositePK({"project_id", "form_id"})
public class ProjectRfq extends Model {
}
