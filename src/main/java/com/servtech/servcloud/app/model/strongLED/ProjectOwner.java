package com.servtech.servcloud.app.model.strongLED;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.CompositePK;
import org.javalite.activejdbc.annotations.Table;

@Table("a_strongled_project_owner")
@CompositePK({"project_id","user_id"})
public class ProjectOwner extends Model {
}
